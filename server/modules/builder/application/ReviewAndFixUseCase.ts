import { assertRunning } from "../domain/BuilderWorkflow.js";
import { reviewFixTasks, type PlanTask, type Review } from "../domain/OrchestrationPolicy.js";
import type { FixResult, ReviewAndFixPorts } from "../ports/ReviewAndFixPorts.js";

export class ReviewAndFixUseCase<Result> {
  constructor(private readonly ports: ReviewAndFixPorts<Result>) {}
  async execute(tasks: PlanTask[]): Promise<{ review: Review | null; fixes: FixResult<Result>[] }> {
    const fixes: FixResult<Result>[] = [];
    let review: Review | null = null;
    for (let round = 1; round <= 3; round++) {
      assertRunning(this.ports.signal);
      review = await this.ports.review(round, fixes);
      if (review) this.ports.emitReview(review);
      if (!review || review.ok || !review.issues.length || round === 3) break;
      assertRunning(this.ports.signal);
      const fixTasks = reviewFixTasks(tasks, review, round);
      const results = await this.ports.fix(fixTasks);
      for (const task of fixTasks) {
        const result = results.get(task.id);
        if (result === undefined) throw new Error(`Missing fix result: ${task.id}`);
        fixes.push({ task, result });
      }
    }
    return { review, fixes };
  }
}
