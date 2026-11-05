import { describe, expect, it, vi } from "vitest";
import { createModelRouter } from "../../../../server/modules/model-management/application/ModelRouter.js";
import { ModelCallError } from "../../../../server/modules/model-management/domain/messages.js";
import type { LlmRequest } from "../../../../server/modules/model-management/domain/messages.js";
import type { ModelInfo } from "../../../../server/modules/model-management/domain/models.js";

const model = (id: string) => ({
  id, provider: "test", model: id, label: id, inPrice: 1, outPrice: 2, cacheReadPrice: 0,
  context: 200_000, tools: true, vision: true, tier: 4, speed: 4, source: "custom" as const,
});
const a = model("a"), b = model("b");
const response = { content: [{ type: "text" as const, text: "ok" }], stopReason: "end" as const,
  usage: { input: 100, output: 20, cacheRead: 0, cacheWrite: 0 }, servedBy: "b" };
const scope = { accountId: "owner", projectId: "project" };
const features = { complexity: 2, domains: ["ui"], needsVision: false };
function setup() {
  const ports = {
    allowedModels: vi.fn(async () => [a, b]),
    projectMode: vi.fn(async () => "balanced" as const),
    posteriors: vi.fn(async () => new Map([a, b].map(m => [m.id, { alpha: 3, beta: 1, uses: 4 }]))),
    recordOutcome: vi.fn(async () => {}),
    invoke: vi.fn(async (_model: ModelInfo, _request: LlmRequest) => response),
    charge: vi.fn(async () => ({ usd: 0.01, credits: 1 })),
    logDecision: vi.fn(async () => {}),
    requestKey: (value: string) => value,
  };
  return { ports, router: createModelRouter(ports) };
}
describe("model routing application", () => {
  it("preserves provider failures when retries exhaust the remaining eligible models", async () => {
    const { ports, router } = setup();
    ports.allowedModels.mockResolvedValue([{ ...b, context: 128000 }]);
    ports.invoke.mockRejectedValueOnce(new ModelCallError("503: No available accounts", true, 503));
    await expect(router.callModel(scope, "fast", features, { messages: [], maxTokens: 16000 }))
      .rejects.toMatchObject({
        retryable: false,
        message: expect.stringContaining("Ningún modelo pudo responder: b: 503: No available accounts"),
      });
    expect(ports.invoke).toHaveBeenCalledTimes(1);
  });
  it("keeps initial eligibility failures distinct from provider failures", async () => {
    const { ports, router } = setup();
    ports.allowedModels.mockResolvedValue([]);
    await expect(router.callModel(scope, "fast", features, { messages: [] }))
      .rejects.toThrow("No hay modelos habilitados y permitidos");
    expect(ports.invoke).not.toHaveBeenCalled();
  });
  it("retries a pinned provider failure, excludes it, records the weak signal and bills only the success", async () => {
    const { ports, router } = setup();
    ports.invoke.mockRejectedValueOnce(new ModelCallError("overloaded", true));
    const result = await router.callModel(scope, "ui", features, { messages: [] }, {
      pinned: a, billing: { payerId: "owner", projectId: "project", source: "builder" },
    });
    expect(ports.invoke.mock.calls.map(([m]) => m.id)).toEqual(["a", "b"]);
    expect(ports.recordOutcome).toHaveBeenCalledWith("ui:low:ui", a, 0, 0, 0.25);
    expect(ports.charge).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ model: b, credits: 1, failed: ["a: overloaded"] });
  });
  it("does not retry malformed requests or cancellation", async () => {
    const { ports, router } = setup();
    const bad = new ModelCallError("bad request", false);
    ports.invoke.mockRejectedValueOnce(bad);
    await expect(router.callModel(scope, "chat", features, { messages: [] }, { pinned: a })).rejects.toBe(bad);
    expect(ports.invoke).toHaveBeenCalledTimes(1);
    const aborted = Object.assign(new Error("cancel"), { name: "AbortError" });
    ports.invoke.mockRejectedValueOnce(aborted);
    await expect(router.callModel(scope, "chat", features, { messages: [] }, { pinned: a })).rejects.toBe(aborted);
    expect(ports.recordOutcome).toHaveBeenCalledTimes(1);
  });
  it("filters tool, vision, context and excluded candidates before choosing", async () => {
    const { ports, router } = setup();
    ports.allowedModels.mockResolvedValueOnce([{ ...a, tools: false }, b]);
    expect((await router.pick(scope, "ui", features, { rand: () => 0.5 })).model.id).toBe("b");
    await expect(router.pick(scope, "ui", features, { exclude: new Set(["a", "b"]) })).rejects.toThrow("No hay ningún modelo");
  });
  it("uses heuristic analysis without making a paid classifier call", async () => {
    const { ports, router } = setup();
    expect(await router.analyzeRequest(scope, "Cambia el color del botón", { images: 1, targeted: true, fileCount: 10 }))
      .toMatchObject({ intent: "style", complexity: 1, needsVision: true, source: "heuristic" });
    expect(ports.invoke).not.toHaveBeenCalled();
  });
  it("routes short fast requests to 32k local models instead of applying whole-task estimates", async () => {
    const { ports, router } = setup();
    ports.allowedModels.mockResolvedValue([{ ...b, context: 32_768, vision: false }]);
    expect((await router.pick(scope, "fast", { ...features, complexity: 5 })).model.id).toBe("b");
    const result = await router.callModel(scope, "fast", features, {
      system: "Build a page", messages: [{ role: "user", content: "Change the title" }],
    });
    expect(result.model.id).toBe("b");
    expect(ports.invoke.mock.calls[0]?.[1].maxTokens).toBeUndefined();
  });
  it("counts system, tool schemas and output reserve and reports insufficient capacity", async () => {
    const { ports, router } = setup();
    ports.allowedModels.mockResolvedValue([{ ...b, context: 32_768 }]);
    const req = { system: "x".repeat(40_000), messages: [],
      tools: [{ name: "write", description: "y".repeat(40_000), input_schema: {} }], maxTokens: 16_000 };
    await expect(router.callModel(scope, "fast", features, req)).rejects.toThrow(/contexto 32768; se necesitan al menos/);
    expect(ports.invoke).not.toHaveBeenCalled();
  });
  it("switches away from a pinned model that no longer fits without penalizing it", async () => {
    const { ports, router } = setup();
    const result = await router.callModel(scope, "fast", features, {
      messages: [{ role: "user", content: "x".repeat(80_000) }],
    }, { pinned: { ...a, context: 32_768 } });
    expect(result.model.id).toBe("b");
    expect(ports.invoke.mock.calls.map(([m]) => m.id)).toEqual(["b"]);
    expect(ports.recordOutcome).not.toHaveBeenCalled();
    expect(ports.logDecision).toHaveBeenCalledTimes(1);
  });
  it("counts images as visual tokens rather than base64 text", async () => {
    const { ports, router } = setup();
    ports.allowedModels.mockResolvedValue([{ ...b, context: 32_768, tools: false }]);
    const result = await router.callModel(scope, "qa", { ...features, needsVision: true, needsTools: false }, {
      messages: [{ role: "user", content: [{ type: "image", source: { type: "base64", media_type: "image/png", data: "x".repeat(400_000) } }] }],
      maxTokens: 2000,
    });
    expect(result.model.id).toBe("b");
  });
  it("explains capability and permission failures without relaxing them for local models", async () => {
    const { ports, router } = setup();
    ports.allowedModels.mockResolvedValueOnce([{ ...b, tools: false, vision: false }]);
    await expect(router.pick(scope, "fast", { ...features, needsVision: true })).rejects.toThrow(/b: sin herramientas, sin visión/);
    ports.allowedModels.mockResolvedValueOnce([]);
    await expect(router.pick(scope, "fast", features)).rejects.toThrow("No hay modelos habilitados y permitidos");
  });
  it("allows vision-only judges on fallback without relaxing the QA role default", async () => {
    const { ports, router } = setup();
    ports.allowedModels.mockResolvedValue([{ ...b, tools: false }]);
    ports.invoke.mockRejectedValueOnce(new ModelCallError("overloaded", true));
    const result = await router.callModel(scope, "qa", { ...features, needsVision: true, needsTools: false },
      { messages: [] }, { pinned: a });
    expect(result.model.id).toBe("b");
    await expect(router.pick(scope, "qa", { ...features, needsVision: true })).rejects.toThrow("No hay ningún modelo");
    ports.allowedModels.mockResolvedValue([{ ...b, tools: false, vision: false }]);
    await expect(router.pick(scope, "qa", { ...features, needsVision: true, needsTools: false })).rejects.toThrow("No hay ningún modelo");
  });
});
