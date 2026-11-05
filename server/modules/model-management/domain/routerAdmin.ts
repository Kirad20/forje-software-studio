import type { FusionEffort, FusionPattern, FusionStep } from "./fusion.js";

export interface RouterStats {
  classes: { taskClass: string; uses: number; models: {
    modelId: string; alpha: number; beta: number; mean: number; uses: number; usdPerUse: number;
  }[] }[];
  decisions: { id: number; at: string; projectId: string | null; projectName: string | null;
    role: string; taskClass: string; modelId: string; reason: string }[];
  fusionTraces: {
    operationId: string; effort: FusionEffort; pattern: FusionPattern; warnings: string[];
    steps: Omit<FusionStep, "error">[];
  }[];
}
export interface RouterPosteriorRow {
  taskClass: string; modelId: string; alpha: number; beta: number; uses: number; usd: number;
}
