import { q } from "../../../shared/database/index.js";
import type { AgentTask, AgentTaskRepository, TaskCompletion } from "../ports/AgentTaskRepository.js";
import type { AgentTaskQueries, AgentTaskView } from "../ports/AgentTaskQueries.js";

export class SqlAgentTaskRepository implements AgentTaskRepository, AgentTaskQueries {
  async list(projectId: string): Promise<AgentTaskView[]> {
    return q<AgentTaskView>(
      `select id, turn_id as "turnId", role, goal, model_id as "modelId", model_id as model, status, summary,
       steps, files, depends_on as "dependsOn", done_when as "doneWhen", input_tokens as "inputTokens",
       output_tokens as "outputTokens", cache_read_tokens as "cacheReadTokens", usd,
       started_at as "startedAt", finished_at as "finishedAt"
       from agent_tasks where project_id = $1 order by created_at desc limit 300`,
      [projectId],
    );
  }
  async insert(task: AgentTask): Promise<void> {
    await q(`insert into agent_tasks (id, project_id, turn_id, role, goal, files, depends_on, done_when) values ($1, $2, $3, $4, $5, $6, $7, $8)`, [
      task.id, task.projectId, task.turnId, task.role, task.goal, JSON.stringify(task.files), JSON.stringify(task.dependsOn), JSON.stringify(task.doneWhen ?? []),
    ]);
  }
  async start(id: string, modelId: string): Promise<void> {
    await q(`update agent_tasks set model_id = $2, status = 'running', started_at = coalesce(started_at, now()) where id = $1`, [id, modelId]);
  }
  async finish(id: string, completion: TaskCompletion): Promise<void> {
    await q(
      `update agent_tasks set status = $2, summary = $3, steps = $4, input_tokens = $5, output_tokens = $6, cache_read_tokens = $7, usd = $8, finished_at = now()
       where id = $1`,
      [id, completion.status, completion.summary, JSON.stringify(completion.steps), completion.inputTokens, completion.outputTokens, completion.cacheReadTokens, completion.usd],
    );
  }
}
