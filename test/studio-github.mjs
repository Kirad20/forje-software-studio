// Browser regressions for GitHub onboarding and repository selection, using only local fixtures.
import assert from "node:assert/strict";
import http from "node:http";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist", "studio");
const me = { id: "github-user", name: "GitHub User", email: "github@example.test", platformRole: "user", credits: 0, sessions: 1 };
const app = { id: 1, name: "Forja Test", slug: "forja-test", owner: "octo" };
const repoA = { id: 11, name: "native-a", fullName: "octo/native-a", owner: "octo", private: false, description: null, defaultBranch: "main", installationId: 22 };
const repoB = { id: 12, name: "native-b", fullName: "team/native-b", owner: "team", private: true, description: null, defaultBranch: "develop", installationId: 23 };
let status = { connected: false, login: null, oauth: false, app: null, installations: [], canCreateRepo: false };
let manifestPosted = null;
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/fixture/register" && req.method === "POST") {
    let body = "";
    for await (const chunk of req) body += chunk;
    manifestPosted = JSON.parse(new URLSearchParams(body).get("manifest"));
    status = { ...status, app };
    res.writeHead(200, { "content-type": "text/html" }).end('<h1>GitHub App</h1><a href="/integrations?github=app-created">Confirmar app</a>');
    return;
  }
  if (url.pathname === "/fixture/install") {
    status = { ...status, connected: true, login: "octo", installations: [{ id: 22, login: "octo" }, { id: 23, login: "team" }] };
    res.writeHead(200, { "content-type": "text/html" }).end('<h1>Seleccionar repositorios</h1><a href="/integrations?github=connected">Autorizar seleccionados</a>');
    return;
  }
  const selected = path.extname(url.pathname) ? url.pathname : "/index.html";
  const file = path.resolve(root, `.${selected}`);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  try {
    const type = { ".js": "text/javascript", ".css": "text/css", ".html": "text/html", ".png": "image/png" }[path.extname(file)];
    res.writeHead(200, { "content-type": type ?? "application/octet-stream" }).end(await readFile(file));
  } catch { res.writeHead(404).end(); }
});
let browser;
try {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ executablePath: process.env.FORJA_CHROMIUM || undefined });
  const context = await browser.newContext({ baseURL: base, serviceWorkers: "block", viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => { delete Navigator.prototype.serviceWorker; });
  const page = await context.newPage();
  page.setDefaultTimeout(10_000);
  const errors = [];
  const calls = [];
  page.on("pageerror", (error) => errors.push(error.message));
  let failRepos = false;
  let failBranches = false;
  let importCompatible = false;
  let slowBranches = false;
  const imported = {
    id: "imported", name: "Imported app", description: "", slug: null, suggestedSlug: "imported", appUrl: null,
    previewUrl: base + "/fixture-preview", previewOrigin: base, seo: {}, systemPrompt: "", designPrompt: "",
    visibility: "public", building: false, aiEnabled: false, access: "owner",
  };
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const key = url.pathname.slice(4);
    calls.push({ method: request.method(), key, body: request.postDataJSON(), query: url.search });
    let body;
    let code = 200;
    if (key === "/me") body = { account: me };
    else if (key === "/projects") body = { projects: [], shared: [] };
    else if (key === "/folders") body = { folders: [] };
    else if (key === "/integrations") body = { integrations: [], types: {} };
    else if (key === "/github") body = status;
    else if (key === "/github/app/start") body = { url: base + "/fixture/register?state=fixture", manifest: JSON.stringify({ name: "Forja Test", default_permissions: { contents: "write" }, redirect_url: base + "/api/github/app/callback" }) };
    else if (key === "/github/app/install") { await route.fulfill({ status: 302, headers: { location: base + "/fixture/install" } }); return; }
    else if (key === "/github/repos") {
      if (failRepos) { code = 403; body = { error: "La instalación perdió el acceso. Selecciona repositorios de nuevo." }; }
      else body = url.searchParams.get("page") === "2" ? { repositories: [repoB], nextPage: null } : { repositories: [repoA], nextPage: 2 };
    } else if (key === "/github/branches") {
      if (failBranches) { code = 403; body = { error: "No se pudieron cargar las ramas autorizadas." }; }
      else if (url.searchParams.get("repo") === repoA.fullName) {
        if (slowBranches) await new Promise((resolve) => setTimeout(resolve, 400));
        body = { branches: [{ name: "main" }, { name: "stale-a" }], nextPage: null };
      } else body = url.searchParams.get("page") === "2"
        ? { branches: [{ name: "feature/slash" }], nextPage: null }
        : { branches: [{ name: "develop" }], nextPage: 2 };
    } else if (key === "/github/import") {
      if (!importCompatible) { code = 422; body = { error: "Este repositorio no tiene páginas compatibles con Forja. No se modificó GitHub." }; }
      else body = { project: imported, warnings: ["Revisa las variables de entorno antes de ejecutar la app."] };
    } else if (key === "/projects/imported") body = { project: imported };
    else if (key.endsWith("/events")) { await route.fulfill({ contentType: "text/event-stream", body: ": fixture\n\n" }); return; }
    else if (key.endsWith("/chat")) body = { messages: [], tasks: [], building: false };
    else if (key.endsWith("/files")) body = { files: [] };
    else if (key.endsWith("/problems")) body = { problems: [] };
    else if (key.endsWith("/changes")) body = { changes: [] };
    else { code = 404; body = { error: `Missing fixture: ${key}` }; }
    await route.fulfill({ status: code, contentType: "application/json", body: JSON.stringify(body) });
  });
  const fits = async () => {
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "GitHub flow overflowed the mobile viewport");
  };
  await page.goto("/");
  await page.getByRole("button", { name: "Importar desde GitHub", exact: true }).click();
  await page.getByRole("button", { name: "Crear GitHub App y conectar" }).waitFor();
  assert.equal(await page.locator('input[type="password"]').count(), 0, "onboarding asks for a manual token");
  await fits();
  await page.getByRole("button", { name: "Crear GitHub App y conectar" }).click();
  await page.getByRole("link", { name: "Confirmar app" }).waitFor();
  assert.equal(manifestPosted.default_permissions.contents, "write");
  assert(!Object.keys(manifestPosted).some((key) => /secret|private_key|token/.test(key)));
  await page.getByRole("link", { name: "Confirmar app" }).click();
  await page.getByRole("link", { name: "Seleccionar repositorios en GitHub" }).click();
  await page.getByRole("link", { name: "Autorizar seleccionados" }).click();
  await page.getByLabel("Repositorio autorizado").waitFor();
  await page.getByRole("button", { name: "Cargar más repositorios" }).click();
  await page.getByLabel("Repositorio autorizado").selectOption("23:team/native-b");
  await page.getByRole("button", { name: "Cargar más ramas" }).click();
  await page.getByLabel("Rama", { exact: true }).selectOption("feature/slash");
  await fits();
  await page.getByRole("button", { name: "Importar y abrir proyecto" }).click();
  await page.getByRole("alert").filter({ hasText: "No se modificó GitHub" }).waitFor();
  assert.equal(new URL(page.url()).pathname, "/integrations");
  assert.deepEqual(calls.findLast((call) => call.key === "/github/import").body, { repo: "team/native-b", branch: "feature/slash", installationId: 23 });
  importCompatible = true;
  await page.getByRole("button", { name: "Importar y abrir proyecto" }).click();
  await page.getByText("Proyecto importado con observaciones").waitFor();
  await page.getByText("Revisa las variables de entorno antes de ejecutar la app.").waitFor();
  assert.equal(await page.getByRole("button", { name: "Importar y abrir proyecto" }).count(), 0, "warning screen can duplicate the imported project");
  await page.getByRole("button", { name: "Abrir proyecto importado" }).click();
  await page.waitForURL("**/p/imported");
  console.log("ok manifest form, selected repositories, paginated branches, safe import errors and warnings");

  failRepos = true;
  await page.goto("/integrations");
  await page.getByRole("alert").filter({ hasText: "perdió el acceso" }).waitFor();
  failRepos = false;
  await page.getByRole("button", { name: "Reintentar repositorios" }).click();
  await page.getByRole("button", { name: "Cargar más repositorios" }).click();
  failBranches = true;
  await page.getByLabel("Repositorio autorizado").selectOption("22:octo/native-a");
  await page.getByRole("button", { name: "Reintentar ramas" }).waitFor();
  assert(await page.getByRole("button", { name: "Importar y abrir proyecto" }).isDisabled());
  failBranches = false;
  await page.getByRole("button", { name: "Reintentar ramas" }).click();
  await page.waitForFunction(() => ![...document.querySelectorAll("button")].find((button) => button.textContent === "Importar y abrir proyecto")?.disabled);
  await page.getByLabel("Repositorio autorizado").selectOption("");
  slowBranches = true;
  await page.getByLabel("Repositorio autorizado").selectOption("22:octo/native-a");
  await page.getByLabel("Repositorio autorizado").selectOption("23:team/native-b");
  await page.getByRole("button", { name: "Cargar más ramas" }).waitFor();
  await page.waitForTimeout(500);
  assert.equal(await page.getByLabel("Rama", { exact: true }).inputValue(), "develop");
  assert.equal(await page.getByLabel("Rama", { exact: true }).locator("option").filter({ hasText: "stale-a" }).count(), 0);
  await page.setViewportSize({ width: 320, height: 568 });
  await fits();
  await page.setViewportSize({ width: 1440, height: 900 });
  await fits();
  assert.deepEqual(errors, []);
  console.log("ok revoked access retry, stale branch response, narrow mobile and desktop");
  await context.close();
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
