import type { IAccountRepository, ILoginCodeRepository, ISessionRepository } from "../ports/repositories.js";

export class VerifyLoginCodeUseCase {
  constructor(
    private readonly loginCodeRepo: ILoginCodeRepository,
    private readonly accountRepo: IAccountRepository,
    private readonly sessionRepo: ISessionRepository,
    private readonly hashFn: (code: string) => string,
    private readonly onAccountVerified?: (accountId: string, email: string) => Promise<void>,
    private readonly canSignUpCheck?: (email: string) => Promise<boolean>,
    private readonly createAccountFn?: (email: string) => Promise<string>,
  ) {}

  async execute(email: string, code: string): Promise<string | null> {
    const normalized = email.trim().toLowerCase();
    const row = await this.loginCodeRepo.findCode(normalized);
    if (!row || row.expired || row.attempts >= 5) return null;

    if (row.codeHash !== this.hashFn(code.trim())) {
      await this.loginCodeRepo.incrementAttempts(normalized);
      return null;
    }

    await this.loginCodeRepo.deleteCode(normalized);
    let account = await this.accountRepo.findByEmail(normalized);
    if (account?.disabled) return null;

    if (!account) {
      if (this.canSignUpCheck && !(await this.canSignUpCheck(normalized))) return null;
      if (!this.createAccountFn) return null;
      const newId = await this.createAccountFn(normalized);
      account = await this.accountRepo.findById(newId);
      if (!account) return null;
    }

    if (this.onAccountVerified) {
      await this.onAccountVerified(account.id, normalized);
    }

    return this.sessionRepo.createSession(account.id);
  }
}
