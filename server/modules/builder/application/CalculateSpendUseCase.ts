import { ExecutionMetrics } from "../domain/ExecutionMetrics.js";

export class CalculateSpendUseCase {
  execute(metricsList: ExecutionMetrics[]): ExecutionMetrics {
    const aggregate = new ExecutionMetrics();
    for (const m of metricsList) {
      aggregate.add(m);
    }
    return aggregate;
  }
}
