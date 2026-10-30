import { config } from "../config.js";
import { charge } from "../baas/ai.js";
import { chat, type Block, type LlmMessage } from "../lib/llm.js";
import { getAccount, type Account } from "../platform/accounts.js";
import { q } from "../platform/db.js";
import { createCheckpoint, getProject } from "../platform/projects.js";
import { BUILDER_SYSTEM_PROMPT } from "./prompt.js";
import { builderTools, toolByName, type ToolContext } from "./tools.js";

export type AgentEvent =
  | { type: "text"; text: string }
  | { type: "tool_start"; id: string; name: string; summary: string }
  | { type: "tool_end"; id: string; ok: boolean; output: string }
  | { type: "done"; credits: number }
  | { type: "error"; message: string };

const MAX_STEPS = 40;
/** Older tool results are shortened so long conversations stay within the context window. */
const KEEP_FULL_RESULTS = 12;

const active = new Map<string, AbortController>();

export const isBuilding = (projectId: string) => active.has(projectId);
export const stopBuilding = (projectId: string) => active.get(projectId)?.abort();

export async function loadHistory(projectId: string): Promise<LlmMessage[]> {
  const rows = await q<{ role: "user" | "assistant"; content: Block[] }>(
    `select role, content from chat_messages where project_id = $1 order by id`,
    [projectId],
  );
  return repair(rows.map((r) => ({ role: r.role, content: r.content })));
}

/**
 * A turn stopped mid-tool leaves tool calls without results, which providers reject.
 * Answer them with a placeholder, and merge consecutive user messages.
 */
function repair(history: LlmMessage[]): LlmMessage[] {
  const out: LlmMessage[] = [];
  for (let i = 0; i < history.length; i++) {
    const m = history[i]!;
    const prev = out[out.length - 1];
    if (prev && typeof prev.content !== "string" && prev.role === "assistant") {
      const pending = prev.content.filter((b) => b.type === "tool_use").map((b) => (b as { id: string }).id);
      const answered = new Set(
        m.role === "user" && typeof m.content !== "string"
          ? m.content.filter((b) => b.type === "tool_result").map((b) => (b as { tool_use_id: string }).tool_use_id)
          : [],
      );
      const missing = pending.filter((id) => !answered.has(id));
      if (missing.length) {
        const fill: Block[] = missing.map((id) => ({ type: "tool_result", tool_use_id: id, content: "Interrumpido por el usuario.", is_error: true }));
        if (m.role === "user" && typeof m.content !== "string") {
          out.push({ role: "user", content: [...fill, ...m.content] });
          continue;
        }
        out.push({ role: "user", content: fill });
      }
    }
    const last = out[out.length - 1];
    if (last && last.role === m.role && m.role === "user" && typeof last.content !== "string" && typeof m.content !== "string") {
      last.content = [...last.content, ...m.content];
      continue;
    }
    out.push(m);
  }
  return out;
}

async function save(projectId: string, msg: LlmMessage) {
  const content = typeof msg.content === "string" ? [{ type: "text", text: msg.content }] : msg.content;
  await q(`insert into chat_messages (project_id, role, content) values ($1, $2, $3)`, [projectId, msg.role, JSON.stringify(content)]);
}

function compact(history: LlmMessage[]): LlmMessage[] {
  let seen = 0;
  return [...history]
    .reverse()
    .map((m) => {
      if (typeof m.content === "string" || !m.content.some((b) => b.type === "tool_result")) return m;
      seen++;
      if (seen <= KEEP_FULL_RESULTS) return m;
      return {
        ...m,
        content: m.content.map((b) =>
          b.type === "tool_result" && b.content.length > 400 ? { ...b, content: `${b.content.slice(0, 400)}… (resultado antiguo recortado)` } : b,
        ),
      };
    })
    .reverse();
}

/** One-line description of a tool call for the chat UI. */
function summarize(name: string, input: Record<string, unknown>): string {
  if (typeof input.path === "string") return input.path;
  if (Array.isArray(input.paths)) return (input.paths as string[]).join(", ");
  if (typeof input.sql === "string") return input.sql.replace(/\s+/g, " ").slice(0, 80);
  if (typeof input.name === "string") return input.name;
  if (typeof input.label === "string") return input.label;
  return name;
}

export async function runBuilderTurn(account: Account, projectId: string, userText: string, emit: (e: AgentEvent) => void) {
  if (active.has(projectId)) throw new Error("El constructor ya está trabajando en este proyecto.");
  const abort = new AbortController();
  active.set(projectId, abort);
  let credits = 0;
  const ctx: ToolContext = { account, projectId };
  try {
    const project = await getProject(projectId);
    const fresh = await getAccount(account.id);
    if ((fresh?.credits ?? 0) <= 0) throw new Error("No te quedan créditos para el constructor.");

    const userMsg: LlmMessage = { role: "user", content: [{ type: "text", text: userText }] };
    await save(projectId, userMsg);
    const history = [...(await loadHistory(projectId))];
    const system = `${BUILDER_SYSTEM_PROMPT}\n\n# This project\nName: ${project?.name}\nDescription: ${project?.description || "(none)"}\nOwner email: ${account.email}`;

    for (let step = 0; step < MAX_STEPS; step++) {
      if (abort.signal.aborted) throw new Error("Detenido.");
      const res = await chat({
        provider: config.builder.provider,
        model: config.builder.model,
        system,
        messages: compact(history),
        tools: builderTools.map(({ name, description, input_schema }) => ({ name, description, input_schema })),
        maxTokens: 16000,
        signal: abort.signal,
      });
      credits += await charge(account.id, projectId, "builder", config.builder.model, res.usage);
      const assistant: LlmMessage = { role: "assistant", content: res.content };
      history.push(assistant);
      await save(projectId, assistant);
      for (const b of res.content) if (b.type === "text" && b.text.trim()) emit({ type: "text", text: b.text });

      const calls = res.content.filter((b): b is Extract<Block, { type: "tool_use" }> => b.type === "tool_use");
      if (!calls.length) break;

      const results: Block[] = [];
      for (const call of calls) {
        emit({ type: "tool_start", id: call.id, name: call.name, summary: summarize(call.name, call.input) });
        const tool = toolByName.get(call.name);
        let output: string;
        let ok = true;
        try {
          if (!tool) throw new Error(`Herramienta desconocida: ${call.name}`);
          output = await tool.run(call.input, ctx);
        } catch (e) {
          ok = false;
          output = `Error: ${(e as Error).message}`;
        }
        emit({ type: "tool_end", id: call.id, ok, output: output.slice(0, 2000) });
        results.push({ type: "tool_result", tool_use_id: call.id, content: output, is_error: !ok || undefined });
      }
      const toolMsg: LlmMessage = { role: "user", content: results };
      history.push(toolMsg);
      await save(projectId, toolMsg);
      if (step === MAX_STEPS - 1) emit({ type: "text", text: "Me detuve tras muchos pasos. Escríbeme «continúa» para seguir." });
    }
    emit({ type: "done", credits });
  } catch (e) {
    emit({ type: "error", message: abort.signal.aborted ? "Detenido. Escribe qué quieres cambiar o «continúa»." : (e as Error).message });
  } finally {
    active.delete(projectId);
    if (ctx.wrote) await createCheckpoint(projectId, userText.slice(0, 80)).catch(() => {});
  }
}
