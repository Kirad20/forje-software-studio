import type { AgentExecutionResult } from "../domain/AgentExecution.js";
import type { AgentTask, AgentTaskRepository } from "../ports/AgentTaskRepository.js";

export class TaskLifecycleUseCase {
  constructor(private readonly repository: AgentTaskRepository) {}
  insert(scope: { projectId: string; turnId: string }, task: Omit<AgentTask, "projectId" | "turnId">): Promise<void> {
    return this.repository.insert({ ...task, ...scope, id: `${scope.turnId}:${task.id}` });
  }
  start(turnId: string, taskId: string, modelId: string): Promise<void> {
    return this.repository.start(`${turnId}:${taskId}`, modelId);
  }
  finish(turnId: string, taskId: string, result: Pick<AgentExecutionResult, "text" | "steps" | "usage" | "usd"> | Error): Promise<void> {
    const ok = !(result instanceof Error);
    return this.repository.finish(`${turnId}:${taskId}`, {
      status: ok ? "done" : "failed",
      summary: ok ? result.text.slice(0, 3000) : result.message,
      steps: ok ? result.steps : [],
      inputTokens: ok ? result.usage.input + result.usage.cacheWrite : 0,
      outputTokens: ok ? result.usage.output : 0,
      cacheReadTokens: ok ? result.usage.cacheRead : 0,
      usd: ok ? result.usd : 0,
    });
  }
}
