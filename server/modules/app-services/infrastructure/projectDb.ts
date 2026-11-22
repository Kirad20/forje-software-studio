import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { config, paths } from "../../../shared/config.js";
import { recordOperationalEvent } from "../../../shared/operationalLog.js";
import type { AppEnv } from "../domain/contracts.js";
import type { ProjectDb } from "../ports/database.js";
import { ProjectDbClient } from "./projectDbClient.js";
import { PROJECT_CACHE_SCHEMA } from "./cache.js";
import { dataRole, layoutMigrations, layoutOf } from "../../../../contracts/projectLayout.js";
export type { ProjectDb } from "../ports/database.js";
export type ProjectDbEnv = AppEnv;

export interface ProjectMigration {
  path: string;
  sql: string;
  /** Schema of the forja.json component that owns it; absent for the app's migrations/. */
  schema?: string;
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
const projectLocks = new Map<string, Promise<unknown>>();

const dbKey = (projectId: string, env: ProjectDbEnv) => `${projectId}\0${env}`;
const databasePath = (projectId: string, env: ProjectDbEnv) => paths.projectDb(projectId, env);

function recoverInterruptedClone(projectId: string) {
  const dir = databasePath(projectId, "published");
  const parent = path.dirname(dir);
  const journal = path.join(parent, ".clone-journal.json");
  if (!existsSync(journal)) return;
  const data: unknown = JSON.parse(readFileSync(journal, "utf8"));
  if (!data || typeof data !== "object" || !("suffix" in data) || !("staged" in data) ||
      !("hadPublished" in data) || !("hadPreview" in data) ||
      typeof data.suffix !== "string" || !/^\.backup-[0-9a-f-]{36}$/.test(data.suffix) ||
      typeof data.staged !== "string" || !/^\.database-copy-[A-Za-z0-9]+$/.test(data.staged) ||
      typeof data.hadPublished !== "boolean" || typeof data.hadPreview !== "boolean") {
    throw new Error("Invalid project database clone journal");
  }
  const staged = path.join(parent, data.staged);
  if (!existsSync(staged)) {
    if (!existsSync(dir)) throw new Error("Interrupted clone has no staged or installed database");
    unlinkSync(journal);
    return;
  }
  for (const [original, existed] of [[dir, data.hadPublished], [databasePath(projectId, "preview"), data.hadPreview]] as const) {
    const backup = original + data.suffix;
    if (existsSync(backup)) {
      if (existsSync(original)) throw new Error("Interrupted clone has conflicting database paths");
      renameSync(backup, original);
    } else if (existed && !existsSync(original)) {
      throw new Error("Interrupted clone is missing a database backup");
    }
  }
  rmSync(staged, { recursive: true, force: true });
  unlinkSync(journal);
}

function withProjectLock<T>(projectId: string, operation: () => Promise<T>): Promise<T> {
  const previous = projectLocks.get(projectId) ?? Promise.resolve();
  const current = previous.catch(() => {}).then(operation);
  projectLocks.set(projectId, current);
  void current.finally(() => {
    if (projectLocks.get(projectId) === current) projectLocks.delete(projectId);
  }).catch(() => {});
  return current;
}

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
create table if not exists _forja_oauth_accounts (
  provider text not null,
  account_id text not null,
  user_id text not null references _forja_users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now(),
  primary key (provider, account_id)
);
create index if not exists _forja_oauth_accounts_user on _forja_oauth_accounts (user_id);
create table if not exists _forja_oauth_tickets (
  key_hash text primary key,
  user_id text not null references _forja_users(id) on delete cascade,
  expires_at timestamptz not null
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
  let db: PGlite | undefined;
  try {
    mkdirSync(dir, { recursive: true });
    db = await PGlite.create(dir, pgliteOptions());
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
    await recordOperationalEvent({ service: "project-db", event: "open_failed", projectId, env, error });
    if (db) {
      try { await db.close(); } catch (closeError) {
        throw new AggregateError([error, closeError], "Project database initialization and cleanup failed");
      }
    }
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
      throw error;
    }
  })();
  closing.set(key, done);
  void done.then(() => {
    if (closing.get(key) === done) closing.delete(key);
  }, () => {});
  return done;
}

function scheduleSleep(key: string, entry: Open) {
  clearTimeout(entry.timer);
  entry.timer = setTimeout(() => {
    if (entry.active > 0) scheduleSleep(key, entry);
    else void closeEntry(key, entry).catch(() => {});
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
    void closeEntry(key, entry).catch(() => {});
    excess--;
  }
}

async function ensurePreviewCopy(projectId: string): Promise<void> {
  const dir = databasePath(projectId, "preview");
  let pending = previewCopies.get(projectId);
  if (pending) return pending;
  if (existsSync(dir)) return;
  if (!pending) {
    pending = (async () => {
      if (existsSync(dir)) return;
      const dump = await runUnlocked(projectId, "published", (db) => db.dumpDataDir("gzip"));
      mkdirSync(path.dirname(dir), { recursive: true });
      const temporaryDir = mkdtempSync(path.join(path.dirname(dir), ".preview-copy-"));
      try {
        const copy = await PGlite.create(temporaryDir, { ...pgliteOptions(), loadDataDir: dump });
        await copy.close();
        renameSync(temporaryDir, dir);
      } catch (error) {
        rmSync(temporaryDir, { recursive: true, force: true });
        await recordOperationalEvent({ service: "project-db", event: "preview_copy_failed", projectId, env: "preview", error });
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
  recoverInterruptedClone(projectId);
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
async function runUnlocked<T>(projectId: string, env: ProjectDbEnv, fn: (db: PGlite) => Promise<T>): Promise<T> {
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
      await recordOperationalEvent({ service: "project-db", event: "query_failed", projectId, env, error });
      throw error;
    } finally {
      metrics.operationMs += Date.now() - started;
      entry.active--;
    }
  });
  entry.queue = next.catch(() => {});
  return next;
}

function run<T>(projectId: string, env: ProjectDbEnv, fn: (db: PGlite) => Promise<T>): Promise<T> {
  return withProjectLock(projectId, () => runUnlocked(projectId, env, fn));
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
  const allowed = /^(?:select|with|insert|update|delete|truncate|values|show|explain|refresh\s+materialized\s+view)\b/i;
  if (!statements.length || statements.some((part) => !allowed.test(part.trimStart()))) {
    throw new Error("ctx.db solo permite consultas y operaciones de datos; cambia el esquema con execute_sql y una migración.");
  }
}

// --- Database per service: a forja.json component's schema and the role its code runs as ----

const SCOPE = /^[a-z][a-z0-9_]{0,40}$/;
const ensuredScopes = new WeakMap<PGlite, Set<string>>();

function assertScope(schema: string) {
  if (!SCOPE.test(schema) || schema === "public" || schema === "information_schema" || schema.startsWith("pg_") || schema.startsWith("_forja")) {
    throw new Error(`Esquema de componente no válido: ${schema}`);
  }
}

/** Creates the schema and a role with rights on it only (tables created later included). Idempotent. */
const scopeSetupSql = (schema: string) => {
  const role = dataRole(schema);
  return `create schema if not exists "${schema}";
do $$ begin if not exists (select from pg_roles where rolname = '${role}') then create role "${role}" nologin; end if; end $$;
grant usage, create on schema "${schema}" to "${role}";
grant all on all tables in schema "${schema}" to "${role}";
grant all on all sequences in schema "${schema}" to "${role}";
alter default privileges in schema "${schema}" grant all on tables to "${role}";
alter default privileges in schema "${schema}" grant all on sequences to "${role}";`;
};

async function ensureScope(db: PGlite, schema: string) {
  if (ensuredScopes.get(db)?.has(schema)) return;
  await db.exec(scopeSetupSql(schema));
  (ensuredScopes.get(db) ?? ensuredScopes.set(db, new Set()).get(db)!).add(schema);
}

/**
 * The connection belongs to a superuser, so set_config('role', ...) could switch back inside a
 * statement: scoped code may not call it (nor hide it behind U&"..." identifiers).
 */
function assertScopedSql(sql: string) {
  assertRuntimeSql(sql);
  if (/set_config|u&\s*["']/i.test(sql)) throw new Error("ctx.db de un componente con base de datos propia no puede cambiar la configuración de la sesión.");
}

/** ctx.db of a component with "database": every statement runs as its role, inside its schema. */
function scopedProjectDb(projectId: string, env: ProjectDbEnv, schema: string): ProjectDb {
  assertScope(schema);
  const enter = `set local role "${dataRole(schema)}"; set local search_path to "${schema}"`;
  const inScope = <T>(fn: (tx: Pick<PGlite, "query" | "exec">) => Promise<T>) => run(projectId, env, async (db) => {
    await ensureScope(db, schema);
    return db.transaction(async (tx) => {
      await tx.exec(enter);
      return fn(tx);
    });
  });
  const api: ProjectDb = {
    query: async (sql, params = []) => {
      assertScopedSql(sql);
      return inScope(async (tx) => (await tx.query(sql, params)).rows as never);
    },
    one: async (sql, params = []) => (await api.query(sql, params))[0] as never,
    exec: async (sql) => {
      assertScopedSql(sql);
      return inScope(async (tx) => void (await tx.exec(sql)));
    },
    transaction: (fn) => inScope((tx) => fn({
      query: async (sql: string, params: unknown[] = []) => {
        assertScopedSql(sql);
        return (await tx.query(sql, params)).rows as never;
      },
      one: async (sql: string, params: unknown[] = []) => {
        assertScopedSql(sql);
        return (await tx.query(sql, params)).rows[0] as never;
      },
    })),
  };
  return api;
}

/**
 * The project's database for one environment. With `scope` (the schema of a forja.json
 * component with "database"), statements run as that component's role inside its schema.
 */
export function projectDb(projectId: string, env: ProjectDbEnv = "published", scope?: string): ProjectDb {
  if (remote) return remote.forProject(projectId, env, scope);
  if (scope) return scopedProjectDb(projectId, env, scope);
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
export async function execSql(projectId: string, sql: string, env: ProjectDbEnv = "preview", scope?: string) {
  assertRuntimeSql(sql);
  if (scope) assertScope(scope);
  if (remote) return remote.execSql(projectId, sql, env, scope);
  return run(projectId, env, async (db) => {
    if (scope) await ensureScope(db, scope);
    const results = scope
      ? await db.transaction(async (tx) => { await tx.exec(`set local search_path to "${scope}", public`); return tx.exec(sql); })
      : await db.exec(sql);
    return results.map((r) => ({
      fields: r.fields.map((f) => f.name),
      rows: r.rows,
      affectedRows: r.affectedRows ?? 0,
    }));
  });
}

const MIGRATION_PATH = /^migrations\/\d+_[A-Za-z0-9_.$-]+\.sql$/;
/** `<component root><migrations folder>/<n>_<name>.sql` (folder "migrations" or mapped in forja.json), applied inside the component's schema. */
const COMPONENT_MIGRATION_PATH = /^[a-z0-9][A-Za-z0-9._/$@()-]*\/\d+_[A-Za-z0-9_.$-]+\.sql$/;
const checksum = (sql: string) => createHash("sha256").update(sql).digest("hex");
const migrationVersion = (path: string) => BigInt(/(?:^|[/:])(\d+)_[^/:]*$/.exec(path)![1]!);
/** Each set of migrations keeps its own order: the app's ("") and one per component schema. */
const migrationTrack = (migration: Pick<ProjectMigration, "schema">) => migration.schema ?? "";
/**
 * Ledger key. The app's migrations by path, as always; a component's by schema + file name
 * (`orders:migrations/001_x.sql`), so moving the component's folder keeps its history.
 */
const ledgerName = (migration: ProjectMigration) =>
  migration.schema ? `${migration.schema}:migrations/${migration.path.slice(migration.path.lastIndexOf("/") + 1)}` : migration.path;
const ledgerSchema = (name: string) => /^([a-z][a-z0-9_]*):migrations\//.exec(name)?.[1];

/** Schemas the project's forja.json still declares (a component with "database"). */
export function declaredSchemas(files: Record<string, string>): string[] {
  return layoutOf(files).components.flatMap((c) => (c.database ? [c.database] : []));
}

function orderedMigrations(input: Record<string, string> | ProjectMigration[]): ProjectMigration[] {
  const migrations = Array.isArray(input) ? input : layoutMigrations(input, layoutOf(input));
  for (const migration of migrations) {
    const valid = migration.schema === undefined ? MIGRATION_PATH.test(migration.path) : COMPONENT_MIGRATION_PATH.test(migration.path);
    if (!valid || !migration.sql.trim()) throw new Error(`Migration no válida: ${migration.path}`);
    if (migration.schema !== undefined) assertScope(migration.schema);
  }
  const sorted = [...migrations].sort((a, b) => {
    const at = migrationTrack(a), bt = migrationTrack(b);
    if (at !== bt) return at < bt ? -1 : 1;
    const av = migrationVersion(a.path);
    const bv = migrationVersion(b.path);
    return av < bv ? -1 : av > bv ? 1 : a.path.localeCompare(b.path);
  });
  if (new Set(sorted.map(({ path }) => path)).size !== sorted.length) throw new Error("Hay rutas de migración duplicadas.");
  for (let i = 1; i < sorted.length; i++) {
    if (migrationTrack(sorted[i - 1]!) === migrationTrack(sorted[i]!) && migrationVersion(sorted[i - 1]!.path) === migrationVersion(sorted[i]!.path)) {
      throw new Error("Cada migración debe tener un número de orden único.");
    }
  }
  return sorted;
}

async function applyProjectMigrationsLocal(projectId: string, input: Record<string, string> | ProjectMigration[], env: ProjectDbEnv, schemas?: string[]) {
  const migrations = orderedMigrations(input);
  // A schema no component declares any more is retired: its data stays, its history stops gating.
  const declared = new Set(schemas ?? (Array.isArray(input) ? migrations.flatMap((m) => (m.schema ? [m.schema] : [])) : declaredSchemas(input)));
  const queueKey = dbKey(projectId, env);
  const previous = migrationQueues.get(queueKey) ?? Promise.resolve();
  const current = previous.catch(() => {}).then(() => withProjectLock(projectId, async () => {
    await runUnlocked(projectId, env, async (db) => {
      await db.exec(`create table if not exists _forja_migrations (
        migration_name text primary key,
        checksum text not null,
        applied_at timestamptz not null default now()
      )`);
    });
    const appliedRows = await runUnlocked(projectId, env, async (db) =>
      (await db.query<{ migration_name: string; checksum: string }>(
        "select migration_name, checksum from _forja_migrations order by migration_name",
      )).rows,
    );
    const byName = new Map(migrations.map((migration) => [ledgerName(migration), migration]));
    const byPath = new Map(migrations.map((migration) => [migration.path, migration]));
    // Component migrations recorded by path (before schema-based keys) move to their new key.
    const rekeyed: [string, string][] = [];
    const applied = new Map<string, string>();
    for (const row of appliedRows) {
      const legacy = !byName.has(row.migration_name) ? byPath.get(row.migration_name) : undefined;
      if (legacy?.schema) rekeyed.push([row.migration_name, ledgerName(legacy)]);
      applied.set(legacy?.schema ? ledgerName(legacy) : row.migration_name, row.checksum);
    }
    const retired = new Set<string>();
    for (const [name, hash] of applied) {
      const currentMigration = byName.get(name);
      const schema = ledgerSchema(name);
      if (!currentMigration) {
        if (schema && !declared.has(schema)) { retired.add(schema); continue; }
        if (schema) {
          throw new Error(`No se puede publicar: la migración aplicada ${name.slice(schema.length + 1)} del esquema ${schema} ya no está en el proyecto. Un componente con "database": "${schema}" debe conservar todas sus migraciones aplicadas. Para retirar ese esquema, quita "database" del componente y borra sus migraciones: sus datos se conservan.`);
        }
        throw new Error(`No se puede publicar: la migración aplicada ${name} fue eliminada o renombrada.`);
      }
      if (checksum(currentMigration.sql) !== hash) {
        throw new Error(`No se puede publicar: la migración aplicada ${currentMigration.path} fue modificada.${schema ? ` El esquema ${schema} ya la tiene aplicada: si reutilizas un esquema retirado, restaura sus migraciones originales o usa otro nombre de esquema.` : ""}`);
      }
    }
    if (rekeyed.length) {
      await runUnlocked(projectId, env, async (db) => {
        for (const [from, to] of rekeyed) await db.query("update public._forja_migrations set migration_name = $2 where migration_name = $1", [from, to]);
      });
    }

    const latestApplied = new Map<string, bigint>();
    for (const name of applied.keys()) {
      const schema = ledgerSchema(name);
      if (schema && retired.has(schema)) continue;
      const track = schema ?? "", version = migrationVersion(name);
      if (version > (latestApplied.get(track) ?? 0n)) latestApplied.set(track, version);
    }
    for (const migration of migrations) {
      if (applied.has(ledgerName(migration))) continue;
      const version = migrationVersion(migration.path);
      const track = migrationTrack(migration);
      if (version <= (latestApplied.get(track) ?? 0n)) {
        throw new Error(`No se puede aplicar ${migration.path}: su orden debe ser posterior a las migraciones ya aplicadas.`);
      }
      const hash = checksum(migration.sql);
      await runUnlocked(projectId, env, async (db) => {
        if (migration.schema) await ensureScope(db, migration.schema);
        await db.transaction(async (tx) => {
          // A component's migration creates its tables inside its schema (public stays readable, e.g. _forja_users).
          if (migration.schema) await tx.exec(`set local search_path to "${migration.schema}", public`);
          await tx.exec(migration.sql);
          await tx.query("insert into public._forja_migrations (migration_name, checksum) values ($1, $2)", [ledgerName(migration), hash]);
        });
        // Tables moved into the schema (alter table … set schema) get no default privileges: grant again.
        if (migration.schema) {
          ensuredScopes.get(db)?.delete(migration.schema);
          await ensureScope(db, migration.schema);
        }
      });
      latestApplied.set(track, version);
    }
    const result: { applied: string[]; retired?: string[] } = { applied: migrations.filter((m) => !applied.has(ledgerName(m))).map(({ path }) => path) };
    if (retired.size) result.retired = [...retired].sort();
    return result;
  }));
  migrationQueues.set(queueKey, current);
  try {
    return await current;
  } catch (error) {
    await recordOperationalEvent({ service: "project-db", event: "migration_failed", projectId, env, error });
    throw error;
  } finally {
    if (migrationQueues.get(queueKey) === current) migrationQueues.delete(queueKey);
  }
}

/**
 * Applies immutable, ordered migrations to the selected environment; each file and ledger entry
 * commit atomically. `retired` lists component schemas no component declares any more: their
 * data is kept and their applied migrations no longer gate publishing.
 */
export async function applyProjectMigrations(projectId: string, input: Record<string, string> | ProjectMigration[], env: ProjectDbEnv = "preview", schemas?: string[]): Promise<{ applied: string[]; retired?: string[] }> {
  const migrations = orderedMigrations(input);
  const declared = schemas ?? (Array.isArray(input) ? undefined : declaredSchemas(input));
  if (remote) return remote.applyProjectMigrations(projectId, migrations, env, declared);
  return applyProjectMigrationsLocal(projectId, migrations, env, declared);
}

/** Full copy of one environment's database files, for Data export or internal duplication. */
export async function dumpDatabase(projectId: string, env: ProjectDbEnv = "preview"): Promise<Blob> {
  if (remote) return remote.dumpDatabase(projectId, env);
  return run(projectId, env, async (db) => (await db.dumpDataDir("gzip")) as Blob);
}

/** Closes a project's database now (before deleting or replacing its files). */
export async function closeProject(projectId: string, env?: ProjectDbEnv) {
  if (remote) return remote.closeProject(projectId, env);
  return withProjectLock(projectId, () => closeProjectUnlocked(projectId, env));
}

async function closeProjectUnlocked(projectId: string, env?: ProjectDbEnv) {
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
  if (fromProjectId === toProjectId) throw new Error("Cannot clone a project database onto itself");
  const dump = await dumpDatabase(fromProjectId, "published");
  await withProjectLock(toProjectId, async () => {
    recoverInterruptedClone(toProjectId);
    const dir = databasePath(toProjectId, "published");
    const previewDir = databasePath(toProjectId, "preview");
    mkdirSync(path.dirname(dir), { recursive: true });
    const temporaryDir = mkdtempSync(path.join(path.dirname(dir), ".database-copy-"));
    const suffix = `.backup-${randomUUID()}`;
    const journal = path.join(path.dirname(dir), ".clone-journal.json");
    const backups: Array<{ original: string; backup: string }> = [];
    try {
      const db = await PGlite.create(temporaryDir, { ...pgliteOptions(), loadDataDir: dump });
      await db.close();
      await closeProjectUnlocked(toProjectId);
      writeFileSync(journal, JSON.stringify({
        suffix, staged: path.basename(temporaryDir),
        hadPublished: existsSync(dir), hadPreview: existsSync(previewDir),
      }), { flag: "wx" });
      for (const original of [dir, previewDir]) {
        if (existsSync(original)) {
          const backup = original + suffix;
          renameSync(original, backup);
          backups.push({ original, backup });
        }
      }
      renameSync(temporaryDir, dir);
      unlinkSync(journal);
    } catch (error) {
      const rollbackErrors: unknown[] = [];
      if (existsSync(journal)) {
        try { recoverInterruptedClone(toProjectId); } catch (rollbackError) { rollbackErrors.push(rollbackError); }
      } else {
        try { rmSync(temporaryDir, { recursive: true, force: true }); } catch (cleanupError) { rollbackErrors.push(cleanupError); }
      }
      await recordOperationalEvent({ service: "project-db", event: "clone_failed", projectId: toProjectId, error });
      if (rollbackErrors.length) throw new AggregateError([error, ...rollbackErrors], "Project database clone failed and rollback was incomplete");
      throw error;
    }
    for (const { backup } of backups) rmSync(backup, { recursive: true, force: true });
  });
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
