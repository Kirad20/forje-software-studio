import { BootstrapService } from "./application/BootstrapService.js";
import { IdentityAccountsService } from "./application/IdentityAccountsService.js";
import { LoginWithPasswordUseCase } from "./application/LoginWithPasswordUseCase.js";
import { RequestLoginCodeUseCase } from "./application/RequestLoginCodeUseCase.js";
import { UpdateAccountNameUseCase } from "./application/UpdateAccountNameUseCase.js";
import { VerifyLoginCodeUseCase } from "./application/VerifyLoginCodeUseCase.js";
import { Password } from "./domain/Password.js";
import type { BootstrapCrypto } from "./ports/bootstrap.js";
import type { IdentityAccountsDependencies } from "./ports/accountLifecycle.js";
import type { IAccountRepository, ILoginCodeRepository } from "./ports/repositories.js";

export * from "./domain/Email.js";
export * from "./domain/Password.js";
export * from "./ports/repositories.js";
export * from "./ports/accountLifecycle.js";
export * from "./ports/bootstrap.js";
export * from "./contracts.js";
export { Account as AccountEntity } from "./domain/Account.js";
export { PostgresAccountRepository } from "./infrastructure/PostgresAccountRepository.js";
export { PostgresSessionRepository } from "./infrastructure/PostgresSessionRepository.js";
export { PostgresLoginCodeRepository } from "./infrastructure/PostgresLoginCodeRepository.js";
export { PostgresAccountLifecycleRepository } from "./infrastructure/PostgresAccountLifecycleRepository.js";
export { PostgresPasswordResetRepository } from "./infrastructure/PostgresPasswordResetRepository.js";
export { PostgresApiTokenRepository } from "./infrastructure/PostgresApiTokenRepository.js";
export { PostgresMcpOAuthRepository } from "./infrastructure/PostgresMcpOAuthRepository.js";
export { BcryptArgonPasswordHasher } from "./infrastructure/BcryptArgonPasswordHasher.js";
export { PlatformMailerService } from "./infrastructure/PlatformMailerService.js";
export { NodeBootstrapCrypto } from "./infrastructure/NodeBootstrapCrypto.js";
export { BootstrapService, SetupError } from "./application/BootstrapService.js";
export { IdentityAccountsService, AdminApiTokenError } from "./application/IdentityAccountsService.js";

export interface IdentityModuleDependencies {
  accounts: IdentityAccountsDependencies;
  accountRepository: IAccountRepository;
  loginCodes: ILoginCodeRepository;
  bootstrapCrypto: BootstrapCrypto;
  bootstrapPolicy: { bootstrapToken: string; publicUrl: string };
  claimInvites(accountId: string, email: string): Promise<void>;
  log?(message: string): void;
}

export function createIdentityModule(dependencies: IdentityModuleDependencies) {
  const { accounts } = dependencies;
  const service = new IdentityAccountsService(accounts);
  const claimInvites = dependencies.claimInvites;
  const requestLoginCodeUseCase = new RequestLoginCodeUseCase(
    dependencies.loginCodes,
    accounts.mailer,
    () => accounts.random.code(6),
  );
  const loginWithPasswordUseCase = new LoginWithPasswordUseCase(
    dependencies.accountRepository,
    accounts.sessions,
    accounts.hasher,
    claimInvites,
    (id, hash) => accounts.accounts.setPassword(id, hash),
  );
  const verifyLoginCodeUseCase = new VerifyLoginCodeUseCase(
    dependencies.loginCodes,
    dependencies.accountRepository,
    accounts.sessions,
    accounts.random.hash,
    claimInvites,
    (email) => service.canSignUp(email),
    (email) => service.createAccount(email, null, null),
  );
  const updateAccountNameUseCase = new UpdateAccountNameUseCase(dependencies.accountRepository);
  const bootstrap = new BootstrapService(
    service,
    dependencies.bootstrapCrypto,
    dependencies.bootstrapPolicy,
    dependencies.log,
  );

  return {
    service,
    bootstrap,
    requestLoginCode: (email: string) => requestLoginCodeUseCase.execute(email),
    verifyLoginCode: (email: string, code: string) => verifyLoginCodeUseCase.execute(email, code),
    canSignUp: (email: string) => service.canSignUp(email),
    hasAccounts: () => service.hasAccounts(),
    createAccount: (email: string, name: string | null, password: string | null, role: "admin" | "user" = "user") =>
      service.createAccount(email, name, password, role),
    createSession: (accountId: string) => service.createSession(accountId),
    assertStrongPassword: (password: string, email: string) => Password.assertStrong(password, email),
    loginWithPassword: (email: string, password: string) => loginWithPasswordUseCase.execute(email, password),
    setPassword: (accountId: string, password: string) => service.setPassword(accountId, password),
    changePassword: (accountId: string, current: string | undefined, next: string, email: string) =>
      service.changePassword(accountId, current, next, email),
    requestPasswordReset: (email: string) => service.requestPasswordReset(email),
    resetPassword: (email: string, code: string, password: string) => service.resetPassword(email, code, password),
    accountFromSession: (token: string | undefined) => service.accountFromSession(token),
    endSession: (token: string) => service.endSession(token),
    accountFromApiToken: (token: string | undefined) => service.accountFromApiToken(token),
    accountFromAdminApiToken: (token: string | undefined) => service.accountFromAdminApiToken(token),
    createAdminApiToken: (accountId: string, name: string, expiresAt?: Date) => service.createAdminApiToken(accountId, name, expiresAt),
    listAdminApiTokens: (accountId: string) => service.listAdminApiTokens(accountId),
    revokeAdminApiToken: (accountId: string, id: string) => service.revokeAdminApiToken(accountId, id),
    createApiToken: (accountId: string, name: string, orgId: string | null = null, projectId: string | null = null) =>
      service.createApiToken(accountId, name, orgId, projectId),
    listApiTokens: (accountId: string) => service.listApiTokens(accountId),
    deleteApiToken: (accountId: string, id: string) => service.deleteApiToken(accountId, id),
    updateAccountName: (id: string, name: string) => updateAccountNameUseCase.execute(id, name),
    signOutOtherSessions: (accountId: string, currentToken: string) => service.signOutOtherSessions(accountId, currentToken),
    countSessions: (accountId: string) => service.countSessions(accountId),
    deleteAccount: (id: string) => service.deleteAccount(id),
    getAccount: (id: string) => service.getAccount(id),
    listAccounts: (excludeId?: string) => service.listAccounts(excludeId),
    getAccountSecurity: (id: string) => service.getAccountSecurity(id),
    updateAccountAccess: (id: string, patch: import("./ports/accountLifecycle.js").AccountAccessUpdate) =>
      service.updateAccountAccess(id, patch),
    initBootstrap: () => bootstrap.init(),
    needsSetup: () => bootstrap.needsSetup(),
    completeSetup: (input: { token: string; email: string; password: string; name?: string }) => bootstrap.complete(input),
    async start() {
      await bootstrap.init();
    },
    stop() {
      bootstrap.stop();
    },
  };
}

export type IdentityModule = ReturnType<typeof createIdentityModule>;
