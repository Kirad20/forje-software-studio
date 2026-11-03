import { describe, it, expect } from "vitest";
import { MemberAccess } from "../../../../server/modules/collaboration/domain/MemberAccess.js";
import { Organization } from "../../../../server/modules/collaboration/domain/Organization.js";

describe("Collaboration Domain (DDD & TDD)", () => {
  it("validates team organizations but preserves personal account names exactly", () => {
    const personal = new Organization({ id: Organization.personalId("a"), name: "", slug: null, personal: true });
    expect(personal).toMatchObject({ id: "personal_a", name: "", slug: null });
    expect(personal.isPersonal()).toBe(true);
    const team = new Organization({ id: "team", name: "  Alpha  ", slug: "alpha", personal: false });
    expect(team.name).toBe("Alpha");
    expect(team.isPersonal()).toBe(false);
    expect(() => new Organization({ id: "team", name: "", slug: "alpha", personal: false })).toThrow(
      "Ponle un nombre a la organización",
    );
  });

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
