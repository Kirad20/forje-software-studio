import { newId } from "../../lib/crypto.js";
import { PostgresMemberRepository } from "./infrastructure/PostgresMemberRepository.js";
import { PostgresCollaborationAccountRepository } from "./infrastructure/PostgresCollaborationAccountRepository.js";
import { PlatformCollaborationMailerService } from "./infrastructure/PlatformCollaborationMailerService.js";
import { PostgresOrganizationRepository } from "./infrastructure/PostgresOrganizationRepository.js";
import { CheckAccessUseCase } from "./application/CheckAccessUseCase.js";
import { InviteMemberUseCase } from "./application/InviteMemberUseCase.js";
import { CreateOrgUseCase } from "./application/CreateOrgUseCase.js";
import { ManageOrgMemberUseCase } from "./application/ManageOrgMemberUseCase.js";

// Domain & Models
export * from "./domain/MemberAccess.js";
export * from "./domain/ProjectInvite.js";
export * from "./domain/OrgPolicy.js";
export * from "./domain/Organization.js";
export * from "./ports/repositories.js";

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
export const createOrgUseCase = new CreateOrgUseCase(organizationRepository, newId);
export const manageOrgMemberUseCase = new ManageOrgMemberUseCase(
  organizationRepository,
  collaborationAccountRepository,
);
