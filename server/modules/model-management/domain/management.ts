import type { Mode } from "./routing.js";
export interface ProjectModelPatch {
  mode?: string;
  concurrency?: number;
  enabled?: string[];
}
export interface RouterDecisionView {
  role: string; taskClass: string; modelId: string; reason: string; candidates: unknown; createdAt: unknown;
}
export interface ModelSpendView {
  model: string; role: string; calls: number; inputTokens: number; cachedTokens: number; outputTokens: number; usd: number;
}
export interface ProjectModelSettings {
  mode: Mode;
  concurrency: number;
}
