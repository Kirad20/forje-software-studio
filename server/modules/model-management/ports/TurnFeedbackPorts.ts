import type { TurnModelDecision } from "../domain/feedback.js";
import type { ModelRouterPorts } from "./ModelRouterPorts.js";
export interface TurnFeedbackRepository {
  decisions(projectId: string, turnId: string | null): Promise<TurnModelDecision[]>;
  tiers(): Promise<Map<string, number>>;
}
export interface TurnFeedbackPorts extends TurnFeedbackRepository {
  recordOutcome: ModelRouterPorts["recordOutcome"];
}
