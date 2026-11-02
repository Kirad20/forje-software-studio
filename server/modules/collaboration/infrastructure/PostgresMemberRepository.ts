import { one, q } from "../../../platform/db.js";
import type { IMemberRepository } from "../ports/repositories.js";

export class PostgresMemberRepository implements IMemberRepository {
  async checkAccess(accountId: string, projectId: string, orgId: string | null): Promise<boolean> {
    const m = await one(
      `select 1 from project_members where project_id = $1 and account_id = $2
       union all select 1 from org_members where org_id = $3 and account_id = $2 and $3 is not null`,
      [projectId, accountId, orgId],
    );
    return !!m;
  }

  async getSharedProjectIds(accountId: string): Promise<string[]> {
    const rows = await q<{ id: string }>(
      `select project_id as id from project_members where account_id = $1
       union select p.id from projects p join org_members m on m.org_id = p.org_id where m.account_id = $1 and p.owner_id <> $1`,
      [accountId],
    );
    return rows.map((r) => r.id);
  }

  async claimInvites(accountId: string, email: string): Promise<number> {
    const rows = await q<{ project_id: string }>(`delete from project_invites where email = $1 returning project_id`, [email.toLowerCase()]);
    for (const r of rows) {
      await q(`insert into project_members (project_id, account_id) values ($1, $2) on conflict do nothing`, [r.project_id, accountId]);
    }
    return rows.length;
  }

  async removeMember(projectId: string, emailOrAccount: string): Promise<void> {
    await q(`delete from project_members where project_id = $1 and account_id in (select id from accounts where email = $2 or id = $2)`, [
      projectId,
      emailOrAccount.toLowerCase(),
    ]);
    await q(`delete from project_invites where project_id = $1 and email = $2`, [projectId, emailOrAccount.toLowerCase()]);
  }

  async addMember(projectId: string, accountId: string, _role = "member"): Promise<void> {
    await q(`insert into project_members (project_id, account_id) values ($1, $2) on conflict do nothing`, [projectId, accountId]);
  }

  async createInvite(projectId: string, email: string, invitedBy: string, _role = "member"): Promise<void> {
    await q(`insert into project_invites (project_id, email, invited_by) values ($1, $2, $3) on conflict do nothing`, [projectId, email, invitedBy]);
  }
}
