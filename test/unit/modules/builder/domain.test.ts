import { describe, it, expect } from "vitest";
import { AgentRole } from "../../../../server/modules/builder/domain/AgentRole.js";
import { ExecutionMetrics } from "../../../../server/modules/builder/domain/ExecutionMetrics.js";

describe("Builder Domain (DDD & TDD)", () => {
  describe("AgentRole Value Object", () => {
    it("recognizes valid specialized builder roles", () => {
      const dataRole = new AgentRole("data");
      expect(dataRole.name).toBe("data");
      expect(dataRole.isSpecialist()).toBe(true);

      const uiRole = new AgentRole("ui");
      expect(uiRole.name).toBe("ui");
      expect(uiRole.isSpecialist()).toBe(true);

      const backendRole = new AgentRole("backend");
      expect(backendRole.name).toBe("backend");
      expect(backendRole.isSpecialist()).toBe(true);
    });

    it("recognizes coordinator and fast roles", () => {
      const planner = new AgentRole("planner");
      expect(planner.isSpecialist()).toBe(false);

      const fast = new AgentRole("fast");
      expect(fast.isSpecialist()).toBe(false);
    });

    it("rejects unknown agent roles", () => {
      expect(() => new AgentRole("non_existent_role" as any)).toThrow("Rol de agente no válido");
    });
  });

  describe("ExecutionMetrics Entity", () => {
    it("accumulates tokens, latency and cost accurately", () => {
      const metrics = new ExecutionMetrics({
        inputTokens: 1000,
        outputTokens: 250,
        cacheReadTokens: 500,
        cacheWriteTokens: 100,
        costUsd: 0.005,
        durationMs: 1200,
      });

      expect(metrics.totalTokens).toBe(1250);
      expect(metrics.costUsd).toBe(0.005);
      expect(metrics.hasCacheSavings()).toBe(true);

      metrics.add({
        inputTokens: 500,
        outputTokens: 100,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        costUsd: 0.002,
        durationMs: 800,
      });

      expect(metrics.totalTokens).toBe(1850);
      expect(metrics.costUsd).toBeCloseTo(0.007);
      expect(metrics.durationMs).toBe(2000);
    });
  });
});
