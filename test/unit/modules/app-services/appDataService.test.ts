import { expect, it, vi } from "vitest";
import { createAppDataService } from "../../../../server/modules/app-services/infrastructure/appDataService.js";
import type { ProjectDb } from "../../../../server/modules/app-services/ports/database.js";

function databasePorts() {
  const query = vi.fn(async (_sql: string, _params: unknown[] = []) => [{ id: "u1" }]);
  const one = vi.fn(async () => ({ id: "u1" }));
  const exec = vi.fn(async () => {});
  let db: ProjectDb;
  const transaction = vi.fn();
  db = {
    query: async <T>(sql: string, params?: unknown[]) => await query(sql, params) as unknown as T[],
    one: async <T>() => one() as T,
    exec,
    transaction: async <T>(fn: (tx: Pick<ProjectDb, "query" | "one">) => Promise<T>) => {
      transaction();
      return fn(db);
    },
  };
  return {
    query, exec, transaction,
    projectDb: () => db,
    execSql: vi.fn(async () => [{ fields: ["id"], rows: [{ id: "u1" }], affectedRows: 0 }]),
    applyProjectMigrations: vi.fn(async () => ({ applied: ["migrations/001_schema.sql"] })),
    dumpDatabase: vi.fn(async () => new Blob(["database"])),
    closeProject: vi.fn(async () => {}),
    cloneDatabase: vi.fn(async () => {}),
    closeAll: vi.fn(async () => {}),
    isAwake: vi.fn(() => true),
    dbMetrics: vi.fn(() => ({ active: true, opens: 1, openFailures: 0, closes: 0, operations: 2, failedOperations: 0, totalOpenMs: 8, totalQueueMs: 3, totalOperationMs: 5 })),
  };
}

it("requires the internal service credential before exposing project databases", async () => {
  const app = createAppDataService(databasePorts(), "runtime-secret");
  const response = await app.request("/internal/data/project-1/query", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sql: "select 1", params: [] }),
  });

  expect(response.status).toBe(401);
});

it("forwards database operations and transaction sessions to the owner", async () => {
  const ports = databasePorts();
  const app = createAppDataService(ports, "runtime-secret");
  const post = (path: string, body: unknown) =>
    app.request(path, {
      method: "POST",
      headers: { authorization: "Bearer runtime-secret", "content-type": "application/json" },
      body: JSON.stringify(body),
    });

  const query = await post("/internal/data/project-1/query", { sql: "select 1", params: [] });
  expect(query.status).toBe(200);
  await expect(query.json()).resolves.toEqual([{ id: "u1" }]);

  const begin = await post("/internal/data/project-1/transaction/begin", {});
  const { transactionId } = await begin.json() as { transactionId: string };
  const txQuery = await post(`/internal/data/project-1/transaction/query`, { transactionId, sql: "select 1", params: [] });
  expect(txQuery.status).toBe(200);
  await post("/internal/data/project-1/transaction/commit", { transactionId });

  expect(ports.query).toHaveBeenCalledWith("select 1", []);
  expect(ports.transaction).toHaveBeenCalledOnce();
});

it("returns the supported database lifecycle operations", async () => {
  const ports = databasePorts();
  const app = createAppDataService(ports, "runtime-secret");
  const post = (path: string, body: unknown = {}) =>
    app.request(path, {
      method: "POST",
      headers: { authorization: "Bearer runtime-secret", "content-type": "application/json" },
      body: JSON.stringify(body),
    });

  await expect((await post("/internal/data/project-1/awake")).json()).resolves.toBe(true);
  await expect((await post("/internal/data/project-1/exec-sql", { sql: "select 1" })).json()).resolves.toEqual([
    { fields: ["id"], rows: [{ id: "u1" }], affectedRows: 0 },
  ]);
  await expect((await post("/internal/data/project-1/migrations/apply", {
    env: "preview", migrations: [{ path: "migrations/001_schema.sql", sql: "create table notes(id int);" }],
  })).json()).resolves.toEqual({ applied: ["migrations/001_schema.sql"] });
  const dump = await post("/internal/data/project-1/dump");
  await expect(dump.json()).resolves.toEqual({ data: Buffer.from("database").toString("base64") });
  await post("/internal/data/project-1/close");
  await post("/internal/data/project-1/clone", { toProjectId: "project-2" });
  await post("/internal/data/close-all");

  expect(ports.closeProject).toHaveBeenCalledWith("project-1", undefined);
  expect(ports.cloneDatabase).toHaveBeenCalledWith("project-1", "project-2");
  expect(ports.closeAll).toHaveBeenCalledOnce();
});

it("exposes project database timing metrics through the internal service", async () => {
  const ports = databasePorts();
  const app = createAppDataService(ports, "runtime-secret");
  const response = await app.request("/internal/data/project-1/metrics", {
    method: "POST",
    headers: { authorization: "Bearer runtime-secret", "content-type": "application/json" },
    body: "{}",
  });

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toMatchObject({ active: true, opens: 1, operations: 2 });
  expect(ports.dbMetrics).toHaveBeenCalledWith("project-1", "preview");
});
