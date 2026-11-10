export class AuthError extends Error {
  constructor(message: string, public status: 400 | 401 | 404 | 409 | 429 = 400) { super(message); }
}
export const AUTH_POLICY = { sessionDays: 30, maxFailed: 5, lockMinutes: 15, resetLimitPerHour: 3 };
export function validatePassword(password: unknown): asserts password is string {
  if (typeof password !== "string" || password.length < 8) throw new AuthError("La contraseña debe tener al menos 8 caracteres.");
}
export function normalizeEmail(email: string) {
  const value = String(email ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) throw new AuthError("Correo no válido.");
  return value;
}
