// GitHub two-way sync and the "problems" feed, against an in-memory GitHub API.
//   npm run test:github
import http from "node:http";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { startFakeGithub } from "./fakeGithub.mjs";
import { freshDatabase } from "./helpers/pg.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const gh = await startFakeGithub();
const PORT = 5200 + Math.floor(Math.random() * 400);
const DATA = mkdtempSync(path.join(tmpdir(), "forja-github-"));
const pgdb = await freshDatabase();
// Platform settings live in the database: the server applies this seed file at start-up.
const SEED = path.join(DATA, "seed.json");
writeFileSync(SEED, JSON.stringify({ settings: { "github.apiUrl": `http://127.0.0.1:${gh.port}`, "github.webhookSecret": "whsec", "github.pollMs": 3600000 } }));
let serverLog = "";
const app = spawn(process.execPath, ["--import", "tsx", "server/index.ts"], {
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
          resolve({ status: res.statusCode, json, text });
        });
      },
    );
    r.on("error", reject);
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
  ok(files.includes("components/Hello.tsx") && !files.includes("README.md") && !files.includes("package.json"), "only project paths are imported");
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
} finally {
  console.log(process.exitCode ? "\nSOME CHECKS FAILED" : "\nALL CHECKS PASSED");
  if (process.exitCode) console.log("\n--- server log ---\n" + serverLog.slice(-4000));
  app.kill();
  gh.server.close();
  setTimeout(() => {
    rmSync(DATA, { recursive: true, force: true });
    pgdb.drop().catch(() => {});
  }, 500);
}
