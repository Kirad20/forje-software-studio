import { config } from "../config.js";

/**
 * One small client for both providers. Messages use Anthropic's block shape internally;
 * the OpenAI-compatible path (OpenAI, Ollama, OpenRouter, vLLM...) converts at the edge.
 */
export type Block =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string; is_error?: boolean };

export interface LlmMessage {
  role: "user" | "assistant";
  content: string | Block[];
}

export interface LlmTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export interface LlmRequest {
  provider: "anthropic" | "openai";
  model: string;
  system?: string;
  messages: LlmMessage[];
  tools?: LlmTool[];
  maxTokens?: number;
  signal?: AbortSignal;
}

export interface LlmResponse {
  content: Block[];
  stopReason: "tool_use" | "end" | "max_tokens";
  usage: { input: number; output: number };
}

export class LlmConfigError extends Error {}

export async function chat(req: LlmRequest): Promise<LlmResponse> {
  return req.provider === "openai" ? openaiChat(req) : anthropicChat(req);
}

/** Credits charged for a call: output tokens weigh more, as they do in provider pricing. */
export const creditsFor = (u: { input: number; output: number }) => Math.max(1, Math.ceil((u.input + u.output * 4) / 1000));

export const textOf = (blocks: Block[]) =>
  blocks
    .filter((b): b is Extract<Block, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("");

async function anthropicChat(req: LlmRequest): Promise<LlmResponse> {
  if (!config.anthropicKey) throw new LlmConfigError("Falta ANTHROPIC_API_KEY en .env");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal: req.signal,
    headers: {
      "content-type": "application/json",
      "x-api-key": config.anthropicKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: req.model,
      max_tokens: req.maxTokens ?? 8192,
      system: req.system,
      messages: req.messages,
      tools: req.tools?.length ? req.tools : undefined,
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 500)}`);
  const data = (await res.json()) as {
    content: Block[];
    stop_reason: string;
    usage: { input_tokens: number; output_tokens: number };
  };
  return {
    content: data.content.filter((b) => b.type === "text" || b.type === "tool_use"),
    stopReason: data.stop_reason === "tool_use" ? "tool_use" : data.stop_reason === "max_tokens" ? "max_tokens" : "end",
    usage: { input: data.usage.input_tokens, output: data.usage.output_tokens },
  };
}

interface OpenAiMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: { id: string; type: "function"; function: { name: string; arguments: string } }[];
  tool_call_id?: string;
}

function toOpenAi(system: string | undefined, messages: LlmMessage[]): OpenAiMessage[] {
  const out: OpenAiMessage[] = system ? [{ role: "system", content: system }] : [];
  for (const m of messages) {
    if (typeof m.content === "string") {
      out.push({ role: m.role, content: m.content });
      continue;
    }
    if (m.role === "assistant") {
      const calls = m.content.filter((b): b is Extract<Block, { type: "tool_use" }> => b.type === "tool_use");
      out.push({
        role: "assistant",
        content: textOf(m.content) || null,
        tool_calls: calls.length
          ? calls.map((c) => ({ id: c.id, type: "function", function: { name: c.name, arguments: JSON.stringify(c.input) } }))
          : undefined,
      });
    } else {
      for (const b of m.content) {
        if (b.type === "tool_result") out.push({ role: "tool", tool_call_id: b.tool_use_id, content: b.content });
        else if (b.type === "text") out.push({ role: "user", content: b.text });
      }
    }
  }
  return out;
}

async function openaiChat(req: LlmRequest): Promise<LlmResponse> {
  const res = await fetch(`${config.openaiBaseUrl}/chat/completions`, {
    method: "POST",
    signal: req.signal,
    headers: {
      "content-type": "application/json",
      ...(config.openaiKey ? { authorization: `Bearer ${config.openaiKey}` } : {}),
    },
    body: JSON.stringify({
      model: req.model,
      max_tokens: req.maxTokens ?? 8192,
      messages: toOpenAi(req.system, req.messages),
      tools: req.tools?.length
        ? req.tools.map((t) => ({ type: "function", function: { name: t.name, description: t.description, parameters: t.input_schema } }))
        : undefined,
    }),
  });
  if (!res.ok) throw new Error(`LLM ${res.status}: ${(await res.text()).slice(0, 500)}`);
  const data = (await res.json()) as {
    choices: { message: OpenAiMessage; finish_reason: string }[];
    usage?: { prompt_tokens: number; completion_tokens: number };
  };
  const msg = data.choices[0]!.message;
  const content: Block[] = [];
  if (msg.content) content.push({ type: "text", text: msg.content });
  for (const c of msg.tool_calls ?? []) {
    let input: Record<string, unknown> = {};
    try {
      input = JSON.parse(c.function.arguments || "{}");
    } catch {
      input = { _raw: c.function.arguments };
    }
    content.push({ type: "tool_use", id: c.id, name: c.function.name, input });
  }
  return {
    content,
    stopReason: msg.tool_calls?.length ? "tool_use" : data.choices[0]!.finish_reason === "length" ? "max_tokens" : "end",
    usage: { input: data.usage?.prompt_tokens ?? 0, output: data.usage?.completion_tokens ?? 0 },
  };
}
