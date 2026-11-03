import { describe, expect, it, vi } from "vitest";
import { createTurnFeedback } from "../../../../server/modules/model-management/application/TurnFeedback.js";
const database = vi.hoisted(() => ({ q: vi.fn(), one: vi.fn() }));
vi.mock("../../../../server/shared/database/index.js", () => database);
import { postgresTurnFeedback } from "../../../../server/modules/model-management/infrastructure/PostgresTurnFeedback.js";

describe("turn model feedback", () => {
  it("passes exact failure reward and weighting, including missing model tier fallback", async () => {
    const ports = {
      decisions: vi.fn(async () => [{ taskClass: "ui:low:ui", modelId: "known" }, { taskClass: "qa:mid:data", modelId: "gone" }]),
      tiers: vi.fn(async () => new Map([["known", 5]])),
      recordOutcome: vi.fn(async () => {}),
    };
    await createTurnFeedback(ports).penalizeTurn("project", "turn", 0.5);
    expect(ports.decisions).toHaveBeenCalledWith("project", "turn");
    expect(ports.recordOutcome.mock.calls).toEqual([
      ["ui:low:ui", { id: "known", tier: 5 }, 0, 0, 0.5],
      ["qa:mid:data", { id: "gone", tier: 3 }, 0, 0, 0.5],
    ]);
  });
  it("retains distinct turn query, recent ten-minute query and the entire tier catalog", async () => {
    database.q.mockResolvedValueOnce([{ task_class: "chat:low:general", model_id: "a" }]);
    expect(await postgresTurnFeedback.decisions("project", "turn")).toEqual([{ taskClass: "chat:low:general", modelId: "a" }]);
    expect(database.q).toHaveBeenLastCalledWith(
      "select distinct task_class, model_id from router_decisions where project_id = $1 and turn_id = $2", ["project", "turn"],
    );
    database.q.mockResolvedValueOnce([]);
    await postgresTurnFeedback.decisions("project", null);
    expect(database.q).toHaveBeenLastCalledWith(
      "select distinct task_class, model_id from router_decisions where project_id = $1 and created_at > now() - interval '10 minutes'", ["project"],
    );
    database.q.mockResolvedValueOnce([{ id: "a", tier: 4 }]);
    expect(await postgresTurnFeedback.tiers()).toEqual(new Map([["a", 4]]));
    expect(database.q).toHaveBeenLastCalledWith("select id, tier from model_catalog");
  });
});
