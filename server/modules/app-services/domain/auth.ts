export class AuthError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export const AUTH_POLICY = { sessionDays: 30, maxFailed: 5, lockMinutes: 15, resetLimitPerHour: 3 };
export function normalizeEmail(email: string) {
  const value = String(email ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) throw new AuthError("Correo no válido.");
  return value;
}
