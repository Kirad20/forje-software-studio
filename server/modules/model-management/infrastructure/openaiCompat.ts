import { ModelCallError, textOf, type Block, type LlmMessage, type LlmRequest, type LlmResponse } from "../domain/messages.js";

/** An OpenAI-compatible endpoint: OpenRouter, Ollama, vLLM, OpenAI, LM Studio… */
export interface CompatEndpoint {
  baseUrl: string;
  apiKey?: string;
  headers?: Record<string, string>;
}

type Part = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };

interface OpenAiMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | Part[] | null;
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
      // Thinking blocks belong to Claude; other providers never see them.
      const calls = m.content.filter((b): b is Extract<Block, { type: "tool_use" }> => b.type === "tool_use");
      out.push({
        role: "assistant",
        content: textOf(m.content) || null,
        tool_calls: calls.length ? calls.map((c) => ({ id: c.id, type: "function", function: { name: c.name, arguments: JSON.stringify(c.input) } })) : undefined,
      });
    } else {
      for (const b of m.content) if (b.type === "tool_result") out.push({ role: "tool", tool_call_id: b.tool_use_id, content: b.content });
      const parts = m.content.flatMap((b): Part[] =>
        b.type === "text"
          ? [{ type: "text", text: b.text }]
          : b.type === "image"
            ? [{ type: "image_url", image_url: { url: `data:${b.source.media_type};base64,${b.source.data}` } }]
            : [],
      );
      if (parts.length) out.push({ role: "user", content: parts.every((p) => p.type === "text") ? parts.map((p) => (p as { text: string }).text).join("\n") : parts });
    }
  }
  return out;
}

export async function compatChat(endpoint: CompatEndpoint, model: string, req: LlmRequest): Promise<LlmResponse> {
  let res: Response;
  try {
    res = await fetch(`${endpoint.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      signal: req.signal,
      headers: {
        "content-type": "application/json",
        ...(endpoint.apiKey ? { authorization: `Bearer ${endpoint.apiKey}` } : {}),
        ...endpoint.headers,
      },
      body: JSON.stringify({
        model,
        max_tokens: req.maxTokens ?? 8192,
        messages: toOpenAi(req.system, req.messages),
        tools: req.tools?.length ? req.tools.map((t) => ({ type: "function", function: { name: t.name, description: t.description, parameters: t.input_schema } })) : undefined,
        // OpenRouter: report real usage, including cached tokens.
        usage: { include: true },
      }),
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new ModelCallError(`${model}: sin conexión (${(e as Error).message})`, true);
  }
  if (!res.ok) {
    const body = (await res.text()).slice(0, 400);
    throw new ModelCallError(`${model} ${res.status}: ${body}`, res.status === 408 || res.status === 429 || res.status >= 500, res.status);
  }
  const data = (await res.json()) as {
    model?: string;
    choices?: { message: OpenAiMessage; finish_reason: string }[];
    usage?: { prompt_tokens: number; completion_tokens: number; prompt_tokens_details?: { cached_tokens?: number } };
    error?: { message?: string };
  };
  const choice = data.choices?.[0];
  if (!choice) throw new ModelCallError(`${model}: respuesta vacía${data.error?.message ? ` (${data.error.message})` : ""}`, true);
  const msg = choice.message;
  const content: Block[] = [];
  if (typeof msg.content === "string" && msg.content) content.push({ type: "text", text: msg.content });
  for (const c of msg.tool_calls ?? []) {
    let input: Record<string, unknown> = {};
    try {
      input = JSON.parse(c.function.arguments || "{}");
    } catch {
      input = { _raw: c.function.arguments };
    }
    content.push({ type: "tool_use", id: c.id, name: c.function.name, input });
  }
  const cached = data.usage?.prompt_tokens_details?.cached_tokens ?? 0;
  return {
    content,
    stopReason: msg.tool_calls?.length ? "tool_use" : choice.finish_reason === "length" ? "max_tokens" : "end",
    usage: { input: Math.max(0, (data.usage?.prompt_tokens ?? 0) - cached), output: data.usage?.completion_tokens ?? 0, cacheRead: cached, cacheWrite: 0 },
    servedBy: data.model ?? model,
  };
}
