import { config } from "../config.js";
import { describeSchema } from "../baas/projectDb.js";
import { runAgent, type AgentEvent, type AgentResult } from "../builder/agent.js";
import { createFinishGate } from "../builder/gate.js";
import { projectMap } from "../builder/index.js";
import { FAST_EXCLUDED_TOOLS, MAX_STEPS, ROLE_PROMPTS, ROLE_TOOLS } from "../builder/roles.js";
import { builderTools, toolByName, type BuilderTool, type ToolContext } from "../builder/tools.js";
import { activeRunId, ensureEvalAccount, spentLast24h } from "../evals/runner.js";
import { allowedModels, creditsForUsd, setAccountModels, setProjectModels } from "../llm/catalog.js";
import type { Role } from "../llm/router.js";
import { newId } from "../lib/crypto.js";
import { getAccount } from "../platform/accounts.js";
import { one, q } from "../platform/db.js";
import { createProject, deleteProject, readAllFiles, writeFile } from "../platform/projects.js";
import { removeProjectData } from "../runtime/projectData.js";

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

const runs = new Map<string, PlaygroundView & { abort: AbortController; adminId: string }>();

const toolsFor = (role: PlaygroundRole): BuilderTool[] =>
  role === "fast" ? builderTools.filter((t) => !FAST_EXCLUDED_TOOLS.includes(t.name)) : ROLE_TOOLS[role].map((n) => toolByName.get(n)).filter((t): t is BuilderTool => !!t);

export function playgroundRoles() {
  return PLAYGROUND_ROLES.map((role) => ({ role, maxSteps: MAX_STEPS[role], tools: toolsFor(role).map((t) => t.name) }));
}

export async function startPlayground(input: { role?: string; modelId?: string; prompt?: string; files?: Record<string, string>; maxSteps?: number }, adminId: string): Promise<string> {
  const role = input.role as PlaygroundRole;
  if (!PLAYGROUND_ROLES.includes(role)) throw new PlaygroundError(400, `Rol no válido: usa ${PLAYGROUND_ROLES.join(", ")}.`);
  const prompt = String(input.prompt ?? "").trim();
  if (!prompt) throw new PlaygroundError(400, "Escribe qué tiene que hacer el agente.");
  if (prompt.length > 20_000) throw new PlaygroundError(400, "El prompt es demasiado largo (máx. 20 000 caracteres).");
  const files = Object.entries(input.files ?? {}).filter(([p, c]) => typeof p === "string" && typeof c === "string");
  if (files.some(([p]) => !/^[\w./[\]-]+$/.test(p) || p.includes(".."))) throw new PlaygroundError(400, "Hay rutas de archivo no válidas.");
  if ([...runs.values()].some((r) => r.adminId === adminId && r.status === "running")) throw new PlaygroundError(409, "Ya tienes una ejecución en curso.");
  // The evals pin the internal account's models for their run: both at once would fight over it.
  if (activeRunId()) throw new PlaygroundError(409, "Hay una ejecución de evals en curso; espera a que termine.");

  const room = config.evals.maxDailyUsd - (await spentLast24h());
  if (room <= 0.01) throw new PlaygroundError(429, `Se alcanzó el tope diario de evals y playground ($${config.evals.maxDailyUsd}).`);
  const budgetUsd = Math.round(Math.min(config.evals.maxRunUsd, room) * 100) / 100;

  const account = await ensureEvalAccount();
  await setAccountModels(account.id, null);
  const model = (await allowedModels({ accountId: account.id })).find((m) => m.id === input.modelId);
  if (!model) throw new PlaygroundError(400, "Ese modelo no está disponible o no está permitido en la plataforma.");
  const maxSteps = Math.min(MAX_STEPS[role], Math.max(1, Math.floor(Number(input.maxSteps ?? MAX_STEPS[role])) || 1));

  const id = newId();
  const run = { id, status: "running" as const, role, modelId: model.id, prompt, startedAt: new Date().toISOString(), budgetUsd, events: [] as AgentEvent[], abort: new AbortController(), adminId };
  runs.set(id, run);
  void execute(run, account.id, files, maxSteps).catch(() => {});
  prune();
  return id;
}

async function execute(run: PlaygroundView & { abort: AbortController }, accountId: string, files: [string, string][], maxSteps: number) {
  let projectId: string | null = null;
  let watch: NodeJS.Timeout | undefined;
  let status: PlaygroundView["status"] = "failed";
  try {
    await q(`update accounts set credits = $2 where id = $1`, [accountId, creditsForUsd(run.budgetUsd) + 1]);
    const project = await createProject(accountId, `Playground ${run.role}`, "Proyecto desechable del playground de agentes");
    projectId = project.id;
    for (const [path, content] of files) await writeFile(project.id, path, content, "owner");
    await setProjectModels(project.id, [run.modelId]);
    const pid = project.id;
    watch = setInterval(() => {
      void one<{ n: number }>(`select coalesce(sum(usd), 0)::float8 as n from ai_usage where project_id = $1`, [pid]).then((r) => {
        if ((r?.n ?? 0) >= run.budgetUsd) run.abort.abort();
      });
    }, WATCH_MS);

    const account = (await getAccount(accountId))!;
    const ctx: ToolContext = { account, projectId: pid, author: "builder", written: new Set() };
    const current = await readAllFiles(pid);
    const map = projectMap(current, await describeSchema(pid, true));
    const specialist = run.role === "data" || run.role === "backend" || run.role === "ui";
    const text = [specialist ? `# Tu tarea (${run.role}, id playground)\n${run.prompt}` : `## Petición\n${run.prompt}`, map].join("\n\n");
    const gated = run.role !== "chat";
    const result = await runAgent({
      scope: { accountId, projectId: pid },
      billing: { payerId: accountId, projectId: pid, source: "playground" },
      role: run.role as Role,
      routing: { complexity: 3, domains: [run.role === "ui" ? "ui" : "data"], needsVision: false },
      system: `${ROLE_PROMPTS[run.role]}\n\n# This project\nName: Playground\nDescription: proyecto de prueba del panel de administración\nOwner email: ${account.email}`,
      messages: [{ role: "user", content: [{ type: "text", text }] }],
      tools: toolsFor(run.role),
      ctx,
      maxSteps,
      signal: run.abort.signal,
      emit: (e) => void (run.events.length < MAX_EVENTS && run.events.push(e)),
      turnId: `playground-${run.id}`,
      finishGate: gated ? await createFinishGate(pid, ctx).catch(() => undefined) : undefined,
    });
    const after = await readAllFiles(pid);
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
    if (projectId) {
      await deleteProject(projectId).catch(() => {});
      await removeProjectData(projectId).catch(() => {});
    }
    // Only now: a finished run means its throwaway project is already gone.
    run.status = status;
  }
}

const view = ({ abort: _a, adminId: _b, ...rest }: PlaygroundView & { abort: AbortController; adminId: string }): PlaygroundView => rest;

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
