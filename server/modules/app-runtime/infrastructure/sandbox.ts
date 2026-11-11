import { fork, type ChildProcess } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config, ROOT_DIR } from "../../../shared/config.js";
import type { AppUser } from "../../app-services/auth.js";
import { serviceContext, type AppEnv, type ServiceContext } from "../../app-services/context.js";
import { projectDb } from "../../app-services/projectDb.js";
import { log } from "./observation.js";
import type { ServiceExecution } from "../domain/services.js";

/**
 * Locked-down Node processes run a project's endpoints and jobs. Extracted modules
 * have independent replica pools; preview and published environments never share a pool.
 * Under Node's permission model the process can read only node_modules (compiled bundles
 * live in node_modules/.cache), cannot write files, spawn processes or load addons, and
 * starts with an empty environment. All services go through `dispatch`, always scoped to
 * the project that owns the process, so one app cannot touch another app's data or the
 * platform's secrets.
 */
const WORKER = path.join(path.dirname(fileURLToPath(import.meta.url)), "sandboxWorker.mjs");
const IDLE_MS = 5 * 60_000;
const TX_TIMEOUT_MS = 30_000;

/** Every sandbox with a live process, across projects; bounded by config.sandbox.maxProcesses. */
const alive = new Set<ProjectSandbox>();

/**
 * At the cap, the least recently used idle sandbox stops; its pool starts it again on its next
 * request. Busy sandboxes are never stopped, so the cap is soft under a burst of real work.
 */
function makeRoomForSandbox(starting: ProjectSandbox) {
  while (alive.size >= config.sandbox.maxProcesses) {
    let oldest: ProjectSandbox | null = null;
    for (const box of alive) if (box !== starting && !box.busy && (!oldest || box.lastUsed < oldest.lastUsed)) oldest = box;
    if (!oldest) return;
    oldest.stop();
  }
}

/** Live sandbox processes in this process, for memory reports. */
export function sandboxStats() {
  return {
    processes: alive.size,
    maxProcesses: config.sandbox.maxProcesses,
    maxHeapMb: config.sandbox.maxHeapMb,
    items: [...alive].map((box) => ({ projectId: box.projectId, env: box.env, pid: box.pid, busy: box.busy })),
  };
}

export interface RunInput {
  env_name: AppEnv;
  file: string;
  base: string;
  env: Record<string, string>;
  // endpoint
  method?: string;
  url?: string;
  headers?: [string, string][];
  rawBody?: Uint8Array;
  query?: Record<string, string>;
  user?: AppUser | null;
  // job
  payload?: unknown;
  job?: string;
  execution?: ServiceExecution;
}

export interface SandboxError {
  name: string;
  message: string;
  stack?: string;
  status?: number;
  issues?: { path: (string | number)[]; message: string }[];
}

export class SandboxRunError extends Error {
  constructor(public detail: SandboxError) {
    super(detail.message);
    this.name = detail.name;
  }
}

interface Run {
  resolve: (v: unknown) => void;
  reject: (e: unknown) => void;
  ctx: ServiceContext;
  env: AppEnv;
  timer: NodeJS.Timeout;
  txs: Map<string, { query: (sql: string, params: unknown[]) => Promise<unknown[]>; finish: (commit: boolean) => Promise<void> }>;
}

class ProjectSandbox {
  private child: ChildProcess | null = null;
  private ready: Promise<void> | null = null;
  private runs = new Map<number, Run>();
  private nextRun = 0;
  private idle: NodeJS.Timeout | null = null;
  private isReady = false;
  /** Runs waiting for the process to start; they count as busy so the process is not evicted under them. */
  private waiting = 0;
  lastUsed = Date.now();

  constructor(readonly projectId: string, readonly env: AppEnv) {}

  get busy() {
    return this.runs.size > 0 || this.waiting > 0;
  }

  get pid() {
    return this.child?.pid ?? null;
  }

  private start() {
    makeRoomForSandbox(this);
    alive.add(this);
    const nodeModules = path.join(ROOT_DIR, "node_modules");
    const child = fork(WORKER, [], {
      execArgv: ["--permission", `--allow-fs-read=${nodeModules}`, `--allow-fs-read=${WORKER}`, `--max-old-space-size=${config.sandbox.maxHeapMb}`],
      // No platform secrets: the child gets only what each run passes it.
      env: { NODE_ENV: "production", SYSTEMROOT: process.env.SYSTEMROOT ?? "" },
      serialization: "advanced",
      stdio: ["ignore", "pipe", "pipe", "ipc"],
    });
    this.child = child;
    this.ready = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("El entorno aislado no arranco en 15 segundos"));
        child.kill();
      }, 15_000);
      const onMsg = (m: { t: string }) => {
        if (m.t !== "ready") return;
        clearTimeout(timeout);
        child.off("message", onMsg);
        this.isReady = true;
        resolve();
      };
      child.on("message", onMsg);
      child.once("error", (error) => { clearTimeout(timeout); reject(error); });
      child.once("exit", (code) => { clearTimeout(timeout); reject(new Error(`El entorno aislado terminó al arrancar (${code})`)); });
    });
    const pipe = (level: "info" | "error") => (d: Buffer) =>
      log(this.projectId, { env: this.env, level, source: "endpoint", message: d.toString().trim().slice(0, 4000) });
    child.stdout?.on("data", pipe("info"));
    child.stderr?.on("data", pipe("error"));
    child.on("message", (m) => {
      if (this.child === child) void this.onMessage(child, m as never);
    });
    child.on("exit", () => {
      if (this.child !== child) return;
      alive.delete(this);
      this.child = null;
      this.isReady = false;
      this.ready = null;
      for (const [id, run] of this.runs) {
        clearTimeout(run.timer);
        for (const tx of run.txs.values()) void tx.finish(false).catch((error) =>
          log(this.projectId, { env: run.env, level: "error", source: "endpoint", message: `Rollback: ${String(error)}` }));
        run.reject(new SandboxRunError({ name: "Error", message: "El entorno aislado se detuvo (memoria agotada, tiempo agotado o fallo)." }));
        this.runs.delete(id);
      }
    });
  }

  async run(kind: "endpoint" | "job" | "test", input: RunInput, ctx: ServiceContext): Promise<unknown> {
    this.waiting++;
    try {
      if (!this.child) this.start();
      await this.ready;
    } finally {
      this.waiting--;
    }
    const child = this.child;
    if (!child?.connected) throw new Error("El entorno aislado se detuvo antes de ejecutar");
    if (this.idle) clearTimeout(this.idle);
    this.lastUsed = Date.now();
    const id = ++this.nextRun;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        // A run past the limit takes the whole process down; the next request starts a fresh one.
        reject(new SandboxRunError({ name: "Error", message: "Tiempo máximo de 15 minutos agotado" }));
        child.kill();
      }, config.maxRunMs);
      this.runs.set(id, { resolve, reject, ctx, env: input.env_name, timer, txs: new Map() });
      child.send({ t: "run", run: id, kind, input }, (error) => {
        if (!error) return;
        clearTimeout(timer);
        this.runs.delete(id);
        reject(error);
      });
    }).finally(() => this.scheduleIdle());
  }

  private scheduleIdle() {
    if (this.runs.size) return;
    if (this.idle) clearTimeout(this.idle);
    this.idle = setTimeout(() => this.stop(), IDLE_MS);
    this.idle.unref();
  }

  stop() {
    if (this.idle) clearTimeout(this.idle);
    this.idle = null;
    for (const run of this.runs.values()) {
      clearTimeout(run.timer);
      for (const tx of run.txs.values()) void tx.finish(false).catch((error) =>
        log(this.projectId, { env: run.env, level: "error", source: "endpoint", message: `Rollback: ${String(error)}` }));
      run.reject(new SandboxRunError({ name: "Error", message: "El entorno aislado se detuvo." }));
    }
    this.runs.clear();
    alive.delete(this);
    this.child?.kill();
    this.child = null;
    this.isReady = false;
    this.ready = null;
  }

  snapshot() {
    return { pid: this.child?.pid ?? null, ready: this.isReady && !!this.child?.connected };
  }

  private async onMessage(child: ChildProcess, m: { t: string; run: number; call: number; method: string; args: unknown[]; ok: boolean; value: unknown; error: SandboxError; env: AppEnv; level: "info" | "error"; message: string }) {
    if (m.t === "log") {
      log(this.projectId, { env: m.env ?? "preview", level: m.level, source: "endpoint", message: m.message });
      return;
    }
    const run = this.runs.get(m.run);
    if (m.t === "done") {
      if (!run) return;
      clearTimeout(run.timer);
      this.runs.delete(m.run);
      // Any transaction left open is rolled back.
      for (const tx of run.txs.values()) await tx.finish(false).catch((error) =>
        log(this.projectId, { env: run.env, level: "error", source: "endpoint", message: `Rollback: ${String(error)}` }));
      if (m.ok) run.resolve(m.value);
      else run.reject(new SandboxRunError(m.error));
      return;
    }
    if (m.t === "rpc") {
      try {
        if (!run) throw new Error("Llamada fuera de una ejecución");
        const value = await dispatch(this.projectId, run, m.method, m.args);
        if (child.connected) child.send({ t: "rpcResult", call: m.call, ok: true, value });
      } catch (e) {
        if (child.connected) child.send({ t: "rpcResult", call: m.call, ok: false, error: { name: (e as Error).name, message: (e as Error).message } });
      }
    }
  }
}

async function beginTransaction(projectId: string, run: Run): Promise<string> {
  const id = `tx${run.txs.size + 1}_${Date.now()}`;
  return new Promise((resolveBegin, rejectBegin) => {
    let settle!: (commit: boolean) => void;
    const done = projectDb(projectId, run.env)
      .transaction(async (tx) => {
        const commit = await new Promise<boolean>((res) => {
          settle = res;
          run.txs.set(id, { query: (sql, params) => tx.query(sql, params), finish });
          resolveBegin(id);
          setTimeout(() => res(false), TX_TIMEOUT_MS).unref();
        });
        if (!commit) throw new Error("rollback");
      })
      .catch((e) => {
        if ((e as Error).message !== "rollback") rejectBegin(e);
      });
    const finish = async (commit: boolean) => {
      run.txs.delete(id);
      settle(commit);
      await done;
    };
  });
}

/** Every service the sandbox may call. Anything not listed here does not exist for project code. */
async function dispatch(projectId: string, run: Run, method: string, args: unknown[]): Promise<unknown> {
  const ctx = run.ctx;
  const a = args as never[];
  switch (method) {
    case "db.query":
      return ctx.db.query(a[0], a[1]);
    case "db.one":
      return ctx.db.one(a[0], a[1]);
    case "db.exec":
      return ctx.db.exec(a[0]);
    case "cache.get":
      return ctx.cache.get(a[0]);
    case "cache.set":
      return ctx.cache.set(a[0], a[1], a[2]);
    case "cache.delete":
      return ctx.cache.delete(a[0]);
    case "db.begin":
      return beginTransaction(projectId, run);
    case "db.txQuery": {
      const tx = run.txs.get(a[0]);
      if (!tx) throw new Error("La transacción ya terminó");
      return tx.query(a[1], a[2] ?? []);
    }
    case "db.commit":
    case "db.rollback": {
      const tx = run.txs.get(a[0]);
      if (tx) await tx.finish(method === "db.commit");
      return null;
    }
    case "storage.put":
      return ctx.storage.put(a[0], a[1]);
    case "storage.get": {
      const obj = await ctx.storage.get(a[0]);
      return obj ? { ...obj, data: new Uint8Array(obj.data) } : null;
    }
    case "storage.delete":
      return ctx.storage.delete(a[0]);
    case "storage.list":
      return ctx.storage.list();
    case "email.send":
      return ctx.email.send(a[0]);
    case "ai.chat":
      return ctx.ai.chat(a[0]);
    case "jobs.run":
      await ctx.jobs.run(a[0], a[1]);
      return null;
    case "jobs.enqueue":
      return ctx.jobs.enqueue(a[0], a[1]);
    case "jobs.runAt":
      return ctx.jobs.runAt(a[0], a[1], typeof a[2] === "string" ? new Date(a[2]) : a[2]);
    case "realtime.publish":
      return ctx.realtime.publish(a[0], a[1]);
    case "payments.checkout":
      return ctx.payments.checkout(a[0]);
    case "payments.getCheckout":
      return ctx.payments.getCheckout(a[0]);
    case "payments.refund":
      return ctx.payments.refund(a[0]);
  }
  throw new Error(`Servicio desconocido: ${method}`);
}

class ServicePool {
  private replicas: { box: ProjectSandbox; active: number }[] = [];
  private cursor = 0;
  private desiredReplicas = 1;

  constructor(private projectId: string, private env: AppEnv) {}

  run(kind: "endpoint" | "job" | "test", input: RunInput, ctx: ServiceContext, execution: ServiceExecution) {
    this.desiredReplicas = execution.replicas;
    while (this.replicas.length < execution.replicas) {
      this.replicas.push({ box: new ProjectSandbox(this.projectId, this.env), active: 0 });
    }
    this.trim();
    const eligible = this.replicas.slice(0, execution.replicas);
    const least = Math.min(...eligible.map((replica) => replica.active));
    if (least >= execution.maxConcurrency) {
      throw new SandboxRunError({ name: "ServiceBusyError", status: 503, message: `Servicio ${execution.service} ocupado; intenta de nuevo` });
    }
    let chosen = eligible[0]!;
    for (let offset = 0; offset < eligible.length; offset++) {
      const index = (this.cursor + offset) % eligible.length;
      if (eligible[index]!.active !== least) continue;
      chosen = eligible[index]!;
      this.cursor = (index + 1) % eligible.length;
      break;
    }
    chosen.active++;
    return chosen.box.run(kind, input, ctx).finally(() => {
      chosen.active--;
      this.trim();
    });
  }

  private trim() {
    // Scale down only drained replicas: in-flight work must not be interrupted.
    while (this.replicas.length > this.desiredReplicas && this.replicas.at(-1)!.active === 0) {
      this.replicas.pop()!.box.stop();
    }
  }

  stop() {
    for (const replica of this.replicas) replica.box.stop();
    this.replicas = [];
  }

  snapshot() {
    return this.replicas.map(({ box, active }) => ({ ...box.snapshot(), active }));
  }
}

const sandboxes = new Map<string, Map<string, ServicePool>>();

export function getSandboxServices(projectId: string) {
  return [...(sandboxes.get(projectId)?.entries() ?? [])].map(([key, pool]) => {
    const [env, service] = key.split(":");
    return { env: env as AppEnv, service: service!, replicas: pool.snapshot() };
  });
}

export function restartSandboxService(projectId: string, service: string, env?: AppEnv) {
  const pools = sandboxes.get(projectId);
  for (const [key, pool] of pools ?? []) {
    const [poolEnv, poolService] = key.split(":");
    if (poolService !== service || (env && poolEnv !== env)) continue;
    pool.stop();
    pools?.delete(key);
  }
}

export async function runInSandbox(projectId: string, kind: "endpoint" | "job" | "test", input: Omit<RunInput, "env">, source: "endpoint" | "job") {
  const ctx = await serviceContext(projectId, input.env_name, input.base, source);
  const execution = input.execution ?? { service: "monolith", replicas: 1, maxConcurrency: Number.MAX_SAFE_INTEGER };
  if (!/^[a-z][a-z0-9-]{0,39}$/.test(execution.service) || !Number.isInteger(execution.replicas) || execution.replicas < 1 || execution.replicas > 8 ||
      !Number.isSafeInteger(execution.maxConcurrency) || execution.maxConcurrency < 1) throw new Error("Configuracion de ejecucion no valida");
  let pools = sandboxes.get(projectId);
  if (!pools) sandboxes.set(projectId, (pools = new Map()));
  const key = `${input.env_name}:${execution.service}`;
  let pool = pools.get(key);
  if (!pool) pools.set(key, (pool = new ServicePool(projectId, input.env_name)));
  return pool.run(kind, { ...input, env: ctx.env }, ctx, execution);
}

export function stopSandbox(projectId: string) {
  for (const pool of sandboxes.get(projectId)?.values() ?? []) pool.stop();
  sandboxes.delete(projectId);
}

export function stopAllSandboxes() {
  for (const pools of sandboxes.values()) for (const pool of pools.values()) pool.stop();
  sandboxes.clear();
}
