import { callModel, type Billing, type PickInput, type Role } from "../llm/router.js";
import type { ModelInfo, ModelScope } from "../llm/catalog.js";
import { addUsage, emptyUsage, type Block, type LlmMessage, type LlmTool, type Usage } from "../llm/types.js";
import { q } from "../platform/db.js";
import { readFile } from "../platform/projects.js";
import { countAction } from "../platform/usage.js";
import type { BuilderTool, ToolContext } from "./tools.js";

/** Events streamed to the studio. `taskId` says which agent lane they belong to. */
export type AgentEvent =
  | { type: "route"; fastPath: boolean; features: unknown }
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
export async function loadHistory(projectId: string): Promise<(LlmMessage & { turnId: string | null })[]> {
  const rows = await q<{ role: "user" | "assistant"; content: Block[]; turn_id: string | null }>(
    `select role, content, turn_id from chat_messages where project_id = $1 order by id`,
    [projectId],
  );
  return rows.map((r) => ({ role: r.role, content: r.content, turnId: r.turn_id }));
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
  /** Called once the router chose the model, before the first step runs. */
  onModel?: (m: ModelInfo, reason: string) => void;
}

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
}

export async function runAgent(spec: AgentSpec): Promise<AgentResult> {
  const history: LlmMessage[] = [...spec.messages];
  const tools: LlmTool[] = spec.tools.map(({ name, description, input_schema }) => ({ name, description, input_schema }));
  const byName = new Map(spec.tools.map((t) => [t.name, t]));
  const result: AgentResult = { text: "", model: null, usage: emptyUsage(), usd: 0, credits: 0, steps: [], buildOk: null, testsOk: null, toolErrors: 0, hitStepLimit: false };
  const emit = (e: AgentEvent) => spec.emit(spec.taskId && "type" in e && ["text", "tool_start", "tool_end"].includes(e.type) ? ({ ...e, taskId: spec.taskId } as AgentEvent) : e);

  for (let step = 0; step < spec.maxSteps; step++) {
    if (spec.signal.aborted) throw new Error("Detenido.");
    const call = await callModel(
      spec.scope,
      spec.role,
      spec.routing,
      { system: spec.system, messages: history, tools: tools.length ? tools : undefined, maxTokens: 16000, signal: spec.signal },
      { billing: spec.billing, pinned: result.model ?? undefined, log: { turnId: spec.turnId, taskId: spec.taskId } },
    );
    if (!result.model || result.model.id !== call.model.id) {
      result.model = call.model;
      spec.ctx.actor = `${spec.role}@${call.model.model}`;
      spec.onModel?.(call.model, call.failed.length ? `tras fallar ${call.failed.join("; ")}` : "");
    }
    result.usage = addUsage(result.usage, call.response.usage);
    result.usd += call.usd;
    result.credits += call.credits;

    const assistant: LlmMessage = { role: "assistant", content: call.response.content };
    history.push(assistant);
    if (spec.persist) await save(spec.persist.projectId, assistant, spec.turnId);
    for (const b of call.response.content) if (b.type === "text" && b.text.trim()) emit({ type: "text", text: b.text });
    const texts = call.response.content.filter((b): b is Extract<Block, { type: "text" }> => b.type === "text").map((b) => b.text.trim()).filter(Boolean);
    if (texts.length) result.text = texts.join("\n");

    const calls = call.response.content.filter((b): b is Extract<Block, { type: "tool_use" }> => b.type === "tool_use");
    if (!calls.length) break;

    // Independent tool calls of one step run concurrently; results go back in one message.
    const results = await Promise.all(
      calls.map(async (c): Promise<Block> => {
        const summary = summarize(c.name, c.input);
        emit({ type: "tool_start", id: c.id, name: c.name, summary });
        await countAction(spec.ctx.account.id);
        let output: string;
        let ok = true;
        try {
          const tool = byName.get(c.name);
          if (!tool) throw new Error(`Herramienta no disponible para este agente: ${c.name}`);
          output = await tool.run(c.input, spec.ctx);
        } catch (e) {
          ok = false;
          output = `Error: ${(e as Error).message}`;
        }
        if (c.name === "check_build") result.buildOk = ok && output.startsWith("Compila sin errores");
        if (c.name === "run_tests") result.testsOk = ok && output.startsWith("Todo en verde");
        if (!ok) result.toolErrors++;
        result.steps.push({ tool: c.name, summary, ok });
        emit({ type: "tool_end", id: c.id, ok, output: output.slice(0, 2000) });
        return { type: "tool_result", tool_use_id: c.id, content: output, is_error: !ok || undefined };
      }),
    );
    const toolMsg: LlmMessage = { role: "user", content: results };
    history.push(toolMsg);
    if (spec.persist) await save(spec.persist.projectId, toolMsg, spec.turnId);
    if (step === spec.maxSteps - 1) result.hitStepLimit = true;
  }
  return result;
}
