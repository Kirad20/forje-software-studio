export type ChatMode = "build" | "chat" | "plan";
export interface Cancellation {
  readonly aborted: boolean;
}
export interface BuilderRequestFeatures {
  intent: string;
  complexity: number;
  domains: string[];
  targeted: boolean;
}
export const useFastPath = (features: BuilderRequestFeatures): boolean =>
  features.intent === "question" || features.intent === "style" || features.targeted || features.complexity <= 2 ||
  (features.domains.length <= 1 && features.complexity <= 3 && features.intent !== "new_app");
export const requiresFinishGate = (role: string): boolean => ["fast", "data", "backend", "ui"].includes(role);
export function assertRunning(signal: Cancellation): void {
  if (signal.aborted) throw new Error("Detenido.");
}
