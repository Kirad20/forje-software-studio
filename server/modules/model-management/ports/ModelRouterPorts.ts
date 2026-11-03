import type { Posterior } from "../domain/bandit.js";
import type { LlmRequest, LlmResponse, Usage } from "../domain/messages.js";
import type { ModelInfo, ModelScope } from "../domain/models.js";
import type { Billing, DecisionLog, Mode, Pick, Role } from "../domain/routing.js";

export interface ModelRouterPorts {
  allowedModels(scope: ModelScope): Promise<ModelInfo[]>;
  projectMode(projectId?: string | null): Promise<Mode>;
  posteriors(taskClass: string, models: { id: string; tier: number }[]): Promise<Map<string, Posterior>>;
  recordOutcome(taskClass: string, model: { id: string; tier: number }, reward: number, usd?: number, weight?: number): Promise<void>;
  invoke(model: ModelInfo, request: LlmRequest): Promise<LlmResponse>;
  charge(billing: Billing, role: Role, model: ModelInfo, usage: Usage): Promise<{ usd: number; credits: number }>;
  logDecision(projectId: string | null, role: Role, pick: Pick, log?: DecisionLog): Promise<void>;
  requestKey(value: string): string;
}
