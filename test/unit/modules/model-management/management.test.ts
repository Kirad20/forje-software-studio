import { describe, expect, it, vi } from "vitest";
import { createModelManagementQueries } from "../../../../server/modules/model-management/application/ModelManagementQueries.js";
import type { ModelScope } from "../../../../server/modules/model-management/domain/models.js";
const database = vi.hoisted(() => ({ q: vi.fn(async () => []), one: vi.fn() }));
vi.mock("../../../../server/shared/database/index.js", () => database);
import { postgresModelManagementRepository } from "../../../../server/modules/model-management/infrastructure/PostgresModelManagementRepository.js";
describe("model management queries", () => {
  const setup = () => {
    const repository = {
      projectSettings: vi.fn(async () => undefined), projectModels: vi.fn(async () => ["a"]),
      updateProjectSettings: vi.fn(async () => {}), decisions: vi.fn(async () => []), spend: vi.fn(async () => []),
    };
    const models = [{ id: "a", label: "A" }];
    const catalog = { allowedModels: vi.fn(async (_scope: ModelScope) => models as never),
      setProjectModels: vi.fn(async (_projectId: string, _models: string[]) => {}) };
    const posteriors = vi.fn(async () => new Map([["a", { alpha: 3, beta: 1, uses: 2 }]]));
    return { repository, catalog, service: createModelManagementQueries(repository, catalog, posteriors) };
  };
  it("returns project defaults and both account and effective model lists", async () => {
    const { service, catalog } = setup();
    expect(await service.projectModels("project", "owner")).toMatchObject({
      mode: "standard", concurrency: 3, restricted: true, accountAllowed: [{ id: "a" }], effective: [{ id: "a" }],
    });
    expect(catalog.allowedModels.mock.calls).toEqual([[{ accountId: "owner" }], [{ accountId: "owner", projectId: "project" }]]);
  });
  it("preserves mode validation, concurrency rounding/clamping and optional list updates", async () => {
    const { service, repository, catalog } = setup();
    await expect(service.updateProjectModels("project", { mode: "invalid" })).rejects.toThrow("Modo no válido");
    expect(repository.updateProjectSettings).not.toHaveBeenCalled();
    await service.updateProjectModels("project", { mode: "max", concurrency: 8.6, enabled: ["a"] });
    expect(repository.updateProjectSettings).toHaveBeenLastCalledWith("project", "max", 5);
    expect(catalog.setProjectModels).toHaveBeenCalledWith("project", ["a"]);
    await service.updateProjectModels("project", { concurrency: 0 });
    expect(repository.updateProjectSettings).toHaveBeenLastCalledWith("project", null, null);
  });
  it("returns router decisions, spend and the six unchanged learnt task classes", async () => {
    const { service, repository } = setup();
    const result = await service.routerAudit("project", "owner");
    expect(result.learnt.map(x => x.taskClass)).toEqual([
      "planner:mid:data", "data:mid:data", "backend:mid:data", "ui:mid:ui", "qa:mid:data", "fast:mid:data",
    ]);
    expect(result.learnt[0]?.models).toEqual([{ id: "a", label: "A", mean: 0.75, uses: 2 }]);
    expect(repository.decisions).toHaveBeenCalledWith("project");
    expect(repository.spend).toHaveBeenCalledWith("project");
  });
  it("keeps project setting updates and bounded builder-only audit SQL inside the adapter", async () => {
    await postgresModelManagementRepository.updateProjectSettings("project", "standard", 2);
    expect(database.q).toHaveBeenLastCalledWith(
      "update projects set model_mode = coalesce($2, model_mode), agent_concurrency = coalesce($3, agent_concurrency) where id = $1",
      ["project", "standard", 2],
    );
    await postgresModelManagementRepository.decisions("project");
    expect(database.q).toHaveBeenLastCalledWith(expect.stringContaining("order by id desc limit 40"), ["project"]);
    await postgresModelManagementRepository.spend("project");
    expect(database.q).toHaveBeenLastCalledWith(
      expect.stringContaining("source = 'builder' group by model, role order by sum(usd) desc"), ["project"],
    );
    database.one.mockResolvedValueOnce({ model_mode: "max", agent_concurrency: 4 });
    expect(await postgresModelManagementRepository.projectSettings("project")).toEqual({ mode: "max", concurrency: 4 });
  });
});
