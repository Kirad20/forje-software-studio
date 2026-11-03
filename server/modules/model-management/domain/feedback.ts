export interface TurnModelDecision {
  taskClass: string;
  modelId: string;
}
export const feedbackModel = (modelId: string, tiers: ReadonlyMap<string, number>) =>
  ({ id: modelId, tier: tiers.get(modelId) ?? 3 });
