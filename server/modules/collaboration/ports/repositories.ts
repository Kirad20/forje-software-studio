import type { Access } from "../domain/MemberAccess.js";

export interface SendInvitationParams {
  to: string;
  inviterEmail: string;
  projectId: string;
  projectName: string;
}

export interface ICollaborationMailerService {
  sendInvitation(params: SendInvitationParams): Promise<boolean>;
}

export interface CollaborationAccount {
  id: string;
  email: string;
}

export interface ICollaborationAccountRepository {
  findByEmail(email: string): Promise<CollaborationAccount | null>;
}

export interface IMemberRepository {
  checkAccess(accountId: string, projectId: string, orgId: string | null): Promise<boolean>;
  getSharedProjectIds(accountId: string): Promise<string[]>;
  claimInvites(accountId: string, email: string): Promise<number>;
  removeMember(projectId: string, emailOrAccount: string): Promise<void>;
  addMember(projectId: string, accountId: string, role?: string): Promise<void>;
  createInvite(projectId: string, email: string, invitedBy: string, role?: string): Promise<void>;
}
