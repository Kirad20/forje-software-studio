export interface AuditFilter {
  projectId?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface AuditWindow {
  projectId?: string;
  from: string;
  to: string;
  limit: number;
  offset: number;
}

export interface ContextEvent {
  projectId: string;
  taskId?: string;
  turnId?: string;
  traceId?: string;
  agentId?: string;
  kind: "file_read" | "compaction";
  measured: boolean;
  beforeTokens?: number;
  afterTokens?: number;
  bytes?: number;
  count?: number;
  timestamp?: string;
}

export interface AuditContext {
  estimatedInputTokens: number;
  systemTokens: number;
  historyTokens: number;
  toolSchemaTokens: number;
  framingTokens: number;
  systemBytes: number;
  historyBytes: number;
  toolSchemaBytes: number;
  messages: number;
  images: number;
  toolCalls: number;
  toolResults: number;
  toolResultBytes: number;
  fileReadCalls: number;
  requestedFileCount: number;
  fileToolResultBytes: number;
  imageTokens?: number;
  imageBytes?: number;
}

export interface AuditStep {
  id: string;
  traceId: string;
  projectId: string | null;
  taskId: string | null;
  turnId: string | null;
  agentId: string | null;
  role: string;
  pattern: string | null;
  status: string | null;
  finalModelId: string | null;
  phase: string;
  stopReason: string | null;
  retryOf: string | null;
  requestedModel: string;
  servedModel: string | null;
  provider: string;
  effort: string;
  at: string;
  ms: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  usd: number;
  credits: number;
  failed: boolean;
  context: AuditContext | null;
}

export interface AuditStage {
  requestedModel: string;
  servedModel: string | null;
  provider: string;
  phase: string;
  calls: number;
  failures: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  usd: number;
  credits: number;
}

export interface AuditReport {
  window: AuditWindow;
  summary: {
    calls: number; inputTokens: number; outputTokens: number; cacheReadTokens: number;
    cacheWriteTokens: number; usd: number; credits: number;
    fusionCalls: number; legacyCalls: number; contextRecordedCalls: number;
    turns: number; tasks: number; traces: number; failedCalls: number;
    additionalCalls: number; retries: number; modelSwitches: number; degradations: number;
    fileReadEvents: number; fileReadBytes: number; requestedFiles: number;
    compactions: number; estimatedCompactionDelta: number;
    fileReadBytesRecordedEvents: number; fileReadCountRecordedEvents: number; compactionDeltaRecordedEvents: number;
  };
  stages: AuditStage[];
  timeline: AuditStep[];
  events: (ContextEvent & { id: number; timestamp: string })[];
  activity: { id: number; key: string; actorId: string | null; action: string; at: string }[];
  pagination: { timelineHasMore: boolean; eventsHasMore: boolean; activityHasMore: boolean; stagesHasMore: boolean };
  evidence: {
    usage: string; context: string; images: string; attribution: string;
    retries: string; legacy: string; activity: string;
  };
}
