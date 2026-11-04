export interface AgentTask {
  id: string;
  projectId: string;
  turnId: string;
  role: string;
  goal: string;
  files: string[];
  dependsOn: string[];
  doneWhen?: string[];
}
export interface TaskCompletion {
  status: "done" | "failed";
  summary: string;
  steps: { tool: string; summary: string; ok: boolean; output?: string }[];
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  usd: number;
}
export interface AgentTaskRepository {
  insert(task: AgentTask): Promise<void>;
  start(id: string, modelId: string): Promise<void>;
  finish(id: string, completion: TaskCompletion): Promise<void>;
}
