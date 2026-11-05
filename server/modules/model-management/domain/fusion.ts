import type { Usage } from "./messages.js";

export type FusionEffort = "standard" | "high" | "max" | "fast";
export type FusionPattern = "single" | "cascade" | "critique";
export type FusionPhase = "draft" | "judge" | "critic" | "revision" | "escalation";
export interface FusionBudget {
  maxCalls: number;
  timeoutMs: number;
  maxUsd: number;
}
export const FUSION_BUDGETS: Record<FusionEffort, FusionBudget> = {
  fast: { maxCalls: 2, timeoutMs: 45_000, maxUsd: 0.05 },
  standard: { maxCalls: 4, timeoutMs: 60_000, maxUsd: 0.10 },
  high: { maxCalls: 6, timeoutMs: 120_000, maxUsd: 0.50 },
  max: { maxCalls: 8, timeoutMs: 180_000, maxUsd: 1 },
};
export interface FusionStep {
  id: string;
  phase: FusionPhase;
  modelId: string;
  servedBy?: string;
  effort: "low" | "medium" | "high";
  ms: number;
  usage: Usage;
  usd: number;
  credits: number;
  error?: string;
  context?: ExecutionContextMetrics;
  stopReason?: "tool_use" | "end" | "max_tokens" | "refusal";
  retryOf?: string;
}

/** Metadata only: estimates are not provider usage and contain no request content. */
export interface ExecutionContextMetrics {
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
  imageTokens?: number;
  imageBytes?: number;
  toolCalls: number;
  toolResults: number;
  toolResultBytes: number;
  fileReadCalls: number;
  requestedFileCount: number;
  fileToolResultBytes: number;
}
export interface FusionTrace {
  operationId: string;
  effort: FusionEffort;
  pattern: FusionPattern;
  warnings: string[];
  steps: FusionStep[];
  status?: "running" | "completed" | "failed" | "cancelled";
  finalModelId?: string;
}
export interface FusionCapability {
  reasoning: number;
  coding: number;
  debugging: number;
  toolUse: number;
  confidence: number;
  source: "declared" | "evaluation" | "classification";
}

export function isFusionCapability(value: unknown): value is FusionCapability {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const profile = value as Record<string, unknown>;
  return ["reasoning", "coding", "debugging", "toolUse"].every(key =>
    typeof profile[key] === "number" && Number.isFinite(profile[key]) && profile[key] >= 1 && profile[key] <= 5)
    && typeof profile.confidence === "number" && Number.isFinite(profile.confidence)
    && profile.confidence >= 0 && profile.confidence <= 1
    && ["declared", "evaluation", "classification"].includes(String(profile.source));
}
