import type { AgentEvent, AgentExecutionResult, ExecutionModel } from "../domain/AgentExecution.js";
import type { AgentTask, AgentTaskRepository } from "./AgentTaskRepository.js";

export type LaneTask = Omit<AgentTask, "projectId" | "turnId">;
export interface TaskLaneHooks<M extends ExecutionModel> {
  emit(event: AgentEvent): void;
  finishGate?: { check(): Promise<string | null> };
  onModel(model: M & { label: string }, reason: string): Promise<void>;
}
export interface TaskLanePorts<Input, M extends ExecutionModel, Task extends LaneTask> {
  repository: AgentTaskRepository;
  createGate(task: Task, input: Input): Promise<{ check(): Promise<string | null> } | undefined>;
  run(task: Task, input: Input, hooks: TaskLaneHooks<M>): Promise<AgentExecutionResult<M>>;
  recordResult?(result: AgentExecutionResult<M>): void;
  emit(event: AgentEvent): void;
}
