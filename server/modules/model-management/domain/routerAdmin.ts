export interface RouterStats {
  classes: { taskClass: string; uses: number; models: {
    modelId: string; alpha: number; beta: number; mean: number; uses: number; usdPerUse: number;
  }[] }[];
  decisions: { id: number; at: string; projectId: string | null; projectName: string | null;
    role: string; taskClass: string; modelId: string; reason: string }[];
}
export interface RouterPosteriorRow {
  taskClass: string; modelId: string; alpha: number; beta: number; uses: number; usd: number;
}
