import { newId } from "../../../shared/crypto.js";
import { allowedModels, costUsd, type ModelInfo } from "../../model-management/catalog.js";
import { analyzeRequest, callModel, recordOutcome, penalizeTurn as penalizeModels, taskClassOf, type Billing, type Features, type Role } from "../../model-management/router.js";
import { emptyUsage, addUsage, textOf, type Block, type LlmMessage, type Usage } from "../../model-management/types.js";
import { describeSchema } from "../../app-services/projectDb.js";
import type { Account } from "../../identity/contracts.js";
import { getAccount, createCheckpoint, getProject, readAllFiles, writeFile, enabledOrgSkills } from "./CoreModulesAdapter.js";
import { one, q } from "../../../shared/database/index.js";
import { addMemory, memorySection, memorySettings, MEMORY_KINDS } from "../../memory/memory.js";
import type { Project } from "../../projects/index.js";
import { formatProblem } from "../../app-runtime/index.js";
import { typecheckProject } from "../../app-runtime/index.js";
import { skillIndex } from "./skills.js";
import { criteriaOf, CONTRACT_FILE, planOverview } from "../domain/Plan.js";
import { runAgent } from "./AgentExecutionAdapter.js";
import { imageBlocks, save, UPLOADS } from "./SqlChatHistoryAdapter.js";
import type { AgentEvent, AgentExecutionResult } from "../domain/AgentExecution.js";
import { formatProblems, listProblems, recheckBuild, watchProblems } from "../../project-observability/problems.js";
import { holdSync, releaseSync } from "../../integrations/github.js";
import { projectMap, selectContext } from "./projectIndex.js";
import { FAST_EXCLUDED_TOOLS, FIRST_BUILD, MAX_STEPS, PLANNER_FILES, ROLE_PROMPTS, ROLE_TOOLS } from "./roles.js";
import { builderTools, toolByName, type BuilderTool, type ToolContext } from "./BuilderToolsAdapter.js";
import { createFinishGate } from "./FinishGateAdapter.js";
import { rewardOf, ROLE_FOLDERS, type Plan, type PlanTask, type SpecialistRole, type Review } from "../domain/OrchestrationPolicy.js";
import { ScheduleTasksUseCase } from "../application/ScheduleTasksUseCase.js";
import { SqlAgentTaskRepository } from "./SqlAgentTaskRepository.js";
import { RunTaskLaneUseCase } from "../application/RunTaskLaneUseCase.js";
import { BuilderWorkflowUseCase } from "../application/BuilderWorkflowUseCase.js";
import { BuilderRunRegistry } from "../application/BuilderRunRegistry.js";
import { ReviewAndFixUseCase } from "../application/ReviewAndFixUseCase.js";
import { FastBuildUseCase } from "../application/FastBuildUseCase.js";
import { TeamBuildUseCase } from "../application/TeamBuildUseCase.js";
import { CheckPlanUseCase } from "../application/CheckPlanUseCase.js";
import type { ChatMode } from "../domain/BuilderWorkflow.js";

type AgentResult = AgentExecutionResult<ModelInfo>;

/**
 * One builder turn. A request is analysed and routed:
 *  - small or single-domain → one "fast" agent with the full manual and every tool;
 *  - larger → planner → specialists (data, backend, ui) in parallel along the plan's
 *    dependency graph, each with its own model, tools and files → QA → fix rounds.
 * Every model choice goes through the router, and every outcome feeds its bandit.
 */
const active = new BuilderRunRegistry();
const maintenance = new Set<Promise<void>>();
export const isBuilding = (projectId: string) => active.isRunning(projectId);
export const stopBuilding = (projectId: string) => active.cancel(projectId);

function background(task: Promise<void>, operation: string) {
  const pending = task.catch((error) => console.warn(`[forja] ${operation}:`, error));
  maintenance.add(pending);
  void pending.then(() => maintenance.delete(pending));
}

export async function stopBuilder() {
  try {
    await active.stop();
  } finally {
    while (maintenance.size) await Promise.all(maintenance);
  }
}


const RECENT_TURNS = 4;
const tools = (names: string[]) => names.map((n) => toolByName.get(n)).filter((t): t is BuilderTool => !!t);
const FAST_TOOLS = builderTools.filter((t) => !FAST_EXCLUDED_TOOLS.includes(t.name));

// --- Context per turn: a rolling summary + the last few exchanges (text only) -----------------------

function cleanText(blocks: Block[]) {
  return textOf(blocks)
    .replace(/\[\[adjunto:([^\]]+)\]\]/g, "(adjunto $1)")
    .replace(/\n\n\[Elemento seleccionado[\s\S]*$/, " (sobre un elemento seleccionado)")
    .trim();
}

/** Each turn starts a fresh conversation from this, instead of replaying (and editing) the whole thread. */
async function turnContext(projectId: string, turnId: string): Promise<string> {
  const summary = await one<{ summary: string }>(`select summary from conversation_summaries where project_id = $1`, [projectId]);
  const rows = await q<{ role: "user" | "assistant"; content: Block[]; turn_id: string | null }>(
    `select role, content, turn_id from chat_messages where project_id = $1 and coalesce(turn_id, '') <> $2 order by id desc limit 200`,
    [projectId, turnId],
  );
  // Per turn: the owner's message and the builder's last text.
  const turns: { owner: string; reply: string }[] = [];
  const byTurn = new Map<string, { owner: string; reply: string }>();
  for (const r of rows.reverse()) {
    const key = r.turn_id ?? `legacy-${turns.length}`;
    const text = cleanText(r.content);
    if (!text) continue;
    let t = byTurn.get(key);
    if (!t) byTurn.set(key, (t = { owner: "", reply: "" })) && turns.push(t);
    if (r.role === "user") t.owner ||= text;
    else t.reply = text;
  }
  const recent = turns.slice(-RECENT_TURNS);
  const parts = [];
  if (summary?.summary) parts.push(`## Lo hablado antes (resumen)\n${summary.summary}`);
  if (recent.length) {
    parts.push(
      `## Últimos mensajes\n${recent.map((t) => `Dueño: ${t.owner.slice(0, 1500)}\nForja: ${t.reply.slice(0, 1500) || "(sin respuesta)"}`).join("\n\n")}`,
    );
  }
  return parts.join("\n\n");
}

/** Folds turns that left the recent window into the rolling summary, with the cheapest model. */
async function updateSummary(projectId: string, billing: Billing, scope: { accountId: string; projectId: string }) {
  const turns = await q<{ turn_id: string; max_id: number }>(
    `select turn_id, max(id) as max_id from chat_messages where project_id = $1 and turn_id is not null group by turn_id order by max(id)`,
    [projectId],
  );
  if (turns.length <= RECENT_TURNS) return;
  const cutoff = turns[turns.length - RECENT_TURNS - 1]!.max_id;
  const prev = await one<{ summary: string; upto_message_id: number }>(`select summary, upto_message_id from conversation_summaries where project_id = $1`, [projectId]);
  if (prev && prev.upto_message_id >= cutoff) return;
  const rows = await q<{ role: string; content: Block[] }>(
    `select role, content from chat_messages where project_id = $1 and id > $2 and id <= $3 order by id`,
    [projectId, prev?.upto_message_id ?? 0, cutoff],
  );
  const transcript = rows
    .map((r) => `${r.role === "user" ? "Dueño" : "Forja"}: ${cleanText(r.content).slice(0, 2000)}`)
    .filter((l) => !l.endsWith(": "))
    .join("\n");
  if (!transcript) return;
  const res = await callModel(
    scope,
    "summarizer",
    { complexity: 1, domains: [], needsVision: false },
    {
      system:
        "Mantienes el resumen de una conversación entre el dueño de una app y su constructor. Escribe en el idioma del dueño, máximo 250 palabras: qué app es, qué se construyó y decidió, preferencias del dueño y pendientes. Solo hechos.",
      messages: [{ role: "user", content: `Resumen actual:\n${prev?.summary ?? "(vacío)"}\n\nMensajes nuevos:\n${transcript}` }],
      maxTokens: 800,
    },
    { billing },
  );
  const summary = textOf(res.response.content).trim();
  if (!summary) return;
  await q(
    `insert into conversation_summaries (project_id, upto_message_id, summary) values ($1, $2, $3)
     on conflict (project_id) do update set upto_message_id = excluded.upto_message_id, summary = excluded.summary, updated_at = now()`,
    [projectId, cutoff, summary],
  );
  await extractMemories(projectId, billing, scope, transcript);
}

/**
 * The same turns, read once more for the few facts worth keeping as project memory (the
 * agents also save them with remember while they work). Only new ones, at most five a pass.
 */
async function extractMemories(projectId: string, billing: Billing, scope: { accountId: string; projectId: string }, transcript: string) {
  if (!(await memorySettings(projectId, scope.accountId)).projectEnabled) return;
  const known = await q<{ text: string }>(`select text from memories where scope = 'project' and project_id = $1`, [projectId]);
  const res = await callModel(
    scope,
    "summarizer",
    { complexity: 1, domains: [], needsVision: false },
    {
      system: `Extraes la memoria de un proyecto a partir de una conversación entre su dueño y el constructor de la app. Devuelve solo un array JSON, sin texto alrededor, con como mucho 5 objetos {"kind": "${MEMORY_KINDS.join('" | "')}", "text": "…"}: preferencias del dueño, decisiones de diseño o de producto, enfoques que rechazó y datos del negocio (precios, horarios, zonas, palabras prohibidas) que sigan importando en conversaciones futuras. Una frase corta por hecho, en el idioma del dueño. Nada de lo que ya está en la memoria, de tareas puntuales, de suposiciones ni de secretos. Si no hay nada, devuelve [].`,
      messages: [{ role: "user", content: `Memoria actual:\n${known.map((k) => `- ${k.text}`).join("\n") || "(vacía)"}\n\nConversación:\n${transcript}` }],
      maxTokens: 600,
    },
    { billing },
  );
  let facts: { kind?: string; text?: string }[] = [];
  try {
    facts = JSON.parse(/\[[\s\S]*\]/.exec(textOf(res.response.content))?.[0] ?? "[]");
  } catch {
    return;
  }
  for (const f of Array.isArray(facts) ? facts.slice(0, 5) : []) {
    if (typeof f?.text !== "string" || typeof f.kind !== "string") continue;
    await addMemory(projectId, scope.accountId, { scope: "project", kind: f.kind, text: f.text, source: "summary" }).catch(() => {});
  }
}

// --- Plan validation -------------------------------------------------------------------------------

// --- Scheduler -----------------------------------------------------------------------------------

/** Runs tasks as soon as their dependencies finish, at most `limit` at a time. */
async function schedule<T>(tasks: PlanTask[], limit: number, signal: AbortSignal, run: (t: PlanTask) => Promise<T>): Promise<Map<string, T | Error>> {
  return new ScheduleTasksUseCase().execute(tasks, limit, signal, run);
}

// --- Turn ----------------------------------------------------------------------------------------

interface TurnState {
  account: Account;
  project: Project;
  turnId: string;
  scope: { accountId: string; projectId: string };
  billing: Billing;
  features: Features;
  request: string;
  images: Block[];
  context: string;
  /** The "# Memoria" block, loaded once per turn. */
  memory: string;
  skills: string;
  signal: AbortSignal;
  emit: (e: AgentEvent) => void;
  wrote: boolean;
  usage: Usage;
  usd: number;
  credits: number;
  /** An eval turn: see runBuilderTurn. */
  synthetic: boolean;
}

function projectSection(s: TurnState) {
  const p = s.project;
  const profile = p.profile ?? {};
  return [
    `# This project\nName: ${p.name}\nDescription: ${p.description || "(none)"}\nOwner email: ${s.account.email}`,
    p.profile == null
      ? "# Project profile (new project)\nBefore writing code, save the project profile with set_project_profile. Use only facts provided or clearly established by the owner's request; do not invent. Ask one focused question only if needed to identify the app."
      : Object.keys(profile).length ? `# Project profile\n${JSON.stringify(profile)}` : "",
    p.systemPrompt ? `# Owner's project instructions\n${p.systemPrompt}` : "",
    p.designPrompt ? `# Owner's design guidelines\n${p.designPrompt}` : "",
    s.memory,
    s.skills,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function track(s: TurnState, r: AgentResult) {
  s.usage = addUsage(s.usage, r.usage);
  s.usd += r.usd;
  s.credits += r.credits;
}

/**
 * What the bandit learns from a run. Eval turns are synthetic requests: they must never move
 * the router's beliefs about real work, so they do not teach it anything.
 */
const learn = (s: TurnState, ...args: Parameters<typeof recordOutcome>) => (s.synthetic ? Promise.resolve() : recordOutcome(...args));

/**
 * Reward in [0, 1] for one agent run, from what can be observed without a human. The finish
 * gate is the orchestrator's own check, so it outweighs what the agent says it verified.
 */
/** Runs one role as a lane in the chat, recording its model, steps, tokens and cost. */
async function runLane(
  s: TurnState,
  task: { id: string; role: Role; goal: string; files: string[]; dependsOn: string[]; doneWhen?: string[] },
  spec: {
    system: string;
    messages: LlmMessage[];
    tools: BuilderTool[];
    ctx: ToolContext;
    routing: { complexity: number; domains: string[]; needsVision: boolean };
    requiredTool?: string;
  },
): Promise<AgentResult> {
  try {
    const r = await new RunTaskLaneUseCase<typeof spec, ModelInfo, typeof task>({
      repository: new SqlAgentTaskRepository(),
      emit: s.emit,
      recordResult: result => track(s, result),
      createGate: async (_lane: typeof task, input: typeof spec) => createFinishGate(s.project.id, input.ctx),
      run: (lane: typeof task, input: typeof spec, hooks) => runAgent({
        ...input,
        ...hooks,
        scope: s.scope,
        billing: s.billing,
        role: lane.role,
        maxSteps: MAX_STEPS[lane.role],
        signal: s.signal,
        emit: s.emit,
        taskId: lane.id,
        turnId: s.turnId,
      }),
    }).execute({ projectId: s.project.id, turnId: s.turnId }, task, spec);
    s.wrote ||= !!spec.ctx.wrote;
    return r;
  } catch (e) {
    s.wrote ||= !!spec.ctx.wrote;
    throw e;
  }
}

/** Files handed to an agent up front, so it does not spend steps reading them. */
const preloadSection = (files: Record<string, string>, paths: string[]) =>
  paths.length ? `# Archivos relevantes (ya leídos; no hace falta volver a pedirlos)\n${paths.map((p) => `### ${p}\n\`\`\`\n${files[p]}\n\`\`\``).join("\n\n")}` : "";

const isNewApp = (s: TurnState) => s.features.intent === "new_app";

async function runFast(s: TurnState): Promise<void> {
  const ctx: ToolContext = { account: s.account, projectId: s.project.id, author: "builder" };
  // Like the specialists: the map and the files the request most likely touches, already read.
  const files = await readAllFiles(s.project.id);
  const map = projectMap(files, await describeSchema(s.project.id, true));
  // Words in the request pick most files; the request's kind adds the obvious ones.
  const focus = isNewApp(s) ? ["pages/", "components/", "base.css"] : s.features.intent === "style" || s.features.domains.includes("ui") ? ["base.css"] : [];
  const preload = selectContext(files, s.request, focus, 20_000);
  await new FastBuildUseCase<AgentResult, ReturnType<typeof listProblems>[number]>({
    signal: s.signal,
    run: () => runLane(
    s,
    { id: "fast", role: "fast", goal: s.request.slice(0, 500), files: [], dependsOn: [] },
    {
      system: `${ROLE_PROMPTS.fast}\n\n${projectSection(s)}`,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: [s.context, `## Petición\n${s.request}`, isNewApp(s) ? FIRST_BUILD : "", map, preloadSection(files, preload)].filter(Boolean).join("\n\n") },
            ...s.images,
          ],
        },
      ],
      tools: FAST_TOOLS,
      ctx,
      routing: { complexity: s.features.complexity, domains: s.features.domains, needsVision: s.features.needsVision },
    },
    ),
    wrote: () => {
      s.wrote ||= !!ctx.wrote;
      return s.wrote;
    },
    check: () => recheckBuild(s.project.id),
    learn: async (r, broken) => {
      if (r.model) await learn(s, taskClassOf("fast", s.features), r.model, rewardOf({ ...r, buildOk: broken.length ? false : r.buildOk }, null), r.usd);
    },
    fix: (round, reply, broken) => runLane(
      s,
      { id: `fix${round}`, role: "fast", goal: "Arreglar los errores de compilación", files: [], dependsOn: [] },
      {
        system: `${ROLE_PROMPTS.fast}\n\n${projectSection(s)}`,
        messages: [
          {
            role: "user",
            content: `## Petición del dueño (ya hecha)\n${s.request}\n\n## Lo que hiciste\n${reply}\n\n## La app ya no compila\n${formatProblems(broken)}\n\nArregla la causa con el menor cambio posible y comprueba con get_problems. Responde en una o dos frases qué arreglaste.`,
          },
        ],
        tools: FAST_TOOLS,
        ctx: { account: s.account, projectId: s.project.id, author: "builder" },
        routing: { complexity: 2, domains: s.features.domains, needsVision: false },
      },
    ),
    reply: async (reply, initial) => {
      await save(s.project.id, { role: "assistant", content: [{ type: "text", text: reply }] }, s.turnId);
      if (reply !== initial) s.emit({ type: "text", text: reply.slice(initial.length).trim() });
    },
  }).execute();
}

/** Chat mode: answers, explains and investigates with read-only tools; changes nothing. */
async function runChat(s: TurnState): Promise<void> {
  const ctx: ToolContext = { account: s.account, projectId: s.project.id, author: "builder" };
  const r = await runLane(
    s,
    { id: "chat", role: "chat", goal: s.request.slice(0, 500), files: [], dependsOn: [] },
    {
      system: `${ROLE_PROMPTS.chat}\n\n${projectSection(s)}`,
      messages: [{ role: "user", content: [{ type: "text", text: [s.context, `## Pregunta\n${s.request}`].filter(Boolean).join("\n\n") }, ...s.images] }],
      tools: tools(ROLE_TOOLS.chat),
      ctx,
      routing: { complexity: Math.min(3, s.features.complexity), domains: s.features.domains, needsVision: s.features.needsVision },
    },
  );
  if (r.model) await learn(s, taskClassOf("chat", s.features), r.model, rewardOf(r, null), r.usd);
  await save(s.project.id, { role: "assistant", content: [{ type: "text", text: r.text || "…" }] }, s.turnId);
}

export type { ChatMode } from "../domain/BuilderWorkflow.js";

/** A commit title from the owner's request: first line, without pasted errors or element context. */
function commitMessage(request: string): string {
  if (request.startsWith("Arregla est")) return "Forja: arreglar errores de la vista previa";
  const line = request.replace(/\n\n\[Elemento seleccionado[\s\S]*$/, "").replace(/```[\s\S]*?```/g, "").split("\n").find((l) => l.trim()) ?? "Cambios";
  return `Forja: ${line.trim().slice(0, 72)}`;
}

/** The plan waiting for approval in this project, if any (from Plan mode). */
export async function pendingPlan(projectId: string): Promise<{ turnId: string; plan: Plan } | null> {
  const row = await one<{ turn_id: string; plan: Plan }>(`select turn_id, plan from project_plans where project_id = $1`, [projectId]);
  return row ? { turnId: row.turn_id, plan: row.plan } : null;
}

/**
 * The team path. `given` is a plan approved earlier in Plan mode (no re-planning);
 * `planOnly` stops after planning so the owner can review the plan first.
 */
async function runTeam(s: TurnState, opts: { given?: Plan; planOnly?: boolean } = {}): Promise<boolean> {
  const files = await readAllFiles(s.project.id);
  const map = projectMap(files, await describeSchema(s.project.id, true));
  const head = projectSection(s);
  // ui and QA judge layouts from browser_test screenshots: ask for a model that sees them
  // whenever one is allowed (without one, runAgent tells the model the screenshots were left out).
  const canSee = (await allowedModels(s.scope)).some((m) => m.vision && m.tools);
  let overview = "";
  let runSpecialist!: (task: PlanTask, extra?: string) => Promise<AgentResult>;
  let limit = 3;
  return new TeamBuildUseCase<AgentResult>({
    signal: s.signal,
    plan: async planOnly => {

  // 1. Plan.
  let plan: Plan | null = null;
  const submitPlan: BuilderTool = {
    name: "submit_plan",
    description: "Entrega el plan final, una sola vez y al terminar de planificar. Es la única forma de que el equipo empiece a trabajar. Si algo no cumple las reglas (archivos solapados, tarea sin archivos, ruta del contrato sin dueño, contrato que no compila…) se rechaza con la lista de problemas: corrígelos y vuelve a llamar.",
    input_schema: {
      type: "object",
      properties: {
        summary: { type: "string", description: "Para el dueño, en su idioma: qué se va a construir (2–4 frases)." },
        contract: {
          type: "string",
          description: `Código TypeScript COMPLETO de ${CONTRACT_FILE}, que se escribe tal cual en el proyecto y que backend y ui importan. Importa zod y exporta los esquemas de las entidades (con su tipo inferido) y "export const contract = { "GET ruta": { input, output }, "POST ruta": { input, output } } as const" con una entrada por endpoint (la ruta es la del archivo endpoints/<ruta>_<MÉTODO>.ts). Si el proyecto ya tiene contrato, devuélvelo completo conservando las rutas existentes.`,
        },
        later: { type: "array", items: { type: "string" }, description: "Opcional, para peticiones muy grandes: trabajo que dejas para una segunda ronda (máx. 8, una frase cada uno). Este plan solo debe contener la primera fase." },
        tasks: {
          type: "array",
          description: "De 1 a 6 tareas; menos es mejor.",
          items: {
            type: "object",
            properties: {
              id: { type: "string", description: "Identificador corto y único, p. ej. db, api, pages." },
              role: { type: "string", enum: ["data", "backend", "ui"], description: "Especialista que hace la tarea." },
              goal: { type: "string", description: "Qué tiene que construir, con el detalle suficiente para hacerlo sin preguntar." },
              files: {
                type: "array",
                items: { type: "string" },
                description: 'Archivos que solo esta tarea puede escribir: rutas exactas o carpetas terminadas en "/". Dos tareas nunca comparten un archivo.',
              },
              depends_on: { type: "array", items: { type: "string" }, description: "ids de las tareas que deben terminar antes (las de datos van primero)." },
              done_when: { type: "array", items: { type: "string" }, description: 'De 1 a 8 resultados observables que el revisor comprobará uno a uno, p. ej. "POST notes/create sin sesión responde 401".' },
            },
            required: ["id", "role", "goal", "files", "done_when"],
          },
        },
      },
      required: ["summary", "contract", "tasks"],
    },
    async run(input) {
      const checked = await new CheckPlanUseCase({
        compile: async contract => {
          const files = { ...(await readAllFiles(s.project.id)), [CONTRACT_FILE]: contract };
          return (await typecheckProject(files)).filter(p => p.file === CONTRACT_FILE).slice(0, 8).map(p => `${CONTRACT_FILE}: ${formatProblem(p)}`);
        },
      }).execute(input);
      if (!checked.plan) throw new Error(`Plan rechazado (${checked.errors.length}):\n${checked.errors.map((error, i) => `${i + 1}. ${error}`).join("\n")}\nCorrige todo y vuelve a llamar a submit_plan.`);
      plan = checked.plan;
      return `Plan aceptado: ${plan.tasks.length} tareas. Termina ahora con un mensaje corto.`;
    },
  };
  const plannerCtx: ToolContext = { account: s.account, projectId: s.project.id, author: "builder", owned: PLANNER_FILES };
  await runLane(
    s,
    { id: "plan", role: "planner", goal: "Planificar el trabajo del equipo", files: PLANNER_FILES, dependsOn: [] },
    {
      system: `${ROLE_PROMPTS.planner}\n\n${head}`,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: [s.context, `## Petición del dueño\n${s.request}`, isNewApp(s) ? FIRST_BUILD : "", map, "El mapa del proyecto ya está arriba: no llames a project_map. Planifica y llama a submit_plan."].filter(Boolean).join("\n\n") }, ...s.images],
        },
      ],
      // Planner writes are restricted to static/__dev/ through PLANNER_FILES.
      tools: [...tools(ROLE_TOOLS.planner), submitPlan],
      ctx: plannerCtx,
      requiredTool: "submit_plan",
      routing: { complexity: s.features.complexity, domains: s.features.domains, needsVision: s.features.needsVision },
    },
  );
  return plan as Plan | null;
    },
    announce: (finalPlan, approved) => {
  s.emit({ type: "plan", summary: finalPlan.summary, tasks: finalPlan.tasks.map((t) => ({ id: t.id, role: t.role, goal: t.goal, files: t.files, dependsOn: t.dependsOn, doneWhen: t.doneWhen })) });
      if (finalPlan.summary && !approved && !opts.planOnly) s.emit({ type: "text", text: finalPlan.summary });
      if (finalPlan.later.length && !approved && !opts.planOnly) s.emit({ type: "text", text: `Para una segunda ronda dejo:\n${finalPlan.later.map(l => `- ${l}`).join("\n")}` });
    },
    storePlan: async finalPlan => {
    await q(
      `insert into project_plans (project_id, turn_id, plan) values ($1, $2, $3)
       on conflict (project_id) do update set turn_id = excluded.turn_id, plan = excluded.plan, created_at = now()`,
      [s.project.id, s.turnId, JSON.stringify(finalPlan)],
    );
    const ROLE_ES: Record<SpecialistRole, string> = { data: "Datos", backend: "Backend", ui: "Interfaz" };
    const text = [
      finalPlan.summary,
      finalPlan.tasks
        .map((t, i) => `${i + 1}. **${ROLE_ES[t.role]}** — ${t.goal.split("\n")[0]!.slice(0, 240)}${t.dependsOn.length ? ` (después de ${t.dependsOn.join(", ")})` : ""}`)
        .join("\n"),
      finalPlan.contract ? `**Contrato**\n${finalPlan.contract.slice(0, 1500)}` : "",
      finalPlan.tasks.some(t => t.doneWhen.length) ? `**Se dará por hecho cuando**\n${finalPlan.tasks.map(t => `- ${t.id}: ${t.doneWhen.join("; ")}`).join("\n")}` : "",
      finalPlan.later.length ? `**Para una segunda ronda**\n${finalPlan.later.map(l => `- ${l}`).join("\n")}` : "",
      "Pulsa «Implementar plan» para construirlo, o dime qué cambiar.",
    ]
      .filter(Boolean)
      .join("\n\n");
    s.emit({ type: "text", text });
    await save(s.project.id, { role: "assistant", content: [{ type: "text", text }] }, s.turnId);
    },
    writeContract: async plan => {
      if ((await readAllFiles(s.project.id))[CONTRACT_FILE] !== plan.contract) {
        await writeFile(s.project.id, CONTRACT_FILE, plan.contract, "builder");
        s.wrote = true;
      }
    },
    specialists: async finalPlan => {

  // 2. Specialists in parallel along the dependency graph.
  overview = planOverview(finalPlan);
  runSpecialist = async (t: PlanTask, extra = ""): Promise<AgentResult> => {
    const current = await readAllFiles(s.project.id);
    const preload = selectContext(current, `${t.goal}\n${finalPlan.contract}`, t.files, 30_000);
    const ctx: ToolContext = { account: s.account, projectId: s.project.id, author: "builder", owned: t.files };
    const projectDocs = ["static/__dev/design.md", "static/__dev/architecture.md"]
      .map((path) => current[path] && `## ${path}\n${current[path]}`)
      .filter((doc): doc is string => Boolean(doc))
      .join("\n\n");
    const shared = [finalPlan.contract && `# Contrato compartido (ya está escrito en ${CONTRACT_FILE}: impórtalo, no lo copies ni lo cambies)\n${finalPlan.contract}`, `# Plan del equipo\n${overview}`, `# Petición original del dueño\n${s.request}`].filter(Boolean).join("\n\n");
    const own = [
      `# Tu tarea (${t.role}, id ${t.id})\n${t.goal}`,
      `# Tus archivos (solo puedes escribir estos)\n${t.files.join("\n") || "(ninguno)"}`,
      criteriaOf(t) && `# Se dará por hecho cuando\n${criteriaOf(t)}`,
      extra,
      isNewApp(s) && !extra && t.role !== "backend" ? FIRST_BUILD : "",
      `# Documentación del proyecto\nConsulta y respeta el diseño y la arquitectura vigentes. Antes de cambiar decisiones de UI o estructura, lee los documentos completos con read_files. El planificador es responsable de actualizar estas notas compartidas.`,
      projectDocs && `# Notas vigentes\n${projectDocs}`,
      projectMap(current, await describeSchema(s.project.id, true)),
      preloadSection(current, preload),
    ]
      .filter(Boolean)
      .join("\n\n");
    return runLane(s, t, {
      system: `${ROLE_PROMPTS[t.role]}\n\n${head}`,
      messages: [{ role: "user", content: [{ type: "text", text: shared, cache_control: { type: "ephemeral" } }, { type: "text", text: own }, ...(t.role === "ui" ? s.images : [])] }],
      tools: tools(ROLE_TOOLS[t.role]),
      ctx,
      routing: { complexity: s.features.complexity, domains: [t.role === "ui" ? "ui" : t.role === "data" ? "data" : (s.features.domains.find((d) => d !== "ui") ?? "data")], needsVision: t.role === "ui" && (canSee || s.features.needsVision) },
    });
  };
  const project = await one<{ agent_concurrency: number }>(`select agent_concurrency from projects where id = $1`, [s.project.id]);
  limit = Math.min(5, Math.max(1, project?.agent_concurrency ?? 3));
  return schedule(finalPlan.tasks, limit, s.signal, (t) => runSpecialist(t));
    },
    review: async (finalPlan, results) => {

  // 3. Review, then up to two rounds of fixes routed to the owning roles.
  return new ReviewAndFixUseCase<AgentResult>({
    signal: s.signal,
    emitReview: review => s.emit({ type: "review", ok: review.ok, summary: review.summary, issues: review.issues.map(i => ({ role: i.role, problem: i.problem })) }),
    fix: fixTasks => schedule(fixTasks, limit, s.signal, t => runSpecialist(t, "# Contexto\nEs una ronda de correcciones tras la revisión.")),
    review: async (round, fixResults) => {
    let got: Review | null = null;
    const reportReview: BuilderTool = {
      name: "report_review",
      description: "Entrega el veredicto de la revisión, una sola vez y al terminar de revisar.",
      input_schema: {
        type: "object",
        properties: {
          ok: { type: "boolean", description: "true solo si compila, los endpoints responden bien y no hay problemas de seguridad. Si es false, issues no puede ir vacío." },
          summary: { type: "string", description: "Qué se comprobó y qué se encontró, en 1–3 frases." },
          issues: {
            type: "array",
            description: "Solo defectos reales, uno por problema.",
            items: {
              type: "object",
              properties: {
                role: { type: "string", enum: ["data", "backend", "ui"], description: "Especialista que debe arreglarlo." },
                files: { type: "array", items: { type: "string" }, description: "Archivos afectados." },
                problem: { type: "string", description: "Qué está mal y cómo se nota." },
                fix: { type: "string", description: "Cómo arreglarlo, en concreto." },
              },
              required: ["role", "problem"],
            },
          },
        },
        required: ["ok", "summary"],
      },
      async run(input) {
        const i = input as Review;
        if (!i.ok && !(Array.isArray(i.issues) && i.issues.length)) throw new Error("Con ok=false hace falta al menos un issue (role, problem, fix). Vuelve a llamar a report_review.");
        got = {
          ok: !!i.ok,
          summary: String(i.summary ?? ""),
          issues: (Array.isArray(i.issues) ? i.issues : []).filter((x) => x.role in ROLE_FOLDERS).map((x) => ({ role: x.role, files: (x.files ?? []).map(String), problem: String(x.problem), fix: String(x.fix ?? "") })),
        };
        return "Veredicto recibido. Termina ahora.";
      },
    };
    const reports = [...results.entries(), ...fixResults.map((f) => [f.task.id, f.result] as const)]
      .map(([id, r]) => `## ${id}\n${r instanceof Error ? `FALLÓ: ${r.message}` : `Archivos tocados: ${r.written.join(", ") || "ninguno"}\n${r.text.slice(0, 2500)}`}`)
      .join("\n\n");
    await runLane(
      s,
      { id: `qa${round}`, role: "qa", goal: "Revisar el resultado", files: [], dependsOn: [] },
      {
        system: `${ROLE_PROMPTS.qa}\n\n${head}`,
        messages: [
          {
            role: "user",
            content: `# Petición del dueño\n${s.request}\n\n# Plan\n${overview}\n\n# Criterios de aceptación por tarea (comprueba cada uno)\n${finalPlan.tasks.map(t => `## ${t.id}\n${criteriaOf(t) || "(sin criterios)"}`).join("\n")}\n\n# Contrato (${CONTRACT_FILE})\n${finalPlan.contract}\n\n# Informes de los especialistas\n${reports}\n\nRevisa y llama a report_review.`,
          },
        ],
        tools: [...tools(ROLE_TOOLS.qa), reportReview],
        ctx: { account: s.account, projectId: s.project.id, author: "builder", owned: [] },
        requiredTool: "report_review",
        routing: { complexity: s.features.complexity, domains: s.features.domains, needsVision: canSee },
      },
    ).catch(() => null);
    // Assigned inside report_review's closure, which TypeScript cannot see.
    return got as Review | null;
    },
  }).execute(finalPlan.tasks);
    },
    learn: async (finalPlan, results, { review: finalReview, fixes: fixResults }) => {

  // 4. Learning: each model gets the outcome of its own task.
  const reviewOk = finalReview ? finalReview.ok : null;
  for (const t of finalPlan.tasks) {
    const r = results.get(t.id);
    const row = await one<{ model_id: string | null }>(`select model_id from agent_tasks where id = $1`, [`${s.turnId}:${t.id}`]);
    const model = row?.model_id ? (await allowedModels(s.scope)).find((m) => m.id === row.model_id) : undefined;
    if (!model) continue;
    const routing = { complexity: s.features.complexity, domains: [t.role === "ui" ? "ui" : t.role === "data" ? "data" : (s.features.domains.find((d) => d !== "ui") ?? "data")], needsVision: false };
    const needsFix = fixResults.some((f) => f.task.role === t.role);
    const reward = r instanceof Error || !r ? 0 : rewardOf(r, needsFix ? false : reviewOk);
    await learn(s, taskClassOf(t.role, routing), model, reward, r instanceof Error || !r ? 0 : r.usd);
  }
    },
    reply: async (finalPlan, results, { review: finalReview }) => {

  // 5. One reply for the owner, written by the cheapest capable model.
  const reports = [...results.entries()].map(([id, r]) => `${id}: ${r instanceof Error ? `falló (${r.message})` : r.text.slice(0, 1200)}`).join("\n");
  let reply = "";
  try {
    const res = await callModel(
      s.scope,
      "summarizer",
      { complexity: 1, domains: [], needsVision: false },
      {
        system:
          "Eres Forja. Escribe la respuesta final al dueño en su idioma (el de su petición), en palabras sencillas y sin código: primero qué quedó hecho; luego qué se comprobó y qué NO se comprobó (sé honesto: si la revisión falló o algo no se probó, dilo); qué probar en la vista previa; una lista «Ten en cuenta» con atajos tomados, cosas pendientes y lo que tiene que hacer él (secretos, contraseña); y como mucho una pregunta final con el siguiente paso obvio. Breve, en viñetas.",
        messages: [
          {
            role: "user",
            content: `Petición: ${s.request}\n\nPlan: ${finalPlan.summary}\n\nInformes:\n${reports}\n\nRevisión: ${finalReview ? `${finalReview.ok ? "aprobada" : "con problemas"} — ${finalReview.summary}` : "sin revisión"}`,
          },
        ],
        maxTokens: 1200,
      },
      { billing: s.billing },
    );
    s.usage = addUsage(s.usage, res.response.usage);
    s.usd += res.usd;
    s.credits += res.credits;
    reply = textOf(res.response.content).trim();
  } catch {
    // Fall back to the plan and the review, verbatim.
  }
  reply ||= [finalPlan.summary, finalReview?.summary].filter(Boolean).join("\n\n") || "Listo.";
  s.emit({ type: "text", text: reply });
  await save(s.project.id, { role: "assistant", content: [{ type: "text", text: reply }] }, s.turnId);
    },
  }).execute(opts);
}

export function runBuilderTurn(
  account: Account,
  projectId: string,
  userText: string,
  emit: (e: AgentEvent) => void,
  attachments: string[] = [],
  mode: ChatMode = "build",
  implementPlan = false,
  /** `synthetic`: an eval turn (server/evals). It teaches the router nothing and does not touch GitHub or the chat summary. */
  opts: { synthetic?: boolean } = {},
) {
  const abort = new AbortController();
  return active.run(projectId, () => abort.abort(), () => executeBuilderTurn(account, projectId, userText, emit, attachments, mode, implementPlan, opts, abort));
}

async function executeBuilderTurn(
  account: Account,
  projectId: string,
  userText: string,
  emit: (e: AgentEvent) => void,
  attachments: string[],
  mode: ChatMode,
  implementPlan: boolean,
  opts: { synthetic?: boolean },
  abort: AbortController,
) {
  const project = await getProject(projectId);
  if (!project) throw new Error("Proyecto no encontrado.");
  if (!opts.synthetic) holdSync(projectId);
  const turnId = newId();
  const payer = project.ownerId;
  const scope = { accountId: payer, projectId };
  const billing: Billing = { payerId: payer, projectId, source: "builder" };
  const s: TurnState = {
    account,
    project,
    turnId,
    scope,
    billing,
    features: { intent: "feature", complexity: 3, domains: [], needsVision: false, targeted: false, source: "heuristic" },
    request: userText,
    images: [],
    context: "",
    memory: "",
    skills: skillIndex(),
    signal: abort.signal,
    emit,
    wrote: false,
    usage: emptyUsage(),
    usd: 0,
    credits: 0,
    synthetic: !!opts.synthetic,
  };
  await new BuilderWorkflowUseCase<Features, Plan>({
    signal: abort.signal,
    credits: async () => (await getAccount(payer))?.credits ?? 0,
    prepare: async () => {
    const files = attachments.filter((p) => p.startsWith(UPLOADS)).slice(0, 6);
    const text = userText + (files.length ? `\n\n${files.map((p) => `[[adjunto:${p}]]`).join("\n")}` : "");
    s.request = text;
    await save(projectId, { role: "user", content: [{ type: "text", text }] }, turnId);
    s.images = await imageBlocks(projectId, text);
    s.context = await turnContext(projectId, turnId);
    s.memory = await memorySection(projectId, account.id);
    // Like a developer glancing at the console first: what is broken in the preview right now.
    watchProblems(projectId);
    await recheckBuild(projectId).catch(() => {});
    const open = listProblems(projectId);
    if (open.length) s.context += `\n\n## Problemas abiertos en la vista previa\n${formatProblems(open, 8)}`;
    },
    analyze: async () => {
      const fileCount = Object.keys(await readAllFiles(projectId)).length;
      s.skills = skillIndex(await readAllFiles(projectId), await enabledOrgSkills(project.orgId));
      return analyzeRequest(scope, userText, { images: s.images.length, targeted: userText.includes("[Elemento seleccionado"), fileCount });
    },
    pendingPlan: async () => (await pendingPlan(projectId))?.plan ?? null,
    route: (fast, features) => {
      s.features = features;
      emit({ type: "route", fastPath: fast, features, mode });
    },
    chat: () => runChat(s),
    team: options => runTeam(s, options),
    consumePlan: async () => {
      await q(`delete from project_plans where project_id = $1`, [projectId]);
    },
    fast: () => runFast(s),
    fallback: () => emit({ type: "text", text: "No pude repartir el trabajo; lo hago con un solo agente." }),
    done: async () => {
    // What the same tokens would have cost on the strongest allowed model, without caching.
    const models = await allowedModels(scope);
    const strongest = [...models].sort((a, b) => b.tier - a.tier || b.inPrice - a.inPrice)[0] as ModelInfo | undefined;
    const u = s.usage;
    const baselineUsd = strongest ? costUsd(strongest, { input: u.input + u.cacheRead + u.cacheWrite, output: u.output, cacheRead: 0, cacheWrite: 0 }) : s.usd;
    emit({ type: "done", credits: s.credits, usd: s.usd, baselineUsd, cachedTokens: u.cacheRead });
    },
    error: async (error, cancelled) => {
      emit({ type: "error", message: cancelled ? "Detenido. Escribe qué quieres cambiar o «continúa»." : error.message });
      if (cancelled) await penalizeTurn(projectId, turnId, 0.5).catch(() => {});
    },
    cleanup: async () => {},
    wrote: () => s.wrote,
    checkpoint: async () => {
      await createCheckpoint(projectId, userText.slice(0, 80), "builder").catch(() => {});
    },
    releaseSync: () => {
      background(releaseSync(projectId, commitMessage(userText)), "sincronización del constructor");
    },
    updateSummary: () => {
      background(updateSummary(projectId, billing, scope), "resumen del constructor");
    },
  }).execute({ mode, implementPlan, synthetic: opts.synthetic });
}

/**
 * Negative feedback for the models of a turn: the owner stopped it, or restored the code
 * to before it within ten minutes. `weight` softens it, since the reason is not certain.
 */
export async function penalizeTurn(projectId: string, turnId: string | null, weight: number) {
  await penalizeModels(projectId, turnId, weight);
}
