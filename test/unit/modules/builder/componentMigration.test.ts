import { describe, expect, it } from "vitest";
import { starterFiles } from "../../../../server/modules/projects/index.js";
import { checkProject, endpointRoutes, jobFiles, readProjectServices, resolveServiceExecution } from "../../../../server/modules/app-runtime/index.js";
import { extractComponent, formatMigrationPlan, migrateToStandard, planComponentMigration } from "../../../../server/modules/builder/infrastructure/componentMigration.js";
import { layoutProblems, parseLayout } from "../../../../contracts/projectLayout.js";
import { rewriteImports } from "../../../../server/modules/builder/infrastructure/rename.js";
import { resolveImport } from "../../../../server/modules/builder/infrastructure/projectIndex.js";

/** A real legacy project: bounded contexts in helpers/, endpoints/orders/, jobs/ and forja.services.json. */
const legacy = () => starterFiles("Demo", "orders-invoices");

describe("migrating a legacy project to components", () => {
  it("plans one component per context without touching anything", () => {
    const files = legacy();
    const plan = planComponentMigration(files);
    expect(plan.legacy).toBe(true);
    const byName = Object.fromEntries(plan.contexts.map((c) => [c.context, c]));
    expect(Object.keys(byName).sort()).toEqual(["invoices", "orders"]);
    expect(byName.orders).toMatchObject({
      kind: "api", component: "orders", root: "services/orders/", routes: ["POST orders/create", "GET orders/status"], routeChanges: [],
      jobs: ["order-invoiced"], replicas: 2, maxConcurrency: 8, library: { component: "orders-shared", root: "packages/orders/" },
    });
    // What the page imports goes to a library; server code to the service.
    expect(byName.orders!.moves).toContainEqual({ from: "helpers/orders/domain.ts", to: "packages/orders/domain.ts" });
    expect(byName.orders!.moves).toContainEqual({ from: "helpers/orders/adapters.ts", to: "services/orders/adapters.ts" });
    expect(byName.invoices).toMatchObject({ kind: "worker", jobs: ["invoice"], replicas: 2, maxConcurrency: 1, library: null });
    expect(byName.orders!.tables.exclusive).toContain("orders");
    expect([...byName.orders!.tables.exclusive, ...byName.orders!.tables.shared]).not.toContain("zod");
    expect(formatMigrationPlan(plan)).toContain("sigue funcionando igual");
    expect(files).toEqual(legacy());
  });

  it("extracts a context keeping routes, job names and scale, and the result builds", async () => {
    const files = legacy();
    const ex = extractComponent(files, { context: "orders" });
    expect(await checkProject(ex.files)).toEqual([]);
    expect(endpointRoutes(ex.files).map((e) => `${e.method} ${e.route}`).sort()).toEqual(["GET orders/status", "POST orders/create"]);
    expect(jobFiles(ex.files).map((j) => j.name).sort()).toEqual(["invoice", "order-invoiced"]);
    expect(Object.keys(ex.files).filter((f) => f.startsWith("helpers/orders/") || f.startsWith("endpoints/orders/"))).toEqual([]);
    expect(ex.files["services/orders/endpoints/create_POST.ts"]).toContain('from "../application"');
    const component = parseLayout(ex.files["forja.json"]!).components.find((c) => c.name === "orders")!;
    expect(component).toMatchObject({ kind: "api", route: "orders", replicas: 2, maxConcurrency: 8, legacyJobNames: true });
    expect(resolveServiceExecution(ex.files, "services/orders/endpoints/create_POST.ts")).toEqual({ service: "orders", replicas: 2, maxConcurrency: 8 });
    // The legacy topology keeps only what was not extracted.
    expect(Object.keys(JSON.parse(ex.files["forja.services.json"]!).services)).toEqual(["invoices"]);
    expect(ex.renames.length).toBe(7);
    expect(ex.writes["forja.json"]).toBeDefined();
  });

  it("extracts every context in turn until the legacy topology disappears", async () => {
    const first = extractComponent(legacy(), { context: "orders" });
    const second = extractComponent(first.files, { context: "invoices" });
    expect(second.deletes).toEqual(["forja.services.json"]);
    expect(second.files["forja.services.json"]).toBeUndefined();
    expect(await checkProject(second.files)).toEqual([]);
    expect(Object.keys(readProjectServices(second.files)!.services).sort()).toEqual(["invoices", "orders"]);
    expect(planComponentMigration(second.files)).toMatchObject({ legacy: false, contexts: [] });
  });

  it("moves only exclusive tables into a service's own schema", () => {
    const ex = extractComponent(legacy(), { context: "orders", database: true, moveTables: ["orders"], now: new Date("2026-11-18T10:00:00Z") });
    expect(ex.migration).toBe("services/orders/migrations/20261118100000000_extract_orders.sql");
    expect(ex.files[ex.migration!]).toContain('alter table public."orders" set schema "orders";');
    expect(parseLayout(ex.files["forja.json"]!).components.find((c) => c.name === "orders")!.database).toBe("orders");
    expect(() => extractComponent(legacy(), { context: "orders", database: true, moveTables: ["invoices"] })).toThrow(/solo las tablas que usa únicamente/);
    expect(() => extractComponent(legacy(), { context: "orders", moveTables: ["orders"] })).toThrow(/database: true/);
  });

  it("refuses what it cannot do safely", () => {
    expect(() => extractComponent(legacy(), { context: "nope" })).toThrow(/No hay un contexto "nope"/);
    const once = extractComponent(legacy(), { context: "orders" });
    expect(() => extractComponent({ ...once.files, "endpoints/orders/extra_GET.ts": "export default async () => 1;" }, { context: "orders" })).toThrow(/"orders" ya sirve \/_api\/orders\/\. Mueve estos archivos dentro de él con rename_file \(endpoints\/orders\/extra_GET\.ts\)/);
  });
});

describe("migrating the whole monolith to the standard structure", () => {
  const monolith = () => {
    const files = legacy();
    delete files["forja.services.json"];
    return files;
  };

  it("moves everything in one step keeping every route, job name and import, and the result builds", async () => {
    const files = monolith();
    const m = migrateToStandard(files);
    expect(await checkProject(m.files)).toEqual([]);
    expect(layoutProblems(m.files)).toEqual([]);
    expect(endpointRoutes(m.files).map((e) => `${e.method} ${e.route}`).sort()).toEqual(endpointRoutes(files).map((e) => `${e.method} ${e.route}`).sort());
    expect(jobFiles(m.files).map((j) => j.name).sort()).toEqual(jobFiles(files).map((j) => j.name).sort());
    expect(Object.keys(m.files).filter((f) => /^(pages|components|helpers|endpoints|jobs)\//.test(f))).toEqual([]);
    const layout = parseLayout(m.files["forja.json"]!);
    expect(layout.components.find((c) => c.name === "web")).toMatchObject({ kind: "web", mount: "/", root: "apps/web/" });
    expect(layout.components.find((c) => c.name === "api")).toMatchObject({ kind: "api", route: "", legacyJobNames: true, root: "services/api/" });
    expect(layout.components.find((c) => c.name === "api")!.database).toBeUndefined();
    expect(layout.components.find((c) => c.name === "shared")).toMatchObject({ kind: "library", root: "packages/shared/" });
    // What a page imports is shared; server code is not. The frontend reaches shared code by alias.
    expect(m.moves).toContainEqual({ from: "helpers/orders/domain.ts", to: "packages/shared/orders/domain.ts" });
    expect(m.moves).toContainEqual({ from: "helpers/orders/adapters.ts", to: "services/api/orders/adapters.ts" });
    expect(Object.entries(m.files).some(([p, c]) => p.startsWith("apps/web/") && c.includes("~/packages/shared/"))).toBe(true);
    expect(m.counts.web + m.counts.api + m.counts.shared + m.counts.stays).toBe(Object.keys(files).length);
    expect(m.routes.length).toBe(endpointRoutes(files).length);
    expect(m.warnings.join(" ")).toContain("migrations/ se queda en la raíz");
    expect(m.writes["forja.json"]).toBeDefined();
    expect(files).toEqual(monolith());
  });

  it("matches moving the files one by one with rewriteImports", () => {
    const files = monolith();
    const m = migrateToStandard(files);
    let map = { ...files };
    for (const { from, to } of m.moves) {
      const rewrites = rewriteImports(map, from, to);
      const content = map[from]!;
      delete map[from];
      map[to] = content;
      map = { ...map, ...rewrites };
    }
    // Same specifiers except where a relative import now crosses components (bulk uses the ~/ alias there).
    const resolves = (all: Record<string, string>) => Object.fromEntries(Object.entries(all).filter(([p]) => /\.tsx?$/.test(p)).map(([p, c]) => [p, [...c.matchAll(/from\s*["']([^"']+)["']/g)].map((x) => resolveImport(p, x[1]!, all)).filter(Boolean)]));
    expect(resolves(m.files)).toEqual(resolves({ ...map, "forja.json": m.files["forja.json"]! }));
  });

  it("refuses what it cannot move safely and does nothing twice", () => {
    expect(() => migrateToStandard(legacy())).toThrow(/forja\.services\.json/);
    const m = migrateToStandard(monolith());
    expect(() => migrateToStandard(m.files)).toThrow(/ya está en componentes/);
    expect(() => migrateToStandard({ ...monolith(), "pom.xml": "<project/>" })).toThrow(/Spring Boot/);
    const manifest = JSON.stringify({ version: 1, components: { api: { kind: "api", root: "services/old", route: "old" } } });
    expect(() => migrateToStandard({ ...monolith(), "forja.json": manifest })).toThrow(/Ya existe un componente "api"/);
    expect(() => migrateToStandard({ ...monolith(), "apps/web/pages/_index.tsx": "x" })).toThrow(/Ya existe apps\/web\/pages\/_index\.tsx/);
  });
});
