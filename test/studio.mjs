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
    await page.getByRole("button", { name: "Enviar mensaje" }).waitFor({ state: "attached" });
    await page.getByText("Vista previa").first().waitFor();
    await page.getByText(prompt).first().waitFor();
    await page.locator('[title="Ajustes del proyecto"]').first().waitFor();
  });

  await step("constructor: las herramientas integradas son localizables y navegables", async () => {
    await page.getByRole("button", { name: "Servicios", exact: true }).click();
    const nav = page.getByRole("navigation", { name: "Herramientas del proyecto" });
    await nav.waitFor();
    await page.getByRole("heading", { name: "Todo para darle vida a tu app" }).waitFor();
    assert(await page.locator(".tool-card").count() === 14, "la vista general no muestra las 14 herramientas");
    for (const name of ["Datos", "Usuarios", "IA", "Integraciones", "Analítica", "SEO", "Docs", "Tareas", "Archivos", "Correo", "Pagos", "Registros", "Seguridad", "Código"]) {
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

  await step("admin: crear, editar y borrar proveedores sin exponer cabeceras", async () => {
    await page.goto("/admin/providers");
    await page.getByRole("button", { name: "+ Añadir proveedor", exact: true }).click();
    const form = page.locator("form").filter({ hasText: "Nuevo proveedor compatible con OpenAI" });
    await form.getByLabel("Identificador", { exact: true }).fill("ux-local");
    await form.getByLabel("Nombre visible", { exact: true }).fill("Servidor local");
    await form.getByLabel("URL base", { exact: true }).fill(`http://127.0.0.1:${llm.port}/v1`);
    await form.getByRole("button", { name: "Añadir", exact: true }).click();
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
    await card.getByText("Cabeceras configuradas: x-team-token").waitFor();
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
    await card.getByRole("button", { name: "Editar proveedor", exact: true }).click();
    dialog = page.getByRole("dialog", { name: "Editar proveedor" });
    await dialog.getByLabel("Reemplazar cabeceras personalizadas").check();
    await dialog.getByLabel("Cabeceras (JSON)", { exact: true }).fill('{"bad":42}');
    await dialog.getByRole("button", { name: "Guardar cambios" }).click();
    await dialog.getByRole("alert").filter({ hasText: "Cabeceras no válidas" }).waitFor();
    await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
    page.once("dialog", (d) => d.accept());
    await card.getByRole("button", { name: "Borrar", exact: true }).click();
    await card.waitFor({ state: "hidden" });
  });

  await step("admin: filtros de usuarios y errores de edición mantienen el rol protegido", async () => {
    await page.goto("/admin/users");
    const search = page.getByRole("textbox", { name: "Buscar usuarios" });
    await search.fill("usuario-inexistente");
    await page.getByText("No hay cuentas con estos filtros.", { exact: false }).waitFor();
    await page.getByRole("button", { name: "Limpiar filtros", exact: true }).click();
    await page.getByRole("button", { name: `Rol de ${ADMIN.email}: Administración`, exact: true }).click();
    page.once("dialog", (d) => d.accept());
    await page.getByRole("option", { name: "Usuario", exact: true }).click();
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
    const form = page.locator("form").filter({ hasText: "Modelo propio" });
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
    await page.getByRole("textbox", { name: "Buscar modelo", exact: true }).fill("Paginado 0");
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
    await page.getByRole("combobox", { name: "Buscar en Calidad" }).press("Escape");
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
        const r = document.querySelector(".account-mini .popover").getBoundingClientRect();
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
