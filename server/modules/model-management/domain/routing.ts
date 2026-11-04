import type { LlmResponse } from "./messages.js";
import type { ModelInfo } from "./models.js";

export type Role = "router" | "planner" | "data" | "backend" | "ui" | "qa" | "fast" | "chat" | "summarizer" | "app";
export type Mode = "saving" | "balanced" | "quality";
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
}
export interface CallOptions {
  billing?: Billing;
  pinned?: ModelInfo;
  exclude?: Set<string>;
  log?: DecisionLog;
}
export interface CallResult {
  response: LlmResponse;
  model: ModelInfo;
  usd: number;
  credits: number;
  failed: string[];
}
export class NoModelError extends Error {}
