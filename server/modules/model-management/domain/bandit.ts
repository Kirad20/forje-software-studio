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
