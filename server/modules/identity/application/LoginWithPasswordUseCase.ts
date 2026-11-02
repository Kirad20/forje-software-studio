import type { IAccountRepository, IPasswordHasher, ISessionRepository } from "../ports/repositories.js";

export class LoginWithPasswordUseCase {
  constructor(
    private readonly accountRepo: IAccountRepository,
    private readonly sessionRepo: ISessionRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly onLoginSuccess?: (accountId: string, email: string) => Promise<void>,
    private readonly onPasswordRehash?: (accountId: string, newHash: string) => Promise<void>,
  ) {}

  async execute(email: string, password: string): Promise<string | null> {
    const normalized = email.trim().toLowerCase();
    const account = await this.accountRepo.findByEmail(normalized);

    if (!account?.passwordHash) {
      await this.passwordHasher.burnCheck(String(password ?? ""));
      return null;
    }

    if (account.disabled) {
      return null;
    }

    const valid = await this.passwordHasher.verify(String(password ?? ""), account.passwordHash);
    if (!valid) {
      return null;
    }

    if (this.passwordHasher.needsRehash(account.passwordHash) && this.onPasswordRehash) {
      const newHash = await this.passwordHasher.hash(password);
      await this.onPasswordRehash(account.id, newHash);
    }

    if (this.onLoginSuccess) {
      await this.onLoginSuccess(account.id, normalized);
    }

    return this.sessionRepo.createSession(account.id);
  }
}
