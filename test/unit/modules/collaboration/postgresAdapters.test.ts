import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { freshDatabase } from "../../../helpers/pg.mjs";

const database = await freshDatabase();
process.env.DATABASE_URL = database.url;
process.env.SECRETS_KEY = "ab".repeat(32);
const { platformDb, q, one, closePlatformDb } = await import("../../../../server/shared/database/index.js");
const { newId } = await import("../../../../server/shared/crypto.js");
const { createCollaborationModule } = await import("../../../../server/modules/collaboration/index.js");
const { PostgresMemberRepository } = await import("../../../../server/modules/collaboration/infrastructure/PostgresMemberRepository.js");
const { PostgresCollaborationAccountRepository } = await import("../../../../server/modules/collaboration/infrastructure/PostgresCollaborationAccountRepository.js");
const { PlatformCollaborationMailerService } = await import("../../../../server/modules/collaboration/infrastructure/PlatformCollaborationMailerService.js");
const { PostgresOrganizationRepository } = await import("../../../../server/modules/collaboration/infrastructure/PostgresOrganizationRepository.js");
const { PostgresPersonalOrganizationRepository } = await import("../../../../server/modules/collaboration/infrastructure/PostgresPersonalOrganizationRepository.js");
const { PostgresOrganizationSkillsRepository } = await import("../../../../server/modules/collaboration/infrastructure/PostgresOrganizationSkillsRepository.js");
const { OrganizationSkillsService } = await import("../../../../server/modules/collaboration/application/OrganizationSkillsService.js");
const memberRepository = new PostgresMemberRepository();
const collaborationAccountRepository = new PostgresCollaborationAccountRepository();
const organizationRepository = new PostgresOrganizationRepository();
const sendInvitation = vi.fn().mockResolvedValue(true);
const collaborationMailerService = new PlatformCollaborationMailerService(sendInvitation, "https://studio.example");
const collaboration = createCollaborationModule({
  members: memberRepository,
  accounts: collaborationAccountRepository,
  mailer: collaborationMailerService,
  organizations: organizationRepository,
  organizationQueries: organizationRepository,
  organizationNames: organizationRepository,
  memberQueries: memberRepository,
  personalOrganizations: new PostgresPersonalOrganizationRepository(),
  personalOrganizationsForTransaction: (tx) => new PostgresPersonalOrganizationRepository(tx),
  id: newId,
  skills: new OrganizationSkillsService(new PostgresOrganizationSkillsRepository(), { findSecret: () => null }),
});

afterAll(async () => {
  await closePlatformDb();
  await database.drop();
});

describe("Collaboration Postgres adapters on the unchanged platform schema", () => {
  beforeAll(async () => {
    await platformDb();
  });

  beforeEach(async () => {
    vi.restoreAllMocks();
    await q(`truncate accounts, organizations cascade`);
    await q(
      `insert into accounts (id, email, name, disabled) values
       ('owner', 'owner@example.com', 'Owner', false),
       ('member', 'member@example.com', '', false),
       ('stranger', 'stranger@example.com', null, false),
       ('disabled', 'disabled@example.com', 'Disabled', true)`,
    );
    await q(`insert into organizations (id, name, slug) values ('team', 'Alpha', 'alpha'), ('foreign', 'Beta', 'beta')`);
    await q(`insert into org_members (org_id, account_id, role) values ('team', 'owner', 'owner'), ('foreign', 'stranger', 'owner')`);
    await q(
      `insert into projects (id, owner_id, name, org_id) values
       ('p', 'owner', 'Project', 'team'), ('foreign_p', 'stranger', 'Foreign', 'foreign'),
       ('legacy_p', 'owner', 'Legacy', null)`,
    );
  });

  it("creates an idempotent personal tenant and owner inside the caller transaction", async () => {
    const db = await platformDb();
    await db.transaction(async (tx) => {
      await collaboration.createPersonalOrg(tx, "member", "");
      await collaboration.createPersonalOrg(tx, "member", "Do not overwrite");
      expect((await tx.query(`select name, personal from organizations where id = 'personal_member'`)).rows).toEqual([
        { name: "", personal: true },
      ]);
    });
    expect(await collaboration.orgRoleOf("personal_member", "member")).toBe("owner");
    expect(await q(`select 1 from org_members where org_id = 'personal_member'`)).toHaveLength(1);
  });

  it("rolls back both account and personal tenant when the caller aborts", async () => {
    const db = await platformDb();
    await expect(
      db.transaction(async (tx) => {
        await tx.query(`insert into accounts (id, email) values ('new', 'new@example.com')`);
        await collaboration.createPersonalOrg(tx, "new", "New");
        throw new Error("abort account creation");
      }),
    ).rejects.toThrow("abort account creation");
    expect(await one(`select 1 from accounts where id = 'new'`)).toBeUndefined();
    expect(await one(`select 1 from organizations where id = 'personal_new'`)).toBeUndefined();
    expect(await one(`select 1 from org_members where account_id = 'new'`)).toBeUndefined();
  });

  it("repairs legacy tenants from account names or email prefixes without overwriting them", async () => {
    const db = await platformDb();
    await collaboration.ensurePersonalOrg(db, "owner");
    await collaboration.ensurePersonalOrg(db, "member");
    await collaboration.ensurePersonalOrg(db, "member");
    await collaboration.ensurePersonalOrg(db, "missing");
    expect(await collaboration.listOrgs("owner")).toEqual([
      { id: "personal_owner", name: "Owner", slug: null, personal: true, role: "owner" },
      { id: "team", name: "Alpha", slug: "alpha", personal: false, role: "owner" },
    ]);
    expect(await collaboration.listOrgs("member")).toEqual([
      { id: "personal_member", name: "member", slug: null, personal: true, role: "owner" },
    ]);
    expect(await one(`select 1 from organizations where id = 'personal_missing'`)).toBeUndefined();
  });

  it("deletes a personal organization after account cascade without touching team tenants", async () => {
    await collaboration.createPersonalOrg(await platformDb(), "owner", "Owner");
    await q(`delete from accounts where id = 'owner'`);
    await collaboration.deletePersonalOrg("owner");
    expect(await one(`select 1 from organizations where id = 'personal_owner'`)).toBeUndefined();
    expect(await one(`select 1 from organizations where id = 'team'`)).toBeDefined();
  });

  it("retains organization member ordering and the public read-model field names", async () => {
    await q(`update org_members set created_at = '2020-01-01T00:00:00Z' where org_id = 'team'`);
    await collaboration.addOrgMember("team", "owner", " MEMBER@EXAMPLE.COM ", "admin");
    const members = await collaboration.listOrgMembers("team");
    expect(members.map((member) => member.accountId)).toEqual(["owner", "member"]);
    expect(members[1]).toMatchObject({ email: "member@example.com", name: "", role: "admin" });
    expect(members[1]).toHaveProperty("createdAt");
    expect(await collaboration.orgRoleOf("foreign", "member")).toBeNull();
    expect(await collaboration.orgRoleOf(null, "member")).toBeNull();
  });

  it("preserves slug conflict resolution, owner assignment and record lookups", async () => {
    const team = await collaboration.createOrg("member", " Alpha ");
    expect(team).toMatchObject({ name: "Alpha", slug: "alpha-2", personal: false, role: "owner" });
    expect(await organizationRepository.findById(team.id)).toEqual({ id: team.id, name: "Alpha", personal: false });
    expect(await organizationRepository.findBySlug("alpha-2")).toEqual({ id: team.id, name: "Alpha", personal: false });
    expect(await organizationRepository.findBySlug("absent")).toBeNull();
    expect(await collaboration.orgRoleOf(team.id, "member")).toBe("owner");
  });

  it("exposes organization labels to other contexts without leaking persistence", async () => {
    expect(await collaboration.organizationNames(["team", "foreign", "missing", "team"])).toEqual({
      team: "Alpha",
      foreign: "Beta",
    });
    expect(await collaboration.organizationNames([])).toEqual({});
  });

  it("preserves personal-tenant restrictions, disabled-account exclusion and role validation", async () => {
    await collaboration.createPersonalOrg(await platformDb(), "owner", "Owner");
    await expect(collaboration.addOrgMember("personal_owner", "owner", "member@example.com", "member")).rejects.toThrow(
      "Una organización personal no admite miembros.",
    );
    await expect(collaboration.addOrgMember("team", "owner", "disabled@example.com", "member")).rejects.toThrow(
      "Esa persona aún no tiene cuenta",
    );
    await expect(collaboration.addOrgMember("team", "owner", "member@example.com", "invalid" as never)).rejects.toThrow(
      "Rol no válido",
    );
    expect(await collaborationAccountRepository.findByEmail("unknown@example.com")).toBeNull();
  });

  it("prevents the last owner leaving or being demoted, and allows self-removal for members", async () => {
    await expect(collaboration.setOrgMemberRole("team", "owner", "owner", "member")).rejects.toThrow(
      "La organización necesita al menos un propietario.",
    );
    await expect(collaboration.removeOrgMember("team", "owner", "owner", "owner")).rejects.toThrow(
      "La organización necesita al menos un propietario.",
    );
    await collaboration.addOrgMember("team", "owner", "member@example.com", "member");
    await collaboration.removeOrgMember("team", "member", "member", "member");
    expect(await collaboration.orgRoleOf("team", "member")).toBeNull();
    await expect(collaboration.removeOrgMember("team", "member", "member", "missing")).resolves.toBeUndefined();
  });

  it("permits multi-owner demotion/removal while rejecting admin changes to owners", async () => {
    await collaboration.addOrgMember("team", "owner", "member@example.com", "owner");
    await expect(collaboration.setOrgMemberRole("team", "admin", "member", "member")).rejects.toThrow(
      "Solo un propietario puede gestionar propietarios.",
    );
    await collaboration.setOrgMemberRole("team", "owner", "member", "admin");
    expect(await collaboration.orgRoleOf("team", "member")).toBe("admin");
    await collaboration.setOrgMemberRole("team", "owner", "member", "owner");
    await collaboration.removeOrgMember("team", "owner", "owner", "member");
    expect(await collaboration.orgRoleOf("team", "member")).toBeNull();
    await expect(collaboration.setOrgMemberRole("team", "owner", "missing", "member")).rejects.toThrow(
      "Esa persona no es miembro",
    );
  });

  it("resolves owner, organization, direct collaborator and denied access without platform-admin bypass", async () => {
    const project = { id: "p", ownerId: "owner", orgId: "team" };
    expect(await collaboration.accessOf("owner", project)).toBe("owner");
    expect(await collaboration.accessOf("member", project)).toBeNull();
    await collaboration.addOrgMember("team", "owner", "member@example.com", "member");
    expect(await collaboration.accessOf("member", project)).toBe("editor");
    expect(await collaboration.accessOf("member", { id: "foreign_p", ownerId: "stranger", orgId: "foreign" })).toBeNull();
    await memberRepository.addMember("foreign_p", "member");
    expect(await collaboration.accessOf("member", { id: "foreign_p", ownerId: "stranger", orgId: "foreign" })).toBe("editor");
    expect(await collaboration.accessOf("stranger", project)).toBeNull();
    expect(await collaboration.accessOf("stranger", undefined)).toBeNull();
  });

  it("deduplicates shared project IDs and excludes organization-owned projects for the owner", async () => {
    await collaboration.addOrgMember("team", "owner", "member@example.com", "member");
    await memberRepository.addMember("p", "member");
    await memberRepository.addMember("foreign_p", "member");
    expect((await collaboration.sharedProjectIds("member")).sort()).toEqual(["foreign_p", "p"]);
    expect(await collaboration.sharedProjectIds("owner")).toEqual([]);
  });

  it("retains editor defaults and idempotence for direct memberships and pending invites", async () => {
    await memberRepository.addMember("p", "member", "ignored-legacy-role");
    await memberRepository.addMember("p", "member");
    await memberRepository.createInvite("p", "new@example.com", "owner@example.com", "ignored-legacy-role");
    await memberRepository.createInvite("p", "new@example.com", "different@example.com");
    const listing = await collaboration.listMembers("p");
    expect(listing.members).toHaveLength(1);
    expect(listing.members[0]).toMatchObject({ accountId: "member", email: "member@example.com", role: "editor" });
    expect(listing.invites).toHaveLength(1);
    expect(listing.invites[0]).toMatchObject({ email: "new@example.com", role: "editor" });
    expect(listing.members[0]).toHaveProperty("createdAt");
    expect(await one(`select invited_by from project_invites where project_id = 'p'`)).toEqual({ invited_by: "owner@example.com" });
  });

  it("composes invitations with real account/membership adapters and the injected mail port", async () => {
    const send = vi.spyOn(collaborationMailerService, "sendInvitation").mockResolvedValue(true);
    const project = { id: "p", name: "Project", ownerId: "owner" };
    expect(await collaboration.inviteMember(project, "owner@example.com", " MEMBER@EXAMPLE.COM ")).toEqual({ joined: true });
    expect(await collaboration.inviteMember(project, "owner@example.com", " New@Example.com ")).toEqual({ joined: false });
    expect(send).toHaveBeenLastCalledWith({
      to: "new@example.com",
      inviterEmail: "owner@example.com",
      projectId: "p",
      projectName: "Project",
    });
    expect((await collaboration.listMembers("p")).members).toHaveLength(1);
    expect((await collaboration.listMembers("p")).invites).toHaveLength(1);
    await expect(collaboration.inviteMember(project, "other@example.com", "owner@example.com")).rejects.toThrow(
      "Esa persona es la dueña del proyecto",
    );
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("claims pending invites across projects, preserving duplicate memberships and legacy editor semantics", async () => {
    await memberRepository.addMember("p", "member");
    await memberRepository.createInvite("p", "member@example.com", "owner@example.com");
    await memberRepository.createInvite("foreign_p", "member@example.com", "stranger@example.com");
    await q(`update project_invites set role = 'custom-legacy-role'`);
    expect(await collaboration.hasProjectInvite("MEMBER@EXAMPLE.COM")).toBe(true);
    expect(await collaboration.claimInvites("member", "MEMBER@EXAMPLE.COM")).toBe(2);
    expect(await collaboration.claimInvites("member", "member@example.com")).toBe(0);
    expect(await collaboration.hasProjectInvite("MEMBER@EXAMPLE.COM")).toBe(false);
    expect(await q(`select role from project_members where account_id = 'member'`)).toEqual([{ role: "editor" }, { role: "editor" }]);
  });

  it("removes memberships by email or account and deletes pending invites only for the target project", async () => {
    await memberRepository.addMember("p", "member");
    await memberRepository.addMember("foreign_p", "member");
    await memberRepository.createInvite("p", "member@example.com", "owner@example.com");
    await memberRepository.createInvite("foreign_p", "member@example.com", "stranger@example.com");
    await collaboration.removeMember("p", "MEMBER@EXAMPLE.COM");
    expect(await collaboration.listMembers("p")).toEqual({ members: [], invites: [] });
    expect((await collaboration.listMembers("foreign_p")).members).toHaveLength(1);
    expect((await collaboration.listMembers("foreign_p")).invites).toHaveLength(1);
    await collaboration.removeMember("foreign_p", "member");
    expect((await collaboration.listMembers("foreign_p")).members).toHaveLength(0);
    expect((await collaboration.listMembers("foreign_p")).invites).toHaveLength(1);
  });
});
