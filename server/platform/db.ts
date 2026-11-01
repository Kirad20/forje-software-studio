import pg from "pg";
import { config } from "../config.js";
import { migrate } from "../db/migrate.js";

/**
 * The platform's own database, on a Postgres server (DATABASE_URL): accounts, projects, their
 * source files, checkpoints, publish snapshots, chat history, secrets, settings and every
 * service log. Each project's app data lives in a separate PGlite database (see baas/projectDb.ts).
 * The schema is versioned in server/db/migrations and applied on first use.
 */

// PGlite returned numbers for these and the code assumes it: count(*), sums, round(…::numeric).
pg.types.setTypeParser(pg.types.builtins.INT8, (v) => Number(v));
pg.types.setTypeParser(pg.types.builtins.NUMERIC, (v) => Number(v));

/** What a transaction callback gets: the same `query → { rows }` shape PGlite had. */
export interface Tx {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

export interface PlatformDb extends Tx {
  exec(sql: string): Promise<void>;
  transaction<R>(fn: (tx: Tx) => Promise<R>): Promise<R>;
}

/** Runs once the schema is ready, before the first query is served (seeders). */
const readyHooks: (() => Promise<void>)[] = [];
export const onPlatformDbReady = (fn: () => Promise<void>) => void readyHooks.push(fn);

let pool: pg.Pool | undefined;
let ready: Promise<PlatformDb> | undefined;

const wrap = (p: pg.Pool | pg.PoolClient): Tx => ({
  query: async <T,>(sql: string, params: unknown[] = []) => ({ rows: (await p.query(sql, params)).rows as T[] }),
});

export function platformDb(): Promise<PlatformDb> {
  ready ??= (async () => {
    if (!config.databaseUrl) throw new Error("Falta DATABASE_URL (postgres://usuario:clave@host:5432/forja): la plataforma guarda sus datos en Postgres.");
    pool = new pg.Pool({ connectionString: config.databaseUrl, max: 10 });
    // An idle client losing its connection (Postgres restart) must not crash the process.
    pool.on("error", (e) => console.warn("[forja] Postgres:", e.message));
    await migrate(pool);
    const p = pool;
    const db: PlatformDb = {
      ...wrap(p),
      exec: async (sql) => void (await p.query(sql)),
      async transaction(fn) {
        const client = await p.connect();
        try {
          await client.query("begin");
          const out = await fn(wrap(client));
          await client.query("commit");
          return out;
        } catch (e) {
          await client.query("rollback").catch(() => {});
          throw e;
        } finally {
          client.release();
        }
      },
    };
    // Hooks query through q(), which awaits `ready`: hand them the db through a resolved promise.
    ready = Promise.resolve(db);
    for (const hook of readyHooks) await hook();
    return db;
  })().catch((e) => {
    ready = undefined;
    throw e;
  });
  return ready;
}

export async function closePlatformDb() {
  const p = pool;
  pool = undefined;
  ready = undefined;
  await p?.end();
}

export async function q<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  return (await (await platformDb()).query<T>(sql, params)).rows;
}

export async function one<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  return (await q<T>(sql, params))[0];
}
