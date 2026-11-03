import { CheckAccessUseCase, type ProjectIdentity } from "./application/CheckAccessUseCase.js";
import { ClaimInvitesUseCase } from "./application/ClaimInvitesUseCase.js";
import { CreateOrgUseCase } from "./application/CreateOrgUseCase.js";
import { InviteMemberUseCase, type ProjectTarget } from "./application/InviteMemberUseCase.js";
import { ManageOrgMemberUseCase } from "./application/ManageOrgMemberUseCase.js";
import { MemberQueries } from "./application/MemberQueries.js";
import { OrganizationNamesQuery } from "./application/OrganizationNamesQuery.js";
import { OrganizationQueries } from "./application/OrganizationQueries.js";
import { OrganizationSkillsService } from "./application/OrganizationSkillsService.js";
import { PersonalOrganizationUseCase } from "./application/PersonalOrganizationUseCase.js";
import { RemoveMemberUseCase } from "./application/RemoveMemberUseCase.js";
import { Organization } from "./domain/Organization.js";
import type { OrgRole } from "./domain/OrgPolicy.js";
import type { IPersonalOrganizationRepository, QueryHandle } from "./ports/personalOrganizations.js";
import type {
  ICollaborationAccountRepository,
  ICollaborationMailerService,
  IMemberRepository,
  IOrganizationRepository,
} from "./ports/repositories.js";
import type { IOrganizationNameDirectory, IOrganizationQueries, IMemberQueries } from "./ports/queries.js";

export * from "./domain/MemberAccess.js";
export * from "./domain/ProjectInvite.js";
export * from "./domain/OrgPolicy.js";
export * from "./domain/Organization.js";
export * from "./domain/OrganizationSkill.js";
export * from "./ports/repositories.js";
export * from "./ports/queries.js";
export * from "./ports/personalOrganizations.js";
export * from "./ports/organizationSkills.js";
export type { ProjectIdentity, ProjectTarget };
export { OrganizationSkillsService } from "./application/OrganizationSkillsService.js";
export { PostgresMemberRepository } from "./infrastructure/PostgresMemberRepository.js";
export { PostgresCollaborationAccountRepository } from "./infrastructure/PostgresCollaborationAccountRepository.js";
export { PostgresOrganizationRepository } from "./infrastructure/PostgresOrganizationRepository.js";
export { PostgresPersonalOrganizationRepository } from "./infrastructure/PostgresPersonalOrganizationRepository.js";
export { PostgresOrganizationSkillsRepository } from "./infrastructure/PostgresOrganizationSkillsRepository.js";
export { PlatformCollaborationMailerService } from "./infrastructure/PlatformCollaborationMailerService.js";

export interface CollaborationModuleDependencies {
  members: IMemberRepository;
  accounts: ICollaborationAccountRepository;
  mailer: ICollaborationMailerService;
  organizations: IOrganizationRepository;
  organizationQueries: IOrganizationQueries;
  organizationNames: IOrganizationNameDirectory;
  memberQueries: IMemberQueries;
  personalOrganizations: IPersonalOrganizationRepository;
  personalOrganizationsForTransaction(tx: QueryHandle): IPersonalOrganizationRepository;
  id(): string;
  skills: OrganizationSkillsService;
}

export function createCollaborationModule(dependencies: CollaborationModuleDependencies) {
  const access = new CheckAccessUseCase(dependencies.members);
  const invite = new InviteMemberUseCase(dependencies.members, dependencies.accounts, dependencies.mailer);
  const removeMemberUseCase = new RemoveMemberUseCase(dependencies.members);
  const createOrgUseCase = new CreateOrgUseCase(dependencies.organizations, dependencies.id);
  const manageOrgMember = new ManageOrgMemberUseCase(dependencies.organizations, dependencies.accounts);
  const organizationQueries = new OrganizationQueries(dependencies.organizationQueries);
  const organizationNames = new OrganizationNamesQuery(dependencies.organizationNames);
  const memberQueries = new MemberQueries(dependencies.memberQueries);
  const claimInvites = new ClaimInvitesUseCase(dependencies.members);
  const personalOrganizations = new PersonalOrganizationUseCase(dependencies.personalOrganizations);

  return {
    personalOrgId: (accountId: string) => Organization.personalId(accountId),
    createPersonalOrg: (tx: QueryHandle, accountId: string, name: string) =>
      new PersonalOrganizationUseCase(dependencies.personalOrganizationsForTransaction(tx)).create(accountId, name),
    ensurePersonalOrg: (tx: QueryHandle, accountId: string) =>
      new PersonalOrganizationUseCase(dependencies.personalOrganizationsForTransaction(tx)).ensure(accountId),
    deletePersonalOrg: (accountId: string) => personalOrganizations.delete(accountId),
    listOrgs: (accountId: string) => organizationQueries.listOrgs(accountId),
    listOrgMembers: (orgId: string) => organizationQueries.listOrgMembers(orgId),
    organizationNames: (ids: string[]) => organizationNames.execute(ids),
    orgRoleOf: (orgId: string | null | undefined, accountId: string) => organizationQueries.orgRoleOf(orgId, accountId),
    createOrg: (accountId: string, rawName: string) => createOrgUseCase.execute(accountId, rawName),
    addOrgMember: (orgId: string, actorRole: OrgRole, email: string, role: OrgRole) =>
      manageOrgMember.addMember(orgId, actorRole, email, role),
    setOrgMemberRole: (orgId: string, actorRole: OrgRole, accountId: string, role: OrgRole) =>
      manageOrgMember.setRole(orgId, actorRole, accountId, role),
    removeOrgMember: (orgId: string, actorRole: OrgRole, actorId: string, accountId: string) =>
      manageOrgMember.removeMember(orgId, actorRole, actorId, accountId),
    accessOf: (accountId: string, project: ProjectIdentity | undefined) => access.execute(accountId, project),
    sharedProjectIds: (accountId: string) => memberQueries.sharedProjectIds(accountId),
    listMembers: (projectId: string) => memberQueries.listMembers(projectId),
    inviteMember: (project: ProjectTarget, inviterEmail: string, rawEmail: string) =>
      invite.execute(project, inviterEmail, rawEmail),
    removeMember: (projectId: string, emailOrAccount: string) => removeMemberUseCase.execute(projectId, emailOrAccount),
    claimInvites: (accountId: string, email: string) => claimInvites.execute(accountId, email),
    hasProjectInvite: (email: string) => memberQueries.hasProjectInvite(email),
    listOrgSkills: (orgId: string) => dependencies.skills.list(orgId),
    enabledOrgSkills: (orgId: string | null | undefined) => dependencies.skills.enabled(orgId),
    saveOrgSkill: (orgId: string, role: OrgRole, accountId: string, input: { name?: unknown; description?: unknown; body?: unknown; enabled?: unknown }) =>
      dependencies.skills.save(orgId, role, accountId, input),
    deleteOrgSkill: (orgId: string, role: OrgRole, name: string) => dependencies.skills.delete(orgId, role, name),
    async start() {},
    async stop() {},
  };
}

export type CollaborationModule = ReturnType<typeof createCollaborationModule>;
