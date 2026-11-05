import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listProviders: vi.fn(async () => [{ id: "gateway", kind: "openai", available: true }]),
  modelsList: vi.fn(),
}));
vi.mock("@anthropic-ai/sdk", () => ({
  default: class { models = { list: mocks.modelsList }; },
}));
vi.mock("../../../../server/modules/model-management/providers.js", () => ({
  listProviders: mocks.listProviders, providerSecret: () => "test-key",
}));
vi.mock("../../../../server/modules/model-management/catalog.js", () => ({
  providerOf: () => ({ endpoint: { baseUrl: "https://gateway.test/v1" } }),
}));
vi.mock("../../../../server/modules/model-management/router.js", () => ({ invoke: vi.fn() }));
vi.mock("../../../../server/shared/database/index.js", () => ({ q: vi.fn() }));

import { listProviderModels } from "../../../../server/modules/model-management/infrastructure/probe.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("provider model discovery for classification", () => {
  it("reads prices, capabilities and context without inventing missing metadata", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ data: [
      { id: "claude-opus-5", context_length: 250000, pricing: { prompt: "0.000004", completion: "0.00002", input_cache_read: "0.0000002" },
        supported_parameters: [], architecture: { input_modalities: ["text"] } },
      { id: "claude-fable-5" },
    ] })));
    const result = await listProviderModels("gateway");
    expect(result.error).toBeUndefined();
    expect(result.models.find(m => m.id === "claude-opus-5")).toMatchObject({
      context: 250000, inPrice: 4, outPrice: 20, cacheReadPrice: expect.closeTo(0.2), tools: false, vision: false,
    });
    expect(result.models.find(m => m.id === "claude-fable-5")).toMatchObject({
      inPrice: undefined, context: undefined, tools: undefined, vision: undefined,
    });
  });
  it("reports unavailable providers, invalid responses and upstream errors", async () => {
    expect((await listProviderModels("missing")).error).toContain("No existe");
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ unexpected: [] })));
    expect((await listProviderModels("gateway")).error).toContain("lista de modelos válida");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("denied", { status: 403 })));
    expect(await listProviderModels("gateway")).toEqual({ models: [], error: "HTTP 403: denied" });
  });
  it("consumes all Anthropic pages instead of importing only the first page", async () => {
    mocks.listProviders.mockResolvedValueOnce([{ id: "gateway", kind: "anthropic", available: true }]);
    mocks.modelsList.mockReturnValue((async function* () {
      yield { id: "claude-opus-5", display_name: "Opus" };
      yield { id: "claude-sonnet-5", display_name: "Sonnet" };
    })());
    expect(await listProviderModels("gateway")).toEqual({ models: [
      { id: "claude-opus-5", label: "Opus" }, { id: "claude-sonnet-5", label: "Sonnet" },
    ] });
  });
});
