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

  await step("móvil: el dashboard se adapta a 390px con la barra lateral en fila", async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Crear proyecto" }).waitFor();
    const layout = await page.evaluate(() => {
      const box = (sel) => {
        const el = document.querySelector(sel);
        const r = el.getBoundingClientRect();
        return { display: getComputedStyle(el).display, left: Math.round(r.left), right: Math.round(r.right) };
      };
      return {
        sidebar: getComputedStyle(document.querySelector("aside.sidebar")).flexDirection,
        nav: box("aside.sidebar nav"),
        account: box(".account-mini"),
        viewport: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        theme: document.documentElement.dataset.theme,
      };
    });
    console.log(`       móvil: ${JSON.stringify(layout)}`);
    assert(layout.sidebar === "row", `la barra lateral no está en fila: ${layout.sidebar}`);
    assert(layout.scrollWidth <= layout.viewport + 1, `hay desbordamiento horizontal en móvil: ${JSON.stringify(layout)}`);
    assert(layout.theme === "dark", "el tema no persistió en móvil");
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
