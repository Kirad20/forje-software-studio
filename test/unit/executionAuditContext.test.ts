import { describe, expect, it } from "vitest";
import { contextChange, type AuditStep } from "../../studio/src/features/administration/application/audit.js";

const previous = {
  turnId: "turn", projectId: "project", taskId: "task", agentId: "agent", role: "frontend", phase: "draft",
  context: { estimatedInputTokens: 100, systemTokens: 10, historyTokens: 70, toolSchemaTokens: 20,
    historyBytes: 280, toolResultBytes: 80, images: 1 },
} as AuditStep;

describe("audit context snapshot comparisons", () => {
  it("compares only recorded snapshots within the same execution context", () => {
    const current = { ...previous, context: { ...previous.context!, estimatedInputTokens: 140, historyTokens: 110, historyBytes: 420, toolResultBytes: 180 } };
    expect(contextChange(current, previous)).toEqual({
      estimatedTokens: 40, systemTokens: 0, historyTokens: 40, toolSchemaTokens: 0,
      historyBytes: 140, toolResultBytes: 100, images: 0,
    });
    expect(contextChange({ ...current, context: null }, previous)).toBeNull();
    expect(contextChange(current)).toBeNull();
    for (const override of [
      { turnId: "other" }, { turnId: null }, { projectId: "other" }, { phase: "judge" },
      { agentId: "other" }, { role: "summarizer" }, { taskId: "other" },
    ]) expect(contextChange({ ...current, ...override }, previous)).toBeNull();
  });
});
