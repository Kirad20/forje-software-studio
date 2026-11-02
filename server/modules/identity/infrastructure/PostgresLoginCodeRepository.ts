import { sha256 } from "../../../lib/crypto.js";
import { one, q } from "../../../platform/db.js";
import type { ILoginCodeRepository } from "../ports/repositories.js";

export class PostgresLoginCodeRepository implements ILoginCodeRepository {
  async saveCode(email: string, code: string, expiresMinutes = 15): Promise<void> {
    await q(
      `insert into login_codes (email, code_hash, attempts, expires_at)
       values ($1, $2, 0, now() + ($3 || ' minutes')::interval)
       on conflict (email) do update set code_hash = excluded.code_hash, attempts = 0, expires_at = excluded.expires_at`,
      [email.toLowerCase(), sha256(code), String(expiresMinutes)],
    );
  }

  async findCode(email: string): Promise<{ codeHash: string; attempts: number; expired: boolean } | null> {
    const row = await one<{ code_hash: string; attempts: number; expired: boolean }>(
      `select code_hash, attempts, expires_at < now() as expired from login_codes where email = $1`,
      [email.toLowerCase()],
    );
    if (!row) return null;
    return {
      codeHash: row.code_hash,
      attempts: row.attempts,
      expired: row.expired,
    };
  }

  async incrementAttempts(email: string): Promise<void> {
    await q(`update login_codes set attempts = attempts + 1 where email = $1`, [email.toLowerCase()]);
  }

  async deleteCode(email: string): Promise<void> {
    await q(`delete from login_codes where email = $1`, [email.toLowerCase()]);
  }
}
