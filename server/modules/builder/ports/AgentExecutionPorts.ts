import type { Block, ExecutionModel, Message, ToolDefinition, Usage } from "../domain/AgentExecution.js";

export interface AgentExecutionPorts<M extends ExecutionModel> {
  summarize?(transcript: string): Promise<{ text: string; usage: Usage; usd: number; credits: number }>;
  compactionFailed?(error: unknown): void;
  callModel(request: { messages: Message[]; tools?: ToolDefinition[]; pinned?: M }): Promise<{
    model: M;
    failed: string[];
    response: { content: Block[]; usage: Usage };
    usd: number;
    credits: number;
  }>;
  save(projectId: string, message: Message, turnId: string): Promise<void>;
  countAction(accountId: string): Promise<void>;
  newRunId(): string;
  now(): number;
  recordStep(record: {
    runId: string; projectId: string; turnId: string; taskId?: string; role: string;
    step: number; modelId: string; usage: Usage; ms: number; usd: number;
  }): void;
  recordToolCall(record: {
    runId: string; projectId: string; source: "builder"; role: string; step: number;
    tool: string; inputChars: number; resultChars: number; ok: boolean; ms: number;
  }): void;
}
