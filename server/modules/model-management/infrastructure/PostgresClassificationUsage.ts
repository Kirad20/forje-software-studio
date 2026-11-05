import { q } from "../../../shared/database/index.js";
import type { CallResult } from "../domain/routing.js";

export async function recordClassificationUsage(accountId: string, result: CallResult) {
  if (result.fusion) return;
  const usage = result.totalUsage ?? result.response.usage;
  await q(
    `insert into ai_usage (project_id, account_id, source, role, model, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, usd, credits)
     values (null, $1, 'admin_classification', 'router', $2, $3, $4, $5, $6, $7, 0)`,
    [accountId, result.model.id, usage.input, usage.output, usage.cacheRead, usage.cacheWrite, result.usd],
  );
}
