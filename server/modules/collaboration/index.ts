import { PostgresMemberRepository } from "./infrastructure/PostgresMemberRepository.js";
import { PostgresCollaborationAccountRepository } from "./infrastructure/PostgresCollaborationAccountRepository.js";
import { PlatformCollaborationMailerService } from "./infrastructure/PlatformCollaborationMailerService.js";
import { CheckAccessUseCase } from "./application/CheckAccessUseCase.js";
import { InviteMemberUseCase } from "./application/InviteMemberUseCase.js";

// Domain & Models
export * from "./domain/MemberAccess.js";
export * from "./domain/ProjectInvite.js";
export * from "./ports/repositories.js";

// Infrastructure Singleton Adapters
export const memberRepository = new PostgresMemberRepository();
export const collaborationAccountRepository = new PostgresCollaborationAccountRepository();
export const collaborationMailerService = new PlatformCollaborationMailerService();

// Application Use Cases
export const checkAccessUseCase = new CheckAccessUseCase(memberRepository);
export const inviteMemberUseCase = new InviteMemberUseCase(
  memberRepository,
  collaborationAccountRepository,
  collaborationMailerService,
);
