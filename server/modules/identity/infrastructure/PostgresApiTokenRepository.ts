import { one, q } from "../../../shared/database/index.js";
import type { AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository, PublicAccount } from "../ports/accountLifecycle.js";

export class PostgresApiTokenRepository implements ApiTokenRepository {
  constructor(private readonly organizationNames: (ids: string[]) => Promise<Record<string, string>>) {}

  async create(id: string, accountId: string, name: string, hash: string, orgId: string | null, purpose: ApiTokenPurpose = "project", expiresAt?: Date): Promise<void> {
    const rows = await q(
      `insert into api_tokens (id, account_id, name, token_hash, org_id, purpose, expires_at)
       select $1, a.id, $3, $4, $5, $6, $7 from accounts a
       where a.id = $2 and ($6 <> 'admin' or (a.platform_role = 'admin' and not a.disabled))
       returning id`, [id, accountId, name, hash, orgId, purpose, expiresAt ?? null],
    );
    if (!rows.length) throw new Error("Solo administradores activos de la plataforma.");
  }

  async findAccount(hash: string, purpose: ApiTokenPurpose = "project"): Promise<PublicAccount | null> {
    const account = await one<PublicAccount>(
      `select a.id, a.email, a.name, a.credits, a.platform_role as "platformRole", t.org_id as "tokenOrgId"
       ${purpose === "admin" ? ", a.disabled" : ""}
       from api_tokens t join accounts a on a.id = t.account_id
       where t.token_hash = $1 and t.purpose = $2 and not a.disabled
       and t.revoked_at is null and (t.expires_at is null or t.expires_at > now())
       and ($2 <> 'admin' or a.platform_role = 'admin')`, [hash, purpose],
    );
    if (account) await q(`update api_tokens set last_used_at = now() where token_hash = $1`, [hash]);
    return account ?? null;
  }

  async list(accountId: string): Promise<ApiTokenInfo[]> {
    const rows = await q<Omit<ApiTokenInfo, "orgName">>(
      `select t.id, t.name, t.org_id as "orgId", t.last_used_at as "lastUsedAt", t.created_at as "createdAt"
       from api_tokens t where t.account_id = $1 and t.purpose = 'project' order by t.created_at desc`, [accountId],
    );
    const ids = [...new Set(rows.flatMap((row) => row.orgId ? [row.orgId] : []))];
    const names = ids.length ? await this.organizationNames(ids) : {};
    return rows.map((row) => ({ ...row, orgName: row.orgId ? names[row.orgId] ?? null : null }));
  }

  async delete(accountId: string, id: string): Promise<void> {
    await q(`delete from api_tokens where account_id = $1 and id = $2 and purpose = 'project'`, [accountId, id]);
  }

  listAdmin(accountId: string): Promise<AdminApiTokenInfo[]> {
    return q<AdminApiTokenInfo>(
      `select id, name, purpose, org_id as "orgId", null::text as "orgName",
       last_used_at as "lastUsedAt", created_at as "createdAt", expires_at as "expiresAt", revoked_at as "revokedAt"
       from api_tokens where account_id = $1 and purpose = 'admin' order by created_at desc`, [accountId],
    );
  }

  async revokeAdmin(accountId: string, id: string): Promise<boolean> {
    const rows = await q(
      `update api_tokens set revoked_at = now()
       where account_id = $1 and id = $2 and purpose = 'admin' and revoked_at is null returning id`, [accountId, id],
    );
    return rows.length > 0;
  }
}
