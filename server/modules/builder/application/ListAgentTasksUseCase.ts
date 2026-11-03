import type { AgentTaskQueries, AgentTaskView } from "../ports/AgentTaskQueries.js";

export class ListAgentTasksUseCase {
  constructor(
    private readonly repository: AgentTaskQueries,
    private readonly models: () => Promise<{ id: string; label: string }[]>,
  ) {}

  async execute(projectId: string): Promise<AgentTaskView[]> {
    const tasks = await this.repository.list(projectId);
    const labels = new Map((await this.models()).map((model) => [model.id, model.label]));
    return tasks.map((task) => ({
      ...task, model: task.modelId ? labels.get(task.modelId) ?? task.modelId : null,
    }));
  }
}
