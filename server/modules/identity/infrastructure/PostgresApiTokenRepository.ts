import { one, q } from "../../../shared/database/index.js";
import type { ApiTokenInfo, ApiTokenRepository, PublicAccount } from "../ports/accountLifecycle.js";

export class PostgresApiTokenRepository implements ApiTokenRepository {
  constructor(private readonly organizationNames: (ids: string[]) => Promise<Record<string, string>>) {}

  async create(id: string, accountId: string, name: string, hash: string, orgId: string | null): Promise<void> {
    await q(`insert into api_tokens (id, account_id, name, token_hash, org_id) values ($1, $2, $3, $4, $5)`, [id, accountId, name, hash, orgId]);
  }

  async findAccount(hash: string): Promise<PublicAccount | null> {
    const account = await one<PublicAccount>(
      `select a.id, a.email, a.name, a.credits, a.platform_role as "platformRole", t.org_id as "tokenOrgId"
       from api_tokens t join accounts a on a.id = t.account_id where t.token_hash = $1 and not a.disabled`, [hash],
    );
    if (account) await q(`update api_tokens set last_used_at = now() where token_hash = $1`, [hash]);
    return account ?? null;
  }

  async list(accountId: string): Promise<ApiTokenInfo[]> {
    const rows = await q<Omit<ApiTokenInfo, "orgName">>(
      `select t.id, t.name, t.org_id as "orgId", t.last_used_at as "lastUsedAt", t.created_at as "createdAt"
       from api_tokens t where t.account_id = $1 order by t.created_at desc`, [accountId],
    );
    const ids = [...new Set(rows.flatMap((row) => row.orgId ? [row.orgId] : []))];
    const names = ids.length ? await this.organizationNames(ids) : {};
    return rows.map((row) => ({ ...row, orgName: row.orgId ? names[row.orgId] ?? null : null }));
  }

  async delete(accountId: string, id: string): Promise<void> {
    await q(`delete from api_tokens where account_id = $1 and id = $2`, [accountId, id]);
  }
}
