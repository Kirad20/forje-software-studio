import type { OrgRole } from "../domain/OrgPolicy.js";

export interface Org {
  id: string;
  name: string;
  slug: string | null;
  personal: boolean;
  role: OrgRole;
}

export interface MemberView {
  accountId: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export interface OrgMemberView extends MemberView {
  role: OrgRole;
}

export interface InviteView {
  email: string;
  role: string;
  createdAt: string;
}

export interface IOrganizationQueries {
  listOrgs(accountId: string): Promise<Org[]>;
  listOrgMembers(orgId: string): Promise<OrgMemberView[]>;
  getOrgRole(orgId: string, accountId: string): Promise<OrgRole | null>;
}

export interface IOrganizationNameDirectory {
  organizationNames(ids: string[]): Promise<Record<string, string>>;
}

export interface IMemberQueries {
  listMembers(projectId: string): Promise<{ members: MemberView[]; invites: InviteView[] }>;
  getSharedProjectIds(accountId: string): Promise<string[]>;
  hasProjectInvite(email: string): Promise<boolean>;
}
