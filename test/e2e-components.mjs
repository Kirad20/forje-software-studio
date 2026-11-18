// End-to-end test of forja.json components without an LLM: a real server, the studio API and
// the preview over HTTP. One project with the app, an admin web component, an orders API with
// hexagonal layers and its own process pool, a worker and a shared library.
//   npm run test:e2e:components
import http from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { freshDatabase } from "./helpers/pg.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 4800 + Math.floor(Math.random() * 500);
const DATA = mkdtempSync(path.join(tmpdir(), "forja-e2e-components-"));
const BOOTSTRAP = "e2e-components-token-0123456789";
const pgdb = await freshDatabase();
let serverLog = "";
const server = spawn(process.execPath, ["--import", "tsx", "server/bootstrap/server.ts"], {
  cwd: ROOT,
  env: { ...process.env, PORT: String(PORT), PUBLIC_URL: `http://localhost:${PORT}`, DATA_DIR: DATA, DATABASE_URL: pgdb.url, FORJA_SEED_FILE: "", SECRETS_KEY: "cd".repeat(32), FORJA_BOOTSTRAP_TOKEN: BOOTSTRAP },
});
server.stdout.on("data", (d) => (serverLog += d));
server.stderr.on("data", (d) => (serverLog += d));
const finish = async () => {
  if (server.exitCode === null && server.signalCode === null) {
    const exited = once(server, "exit");
    server.kill();
    await exited;
  }
  await pgdb.drop();
  rmSync(DATA, { recursive: true, force: true });
};
const jar = {};

function req(method, p, { host = "localhost", body, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const data = body === undefined ? undefined : JSON.stringify(body);
    const r = http.request(
      { host: "127.0.0.1", port: PORT, method, path: p, headers: { host: `${host}:${PORT}`, ...(jar[host] ? { cookie: jar[host] } : {}), ...(data ? { "content-type": "application/json" } : {}), ...headers } },
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

try {
  for (let i = 0; i < 60; i++) {
    try { if ((await req("GET", "/healthz")).status === 200) break; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  const setup = await req("POST", "/api/auth/setup", { body: { token: BOOTSTRAP, email: "owner@example.com", password: "una contraseña larga", name: "Dueña" } });
  ok(setup.status === 200, "owner account", setup.text);
  const project = (await req("POST", "/api/projects", { body: { prompt: "Tienda con panel y API de pedidos" } })).json.project;
  ok(!!project?.id, "project created");
  const pv = `pv-${project.id}.localhost`;
  const share = new URL(project.previewUrl).searchParams.get("share");
  const put = (p, content) => req("PUT", `/api/projects/${project.id}/file`, { body: { path: p, content } });

  // Before forja.json declares them, component folders are refused exactly as before.
  ok((await put("services/orders/domain/order.ts", "export {}")).status >= 400, "component folders need forja.json");
  ok((await put("forja.json", "{ \"version\": 1 }")).status >= 400, "an invalid forja.json is refused");

  const manifest = {
    version: 1,
    components: {
      admin: { kind: "web", root: "apps/admin", mount: "/admin" },
      orders: { kind: "api", root: "services/orders", replicas: 1, maxConcurrency: 4 },
      billing: { kind: "worker", root: "services/billing" },
      domain: { kind: "library", root: "packages/domain" },
    },
  };
  const files = {
    "forja.json": JSON.stringify(manifest, null, 2),
    "migrations/001_orders.sql": "create table orders (id text primary key, total_cents integer not null, status text not null default 'new');",
    "pages/_index.tsx": `export default function Home() { return <h1>Escaparate</h1>; }\n`,
    "apps/admin/base.css": `.panel { color: rebeccapurple; }\n`,
    "apps/admin/pages/_layout.tsx": `export default function Layout({ children }: { children: any }) { return <div className="panel">{children}</div>; }\n`,
    "apps/admin/pages/_index.tsx": `import { OrdersPanel } from "../features/orders/OrdersPanel";\nexport default function AdminHome() { return <OrdersPanel />; }\n`,
    "apps/admin/features/orders/OrdersPanel.tsx": `import { formatMoney } from "~/packages/domain/money";\nexport function OrdersPanel() { return <p>Panel de pedidos {formatMoney(1250)}</p>; }\n`,
    "apps/admin/static/logo.svg": `<svg xmlns="http://www.w3.org/2000/svg"></svg>`,
    "packages/domain/money.ts": `export const formatMoney = (cents: number) => (cents / 100).toFixed(2) + " EUR";\n`,
    "services/orders/domain/order.ts": `export interface Order { id: string; totalCents: number }\nexport const newOrder = (id: string, totalCents: number): Order => {\n  if (totalCents <= 0) throw new Error("total inválido");\n  return { id, totalCents };\n};\n`,
    "services/orders/ports.ts": `import type { Order } from "./domain/order";\nexport interface OrdersRepository { save(order: Order): Promise<void> }\nexport interface Events { invoiceRequested(order: Order): Promise<void> }\n`,
    "services/orders/application/placeOrder.ts": `import { newOrder } from "../domain/order";\nimport type { Events, OrdersRepository } from "../ports";\nexport async function placeOrder(repo: OrdersRepository, events: Events, id: string, totalCents: number) {\n  const order = newOrder(id, totalCents);\n  await repo.save(order);\n  await events.invoiceRequested(order);\n  return order;\n}\n`,
    "services/orders/infrastructure/adapters.ts": `import type { Events, OrdersRepository } from "../ports";\nexport const ordersRepository = (ctx: any): OrdersRepository => ({ save: (o) => ctx.db.query("insert into orders (id, total_cents) values ($1, $2) on conflict (id) do nothing", [o.id, o.totalCents]).then(() => undefined) });\nexport const events = (ctx: any): Events => ({ invoiceRequested: (o) => ctx.jobs.run("billing.invoice", { orderId: o.id }).then(() => undefined) });\n`,
    "services/orders/endpoints/create_POST.ts": `// forja:public\nimport { placeOrder } from "../application/placeOrder";\nimport { events, ordersRepository } from "../infrastructure/adapters";\nimport { formatMoney } from "~/packages/domain/money";\nexport default async function (ctx: any) {\n  const order = await placeOrder(ordersRepository(ctx), events(ctx), String(ctx.body.id), 1250);\n  return { order, label: formatMoney(order.totalCents) };\n}\n`,
    "services/orders/endpoints/status_GET.ts": `// forja:public\nexport default async function (ctx: any) {\n  return { orders: await ctx.db.query("select id, status from orders order by id") };\n}\n`,
    "services/billing/jobs/invoice.ts": `export default async function (ctx: any) {\n  await ctx.db.query("update orders set status = 'invoiced' where id = $1", [ctx.payload.orderId]);\n}\n`,
  };
  for (const [p, content] of Object.entries(files)) {
    const r = await put(p, content);
    ok(r.status === 200, `write ${p}`, r.text);
  }
  ok((await put("lib/outside.ts", "export {}")).status >= 400, "paths outside every component are still refused");

  const check = await req("GET", `/api/projects/${project.id}/problems`);
  const buildProblems = (check.json?.problems ?? []).filter((p) => p.kind === "build");
  ok(buildProblems.length === 0, "the architecture builds without problems", JSON.stringify(buildProblems).slice(0, 600));

  ok((await req("GET", `/?share=${share}`, { host: pv })).status === 302, "preview share cookie");
  const home = await req("GET", "/", { host: pv });
  ok(home.status === 200 && home.text.includes("/_forja/app.js\"") && !home.text.includes("?c="), "the app keeps its own bundle at /", home.text.slice(0, 300));
  const appJs = await req("GET", "/_forja/app.js", { host: pv });
  ok(appJs.text.includes("Escaparate") && !appJs.text.includes("Panel de pedidos"), "the app bundle holds only the app's pages");
  const admin = await req("GET", "/admin", { host: pv });
  ok(admin.status === 200 && admin.text.includes("/_forja/app.js?c=admin") && admin.text.includes("/_forja/app.css?c=admin"), "/admin is served by the admin component", admin.text.slice(0, 400));
  const adminJs = await req("GET", "/_forja/app.js?c=admin", { host: pv });
  ok(adminJs.status === 200 && adminJs.text.includes("Panel de pedidos") && !adminJs.text.includes("Escaparate"), "the admin bundle holds the admin pages and the shared library");
  const adminCss = await req("GET", "/_forja/app.css?c=admin", { host: pv });
  ok(adminCss.text.includes("rebeccapurple"), "the admin bundle uses the component's base.css");
  const logo = await req("GET", "/admin/static/logo.svg", { host: pv });
  ok(logo.status === 200 && logo.headers["content-type"]?.startsWith("image/svg+xml"), "component static files are served under its mount");
  ok((await req("GET", "/admin/static/missing.png", { host: pv })).status === 404, "a missing component static file is a 404");

  const created = await req("POST", "/_api/orders/create", { host: pv, body: { id: "o-1" } });
  ok(created.status === 200 && created.json?.label === "12.50 EUR" && created.json?.order?.id === "o-1", "the orders API answers through its layers", created.text);
  let status;
  for (let i = 0; i < 40; i++) {
    status = await req("GET", "/_api/orders/status", { host: pv });
    if (status.json?.orders?.[0]?.status === "invoiced") break;
    await new Promise((r) => setTimeout(r, 250));
  }
  ok(status.json?.orders?.[0]?.status === "invoiced", "the billing worker consumed the event and updated the order", status.text);

  const services = await req("GET", `/api/projects/${project.id}/service-control`);
  const orders = services.json?.services?.find((s) => s.name === "orders");
  ok(orders?.desired?.replicas === 1 && orders?.desired?.maxConcurrency === 4 && orders.endpoints.length === 2, "the orders component runs as its own service", services.text?.slice(0, 600));
  const monolith = services.json?.services?.find((s) => s.name === "monolith");
  ok(monolith?.jobs?.includes("services/billing/jobs/invoice.ts"), "components without replicas stay in the monolith");
  ok((await req("GET", `/api/projects/${project.id}/services`)).json?.jobs === true, "the services panel sees component jobs");
  const scaled = await req("PATCH", `/api/projects/${project.id}/service-control/orders`, { body: { replicas: 2 } });
  const after = JSON.parse((await req("GET", `/api/projects/${project.id}/file?path=forja.json`)).json?.content ?? "{}");
  ok(scaled.status === 200 && after.components?.orders?.replicas === 2, "scaling a component service writes forja.json", scaled.text);

  // The "components" starter: the same architecture ready to run from project creation.
  const starter = (await req("POST", "/api/projects", { body: { prompt: "Arquitectura de ejemplo", template: "components" } })).json.project;
  ok(!!starter?.id, "components starter project created");
  const spv = `pv-${starter.id}.localhost`;
  ok((await req("GET", `/?share=${new URL(starter.previewUrl).searchParams.get("share")}`, { host: spv })).status === 302, "starter preview share cookie");
  const starterProblems = ((await req("GET", `/api/projects/${starter.id}/problems`)).json?.problems ?? []).filter((p) => p.kind === "build");
  ok(starterProblems.length === 0, "the components starter builds", JSON.stringify(starterProblems).slice(0, 400));
  ok((await req("GET", "/admin", { host: spv })).text.includes("app.js?c=admin"), "the starter serves its admin panel");
  ok((await req("GET", "/_forja/app.js?c=admin", { host: spv })).text.includes("Crear pedido de prueba"), "the starter admin bundle builds");
  const placed = await req("POST", "/_api/orders/create", { host: spv, body: { id: "demo-1" } });
  ok(placed.status === 200 && placed.json?.order?.status === "pending", "the starter orders API places an order", placed.text);
  const listed = await req("GET", "/_api/orders/list?page=1", { host: spv });
  ok(listed.json?.orders?.[0]?.id === "demo-1" && listed.json?.page === 1, "the starter lists orders with pagination", listed.text);
  // Database per service: orders and billing own a schema each and talk through durable events.
  let invoiced;
  for (let i = 0; i < 60; i++) {
    invoiced = await req("GET", "/_api/orders/list?page=1", { host: spv });
    if (invoiced.json?.orders?.[0]?.status === "invoiced") break;
    await new Promise((r) => setTimeout(r, 250));
  }
  ok(invoiced.json?.orders?.[0]?.status === "invoiced", "billing invoices in its schema and tells orders through the queue", invoiced.text);
  const schema = await req("GET", `/api/projects/${starter.id}/db/schema`);
  const tables = schema.json?.tables ?? {};
  const tableNames = Array.isArray(tables) ? tables.map((t) => t.name) : Object.keys(tables);
  ok(tableNames.includes("orders.orders") && tableNames.includes("billing.invoices") && !tableNames.includes("orders"), "each service's tables live in its own schema", JSON.stringify(tableNames));
  const invoiceRows = await req("GET", `/api/projects/${starter.id}/db/rows?table=${encodeURIComponent("billing.invoices")}`);
  ok(invoiceRows.json?.rows?.[0]?.order_id === "demo-1", "the Data panel browses a service's schema", invoiceRows.text);

  // Retiring a service's database: publish, drop "database", delete its migrations, publish again.
  const firstPublish = await req("POST", `/api/projects/${starter.id}/publish`, { body: { slug: "arquitectura-e2e" } });
  ok(firstPublish.status === 200 && !firstPublish.json?.warnings, "the starter publishes with both service schemas", firstPublish.text);
  const tok = (await req("POST", "/api/tokens", { body: { name: "e2e-components" } })).json.token;
  const mcpH = { authorization: `Bearer ${tok}`, accept: "application/json, text/event-stream" };
  await req("POST", "/mcp", { headers: mcpH, body: { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "e2e", version: "1" } } } });
  let mcpId = 10;
  const tool = async (name, args) => (await req("POST", "/mcp", { headers: mcpH, body: { jsonrpc: "2.0", id: mcpId++, method: "tools/call", params: { name, arguments: { projectId: starter.id, ...args } } } })).json?.result;
  const billingMigration = "services/billing/migrations/001_invoices.sql";
  const guarded = await tool("delete_file", { path: billingMigration });
  ok(guarded?.isError && /execute_sql/.test(guarded.content?.[0]?.text ?? ""), "a schema in use keeps its migrations protected", JSON.stringify(guarded).slice(0, 300));
  const renamed = await tool("rename_file", { from: "services/orders/migrations/001_orders.sql", to: "services/orders/migrations/001_other.sql" });
  ok(renamed?.isError, "a migration cannot be renamed, only moved with its folder", JSON.stringify(renamed).slice(0, 300));
  const starterManifest = JSON.parse((await req("GET", `/api/projects/${starter.id}/file?path=forja.json`)).json.content);
  delete starterManifest.components.billing.database;
  ok((await req("PUT", `/api/projects/${starter.id}/file`, { body: { path: "forja.json", content: JSON.stringify(starterManifest, null, 2) } })).status === 200, "billing drops its database in forja.json");
  const blocked = ((await req("GET", `/api/projects/${starter.id}/problems`)).json?.problems ?? []).filter((p) => p.kind === "build");
  ok(blocked.some((p) => p.file === billingMigration), "check_build asks to delete the retired service's migrations", JSON.stringify(blocked).slice(0, 400));
  const retiredDelete = await tool("delete_file", { path: billingMigration });
  ok(!retiredDelete?.isError, "the builder may delete the migrations of a retired schema", JSON.stringify(retiredDelete).slice(0, 300));
  const clean = ((await req("GET", `/api/projects/${starter.id}/problems`)).json?.problems ?? []).filter((p) => p.kind === "build");
  ok(clean.length === 0, "the project builds again", JSON.stringify(clean).slice(0, 400));
  const secondPublish = await req("POST", `/api/projects/${starter.id}/publish`, { body: { slug: "arquitectura-e2e" } });
  ok(secondPublish.status === 200 && /billing ya no lo declara ningún componente.*se conserva con sus datos/.test(secondPublish.json?.warnings?.[0] ?? ""), "publishing goes on and says the schema was retired with its data", secondPublish.text);

  // A legacy project keeps working and migrates through MCP, one context at a time.
  const legacy = (await req("POST", "/api/projects", { body: { prompt: "Pedidos legacy", template: "orders-invoices" } })).json.project;
  const lpv = `pv-${legacy.id}.localhost`;
  ok((await req("GET", `/?share=${new URL(legacy.previewUrl).searchParams.get("share")}`, { host: lpv })).status === 302, "legacy preview share cookie");
  const ltool = async (name, args) => (await req("POST", "/mcp", { headers: mcpH, body: { jsonrpc: "2.0", id: mcpId++, method: "tools/call", params: { name, arguments: { projectId: legacy.id, ...args } } } })).json?.result;
  const orderId = "7b1d7f8e-6a46-4a7e-9c63-0f9d2a1c3b11";
  const before = await req("POST", "/_api/orders/create", { host: lpv, body: { orderId } });
  ok(before.status === 200, "the legacy project works before migrating", before.text);
  const planText = (await ltool("architecture_migration_plan", {}))?.content?.[0]?.text ?? "";
  ok(/orders → api "orders" en services\/orders\//.test(planText) && /invoices → worker/.test(planText) && /sigue funcionando igual/.test(planText), "MCP plans the migration of the legacy project", planText.slice(0, 600));
  const extracted = await ltool("extract_component", { context: "orders" });
  ok(!extracted?.isError && /Rutas: POST orders\/create, GET orders\/status \(sin cambios\)/.test(extracted?.content?.[0]?.text ?? ""), "MCP extracts the orders context", JSON.stringify(extracted).slice(0, 500));
  const legacyProblems = ((await req("GET", `/api/projects/${legacy.id}/problems`)).json?.problems ?? []).filter((p) => p.kind === "build");
  ok(legacyProblems.length === 0, "the migrated project builds", JSON.stringify(legacyProblems).slice(0, 400));
  const moved = await req("GET", `/_api/orders/status?orderId=${orderId}`, { host: lpv });
  ok(moved.status === 200 && JSON.stringify(moved.json).includes(orderId), "the same URLs answer after the move, with the same data", moved.text);
  const again = await req("POST", "/_api/orders/create", { host: lpv, body: { orderId: "0c9a1e52-3f0b-4d55-8f39-3b2a6f0e7d21" } });
  ok(again.status === 200, "the moved API keeps creating orders", again.text);
  const control = (await req("GET", `/api/projects/${legacy.id}/service-control`)).json?.services ?? [];
  ok(control.find((s) => s.name === "orders")?.desired?.replicas === 2 && control.some((s) => s.name === "invoices"), "the extracted component keeps its scale next to the legacy worker", JSON.stringify(control.map((s) => [s.name, s.desired])));
  const extracted2 = await ltool("extract_component", { context: "invoices" });
  ok(!extracted2?.isError && /forja\.services\.json quedó vacío y se eliminó/.test(extracted2?.content?.[0]?.text ?? ""), "the last context retires forja.services.json", JSON.stringify(extracted2).slice(0, 400));
  ok((await req("GET", `/api/projects/${legacy.id}/file?path=forja.services.json`)).status === 404, "no legacy topology remains");
  const legacyPublish = await req("POST", `/api/projects/${legacy.id}/publish`, { body: { slug: "pedidos-migrados" } });
  ok(legacyPublish.status === 200, "the migrated project publishes", legacyPublish.text);

  // A project with another structure, mapped by forja.json paths/conventions instead of rewritten.
  const mappedProject = (await req("POST", "/api/projects", { body: { prompt: "Blog con otra estructura" } })).json.project;
  const mpv = `pv-${mappedProject.id}.localhost`;
  const mput = (p, content) => req("PUT", `/api/projects/${mappedProject.id}/file`, { body: { path: p, content } });
  const mtool = async (name, args) => (await req("POST", "/mcp", { headers: mcpH, body: { jsonrpc: "2.0", id: mcpId++, method: "tools/call", params: { name, arguments: { projectId: mappedProject.id, ...args } } } })).json?.result;
  // The template's root pages would collide with a site mounted at "/": this project is all mapped.
  for (const f of ["pages/_index.tsx", "pages/_layout.tsx", "pages/_index.module.css"]) await mtool("delete_file", { path: f });
  const mappedManifest = {
    version: 1,
    components: {
      site: { kind: "web", root: "src", mount: "/", paths: { pages: "routes", components: "ui", static: "public", styles: "index.css" }, conventions: { pages: "folders" } },
      backend: { kind: "api", root: "backend", route: "api", paths: { endpoints: "handlers", jobs: "workers", migrations: "db/sql" }, conventions: { endpoints: "dot" }, database: true },
    },
  };
  const minimal = { version: 1, components: { site: { kind: "web", root: "src", mount: "/" }, backend: { kind: "api", root: "backend", route: "api" } } };
  ok((await mput("forja.json", JSON.stringify(minimal))).status === 200, "a minimal forja.json declares the foreign folders");
  const mappedFiles = {
    "src/index.css": ".shell { color: teal; }",
    "src/routes/_layout.tsx": `export default function L({ children }: { children: any }) { return <div className="shell">{children}</div>; }\n`,
    "src/routes/index.tsx": `import { Hero } from "../ui/Hero";\nexport default function Home() { return <Hero />; }\n`,
    "src/routes/posts/[id].tsx": `export default function Post() { return <p>Detalle de entrada</p>; }\n`,
    "src/ui/Hero.tsx": `export function Hero() { return <h1>Portada mapeada</h1>; }\n`,
    "src/public/logo.svg": `<svg xmlns="http://www.w3.org/2000/svg"></svg>`,
    "backend/handlers/posts/create.post.ts": `// forja:public\nexport default async (ctx: any) => ctx.db.one("insert into posts (title) values ($1) returning id, title", [String(ctx.body.title)]);\n`,
    "backend/handlers/posts/list.get.ts": `// forja:public\nexport default async (ctx: any) => ctx.db.query("select id, title from posts order by id limit 20");\n`,
    "backend/db/sql/001_posts.sql": "create table posts (id serial primary key, title text not null);",
  };
  for (const [p, content] of Object.entries(mappedFiles)) ok((await mput(p, content)).status === 200, `write mapped ${p}`);
  const preview = (await mtool("check_manifest", {}))?.content?.[0]?.text ?? "";
  ok(/ninguno es página, endpoint ni tarea con este mapeo/.test(preview), "check_manifest shows the folders are not mapped yet", preview.slice(0, 500));
  const proposed = (await mtool("check_manifest", { forja_json: JSON.stringify(mappedManifest) }))?.content?.[0]?.text ?? "";
  ok(/\/posts\/:id ← src\/routes\/posts\/\[id\]\.tsx/.test(proposed) && /POST \/_api\/api\/posts\/create ← backend\/handlers\/posts\/create\.post\.ts/.test(proposed) && /No se ha escrito nada/.test(proposed), "check_manifest previews the proposed mapping without writing", proposed.slice(0, 900));
  const savedManifest = await mtool("write_file", { path: "forja.json", content: JSON.stringify(mappedManifest, null, 2) });
  ok(!savedManifest?.isError, "MCP saves the mapped forja.json", JSON.stringify(savedManifest).slice(0, 300));
  const servicesManifest = { version: 1, services: { writers: { kind: "service", endpoints: ["backend/handlers/**/*.post.ts"], replicas: 2 } } };
  const savedServices = await mtool("write_file", { path: "forja.services.json", content: JSON.stringify(servicesManifest, null, 2) });
  ok(!savedServices?.isError, "MCP saves a forja.services.json with patterns", JSON.stringify(savedServices).slice(0, 300));
  const mappedProblems = ((await req("GET", `/api/projects/${mappedProject.id}/problems`)).json?.problems ?? []).filter((p) => p.kind === "build");
  ok(mappedProblems.length === 0, "the mapped project builds", JSON.stringify(mappedProblems).slice(0, 500));
  ok((await req("GET", `/?share=${new URL(mappedProject.previewUrl).searchParams.get("share")}`, { host: mpv })).status === 302, "mapped preview share cookie");
  const mappedHome = await req("GET", "/posts/7", { host: mpv });
  ok(mappedHome.status === 200 && mappedHome.text.includes("app.js?c=site"), "folder-style pages are served by the mapped site", mappedHome.text.slice(0, 300));
  const mappedJs = await req("GET", "/_forja/app.js?c=site", { host: mpv });
  ok(mappedJs.text.includes("Portada mapeada") && mappedJs.text.includes("/posts/:id"), "the site bundle comes from src/routes and src/ui");
  ok((await req("GET", "/_forja/app.css?c=site", { host: mpv })).text.includes("teal"), "styles come from the mapped src/index.css");
  ok((await req("GET", "/static/logo.svg", { host: mpv })).status === 200, "/static/ serves the mapped src/public folder");
  const createdPost = await req("POST", "/_api/api/posts/create", { host: mpv, body: { title: "Hola" } });
  ok(createdPost.status === 200 && createdPost.json?.title === "Hola", "dot-style endpoints answer, with migrations from db/sql in the service's schema", createdPost.text);
  ok((await req("GET", "/_api/api/posts/list", { host: mpv })).json?.[0]?.title === "Hola", "the mapped API reads its own table");
  const mappedSchema = await req("GET", `/api/projects/${mappedProject.id}/db/schema`);
  const mappedTables = mappedSchema.json?.tables ?? {};
  ok((Array.isArray(mappedTables) ? mappedTables.map((t) => t.name) : Object.keys(mappedTables)).includes("backend.posts"), "the mapped migrations folder created the table in the backend schema");
  const mappedControl = (await req("GET", `/api/projects/${mappedProject.id}/service-control`)).json?.services ?? [];
  ok(JSON.stringify(mappedControl.find((s) => s.name === "writers")?.endpoints) === JSON.stringify(["backend/handlers/posts/create.post.ts"]), "the services pattern assigns the matching endpoints", JSON.stringify(mappedControl.map((s) => [s.name, s.endpoints])));

  console.log(process.exitCode ? "\nSOME CHECKS FAILED" : "\nALL CHECKS PASSED");
  if (process.exitCode) console.log("\n--- server log ---\n" + serverLog.slice(-4000));
} finally {
  await finish();
}
