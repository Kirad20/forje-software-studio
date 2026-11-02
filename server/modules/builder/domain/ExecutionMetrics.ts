export interface ExecutionMetricsProps {
  inputTokens?: number;
  outputTokens?: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  costUsd?: number;
  durationMs?: number;
}

export class ExecutionMetrics {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  costUsd: number;
  durationMs: number;

  constructor(props: ExecutionMetricsProps = {}) {
    this.inputTokens = props.inputTokens ?? 0;
    this.outputTokens = props.outputTokens ?? 0;
    this.cacheReadTokens = props.cacheReadTokens ?? 0;
    this.cacheWriteTokens = props.cacheWriteTokens ?? 0;
    this.costUsd = props.costUsd ?? 0;
    this.durationMs = props.durationMs ?? 0;
  }

  get totalTokens(): number {
    return this.inputTokens + this.outputTokens;
  }

  hasCacheSavings(): boolean {
    return this.cacheReadTokens > 0;
  }

  add(other: ExecutionMetricsProps): void {
    this.inputTokens += other.inputTokens ?? 0;
    this.outputTokens += other.outputTokens ?? 0;
    this.cacheReadTokens += other.cacheReadTokens ?? 0;
    this.cacheWriteTokens += other.cacheWriteTokens ?? 0;
    this.costUsd += other.costUsd ?? 0;
    this.durationMs += other.durationMs ?? 0;
  }
}
