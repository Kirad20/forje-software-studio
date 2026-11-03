import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type pg from "pg";
import { ROOT_DIR } from "../config.js";

export const MIGRATIONS_DIR = path.join(ROOT_DIR, "server", "shared", "database", "migrations");

/** Arbitrary, fixed key: every Forja process boots under the same lock. */
const LOCK = 727_274;

/**
 * Applies the pending files of server/shared/database/migrations in name order, each in its own
 * transaction, and records them in schema_migrations. Two processes booting at once
 * serialize on an advisory lock, so a migration never runs twice.
 * Returns the versions it applied.
 */
export async function migrate(pool: pg.Pool, dir = MIGRATIONS_DIR): Promise<string[]> {
  const files = readdirSync(dir)
    .filter((f) => /^\d{3}_[\w-]+\.sql$/.test(f))
    .sort();
  const client = await pool.connect();
  const applied: string[] = [];
  try {
    await client.query(`select pg_advisory_lock($1)`, [LOCK]);
    await client.query(`create table if not exists schema_migrations (version text primary key, applied_at timestamptz not null default now())`);
    const done = new Set((await client.query<{ version: string }>(`select version from schema_migrations`)).rows.map((r) => r.version));
    for (const file of files) {
      const version = file.replace(/\.sql$/, "");
      if (done.has(version)) continue;
      try {
        await client.query("begin");
        await client.query(readFileSync(path.join(dir, file), "utf8"));
        await client.query(`insert into schema_migrations (version) values ($1)`, [version]);
        await client.query("commit");
      } catch (e) {
        await client.query("rollback").catch(() => {});
        throw new Error(`Falló la migración ${file}: ${(e as Error).message}`);
      }
      applied.push(version);
    }
  } finally {
    await client.query(`select pg_advisory_unlock($1)`, [LOCK]).catch(() => {});
    client.release();
  }
  return applied;
}
