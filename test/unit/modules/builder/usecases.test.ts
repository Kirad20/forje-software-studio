import { describe, it, expect, vi, beforeEach } from "vitest";
import { CalculateSpendUseCase } from "../../../../server/modules/builder/application/CalculateSpendUseCase.js";
import { ExecutionMetrics } from "../../../../server/modules/builder/domain/ExecutionMetrics.js";

describe("CalculateSpendUseCase (TDD)", () => {
  it("calculates total spend across multiple agent execution steps", () => {
    const useCase = new CalculateSpendUseCase();
    const steps = [
      new ExecutionMetrics({ costUsd: 0.002, inputTokens: 100, outputTokens: 50 }),
      new ExecutionMetrics({ costUsd: 0.003, inputTokens: 200, outputTokens: 80 }),
    ];

    const aggregate = useCase.execute(steps);
    expect(aggregate.costUsd).toBeCloseTo(0.005);
    expect(aggregate.totalTokens).toBe(430);
  });
});
