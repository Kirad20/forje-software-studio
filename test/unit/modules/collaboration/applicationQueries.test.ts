import { describe, expect, it, vi } from "vitest";
import { OrganizationQueries } from "../../../../server/modules/collaboration/application/OrganizationQueries.js";
import { OrganizationNamesQuery } from "../../../../server/modules/collaboration/application/OrganizationNamesQuery.js";
import { MemberQueries } from "../../../../server/modules/collaboration/application/MemberQueries.js";
import { ClaimInvitesUseCase } from "../../../../server/modules/collaboration/application/ClaimInvitesUseCase.js";
import { PersonalOrganizationUseCase } from "../../../../server/modules/collaboration/application/PersonalOrganizationUseCase.js";
import { CheckAccessUseCase } from "../../../../server/modules/collaboration/application/CheckAccessUseCase.js";
import type { IMemberRepository } from "../../../../server/modules/collaboration/ports/repositories.js";

describe("Collaboration application ports", () => {
  it("only asks the organization directory for nonempty ID batches", async () => {
    const names = { team: "Alpha" };
    const directory = { organizationNames: vi.fn().mockResolvedValue(names) };
    const application = new OrganizationNamesQuery(directory);
    expect(await application.execute([])).toEqual({});
    expect(directory.organizationNames).not.toHaveBeenCalled();
    expect(await application.execute(["team"])).toBe(names);
    expect(directory.organizationNames).toHaveBeenCalledWith(["team"]);
  });

  it("forwards organization read models unchanged", async () => {
    const organizations = [{ id: "o", name: "Team", slug: "team", personal: false, role: "admin" as const }];
    const members = [{ accountId: "a", email: "a@b.co", name: null, role: "member" as const, createdAt: "date" }];
    const port = {
      listOrgs: vi.fn().mockResolvedValue(organizations),
      listOrgMembers: vi.fn().mockResolvedValue(members),
      getOrgRole: vi.fn().mockResolvedValue("admin"),
    };
    const application = new OrganizationQueries(port);
    expect(await application.listOrgs("a")).toBe(organizations);
    expect(await application.listOrgMembers("o")).toBe(members);
    expect(await application.orgRoleOf("o", "a")).toBe("admin");
    expect(port.listOrgs).toHaveBeenCalledWith("a");
    expect(port.listOrgMembers).toHaveBeenCalledWith("o");
    expect(port.getOrgRole).toHaveBeenCalledWith("o", "a");
  });

  it.each([undefined, null, ""])("does not query a missing tenant %s", async (tenant) => {
    const port = { listOrgs: vi.fn(), listOrgMembers: vi.fn(), getOrgRole: vi.fn() };
    expect(await new OrganizationQueries(port).orgRoleOf(tenant, "a")).toBeNull();
    expect(port.getOrgRole).not.toHaveBeenCalled();
  });

  it("returns membership read models and normalizes signup invite lookups without trimming", async () => {
    const listing = { members: [], invites: [] };
    const port = {
      listMembers: vi.fn().mockResolvedValue(listing),
      getSharedProjectIds: vi.fn().mockResolvedValue(["p"]),
      hasProjectInvite: vi.fn().mockResolvedValue(true),
    };
    const application = new MemberQueries(port);
    expect(await application.listMembers("p")).toBe(listing);
    expect(await application.sharedProjectIds("a")).toEqual(["p"]);
    expect(await application.hasProjectInvite(" A@B.CO ")).toBe(true);
    expect(port.listMembers).toHaveBeenCalledWith("p");
    expect(port.getSharedProjectIds).toHaveBeenCalledWith("a");
    expect(port.hasProjectInvite).toHaveBeenCalledWith(" a@b.co ");
  });

  it("claims invites with a canonical email and returns the number claimed", async () => {
    const repository = { claimInvites: vi.fn().mockResolvedValue(2) };
    expect(await new ClaimInvitesUseCase(repository).execute("a", "A@B.CO")).toBe(2);
    expect(repository.claimInvites).toHaveBeenCalledWith("a", "a@b.co");
  });

  it("derives personal tenant identity in the domain for creation, repair and deletion", async () => {
    const repository = { create: vi.fn(), ensure: vi.fn(), delete: vi.fn() };
    const application = new PersonalOrganizationUseCase(repository);
    await application.create("a", "");
    await application.ensure("a");
    await application.delete("a");
    expect(repository.create).toHaveBeenCalledWith("personal_a", "a", "");
    expect(repository.ensure).toHaveBeenCalledWith("personal_a", "a");
    expect(repository.delete).toHaveBeenCalledWith("personal_a");
  });

  it("propagates personal organization errors to the caller transaction", async () => {
    const error = new Error("transaction failed");
    const repository = { create: vi.fn().mockRejectedValue(error), ensure: vi.fn(), delete: vi.fn() };
    await expect(new PersonalOrganizationUseCase(repository).create("a", "Alice")).rejects.toBe(error);
  });

  it("does not query membership for missing projects or owners", async () => {
    const checkAccess = vi.fn();
    const application = new CheckAccessUseCase({ checkAccess } as unknown as IMemberRepository);
    expect(await application.execute("a", undefined)).toBeNull();
    expect(await application.execute("a", { id: "p", ownerId: "a" })).toBe("owner");
    expect(checkAccess).not.toHaveBeenCalled();
  });

  it.each([
    [true, "editor"],
    [false, null],
  ] as const)("resolves collaboration access from the injected membership port (%s)", async (allowed, expected) => {
    const checkAccess = vi.fn().mockResolvedValue(allowed);
    const application = new CheckAccessUseCase({ checkAccess } as unknown as IMemberRepository);
    expect(await application.execute("a", { id: "p", ownerId: "other", orgId: "o" })).toBe(expected);
    expect(checkAccess).toHaveBeenCalledWith("a", "p", "o");
  });

  it("passes a null tenant for legacy projects without organizations", async () => {
    const checkAccess = vi.fn().mockResolvedValue(false);
    const application = new CheckAccessUseCase({ checkAccess } as unknown as IMemberRepository);
    expect(await application.execute("a", { id: "p", ownerId: "other" })).toBeNull();
    expect(checkAccess).toHaveBeenCalledWith("a", "p", null);
  });
});
