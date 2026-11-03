import { newToken, sha256 } from "../../../lib/crypto.js";
import { one, q } from "../../../platform/db.js";
import { Account, type PlatformRole } from "../domain/Account.js";
import { Email } from "../domain/Email.js";
import type { ISessionRepository } from "../ports/repositories.js";

interface SessionAccountRow {
  id: string;
  email: string;
  name: string | null;
  credits: number;
  platformRole: PlatformRole;
  disabled: boolean;
}

export class PostgresSessionRepository implements ISessionRepository {
  async createSession(accountId: string, days = 30): Promise<string> {
    const token = newToken();
    await q(
      `insert into account_sessions (token_hash, account_id, expires_at) values ($1, $2, now() + ($3 || ' days')::interval)`,
      [sha256(token), accountId, String(days)],
    );
    return token;
  }

  async findAccountBySessionToken(token: string): Promise<Account | null> {
    if (!token) return null;
    const row = await one<SessionAccountRow>(
      `select a.id, a.email, a.name, a.credits, a.platform_role as "platformRole", a.disabled
       from account_sessions s join accounts a on a.id = s.account_id
       where s.token_hash = $1 and s.expires_at > now() and not a.disabled`,
      [sha256(token)],
    );
    if (!row) return null;
    return new Account({
      id: row.id,
      email: new Email(row.email),
      name: row.name,
      credits: row.credits,
      platformRole: row.platformRole,
      disabled: row.disabled,
    });
  }

  async deleteSession(token: string): Promise<void> {
    await q(`delete from account_sessions where token_hash = $1`, [sha256(token)]);
  }

  async deleteAllSessions(accountId: string): Promise<void> {
    await q(`delete from account_sessions where account_id = $1`, [accountId]);
  }

  async deleteOtherSessions(accountId: string, currentToken: string): Promise<number> {
    const r = await q(`delete from account_sessions where account_id = $1 and token_hash <> $2 returning 1`, [
      accountId,
      sha256(currentToken),
    ]);
    return r.length;
  }

  async countActiveSessions(accountId: string): Promise<number> {
    const res = await one<{ n: number }>(
      `select count(*)::int as n from account_sessions where account_id = $1 and expires_at > now()`,
      [accountId],
    );
    return res?.n ?? 0;
  }
}
