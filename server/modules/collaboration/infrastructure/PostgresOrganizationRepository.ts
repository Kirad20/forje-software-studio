import { one, q } from "../../../platform/db.js";
import type { OrgRole } from "../domain/OrgPolicy.js";
import type { IOrganizationRepository, OrganizationRecord } from "../ports/repositories.js";

export class PostgresOrganizationRepository implements IOrganizationRepository {
  async findById(orgId: string): Promise<OrganizationRecord | null> {
    const row = await one<{ id: string; name: string; personal: boolean }>(
      `select id, name, personal from organizations where id = $1`,
      [orgId],
    );
    return row ?? null;
  }

  async findBySlug(slug: string): Promise<OrganizationRecord | null> {
    const row = await one<{ id: string; name: string; personal: boolean }>(
      `select id, name, personal from organizations where slug = $1`,
      [slug],
    );
    return row ?? null;
  }

  async isSlugTaken(slug: string): Promise<boolean> {
    return !!(await one(`select 1 from organizations where slug = $1`, [slug]));
  }

  async saveOrg(org: { id: string; name: string; slug: string }): Promise<void> {
    await q(`insert into organizations (id, name, slug) values ($1, $2, $3)`, [org.id, org.name, org.slug]);
  }

  async addOrgMember(orgId: string, accountId: string, role: OrgRole): Promise<void> {
    await q(
      `insert into org_members (org_id, account_id, role) values ($1, $2, $3)
       on conflict (org_id, account_id) do update set role = excluded.role`,
      [orgId, accountId, role],
    );
  }

  async getOrgRole(orgId: string, accountId: string): Promise<OrgRole | null> {
    const row = await one<{ role: OrgRole }>(
      `select role from org_members where org_id = $1 and account_id = $2`,
      [orgId, accountId],
    );
    return row?.role ?? null;
  }

  async getOwnerCount(orgId: string): Promise<number> {
    const row = await one<{ n: number }>(
      `select count(*)::int as n from org_members where org_id = $1 and role = 'owner'`,
      [orgId],
    );
    return row?.n ?? 0;
  }

  async updateOrgMemberRole(orgId: string, accountId: string, role: OrgRole): Promise<void> {
    await q(`update org_members set role = $3 where org_id = $1 and account_id = $2`, [orgId, accountId, role]);
  }

  async removeOrgMember(orgId: string, accountId: string): Promise<void> {
    await q(`delete from org_members where org_id = $1 and account_id = $2`, [orgId, accountId]);
  }
}
