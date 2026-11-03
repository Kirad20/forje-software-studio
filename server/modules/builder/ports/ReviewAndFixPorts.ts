import type { Cancellation } from "../domain/BuilderWorkflow.js";
import type { PlanTask, Review } from "../domain/OrchestrationPolicy.js";

export interface FixResult<Result> {
  task: PlanTask;
  result: Result | Error;
}
export interface ReviewAndFixPorts<Result> {
  signal: Cancellation;
  review(round: number, fixes: FixResult<Result>[]): Promise<Review | null>;
  emitReview(review: Review): void;
  fix(tasks: PlanTask[]): Promise<Map<string, Result | Error>>;
}
