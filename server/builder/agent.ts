import { callModel, maxTokensFor, type Billing, type PickInput, type Role } from "../llm/router.js";
import type { ModelInfo, ModelScope } from "../llm/catalog.js";
import { addUsage, emptyUsage, textOf, type Block, type LlmMessage, type LlmTool, type Usage } from "../llm/types.js";
import { q } from "../platform/db.js";
import { readFile } from "../platform/projects.js";
import { countAction } from "../platform/usage.js";
import { applySummary, estimateTokens, pruneToolResults, renderTranscript, splitForSummary, textTokens, thresholds } from "./compact.js";
import { newRunId, recordStep, recordToolCall } from "./metrics.js";
import type { BuilderTool, ToolContext } from "./tools.js";

/** Events streamed to the studio. `taskId` says which agent lane they belong to. */
export type AgentEvent =
  | { type: "route"; fastPath: boolean; features: unknown; mode?: string }
  | { type: "plan"; summary: string; tasks: { id: string; role: string; goal: string; files: string[]; dependsOn: string[] }[] }
  | { type: "task_start"; taskId: string; role: string; model: string; reason: string }
  | { type: "task_end"; taskId: string; ok: boolean; summary: string; usd: number; tokens: number }
  | { type: "review"; ok: boolean; summary: string; issues: { role: string; problem: string }[] }
  | { type: "text"; text: string; taskId?: string }
  | { type: "tool_start"; id: string; name: string; summary: string; taskId?: string }
  | { type: "tool_end"; id: string; ok: boolean; output: string; taskId?: string }
  | { type: "done"; credits: number; usd: number; baselineUsd: number; cachedTokens: number }
  | { type: "error"; message: string };

// --- Chat history ------------------------------------------------------------------------------

export async function save(projectId: string, msg: LlmMessage, turnId: string) {
  const content = typeof msg.content === "string" ? [{ type: "text", text: msg.content }] : msg.content;
  await q(`insert into chat_messages (project_id, role, content, turn_id) values ($1, $2, $3, $4)`, [projectId, msg.role, JSON.stringify(content), turnId]);
}

/** Raw history, for the chat UI. The model never gets this verbatim (see orchestrator.turnContext). */
export async function loadHistory(projectId: string): Promise<(LlmMessage & { turnId: string | null; createdAt: string })[]> {
  const rows = await q<{ role: "user" | "assistant"; content: Block[]; turn_id: string | null; created_at: string }>(
    `select role, content, turn_id, created_at from chat_messages where project_id = $1 order by id`,
    [projectId],
  );
  return rows.map((r) => ({ role: r.role, content: r.content, turnId: r.turn_id, createdAt: r.created_at }));
}

export const UPLOADS = "static/uploads/";
const IMAGE_TYPES: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp" };

/** Image blocks for the [[adjunto:…]] markers in a message. */
export async function imageBlocks(projectId: string, text: string): Promise<Block[]> {
  const out: Block[] = [];
  for (const [, path] of text.matchAll(/\[\[adjunto:([^\]]+)\]\]/g)) {
    const type = IMAGE_TYPES[path!.split(".").pop()!.toLowerCase()];
    const content = type ? await readFile(projectId, path!) : undefined;
    if (type && content?.startsWith("base64:")) out.push({ type: "image", source: { type: "base64", media_type: type, data: content.slice(7) } });
  }
  return out;
}

/** One-line description of a tool call for the chat UI. */
function summarize(name: string, input: Record<string, unknown>): string {
  if (typeof input.path === "string") return input.path;
  if (Array.isArray(input.paths)) return (input.paths as string[]).join(", ");
  if (typeof input.sql === "string") return input.sql.replace(/\s+/g, " ").slice(0, 80);
  if (typeof input.route === "string") return `${input.method ?? ""} ${input.route}`.trim();
  if (typeof input.name === "string") return input.name;
  if (typeof input.label === "string") return input.label;
  return name;
}

// --- The agent loop --------------------------------------------------------------------------------

export interface AgentSpec {
  scope: ModelScope;
  billing: Billing;
  role: Role;
  routing: PickInput;
  system: string;
  /** The opening user message(s). The run only appends after this: thinking blocks stay valid. */
  messages: LlmMessage[];
  tools: BuilderTool[];
  ctx: ToolContext;
  maxSteps: number;
  signal: AbortSignal;
  emit: (e: AgentEvent) => void;
  taskId?: string;
  turnId: string;
  /** Persist the transcript to chat_messages (the fast agent's turn is the chat itself). */
  persist?: { projectId: string };
  /**
   * A tool the agent must call before it stops (submit_plan, report_review). If it ends
   * without it, it is reminded once and given one more step.
   */
  requiredTool?: string;
  /** Called once the router chose the model, before the first step runs. */
  onModel?: (m: ModelInfo, reason: string) => void;
  /**
   * Checks the orchestrator runs itself when an agent that changed files wants to stop
   * (build, types, runtime problems), so verifying does not depend on the model remembering
   * to. `check` returns what is wrong, or null. On a failure the agent gets the report and
   * a few more steps, up to GATE_FIXES times; then it stops with `gate: "failed"`.
   */
  finishGate?: { check(): Promise<string | null> };
}

/** Fix rounds the finish gate grants, and the extra steps each one gets. */
export const GATE_FIXES = 2;
const GATE_STEPS = 8;

export interface AgentResult {
  text: string;
  model: ModelInfo | null;
  usage: Usage;
  usd: number;
  credits: number;
  steps: { tool: string; summary: string; ok: boolean }[];
  /** null when the agent never ran the check. */
  buildOk: boolean | null;
  testsOk: boolean | null;
  toolErrors: number;
  hitStepLimit: boolean;
  /** Files the agent wrote, renamed or deleted. */
  written: string[];
  /** The finish gate's last verdict; null when it did not run (no gate, or nothing written). */
  gate: "passed" | "failed" | null;
  /** Times the gate sent the agent back to fix something. */
  gateFixes: number;
}

export async function runAgent(spec: AgentSpec): Promise<AgentResult> {
  const history: LlmMessage[] = [...spec.messages];
  const tools: LlmTool[] = spec.tools.map(({ name, description, input_schema }) => ({ name, description, input_schema }));
  const byName = new Map(spec.tools.map((t) => [t.name, t]));
  const result: AgentResult = { text: "", model: null, usage: emptyUsage(), usd: 0, credits: 0, steps: [], buildOk: null, testsOk: null, toolErrors: 0, hitStepLimit: false, written: [], gate: null, gateFixes: 0 };
  const emit = (e: AgentEvent) => spec.emit(spec.taskId && "type" in e && ["text", "tool_start", "tool_end"].includes(e.type) ? ({ ...e, taskId: spec.taskId } as AgentEvent) : e);

  const opening = spec.messages.length;
  const fixedTokens = textTokens(spec.system) + textTokens(JSON.stringify(tools));
  // Lets read_files answer "unchanged" for a file this run already read.
  spec.ctx.reads ??= new Map();

  /**
   * Keeps the history inside the model's window: first stubs old tool results (free), and only
   * if that is not enough folds the oldest steps into a summary. Runs once a threshold is
   * crossed, not every step, so the prompt cache is rewritten once per compaction.
   */
  const fitContext = async () => {
    const window = result.model?.context;
    if (!window) return;
    const limit = thresholds(window);
    const size = () => fixedTokens + estimateTokens(history);
    if (size() <= limit.prune) return;
    const pruned = pruneToolResults(history, opening);
    if (pruned.pruned) {
      history.splice(0, history.length, ...pruned.messages);
      spec.ctx.reads?.clear();
    }
    if (size() <= limit.summarize) return;
    const cut = splitForSummary(history, opening);
    if (cut === null) return;
    try {
      const res = await callModel(
        spec.scope,
        "summarizer",
        { complexity: 1, domains: [], needsVision: false },
        {
          system:
            "Resumes el trabajo hecho hasta ahora por un agente que construye una app, para que pueda seguir sin releer todo. Escribe en español, máximo 400 palabras, solo hechos: el objetivo, qué archivos leyó y qué aprendió de ellos (rutas, nombres, firmas), qué archivos escribió o cambió, decisiones tomadas, errores o avisos sin resolver y qué falta por hacer.",
          messages: [{ role: "user", content: renderTranscript(history.slice(opening, cut)) }],
          maxTokens: 1200,
          signal: spec.signal,
        },
        { billing: spec.billing },
      );
      const summary = textOf(res.response.content).trim();
      if (!summary) return;
      result.usage = addUsage(result.usage, res.response.usage);
      result.usd += res.usd;
      result.credits += res.credits;
      history.splice(0, history.length, ...applySummary(history, opening, cut, summary));
      spec.ctx.reads?.clear();
    } catch {
      // Compacting is an optimisation: if it fails the agent carries on with the pruned history.
    }
  };

  const runId = newRunId();
  let maxSteps = spec.maxSteps;
  let reminded = false;
  /** result.steps.length when the gate last ran: more steps since then need a fresh verdict. */
  let gatedAt = -1;
  /** Runs the gate as a visible step in the lane; returns the report, or null when clean. */
  const runGate = async (): Promise<string | null> => {
    const id = `gate-${runId}-${result.gateFixes}`;
    emit({ type: "tool_start", id, name: "finish_gate", summary: "Comprobación automática antes de terminar" });
    let report: string | null;
    gatedAt = result.steps.length;
    try {
      report = await spec.finishGate!.check();
    } catch (e) {
      // A broken check must not block the agent: record it and let it finish.
      emit({ type: "tool_end", id, ok: false, output: `No se pudo comprobar: ${(e as Error).message}` });
      return null;
    }
    result.gate = report ? "failed" : "passed";
    emit({ type: "tool_end", id, ok: !report, output: report ? report.slice(0, 2000) : "Sin problemas nuevos." });
    return report;
  };
  for (let step = 0; step < maxSteps; step++) {
    if (spec.signal.aborted) throw new Error("Detenido.");
    await fitContext();
    const callStarted = performance.now();
    const call = await callModel(
      spec.scope,
      spec.role,
      spec.routing,
      { system: spec.system, messages: history, tools: tools.length ? tools : undefined, maxTokens: maxTokensFor(spec.role), signal: spec.signal },
      { billing: spec.billing, pinned: result.model ?? undefined, log: { turnId: spec.turnId, taskId: spec.taskId } },
    );
    if (!result.model || result.model.id !== call.model.id) {
      result.model = call.model;
      spec.ctx.actor = `${spec.role}@${call.model.model}`;
      spec.onModel?.(call.model, call.failed.length ? `tras fallar ${call.failed.join("; ")}` : "");
    }
    result.usage = addUsage(result.usage, call.response.usage);
    recordStep({ runId, projectId: spec.ctx.projectId, turnId: spec.turnId, taskId: spec.taskId, role: spec.role, step, modelId: call.model.id, usage: call.response.usage, ms: performance.now() - callStarted, usd: call.usd });
    result.usd += call.usd;
    result.credits += call.credits;

    const assistant: LlmMessage = { role: "assistant", content: call.response.content };
    history.push(assistant);
    if (spec.persist) await save(spec.persist.projectId, assistant, spec.turnId);
    for (const b of call.response.content) if (b.type === "text" && b.text.trim()) emit({ type: "text", text: b.text });
    const texts = call.response.content.filter((b): b is Extract<Block, { type: "text" }> => b.type === "text").map((b) => b.text.trim()).filter(Boolean);
    if (texts.length) result.text = texts.join("\n");

    const calls = call.response.content.filter((b): b is Extract<Block, { type: "tool_use" }> => b.type === "tool_use");
    if (!calls.length) {
      if (spec.requiredTool && !reminded && !result.steps.some((st) => st.tool === spec.requiredTool && st.ok)) {
        reminded = true;
        maxSteps = Math.max(maxSteps, step + 2);
        history.push({ role: "user", content: `Todavía no has llamado a ${spec.requiredTool}. Llámala ahora con la herramienta (no escribas el resultado como texto).` });
        continue;
      }
      if (spec.finishGate && spec.ctx.wrote && !spec.signal.aborted) {
        const report = await runGate();
        if (report && result.gateFixes < GATE_FIXES) {
          result.gateFixes++;
          maxSteps = Math.max(maxSteps, step + 1 + GATE_STEPS);
          // Not persisted: the owner did not write it, and the chat shows it as the gate's step.
          history.push({
            role: "user",
            content: `Comprobación automática antes de terminar: tus cambios dejaron estos problemas.\n\n${report}\n\nArregla la causa (lee el archivo y usa edit_file), comprueba con check_build o get_problems y termina con tu resumen actualizado. Si algo no se puede arreglar dentro de tu tarea, explícalo en el resumen.`,
          });
          continue;
        }
      }
      break;
    }

    // Independent tool calls of one step run concurrently; results go back in one message,
    // followed by any images they returned (screenshots), which the model sees directly.
    const images: Block[] = [];
    const results = await Promise.all(
      calls.map(async (c): Promise<Block> => {
        const summary = summarize(c.name, c.input);
        emit({ type: "tool_start", id: c.id, name: c.name, summary });
        await countAction(spec.ctx.account.id);
        let output: string;
        let ok = true;
        const started = performance.now();
        try {
          const tool = byName.get(c.name);
          if (!tool) throw new Error(`Herramienta no disponible para este agente: ${c.name}`);
          const out = await tool.run(c.input, spec.ctx);
          if (typeof out === "string") output = out;
          else {
            output = out.text;
            // A model without vision would reject the request (or ignore the pixels): say so instead.
            if (result.model?.vision === false) output += `\n(${out.images.length} captura(s) omitida(s): el modelo actual no ve imágenes; fíate del texto y los errores.)`;
            else for (const img of out.images) images.push({ type: "image", source: { type: "base64", ...img } });
          }
        } catch (e) {
          ok = false;
          output = `Error: ${(e as Error).message}`;
        }
        if (c.name === "check_build") result.buildOk = ok && output.startsWith("Compila sin errores");
        if (c.name === "run_tests") result.testsOk = ok && output.startsWith("Todo en verde");
        if (!ok) result.toolErrors++;
        recordToolCall({
          runId,
          projectId: spec.ctx.projectId,
          source: "builder",
          role: spec.role,
          step,
          tool: c.name,
          inputChars: JSON.stringify(c.input ?? {}).length,
          resultChars: output.length,
          ok,
          ms: performance.now() - started,
        });
        result.steps.push({ tool: c.name, summary, ok });
        emit({ type: "tool_end", id: c.id, ok, output: output.slice(0, 2000) });
        return { type: "tool_result", tool_use_id: c.id, content: output, is_error: !ok || undefined };
      }),
    );
    history.push({ role: "user", content: [...results, ...images] });
    // Screenshots are only useful in this run; stored history keeps the text.
    if (spec.persist) await save(spec.persist.projectId, { role: "user", content: results }, spec.turnId);
    if (step === maxSteps - 1) result.hitStepLimit = true;
  }
  // Ran out of steps before the gate saw the last changes: still record an objective verdict.
  if (spec.finishGate && spec.ctx.wrote && gatedAt !== result.steps.length && !spec.signal.aborted) await runGate();
  result.written = [...(spec.ctx.written ?? [])];
  return result;
}
