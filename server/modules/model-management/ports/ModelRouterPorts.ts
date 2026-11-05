import type { Posterior } from "../domain/bandit.js";
import type { LlmRequest, LlmResponse, Usage } from "../domain/messages.js";
import type { ModelInfo, ModelScope } from "../domain/models.js";
import type { Billing, DecisionLog, Mode, Pick, Role } from "../domain/routing.js";
import type { FusionBudget, FusionEffort, FusionStep, FusionTrace } from "../domain/fusion.js";

export interface ModelRouterPorts {
  allowedModels(scope: ModelScope): Promise<ModelInfo[]>;
  projectMode(projectId?: string | null): Promise<Mode>;
  posteriors(taskClass: string, models: { id: string; tier: number }[]): Promise<Map<string, Posterior>>;
  recordOutcome(taskClass: string, model: { id: string; tier: number }, reward: number, usd?: number, weight?: number): Promise<void>;
  invoke(model: ModelInfo, request: LlmRequest): Promise<LlmResponse>;
  charge(billing: Billing, role: Role, model: ModelInfo, usage: Usage): Promise<{ usd: number; credits: number }>;
  logDecision(projectId: string | null, role: Role, pick: Pick, log?: DecisionLog): Promise<void>;
  requestKey(value: string): string;
  fusionBudget?(effort: FusionEffort): FusionBudget;
  nextOperationId?(): string;
  /** Physical calls are registered exactly once, including discarded drafts. */
  recordFusionStep?(scope: ModelScope, role: Role, operationId: string, step: FusionStep, billing?: Billing): Promise<{ credits: number }>;
  recordFusionTrace?(scope: ModelScope, role: Role, trace: FusionTrace, log?: DecisionLog): Promise<void>;
  modelHealth?(modelId: string, provider: string): Promise<{ available: boolean; latencyMs?: number; successRate?: number }>;
  recordModelHealth?(modelId: string, provider: string, ms: number, error?: { message: string; status?: number }): Promise<void>;
  validateToolInput?(input: unknown, schema: Record<string, unknown>): boolean;
}
