import { createModelRouter } from "./application/ModelRouter.js";
import { routingPorts } from "./infrastructure/routing.js";
import { createTurnFeedback } from "./application/TurnFeedback.js";
import { postgresTurnFeedback } from "./infrastructure/PostgresTurnFeedback.js";
export { createModelRouter, ROLES, maxTokensFor, analyzeHeuristic, useFastPath, taskClassOf } from "./application/ModelRouter.js";
export * from "./domain/routing.js";
export type { ModelRouterPorts } from "./ports/ModelRouterPorts.js";

export const createPlatformModelRouter = () => createModelRouter(routingPorts);
let platform: ReturnType<typeof createModelRouter> | undefined;
const router = () => platform ??= createPlatformModelRouter();
export function bindModelRouter(service: ReturnType<typeof createModelRouter>) {
  platform = service;
  return () => { if (platform === service) platform = undefined; };
}
export const analyzeRequest: ReturnType<typeof createModelRouter>["analyzeRequest"] = (...args) => router().analyzeRequest(...args);
export const pick: ReturnType<typeof createModelRouter>["pick"] = (...args) => router().pick(...args);
export const callModel: ReturnType<typeof createModelRouter>["callModel"] = (...args) => router().callModel(...args);
export const invoke = routingPorts.invoke;
export const charge = routingPorts.charge;
export const logDecision = routingPorts.logDecision;
export const recordOutcome = routingPorts.recordOutcome;
export { createTurnFeedback } from "./application/TurnFeedback.js";
export type { TurnFeedbackPorts, TurnFeedbackRepository } from "./ports/TurnFeedbackPorts.js";
export function penalizeTurn(projectId: string, turnId: string | null, weight: number): Promise<void> {
  return createTurnFeedback({ ...postgresTurnFeedback, recordOutcome: router().recordOutcome }).penalizeTurn(projectId, turnId, weight);
}
