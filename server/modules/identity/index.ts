import { PostgresAccountRepository } from "./infrastructure/PostgresAccountRepository.js";
import { PostgresSessionRepository } from "./infrastructure/PostgresSessionRepository.js";
import { PostgresLoginCodeRepository } from "./infrastructure/PostgresLoginCodeRepository.js";
import { BcryptArgonPasswordHasher } from "./infrastructure/BcryptArgonPasswordHasher.js";
import { PlatformMailerService } from "./infrastructure/PlatformMailerService.js";
import { RequestLoginCodeUseCase } from "./application/RequestLoginCodeUseCase.js";
import { VerifyLoginCodeUseCase } from "./application/VerifyLoginCodeUseCase.js";
import { LoginWithPasswordUseCase } from "./application/LoginWithPasswordUseCase.js";
import { UpdateAccountNameUseCase } from "./application/UpdateAccountNameUseCase.js";

// Domain & Models
export * from "./domain/Account.js";
export * from "./domain/Email.js";
export * from "./domain/Password.js";

// Repositories & Ports
export * from "./ports/repositories.js";

// Infrastructure Singleton Adapters
export const accountRepository = new PostgresAccountRepository();
export const sessionRepository = new PostgresSessionRepository();
export const loginCodeRepository = new PostgresLoginCodeRepository();
export const passwordHasher = new BcryptArgonPasswordHasher();
export const mailerService = new PlatformMailerService();

// Application Use Cases
export const requestLoginCodeUseCase = new RequestLoginCodeUseCase(
  loginCodeRepository,
  mailerService,
);

export const loginWithPasswordUseCase = new LoginWithPasswordUseCase(
  accountRepository,
  sessionRepository,
  passwordHasher,
  async (accountId, email) => {
    const { claimInvites } = await import("../../platform/members.js");
    await claimInvites(accountId, email);
  },
  async (accountId, newHash) => {
    const { q } = await import("../../platform/db.js");
    await q(`update accounts set password_hash = $2 where id = $1`, [accountId, newHash]);
  },
);

export const verifyLoginCodeUseCase = new VerifyLoginCodeUseCase(
  loginCodeRepository,
  accountRepository,
  sessionRepository,
  undefined,
  async (accountId, email) => {
    const { claimInvites } = await import("../../platform/members.js");
    await claimInvites(accountId, email);
  },
  async (email) => {
    const { canSignUp } = await import("../../platform/accounts.js");
    return canSignUp(email);
  },
  async (email) => {
    const { createAccount } = await import("../../platform/accounts.js");
    return createAccount(email, null, null);
  },
);

export const updateAccountNameUseCase = new UpdateAccountNameUseCase(accountRepository);
