export interface AgentTaskView {
  id: string;
  turnId: string;
  role: string;
  goal: string;
  modelId: string | null;
  model: string | null;
  status: "pending" | "running" | "done" | "failed";
  summary: string | null;
  steps: { tool: string; summary: string; ok: boolean; output?: string }[];
  files: string[];
  dependsOn: string[];
  doneWhen: string[];
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  usd: number;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface AgentTaskQueries {
  list(projectId: string): Promise<AgentTaskView[]>;
}
