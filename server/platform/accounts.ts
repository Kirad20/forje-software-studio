import {
  identityAccountsService,
  requestLoginCodeUseCase,
  verifyLoginCodeUseCase,
  loginWithPasswordUseCase,
  updateAccountNameUseCase,
  Password,
} from "../modules/identity/index.js";
import type { PublicAccount } from "../modules/identity/index.js";

export interface Account extends PublicAccount {}

/** Compatibility API; identity owns all account policies and persistence. */
export async function requestLoginCode(email: string): Promise<boolean> {
  return requestLoginCodeUseCase.execute(email);
}

export async function verifyLoginCode(email: string, code: string): Promise<string | null> {
  return verifyLoginCodeUseCase.execute(email, code);
}

export async function canSignUp(email: string): Promise<boolean> {
  return identityAccountsService.canSignUp(email);
}

export async function hasAccounts(): Promise<boolean> {
  return identityAccountsService.hasAccounts();
}

export async function createAccount(email: string, name: string | null, password: string | null, role: "admin" | "user" = "user"): Promise<string> {
  return identityAccountsService.createAccount(email, name, password, role);
}

export async function createSession(accountId: string): Promise<string> {
  return identityAccountsService.createSession(accountId);
}

export function assertStrongPassword(password: string, email: string) {
  Password.assertStrong(password, email);
}

export async function loginWithPassword(email: string, password: string): Promise<string | null> {
  return loginWithPasswordUseCase.execute(email, password);
}

export async function setPassword(accountId: string, password: string) {
  await identityAccountsService.setPassword(accountId, password);
}

export async function changePassword(accountId: string, current: string | undefined, next: string, email: string) {
  await identityAccountsService.changePassword(accountId, current, next, email);
}

export async function requestPasswordReset(email: string): Promise<void> {
  await identityAccountsService.requestPasswordReset(email);
}

export async function resetPassword(email: string, code: string, password: string): Promise<boolean> {
  return identityAccountsService.resetPassword(email, code, password);
}

export async function accountFromSession(token: string | undefined): Promise<Account | null> {
  return identityAccountsService.accountFromSession(token);
}

export async function endSession(token: string): Promise<void> {
  await identityAccountsService.endSession(token);
}

export async function accountFromApiToken(token: string | undefined): Promise<Account | null> {
  return identityAccountsService.accountFromApiToken(token);
}

export async function createApiToken(accountId: string, name: string, orgId: string | null = null): Promise<string> {
  return identityAccountsService.createApiToken(accountId, name, orgId);
}

export async function listApiTokens(accountId: string) {
  return identityAccountsService.listApiTokens(accountId);
}

export async function deleteApiToken(accountId: string, id: string) {
  await identityAccountsService.deleteApiToken(accountId, id);
}

export async function updateAccountName(id: string, name: string) {
  await updateAccountNameUseCase.execute(id, name);
}

export async function signOutOtherSessions(accountId: string, currentToken: string) {
  return identityAccountsService.signOutOtherSessions(accountId, currentToken);
}

export async function countSessions(accountId: string) {
  return identityAccountsService.countSessions(accountId);
}

export async function deleteAccount(id: string) {
  return identityAccountsService.deleteAccount(id);
}

export async function getAccount(id: string): Promise<Account | undefined> {
  return identityAccountsService.getAccount(id);
}
