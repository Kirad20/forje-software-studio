import { describe, it, expect } from "vitest";
import { Checkpoint } from "../../../../server/modules/projects/domain/Checkpoint.js";

describe("Checkpoint Entity (TDD)", () => {
  it("creates a checkpoint with valid attributes and limits label length", () => {
    const longLabel = "a".repeat(200);
    const cp = new Checkpoint({
      id: 1,
      projectId: "proj_1",
      label: longLabel,
      author: "owner",
      actor: "user_1",
      description: "Punto de guardado inicial",
    });

    expect(cp.id).toBe(1);
    expect(cp.label.length).toBe(120);
    expect(cp.author).toBe("owner");
    expect(cp.actor).toBe("user_1");
  });
});
