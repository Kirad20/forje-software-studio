/**
 * Message shapes shared by every provider. They follow the Anthropic Messages API
 * (content blocks); the OpenAI-compatible transport converts at the edge.
 */
export type Block =
  /** `cache_control` marks the end of a prefix worth caching across calls (Anthropic only; other transports ignore it). */
  | { type: "text"; text: string; cache_control?: { type: "ephemeral" } }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string; is_error?: boolean }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
  // Thinking blocks are passed back unchanged within one agent run, never edited.
  | { type: "thinking"; thinking: string; signature: string }
  | { type: "redacted_thinking"; data: string };

export interface LlmMessage {
  role: "user" | "assistant";
  content: string | Block[];
}

export interface LlmTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export type Effort = "low" | "medium" | "high";

export interface LlmRequest {
  system?: string;
  messages: LlmMessage[];
  tools?: LlmTool[];
  maxTokens?: number;
  effort?: Effort;
  signal?: AbortSignal;
}

/** Capacity estimate, including message/tool framing but never base64 image bytes. */
export function estimateRequestTokens(req: LlmRequest): number {
  let images = 0;
  const messages = req.messages.map((m) => ({
    ...m,
    content: typeof m.content === "string" ? m.content : m.content.map((b) => {
      if (b.type !== "image") return b;
      images++;
      return { type: "image" };
    }),
  }));
  const serialized = JSON.stringify({ system: req.system, messages, tools: req.tools });
  return Math.ceil((serialized.length / 3.5 + images * 1500) * 1.2) + 1024;
}

export interface Usage {
  /** Uncached input tokens. */
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

export interface LlmResponse {
  content: Block[];
  stopReason: "tool_use" | "end" | "max_tokens" | "refusal";
  usage: Usage;
  /** The model that actually answered (a server-side fallback may differ from the request). */
  servedBy: string;
}

/** A failed call. `retryable` errors (rate limits, overload, timeouts, refusals) move on to the next model. */
export class ModelCallError extends Error {
  constructor(
    message: string,
    public retryable: boolean,
    public status?: number,
  ) {
    super(message);
    this.name = "ModelCallError";
  }
}

export const textOf = (blocks: Block[]) =>
  blocks
    .filter((b): b is Extract<Block, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("");

export const emptyUsage = (): Usage => ({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0 });

export const addUsage = (a: Usage, b: Usage): Usage => ({
  input: a.input + b.input,
  output: a.output + b.output,
  cacheRead: a.cacheRead + b.cacheRead,
  cacheWrite: a.cacheWrite + b.cacheWrite,
});
