import { ModelCallError, textOf, type Block, type LlmRequest, type LlmResponse } from "../domain/messages.js";
import type { CompatEndpoint } from "../domain/models.js";

interface OllamaMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  images?: string[];
  tool_name?: string;
  tool_calls?: { function: { name: string; arguments: Record<string, unknown> } }[];
}

export const ollamaBaseUrl = (url: string) => url.replace(/\/+$/, "").replace(/\/(?:v1|api)$/, "");

export async function ollamaChat(endpoint: CompatEndpoint, model: string, context: number, req: LlmRequest): Promise<LlmResponse> {
  const messages: OllamaMessage[] = req.system ? [{ role: "system", content: req.system }] : [];
  const toolNames = new Map<string, string>();
  for (const message of req.messages) {
    if (typeof message.content === "string") {
      messages.push({ role: message.role, content: message.content });
    } else if (message.role === "assistant") {
      const calls = message.content.filter(b => b.type === "tool_use");
      for (const call of calls) toolNames.set(call.id, call.name);
      messages.push({
        role: "assistant", content: textOf(message.content),
        ...(calls.length ? { tool_calls: calls.map(c => ({ function: { name: c.name, arguments: c.input } })) } : {}),
      });
    } else {
      for (const block of message.content) {
        if (block.type === "tool_result") messages.push({
          role: "tool", content: block.content, tool_name: toolNames.get(block.tool_use_id),
        });
      }
      const images = message.content.filter(b => b.type === "image").map(b => b.source.data);
      const text = textOf(message.content);
      if (text || images.length) messages.push({ role: "user", content: text, ...(images.length ? { images } : {}) });
    }
  }
  let res: Response;
  try {
    res = await fetch(`${ollamaBaseUrl(endpoint.baseUrl)}/api/chat`, {
      method: "POST",
      signal: req.signal,
      headers: {
        "content-type": "application/json",
        ...(endpoint.apiKey ? { authorization: `Bearer ${endpoint.apiKey}` } : {}),
        ...endpoint.headers,
      },
      body: JSON.stringify({
        model, stream: false, messages,
        options: { num_ctx: context, num_predict: req.maxTokens ?? 8192 },
        tools: req.tools?.map(t => ({ type: "function", function: { name: t.name, description: t.description, parameters: t.input_schema } })),
      }),
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new ModelCallError(`${model}: sin conexión (${(e as Error).message})`, true);
  }
  if (!res.ok) {
    throw new ModelCallError(`${model} ${res.status}: ${(await res.text()).slice(0, 400)}`, res.status === 408 || res.status === 429 || res.status >= 500, res.status);
  }
  const data = await res.json() as {
    model?: string; message?: OllamaMessage; error?: string; done_reason?: string;
    prompt_eval_count?: number; eval_count?: number;
  };
  if (data.error || !data.message) throw new ModelCallError(`${model}: ${data.error ?? "respuesta vacía"}`, true);
  const content: Block[] = [];
  if (data.message.content) content.push({ type: "text", text: data.message.content });
  for (const call of data.message.tool_calls ?? []) {
    content.push({ type: "tool_use", id: `ollama-${crypto.randomUUID()}`, name: call.function.name, input: call.function.arguments });
  }
  return {
    content, stopReason: data.message.tool_calls?.length ? "tool_use" : data.done_reason === "length" ? "max_tokens" : "end",
    usage: { input: data.prompt_eval_count ?? 0, output: data.eval_count ?? 0, cacheRead: 0, cacheWrite: 0 },
    servedBy: data.model ?? model,
  };
}
