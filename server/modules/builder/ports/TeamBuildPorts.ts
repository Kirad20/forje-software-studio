import type { Cancellation } from "../domain/BuilderWorkflow.js";
import type { Plan, Review } from "../domain/OrchestrationPolicy.js";
import type { FixResult } from "./ReviewAndFixPorts.js";

export interface TeamReviewOutcome<Result> {
  review: Review | null;
  fixes: FixResult<Result>[];
}
export interface TeamBuildPorts<Result> {
  signal: Cancellation;
  plan(readOnly: boolean): Promise<Plan | null>;
  announce(plan: Plan, approved: boolean): void;
  storePlan(plan: Plan): Promise<void>;
  writeContract(plan: Plan): Promise<void>;
  specialists(plan: Plan): Promise<Map<string, Result | Error>>;
  review(plan: Plan, results: Map<string, Result | Error>): Promise<TeamReviewOutcome<Result>>;
  learn(plan: Plan, results: Map<string, Result | Error>, outcome: TeamReviewOutcome<Result>): Promise<void>;
  reply(plan: Plan, results: Map<string, Result | Error>, outcome: TeamReviewOutcome<Result>): Promise<void>;
}
