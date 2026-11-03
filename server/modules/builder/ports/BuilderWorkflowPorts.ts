import type { Cancellation } from "../domain/BuilderWorkflow.js";

export interface BuilderWorkflowPorts<Features, ApprovedPlan> {
  signal: Cancellation;
  credits(): Promise<number>;
  prepare(): Promise<void>;
  analyze(): Promise<Features>;
  pendingPlan(): Promise<ApprovedPlan | null>;
  route(fast: boolean, features: Features): void;
  chat(): Promise<void>;
  team(options: { given?: ApprovedPlan; planOnly?: boolean }): Promise<boolean>;
  consumePlan(): Promise<void>;
  fast(): Promise<void>;
  fallback(): void;
  done(): Promise<void>;
  error(error: Error, cancelled: boolean): Promise<void>;
  cleanup(): Promise<void>;
  wrote(): boolean;
  checkpoint(): Promise<void>;
  releaseSync(): void;
  updateSummary(): void;
}
