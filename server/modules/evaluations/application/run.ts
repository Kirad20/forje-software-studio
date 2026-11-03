import type { EvalCase } from "../domain/cases.js";
import type { CaseResult } from "../domain/score.js";
import type { ActiveRun } from "./admission.js";

export interface Job { c: EvalCase; repeat: number }
export interface Ledger { update(id: string, usd: number): void; settle(id: string, usd: number): void }
export interface Outcome { status: "done" | "cancelled" | "failed"; error: string | null; spent: number }
export interface RunPorts {
  prepare(): Promise<void>;
  measure(projectId: string): Promise<number>;
  saveSpent(run: ActiveRun, usd: number): Promise<unknown>;
  runCase(run: ActiveRun, job: Job, overBudget: () => boolean, ledger: Ledger): Promise<CaseResult>;
  failedResult(job: Job, error: string): CaseResult;
  saveResult(run: ActiveRun, job: Job, result: CaseResult): Promise<unknown>;
  trace(run: ActiveRun, job: Job, result: CaseResult): void;
  stop(projectId: string): void;
  finish(run: ActiveRun, outcome: Outcome): Promise<unknown>;
  cleanup(): Promise<void>;
  watch(tick: () => Promise<void>): () => void;
}

export async function executeRun(
  run: ActiveRun, cases: EvalCase[], repeats: number, concurrency: number, budgetUsd: number,
  ports: RunPorts, release: () => void,
): Promise<void> {
  let spent = 0;
  let overBudget = false;
  const outcome: Outcome = { status: "done", error: null, spent: 0 };
  const inflightSpent = new Map<string, number>();
  const total = () => spent + [...inflightSpent.values()].reduce((a, b) => a + b, 0);
  const abort = () => {
    run.abort.abort();
    for (const id of run.inflight) ports.stop(id);
  };
  const enforceBudget = () => {
    if (!overBudget && total() >= budgetUsd) { overBudget = true; abort(); }
  };
  const monitor: { pending: Promise<void> | null } = { pending: null };
  const tick = (): Promise<void> => {
    if (monitor.pending) return monitor.pending;
    monitor.pending = (async () => {
      for (const id of run.inflight) {
        const usd = await ports.measure(id).catch(() => undefined);
        if (usd !== undefined && run.inflight.has(id)) inflightSpent.set(id, usd);
      }
      enforceBudget();
      await ports.saveSpent(run, total()).catch(() => {});
    })().finally(() => { monitor.pending = null; });
    return monitor.pending;
  };
  const unwatch = ports.watch(tick);
  const ledger: Ledger = {
    update: (id, usd) => {
      if (run.inflight.has(id)) inflightSpent.set(id, usd);
      enforceBudget();
    },
    settle: (id, usd) => {
      run.inflight.delete(id);
      inflightSpent.delete(id);
      spent += usd;
      enforceBudget();
    },
  };
  try {
    await ports.prepare();
    const queue = Array.from({ length: repeats }, (_, i) => cases.map((c) => ({ c, repeat: i + 1 }))).flat();
    const workers = Array.from({ length: Math.min(Math.max(1, Math.floor(concurrency) || 1), queue.length) }, async () => {
      try {
        while (!run.abort.signal.aborted) {
          const job = queue.shift();
          if (!job) return;
          const result = await ports.runCase(run, job, () => overBudget, ledger)
            .catch((e) => ports.failedResult(job, (e as Error).message));
          await ports.saveResult(run, job, result);
          await ports.saveSpent(run, total()).catch(() => {});
          ports.trace(run, job, result);
        }
      } catch (e) {
        outcome.status = "failed";
        outcome.error ??= (e as Error).message;
        abort();
      }
    });
    // A persistence failure must drain every worker before account/project cleanup.
    await Promise.allSettled(workers);
    if (outcome.status !== "failed") {
      if (overBudget) outcome.error = `Presupuesto agotado ($${budgetUsd}): quedaron ejecuciones sin hacer.`;
      else if (run.abort.signal.aborted) outcome.status = "cancelled";
    }
  } catch (e) {
    outcome.status = "failed";
    outcome.error = (e as Error).message;
    abort();
  } finally {
    unwatch();
    await monitor.pending?.catch(() => {});
    inflightSpent.clear();
    try {
      outcome.spent = spent;
      await ports.finish(run, outcome).catch(() => {});
      await ports.cleanup().catch(() => {});
    } finally {
      release();
    }
  }
}

export async function recoverRuns(ports: { interrupt(): Promise<unknown>; sweep(age: number): Promise<unknown> }) {
  await ports.interrupt();
  await ports.sweep(0).catch(() => {});
}
