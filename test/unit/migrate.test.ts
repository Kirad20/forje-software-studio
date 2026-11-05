import pg from "pg";
import { readFileSync } from "node:fs";
import { afterAll, describe, expect, it } from "vitest";
import { migrate } from "../../server/shared/database/migrate.js";
import { freshDatabase } from "../helpers/pg.mjs";

const db = await freshDatabase();
const pool = new pg.Pool({ connectionString: db.url });
afterAll(async () => {
  await pool.end();
  await db.drop();
});

describe("migrations", () => {
  it("apply in order once, and two concurrent runs do not apply anything twice", async () => {
    const [a, b] = await Promise.all([migrate(pool), migrate(pool)]);
    const applied = [...a, ...b];
    expect(applied[0]).toBe("001_init");
    expect(new Set(applied).size).toBe(applied.length);
    expect(await migrate(pool)).toEqual([]);
    const rows = (await pool.query<{ version: string }>(`select version from schema_migrations order by version`)).rows.map((r) => r.version);
    expect(rows).toEqual([...applied].sort());
    // The schema is really there.
    expect((await pool.query(`select count(*)::int as n from accounts`)).rows[0].n).toBe(0);
  });

  it("maps legacy project modes and constrains future values to Fusion modes", async () => {
    await pool.query(`insert into accounts (id, email) values ('fusion-modes', 'fusion-modes@test.local')`);
    await pool.query(`alter table projects drop constraint if exists projects_model_mode_check`);
    for (const [id, legacy] of [["saving", "saving"], ["balanced", "balanced"], ["quality", "quality"]]) {
      await pool.query(`insert into projects (id, owner_id, name, model_mode) values ($1, 'fusion-modes', $1, $2)`, [id, legacy]);
    }
    const migration = readFileSync(new URL("../../server/shared/database/migrations/010_fusion_modes.sql", import.meta.url), "utf8");
    await pool.query(migration);
    const rows = await pool.query<{ id: string; model_mode: string }>(
      `select id, model_mode from projects where owner_id = 'fusion-modes' order by id`,
    );
    expect(rows.rows).toEqual([
      { id: "balanced", model_mode: "high" },
      { id: "quality", model_mode: "max" },
      { id: "saving", model_mode: "standard" },
    ]);
    await expect(pool.query(
      `insert into projects (id, owner_id, name, model_mode) values ('invalid-mode', 'fusion-modes', 'invalid', 'balanced')`,
    )).rejects.toThrow();
    const inserted = await pool.query<{ model_mode: string }>(
      `insert into projects (id, owner_id, name) values ('default-mode', 'fusion-modes', 'default') returning model_mode`,
    );
    expect(inserted.rows[0]?.model_mode).toBe("standard");
  });
});
