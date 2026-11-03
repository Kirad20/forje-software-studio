import { q } from "../../../shared/database/index.js";
import type { RouterPosteriorRow, RouterStats } from "../domain/routerAdmin.js";
import type { RouterAdministrationRepository } from "../ports/RouterAdministrationRepository.js";
export const postgresRouterAdministrationRepository: RouterAdministrationRepository = {
  stats: () => q<RouterPosteriorRow>(
    `select task_class as "taskClass", model_id as "modelId", alpha, beta, uses, usd from router_stats order by task_class, model_id`,
  ),
  decisions: limit => q<RouterStats["decisions"][number]>(
    `select d.id, d.created_at as at, d.project_id as "projectId", p.name as "projectName", d.role, d.task_class as "taskClass", d.model_id as "modelId", d.reason
     from router_decisions d left join projects p on p.id = d.project_id order by d.id desc limit $1`, [limit],
  ),
  async reset(taskClass, modelId) {
    return (await q(
      `delete from router_stats where ($1::text is null or task_class = $1) and ($2::text is null or model_id = $2) returning 1`,
      [taskClass, modelId],
    )).length;
  },
};
