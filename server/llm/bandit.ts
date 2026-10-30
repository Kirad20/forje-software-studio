import { q } from "../platform/db.js";

/**
 * Thompson sampling over a Beta posterior per (task class, model). The prior comes from
 * the model's tier, so new models start near where they probably belong and real outcomes
 * (build passes, QA approves, the owner keeps the change) move them from there.
 */
export interface Posterior {
  alpha: number;
  beta: number;
  uses: number;
}

const PRIOR_STRENGTH = 4;

export function prior(tier: number): Posterior {
  const mean = Math.min(0.9, Math.max(0.2, 0.35 + 0.12 * (tier - 1)));
  return { alpha: mean * PRIOR_STRENGTH, beta: (1 - mean) * PRIOR_STRENGTH, uses: 0 };
}

export const meanOf = (p: Posterior) => p.alpha / (p.alpha + p.beta);

// Marsaglia–Tsang gamma sampler; Beta(a, b) = X / (X + Y) with X~Γ(a), Y~Γ(b).
function gaussian(rand: () => number) {
  const u = 1 - rand();
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function gamma(shape: number, rand: () => number): number {
  if (shape < 1) return gamma(shape + 1, rand) * Math.pow(rand(), 1 / shape);
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x: number;
    let v: number;
    do {
      x = gaussian(rand);
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = rand();
    if (u < 1 - 0.0331 * x ** 4 || Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

export function sampleBeta(p: Posterior, rand: () => number = Math.random) {
  const x = gamma(p.alpha, rand);
  const y = gamma(p.beta, rand);
  return x / (x + y);
}

/** Posteriors for these models in this task class; missing ones fall back to the tier prior. */
export async function posteriors(taskClass: string, models: { id: string; tier: number }[]): Promise<Map<string, Posterior>> {
  const rows = await q<{ model_id: string; alpha: number; beta: number; uses: number }>(
    `select model_id, alpha, beta, uses from router_stats where task_class = $1`,
    [taskClass],
  );
  const stored = new Map(rows.map((r) => [r.model_id, { alpha: r.alpha, beta: r.beta, uses: r.uses }]));
  return new Map(models.map((m) => [m.id, stored.get(m.id) ?? prior(m.tier)]));
}

/**
 * Records one outcome. `reward` is in [0, 1]: 1 for a clean success, partial credit for
 * work that needed fixes, 0 for failures. `weight` lets weak signals (an API error) count less.
 */
export async function recordOutcome(taskClass: string, model: { id: string; tier: number }, reward: number, usd = 0, weight = 1) {
  const r = Math.min(1, Math.max(0, reward)) * weight;
  const f = (1 - Math.min(1, Math.max(0, reward))) * weight;
  const p = prior(model.tier);
  await q(
    `insert into router_stats (task_class, model_id, alpha, beta, uses, usd) values ($1, $2, $3, $4, 1, $5)
     on conflict (task_class, model_id) do update set alpha = router_stats.alpha + $6, beta = router_stats.beta + $7,
       uses = router_stats.uses + 1, usd = router_stats.usd + $5`,
    [taskClass, model.id, p.alpha + r, p.beta + f, usd, r, f],
  );
}
