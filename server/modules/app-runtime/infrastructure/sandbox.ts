import { fork, type ChildProcess } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config, ROOT_DIR } from "../../../shared/config.js";
import type { AppUser } from "../../app-services/auth.js";
import { serviceContext, type AppEnv, type ServiceContext } from "../../app-services/context.js";
import { projectDb } from "../../app-services/projectDb.js";
import { log } from "./observation.js";

/**
 * One locked-down Node process per project runs that project's endpoints and jobs.
 * Under Node's permission model the process can read only node_modules (compiled bundles
 * live in node_modules/.cache), cannot write files, spawn processes or load addons, and
 * starts with an empty environment. All services go through `dispatch`, always scoped to
 * the project that owns the process, so one app cannot touch another app's data or the
 * platform's secrets.
 */
const WORKER = path.join(path.dirname(fileURLToPath(import.meta.url)), "sandboxWorker.mjs");
const IDLE_MS = 5 * 60_000;
const TX_TIMEOUT_MS = 30_000;

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

  constructor(private projectId: string) {}

  private start() {
    const nodeModules = path.join(ROOT_DIR, "node_modules");
    const child = fork(WORKER, [], {
      execArgv: ["--permission", `--allow-fs-read=${nodeModules}`, `--allow-fs-read=${WORKER}`, "--max-old-space-size=512"],
      // No platform secrets: the child gets only what each run passes it.
      env: { NODE_ENV: "production", SYSTEMROOT: process.env.SYSTEMROOT ?? "" },
      serialization: "advanced",
      stdio: ["ignore", "pipe", "pipe", "ipc"],
    });
    this.child = child;
    this.ready = new Promise((resolve, reject) => {
      const onMsg = (m: { t: string }) => m.t === "ready" && (child.off("message", onMsg), resolve());
      child.on("message", onMsg);
      child.once("exit", (code) => reject(new Error(`El entorno aislado terminó al arrancar (${code})`)));
    });
    const pipe = (level: "info" | "error") => (d: Buffer) =>
      log(this.projectId, { env: "preview", level, source: "endpoint", message: d.toString().trim().slice(0, 4000) });
    child.stdout?.on("data", pipe("info"));
    child.stderr?.on("data", pipe("error"));
    child.on("message", (m) => void this.onMessage(m as never));
    child.on("exit", () => {
      if (this.child !== child) return;
      this.child = null;
      this.ready = null;
      for (const [id, run] of this.runs) {
        clearTimeout(run.timer);
        run.reject(new SandboxRunError({ name: "Error", message: "El entorno aislado se detuvo (memoria agotada, tiempo agotado o fallo)." }));
        this.runs.delete(id);
      }
    });
  }

  async run(kind: "endpoint" | "job" | "test", input: RunInput, ctx: ServiceContext): Promise<unknown> {
    if (!this.child) this.start();
    await this.ready;
    if (this.idle) clearTimeout(this.idle);
    const id = ++this.nextRun;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        // A run past the limit takes the whole process down; the next request starts a fresh one.
        reject(new SandboxRunError({ name: "Error", message: "Tiempo máximo de 15 minutos agotado" }));
        this.runs.delete(id);
        this.child?.kill();
      }, config.maxRunMs);
      this.runs.set(id, { resolve, reject, ctx, env: input.env_name, timer, txs: new Map() });
      this.child!.send({ t: "run", run: id, kind, input });
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
      for (const tx of run.txs.values()) void tx.finish(false).catch(() => {});
      run.reject(new SandboxRunError({ name: "Error", message: "El entorno aislado se detuvo." }));
    }
    this.runs.clear();
    this.child?.kill();
    this.child = null;
    this.ready = null;
  }

  private async onMessage(m: { t: string; run: number; call: number; method: string; args: unknown[]; ok: boolean; value: unknown; error: SandboxError; env: AppEnv; level: "info" | "error"; message: string }) {
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
      for (const tx of run.txs.values()) await tx.finish(false).catch(() => {});
      if (m.ok) run.resolve(m.value);
      else run.reject(new SandboxRunError(m.error));
      return;
    }
    if (m.t === "rpc") {
      try {
        if (!run) throw new Error("Llamada fuera de una ejecución");
        const value = await dispatch(this.projectId, run, m.method, m.args);
        this.child?.send({ t: "rpcResult", call: m.call, ok: true, value });
      } catch (e) {
        this.child?.send({ t: "rpcResult", call: m.call, ok: false, error: { name: (e as Error).name, message: (e as Error).message } });
      }
    }
  }
}

async function beginTransaction(projectId: string, run: Run): Promise<string> {
  const id = `tx${run.txs.size + 1}_${Date.now()}`;
  return new Promise((resolveBegin, rejectBegin) => {
    let settle!: (commit: boolean) => void;
    const done = projectDb(projectId)
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

const sandboxes = new Map<string, ProjectSandbox>();

export async function runInSandbox(projectId: string, kind: "endpoint" | "job" | "test", input: Omit<RunInput, "env">, source: "endpoint" | "job") {
  const ctx = await serviceContext(projectId, input.env_name, input.base, source);
  let box = sandboxes.get(projectId);
  if (!box) sandboxes.set(projectId, (box = new ProjectSandbox(projectId)));
  return box.run(kind, { ...input, env: ctx.env }, ctx);
}

export function stopSandbox(projectId: string) {
  sandboxes.get(projectId)?.stop();
  sandboxes.delete(projectId);
}

export function stopAllSandboxes() {
  for (const box of sandboxes.values()) box.stop();
  sandboxes.clear();
}
