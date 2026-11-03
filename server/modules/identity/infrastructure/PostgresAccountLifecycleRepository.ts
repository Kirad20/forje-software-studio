import { one, platformDb, q, type Tx } from "../../../platform/db.js";
import type { AccountCreation, AccountLifecycleRepository, PublicAccount } from "../ports/accountLifecycle.js";

export class PostgresAccountLifecycleRepository implements AccountLifecycleRepository {
  constructor(private readonly createPersonalOrg: (tx: Tx, id: string, name: string) => Promise<unknown>) {}

  async existsByEmail(email: string): Promise<boolean> {
    return !!(await one(`select 1 from accounts where email = $1`, [email]));
  }

  async hasAnyAccounts(): Promise<boolean> {
    return !!(await one(`select 1 from accounts limit 1`));
  }

  async create(account: AccountCreation): Promise<string> {
    const db = await platformDb();
    await db.transaction(async (tx) => {
      await tx.query(
        `insert into accounts (id, email, name, credits, password_hash, password_changed_at, platform_role)
         select $1::text, $2::text, $3::text, $4::int, $5::text, case when $5::text is null then null else now() end, $6::text
         where ($6::text = 'admin' and not exists (select 1 from accounts)) or ($6::text = 'user' and exists (select 1 from accounts))`,
        [account.id, account.email, account.name, account.credits, account.passwordHash, account.role],
      );
      const created = await tx.query(`select 1 from accounts where id = $1`, [account.id]);
      if (!created.rows.length) throw new Error("No se puede crear la cuenta ahora mismo.");
      await this.createPersonalOrg(tx, account.id, account.personalOrgName);
    });
    return account.id;
  }

  async passwordHash(id: string): Promise<string | null> {
    const row = await one<{ password_hash: string | null }>(`select password_hash from accounts where id = $1`, [id]);
    return row?.password_hash ?? null;
  }

  async setPassword(id: string, hash: string): Promise<void> {
    await q(`update accounts set password_hash = $2, password_changed_at = now() where id = $1`, [id, hash]);
  }

  async findResetAccount(email: string): Promise<{ id: string; email: string; disabled: boolean } | null> {
    return (await one<{ id: string; email: string; disabled: boolean }>(`select id, email, disabled from accounts where email = $1`, [email])) ?? null;
  }

  getAccount(id: string): Promise<PublicAccount | undefined> {
    return one<PublicAccount>(`select a.id, a.email, a.name, a.credits, a.platform_role as "platformRole" from accounts a where a.id = $1`, [id]);
  }

  async delete(id: string): Promise<void> {
    await q(`delete from accounts where id = $1`, [id]);
  }
}
