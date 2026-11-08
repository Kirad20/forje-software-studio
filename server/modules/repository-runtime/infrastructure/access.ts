import { createHmac, timingSafeEqual } from "node:crypto";
import { config } from "../../../shared/config.js";
import type { RepositoryEnvironment } from "../domain/repository.js";

export interface RepositoryAccessScope { id: string; shareEpoch: number }
function sign(scope: RepositoryAccessScope, env: RepositoryEnvironment, expiry: string) {
  return createHmac("sha256", config.secretsKey).update(`repository-share:${scope.id}:${scope.shareEpoch}:${env}:${expiry}`).digest("base64url").slice(0, 22);
}
export function repositoryShareToken(scope: RepositoryAccessScope, env: RepositoryEnvironment, days = 30) {
  const expiry = Math.floor((Date.now() + Math.min(365, Math.max(1, days)) * 86_400_000) / 1000).toString(36);
  return `${scope.shareEpoch}.${expiry}.${sign(scope, env, expiry)}`;
}
export function checkRepositoryShareToken(scope: RepositoryAccessScope, token: string | null | undefined, env: RepositoryEnvironment) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [epoch, expiry, signature] = parts as [string, string, string];
  if (!/^\d+$/.test(epoch) || Number(epoch) !== scope.shareEpoch || !/^[0-9a-z]{1,12}$/.test(expiry) || !/^[A-Za-z0-9_-]{22}$/.test(signature)) return false;
  const expiresAt = parseInt(expiry, 36) * 1000;
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(sign(scope, env, expiry)));
}
