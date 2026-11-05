import { describe, expect, it, vi } from "vitest";
import { createCatalogService } from "../../../../server/modules/model-management/application/CatalogService.js";
import { costUsd, creditsAtRate, matchesModelPolicy } from "../../../../server/modules/model-management/domain/models.js";
import { importedModelInput } from "../../../../server/modules/model-management/domain/classification.js";
const a = { id: "local:a", provider: "local", model: "a", label: "A", inPrice: 1, outPrice: 2,
  cacheReadPrice: 0.1, context: 128000, tools: true, vision: false, tier: 3, speed: 3, source: "custom" as const };
const b = { ...a, id: "local:b", model: "b" };
describe("catalog application and model policies", () => {
  it("imports supplied classification without family overrides and leaves unknown capabilities off", () => {
    expect(importedModelInput("gateway", {
      id: "anthropic/claude-opus-5", label: "Proxy Opus", tools: false, vision: false,
      context: 240_000, inPrice: 1.5, outPrice: 7, cacheReadPrice: 0.15, tier: 2, speed: 4,
    })).toMatchObject({
      label: "Proxy Opus", tools: false, vision: false, context: 240_000,
      inPrice: 1.5, outPrice: 7, cacheReadPrice: 0.15, tier: 2, speed: 4, enabled: false,
    });
    expect(importedModelInput("gateway", { id: "unknown", tier: 4, speed: 1 })).toMatchObject({ tools: false, vision: false, enabled: false });
  });
  it("imports only new unique models, audits them and reports individual failures", async () => {
    const repository = {
      list: vi.fn(async () => [{ ...a, enabled: true }]),
      hasProvider: vi.fn(async () => true), find: vi.fn(async () => undefined),
      create: vi.fn(async () => {}), audit: vi.fn(async () => {}), update: vi.fn(),
    };
    const catalog = createCatalogService(repository as never);
    const result = await catalog.importProviderModels("local", [
      { id: "a", tier: 3, speed: 3 }, { id: "claude-sonnet-5", inPrice: 2, outPrice: 10, tier: 2, speed: 4, tools: true, vision: true },
      { id: "claude-sonnet-5", tier: 2, speed: 4 }, { id: "invalid", context: -1, tier: 3, speed: 3 },
    ], "admin");
    expect(result).toEqual({ created: 1, skipped: 2, errors: [{ model: "invalid", error: "Contexto: entre 1000 y 100000000" }] });
    expect(repository.create).toHaveBeenCalledExactlyOnceWith("local:claude-sonnet-5", "local", "claude-sonnet-5",
      expect.objectContaining({ tier: 2, speed: 4, tools: true, vision: true, inPrice: 2, outPrice: 10, enabled: false }));
    expect(repository.audit).toHaveBeenCalledExactlyOnceWith("local:claude-sonnet-5", "admin", "create");
    expect(repository.update).not.toHaveBeenCalled();
    await expect(catalog.importProviderModels("openrouter", [], "admin")).rejects.toThrow("sincronización");
    repository.hasProvider.mockResolvedValue(false);
    await expect(catalog.importProviderModels("missing", [], "admin")).rejects.toThrow("No existe el proveedor");
  });
  it("explains each permission layer even when a visual model is active in administration", async () => {
    const repository = {
      policy: () => ({ allow: ["local:*"], creditsPerUsd: 10 }),
      list: vi.fn(async () => [{ ...a, enabled: true, vision: true }, { ...b, enabled: false }]),
      usableProviderIds: vi.fn(async () => ["local"]),
      accountCustomized: vi.fn(async () => true), accountModels: vi.fn(async () => [b.id]),
      projectModels: vi.fn(async () => [b.id]),
    };
    const catalog = createCatalogService(repository as never);
    expect((await catalog.modelReadiness({ accountId: "owner", projectId: "project" }))[0])
      .toMatchObject({ vision: true, available: true, allowed: true, blockers: ["No permitido en tu cuenta", "No permitido en este proyecto"] });
    repository.accountCustomized.mockResolvedValue(false);
    expect((await catalog.modelReadiness({ accountId: "owner" }))[0]?.blockers).toEqual([]);
    repository.usableProviderIds.mockResolvedValue([]);
    expect((await catalog.modelReadiness({ accountId: "owner" }))[0]?.blockers).toEqual(["Proveedor no disponible"]);
    expect((await catalog.modelReadiness({ accountId: "owner" }))[1]?.blockers).toEqual(["Modelo desactivado"]);
  });
  it("intersects platform, customized account and nonempty project whitelists", async () => {
    const repository = { available: vi.fn(async () => [a, b]), policy: () => ({ allow: ["custom:*"], creditsPerUsd: 10 }),
      accountCustomized: vi.fn(async () => true), accountModels: vi.fn(async () => [a.id]),
      projectModels: vi.fn(async () => [b.id]) };
    const catalog = createCatalogService(repository as never);
    expect(await catalog.allowedModels({ accountId: "owner", projectId: "project" })).toEqual([]);
    repository.projectModels.mockResolvedValueOnce([]);
    expect(await catalog.allowedModels({ accountId: "owner", projectId: "project" })).toEqual([a]);
    repository.accountCustomized.mockResolvedValueOnce(false);
    expect(await catalog.allowedModels({ accountId: "owner" })).toEqual([a, b]);
  });
  it("matches escaped glob policies and charges long prompts/cache writes at the existing rates", () => {
    expect(matchesModelPolicy(a, ["local:*"])).toBe(true);
    expect(matchesModelPolicy(a, ["other:*"])).toBe(false);
    expect(matchesModelPolicy(a, ["custom:*"])).toBe(true);
    expect(matchesModelPolicy({ ...a, id: "local:a.b" }, ["local:a.b"])).toBe(true);
    expect(matchesModelPolicy({ ...a, id: "local:axb" }, ["local:a.b"])).toBe(false);
    const expensive = { ...a, longPrompt: { threshold: 100, inPrice: 3, outPrice: 4 } };
    expect(costUsd(expensive, { input: 100, cacheWrite: 1, cacheRead: 5, output: 10 }))
      .toBeCloseTo((300 + 3.75 + 0.5 + 40) / 1e6);
    expect(creditsAtRate(0, 100)).toBe(0);
    expect(creditsAtRate(0.000001, 100)).toBe(1);
  });
  it("permits one model without dropping saved permissions or changing inherited defaults", async () => {
    const repository = {
      policy: () => ({ allow: ["local:*"], creditsPerUsd: 10 }),
      list: vi.fn(async () => [{ ...a, enabled: true }, { ...b, enabled: false }]),
      usableProviderIds: vi.fn(async () => ["local"]), accountCustomized: vi.fn(async () => true),
      accountModels: vi.fn(async () => ["offline:saved"]), replaceAccountModels: vi.fn(async () => {}),
    };
    const catalog = createCatalogService(repository as never);
    await catalog.permitAccountModel("owner", a.id);
    expect(repository.replaceAccountModels).toHaveBeenCalledWith("owner", ["offline:saved", a.id]);
    await expect(catalog.permitAccountModel("owner", b.id)).rejects.toThrow("El modelo debe estar activo");
    expect(repository.replaceAccountModels).toHaveBeenCalledTimes(1);
    repository.accountCustomized.mockResolvedValue(false);
    await catalog.permitAccountModel("owner", a.id);
    expect(repository.replaceAccountModels).toHaveBeenCalledTimes(1);
  });
});
