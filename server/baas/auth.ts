import { hashPassword, newId, newToken, numericCode, sha256, verifyPassword } from "../lib/crypto.js";
import { projectDb } from "./projectDb.js";
import { sendEmail } from "./email.js";

/**
 * Sign-in for the users of an app. Accounts live in the app's own database, so each
 * project has its own users; the project owner is never mixed with them.
 */
export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

const SESSION_DAYS = 30;
const MAX_FAILED = 5;
const LOCK_MINUTES = 15;
export const sessionCookie = (projectId: string) => `forja_s_${projectId}`;

const USER_COLS = `id, email, name, role`;

export async function signUp(projectId: string, input: { email: string; password: string; name?: string }) {
  const email = normalizeEmail(input.email);
  if (input.password.length < 8) throw new AuthError("La contraseña debe tener al menos 8 caracteres.");
  const db = projectDb(projectId);
  if (await db.one(`select 1 from _forja_users where email = $1`, [email])) {
    throw new AuthError("Ya existe una cuenta con ese correo.", 409);
  }
  const user = (await db.one<AppUser>(
    `insert into _forja_users (id, email, name, password_hash) values ($1, $2, $3, $4) returning ${USER_COLS}`,
    [newId(), email, input.name ?? null, await hashPassword(input.password)],
  ))!;
  return { user, token: await createSession(projectId, user.id) };
}

export async function signIn(projectId: string, input: { email: string; password: string }) {
  const email = normalizeEmail(input.email);
  const db = projectDb(projectId);
  const row = await db.one<AppUser & { password_hash: string | null; locked: boolean }>(
    `select ${USER_COLS}, password_hash, coalesce(locked_until > now(), false) as locked from _forja_users where email = $1`,
    [email],
  );
  if (row?.locked) throw new AuthError("Demasiados intentos. Prueba de nuevo en unos minutos.", 429);
  const ok = !!row?.password_hash && (await verifyPassword(input.password, row.password_hash));
  if (!row || !ok) {
    if (row) {
      await db.query(
        `update _forja_users set failed_logins = failed_logins + 1,
           locked_until = case when failed_logins + 1 >= $2 then now() + ($3 || ' minutes')::interval else locked_until end
         where id = $1`,
        [row.id, MAX_FAILED, String(LOCK_MINUTES)],
      );
    }
    throw new AuthError("Correo o contraseña incorrectos.", 401);
  }
  await db.query(`update _forja_users set failed_logins = 0, locked_until = null where id = $1`, [row.id]);
  const user = { id: row.id, email: row.email, name: row.name, role: row.role };
  return { user, token: await createSession(projectId, user.id) };
}

async function createSession(projectId: string, userId: string) {
  const token = newToken();
  await projectDb(projectId).query(
    `insert into _forja_sessions (token_hash, user_id, expires_at) values ($1, $2, now() + ($3 || ' days')::interval)`,
    [sha256(token), userId, String(SESSION_DAYS)],
  );
  return token;
}

export async function userFromSession(projectId: string, token: string | undefined): Promise<AppUser | null> {
  if (!token) return null;
  return (
    (await projectDb(projectId).one<AppUser>(
      `select u.id, u.email, u.name, u.role from _forja_sessions s join _forja_users u on u.id = s.user_id
       where s.token_hash = $1 and s.expires_at > now()`,
      [sha256(token)],
    )) ?? null
  );
}

export async function signOut(projectId: string, token: string) {
  await projectDb(projectId).query(`delete from _forja_sessions where token_hash = $1`, [sha256(token)]);
}

const RESET_LIMIT_PER_HOUR = 3;

/** Same answer whether or not the email exists, so the form can't reveal who is registered. */
export async function requestPasswordReset(projectId: string, rawEmail: string, appName: string) {
  const email = normalizeEmail(rawEmail);
  const db = projectDb(projectId);
  const user = await db.one<{ id: string }>(`select id from _forja_users where email = $1`, [email]);
  if (!user) return;
  const recent = await db.one<{ n: number }>(
    `select count(*)::int as n from _forja_reset_codes where user_id = $1 and created_at > now() - interval '1 hour'`,
    [user.id],
  );
  if ((recent?.n ?? 0) >= RESET_LIMIT_PER_HOUR) return;
  const code = numericCode(8);
  await db.query(`update _forja_reset_codes set used = true where user_id = $1 and not used`, [user.id]);
  await db.query(
    `insert into _forja_reset_codes (user_id, code_hash, expires_at) values ($1, $2, now() + interval '15 minutes')`,
    [user.id, sha256(code)],
  );
  await sendEmail(projectId, {
    to: email,
    subject: `Tu código para restablecer la contraseña de ${appName}`,
    html: `<p>Tu código es:</p><p style="font-size:28px;letter-spacing:4px"><b>${code}</b></p><p>Caduca en 15 minutos.</p>`,
  });
}

export async function confirmPasswordReset(projectId: string, input: { email: string; code: string; password: string }) {
  if (input.password.length < 8) throw new AuthError("La contraseña debe tener al menos 8 caracteres.");
  const db = projectDb(projectId);
  const row = await db.one<{ id: number; user_id: string; code_hash: string; attempts: number }>(
    `select c.id, c.user_id, c.code_hash, c.attempts from _forja_reset_codes c join _forja_users u on u.id = c.user_id
     where u.email = $1 and not c.used and c.expires_at > now() order by c.created_at desc limit 1`,
    [normalizeEmail(input.email)],
  );
  if (!row || row.attempts >= 5) throw new AuthError("El código no es válido o caducó.");
  if (row.code_hash !== sha256(input.code.trim())) {
    await db.query(`update _forja_reset_codes set attempts = attempts + 1 where id = $1`, [row.id]);
    throw new AuthError("El código no es válido o caducó.");
  }
  await db.transaction(async (tx) => {
    await tx.query(`update _forja_reset_codes set used = true where id = $1`, [row.id]);
    await tx.query(`update _forja_users set password_hash = $2, failed_logins = 0, locked_until = null where id = $1`, [
      row.user_id,
      await hashPassword(input.password),
    ]);
    // A reset signs the account out everywhere.
    await tx.query(`delete from _forja_sessions where user_id = $1`, [row.user_id]);
  });
}

/** Creates the owner's admin account without a password; they set one with "forgot password". */
export async function ensureOwnerAdmin(projectId: string, ownerEmail: string) {
  const db = projectDb(projectId);
  const email = normalizeEmail(ownerEmail);
  if (await db.one(`select 1 from _forja_users where email = $1`, [email])) return false;
  await db.query(`insert into _forja_users (id, email, role) values ($1, $2, 'admin')`, [newId(), email]);
  return true;
}

export async function setTemporaryPassword(projectId: string, email: string, password: string) {
  const db = projectDb(projectId);
  const r = await db.query(`update _forja_users set password_hash = $2, failed_logins = 0, locked_until = null where email = $1 returning id`, [
    normalizeEmail(email),
    await hashPassword(password),
  ]);
  if (!r.length) throw new AuthError("No existe ese usuario.", 404);
}

function normalizeEmail(email: string) {
  const e = String(email ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) throw new AuthError("Correo no válido.");
  return e;
}
