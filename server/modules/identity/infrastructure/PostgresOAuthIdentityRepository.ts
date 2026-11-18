import { one, q } from "../../../shared/database/index.js";
import type { IOAuthIdentityRepository } from "../ports/repositories.js";

export class PostgresOAuthIdentityRepository implements IOAuthIdentityRepository {
  async findAccountId(provider: string, subject: string): Promise<string | null> {
    const row = await one<{ account_id: string }>(
      `select account_id from account_oauth_identities where provider = $1 and subject = $2`,
      [provider, subject],
    );
    return row?.account_id ?? null;
  }

  async link(provider: string, subject: string, accountId: string, email: string): Promise<void> {
    await q(
      `insert into account_oauth_identities (provider, subject, account_id, email) values ($1, $2, $3, $4)
       on conflict (provider, subject) do nothing`,
      [provider, subject, accountId, email],
    );
  }
}
