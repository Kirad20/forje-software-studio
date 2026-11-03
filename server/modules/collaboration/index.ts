import { newId } from "../../lib/crypto.js";
import { PostgresMemberRepository } from "./infrastructure/PostgresMemberRepository.js";
import { PostgresCollaborationAccountRepository } from "./infrastructure/PostgresCollaborationAccountRepository.js";
import { PlatformCollaborationMailerService } from "./infrastructure/PlatformCollaborationMailerService.js";
import { PostgresOrganizationRepository } from "./infrastructure/PostgresOrganizationRepository.js";
import { CheckAccessUseCase } from "./application/CheckAccessUseCase.js";
import { InviteMemberUseCase } from "./application/InviteMemberUseCase.js";
import { RemoveMemberUseCase } from "./application/RemoveMemberUseCase.js";
import { CreateOrgUseCase } from "./application/CreateOrgUseCase.js";
import { ManageOrgMemberUseCase } from "./application/ManageOrgMemberUseCase.js";
import { Organization } from "./domain/Organization.js";
import { OrganizationQueries } from "./application/OrganizationQueries.js";
import { OrganizationNamesQuery } from "./application/OrganizationNamesQuery.js";
import { MemberQueries } from "./application/MemberQueries.js";
import { ClaimInvitesUseCase } from "./application/ClaimInvitesUseCase.js";
import { PersonalOrganizationUseCase } from "./application/PersonalOrganizationUseCase.js";
import { PostgresPersonalOrganizationRepository } from "./infrastructure/PostgresPersonalOrganizationRepository.js";
import type { QueryHandle } from "./ports/personalOrganizations.js";
import type { OrgRole } from "./domain/OrgPolicy.js";
import type { ProjectIdentity } from "./application/CheckAccessUseCase.js";
import type { ProjectTarget } from "./application/InviteMemberUseCase.js";

// Domain & Models
export * from "./domain/MemberAccess.js";
export * from "./domain/ProjectInvite.js";
export * from "./domain/OrgPolicy.js";
export * from "./domain/Organization.js";
export * from "./ports/repositories.js";
export * from "./ports/queries.js";
export * from "./ports/personalOrganizations.js";
export type { ProjectIdentity, ProjectTarget };

// Infrastructure Singleton Adapters
export const memberRepository = new PostgresMemberRepository();
export const collaborationAccountRepository = new PostgresCollaborationAccountRepository();
export const collaborationMailerService = new PlatformCollaborationMailerService();
export const organizationRepository = new PostgresOrganizationRepository();

// Application Use Cases
export const checkAccessUseCase = new CheckAccessUseCase(memberRepository);
export const inviteMemberUseCase = new InviteMemberUseCase(
  memberRepository,
  collaborationAccountRepository,
  collaborationMailerService,
);
export const removeMemberUseCase = new RemoveMemberUseCase(memberRepository);
export const createOrgUseCase = new CreateOrgUseCase(organizationRepository, newId);
export const manageOrgMemberUseCase = new ManageOrgMemberUseCase(
  organizationRepository,
  collaborationAccountRepository,
);

const organizationQueries = new OrganizationQueries(organizationRepository);
const organizationNamesQuery = new OrganizationNamesQuery(organizationRepository);
const memberQueries = new MemberQueries(memberRepository);
const claimInvitesUseCase = new ClaimInvitesUseCase(memberRepository);
const personalOrganizations = new PersonalOrganizationUseCase(new PostgresPersonalOrganizationRepository());

export const personalOrgId = (accountId: string) => Organization.personalId(accountId);
export const createPersonalOrg = (db: QueryHandle, accountId: string, name: string) =>
  new PersonalOrganizationUseCase(new PostgresPersonalOrganizationRepository(db)).create(accountId, name);
export const ensurePersonalOrg = (db: QueryHandle, accountId: string) =>
  new PersonalOrganizationUseCase(new PostgresPersonalOrganizationRepository(db)).ensure(accountId);
export const deletePersonalOrg = (accountId: string) => personalOrganizations.delete(accountId);
export const listOrgs = (accountId: string) => organizationQueries.listOrgs(accountId);
export const listOrgMembers = (orgId: string) => organizationQueries.listOrgMembers(orgId);
export const organizationNames = (ids: string[]) => organizationNamesQuery.execute(ids);
export const orgRoleOf = (orgId: string | null | undefined, accountId: string) => organizationQueries.orgRoleOf(orgId, accountId);
export const createOrg = (accountId: string, rawName: string) => createOrgUseCase.execute(accountId, rawName);
export const addOrgMember = (orgId: string, actorRole: OrgRole, email: string, role: OrgRole) =>
  manageOrgMemberUseCase.addMember(orgId, actorRole, email, role);
export const setOrgMemberRole = (orgId: string, actorRole: OrgRole, accountId: string, role: OrgRole) =>
  manageOrgMemberUseCase.setRole(orgId, actorRole, accountId, role);
export const removeOrgMember = (orgId: string, actorRole: OrgRole, actorId: string, accountId: string) =>
  manageOrgMemberUseCase.removeMember(orgId, actorRole, actorId, accountId);
export const accessOf = (accountId: string, project: ProjectIdentity | undefined) => checkAccessUseCase.execute(accountId, project);
export const sharedProjectIds = (accountId: string) => memberQueries.sharedProjectIds(accountId);
export const listMembers = (projectId: string) => memberQueries.listMembers(projectId);
export const inviteMember = (project: ProjectTarget, inviterEmail: string, rawEmail: string) =>
  inviteMemberUseCase.execute(project, inviterEmail, rawEmail);
export const removeMember = (projectId: string, emailOrAccount: string) => removeMemberUseCase.execute(projectId, emailOrAccount);
export const claimInvites = (accountId: string, email: string) => claimInvitesUseCase.execute(accountId, email);
export const hasProjectInvite = (email: string) => memberQueries.hasProjectInvite(email);
