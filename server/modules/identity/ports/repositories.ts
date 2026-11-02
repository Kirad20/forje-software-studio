import type { Account } from "../domain/Account.js";
import type { Email } from "../domain/Email.js";

export interface IAccountRepository {
  findById(id: string): Promise<Account | null>;
  findByEmail(email: Email | string): Promise<Account | null>;
  hasAnyAccounts(): Promise<boolean>;
  save(account: Account): Promise<void>;
  updateName(id: string, name: string): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ISessionRepository {
  createSession(accountId: string, days?: number): Promise<string>;
  findAccountBySessionToken(token: string): Promise<Account | null>;
  deleteSession(token: string): Promise<void>;
  deleteOtherSessions(accountId: string, currentToken: string): Promise<number>;
  countActiveSessions(accountId: string): Promise<number>;
}

export interface ILoginCodeRepository {
  saveCode(email: string, code: string, expiresMinutes?: number): Promise<void>;
  findCode(email: string): Promise<{ codeHash: string; attempts: number; expired: boolean } | null>;
  incrementAttempts(email: string): Promise<void>;
  deleteCode(email: string): Promise<void>;
}

export interface IPasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
  needsRehash(hash: string): boolean;
  burnCheck(password: string): Promise<void>;
}

export interface IMailerService {
  sendLoginCode(email: string, code: string): Promise<boolean>;
  sendPasswordReset(email: string, code: string): Promise<boolean>;
}
