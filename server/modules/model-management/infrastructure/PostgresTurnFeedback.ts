import { q } from "../../../shared/database/index.js";
import type { TurnFeedbackRepository } from "../ports/TurnFeedbackPorts.js";
export const postgresTurnFeedback: TurnFeedbackRepository = {
  async decisions(projectId, turnId) {
    const rows = await q<{ task_class: string; model_id: string }>(
      turnId
        ? "select distinct task_class, model_id from router_decisions where project_id = $1 and turn_id = $2"
        : "select distinct task_class, model_id from router_decisions where project_id = $1 and created_at > now() - interval '10 minutes'",
      turnId ? [projectId, turnId] : [projectId],
    );
    return rows.map(row => ({ taskClass: row.task_class, modelId: row.model_id }));
  },
  async tiers() {
    return new Map((await q<{ id: string; tier: number }>("select id, tier from model_catalog")).map(row => [row.id, row.tier]));
  },
};
