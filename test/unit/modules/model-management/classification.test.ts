import { describe, expect, it, vi } from "vitest";
import { createModelClassification } from "../../../../server/modules/model-management/application/ModelClassification.js";
import { createModelRouter } from "../../../../server/modules/model-management/application/ModelRouter.js";
import type { LlmRequest } from "../../../../server/modules/model-management/domain/messages.js";
import type { ModelInfo } from "../../../../server/modules/model-management/domain/models.js";
import type { CallResult } from "../../../../server/modules/model-management/domain/routing.js";

const scope = { accountId: "admin" };
const model: ModelInfo = {
  id: "local:classifier", provider: "local", model: "classifier", label: "Classifier",
  inPrice: 1, outPrice: 2, cacheReadPrice: 0, context: 32000, tools: false, vision: false,
  tier: 3, speed: 4, source: "custom",
};
const prediction = (id: string) => ({
  id, tier: 2, speed: 4, context: null, inPrice: null, outPrice: null, cacheReadPrice: null, tools: null, vision: null,
});
const answer = (value: unknown): CallResult => ({
  model, usd: 0.001, credits: 0, failed: [],
  response: { content: [{ type: "text", text: JSON.stringify(value) }], stopReason: "end",
    usage: { input: 100, output: 100, cacheRead: 0, cacheWrite: 0 }, servedBy: model.model },
});
function setup() {
  const ports = {
    catalog: {
      listCatalog: vi.fn(async () => [{ ...model, enabled: true, available: true, allowed: true }]),
      importProviderModels: vi.fn(async (_provider, models, _actor) => ({ created: models.length, skipped: 0, errors: [] })),
    },
    callModel: vi.fn<ReturnType<typeof createModelRouter>["callModel"]>(async (_scope, _role, _features, req) => {
      const input = JSON.parse(String(req.messages[0]?.content)) as { models: { id: string }[] };
      return answer({ models: input.models.map(m => prediction(m.id)) });
    }),
    recordUsage: vi.fn(async (_accountId: string, _result: CallResult) => {}),
  } satisfies Parameters<typeof createModelClassification>[0];
  return { ports, service: createModelClassification(ports) };
}

describe("AI provider model classification", () => {
  it("uses the router with account scope and persists AI scores instead of fixed family scores", async () => {
    const { ports, service } = setup();
    const result = await service.importProviderModels(scope, "gateway", [{ id: "claude-opus-5" }]);
    expect(ports.callModel).toHaveBeenCalledWith(scope, "router",
      expect.objectContaining({ needsTools: false, needsVision: false }),
      expect.objectContaining({ maxTokens: 6000, signal: expect.any(AbortSignal) }));
    expect(ports.catalog.importProviderModels).toHaveBeenCalledWith("gateway",
      [expect.objectContaining({ id: "claude-opus-5", tier: 2, speed: 4, tools: undefined, vision: undefined })], "admin");
    expect(result).toMatchObject({ created: 1, classifiedBy: [model.id], usd: 0.001 });
    expect(ports.recordUsage).toHaveBeenCalledExactlyOnceWith("admin", expect.objectContaining({ model }));
  });
  it("preserves provider facts including explicit false/zero over AI estimates", async () => {
    const { ports, service } = setup();
    ports.callModel.mockResolvedValueOnce(answer({ models: [{
      ...prediction("new"), tools: true, vision: true, context: 200000, inPrice: 10, outPrice: 20, cacheReadPrice: 1,
    }] }));
    await service.importProviderModels(scope, "gateway", [{
      id: "new", label: "Published", tools: false, vision: false, context: 32000, inPrice: 0, outPrice: 1, cacheReadPrice: 0,
    }]);
    expect(ports.catalog.importProviderModels).toHaveBeenCalledWith("gateway", [expect.objectContaining({
      label: "Published", tier: 2, speed: 4, tools: false, vision: false, context: 32000, inPrice: 0, outPrice: 1, cacheReadPrice: 0,
    })], "admin");
  });
  it("uses AI facts when absent from provider metadata", async () => {
    const { ports, service } = setup();
    ports.callModel.mockResolvedValueOnce(answer({ models: [{
      ...prediction("new"), tools: true, vision: true, context: 200000, inPrice: 2, outPrice: 10, cacheReadPrice: 0.2,
    }] }));
    await service.importProviderModels(scope, "gateway", [{ id: "new" }]);
    expect(ports.catalog.importProviderModels).toHaveBeenCalledWith("gateway", [expect.objectContaining({
      tools: true, vision: true, context: 200000, inPrice: 2, outPrice: 10, cacheReadPrice: 0.2,
    })], "admin");
  });
  it("skips existing models and deduplicates before spending tokens", async () => {
    const { ports, service } = setup();
    expect(await service.importProviderModels(scope, "local", [{ id: "classifier" }, { id: "classifier" }]))
      .toMatchObject({ created: 0, skipped: 2, classifiedBy: [], usd: 0 });
    expect(ports.callModel).not.toHaveBeenCalled();
    await service.importProviderModels(scope, "gateway", [{ id: "new" }, { id: " new " }]);
    expect(ports.callModel).toHaveBeenCalledTimes(1);
    expect(ports.catalog.importProviderModels.mock.calls[1]?.[1]).toHaveLength(1);
  });
  it("batches large catalogs and does not persist any model if a later batch fails", async () => {
    const { ports, service } = setup();
    const remote = Array.from({ length: 16 }, (_, i) => ({ id: `model-${i}` }));
    expect(await service.importProviderModels(scope, "gateway", remote)).toMatchObject({ created: 16, usd: 0.002 });
    expect(ports.callModel).toHaveBeenCalledTimes(2);
    expect(ports.catalog.importProviderModels).toHaveBeenCalledTimes(1);
    ports.catalog.importProviderModels.mockClear();
    ports.callModel.mockResolvedValueOnce(answer({ models: remote.slice(0, 15).map(m => prediction(m.id)) }));
    ports.callModel.mockResolvedValueOnce(answer({ models: [] }));
    await expect(service.importProviderModels(scope, "gateway", remote)).rejects.toThrow("identificadores");
    expect(ports.catalog.importProviderModels).not.toHaveBeenCalled();
  });
  it.each([
    { models: [] },
    { models: [prediction("other")] },
    { models: [prediction("new"), prediction("new")] },
    { models: [{ ...prediction("new"), tier: 6 }] },
    { models: [{ ...prediction("new"), speed: 2.5 }] },
    { models: [{ ...prediction("new"), vision: "true" }] },
    { models: [{ ...prediction("new"), inPrice: -1 }] },
    { models: [{ ...prediction("new"), context: 0 }] },
    { models: [{ id: "new", tier: 2, speed: 4 }] },
  ])("rejects malformed or mismatched AI classifications without static fallback: %j", async (output) => {
    const { ports, service } = setup();
    ports.callModel.mockResolvedValueOnce(answer(output));
    await expect(service.importProviderModels(scope, "gateway", [{ id: "new" }])).rejects.toThrow("clasificación IA");
    expect(ports.catalog.importProviderModels).not.toHaveBeenCalled();
  });
  it("surfaces invalid JSON, truncated answers, unavailable models and accounting failures", async () => {
    const { ports, service } = setup();
    const invalid = answer({});
    invalid.response.content = [{ type: "text", text: "not JSON" }];
    ports.callModel.mockResolvedValueOnce(invalid);
    await expect(service.importProviderModels(scope, "gateway", [{ id: "new" }])).rejects.toThrow("JSON válido");
    ports.callModel.mockResolvedValueOnce({ ...invalid, response: { ...invalid.response, stopReason: "max_tokens" } });
    await expect(service.importProviderModels(scope, "gateway", [{ id: "new" }])).rejects.toThrow("no terminó");
    ports.callModel.mockRejectedValueOnce(new Error("No hay modelos permitidos"));
    await expect(service.importProviderModels(scope, "gateway", [{ id: "new" }])).rejects.toThrow("No hay modelos permitidos");
    ports.recordUsage.mockRejectedValueOnce(new Error("usage database unavailable"));
    await expect(service.importProviderModels(scope, "gateway", [{ id: "new" }])).rejects.toThrow("usage database unavailable");
    expect(ports.catalog.importProviderModels).not.toHaveBeenCalled();
  });
  it("routes through the real router and never relaxes account permissions", async () => {
    const { ports } = setup();
    const routerPorts = {
      allowedModels: vi.fn(async () => [model]),
      projectMode: vi.fn(async () => "balanced" as const),
      posteriors: vi.fn(async () => new Map([[model.id, { alpha: 3, beta: 1, uses: 4 }]])),
      invoke: vi.fn(async (_m: ModelInfo, _req: LlmRequest) => answer({ models: [prediction("new")] }).response),
      recordOutcome: vi.fn(async () => {}), charge: vi.fn(async () => ({ usd: 0, credits: 0 })),
      logDecision: vi.fn(async () => {}), requestKey: (value: string) => value,
    };
    const service = createModelClassification({ ...ports, callModel: createModelRouter(routerPorts).callModel });
    expect(await service.importProviderModels(scope, "gateway", [{ id: "new" }])).toMatchObject({ classifiedBy: [model.id] });
    expect(routerPorts.allowedModels).toHaveBeenCalledWith(scope);
    expect(routerPorts.invoke).toHaveBeenCalledWith(model, expect.objectContaining({ maxTokens: 6000 }));
    expect(routerPorts.invoke.mock.calls[0]?.[1].tools).toBeUndefined();
    ports.catalog.importProviderModels.mockClear();
    routerPorts.allowedModels.mockResolvedValue([]);
    await expect(service.importProviderModels(scope, "gateway", [{ id: "new" }])).rejects.toThrow("No hay modelos habilitados y permitidos");
    expect(ports.catalog.importProviderModels).not.toHaveBeenCalled();
  });
});
