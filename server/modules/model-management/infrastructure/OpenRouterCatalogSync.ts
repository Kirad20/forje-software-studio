import { one, q } from "../../../shared/database/index.js";
import { ensureProviders, onProvidersChanged, OPENROUTER_URL, providerSecret } from "../providers.js";

function tierFor(id: string, inPrice: number): number {
  const families: [RegExp, number][] = [
    [/claude-opus|gpt-5(?!.*mini|.*nano)|gemini-[\d.]+-pro|o\d-pro/i, 5],
    [/claude-sonnet|gemini-[\d.]+-flash(?!-lite)|deepseek|qwen.*coder|kimi|glm|gpt-.*mini/i, 4],
    [/claude-haiku|flash-lite|qwen|mistral|llama-?[34]|gpt-.*nano|gemma/i, 3],
  ];
  for (const [re, tier] of families) if (re.test(id)) return tier;
  return inPrice >= 3 ? 4 : inPrice >= 0.5 ? 3 : 2;
}

export function createCatalogSync() {
  let syncing: Promise<number> | null = null;
  let timer: ReturnType<typeof setInterval> | undefined;
  let unsubscribeProviders: (() => void) | undefined;
  let generation = 0;
  const ticks = new Set<Promise<void>>();

  function syncOpenRouter(): Promise<number> {
    const key = providerSecret("openrouter");
    if (!key) return Promise.resolve(0);
    syncing ??= (async () => {
      try {
        const res = await fetch(`${OPENROUTER_URL}/models`, {
          headers: { authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(30_000),
        });
        if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
        const data = await res.json() as { data: {
          id: string; name?: string; context_length?: number;
          pricing?: { prompt?: string; completion?: string; input_cache_read?: string };
          architecture?: { input_modalities?: string[] }; supported_parameters?: string[];
        }[] };
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
            [`openrouter:${m.id}`, m.id, m.name ?? m.id, inPrice, outPrice, cacheRead, m.context_length ?? 32_000,
              tools, (m.architecture?.input_modalities ?? []).includes("image"), tierFor(m.id, inPrice), speed],
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
  async function lastSync(): Promise<string | null> {
    return (await one<{ at: string | null }>(`select max(synced_at) as at from model_catalog where provider = 'openrouter'`))?.at ?? null;
  }
  function startCatalogSync() {
    if (timer) return;
    const active = ++generation;
    const tick = async () => {
      if (active !== generation || !providerSecret("openrouter")) return;
      const at = await lastSync();
      if (active !== generation) return;
      if (!at || Date.now() - new Date(at).getTime() > 24 * 3600_000) await syncOpenRouter();
    };
    const run = (initial = false) => {
      const pending = (initial ? ensureProviders().then(tick) : tick())
        .catch(e => console.warn("[forja] sincronización de OpenRouter:", (e as Error).message));
      ticks.add(pending);
      void pending.finally(() => ticks.delete(pending));
    };
    timer = setInterval(() => run(), 3600_000);
    timer.unref();
    unsubscribeProviders = onProvidersChanged(() => run());
    run(true);
  }
  async function stopCatalogSync() {
    ++generation;
    if (timer) clearInterval(timer);
    timer = undefined;
    unsubscribeProviders?.();
    unsubscribeProviders = undefined;
    await Promise.allSettled([...ticks, ...(syncing ? [syncing] : [])]);
  }
  return { syncOpenRouter, lastSync, startCatalogSync, stopCatalogSync };
}
