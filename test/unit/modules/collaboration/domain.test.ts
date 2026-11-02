import { describe, it, expect } from "vitest";
import { MemberAccess } from "../../../../server/modules/collaboration/domain/MemberAccess.js";

describe("Collaboration Domain (DDD & TDD)", () => {
  it("determines owner access when account matches project owner", () => {
    const access = MemberAccess.compute("acc_1", "acc_1", false);
    expect(access).toBe("owner");
  });

  it("determines editor access when account is member of project or org", () => {
    const access = MemberAccess.compute("acc_2", "acc_1", true);
    expect(access).toBe("editor");
  });

  it("returns null access when account is stranger", () => {
    const access = MemberAccess.compute("acc_stranger", "acc_1", false);
    expect(access).toBeNull();
  });
});
