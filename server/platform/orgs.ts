import { q } from "./db.js";
import {
  ORG_ROLES,
  Organization,
  createOrgUseCase,
  manageOrgMemberUseCase,
  organizationRepository,
  type OrgRole,
} from "../modules/collaboration/index.js";

/**
 * Organizations are the tenant boundary. Every account has a personal organization (created with it),
 * and can create or be added to team organizations. Projects belong to one organization; its members
 * reach them. Platform admins manage accounts, never other tenants' projects.
 */
export type { OrgRole };
export { ORG_ROLES };

export interface Org {
  id: string;
  name: string;
  slug: string | null;
  personal: boolean;
  role: OrgRole;
}

export const personalOrgId = (accountId: string) => Organization.personalId(accountId);

/** Runs on any query handle (the pool or a transaction). */
type Query = { query: (sql: string, params?: unknown[]) => Promise<unknown> };

export async function createPersonalOrg(db: Query, accountId: string, name: string) {
  await db.query(`insert into organizations (id, name, personal) values ($1, $2, true) on conflict do nothing`, [personalOrgId(accountId), name]);
  await db.query(`insert into org_members (org_id, account_id, role) values ($1, $2, 'owner') on conflict do nothing`, [personalOrgId(accountId), accountId]);
}

/** Safety net for accounts created by older code paths: makes sure the personal organization exists. */
export async function ensurePersonalOrg(db: Query, accountId: string) {
  await db.query(
    `insert into organizations (id, name, personal) select $1, coalesce(nullif(name, ''), split_part(email, '@', 1)), true from accounts where id = $2 on conflict do nothing`,
    [personalOrgId(accountId), accountId],
  );
  await db.query(`insert into org_members (org_id, account_id, role) select $1, id, 'owner' from accounts where id = $2 on conflict do nothing`, [
    personalOrgId(accountId),
    accountId,
  ]);
}

export const listOrgs = (accountId: string) =>
  q<Org>(
    `select o.id, o.name, o.slug, o.personal, m.role from org_members m join organizations o on o.id = m.org_id
     where m.account_id = $1 order by o.personal desc, o.name`,
    [accountId],
  );

export async function orgRoleOf(orgId: string | null | undefined, accountId: string): Promise<OrgRole | null> {
  if (!orgId) return null;
  return organizationRepository.getOrgRole(orgId, accountId);
}

export async function createOrg(accountId: string, rawName: string): Promise<Org> {
  return createOrgUseCase.execute(accountId, rawName);
}

export const listOrgMembers = (orgId: string) =>
  q<{ accountId: string; email: string; name: string | null; role: OrgRole; createdAt: string }>(
    `select m.account_id as "accountId", a.email, a.name, m.role, m.created_at as "createdAt"
     from org_members m join accounts a on a.id = m.account_id where m.org_id = $1 order by m.created_at`,
    [orgId],
  );

/** Adds an existing account. People without an account are invited per project (project_invites) for now. */
export async function addOrgMember(orgId: string, actorRole: OrgRole, email: string, role: OrgRole) {
  await manageOrgMemberUseCase.addMember(orgId, actorRole, email, role);
}

export async function setOrgMemberRole(orgId: string, actorRole: OrgRole, accountId: string, role: OrgRole) {
  await manageOrgMemberUseCase.setRole(orgId, actorRole, accountId, role);
}

export async function removeOrgMember(orgId: string, actorRole: OrgRole, actorId: string, accountId: string) {
  await manageOrgMemberUseCase.removeMember(orgId, actorRole, actorId, accountId);
}
