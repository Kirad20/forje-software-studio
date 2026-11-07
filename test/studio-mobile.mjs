// Isolated responsive UI regressions against the production Studio, with local API fixtures.
// npm run build; node test/studio-mobile.mjs
import assert from "node:assert/strict";
import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", process.env.STUDIO_TEST_DIST || path.join("dist", "studio"));
const account = { id: "mobile-user", name: "Ada Mobile", email: "ada@forja.test", credits: 1000, sessions: 1, platformRole: "user" };
const project = {
  id: "mobile", name: "A project with a deliberately long mobile title", description: "", access: "owner",
  slug: null, suggestedSlug: "mobile", appUrl: null, previewUrl: "/fixture-preview", previewOrigin: "",
  seo: {}, systemPrompt: "", designPrompt: "", visibility: "public", building: false, aiEnabled: false,
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
};
const types = {
  openai: { label: "OpenAI", env: "OPENAI_API_KEY" }, anthropic: { label: "Anthropic", env: "ANTHROPIC_API_KEY" },
  postgres: { label: "PostgreSQL", env: "DATABASE_URL" }, generic: { label: "API", env: "" },
};
const fixtures = {
  "/projects": { projects: [], shared: [] }, "/folders": { folders: [] },
  "/usage": { actionsToday: 2, actionsLimit: 1000, actionsHistory: [], credits: 1000, creditsSpent: { builder: 20, app: 10 }, storageBytes: 1024 },
  "/me/security": { hasPassword: true }, "/tokens": { tokens: [] },
  "/models": { models: [], customized: false, providers: [], openrouter: { configured: false, lastSync: null, total: 0 } },
  "/integrations": { integrations: [], types },
  "/github": { connected: false, login: null, oauth: false, app: null, installations: [], canCreateRepo: false },
  "/projects/mobile": { project }, "/projects/mobile/services": {},
  "/projects/mobile/problems": { problems: [] }, "/projects/mobile/chat": { messages: [], tasks: [], building: false },
  "/projects/mobile/files": { files: [] }, "/projects/mobile/changes": { changes: [] },
  "/projects/mobile/members": { owner: account, members: [], invites: [], access: "owner" },
  "/projects/mobile/stats": { files: 0, linesOfCode: 0, creditsUsed: 0 },
  "/projects/mobile/knowledge": { revision: "fixture", indexedAt: new Date().toISOString(), fileCount: 0, nodes: [], edges: [], limitations: [] },
};
const server = http.createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, "http://localhost").pathname;
    if (pathname === "/fixture-preview") { res.writeHead(200, { "Content-Type": "text/html" }).end("<!doctype html><title>Local preview</title><h1>Preview</h1>"); return; }
    const file = path.resolve(root, `.${pathname === "/" || !path.extname(pathname) ? "/index.html" : pathname}`);
    if (!file.startsWith(`${root}${path.sep}`)) { res.writeHead(403).end(); return; }
    const mime = { ".js": "text/javascript", ".css": "text/css", ".html": "text/html", ".png": "image/png" };
    res.writeHead(200, { "Content-Type": mime[path.extname(file)] ?? "application/octet-stream" }).end(await readFile(file));
  } catch { res.writeHead(404).end(); }
});
let browser;
try {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  project.previewOrigin = `http://127.0.0.1:${server.address().port}`;
  project.previewUrl = `${project.previewOrigin}/fixture-preview`;
  browser = await chromium.launch({ executablePath: process.env.FORJA_CHROMIUM || undefined });
  const context = await browser.newContext({ baseURL: `http://127.0.0.1:${server.address().port}`, serviceWorkers: "block", isMobile: true, hasTouch: true });
  // PWA registration has its own suite; do not turn Chromium's deliberate block into a UI error notice.
  await context.addInitScript(() => { delete Navigator.prototype.serviceWorker; });
  const page = await context.newPage();
  page.setDefaultTimeout(10_000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error" && !message.text().includes("Failed to load resource")) console.error(message.text()); });
  let signedIn = false;
  let setup = true;
  await page.route("**/api/**", async (route) => {
    const key = new URL(route.request().url()).pathname.slice(4);
    let body = fixtures[key];
    if (key === "/me") body = { account: signedIn ? account : null };
    if (key === "/auth/status") body = { needsSetup: setup };
    if (key === "/auth/setup" || key === "/auth/login") { signedIn = true; setup = false; body = { ok: true }; }
    if (key === "/auth/request" || key === "/auth/password/forgot") body = { hint: "Código enviado" };
    if (key.endsWith("/events")) { await route.fulfill({ contentType: "text/event-stream", body: ": fixture\n\n" }); return; }
    await route.fulfill({ status: body ? 200 : 404, contentType: "application/json", body: JSON.stringify(body ?? { error: `Missing fixture: ${key}` }) });
  });
  const fits = async (locator, label, vertical = false) => {
    await locator.scrollIntoViewIfNeeded();
    const box = await locator.boundingBox();
    const { width, height } = page.viewportSize();
    assert(box && box.x >= -1 && box.x + box.width <= width + 1, `${label} overflows horizontally: ${JSON.stringify(box)}`);
    if (vertical) assert(box.y >= -1 && box.y + box.height <= height + 1, `${label} overflows vertically: ${JSON.stringify(box)}`);
  };
  const noOverflow = async (selector) => {
    const layout = await page.locator(selector).evaluate((el) => ({
      client: el.clientWidth, scroll: el.scrollWidth, document: document.documentElement.scrollWidth, viewport: innerWidth,
      outside: [...el.querySelectorAll("*")].filter((node) => node.getBoundingClientRect().right > el.getBoundingClientRect().right + 1)
        .slice(0, 8).map((node) => `${node.tagName}.${node.className}: ${node.textContent.slice(0, 80)}`),
    }));
    assert(layout.scroll <= layout.client + 1 && layout.document <= layout.viewport + 1, `${selector} overflow: ${JSON.stringify(layout)}`);
  };

  for (const [width, height] of [[320, 568], [375, 667], [390, 844], [568, 320]]) {
    await page.setViewportSize({ width, height });
    signedIn = false; setup = true;
    await page.goto("/");
    await page.getByText("Configura Forja").waitFor();
    await noOverflow(".login-form");
    await fits(page.getByLabel("Token de instalación"), "setup first field", true);
    await fits(page.getByRole("button", { name: "Crear administración" }), "setup submit");
    setup = false;
    await page.reload();
    await page.getByRole("button", { name: "Entrar", exact: true }).waitFor();
    for (const name of ["Entrar con código / crear cuenta", "Olvidé mi contraseña"]) {
      await fits(page.getByRole("button", { name }), name);
      await page.getByRole("button", { name }).click();
      await noOverflow(".login-form");
      await page.getByRole("button", { name: "Volver a entrar con contraseña" }).click();
    }
    await page.getByLabel("Correo").fill(account.email);
    await page.getByLabel("Contraseña").fill("mobile-password-123");
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await page.locator(".sidebar").waitFor();
    await page.getByRole("button", { name: "Menú de cuenta" }).click();
    await fits(page.locator(".menu-content"), "account menu", true);
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => document.activeElement?.getAttribute("aria-label") === "Menú de cuenta");
    assert(await page.getByRole("button", { name: "Menú de cuenta" }).evaluate((el) => el === document.activeElement), "menu did not restore focus");
    await page.locator(".sidebar").getByRole("link", { name: "Plan y uso" }).click();
    await page.locator(".plan-overview").waitFor();
    await noOverflow(".main");
    await noOverflow(".plan-overview");
    await page.locator(".sidebar").getByRole("link", { name: /Cuenta$/ }).click();
    await page.getByRole("heading", { name: "Cuenta", exact: true }).waitFor();
    await noOverflow(".main");
    await fits(page.locator(".row-setting").first().getByRole("button", { name: "Guardar", exact: true }), "profile save");
    await page.getByRole("button", { name: "Borrar cuenta", exact: true }).click();
    await fits(page.locator(".modal"), "account modal", true);
    await page.keyboard.press("Escape");
    await page.locator(".sidebar").getByRole("link", { name: /Integraciones$/ }).click();
    await noOverflow(".main");
    await page.getByRole("button", { name: /Nueva integración/ }).click();
    await fits(page.locator(".modal"), "integration modal", true);
    await noOverflow(".modal");
    await page.locator(".integration-types").getByRole("button", { name: /PostgreSQL/ }).click();
    await fits(page.locator(".modal").getByRole("button", { name: /Guardar/ }), "integration form submit");
    await noOverflow(".modal");
    await page.keyboard.press("Escape");
    await page.goto("/p/mobile");
    await page.locator(".ws-bar").waitFor();
    await noOverflow(".ws");
    await page.getByRole("button", { name: "Otros agentes", exact: true }).click();
    await fits(page.locator(".menu-content"), "agents menu", true);
    await noOverflow(".menu-content");
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Colaboradores", exact: true }).click();
    await fits(page.locator(".menu-content"), "collaborators", true);
    await page.keyboard.press("Escape");
    await page.locator(".tool-row").getByRole("button", { name: /Checkpoint/ }).click();
    await fits(page.locator(".panel-pop"), "checkpoints", true);
    await page.keyboard.press("Escape");
    await page.locator(".tool-row").getByRole("button", { name: /Escritorio/ }).click();
    await fits(page.locator(".menu-content"), "device menu in scrolling toolbar", true);
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Servicios", exact: true }).click();
    await page.getByRole("navigation", { name: "Herramientas del proyecto" }).waitFor();
    await noOverflow(".svc-detail");
    await noOverflow(".ws");
    await page.getByRole("button", { name: /Cerebro/ }).click();
    await page.locator(".knowledge").waitFor();
    await noOverflow(".knowledge");
    await page.locator(".ws-tabs").getByRole("button", { name: "Vista previa", exact: true }).click();
    await page.getByRole("navigation", { name: "Espacio de trabajo" }).getByRole("button", { name: /Chat/ }).click();
    await fits(page.getByLabel("Mensaje para el constructor"), "mobile composer");
    await noOverflow(".ws");
    console.log(`ok mobile login, navigation, plan, profile, modals, workspace and menus at ${width}x${height}`);
  }
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/plan");
  await page.locator(".plan-overview").waitFor();
  assert(await page.locator(".shell").evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length === 2), "desktop sidebar collapsed");
  assert(await page.locator(".plan-overview").evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length === 2), "desktop plan collapsed");
  await noOverflow(".main");
  await page.goto("/p/mobile");
  await page.locator(".drawer").waitFor();
  assert(await page.locator(".mobile-pane-tabs").evaluate((el) => getComputedStyle(el).display === "none"), "mobile controls visible on desktop");
  await page.getByRole("button", { name: "Colaboradores", exact: true }).click();
  await fits(page.locator(".menu-content"), "desktop collaborators", true);
  assert.deepEqual(errors, [], "Studio JavaScript errors");
  console.log("ok desktop layout and JavaScript");
} catch (error) {
  const pages = browser?.contexts().flatMap((context) => context.pages()) ?? [];
  for (const page of pages) console.error((await page.locator("body").innerText()).slice(0, 1200));
  throw error;
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
