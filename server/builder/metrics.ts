import { randomUUID } from "node:crypto";
import { q } from "../platform/db.js";
import type { Usage } from "../llm/types.js";

/**
 * Agent telemetry for the Code Mode decision (F0): how many input tokens go to tool results
 * the model only reads once. A result returned at step s of a run is re-sent with every later
 * model call of that run, so its real cost is its size times the calls that follow it. That
 * "carried" cost of read-only tools is what Code Mode could save; writes cost the same either way.
 *
 * Recording never throws and never blocks the agent: telemetry must not break a build.
 */

/** Rough token count (≈4 characters per token). Good enough to compare tools, not to bill. */
export const estTokens = (chars: number) => Math.ceil(chars / 4);

export const newRunId = () => randomUUID();

export interface StepRecord {
  runId: string;
  projectId: string;
  turnId?: string;
  taskId?: string;
  role: string;
  step: number;
  modelId?: string;
  usage: Usage;
}

export interface ToolCallRecord {
  /** Empty for MCP calls: an external client's context is not ours to measure. */
  runId: string;
  projectId: string;
  source: "builder" | "mcp";
  role?: string;
  step: number;
  tool: string;
  inputChars: number;
  resultChars: number;
  ok: boolean;
  ms: number;
}

const quiet = (p: Promise<unknown>) => void p.catch(() => {});

export function recordStep(r: StepRecord) {
  quiet(
    q(
      `insert into agent_steps (run_id, project_id, turn_id, task_id, role, step, model_id, input_tokens, cache_read_tokens, cache_write_tokens, output_tokens)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [r.runId, r.projectId, r.turnId ?? null, r.taskId ?? null, r.role, r.step, r.modelId ?? null, r.usage.input, r.usage.cacheRead, r.usage.cacheWrite, r.usage.output],
    ),
  );
}

export function recordToolCall(r: ToolCallRecord) {
  quiet(
    q(
      `insert into agent_tool_calls (run_id, project_id, source, role, step, tool, input_chars, result_chars, ok, ms)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [r.runId, r.projectId, r.source, r.role ?? null, r.step, r.tool, r.inputChars, r.resultChars, r.ok, Math.round(r.ms)],
    ),
  );
}

export interface ToolStat {
  tool: string;
  source: "builder" | "mcp";
  readOnly: boolean;
  calls: number;
  errors: number;
  /** Estimated tokens of the tool's input, i.e. what the model wrote (code for write_file). */
  inputTokens: number;
  resultTokens: number;
  avgResultTokens: number;
  /** Builder only: result tokens times the model calls that re-sent them. */
  carriedTokens: number;
}

export interface MetricsReport {
  days: number;
  runs: number;
  modelCalls: number;
  /** Input-side tokens of builder model calls: uncached + cache read + cache write. */
  inputTokens: number;
  cacheReadTokens: number;
  outputTokens: number;
  tools: ToolStat[];
  /** Share of builder input tokens spent carrying read-only tool results. */
  readCarriedShare: number;
  gate: { threshold: number; pass: boolean; note: string };
}

/** F0's go/no-go: Code Mode is worth building only above this share. */
export const GATE_THRESHOLD = 0.25;

export async function metricsReport(projectIds: string[], days: number, isReadOnly: (tool: string) => boolean): Promise<MetricsReport> {
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const [totals] = await q<{ runs: number; calls: number; input: number; cache_read: number; output: number }>(
    `select count(distinct run_id)::int as runs, count(*)::int as calls,
       coalesce(sum(input_tokens + cache_read_tokens + cache_write_tokens), 0)::bigint as input,
       coalesce(sum(cache_read_tokens), 0)::bigint as cache_read, coalesce(sum(output_tokens), 0)::bigint as output
     from agent_steps where project_id = any($1) and created_at >= $2`,
    [projectIds, since],
  );
  // A result from step s is in the history of every later model call of its run: (last step - s) of them.
  const rows = await q<{ tool: string; source: "builder" | "mcp"; calls: number; errors: number; input_chars: number; result_chars: number; carried_chars: number }>(
    `with last as (select run_id, max(step) as last_step from agent_steps where project_id = any($1) and created_at >= $2 group by run_id)
     select c.tool, c.source, count(*)::int as calls, count(*) filter (where not c.ok)::int as errors,
       coalesce(sum(c.input_chars), 0)::bigint as input_chars, coalesce(sum(c.result_chars), 0)::bigint as result_chars,
       coalesce(sum(c.result_chars * greatest(coalesce(l.last_step, c.step) - c.step, 0)), 0)::bigint as carried_chars
     from agent_tool_calls c left join last l on l.run_id = c.run_id
     where c.project_id = any($1) and c.created_at >= $2
     group by c.tool, c.source`,
    [projectIds, since],
  );
  const tools: ToolStat[] = rows
    .map((r) => {
      const resultTokens = estTokens(Number(r.result_chars));
      return {
        tool: r.tool,
        source: r.source,
        readOnly: isReadOnly(r.tool),
        calls: r.calls,
        errors: r.errors,
        inputTokens: estTokens(Number(r.input_chars)),
        resultTokens,
        avgResultTokens: r.calls ? Math.round(resultTokens / r.calls) : 0,
        carriedTokens: r.source === "builder" ? estTokens(Number(r.carried_chars)) : 0,
      };
    })
    .sort((a, b) => b.carriedTokens - a.carriedTokens || b.resultTokens - a.resultTokens);
  const inputTokens = Number(totals?.input ?? 0);
  const readCarried = tools.filter((t) => t.readOnly).reduce((n, t) => n + t.carriedTokens, 0);
  const readCarriedShare = inputTokens ? readCarried / inputTokens : 0;
  return {
    days,
    runs: totals?.runs ?? 0,
    modelCalls: totals?.calls ?? 0,
    inputTokens,
    cacheReadTokens: Number(totals?.cache_read ?? 0),
    outputTokens: Number(totals?.output ?? 0),
    tools,
    readCarriedShare,
    gate: {
      threshold: GATE_THRESHOLD,
      pass: readCarriedShare > GATE_THRESHOLD,
      note: "Estimación (4 caracteres ≈ 1 token). Parte de lo arrastrado se cobra como lectura de caché, más barata; compárala con cacheReadTokens.",
    },
  };
}
