import { one, q } from "../../../shared/database/index.js";
import type { Mode } from "../domain/routing.js";
import type { ModelSpendView, RouterDecisionView } from "../domain/management.js";
import type { ModelManagementRepository } from "../ports/ModelManagementRepository.js";
export const postgresModelManagementRepository: ModelManagementRepository = {
  async projectSettings(projectId) {
    const row = await one<{ model_mode: Mode; agent_concurrency: number }>(
      "select model_mode, agent_concurrency from projects where id = $1", [projectId],
    );
    return row ? { mode: row.model_mode, concurrency: row.agent_concurrency } : undefined;
  },
  async projectModels(projectId) {
    return (await q<{ model_id: string }>("select model_id from project_models where project_id = $1", [projectId])).map(r => r.model_id);
  },
  async updateProjectSettings(projectId, mode, concurrency) {
    await q("update projects set model_mode = coalesce($2, model_mode), agent_concurrency = coalesce($3, agent_concurrency) where id = $1",
      [projectId, mode, concurrency]);
  },
  decisions: projectId => q<RouterDecisionView>(
    `select role, task_class as "taskClass", model_id as "modelId", reason, candidates, created_at as "createdAt"
     from router_decisions where project_id = $1 order by id desc limit 40`, [projectId],
  ),
  spend: projectId => q<ModelSpendView>(
    `select model, role, count(*)::int as calls, sum(input_tokens + cache_write_tokens)::int as "inputTokens", sum(cache_read_tokens)::int as "cachedTokens",
       sum(output_tokens)::int as "outputTokens", round(sum(usd)::numeric, 4)::float as usd
     from ai_usage where project_id = $1 and source = 'builder' group by model, role order by sum(usd) desc`, [projectId],
  ),
};
