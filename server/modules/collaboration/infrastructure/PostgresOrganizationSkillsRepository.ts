import { q } from "../../../shared/database/index.js";
import type { OrganizationSkill, OrganizationSkillContent } from "../domain/OrganizationSkill.js";
import type { OrganizationSkillsRepository } from "../ports/organizationSkills.js";

export class PostgresOrganizationSkillsRepository implements OrganizationSkillsRepository {
  list(orgId: string) {
    return q<OrganizationSkill>(
      `select name, description, body, enabled, updated_at as "updatedAt" from org_skills where org_id = $1 order by name`,
      [orgId],
    );
  }

  enabled(orgId: string) {
    return q<Pick<OrganizationSkill, "name" | "description" | "body">>(
      `select name, description, body from org_skills where org_id = $1 and enabled order by name`,
      [orgId],
    );
  }

  async countExcept(orgId: string, name: string): Promise<number> {
    const rows = await q<{ count: number }>(
      `select count(*)::int as count from org_skills where org_id = $1 and name <> $2`,
      [orgId, name],
    );
    return rows[0]?.count ?? 0;
  }

  async save(orgId: string, accountId: string, skill: OrganizationSkillContent): Promise<void> {
    await q(
      `insert into org_skills (org_id, name, description, body, enabled, updated_by) values ($1, $2, $3, $4, $5, $6)
       on conflict (org_id, name) do update set description = excluded.description, body = excluded.body, enabled = excluded.enabled, updated_by = excluded.updated_by, updated_at = now()`,
      [orgId, skill.name, skill.description, skill.body, skill.enabled, accountId],
    );
  }

  async delete(orgId: string, name: string): Promise<void> {
    await q(`delete from org_skills where org_id = $1 and name = $2`, [orgId, name]);
  }
}
