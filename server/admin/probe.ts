import Anthropic from "@anthropic-ai/sdk";
import { costUsd, listCatalog, providerOf, type ModelInfo } from "../llm/catalog.js";
import { listProviders, providerSecret } from "../llm/providers.js";
import { invoke } from "../llm/router.js";
import type { LlmResponse } from "../llm/types.js";
import { q } from "../platform/db.js";

/**
 * Connection tests for the admin panel. They answer with what happened, never throw:
 * a wrong key or an unreachable URL is a result to show, not a server error.
 */

const TIMEOUT_MS = 30_000;
const errorOf = (e: unknown) => (e as Error).message?.slice(0, 500) || String(e);

export interface ProviderProbe {
  ok: boolean;
  ms: number;
  /** How many models the provider lists. */
  models?: number;
  error?: string;
}

/** Lists the provider's models: proves the URL answers and the key is accepted. */
export async function probeProvider(id: string): Promise<ProviderProbe> {
  const started = performance.now();
  const ms = () => Math.round(performance.now() - started);
  const view = (await listProviders()).find((p) => p.id === id);
  if (!view) return { ok: false, ms: 0, error: `No existe el proveedor «${id}».` };
  if (!view.available) return { ok: false, ms: 0, error: view.missing ?? "No disponible" };
  try {
    if (view.kind === "anthropic") {
      const sdk = new Anthropic({ apiKey: providerSecret(id)!, maxRetries: 0, timeout: TIMEOUT_MS });
      const page = await sdk.models.list({ limit: 100 });
      return { ok: true, ms: ms(), models: page.data.length };
    }
    const endpoint = providerOf(id)!.endpoint!;
    const res = await fetch(`${endpoint.baseUrl}/models`, {
      headers: { ...(endpoint.apiKey ? { authorization: `Bearer ${endpoint.apiKey}` } : {}), ...endpoint.headers },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return { ok: false, ms: ms(), error: `HTTP ${res.status}: ${(await res.text().catch(() => "")).slice(0, 300)}` };
    const body = (await res.json().catch(() => ({}))) as { data?: unknown[] };
    return { ok: true, ms: ms(), models: Array.isArray(body.data) ? body.data.length : undefined };
  } catch (e) {
    return { ok: false, ms: ms(), error: errorOf(e) };
  }
}

export interface ModelProbe {
  ok: boolean;
  ms: number;
  inputTokens: number;
  outputTokens: number;
  usd: number;
  /** null when the model does not declare tool support (not tried). */
  toolsOk: boolean | null;
  text: string;
  error?: string;
}

export const PROBE_SYSTEM = "Prueba de conexión de Forja. Sigue la instrucción al pie de la letra y sé breve.";

const ECHO_TOOL = {
  name: "echo",
  description: "Devuelve el texto que recibe.",
  input_schema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] },
};

/**
 * Two tiny calls: plain text ("Responde exactamente: OK"), then a forced tool call when the
 * model declares tools. The cost is logged in ai_usage (source admin_probe) but charged to nobody.
 */
export async function probeModel(id: string, adminId: string): Promise<ModelProbe> {
  const m = (await listCatalog()).find((x) => x.id === id);
  const out: ModelProbe = { ok: false, ms: 0, inputTokens: 0, outputTokens: 0, usd: 0, toolsOk: null, text: "" };
  if (!m) return { ...out, error: `No existe el modelo ${id}.` };
  if (!m.available) return { ...out, error: m.enabled ? `El proveedor «${m.provider}» no está disponible.` : "El modelo está desactivado." };
  const started = performance.now();
  const account = async (r: LlmResponse) => {
    out.inputTokens += r.usage.input + r.usage.cacheRead + r.usage.cacheWrite;
    out.outputTokens += r.usage.output;
    const usd = costUsd(m, r.usage);
    out.usd += usd;
    await q(
      `insert into ai_usage (project_id, account_id, source, role, model, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, usd, credits)
       values (null, $1, 'admin_probe', null, $2, $3, $4, $5, $6, $7, 0)`,
      [adminId, m.id, r.usage.input, r.usage.output, r.usage.cacheRead, r.usage.cacheWrite, usd],
    ).catch(() => {});
  };
  try {
    const plain = await call(m, { messages: [{ role: "user", content: "Responde exactamente: OK" }] });
    await account(plain);
    out.text = plain.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim().slice(0, 500);
    out.ok = true;
    if (m.tools) {
      const tooled = await call(m, { messages: [{ role: "user", content: "Llama a la herramienta echo con el texto OK." }], tools: [ECHO_TOOL] });
      await account(tooled);
      out.toolsOk = tooled.content.some((b) => b.type === "tool_use" && b.name === "echo");
    }
  } catch (e) {
    out.error = errorOf(e);
  }
  out.ms = Math.round(performance.now() - started);
  out.usd = Math.round(out.usd * 1e6) / 1e6;
  return out;
}

const call = (m: ModelInfo, req: { messages: { role: "user"; content: string }[]; tools?: typeof ECHO_TOOL[] }) =>
  invoke(m, { system: PROBE_SYSTEM, maxTokens: 200, signal: AbortSignal.timeout(TIMEOUT_MS), ...req });
