import { meanOf } from "../domain/bandit.js";
import type { RouterStats } from "../domain/routerAdmin.js";
import type { RouterAdministrationRepository } from "../ports/RouterAdministrationRepository.js";
export function createRouterAdministration(repository: RouterAdministrationRepository) {
  async function routerStats(limit = 100): Promise<RouterStats> {
    const byClass = new Map<string, RouterStats["classes"][number]>();
    for (const row of await repository.stats()) {
      const group = byClass.get(row.taskClass) ?? { taskClass: row.taskClass, uses: 0, models: [] };
      group.uses += row.uses;
      group.models.push({ modelId: row.modelId, alpha: row.alpha, beta: row.beta, mean: meanOf(row),
        uses: row.uses, usdPerUse: row.uses ? row.usd / row.uses : 0 });
      byClass.set(row.taskClass, group);
    }
    for (const group of byClass.values()) group.models.sort((a, b) => b.mean - a.mean);
    return { classes: [...byClass.values()].sort((a, b) => b.uses - a.uses), decisions: await repository.decisions(limit) };
  }
  const resetRouter = (filter: { taskClass?: string; modelId?: string }) =>
    repository.reset(filter.taskClass || null, filter.modelId || null);
  return { routerStats, resetRouter };
}
