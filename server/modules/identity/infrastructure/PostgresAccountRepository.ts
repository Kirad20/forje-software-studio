import { one, q } from "../../../platform/db.js";
import { Account, type PlatformRole } from "../domain/Account.js";
import { Email } from "../domain/Email.js";
import type { IAccountRepository } from "../ports/repositories.js";

interface AccountRow {
  id: string;
  email: string;
  name: string | null;
  credits: number;
  platformRole: PlatformRole;
  disabled: boolean;
  passwordHash: string | null;
  tokenOrgId?: string | null;
}

export class PostgresAccountRepository implements IAccountRepository {
  async findById(id: string): Promise<Account | null> {
    const row = await one<AccountRow>(
      `select id, email, name, credits, platform_role as "platformRole", disabled, password_hash as "passwordHash"
       from accounts where id = $1`,
      [id],
    );
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: Email | string): Promise<Account | null> {
    const address = typeof email === "string" ? email.toLowerCase().trim() : email.value;
    const row = await one<AccountRow>(
      `select id, email, name, credits, platform_role as "platformRole", disabled, password_hash as "passwordHash"
       from accounts where email = $1`,
      [address],
    );
    return row ? this.toDomain(row) : null;
  }

  async hasAnyAccounts(): Promise<boolean> {
    return !!(await one(`select 1 from accounts limit 1`));
  }

  async save(account: Account): Promise<void> {
    await q(
      `insert into accounts (id, email, name, credits, password_hash, platform_role, disabled)
       values ($1, $2, $3, $4, $5, $6, $7)
       on conflict (id) do update set email = excluded.email, name = excluded.name, credits = excluded.credits,
       password_hash = excluded.password_hash, platform_role = excluded.platform_role, disabled = excluded.disabled`,
      [account.id, account.email.value, account.name, account.credits, account.passwordHash ?? null, account.platformRole, account.disabled],
    );
  }

  async updateName(id: string, name: string): Promise<void> {
    await q(`update accounts set name = $2 where id = $1`, [id, name.trim().slice(0, 80) || null]);
  }

  async delete(id: string): Promise<void> {
    await q(`delete from accounts where id = $1`, [id]);
  }

  async rehashPassword(id: string, hash: string): Promise<void> {
    await q(`update accounts set password_hash = $2 where id = $1`, [id, hash]);
  }

  private toDomain(row: AccountRow): Account {
    return new Account({
      id: row.id,
      email: new Email(row.email),
      name: row.name,
      credits: row.credits,
      platformRole: row.platformRole,
      disabled: row.disabled,
      passwordHash: row.passwordHash,
      tokenOrgId: row.tokenOrgId,
    });
  }
}
