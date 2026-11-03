import { describe, expect, it, vi } from "vitest";
import { createRouterAdministration } from "../../../../server/modules/model-management/application/RouterAdministration.js";
describe("router administration application", () => {
  it("groups and sorts posteriors, handles zero usage and forwards decision limit", async () => {
    const repository = {
      stats: vi.fn(async () => [
        { taskClass: "chat", modelId: "a", alpha: 1, beta: 3, uses: 2, usd: 4 },
        { taskClass: "chat", modelId: "b", alpha: 3, beta: 1, uses: 0, usd: 0 },
        { taskClass: "ui", modelId: "c", alpha: 2, beta: 2, uses: 4, usd: 1 },
      ]),
      decisions: vi.fn(async (_limit: number) => []),
      reset: vi.fn(async (_taskClass: string | null, _modelId: string | null) => 2),
    };
    const service = createRouterAdministration(repository);
    const stats = await service.routerStats(12);
    expect(stats.classes.map(c => c.taskClass)).toEqual(["ui", "chat"]);
    expect(stats.classes[1]?.models.map(m => m.modelId)).toEqual(["b", "a"]);
    expect(stats.classes[1]?.models[0]).toMatchObject({ mean: 0.75, usdPerUse: 0 });
    expect(stats.classes[1]?.models[1]).toMatchObject({ mean: 0.25, usdPerUse: 2 });
    expect(repository.decisions).toHaveBeenCalledWith(12);
    await service.routerStats();
    expect(repository.decisions).toHaveBeenLastCalledWith(100);
    expect(await service.resetRouter({ taskClass: "", modelId: "a" })).toBe(2);
    expect(repository.reset).toHaveBeenCalledWith(null, "a");
    await service.resetRouter({});
    expect(repository.reset).toHaveBeenLastCalledWith(null, null);
  });
});
