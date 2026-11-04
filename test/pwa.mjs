import assert from "node:assert/strict";
import http from "node:http";
import path from "node:path";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist", "studio");
const worker = readFileSync(path.join(root, "sw.js"), "utf8");
let version = 1;
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json" };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  res.setHeader("cache-control", "no-cache");
  if (url.pathname.startsWith("/api/")) {
    res.writeHead(401, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "No has iniciado sesión", private: "not-for-offline-cache" }));
    return;
  }
  if (url.pathname === "/sw.js") {
    res.writeHead(200, { "content-type": "text/javascript", "service-worker-allowed": "/" });
    res.end(worker.replace(/forja-studio-([a-f0-9]+)/, `forja-studio-test-${version}`));
    return;
  }
  const file = path.resolve(root, `.${decodeURIComponent(url.pathname)}`);
  if (file !== root && !file.startsWith(`${root}${path.sep}`)) { res.writeHead(403); res.end(); return; }
  try {
    const selected = path.extname(file) ? file : path.join(root, "index.html");
    res.writeHead(200, { "content-type": types[path.extname(selected)] ?? "application/octet-stream" });
    res.end(readFileSync(selected));
  } catch { res.writeHead(404); res.end("Not found"); }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({ executablePath: process.env.FORJA_CHROMIUM || undefined });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(20_000);
  await page.goto(base);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  const manifestResponse = await page.request.get(`${base}/manifest.webmanifest`);
  assert.match(manifestResponse.headers()["content-type"], /manifest/);
  const manifest = await manifestResponse.json();
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.scope, "/");
  const cdp = await context.newCDPSession(page);
  const appManifest = await cdp.send("Page.getAppManifest");
  assert.equal(appManifest.errors.length, 0, JSON.stringify(appManifest.errors));
  for (const icon of manifest.icons) {
    const dimensions = await page.evaluate(async (src) => {
      const image = new Image();
      image.src = src;
      await image.decode();
      return `${image.naturalWidth}x${image.naturalHeight}`;
    }, icon.src);
    assert.equal(dimensions, icon.sizes);
  }
  assert(manifest.icons.some((icon) => icon.purpose === "maskable"));
  const installability = await cdp.send("Page.getInstallabilityErrors");
  assert.equal(installability.installabilityErrors.length, 0, JSON.stringify(installability.installabilityErrors));
  console.log("ok manifest, iconos PNG e instalabilidad Chromium");
  await page.evaluate(() => {
    const event = new Event("beforeinstallprompt", { cancelable: true });
    Object.assign(event, {
      prompt: async () => { window.installRequested = true; },
      userChoice: Promise.resolve({ outcome: "accepted" }),
    });
    window.dispatchEvent(event);
  });
  await page.getByRole("button", { name: "Instalar Forja", exact: true }).click();
  assert(await page.evaluate(() => window.installRequested), "no se pidió la instalación desde el botón");
  await page.evaluate(() => window.dispatchEvent(new Event("appinstalled")));
  assert(!await page.getByRole("button", { name: "Instalar Forja", exact: true }).count());
  const apple = await browser.newContext({ userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1", viewport: { width: 390, height: 844 } });
  const iosPage = await apple.newPage();
  await iosPage.goto(base);
  await iosPage.getByRole("button", { name: "Instalar Forja", exact: true }).click();
  await iosPage.getByRole("status").filter({ hasText: "Añadir a pantalla de inicio" }).waitFor();
  await iosPage.getByRole("button", { name: "Cerrar ayuda" }).click();
  await apple.close();
  console.log("ok acción de instalación e instrucciones iOS");

  await page.evaluate(async () => {
    await fetch("/api/private");
    await fetch("/api/private", { method: "POST" });
  });
  const cached = await page.evaluate(async () => (await Promise.all((await caches.keys()).map(async (key) =>
    (await (await caches.open(key)).keys()).map((request) => new URL(request.url).pathname)))).flat());
  assert(cached.includes("/offline.html"));
  assert(!cached.some((url) => url.startsWith("/api") || url === "/" || url === "/index.html"), JSON.stringify(cached));
  await context.setOffline(true);
  const asset = readdirSync(path.join(root, "assets")).find((file) => file.endsWith(".js"));
  assert(await page.evaluate(async (url) => (await fetch(url)).ok, `/assets/${asset}`));
  assert(await page.evaluate(async () => {
    try { await fetch("/api/private"); return false; } catch { return true; }
  }), "la API privada respondió desde caché");
  const excluded = await context.newPage();
  await assert.rejects(excluded.goto(`${base}/preview-private-app`));
  await excluded.close();
  await page.getByRole("status").filter({ hasText: "Sin conexión." }).waitFor();
  await page.goto(`${base}/admin/models?private=never-cache`);
  await page.getByRole("heading", { name: "Estás sin conexión" }).waitFor();
  assert(!await page.getByText("not-for-offline-cache").count());
  await context.setOffline(false);
  await page.getByRole("link", { name: "Reintentar conexión" }).click();
  await page.waitForFunction(() => !!document.querySelector("#root"));
  console.log("ok navegación offline, recursos públicos y exclusión de datos privados");

  const tab = await context.newPage();
  await tab.goto(base);
  await tab.waitForFunction(() => !!navigator.serviceWorker.controller);
  version = 2;
  await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
  const update = page.getByRole("button", { name: "Actualizar Forja", exact: true });
  await update.waitFor();
  assert.equal(new URL(page.url()).pathname, "/admin/models", "la actualización recargó la pestaña automáticamente");
  await page.evaluate(() => { window.pwaNoAutoReload = true; });
  page.once("dialog", (dialog) => dialog.dismiss());
  await update.click();
  assert(await page.evaluate(() => window.pwaNoAutoReload));
  page.once("dialog", (dialog) => dialog.accept());
  await Promise.all([page.waitForNavigation({ waitUntil: "load" }), update.click()]);
  await page.waitForFunction(() => !window.pwaNoAutoReload);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await tab.getByRole("button", { name: "Actualizar Forja", exact: true }).waitFor();
  assert.equal(await tab.evaluate(() => location.pathname), "/");
  version = 3;
  await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
  await page.getByRole("button", { name: "Actualizar Forja", exact: true }).waitFor();
  page.once("dialog", (dialog) => dialog.accept());
  await Promise.all([
    page.waitForNavigation({ waitUntil: "load" }),
    page.getByRole("button", { name: "Actualizar Forja", exact: true }).click(),
  ]);
  await page.waitForFunction(async () => {
    const keys = await caches.keys();
    return keys.includes("forja-studio-test-3") && !keys.includes("forja-studio-test-1");
  });
  assert.equal((await page.evaluate(() => caches.keys())).filter((key) => key.startsWith("forja-studio-")).length, 2);
  console.log("ok actualizaciones explícitas, otras pestañas intactas y limpieza de versiones");
  await context.close();
  const outdated = await browser.newContext({ serviceWorkers: "block" });
  const stale = await outdated.newPage();
  await stale.route("**/api/me", (route) => route.fulfill({ json: {
    account: { id: "pwa-test", email: "pwa@example.test", name: "PWA", platformRole: "admin", credits: 0 },
  } }));
  await stale.route("**/assets/administration-*.js", (route) => route.fulfill({ status: 404, body: "Old chunk removed" }));
  await stale.goto(`${base}/admin`);
  await stale.getByRole("heading", { name: "No se pudo cargar esta pantalla" }).waitFor();
  await stale.getByRole("button", { name: "Actualizar Forja", exact: true }).waitFor();
  await stale.unroute("**/assets/administration-*.js");
  stale.once("dialog", (dialog) => dialog.accept());
  await stale.getByRole("button", { name: "Recargar aplicación" }).click();
  await stale.getByRole("heading", { name: "Administración", exact: true }).waitFor();
  await outdated.close();
  console.log("ok recuperación explícita cuando un despliegue retira un chunk antiguo");
} finally {
  await browser?.close();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}
