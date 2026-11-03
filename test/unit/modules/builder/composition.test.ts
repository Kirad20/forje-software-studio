import { describe, expect, it, vi } from "vitest";
import type { AgentSpec } from "../../../../server/modules/builder/index.js";
import { runAgent, save, loadHistory, imageBlocks } from "../../../../server/modules/builder/index.js";
import { SqlAgentTaskRepository } from "../../../../server/modules/builder/infrastructure/SqlAgentTaskRepository.js";

const mocks = vi.hoisted(() => ({
  q: vi.fn(async (_sql: string, _params?: unknown[]) => [] as any[]),
  callModel: vi.fn(),
  countAction: vi.fn(async () => {}),
  readFile: vi.fn(async () => "base64:pixels"),
  recordStep: vi.fn(),
  recordToolCall: vi.fn(),
}));
vi.mock("../../../../server/shared/database/index.js", async importOriginal => ({
  ...await importOriginal<any>(), q: mocks.q, one: vi.fn(),
}));
vi.mock("../../../../server/modules/model-management/router.js", () => ({ callModel: mocks.callModel, maxTokensFor: () => 4000 }));
vi.mock("../../../../server/modules/usage/usage.js", () => ({ countAction: mocks.countAction }));
vi.mock("../../../../server/modules/builder/infrastructure/CoreModulesAdapter.js", async importOriginal => ({
  ...await importOriginal<any>(), readFile: mocks.readFile,
}));
vi.mock("../../../../server/modules/builder/infrastructure/metrics.js", () => ({
  newRunId: () => "run", recordStep: mocks.recordStep, recordToolCall: mocks.recordToolCall,
}));

describe("production builder module composition", () => {
  it("injects provider routing, billing, history, action counting and telemetry into the application", async () => {
    const model = { id: "m", model: "model", vision: true };
    const usage = { input: 1, output: 2, cacheRead: 3, cacheWrite: 4 };
    mocks.callModel.mockResolvedValueOnce({
      model, failed: [], response: { usage, content: [{ type: "tool_use", id: "1", name: "hello", input: {} }] }, usd: 0.01, credits: 1,
    }).mockResolvedValueOnce({
      model, failed: [], response: { usage, content: [{ type: "text", text: "done" }] }, usd: 0.02, credits: 2,
    });
    const spec = {
      scope: { accountId: "a", projectId: "p" }, billing: { marker: "billing" }, role: "fast",
      routing: { complexity: 1, domains: [], needsVision: false }, system: "system",
      messages: [{ role: "user", content: "hello" }], tools: [{ name: "hello", description: "", input_schema: {}, run: async () => "world" }],
      ctx: { account: { id: "a" }, projectId: "p", author: "builder" },
      maxSteps: 2, signal: new AbortController().signal, emit: vi.fn(), turnId: "turn", persist: { projectId: "p" },
    } as unknown as AgentSpec;
    const result = await runAgent(spec);
    expect(result).toMatchObject({ text: "done", usd: 0.03, credits: 3 });
    expect(mocks.callModel.mock.calls[0]!.slice(0, 3)).toEqual([spec.scope, spec.role, spec.routing]);
    expect(mocks.callModel.mock.calls[1]![4]).toMatchObject({ billing: spec.billing, pinned: model, log: { turnId: "turn" } });
    expect(mocks.countAction).toHaveBeenCalledWith("a");
    expect(mocks.recordStep).toHaveBeenCalledTimes(2);
    expect(mocks.recordToolCall).toHaveBeenCalledWith(expect.objectContaining({ tool: "hello", ok: true }));
    expect(mocks.q.mock.calls.filter(([sql]) => sql.startsWith("insert into chat_messages"))).toHaveLength(3);
  });

  it("normalizes saved messages, maps raw history and resolves attachment bytes at the infrastructure edge", async () => {
    await save("p", { role: "user", content: "text" }, "t");
    expect(mocks.q).toHaveBeenLastCalledWith(expect.any(String), ["p", "user", JSON.stringify([{ type: "text", text: "text" }]), "t"]);
    mocks.q.mockResolvedValueOnce([{ role: "assistant", content: [{ type: "text", text: "done" }], turn_id: "t", created_at: "now" }]);
    expect(await loadHistory("p")).toEqual([{ role: "assistant", content: [{ type: "text", text: "done" }], turnId: "t", createdAt: "now" }]);
    expect(await imageBlocks("p", "[[adjunto:static/uploads/photo.PNG]] [[adjunto:notes.txt]]")).toEqual([{ type: "image", source: { type: "base64", media_type: "image/png", data: "pixels" } }]);
  });

  it("maps task repository writes to the existing SQL schema", async () => {
    const repository = new SqlAgentTaskRepository();
    await repository.insert({ id: "t:ui", projectId: "p", turnId: "t", role: "ui", goal: "build", files: ["pages/a.tsx"], dependsOn: ["data"] });
    expect(mocks.q).toHaveBeenLastCalledWith(expect.stringContaining("insert into agent_tasks"), ["t:ui", "p", "t", "ui", "build", '["pages/a.tsx"]', '["data"]', "[]"]);
    await repository.start("t:ui", "m");
    expect(mocks.q).toHaveBeenLastCalledWith(expect.stringContaining("started_at = coalesce"), ["t:ui", "m"]);
    await repository.finish("t:ui", { status: "done", summary: "done", steps: [], inputTokens: 5, outputTokens: 2, cacheReadTokens: 3, usd: 0.1 });
    expect(mocks.q).toHaveBeenLastCalledWith(expect.stringContaining("finished_at = now()"), ["t:ui", "done", "done", "[]", 5, 2, 3, 0.1]);
  });
});
