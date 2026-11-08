// Real Forja repository build/preview/publication against fresh platform and isolated child PostgreSQL.
// Run from the repository root: node --import tsx test\repository-docker.mjs
import assert from "node:assert/strict";
import { randomBytes, createHash } from "node:crypto";
import { once } from "node:events";
import { createServer, request as httpRequest } from "node:http";
import { Readable, pipeline } from "node:stream";
import path from "node:path";
import { mkdir, readFile, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { WebSocket } from "ws";
import { chromium } from "playwright-core";
import { freshDatabase } from "./helpers/pg.mjs";

const root = path.resolve(".");
const scratch = path.join(root, "data", "node_modules", "repository-runtime-tests", randomBytes(6).toString("hex"));
const database = await freshDatabase();
await mkdir(scratch, { recursive: true });
process.env.DATABASE_URL = database.url;
process.env.DATA_DIR = scratch;
process.env.SECRETS_KEY = randomBytes(32).toString("hex");
process.env.FORJA_SEED_FILE = "";
process.env.FORJA_REPOSITORY_RUNNER = "docker";
process.env.PUBLIC_URL = "http://localhost:4100";
const { createTestCoreModules } = await import("./helpers/coreModules.ts");
const { platformDb, closePlatformDb } = await import("../server/shared/database/index.ts");
const { createRepositoryRuntime, DockerRepositoryRunner, PostgresRepositoryStore, dockerCommand, repositoryShareToken } = await import("../server/modules/repository-runtime/index.ts");
const { configureRuntimeProjects, checkShareToken, cookie, parseAppHost, shareToken } = await import("../server/modules/app-runtime/index.ts");
const { handleAppRuntimeRequest, resolveApp } = await import("../server/bootstrap/appRuntimeHttp.ts");
const { assertSafeRepositoryPath, assertSafeRepositoryContent, repositoryPathExclusion } = await import("../contracts/repository.ts");
const { createGithubImportService, blobSha } = await import("../server/modules/integrations/github.ts");
let runtime, project, modules, releaseProjects, runner, browser, browserPage, repositoryFrame, browserShareUrl;
const gateway = createServer(async (req, res) => {
  const controller = new AbortController();
  req.once("aborted", () => controller.abort());
  res.once("close", () => { if (!res.writableEnded) controller.abort(); });
  try {
    if (browserShareUrl && req.headers.host === `localhost:${port}` && req.url === "/") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(`<html><body><iframe id="repository" style="width:1200px;height:900px" src="${browserShareUrl}"></iframe></body></html>`);
      return;
    }
    const request = new Request(`http://${req.headers.host}${req.url}`, {
      method: req.method, headers: req.headers, signal: controller.signal,
      ...(!["GET", "HEAD"].includes(req.method) ? { body: Readable.toWeb(req), duplex: "half" } : {}),
    });
    const response = await handleAppRuntimeRequest(request, runtimePorts);
    if (res.destroyed) { await response?.body?.cancel(); return; }
    const headers = response ? Object.fromEntries(response.headers) : {};
    if (response?.headers.getSetCookie().length) headers["set-cookie"] = response.headers.getSetCookie();
    res.writeHead(response?.status ?? 404, headers);
    if (response?.body) pipeline(Readable.fromWeb(response.body), res, () => {}); else res.end();
  } catch (error) {
    console.error("Repository gateway failed:", req.method, req.url, error);
    if (res.headersSent) res.destroy(error);
    else { res.writeHead(500); res.end(error.message); }
  }
});
let runtimePorts;
let port, outerHost;
const jars = new Map();
function cookiesFor(host) {
  const own = jars.get(host) ?? "";
  const parent = host !== outerHost && host.endsWith("." + outerHost) ? (jars.get(outerHost) ?? "").split("; ").find((c) => c.startsWith("forja_repository_share=")) : "";
  return [own, parent].filter(Boolean).join("; ");
}
function call(path, { host = outerHost, method = "GET", body, cookies = true } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? undefined : JSON.stringify(body);
    const request = httpRequest({
      hostname: "127.0.0.1", port, path, method, headers: {
        host, ...(cookies && cookiesFor(host) ? { cookie: cookiesFor(host) } : {}),
        ...(payload ? { "content-type": "application/json" } : {}),
      },
    }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        console.log(`HTTP ${method} ${path.split("?")[0]} -> ${response.statusCode}`);
        for (const setCookie of response.headers["set-cookie"] ?? []) {
          const value = setCookie.split(";")[0], name = value.split("=")[0];
          jars.set(host, [...(jars.get(host) ?? "").split("; ").filter((c) => c && !c.startsWith(name + "=")), value].join("; "));
        }
        const headers = new Headers();
        for (let i = 0; i < response.rawHeaders.length; i += 2) headers.append(response.rawHeaders[i], response.rawHeaders[i + 1]);
        resolve(new Response(Buffer.concat(chunks), { status: response.statusCode, headers }));
      });
    });
    request.on("error", reject);
    if (payload) request.write(payload);
    request.end();
  });
}
try {
  await platformDb(); // Applies all tracked migrations, including 014 and 015.
  modules = await createTestCoreModules();
  const ownerId = await modules.identity.createAccount("repository-owner@example.com", "Repository Owner", null, "admin");
  const source = {};
  const tracked = [...new Set(execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], { cwd: root, encoding: "utf8", shell: false }).split("\0").filter(Boolean))];
  for (const file of tracked) {
    if (repositoryPathExclusion(file) || /^(data|\.git)\//.test(file) || /^(test\/\.|\.graphify|\.test-|\.repository-)/.test(file)) continue;
    const buffer = await readFile(path.join(root, ...file.split("/")));
    const text = buffer.toString("utf8");
    source[file] = text.includes("\uFFFD") || buffer.includes(0) ? `base64:${buffer.toString("base64")}` : text;
  }
  const tree = Object.entries(source).map(([file, content]) => ({ path: file, type: "blob", mode: content.startsWith("#!") ? "100755" : "100644", sha: blobSha(content), size: content.startsWith("base64:") ? Buffer.byteLength(content.slice(7), "base64") : Buffer.byteLength(content) }));
  const githubGateway = {
    repositoryPolicy: { assertPath: assertSafeRepositoryPath, assertContent: assertSafeRepositoryContent, exclusion: repositoryPathExclusion },
    blobSha, decodeBlob: (_path, content) => content, encodeText: (content) => content, webUrl: () => "", pollMs: () => 1, schedule: () => () => {}, warn: console.warn,
    request: async (_token, method, endpoint) => {
      assert.equal(method, "GET", "Import must never push to the remote repository");
      if (endpoint.includes("/git/ref/")) return { object: { sha: "head" } };
      if (endpoint.includes("/git/commits/")) return { tree: { sha: "tree" } };
      if (endpoint.includes("/git/trees/")) return { tree, truncated: false };
      const entry = tree.find((entry) => endpoint.endsWith(entry.sha));
      assert(entry, "Missing snapshot blob");
      const content = source[entry.path];
      return { content: content.startsWith("base64:") ? content.slice(7) : Buffer.from(content).toString("base64"), encoding: "base64" };
    },
  };
  const imports = createGithubImportService(githubGateway, modules.projects, async () => ({ token: "local-snapshot", owner: "forje", repo: "forja", branch: "main", installationId: null }), async () => {});
  const prepared = await imports.prepare(ownerId, { repo: "forje/forja", runtime: "repository" });
  const files = prepared.files;
  assert(files.Dockerfile && files["package-lock.json"] && files["server/bootstrap/server.ts"]);
  assert(!Object.keys(files).some((f) => f.startsWith("graphify-out/")));
  project = await modules.projects.createProject(ownerId, "Forja Repository", "Real self-run", files, undefined, undefined, "repository");
  await imports.attach(project.id, ownerId, prepared);
  const store = new PostgresRepositoryStore();
  let unlock, locked;
  const ready = new Promise((resolve) => { locked = resolve; });
  const held = store.exclusive(project.id, async () => { locked(); await new Promise((resolve) => { unlock = resolve; }); });
  await ready;
  try { await assert.rejects(new PostgresRepositoryStore().exclusive(project.id, async () => {}), { status: 409 }); }
  finally { unlock(); await held; }
  runner = new DockerRepositoryRunner({
    enabled: true, contextRoot: path.join(scratch, "contexts"),
    environmentSecret: (id, env) => store.environmentSecret(id, env),
    command: async (args, options) => {
      console.log(`docker ${args[0]} ${args[1] ?? ""}`);
      return dockerCommand(args, { ...options, log: options?.log });
    },
  });
  const frameOrigins = [];
  runtime = createRepositoryRuntime({
    store, runner, readAllFiles: modules.projects.readAllFiles,
    recordPublish: (id, slug, snapshot, author = "owner") => modules.projects.recordPublish(id, slug, snapshot, author),
    isSlugTaken: modules.projects.isSlugTaken,
    appUrl: (slug) => `http://${slug}.localhost:${gateway.address()?.port ?? 4100}`,
    previewUrl: (id) => `http://pv-${id}.localhost:${gateway.address()?.port ?? 4100}`,
    previewFrameOrigins: frameOrigins,
  });
  releaseProjects = configureRuntimeProjects(modules.projects);
  runtimePorts = {
    getProject: modules.projects.getProject, getProjectBySlug: modules.projects.getProjectBySlug,
    parseAppHost, checkShareToken, cookie, repositoryRuntime: runtime,
    serveApp: async () => { throw new Error("Repository must never enter native serving"); },
    internalToken: "", emitProject: () => {}, reloadSettings: async () => {},
  };
  gateway.on("upgrade", async (req, socket, head) => {
    try {
      const resolved = await resolveApp(req.headers.host, new URL(req.url, `http://${req.headers.host}`), req.headers.cookie ?? null, runtimePorts);
      if (!resolved?.project || !resolved.allowed) throw new Error("Forbidden");
      await runtime.upgrade(req, socket, head, resolved.project.id, resolved.env);
    } catch { socket.destroy(); }
  });
  gateway.listen(0, "127.0.0.1");
  await once(gateway, "listening");
  port = gateway.address().port;
  outerHost = `pv-${project.id}.localhost:${port}`;
  frameOrigins.push(`http://localhost:${port}`);
  const built = await runtime.build(project.id);
  assert.deepEqual(built.config, { rootDirectory: ".", dockerfile: "Dockerfile", port: 4100, healthPath: "/healthz", postgres: true, storagePath: "/app/data" });
  const preview = await runtime.deployment(project.id, "preview");
  assert.equal((await runtime.serve(new Request("http://child/healthz"), project.id, "preview")).status, 200);
  const token = shareToken(project);
  const publicOrigin = `http://pv-${project.id}.localhost:${port}`;
  assert.equal((await call("/", { cookies: false })).status, 403);
  const granted = await call("/?share=" + encodeURIComponent(token));
  assert.equal(granted.status, 302);
  assert(granted.headers.get("set-cookie").includes("forja_repository_share="));
  const html = await call("/");
  assert.equal(html.status, 200);
  assert.equal(html.headers.has("x-frame-options"), false);
  assert(html.headers.get("content-security-policy").includes(`frame-ancestors http://localhost:${port}`));
  const document = await html.text();
  const asset = document.match(/(?:src|href)="([^"]*\/assets\/[^"]+)"/)?.[1];
  assert(asset, "Actual child Studio HTML references built assets");
  assert.equal((await call(asset)).status, 200, "Original assets load with only the HttpOnly grant, no repeated share query");
  assert.equal((await call(asset, { cookies: false })).status, 403);
  const childStatus = await (await call("/api/auth/status")).json();
  assert.equal(childStatus.needsSetup, true, "Child Forja has an independent empty database");
  const childLogs = await runner.logs(preview, project.id, "preview");
  const bootstrapToken = childLogs.match(/\[forja\]\s{3}([A-Za-z0-9_-]{16,})/)?.[1];
  assert(bootstrapToken, "Child Forja prints its independent bootstrap token");
  browser = await chromium.launch({
    executablePath: process.env.FORJA_CHROMIUM || undefined, headless: true,
    args: ["--host-resolver-rules=MAP *.localhost 127.0.0.1, MAP localhost 127.0.0.1"],
  });
  const browserContext = await browser.newContext({ viewport: { width: 1300, height: 1000 } });
  const parentSession = await modules.identity.createSession(ownerId);
  assert.equal((await modules.identity.accountFromSession(parentSession)).id, ownerId);
  await browserContext.addCookies([{ name: "forja_session", value: parentSession, domain: new URL(publicOrigin).hostname, path: "/", httpOnly: true, sameSite: "None", secure: true, partitionKey: "http://localhost" }]);
  browserPage = await browserContext.newPage();
  const frameErrors = [];
  const loadedAssets = [];
  browserPage.on("console", (message) => { if (/frame-ancestors|Refused to frame/i.test(message.text())) frameErrors.push(message.text()); });
  browserPage.on("response", (response) => { if (response.url().startsWith(publicOrigin + "/assets/") && response.status() === 200) loadedAssets.push(response.url()); });
  browserShareUrl = publicOrigin + "/?share=" + encodeURIComponent(token);
  await browserPage.goto(`http://localhost:${port}/`);
  repositoryFrame = await (await browserPage.locator("#repository").elementHandle()).contentFrame();
  await repositoryFrame.getByLabel("Token de instalación").fill(bootstrapToken);
  await repositoryFrame.getByLabel("Nombre", { exact: true }).fill("Child owner");
  await repositoryFrame.getByLabel("Correo", { exact: true }).fill("child-owner@example.com");
  await repositoryFrame.locator('input[type="password"]').fill("repository-test-long-password-123");
  await Promise.all([
    browserPage.waitForResponse((response) => response.url() === publicOrigin + "/api/auth/setup" && response.status() === 200),
    repositoryFrame.getByRole("button", { name: "Crear administración", exact: true }).click(),
  ]);
  assert.equal(await repositoryFrame.evaluate(async () => (await fetch("/api/auth/logout", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })).status), 200);
  await repositoryFrame.goto(publicOrigin + "/");
  await repositoryFrame.getByLabel("Correo", { exact: true }).fill("child-owner@example.com");
  await repositoryFrame.locator('input[type="password"]').fill("repository-test-long-password-123");
  await Promise.all([
    browserPage.waitForResponse((response) => response.url() === publicOrigin + "/api/auth/login" && response.status() === 200),
    repositoryFrame.getByRole("button", { name: "Entrar", exact: true }).click(),
  ]);
  const childIdentity = await repositoryFrame.evaluate(async () => { const response = await fetch("/api/me"); return { status: response.status, body: await response.json() }; });
  assert.equal(childIdentity.status, 200, "Iframe login session survives ordinary original-app API fetches");
  assert(JSON.stringify(childIdentity.body).includes("child-owner@example.com"));
  const browserCookies = await browserContext.cookies(publicOrigin);
  const childCookie = browserCookies.find((cookie) => cookie.name.startsWith("forja_repository_session_"));
  assert(childCookie?.httpOnly && childCookie.secure && childCookie.sameSite === "None" && childCookie.partitionKey, "Iframe child session is an HttpOnly, Secure, SameSite=None partitioned alias");
  assert.equal(browserCookies.find((cookie) => cookie.name === "forja_session")?.value, parentSession, "Child login never overwrites the valid platform session");
  jars.set(outerHost, browserCookies.map((cookie) => cookie.name + "=" + cookie.value).join("; "));
  assert(loadedAssets.length, "Real browser loaded original Studio assets through the grant boundary");
  assert.deepEqual(frameErrors, []);
  console.log("PASS Chromium parent-Studio iframe bootstrap + password login + original assets/API + isolated partitioned session alias");
  const created = await call("/api/projects", { method: "POST", body: { name: "Child native app" } });
  assert.equal(created.status, 200, await created.clone().text());
  const inside = (await created.json()).project;
  assert(inside.id && inside.previewUrl);
  const sentinel = randomBytes(16).toString("hex");
  for (const [endpoint, payload] of [
    [`/api/projects/${inside.id}/secrets`, { name: "REPOSITORY_SENTINEL", value: sentinel }],
    [`/api/projects/${inside.id}/file`, { path: "endpoints/sentinel_GET.ts", content: `export default (ctx:any) => ({matches:ctx.env.REPOSITORY_SENTINEL === ${JSON.stringify(sentinel)}});` }],
  ]) {
    const result = await repositoryFrame.evaluate(async ({ endpoint, payload }) => {
      const response = await fetch(endpoint, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      return { status: response.status, body: await response.text() };
    }, { endpoint, payload });
    assert.equal(result.status, 200, result.body);
  }
  const childUrl = new URL(inside.previewUrl);
  const childNavigation = browserPage.waitForResponse((response) => new URL(response.url()).origin === childUrl.origin);
  await repositoryFrame.evaluate((url) => {
    const iframe = document.createElement("iframe");
    iframe.id = "native-preview";
    iframe.src = url;
    document.body.append(iframe);
  }, inside.previewUrl);
  const childResponse = await childNavigation;
  assert.equal(childResponse.status(), 302, "Native child share is exchanged for its own cookie");
  const nativeFrame = await (await repositoryFrame.locator("#native-preview").elementHandle()).contentFrame();
  await nativeFrame.waitForURL((url) => url.origin === childUrl.origin && url.pathname === "/" && !url.searchParams.has("share"), { waitUntil: "domcontentloaded", timeout: 120_000 });
  assert.equal(await nativeFrame.evaluate(async () => (await fetch("/_api/sentinel")).status), 200, "Nested frame native API works without repeating child or parent shares");
  assert.equal(await nativeFrame.evaluate(async () => {
    const response = await fetch("/_api/sentinel");
    return (await response.json()).matches;
  }), true);
  await nativeFrame.evaluate(() => new Promise((resolve, reject) => {
    const socket = new WebSocket(`${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}/_baas/realtime`);
    socket.onopen = () => { socket.close(); resolve(true); };
    socket.onerror = () => reject(new Error("Nested native WebSocket handshake failed"));
  }));
  assert.deepEqual(frameErrors, [], "Both parent Studio and outer repository origins are allowed frame ancestors");
  console.log("PASS Chromium two-ancestor child native preview + original API fetch + authenticated WebSocket");
  await browser.close();
  browser = undefined;
  const socket = new WebSocket(`ws://127.0.0.1:${port}/_baas/realtime${childUrl.search}`, {
    headers: { host: childUrl.host, cookie: cookiesFor(childUrl.host) }, handshakeTimeout: 15_000,
  });
  await once(socket, "open");
  socket.terminate();
  assert.equal((await handleAppRuntimeRequest(new Request("http://unauthorized/healthz", { headers: { host: `pv-${project.id}.localhost:4100` } }), runtimePorts)).status, 403);
  const firstFiles = (await store.load(project.id)).revisions[0].files;
  await modules.projects.writeFile(project.id, "README.md", `${firstFiles["README.md"]}\nRepository test edit.\n`, "owner");
  const published = await runtime.publish(project.id, { slug: "forja-repository-test", revisionId: built.preview.id });
  assert.equal(published.published.image, built.preview.image);
  assert.equal((await modules.projects.publishedFiles(project.id))["README.md"], firstFiles["README.md"], "Publication must not include post-build edits");
  const publishedDeployment = await runtime.deployment(project.id, "published");
  assert.notEqual(preview.container, publishedDeployment.container);
  const secrets = await Promise.all(["preview", "published"].map((env) => store.environmentSecret(project.id, env)));
  assert.notEqual(secrets[0].password, secrets[1].password);
  assert.notEqual(secrets[0].key, secrets[1].key);
  assert(secrets.every((s) => /^[0-9a-f]{64}$/.test(s.key)));
  const encrypted = (await (await platformDb()).query("select encrypted_secrets from repository_runtime_secrets where project_id=$1", [project.id])).rows;
  assert(encrypted.every((row) => !row.encrypted_secrets.includes(secrets[0].password) && !row.encrypted_secrets.includes(secrets[1].password)));
  const publishedHost = `forja-repository-test.localhost:${port}`;
  const publishedToken = repositoryShareToken(project, "published", 365);
  assert.equal((await call("/api/auth/status", { host: publishedHost, cookies: false })).status, 403);
  assert.equal((await call("/?share=" + encodeURIComponent(token), { host: publishedHost, cookies: false })).status, 403, "Preview token cannot open published data");
  assert.equal((await call("/?share=" + encodeURIComponent(publishedToken), { cookies: false })).status, 403, "Published token cannot open preview data");
  assert.equal((await call("/?share=" + encodeURIComponent(publishedToken), { host: publishedHost })).status, 302);
  const publishedStatus = await (await call("/api/auth/status", { host: publishedHost })).json();
  assert.equal(publishedStatus.needsSetup, true);
  const rebuilt = await runtime.build(project.id);
  assert.notEqual(rebuilt.preview.id, built.preview.id);
  const restored = await new PostgresRepositoryStore().environmentSecret(project.id, "preview");
  assert.deepEqual(restored, secrets[0], "Restart/rebuild must reuse persisted encrypted credentials");
  const retained = await call("/api/me");
  assert.equal(retained.status, 200, "Child database/session marker survives rebuilding");
  const endpoint = new URL(inside.previewUrl);
  endpoint.pathname = "/_api/sentinel";
  const exchange = await call(endpoint.pathname + endpoint.search, { host: endpoint.host });
  assert.equal(exchange.status, 302, await exchange.clone().text());
  const decrypted = await call(endpoint.pathname, { host: endpoint.host });
  assert.equal(decrypted.status, 200, await decrypted.clone().text());
  assert.equal((await decrypted.json()).matches, true, "Child stored secret decrypts with the same key after rebuild");
  const childPreview = await call("/", { host: endpoint.host });
  assert.equal(childPreview.status, 200, await childPreview.clone().text());
  assert((await childPreview.text()).includes("<!doctype html>"), "Child Forja's native preview loads on its nested origin");
  const rolledBack = await runtime.rollback(project.id, built.preview.id);
  assert.equal(rolledBack.published.image, built.preview.image);
  await runtime.stop(project.id, "preview");
  assert.equal((await runtime.get(project.id)).preview, null);
  assert.equal((await runtime.serve(new Request("http://child/healthz"), project.id, "published")).status, 200);
  await modules.projects.revokeShareLinks(project.id);
  assert.equal((await call("/")).status, 403, "Revoking the parent project epoch invalidates the HttpOnly grant");
  console.log(`PASS real Forja Dockerfile + PostgreSQL + volume + encrypted isolated keys + share authorization + WS + immutable publication + rollback (${createHash("sha256").update(built.preview.image).digest("hex").slice(0, 12)})`);
} catch (error) {
  if (runtime && project) {
    try {
      const deployment = await runtime.deployment(project.id, "preview");
      console.error("Owned child failure state:", await dockerCommand(["inspect", "--format", "{{json .State}}", deployment.container]));
      console.error("Owned child resource usage:", await dockerCommand(["stats", "--no-stream", "--format", "{{json .}}", deployment.container]));
      console.error("Owned child database waits:", await dockerCommand(["exec", deployment.container.replace(/-app-.*/, "-postgres"), "psql", "-U", "forja", "-d", "forja", "-c", "select state,wait_event_type,wait_event from pg_stat_activity where datname='forja'"]));
      const logs = await runner.logs(deployment, project.id, "preview");
      console.error(logs.replace(/\[forja\]\s{3}[A-Za-z0-9_-]{16,}/g, "[forja] [bootstrap token redacted]").slice(-4000));
    } catch (diagnosticError) { console.error("Child diagnostics unavailable:", diagnosticError.message); }
  }
  throw error;
} finally {
  await browser?.close();
  runtime?.closeConnections();
  try {
    if (project && runtime) {
      try { await runtime.remove(project.id); }
      catch (error) {
        console.error("Runtime cleanup retry after:", error.message);
        await runner.remove(project.id, []);
      }
    }
  } finally {
    releaseProjects?.();
    if (gateway.listening) await new Promise((resolve) => gateway.close(resolve));
    modules?.identity.stop();
    await closePlatformDb();
    await database.drop();
    await rm(scratch, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  }
}
