import { EVAL_CASES, EVAL_SET_VERSION, type EvalCase } from "../domain/cases.js";

export const MAX_JOBS = 60;
export const MAX_REPEATS = 5;

export class EvalError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export interface RunRequest {
  cases?: string[];
  sizes?: string[];
  repeats?: number;
  budgetUsd?: number;
  models?: string[];
  judge?: boolean;
  judgeModel?: string;
}

export function planRun(req: RunRequest): { cases: EvalCase[]; repeats: number; jobs: number } {
  const sizes = (req.sizes ?? []).filter((s) => ["small", "medium", "large"].includes(s));
  const ids = [...new Set(req.cases ?? [])];
  const cases = ids.length
    ? ids.map((id) => EVAL_CASES.find((c) => c.id === id)).filter((c): c is EvalCase => !!c)
    : EVAL_CASES.filter((c) => !sizes.length || sizes.includes(c.size));
  if (ids.length && cases.length !== ids.length) throw new EvalError(400, "Hay casos que no existen.");
  if (!cases.length) throw new EvalError(400, "No hay casos que ejecutar.");
  const repeats = Math.min(MAX_REPEATS, Math.max(1, Math.floor(Number(req.repeats ?? 1)) || 1));
  const jobs = cases.length * repeats;
  if (jobs > MAX_JOBS) throw new EvalError(400, `Demasiadas ejecuciones (${jobs}); el máximo es ${MAX_JOBS}.`);
  return { cases, repeats, jobs };
}

export function runBudget(asked: unknown, limits: { maxRunUsd: number; maxDailyUsd: number }, spent: number): number {
  const room = limits.maxDailyUsd - spent;
  if (room <= 0.01) throw new EvalError(429, `Se alcanzó el tope diario de evals y playground ($${limits.maxDailyUsd}).`);
  const n = Number(asked);
  const budget = Math.round(Math.min(Number.isFinite(n) && n > 0 ? n : limits.maxRunUsd, limits.maxRunUsd, room) * 100) / 100;
  if (budget <= 0) throw new EvalError(400, "El presupuesto debe ser mayor que 0.");
  return budget;
}

export interface ActiveRun {
  kind: "eval" | "playground";
  runId: string;
  abort: AbortController;
  inflight: Set<string>;
}

/** One lease fences the shared internal account from the first await through cleanup. */
export class AdmissionState {
  private active: ActiveRun | null = null;
  private draining = false;
  private drains = new Set<Promise<unknown>>();

  acquire(kind: ActiveRun["kind"], runId: string): ActiveRun {
    if (this.draining) throw new EvalError(409, "El servidor se está apagando.");
    if (this.active) throw new EvalError(409, this.active.kind === "eval"
      ? "Ya hay una ejecución de evals en curso."
      : "Hay una ejecución del playground en curso; espera a que termine.");
    return this.active = { kind, runId, abort: new AbortController(), inflight: new Set() };
  }
  release(run: ActiveRun) {
    if (this.active === run) this.active = null;
  }
  activeRunId() { return this.active?.kind === "eval" ? this.active.runId : null; }
  playgroundBusy() { return this.active?.kind === "playground"; }
  cancel(runId: string, stop: (id: string) => void): boolean {
    if (!this.active || this.active.runId !== runId) return false;
    this.active.abort.abort();
    for (const id of this.active.inflight) stop(id);
    return true;
  }
  track<T>(work: Promise<T>): Promise<T> {
    this.drains.add(work);
    void work.then(() => this.drains.delete(work), () => this.drains.delete(work));
    return work;
  }
  async stop(stop: (id: string) => void) {
    this.draining = true;
    if (this.active) this.cancel(this.active.runId, stop);
    while (this.drains.size) await Promise.allSettled([...this.drains]);
  }
}

export const admission = new AdmissionState();

interface JudgeModel { id: string; vision: boolean }
export interface RunConfiguration {
  cases: string[];
  repeats: number;
  models: string[] | null;
  judge: boolean;
  judgeModel: string | null;
  total: number;
  evalSetVersion: number;
}
export interface AdmissionPorts<M extends JudgeModel> {
  newId(): string;
  allowedModels(adminId: string): Promise<M[]>;
  defaultJudge(models: M[]): M | undefined;
  spent(): Promise<number>;
  save(run: ActiveRun, config: RunConfiguration, budget: number): Promise<unknown>;
  launch(run: ActiveRun, cases: EvalCase[], config: { repeats: number; models: string[] | null; judge: M | null }, budget: number): void;
}

export async function startEvaluation<M extends JudgeModel>(
  adminId: string, req: RunRequest, limits: { enabled: boolean; maxRunUsd: number; maxDailyUsd: number },
  state: AdmissionState, ports: AdmissionPorts<M>,
): Promise<{ runId: string; jobs: number; budgetUsd: number }> {
  if (!limits.enabled) throw new EvalError(404, "Los evals están desactivados en este servidor (se activan en Administración → General → Evals de calidad).");
  const run = state.acquire("eval", ports.newId());
  return state.track((async () => {
    try {
      const { cases, repeats, jobs } = planRun(req);
      const allowed = req.models?.length || req.judge !== false ? await ports.allowedModels(adminId) : [];
      let models: string[] | null = null;
      if (req.models?.length) {
        const ok = new Set(allowed.map((m) => m.id));
        const bad = req.models.filter((m) => !ok.has(m));
        if (bad.length) throw new EvalError(400, `Modelos no permitidos: ${bad.join(", ")}`);
        models = [...new Set(req.models)];
      }
      let judge: M | null = null;
      if (req.judge !== false) {
        judge = req.judgeModel
          ? allowed.find((m) => m.id === req.judgeModel && m.vision) ?? null
          : ports.defaultJudge(allowed) ?? null;
        if (!judge) throw new EvalError(400, req.judgeModel
          ? "Ese modelo no puede hacer de juez: debe estar permitido y tener Imágenes activado en Administración → Modelos."
          : "Ningún modelo permitido tiene Imágenes activado. Revisa esa capacidad en Administración → Modelos y los permisos en Cuenta → Modelos, o desactiva el juez.");
      }
      const budgetUsd = runBudget(req.budgetUsd, limits, await ports.spent());
      if (run.abort.signal.aborted) throw new EvalError(409, "El servidor se está apagando.");
      await ports.save(run, {
        cases: cases.map((c) => c.id), repeats, models, judge: !!judge, judgeModel: judge?.id ?? null,
        total: jobs, evalSetVersion: EVAL_SET_VERSION,
      }, budgetUsd);
      ports.launch(run, cases, { repeats, models, judge }, budgetUsd);
      return { runId: run.runId, jobs, budgetUsd };
    } catch (e) {
      state.release(run);
      throw e;
    }
  })());
}
