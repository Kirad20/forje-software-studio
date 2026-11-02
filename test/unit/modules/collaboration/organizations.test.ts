import { describe, it, expect } from "vitest";
import { OrgPolicy } from "../../../../server/modules/collaboration/domain/OrgPolicy.js";

describe("OrgPolicy Domain (DDD & TDD)", () => {
  it("allows owner to manage any member or assign any role", () => {
    expect(() => OrgPolicy.assertCanManage("owner", "member", "admin")).not.toThrow();
    expect(() => OrgPolicy.assertCanManage("owner", "owner", "member")).not.toThrow();
    expect(() => OrgPolicy.assertCanManage("owner", null, "owner")).not.toThrow();
  });

  it("blocks member from managing any members", () => {
    expect(() => OrgPolicy.assertCanManage("member", "member")).toThrow(
      "Solo propietarios y administradores gestionan miembros.",
    );
    expect(() => OrgPolicy.assertCanManage("member", null, "member")).toThrow(
      "Solo propietarios y administradores gestionan miembros.",
    );
  });

  it("blocks admin from touching owners or assigning owner role", () => {
    expect(() => OrgPolicy.assertCanManage("admin", "owner", "admin")).toThrow(
      "Solo un propietario puede gestionar propietarios.",
    );
    expect(() => OrgPolicy.assertCanManage("admin", "member", "owner")).toThrow(
      "Solo un propietario puede gestionar propietarios.",
    );
    expect(() => OrgPolicy.assertCanManage("admin", null, "owner")).toThrow(
      "Solo un propietario puede gestionar propietarios.",
    );
  });

  it("allows admin to manage non-owners without assigning owner role", () => {
    expect(() => OrgPolicy.assertCanManage("admin", "member", "admin")).not.toThrow();
    expect(() => OrgPolicy.assertCanManage("admin", "admin", "member")).not.toThrow();
    expect(() => OrgPolicy.assertCanManage("admin", null, "member")).not.toThrow();
  });

  it("enforces at least one owner invariant", () => {
    expect(() => OrgPolicy.assertMinOwners(1)).toThrow("La organización necesita al menos un propietario.");
    expect(() => OrgPolicy.assertMinOwners(0)).toThrow("La organización necesita al menos un propietario.");
    expect(() => OrgPolicy.assertMinOwners(2)).not.toThrow();
  });

  it("validates organization name constraints and slug creation", () => {
    expect(() => OrgPolicy.validateName("")).toThrow("Ponle un nombre a la organización");
    expect(() => OrgPolicy.validateName(" a ")).toThrow("Ponle un nombre a la organización");
    expect(OrgPolicy.validateName("  Equipo Alpha  ")).toBe("Equipo Alpha");

    expect(OrgPolicy.slugify("Equipo Ñandú")).toBe("equipo-nandu");
    expect(OrgPolicy.slugify("¡Súper Proyecto! 123")).toBe("super-proyecto-123");
    expect(OrgPolicy.slugify("")).toBe("org");
  });
});
