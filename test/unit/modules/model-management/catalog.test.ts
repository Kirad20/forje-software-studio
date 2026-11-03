import { describe, expect, it, vi } from "vitest";
import { createCatalogService } from "../../../../server/modules/model-management/application/CatalogService.js";
import { costUsd, creditsAtRate, matchesModelPolicy } from "../../../../server/modules/model-management/domain/models.js";
const a = { id: "local:a", provider: "local", model: "a", label: "A", inPrice: 1, outPrice: 2,
  cacheReadPrice: 0.1, context: 128000, tools: true, vision: false, tier: 3, speed: 3, source: "custom" as const };
const b = { ...a, id: "local:b", model: "b" };
describe("catalog application and model policies", () => {
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
});
