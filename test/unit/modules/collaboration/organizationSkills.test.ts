import { describe, expect, it, vi } from "vitest";
import { OrgSkillError } from "../../../../server/modules/collaboration/domain/OrganizationSkill.js";
import { OrganizationSkillsService } from "../../../../server/modules/collaboration/application/OrganizationSkillsService.js";

function fixture() {
  const repository = {
    list: vi.fn().mockResolvedValue([]),
    enabled: vi.fn().mockResolvedValue([]),
    countExcept: vi.fn().mockResolvedValue(0),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  };
  const service = new OrganizationSkillsService(repository, { findSecret: () => null });
  return { repository, service };
}

describe("Organization skills module service", () => {
  it("validates and stores organization skills through its repository port", async () => {
    const { repository, service } = fixture();
    await service.save("org", "owner", "account", {
      name: "support", description: "Help with support", body: "Instructions",
    });
    expect(repository.save).toHaveBeenCalledWith("org", "account", {
      name: "support", description: "Help with support", body: "Instructions", enabled: true,
    });
  });

  it("rejects member writes, detected secrets, and skills beyond the organization limit", async () => {
    const { repository, service } = fixture();
    await expect(service.save("org", "member", "account", {
      name: "support", description: "Help", body: "Instructions",
    })).rejects.toBeInstanceOf(OrgSkillError);
    const secretService = new OrganizationSkillsService(repository, { findSecret: () => "clave secreta" });
    await expect(secretService.save("org", "admin", "account", {
      name: "support", description: "Help", body: "secret",
    })).rejects.toThrow("clave secreta");
    repository.countExcept.mockResolvedValue(30);
    await expect(service.save("org", "owner", "account", {
      name: "support", description: "Help", body: "Instructions",
    })).rejects.toThrow("hasta 30");
  });
});
