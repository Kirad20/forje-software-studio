import { config } from "../../config.js";
import { newId, newToken, numericCode, sha256 } from "../../lib/crypto.js";
import { PostgresAccountRepository } from "./infrastructure/PostgresAccountRepository.js";
import { PostgresSessionRepository } from "./infrastructure/PostgresSessionRepository.js";
import { PostgresLoginCodeRepository } from "./infrastructure/PostgresLoginCodeRepository.js";
import { PostgresAccountLifecycleRepository } from "./infrastructure/PostgresAccountLifecycleRepository.js";
import { PostgresPasswordResetRepository } from "./infrastructure/PostgresPasswordResetRepository.js";
import { PostgresApiTokenRepository } from "./infrastructure/PostgresApiTokenRepository.js";
import { BcryptArgonPasswordHasher } from "./infrastructure/BcryptArgonPasswordHasher.js";
import { PlatformMailerService } from "./infrastructure/PlatformMailerService.js";
import { RequestLoginCodeUseCase } from "./application/RequestLoginCodeUseCase.js";
import { VerifyLoginCodeUseCase } from "./application/VerifyLoginCodeUseCase.js";
import { LoginWithPasswordUseCase } from "./application/LoginWithPasswordUseCase.js";
import { UpdateAccountNameUseCase } from "./application/UpdateAccountNameUseCase.js";
import { IdentityAccountsService } from "./application/IdentityAccountsService.js";
import { BootstrapService } from "./application/BootstrapService.js";
import { NodeBootstrapCrypto } from "./infrastructure/NodeBootstrapCrypto.js";

export * from "./domain/Account.js";
export * from "./domain/Email.js";
export * from "./domain/Password.js";
export * from "./ports/repositories.js";
export * from "./ports/accountLifecycle.js";
export { IdentityAccountsService } from "./application/IdentityAccountsService.js";
export { BootstrapService, SetupError } from "./application/BootstrapService.js";
export * from "./ports/bootstrap.js";

export const accountRepository = new PostgresAccountRepository();
export const sessionRepository = new PostgresSessionRepository();
export const loginCodeRepository = new PostgresLoginCodeRepository();
export const passwordHasher = new BcryptArgonPasswordHasher();
export const mailerService = new PlatformMailerService();

const lifecycleRepository = new PostgresAccountLifecycleRepository(async (tx, id, name) => {
  const { createPersonalOrg } = await import("../collaboration/index.js");
  await createPersonalOrg(tx, id, name);
});

export const identityAccountsService = new IdentityAccountsService({
  accounts: lifecycleRepository,
  sessions: sessionRepository,
  resets: new PostgresPasswordResetRepository(),
  tokens: new PostgresApiTokenRepository(async (ids) => {
    const { organizationNames } = await import("../collaboration/index.js");
    return organizationNames(ids);
  }),
  hasher: passwordHasher,
  random: { id: newId, token: newToken, code: numericCode, hash: sha256 },
  mailer: mailerService,
  collaboration: {
    async hasInvite(email) {
      const { hasProjectInvite } = await import("../collaboration/index.js");
      return hasProjectInvite(email);
    },
    async deletePersonalOrg(id) {
      const { deletePersonalOrg } = await import("../collaboration/index.js");
      await deletePersonalOrg(id);
    },
  },
  projects: {
    async ownedProjectIds(id) {
      const { listAccountOwnedProjectIds } = await import("../projects/index.js");
      return listAccountOwnedProjectIds(id);
    },
  },
  policy: config,
});

const claimInvites = async (accountId: string, email: string) => {
  const collaboration = await import("../collaboration/index.js");
  await collaboration.claimInvites(accountId, email);
};

export const requestLoginCodeUseCase = new RequestLoginCodeUseCase(loginCodeRepository, mailerService, () => numericCode(6));
export const loginWithPasswordUseCase = new LoginWithPasswordUseCase(
  accountRepository, sessionRepository, passwordHasher, claimInvites,
  (id, hash) => accountRepository.rehashPassword(id, hash),
);
export const verifyLoginCodeUseCase = new VerifyLoginCodeUseCase(
  loginCodeRepository, accountRepository, sessionRepository, sha256, claimInvites,
  (email) => identityAccountsService.canSignUp(email),
  (email) => identityAccountsService.createAccount(email, null, null),
);
export const updateAccountNameUseCase = new UpdateAccountNameUseCase(accountRepository);
export const bootstrapService = new BootstrapService(identityAccountsService, new NodeBootstrapCrypto(), config);
