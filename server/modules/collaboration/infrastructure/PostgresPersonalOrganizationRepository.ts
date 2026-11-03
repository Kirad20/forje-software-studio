import { q } from "../../../shared/database/index.js";
import type { IPersonalOrganizationRepository, QueryHandle } from "../ports/personalOrganizations.js";

export class PostgresPersonalOrganizationRepository implements IPersonalOrganizationRepository {
  constructor(private readonly db: QueryHandle = { query: q }) {}

  async create(orgId: string, accountId: string, name: string): Promise<void> {
    await this.db.query(
      `insert into organizations (id, name, personal) values ($1, $2, true) on conflict do nothing`,
      [orgId, name],
    );
    await this.db.query(
      `insert into org_members (org_id, account_id, role) values ($1, $2, 'owner') on conflict do nothing`,
      [orgId, accountId],
    );
  }

  async ensure(orgId: string, accountId: string): Promise<void> {
    await this.db.query(
      `insert into organizations (id, name, personal) select $1, coalesce(nullif(name, ''), split_part(email, '@', 1)), true from accounts where id = $2 on conflict do nothing`,
      [orgId, accountId],
    );
    await this.db.query(
      `insert into org_members (org_id, account_id, role) select $1, id, 'owner' from accounts where id = $2 on conflict do nothing`,
      [orgId, accountId],
    );
  }

  async delete(orgId: string): Promise<void> {
    await this.db.query(`delete from organizations where id = $1`, [orgId]);
  }
}
