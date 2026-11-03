import { describe, expect, it, vi } from "vitest";
import { createCollaborationModule } from "../../../../server/modules/collaboration/index.js";

function fixture() {
  const transactionPersonalOrganizations = {
    create: vi.fn().mockResolvedValue(undefined),
    ensure: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  };
  const organizations = {
    listOrgs: vi.fn().mockResolvedValue([{ id: "org" }]),
    listOrgMembers: vi.fn().mockResolvedValue([{ accountId: "a" }]),
    getOrgRole: vi.fn().mockResolvedValue(null),
    organizationNames: vi.fn().mockResolvedValue({}),
  };
  const members = {
    listMembers: vi.fn().mockResolvedValue({ members: [], invites: [{ email: "a@b.co" }] }),
    getSharedProjectIds: vi.fn().mockResolvedValue(["p"]),
    hasProjectInvite: vi.fn().mockResolvedValue(false),
  };
  const module = createCollaborationModule({
    members: {} as never,
    accounts: {} as never,
    mailer: {} as never,
    organizations: {} as never,
    organizationQueries: organizations,
    organizationNames: organizations,
    memberQueries: members,
    personalOrganizations: {} as never,
    personalOrganizationsForTransaction: () => transactionPersonalOrganizations,
    id: () => "id",
    skills: {
      list: vi.fn().mockResolvedValue([]),
      enabled: vi.fn().mockResolvedValue([]),
      save: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue([]),
    } as never,
  });
  return { module, organizations, members, transactionPersonalOrganizations };
}

describe("Collaboration module factory", () => {
  it("routes organization and project membership queries through injected query ports", async () => {
    const { module, organizations, members } = fixture();
    expect(await module.listOrgs("a")).toEqual([{ id: "org" }]);
    expect(await module.listOrgMembers("org")).toEqual([{ accountId: "a" }]);
    expect(await module.orgRoleOf(undefined, "a")).toBeNull();
    expect(await module.listMembers("p")).toEqual({ members: [], invites: [{ email: "a@b.co" }] });
    expect(await module.sharedProjectIds("a")).toEqual(["p"]);
    expect(organizations.getOrgRole).not.toHaveBeenCalled();
    expect(members.getSharedProjectIds).toHaveBeenCalledWith("a");
  });

  it("enlists account and project tenant creation in the provided transaction", async () => {
    const { module, transactionPersonalOrganizations } = fixture();
    const transaction = { query: vi.fn() };
    await module.createPersonalOrg(transaction, "a", "Alice");
    await module.ensurePersonalOrg(transaction, "a");
    expect(transactionPersonalOrganizations.create).toHaveBeenCalledWith("personal_a", "a", "Alice");
    expect(transactionPersonalOrganizations.ensure).toHaveBeenCalledWith("personal_a", "a");
    expect(transaction.query).not.toHaveBeenCalled();
  });

  it("uses the supplied lifecycle and personal organization contract", async () => {
    const { module } = fixture();
    await module.start();
    await module.start();
    await module.stop();
    await module.stop();
    expect(module.personalOrgId("a")).toBe("personal_a");
  });
});
