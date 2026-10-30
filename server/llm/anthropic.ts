import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config.js";
import { ModelCallError, type Block, type LlmRequest, type LlmResponse } from "./types.js";

let client: Anthropic | undefined;
const getClient = () => {
  if (!config.anthropicKey) throw new ModelCallError("Falta ANTHROPIC_API_KEY", false);
  return (client ??= new Anthropic({ apiKey: config.anthropicKey, maxRetries: 2 }));
};

/** Models that accept the server-side refusal fallback (`fallbacks: "default"`). */
const SERVER_FALLBACK = new Set(["claude-sonnet-5-5", "claude-opus-5-5"]);

/**
 * Calls a Claude model with the official SDK.
 * - Prompt caching: one breakpoint on the system prompt (caches tools + system, which
 *   are stable across every step of a run) and top-level automatic caching for the
 *   growing conversation.
 * - Effort is the cost/depth control; thinking stays adaptive (the default).
 * - Sonnet/Opus 5.5 get the server-side refusal fallback; the router still falls back
 *   client-side to another model for anything else.
 */
export async function anthropicChat(model: string, req: LlmRequest): Promise<LlmResponse> {
  const params = {
    model,
    max_tokens: req.maxTokens ?? 16000,
    system: req.system ? [{ type: "text" as const, text: req.system, cache_control: { type: "ephemeral" as const } }] : undefined,
    messages: req.messages as Anthropic.MessageParam[],
    tools: req.tools?.length ? (req.tools as Anthropic.Tool[]) : undefined,
    cache_control: { type: "ephemeral" as const },
    output_config: req.effort ? { effort: req.effort } : undefined,
  };
  let res: { content: unknown[]; stop_reason: string | null; usage: Anthropic.Usage; model: string };
  try {
    res = SERVER_FALLBACK.has(model)
      ? ((await getClient().beta.messages.create(
          { ...params, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" } as never,
          { signal: req.signal },
        )) as never)
      : ((await getClient().messages.create(params as never, { signal: req.signal })) as never);
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) throw new ModelCallError(`Claude: límite de uso (${e.message})`, true, 429);
    if (e instanceof Anthropic.APIConnectionError) throw new ModelCallError(`Claude: sin conexión (${e.message})`, true);
    if (e instanceof Anthropic.APIError) {
      const status = e.status ?? 0;
      throw new ModelCallError(`Claude ${status}: ${e.message}`, status === 408 || status === 409 || status >= 500, status);
    }
    throw e;
  }
  if (res.stop_reason === "refusal") throw new ModelCallError("El modelo declinó la petición", true);
  const content = (res.content as Block[]).filter((b) => ["text", "tool_use", "thinking", "redacted_thinking"].includes(b.type));
  return {
    content,
    stopReason: res.stop_reason === "tool_use" ? "tool_use" : res.stop_reason === "max_tokens" ? "max_tokens" : "end",
    usage: {
      input: res.usage.input_tokens,
      output: res.usage.output_tokens,
      cacheRead: res.usage.cache_read_input_tokens ?? 0,
      cacheWrite: res.usage.cache_creation_input_tokens ?? 0,
    },
    servedBy: res.model ?? model,
  };
}
