import { PGlite } from "@electric-sql/pglite";
import { expect, it, vi } from "vitest";
import { createProjectRows } from "../../../../server/modules/app-services/application/projectData.js";
import { createProjectRowsRepository } from "../../../../server/modules/app-services/infrastructure/projectRows.js";
import type { ProjectDb } from "../../../../server/modules/app-services/ports/database.js";

it("preserves studio row CRUD, search, primary-key and safe user behavior with real PGlite", async () => {
  const pg = await PGlite.create();
  try {
    await pg.exec(`
      create table items (id serial primary key, name text default 'default');
      create table compound (a int, b int, primary key(a,b));
      create table _forja_users (id text primary key, email text, name text, role text, password_hash text, created_at timestamptz default now());
      insert into _forja_users values ('u','user@example.com','User','user','secret-hash',now());
    `);
    const db: ProjectDb = {
      query: async (sql, params = []) => (await pg.query(sql, params)).rows as never,
      one: async (sql, params = []) => (await pg.query(sql, params)).rows[0] as never,
      exec: async (sql) => { await pg.exec(sql); },
      transaction: vi.fn(),
    };
    const platformOne = vi.fn().mockResolvedValue({ ai: 2, storage: 3, email: 4, creditsUsed: 5 });
    const api = createProjectRows(
      async () => db.query(`select table_name,column_name,data_type,is_nullable,column_default from information_schema.columns where table_schema='public' order by table_name,ordinal_position`),
      createProjectRowsRepository(() => db, platformOne),
    );
    expect(await api.createProjectRow("p", "items", { name: "", ignored: "bad" })).toEqual({ id: 1, name: "default" });
    await api.createProjectRow("p", "items", { name: "second" });
    const page = await api.listProjectRows("p", { table: "items", limit: 1, offset: 1 });
    expect(page).toMatchObject({ rows: [{ id: 2, name: "second" }], total: 2, primaryKey: "id" });
    expect((await api.listProjectRows("p", { table: "items", search: "SECOND" })).rows).toHaveLength(1);
    expect((await api.listProjectRows("p", { table: "_forja_users" })).rows[0].password_hash).toBe("••••");
    expect(await api.listAppUsers("p")).toEqual([expect.objectContaining({ id: "u", hasPassword: true })]);
    expect((await api.listAppUsers("p"))[0]).not.toHaveProperty("password_hash");
    await expect(api.listProjectRows("p", { table: 'items"; drop table items; --' })).rejects.toMatchObject({ status: 404 });
    await expect(api.deleteProjectRows("p", "compound", [1])).rejects.toMatchObject({ status: 400 });
    expect(await api.deleteProjectRows("p", "items", [2])).toBe(1);
    expect((await api.listProjectRows("p", { table: "items" })).total).toBe(1);
    expect(await api.projectServiceCounts("p")).toEqual({ users: 1, ai: 2, storage: 3, email: 4, creditsUsed: 5 });
    expect(platformOne).toHaveBeenCalledWith(expect.any(String), ["p"]);
  } finally {
    await pg.close();
  }
}, 30_000);
