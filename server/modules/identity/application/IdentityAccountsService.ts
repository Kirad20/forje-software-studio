import type { PlatformRole, Account } from "../domain/Account.js";
import { Password } from "../domain/Password.js";
import type { AccountAccessUpdate, AccountAdminView, AccountSecurity, IdentityAccountsDependencies, PublicAccount } from "../ports/accountLifecycle.js";

export class IdentityAccountsService {
  constructor(private readonly deps: IdentityAccountsDependencies) {}

  async canSignUp(email: string): Promise<boolean> {
    const normalized = email.toLowerCase();
    if (await this.deps.accounts.existsByEmail(normalized)) return true;
    if (!(await this.hasAccounts())) return false;
    if (this.deps.policy.signup === "open") return true;
    if (this.deps.policy.signup === "closed") return false;
    return this.deps.collaboration.hasInvite(normalized);
  }

  hasAccounts(): Promise<boolean> {
    return this.deps.accounts.hasAnyAccounts();
  }

  async createAccount(email: string, name: string | null, password: string | null, role: PlatformRole = "user"): Promise<string> {
    const id = this.deps.random.id();
    const passwordHash = password ? await this.deps.hasher.hash(password) : null;
    return this.deps.accounts.create({
      id, email: email.toLowerCase(), name, credits: this.deps.policy.freeCredits, passwordHash, role,
      personalOrgName: name || email.split("@")[0]!,
    });
  }

  createSession(accountId: string): Promise<string> {
    return this.deps.sessions.createSession(accountId, 30);
  }

  async setPassword(accountId: string, password: string): Promise<void> {
    await this.deps.accounts.setPassword(accountId, await this.deps.hasher.hash(password));
    await this.deps.sessions.deleteAllSessions(accountId);
  }

  async changePassword(accountId: string, current: string | undefined, next: string, email: string): Promise<void> {
    const hash = await this.deps.accounts.passwordHash(accountId);
    if (hash && !(await this.deps.hasher.verify(String(current ?? ""), hash))) {
      throw new Error("La contraseña actual no es correcta.");
    }
    Password.assertStrong(next, email);
    await this.setPassword(accountId, next);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const account = await this.deps.accounts.findResetAccount(email.trim().toLowerCase());
    if (!account || account.disabled) return;
    const code = this.deps.random.code(8);
    await this.deps.resets.save(account.id, this.deps.random.hash(code), 30);
    if (!(await this.deps.mailer.sendPasswordReset(email, code))) {
      console.log(`[forja] código para cambiar la contraseña de ${email}: ${code}`);
    }
  }

  async resetPassword(email: string, code: string, password: string): Promise<boolean> {
    const account = await this.deps.accounts.findResetAccount(email.trim().toLowerCase());
    if (!account || account.disabled) return false;
    const row = await this.deps.resets.find(account.id);
    if (!row || row.expired || row.attempts >= 5) return false;
    if (row.codeHash !== this.deps.random.hash(String(code ?? "").trim())) {
      await this.deps.resets.incrementAttempts(account.id);
      return false;
    }
    // Validate after verification without consuming a valid code for an invalid password.
    Password.assertStrong(password, account.email);
    await this.deps.resets.delete(account.id);
    await this.setPassword(account.id, password);
    return true;
  }

  async accountFromSession(token: string | undefined): Promise<PublicAccount | null> {
    if (!token) return null;
    const account = await this.deps.sessions.findAccountBySessionToken(token);
    return account ? this.publicAccount(account) : null;
  }

  endSession(token: string): Promise<void> {
    return this.deps.sessions.deleteSession(token);
  }

  accountFromApiToken(token: string | undefined): Promise<PublicAccount | null> {
    return token ? this.deps.tokens.findAccount(this.deps.random.hash(token)) : Promise.resolve(null);
  }

  async createApiToken(accountId: string, name: string, orgId: string | null = null): Promise<string> {
    const token = `fj_${this.deps.random.token()}`;
    await this.deps.tokens.create(this.deps.random.id(), accountId, name, this.deps.random.hash(token), orgId);
    return token;
  }

  listApiTokens(accountId: string) {
    return this.deps.tokens.list(accountId);
  }

  deleteApiToken(accountId: string, id: string): Promise<void> {
    return this.deps.tokens.delete(accountId, id);
  }

  signOutOtherSessions(accountId: string, currentToken: string): Promise<number> {
    return this.deps.sessions.deleteOtherSessions(accountId, currentToken);
  }

  countSessions(accountId: string): Promise<number> {
    return this.deps.sessions.countActiveSessions(accountId);
  }

  async deleteAccount(id: string): Promise<string[]> {
    const projects = await this.deps.projects.ownedProjectIds(id);
    await this.deps.accounts.delete(id);
    await this.deps.collaboration.deletePersonalOrg(id);
    return projects;
  }

  getAccount(id: string): Promise<PublicAccount | undefined> {
    return this.deps.accounts.getAccount(id);
  }

  listAccounts(excludeId?: string): Promise<AccountAdminView[]> {
    return this.deps.accounts.listAccounts(excludeId);
  }

  getAccountSecurity(id: string): Promise<AccountSecurity | undefined> {
    return this.deps.accounts.getSecurity(id);
  }

  updateAccountAccess(id: string, patch: AccountAccessUpdate): Promise<boolean> {
    return this.deps.accounts.updateAccess(id, patch);
  }

  private publicAccount(account: Account): PublicAccount {
    return { id: account.id, email: account.email.value, name: account.name, credits: account.credits, platformRole: account.platformRole };
  }
}
