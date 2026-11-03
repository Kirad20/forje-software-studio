import { meanOf } from "../domain/bandit.js";
import { ModelError } from "../domain/models.js";
import type { ProjectModelPatch } from "../domain/management.js";
import type { Role } from "../domain/routing.js";
import type { ModelManagementRepository } from "../ports/ModelManagementRepository.js";
import type { ModelRouterPorts } from "../ports/ModelRouterPorts.js";
import type { createCatalogService } from "./CatalogService.js";
import { taskClassOf } from "./ModelRouter.js";

type Catalog = Pick<ReturnType<typeof createCatalogService>, "allowedModels" | "setProjectModels">;
export function createModelManagementQueries(repository: ModelManagementRepository, catalog: Catalog, posteriors: ModelRouterPorts["posteriors"]) {
  async function projectModels(projectId: string, accountId: string) {
    const settings = await repository.projectSettings(projectId);
    const accountAllowed = await catalog.allowedModels({ accountId });
    const projectList = await repository.projectModels(projectId);
    const effective = await catalog.allowedModels({ accountId, projectId });
    return { mode: settings?.mode ?? "balanced", concurrency: settings?.concurrency ?? 3,
      restricted: projectList.length > 0, accountAllowed, effective };
  }
  async function updateProjectModels(projectId: string, patch: ProjectModelPatch) {
    const { mode, concurrency, enabled } = patch;
    if (mode && !["saving", "balanced", "quality"].includes(mode)) throw new ModelError("Modo no válido");
    await repository.updateProjectSettings(projectId, mode ?? null,
      concurrency ? Math.min(5, Math.max(1, Math.round(concurrency))) : null);
    if (Array.isArray(enabled)) await catalog.setProjectModels(projectId, enabled.map(String));
  }
  async function routerAudit(projectId: string, accountId: string) {
    const decisions = await repository.decisions(projectId);
    const models = await catalog.allowedModels({ accountId, projectId });
    const roles: Role[] = ["planner", "data", "backend", "ui", "qa", "fast"];
    const learnt = [];
    for (const role of roles) {
      const taskClass = taskClassOf(role, { complexity: 3, domains: [role === "ui" ? "ui" : "data"], needsVision: false });
      const post = await posteriors(taskClass, models);
      learnt.push({ role, taskClass, models: models.map(m => ({
        id: m.id, label: m.label, mean: meanOf(post.get(m.id)!), uses: post.get(m.id)!.uses,
      })).sort((a, b) => b.mean - a.mean).slice(0, 5) });
    }
    return { decisions, learnt, spend: await repository.spend(projectId) };
  }
  return { projectModels, updateProjectModels, routerAudit };
}
