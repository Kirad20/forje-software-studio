import { feedbackModel } from "../domain/feedback.js";
import type { TurnFeedbackPorts } from "../ports/TurnFeedbackPorts.js";
export function createTurnFeedback(ports: TurnFeedbackPorts) {
  async function penalizeTurn(projectId: string, turnId: string | null, weight: number) {
    const decisions = await ports.decisions(projectId, turnId);
    const tiers = await ports.tiers();
    for (const decision of decisions) {
      await ports.recordOutcome(decision.taskClass, feedbackModel(decision.modelId, tiers), 0, 0, weight);
    }
  }
  return { penalizeTurn };
}
