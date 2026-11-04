import { mkdirSync, rmSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { config, paths } from "../../../shared/config.js";
import type { ProjectDb } from "../ports/database.js";
import { ProjectDbClient } from "./projectDbClient.js";
export type { ProjectDb } from "../ports/database.js";

const remote = config.appDataServiceUrl
  ? new ProjectDbClient(config.appDataServiceUrl, config.appDataServiceToken)
  : undefined;

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

export interface ProjectDbMetrics {
  active: boolean;
  opens: number;
  openFailures: number;
  closes: number;
  operations: number;
  failedOperations: number;
  openMs: number;
  queueWaitMs: number;
  operationMs: number;
  lastOperationAt: string | null;
}

const open = new Map<string, Promise<Open>>();
const metricSnapshots = new Map<string, Omit<ProjectDbMetrics, "active">>();

function metricsFor(projectId: string) {
  let metrics = metricSnapshots.get(projectId);
  if (!metrics) {
    metrics = {
      opens: 0, openFailures: 0, closes: 0, operations: 0,
      failedOperations: 0, openMs: 0, queueWaitMs: 0,
      operationMs: 0, lastOperationAt: null,
    };
  }
  metricSnapshots.delete(projectId);
  metricSnapshots.set(projectId, metrics);
  while (metricSnapshots.size > 2000) metricSnapshots.delete(metricSnapshots.keys().next().value!);
  return metrics;
}

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
  const started = Date.now();
  const dir = paths.projectDb(projectId);
  const metrics = metricsFor(projectId);
  try {
    mkdirSync(dir, { recursive: true });
    const db = await PGlite.create(dir);
    await db.exec(BAAS_SCHEMA);
    metrics.opens++;
    metrics.openMs += Date.now() - started;
    const entry: Open = { db, timer: setTimeout(() => {}, 0), queue: Promise.resolve() };
    return entry;
  } catch (error) {
    metrics.openFailures++;
    metrics.openMs += Date.now() - started;
    throw error;
  }
}

function scheduleSleep(projectId: string, entry: Open) {
  clearTimeout(entry.timer);
  entry.timer = setTimeout(async () => {
    open.delete(projectId);
    await entry.queue.catch(() => {});
    try {
      await entry.db.close();
      metricsFor(projectId).closes++;
    } catch (error) {
      console.warn(`[forja] no se pudo cerrar la base del proyecto ${projectId}:`, (error as Error).message);
    }
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
  const queuedAt = Date.now();
  const entry = await get(projectId);
  const metrics = metricsFor(projectId);
  metrics.queueWaitMs += Date.now() - queuedAt;
  const next = entry.queue.then(async () => {
    const started = Date.now();
    metrics.operations++;
    metrics.lastOperationAt = new Date(started).toISOString();
    try {
      return await fn(entry.db);
    } catch (error) {
      metrics.failedOperations++;
      throw error;
    } finally {
      metrics.operationMs += Date.now() - started;
    }
  });
  entry.queue = next.catch(() => {});
  return next;
}

export function projectDb(projectId: string): ProjectDb {
  if (remote) return remote.forProject(projectId);
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
  if (remote) return remote.execSql(projectId, sql);
  return run(projectId, async (db) => {
    const results = await db.exec(sql);
    return results.map((r) => ({
      fields: r.fields.map((f) => f.name),
      rows: r.rows,
      affectedRows: r.affectedRows ?? 0,
    }));
  });
}

/** A full copy of the database files, for the Data tab's export button. */
export async function dumpDatabase(projectId: string): Promise<Blob> {
  if (remote) return remote.dumpDatabase(projectId);
  return run(projectId, async (db) => (await db.dumpDataDir("gzip")) as Blob);
}

/** Closes a project's database now (before deleting or replacing its files). */
export async function closeProject(projectId: string) {
  if (remote) return remote.closeProject(projectId);
  const existing = open.get(projectId);
  if (!existing) return;
  open.delete(projectId);
  const e = await existing.catch(() => null);
  if (e) {
    clearTimeout(e.timer);
    await e.queue.catch(() => {});
    await e.db.close();
    metricsFor(projectId).closes++;
  }
}

/** Copies a project's whole database into another project's (used by "duplicate"). */
export async function cloneDatabase(fromProjectId: string, toProjectId: string) {
  if (remote) return remote.cloneDatabase(fromProjectId, toProjectId);
  const dump = await dumpDatabase(fromProjectId);
  await closeProject(toProjectId);
  const dir = paths.projectDb(toProjectId);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const db = await PGlite.create(dir, { loadDataDir: dump });
  await db.close();
}

export async function closeAll() {
  if (remote) return remote.closeAll();
  for (const [id, p] of open) {
    open.delete(id);
    const e = await p.catch(() => null);
    if (e) {
      clearTimeout(e.timer);
      await e.queue.catch(() => {});
      await e.db.close();
      metricsFor(id).closes++;
    }
  }
}

export async function isAwake(projectId: string) {
  return remote ? remote.isAwake(projectId) : open.has(projectId);
}

export async function projectDbMetrics(projectId: string): Promise<ProjectDbMetrics> {
  if (remote) return remote.metrics<ProjectDbMetrics>(projectId);
  return { active: open.has(projectId), ...metricsFor(projectId) };
}
