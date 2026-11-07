// Real browser end-to-end test of the Studio: boots its own server (isolated PostgreSQL
// database, throwaway DATA_DIR, ephemeral port, scripted fake LLM) and drives the built
// Studio (dist/studio) with Chromium through the real UI.
//   npm run build && node test/studio.mjs
// Chromium comes from playwright-core; set FORJA_CHROMIUM to use a specific executable.
import http from "node:http";
import net from "node:net";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { freshDatabase } from "./helpers/pg.mjs";
import { log as llmLog, startFakeLlm } from "./fakeLlm.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BOOTSTRAP_TOKEN = "e2e-bootstrap-token-0123456789";
const ADMIN = { name: "Ada Admin", email: "ada@forja.test", password: "contraseña-segura-123" };
const READY_TIMEOUT_MS = 90_000;
const STEP_TIMEOUT_MS = 20_000;
const TURN_TIMEOUT_MS = 120_000;

let passed = 0;
let failed = 0;
let serverLog = "";
const resources = { pgdb: null, data: null, llm: null, server: null, browser: null };

const freePort = () =>
  new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function get(url) {
  return new Promise((resolve, reject) => {
    const r = http.get(url, (res) => {
      let body = "";
      res.on("data", (d) => (body += d));
      res.on("end", () => resolve({ status: res.statusCode ?? 0, body }));
    });
    r.on("error", reject);
    r.setTimeout(3000, () => r.destroy(new Error("timeout")));
  });
}

function startServer(port, data, dbUrl, seed) {
  const child = spawn(process.execPath, ["--import", "tsx", "server/bootstrap/server.ts"], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(port),
      PUBLIC_URL: `http://localhost:${port}`,
      DATA_DIR: data,
      DATABASE_URL: dbUrl,
      FORJA_SEED_FILE: seed,
      SECRETS_KEY: "ef".repeat(32),
      FORJA_BOOTSTRAP_TOKEN: BOOTSTRAP_TOKEN,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", (d) => (serverLog += d));
  child.stderr.on("data", (d) => (serverLog += d));
  child.closed = new Promise((resolve) => child.once("close", (code, signal) => resolve({ code, signal })));
  child.exited = false;
  void child.closed.then(() => (child.exited = true));
  return child;
}

async function waitReady(base, child) {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  let lastError = "";
  while (Date.now() < deadline) {
    if (child.exited) throw new Error(`El servidor terminó antes de estar listo (${JSON.stringify(await child.closed)}).`);
    try {
      const health = await get(`${base}/healthz`);
      if (health.status === 200) {
        const studio = await get(`${base}/`);
        if (studio.status === 200 && studio.body.includes("<div id=")) return;
        lastError = `GET / devolvió ${studio.status}`;
      } else lastError = `GET /healthz devolvió ${health.status}`;
    } catch (e) {
      lastError = e.message;
    }
    await sleep(300);
  }
  throw new Error(`El servidor no estuvo listo en ${READY_TIMEOUT_MS / 1000}s: ${lastError}`);
}

async function stopServer(child) {
  if (!child || child.exited) return;
  child.kill("SIGTERM");
  const outcome = await Promise.race([child.closed, sleep(10_000).then(() => null)]);
  if (outcome === null && !child.exited) {
    child.kill("SIGKILL");
    await Promise.race([child.closed, sleep(5_000)]);
  }
}

async function step(name, fn) {
  if (process.env.STUDIO_TEST_FILTER && !new RegExp(process.env.STUDIO_TEST_FILTER).test(name)) return;
  try {
    await fn();
    passed++;
    console.log(`  ok  ${name}`);
  } catch (e) {
    failed++;
    console.log(`  FAIL ${name}\n       ${(e?.stack ?? String(e)).split("\n").slice(0, 4).join("\n       ")}`);
  }
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

async function screenshot(page, name) {
  if (process.env.STUDIO_SCREENSHOT_DIR) await page.screenshot({ path: path.join(process.env.STUDIO_SCREENSHOT_DIR, `${name}.png`), animations: "disabled" });
}

async function main() {
  if (!existsSync(path.join(ROOT, "dist", "studio", "index.html"))) throw new Error("Falta dist/studio: ejecuta «npm run build» antes de test/studio.mjs.");

  const port = await freePort();
  const base = `http://localhost:${port}`;
  resources.data = mkdtempSync(path.join(tmpdir(), "forja-studio-e2e-"));
  resources.pgdb = await freshDatabase();
  const llm = await startFakeLlm();
  resources.llm = llm.server;
  const seed = path.join(resources.data, "seed.json");
  writeFileSync(
    seed,
    JSON.stringify({
      providers: [{ id: "openai", baseUrl: `http://127.0.0.1:${llm.port}/v1`, apiKey: "test", enabled: true }],
      models: [
        { provider: "openai", model: "fake-strong", label: "Fuerte", tier: 5, inPrice: 2, outPrice: 10, cacheReadPrice: 0.2, speed: 2, vision: true },
        { provider: "openai", model: "fake-mid", label: "Mediano", tier: 3, inPrice: 0.1, outPrice: 0.5, cacheReadPrice: 0.01, speed: 5, vision: true },
      ],
    }),
  );

  resources.server = startServer(port, resources.data, resources.pgdb.url, seed);
  await waitReady(base, resources.server);
  console.log(`Studio listo en ${base}`);

  try {
    resources.browser = await chromium.launch({ executablePath: process.env.FORJA_CHROMIUM || undefined });
  } catch (e) {
    throw new Error(`No se pudo abrir Chromium (${e.message.split("\n")[0]}). Instálalo con «npx playwright-core install chromium-headless-shell» o define FORJA_CHROMIUM.`);
  }

  const context = await resources.browser.newContext({ baseURL: base, viewport: { width: 1280, height: 800 } });
  context.setDefaultTimeout(STEP_TIMEOUT_MS);
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));
  let projectUrl = "";
  let firstTurn = null;
  const chatPost = (message) => (r) => r.request().method() === "POST" && /\/api\/projects\/[^/]+\/chat$/.test(new URL(r.url()).pathname) && (r.request().postDataJSON()?.message ?? "") === message;

  await step("bootstrap: la instalación nueva crea la cuenta de administración", async () => {
    await page.goto("/");
    await page.getByText("Configura Forja").waitFor();
    await page.getByLabel("Token de instalación").fill(BOOTSTRAP_TOKEN);
    await page.getByLabel("Nombre").fill(ADMIN.name);
    await page.getByLabel("Correo").fill(ADMIN.email);
    await page.getByLabel("Contraseña").fill(ADMIN.password);
    await page.getByRole("button", { name: "Crear administración" }).click();
    await page.getByPlaceholder("Describe el proyecto que quieres crear").or(page.getByRole("textbox", { name: "Describe el proyecto que quieres crear" })).first().waitFor();
  });

  await step("dashboard: navegación lateral con secciones de administración", async () => {
    const nav = page.locator("aside.sidebar nav");
    for (const label of ["Proyectos", "Plan y uso", "Integraciones", "Cuenta", "Administración"]) await nav.getByRole("link", { name: label }).waitFor();
  });

  await step("proyecto: crear desde el dashboard abre /p/<id> con chat y vista previa", async () => {
    const prompt = "Una app de notas sencilla";
    const box = page.getByPlaceholder("Describe el proyecto que quieres crear").or(page.getByRole("textbox", { name: "Describe el proyecto que quieres crear" })).first();
    await box.fill(prompt);
    // The project view hands the dashboard idea to the builder as the first chat turn.
    firstTurn = page.waitForResponse(chatPost(prompt), { timeout: STEP_TIMEOUT_MS });
    await page.getByRole("button", { name: "Crear proyecto" }).click();
    await page.waitForURL(/\/p\/[^/?]+/);
    projectUrl = new URL(page.url()).pathname;
    await page.getByLabel("Mensaje para el constructor").waitFor();
    await page.getByRole("button", { name: "Enviar mensaje" }).or(page.getByRole("button", { name: "Detener", exact: true })).waitFor({ state: "attached" });
    await page.getByText("Vista previa").first().waitFor();
    await page.getByText(prompt).first().waitFor();
    await page.locator('[title="Ajustes del proyecto"]').first().waitFor();
  });

  await step("constructor: las herramientas integradas son localizables y navegables", async () => {
    await page.getByRole("button", { name: "Servicios", exact: true }).click();
    const nav = page.getByRole("navigation", { name: "Herramientas del proyecto" });
    await nav.waitFor();
    await page.getByRole("heading", { name: "Todo para darle vida a tu app" }).waitFor();
    assert(await page.locator(".tool-card").count() === 15, "la vista general no muestra las 15 herramientas");
    for (const name of ["Centro de control", "Datos", "Usuarios", "IA", "Integraciones", "Analítica", "SEO", "Docs", "Tareas", "Archivos", "Correo", "Pagos", "Registros", "Seguridad", "Código"]) {
      await nav.getByRole("button", { name, exact: true }).waitFor();
    }
    const search = nav.getByRole("searchbox", { name: "Buscar herramientas" });
    await search.fill("suscripciones");
    await nav.getByRole("button", { name: "Pagos", exact: true }).waitFor();
    assert((await nav.getByRole("button").allTextContents()).some((text) => text.includes("Pagos")), "la búsqueda por sinónimo no encontró Pagos");
    assert(!(await nav.getByRole("button", { name: "Datos", exact: true }).count()), "la búsqueda no filtró las herramientas ajenas");
    await nav.getByRole("button", { name: "Pagos", exact: true }).click();
    assert((await nav.getByRole("button", { name: "Pagos", exact: true }).getAttribute("aria-current")) === "page", "la herramienta seleccionada no está marcada");
    await search.fill("autenticación");
    await nav.getByRole("button", { name: "Usuarios", exact: true }).waitFor();
    assert(!(await nav.getByRole("button", { name: "Pagos", exact: true }).count()), "la búsqueda no normalizó términos acentuados");
    await search.fill("sin coincidencias");
    await nav.getByText("No hay coincidencias.").waitFor();
    await search.clear();
    await page.getByRole("button", { name: "Volver a la vista previa" }).click();
  });

  await step("chat: el turno se transmite por SSE y termina con la respuesta del constructor", async () => {
    assert(firstTurn, "el dashboard no envió el primer turno");
    const first = await firstTurn;
    assert(first.ok() && (first.headers()["content-type"] ?? "").includes("text/event-stream"), `el primer turno no respondió con SSE: ${first.status()}`);
    const firstEvents = await first.text();
    assert(/"type":"done"/.test(firstEvents) && !/"type":"error"/.test(firstEvents), `el primer turno no terminó bien: ${firstEvents.slice(-600)}`);
    assert(llmLog.some((l) => l.role === "final"), `el modelo de prueba no cerró el primer turno: ${JSON.stringify(llmLog.map((l) => l.role))}`);
    await page.getByRole("button", { name: "Enviar mensaje" }).waitFor({ state: "attached" });
    await page.getByText("Hice la app de notas.").first().waitFor();
    const message = "Cambia el color principal a verde";
    await page.getByLabel("Mensaje para el constructor").fill(message);
    const stream = page.waitForResponse(chatPost(message), { timeout: STEP_TIMEOUT_MS });
    await page.getByRole("button", { name: "Enviar mensaje" }).click();
    const response = await stream;
    const type = response.headers()["content-type"] ?? "";
    assert(response.ok() && type.includes("text/event-stream"), `el chat no respondió con SSE: ${response.status()} ${type}`);
    await page
      .getByText("Cambié el color principal a verde.")
      .first()
      .waitFor({ timeout: TURN_TIMEOUT_MS })
      .catch(async (e) => {
        const timeline = await page.locator(".error-box, .tl").allInnerTexts().then((t) => t.join(" | ")).catch(() => "(sin línea de tiempo)");
        const sse = await response.text().catch((err) => `(sin cuerpo: ${err.message})`);
        console.log(`       sse: ${sse.slice(0, 1500)}`);
        throw new Error(`${e.message.split("\n")[0]}\n       chat: ${timeline.slice(-800)}\n       llm: ${JSON.stringify(llmLog.map((l) => l.role))}`);
      });
    await page.getByRole("button", { name: "Detener" }).waitFor({ state: "detached", timeout: TURN_TIMEOUT_MS });
    assert(llmLog.some((l) => l.role === "fast"), `el modelo de prueba no recibió el turno: ${JSON.stringify(llmLog.map((l) => l.role))}`);
  });

  await step("vista previa: el iframe carga la app del proyecto con el cambio del chat", async () => {
    const iframe = page.locator('iframe[title="Vista previa"]');
    await iframe.waitFor();
    const src = await iframe.getAttribute("src");
    assert(src && /^https?:\/\//.test(src), `src de la vista previa inválido: ${src}`);
    const frame = page.frameLocator('iframe[title="Vista previa"]');
    await frame.locator("body *").first().waitFor({ timeout: TURN_TIMEOUT_MS });
    const deadline = Date.now() + TURN_TIMEOUT_MS;
    let primary = "";
    while (Date.now() < deadline) {
      primary = await frame.locator(":root").evaluate((el) => getComputedStyle(el).getPropertyValue("--primary").trim(), undefined, { timeout: 2000 }).catch(() => "");
      if (primary === "#16a34a") break;
      await sleep(500);
    }
    assert(primary === "#16a34a", `la vista previa no refleja el color del chat (--primary=${JSON.stringify(primary)}, src=${src})`);
    const manifestLink = frame.locator('link[rel="manifest"]');
    assert(await manifestLink.getAttribute("crossorigin") === "use-credentials", "el manifest privado no solicita credenciales");
    const appPage = await page.context().newPage();
    try {
      await appPage.goto(src);
      const cdp = await page.context().newCDPSession(appPage);
      const manifestResponse = appPage.waitForResponse((r) => new URL(r.url()).pathname === "/manifest.webmanifest");
      const appManifest = await cdp.send("Page.getAppManifest");
      const manifest = await manifestResponse;
      assert(manifest.ok() && !appManifest.errors.length, `el navegador no pudo cargar el manifest privado: ${manifest.status()} ${JSON.stringify(appManifest.errors)}`);
      assert((await manifest.request().allHeaders()).cookie?.includes("forja_share="), "la petición del manifest no envió la cookie del enlace privado");
      const denied = await appPage.evaluate(async () => (await fetch("/manifest.webmanifest", { credentials: "omit" })).status);
      assert(denied === 403, "el manifest privado se expuso sin la cookie del enlace");
      await cdp.detach();
    } finally {
      await appPage.close();
    }
  });

  await step("proyecto: recargar /p/<id> conserva la ruta y la vista del proyecto", async () => {
    assert(projectUrl, "no se creó el proyecto");
    await page.goto(projectUrl);
    await page.getByLabel("Mensaje para el constructor").waitFor();
    assert(new URL(page.url()).pathname === projectUrl, `la ruta cambió a ${page.url()}`);
    await page.getByRole("button", { name: "Menú de Forja" }).click();
    await page.getByRole("button", { name: "Oscuro" }).or(page.locator('button[title="Oscuro"]')).first().waitFor();
    await page.keyboard.press("Escape");
  });

  await step("constructor: borradores, modos y recuperación del historial no envían cambios sin confirmar", async () => {
    const sandbox = await context.newPage();
    const errors = [];
    sandbox.on("pageerror", (e) => errors.push(e.message));
    let posts = 0;
    let failHistory = true;
    let submitted = null;
    let messages = [];
    await sandbox.route("**/api/projects/*/chat", async (route) => {
      if (route.request().method() === "POST") {
        posts++;
        submitted = route.request().postDataJSON();
        messages = [
          { role: "user", content: [{ type: "text", text: submitted.message }] },
          { role: "assistant", content: [{ type: "text", text: "Esta es la explicación solicitada." }] },
        ];
        return route.fulfill({ contentType: "text/event-stream", body: 'data: {"type":"text","text":"Esta es la explicación solicitada."}\n\ndata: {"type":"done"}\n\n' });
      }
      return route.fulfill({ status: failHistory ? 503 : 200, json: failHistory ? { error: "Historial temporalmente no disponible" } : { messages, building: false } });
    });
    try {
      await sandbox.goto(projectUrl);
      await sandbox.getByText("No pudimos cargar la conversación").waitFor();
      assert(await sandbox.getByRole("button", { name: "Enviar mensaje" }).isDisabled(), "se puede enviar sin cargar el historial");
      failHistory = false;
      await sandbox.getByRole("button", { name: "Reintentar", exact: true }).click();
      await sandbox.getByRole("button", { name: /Planear un cambio/ }).waitFor();
      await screenshot(sandbox, "builder-chat-desktop");
      await sandbox.getByRole("button", { name: /Planear un cambio/ }).click();
      const modes = sandbox.getByRole("group", { name: "Modo del chat" });
      assert(await modes.getByRole("button", { name: "Plan", exact: true }).getAttribute("aria-pressed") === "true", "el punto de partida no activó Plan");
      assert((await sandbox.getByLabel("Mensaje para el constructor").inputValue()).includes("sin implementarlo"), "no se preparó el borrador");
      const draft = await sandbox.getByLabel("Mensaje para el constructor").inputValue();
      await sandbox.getByRole("button", { name: "Cerrar chat", exact: true }).click();
      assert(!await sandbox.getByLabel("Mensaje para el constructor").isVisible(), "cerrar no ocultó el chat");
      await sandbox.getByRole("button", { name: "Abrir chat", exact: true }).click();
      assert(await sandbox.getByLabel("Mensaje para el constructor").inputValue() === draft, "cerrar el chat perdió el borrador");
      assert(await modes.getByRole("button", { name: "Plan", exact: true }).getAttribute("aria-pressed") === "true", "cerrar el chat perdió el modo");
      await sandbox.getByRole("button", { name: "Servicios", exact: true }).click();
      await sandbox.getByRole("button", { name: "Cerrar chat", exact: true }).click();
      assert(!await sandbox.getByLabel("Mensaje para el constructor").isVisible(), "no se pudo cerrar el chat desde Servicios");
      await sandbox.getByRole("button", { name: "Abrir chat", exact: true }).click();
      assert(await sandbox.getByLabel("Mensaje para el constructor").inputValue() === draft, "reabrir desde Servicios perdió el borrador");
      assert(posts === 0, "reabrir el chat envió un cambio");
      await sandbox.getByLabel("Mensaje para el constructor").clear();
      await sandbox.getByRole("button", { name: /Entender mi app/ }).click();
      assert(await modes.getByRole("button", { name: "Chat", exact: true }).getAttribute("aria-pressed") === "true", "la explicación no usa el modo de solo lectura");
      await sandbox.keyboard.press("Alt+p");
      assert(await modes.getByRole("button", { name: "Plan", exact: true }).getAttribute("aria-pressed") === "true", "el atajo de modo dejó de funcionar");
      await sandbox.getByLabel("Mensaje para el constructor").fill("Mi petición original.");
      await sandbox.waitForFunction((id) => localStorage.getItem(`forja:draft:${id}`) === "Mi petición original.", projectUrl.split("/").pop());
      await sandbox.reload();
      await sandbox.getByRole("button", { name: /Planear un cambio/ }).waitFor();
      assert(await sandbox.getByLabel("Mensaje para el constructor").inputValue() === "Mi petición original.", "el borrador no sobrevivió a la recarga");
      await sandbox.getByRole("button", { name: "Servicios", exact: true }).click();
      await screenshot(sandbox, "builder-tools-desktop");
      await sandbox.getByRole("button", { name: "Añadir Pagos a favoritos", exact: true }).click();
      await sandbox.reload();
      await sandbox.getByRole("button", { name: "Servicios", exact: true }).click();
      assert(await sandbox.getByRole("button", { name: "Quitar Pagos de favoritos", exact: true }).getAttribute("aria-pressed") === "true", "el favorito no sobrevivió a la recarga");
      assert((await sandbox.locator(".tool-card strong").first().innerText()).includes("Pagos"), "el favorito no aparece primero");
      await sandbox.locator(".tool-card").filter({ hasText: "Pagos" }).click();
      await sandbox.getByRole("heading", { name: "Pagos", exact: true }).first().waitFor();
      await sandbox.getByRole("button", { name: /Pedir ayuda al constructor/ }).click();
      await sandbox.waitForFunction(() => document.querySelector('[aria-label="Mensaje para el constructor"]')?.value.includes("pagos"));
      assert((await sandbox.getByLabel("Mensaje para el constructor").inputValue()).startsWith("Mi petición original."), "la ayuda sobrescribió el borrador existente");
      assert((await sandbox.getByLabel("Mensaje para el constructor").inputValue()).includes("pagos"), "la ayuda no incluye contexto del panel");
      assert(posts === 0, "una sugerencia envió un turno sin confirmación");
      await sandbox.setViewportSize({ width: 320, height: 844 });
      await sandbox.getByRole("button", { name: "Servicios", exact: true }).click();
      await sandbox.getByRole("button", { name: /Pedir ayuda al constructor/ }).click();
      assert(await sandbox.getByLabel("Mensaje para el constructor").isVisible(), "la ayuda del panel no abrió el chat móvil");
      await screenshot(sandbox, "builder-chat-mobile");
      await sandbox.getByRole("button", { name: "Seleccionar elemento", exact: true }).click();
      assert(await sandbox.locator('iframe[title="Vista previa"]').isVisible(), "el selector no muestra la vista previa móvil");
      assert(await sandbox.evaluate(() => document.documentElement.scrollWidth) <= 321, "el nuevo constructor desborda en móvil");
      await sandbox.getByRole("navigation", { name: "Espacio de trabajo" }).getByRole("button", { name: /Chat/ }).click();
      await modes.getByRole("button", { name: "Chat", exact: true }).click();
      await sandbox.getByLabel("Mensaje para el constructor").fill("Explícame la app");
      let finishUpload;
      let markUploadStarted;
      const uploadStarted = new Promise((resolve) => { markUploadStarted = resolve; });
      await sandbox.route("**/api/projects/*/attachments", async (route) => {
        await new Promise((resolve) => { finishUpload = resolve; markUploadStarted(); });
        await route.fulfill({ json: { path: "static/uploads/ux-notes.txt" } });
      });
      await sandbox.locator('input[type="file"]').setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("Contexto de prueba") });
      await sandbox.getByText("Subiendo…", { exact: true }).waitFor();
      assert(await sandbox.getByRole("button", { name: "Enviar mensaje" }).isDisabled(), "el envío no espera al adjunto");
      await sandbox.getByLabel("Mensaje para el constructor").press("Enter");
      assert(posts === 0, "Enter envió un mensaje antes de terminar el adjunto");
      await uploadStarted;
      finishUpload();
      await sandbox.getByText("Subiendo…", { exact: true }).waitFor({ state: "detached" });
      await sandbox.getByRole("button", { name: "Enviar mensaje" }).click();
      await sandbox.getByRole("button", { name: "Detener", exact: true }).waitFor({ state: "detached" });
      await sandbox.getByText("Esta es la explicación solicitada.", { exact: true }).waitFor();
      assert(posts === 1 && submitted.mode === "chat" && submitted.attachments[0] === "static/uploads/ux-notes.txt", "el envío no respetó modo o adjunto");
      assert(await sandbox.evaluate((id) => localStorage.getItem(`forja:draft:${id}`), projectUrl.split("/").pop()) === null, "el borrador enviado sigue guardado");
      assert(errors.length === 0, `errores de JS en recuperación: ${errors.join(" | ")}`);
    } finally {
      await sandbox.close();
    }
  });

  await step("constructor: los errores de herramientas se pueden abrir, copiar y consultar tras recargar", async () => {
    const sandbox = await context.newPage();
    const errors = [];
    sandbox.on("pageerror", (e) => errors.push(e.message));
    const diagnostic = 'Error: relation "orders" does not exist\nSQL: select * from orders\nDetalle: crea la tabla antes de consultar.';
    let completed = false;
    let releaseHistory;
    const historyReleased = new Promise((resolve) => { releaseHistory = resolve; });
    let finishStream;
    const streamFinished = new Promise((resolve) => { finishStream = resolve; });
    const tasks = () => completed ? [{
      id: "ux-turn:fast", turnId: "ux-turn", role: "fast", goal: "", model: null, status: "failed",
      summary: "El proveedor se desconectó después del error de SQL.",
      steps: [{ tool: "execute_sql", summary: "select * from orders", ok: false, output: diagnostic }],
      dependsOn: [], inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, usd: 0, startedAt: null,
    }] : [];
    const messages = () => completed ? [
      { role: "user", turnId: "ux-turn", content: [{ type: "text", text: "Consulta los pedidos" }] },
      { role: "assistant", turnId: "ux-turn", content: [{ type: "text", text: "La consulta falló." }] },
      { role: "assistant", turnId: "ux-legacy", content: [{ type: "text", text: "Ejecución antigua." }] },
      { role: "user", turnId: "ux-no-reply", content: [{ type: "text", text: "Turno sin respuesta final" }] },
      { role: "assistant", turnId: "ux-plain", content: [{ type: "tool_use", id: "plain-1", name: "edit_file", input: { path: "pages/home.tsx" } }] },
      { role: "user", turnId: "ux-plain", content: [{ type: "tool_result", tool_use_id: "plain-1", content: "Error: no se encontró el texto a reemplazar", is_error: true }] },
    ] : [];
    await sandbox.route("**/api/projects/*/chat", async (route) => {
      if (route.request().method() === "GET") {
        if (completed) await historyReleased;
        return route.fulfill({ json: { messages: messages(), tasks: [...tasks(), ...(completed ? [{
        id: "ux-legacy:ui", turnId: "ux-legacy", role: "ui", goal: "Construir", model: null, status: "done", summary: null,
        steps: [{ tool: "check_build", summary: "", ok: false }], dependsOn: [], startedAt: null,
      }, {
        id: "ux-no-reply:backend", turnId: "ux-no-reply", role: "backend", goal: "Sin respuesta final", model: null, status: "failed", summary: "Proveedor no disponible.",
        steps: [{ tool: "read_files", summary: "missing.ts", ok: false, output: "Error: missing.ts no existe" }], dependsOn: [], startedAt: null,
      }] : [])], building: false } });
      }
      const events = [
        { type: "task_start", taskId: "fast", role: "fast" },
        { type: "tool_start", taskId: "fast", id: "sql-1", name: "execute_sql", summary: "select * from orders" },
        { type: "tool_end", taskId: "fast", id: "sql-1", ok: false, output: diagnostic },
        { type: "task_end", taskId: "fast", ok: false, summary: "El proveedor se desconectó después del error de SQL." },
      ];
      await route.fulfill({ contentType: "text/event-stream", body: events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join("") });
      completed = true;
      finishStream();
    });
    try {
      await sandbox.goto(projectUrl);
      await sandbox.getByRole("button", { name: /Crear una función/ }).waitFor();
      await sandbox.getByLabel("Mensaje para el constructor").fill("Consulta los pedidos");
      await sandbox.getByRole("button", { name: "Enviar mensaje" }).click();
      await streamFinished;
      const lane = sandbox.locator(".lane").filter({ hasText: "Constructor" });
      await lane.getByRole("button", { name: /Ver detalles/ }).click();
      await lane.getByRole("button", { name: /Ver error/ }).click();
      assert(await lane.locator(".step-diagnostic .step-output").innerText() === diagnostic, "no se ve la salida completa del error en vivo");
      await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: base });
      await sandbox.bringToFront();
      await lane.getByRole("button", { name: "Copiar detalle", exact: true }).click();
      await lane.getByRole("button", { name: "Copiado", exact: true }).waitFor();
      const copiedDiagnostic = await sandbox.evaluate(() => navigator.clipboard.readText());
      assert(copiedDiagnostic.replace(/\r\n/g, "\n") === `execute_sql · select * from orders\n${diagnostic}`, `el portapapeles no contiene el diagnóstico: ${JSON.stringify(copiedDiagnostic)}`);
      await lane.getByText("Error del agente · Ver detalle").click();
      await lane.getByText("El proveedor se desconectó después del error de SQL.", { exact: true }).waitFor();
      releaseHistory();
      await sandbox.getByText("La consulta falló.", { exact: true }).waitFor();
      await sandbox.reload();
      const restored = sandbox.locator(".lane").filter({ hasText: "Constructor" });
      await restored.getByRole("button", { name: /Ver detalles/ }).click();
      await restored.getByRole("button", { name: /Ver error/ }).click();
      assert(await restored.locator(".step-diagnostic .step-output").innerText() === diagnostic, "el error desapareció al recargar");
      const legacy = sandbox.locator(".lane").filter({ hasText: "Interfaz" });
      await legacy.getByRole("button", { name: /Ver detalles/ }).click();
      await legacy.getByRole("button", { name: /Ver error/ }).click();
      await legacy.getByText("Este registro no contiene la salida de la herramienta.", { exact: false }).waitFor();
      const noReply = sandbox.locator(".lane").filter({ hasText: "Backend" });
      await noReply.getByRole("button", { name: /Ver detalles/ }).click();
      await noReply.getByRole("button", { name: /Ver error/ }).click();
      assert(await noReply.locator(".step-diagnostic .step-output").innerText() === "Error: missing.ts no existe", "se ocultó el diagnóstico del turno sin respuesta final");
      const standalone = sandbox.locator(".chat-log > .steps");
      await standalone.getByRole("button", { name: /Ver error/ }).click();
      assert(await standalone.locator(".step-output").innerText() === "Error: no se encontró el texto a reemplazar", "el historial sin agentes no muestra el diagnóstico");
      await sandbox.setViewportSize({ width: 320, height: 844 });
      await sandbox.getByRole("navigation", { name: "Espacio de trabajo" }).getByRole("button", { name: /Chat/ }).click();
      await restored.locator(".step-diagnostic .step-output").waitFor();
      await restored.locator(".step-diagnostic .step-output").scrollIntoViewIfNeeded();
      assert(await sandbox.evaluate(() => document.documentElement.scrollWidth) <= 321, "el diagnóstico desborda en móvil");
      await screenshot(sandbox, "builder-tool-error-mobile");
      await standalone.getByRole("button", { name: "Descartar error de herramienta" }).click();
      assert(await standalone.locator(".tool-step").count() === 0, "la X no descartó el error de herramienta");
      await restored.getByRole("button", { name: "Descartar error del agente" }).click();
      assert(await restored.count() === 0, "la X no descartó la tarjeta del agente");
      await sandbox.getByRole("button", { name: "Cerrar chat", exact: true }).click();
      await sandbox.getByRole("navigation", { name: "Espacio de trabajo" }).getByRole("button", { name: /Chat/ }).click();
      assert(await sandbox.getByLabel("Mensaje para el constructor").isVisible(), "no se pudo reabrir el chat móvil");
      assert(await restored.count() === 0, "reabrir el chat perdió los errores descartados");
      await sandbox.reload();
      await sandbox.getByRole("navigation", { name: "Espacio de trabajo" }).getByRole("button", { name: /Chat/ }).click();
      await restored.waitFor();
      assert(await restored.getByRole("button", { name: "Descartar error del agente" }).isVisible(), "descartar borró el diagnóstico del historial");
      assert(errors.length === 0, `errores de JS en diagnóstico: ${errors.join(" | ")}`);
    } finally {
      releaseHistory();
      await sandbox.close();
    }
  });

  await step("paneles: buscar usuarios y filtrar registros muestra resultados y vacíos útiles", async () => {
    const sandbox = await context.newPage();
    await sandbox.route("**/api/projects/*/users", (route) => route.fulfill({ json: { users: [
      { id: "ux-admin", email: "admin@example.test", name: "Admin", role: "admin", hasPassword: true, createdAt: new Date().toISOString() },
      { id: "ux-member", email: "member@example.test", name: "Invitado", role: "user", hasPassword: false, createdAt: new Date().toISOString() },
    ] } }));
    await sandbox.route("**/api/projects/*/logs", (route) => route.fulfill({ json: { logs: [
      { at: new Date().toISOString(), env: "preview", level: "info", source: "http", message: "Vista previa lista" },
      { at: new Date().toISOString(), env: "published", level: "error", source: "job", message: "No se pudo enviar resumen" },
    ] } }));
    try {
      await sandbox.goto(projectUrl);
      await sandbox.getByRole("button", { name: "Servicios", exact: true }).click();
      const nav = sandbox.getByRole("navigation", { name: "Herramientas del proyecto" });
      await nav.getByRole("button", { name: "Usuarios", exact: true }).click();
      await sandbox.getByRole("searchbox", { name: "Buscar usuarios" }).fill("admin");
      await sandbox.getByRole("cell", { name: "admin@example.test", exact: true }).waitFor();
      assert(await sandbox.getByRole("cell", { name: "member@example.test", exact: true }).count() === 0, "no se filtraron los usuarios");
      await sandbox.getByRole("searchbox", { name: "Buscar usuarios" }).fill("inexistente");
      await sandbox.getByText("No hay usuarios que coincidan", { exact: true }).waitFor();
      await sandbox.getByRole("button", { name: "Limpiar búsqueda", exact: true }).click();
      await sandbox.getByRole("cell", { name: "member@example.test", exact: true }).waitFor();
      await screenshot(sandbox, "builder-users-desktop");
      await nav.getByRole("button", { name: "Registros", exact: true }).click();
      await sandbox.getByRole("button", { name: /^Entorno de los registros:/ }).click();
      await sandbox.getByRole("option", { name: "Publicada", exact: true }).click();
      await sandbox.getByLabel("Solo errores").check();
      await sandbox.locator(".log-line").filter({ hasText: "No se pudo enviar resumen" }).waitFor();
      assert(await sandbox.locator(".log-line").filter({ hasText: "Vista previa lista" }).count() === 0, "no se filtró el entorno");
      await sandbox.getByRole("searchbox", { name: "Buscar registros" }).fill("inexistente");
      await sandbox.getByText("No hay registros con estos filtros").waitFor();
      await sandbox.getByRole("button", { name: "Limpiar filtros" }).click();
      await sandbox.locator(".log-line").filter({ hasText: "Vista previa lista" }).waitFor();
      await sandbox.setViewportSize({ width: 390, height: 844 });
      assert(await sandbox.evaluate(() => document.documentElement.scrollWidth) <= 391, "los filtros de registros desbordan en móvil");
      await screenshot(sandbox, "builder-logs-mobile");
    } finally {
      await sandbox.close();
    }
  });

  await step("tema: elegir Oscuro persiste tras recargar", async () => {
    await page.goto("/");
    await page.locator("aside.sidebar .account-mini button").first().click();
    await page.locator('button[title="Oscuro"]').click();
    assert((await page.evaluate(() => document.documentElement.dataset.theme)) === "dark", "data-theme no es dark tras elegir Oscuro");
    await page.reload();
    await page.locator("aside.sidebar").waitFor();
    const state = await page.evaluate(() => ({ theme: document.documentElement.dataset.theme, saved: localStorage.getItem("forja:theme") }));
    assert(state.theme === "dark" && state.saved === "dark", `el tema no persistió: ${JSON.stringify(state)}`);
  });

  await step("cuenta: /account muestra la cuenta del usuario", async () => {
    await page.locator("aside.sidebar nav").getByRole("link", { name: "Cuenta" }).click();
    await page.waitForURL(/\/account$/);
    await page.getByRole("heading", { name: "Cuenta" }).waitFor();
    await page.getByText(ADMIN.email).first().waitFor();
  });

  await step("administración: /admin muestra el panel con sus secciones", async () => {
    await page.locator("aside.sidebar nav").getByRole("link", { name: "Administración" }).click();
    await page.waitForURL(/\/admin/);
    await page.getByRole("heading", { name: "Administración" }).waitFor();
    await page.getByRole("navigation", { name: "Secciones de administración" }).waitFor();
  });

  await step("admin: auditoría filtra el proyecto y muestra uso, contexto y vacíos sin contenido privado", async () => {
    const sandbox = await context.newPage();
    try {
      const loaded = sandbox.waitForResponse(response => new URL(response.url()).pathname === "/api/admin/audit");
      await sandbox.goto("/admin/audit");
      const response = await loaded;
      assert(response.status() === 200, "la consulta administrativa de auditoría falló");
      await sandbox.getByRole("heading", { name: "Uso y cobertura", exact: true }).waitFor();
      const filtered = sandbox.waitForResponse(response => new URL(response.url()).searchParams.get("projectId") === projectUrl.split("/")[2]);
      await sandbox.getByLabel("Proyecto (ID; vacío = plataforma)").fill(projectUrl.split("/")[2]);
      await sandbox.getByRole("button", { name: "Consultar", exact: true }).click();
      const report = await (await filtered).json();
      assert(report.summary.fusionCalls > 0 && report.summary.contextRecordedCalls > 0, "el turno del constructor no registró contexto ni llamadas");
      assert(report.summary.inputTokens > 0 && report.timeline.every(step => step.projectId === projectUrl.split("/")[2]), "el filtro de proyecto no se aplicó");
      assert(!JSON.stringify(report).includes("input_schema"), "la auditoría expone esquemas o contenido de petición");
      const timeline = sandbox.locator("section").filter({ has: sandbox.getByRole("heading", { name: "Turnos y crecimiento de contexto", exact: true }) });
      await timeline.locator("details").first().locator("summary").first().click();
      await timeline.locator("details details").first().locator("summary").click();
      await timeline.getByText("Contexto estimado:", { exact: false }).first().waitFor();
      await sandbox.setViewportSize({ width: 390, height: 844 });
      assert(await sandbox.evaluate(() => document.documentElement.scrollWidth) <= 391, "el panel de auditoría desborda en móvil");
      await screenshot(sandbox, "admin-execution-audit-mobile");
      const empty = sandbox.waitForResponse(response => new URL(response.url()).searchParams.get("projectId") === "missing-audit-project");
      await sandbox.getByLabel("Proyecto (ID; vacío = plataforma)").fill("missing-audit-project");
      await sandbox.getByRole("button", { name: "Consultar", exact: true }).click();
      assert((await (await empty).json()).summary.calls === 0, "el proyecto vacío conserva llamadas del filtro anterior");
      await sandbox.getByText("Sin peticiones con detalle registrado.", { exact: true }).waitFor();
    } finally {
      await sandbox.close();
    }
  });

  await step("admin: ajustes buscables, cambios reversibles y guardado persistente", async () => {
    await page.goto("/admin/general");
    const search = page.getByRole("textbox", { name: "Buscar ajustes" });
    await search.fill("freeCredits");
    const credits = page.getByLabel("Créditos iniciales por cuenta", { exact: true });
    const original = await credits.inputValue();
    const save = page.getByRole("button", { name: "Guardar cambios", exact: true });
    await credits.fill(String(Number(original) + 1));
    assert(await save.isEnabled(), "el ajuste no marcó cambios pendientes");
    await credits.fill(original);
    assert(await save.isDisabled(), "volver al valor original no limpió el borrador");
    await credits.fill(String(Number(original) + 7));
    await save.click();
    await page.getByRole("status").filter({ hasText: "Guardado: 1 ajuste." }).waitFor();
    await page.reload();
    await page.getByRole("textbox", { name: "Buscar ajustes" }).fill("freeCredits");
    assert(await page.getByLabel("Créditos iniciales por cuenta", { exact: true }).inputValue() === String(Number(original) + 7), "no persistió el ajuste");
    await page.getByRole("button", { name: "Restablecer", exact: true }).click();
    await page.getByRole("status").filter({ hasText: "Valor por defecto restablecido." }).waitFor();
    await page.getByRole("textbox", { name: "Buscar ajustes" }).fill("ajuste-que-no-existe");
    await page.getByText("No hay ajustes con estos filtros.", { exact: false }).waitFor();
    await page.getByRole("button", { name: "Limpiar filtros", exact: true }).click();
    await page.getByRole("textbox", { name: "Buscar ajustes" }).fill("models.allow");
    const patterns = page.getByLabel("Lista blanca de modelos de la plataforma", { exact: true });
    const originalPatterns = await patterns.inputValue();
    await patterns.fill(`${originalPatterns}\n`);
    await patterns.press("End");
    await patterns.pressSequentially("ux-test:*");
    assert((await patterns.inputValue()).endsWith("\nux-test:*"), "no se pudo escribir una nueva línea en la lista");
    await page.getByRole("button", { name: "Descartar", exact: true }).click();
  });

  await step("admin: select filtra sin acentos, navega por teclado y restaura el foco", async () => {
    await page.goto("/admin/general");
    const trigger = page.getByRole("button", { name: /^Grupo de ajustes:/ });
    await trigger.click();
    const search = page.getByRole("combobox", { name: "Buscar en Grupo de ajustes" });
    await search.fill("creditos");
    assert(await page.getByRole("option").count() === 1, "la búsqueda no filtró por Créditos sin acento");
    await search.press("Enter");
    await page.getByText("Créditos iniciales por cuenta", { exact: true }).waitFor();
    await page.waitForFunction(() => document.activeElement?.getAttribute("aria-label")?.startsWith("Grupo de ajustes:"));
    assert(await trigger.evaluate((el) => document.activeElement === el), "no volvió el foco al selector");
    await trigger.press("ArrowDown");
    await page.getByRole("combobox", { name: "Buscar en Grupo de ajustes" }).fill("sin-opcion");
    await page.getByRole("status").filter({ hasText: "No hay opciones" }).waitFor();
    await page.getByRole("combobox", { name: "Buscar en Grupo de ajustes" }).press("Escape");
    await page.waitForFunction(() => document.activeElement?.getAttribute("aria-label")?.startsWith("Grupo de ajustes:"));
    assert(await trigger.evaluate((el) => document.activeElement === el), "Escape no devolvió el foco");
    await trigger.click();
    const reopened = page.getByRole("combobox", { name: "Buscar en Grupo de ajustes" });
    assert(await reopened.inputValue() === "", "la búsqueda anterior no se limpió");
    await reopened.press("Home");
    await reopened.press("ArrowDown");
    await reopened.press("Enter");
    assert(await page.getByRole("listbox").count() === 0, "Enter no cerró la lista");
    await trigger.click();
    await page.getByRole("combobox", { name: "Buscar en Grupo de ajustes" }).press("Tab");
    await page.getByRole("listbox").waitFor({ state: "hidden" });
    await page.waitForFunction(() => document.activeElement?.matches('input[type="checkbox"]'));
    assert(await page.getByLabel("Solo modificados").evaluate((el) => document.activeElement === el), "Tab no continuó al siguiente control");
  });

  await step("admin IA: diseño compacto, expansión por teclado y formularios móviles", async () => {
    await page.goto("/admin/providers");
    const providers = page.locator(".ai-provider");
    const first = providers.first();
    const second = providers.nth(1);
    const opener = first.getByRole("button", { expanded: false });
    await opener.waitFor();
    assert(!await page.getByRole("textbox", { name: /^Clave de API de / }).count(), "se mostraron todas las claves en la lista inicial");
    await opener.focus();
    await page.keyboard.press("Enter");
    await first.getByRole("button", { name: "Editar proveedor", exact: true }).waitFor();
    await second.getByRole("button", { expanded: false }).click();
    assert(await first.getByRole("button", { expanded: false }).isVisible(), "no se cerró el proveedor anterior");
    assert(!await first.getByRole("button", { name: "Editar proveedor", exact: true }).isVisible(), "las acciones del proveedor cerrado siguen visibles");
    await screenshot(page, "admin-providers-compact");
    await page.route("**/api/admin/providers/*/test", route => route.fulfill({ json: { ok: false, ms: 0, error: "Conexión de prueba rechazada" } }));
    try {
      await second.getByRole("button", { name: "Probar conexión", exact: true }).click();
      await second.getByRole("alert").filter({ hasText: "Conexión de prueba rechazada" }).waitFor();
      await second.getByRole("button", { expanded: true }).click();
      assert(await second.getByRole("alert").isVisible(), "se ocultó el error de conexión al cerrar el proveedor");
    } finally { await page.unroute("**/api/admin/providers/*/test"); }
    await page.setViewportSize({ width: 390, height: 844 });
    try {
      await page.getByRole("button", { name: "+ Añadir proveedor", exact: true }).click();
      let dialog = page.getByRole("dialog", { name: "Nuevo proveedor", exact: true });
      await dialog.getByLabel("Identificador", { exact: true }).fill("mobile-local");
      assert(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth), "el formulario de proveedor desborda su diálogo");
      await screenshot(page, "admin-provider-mobile");
      await page.keyboard.press("Escape");
      await dialog.waitFor({ state: "hidden" });
      await page.goto("/admin/models");
      await page.getByRole("article").first().waitFor();
      assert(!await page.locator(".admin-model-table").count(), "se conservó la tabla densa anterior");
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "la lista de modelos desborda el ancho móvil");
      await screenshot(page, "admin-models-mobile");
      const search = page.getByRole("searchbox", { name: "Buscar modelo", exact: true });
      await search.fill("modelo-inexistente");
      await page.getByText("No hay modelos con estos filtros.", { exact: false }).waitFor();
      await page.getByRole("button", { name: "Ver todos", exact: true }).click();
      assert(await search.inputValue() === "", "no se limpió el filtro");
      await page.getByRole("button", { name: "+ Añadir modelo propio", exact: true }).click();
      dialog = page.getByRole("dialog", { name: "Añadir modelo propio", exact: true });
      await dialog.getByText("Precios, contexto y rendimiento", { exact: true }).click();
      assert(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth), "el formulario de modelo desborda su diálogo");
      await screenshot(page, "admin-model-mobile");
      await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
      await dialog.waitFor({ state: "hidden" });
    } finally { await page.setViewportSize({ width: 1280, height: 800 }); }
  });

  await step("admin: edición completa de modelos conserva errores y persiste cambios", async () => {
    await page.goto("/admin/models");
    await page.getByRole("button", { name: "Editar Fuerte", exact: true }).click();
    let dialog = page.getByRole("dialog", { name: "Editar modelo" });
    await dialog.getByLabel("Nombre visible").fill("Modelo editado");
    await dialog.getByLabel("Contexto (tokens)", { exact: true }).fill("64000");
    await dialog.getByLabel("Lectura de caché ($/MTok)", { exact: true }).fill("0.07");
    await dialog.getByLabel("Herramientas", { exact: true }).uncheck();
    await page.route("**/api/admin/models/item/**", async (route) => {
      if (route.request().method() === "PATCH") await route.fulfill({ status: 400, json: { error: "No se pudo guardar el modelo de prueba" } });
      else await route.continue();
    });
    await dialog.getByRole("button", { name: "Guardar cambios" }).click();
    await dialog.getByRole("alert").filter({ hasText: "No se pudo guardar" }).waitFor();
    assert(await dialog.getByLabel("Nombre visible").inputValue() === "Modelo editado", "se perdió el borrador tras el error");
    await page.unroute("**/api/admin/models/item/**");
    await dialog.getByRole("button", { name: "Guardar cambios" }).click();
    await dialog.waitFor({ state: "hidden" });
    await page.reload();
    await page.getByRole("button", { name: "Editar Modelo editado", exact: true }).click();
    dialog = page.getByRole("dialog", { name: "Editar modelo" });
    assert(await dialog.getByLabel("Contexto (tokens)", { exact: true }).inputValue() === "64000", "no persistió el contexto");
    assert(await dialog.getByLabel("Lectura de caché ($/MTok)", { exact: true }).inputValue() === "0.07", "no persistió el precio de caché");
    assert(!await dialog.getByLabel("Herramientas", { exact: true }).isChecked(), "no persistieron las capacidades");
    await dialog.getByLabel("Nombre visible").fill("No guardar");
    await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
    await page.getByRole("button", { name: "Editar Modelo editado", exact: true }).waitFor();
    await screenshot(page, "admin-models");
  });

  await step("admin: checkbox moderno conserva teclado, foco y accesibilidad en Studio y SDK", async () => {
    await page.goto("/admin/models");
    const checkbox = page.getByRole("checkbox", { name: "Solo utilizables", exact: true });
    await checkbox.waitFor();
    assert(!await checkbox.isChecked(), "el catálogo debe mostrar también los modelos pendientes de configurar");
    assert(await checkbox.evaluate(el => getComputedStyle(el).appearance) === "none", "Studio sigue mostrando el checkbox nativo sin estilo");
    await checkbox.focus();
    await page.keyboard.press("Space");
    assert(await checkbox.isChecked(), "Espacio no alternó el checkbox");
    assert(await checkbox.evaluate(el => getComputedStyle(el).outlineStyle) === "solid", "el foco de teclado no es visible");
    await page.keyboard.press("Space");
    assert(!await checkbox.isChecked(), "Espacio no restauró el estado del checkbox");
    await page.emulateMedia({ forcedColors: "active" });
    assert(await checkbox.evaluate(el => getComputedStyle(el).appearance) === "auto", "el checkbox no recuperó su apariencia accesible en alto contraste");
    await page.emulateMedia({ forcedColors: "none" });
    const sdkPage = await page.context().newPage();
    try {
      await sdkPage.setContent('<label class="fj-check"><input type="checkbox" name="choice"><span>Elegir opción</span></label><label class="fj-check"><input type="checkbox" disabled><span>No disponible</span></label>');
      await sdkPage.addStyleTag({ path: path.join(ROOT, "sdk", "ui", "ui.css") });
      const sdkCheckbox = sdkPage.getByRole("checkbox", { name: "Elegir opción" });
      assert(await sdkCheckbox.evaluate(el => getComputedStyle(el).appearance) === "none", "SDK no usa el checkbox modernizado");
      await sdkPage.getByText("Elegir opción", { exact: true }).click();
      assert(await sdkCheckbox.isChecked(), "la etiqueta no activa el checkbox del SDK");
      assert(await sdkPage.getByRole("checkbox", { name: "No disponible" }).isDisabled(), "el estado deshabilitado no se conservó");
    } finally { await sdkPage.close(); }
  });

  await step("admin: diagnóstico de permisos y selección explícita del juez visual", async () => {
    const account = await (await page.request.get("/api/models")).json();
    const visual = account.models.find(m => m.vision);
    assert(visual, "falta el modelo visual de prueba");
    await page.request.put("/api/models/account", { data: { enabled: account.models.filter(m => m.id !== visual.id && m.enabled).map(m => m.id) } });
    try {
      await page.goto("/admin/models");
      const permit = page.getByRole("button", { name: `Permitir ${visual.label} en mi cuenta`, exact: true });
      await permit.waitFor();
      await page.getByText("No permitido en tu cuenta", { exact: false }).first().waitFor();
      await permit.click();
      await permit.waitFor({ state: "hidden" });
      const updated = await (await page.request.get("/api/models")).json();
      assert(updated.models.find(m => m.id === visual.id)?.enabled, "la acción no permitió el juez en la cuenta");
      const cfg = { enabled: true, limits: { maxRunUsd: 2, maxDailyUsd: 5, concurrency: 1, maxJobs: 60, maxRepeats: 5 },
        spentLast24hUsd: 0, browser: true, activeRunId: null, cases: [{ id: "case", size: "small", title: "Caso de prueba" }],
        models: [], modelDiagnostics: [{ ...visual, tools: true, blockers: ["No permitido en tu cuenta"] }] };
      await page.route("**/api/admin/evals/config", route => route.fulfill({ json: cfg }));
      await page.route("**/api/admin/evals/runs", route => route.fulfill({ json: { runs: [] } }));
      await page.goto("/admin/evals");
      await page.getByRole("alert").filter({ hasText: "No permitido en tu cuenta" }).waitFor();
      assert(await page.getByRole("button", { name: /^Ejecutar / }).isDisabled(), "evals permite iniciar sin un juez disponible");
      cfg.models = [visual];
      cfg.modelDiagnostics[0].blockers = [];
      await page.getByRole("button", { name: "Volver a comprobar", exact: true }).click();
      await page.getByRole("alert").waitFor({ state: "hidden" });
      await page.getByRole("button", { name: /^Modelo juez de diseño:/ }).click();
      await page.getByRole("option").filter({ hasText: visual.id }).click();
      assert(await page.getByRole("button", { name: /^Ejecutar / }).isEnabled(), "no se habilitó la ejecución tras corregir permisos");
      let posted;
      await page.unroute("**/api/admin/evals/runs");
      await page.route("**/api/admin/evals/runs", async route => {
        if (route.request().method() === "POST") {
          posted = route.request().postDataJSON();
          await route.fulfill({ status: 400, json: { error: "Ejecución interceptada sin gasto" } });
        } else await route.fulfill({ json: { runs: [] } });
      });
      await page.getByRole("button", { name: /^Ejecutar / }).click();
      await page.getByText("Ejecución interceptada sin gasto").waitFor();
      assert(posted.judgeModel === visual.id, "no se envió el juez elegido");
    } finally {
      await page.request.put("/api/models/account", { data: { enabled: account.customized ? account.models.filter(m => m.enabled).map(m => m.id) : null } });
      await page.unroute("**/api/admin/evals/config");
      await page.unroute("**/api/admin/evals/runs");
    }
  });

  await step("admin: evals moderno filtra casos y resultados, muestra errores y se adapta al móvil", async () => {
    const cases = [{ id: "small-case", size: "small", title: "Caso pequeño" }, { id: "large-case", size: "large", title: "Caso grande" }];
    const cfg = { enabled: true, limits: { maxRunUsd: 2, maxDailyUsd: 5, concurrency: 1, maxJobs: 2, maxRepeats: 5 },
      spentLast24hUsd: 1, browser: true, activeRunId: null, cases, models: [{ id: "vision", label: "Modelo visual", tier: 4, vision: true }] };
    const run = { id: "ux-run", status: "done", createdAt: "2026-11-04T12:00:00Z", budgetUsd: 2, spentUsd: 0.5, error: null, total: 2, done: 2, active: false };
    const agg = { runs: 2, passRate: 0.5, score: { mean: 50, min: 0, max: 100, stdev: 50 }, judge: null, usd: 0.5, meanSeconds: 12, gateRounds: 1 };
    const good = { caseId: "small-case", repeat: 1, status: "done", usd: 0.2, durationMs: 1000,
      score: { total: 100, compile: 25, types: 20, runtime: 25, judge: null, hygiene: 10 },
      turn: { models: ["vision"], steps: 2, toolErrors: 0 }, checks: { compile: { ok: true }, types: { ok: true }, preview: [] }, design: { judge: null } };
    const detail = { ...run, config: { cases: cases.map(c => c.id), repeats: 1, models: ["vision"], judge: false },
      summary: { overall: agg, byCase: { "small-case": agg }, bySize: {} },
      results: [good, { ...good, caseId: "large-case", status: "failed", error: "Compilación fallida de prueba", score: { ...good.score, total: 0 }, checks: { compile: { ok: false }, types: null, preview: [] } }] };
    let failDetail = true;
    await page.route("**/api/admin/evals/config", route => route.fulfill({ json: cfg }));
    await page.route("**/api/admin/evals/runs", route => route.fulfill({ json: { runs: [run] } }));
    await page.route("**/api/admin/evals/runs/ux-run", route => failDetail
      ? route.fulfill({ status: 500, json: { error: "No se pudieron cargar resultados" } }) : route.fulfill({ json: detail }));
    await page.route("**/api/admin/evals/runs/ux-run/export?*", route => route.fulfill({ status: 500, json: { error: "Exportación rechazada" } }));
    try {
      await page.goto("/admin/evals");
      await page.getByRole("heading", { name: "Evalúa, compara y encuentra fallos" }).waitFor();
      assert(await page.getByRole("button", { name: /^Ejecutar / }).isDisabled(), "no se respetó el máximo de ejecuciones");
      await page.getByRole("button", { name: "Ninguno", exact: true }).click();
      await page.getByRole("button", { name: "Actualizar", exact: true }).click();
      await page.getByText("Selecciona al menos un caso.", { exact: true }).waitFor();
      assert(await page.getByRole("checkbox", { name: /Caso pequeño/ }).isChecked() === false, "actualizar volvió a seleccionar los casos descartados");
      await page.getByRole("button", { name: "Pequeños", exact: true }).click();
      assert(await page.getByRole("button", { name: /^Ejecutar / }).isEnabled(), "la selección rápida no ajustó las ejecuciones");
      await page.getByRole("button", { name: "Ver resultados", exact: true }).click();
      await page.getByRole("alert").filter({ hasText: "No se pudieron cargar resultados" }).waitFor();
      failDetail = false;
      await page.getByRole("button", { name: "Reintentar resultados", exact: true }).click();
      await page.getByRole("heading", { name: "Detalle de cada repetición" }).waitFor();
      await page.getByRole("checkbox", { name: "Solo con problemas", exact: true }).check();
      assert(await page.locator(".evals-result").count() === 1, "no se filtraron las repeticiones con problemas");
      await page.locator(".evals-result summary").click();
      await page.getByText("Compilación fallida de prueba", { exact: true }).waitFor();
      await page.getByRole("searchbox", { name: "Buscar resultados" }).fill("inexistente");
      await page.getByText("No hay resultados con estos filtros.", { exact: true }).waitFor();
      await page.getByRole("searchbox", { name: "Buscar resultados" }).fill("");
      await page.getByRole("button", { name: "JSON", exact: true }).click();
      await page.getByRole("alert").filter({ hasText: "Exportación rechazada" }).waitFor();
      await page.setViewportSize({ width: 390, height: 844 });
      await page.locator(".evals").waitFor();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "evals desborda el ancho móvil");
      await page.getByRole("heading", { name: "Evalúa, compara y encuentra fallos" }).scrollIntoViewIfNeeded();
      await screenshot(page, "evals-mobile");
    } finally {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.unroute("**/api/admin/evals/config");
      await page.unroute("**/api/admin/evals/runs");
      await page.unroute("**/api/admin/evals/runs/ux-run");
      await page.unroute("**/api/admin/evals/runs/ux-run/export?*");
    }
  });

  await step("admin IA: proveedor a modelo sin clasificación y validación de herramientas", async () => {
    await page.route("**/api/admin/providers/openai/models", route => route.fulfill({ json: {
      models: [{ id: "fake-config-flow", label: "Modelo del recorrido", context: 64000, inPrice: 0.2, outPrice: 0.8 }],
    } }));
    try {
      await page.goto("/admin/providers");
      await page.getByRole("navigation", { name: "Configuración de IA" }).waitFor();
      await page.locator(".ai-provider").filter({ has: page.locator("code", { hasText: /^openai$/ }) }).getByRole("button", { expanded: false }).click();
      await page.locator('a[href="/admin/models?provider=openai&add=1"]').click();
      await page.waitForURL(/\/admin\/models\?provider=openai&add=1$/);
      const form = page.getByRole("dialog", { name: "Añadir modelo propio", exact: true }).locator("form");
      await form.getByRole("button", { name: /^Proveedor del nuevo modelo: openai/ }).waitFor();
      await form.getByRole("button", { name: /^Modelo del proveedor:/ }).click();
      await page.getByRole("option", { name: /^fake-config-flow/ }).click();
      assert(await form.getByLabel("Nombre visible", { exact: true }).inputValue() === "Modelo del recorrido", "se perdió el nombre publicado por el proveedor");
      assert(!await form.getByRole("checkbox", { name: "Herramientas", exact: true }).isChecked(), "se inventó soporte de herramientas");
      await form.getByRole("button", { name: "Añadir", exact: true }).click();
      const row = page.getByRole("article", { name: "Modelo del recorrido", exact: true });
      await row.waitFor();
      const result = await (await page.request.get("/api/admin/models")).json();
      const model = result.models.find(m => m.id === "openai:fake-config-flow");
      assert(model?.context === 64000 && model.inPrice === 0.2 && model.outPrice === 0.8 && model.tools === false, "no persistieron los metadatos y capacidades del modelo");
      const admission = await page.request.post("/api/admin/agents/runs", { data: { role: "backend", modelId: model.id, prompt: "Crea un endpoint", maxSteps: 1 } });
      assert(admission.status() === 202, "el servidor rechazó un rol de construcción por no declarar herramientas");
      const { runId } = await admission.json();
      assert((await page.request.post(`/api/admin/agents/runs/${runId}/cancel`)).ok(), "no se pudo cancelar la prueba del modelo");
      for (let i = 0; i < 50; i++) {
        const run = await (await page.request.get(`/api/admin/agents/runs/${runId}`)).json();
        if (run.status !== "running") break;
        await sleep(100);
      }
      const updated = page.waitForResponse(r => r.url().endsWith("/api/admin/models/item/openai%3Afake-config-flow") && r.request().method() === "PATCH");
      await row.getByText("Detalles y opciones", { exact: true }).click();
      await row.getByRole("switch", { name: "Herramientas: Modelo del recorrido", exact: true }).click();
      assert((await updated).ok(), "no se guardó la capacidad declarada");
      await row.getByText("Listo para usar", { exact: true }).waitFor();
      await page.getByRole("checkbox", { name: "Solo utilizables", exact: true }).check();
      await row.waitFor();
      await page.setViewportSize({ width: 390, height: 844 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "la configuración IA desborda el ancho móvil");
    } finally {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.unroute("**/api/admin/providers/openai/models");
    }
  });

  await step("admin IA: activar, probar y borrar desde la nueva lista de modelos", async () => {
    await page.goto("/admin/models");
    const model = page.getByRole("article", { name: "Modelo del recorrido", exact: true });
    const toggle = model.getByRole("switch", { name: "Activar Modelo del recorrido", exact: true });
    await toggle.click();
    await model.getByText("Desactivado", { exact: false }).waitFor();
    assert(await model.getByRole("button", { name: "Probar", exact: true }).isDisabled(), "se permitió probar un modelo desactivado");
    await toggle.click();
    await model.getByText("Listo para usar", { exact: true }).waitFor();
    await page.route("**/api/admin/models/test/**", route => route.fulfill({ json: { ok: false, error: "Prueba del modelo rechazada" } }));
    try {
      await model.getByRole("button", { name: "Probar", exact: true }).click();
      await model.getByRole("alert").filter({ hasText: "Prueba del modelo rechazada" }).waitFor();
    } finally { await page.unroute("**/api/admin/models/test/**"); }
    await page.route("**/api/admin/models/test/**", route => route.fulfill({ json: { ok: true, ms: 42, usd: 0.001, toolsOk: true, text: "Listo", inputTokens: 10, outputTokens: 5 } }));
    try {
      await model.getByRole("button", { name: "Probar", exact: true }).click();
      await model.getByRole("status").filter({ hasText: "42 ms" }).waitFor();
    } finally { await page.unroute("**/api/admin/models/test/**"); }
    await model.getByText("Detalles y opciones", { exact: true }).click();
    await model.getByRole("button", { name: "Borrar", exact: true }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Cancelar", exact: true }).click();
    assert(await model.isVisible(), "se borró el modelo al cancelar");
    await model.getByRole("button", { name: "Borrar", exact: true }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Confirmar", exact: true }).click();
    await model.waitFor({ state: "hidden" });
    const catalog = await (await page.request.get("/api/admin/models")).json();
    assert(!catalog.models.some(m => m.id === "openai:fake-config-flow"), "no persistió el borrado del modelo");
  });

  await step("admin IA: permisos visibles, selección compatible y recuperación de seguimiento", async () => {
    const baseModel = { provider: "openai", model: "test", inPrice: 0, outPrice: 0, cacheReadPrice: 0, context: 128000,
      vision: false, tier: 3, speed: 3, source: "custom", enabled: true, available: true, allowed: true };
    let permitted = false;
    let failLoad = true;
    let failPoll = true;
    let starts = 0;
    await page.route("**/api/admin/models", route => {
      if (failLoad) { failLoad = false; return route.fulfill({ status: 500, json: { error: "Error de catálogo de prueba" } }); }
      return route.fulfill({ json: { models: [
        { ...baseModel, id: "openai:tools", label: "Con herramientas", tools: true, blockers: [] },
        { ...baseModel, id: "openai:text", label: "Solo texto de prueba", tools: false, blockers: permitted ? [] : ["No permitido en tu cuenta"] },
      ], openrouter: { configured: false, lastSync: null } } });
    });
    await page.route("**/api/admin/models/permit/openai%3Atext", route => {
      permitted = true;
      return route.fulfill({ json: { ok: true } });
    });
    await page.route("**/api/admin/agents/runs", async route => {
      if (route.request().method() !== "POST") return route.continue();
      starts++;
      await sleep(250);
      return route.fulfill({ status: 202, json: { runId: "config-test-run" } });
    });
    await page.route("**/api/admin/agents/runs/config-test-run", route => {
      if (failPoll) { failPoll = false; return route.fulfill({ status: 500, json: { error: "Seguimiento interrumpido" } }); }
      return route.fulfill({ json: { id: "config-test-run", status: "done", role: "chat", modelId: "openai:text", prompt: "Hola", budgetUsd: 1, events: [] } });
    });
    try {
      await page.goto("/admin/models");
      await page.getByRole("alert").filter({ hasText: "Error de catálogo de prueba" }).waitFor();
      await page.getByRole("button", { name: "Reintentar", exact: true }).click();
      const row = page.getByRole("article", { name: "Solo texto de prueba", exact: true });
      await row.getByText("No permitido en tu cuenta", { exact: true }).waitFor();
      assert(await row.getByRole("button", { name: "Probar", exact: true }).isDisabled(), "se pudo probar un modelo bloqueado por la cuenta");
      await page.getByRole("checkbox", { name: "Solo utilizables", exact: true }).check();
      await row.waitFor({ state: "hidden" });
      await page.getByRole("checkbox", { name: "Solo utilizables", exact: true }).uncheck();
      await row.getByRole("button", { name: "Permitir Solo texto de prueba en mi cuenta", exact: true }).click();
      await row.getByText("Listo para usar", { exact: true }).waitFor();
      await page.getByRole("link", { name: "Probar un agente →", exact: true }).click();
      const picker = page.getByRole("button", { name: /^Modelo del agente:/ });
      await picker.click();
      await page.getByRole("option", { name: /^Con herramientas/ }).waitFor();
      await page.getByRole("option", { name: /^Solo texto de prueba/ }).waitFor();
      await page.getByRole("combobox", { name: "Buscar en Modelo del agente" }).press("Escape");
      await page.getByRole("button", { name: /^Rol del agente:/ }).click();
      await page.getByRole("option", { name: "Chat (solo lee y responde)", exact: true }).click();
      await picker.click();
      await page.getByRole("option", { name: /^Solo texto de prueba/ }).click();
      await page.getByPlaceholder(/^Qué tiene que hacer/).fill("Hola");
      await page.getByText("Archivos iniciales (opcional)", { exact: true }).click();
      const files = page.getByPlaceholder('{ "helpers/types.ts": "export type Task = { id: number; title: string };" }');
      await files.fill('["incorrecto"]');
      await page.getByRole("button", { name: "Ejecutar", exact: true }).click();
      await page.getByRole("alert").filter({ hasText: "Los archivos iniciales deben ser JSON" }).waitFor();
      assert(starts === 0, "se envió una ejecución con archivos inválidos");
      await files.fill("{}");
      await page.getByRole("button", { name: "Ejecutar", exact: true }).click();
      await page.getByRole("alert").filter({ hasText: "Seguimiento interrumpido" }).waitFor();
      assert(await page.getByRole("button", { name: "Ejecutar", exact: true }).isDisabled(), "se permitió otra ejecución sin conocer el estado de la anterior");
      await page.getByRole("button", { name: "Reintentar seguimiento", exact: true }).click();
      await page.getByText("Terminada", { exact: true }).waitFor();
      assert(starts === 1, "reintentar seguimiento inició otra ejecución");
      assert(await page.getByRole("button", { name: "Ejecutar", exact: true }).isEnabled(), "no se liberó el formulario tras terminar");
    } finally {
      await page.unroute("**/api/admin/models");
      await page.unroute("**/api/admin/models/permit/openai%3Atext");
      await page.unroute("**/api/admin/agents/runs");
      await page.unroute("**/api/admin/agents/runs/config-test-run");
    }
  });

  await step("admin: crear, editar y borrar proveedores sin exponer cabeceras", async () => {
    await page.goto("/admin/providers");
    await page.getByRole("button", { name: "+ Añadir proveedor", exact: true }).click();
    const form = page.getByRole("dialog", { name: "Nuevo proveedor", exact: true }).locator("form");
    await form.getByRole("combobox", { name: /^Tipo/ }).selectOption("ollama");
    await form.getByLabel("Identificador", { exact: true }).fill("ux-local");
    await form.getByLabel("Nombre visible", { exact: true }).fill("Servidor local");
    await form.getByLabel("URL base", { exact: true }).fill(`http://127.0.0.1:${llm.port}/v1`);
    const createdProvider = page.waitForResponse(response => response.url().endsWith("/api/admin/providers") && response.request().method() === "POST");
    await form.getByRole("button", { name: "Añadir", exact: true }).click();
    const created = await (await createdProvider).json();
    assert(created.providers.some(p => p.id === "ux-local" && p.kind === "ollama"), "no se conservó el tipo Ollama del proveedor");
    let card = page.locator("section").filter({ has: page.locator("strong", { hasText: /^Servidor local$/ }) });
    await card.getByRole("button", { name: "Editar proveedor", exact: true }).click();
    let dialog = page.getByRole("dialog", { name: "Editar proveedor" });
    await dialog.getByLabel("Nombre visible", { exact: true }).fill("Ollama del equipo");
    await dialog.getByLabel("Reemplazar cabeceras personalizadas").check();
    await dialog.getByLabel("Cabeceras (JSON)", { exact: true }).fill('{"x-team-token":"test-private-header"}');
    await dialog.getByRole("button", { name: "Guardar cambios" }).click();
    await dialog.waitFor({ state: "hidden" });
    await page.reload();
    card = page.locator("section").filter({ has: page.locator("strong", { hasText: /^Ollama del equipo$/ }) });
    await card.getByRole("button", { expanded: false }).click();
    await card.getByText("Cabeceras configuradas: x-team-token").waitFor();
    const search = page.getByRole("searchbox", { name: "Buscar proveedores" });
    assert(await search.getAttribute("autocomplete") === "off", "la búsqueda permite autocompletar credenciales");
    for (let i = 0; i < 3; i++) {
      await search.fill("proveedor-inexistente");
      await card.waitFor({ state: "hidden" });
      await search.fill("");
      await card.waitFor({ state: "visible" });
      await card.getByText("Cabeceras configuradas: x-team-token").waitFor();
      assert(await search.inputValue() === "", "la búsqueda volvió a rellenarse al limpiarla");
    }
    assert(!await page.getByText("test-private-header", { exact: false }).count(), "se expuso el valor de una cabecera");
    await card.getByRole("button", { name: "Editar proveedor", exact: true }).click();
    dialog = page.getByRole("dialog", { name: "Editar proveedor" });
    await dialog.getByLabel("Nombre visible", { exact: true }).fill("Ollama renombrado");
    await dialog.getByRole("button", { name: "Guardar cambios" }).click();
    await dialog.waitFor({ state: "hidden" });
    card = page.locator("section").filter({ has: page.locator("strong", { hasText: /^Ollama renombrado$/ }) });
    await card.getByText("Cabeceras configuradas: x-team-token").waitFor();
    await page.route("**/api/admin/providers/ux-local", async (route) => {
      if (route.request().method() === "PATCH") await route.fulfill({ status: 400, json: { error: "Clave rechazada por la prueba" } });
      else await route.continue();
    });
    const keyInput = card.getByLabel(/^Clave de API de /);
    await keyInput.fill("test-replacement");
    await card.getByRole("button", { name: "Guardar", exact: true }).click();
    await page.getByRole("alert").filter({ hasText: "Clave rechazada" }).waitFor();
    assert(await keyInput.inputValue() === "test-replacement", "se borró la clave cuando falló el guardado");
    await page.unroute("**/api/admin/providers/ux-local");
    await card.getByRole("button", { name: "Guardar", exact: true }).click();
    await card.getByRole("button", { name: "Quitar", exact: true }).waitFor();
    await card.getByRole("button", { name: "Quitar", exact: true }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Cancelar", exact: true }).click();
    await card.getByRole("button", { name: "Quitar", exact: true }).waitFor();
    await card.getByRole("button", { name: "Quitar", exact: true }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Confirmar", exact: true }).click();
    await card.getByRole("button", { name: "Quitar", exact: true }).waitFor({ state: "hidden" });
    await card.getByRole("button", { name: "Editar proveedor", exact: true }).click();
    dialog = page.getByRole("dialog", { name: "Editar proveedor" });
    await dialog.getByLabel("Reemplazar cabeceras personalizadas").check();
    await dialog.getByLabel("Cabeceras (JSON)", { exact: true }).fill('{"bad":42}');
    await dialog.getByRole("button", { name: "Guardar cambios" }).click();
    await dialog.getByRole("alert").filter({ hasText: "Cabeceras no válidas" }).waitFor();
    await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
    await card.getByRole("button", { name: "Borrar", exact: true }).click();
    let confirmation = page.getByRole("alertdialog", { name: "Confirmar acción" });
    await page.waitForFunction(() => document.activeElement?.closest('[role="alertdialog"]') && document.activeElement?.textContent === "Cancelar");
    assert(await confirmation.getByRole("button", { name: "Cancelar", exact: true }).evaluate((el) => el === document.activeElement), "la confirmación no enfocó la opción segura");
    await confirmation.getByRole("button", { name: "Cancelar", exact: true }).click();
    await confirmation.waitFor({ state: "hidden" });
    assert(await card.isVisible(), "se borró el proveedor al cancelar");
    await page.waitForFunction(() => !document.activeElement?.closest('[role="alertdialog"]') && document.activeElement?.textContent === "Borrar");
    assert(await card.getByRole("button", { name: "Borrar", exact: true }).evaluate((el) => el === document.activeElement), "no se restauró el foco tras cancelar");
    await page.route("**/api/admin/providers/ux-local", async (route) => {
      if (route.request().method() === "DELETE") await route.fulfill({ status: 400, json: { error: "No se pudo borrar en la prueba" } });
      else await route.continue();
    });
    await card.getByRole("button", { name: "Borrar", exact: true }).click();
    confirmation = page.getByRole("alertdialog", { name: "Confirmar acción" });
    await confirmation.getByRole("button", { name: "Confirmar", exact: true }).click();
    await card.getByRole("alert").filter({ hasText: "No se pudo borrar" }).waitFor();
    assert(await card.isVisible(), "se ocultó el proveedor al fallar el borrado");
    await page.unroute("**/api/admin/providers/ux-local");
    await card.getByRole("button", { name: "Borrar", exact: true }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Confirmar", exact: true }).click();
    await card.waitFor({ state: "hidden" });
  });

  await step("admin: filtros de usuarios y errores de edición mantienen el rol protegido", async () => {
    await page.goto("/admin/users");
    const search = page.getByRole("textbox", { name: "Buscar usuarios" });
    await search.fill("usuario-inexistente");
    await page.getByText("No hay cuentas con estos filtros.", { exact: false }).waitFor();
    await page.getByRole("button", { name: "Limpiar filtros", exact: true }).click();
    await page.getByRole("button", { name: `Rol de ${ADMIN.email}: Administración`, exact: true }).click();
    await page.getByRole("option", { name: "Usuario", exact: true }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Confirmar", exact: true }).click();
    await page.getByRole("alert").waitFor();
    await page.getByRole("button", { name: `Rol de ${ADMIN.email}: Administración`, exact: true }).waitFor();
  });

  await step("admin: listas largas paginadas, creación de modelo y vista móvil", async () => {
    await page.goto("/admin/models");
    await page.getByRole("button", { name: "+ Añadir modelo propio", exact: true }).click();
    await page.getByRole("button", { name: /^Proveedor del nuevo modelo:/ }).click();
    await page.getByRole("option", { name: "openai", exact: true }).click();
    const picker = page.getByRole("button", { name: /^Modelo del proveedor:/ });
    await picker.click();
    await page.getByRole("combobox", { name: "Buscar en Modelo del proveedor" }).fill("flaky");
    await page.getByRole("combobox", { name: "Buscar en Modelo del proveedor" }).press("Enter");
    const form = page.getByRole("dialog", { name: "Añadir modelo propio", exact: true }).locator("form");
    assert(await form.getByLabel("Nombre en la API", { exact: true }).inputValue() === "fake-flaky", "el selector no rellenó el nombre API");
    await form.getByLabel("Nombre visible", { exact: true }).fill("Modelo agregado");
    await form.getByRole("button", { name: "Añadir", exact: true }).click();
    await page.getByRole("button", { name: "Editar Modelo agregado", exact: true }).waitFor();
    const response = await page.request.get("/api/admin/models");
    const catalog = await response.json();
    assert(catalog.models.some((m) => m.model === "fake-flaky" && m.label === "Modelo agregado"), "el modelo nuevo no persistió");
    await page.route("**/api/admin/models", async (route) => {
      if (route.request().method() !== "GET") return route.continue();
      await route.fulfill({ json: { ...catalog, models: Array.from({ length: 28 }, (_, i) => ({
        ...catalog.models.find((m) => m.provider === "openai"), id: `openai:page-${i}`, model: `page-${i}`, label: `Paginado ${i}`, available: true, allowed: true,
      })) } });
    });
    await page.reload();
    await page.getByRole("button", { name: "Editar Paginado 0", exact: true }).waitFor();
    assert(await page.getByRole("button", { name: /^Editar Paginado / }).count() === 25, "no se limitó la página de modelos");
    await page.getByRole("button", { name: "Siguiente", exact: true }).click();
    assert(await page.getByRole("button", { name: /^Editar Paginado / }).count() === 3, "faltan modelos de la segunda página");
    await page.getByRole("searchbox", { name: "Buscar modelo", exact: true }).fill("Paginado 0");
    await page.getByRole("button", { name: "Editar Paginado 0", exact: true }).waitFor();
    await page.unroute("**/api/admin/models");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/admin/models");
    await page.getByRole("button", { name: "Editar Modelo agregado", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Editar modelo" });
    const bounds = await dialog.boundingBox();
    assert(bounds && bounds.x >= 0 && bounds.x + bounds.width <= 391, "el editor se sale de la pantalla móvil");
    await dialog.getByRole("button", { name: /^Calidad:/ }).click();
    const list = page.getByRole("listbox", { name: "Calidad" });
    const listBounds = await list.boundingBox();
    assert(listBounds && listBounds.x >= 0 && listBounds.x + listBounds.width <= 391, "el selector se sale de la pantalla móvil");
    await list.press("Escape");
    await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
    await screenshot(page, "admin-mobile");
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  await step("login: una sesión nueva entra con correo y contraseña", async () => {
    const fresh = await resources.browser.newContext({ baseURL: base });
    fresh.setDefaultTimeout(STEP_TIMEOUT_MS);
    try {
      const p = await fresh.newPage();
      await p.goto("/");
      await p.getByRole("button", { name: "Entrar", exact: true }).waitFor();
      await p.getByLabel("Correo").fill(ADMIN.email);
      await p.getByLabel("Contraseña").fill(ADMIN.password);
      await p.getByRole("button", { name: "Entrar", exact: true }).click();
      await p.locator("aside.sidebar").waitFor();
      await p.getByRole("button", { name: "Crear proyecto" }).waitFor();
    } finally {
      await fresh.close();
    }
  });

  // Font metrics differ per platform (CI's Linux Chromium renders wider than Windows), so the
  // mobile shell is measured with the default font and with a deliberately wide one.
  const WIDE_FONT = '*, *::before, *::after { font-family: "DejaVu Sans", Verdana, "Bitstream Vera Sans", sans-serif !important; }';
  for (const [width, wide] of [[390, false], [390, true], [320, false], [320, true]]) {
    await step(`móvil: el dashboard se adapta a ${width}px${wide ? " con fuente ancha" : ""} sin desbordar y con la cuenta accesible`, async () => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/");
      await page.getByRole("button", { name: "Crear proyecto" }).waitFor();
      if (wide) await page.addStyleTag({ content: WIDE_FONT });
      const layout = await page.evaluate(() => {
        const box = (sel) => {
          const el = document.querySelector(sel);
          const r = el.getBoundingClientRect();
          return { display: getComputedStyle(el).display, left: Math.round(r.left), right: Math.round(r.right) };
        };
        return {
          sidebarDisplay: getComputedStyle(document.querySelector("aside.sidebar")).display,
          nav: box("aside.sidebar nav"),
          account: box(".account-mini"),
          accountButton: box(".account-mini button"),
          viewport: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          theme: document.documentElement.dataset.theme,
        };
      });
      console.log(`       móvil ${width}${wide ? " ancha" : ""}: ${JSON.stringify(layout)}`);
      assert(layout.sidebarDisplay === "grid", `la barra lateral móvil no usa la disposición compacta: ${layout.sidebarDisplay}`);
      assert(layout.scrollWidth <= layout.viewport + 1, `hay desbordamiento horizontal en móvil: ${JSON.stringify(layout)}`);
      assert(layout.accountButton.display !== "none" && layout.accountButton.left >= 0 && layout.accountButton.right <= layout.viewport, `el menú de cuenta no cabe en pantalla: ${JSON.stringify(layout.accountButton)}`);
      assert(layout.theme === "dark", "el tema no persistió en móvil");
      // Account, theme and logout stay reachable from the account menu.
      await page.locator(".account-mini button").first().click();
      const oscuro = page.locator('button[title="Oscuro"]');
      await oscuro.waitFor();
      const menu = await oscuro.boundingBox();
      assert(menu && menu.x >= 0 && menu.x + menu.width <= width, `el selector de tema queda fuera de pantalla: ${JSON.stringify(menu)}`);
      await oscuro.click();
      const logout = page.getByRole("button", { name: "Cerrar sesión" });
      await logout.waitFor();
      const open = await page.evaluate(() => {
        const r = document.querySelector(".popover.menu-content").getBoundingClientRect();
        return { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), scrollWidth: document.documentElement.scrollWidth, theme: document.documentElement.dataset.theme };
      });
      assert(open.left >= 0 && open.right <= width && open.top >= 0, `el menú de cuenta abierto queda fuera de pantalla: ${JSON.stringify(open)}`);
      assert(open.scrollWidth <= width + 1, `el menú de cuenta abierto desborda en horizontal: ${JSON.stringify(open)}`);
      assert(open.theme === "dark", "elegir Oscuro desde el menú móvil no aplicó el tema");
      const out = await logout.boundingBox();
      assert(out && out.x >= 0 && out.x + out.width <= width, `«Cerrar sesión» queda fuera de pantalla: ${JSON.stringify(out)}`);
      // Closing the menu by toggling its button must leave the page without overflow too.
      await page.locator(".account-mini button").first().click();
      await logout.waitFor({ state: "detached" });
      const closed = await page.evaluate(() => document.documentElement.scrollWidth);
      assert(closed <= width + 1, `desbordamiento tras cerrar el menú: ${closed}`);
    });
  }

  await step("móvil: alternar entre chat y vista previa mantiene el constructor utilizable", async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(projectUrl);
    const panes = page.getByRole("navigation", { name: "Espacio de trabajo" });
    await panes.waitFor();
    await panes.getByRole("button", { name: /Chat/ }).click();
    await page.getByLabel("Mensaje para el constructor").waitFor();
    let state = await page.locator(".ws-body").evaluate((el) => ({
      chat: el.classList.contains("mobile-chat"),
      previewHidden: getComputedStyle(el.querySelector(":scope > section")).display === "none",
      scrollWidth: document.documentElement.scrollWidth,
      overflow: [...document.querySelectorAll("body *")].filter((node) => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.right > window.innerWidth + 1;
      }).slice(0, 8).map((node) => `${node.tagName.toLowerCase()}.${String(node.className).replaceAll(" ", ".")}:${Math.round(node.getBoundingClientRect().right)}`),
    }));
    assert(state.chat && state.previewHidden, `el chat no ocupa el espacio móvil: ${JSON.stringify(state)}`);
    assert(state.scrollWidth <= 391, `el chat desborda horizontalmente: ${JSON.stringify(state)}`);
    await panes.getByRole("button", { name: /Vista previa/ }).click();
    await page.locator('iframe[title="Vista previa"]').waitFor();
    state = await page.locator(".ws-body").evaluate((el) => ({
      preview: el.classList.contains("mobile-preview"),
      chatHidden: getComputedStyle(el.querySelector(".drawer")).display === "none",
      scrollWidth: document.documentElement.scrollWidth,
      overflow: [...document.querySelectorAll("body *")].filter((node) => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.right > window.innerWidth + 1;
      }).slice(0, 8).map((node) => `${node.tagName.toLowerCase()}.${String(node.className).replaceAll(" ", ".")}:${Math.round(node.getBoundingClientRect().right)}`),
    }));
    assert(state.preview && state.chatHidden, `la vista previa no ocupa el espacio móvil: ${JSON.stringify(state)}`);
    assert(state.scrollWidth <= 391, `la vista previa desborda horizontalmente: ${JSON.stringify(state)}`);
  });

  await step("móvil: buscar herramientas permite abrir servicios fuera del primer grupo", async () => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto(projectUrl);
    await page.getByRole("button", { name: "Servicios", exact: true }).click();
    const nav = page.getByRole("navigation", { name: "Herramientas del proyecto" });
    const search = nav.getByRole("searchbox", { name: "Buscar herramientas" });
    await search.fill("suscripciones");
    const payments = nav.getByRole("button", { name: "Pagos", exact: true });
    await payments.waitFor();
    await payments.click();
    assert((await payments.getAttribute("aria-current")) === "page", "Pagos no se pudo abrir desde la navegación móvil");
    await search.fill("seguridad");
    const security = nav.getByRole("button", { name: "Seguridad", exact: true });
    await security.waitFor();
    await security.click();
    assert((await security.getAttribute("aria-current")) === "page", "Seguridad no se pudo abrir desde la navegación móvil");
    const bounds = await nav.evaluate((el) => ({ left: el.getBoundingClientRect().left, right: el.getBoundingClientRect().right, scrollWidth: document.documentElement.scrollWidth }));
    assert(bounds.left >= 0 && bounds.right <= 320 && bounds.scrollWidth <= 321, `la navegación móvil de herramientas desborda: ${JSON.stringify(bounds)}`);
  });

  await step("pwa: servidor publica manifest y worker con cabeceras revalidables", async () => {
    const worker = await page.request.get("/sw.js");
    assert(worker.ok(), "no se sirve el service worker");
    assert(worker.headers()["service-worker-allowed"] === "/", "el alcance del worker no es la raíz");
    assert(worker.headers()["cache-control"] === "no-cache", "el worker no se revalida");
    assert(/javascript/.test(worker.headers()["content-type"]), "el worker no tiene MIME JavaScript");
    const manifest = await page.request.get("/manifest.webmanifest");
    assert(manifest.ok() && /manifest|json/.test(manifest.headers()["content-type"]), "el manifest no tiene MIME correcto");
    assert(manifest.headers()["cache-control"] === "no-cache", "el manifest no se revalida");
    const icon = await page.request.get("/icons/apple-touch-icon.png");
    assert(icon.ok() && /image\/png/.test(icon.headers()["content-type"]), "falta el icono Apple PNG");
    const html = await page.request.get("/");
    assert(html.headers()["cache-control"] === "no-cache", "el HTML no se revalida");
    const asset = /\/assets\/[^"]+\.js/.exec(await html.text())?.[0];
    assert(asset, "falta el asset principal");
    const script = await page.request.get(asset);
    assert(script.headers()["cache-control"] === "public, max-age=31536000, immutable", "los assets con hash no son inmutables");
    const missing = await page.request.get("/assets/missing-build.js");
    assert(missing.status() === 404 && missing.headers()["cache-control"] === "no-cache", "un chunk inexistente se sirve como HTML cacheable");
    await page.evaluate(() => navigator.serviceWorker.ready);
    assert(await page.evaluate(() => !!navigator.serviceWorker.controller), "el worker no controla el Studio");
  });

  await step("sin errores de JavaScript en la página", async () => {
    assert(pageErrors.length === 0, `errores: ${pageErrors.join(" | ")}`);
  });

  await context.close();
}

async function cleanup() {
  await resources.browser?.close().catch(() => {});
  await stopServer(resources.server).catch(() => {});
  await new Promise((r) => (resources.llm ? resources.llm.close(() => r()) : r()));
  await resources.pgdb?.drop().catch((e) => console.error(`No se pudo borrar la base de datos de prueba: ${e.message}`));
  if (resources.data) rmSync(resources.data, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}

let fatal = null;
try {
  await main();
} catch (e) {
  fatal = e;
} finally {
  await cleanup();
}

if (fatal) console.error(`\nBLOQUEADO: ${fatal.message}`);
if (fatal || failed) console.error(`\n--- últimas líneas del servidor ---\n${serverLog.split("\n").slice(-60).join("\n")}`);
console.log(`\n${passed} pasos correctos, ${failed} fallidos${fatal ? ", ejecución bloqueada" : ""}`);
process.exit(fatal || failed ? 1 : 0);
