import pg from "pg";
import { config } from "../config.js";
import { migrate } from "./migrate.js";
import { seedDefaults } from "./seeds/defaults.js";

/**
 * The platform's own database, on a Postgres server (DATABASE_URL): accounts, projects, their
 * source files, checkpoints, publish snapshots, chat history, secrets, settings and every
 * service log. Each project's app data lives in a separate PGlite database (app-services).
 * The schema is versioned in server/shared/database/migrations and applied on first use, followed by the
 * default seed (builtin providers and models).
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

let pool: pg.Pool | undefined;
let ready: Promise<PlatformDb> | undefined;

const wrap = (p: pg.Pool | pg.PoolClient): Tx => ({
  query: async <T,>(sql: string, params: unknown[] = []) => ({ rows: (await p.query(sql, params)).rows as T[] }),
});

export function platformDb(): Promise<PlatformDb> {
  ready ??= (async () => {
    if (!config.databaseUrl) throw new Error("Falta DATABASE_URL (postgres://usuario:clave@host:5432/forja): la plataforma guarda sus datos en Postgres.");
    const configuredMax = process.env.DATABASE_POOL_MAX;
    const max = configuredMax === undefined ? 10 : Number(configuredMax);
    if (!Number.isInteger(max) || max < 1 || max > 100) throw new Error(`DATABASE_POOL_MAX debe ser un entero entre 1 y 100; recibido: ${configuredMax}`);
    pool = new pg.Pool({ connectionString: config.databaseUrl, max, connectionTimeoutMillis: 10_000 });
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
    await seedDefaults(db);
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
