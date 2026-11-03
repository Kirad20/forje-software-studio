import type { Block, Message as LlmMessage } from "./AgentExecution.js";

/**
 * Keeps an agent run's history inside a budget. The loop only ever appends, so a 30-step run
 * resends every old file read at every step. Two levels, cheapest first:
 *  1. `pruneToolResults` replaces old tool results with a one-line stub (no model call).
 *  2. `splitForSummary` + `applySummary` fold the oldest steps into a summary when pruning was
 *     not enough.
 * Both are pure and only run once a threshold is crossed, so the prompt-cache prefix is rewritten
 * once per compaction instead of at every step.
 */

const CHARS_PER_TOKEN = 3.5;
const IMAGE_TOKENS = 1500;

/** Tool results of the latest steps stay whole: the agent is still working from them. */
export const KEEP_RECENT_RESULTS = 6;
/** Assistant steps (with their results) that stay verbatim after a summary. */
export const KEEP_RECENT_STEPS = 4;
/** Results shorter than this are not worth a stub. */
const STUB_OVER = 600;
/** What the summarizer reads at most: the tail of the folded steps. */
const TRANSCRIPT_CHARS = 40_000;

export const textTokens = (s: string) => Math.ceil(s.length / CHARS_PER_TOKEN);

function blockTokens(b: Block): number {
  switch (b.type) {
    case "text":
      return textTokens(b.text);
    case "tool_use":
      return textTokens(b.name + JSON.stringify(b.input ?? {}));
    case "tool_result":
      return textTokens(b.content);
    case "image":
      return IMAGE_TOKENS;
    case "thinking":
      return textTokens(b.thinking);
    case "redacted_thinking":
      return textTokens(b.data);
  }
}

export function estimateTokens(messages: LlmMessage[]): number {
  let n = 0;
  for (const m of messages) n += typeof m.content === "string" ? textTokens(m.content) : m.content.reduce((a, b) => a + blockTokens(b), 0);
  return n;
}

/** Token counts at which to prune and to summarize, for a model with this context window. */
export function thresholds(contextWindow: number) {
  return { prune: Math.min(contextWindow * 0.35, 60_000), summarize: Math.min(contextWindow * 0.6, 100_000) };
}

const callLabel = (name: string, input: Record<string, unknown>): string => {
  const arg =
    typeof input.path === "string" ? input.path
    : Array.isArray(input.paths) ? (input.paths as string[]).join(", ")
    : typeof input.name === "string" ? input.name
    : typeof input.route === "string" ? input.route
    : typeof input.query === "string" ? input.query
    : "";
  return arg ? `${name} ${arg}`.slice(0, 160) : name;
};

const toolLabels = (messages: LlmMessage[]) => {
  const labels = new Map<string, string>();
  for (const m of messages) {
    if (m.role !== "assistant" || typeof m.content === "string") continue;
    for (const b of m.content) if (b.type === "tool_use") labels.set(b.id, callLabel(b.name, b.input ?? {}));
  }
  return labels;
};

const hasResults = (m: LlmMessage) => m.role === "user" && typeof m.content !== "string" && m.content.some((b) => b.type === "tool_result");

/**
 * Stubs the big tool results (and the screenshots next to them) of all but the latest
 * `keepRecent` tool-result messages after index `from` (the opening messages are never touched).
 * Returns the same array when there is nothing to prune.
 */
export function pruneToolResults(messages: LlmMessage[], from: number, keepRecent = KEEP_RECENT_RESULTS): { messages: LlmMessage[]; pruned: number } {
  const idx = messages.flatMap((m, i) => (i >= from && hasResults(m) ? [i] : []));
  const old = new Set(idx.slice(0, Math.max(0, idx.length - keepRecent)));
  if (!old.size) return { messages, pruned: 0 };
  const labels = toolLabels(messages);
  let pruned = 0;
  const next = messages.map((m, i) => {
    if (!old.has(i)) return m;
    const blocks = (m.content as Block[]).flatMap((b): Block[] => {
      if (b.type === "image") {
        pruned++;
        return [];
      }
      if (b.type !== "tool_result" || b.content.length <= STUB_OVER) return [b];
      pruned++;
      return [{ ...b, content: `[${labels.get(b.tool_use_id) ?? "resultado"}: resultado antiguo omitido (${b.content.length} caracteres). Vuelve a pedirlo si lo necesitas.]` }];
    });
    return { ...m, content: blocks };
  });
  return pruned ? { messages: next, pruned } : { messages, pruned: 0 };
}

/**
 * Where to cut for a summary: everything from `from` up to the returned index is folded, the
 * rest stays. The cut is always an assistant message, so no tool_use loses its tool_result.
 * Returns null when there are not enough steps to fold.
 */
export function splitForSummary(messages: LlmMessage[], from: number, keepSteps = KEEP_RECENT_STEPS): number | null {
  const assistants = messages.flatMap((m, i) => (i > from && m.role === "assistant" ? [i] : []));
  if (assistants.length <= keepSteps) return null;
  return assistants[assistants.length - keepSteps]!;
}

/** The folded steps as plain text for the summarizer: what was said, called and returned. */
export function renderTranscript(messages: LlmMessage[]): string {
  const labels = toolLabels(messages);
  const lines: string[] = [];
  for (const m of messages) {
    if (typeof m.content === "string") {
      lines.push(`${m.role === "user" ? "Usuario" : "Agente"}: ${m.content.slice(0, 1500)}`);
      continue;
    }
    for (const b of m.content) {
      if (b.type === "text" && b.text.trim()) lines.push(`${m.role === "user" ? "Usuario" : "Agente"}: ${b.text.trim().slice(0, 1500)}`);
      else if (b.type === "tool_use") lines.push(`→ ${callLabel(b.name, b.input ?? {})}`);
      else if (b.type === "tool_result") lines.push(`← ${labels.get(b.tool_use_id) ?? "resultado"}${b.is_error ? " (error)" : ""}: ${b.content.replace(/\s+/g, " ").slice(0, 300)}`);
    }
  }
  const text = lines.join("\n");
  return text.length > TRANSCRIPT_CHARS ? `…\n${text.slice(-TRANSCRIPT_CHARS)}` : text;
}

/**
 * Replaces messages `[from, cut)` with `summary`, appended to the last opening message
 * (`from - 1`, a user message) so roles keep alternating. Thinking blocks of the folded steps
 * go with them; those of the kept steps stay as they were.
 */
export function applySummary(messages: LlmMessage[], from: number, cut: number, summary: string): LlmMessage[] {
  const opening = messages[from - 1]!;
  const blocks: Block[] = typeof opening.content === "string" ? [{ type: "text", text: opening.content }] : [...opening.content];
  blocks.push({ type: "text", text: `## Resumen de tus pasos anteriores en esta tarea\n${summary}\n\nSigue desde aquí; lo que se leyó antes no está ya en el contexto: vuelve a leer solo lo que necesites.` });
  return [...messages.slice(0, from - 1), { ...opening, content: blocks }, ...messages.slice(cut)];
}
