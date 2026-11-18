import { afterEach, describe, expect, it, vi } from "vitest";
import { rm } from "node:fs/promises";
import path from "node:path";

const pathsMock = vi.hoisted(() => ({ root: "" }));
pathsMock.root = path.join(process.cwd(), "node_modules", ".cache", `.test-component-db-${process.pid}`);

vi.mock("../../../../server/shared/operationalLog.js", () => ({ recordOperationalEvent: vi.fn() }));
vi.mock("../../../../server/shared/config.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../../server/shared/config.js")>();
  return {
    ...actual,
    config: { ...actual.config, appDataServiceUrl: "", dbIdleMs: 60_000 },
    paths: {
      ...actual.paths,
      projectDb: (projectId: string, env: "preview" | "published" = "published") =>
        path.join(pathsMock.root, projectId, env === "preview" ? "preview-db" : "db"),
    },
  };
});

import { applyProjectMigrations, closeAll, execSql, projectDb } from "../../../../server/modules/app-services/infrastructure/projectDb.js";
import { schemaRows } from "../../../../server/modules/app-services/infrastructure/repositories.js";
import { createProjectRowsRepository } from "../../../../server/modules/app-services/infrastructure/projectRows.js";
import { layoutProblems, parseLayout } from "../../../../contracts/projectLayout.js";
import { createPublication } from "../../../../server/modules/app-runtime/application/publication.js";

afterEach(async () => {
  await closeAll();
  await rm(pathsMock.root, { recursive: true, force: true });
});

const manifest = JSON.stringify({
  version: 1,
  components: {
    orders: { kind: "api", root: "services/orders", database: true },
    billing: { kind: "worker", root: "services/billing", database: "billing_data" },
    reports: { kind: "api", root: "services/reports" },
  },
});

/** The app's own table plus one schema per data component, each with its own numbering. */
function files(extra: Record<string, string> = {}): Record<string, string> {
  return {
    "forja.json": manifest,
    "migrations/001_app.sql": "create table notes (id serial primary key, body text not null);",
    "services/orders/migrations/001_orders.sql": "create table orders (id text primary key, total integer not null);",
    "services/orders/migrations/002_status.sql": "alter table orders add column status text not null default 'new';",
    "services/billing/migrations/001_invoices.sql": "create table invoices (order_id text primary key, total integer not null);",
    ...extra,
  };
}

describe("database per service (forja.json \"database\")", () => {
  it("validates the database field of the manifest", () => {
    const layout = parseLayout(manifest);
    expect(layout.components.map((c) => [c.name, c.database ?? null])).toEqual([["app", null], ["orders", "orders"], ["billing", "billing_data"], ["reports", null]]);
    const bad = (components: unknown) => () => parseLayout(JSON.stringify({ version: 1, components }));
    expect(bad({ x: { kind: "api", root: "s/x", database: "public" } })).toThrow(/database/);
    expect(bad({ x: { kind: "api", root: "s/x", database: "pg_x" } })).toThrow(/database/);
    expect(bad({ x: { kind: "web", root: "a/x", database: true } })).toThrow(/campo desconocido "database"/);
    expect(bad({ x: { kind: "api", root: "s/x", database: "d" }, y: { kind: "worker", root: "s/y", database: "d" } })).toThrow(/ya lo usa x/);
    const problems = layoutProblems({ "forja.json": manifest, "services/reports/migrations/001_x.sql": "select 1" });
    expect(problems.some((p) => p.file === "services/reports/migrations/001_x.sql" && /database/.test(p.text))).toBe(true);
  });

  it("applies each component's migrations inside its own schema, with its own order", async () => {
    const result = await applyProjectMigrations("p1", files(), "preview");
    expect(result.applied.sort()).toEqual([
      "migrations/001_app.sql", "services/billing/migrations/001_invoices.sql",
      "services/orders/migrations/001_orders.sql", "services/orders/migrations/002_status.sql",
    ]);
    const tables = [...new Set((await schemaRows("p1", "preview")).map((r) => r.table_name))];
    expect(tables).toEqual(expect.arrayContaining(["notes", "billing_data.invoices", "orders.orders"]));
    expect(tables).not.toContain("orders");
    // Re-applying is a no-op; a later migration of one component does not need to outrank the app's.
    expect((await applyProjectMigrations("p1", files(), "preview")).applied).toEqual([]);
    const next = files({ "services/billing/migrations/002_paid.sql": "alter table invoices add column paid boolean not null default false;" });
    expect((await applyProjectMigrations("p1", next, "preview")).applied).toEqual(["services/billing/migrations/002_paid.sql"]);
    const out = files({ "services/orders/migrations/001_late.sql": "create table late (id int);" });
    await expect(applyProjectMigrations("p1", out, "preview")).rejects.toThrow(/número de orden único/);
    const changed = { ...next, "services/orders/migrations/001_orders.sql": "create table orders (id text);" };
    await expect(applyProjectMigrations("p1", changed, "preview")).rejects.toThrow(/fue modificada/);
  });

  it("confines a component's ctx.db to its schema with a role of its own", async () => {
    await applyProjectMigrations("p1", files(), "preview");
    const orders = projectDb("p1", "preview", "orders");
    await orders.query("insert into orders (id, total) values ($1, $2)", ["o-1", 1250]);
    expect(await orders.query("select id, total, status from orders")).toEqual([{ id: "o-1", total: 1250, status: "new" }]);
    expect(await orders.one<{ current_user: string }>("select current_user")).toEqual({ current_user: "forja_c_orders" });
    await expect(orders.query("select * from public.notes")).rejects.toThrow(/permission denied/);
    await expect(orders.query("select * from billing_data.invoices")).rejects.toThrow(/permission denied/);
    await expect(orders.query("select * from public._forja_users")).rejects.toThrow(/permission denied/);
    await expect(orders.query("select set_config('role', 'postgres', true)")).rejects.toThrow(/configuración de la sesión/);
    await expect(orders.query(`select U&"\\0073et_config"('role', 'postgres', true)`)).rejects.toThrow(/configuración de la sesión/);
    await expect(orders.exec("drop table orders")).rejects.toThrow(/ctx.db solo permite/);
    const total = await orders.transaction(async (tx) => {
      await tx.query("insert into orders (id, total) values ('o-2', 10)");
      return (await tx.one<{ n: number }>("select sum(total)::int as n from orders"))!.n;
    });
    expect(total).toBe(1260);
    // A failed transaction leaves nothing behind.
    await expect(orders.transaction(async (tx) => {
      await tx.query("insert into orders (id, total) values ('o-3', 1)");
      throw new Error("boom");
    })).rejects.toThrow("boom");
    expect((await orders.query("select id from orders order by id")).map((r) => r.id)).toEqual(["o-1", "o-2"]);
  });

  it("keeps the app's database unchanged and able to read every schema", async () => {
    await applyProjectMigrations("p1", files(), "preview");
    await projectDb("p1", "preview", "orders").query("insert into orders (id, total) values ('o-1', 5)");
    const app = projectDb("p1", "preview");
    await app.query("insert into notes (body) values ('hola')");
    expect(await app.query("select body from notes")).toEqual([{ body: "hola" }]);
    expect(await app.query("select id from orders.orders")).toEqual([{ id: "o-1" }]);
    expect(await app.one<{ current_user: string }>("select current_user")).toEqual({ current_user: "postgres" });
  });

  it("isolates a component that has no migrations yet and lets preview SQL work inside a schema", async () => {
    await applyProjectMigrations("p1", files(), "preview");
    await execSql("p1", "insert into invoices (order_id, total) values ('o-9', 3)", "preview", "billing_data");
    expect(await projectDb("p1", "preview", "billing_data").query("select order_id from invoices")).toEqual([{ order_id: "o-9" }]);
    const empty = projectDb("p1", "preview", "fresh_schema");
    expect(await empty.query("select 1 as ok")).toEqual([{ ok: 1 }]);
    await expect(empty.query("select * from public.notes")).rejects.toThrow(/permission denied/);
  });

  it("browses component tables in the Data panel as schema.table", async () => {
    await applyProjectMigrations("p1", files(), "preview");
    await projectDb("p1", "preview", "orders").query("insert into orders (id, total) values ('o-1', 7)");
    const rows = createProjectRowsRepository(projectDb, (async () => undefined) as never);
    expect(await rows.primaryKeys("p1", "orders.orders", "preview")).toEqual(["id"]);
    expect(await rows.read("p1", "orders.orders", ["id", "total", "status"], "id", 10, 0, "", "preview")).toEqual({ rows: [{ id: "o-1", total: 7, status: "new" }], total: 1 });
    expect(await rows.primaryKeys("p1", "notes", "preview")).toEqual(["id"]);
  });
});

describe("retiring or moving a component's database", () => {
  const withManifest = (components: Record<string, unknown>, rest: Record<string, string>) => ({ "forja.json": JSON.stringify({ version: 1, components }), ...rest });
  const ordersSql = files()["services/orders/migrations/001_orders.sql"]!;
  const statusSql = files()["services/orders/migrations/002_status.sql"]!;
  const invoicesSql = files()["services/billing/migrations/001_invoices.sql"]!;

  it("keeps a component's history when its folder moves, keyed by schema and file name", async () => {
    await applyProjectMigrations("p1", files(), "preview");
    const ledger = (await projectDb("p1", "preview").query<{ migration_name: string }>("select migration_name from _forja_migrations order by 1")).map((r) => r.migration_name);
    expect(ledger).toEqual(["billing_data:migrations/001_invoices.sql", "migrations/001_app.sql", "orders:migrations/001_orders.sql", "orders:migrations/002_status.sql"]);
    const moved = withManifest(
      { sales: { kind: "api", root: "services/sales", database: "orders" }, billing: { kind: "worker", root: "services/billing", database: "billing_data" } },
      { "migrations/001_app.sql": files()["migrations/001_app.sql"]!, "services/sales/migrations/001_orders.sql": ordersSql, "services/sales/migrations/002_status.sql": statusSql, "services/billing/migrations/001_invoices.sql": invoicesSql },
    );
    expect(await applyProjectMigrations("p1", moved, "preview")).toEqual({ applied: [] });
  });

  it("retires a schema whose component drops \"database\": its data stays and publishing goes on", async () => {
    await applyProjectMigrations("p1", files(), "preview");
    await projectDb("p1", "preview", "billing_data").query("insert into invoices (order_id, total) values ('o-1', 9)");
    const withoutBilling = withManifest(
      { orders: { kind: "api", root: "services/orders", database: true }, billing: { kind: "worker", root: "services/billing" } },
      { "migrations/001_app.sql": files()["migrations/001_app.sql"]!, "services/orders/migrations/001_orders.sql": ordersSql, "services/orders/migrations/002_status.sql": statusSql },
    );
    expect(await applyProjectMigrations("p1", withoutBilling, "preview")).toEqual({ applied: [], retired: ["billing_data"] });
    expect(await projectDb("p1", "preview").query("select order_id from billing_data.invoices")).toEqual([{ order_id: "o-1" }]);
    // The orders track keeps its own order while billing's history is set aside.
    const next = { ...withoutBilling, "services/orders/migrations/003_note.sql": "alter table orders add column note text;" };
    expect(await applyProjectMigrations("p1", next, "preview")).toEqual({ applied: ["services/orders/migrations/003_note.sql"], retired: ["billing_data"] });
    // Declaring it again with its migrations brings it back, data included.
    expect(await applyProjectMigrations("p1", { ...files(), "services/orders/migrations/003_note.sql": "alter table orders add column note text;" }, "preview")).toEqual({ applied: [] });
    expect(await projectDb("p1", "preview", "billing_data").query("select order_id from invoices")).toEqual([{ order_id: "o-1" }]);
  });

  it("still refuses to lose history of a schema that is in use, and explains how to retire it", async () => {
    await applyProjectMigrations("p1", files(), "preview");
    const missing = files();
    delete missing["services/orders/migrations/002_status.sql"];
    await expect(applyProjectMigrations("p1", missing, "preview")).rejects.toThrow(/migrations\/002_status\.sql del esquema orders ya no está en el proyecto.*quita "database"/);
    const reused = { ...files(), "services/billing/migrations/001_invoices.sql": "create table invoices (id int);" };
    await expect(applyProjectMigrations("p1", reused, "preview")).rejects.toThrow(/fue modificada\. El esquema billing_data ya la tiene aplicada/);
  });

  it("re-keys component migrations recorded by path before schema-based keys", async () => {
    await applyProjectMigrations("p1", files(), "preview");
    const app = projectDb("p1", "preview");
    await app.query("update _forja_migrations set migration_name = 'services/orders/migrations/001_orders.sql' where migration_name = 'orders:migrations/001_orders.sql'");
    expect(await applyProjectMigrations("p1", files(), "preview")).toEqual({ applied: [] });
    expect((await app.query<{ migration_name: string }>("select migration_name from _forja_migrations where migration_name like '%001_orders%'")).map((r) => r.migration_name)).toEqual(["orders:migrations/001_orders.sql"]);
  });

  it("tells the owner when a publication leaves a schema retired", async () => {
    const publication = createPublication({
      getProject: async () => ({ id: "p", name: "Shop" }),
      isSlugTaken: async () => false,
      readAllFiles: async () => ({}),
      checkProject: async () => [],
      scan: async () => [],
      applyMigrations: async () => ({ applied: [], retired: ["billing_data"] }),
      ensureOwner: async () => {}, recordPublish: async () => {}, scheduleProject: async () => {}, unpublish: async () => {},
      appUrl: (slug: string) => `http://${slug}.localhost`,
    } as never);
    const result = await publication.publishProject("p", "shop");
    expect(result).toMatchObject({ slug: "shop", warnings: [expect.stringMatching(/billing_data.*se conserva con sus datos/)] });
    const plain = createPublication({
      getProject: async () => ({ id: "p", name: "Shop" }), isSlugTaken: async () => false, readAllFiles: async () => ({}),
      checkProject: async () => [], scan: async () => [], applyMigrations: async () => ({ applied: [] }),
      ensureOwner: async () => {}, recordPublish: async () => {}, scheduleProject: async () => {}, unpublish: async () => {},
      appUrl: (slug: string) => `http://${slug}.localhost`,
    } as never);
    expect(await plain.publishProject("p", "shop")).toEqual({ slug: "shop", url: "http://shop.localhost" });
  });
});

describe("moving a legacy table into a service's schema", () => {
  it("lets the service's role use a table moved with alter table … set schema, keeping its rows", async () => {
    const legacyFiles = { "migrations/001_orders.sql": "create table orders (id serial primary key, total integer not null);" };
    await applyProjectMigrations("p1", legacyFiles, "preview");
    await projectDb("p1", "preview").query("insert into orders (total) values (5), (7)");
    const extracted = {
      ...legacyFiles,
      "forja.json": JSON.stringify({ version: 1, components: { orders: { kind: "api", root: "services/orders", database: "orders" } } }),
      "services/orders/migrations/20261118100000000_extract_orders.sql": 'alter table public."orders" set schema "orders";',
    };
    expect((await applyProjectMigrations("p1", extracted, "preview")).applied).toEqual(["services/orders/migrations/20261118100000000_extract_orders.sql"]);
    const orders = projectDb("p1", "preview", "orders");
    expect((await orders.query<{ total: number }>("select total from orders order by id")).map((r) => r.total)).toEqual([5, 7]);
    // The serial sequence moved too, and the role may use it.
    expect(await orders.one<{ id: number }>("insert into orders (total) values (9) returning id")).toEqual({ id: 3 });
    await expect(projectDb("p1", "preview").query("select * from public.orders")).rejects.toThrow(/does not exist/);
  });
});
