export const SECRET_NAME = /^[A-Z][A-Z0-9_]{1,63}$/;
export const MAX_FILE_BYTES = 100 * 1024 * 1024;
export const JOB_LIMITS = {
  scheduledPerProject: 10, minIntervalMinutes: 5, timersPerProject: 25,
  maxDelayMs: 7 * 24 * 3600_000, minDelayMs: 60_000, maxPayloadBytes: 100 * 1024,
};
export function safeStorageKey(key: string) {
  if (!/^[A-Za-z0-9._\-/]+$/.test(key) || key.includes("..")) throw new Error("Clave de archivo no válida");
  return key;
}
export function verifiedSender(project: { email_domain_verified: boolean; email_domain: string | null }, from: string | undefined) {
  const address = from?.includes("@") ? from.replace(/.*<|>.*/g, "") : null;
  return project.email_domain_verified && !!address && address.toLowerCase().endsWith(`@${project.email_domain?.toLowerCase()}`);
}
export function analyticsDays(days: number) {
  return Math.min(Math.max(Number.isFinite(days) ? Math.trunc(days) : 7, 1), 90);
}
