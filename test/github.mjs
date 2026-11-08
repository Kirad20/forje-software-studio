// GitHub two-way sync and the "problems" feed, against an in-memory GitHub API.
//   npm run test:github
import http from "node:http";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { startFakeGithub } from "./fakeGithub.mjs";
import { freshDatabase } from "./helpers/pg.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.env.PGCONNECT_TIMEOUT ||= "10";
const pgdb = await freshDatabase();
const gh = await startFakeGithub();
const PORT = 5200 + Math.floor(Math.random() * 400);
const DATA = mkdtempSync(path.join(ROOT, ".test-github-"));
// Platform settings live in the database: the server applies this seed file at start-up.
const SEED = path.join(DATA, "seed.json");
writeFileSync(SEED, JSON.stringify({ settings: { "github.apiUrl": `http://127.0.0.1:${gh.port}`, "github.webhookSecret": "whsec", "github.pollMs": 3600000 } }));
let serverLog = "";
const app = spawn(process.execPath, ["--import", "tsx", "server/bootstrap/server.ts"], {
  cwd: ROOT,
  env: {
    ...process.env,
    PORT: String(PORT),
    PUBLIC_URL: `http://localhost:${PORT}`,
    DATA_DIR: DATA,
    DATABASE_URL: pgdb.url,
    FORJA_SEED_FILE: SEED,
    SECRETS_KEY: "ef".repeat(32),
    FORJA_BOOTSTRAP_TOKEN: "e2e-bootstrap-token-0123456789",
  },
});
app.stdout.on("data", (d) => (serverLog += d));
app.stderr.on("data", (d) => (serverLog += d));

const jar = {};
function req(method, p, { host = "localhost", body, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const data = body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body);
    const r = http.request(
      {
        host: "127.0.0.1",
        port: PORT,
        method,
        path: p,
        headers: { host: `${host}:${PORT}`, ...(jar[host] ? { cookie: jar[host] } : {}), ...(data ? { "content-type": "application/json" } : {}), ...headers },
      },
      (res) => {
        let text = "";
        res.on("data", (c) => (text += c));
        res.on("end", () => {
          for (const sc of res.headers["set-cookie"] ?? []) {
            const kv = sc.split(";")[0];
            const others = (jar[host] ?? "").split("; ").filter((x) => x && !x.startsWith(kv.split("=")[0] + "="));
            jar[host] = [...others, kv].join("; ");
          }
          let json;
          try {
            json = JSON.parse(text);
          } catch {}
          resolve({ status: res.statusCode, json, text, location: res.headers.location });
        });
      },
    );
    r.on("error", reject);
    r.setTimeout(45000, () => r.destroy(new Error(`Timed out: ${method} ${p}`)));
    if (data) r.write(data);
    r.end();
  });
}
const ok = (cond, msg, extra) => {
  if (!cond) {
    console.error("FAIL:", msg, extra ?? "");
    process.exitCode = 1;
  } else console.log("ok  ", msg);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  for (let i = 0; i < 80; i++) {
    try {
      if ((await req("GET", "/healthz")).status === 200) break;
    } catch {}
    await sleep(300);
  }
  await req("POST", "/api/auth/setup", { body: { token: "e2e-bootstrap-token-0123456789", email: "owner@example.com", password: "una contraseña larga" } });
  await req("POST", "/api/auth/request", { body: { email: "owner@example.com" } });
  const code = [...serverLog.matchAll(/owner@example.com: (\d{6})/g)].pop()[1];
  await req("POST", "/api/auth/verify", { body: { email: "owner@example.com", code } });
  const project = (await req("POST", "/api/projects", { body: { prompt: "Notas" } })).json.project;
  const pid = project.id;
  const full = `${gh.login}/notas-forja`;

  // --- Account connection ---
  ok((await req("GET", "/api/github")).json.connected === false, "no GitHub connection at first");
  ok((await req("POST", "/api/github/token", { body: { token: "ghp_wrong_token_000000000000" } })).status === 400, "a token GitHub rejects is not stored");
  const conn = await req("POST", "/api/github/token", { body: { token: gh.token } });
  ok(conn.json?.login === gh.login, "valid token connects the account", conn.text);
  const status = await req("GET", "/api/github");
  ok(status.json.connected && !JSON.stringify(status.json).includes(gh.token), "status never returns the token");

  // --- Create a repository: the whole project goes up in one commit ---
  const created = await req("POST", `/api/projects/${pid}/github`, { body: { mode: "create", name: "notas-forja", private: true } });
  ok(created.status === 200 && created.json.link?.repo === "notas-forja", "repository created and linked", created.text);
  const local = (await req("GET", `/api/projects/${pid}/files`)).json.files.map((f) => f.path);
  let remote = gh.filesAt(full, "main");
  ok(local.length >= 3 && local.every((p) => p in remote) && "README.md" in remote, "every project file is in the repo (README kept)", JSON.stringify({ missing: local.filter((p) => !(p in remote)) }));

  // --- Forja → GitHub ---
  await req("PUT", `/api/projects/${pid}/file`, { body: { path: "helpers/greet.ts", content: "export const greet = (n: string) => `Hola ${n}`;\n" } });
  await sleep(6500); // edits outside a builder turn are pushed after a few quiet seconds
  remote = gh.filesAt(full, "main");
  ok(remote["helpers/greet.ts"]?.includes("Hola"), "an edit in Forja is pushed as a commit");

  // --- GitHub → Forja, with a build check and a chat card ---
  gh.pushExternal(
    full,
    "main",
    { "components/Hello.tsx": "export function Hello() { return <p>Hola</p>; }\n", "README.md": "# Cambiado fuera\n", "package.json": "{}" },
    "feat: componente Hello",
  );
  const synced = await req("POST", `/api/projects/${pid}/github/sync`, { body: {} });
  ok(synced.json?.result?.pulled?.[0]?.files?.includes("components/Hello.tsx"), "a commit pushed on GitHub comes into the project", synced.text);
  const files = (await req("GET", `/api/projects/${pid}/files`)).json.files.map((f) => f.path);
  ok(files.includes("components/Hello.tsx") && !files.includes("README.md") && files.includes("package.json"), "only project paths are imported");
  let chat = (await req("GET", `/api/projects/${pid}/chat`)).json;
  let card = chat.messages.flatMap((m) => m.content).find((b) => b.type === "github");
  ok(card?.message === "feat: componente Hello" && card.build === "ok" && card.url.includes(full), "the chat shows the commit with its build result", JSON.stringify(card));
  const changes = (await req("GET", `/api/projects/${pid}/changes`)).json.changes;
  ok(changes.some((c) => c.author === "github"), "the timeline credits GitHub");

  // --- A broken commit: card says so and the problems feed has the error ---
  gh.pushExternal(full, "main", { "pages/_index.tsx": "export default function Home() { return <div>roto</div>\n" }, "fix: oops");
  await req("POST", `/api/projects/${pid}/github/sync`, { body: {} });
  chat = (await req("GET", `/api/projects/${pid}/chat`)).json;
  card = chat.messages.flatMap((m) => m.content).filter((b) => b.type === "github").pop();
  ok(card?.build === "failed" && /_index\.tsx/.test(card.error ?? ""), "a commit that breaks the build is flagged in the chat", JSON.stringify(card));
  const problems = (await req("GET", `/api/projects/${pid}/problems`)).json.problems;
  ok(problems.some((p) => p.kind === "build" && p.file === "pages/_index.tsx"), "the build error is in the problems feed with its file", JSON.stringify(problems));

  // --- Deleted on GitHub → deleted in Forja ---
  gh.pushExternal(full, "main", { "pages/_index.tsx": "export default function Home() { return <div>ok</div>; }\n" }, "chore: quitar Hello", ["components/Hello.tsx"]);
  await req("POST", `/api/projects/${pid}/github/sync`, { body: {} });
  const after = (await req("GET", `/api/projects/${pid}/files`)).json.files.map((f) => f.path);
  ok(!after.includes("components/Hello.tsx"), "a file deleted on GitHub is deleted in the project");
  await sleep(1200);
  const clean = (await req("GET", `/api/projects/${pid}/problems`)).json.problems;
  ok(!clean.some((p) => p.kind === "build"), "build problems clear once it compiles again", JSON.stringify(clean));

  // --- Preview reports: browser errors and failed API calls become problems ---
  const pv = `pv-${pid}.localhost`;
  const share = new URL(project.previewUrl).searchParams.get("share");
  await req("GET", `/?share=${share}`, { host: pv });
  await req("POST", "/_baas/log", { host: pv, body: { level: "error", message: "NETWORK GET /_api/notes/list → 500: {\"error\":\"relation notes does not exist\"}" }, headers: { "content-type": "text/plain" } });
  await req("POST", "/_baas/log", { host: pv, body: { level: "error", message: "TypeError: Cannot read properties of undefined (reading 'map')\n    at Notes (pages/notes.tsx:12:20)" }, headers: { "content-type": "text/plain" } });
  await req("POST", "/_baas/log", { host: pv, body: { level: "error", message: "TypeError: Cannot read properties of undefined (reading 'map')\n    at Notes (pages/notes.tsx:12:20)" }, headers: { "content-type": "text/plain" } });
  const feed = (await req("GET", `/api/projects/${pid}/problems?recheck=0`)).json.problems;
  const net = feed.find((p) => p.kind === "network");
  const rt = feed.find((p) => p.kind === "runtime");
  ok(net?.status === 500 && net.title === "GET /_api/notes/list → 500" && net.detail.includes("relation notes"), "a failed API call is a problem with its status and body", JSON.stringify(net));
  ok(rt?.file === "pages/notes.tsx" && rt.line === 12 && rt.count === 2, "browser errors are deduplicated and point at file:line", JSON.stringify(rt));
  const html = await req("GET", "/", { host: pv });
  ok(html.text.includes("window.fetch="), "the preview reports failed API calls");

  // --- Webhook: signed pushes trigger a pull; unsigned ones are refused ---
  const payload = JSON.stringify({ ref: "refs/heads/main", repository: { name: "notas-forja", owner: { login: gh.login } } });
  const { createHmac } = await import("node:crypto");
  const sig = `sha256=${createHmac("sha256", "whsec").update(payload).digest("hex")}`;
  ok((await req("POST", "/api/github/webhook", { body: payload, headers: { "x-hub-signature-256": "sha256=bad" } })).status >= 400, "unsigned webhook refused");
  gh.pushExternal(full, "main", { "helpers/web.ts": "export const web = 1;\n" }, "via webhook");
  const hook = await req("POST", "/api/github/webhook", { body: payload, headers: { "x-hub-signature-256": sig } });
  ok(hook.json?.projects === 1, "signed webhook finds the linked project", hook.text);
  await sleep(1500);
  ok((await req("GET", `/api/projects/${pid}/files`)).json.files.some((f) => f.path === "helpers/web.ts"), "webhook push lands in the project");

  // --- Link an existing (empty) repository ---
  const p2 = (await req("POST", "/api/projects", { body: { prompt: "Otra" } })).json.project;
  gh.createEmptyRepo("vacio");
  const linked = await req("POST", `/api/projects/${p2.id}/github`, { body: { mode: "link", repo: `https://github.com/${gh.login}/vacio` } });
  ok(linked.status === 200 && Object.keys(gh.filesAt(`${gh.login}/vacio`, "main")).length >= 4, "linking an empty repo initializes it and pushes the project", linked.text);

  // --- Lost access ---
  await req("POST", "/api/github/token", { body: { token: gh.token } });
  const hijack = await req("POST", `/api/projects/${pid}/github`, { body: { mode: "link", repo: "nadie/no-existe" } });
  ok(hijack.status === 404, "linking a repo that does not exist fails cleanly", hijack.text);

  // --- Unlink ---
  ok((await req("DELETE", `/api/projects/${p2.id}/github`)).status === 200 && (await req("GET", `/api/projects/${p2.id}/github`)).json.link === null, "unlink");

  // --- Manifest onboarding, selected organization repositories, and pull-only import ---
  const started = await req("POST", "/api/github/app/start", { body: {} });
  ok(started.status === 200 && JSON.parse(started.json.manifest).default_permissions.contents === "write", "manifest needs no pasted credentials", started.text);
  const manifestState = new URL(started.json.url).searchParams.get("state");
  const converted = await req("GET", `/api/github/app/callback?code=fake-manifest-code&state=${encodeURIComponent(manifestState)}`);
  ok(converted.location === "/integrations?github=app-created", "manifest converts and saves the App", converted.text);
  const replay = await req("GET", `/api/github/app/callback?code=fake-manifest-code&state=${encodeURIComponent(manifestState)}`);
  ok(replay.location !== "/integrations?github=app-created", "manifest state is single-use");
  ok((await req("POST", "/api/github/app/start", { body: {} })).status === 409, "configured App cannot be replaced");
  const appStatus = (await req("GET", "/api/github")).json;
  ok(appStatus.app.id === gh.app.id && appStatus.canCreateRepo === false && !JSON.stringify(appStatus).includes(gh.app.client_secret) && !JSON.stringify(appStatus).includes("PRIVATE KEY"), "App status has no credentials and reports create limitation");
  const installStart = await req("GET", "/api/github/app/install");
  const installState = new URL(installStart.location).searchParams.get("state");
  const installed = await req("GET", `/api/github/app/install/callback?installation_id=42&state=${encodeURIComponent(installState)}`);
  ok(installed.location === "/integrations?github=connected", "installation authenticated against this account App");
  gh.createEmptyRepo("existing", "example-org");
  const existing = "example-org/existing";
  gh.pushExternal(existing, "feature/import", { "pages/_index.tsx": "export default function Home(){return <div>Imported</div>}", "base.css": "body { color: blue; }", "package.json": "{}", "migrations/001_notes.sql": "create table notes(id integer primary key);", "README.md": "# Keep me", ".github/workflows/test.yml": "name: preserve" });
  gh.repos.get(existing).default_branch = "feature/import";
  gh.selectedRepos.get(42).add(existing);
  gh.createEmptyRepo("not-selected", "example-org");
  gh.pushExternal("example-org/not-selected", "main", { "pages/_index.tsx": "export default function Home(){return <div/>}" });
  const picked = await req("GET", "/api/github/repos?page=1");
  ok(picked.json.repositories.some((r) => r.fullName === existing && r.installationId === 42) && !picked.json.repositories.some((r) => r.name === "not-selected"), "only selected organization repositories are offered", picked.text);
  const branches = await req("GET", `/api/github/branches?repo=${encodeURIComponent(existing)}&installationId=42`);
  ok(branches.json.branches.some((b) => b.name === "feature/import"), "branch picker supports slashes");
  const wrongBranch = await req("POST", "/api/github/import", { body: { repo: existing, installationId: 42, branch: "absent" } });
  ok(wrongBranch.status === 422, "missing branches rejected before project creation", wrongBranch.text);
  const unselected = await req("POST", "/api/github/import", { body: { repo: "example-org/not-selected", installationId: 42 } });
  ok(unselected.status === 403, "public/unselected repository cannot bypass installation scope", unselected.text);
  const remoteBefore = gh.filesAt(existing, "feature/import");
  const callCount = gh.calls.length;
  const imported = await req("POST", "/api/github/import", { body: { repo: existing, branch: "feature/import", installationId: 42 } });
  ok(imported.status === 200 && imported.json.result.pushed === null && imported.json.warnings.some((w) => w.includes("migraciones")), "native repository imported with migration warning", imported.text);
  ok(!gh.calls.slice(callCount).some((c) => /^(POST|PATCH|PUT) \/repos\//.test(c)) && JSON.stringify(gh.filesAt(existing, "feature/import")) === JSON.stringify(remoteBefore), "initial import never writes the source repository");
  const importedId = imported.json.project.id;
  const importedFiles = (await req("GET", `/api/projects/${importedId}/files`)).json.files.map((f) => f.path);
  ok(importedFiles.includes("migrations/001_notes.sql") && importedFiles.length === 4, "native files only, no starter files injected", importedFiles);
  const unchanged = await req("POST", `/api/projects/${importedId}/github/sync`, { body: {} });
  ok(unchanged.json.result.pushed === null, "import has a correct synced baseline", unchanged.text);
  await req("PUT", `/api/projects/${importedId}/file`, { body: { path: "helpers/edit.ts", content: "export const edit = true;" } });
  await req("POST", `/api/projects/${importedId}/github/sync`, { body: {} });
  ok(gh.filesAt(existing, "feature/import")["README.md"] === "# Keep me" && gh.filesAt(existing, "feature/import")[".github/workflows/test.yml"] === "name: preserve", "future two-way sync preserves unrelated GitHub paths");
  gh.pushExternal(existing, "feature/import", { "helpers/app-hook.ts": "export const appHook = true;" }, "App webhook");
  const appPayload = JSON.stringify({ ref: "refs/heads/feature/import", installation: { id: 42, app_id: gh.app.id }, repository: { name: "existing", owner: { login: "example-org" } } });
  const appSig = `sha256=${createHmac("sha256", gh.app.webhook_secret).update(appPayload).digest("hex")}`;
  const legacySig = `sha256=${createHmac("sha256", "whsec").update(appPayload).digest("hex")}`;
  ok((await req("POST", "/api/github/webhook", { body: appPayload, headers: { "x-hub-signature-256": legacySig } })).json.projects === 0, "legacy webhook secret cannot synchronize an App-linked project");
  const appHook = await req("POST", "/api/github/webhook", { body: appPayload, headers: { "x-hub-signature-256": appSig } });
  ok(appHook.json.projects === 1, "own App secret verifies organization push webhook", appHook.text);
  await sleep(1500);
  ok((await req("GET", `/api/projects/${importedId}/files`)).json.files.some((f) => f.path === "helpers/app-hook.ts"), "App-signed webhook pulls selected repository changes");
  gh.createEmptyRepo("unsupported", "example-org");
  gh.pushExternal("example-org/unsupported", "main", { "src/App.tsx": "export default function App(){}" });
  gh.selectedRepos.get(42).add("example-org/unsupported");
  const projectCount = (await req("GET", "/api/projects")).json.projects.length;
  const incompatible = await req("POST", "/api/github/import", { body: { repo: "example-org/unsupported", installationId: 42 } });
  ok(incompatible.status === 422 && (await req("GET", "/api/projects")).json.projects.length === projectCount, "incompatible imports fail before allocating a project", incompatible.text);
  gh.selectedRepos.get(42).delete(existing);
  const selectionPayload = JSON.stringify({ action: "removed", installation: { id: 42, app_id: gh.app.id }, repositories_removed: [{ full_name: existing }] });
  const selectionSig = `sha256=${createHmac("sha256", gh.app.webhook_secret).update(selectionPayload).digest("hex")}`;
  await req("POST", "/api/github/webhook", { body: selectionPayload, headers: { "x-hub-signature-256": selectionSig } });
  ok((await req("GET", `/api/projects/${importedId}/github`)).json.link.status === "lost_access", "selection webhook immediately flags removed repository access");
  const revoked = await req("POST", `/api/projects/${importedId}/github/sync`, { body: {} });
  ok(revoked.status >= 400 && (await req("GET", `/api/projects/${importedId}/github`)).json.link.status === "lost_access", "repository selection removal prevents further sync");
  gh.selectedRepos.get(42).add(existing);
  await req("POST", `/api/projects/${importedId}/github/sync`, { body: {} });
  const pendingInstall = await req("GET", "/api/github/app/install");
  const pendingState = new URL(pendingInstall.location).searchParams.get("state");
  const mintCount = gh.calls.filter((c) => c === "POST /app/installations/42/access_tokens").length;
  ok((await req("DELETE", "/api/github")).status === 200, "disconnect clears legacy and App access");
  const disconnected = (await req("GET", "/api/github")).json;
  ok(!disconnected.connected && disconnected.installations.length === 0 && disconnected.app.id === gh.app.id, "disconnect retains App metadata but removes registered installations");
  const afterDisconnect = await req("POST", `/api/projects/${importedId}/github/sync`, { body: {} });
  ok(afterDisconnect.status === 403 && gh.calls.filter((c) => c === "POST /app/installations/42/access_tokens").length === mintCount, "disconnected links cannot reuse cached tokens or silently mint new ones", afterDisconnect.text);
  ok((await req("POST", "/api/github/webhook", { body: appPayload, headers: { "x-hub-signature-256": appSig } })).json.projects === 0, "late App webhooks cannot restart disconnected synchronization");
  const staleInstall = await req("GET", `/api/github/app/install/callback?installation_id=42&state=${encodeURIComponent(pendingState)}`);
  ok(staleInstall.location !== "/integrations?github=connected", "disconnect invalidates pending installation consent");
  const reconnectStart = await req("GET", "/api/github/app/install");
  const reconnectState = new URL(reconnectStart.location).searchParams.get("state");
  const reconnected = await req("GET", `/api/github/app/install/callback?installation_id=42&state=${encodeURIComponent(reconnectState)}`);
  ok(reconnected.location === "/integrations?github=connected" && (await req("GET", "/api/github")).json.connected, "reconnection requires fresh explicit installation authorization");
} finally {
  console.log(process.exitCode ? "\nSOME CHECKS FAILED" : "\nALL CHECKS PASSED");
  if (process.exitCode) console.log("\n--- server log ---\n" + serverLog.slice(-4000));
  app.kill();
  await Promise.race([new Promise((resolve) => app.once("exit", resolve)), sleep(3000)]);
  await new Promise((resolve) => gh.server.close(resolve));
  try {
    rmSync(DATA, { recursive: true, force: true, maxRetries:10, retryDelay:200 });
  } finally {
    await pgdb.drop();
  }
}
