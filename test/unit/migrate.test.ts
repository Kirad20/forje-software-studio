import pg from "pg";
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
});
