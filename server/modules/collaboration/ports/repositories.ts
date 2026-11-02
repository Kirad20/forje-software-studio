import type { Access } from "../domain/MemberAccess.js";
import type { OrgRole } from "../domain/OrgPolicy.js";

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

export interface OrganizationRecord {
  id: string;
  name: string;
  personal: boolean;
}

export interface IOrganizationRepository {
  findById(orgId: string): Promise<OrganizationRecord | null>;
  findBySlug(slug: string): Promise<OrganizationRecord | null>;
  isSlugTaken(slug: string): Promise<boolean>;
  saveOrg(org: { id: string; name: string; slug: string }): Promise<void>;
  addOrgMember(orgId: string, accountId: string, role: OrgRole): Promise<void>;
  getOrgRole(orgId: string, accountId: string): Promise<OrgRole | null>;
  getOwnerCount(orgId: string): Promise<number>;
  updateOrgMemberRole(orgId: string, accountId: string, role: OrgRole): Promise<void>;
  removeOrgMember(orgId: string, accountId: string): Promise<void>;
}
