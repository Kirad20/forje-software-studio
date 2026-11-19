import { describe, expect, it } from "vitest";
import { starterFiles } from "../../../../server/modules/projects/index.js";
import { checkProject, endpointRoutes, jobFiles, readProjectServices, resolveServiceExecution } from "../../../../server/modules/app-runtime/index.js";
import { extractComponent, formatMigrationPlan, planComponentMigration } from "../../../../server/modules/builder/infrastructure/componentMigration.js";
import { parseLayout } from "../../../../contracts/projectLayout.js";

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
