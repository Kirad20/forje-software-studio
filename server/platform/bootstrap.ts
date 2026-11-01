import { randomBytes, timingSafeEqual } from "node:crypto";
import { config } from "../config.js";
import { sha256 } from "../lib/crypto.js";
import { assertStrongPassword, createAccount, createSession, hasAccounts } from "./accounts.js";

/**
 * First-run setup. A fresh install has no accounts and, deliberately, no default user or password:
 * the server holds a one-time token (FORJA_BOOTSTRAP_TOKEN, or a random one printed to its log) and
 * the first administrator is created by presenting it. Once any account exists the token is gone
 * and the endpoint refuses. Reading the server log (or setting the variable) is the proof of
 * control; nothing that works on a running, exposed instance is guessable.
 */
let tokenHash: string | null = null;

export async function initBootstrap(): Promise<void> {
  if (await hasAccounts()) {
    tokenHash = null;
    return;
  }
  let token = config.bootstrapToken;
  if (token) {
    if (token.length < 16) throw new Error("FORJA_BOOTSTRAP_TOKEN debe tener al menos 16 caracteres.");
    console.log("[forja] Instalación nueva: crea la primera cuenta de administrador con el token de FORJA_BOOTSTRAP_TOKEN.");
  } else {
    token = randomBytes(24).toString("base64url");
    console.log(`[forja] Instalación nueva: no hay usuarios. Crea el administrador en ${config.publicUrl} con este token de un solo uso:`);
    console.log(`[forja]   ${token}`);
  }
  tokenHash = sha256(token);
}

export async function needsSetup(): Promise<boolean> {
  return tokenHash !== null && !(await hasAccounts());
}

function tokenMatches(given: string): boolean {
  if (!tokenHash) return false;
  const a = Buffer.from(sha256(given.trim()), "hex");
  const b = Buffer.from(tokenHash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Creates the first administrator and returns a session token. Throws a user-facing message on failure. */
export async function completeSetup(input: { token: string; email: string; password: string; name?: string }): Promise<string> {
  const email = (input.email ?? "").trim().toLowerCase();
  if (!(await needsSetup()) || !tokenMatches(String(input.token ?? ""))) throw new SetupError("Token de instalación incorrecto o ya usado.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Correo no válido");
  assertStrongPassword(input.password, email);
  const id = await createAccount(email, input.name?.trim().slice(0, 80) || null, input.password, "admin");
  tokenHash = null; // single use
  return createSession(id);
}

export class SetupError extends Error {}
