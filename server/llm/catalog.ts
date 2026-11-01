import { config } from "../config.js";
import { one, q } from "../platform/db.js";
import { audit } from "../settings/store.js";
import type { CompatEndpoint } from "./openaiCompat.js";
import { ensureProviders, onProvidersChanged, OPENROUTER_URL, providerSecret, usableProviders } from "./providers.js";

/**
 * Every model the router may choose from, with what it costs and can do.
 * Ids are "provider:model" (anthropic:claude-sonnet-5-5, openrouter:qwen/qwen3-coder…).
 * They all live in model_catalog: builtin ones (seeded), OpenRouter's (synced daily) and the
 * custom ones admins add. Each can be switched off from the admin panel.
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

/** Providers the router may call: enabled in the admin panel, with a key or URL. */
export function providers(): Provider[] {
  return usableProviders().map((p) =>
    p.kind === "anthropic"
      ? { id: p.id, kind: p.kind }
      : p.id === "openrouter"
        ? { id: p.id, kind: p.kind, endpoint: { baseUrl: OPENROUTER_URL, apiKey: p.apiKey, headers: { "HTTP-Referer": config.publicUrl, "X-Title": "Forja", ...p.headers } } }
        : { id: p.id, kind: p.kind, endpoint: { baseUrl: p.baseUrl!, apiKey: p.apiKey || undefined, headers: p.headers } },
  );
}

export const providerOf = (id: string) => providers().find((p) => p.id === id);

type CatalogRow = {
  id: string;
  provider: string;
  model: string;
  label: string;
  in_price: number;
  out_price: number;
  cache_read_price: number | null;
  long_prompt: ModelInfo["longPrompt"] | null;
  context: number;
  tools: boolean;
  vision: boolean;
  tier: number;
  speed: number;
  source: ModelInfo["source"];
  enabled: boolean;
};

const toModel = (r: CatalogRow): ModelInfo => ({
  id: r.id,
  provider: r.provider,
  model: r.model,
  label: r.label,
  inPrice: r.in_price,
  outPrice: r.out_price,
  // OpenRouter omits it for models without caching: reads then cost like input.
  cacheReadPrice: r.cache_read_price ?? (r.source === "openrouter" ? r.in_price : 0),
  ...(r.long_prompt ? { longPrompt: r.long_prompt } : {}),
  context: r.context,
  tools: r.tools,
  vision: r.vision,
  tier: r.tier,
  speed: r.speed,
  source: r.source,
});

/** Every model whose provider is usable and that an admin has not switched off. */
export async function availableModels(): Promise<ModelInfo[]> {
  await ensureProviders();
  const usable = providers().map((p) => p.id);
  if (!usable.length) return [];
  return (await q<CatalogRow>(`select * from model_catalog where enabled and provider = any($1::text[]) order by provider, id`, [usable])).map(toModel);
}

/** The whole catalog for the admin panel, switched-off models and unusable providers included. */
export async function listCatalog(): Promise<(ModelInfo & { enabled: boolean; available: boolean; allowed: boolean })[]> {
  await ensureProviders();
  const usable = new Set(providers().map((p) => p.id));
  return (await q<CatalogRow>(`select * from model_catalog order by provider, id`)).map((r) => {
    const m = toModel(r);
    return { ...m, enabled: r.enabled, available: r.enabled && usable.has(r.provider), allowed: platformAllows(m) };
  });
}

export class ModelError extends Error {}

export interface ModelInput {
  provider: string;
  model: string;
  label?: string;
  inPrice?: number;
  outPrice?: number;
  cacheReadPrice?: number;
  context?: number;
  tools?: boolean;
  vision?: boolean;
  tier?: number;
  speed?: number;
  enabled?: boolean;
}

const num = (v: unknown, min: number, max: number, what: string) => {
  if (v === undefined) return undefined;
  if (typeof v !== "number" || !Number.isFinite(v) || v < min || v > max) throw new ModelError(`${what}: entre ${min} y ${max}`);
  return v;
};

/**
 * Adds a custom model, or edits any model's label, prices, limits and priors. OpenRouter's
 * daily sync later refreshes prices and limits of its own models, never tier or enabled.
 */
export async function saveModel(input: ModelInput, actorId: string | null, opts: { create?: boolean } = {}): Promise<string> {
  if (!/^[a-z0-9-]{2,32}$/.test(input.provider ?? "")) throw new ModelError("Proveedor no válido");
  if (!input.model?.trim() || input.model.length > 200) throw new ModelError("Falta el nombre del modelo");
  const id = `${input.provider}:${input.model.trim()}`;
  const v = {
    label: input.label === undefined ? undefined : String(input.label).trim().slice(0, 120) || input.model,
    in_price: num(input.inPrice, 0, 1000, "Precio de entrada"),
    out_price: num(input.outPrice, 0, 1000, "Precio de salida"),
    cache_read_price: num(input.cacheReadPrice, 0, 1000, "Precio de lectura de caché"),
    context: num(input.context, 1000, 100_000_000, "Contexto"),
    tools: input.tools === undefined ? undefined : !!input.tools,
    vision: input.vision === undefined ? undefined : !!input.vision,
    tier: num(input.tier, 1, 5, "Calidad"),
    speed: num(input.speed, 1, 5, "Velocidad"),
    enabled: input.enabled === undefined ? undefined : !!input.enabled,
  };
  const existing = await one<{ id: string }>(`select id from model_catalog where id = $1`, [id]);
  if (opts.create) {
    if (existing) throw new ModelError(`El modelo ${id} ya existe.`);
    if (!(await one(`select 1 from providers where id = $1`, [input.provider]))) throw new ModelError(`No existe el proveedor «${input.provider}».`);
    if (input.provider === "openrouter") throw new ModelError("Los modelos de OpenRouter llegan con la sincronización.");
    await q(
      `insert into model_catalog (id, provider, model, label, in_price, out_price, cache_read_price, context, tools, vision, tier, speed, enabled, source)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'custom')`,
      [id, input.provider, input.model.trim(), v.label ?? input.model.trim(), v.in_price ?? 0, v.out_price ?? 0, v.cache_read_price ?? 0, v.context ?? 128_000, v.tools ?? true, v.vision ?? false, v.tier ?? 3, v.speed ?? 3, v.enabled ?? true],
    );
    await audit(`model:${id}`, actorId, "create");
    return id;
  }
  if (!existing) throw new ModelError(`No existe el modelo ${id}.`);
  const entries = Object.entries(v).filter(([, x]) => x !== undefined);
  if (entries.length) {
    await q(`update model_catalog set ${entries.map(([k], i) => `${k} = $${i + 2}`).join(", ")} where id = $1`, [id, ...entries.map(([, x]) => x)]);
    await audit(`model:${id}`, actorId, "set");
  }
  return id;
}

/** Only custom models are deleted; builtin and OpenRouter ones are switched off instead. */
export async function deleteModel(id: string, actorId: string | null): Promise<void> {
  const row = await one<{ source: string }>(`select source from model_catalog where id = $1`, [id]);
  if (!row) throw new ModelError(`No existe el modelo ${id}.`);
  if (row.source !== "custom") throw new ModelError("Solo se borran los modelos propios: desactívalo.");
  await q(`delete from model_catalog where id = $1`, [id]);
  await audit(`model:${id}`, actorId, "delete");
}

// --- Whitelist ------------------------------------------------------------------------------

const globToRegex = (glob: string) => new RegExp(`^${glob.trim().replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`);

export function platformAllows(model: ModelInfo): boolean {
  const globs = config.models.allow;
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
  const key = providerSecret("openrouter");
  if (!key) return Promise.resolve(0);
  syncing ??= (async () => {
    try {
      const res = await fetch(`${OPENROUTER_URL}/models`, { headers: { authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(30_000) });
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

/** Syncs at start-up when the catalog is older than a day, then daily, and as soon as OpenRouter is configured. */
export function startCatalogSync() {
  const tick = async () => {
    if (!providerSecret("openrouter")) return;
    const at = await lastSync();
    if (!at || Date.now() - new Date(at).getTime() > 24 * 3600_000) {
      await syncOpenRouter().catch((e) => console.warn("[forja] sincronización de OpenRouter:", (e as Error).message));
    }
  };
  void ensureProviders().then(tick);
  setInterval(() => void tick(), 3600_000).unref();
  onProvidersChanged(() => void tick());
}
