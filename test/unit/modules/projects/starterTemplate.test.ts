import { createRequire } from "node:module";
import path from "node:path";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";
import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it, vi } from "vitest";
import { starterFiles } from "../../../../server/modules/projects/index.js";
import { CreateProjectUseCase } from "../../../../server/modules/projects/application/CreateProjectUseCase.js";
import { readProjectServices, verifyBuild } from "../../../../server/modules/app-runtime/index.js";

function load(files: Record<string, string>, file: string): any {
  const module = { exports: {} };
  const require = createRequire(import.meta.url);
  const code = transformSync(files[file]!, { loader: "ts", format: "cjs" }).code;
  runInNewContext(code, {
    module, exports: module.exports,
    require: (specifier: string) => specifier.startsWith(".")
      ? load(files, path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier)) + ".ts")
      : require(specifier),
  });
  return module.exports;
}

function creation() {
  const store = { create: vi.fn(), getProject: vi.fn().mockResolvedValue({ id: "p1" }), logChange: vi.fn() };
  const services = { projectId: () => "p1", templates: vi.fn(starterFiles), warmup: vi.fn() };
  return { store, services, useCase: new CreateProjectUseCase(store, services) };
}

describe("opt-in orders/invoices starter", () => {
  it("preserves the original default and forwards an explicit selector through creation", async () => {
    const { store, useCase } = creation();
    await useCase.execute({ ownerId: "owner", name: "Demo" });
    expect(store.create.mock.calls[0]![1]).toEqual(starterFiles("Demo"));
    expect(starterFiles("Demo")["forja.services.json"]).toBeUndefined();
    await useCase.execute({ ownerId: "owner", name: "Demo", template: "orders-invoices" });
    const files = store.create.mock.calls[1]![1];
    expect(readProjectServices(files)?.services.invoices.kind).toBe("worker");
    expect(files["endpoints/orders/create_POST.ts"]).toBeDefined();
  });

  it("rejects invalid selectors before persistence, even when files are supplied", async () => {
    const { store, useCase } = creation();
    await expect(useCase.execute({ ownerId: "owner", name: "Demo", template: "typo" as never, files: {} })).rejects.toThrow(/template/i);
    expect(store.create).not.toHaveBeenCalled();
    expect(() => starterFiles("Demo", "typo" as never)).toThrow(/template/i);
  });

  it("accepts orders before invoice execution, persists readable status, and deduplicates invoice delivery", async () => {
    const files = starterFiles("Demo", "orders-invoices");
    const create = load(files, "endpoints/orders/create_POST.ts").default;
    const status = load(files, "endpoints/orders/status_GET.ts").default;
    const invoice = load(files, "jobs/invoice.ts").default;
    const pg = await PGlite.create();
    const db = {
      exec: (sql: string) => pg.exec(sql),
      one: async (sql: string, params: unknown[] = []) => (await pg.query(sql, params)).rows[0],
      transaction: (fn: (tx: any) => Promise<unknown>) => pg.transaction((tx) => fn({
        query: async (sql: string, params: unknown[] = []) => (await tx.query(sql, params)).rows,
        one: async (sql: string, params: unknown[] = []) => (await tx.query(sql, params)).rows[0],
      })),
    };
    const enqueue = vi.fn().mockResolvedValue("queue-1");
    const orderId = "550e8400-e29b-41d4-a716-446655440000";
    const fail = (code: number, message: string): never => { throw new Error(`${code}: ${message}`); };
    try {
      const accepted = await create({ db, jobs: { enqueue }, body: { orderId }, fail });
      expect(accepted).toMatchObject({ orderId, queueId: "queue-1" });
      expect(enqueue).toHaveBeenCalledWith("invoice", { orderId });
      expect(await status({ db, query: { orderId }, fail })).toMatchObject({ order: { status: "pending" }, invoice: null });
      const failingDb = {
        ...db,
        transaction: (fn: (tx: any) => Promise<unknown>) => db.transaction((tx) => fn({
          ...tx,
          query: (sql: string, params: unknown[]) => {
            if (sql.startsWith("update orders")) throw new Error("interrupted");
            return tx.query(sql, params);
          },
        })),
      };
      await expect(invoice({ db: failingDb, payload: { orderId }, fail })).rejects.toThrow("interrupted");
      expect(await status({ db, query: { orderId }, fail })).toMatchObject({ order: { status: "pending" }, invoice: null });
      await invoice({ db, payload: { orderId }, fail });
      await invoice({ db, payload: { orderId }, fail });
      expect(await status({ db, query: { orderId }, fail })).toMatchObject({ order: { status: "invoiced" }, invoice: { order_id: orderId, amount_cents: 2500 } });
      expect((await pg.query("select * from invoices")).rows).toHaveLength(1);
      await create({ db, jobs: { enqueue }, body: { orderId }, fail });
      expect((await pg.query("select * from orders")).rows).toHaveLength(1);
      expect(await status({ db, query: { orderId }, fail })).toMatchObject({ order: { status: "invoiced" } });
      const secondId = "550e8400-e29b-41d4-a716-446655440001";
      enqueue.mockRejectedValueOnce(new Error("queue unavailable"));
      await expect(create({ db, jobs: { enqueue }, body: { orderId: secondId }, fail })).rejects.toThrow("queue unavailable");
      expect(await status({ db, query: { orderId: secondId }, fail })).toMatchObject({ order: { status: "pending" }, invoice: null });
      await create({ db, jobs: { enqueue }, body: { orderId: secondId }, fail });
      expect((await pg.query("select * from orders where id = $1", [secondId])).rows).toHaveLength(1);
    } finally {
      await pg.close();
    }
  }, 60_000);

  it("compiles and typechecks the selected example through the public runtime verifier", async () => {
    const files = starterFiles("Demo", "orders-invoices");
    expect(files["jobs/invoice.ts"]).toBeDefined();
    expect(await verifyBuild(files)).toEqual({ ok: true, problems: [] });
  }, 60_000);
});
