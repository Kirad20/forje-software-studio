import { q } from "../../../shared/database/index.js";
import type { AuditContext, AuditReport, AuditWindow, ContextEvent } from "../domain/audit.js";
import type { ExecutionAuditRepository } from "../ports/ExecutionAuditRepository.js";

const evidence: AuditReport["evidence"] = {
  usage: "Contadores de uso registrados del proveedor y costes/créditos del ledger. Los fallos pueden carecer de uso informado; los ceros no verifican por sí solos ausencia de uso/caché.",
  context: "Desglose de tokens estimado por serialización; bytes y cantidades medidos. No es la tokenización exacta del proveedor.",
  images: "Cantidad y bytes decodificados de imágenes cuando se registran; tokens estimados con la heurística del router, no tokenización exacta del proveedor.",
  attribution: "Compara únicamente deltas de componentes registrados. El crecimiento total no demuestra su causa; las fases de revisión cambian la petición.",
  retries: "Reintentos registrados = enlaces explícitos retryOf; los históricos sin enlace no están registrados. Llamadas adicionales incluyen revisión/escalado y no equivalen a reintentos.",
  legacy: "Sin snapshot de contexto = no registrado, nunca prueba de cero. El uso histórico sin pasos Fusion no tiene fases ni contexto.",
  activity: "Actividad de configuración global en la misma ventana; el filtro de proyecto solo aplica a ejecuciones. Nunca incluye valores ni secretos.",
};

function contextSnapshot(raw: unknown): AuditContext | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const values = raw as Record<string, unknown>;
  const required = ["estimatedInputTokens", "systemTokens", "historyTokens", "toolSchemaTokens", "framingTokens",
    "systemBytes", "historyBytes", "toolSchemaBytes", "messages", "images", "toolCalls", "toolResults",
    "toolResultBytes", "fileReadCalls", "requestedFileCount", "fileToolResultBytes"] as const;
  if (required.some(key => !Number.isSafeInteger(values[key]) || (values[key] as number) < 0)) return null;
  return Object.fromEntries([...required, "imageTokens", "imageBytes"].flatMap(key =>
    Number.isSafeInteger(values[key]) && (values[key] as number) >= 0 ? [[key, values[key]]] : [])) as unknown as AuditContext;
}

export const postgresExecutionAuditRepository: ExecutionAuditRepository = {
  async record(event: ContextEvent) {
    await q(
      `insert into execution_context_events
       (project_id, task_id, turn_id, trace_id, agent_id, kind, measured, before_tokens, after_tokens, bytes, count, created_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,coalesce($12::timestamptz,now()))`,
      [event.projectId, event.taskId ?? null, event.turnId ?? null, event.traceId ?? null, event.agentId ?? null,
        event.kind, event.measured, event.beforeTokens ?? null, event.afterTokens ?? null,
        event.bytes ?? null, event.count ?? null, event.timestamp ?? null],
    );
  },
  async read(window: AuditWindow): Promise<AuditReport> {
    const filter = [window.from, window.to, window.projectId ?? null];
    const page = [...filter, window.limit + 1, window.offset];
    const where = `created_at >= $1::timestamptz and created_at < $2::timestamptz
      and ($3::text is null or project_id = $3)`;
    const [usage, execution, eventTotals, stages, timeline, events, activity] = await Promise.all([
      q<Pick<AuditReport["summary"], "calls" | "inputTokens" | "outputTokens" | "cacheReadTokens" | "cacheWriteTokens" | "usd" | "credits" | "fusionCalls" | "legacyCalls">>(
        `select count(*)::int as calls, coalesce(sum(input_tokens),0)::float8 as "inputTokens",
          coalesce(sum(output_tokens),0)::float8 as "outputTokens", coalesce(sum(cache_read_tokens),0)::float8 as "cacheReadTokens",
          coalesce(sum(cache_write_tokens),0)::float8 as "cacheWriteTokens", coalesce(sum(usd),0)::float8 as usd,
          coalesce(sum(credits),0)::float8 as credits,
          count(fusion_step_id)::int as "fusionCalls", count(*) filter (where fusion_step_id is null)::int as "legacyCalls"
         from ai_usage where ${where}`, filter),
      q<Pick<AuditReport["summary"], "contextRecordedCalls" | "turns" | "tasks" | "traces" | "failedCalls" | "additionalCalls" | "retries" | "modelSwitches" | "degradations">>(
        `with physical as (
          select fs.*, lag(model_id) over (partition by fs.operation_id order by fs.created_at,fs.id) as previous_model
          from fusion_steps fs where ${where}
        )
        select count(*) filter (where fs.context is not null)::int as "contextRecordedCalls",
          count(distinct ft.turn_id)::int as turns, count(distinct ft.task_id)::int as tasks,
          count(distinct fs.operation_id)::int as traces, count(*) filter (where fs.error is not null)::int as "failedCalls",
          (count(*) - count(distinct fs.operation_id))::int as "additionalCalls",
          count(*) filter (where fs.retry_of is not null)::int as retries,
          count(*) filter (where fs.previous_model is not null and fs.previous_model <> fs.model_id)::int as "modelSwitches",
          count(distinct ft.operation_id) filter (where jsonb_array_length(ft.warnings) > 0)::int as degradations
        from physical fs left join fusion_traces ft on ft.operation_id = fs.operation_id`, filter),
      q<Pick<AuditReport["summary"], "fileReadEvents" | "fileReadBytes" | "requestedFiles" | "compactions" | "estimatedCompactionDelta"
        | "fileReadBytesRecordedEvents" | "fileReadCountRecordedEvents" | "compactionDeltaRecordedEvents">>(
        `select count(*) filter (where kind = 'file_read')::int as "fileReadEvents",
          coalesce(sum(bytes) filter (where kind = 'file_read' and measured),0)::float8 as "fileReadBytes",
          coalesce(sum(count) filter (where kind = 'file_read' and measured),0)::float8 as "requestedFiles",
          count(*) filter (where kind = 'file_read' and measured and bytes is not null)::int as "fileReadBytesRecordedEvents",
          count(*) filter (where kind = 'file_read' and measured and count is not null)::int as "fileReadCountRecordedEvents",
          count(*) filter (where kind = 'compaction')::int as compactions,
          count(*) filter (where kind = 'compaction' and not measured and before_tokens is not null and after_tokens is not null)::int as "compactionDeltaRecordedEvents",
          coalesce(sum(before_tokens - after_tokens) filter
            (where kind = 'compaction' and not measured and before_tokens is not null and after_tokens is not null),0)::float8 as "estimatedCompactionDelta"
        from execution_context_events where ${where}`, filter),
      q<AuditReport["stages"][number]>(
        `select model_id as "requestedModel", served_by as "servedModel", split_part(model_id,':',1) as provider, phase,
          count(*)::int as calls, count(*) filter (where error is not null)::int as failures,
          coalesce(sum((usage->>'input')::bigint),0)::float8 as "inputTokens",
          coalesce(sum((usage->>'output')::bigint),0)::float8 as "outputTokens",
          coalesce(sum((usage->>'cacheRead')::bigint),0)::float8 as "cacheReadTokens",
          coalesce(sum((usage->>'cacheWrite')::bigint),0)::float8 as "cacheWriteTokens",
          sum(usd)::float8 as usd, sum(credits)::float8 as credits
        from fusion_steps where ${where}
        group by model_id,served_by,phase order by calls desc,model_id,served_by nulls first,phase limit $4 offset $5`, page),
      q<AuditReport["timeline"][number]>(
        `select fs.id, fs.operation_id as "traceId", fs.project_id as "projectId", ft.task_id as "taskId",
          ft.turn_id as "turnId", ft.agent_id as "agentId", fs.role, ft.pattern, ft.status, ft.final_model_id as "finalModelId",
          fs.phase, fs.stop_reason as "stopReason", fs.retry_of as "retryOf", fs.model_id as "requestedModel",
          fs.served_by as "servedModel", split_part(fs.model_id,':',1) as provider, fs.effort, fs.created_at as at,
          fs.ms, (fs.usage->>'input')::float8 as "inputTokens", (fs.usage->>'output')::float8 as "outputTokens",
          coalesce((fs.usage->>'cacheRead')::float8,0) as "cacheReadTokens",
          coalesce((fs.usage->>'cacheWrite')::float8,0) as "cacheWriteTokens", fs.usd, fs.credits,
          (fs.error is not null) as failed, fs.context
        from (select * from fusion_steps where ${where} order by created_at desc,id desc limit $4 offset $5) fs
        left join fusion_traces ft on ft.operation_id = fs.operation_id order by fs.created_at desc,fs.id desc`, page),
      q<{ id: number; projectId: string; taskId: string | null; turnId: string | null; traceId: string | null;
        agentId: string | null; kind: ContextEvent["kind"]; measured: boolean; beforeTokens: number | null;
        afterTokens: number | null; bytes: number | null; count: number | null; timestamp: string }>(
        `select id::float8 as id, project_id as "projectId", task_id as "taskId", turn_id as "turnId",
          trace_id as "traceId", agent_id as "agentId", kind, measured, before_tokens::float8 as "beforeTokens",
          after_tokens::float8 as "afterTokens", bytes::float8 as bytes, count::float8 as count, created_at as timestamp
        from execution_context_events where ${where} order by created_at desc,id desc limit $4 offset $5`, page),
      q<AuditReport["activity"][number]>(
        `select id, key, actor_id as "actorId", action, at from settings_audit
         where at >= $1::timestamptz and at < $2::timestamptz order by at desc,id desc limit $3 offset $4`,
        [window.from, window.to, window.limit + 1, window.offset]),
    ]);
    const normalizeTime = (value: unknown) => value instanceof Date ? value.toISOString() : String(value);
    return {
      window, summary: { ...usage[0]!, ...execution[0]!, ...eventTotals[0]! },
      stages: stages.slice(0, window.limit),
      timeline: timeline.slice(0, window.limit).map(step => ({ ...step, at: normalizeTime(step.at), context: contextSnapshot(step.context) })),
      events: events.slice(0, window.limit).map(event => ({
        id: event.id, projectId: event.projectId, kind: event.kind, measured: event.measured, timestamp: normalizeTime(event.timestamp),
        ...(event.taskId === null ? {} : { taskId: event.taskId }), ...(event.turnId === null ? {} : { turnId: event.turnId }),
        ...(event.traceId === null ? {} : { traceId: event.traceId }), ...(event.agentId === null ? {} : { agentId: event.agentId }),
        ...(event.beforeTokens === null ? {} : { beforeTokens: event.beforeTokens }),
        ...(event.afterTokens === null ? {} : { afterTokens: event.afterTokens }),
        ...(event.bytes === null ? {} : { bytes: event.bytes }), ...(event.count === null ? {} : { count: event.count }),
      })),
      activity: activity.slice(0, window.limit).map(item => ({ ...item, at: normalizeTime(item.at) })),
      pagination: { timelineHasMore: timeline.length > window.limit, eventsHasMore: events.length > window.limit,
        activityHasMore: activity.length > window.limit, stagesHasMore: stages.length > window.limit },
      evidence,
    };
  },
};
