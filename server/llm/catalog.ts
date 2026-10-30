import { config } from "../config.js";
import { one, q } from "../platform/db.js";
import type { CompatEndpoint } from "./openaiCompat.js";

/**
 * Every model the router may choose from, with what it costs and can do.
 * Ids are "provider:model" (anthropic:claude-sonnet-5-5, openrouter:qwen/qwen3-coder…).
 */
export interface ModelInfo {
  id: string;
  provider: string;
  model: string;
  label: string;
  /** USD per million tokens. */
  inPrice: number;
  outPrice: number;
  cacheReadPrice: number;
  /** Above this prompt size some models charge more (Haiku 5.5: 100K). */
  longPrompt?: { threshold: number; inPrice: number; outPrice: number };
  context: number;
  tools: boolean;
  vision: boolean;
  /** 1–5 prior on quality; the router's bandit refines it per task type. */
  tier: number;
  /** 1–5, higher is faster. */
  speed: number;
  source: "builtin" | "openrouter" | "custom";
}

export interface Provider {
  id: string;
  kind: "anthropic" | "openai";
  endpoint?: CompatEndpoint;
}

/** Anthropic first-party prices (USD / MTok), from the Claude API model table. */
const ANTHROPIC: ModelInfo[] = [
  { id: "anthropic:claude-opus-5-5", provider: "anthropic", model: "claude-opus-5-5", label: "Claude Opus 5.5", inPrice: 4, outPrice: 20, cacheReadPrice: 0.2, context: 1_000_000, tools: true, vision: true, tier: 5, speed: 2, source: "builtin" },
  { id: "anthropic:claude-sonnet-5-5", provider: "anthropic", model: "claude-sonnet-5-5", label: "Claude Sonnet 5.5", inPrice: 2, outPrice: 10, cacheReadPrice: 0.2, context: 1_000_000, tools: true, vision: true, tier: 4, speed: 3, source: "builtin" },
  {
    id: "anthropic:claude-haiku-5-5",
    provider: "anthropic",
    model: "claude-haiku-5-5",
    label: "Claude Haiku 5.5",
    inPrice: 0.1,
    outPrice: 0.5,
    cacheReadPrice: 0.01,
    longPrompt: { threshold: 100_000, inPrice: 0.5, outPrice: 2.5 },
    context: 1_000_000,
    tools: true,
    vision: true,
    tier: 3,
    speed: 5,
    source: "builtin",
  },
];

/**
 * Platform defaults when FORJA_MODELS_ALLOW is empty: Sonnet and Haiku, every model of
 * self-declared OpenAI-compatible providers, and a curated, cheap-to-strong spread from
 * OpenRouter. Opus is declared but only used when explicitly allowed.
 */
const DEFAULT_ALLOW = [
  "anthropic:claude-sonnet-5-5",
  "anthropic:claude-haiku-5-5",
  "openai:*",
  "custom:*",
  "openrouter:anthropic/claude-sonnet*",
  "openrouter:anthropic/claude-haiku*",
  "openrouter:google/gemini-*",
  "openrouter:openai/gpt-*",
  "openrouter:deepseek/*",
  "openrouter:qwen/*",
  "openrouter:mistralai/*",
  "openrouter:meta-llama/*",
  "openrouter:moonshotai/*",
  "openrouter:z-ai/*",
];

function parseJson<T>(raw: string, what: string): T[] {
  if (!raw.trim()) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    console.warn(`[forja] ${what} no es JSON válido; se ignora.`);
    return [];
  }
}

export function providers(): Provider[] {
  const list: Provider[] = [];
  if (config.anthropicKey) list.push({ id: "anthropic", kind: "anthropic" });
  if (config.openrouterKey) {
    list.push({
      id: "openrouter",
      kind: "openai",
      endpoint: {
        baseUrl: "https://openrouter.ai/api/v1",
        apiKey: config.openrouterKey,
        headers: { "HTTP-Referer": config.publicUrl, "X-Title": "Forja" },
      },
    });
  }
  if (config.openaiConfigured) list.push({ id: "openai", kind: "openai", endpoint: { baseUrl: config.openaiBaseUrl, apiKey: config.openaiKey || undefined } });
  for (const p of parseJson<{ id: string; baseUrl: string; apiKeyEnv?: string; headers?: Record<string, string> }>(config.extraProviders, "FORJA_PROVIDERS")) {
    if (!p.id || !p.baseUrl || list.some((x) => x.id === p.id)) continue;
    list.push({ id: p.id, kind: "openai", endpoint: { baseUrl: p.baseUrl, apiKey: p.apiKeyEnv ? process.env[p.apiKeyEnv] : undefined, headers: p.headers } });
  }
  return list;
}

export const providerOf = (id: string) => providers().find((p) => p.id === id);

/** Models declared in FORJA_MODELS, plus the legacy BUILDER_MODEL/APP_AI_MODEL on the "openai" provider. */
function customModels(): ModelInfo[] {
  const declared = parseJson<Partial<ModelInfo> & { provider: string; model: string }>(config.extraModels, "FORJA_MODELS");
  const legacy: { provider: string; model: string }[] = [];
  for (const m of [process.env.BUILDER_MODEL, process.env.APP_AI_MODEL]) {
    if (m && !m.startsWith("claude-") && config.openaiConfigured) legacy.push({ provider: "openai", model: m });
  }
  const seen = new Set<string>();
  return [...declared, ...legacy]
    .filter((m) => m.provider && m.model && !seen.has(`${m.provider}:${m.model}`) && seen.add(`${m.provider}:${m.model}`))
    .map((m) => ({
      id: `${m.provider}:${m.model}`,
      provider: m.provider,
      model: m.model,
      label: (m as Partial<ModelInfo>).label ?? m.model,
      inPrice: (m as Partial<ModelInfo>).inPrice ?? 0,
      outPrice: (m as Partial<ModelInfo>).outPrice ?? 0,
      cacheReadPrice: (m as Partial<ModelInfo>).cacheReadPrice ?? 0,
      context: (m as Partial<ModelInfo>).context ?? 128_000,
      tools: (m as Partial<ModelInfo>).tools ?? true,
      vision: (m as Partial<ModelInfo>).vision ?? false,
      tier: (m as Partial<ModelInfo>).tier ?? 3,
      speed: (m as Partial<ModelInfo>).speed ?? 3,
      source: "custom" as const,
    }));
}

async function openrouterModels(): Promise<ModelInfo[]> {
  const rows = await q<{
    id: string;
    provider: string;
    model: string;
    label: string;
    in_price: number;
    out_price: number;
    cache_read_price: number | null;
    context: number;
    tools: boolean;
    vision: boolean;
    tier: number;
    speed: number;
  }>(`select * from model_catalog where provider = 'openrouter'`);
  return rows.map((r) => ({
    id: r.id,
    provider: r.provider,
    model: r.model,
    label: r.label,
    inPrice: r.in_price,
    outPrice: r.out_price,
    cacheReadPrice: r.cache_read_price ?? r.in_price,
    context: r.context,
    tools: r.tools,
    vision: r.vision,
    tier: r.tier,
    speed: r.speed,
    source: "openrouter",
  }));
}

/** Every model whose provider is configured. */
export async function availableModels(): Promise<ModelInfo[]> {
  const configured = new Set(providers().map((p) => p.id));
  const all = [...ANTHROPIC, ...customModels(), ...(configured.has("openrouter") ? await openrouterModels() : [])];
  return all.filter((m) => configured.has(m.provider));
}

// --- Whitelist ------------------------------------------------------------------------------

const globToRegex = (glob: string) => new RegExp(`^${glob.trim().replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`);

export function platformAllows(model: ModelInfo): boolean {
  const globs = config.modelsAllow.trim() ? config.modelsAllow.split(",") : DEFAULT_ALLOW;
  // "custom:*" stands for every model declared in configuration.
  return globs.some((g) => (g.trim() === "custom:*" ? model.source === "custom" : globToRegex(g).test(model.id)));
}

export interface ModelScope {
  /** The account whose whitelist applies: the project owner. */
  accountId: string;
  projectId?: string | null;
}

/**
 * platform ∩ account ∩ project. An account that never customised its list gets every
 * platform-allowed model; a project with no list of its own gets the account's.
 */
export async function allowedModels(scope: ModelScope): Promise<ModelInfo[]> {
  let models = (await availableModels()).filter(platformAllows);
  const acc = await one<{ models_customized: boolean }>(`select models_customized from accounts where id = $1`, [scope.accountId]);
  if (acc?.models_customized) {
    const enabled = new Set((await q<{ model_id: string }>(`select model_id from account_models where account_id = $1`, [scope.accountId])).map((r) => r.model_id));
    models = models.filter((m) => enabled.has(m.id));
  }
  if (scope.projectId) {
    const project = new Set((await q<{ model_id: string }>(`select model_id from project_models where project_id = $1`, [scope.projectId])).map((r) => r.model_id));
    if (project.size) models = models.filter((m) => project.has(m.id));
  }
  return models;
}

export async function setAccountModels(accountId: string, ids: string[] | null) {
  await q(`delete from account_models where account_id = $1`, [accountId]);
  if (ids === null) {
    await q(`update accounts set models_customized = false where id = $1`, [accountId]);
    return;
  }
  for (const id of new Set(ids)) await q(`insert into account_models (account_id, model_id) values ($1, $2)`, [accountId, id]);
  await q(`update accounts set models_customized = true where id = $1`, [accountId]);
}

export async function setProjectModels(projectId: string, ids: string[]) {
  await q(`delete from project_models where project_id = $1`, [projectId]);
  for (const id of new Set(ids)) await q(`insert into project_models (project_id, model_id) values ($1, $2)`, [projectId, id]);
}

// --- Cost -----------------------------------------------------------------------------------

export function costUsd(m: ModelInfo, u: { input: number; output: number; cacheRead: number; cacheWrite: number }) {
  const prompt = u.input + u.cacheRead + u.cacheWrite;
  const long = m.longPrompt && prompt > m.longPrompt.threshold;
  const inP = long ? m.longPrompt!.inPrice : m.inPrice;
  const outP = long ? m.longPrompt!.outPrice : m.outPrice;
  // Cache writes cost 1.25× input; reads use the model's cache-read price.
  return (u.input * inP + u.cacheWrite * inP * 1.25 + u.cacheRead * m.cacheReadPrice + u.output * outP) / 1_000_000;
}

export const creditsForUsd = (usd: number) => (usd > 0 ? Math.max(1, Math.ceil(usd * config.creditsPerUsd)) : 0);

// --- OpenRouter sync ---------------------------------------------------------------------------

/** Initial quality prior by model family; the bandit corrects it with real outcomes. */
function tierFor(id: string, inPrice: number): number {
  const families: [RegExp, number][] = [
    [/claude-opus|gpt-5(?!.*mini|.*nano)|gemini-[\d.]+-pro|o\d-pro/i, 5],
    [/claude-sonnet|gemini-[\d.]+-flash(?!-lite)|deepseek|qwen.*coder|kimi|glm|gpt-.*mini/i, 4],
    [/claude-haiku|flash-lite|qwen|mistral|llama-?[34]|gpt-.*nano|gemma/i, 3],
  ];
  for (const [re, t] of families) if (re.test(id)) return t;
  // Unknown family: price is a weak signal of capability.
  return inPrice >= 3 ? 4 : inPrice >= 0.5 ? 3 : 2;
}

let syncing: Promise<number> | null = null;

/** Pulls OpenRouter's model list (prices, context, tool and image support). */
export function syncOpenRouter(): Promise<number> {
  if (!config.openrouterKey) return Promise.resolve(0);
  syncing ??= (async () => {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/models", { headers: { authorization: `Bearer ${config.openrouterKey}` }, signal: AbortSignal.timeout(30_000) });
      if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
      const data = (await res.json()) as {
        data: {
          id: string;
          name?: string;
          context_length?: number;
          pricing?: { prompt?: string; completion?: string; input_cache_read?: string };
          architecture?: { input_modalities?: string[] };
          supported_parameters?: string[];
        }[];
      };
      let n = 0;
      for (const m of data.data ?? []) {
        const inPrice = Number(m.pricing?.prompt ?? 0) * 1e6;
        const outPrice = Number(m.pricing?.completion ?? 0) * 1e6;
        if (!Number.isFinite(inPrice) || inPrice < 0 || !Number.isFinite(outPrice) || outPrice < 0) continue;
        const tools = (m.supported_parameters ?? []).includes("tools");
        const cacheRead = m.pricing?.input_cache_read ? Number(m.pricing.input_cache_read) * 1e6 : null;
        const speed = /flash|mini|nano|haiku|lite|8b|7b/i.test(m.id) ? 5 : /opus|pro|405b|large/i.test(m.id) ? 2 : 3;
        await q(
          `insert into model_catalog (id, provider, model, label, in_price, out_price, cache_read_price, context, tools, vision, tier, speed, synced_at)
           values ($1, 'openrouter', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now())
           on conflict (id) do update set label = excluded.label, in_price = excluded.in_price, out_price = excluded.out_price,
             cache_read_price = excluded.cache_read_price, context = excluded.context, tools = excluded.tools, vision = excluded.vision,
             speed = excluded.speed, synced_at = now()`,
          [
            `openrouter:${m.id}`,
            m.id,
            m.name ?? m.id,
            inPrice,
            outPrice,
            cacheRead,
            m.context_length ?? 32_000,
            tools,
            (m.architecture?.input_modalities ?? []).includes("image"),
            tierFor(m.id, inPrice),
            speed,
          ],
        );
        n++;
      }
      return n;
    } finally {
      syncing = null;
    }
  })();
  return syncing;
}

export async function lastSync(): Promise<string | null> {
  return (await one<{ at: string | null }>(`select max(synced_at) as at from model_catalog where provider = 'openrouter'`))?.at ?? null;
}

/** Syncs at start-up when the catalog is older than a day, then daily. */
export function startCatalogSync() {
  if (!config.openrouterKey) return;
  const tick = async () => {
    const at = await lastSync();
    if (!at || Date.now() - new Date(at).getTime() > 24 * 3600_000) {
      await syncOpenRouter().catch((e) => console.warn("[forja] sincronización de OpenRouter:", (e as Error).message));
    }
  };
  void tick();
  setInterval(() => void tick(), 3600_000).unref();
}
