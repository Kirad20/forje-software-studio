import type { Block, BuilderFusionStep, BuilderFusionTrace, ContextAuditEvent, ExecutionModel, Message, ToolDefinition, Usage } from "../domain/AgentExecution.js";

export interface AgentExecutionPorts<M extends ExecutionModel> {
  recordContextEvent?(event: ContextAuditEvent): void;
  summarize?(transcript: string, context: { agentId: string }): Promise<{ text: string; usage: Usage; usd: number; credits: number }>;
  compactionFailed?(error: unknown): void;
  callModel(request: { messages: Message[]; tools?: ToolDefinition[]; pinned?: M; affinityKey: string; agentId: string; decisionBoundary: boolean; onFusionStep(step: BuilderFusionStep): void }): Promise<{
    model: M;
    failed: string[];
    response: { content: Block[]; usage: Usage };
    usd: number;
    credits: number;
    totalUsage?: Usage;
    fusion?: BuilderFusionTrace;
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
