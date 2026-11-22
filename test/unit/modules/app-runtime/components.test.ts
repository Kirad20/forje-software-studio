import { describe, expect, it } from "vitest";
import {
  buildClient, buildExamples, checkProject, compileServerModule, endpointRoutes, jobFiles, pageRoutes,
  readProjectServices, resolveServiceExecution,
} from "../../../../server/modules/app-runtime/index.js";
import { quickScan } from "../../../../server/modules/app-runtime/domain/securityScan.js";
import { projectMap } from "../../../../server/modules/builder/infrastructure/projectIndex.js";
import { roleCanWrite, validatePlan } from "../../../../server/modules/builder/domain/Plan.js";
import { standardsScan } from "../../../../server/modules/builder/domain/Standards.js";
import { layoutProblems, parseLayout } from "../../../../contracts/projectLayout.js";
import { starterFiles } from "../../../../server/modules/projects/index.js";

const manifest = {
  version: 1,
  components: {
    admin: { kind: "web", root: "apps/admin", mount: "/admin" },
    orders: { kind: "api", root: "services/orders", replicas: 2, maxConcurrency: 4 },
    billing: { kind: "worker", root: "services/billing" },
    domain: { kind: "library", root: "packages/domain" },
  },
};

/** A small but real architecture: app + admin frontend, an orders API with hexagonal layers, a worker and a shared library. */
function project(): Record<string, string> {
  return {
    "forja.json": JSON.stringify(manifest),
    "pages/_index.tsx": `export default function Home() { return <h1>Tienda abierta</h1>; }`,
    "apps/admin/base.css": `.admin-shell { color: rebeccapurple; }`,
    "apps/admin/pages/_layout.tsx": `export default function Layout({ children }: { children: React.ReactNode }) { return <div className="admin-shell">{children}</div>; }`,
    "apps/admin/pages/_index.tsx": `import { OrdersTable } from "../features/orders/OrdersTable";\nexport default function AdminHome() { return <OrdersTable />; }`,
    "apps/admin/pages/orders.$id.tsx": `export default function Order() { return <p>Pedido del panel</p>; }`,
    "apps/admin/features/orders/OrdersTable.tsx": `import { formatMoney } from "~/packages/domain/money";\nexport function OrdersTable() { return <ul><li>{formatMoney(1250)}</li></ul>; }`,
    "apps/admin/features/orders/OrdersTable.example.tsx": `import { OrdersTable } from "./OrdersTable";\nexport const Default = () => <OrdersTable />;`,
    "apps/admin/static/logo.svg": `<svg xmlns="http://www.w3.org/2000/svg"/>`,
    "packages/domain/money.ts": `export const formatMoney = (cents: number) => (cents / 100).toFixed(2) + " €";`,
    "services/orders/domain/order.ts": `import { formatMoney } from "~/packages/domain/money";\nexport const describeOrder = (id: string, cents: number) => \`\${id}: \${formatMoney(cents)}\`;`,
    "services/orders/application/placeOrder.ts": `import { describeOrder } from "../domain/order";\nexport async function placeOrder(id: string) { return { id, label: describeOrder(id, 1250) }; }`,
    "services/orders/endpoints/create_POST.ts": `import { placeOrder } from "../application/placeOrder";\nexport default async function handler() { return placeOrder("o-1"); }`,
    "services/orders/jobs/reindex.ts": `export default async function reindex() {}`,
    "services/billing/jobs/invoice.ts": `export default async function invoice() {}`,
    "endpoints/health_GET.ts": `export default async function health() { return { ok: true }; }`,
  };
}

describe("forja.json components at run time", () => {
  it("routes pages, endpoints and jobs of every component", () => {
    const files = project();
    expect(pageRoutes(files).map((p) => p.pattern).sort()).toEqual(["/", "/admin", "/admin/orders/:id"]);
    expect(endpointRoutes(files).map((e) => `${e.method} ${e.route}`).sort()).toEqual(["GET health", "POST orders/create"]);
    expect(jobFiles(files).map((j) => j.name).sort()).toEqual(["billing.invoice", "orders.reindex"]);
  });

  it("builds one browser bundle per page component, each with its own layout and styles", async () => {
    const files = project();
    const app = await buildClient(files);
    const admin = await buildClient(files, { component: "admin" });
    expect(app.js).toContain("Tienda abierta");
    expect(app.js).not.toContain("Pedido del panel");
    expect(admin.js).toContain("Pedido del panel");
    expect(admin.js).toContain("/admin/orders/:id");
    expect(admin.js).toContain("admin-shell");
    expect(admin.js).not.toContain("Tienda abierta");
    expect(admin.css).toContain("rebeccapurple");
    await expect(buildClient(files, { component: "orders" })).rejects.toThrow(/componente web/);
    const examples = await buildExamples(files, "apps/admin/features/orders/OrdersTable.example.tsx").catch((e) => e);
    // Examples of web components live under components/ or pages/ of the component, like the app's.
    expect(examples).toBeInstanceOf(Error);
  });

  it("compiles api endpoints through their hexagonal layers and the shared library", async () => {
    const files = project();
    const compiled = await compileServerModule(files, "services/orders/endpoints/create_POST.ts");
    expect(compiled.exports).toContain("default");
    const { default: handler } = await import(compiled.file);
    expect(await handler()).toEqual({ id: "o-1", label: "o-1: 12.50 €" });
  });

  it("gives components with replicas their own process pool and keeps the rest in the monolith", () => {
    const files = project();
    const services = readProjectServices(files)!;
    expect(Object.keys(services.services)).toEqual(["orders"]);
    expect(services.services.orders).toEqual({
      kind: "service", endpoints: ["services/orders/endpoints/create_POST.ts"], jobs: ["services/orders/jobs/reindex.ts"], replicas: 2, maxConcurrency: 4,
    });
    expect(resolveServiceExecution(files, "services/orders/endpoints/create_POST.ts")).toEqual({ service: "orders", replicas: 2, maxConcurrency: 4 });
    expect(resolveServiceExecution(files, "services/billing/jobs/invoice.ts").service).toBe("monolith");
    const clash = { ...files, "forja.services.json": JSON.stringify({ version: 1, services: { orders: { kind: "service", endpoints: ["endpoints/health_GET.ts"] } } }) };
    expect(() => readProjectServices(clash)).toThrow(/también es un componente/);
  });

  it("checks the whole architecture: a clean project builds, mistakes become problems", async () => {
    expect(await checkProject(project())).toEqual([]);
    const broken = { ...project(), "services/billing/endpoints/x_GET.ts": "export default async () => 1;", "lib/stray.ts": "export {}" };
    const problems = await checkProject(broken);
    expect(problems.some((p) => p.file === "services/billing/endpoints/x_GET.ts" && /componente api/.test(p.text))).toBe(true);
    expect(problems.some((p) => p.file === "lib/stray.ts")).toBe(true);
    const invalid = await checkProject({ ...project(), "forja.json": "{ nope" });
    expect(invalid.some((p) => p.file === "forja.json" && /JSON no válido/.test(p.text))).toBe(true);
    const badAdmin = { ...project(), "apps/admin/pages/broken.tsx": "export default function B() { return <main> }" };
    expect((await checkProject(badAdmin)).some((p) => p.file === "apps/admin/pages/broken.tsx")).toBe(true);
  });

  it("scans each component on the side it runs: secrets in a web component are client-side", () => {
    const files = { ...project(), "apps/admin/features/keys.ts": `export const key = "sk_live_${"a".repeat(24)}";` };
    const findings = quickScan(files, (...parts) => parts.join("|"));
    expect(findings.some((f) => f.file === "apps/admin/features/keys.ts" && f.severity === "critical")).toBe(true);
  });

  it("shows the components in the project map and lets each role own its components", () => {
    const files = project();
    const map = projectMap(files);
    expect(map).toContain("## Componentes (forja.json)");
    expect(map).toContain("orders · api · services/orders/ · /_api/orders/… · proceso propio (replicas 2, maxConcurrency 4)");
    expect(map).toContain("/admin/orders/:id ← apps/admin/pages/orders.$id.tsx");
    const layout = parseLayout(files["forja.json"]);
    expect(roleCanWrite("ui", "apps/admin/", layout)).toBe(true);
    expect(roleCanWrite("backend", "apps/admin/", layout)).toBe(false);
    expect(roleCanWrite("backend", "services/orders/", layout)).toBe(true);
    expect(roleCanWrite("backend", "packages/domain/money.ts", layout)).toBe(true);
    expect(roleCanWrite("ui", "services/orders/", layout)).toBe(false);
    const plan = {
      summary: "x", contract: "export {}",
      tasks: [
        { id: "api", role: "backend", goal: "orders", files: ["services/orders/", "packages/domain/"], done_when: ["POST orders/create responde"] },
        { id: "panel", role: "ui", goal: "panel", files: ["apps/admin/"], done_when: ["/admin lista pedidos"] },
      ],
    };
    expect(validatePlan(plan, layout).errors).toEqual([]);
    expect(validatePlan(plan).errors.some((e) => e.includes("services/orders/"))).toBe(true);
  });
  it("checks the standards of each component: boundaries between components and between layers", () => {
    const clean = standardsScan(project());
    expect(clean.filter((p) => (p.file ?? "").includes("/"))).toEqual([]);
    const files = {
      ...project(),
      "apps/admin/features/orders/Bad.tsx": `import { placeOrder } from "~/services/orders/application/placeOrder";\nexport const Bad = () => <a href="/admin/x" style={{ color: "#ff0000" }}>{String(placeOrder)}</a>;`,
      "packages/domain/leak.ts": `import { describeOrder } from "~/services/orders/domain/order";\nexport const leak = describeOrder;`,
      "services/orders/domain/impure.ts": `export const save = (ctx: any) => ctx.db.query("select 1 limit 1");`,
      "services/orders/application/usesInfra.ts": `import { repo } from "../infrastructure/repo";\nexport const run = () => repo;`,
      "services/orders/infrastructure/repo.ts": `export const repo = (ctx: any) => ctx.db.query("select * from orders");`,
      "services/orders/endpoints/list_GET.ts": `export default async (ctx: any) => ctx.db.query("select * from orders limit 10");`,
      "services/billing/jobs/peek.ts": `import { placeOrder } from "~/services/orders/application/placeOrder";\nexport default async () => placeOrder;`,
    };
    const texts = standardsScan(files).map((p) => `${p.file}: ${p.text}`);
    const has = (file: string, re: RegExp) => texts.some((t) => t.startsWith(file) && re.test(t));
    expect(has("apps/admin/features/orders/Bad.tsx", /servicio orders/)).toBe(true);
    expect(has("apps/admin/features/orders/Bad.tsx", /color escrito a mano/)).toBe(true);
    expect(has("apps/admin/features/orders/Bad.tsx", /<Link/)).toBe(true);
    expect(has("packages/domain/leak.ts", /library no depende/)).toBe(true);
    expect(has("services/orders/domain/impure.ts", /dominio usa ctx/)).toBe(true);
    expect(has("services/orders/application/usesInfra.ts", /capa application importa infrastructure/)).toBe(true);
    expect(has("services/orders/infrastructure/repo.ts", /sin LIMIT/)).toBe(true);
    expect(has("services/orders/endpoints/list_GET.ts", /punto de entrada/)).toBe(true);
    expect(has("services/billing/jobs/peek.ts", /comparten código solo a través de una library/)).toBe(true);
  });
  it("ships a components starter that builds cleanly and follows the component standards", async () => {
    const files = starterFiles("Demo", "components");
    expect(await checkProject(files)).toEqual([]);
    expect(standardsScan(files).filter((p) => /^(apps|services|packages)\//.test(p.file ?? ""))).toEqual([]);
    expect(pageRoutes(files).some((p) => p.pattern === "/admin")).toBe(true);
    expect(endpointRoutes(files).map((e) => `${e.method} ${e.route}`).sort()).toEqual(["GET orders/list", "POST orders/create"]);
    expect(jobFiles(files).map((j) => j.name).sort()).toEqual(["billing.invoice", "orders.invoiced"]);
    // Each service owns a schema: no shared tables in the root migrations.
    expect(Object.keys(files).filter((f) => f.startsWith("migrations/"))).toEqual([]);
    expect(parseLayout(files["forja.json"]!).components.filter((c) => c.database).map((c) => c.database)).toEqual(["orders", "billing"]);
    expect(Object.keys(readProjectServices(files)!.services)).toEqual(["orders"]);
  });
  it("ships the standard starter (web at /, api with its own schema, shared library) with no root app files", async () => {
    const files = starterFiles("Demo", "standard");
    expect(await checkProject(files)).toEqual([]);
    expect(layoutProblems(files)).toEqual([]);
    expect(standardsScan(files).filter((p) => /^(apps|services|packages)\//.test(p.file ?? ""))).toEqual([]);
    expect(Object.keys(files).filter((f) => !/^(apps|services|packages)\//.test(f))).toEqual(["forja.json"]);
    expect(pageRoutes(files).map((p) => p.pattern)).toEqual(["/"]);
    expect(endpointRoutes(files).map((e) => `${e.method} ${e.route}`)).toEqual(["GET v1/health"]);
    const layout = parseLayout(files["forja.json"]!);
    expect(layout.components.map((c) => `${c.name}:${c.kind}`)).toEqual(["app:app", "web:web", "api:api", "shared:library"]);
    expect(layout.components.find((c) => c.name === "api")?.database).toBe("api");
  });
});
