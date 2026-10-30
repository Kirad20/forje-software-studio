import { config } from "../config.js";
import { newId, newToken, numericCode, sha256 } from "../lib/crypto.js";
import { sendPlatformEmail } from "../baas/email.js";
import { one, q } from "./db.js";

export interface Account {
  id: string;
  email: string;
  name: string | null;
  credits: number;
}

const SESSION_DAYS = 30;

/**
 * Studio sign-in has no password: a 6-digit code is sent to the email. Without SMTP
 * the code is printed to the server log, which is enough for local use.
 */
/** Returns true when the code went out by email. */
export async function requestLoginCode(email: string): Promise<boolean> {
  const code = numericCode(6);
  await q(
    `insert into login_codes (email, code_hash, attempts, expires_at) values ($1, $2, 0, now() + interval '15 minutes')
     on conflict (email) do update set code_hash = excluded.code_hash, attempts = 0, expires_at = excluded.expires_at`,
    [email.toLowerCase(), sha256(code)],
  );
  const sent = await sendPlatformEmail(
    email,
    `Tu código de acceso a Forja: ${code}`,
    `<p>Tu código para entrar en Forja es:</p><p style="font-size:28px;letter-spacing:4px"><b>${code}</b></p><p>Caduca en 15 minutos. Si no lo pediste, ignora este correo.</p>`,
  );
  // Without SMTP (local use) the console is the delivery channel.
  if (!sent) console.log(`[forja] código de acceso para ${email}: ${code}`);
  return sent;
}

export async function verifyLoginCode(email: string, code: string): Promise<string | null> {
  email = email.toLowerCase();
  const row = await one<{ code_hash: string; attempts: number; expired: boolean }>(
    `select code_hash, attempts, expires_at < now() as expired from login_codes where email = $1`,
    [email],
  );
  if (!row || row.expired || row.attempts >= 5) return null;
  if (row.code_hash !== sha256(code.trim())) {
    await q(`update login_codes set attempts = attempts + 1 where email = $1`, [email]);
    return null;
  }
  await q(`delete from login_codes where email = $1`, [email]);
  let account = await one<{ id: string }>(`select id from accounts where email = $1`, [email]);
  if (!account) {
    account = { id: newId() };
    await q(`insert into accounts (id, email, credits) values ($1, $2, $3)`, [account.id, email, config.freeCredits]);
  }
  const token = newToken();
  await q(
    `insert into account_sessions (token_hash, account_id, expires_at) values ($1, $2, now() + ($3 || ' days')::interval)`,
    [sha256(token), account.id, String(SESSION_DAYS)],
  );
  return token;
}

export async function accountFromSession(token: string | undefined): Promise<Account | null> {
  if (!token) return null;
  return (
    (await one<Account>(
      `select a.id, a.email, a.name, a.credits from account_sessions s join accounts a on a.id = s.account_id
       where s.token_hash = $1 and s.expires_at > now()`,
      [sha256(token)],
    )) ?? null
  );
}

export async function endSession(token: string): Promise<void> {
  await q(`delete from account_sessions where token_hash = $1`, [sha256(token)]);
}

export async function accountFromApiToken(token: string | undefined): Promise<Account | null> {
  if (!token) return null;
  const account = await one<Account>(
    `select a.id, a.email, a.name, a.credits from api_tokens t join accounts a on a.id = t.account_id where t.token_hash = $1`,
    [sha256(token)],
  );
  if (account) await q(`update api_tokens set last_used_at = now() where token_hash = $1`, [sha256(token)]);
  return account ?? null;
}

export async function createApiToken(accountId: string, name: string): Promise<string> {
  const token = `fj_${newToken()}`;
  await q(`insert into api_tokens (id, account_id, name, token_hash) values ($1, $2, $3, $4)`, [
    newId(),
    accountId,
    name,
    sha256(token),
  ]);
  return token;
}

export async function listApiTokens(accountId: string) {
  return q(
    `select id, name, last_used_at as "lastUsedAt", created_at as "createdAt" from api_tokens where account_id = $1 order by created_at desc`,
    [accountId],
  );
}

export async function deleteApiToken(accountId: string, id: string) {
  await q(`delete from api_tokens where account_id = $1 and id = $2`, [accountId, id]);
}

export async function updateAccountName(id: string, name: string) {
  await q(`update accounts set name = $2 where id = $1`, [id, name.trim().slice(0, 80) || null]);
}

/** Ends every studio session except the one making the request. */
export async function signOutOtherSessions(accountId: string, currentToken: string) {
  const r = await q(`delete from account_sessions where account_id = $1 and token_hash <> $2 returning 1`, [accountId, sha256(currentToken)]);
  return r.length;
}

export async function countSessions(accountId: string) {
  return (await one<{ n: number }>(`select count(*)::int as n from account_sessions where account_id = $1 and expires_at > now()`, [accountId]))!.n;
}

/** Deletes the account and, by cascade, every project, file, log and token it owns. */
export async function deleteAccount(id: string) {
  const projects = await q<{ id: string }>(`select id from projects where owner_id = $1`, [id]);
  await q(`delete from accounts where id = $1`, [id]);
  return projects.map((p) => p.id);
}

export async function getAccount(id: string): Promise<Account | undefined> {
  return one<Account>(`select id, email, name, credits from accounts where id = $1`, [id]);
}
