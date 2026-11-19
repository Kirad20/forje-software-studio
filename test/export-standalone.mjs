// End-to-end test of "Exportar para producción" without Docker: exports the components
// starter, runs its migration step and its services with plain Node against a real Postgres,
// and uses the app the way the gateway would. Proves the export runs without Forja.
//   npm run test:export
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { freshDatabase } from "./helpers/pg.mjs";
import { exportStandalone } from "../server/modules/app-runtime/index.ts";
import { starterFiles } from "../server/modules/projects/index.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Inside the repository, so the exported services resolve pg, croner and zod from node_modules.
const OUT = path.join(ROOT, "test", `.tmp-export-${process.pid}`);
const ok = (cond, msg, extra) => {
  if (!cond) { console.error("FAIL:", msg, extra ?? ""); process.exitCode = 1; } else console.log("ok  ", msg);
};

const files = {
  ...starterFiles("Tienda", "components"),
  "endpoints/ping_GET.ts": `export default async (ctx: any) => ({ ok: true, key: ctx.env.API_KEY ?? null, user: ctx.user });\n`,
  "jobs/digest.ts": `export const schedule = "0 8 * * *";\nexport default async () => {};\n`,
  "services/orders/endpoints/mail_POST.ts": `export default async (ctx: any) => { await ctx.email.send({ to: "a@b.c", subject: "x", html: "x" }); return { sent: true }; };\n`,
  "services/orders/endpoints/peek_GET.ts": `export default async (ctx: any) => ctx.db.query("select * from billing.invoices");\n`,
  "services/orders/endpoints/private_GET.ts": `export default async (ctx: any) => ctx.requireUser();\n`,
};

const children = [];
const db = await freshDatabase();
try {
  const tree = await exportStandalone({ name: "Tienda <demo>", slug: "tienda", files, secrets: ["API_KEY"] });
  for (const [p, content] of Object.entries(tree)) {
    const target = path.join(OUT, p);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  const dir = path.join(OUT, "tienda");
  const read = (p) => readFileSync(path.join(dir, p), "utf8");

  // --- What the export contains -------------------------------------------------------------
  const compose = read("docker-compose.yml");
  ok(["  db:", "  migrate:", "  app:", "  orders:", "  billing:", "  gateway:"].every((s) => compose.includes(s)), "compose has Postgres, migrations, one service per component and the gateway", compose);
  ok(compose.includes("postgres://forja_c_orders:${DB_PASSWORD_ORDERS}@db:5432/app") && compose.includes("postgres://forja_app:${APP_DB_PASSWORD}@db:5432/app"), "each service connects with its own role");
  ok(compose.includes("API_KEY: ${API_KEY:-}") && read(".env.example").includes("API_KEY=") && !JSON.stringify(tree).includes("secret-value"), "secrets become environment variables, never values");
  const nginx = read("gateway/nginx.conf");
  ok(nginx.includes("location /_api/orders/ { proxy_pass http://orders:3000;") && nginx.includes("location /_api/ { proxy_pass http://app:3000;"), "the gateway routes /_api to each service");
  ok(nginx.includes("location = /admin") && nginx.includes("location /admin/ { try_files $uri /admin/index.html; }") && nginx.includes("location / { try_files $uri /index.html; }"), "the gateway serves every frontend at its mount");
  ok(read("gateway/html/admin/index.html").includes("/_forja/admin.js") && read("gateway/html/_forja/admin.js").includes("Crear pedido de prueba"), "the admin frontend is compiled for the gateway");
  ok(read("gateway/html/index.html").includes("/_forja/app.js") && read("gateway/html/index.html").includes("Tienda &lt;demo&gt;"), "the app frontend is compiled with an escaped title");
  const plan = JSON.parse(read("migrate/plan.json"));
  ok(plan.schemas.map((s) => s.schema).join() === "orders,billing" && plan.migrations.every((m) => existsSync(path.join(dir, "migrate/migrations", m.path))), "the migration plan has one schema per data component", JSON.stringify(plan));
  const ordersManifest = JSON.parse(read("services/orders/manifest.json"));
  ok(ordersManifest.schema === "orders" && ordersManifest.endpoints.some((e) => e.route === "orders/create") && ordersManifest.jobs.map((j) => j.name).join() === "orders.invoiced", "the orders service knows its schema, endpoints and jobs");
  ok(JSON.parse(read("services/app/manifest.json")).jobs.find((j) => j.name === "digest")?.schedule === "0 8 * * *", "scheduled jobs keep their cron");
  const pkg = JSON.parse(read("services/orders/package.json"));
  ok(pkg.dependencies.pg && pkg.dependencies.croner && pkg.dependencies.zod, "each service image installs what its bundles import", JSON.stringify(pkg));
  ok(read("README.md").includes("docker compose up --build") && read("services/orders/Dockerfile").includes("FROM node:22-alpine"), "README and Dockerfiles are included");

  // --- Run it without Forja -------------------------------------------------------------------
  const passwords = { POSTGRES_PASSWORD: "unused", APP_DB_PASSWORD: "app-secret-1", DB_PASSWORD_ORDERS: "orders-secret-1", DB_PASSWORD_BILLING: "billing-secret-1" };
  const migrate = () => spawnSync(process.execPath, ["migrate.mjs"], { cwd: path.join(dir, "migrate"), env: { ...process.env, ...passwords, DATABASE_URL: db.url }, encoding: "utf8" });
  const first = migrate();
  ok(first.status === 0 && first.stdout.includes("services/orders/migrations/001_orders.sql"), "the migration step prepares roles, schemas and applies the migrations", first.stderr + first.stdout);
  const again = migrate();
  ok(again.status === 0 && again.stdout.includes("ya estaba al día"), "running the migration step again changes nothing", again.stderr + again.stdout);

  const as = (user, password) => { const u = new URL(db.url); u.username = user; u.password = password; return u.toString(); };
  const ports = { app: 5600 + Math.floor(Math.random() * 300), orders: 5950 + Math.floor(Math.random() * 300), billing: 6300 + Math.floor(Math.random() * 300) };
  const urls = { app: as("forja_app", passwords.APP_DB_PASSWORD), orders: as("forja_c_orders", passwords.DB_PASSWORD_ORDERS), billing: as("forja_c_billing", passwords.DB_PASSWORD_BILLING) };
  let logs = "";
  for (const name of ["app", "orders", "billing"]) {
    const child = spawn(process.execPath, ["server.mjs"], { cwd: path.join(dir, "services", name), env: { ...process.env, PORT: String(ports[name]), DATABASE_URL: urls[name], API_KEY: "secret-value", JOBS_POLL_MS: "100" } });
    child.stdout.on("data", (d) => (logs += d));
    child.stderr.on("data", (d) => (logs += d));
    children.push(child);
  }
  const call = async (name, method, route, body) => {
    const res = await fetch(`http://127.0.0.1:${ports[name]}${route}`, { method, headers: body ? { "content-type": "application/json" } : {}, body: body ? JSON.stringify(body) : undefined });
    const text = await res.text();
    let json; try { json = JSON.parse(text); } catch {}
    return { status: res.status, json, text };
  };
  for (const name of Object.keys(ports)) {
    for (let i = 0; i < 50; i++) {
      try { if ((await call(name, "GET", "/healthz")).status === 200) break; } catch {}
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  ok((await call("orders", "GET", "/healthz")).json?.component === "orders", "the services start with plain Node");

  const placed = await call("orders", "POST", "/_api/orders/create", { id: "x-1" });
  ok(placed.status === 200 && placed.json?.order?.status === "pending", "the orders API places an order in its own schema", placed.text);
  let listed;
  for (let i = 0; i < 80; i++) {
    listed = await call("orders", "GET", "/_api/orders/list?page=1");
    if (listed.json?.orders?.[0]?.status === "invoiced") break;
    await new Promise((r) => setTimeout(r, 100));
  }
  ok(listed.json?.orders?.[0]?.status === "invoiced", "billing consumes the event in another process and orders hears back through the shared queue", listed.text);
  ok((await call("orders", "POST", "/_api/orders/create", { id: "" })).status === 400, "validation errors answer 400 like in Forja");
  ok((await call("orders", "GET", "/_api/orders/nope")).status === 404, "unknown endpoints answer 404");
  const mail = await call("orders", "POST", "/_api/orders/mail", {});
  ok(mail.status === 501 && /plataforma Forja/.test(mail.json?.error ?? ""), "platform services answer 501 instead of failing silently", mail.text);
  ok((await call("orders", "GET", "/_api/orders/private")).status === 401, "requireUser answers 401 without Forja's sign-in");
  const peek = await call("orders", "GET", "/_api/orders/peek");
  ok(peek.status === 500 && peek.json?.error === "Error interno" && /permission denied/.test(logs), "a service cannot read another service's schema", peek.text);
  const ping = await call("app", "GET", "/_api/ping");
  ok(ping.json?.ok === true && ping.json?.key === "secret-value" && ping.json?.user === null, "the app's own endpoints run with their secrets", ping.text);

  const ordersRole = new pg.Client({ connectionString: urls.orders });
  await ordersRole.connect();
  const denied = await ordersRole.query("select * from billing.invoices").then(() => "allowed", (e) => e.message);
  const ownRows = (await ordersRole.query("select id, status from orders.orders")).rows;
  await ordersRole.end();
  ok(/permission denied/.test(denied) && ownRows[0]?.status === "invoiced", "roles enforce the database per service in Postgres itself", denied);

  // Retiring a service's database in a later export: the migration step goes on and keeps its data.
  for (const child of children) child.kill();
  const planPath = path.join(dir, "migrate", "plan.json");
  const retiredPlan = JSON.parse(readFileSync(planPath, "utf8"));
  retiredPlan.schemas = retiredPlan.schemas.filter((s) => s.schema !== "billing");
  retiredPlan.migrations = retiredPlan.migrations.filter((m) => m.schema !== "billing");
  writeFileSync(planPath, JSON.stringify(retiredPlan));
  const retiredRun = migrate();
  ok(retiredRun.status === 0 && /Esquema retirado .*billing/.test(retiredRun.stdout), "a later export without billing's database retires its schema instead of failing", retiredRun.stderr + retiredRun.stdout);
  const owner = new pg.Client({ connectionString: db.url });
  await owner.connect();
  const kept = (await owner.query("select order_id from billing.invoices")).rows;
  await owner.end();
  ok(kept[0]?.order_id === "x-1", "the retired schema keeps its data");

  console.log(process.exitCode ? "\nSOME CHECKS FAILED" : "\nALL CHECKS PASSED");
  if (process.exitCode) console.log("\n--- service logs ---\n" + logs.slice(-4000));
} finally {
  for (const child of children) child.kill();
  await new Promise((r) => setTimeout(r, 300));
  await db.drop();
  rmSync(OUT, { recursive: true, force: true });
}
