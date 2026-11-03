import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  listOrgs: vi.fn(),
  listOrgMembers: vi.fn(),
  orgRoleOf: vi.fn(),
  createPersonalOrg: vi.fn(),
  ensurePersonalOrg: vi.fn(),
  listMembers: vi.fn(),
  sharedProjectIds: vi.fn(),
  claimInvites: vi.fn(),
  personalOrgId: vi.fn().mockReturnValue("personal_a"),
}));
vi.mock("../../../../server/modules/collaboration/index.js", () => ({
  ...api,
  ORG_ROLES: ["owner", "admin", "member"],
  Organization: { personalId: api.personalOrgId },
  organizationRepository: { getOrgRole: vi.fn() },
  memberRepository: { getSharedProjectIds: vi.fn(), claimInvites: vi.fn() },
}));
vi.mock("../../../../server/platform/db.js", () => ({ q: vi.fn() }));

import * as orgs from "../../../../server/platform/orgs.js";
import * as members from "../../../../server/platform/members.js";

describe("Collaboration compatibility facades delegate to the public application contract", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists organizations without persistence in the facade", async () => {
    api.listOrgs.mockResolvedValue([{ id: "org" }]);
    expect(await orgs.listOrgs("a")).toEqual([{ id: "org" }]);
    expect(api.listOrgs).toHaveBeenCalledWith("a");
  });

  it("lists organization members through the application", async () => {
    api.listOrgMembers.mockResolvedValue([{ accountId: "a" }]);
    expect(await orgs.listOrgMembers("org")).toEqual([{ accountId: "a" }]);
    expect(api.listOrgMembers).toHaveBeenCalledWith("org");
  });

  it("delegates missing-tenant role handling to the application", async () => {
    api.orgRoleOf.mockResolvedValue(null);
    expect(await orgs.orgRoleOf(undefined, "a")).toBeNull();
    expect(api.orgRoleOf).toHaveBeenCalledWith(undefined, "a");
  });

  it("passes the exact account transaction to personal organization creation", async () => {
    const transaction = { query: vi.fn() };
    await orgs.createPersonalOrg(transaction, "a", "Alice");
    expect(api.createPersonalOrg).toHaveBeenCalledWith(transaction, "a", "Alice");
    expect(transaction.query).not.toHaveBeenCalled();
  });

  it("passes the exact project transaction to personal organization repair", async () => {
    const transaction = { query: vi.fn() };
    await orgs.ensurePersonalOrg(transaction, "a");
    expect(api.ensurePersonalOrg).toHaveBeenCalledWith(transaction, "a");
    expect(transaction.query).not.toHaveBeenCalled();
  });

  it("lists both memberships and invites through the application", async () => {
    api.listMembers.mockResolvedValue({ members: [], invites: [{ email: "a@b.co" }] });
    expect(await members.listMembers("p")).toEqual({ members: [], invites: [{ email: "a@b.co" }] });
    expect(api.listMembers).toHaveBeenCalledWith("p");
  });

  it("queries shared project access through the application, not a repository", async () => {
    api.sharedProjectIds.mockResolvedValue(["p"]);
    expect(await members.sharedProjectIds("a")).toEqual(["p"]);
    expect(api.sharedProjectIds).toHaveBeenCalledWith("a");
  });

  it("claims invites through the application and preserves the legacy void return", async () => {
    api.claimInvites.mockResolvedValue(2);
    expect(await members.claimInvites("a", "A@B.CO")).toBeUndefined();
    expect(api.claimInvites).toHaveBeenCalledWith("a", "A@B.CO");
  });
});
