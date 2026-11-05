import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { afterAll, describe, expect, it, vi } from "vitest";
import { freshDatabase } from "../../../helpers/pg.mjs";
import type { ExecutionContextMetrics, FusionCapability, FusionStep } from "../../../../server/modules/model-management/domain/fusion.js";

const dataDir = path.join(process.cwd(), `.fusion-data-${process.pid}`);
mkdirSync(dataDir, { recursive: true });
process.env.DATA_DIR = dataDir;
process.env.SECRETS_KEY = "cd".repeat(32);
const database = await freshDatabase();
process.env.DATABASE_URL = database.url;
const { q, closePlatformDb } = await import("../../../../server/shared/database/index.js");
const { routingPorts } = await import("../../../../server/modules/model-management/infrastructure/routing.js");
const { recordFusionStep, recordFusionTrace, listFusionTraces } = await import("../../../../server/modules/model-management/infrastructure/FusionLedger.js");
const { modelHealth, recordModelHealth } = await import("../../../../server/modules/model-management/infrastructure/ModelHealth.js");
const { postgresCatalogRepository: repository } = await import("../../../../server/modules/model-management/infrastructure/PostgresCatalogRepository.js");
const { persistCapabilityProfile, validateCapabilityProfile } = await import("../../../../server/modules/model-management/infrastructure/CapabilityProfiles.js");
const { creditsForUsd } = await import("../../../../server/modules/model-management/catalog.js");
afterAll(async () => {
  vi.unstubAllGlobals();
  await closePlatformDb();
  await database.drop();
  rmSync(dataDir, { recursive: true, force: true });
});

const scope = { accountId: "fusion-account" };
const billing = { payerId: scope.accountId, projectId: null, source: "builder" as const };
const step = (id: string, overrides: Partial<FusionStep> = {}): FusionStep => ({
  id, phase: "draft", modelId: "provider:model", effort: "low", ms: 12, usage: { input: 100, output: 20, cacheRead: 2, cacheWrite: 3 },
  usd: 0.001, credits: 0, ...overrides,
});
const context: ExecutionContextMetrics = {
  estimatedInputTokens: 123, systemTokens: 10, historyTokens: 80, toolSchemaTokens: 20, framingTokens: 13,
  systemBytes: 35, historyBytes: 280, toolSchemaBytes: 70, messages: 2, images: 0, toolCalls: 1, toolResults: 1,
  toolResultBytes: 20, fileReadCalls: 1, requestedFileCount: 2, fileToolResultBytes: 20,
};

describe("persistent Fusion execution", () => {
  it("bills a concurrent retry once and retains the cost of discarded drafts", async () => {
    await q(`insert into accounts (id, email, credits) values ($1, 'fusion@test.local', 10000)`, [scope.accountId]);
    const draft = step("operation:1");
    const credit = creditsForUsd(draft.usd);
    expect(await Promise.all([
      recordFusionStep(scope, "chat", "operation", draft, billing),
      recordFusionStep(scope, "chat", "operation", draft, billing),
    ])).toEqual([{ credits: credit }, { credits: credit }]);
    const revision = step("operation:2", { phase: "revision", usd: 0.002 });
    await recordFusionStep(scope, "chat", "operation", revision, billing);
    expect(await q(`select count(*) as n, sum(usd) as usd, sum(credits) as credits from ai_usage where fusion_operation_id = 'operation'`))
      .toEqual([{ n: 2, usd: 0.003, credits: credit + creditsForUsd(0.002) }]);
    expect(await q(`select credits from accounts where id = $1`, [scope.accountId]))
      .toEqual([{ credits: 10000 - credit - creditsForUsd(0.002) }]);
    expect(await q(`select fusion_phase from ai_usage where fusion_operation_id = 'operation' order by fusion_step_id`))
      .toEqual([{ fusion_phase: "draft" }, { fusion_phase: "revision" }]);
    const trace = { operationId: "operation", effort: "high" as const, pattern: "critique" as const, warnings: ["discarded draft"], steps: [draft, revision] };
    await recordFusionTrace(scope, "chat", trace, { turnId: "turn", taskId: "task", agentId: "agent" });
    await recordFusionTrace(scope, "chat", trace);
    expect(await q(`select count(*) as n from fusion_traces where operation_id = 'operation'`)).toEqual([{ n: 1 }]);
    expect(await q(`select turn_id, task_id, agent_id from fusion_traces where operation_id = 'operation'`))
      .toEqual([{ turn_id: "turn", task_id: "task", agent_id: "agent" }]);
    expect(await q(`select count(*) as n from ai_usage where fusion_operation_id = 'operation'`)).toEqual([{ n: 2 }]);
  });
  it("logs administrative and failed network calls without debiting credits", async () => {
    const before = await q(`select credits from accounts where id = $1`, [scope.accountId]);
    expect(await recordFusionStep(scope, "router", "admin", step("admin:1", { usd: 0.25 }))).toEqual({ credits: 0 });
    expect(await recordFusionStep(scope, "chat", "failed", step("failed:1", {
      usd: 0, usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, error: "connection reset",
    }), billing)).toEqual({ credits: 0 });
    expect(await q(`select credits from accounts where id = $1`, [scope.accountId])).toEqual(before);
    expect(await q(`select source, usd, credits from ai_usage where fusion_step_id = 'admin:1'`))
      .toEqual([{ source: "fusion-admin", usd: 0.25, credits: 0 }]);
    expect(await q(`select error from fusion_steps where id = 'failed:1'`)).toEqual([{ error: "connection reset" }]);
  });
  it("rolls back usage and step together when billing fails; rejects an identity collision", async () => {
    await expect(recordFusionStep(scope, "chat", "rollback", step("rollback:1"), { ...billing, payerId: "missing-payer" }))
      .rejects.toThrow("payer account not found");
    expect(await q(`select id from fusion_steps where id = 'rollback:1'`)).toEqual([]);
    expect(await q(`select id from ai_usage where fusion_step_id = 'rollback:1'`)).toEqual([]);
    await expect(recordFusionStep(scope, "chat", "different-operation", step("operation:1"), billing)).rejects.toThrow("identity conflict");
    await expect(recordFusionStep(scope, "chat", "operation", step("operation:1", { usd: 10 }), billing)).rejects.toThrow("identity conflict");
    await expect(recordFusionStep(scope, "chat", "invalid", step("invalid:1", { usd: Infinity }))).rejects.toThrow("Invalid Fusion step accounting");
  });
  it("returns bounded recent trace summaries without step errors", async () => {
    const metricsWithExtra = { ...context, content: "must never be recorded" };
    await recordFusionStep(scope, "chat", "public-trace", step("public-trace:1", { context: metricsWithExtra, stopReason: "max_tokens" }));
    expect(await q(`select context from fusion_steps where id = 'public-trace:1'`)).toEqual([{ context }]);
    expect(await q(`select stop_reason from fusion_steps where id = 'public-trace:1'`)).toEqual([{ stop_reason: "max_tokens" }]);
    await recordFusionTrace(scope, "chat", {
      operationId: "public-trace", effort: "standard", pattern: "single", warnings: [],
      status: "failed", finalModelId: "accepted:draft",
      steps: [step("public-trace:1", { error: "private transport diagnostics", context: metricsWithExtra })],
    });
    const traces = await listFusionTraces({ limit: 1 });
    expect(traces).toHaveLength(1);
    expect(traces[0]?.operationId).toBe("public-trace");
    expect(traces[0]).toMatchObject({ status: "failed", finalModelId: "accepted:draft" });
    expect(traces[0]?.steps[0]).not.toHaveProperty("error");
    expect(traces[0]?.steps[0]?.context).toEqual(context);
    expect(await listFusionTraces({ projectId: "not-this-project" })).toEqual([]);
    await expect(recordFusionStep(scope, "chat", "invalid-context", step("invalid-context:1", {
      context: { ...context, fileToolResultBytes: -1 },
    }))).rejects.toThrow("Invalid Fusion context metrics");
  });
  it("preserves known optional image estimates without manufacturing unknown measurements", async () => {
    const imageContext = { ...context, images: 1, imageTokens: 1800, imageBytes: 0 };
    await recordFusionStep(scope, "chat", "images", step("images:1", { context: imageContext }));
    expect(await q(`select context from fusion_steps where id = 'images:1'`)).toEqual([{ context: imageContext }]);
    expect((await q<{ context: Record<string, unknown> }>(`select context from fusion_steps where id = 'public-trace:1'`))[0]?.context)
      .not.toHaveProperty("imageBytes");
    const invalidImageContext = { ...imageContext, imageBytes: Infinity };
    await expect(recordFusionStep(scope, "chat", "invalid-images", step("images:2", {
      context: invalidImageContext,
    }))).rejects.toThrow("Invalid Fusion context metrics");
  });
  it("persists retry lineage separately from additional judge calls", async () => {
    const first = step("retry-chain:1", { error: "transport error", usd: 0 });
    const retry = step("retry-chain:2", { phase: "escalation", retryOf: first.id });
    const judge = step("retry-chain:3", { phase: "judge" });
    for (const physical of [first, retry, judge]) await recordFusionStep(scope, "chat", "retry-chain", physical);
    expect(await q(`select id, retry_of from fusion_steps where operation_id = 'retry-chain' order by id`))
      .toEqual([{ id: first.id, retry_of: null }, { id: retry.id, retry_of: first.id }, { id: judge.id, retry_of: null }]);
    await recordFusionTrace(scope, "chat", { operationId: "retry-chain", effort: "high", pattern: "cascade", warnings: [], steps: [first, retry, judge] });
    expect((await listFusionTraces({ limit: 1 }))[0]?.steps[1]?.retryOf).toBe(first.id);
  });
  it("provides cryptographic operation IDs and normalized default effort", async () => {
    expect(routingPorts.nextOperationId!()).toMatch(/^[0-9a-f-]{36}$/);
    expect(routingPorts.nextOperationId!()).not.toBe(routingPorts.nextOperationId!());
    expect(await routingPorts.projectMode()).toBe("standard");
  });
});

describe("shared provider/model health", () => {
  it("persists cooldown across database clients, isolates providers, and expires without a probe", async () => {
    expect(await modelHealth("same-model", "gateway-a")).toEqual({ available: true });
    await recordModelHealth("same-model", "gateway-a", 20);
    await recordModelHealth("same-model", "gateway-a", 50, { message: "rate limit", status: 429 });
    expect(await modelHealth("same-model", "gateway-a")).toMatchObject({ available: false, latencyMs: 20, successRate: 0.5 });
    const { default: pg } = await import("pg");
    const otherProcess = new pg.Client({ connectionString: database.url });
    await otherProcess.connect();
    try {
      expect((await otherProcess.query(`select cooldown_until > now() as cooling from model_health where provider = 'gateway-a'`)).rows)
        .toEqual([{ cooling: true }]);
      await otherProcess.query(`update model_health set cooldown_until = now() - interval '1 second' where provider = 'gateway-a'`);
    } finally {
      await otherProcess.end();
    }
    expect(await modelHealth("same-model", "gateway-a")).toMatchObject({ available: true });
    expect(await modelHealth("same-model", "gateway-b")).toEqual({ available: true });
    await recordModelHealth("same-model", "gateway-a", 30, { message: "unavailable", status: 503 });
    expect(await modelHealth("same-model", "gateway-a")).toMatchObject({ available: false });
    await recordModelHealth("same-model", "gateway-a", 10);
    expect(await modelHealth("same-model", "gateway-a")).toMatchObject({ available: true, latencyMs: 18 });
  });
  it("does not put invalid provider requests into transient cooldown", async () => {
    await recordModelHealth("bad-request", "gateway", 12, { message: "invalid parameter", status: 400 });
    expect(await modelHealth("bad-request", "gateway")).toMatchObject({ available: true, successRate: 0 });
    await expect(recordModelHealth("bad-request", "gateway", NaN)).rejects.toThrow("latency");
  });
});

describe("catalog capability profiles", () => {
  const profile: FusionCapability = { reasoning: 4, coding: 3.5, debugging: 4, toolUse: 3, confidence: 0.7, source: "evaluation" };
  it("persists optional profiles and verified reasoning support through catalog reads and updates", async () => {
    const { saveProvider } = await import("../../../../server/modules/model-management/providers.js");
    await saveProvider({ id: "fusion-local", baseUrl: "http://127.0.0.1:1234/v1", enabled: true }, null, { create: true });
    const values = { label: "Profiled", capabilities: profile, reasoningEffort: true };
    await repository.create("fusion-local:profiled", "fusion-local", "profiled", values);
    expect((await repository.list()).find(m => m.id === "fusion-local:profiled")).toMatchObject({ capabilities: profile, reasoningEffort: true });
    const changes = { label: "Updated", capabilities: { ...profile, source: "classification" as const }, reasoningEffort: false };
    await repository.update("fusion-local:profiled", changes);
    expect((await repository.list()).find(m => m.id === "fusion-local:profiled"))
      .toMatchObject({ capabilities: changes.capabilities, reasoningEffort: false });
    await persistCapabilityProfile("fusion-local:profiled", profile);
    expect((await repository.list()).find(m => m.id === "fusion-local:profiled")).toMatchObject({ capabilities: profile, reasoningEffort: false });
    await repository.create("fusion-local:unknown", "fusion-local", "unknown", {});
    expect((await repository.list()).find(m => m.id === "fusion-local:unknown")).not.toHaveProperty("capabilities");
    expect((await repository.list()).find(m => m.id === "fusion-local:unknown")).not.toHaveProperty("reasoningEffort");
  });
  it.each([
    { reasoning: NaN }, { coding: 6 }, { debugging: 0 }, { toolUse: "5" }, { confidence: 2 }, { source: "family-name" },
  ])("rejects malformed profile values: %j", (invalid) => {
    expect(() => validateCapabilityProfile({ ...profile, ...invalid })).toThrow();
  });
  it("syncs only explicit reasoning-effort support and preserves evaluated profiles", async () => {
    const { saveProvider } = await import("../../../../server/modules/model-management/providers.js");
    const { createCatalogSync } = await import("../../../../server/modules/model-management/infrastructure/OpenRouterCatalogSync.js");
    await saveProvider({ id: "openrouter", apiKey: "test-only-key", enabled: true }, null);
    const metadata = { id: "test/profile", supported_parameters: ["reasoning", "tools"] };
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ data: [metadata] })));
    const sync = createCatalogSync();
    await sync.syncOpenRouter();
    await persistCapabilityProfile("openrouter:test/profile", profile);
    expect((await repository.list()).find(m => m.id === "openrouter:test/profile")).toMatchObject({ reasoningEffort: false });
    metadata.supported_parameters = ["reasoning_effort"];
    await sync.syncOpenRouter();
    expect((await repository.list()).find(m => m.id === "openrouter:test/profile")).toMatchObject({ capabilities: profile, reasoningEffort: true });
    vi.unstubAllGlobals();
  });
});
