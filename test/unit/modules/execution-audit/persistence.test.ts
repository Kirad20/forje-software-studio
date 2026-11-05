import { afterAll, describe, expect, it } from "vitest";
import { freshDatabase } from "../../../helpers/pg.mjs";

const database = await freshDatabase();
process.env.DATABASE_URL = database.url;
const { q, closePlatformDb } = await import("../../../../server/shared/database/index.js");
const { recordFusionStep, recordFusionTrace } = await import("../../../../server/modules/model-management/infrastructure/FusionLedger.js");
const { readExecutionAudit, recordContextEvent } = await import("../../../../server/modules/execution-audit/index.js");
afterAll(async () => {
  await closePlatformDb();
  await database.drop();
});

describe("execution audit PostgreSQL queries", () => {
  it("aggregates every physical charge without double counting and preserves missing context", async () => {
    await q(`insert into accounts (id,email) values ('audit-owner','audit@example.test')`);
    await q(`insert into projects (id,owner_id,name) values ('audit-project','audit-owner','Audit'),('other-project','audit-owner','Other')`);
    const scope = { accountId: "audit-owner", projectId: "audit-project" };
    const context = {
      estimatedInputTokens: 100, systemTokens: 10, historyTokens: 70, toolSchemaTokens: 10, framingTokens: 10,
      systemBytes: 40, historyBytes: 280, toolSchemaBytes: 40, messages: 2, images: 1, toolCalls: 1, toolResults: 1,
      imageTokens: 1800, imageBytes: 3,
      toolResultBytes: 80, fileReadCalls: 1, requestedFileCount: 2, fileToolResultBytes: 80,
    };
    const first = {
      id: "audit:1", phase: "draft" as const, modelId: "gateway:first", servedBy: "remote:first",
      effort: "low" as const, ms: 15, usd: 0.001, credits: 0, usage: { input: 100, output: 10, cacheRead: 20, cacheWrite: 5 }, context,
    };
    const second = { ...first, id: "audit:2", phase: "escalation" as const, modelId: "gateway:second", context: undefined,
      retryOf: first.id, error: "private transport diagnostics" };
    await recordFusionStep(scope, "chat", "audit-operation", first);
    await recordFusionStep(scope, "chat", "audit-operation", first);
    await recordFusionStep(scope, "chat", "audit-operation", second);
    await q(`update fusion_steps set context = context || '{"prompt":"private context","args":{"key":"secret"}}'::jsonb where id = 'audit:1'`);
    await recordFusionTrace(scope, "chat", { operationId: "audit-operation", effort: "high", pattern: "cascade", warnings: ["private warning"], steps: [first, second],
      status: "failed", finalModelId: "gateway:first" },
      { turnId: "audit-turn", taskId: "audit-task", agentId: "audit-agent" });
    await q(`insert into ai_usage (project_id,account_id,source,role,model,input_tokens,output_tokens,credits,usd)
      values ('audit-project','audit-owner','builder','chat','legacy:model',50,5,2,0.003),
      ('other-project','audit-owner','builder','chat','other:model',999,999,99,1)`);
    await recordContextEvent({ projectId: scope.projectId, turnId: "audit-turn", kind: "file_read", measured: true, bytes: 300, count: 2 });
    await recordContextEvent({ projectId: scope.projectId, turnId: "audit-turn", kind: "compaction", measured: false, beforeTokens: 200, afterTokens: 120 });
    await q(`insert into settings_audit (key,actor_id,action) values ('provider:gateway','audit-owner','set')`);
    const report = await readExecutionAudit({ projectId: scope.projectId, limit: 1 });
    expect(report.summary).toMatchObject({
      calls: 3, fusionCalls: 2, legacyCalls: 1, inputTokens: 250, outputTokens: 25,
      cacheReadTokens: 40, cacheWriteTokens: 10, usd: 0.005, credits: 2,
      contextRecordedCalls: 1, failedCalls: 1, turns: 1, tasks: 1, traces: 1,
      additionalCalls: 1, retries: 1, modelSwitches: 1, degradations: 1, fileReadEvents: 1, fileReadBytes: 300,
      requestedFiles: 2, compactions: 1, estimatedCompactionDelta: 80,
      fileReadBytesRecordedEvents: 1, fileReadCountRecordedEvents: 1, compactionDeltaRecordedEvents: 1,
    });
    expect(report.timeline).toHaveLength(1);
    expect(report.timeline[0]).toMatchObject({ taskId: "audit-task", turnId: "audit-turn", agentId: "audit-agent", context: null, failed: true,
      status: "failed", finalModelId: "gateway:first", stopReason: null, retryOf: first.id });
    expect(report.pagination).toMatchObject({ timelineHasMore: true, eventsHasMore: true, stagesHasMore: true });
    const next = await readExecutionAudit({ projectId: scope.projectId, limit: 1, offset: 1 });
    expect(next.timeline[0]?.context).toEqual(context);
    expect(next.summary).toEqual(report.summary);
    expect(report.activity).toHaveLength(1);
    expect(JSON.stringify(report)).not.toContain("private");
    expect(report.evidence.legacy).toContain("no registrado");
    const empty = await readExecutionAudit({ projectId: scope.projectId, from: "2020-01-01", to: "2020-01-02" });
    expect(empty.summary.calls).toBe(0);
    expect(empty.timeline).toEqual([]);
  });
  it("retains nullable metrics instead of converting gaps into measured zero", async () => {
    await recordContextEvent({ projectId: "audit-project", kind: "compaction", measured: false });
    const report = await readExecutionAudit({ projectId: "audit-project", limit: 10 });
    const event = report.events.find(item => item.kind === "compaction" && item.beforeTokens === undefined);
    expect(event).toBeDefined();
    expect(event).not.toHaveProperty("afterTokens");
    expect(report.summary.estimatedCompactionDelta).toBe(80);
    expect(report.summary.compactionDeltaRecordedEvents).toBe(1);
    expect(report.summary.compactions).toBe(2);
  });
});
