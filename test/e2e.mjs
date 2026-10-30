// End-to-end test of the Forja server without an LLM: studio API, every BaaS service,
// preview, publish, realtime and MCP. Boots its own server on a throwaway data dir.
//   npm run test:e2e
import http from "node:http";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocket } from "ws";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 4300 + Math.floor(Math.random() * 500);
const DATA = mkdtempSync(path.join(tmpdir(), "forja-e2e-"));
let serverLog = "";
const server = spawn(process.execPath, ["--import", "tsx", "server/index.ts"], {
  cwd: ROOT,
  env: { ...process.env, PORT: String(PORT), PUBLIC_URL: `http://localhost:${PORT}`, DATA_DIR: DATA, SECRETS_KEY: "ab".repeat(32), SMTP_URL: "" },
});
server.stdout.on("data", (d) => (serverLog += d));
server.stderr.on("data", (d) => (serverLog += d));
const finish = () => {
  server.kill();
  setTimeout(() => rmSync(DATA, { recursive: true, force: true }), 500);
};
const jar = {}; // host -> cookie string

function req(method, path, { host = "localhost", body, headers = {}, raw = false } = {}) {
  return new Promise((resolve, reject) => {
    const data = body === undefined ? undefined : typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body);
    const r = http.request(
      { host: "127.0.0.1", port: PORT, method, path, headers: { host: `${host}:${PORT}`, ...(jar[host] ? { cookie: jar[host] } : {}), ...(data && !headers["content-type"] ? { "content-type": "application/json" } : {}), ...headers } },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          for (const sc of res.headers["set-cookie"] ?? []) {
            const kv = sc.split(";")[0];
            const name = kv.split("=")[0];
            const others = (jar[host] ?? "").split("; ").filter((x) => x && !x.startsWith(name + "="));
            jar[host] = [...others, kv].join("; ");
          }
          const text = Buffer.concat(chunks).toString();
          let json;
          try { json = JSON.parse(text); } catch {}
          resolve({ status: res.statusCode, headers: res.headers, text, json });
        });
      },
    );
    r.on("error", reject);
    if (data) r.write(data);
    r.end();
  });
}

const ok = (cond, msg, extra) => {
  if (!cond) { console.error("FAIL:", msg, extra ?? ""); process.exitCode = 1; } else console.log("ok  ", msg);
};

for (let i = 0; i < 60; i++) {
  try { if ((await req("GET", "/healthz")).status === 200) break; } catch {}
  await new Promise((r) => setTimeout(r, 500));
}

// Studio sign-in
await req("POST", "/api/auth/request", { body: { email: "owner@example.com" } });
const code = [...serverLog.matchAll(/owner@example.com: (\d{6})/g)].pop()[1];
ok((await req("POST", "/api/auth/verify", { body: { email: "owner@example.com", code } })).status === 200, "studio login");
const me = await req("GET", "/api/me");
ok(me.json?.account?.credits > 0, "account has credits", me.text);

// Project
const created = await req("POST", "/api/projects", { body: { prompt: "Lista de tareas con equipo" } });
const project = created.json.project;
ok(project?.id && /^[0-9a-f]{16}$/.test(project.id), "project created", created.text);
const pv = `pv-${project.id}.localhost`;
const share = new URL(project.previewUrl).searchParams.get("share");

// Schema + code (what the builder would write)
const sql = await req("POST", `/api/projects/${project.id}/db/sql`, { body: { sql: `create table todos (id serial primary key, user_id text references _forja_users(id), title text not null, done boolean not null default false, created_at timestamptz not null default now());` } });
ok(sql.status === 200, "create table", sql.text);
const files = {
  "endpoints/todos/list_GET.ts": `export default async function (ctx: any) {\n  const user = ctx.requireUser();\n  return { todos: await ctx.db.query("select * from todos where user_id = $1 order by id", [user.id]) };\n}\n`,
  "endpoints/todos/create_POST.ts": `import { z } from "zod";\nconst Input = z.object({ title: z.string().min(1) });\nexport default async function (ctx: any) {\n  const user = ctx.requireUser();\n  const { title } = Input.parse(ctx.body);\n  const todo = await ctx.db.one("insert into todos (user_id, title) values ($1, $2) returning *", [user.id, title]);\n  ctx.realtime.publish("todos", todo);\n  await ctx.jobs.run("notify", { title });\n  return { todo };\n}\n`,
  "jobs/notify.ts": `export const schedule = "0 8 * * *";\nexport default async function (ctx: any) {\n  await ctx.email.send({ to: "someone@else.com", subject: "Nueva tarea", html: "<p>" + (ctx.payload?.title ?? "resumen") + "</p>" });\n}\n`,
  "pages/_index.tsx": `import { useApi, useUser, Link } from "@forja/client";\nimport { Card } from "~/components/Card";\nexport default function Home() {\n  const user = useUser();\n  const { data } = useApi<{ todos: any[] }>(user ? "todos/list" : null);\n  return <Card title="Tareas">{user ? data?.todos.length : <Link to="/login">Entrar</Link>}</Card>;\n}\n`,
  "pages/posts.$id.tsx": `import { useRoute } from "@forja/client";\nexport default function Post() { const { params } = useRoute(); return <p>Post {params.id}</p>; }\n`,
  "components/Card.tsx": `import styles from "./Card.module.css";\nexport function Card(p: { title: string; children: any }) { return <section className={styles.card}><h2>{p.title}</h2>{p.children}</section>; }\n`,
  "components/Card.module.css": `.card { padding: 16px; border-radius: 12px; }\n`,
};
for (const [path, content] of Object.entries(files)) {
  const r = await req("PUT", `/api/projects/${project.id}/file`, { body: { path, content } });
  ok(r.status === 200, `write ${path}`, r.text);
}
const bad = await req("PUT", `/api/projects/${project.id}/file`, { body: { path: "../etc/passwd", content: "x" } });
ok(bad.status >= 400, "rejects path outside project");

// Preview gate + share token exchange
ok((await req("GET", "/", { host: pv })).status === 403, "preview requires share token");
const ex = await req("GET", `/?share=${share}`, { host: pv });
ok(ex.status === 302 && jar[pv]?.includes("forja_share"), "share token → cookie");
// The preview is framed by the studio on another site, so its cookies must be partitioned.
ok(/SameSite=None; Secure; Partitioned/.test(ex.headers["set-cookie"]?.[0] ?? ""), "preview cookie is partitioned");
const html = await req("GET", "/", { host: pv });
ok(html.status === 200 && html.text.includes('id="root"'), "preview html builds", html.text.slice(0, 400));
const js = await req("GET", "/_forja/app.js", { host: pv });
ok(js.status === 200 && js.text.includes("/posts/:id") && js.text.length > 10000, "client bundle with routes", js.text.slice(0, 300));
const css = await req("GET", "/_forja/app.css", { host: pv });
ok(css.text.includes("card"), "css modules bundled");

// App auth + endpoints
ok((await req("GET", "/_api/todos/list", { host: pv })).status === 401, "endpoint requires user");
const su = await req("POST", "/_baas/auth/signup", { host: pv, body: { email: "ana@example.com", password: "secreto123", name: "Ana" } });
ok(su.status === 200 && su.json.user.email === "ana@example.com", "app signup", su.text);
// Realtime: subscribe before creating, and expect the endpoint's publish.
const ws = new WebSocket(`ws://127.0.0.1:${PORT}/_baas/realtime`, { headers: { host: `${pv}:${PORT}`, cookie: jar[pv] } });
const got = new Promise((resolve) => {
  ws.on("message", (m) => resolve(JSON.parse(String(m))));
  setTimeout(() => resolve(null), 5000);
});
await new Promise((r) => ws.on("open", r));
ws.send(JSON.stringify({ type: "subscribe", channel: "todos" }));
await new Promise((r) => setTimeout(r, 100));
const cr = await req("POST", "/_api/todos/create", { host: pv, body: { title: "Comprar pan" } });
const rt = await got;
ok(rt?.channel === "todos" && rt.data.title === "Comprar pan", "realtime publish reaches subscriber", JSON.stringify(rt));
ws.close();
ok(cr.status === 200 && cr.json.todo.title === "Comprar pan", "create todo", cr.text);
const ls = await req("GET", "/_api/todos/list", { host: pv });
ok(ls.json?.todos?.length === 1, "list todos", ls.text);
const inv = await req("POST", "/_api/todos/create", { host: pv, body: { title: "" } });
ok(inv.status === 500 || inv.status === 400, "zod validation rejects", inv.text);
await req("POST", "/_baas/auth/logout", { host: pv, body: {} });
const badLogin = await req("POST", "/_baas/auth/login", { host: pv, body: { email: "ana@example.com", password: "mal" } });
ok(badLogin.status === 401, "wrong password rejected");
await req("POST", "/_baas/auth/login", { host: pv, body: { email: "ana@example.com", password: "secreto123" } });
ok((await req("GET", "/_baas/auth/me", { host: pv })).json?.user?.email === "ana@example.com", "login + me");

// Storage
const boundary = "XBOUNDARY";
const mp = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="hola.txt"\r\nContent-Type: text/plain\r\n\r\nhola mundo\r\n--${boundary}--\r\n`);
const up = await req("POST", "/_baas/storage/upload", { host: pv, body: mp, headers: { "content-type": `multipart/form-data; boundary=${boundary}` } });
ok(up.status === 200 && up.json.key, "storage upload", up.text);
const dl = await req("GET", up.json.url, { host: pv });
ok(dl.text === "hola mundo", "storage download");
const evil = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="x.html"\r\nContent-Type: text/html\r\n\r\n<script>alert(1)</script>\r\n--${boundary}--\r\n`);
const evilUp = await req("POST", "/_baas/storage/upload", { host: pv, body: evil, headers: { "content-type": `multipart/form-data; boundary=${boundary}` } });
const evilDl = await req("GET", evilUp.json.url, { host: pv });
ok(
  evilDl.headers["content-type"] === "application/octet-stream" && /attachment/.test(evilDl.headers["content-disposition"]) && /sandbox/.test(evilDl.headers["content-security-policy"]),
  "uploaded HTML is sandboxed and downloaded, never rendered",
  JSON.stringify(evilDl.headers),
);

// Studio CSRF defence and headers
const foreign = await req("POST", "/api/projects", { body: { prompt: "x" }, headers: { origin: "https://evil.example" } });
ok(foreign.status === 403, "studio rejects writes from foreign origins");
const formPost = await req("POST", "/api/projects", { body: "prompt=x", headers: { "content-type": "application/x-www-form-urlencoded" } });
ok(formPost.status === 415, "studio rejects non-JSON writes");
const studioHome = await req("GET", "/api/me");
ok(studioHome.headers["x-frame-options"] === "DENY", "studio cannot be framed");
ok(/frame-ancestors http:\/\/localhost/.test(html.headers["content-security-policy"] ?? ""), "preview can only be framed by the studio", html.headers["content-security-policy"]);

// Background job → email redirected to owner (no verified domain)
await new Promise((r) => setTimeout(r, 1500));
const emails = await req("GET", `/api/projects/${project.id}/emails`);
const e0 = emails.json.emails[0];
ok(e0 && e0.to === "owner@example.com" && e0.intendedTo === "someone@else.com", "job ran; email sandboxed to owner", emails.text.slice(0, 300));

// Password reset code flow
await req("POST", "/_baas/auth/reset/request", { host: pv, body: { email: "ana@example.com" } });
const resetMail = (await req("GET", `/api/projects/${project.id}/emails`)).json.emails[0];
const resetCode = /<b>(\d{8})<\/b>/.exec(resetMail.html)?.[1];
ok(resetCode, "reset code emailed", resetMail.subject);
const rc = await req("POST", "/_baas/auth/reset/confirm", { host: pv, body: { email: "ana@example.com", code: resetCode, password: "nuevaClave99" } });
ok(rc.status === 200, "reset confirm", rc.text);
ok((await req("GET", "/_baas/auth/me", { host: pv })).json?.user === null, "reset signs out everywhere");

// Data tab + jobs listing + logs
const rows = await req("GET", `/api/projects/${project.id}/db/rows?table=todos`);
ok(rows.json?.total === 1, "data tab rows", rows.text);
const users = await req("GET", `/api/projects/${project.id}/db/rows?table=_forja_users`);
ok(users.json.rows[0].password_hash === "••••", "password hash masked");
const jobs = await req("GET", `/api/projects/${project.id}/jobs`);
ok(jobs.json?.jobs?.[0]?.schedule === "0 8 * * *", "jobs listed with schedule", jobs.text.slice(0, 300));
const logs = await req("GET", `/api/projects/${project.id}/logs`);
ok(logs.json.logs.some((l) => l.message.includes("/_api/todos/create")), "request logs");

// Publish
const pub = await req("POST", `/api/projects/${project.id}/publish`, { body: { slug: "tareas-equipo" } });
ok(pub.status === 200 && pub.json.slug === "tareas-equipo", "publish", pub.text);
const live = await req("GET", "/", { host: "tareas-equipo.localhost" });
ok(live.status === 200 && live.text.includes("Hecho con Forja"), "published app served");
const jobs2 = await req("GET", `/api/projects/${project.id}/jobs`);
ok(jobs2.json.jobs[0].nextRun, "cron armed after publish", JSON.stringify(jobs2.json.jobs[0]));
// Preview change does not leak to live until republish
await req("PUT", `/api/projects/${project.id}/file`, { body: { path: "pages/about.tsx", content: "export default () => <p>about</p>;" } });
const pj = await req("GET", `/api/projects/${project.id}`);
ok(pj.json.project.hasUnpublishedChanges === true, "detects unpublished changes");
const brk = await req("PUT", `/api/projects/${project.id}/file`, { body: { path: "pages/broken.tsx", content: "export default () => <p>" } });
const pub2 = await req("POST", `/api/projects/${project.id}/publish`, {});
ok(pub2.status === 400 && pub2.json.error.includes("broken.tsx"), "publish blocked by build error", pub2.text.slice(0, 200));
ok((await req("GET", "/", { host: "tareas-equipo.localhost" })).status === 200, "live app untouched after failed publish");
await req("PUT", `/api/projects/${project.id}/file`, { body: { path: "pages/broken.tsx", content: "export default () => <p>arreglada</p>;" } });

// SEO, analytics and code export on the published app
await req("PATCH", `/api/projects/${project.id}`, { body: { seo: { siteName: "Tareas del equipo", robots: true, sitemap: true } } });
const robots = await req("GET", "/robots.txt", { host: "tareas-equipo.localhost" });
ok(robots.status === 200 && robots.text.includes("Sitemap:"), "robots.txt served", robots.text);
const sitemap = await req("GET", "/sitemap.xml", { host: "tareas-equipo.localhost" });
ok(sitemap.text.includes("<loc>http://tareas-equipo.localhost") && !sitemap.text.includes(":id"), "sitemap lists static pages", sitemap.text);
ok((await req("GET", "/", { host: "tareas-equipo.localhost" })).text.includes("<title>Tareas del equipo</title>"), "SEO title applied");
await req("POST", "/_baas/pv", { host: "tareas-equipo.localhost", body: JSON.stringify({ path: "/", referrer: "https://google.com/x" }), headers: { "user-agent": "Mozilla/5.0 Chrome/130" } });
const stats = await req("GET", `/api/projects/${project.id}/analytics?days=7`);
ok(stats.json.views === 1 && stats.json.topReferrers[0]?.label === "google.com", "analytics records a page view", stats.text);
await req("PUT", `/api/projects/${project.id}/file`, { body: { path: "static/__dev/todos.md", content: "- [ ] privado" } });
ok((await req("GET", "/static/__dev/todos.md", { host: pv })).status === 404, "builder notes are never served");
const codeZip = await req("GET", `/api/projects/${project.id}/export-code`);
ok(codeZip.status === 200 && codeZip.headers["content-type"] === "application/zip" && codeZip.text.startsWith("PK"), "code export is a zip");

// Data grid: add and delete rows
const added = await req("POST", `/api/projects/${project.id}/db/rows`, { body: { table: "todos", values: { title: "Desde el studio", user_id: "" } } });
ok(added.json?.row?.title === "Desde el studio", "add row uses column defaults", added.text);
const searched = await req("GET", `/api/projects/${project.id}/db/rows?table=todos&search=studio`);
ok(searched.json.total === 1 && searched.json.primaryKey === "id", "search rows", searched.text);
const del = await req("POST", `/api/projects/${project.id}/db/rows/delete`, { body: { table: "todos", keys: [added.json.row.id] } });
ok(del.json.deleted === 1, "delete selected rows");

// Account integrations reach server code as env vars
const integ = await req("POST", "/api/integrations", { body: { type: "generic", name: "Clima", envName: "WEATHER_KEY", value: "w-123" } });
await req("POST", `/api/projects/${project.id}/integrations/${integ.json.id}`, { body: {} });
await req("PUT", `/api/projects/${project.id}/file`, { body: { path: "endpoints/env_GET.ts", content: `export default async (ctx: any) => ({ has: ctx.env.WEATHER_KEY === "w-123" });` } });
ok((await req("GET", "/_api/env", { host: pv })).json?.has === true, "connected integration injected into ctx.env");

// Sandbox: project code cannot read files, spawn processes or see platform secrets.
await req("PUT", `/api/projects/${project.id}/file`, {
  body: {
    path: "endpoints/escape_GET.ts",
    content: `import fs from "node:fs";
import cp from "node:child_process";
export default async () => {
  const out: Record<string, string> = {};
  try { fs.readFileSync("server/config.ts"); out.read = "LEAK"; } catch (e: any) { out.read = e.code; }
  try { fs.writeFileSync("pwned.txt", "x"); out.write = "LEAK"; } catch (e: any) { out.write = e.code; }
  try { cp.execSync("echo hi"); out.spawn = "LEAK"; } catch (e: any) { out.spawn = e.code; }
  out.secret = process.env.SECRETS_KEY ? "LEAK" : "none";
  return out;
};`,
  },
});
const escape = await req("GET", "/_api/escape", { host: pv });
ok(
  escape.json?.read === "ERR_ACCESS_DENIED" && escape.json?.write === "ERR_ACCESS_DENIED" && escape.json?.spawn === "ERR_ACCESS_DENIED" && escape.json?.secret === "none",
  "sandbox blocks files, processes and platform env",
  escape.text,
);
// Transactions over the sandbox RPC: rollback on error, commit on success.
await req("PUT", `/api/projects/${project.id}/file`, {
  body: {
    path: "endpoints/tx_POST.ts",
    content: `export default async (ctx: any) => {
  try {
    await ctx.db.transaction(async (tx: any) => {
      await tx.query("insert into todos (title) values ('tx-rollback')");
      throw new Error("boom");
    });
  } catch {}
  await ctx.db.transaction(async (tx: any) => { await tx.query("insert into todos (title) values ('tx-commit')"); });
  return ctx.db.query("select title from todos where title like 'tx-%' order by title");
};`,
  },
});
const tx = await req("POST", "/_api/tx", { host: pv, body: {} });
ok(JSON.stringify(tx.json) === JSON.stringify([{ title: "tx-commit" }]), "transactions commit and roll back", tx.text);
await req("POST", `/api/projects/${project.id}/db/sql`, { body: { sql: "delete from todos where title like 'tx-%'" } });
// Apps cannot set the platform's own cookies.
await req("PUT", `/api/projects/${project.id}/file`, {
  body: { path: "endpoints/cookie_GET.ts", content: `export default async (ctx: any) => { ctx.setCookie("forja_share", "x"); ctx.setCookie("theme", "dark"); return {}; };` },
});
const ck = await req("GET", "/_api/cookie", { host: pv });
ok((ck.headers["set-cookie"] ?? []).every((c) => !c.startsWith("forja_")) && (ck.headers["set-cookie"] ?? []).some((c) => c.startsWith("theme=")), "app cookies cannot shadow platform cookies");

// Change timeline: per-file changes with authors, and restore to any point
const changes = (await req("GET", `/api/projects/${project.id}/changes`)).json.changes;
ok(changes.some((c) => c.kind === "publish") && changes.some((c) => c.kind === "create" && c.author === "owner"), "timeline lists writes and publishes");
const creation = changes.at(-1);
ok(creation.kind === "checkpoint" && creation.label === "Proyecto creado", "first entry is the creation checkpoint", JSON.stringify(creation));
await req("POST", `/api/projects/${project.id}/changes/${creation.id}/restore`, { body: {} });
const filesAfter = await req("GET", `/api/projects/${project.id}/files`);
ok(filesAfter.json.files.length === 3, "restore to the starter files", filesAfter.text);
ok((await req("GET", `/api/projects/${project.id}/db/rows?table=todos`)).json.total === 1, "restore leaves data alone");
const restoreEntry = (await req("GET", `/api/projects/${project.id}/changes`)).json.changes[0];
const beforeRestore = (await req("GET", `/api/projects/${project.id}/changes`)).json.changes[1];
await req("POST", `/api/projects/${project.id}/changes/${beforeRestore.id}/restore`, { body: {} });
ok(restoreEntry.kind === "restore" && (await req("GET", `/api/projects/${project.id}/files`)).json.files.length > 3, "a restore can itself be undone");

// Folders, favorites and duplicate (copies the database too)
const folder = await req("POST", "/api/folders", { body: { name: "Clientes" } });
await req("PATCH", `/api/projects/${project.id}`, { body: { folderId: folder.json.id, favorite: true } });
const listed = (await req("GET", "/api/projects")).json.projects.find((p) => p.id === project.id);
ok(listed.folderId === folder.json.id && listed.favorite === true, "folder and favorite saved");
const dup = await req("POST", `/api/projects/${project.id}/duplicate`, { body: {} });
ok(dup.json.project?.name.endsWith("(copia)"), "duplicate project", dup.text);
const dupRows = await req("GET", `/api/projects/${dup.json.project.id}/db/rows?table=todos`);
ok(dupRows.json.total === 1, "duplicate copies the database", dupRows.text);

// MCP with an API token
const tok = (await req("POST", "/api/tokens", { body: { name: "test" } })).json.token;
const mcpH = { authorization: `Bearer ${tok}`, accept: "application/json, text/event-stream" };
const init = await req("POST", "/mcp", { headers: mcpH, body: { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "smoke", version: "1" } } } });
ok(init.status === 200 && init.json?.result?.serverInfo?.name === "forja", "mcp initialize", init.text.slice(0, 300));
const tl = await req("POST", "/mcp", { headers: mcpH, body: { jsonrpc: "2.0", id: 2, method: "tools/list" } });
ok(tl.json?.result?.tools?.length > 15, `mcp tools/list (${tl.json?.result?.tools?.length})`, tl.text.slice(0, 300));
const call = await req("POST", "/mcp", { headers: mcpH, body: { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "check_build", arguments: { projectId: project.id } } } });
ok(call.json?.result?.content?.[0]?.text?.includes("Compila"), "mcp check_build", call.text.slice(0, 300));
const noauth = await req("POST", "/mcp", { headers: { accept: "application/json, text/event-stream" }, body: { jsonrpc: "2.0", id: 1, method: "tools/list" } });
ok(noauth.status === 401, "mcp requires token");

// Collaborators: invite before sign-up, claimed on first sign-in; editors build, owners manage.
const ownerCookie = jar.localhost;
async function signInAs(email) {
  jar.localhost = "";
  await req("POST", "/api/auth/request", { body: { email } });
  const c = [...serverLog.matchAll(new RegExp(`${email.replace(".", "\\.")}: (\\d{6})`, "g"))].pop()[1];
  await req("POST", "/api/auth/verify", { body: { email, code: c } });
  return jar.localhost;
}
const invite = await req("POST", `/api/projects/${project.id}/members`, { body: { email: "bob@example.com" } });
ok(invite.json?.joined === false, "invite pending for an email without account", invite.text);
const bobCookie = await signInAs("bob@example.com");
const bobList = await req("GET", "/api/projects");
ok(bobList.json.shared?.some((p) => p.id === project.id) && !bobList.json.projects.some((p) => p.id === project.id), "invite claimed on sign-in: project is shared with bob");
ok((await req("GET", `/api/projects/${project.id}`)).json?.project?.access === "editor", "bob opens the project as editor");
ok((await req("PUT", `/api/projects/${project.id}/file`, { body: { path: "pages/bob.tsx", content: "export default () => <p>bob</p>;" } })).status === 200, "editor can write files");
ok((await req("DELETE", `/api/projects/${project.id}`)).status === 403, "editor cannot delete the project");
ok((await req("POST", `/api/projects/${project.id}/members`, { body: { email: "eve@example.com" } })).status === 403, "editor cannot invite");
ok((await req("GET", `/api/projects/${project.id}/changes`)).json.changes[0].actor === "bob@example.com", "editor writes are logged with who made them");
await signInAs("carol@example.com");
ok((await req("GET", `/api/projects/${project.id}`)).status === 404, "strangers cannot see the project");
jar.localhost = ownerCookie;
const members = await req("GET", `/api/projects/${project.id}/members`);
ok(members.json.members.length === 1 && members.json.members[0].email === "bob@example.com", "owner sees bob as member", members.text);
await req("DELETE", `/api/projects/${project.id}/members/bob%40example.com`);
jar.localhost = bobCookie;
ok((await req("GET", `/api/projects/${project.id}`)).status === 404, "removed collaborator loses access");
jar.localhost = ownerCookie;

// Sign-in codes are rate limited per email.
let limited = 0;
for (let i = 0; i < 7; i++) if ((await req("POST", "/api/auth/request", { body: { email: "spam@example.com" } })).status === 429) limited++;
ok(limited >= 2, "login code requests are rate limited");
console.log(process.exitCode ? "\nSOME CHECKS FAILED" : "\nALL CHECKS PASSED");
if (process.exitCode) console.log("\n--- server log ---\n" + serverLog.slice(-4000));
finish();
