import type { AuthPorts } from "../ports/auth.js";
import type { AppEnv } from "../domain/contracts.js";
import { AuthError, AUTH_POLICY, normalizeEmail } from "../domain/auth.js";
export { AuthError } from "../domain/auth.js";

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

const SESSION_DAYS = AUTH_POLICY.sessionDays;
const MAX_FAILED = AUTH_POLICY.maxFailed;
const LOCK_MINUTES = AUTH_POLICY.lockMinutes;
export const sessionCookie = (projectId: string) => `forja_s_${projectId}`;

export function createAuth({ hashPassword, newId, newToken, numericCode, sha256, verifyPassword, projectDb, sendEmail }: AuthPorts) {

async function signUp(projectId: string, input: { email: string; password: string; name?: string }, env: AppEnv = "published") {
  const email = normalizeEmail(input.email);
  if (input.password.length < 8) throw new AuthError("La contraseña debe tener al menos 8 caracteres.");
  const db = projectDb(projectId, env);
  if (await db.one("authEmailExists", [email])) {
    throw new AuthError("Ya existe una cuenta con ese correo.", 409);
  }
  const user = (await db.one<AppUser>(
    "authCreateUser",
    [newId(), email, input.name ?? null, await hashPassword(input.password)],
  ))!;
  return { user, token: await createSession(projectId, user.id, env) };
}

async function signIn(projectId: string, input: { email: string; password: string }, env: AppEnv = "published") {
  const email = normalizeEmail(input.email);
  const db = projectDb(projectId, env);
  const row = await db.one<AppUser & { password_hash: string | null; locked: boolean }>(
    "authSignInUser",
    [email],
  );
  if (row?.locked) throw new AuthError("Demasiados intentos. Prueba de nuevo en unos minutos.", 429);
  const ok = !!row?.password_hash && (await verifyPassword(input.password, row.password_hash));
  if (!row || !ok) {
    if (row) {
      await db.query(
        "authFailedLogin",
        [row.id, MAX_FAILED, String(LOCK_MINUTES)],
      );
    }
    throw new AuthError("Correo o contraseña incorrectos.", 401);
  }
  await db.query("authClearFailures", [row.id]);
  const user = { id: row.id, email: row.email, name: row.name, role: row.role };
  return { user, token: await createSession(projectId, user.id, env) };
}

async function createSession(projectId: string, userId: string, env: AppEnv) {
  const token = newToken();
  await projectDb(projectId, env).query(
    "authCreateSession",
    [sha256(token), userId, String(SESSION_DAYS)],
  );
  return token;
}

async function userFromSession(projectId: string, token: string | undefined, env: AppEnv = "published"): Promise<AppUser | null> {
  if (!token) return null;
  return (
    (await projectDb(projectId, env).one<AppUser>(
      "authSessionUser",
      [sha256(token)],
    )) ?? null
  );
}

async function signOut(projectId: string, token: string, env: AppEnv = "published") {
  await projectDb(projectId, env).query("authDeleteSession", [sha256(token)]);
}

const RESET_LIMIT_PER_HOUR = AUTH_POLICY.resetLimitPerHour;

/** Same answer whether or not the email exists, so the form can't reveal who is registered. */
async function requestPasswordReset(projectId: string, rawEmail: string, appName: string, env: AppEnv = "published") {
  const email = normalizeEmail(rawEmail);
  const db = projectDb(projectId, env);
  const user = await db.one<{ id: string }>("authResetUser", [email]);
  if (!user) return;
  const recent = await db.one<{ n: number }>(
    "authRecentResets",
    [user.id],
  );
  if ((recent?.n ?? 0) >= RESET_LIMIT_PER_HOUR) return;
  const code = numericCode(8);
  await db.query("authInvalidateResets", [user.id]);
  await db.query(
    "authCreateReset",
    [user.id, sha256(code)],
  );
  await sendEmail(projectId, {
    to: email,
    subject: `Tu código para restablecer la contraseña de ${appName}`,
    html: `<p>Tu código es:</p><p style="font-size:28px;letter-spacing:4px"><b>${code}</b></p><p>Caduca en 15 minutos.</p>`,
  }, env);
}

async function confirmPasswordReset(projectId: string, input: { email: string; code: string; password: string }, env: AppEnv = "published") {
  if (input.password.length < 8) throw new AuthError("La contraseña debe tener al menos 8 caracteres.");
  const db = projectDb(projectId, env);
  const row = await db.one<{ id: number; user_id: string; code_hash: string; attempts: number }>(
    "authLatestReset",
    [normalizeEmail(input.email)],
  );
  if (!row || row.attempts >= 5) throw new AuthError("El código no es válido o caducó.");
  if (row.code_hash !== sha256(input.code.trim())) {
    await db.query("authFailedReset", [row.id]);
    throw new AuthError("El código no es válido o caducó.");
  }
  await db.transaction(async (tx) => {
    await tx.query("authUseReset", [row.id]);
    await tx.query("authChangePassword", [
      row.user_id,
      await hashPassword(input.password),
    ]);
    // A reset signs the account out everywhere.
    await tx.query("authRevokeUserSessions", [row.user_id]);
  });
}

/** Creates the owner's admin account without a password; they set one with "forgot password". */
async function ensureOwnerAdmin(projectId: string, ownerEmail: string, env: AppEnv = "published") {
  const db = projectDb(projectId, env);
  const email = normalizeEmail(ownerEmail);
  if (await db.one("authEmailExists", [email])) return false;
  await db.query("authCreateAdmin", [newId(), email]);
  return true;
}

/**
 * A 5-minute session for an existing user, so the builder can test endpoints as that
 * user. Only reachable from builder tools, never from an app's own routes.
 */
async function testSession(projectId: string, email: string, env: AppEnv = "preview"): Promise<{ token: string; user: AppUser }> {
  const db = projectDb(projectId, env);
  const user = await db.one<AppUser>("authFindUser", [normalizeEmail(email)]);
  if (!user) throw new AuthError(`No existe el usuario ${email} en esta app.`, 404);
  const token = newToken();
  await db.query("authCreateTestSession", [sha256(token), user.id]);
  return { token, user };
}

async function endSession(projectId: string, token: string, env: AppEnv = "preview") {
  await projectDb(projectId, env).query("authDeleteSession", [sha256(token)]);
}

async function setTemporaryPassword(projectId: string, email: string, password: string, env: AppEnv = "preview") {
  const db = projectDb(projectId, env);
  const r = await db.query("authTemporaryPassword", [
    normalizeEmail(email),
    await hashPassword(password),
  ]);
  if (!r.length) throw new AuthError("No existe ese usuario.", 404);
}

return { signUp, signIn, userFromSession, signOut, requestPasswordReset, confirmPasswordReset, ensureOwnerAdmin, testSession, endSession, setTemporaryPassword };
}
