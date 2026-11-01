import type { Tx } from "../../platform/db.js";

/**
 * What every installation has, inserted at each start-up and never overwritten: the builtin
 * providers (off, with no key, until an admin configures them) and the Anthropic models with
 * their first-party prices. Settings need no rows: their defaults live in server/config.ts.
 */

const PROVIDERS = [
  { id: "anthropic", kind: "anthropic", label: "Anthropic", baseUrl: null },
  { id: "openrouter", kind: "openai", label: "OpenRouter", baseUrl: null },
  { id: "openai", kind: "openai", label: "Compatible OpenAI", baseUrl: "https://api.openai.com/v1" },
] as const;

/** Anthropic first-party prices (USD / MTok), from the Claude API model table. */
export const ANTHROPIC_MODELS = [
  { model: "claude-opus-5-5", label: "Claude Opus 5.5", inPrice: 4, outPrice: 20, cacheReadPrice: 0.2, longPrompt: null, tier: 5, speed: 2 },
  { model: "claude-sonnet-5-5", label: "Claude Sonnet 5.5", inPrice: 2, outPrice: 10, cacheReadPrice: 0.2, longPrompt: null, tier: 4, speed: 3 },
  { model: "claude-haiku-5-5", label: "Claude Haiku 5.5", inPrice: 0.1, outPrice: 0.5, cacheReadPrice: 0.01, longPrompt: { threshold: 100_000, inPrice: 0.5, outPrice: 2.5 }, tier: 3, speed: 5 },
];

export async function seedDefaults(db: Tx): Promise<void> {
  for (const p of PROVIDERS) {
    await db.query(`insert into providers (id, kind, label, base_url, builtin) values ($1, $2, $3, $4, true) on conflict (id) do nothing`, [p.id, p.kind, p.label, p.baseUrl]);
  }
  for (const m of ANTHROPIC_MODELS) {
    await db.query(
      `insert into model_catalog (id, provider, model, label, in_price, out_price, cache_read_price, long_prompt, context, tools, vision, tier, speed, source)
       values ($1, 'anthropic', $2, $3, $4, $5, $6, $7, 1000000, true, true, $8, $9, 'builtin') on conflict (id) do nothing`,
      [`anthropic:${m.model}`, m.model, m.label, m.inPrice, m.outPrice, m.cacheReadPrice, m.longPrompt && JSON.stringify(m.longPrompt), m.tier, m.speed],
    );
  }
}
