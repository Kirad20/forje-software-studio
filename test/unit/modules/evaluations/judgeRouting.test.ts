import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ModelInfo } from "../../../../server/modules/model-management/domain/models.js";
import { emptyUsage } from "../../../../server/modules/model-management/domain/messages.js";
import { judgeDesign } from "../../../../server/modules/evaluations/infrastructure/judge.js";

const { callModel } = vi.hoisted(() => ({ callModel: vi.fn() }));
vi.mock("../../../../server/modules/model-management/router.js", () => ({ callModel }));
const model: ModelInfo = {
  id: "vision", model: "vision", provider: "test", label: "Vision", tier: 4, speed: 4, tools: false,
  vision: true, context: 128000, inPrice: 1, outPrice: 1, cacheReadPrice: 0, source: "custom",
};
const input = { prompt: "A cafe", text: "Cafe", shots: [{ label: "desktop", media_type: "image/png", data: "aGVsbG8=" }] };
const scope = { accountId: "admin" };
const billing = { payerId: "evaluation", projectId: "temporary", source: "builder" as const };

describe("visual judge selection", () => {
  beforeEach(() => {
    callModel.mockClear();
    callModel.mockResolvedValue({
      model, usd: 0.1,
      response: { content: [{ type: "text", text: JSON.stringify({
        scores: { hierarchy: 4, spacing: 4, color: 4, typography: 4, states: 4, responsive: 4, copy: 4, fidelity: 4 }, issues: [],
      }) }], usage: emptyUsage(), stopReason: "end", servedBy: model.id },
    });
  });
  it("preserves automatic judge affinity without accidentally making it an explicit choice", async () => {
    const result = await judgeDesign(scope, billing, model, input, new AbortController().signal);
    expect(result.judgement?.overall).toBe(4);
    expect(callModel.mock.lastCall?.[4]).toEqual({ billing, pinned: model, decisionBoundary: false });
  });
  it("keeps an explicitly selected measuring model fixed", async () => {
    const result = await judgeDesign(scope, billing, model, input, new AbortController().signal, true);
    expect(result.judgement?.model).toBe("Vision");
    expect(callModel.mock.lastCall?.[4]).toEqual({ billing, explicit: model, decisionBoundary: false });
  });
});
