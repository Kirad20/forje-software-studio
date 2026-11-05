import { platformDb, q } from "../../../shared/database/index.js";
import type { ExecutionContextMetrics, FusionStep, FusionTrace } from "../domain/fusion.js";
import type { ModelScope } from "../domain/models.js";
import type { Billing, DecisionLog, Role } from "../domain/routing.js";
import { creditsForUsd } from "../catalog.js";

const contextFields = [
  "estimatedInputTokens", "systemTokens", "historyTokens", "toolSchemaTokens", "framingTokens", "systemBytes",
  "historyBytes", "toolSchemaBytes", "messages", "images", "toolCalls", "toolResults", "toolResultBytes",
  "fileReadCalls", "requestedFileCount", "fileToolResultBytes",
] as const satisfies readonly (keyof ExecutionContextMetrics)[];
function contextMetrics(context?: ExecutionContextMetrics): ExecutionContextMetrics | undefined {
  if (context === undefined) return undefined;
  const entries: [string, number][] = contextFields.map(key => [key, context[key]]);
  for (const key of ["imageTokens", "imageBytes"] as const) {
    if (context[key] !== undefined) entries.push([key, context[key]]);
  }
  if (entries.some(([, value]) => !Number.isSafeInteger(value) || value < 0)) throw new Error("Invalid Fusion context metrics");
  return Object.fromEntries(entries) as unknown as ExecutionContextMetrics;
}

export async function recordFusionStep(scope: ModelScope, role: Role, operationId: string, step: FusionStep, billing?: Billing) {
  if (!Number.isFinite(step.usd) || step.usd < 0 || !Number.isFinite(step.ms) || step.ms < 0 ||
      Object.values(step.usage).some(value => !Number.isSafeInteger(value) || value < 0)) {
    throw new Error(`Invalid Fusion step accounting: ${step.id}`);
  }
  const credits = billing ? creditsForUsd(step.usd) : 0;
  const projectId = billing?.projectId ?? scope.projectId ?? null;
  const source = billing?.source ?? "fusion-admin";
  const context = contextMetrics(step.context);
  return (await platformDb()).transaction(async tx => {
    const inserted = await tx.query(
      `insert into fusion_steps
       (id, operation_id, account_id, project_id, role, phase, model_id, served_by, effort, ms, usage, usd, credits, payer_id, source, error, context, stop_reason, retry_of)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       on conflict (id) do nothing returning id`,
      [step.id, operationId, scope.accountId, projectId, role, step.phase, step.modelId, step.servedBy ?? null,
        step.effort, step.ms, JSON.stringify(step.usage), step.usd, credits, billing?.payerId ?? null, source, step.error ?? null,
        context ? JSON.stringify(context) : null, step.stopReason ?? null, step.retryOf ?? null],
    );
    if (!inserted.rows.length) {
      const { rows: [existing] } = await tx.query<{
        operation_id: string; account_id: string; project_id: string | null; role: string; phase: string;
        model_id: string; payer_id: string | null; source: string; credits: number; usd: number;
      }>(`select operation_id, account_id, project_id, role, phase, model_id, payer_id, source, credits, usd from fusion_steps where id = $1`, [step.id]);
      if (!existing || existing.operation_id !== operationId || existing.account_id !== scope.accountId ||
          existing.project_id !== projectId || existing.role !== role || existing.phase !== step.phase ||
          existing.model_id !== step.modelId || existing.payer_id !== (billing?.payerId ?? null) || existing.source !== source ||
          existing.usd !== step.usd) {
        throw new Error(`Fusion step identity conflict: ${step.id}`);
      }
      return { credits: existing.credits };
    }
    await tx.query(
      `insert into ai_usage
       (project_id, account_id, source, role, model, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens,
        usd, credits, fusion_step_id, fusion_operation_id, fusion_phase)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [projectId, billing?.payerId ?? scope.accountId, source, role, step.modelId, step.usage.input, step.usage.output,
        step.usage.cacheRead, step.usage.cacheWrite, step.usd, credits, step.id, operationId, step.phase],
    );
    if (billing && credits) {
      const debit = await tx.query(`update accounts set credits = greatest(credits - $2, 0) where id = $1 returning id`, [billing.payerId, credits]);
      if (!debit.rows.length) throw new Error(`Fusion payer account not found: ${billing.payerId}`);
    }
    return { credits };
  });
}

export async function recordFusionTrace(scope: ModelScope, role: Role, trace: FusionTrace, log?: DecisionLog) {
  await (await platformDb()).query(
    `insert into fusion_traces (operation_id, account_id, project_id, role, effort, pattern, warnings, steps, turn_id, task_id, agent_id, status, final_model_id)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) on conflict (operation_id) do nothing`,
    [trace.operationId, scope.accountId, scope.projectId ?? null, role, trace.effort, trace.pattern,
      JSON.stringify(trace.warnings), JSON.stringify(trace.steps.map(step => ({ ...step, context: contextMetrics(step.context) }))),
      log?.turnId ?? null, log?.taskId ?? null, log?.agentId ?? null, trace.status ?? null, trace.finalModelId ?? null],
  );
}

export async function listFusionTraces(options: { limit?: number; projectId?: string } = {}): Promise<FusionTrace[]> {
  const requested = options.limit ?? 50;
  const limit = Number.isFinite(requested) ? Math.max(1, Math.min(100, Math.trunc(requested))) : 50;
  const rows = await q<{
    operation_id: string; effort: FusionTrace["effort"]; pattern: FusionTrace["pattern"];
    status: FusionTrace["status"] | null; final_model_id: string | null;
    warnings: string[]; steps: FusionStep[];
  }>(
    `select operation_id, effort, pattern, status, final_model_id, warnings, steps from fusion_traces
     ${options.projectId === undefined ? "" : "where project_id = $2"} order by created_at desc, operation_id desc limit $1`,
    [limit, ...(options.projectId === undefined ? [] : [options.projectId])],
  );
  return rows.map(row => ({
    operationId: row.operation_id, effort: row.effort, pattern: row.pattern, warnings: row.warnings,
    ...(row.status ? { status: row.status } : {}),
    ...(row.final_model_id ? { finalModelId: row.final_model_id } : {}),
    steps: row.steps.map(({ error: _error, ...step }) => step),
  }));
}
