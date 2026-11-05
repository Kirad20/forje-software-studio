import { one, q } from "../../../shared/database/index.js";

export async function modelHealth(modelId: string, provider: string) {
  const row = await one<{ available: boolean; latency_ms: number; success_rate: number }>(
    `select cooldown_until is null or cooldown_until <= now() as available, latency_ms,
       successes::double precision / greatest(successes + failures, 1) as success_rate
     from model_health where model_id = $1 and provider = $2`, [modelId, provider],
  );
  return row ? { available: row.available, latencyMs: row.latency_ms, successRate: row.success_rate } : { available: true };
}

export async function recordModelHealth(modelId: string, provider: string, ms: number, error?: { message: string; status?: number }) {
  if (!Number.isFinite(ms) || ms < 0) throw new Error("Invalid model latency");
  const transient = !!error && (error.status === undefined || error.status === 408 || error.status === 409 || error.status === 429 || error.status >= 500);
  await q(
    `insert into model_health (provider, model_id, latency_ms, successes, failures, consecutive_failures, cooldown_until, last_error, last_status)
     values ($1,$2,$3,$4,$5,$6,case when $7 then now() + interval '15 seconds' else null end,$8,$9)
     on conflict (provider, model_id) do update set
       latency_ms = case when $4 = 1 then model_health.latency_ms * 0.8 + $3 * 0.2 else model_health.latency_ms end,
       successes = model_health.successes + $4, failures = model_health.failures + $5,
       consecutive_failures = case when $7 then model_health.consecutive_failures + 1 else 0 end,
       cooldown_until = case when $7 then now() + least(300, 15 * power(2, least(model_health.consecutive_failures, 5))) * interval '1 second'
         when $4 = 1 then null else model_health.cooldown_until end,
       last_error = $8, last_status = $9, updated_at = now()`,
    [provider, modelId, ms, error ? 0 : 1, error ? 1 : 0, transient ? 1 : 0, transient, error?.message ?? null, error?.status ?? null],
  );
}
