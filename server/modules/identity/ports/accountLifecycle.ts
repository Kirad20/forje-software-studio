import type { PlatformRole } from "../domain/Account.js";
import type { IMailerService, IPasswordHasher, ISessionRepository } from "./repositories.js";

/** Public account projection never exposes credential material or internal state. */
export interface PublicAccount {
  id: string;
  email: string;
  name: string | null;
  credits: number;
  platformRole: PlatformRole;
  tokenOrgId?: string | null;
}

export interface AccountCreation {
  id: string;
  email: string;
  name: string | null;
  credits: number;
  passwordHash: string | null;
  role: PlatformRole;
  personalOrgName: string;
}

export interface AccountAdminView {
  id: string;
  email: string;
  name: string | null;
  platformRole: PlatformRole;
  disabled: boolean;
  credits: number;
  createdAt: Date | string;
}

export interface AccountSecurity {
  hasPassword: boolean;
  changedAt: Date | string | null;
}

export interface AccountAccessUpdate {
  disabled?: boolean;
  platformRole?: PlatformRole;
}

export interface AccountLifecycleRepository {
  existsByEmail(email: string): Promise<boolean>;
  hasAnyAccounts(): Promise<boolean>;
  /** Atomically enforce the first-admin/established-user gate and create the personal organization. */
  create(account: AccountCreation): Promise<string>;
  passwordHash(id: string): Promise<string | null>;
  setPassword(id: string, hash: string): Promise<void>;
  findResetAccount(email: string): Promise<{ id: string; email: string; disabled: boolean } | null>;
  getAccount(id: string): Promise<PublicAccount | undefined>;
  listAccounts(excludeId?: string): Promise<AccountAdminView[]>;
  getSecurity(id: string): Promise<AccountSecurity | undefined>;
  updateAccess(id: string, patch: AccountAccessUpdate): Promise<boolean>;
  delete(id: string): Promise<void>;
}

export interface PasswordResetRepository {
  save(accountId: string, codeHash: string, minutes: number): Promise<void>;
  find(accountId: string): Promise<{ codeHash: string; attempts: number; expired: boolean } | null>;
  incrementAttempts(accountId: string): Promise<void>;
  delete(accountId: string): Promise<void>;
}

export interface ApiTokenInfo {
  id: string;
  name: string;
  orgId: string | null;
  orgName: string | null;
  lastUsedAt: Date | null;
  createdAt: Date;
}

export interface ApiTokenRepository {
  create(id: string, accountId: string, name: string, hash: string, orgId: string | null): Promise<void>;
  /** Resolve an active account and record usage when found. */
  findAccount(hash: string): Promise<PublicAccount | null>;
  list(accountId: string): Promise<ApiTokenInfo[]>;
  delete(accountId: string, id: string): Promise<void>;
}

export interface IdentityRandom {
  id(): string;
  token(): string;
  code(length: number): string;
  hash(value: string): string;
}

export interface IdentityAccountsDependencies {
  accounts: AccountLifecycleRepository;
  sessions: ISessionRepository & { deleteAllSessions(accountId: string): Promise<void> };
  resets: PasswordResetRepository;
  tokens: ApiTokenRepository;
  hasher: IPasswordHasher;
  random: IdentityRandom;
  mailer: IMailerService;
  collaboration: {
    hasInvite(email: string): Promise<boolean>;
    deletePersonalOrg(accountId: string): Promise<void>;
  };
  projects: { ownedProjectIds(accountId: string): Promise<string[]> };
  policy: { signup: string; freeCredits: number };
}
