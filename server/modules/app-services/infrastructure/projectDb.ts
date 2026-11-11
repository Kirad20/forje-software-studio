import { createHash } from "node:crypto";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { config, paths } from "../../../shared/config.js";
import type { AppEnv } from "../domain/contracts.js";
import type { ProjectDb } from "../ports/database.js";
import { ProjectDbClient } from "./projectDbClient.js";
import { PROJECT_CACHE_SCHEMA } from "./cache.js";
export type { ProjectDb } from "../ports/database.js";
export type ProjectDbEnv = AppEnv;

export interface ProjectMigration {
  path: string;
  sql: string;
}

const remote = config.appDataServiceUrl
  ? new ProjectDbClient(config.appDataServiceUrl, config.appDataServiceToken)
  : undefined;

/**
 * The legacy `db` directory remains production so existing projects retain their data.
 * Preview is an isolated lazy copy under `preview-db`; each environment idles separately.
 */
interface Open {
  db: PGlite;
  timer: NodeJS.Timeout;
  queue: Promise<unknown>;
  /** Operations queued or running; an entry with any is never evicted. */
  active: number;
  closed: boolean;
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

/** Insertion order is recency: `get` moves a key to the end, so the first keys are the least recently used. */
const open = new Map<string, Promise<Open>>();
const ready = new Map<string, Open>();
/** A database being closed must finish before the same files are opened again. */
const closing = new Map<string, Promise<void>>();
const metricSnapshots = new Map<string, Omit<ProjectDbMetrics, "active">>();
const previewCopies = new Map<string, Promise<void>>();
const migrationQueues = new Map<string, Promise<unknown>>();

const dbKey = (projectId: string, env: ProjectDbEnv) => `${projectId}\0${env}`;
const databasePath = (projectId: string, env: ProjectDbEnv) => paths.projectDb(projectId, env);

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
create table if not exists _forja_migrations (
  migration_name text primary key,
  checksum text not null,
  applied_at timestamptz not null default now()
);
`;

async function openDb(projectId: string, env: ProjectDbEnv): Promise<Open> {
  const started = Date.now();
  const dir = databasePath(projectId, env);
  const key = dbKey(projectId, env);
  const metrics = metricsFor(key);
  try {
    mkdirSync(dir, { recursive: true });
    const db = await PGlite.create(dir, pgliteOptions());
    await db.exec(BAAS_SCHEMA);
    await db.exec(PROJECT_CACHE_SCHEMA);
    metrics.opens++;
    metrics.openMs += Date.now() - started;
    const entry: Open = { db, timer: setTimeout(() => {}, 0), queue: Promise.resolve(), active: 0, closed: false };
    ready.set(key, entry);
    return entry;
  } catch (error) {
    metrics.openFailures++;
    metrics.openMs += Date.now() - started;
    throw error;
  }
}

/**
 * Postgres' default buffer pool (128MB) is sized for a server; an app database has one connection
 * and the OS page cache behind it. A small pool cuts each open database's memory roughly in three.
 */
function pgliteOptions() {
  return { startParams: [...PGlite.defaultStartParams, "-c", `shared_buffers=${config.projectDbs.sharedBuffers}`, "-c", "temp_buffers=2MB", "-c", "wal_buffers=1MB"] };
}

/** Marks the entry closed at once (callers retry with a fresh one), then waits for queued work and closes it. */
function closeEntry(key: string, entry: Open): Promise<void> {
  if (entry.closed) return closing.get(key) ?? Promise.resolve();
  entry.closed = true;
  clearTimeout(entry.timer);
  if (ready.get(key) === entry) {
    ready.delete(key);
    open.delete(key);
  }
  const done = (async () => {
    await entry.queue.catch(() => {});
    try {
      await entry.db.close();
      metricsFor(key).closes++;
    } catch (error) {
      console.warn(`[forja] no se pudo cerrar la base del proyecto ${key}:`, (error as Error).message);
    }
  })();
  closing.set(key, done);
  void done.finally(() => {
    if (closing.get(key) === done) closing.delete(key);
  });
  return done;
}

function scheduleSleep(key: string, entry: Open) {
  clearTimeout(entry.timer);
  entry.timer = setTimeout(() => {
    if (entry.active > 0) scheduleSleep(key, entry);
    else void closeEntry(key, entry);
  }, config.dbIdleMs);
  entry.timer.unref();
}

/** Over the cap, close the least recently used idle databases. Busy ones are never closed, so the cap is soft. */
function evictOverflow(keep: string) {
  let excess = open.size - config.projectDbs.maxOpen;
  for (const key of open.keys()) {
    if (excess <= 0) break;
    const entry = ready.get(key);
    if (key === keep || !entry || entry.active > 0) continue;
    void closeEntry(key, entry);
    excess--;
  }
}

async function ensurePreviewCopy(projectId: string): Promise<void> {
  const dir = databasePath(projectId, "preview");
  if (existsSync(dir)) return;
  let pending = previewCopies.get(projectId);
  if (!pending) {
    pending = (async () => {
      if (existsSync(dir)) return;
      const dump = await run(projectId, "published", (db) => db.dumpDataDir("gzip"));
      mkdirSync(path.dirname(dir), { recursive: true });
      try {
        const copy = await PGlite.create(dir, { ...pgliteOptions(), loadDataDir: dump });
        await copy.close();
      } catch (error) {
        rmSync(dir, { recursive: true, force: true });
        throw error;
      }
    })();
    previewCopies.set(projectId, pending);
    pending.finally(() => {
      if (previewCopies.get(projectId) === pending) previewCopies.delete(projectId);
    }).catch(() => {});
  }
  await pending;
}

async function get(projectId: string, env: ProjectDbEnv): Promise<Open> {
  if (env === "preview") await ensurePreviewCopy(projectId);
  const key = dbKey(projectId, env);
  for (;;) {
    await closing.get(key);
    let p = open.get(key);
    if (p) {
      open.delete(key);
      open.set(key, p);
    } else {
      p = openDb(projectId, env);
      open.set(key, p);
      p.catch(() => { if (open.get(key) === p) open.delete(key); });
      evictOverflow(key);
    }
    const entry = await p;
    // Evicted or put to sleep while we waited: open it again.
    if (entry.closed) continue;
    scheduleSleep(key, entry);
    return entry;
  }
}

/** PGlite is single-connection; queue work so a transaction never interleaves with other queries. */
async function run<T>(projectId: string, env: ProjectDbEnv, fn: (db: PGlite) => Promise<T>): Promise<T> {
  const queuedAt = Date.now();
  const key = dbKey(projectId, env);
  const entry = await get(projectId, env);
  entry.active++;
  const metrics = metricsFor(key);
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
      entry.active--;
    }
  });
  entry.queue = next.catch(() => {});
  return next;
}

function assertRuntimeSql(sql: string) {
  const statements: string[] = [];
  let statement = "";
  let state: "normal" | "single" | "double" | "line" | "block" | "dollar" = "normal";
  let blockDepth = 0;
  let dollarTag = "";
  let escapeString = false;
  for (let i = 0; i < sql.length;) {
    const c = sql[i]!;
    const next = sql[i + 1];
    if (state === "line") {
      if (c === "\n") { state = "normal"; statement += " "; }
      i++;
      continue;
    }
    if (state === "block") {
      if (c === "/" && next === "*") { blockDepth++; i += 2; }
      else if (c === "*" && next === "/") { if (!--blockDepth) state = "normal"; i += 2; }
      else i++;
      continue;
    }
    if (state === "single") {
      if (c === "'" && next === "'") i += 2;
      else if (c === "'") { state = "normal"; i++; }
      else if (escapeString && c === "\\" && next !== undefined) i += 2;
      else i++;
      continue;
    }
    if (state === "double") {
      if (c === '"' && next === '"') { statement += '""'; i += 2; }
      else if (c === '"') { statement += c; state = "normal"; i++; }
      else { statement += c; i++; }
      continue;
    }
    if (state === "dollar") {
      if (sql.startsWith(dollarTag, i)) { i += dollarTag.length; state = "normal"; dollarTag = ""; }
      else i++;
      continue;
    }
    if (c === "-" && next === "-") { state = "line"; i += 2; }
    else if (c === "/" && next === "*") { state = "block"; blockDepth = 1; i += 2; }
    else if (c === "'") {
      escapeString = i > 0 && /[eE]/.test(sql[i - 1]!) && (i < 2 || !/[a-zA-Z0-9_$]/.test(sql[i - 2]!));
      state = "single";
      i++;
    }
    else if (c === '"') { state = "double"; statement += c; i++; }
    else if (c === "$") {
      const tag = /^\$(?:[a-z_][a-z_0-9]*)?\$/i.exec(sql.slice(i))?.[0];
      if (tag) { state = "dollar"; dollarTag = tag; i += tag.length; }
      else { statement += c; i++; }
    } else if (c === ";") {
      if (statement.trim()) statements.push(statement);
      statement = "";
      i++;
    } else { statement += c; i++; }
  }
  if (statement.trim()) statements.push(statement);
  const allowed = /^(?:select|with|insert|update|delete|truncate|values|show|explain)\b/i;
  if (!statements.length || statements.some((part) => !allowed.test(part.trimStart()))) {
    throw new Error("ctx.db solo permite consultas y operaciones de datos; cambia el esquema con execute_sql y una migración.");
  }
}

export function projectDb(projectId: string, env: ProjectDbEnv = "published"): ProjectDb {
  if (remote) return remote.forProject(projectId, env);
  const api: ProjectDb = {
    query: (sql, params = []) => {
      assertRuntimeSql(sql);
      return run(projectId, env, async (db) => (await db.query(sql, params)).rows as never);
    },
    one: async (sql, params = []) => (await api.query(sql, params))[0] as never,
    exec: (sql) => {
      assertRuntimeSql(sql);
      return run(projectId, env, async (db) => void (await db.exec(sql)));
    },
    transaction: (fn) =>
      run(projectId, env, (db) =>
        db.transaction(async (tx) => {
          const t = {
            query: async (sql: string, params: unknown[] = []) => {
              assertRuntimeSql(sql);
              return (await tx.query(sql, params)).rows as never;
            },
            one: async (sql: string, params: unknown[] = []) => {
              assertRuntimeSql(sql);
              return (await tx.query(sql, params)).rows[0] as never;
            },
          };
          return fn(t);
        }),
      ),
  };
  return api;
}

/** Runs data SQL against preview; schema SQL must be applied through a tracked migration. */
export async function execSql(projectId: string, sql: string, env: ProjectDbEnv = "preview") {
  assertRuntimeSql(sql);
  if (remote) return remote.execSql(projectId, sql, env);
  return run(projectId, env, async (db) => {
    const results = await db.exec(sql);
    return results.map((r) => ({
      fields: r.fields.map((f) => f.name),
      rows: r.rows,
      affectedRows: r.affectedRows ?? 0,
    }));
  });
}

const MIGRATION_PATH = /^migrations\/\d+_[A-Za-z0-9_.$-]+\.sql$/;
const checksum = (sql: string) => createHash("sha256").update(sql).digest("hex");
const migrationVersion = (path: string) => BigInt(/^migrations\/(\d+)_/.exec(path)![1]!);

function orderedMigrations(input: Record<string, string> | ProjectMigration[]): ProjectMigration[] {
  const migrations = Array.isArray(input)
    ? input
    : Object.entries(input).filter(([path]) => path.startsWith("migrations/")).map(([path, sql]) => ({ path, sql }));
  for (const migration of migrations) {
    if (!MIGRATION_PATH.test(migration.path) || !migration.sql.trim()) throw new Error(`Migration no válida: ${migration.path}`);
  }
  const sorted = [...migrations].sort((a, b) => {
    const av = migrationVersion(a.path);
    const bv = migrationVersion(b.path);
    return av < bv ? -1 : av > bv ? 1 : a.path.localeCompare(b.path);
  });
  if (new Set(sorted.map(({ path }) => path)).size !== sorted.length) throw new Error("Hay rutas de migración duplicadas.");
  for (let i = 1; i < sorted.length; i++) {
    if (migrationVersion(sorted[i - 1]!.path) === migrationVersion(sorted[i]!.path)) {
      throw new Error("Cada migración debe tener un número de orden único.");
    }
  }
  return sorted;
}

async function applyProjectMigrationsLocal(projectId: string, input: Record<string, string> | ProjectMigration[], env: ProjectDbEnv) {
  const migrations = orderedMigrations(input);
  const queueKey = dbKey(projectId, env);
  const previous = migrationQueues.get(queueKey) ?? Promise.resolve();
  const current = previous.catch(() => {}).then(async () => {
    await get(projectId, env);
    await run(projectId, env, async (db) => {
      await db.exec(`create table if not exists _forja_migrations (
        migration_name text primary key,
        checksum text not null,
        applied_at timestamptz not null default now()
      )`);
    });
    const appliedRows = await run(projectId, env, async (db) =>
      (await db.query<{ migration_name: string; checksum: string }>(
        "select migration_name, checksum from _forja_migrations order by migration_name",
      )).rows,
    );
    const applied = new Map(appliedRows.map((row) => [row.migration_name, row.checksum]));
    const byName = new Map(migrations.map((migration) => [migration.path, migration]));
    for (const [path, hash] of applied) {
      const currentMigration = byName.get(path);
      if (!currentMigration) throw new Error(`No se puede publicar: la migración aplicada ${path} fue eliminada o renombrada.`);
      if (checksum(currentMigration.sql) !== hash) throw new Error(`No se puede publicar: la migración aplicada ${path} fue modificada.`);
    }

    let latestApplied = appliedRows.reduce((latest, row) => {
      const version = migrationVersion(row.migration_name);
      return version > latest ? version : latest;
    }, 0n);
    for (const migration of migrations) {
      if (applied.has(migration.path)) continue;
      const version = migrationVersion(migration.path);
      if (version <= latestApplied) {
        throw new Error(`No se puede aplicar ${migration.path}: su orden debe ser posterior a las migraciones ya aplicadas.`);
      }
      const hash = checksum(migration.sql);
      await run(projectId, env, async (db) => {
        await db.transaction(async (tx) => {
          await tx.exec(migration.sql);
          await tx.query("insert into _forja_migrations (migration_name, checksum) values ($1, $2)", [migration.path, hash]);
        });
      });
      latestApplied = version;
    }
    return { applied: migrations.filter(({ path }) => !applied.has(path)).map(({ path }) => path) };
  });
  migrationQueues.set(queueKey, current);
  try {
    return await current;
  } finally {
    if (migrationQueues.get(queueKey) === current) migrationQueues.delete(queueKey);
  }
}

/** Applies immutable, ordered migrations to the selected environment; each file and ledger entry commit atomically. */
export async function applyProjectMigrations(projectId: string, input: Record<string, string> | ProjectMigration[], env: ProjectDbEnv = "preview") {
  const migrations = orderedMigrations(input);
  if (remote) return remote.applyProjectMigrations(projectId, migrations, env);
  return applyProjectMigrationsLocal(projectId, migrations, env);
}

/** Full copy of one environment's database files, for Data export or internal duplication. */
export async function dumpDatabase(projectId: string, env: ProjectDbEnv = "preview"): Promise<Blob> {
  if (remote) return remote.dumpDatabase(projectId, env);
  return run(projectId, env, async (db) => (await db.dumpDataDir("gzip")) as Blob);
}

/** Closes a project's database now (before deleting or replacing its files). */
export async function closeProject(projectId: string, env?: ProjectDbEnv) {
  if (remote) return remote.closeProject(projectId, env);
  await previewCopies.get(projectId)?.catch(() => {});
  for (const currentEnv of env ? [env] : ["published", "preview"] as const) {
    const key = dbKey(projectId, currentEnv);
    const existing = open.get(key);
    if (existing) {
      const e = await existing.catch(() => null);
      if (e) await closeEntry(key, e);
    }
    await closing.get(key);
  }
}

/** Duplicates production data only. The new project's preview is initialized from this copy on first access. */
export async function cloneDatabase(fromProjectId: string, toProjectId: string) {
  if (remote) return remote.cloneDatabase(fromProjectId, toProjectId);
  const dump = await dumpDatabase(fromProjectId, "published");
  await closeProject(toProjectId);
  const dir = databasePath(toProjectId, "published");
  const previewDir = databasePath(toProjectId, "preview");
  rmSync(dir, { recursive: true, force: true });
  rmSync(previewDir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const db = await PGlite.create(dir, { ...pgliteOptions(), loadDataDir: dump });
  await db.close();
}

export async function closeAll() {
  if (remote) return remote.closeAll();
  await Promise.all([...previewCopies.values()].map((copy) => copy.catch(() => {})));
  for (const [id, p] of [...open]) {
    const e = await p.catch(() => null);
    if (e) await closeEntry(id, e);
  }
  await Promise.all(closing.values());
}

/** Databases open in this process and the cap; zero in processes that reach them remotely. */
export function projectDbStats() {
  return { open: open.size, closing: closing.size, maxOpen: config.projectDbs.maxOpen, sharedBuffers: config.projectDbs.sharedBuffers };
}

export async function isAwake(projectId: string, env?: ProjectDbEnv) {
  return remote ? remote.isAwake(projectId, env) : env ? open.has(dbKey(projectId, env)) : open.has(dbKey(projectId, "published")) || open.has(dbKey(projectId, "preview"));
}

export async function projectDbMetrics(projectId: string, env: ProjectDbEnv = "preview"): Promise<ProjectDbMetrics> {
  if (remote) return remote.metrics<ProjectDbMetrics>(projectId, env);
  const key = dbKey(projectId, env);
  return { active: open.has(key), ...metricsFor(key) };
}
