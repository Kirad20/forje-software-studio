import { config } from "../../../shared/config.js";
import { one, q } from "../../../shared/database/index.js";
import { audit } from "../audit.js";
import type { ModelInfo } from "../domain/models.js";
import type { CatalogRepository } from "../ports/CatalogRepository.js";
import { ensureProviders, usableProviders } from "../providers.js";
import { validateCapabilityProfile, validateReasoningEffort } from "./CapabilityProfiles.js";

type Row = {
  id: string; provider: string; model: string; label: string; in_price: number; out_price: number;
  cache_read_price: number | null; long_prompt: ModelInfo["longPrompt"] | null; context: number;
  tools: boolean; vision: boolean; tier: number; speed: number; source: ModelInfo["source"]; enabled: boolean;
  capabilities: ModelInfo["capabilities"] | null; reasoning_effort: boolean | null;
};
const toModel = (r: Row): ModelInfo => ({
  id: r.id, provider: r.provider, model: r.model, label: r.label, inPrice: r.in_price, outPrice: r.out_price,
  cacheReadPrice: r.cache_read_price ?? (r.source === "openrouter" ? r.in_price : 0),
  ...(r.long_prompt ? { longPrompt: r.long_prompt } : {}), context: r.context, tools: r.tools,
  vision: r.vision, tier: r.tier, speed: r.speed, source: r.source,
  ...(r.capabilities ? { capabilities: validateCapabilityProfile(r.capabilities) } : {}),
  ...(r.reasoning_effort === null || r.reasoning_effort === undefined ? {} : { reasoningEffort: r.reasoning_effort }),
});
const columns = { label: "label", inPrice: "in_price", outPrice: "out_price", cacheReadPrice: "cache_read_price",
  context: "context", tools: "tools", vision: "vision", tier: "tier", speed: "speed", enabled: "enabled",
  capabilities: "capabilities", reasoningEffort: "reasoning_effort" } as const;
function profileValues(values: object) {
  const profile = values as { capabilities?: unknown; reasoningEffort?: unknown };
  return {
    capabilities: profile.capabilities === undefined ? undefined : validateCapabilityProfile(profile.capabilities),
    reasoningEffort: profile.reasoningEffort === undefined ? undefined : validateReasoningEffort(profile.reasoningEffort),
  };
}

export const postgresCatalogRepository: CatalogRepository = {
  policy: () => ({ allow: config.models.allow, creditsPerUsd: config.creditsPerUsd }),
  async usableProviderIds() {
    await ensureProviders();
    return usableProviders().map(p => p.id);
  },
  async available() {
    const usable = await postgresCatalogRepository.usableProviderIds();
    if (!usable.length) return [];
    return (await q<Row>(`select * from model_catalog where enabled and provider = any($1::text[]) order by provider, id`, [usable])).map(toModel);
  },
  async list() {
    return (await q<Row>(`select * from model_catalog order by provider, id`)).map(r => ({ ...toModel(r), enabled: r.enabled }));
  },
  async find(id) {
    return await one<{ source: string }>(`select source from model_catalog where id = $1`, [id]) ?? undefined;
  },
  async hasProvider(id) { return !!await one(`select 1 from providers where id = $1`, [id]); },
  async create(id, provider, model, v) {
    const profile = profileValues(v);
    await q(
      `insert into model_catalog (id, provider, model, label, in_price, out_price, cache_read_price, context, tools, vision, tier, speed, enabled, source, capabilities, reasoning_effort)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'custom', $14, $15)`,
      [id, provider, model, v.label ?? model, v.inPrice ?? 0, v.outPrice ?? 0, v.cacheReadPrice ?? 0, v.context ?? 128_000,
        v.tools ?? true, v.vision ?? false, v.tier ?? 3, v.speed ?? 3, v.enabled ?? true,
        profile.capabilities ? JSON.stringify(profile.capabilities) : null, profile.reasoningEffort ?? null],
    );
  },
  async update(id, values) {
    const entries = Object.entries({ ...values, ...profileValues(values) }).filter(([key, v]) => key in columns && v !== undefined);
    if (!entries.length) return;
    await q(`update model_catalog set ${entries.map(([k], i) => `${columns[k as keyof typeof columns]} = $${i + 2}`).join(", ")} where id = $1`,
      [id, ...entries.map(([key, v]) => key === "capabilities" ? JSON.stringify(v) : v)]);
  },
  async remove(id) { await q(`delete from model_catalog where id = $1`, [id]); },
  audit: (id, actorId, action) => audit(`model:${id}`, actorId, action),
  async accountCustomized(id) {
    return (await one<{ models_customized: boolean }>(`select models_customized from accounts where id = $1`, [id]))?.models_customized ?? false;
  },
  async accountModels(id) {
    return (await q<{ model_id: string }>(`select model_id from account_models where account_id = $1`, [id])).map(r => r.model_id);
  },
  async projectModels(id) {
    return (await q<{ model_id: string }>(`select model_id from project_models where project_id = $1`, [id])).map(r => r.model_id);
  },
  async replaceAccountModels(id, ids) {
    await q(`delete from account_models where account_id = $1`, [id]);
    if (ids === null) {
      await q(`update accounts set models_customized = false where id = $1`, [id]);
      return;
    }
    for (const model of ids) await q(`insert into account_models (account_id, model_id) values ($1, $2)`, [id, model]);
    await q(`update accounts set models_customized = true where id = $1`, [id]);
  },
  async replaceProjectModels(id, ids) {
    await q(`delete from project_models where project_id = $1`, [id]);
    for (const model of ids) await q(`insert into project_models (project_id, model_id) values ($1, $2)`, [id, model]);
  },
};
