import { afterEach, expect, it, vi } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { createAppDataService } from "../../../../server/modules/app-services/infrastructure/appDataService.js";
import { ProjectDbClient } from "../../../../server/modules/app-services/infrastructure/projectDbClient.js";
import type { ProjectDb } from "../../../../server/modules/app-services/ports/database.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

it("sends project database requests with the internal service credential", async () => {
  const fetch = vi.fn(async () => Response.json([{ id: "u1" }]));
  vi.stubGlobal("fetch", fetch);
  const client = new ProjectDbClient("http://app-runtime:4200", "shared-token");

  await expect(client.forProject("project/1").query("select * from users", ["a"])).resolves.toEqual([{ id: "u1" }]);
  expect(fetch).toHaveBeenCalledWith(
    "http://app-runtime:4200/internal/data/project%2F1/query",
    expect.objectContaining({
      method: "POST",
      headers: { authorization: "Bearer shared-token", "content-type": "application/json" },
      body: JSON.stringify({ sql: "select * from users", params: ["a"] }),
    }),
  );
});

it("runs callback transactions remotely and rolls them back when the callback fails", async () => {
  const fetch = vi.fn(async (input: string | URL | Request) => {
    const url = input.toString();
    if (url.endsWith("/transaction/begin")) return Response.json({ transactionId: "tx-1" });
    if (url.endsWith("/transaction/query")) return Response.json([{ id: "u1" }]);
    return Response.json({ ok: true });
  });
  vi.stubGlobal("fetch", fetch);
  const client = new ProjectDbClient("http://app-runtime:4200", "shared-token");
  const db = client.forProject("project-1");

  await expect(db.transaction(async (tx) => {
    const row = await tx.one<{ id: string }>("select id from users");
    if (!row) throw new Error("Missing row");
    return row.id;
  })).resolves.toBe("u1");

  await expect(db.transaction(async (tx) => {
    await tx.query("delete from users");
    throw new Error("abort");
  })).rejects.toThrow("abort");

  expect(fetch.mock.calls.map(([url]) => url.toString())).toEqual([
    "http://app-runtime:4200/internal/data/project-1/transaction/begin",
    "http://app-runtime:4200/internal/data/project-1/transaction/query",
    "http://app-runtime:4200/internal/data/project-1/transaction/commit",
    "http://app-runtime:4200/internal/data/project-1/transaction/begin",
    "http://app-runtime:4200/internal/data/project-1/transaction/query",
    "http://app-runtime:4200/internal/data/project-1/transaction/rollback",
  ]);
});

it("surfaces non-success responses instead of returning empty results", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response("database offline", { status: 503 })));
  const db = new ProjectDbClient("http://app-runtime:4200", "shared-token").forProject("project-1");

  await expect(db.query("select 1")).rejects.toThrow("App data service returned 503: database offline");
});

it("preserves commit and rollback semantics across the internal HTTP boundary", async () => {
  const pg = await PGlite.create();
  await pg.exec("create table users (id text primary key)");
  const projectDb: ProjectDb = {
    query: async <T>(sql: string, params: unknown[] = []) => (await pg.query(sql, params)).rows as T[],
    one: async <T>(sql: string, params: unknown[] = []) => (await pg.query(sql, params)).rows[0] as T | undefined,
    exec: async (sql) => { await pg.exec(sql); },
    transaction: (fn) => pg.transaction(async (tx) => fn({
      query: async <T>(sql: string, params: unknown[] = []) => (await tx.query(sql, params)).rows as T[],
      one: async <T>(sql: string, params: unknown[] = []) => (await tx.query(sql, params)).rows[0] as T | undefined,
    })),
  };
  const app = createAppDataService({
    projectDb: () => projectDb,
    execSql: async () => [],
    dumpDatabase: async () => new Blob(),
    closeProject: async () => {},
    cloneDatabase: async () => {},
    closeAll: async () => {},
    isAwake: () => true,
  }, "runtime-token");
  vi.stubGlobal("fetch", (input: string | URL | Request, init?: RequestInit) => app.request(input.toString(), init));

  try {
    const db = new ProjectDbClient("http://app-runtime:4200", "runtime-token").forProject("project-1");
    await db.transaction(async (tx) => { await tx.query("insert into users values ($1)", ["committed"]); });
    await expect(db.transaction(async (tx) => {
      await tx.query("insert into users values ($1)", ["rolled-back"]);
      throw new Error("cancel");
    })).rejects.toThrow("cancel");

    await expect(db.query<{ id: string }>("select id from users order by id")).resolves.toEqual([{ id: "committed" }]);
  } finally {
    vi.unstubAllGlobals();
    await pg.close();
  }
});
