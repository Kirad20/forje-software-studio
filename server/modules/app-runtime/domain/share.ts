export interface ShareScope { id: string; shareEpoch: number }
export const PREVIEW_PREFIX = "pv-";
export const SHARE_COOKIE = "forja_share";
export const DAY = 24 * 3600_000;

export function tokenParts(scope: ShareScope, token: string | null | undefined, now: number) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [epoch, exp, sig] = parts as [string, string, string];
  if (!/^\d+$/.test(epoch) || !/^[0-9a-z]+$/.test(exp) || !sig || Number(epoch) !== scope.shareEpoch) return null;
  const expiry = parseInt(exp, 36) * 1000;
  if (!Number.isFinite(expiry) || expiry < now) return null;
  return { exp, sig };
}

export function parseHost(host: string | undefined, rootHost: string): { kind: "preview"; projectId: string } | { kind: "app"; slug: string } | null {
  if (!host) return null;
  const hostname = host.split(":")[0]!.toLowerCase();
  if (!hostname.endsWith(`.${rootHost}`)) return null;
  const sub = hostname.slice(0, -(rootHost.length + 1));
  if (!sub || sub.includes(".")) return null;
  if (sub.startsWith(PREVIEW_PREFIX)) return { kind: "preview", projectId: sub.slice(PREVIEW_PREFIX.length) };
  return { kind: "app", slug: sub };
}
