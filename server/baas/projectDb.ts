import { mkdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { config, paths } from "../config.js";

/**
 * One Postgres database per project, shared by the preview and the published app.
 * A database closes after `dbIdleMs` without queries and reopens on the next one —
 * the local equivalent of a serverless Postgres scaling to zero.
 */
interface Open {
  db: PGlite;
  timer: NodeJS.Timeout;
  queue: Promise<unknown>;
}

const open = new Map<string, Promise<Open>>();

/** Tables the BaaS keeps in every project database. Prefixed so they sort apart from app tables. */
const BAAS_SCHEMA = /* sql */ `
create table if not exists _forja_users (
  id text primary key,
  email text not null unique,
  name text,
  role text not null default 'user',
  password_hash text,
  failed_logins integer not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists _forja_sessions (
  token_hash text primary key,
  user_id text not null references _forja_users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create table if not exists _forja_reset_codes (
  id serial primary key,
  user_id text not null references _forja_users(id) on delete cascade,
  code_hash text not null,
  attempts integer not null default 0,
  used boolean not null default false,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
`;

async function openDb(projectId: string): Promise<Open> {
  const dir = paths.projectDb(projectId);
  mkdirSync(dir, { recursive: true });
  const db = await PGlite.create(dir);
  await db.exec(BAAS_SCHEMA);
  const entry: Open = { db, timer: setTimeout(() => {}, 0), queue: Promise.resolve() };
  return entry;
}

function scheduleSleep(projectId: string, entry: Open) {
  clearTimeout(entry.timer);
  entry.timer = setTimeout(async () => {
    open.delete(projectId);
    await entry.queue.catch(() => {});
    await entry.db.close().catch(() => {});
  }, config.dbIdleMs);
  entry.timer.unref();
}

async function get(projectId: string): Promise<Open> {
  let p = open.get(projectId);
  if (!p) {
    p = openDb(projectId);
    open.set(projectId, p);
    p.catch(() => open.delete(projectId));
  }
  const entry = await p;
  scheduleSleep(projectId, entry);
  return entry;
}

/** PGlite is single-connection; queue work so a transaction never interleaves with other queries. */
async function run<T>(projectId: string, fn: (db: PGlite) => Promise<T>): Promise<T> {
  const entry = await get(projectId);
  const next = entry.queue.then(() => fn(entry.db));
  entry.queue = next.catch(() => {});
  return next;
}

export interface ProjectDb {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  one<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | undefined>;
  /** Runs several statements (no parameters). */
  exec(sql: string): Promise<void>;
  transaction<T>(fn: (tx: Pick<ProjectDb, "query" | "one">) => Promise<T>): Promise<T>;
}

export function projectDb(projectId: string): ProjectDb {
  const api: ProjectDb = {
    query: (sql, params = []) => run(projectId, async (db) => (await db.query(sql, params)).rows as never),
    one: async (sql, params = []) => (await api.query(sql, params))[0] as never,
    exec: (sql) => run(projectId, async (db) => void (await db.exec(sql))),
    transaction: (fn) =>
      run(projectId, (db) =>
        db.transaction(async (tx) => {
          const t = {
            query: async (sql: string, params: unknown[] = []) => (await tx.query(sql, params)).rows as never,
            one: async (sql: string, params: unknown[] = []) => (await tx.query(sql, params)).rows[0] as never,
          };
          return fn(t);
        }),
      ),
  };
  return api;
}

/** Runs arbitrary SQL (possibly several statements) and returns every result set, for the Data tab and the builder. */
export async function execSql(projectId: string, sql: string) {
  return run(projectId, async (db) => {
    const results = await db.exec(sql);
    return results.map((r) => ({
      fields: r.fields.map((f) => f.name),
      rows: r.rows,
      affectedRows: r.affectedRows ?? 0,
    }));
  });
}

export async function describeSchema(projectId: string, includeInternal = false) {
  const rows = await projectDb(projectId).query<{ table_name: string; column_name: string; data_type: string; is_nullable: string; column_default: string | null }>(
    `select table_name, column_name, data_type, is_nullable, column_default from information_schema.columns
     where table_schema = 'public' order by table_name, ordinal_position`,
  );
  const tables: Record<string, { name: string; type: string; nullable: boolean; default: string | null }[]> = {};
  for (const r of rows) {
    if (!includeInternal && r.table_name.startsWith("_forja_")) continue;
    (tables[r.table_name] ??= []).push({
      name: r.column_name,
      type: r.data_type,
      nullable: r.is_nullable === "YES",
      default: r.column_default,
    });
  }
  return tables;
}

/** A full copy of the database files, for the Data tab's export button. */
export async function dumpDatabase(projectId: string): Promise<Blob> {
  return run(projectId, async (db) => (await db.dumpDataDir("gzip")) as Blob);
}

export async function closeAll() {
  for (const [id, p] of open) {
    open.delete(id);
    const e = await p.catch(() => null);
    if (e) await e.db.close().catch(() => {});
  }
}

export const isAwake = (projectId: string) => open.has(projectId);
