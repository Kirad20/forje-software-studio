import { describe, expect, it, vi } from "vitest";
import { createModelRouter } from "../../../../server/modules/model-management/application/ModelRouter.js";
import { emptyUsage, ModelCallError, type LlmRequest, type LlmResponse } from "../../../../server/modules/model-management/domain/messages.js";
import type { ModelInfo, ModelScope } from "../../../../server/modules/model-management/domain/models.js";
import type { Role } from "../../../../server/modules/model-management/domain/routing.js";
import type { FusionEffort, FusionStep } from "../../../../server/modules/model-management/domain/fusion.js";
import { validateToolInput } from "../../../../server/modules/model-management/infrastructure/ToolProposalValidation.js";
import { validateProposal } from "../../../../server/modules/model-management/domain/FusionPolicy.js";
import { contextMetrics } from "../../../../server/modules/model-management/domain/ContextMetrics.js";

const model = (id: string, tier: number, provider: string): ModelInfo => ({
  id, tier, provider, model: id, label: id, speed: 4, context: 128000, tools: true, vision: true,
  inPrice: 0.1, outPrice: 0.2, cacheReadPrice: 0.01, source: "custom",
});
const author = model("author", 3, "claude");
const gpt = model("gpt", 5, "openai");
const gemini = { ...model("gemini", 4, "gemini"), speed: 3 };
const scope = { accountId: "owner", projectId: "project" };
const features = { complexity: 3, domains: ["ui"], needsVision: false };
const req: LlmRequest = { messages: [{ role: "user", content: "Build the requested feature." }], maxTokens: 1000 };
const reply = (text: string, servedBy = "author"): LlmResponse => ({
  content: [{ type: "text", text }], stopReason: "end", servedBy,
  usage: { input: 100, output: 20, cacheRead: 0, cacheWrite: 0 },
});
const review = (accept: boolean) => reply(JSON.stringify({ accept, issues: accept ? [] : ["The proposed write loses user data."] }));
function setup(effort: FusionEffort = "high") {
  const steps: FusionStep[] = [];
  const ports = {
    allowedModels: vi.fn(async (): Promise<ModelInfo[]> => [author, gpt, gemini]),
    projectMode: vi.fn(async () => effort === "fast" ? "standard" as const : effort),
    posteriors: vi.fn(async () => new Map()),
    recordOutcome: vi.fn(async () => {}),
    invoke: vi.fn(async (_model: ModelInfo, _input: LlmRequest): Promise<LlmResponse> => reply("draft")),
    charge: vi.fn(async () => ({ usd: 1, credits: 1 })),
    logDecision: vi.fn(async () => {}),
    requestKey: (key: string) => key,
    nextOperationId: () => "operation",
    recordFusionStep: vi.fn(async (_scope: ModelScope, _role: Role, _operation: string, step: FusionStep) => {
      steps.push({ ...step });
      return { credits: step.error ? 0 : 1 };
    }),
    recordFusionTrace: vi.fn(async () => {}),
    validateToolInput,
  };
  return { router: createModelRouter(ports), ports, steps };
}
describe("Fusion orchestration", () => {
  it("uses Single for simple tasks without a paid selector or reviewer", async () => {
    const { router, ports } = setup("max");
    const result = await router.callModel(scope, "ui", { ...features, complexity: 1 }, req);
    expect(ports.invoke).toHaveBeenCalledTimes(1);
    expect(result.fusion).toMatchObject({ pattern: "single", effort: "max" });
    expect(ports.posteriors).not.toHaveBeenCalled();
  });
  it("accepts an efficient Claude draft through an independent GPT judge and aggregates both calls", async () => {
    const { router, ports, steps } = setup();
    ports.invoke.mockResolvedValueOnce(reply("accepted draft")).mockResolvedValueOnce(review(true));
    const result = await router.callModel(scope, "ui", features, req, { pinned: author });
    expect(result.response.content).toEqual(reply("accepted draft").content);
    expect(ports.invoke.mock.calls.map(([m]) => m.provider)).toEqual(["claude", "openai"]);
    expect(result.fusion?.steps.map(step => step.phase)).toEqual(["draft", "judge"]);
    expect(result.totalUsage).toEqual({ input: 200, output: 40, cacheRead: 0, cacheWrite: 0 });
    expect(result.credits).toBe(2);
    expect(steps).toHaveLength(2);
    expect(ports.charge).not.toHaveBeenCalled();
  });
  it("discards a rejected draft and escalates exactly once to a more capable provider", async () => {
    const { router, ports } = setup();
    ports.invoke.mockResolvedValueOnce(reply("discarded")).mockResolvedValueOnce(review(false)).mockResolvedValueOnce(reply("final", "gpt"));
    const result = await router.callModel(scope, "ui", features, req, { pinned: author });
    expect(result.model.id).not.toBe(author.id);
    expect(result.response.content).toEqual(reply("final").content);
    expect(result.fusion?.steps.map(step => step.phase)).toEqual(["draft", "judge", "escalation"]);
    expect(result.credits).toBe(3);
    expect(ports.invoke).toHaveBeenCalledTimes(3);
  });
  it("runs two independent cross-provider critics and one author revision without executing tools", async () => {
    const { router, ports } = setup("max");
    const draft: LlmResponse = {
      ...reply(""), stopReason: "tool_use",
      content: [{ type: "tool_use", id: "discarded", name: "write", input: { path: "bad.ts" } }],
    };
    const final = { ...draft, content: [{ type: "tool_use" as const, id: "accepted", name: "write", input: { path: "good.ts" } }] };
    ports.invoke.mockImplementation(async (_model, input) => {
      if (input.system?.includes("review an unexecuted")) return review(false);
      return ports.invoke.mock.calls.length === 1 ? draft : final;
    });
    const result = await router.callModel(scope, "ui", features, {
      ...req, tools: [{ name: "write", description: "write", input_schema: {
        type: "object", properties: { path: { type: "string" } }, required: ["path"],
      } }],
    }, { pinned: author });
    expect(result.response.content).toEqual(final.content);
    expect(result.fusion?.steps.map(step => step.phase)).toEqual(["draft", "critic", "critic", "revision"]);
    const critics = ports.invoke.mock.calls.slice(1, 3);
    expect(new Set(critics.map(([m]) => m.provider))).toEqual(new Set(["openai", "gemini"]));
    expect(critics.every(([, input]) => !input.tools)).toBe(true);
    expect(ports.invoke.mock.calls[3]?.[0].id).toBe(author.id);
    expect(result.credits).toBe(4);
  });
  it("forces Single for an explicit choice and never substitutes a disallowed model", async () => {
    const { router, ports } = setup("max");
    expect((await router.callModel(scope, "ui", features, req, { explicit: author })).model.id).toBe(author.id);
    expect(ports.invoke).toHaveBeenCalledTimes(1);
    ports.allowedModels.mockResolvedValue([gpt]);
    await expect(router.callModel(scope, "ui", features, req, { explicit: author })).rejects.toThrow("explícito");
    expect(ports.invoke).toHaveBeenCalledTimes(1);
  });
  it("degrades visibly when independent reviewers are unavailable without expanding permissions", async () => {
    const { router, ports } = setup("max");
    ports.allowedModels.mockResolvedValue([author]);
    const result = await router.callModel(scope, "ui", features, req);
    expect(result.fusion?.pattern).toBe("single");
    expect(result.fusion?.warnings.join(" ")).toContain("degradado");
    expect(ports.invoke).toHaveBeenCalledTimes(1);
  });
  it("records consumed drafts even when escalation fails and does not silently approve rejected work", async () => {
    const { router, ports, steps } = setup();
    ports.invoke.mockResolvedValueOnce(reply("bad")).mockResolvedValueOnce(review(false))
      .mockRejectedValueOnce(new ModelCallError("invalid upstream request", false));
    await expect(router.callModel(scope, "ui", features, req, { pinned: author })).rejects.toThrow("invalid upstream");
    expect(steps.map(step => step.phase)).toEqual(["draft", "judge", "escalation"]);
    expect(steps[2]?.usage).toEqual(emptyUsage());
    expect(ports.recordFusionTrace).toHaveBeenCalledTimes(1);
    expect(ports.charge).not.toHaveBeenCalled();
  });
  it("does not retry ledger failures as provider failures", async () => {
    const { router, ports } = setup();
    ports.recordFusionStep.mockRejectedValueOnce(new Error("database unavailable"));
    await expect(router.callModel(scope, "ui", features, req)).rejects.toThrow("database unavailable");
    expect(ports.invoke).toHaveBeenCalledTimes(1);
  });
  it("treats malformed review JSON as unreviewed, not an approval", async () => {
    const { router, ports } = setup();
    ports.invoke.mockResolvedValueOnce(reply("draft")).mockResolvedValueOnce(reply('{"accept":true,"issues":["known error"]}'));
    const result = await router.callModel(scope, "ui", features, req, { pinned: author });
    expect(result.fusion?.warnings.join(" ")).toContain("sin revisión");
    expect(result.fusion?.pattern).toBe("single");
  });
  it("shares call and estimated-dollar limits rather than invoking unlimited critics", async () => {
    const { router, ports } = setup("max");
    const result = await router.callModel(scope, "ui", features, req, { budget: { maxCalls: 1 } });
    expect(result.fusion?.pattern).toBe("single");
    expect(ports.invoke).toHaveBeenCalledTimes(1);
    await expect(router.callModel(scope, "ui", features, req, { budget: { maxUsd: 0.000001 } })).rejects.toThrow("presupuesto");
    expect(ports.invoke).toHaveBeenCalledTimes(1);
  });
  it("never strips images to fit an incompatible reviewer or leaks private thinking cross-provider", async () => {
    const { router, ports } = setup();
    ports.allowedModels.mockResolvedValue([author, { ...gpt, vision: false }]);
    const request: LlmRequest = {
      ...req, messages: [
        { role: "assistant", content: [{ type: "thinking", thinking: "PRIVATE", signature: "SECRET" }, { type: "text", text: "public" }] },
        { role: "user", content: [{ type: "image", source: { type: "base64", media_type: "image/png", data: "image" } }] },
      ],
    };
    const result = await router.callModel(scope, "ui", { ...features, needsVision: true }, request, { pinned: gpt });
    expect(result.model.id).toBe(author.id);
    expect(result.fusion?.pattern).toBe("single");
    expect(JSON.stringify(ports.invoke.mock.calls[0]?.[1])).not.toContain("PRIVATE");
    expect(JSON.stringify(ports.invoke.mock.calls[0]?.[1])).toContain('"type":"image"');
  });
  it("rechecks owner permissions after the draft before invoking a reviewer", async () => {
    const { router, ports } = setup();
    ports.invoke.mockImplementation(async () => {
      ports.allowedModels.mockResolvedValue([author]);
      return reply("draft");
    });
    const result = await router.callModel(scope, "ui", features, req, { pinned: author });
    expect(result.model.id).toBe(author.id);
    expect(ports.invoke).toHaveBeenCalledTimes(1);
    expect(result.fusion?.pattern).toBe("single");
  });
  it("persists billed work on cancellation and never returns its proposal", async () => {
    const { router, ports, steps } = setup();
    const controller = new AbortController();
    ports.invoke.mockImplementation(async () => { controller.abort(new Error("cancelled")); return reply("discarded"); });
    await expect(router.callModel(scope, "ui", features, { ...req, signal: controller.signal })).rejects.toThrow("cancelled");
    expect(steps).toHaveLength(1);
    expect(steps[0]?.usage.input).toBe(100);
    expect(ports.recordFusionTrace).toHaveBeenCalledTimes(1);
  });
  it("rejects duplicate tool ids, wrong argument types and orphan results before any effects", async () => {
    const { router, ports } = setup();
    const schemaReq = { ...req, tools: [{ name: "write", description: "write", input_schema: {
      type: "object", properties: { path: { type: "string", pattern: "^safe/" } }, required: ["path"],
    } }] };
    expect(() => validateProposal({
      ...reply(""), stopReason: "tool_use", content: [{ type: "tool_use", id: "x", name: "write", input: { path: "unsafe" } }],
    }, schemaReq, validateToolInput)).toThrow("inválida");
    expect(() => validateProposal({
      ...reply(""), stopReason: "tool_use", content: [
        { type: "tool_use", id: "x", name: "write", input: { path: "safe/x" } },
        { type: "tool_use", id: "x", name: "write", input: { path: "safe/y" } },
      ],
    }, schemaReq, validateToolInput)).toThrow("inválida");
    await expect(router.callModel(scope, "ui", features, { messages: [
      { role: "user", content: [{ type: "tool_result", tool_use_id: "orphan", content: "output" }] },
    ] })).rejects.toThrow("Historial inválido");
    expect(ports.invoke).not.toHaveBeenCalled();
  });
  it("reduces parallel criticism to one reviewer when only three physical calls fit", async () => {
    const { router, ports } = setup("max");
    ports.invoke.mockResolvedValueOnce(reply("draft")).mockResolvedValueOnce(review(true)).mockResolvedValueOnce(reply("revision"));
    const result = await router.callModel(scope, "ui", features, req, { pinned: author, budget: { maxCalls: 3 } });
    expect(result.fusion?.pattern).toBe("critique");
    expect(result.fusion?.steps.map(step => step.phase)).toEqual(["draft", "critic", "revision"]);
    expect(result.fusion?.warnings.join(" ")).toContain("una sola crítica");
  });
  it("keeps high effort but uses Single for tool-loop continuations", async () => {
    const { router, ports } = setup("max");
    const result = await router.callModel(scope, "ui", features, req, { pinned: author, decisionBoundary: false });
    expect(result.fusion).toMatchObject({ effort: "max", pattern: "single" });
    expect(ports.invoke).toHaveBeenCalledTimes(1);
    expect(ports.invoke.mock.calls[0]?.[1].effort).toBe("high");
  });
  it("selects a cheaper viable model when the strongest cannot fit the monetary budget", async () => {
    const { router, ports } = setup("standard");
    ports.allowedModels.mockResolvedValue([{ ...gpt, inPrice: 100, outPrice: 100 }, author]);
    const result = await router.callModel(scope, "ui", features, req, { budget: { maxUsd: 0.001 } });
    expect(result.model.id).toBe(author.id);
    expect(ports.invoke).toHaveBeenCalledTimes(1);
  });
  it("preserves affinity until a meaningful complexity change or compacted context boundary", async () => {
    const { router, ports } = setup("standard");
    const first = await router.callModel(scope, "ui", { ...features, complexity: 1 }, req, { pinned: author, affinityKey: "task" });
    const second = await router.callModel(scope, "ui", { ...features, complexity: 1 }, req, { affinityKey: "task" });
    expect(second.model.id).toBe(first.model.id);
    ports.allowedModels.mockResolvedValue([author, { ...gpt, speed: 5 }]);
    const third = await router.callModel(scope, "ui", { ...features, complexity: 5 }, req, { pinned: author, affinityKey: "task" });
    expect(third.model.id).toBe(gpt.id);
  });
  it("records only context estimates and counters, with file-tool contribution separated from actual usage", async () => {
    const text = "confidential-file-content";
    const metrics = contextMetrics({
      system: "system-secret",
      tools: [{ name: "read_files", description: "read", input_schema: { type: "object" } }],
      messages: [
        { role: "assistant", content: [{ type: "tool_use", name: "read_files", id: "files", input: { paths: ["a.ts", "b.ts"] } }] },
        { role: "user", content: [{ type: "tool_result", tool_use_id: "files", content: text }] },
      ],
    });
    expect(metrics).toMatchObject({ messages: 2, toolCalls: 1, toolResults: 1, fileReadCalls: 1, requestedFileCount: 2 });
    expect(metrics.fileToolResultBytes).toBe(new TextEncoder().encode(text).length);
    expect(metrics.estimatedInputTokens).toBeGreaterThan(metrics.toolSchemaTokens);
    expect(Object.values(metrics).every(value => typeof value === "number")).toBe(true);
    expect(JSON.stringify(metrics)).not.toContain(text);
    expect(JSON.stringify(metrics)).not.toContain("system-secret");
    const { router } = setup();
    const result = await router.callModel(scope, "ui", { ...features, complexity: 1 }, req);
    expect(result.fusion?.steps[0]?.context?.messages).toBe(1);
    expect(result.fusion?.steps[0]?.usage.input).toBe(100);
  });
});
