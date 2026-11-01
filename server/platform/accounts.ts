import { config } from "../config.js";
import { burnPasswordCheck, hashPassword, newId, newToken, numericCode, passwordNeedsRehash, sha256, verifyPassword } from "../lib/crypto.js";
import { sendPlatformEmail } from "../baas/email.js";
import { one, platformDb, q } from "./db.js";
import { createPersonalOrg, personalOrgId } from "./orgs.js";

export interface Account {
  id: string;
  email: string;
  name: string | null;
  credits: number;
  platformRole: "admin" | "user";
  /** Set when the request came in with an API token limited to one organization. */
  tokenOrgId?: string | null;
}

const ACCOUNT_COLS = `a.id, a.email, a.name, a.credits, a.platform_role as "platformRole"`;

const SESSION_DAYS = 30;

/**
 * Studio sign-in: email + password, or a 6-digit code sent to the email (which also creates new accounts, since
 * it proves the address is theirs). Without SMTP the code is printed to the server log, which is enough for local use.
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
  let account = await one<{ id: string; disabled: boolean }>(`select id, disabled from accounts where email = $1`, [email]);
  if (account?.disabled) return null;
  if (!account) {
    // The code proves the email is theirs, but whether a new account may exist is the platform's call.
    if (!(await canSignUp(email))) return null;
    account = { id: await createAccount(email, null, null), disabled: false };
  }
  const { claimInvites } = await import("./members.js");
  await claimInvites(account.id, email);
  return createSession(account.id);
}

/** Signup policy. With no accounts yet, only the first-run setup (with its token) may create one. */
export async function canSignUp(email: string): Promise<boolean> {
  if (await one(`select 1 from accounts where email = $1`, [email.toLowerCase()])) return true;
  if (!(await hasAccounts())) return false;
  if (config.signup === "open") return true;
  if (config.signup === "closed") return false;
  return !!(await one(`select 1 from project_invites where email = $1`, [email.toLowerCase()]));
}

export async function hasAccounts(): Promise<boolean> {
  return !!(await one(`select 1 from accounts limit 1`));
}

/** Creates an account with its personal organization. `role` "admin" is for the first-run setup only. */
export async function createAccount(email: string, name: string | null, password: string | null, role: "admin" | "user" = "user"): Promise<string> {
  const id = newId();
  const hash = password ? await hashPassword(password) : null;
  const db = await platformDb();
  await db.transaction(async (tx) => {
    // The first account must come from setup: a race between two setups (or a setup and a code signup) loses here.
    await tx.query(
      `insert into accounts (id, email, name, credits, password_hash, password_changed_at, platform_role)
       select $1::text, $2::text, $3::text, $4::int, $5::text, case when $5::text is null then null else now() end, $6::text
       where ($6::text = 'admin' and not exists (select 1 from accounts)) or ($6::text = 'user' and exists (select 1 from accounts))`,
      [id, email.toLowerCase(), name, config.freeCredits, hash, role],
    );
    const created = await tx.query(`select 1 from accounts where id = $1`, [id]);
    if (!created.rows.length) throw new Error("No se puede crear la cuenta ahora mismo.");
    await createPersonalOrg(tx, id, name || email.split("@")[0]!);
  });
  return id;
}

export async function createSession(accountId: string): Promise<string> {
  const token = newToken();
  await q(
    `insert into account_sessions (token_hash, account_id, expires_at) values ($1, $2, now() + ($3 || ' days')::interval)`,
    [sha256(token), accountId, String(SESSION_DAYS)],
  );
  return token;
}

// --- Passwords -------------------------------------------------------------------------

const COMMON = new Set(["password", "contraseña", "1234567890", "qwertyuiop", "contrasena", "password123", "123456789a"]);

/** Throws a message fit for the user. */
export function assertStrongPassword(password: string, email: string) {
  if (typeof password !== "string" || password.length < 10) throw new Error("La contraseña debe tener al menos 10 caracteres.");
  if (password.length > 128) throw new Error("La contraseña es demasiado larga (máximo 128 caracteres).");
  if (password.toLowerCase() === email.toLowerCase() || COMMON.has(password.toLowerCase())) throw new Error("Elige una contraseña menos predecible.");
}

/** Returns a session token, or null for any failure (unknown email, wrong password, disabled, no password set). */
export async function loginWithPassword(email: string, password: string): Promise<string | null> {
  const row = await one<{ id: string; password_hash: string | null; disabled: boolean }>(
    `select id, password_hash, disabled from accounts where email = $1`,
    [email.trim().toLowerCase()],
  );
  if (!row?.password_hash) {
    await burnPasswordCheck(String(password ?? "")); // same cost whether or not the account exists
    return null;
  }
  if (!(await verifyPassword(String(password ?? ""), row.password_hash)) || row.disabled) return null;
  if (passwordNeedsRehash(row.password_hash)) {
    await q(`update accounts set password_hash = $2 where id = $1`, [row.id, await hashPassword(password)]);
  }
  const { claimInvites } = await import("./members.js");
  await claimInvites(row.id, email);
  return createSession(row.id);
}

/** Sets the password and ends every session; the caller then opens a fresh one if the person is signed in. */
export async function setPassword(accountId: string, password: string) {
  await q(`update accounts set password_hash = $2, password_changed_at = now() where id = $1`, [accountId, await hashPassword(password)]);
  await q(`delete from account_sessions where account_id = $1`, [accountId]);
}

export async function changePassword(accountId: string, current: string | undefined, next: string, email: string) {
  const row = await one<{ password_hash: string | null }>(`select password_hash from accounts where id = $1`, [accountId]);
  // Whoever has a password must prove it; a code-only account sets its first one while signed in.
  if (row?.password_hash && !(await verifyPassword(String(current ?? ""), row.password_hash))) throw new Error("La contraseña actual no es correcta.");
  assertStrongPassword(next, email);
  await setPassword(accountId, next);
}

/** Mails a reset code. Silent about unknown emails so the form cannot be used to list accounts. */
export async function requestPasswordReset(email: string): Promise<void> {
  const account = await one<{ id: string; disabled: boolean }>(`select id, disabled from accounts where email = $1`, [email.trim().toLowerCase()]);
  if (!account || account.disabled) return;
  const code = numericCode(8);
  await q(
    `insert into password_resets (account_id, code_hash, attempts, expires_at) values ($1, $2, 0, now() + interval '30 minutes')
     on conflict (account_id) do update set code_hash = excluded.code_hash, attempts = 0, expires_at = excluded.expires_at`,
    [account.id, sha256(code)],
  );
  const sent = await sendPlatformEmail(
    email,
    `Código para cambiar tu contraseña de Forja: ${code}`,
    `<p>Usa este código para elegir una contraseña nueva:</p><p style="font-size:28px;letter-spacing:4px"><b>${code}</b></p><p>Caduca en 30 minutos. Si no lo pediste, ignora este correo: tu contraseña sigue igual.</p>`,
  );
  if (!sent) console.log(`[forja] código para cambiar la contraseña de ${email}: ${code}`);
}

export async function resetPassword(email: string, code: string, password: string): Promise<boolean> {
  const account = await one<{ id: string; email: string }>(`select id, email from accounts where email = $1 and not disabled`, [email.trim().toLowerCase()]);
  if (!account) return false;
  const row = await one<{ code_hash: string; attempts: number; expired: boolean }>(
    `select code_hash, attempts, expires_at < now() as expired from password_resets where account_id = $1`,
    [account.id],
  );
  if (!row || row.expired || row.attempts >= 5) return false;
  if (row.code_hash !== sha256(String(code ?? "").trim())) {
    await q(`update password_resets set attempts = attempts + 1 where account_id = $1`, [account.id]);
    return false;
  }
  assertStrongPassword(password, account.email); // checked after the code, so a bad password does not burn the code
  await q(`delete from password_resets where account_id = $1`, [account.id]);
  await setPassword(account.id, password);
  return true;
}

export async function accountFromSession(token: string | undefined): Promise<Account | null> {
  if (!token) return null;
  return (
    (await one<Account>(
      `select ${ACCOUNT_COLS} from account_sessions s join accounts a on a.id = s.account_id
       where s.token_hash = $1 and s.expires_at > now() and not a.disabled`,
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
    `select ${ACCOUNT_COLS}, t.org_id as "tokenOrgId" from api_tokens t join accounts a on a.id = t.account_id
     where t.token_hash = $1 and not a.disabled`,
    [sha256(token)],
  );
  if (account) await q(`update api_tokens set last_used_at = now() where token_hash = $1`, [sha256(token)]);
  return account ?? null;
}

/** `orgId` limits the token to one organization's projects (the caller has checked membership). */
export async function createApiToken(accountId: string, name: string, orgId: string | null = null): Promise<string> {
  const token = `fj_${newToken()}`;
  await q(`insert into api_tokens (id, account_id, name, token_hash, org_id) values ($1, $2, $3, $4, $5)`, [
    newId(),
    accountId,
    name,
    sha256(token),
    orgId,
  ]);
  return token;
}

export async function listApiTokens(accountId: string) {
  return q(
    `select t.id, t.name, t.org_id as "orgId", o.name as "orgName", t.last_used_at as "lastUsedAt", t.created_at as "createdAt"
     from api_tokens t left join organizations o on o.id = t.org_id where t.account_id = $1 order by t.created_at desc`,
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
  await q(`delete from organizations where id = $1`, [personalOrgId(id)]);
  return projects.map((p) => p.id);
}

export async function getAccount(id: string): Promise<Account | undefined> {
  return one<Account>(`select a.id, a.email, a.name, a.credits, a.platform_role as "platformRole" from accounts a where a.id = $1`, [id]);
}
