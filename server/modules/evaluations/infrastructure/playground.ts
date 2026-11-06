import { config } from "../../../shared/config.js";
import { describeSchema } from "../../app-services/projectDb.js";
import type { AgentEvent, AgentResult, BuilderTool, ToolContext } from "../ports/builder.js";
import { ensureEvalAccount, spentLast24h } from "./account.js";
import { admission, EvalError, runBudget, type ActiveRun } from "../application/admission.js";
import { evaluationBuilder, evaluationResources } from "./bindings.js";
import { allowedModels, creditsForUsd, setAccountModels, setProjectModels } from "../../model-management/catalog.js";
import { newId } from "../../../shared/crypto.js";
import { one, q } from "../../../shared/database/index.js";
import { removeProjectData } from "../../app-runtime/index.js";

/**
 * Agent playground: one agent of one role, on one chosen model, in a throwaway project of the
 * internal evals account. Nobody's project, data or credits are touched, and the router learns
 * nothing (runAgent alone never teaches the bandit). Spend is capped like the evals: per run by
 * evals.maxRunUsd, and together with the evals by evals.maxDailyUsd.
 *
 * Planner, reviewer and security roles need tools only the orchestrator gives them (submit_plan,
 * report_review…), so the playground offers the roles that work on their own.
 */
export const PLAYGROUND_ROLES = ["fast", "data", "backend", "ui", "chat"] as const;
export type PlaygroundRole = (typeof PLAYGROUND_ROLES)[number];

export class PlaygroundError extends Error {
  constructor(
    public status: 400 | 404 | 409 | 429,
    message: string,
  ) {
    super(message);
  }
}

export interface PlaygroundView {
  id: string;
  status: "running" | "done" | "failed" | "cancelled";
  role: PlaygroundRole;
  modelId: string;
  prompt: string;
  startedAt: string;
  budgetUsd: number;
  events: AgentEvent[];
  result?: { text: string; usd: number; steps: AgentResult["steps"]; gate: AgentResult["gate"]; buildOk: boolean | null; hitStepLimit: boolean; inputTokens: number; outputTokens: number; files: Record<string, string> };
  error?: string;
}

const MAX_EVENTS = 500;
const MAX_FILES_BYTES = 200_000;
const WATCH_MS = 1000;
/** Finished runs kept in memory for the panel to read back. */
const KEEP = 20;

type InternalRun = PlaygroundView & { abort: AbortController; adminId: string; lease: ActiveRun };
const runs = new Map<string, InternalRun>();

const toolsFor = (role: PlaygroundRole): BuilderTool[] => {
  const { ROLE_TOOLS, toolByName } = evaluationBuilder();
  return ROLE_TOOLS[role].map((n) => toolByName.get(n)).filter((t): t is BuilderTool => !!t);
};

export function playgroundRoles() {
  return PLAYGROUND_ROLES.map((role) => ({ role, maxSteps: evaluationBuilder().MAX_STEPS[role], tools: toolsFor(role).map((t) => t.name) }));
}

export async function startPlayground(input: { role?: string; modelId?: string; prompt?: string; files?: Record<string, string>; maxSteps?: number }, adminId: string): Promise<string> {
  const role = input.role as PlaygroundRole;
  if (!PLAYGROUND_ROLES.includes(role)) throw new PlaygroundError(400, `Rol no válido: usa ${PLAYGROUND_ROLES.join(", ")}.`);
  const prompt = String(input.prompt ?? "").trim();
  if (!prompt) throw new PlaygroundError(400, "Escribe qué tiene que hacer el agente.");
  if (prompt.length > 20_000) throw new PlaygroundError(400, "El prompt es demasiado largo (máx. 20 000 caracteres).");
  const files = Object.entries(input.files ?? {}).filter(([p, c]) => typeof p === "string" && typeof c === "string");
  if (files.some(([p]) => !/^[\w./[\]-]+$/.test(p) || p.includes(".."))) throw new PlaygroundError(400, "Hay rutas de archivo no válidas.");
  // One run at a time on the whole platform, and never next to an eval run: they share the internal
  // account, whose models and credit balance each of them sets for itself.
  const { MAX_STEPS } = evaluationBuilder();
  const maxSteps = Math.min(MAX_STEPS[role], Math.max(1, Math.floor(Number(input.maxSteps ?? MAX_STEPS[role])) || 1));
  // Registered before the first await, so a second request (a double click) sees it running.
  const id = newId();
  let lease: ActiveRun;
  try { lease = admission.acquire("playground", id); }
  catch (e) { throw new PlaygroundError(409, (e as Error).message); }
  const run: InternalRun = { id, status: "running", role, modelId: String(input.modelId ?? ""), prompt, startedAt: new Date().toISOString(), budgetUsd: 0, events: [], abort: lease.abort, adminId, lease };
  runs.set(id, run);
  return admission.track(admitPlayground(run, files, maxSteps));
}

async function admitPlayground(run: InternalRun, files: [string, string][], maxSteps: number): Promise<string> {
  try {
    run.budgetUsd = runBudget(undefined, config.evals, await spentLast24h());
    const account = await ensureEvalAccount();
    await setAccountModels(account.id, null);
    const model = (await allowedModels({ accountId: account.id })).find((m) => m.id === run.modelId);
    if (!model) throw new PlaygroundError(400, "Ese modelo no está disponible o no está permitido en la plataforma.");
    if (run.abort.signal.aborted) throw new PlaygroundError(409, "El servidor se está apagando.");
    void admission.track(execute(run, account.id, files, maxSteps)).catch(() => {});
  } catch (e) {
    runs.delete(run.id);
    admission.release(run.lease);
    if (e instanceof EvalError) throw new PlaygroundError(e.status as 400 | 429, e.message);
    throw e;
  }
  prune();
  return run.id;
}

/** A playground run is going (the evals refuse to start meanwhile). */
export const playgroundBusy = () => admission.playgroundBusy();

async function execute(run: InternalRun, accountId: string, files: [string, string][], maxSteps: number) {
  let projectId: string | null = null;
  let watch: NodeJS.Timeout | undefined;
  let watching: Promise<void> | undefined;
  let status: PlaygroundView["status"] = "failed";
  try {
    await q(`update accounts set credits = $2 where id = $1`, [accountId, creditsForUsd(run.budgetUsd) + 1]);
    const project = await evaluationResources().projects.createProject(accountId, `Playground ${run.role}`, "Proyecto desechable del playground de agentes");
    projectId = project.id;
    run.lease.inflight.add(project.id);
    for (const [path, content] of files) await evaluationResources().projects.writeFile(project.id, path, content, "owner");
    await setProjectModels(project.id, [run.modelId]);
    const pid = project.id;
    watch = setInterval(() => {
      if (watching) return;
      watching = one<{ n: number }>(`select coalesce(sum(usd), 0)::float8 as n from ai_usage where project_id = $1`, [pid])
        .then((r) => { if ((r?.n ?? 0) >= run.budgetUsd) run.abort.abort(); })
        .catch(() => {})
        .finally(() => { watching = undefined; });
    }, WATCH_MS);

    const account = (await evaluationResources().identity.getAccount(accountId))!;
    const ctx: ToolContext = { account, projectId: pid, author: "builder", written: new Set() };
    const current = await evaluationResources().projects.readAllFiles(pid);
    const map = evaluationBuilder().projectMap(current, await describeSchema(pid, true));
    const specialist = run.role === "data" || run.role === "backend" || run.role === "ui";
    const text = [specialist ? `# Tu tarea (${run.role}, id playground)\n${run.prompt}` : `## Petición\n${run.prompt}`, map].join("\n\n");
    const gated = run.role !== "chat";
    const result = await evaluationBuilder().runAgent({
      explicitModelId: run.modelId,
      scope: { accountId, projectId: pid },
      billing: { payerId: accountId, projectId: pid, source: "playground" },
      role: run.role,
      routing: { complexity: 3, domains: [run.role === "ui" ? "ui" : "data"], needsVision: false },
      system: `${evaluationBuilder().ROLE_PROMPTS[run.role]}\n\n# This project\nName: Playground\nDescription: proyecto de prueba del panel de administración\nOwner email: ${account.email}`,
      messages: [{ role: "user", content: [{ type: "text", text }] }],
      tools: toolsFor(run.role),
      ctx,
      maxSteps,
      signal: run.abort.signal,
      emit: (e) => void (run.events.length < MAX_EVENTS && run.events.push(e)),
      turnId: `playground-${run.id}`,
      finishGate: gated ? await evaluationBuilder().createFinishGate(pid, ctx).catch(() => undefined) : undefined,
    });
    const after = await evaluationResources().projects.readAllFiles(pid);
    const out: Record<string, string> = {};
    let bytes = 0;
    for (const path of result.written) {
      const content = after[path];
      if (content === undefined || bytes + content.length > MAX_FILES_BYTES) continue;
      out[path] = content;
      bytes += content.length;
    }
    run.result = {
      text: result.text,
      usd: result.usd,
      steps: result.steps,
      gate: result.gate,
      buildOk: result.buildOk,
      hitStepLimit: result.hitStepLimit,
      inputTokens: result.usage.input + result.usage.cacheRead + result.usage.cacheWrite,
      outputTokens: result.usage.output,
      files: out,
    };
    status = "done";
  } catch (e) {
    status = run.abort.signal.aborted ? "cancelled" : "failed";
    run.error = run.abort.signal.aborted ? "Cancelado (por ti o por el tope de gasto)." : (e as Error).message;
  } finally {
    clearInterval(watch);
    await watching;
    if (projectId) {
      // ai_usage rows go with their project (on delete cascade): detach them first, so the run's
      // spend still counts against the daily cap (spentLast24h reads source = 'playground').
      await q(`update ai_usage set project_id = null where project_id = $1`, [projectId]).catch(() => {});
      await evaluationResources().projects.deleteProject(projectId).catch(() => {});
      await removeProjectData(projectId).catch(() => {});
    }
    // What the budget did not use is not left on the internal account.
    await q(`update accounts set credits = 0 where id = $1`, [accountId]).catch(() => {});
    // Only now: a finished run means its throwaway project is already gone.
    run.status = status;
    admission.release(run.lease);
  }
}

const view = ({ abort: _a, adminId: _b, lease: _l, ...rest }: InternalRun): PlaygroundView => rest;

export function playgroundRun(id: string): PlaygroundView | undefined {
  const r = runs.get(id);
  return r && view(r);
}

export function listPlaygroundRuns(): PlaygroundView[] {
  return [...runs.values()].reverse().map((r) => ({ ...view(r), events: [] }));
}

export function cancelPlayground(id: string): boolean {
  const r = runs.get(id);
  if (!r || r.status !== "running") return false;
  r.abort.abort();
  return true;
}

function prune() {
  const done = [...runs.values()].filter((r) => r.status !== "running");
  for (const r of done.slice(0, Math.max(0, done.length - KEEP))) runs.delete(r.id);
}
