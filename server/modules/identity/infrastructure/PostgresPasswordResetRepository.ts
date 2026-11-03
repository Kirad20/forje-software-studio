import { one, q } from "../../../shared/database/index.js";
import type { PasswordResetRepository } from "../ports/accountLifecycle.js";

export class PostgresPasswordResetRepository implements PasswordResetRepository {
  async save(accountId: string, codeHash: string, minutes: number): Promise<void> {
    await q(
      `insert into password_resets (account_id, code_hash, attempts, expires_at) values ($1, $2, 0, now() + ($3 || ' minutes')::interval)
       on conflict (account_id) do update set code_hash = excluded.code_hash, attempts = 0, expires_at = excluded.expires_at`,
      [accountId, codeHash, String(minutes)],
    );
  }

  async find(accountId: string) {
    const row = await one<{ code_hash: string; attempts: number; expired: boolean }>(
      `select code_hash, attempts, expires_at < now() as expired from password_resets where account_id = $1`, [accountId],
    );
    return row ? { codeHash: row.code_hash, attempts: row.attempts, expired: row.expired } : null;
  }

  async incrementAttempts(accountId: string): Promise<void> {
    await q(`update password_resets set attempts = attempts + 1 where account_id = $1`, [accountId]);
  }

  async delete(accountId: string): Promise<void> {
    await q(`delete from password_resets where account_id = $1`, [accountId]);
  }
}
