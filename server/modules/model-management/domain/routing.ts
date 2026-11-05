import type { LlmResponse } from "./messages.js";
import type { ModelInfo } from "./models.js";
import type { Usage } from "./messages.js";
import type { FusionBudget, FusionEffort, FusionTrace } from "./fusion.js";

export type Role = "router" | "planner" | "data" | "backend" | "ui" | "qa" | "fast" | "chat" | "summarizer" | "app";
export type Mode = "standard" | "high" | "max";
export type Intent = "new_app" | "feature" | "fix" | "style" | "data" | "question";
export type Domain = "ui" | "data" | "auth" | "payments" | "email" | "jobs" | "integrations" | "ai" | "realtime" | "files";
export interface Features {
  intent: Intent;
  complexity: number;
  domains: Domain[];
  needsVision: boolean;
  targeted: boolean;
  source: "heuristic" | "llm";
}
export interface AnalysisContext {
  images: number;
  targeted: boolean;
  fileCount: number;
}
export interface PickInput {
  complexity: number;
  domains: Domain[] | string[];
  needsVision: boolean;
  needsTools?: boolean;
}
export interface Candidate {
  id: string;
  label: string;
  score: number;
  quality: number;
  usd: number;
  tier: number;
}
export interface Pick {
  model: ModelInfo;
  taskClass: string;
  reason: string;
  candidates: Candidate[];
}
export interface Billing {
  payerId: string;
  projectId: string | null;
  source: "builder" | "app" | "playground";
}
export interface DecisionLog {
  turnId?: string;
  taskId?: string;
  agentId?: string;
}
export interface CallOptions {
  billing?: Billing;
  pinned?: ModelInfo;
  exclude?: Set<string>;
  log?: DecisionLog;
  /** An explicit caller choice forces Single; pinned is only conversational affinity. */
  explicit?: ModelInfo;
  effort?: FusionEffort;
  budget?: Partial<FusionBudget>;
  onFusionStep?: (step: FusionTrace["steps"][number]) => void;
  affinityKey?: string;
  /** Tool-loop continuations keep the author; review at task/cache boundaries. */
  decisionBoundary?: boolean;
}
export interface CallResult {
  response: LlmResponse;
  model: ModelInfo;
  usd: number;
  credits: number;
  failed: string[];
  totalUsage?: Usage;
  fusion?: FusionTrace;
}
export class NoModelError extends Error {}
