import { createHmac, timingSafeEqual } from "node:crypto";
import { config } from "../config.js";

/**
 * Every app runs on its own origin so its code can never reach the studio's session:
 *   preview   → pv-<projectId>.localhost:<port>  (needs a share token)
 *   published → <slug>.localhost:<port>
 * Browsers resolve any *.localhost name to the loopback address.
 */
const PREVIEW_PREFIX = "pv-";
/** Cookie a share link is traded for on the app's own host. */
export const SHARE_COOKIE = "forja_share";
const DAY = 24 * 3600_000;

const withHost = (sub: string) => config.publicUrl.replace("://", `://${sub}.`);

/** What a share token needs to know about its project. */
export interface ShareScope {
  id: string;
  shareEpoch: number;
}

const sign = (projectId: string, epoch: number, exp: string) =>
  createHmac("sha256", config.secretsKey).update(`share:${projectId}:${epoch}:${exp}`).digest("base64url").slice(0, 22);

/**
 * `<epoch>.<expiry>.<signature>`. Tokens expire, and bumping the project's share epoch
 * ("revoke links") invalidates every token handed out before, including ones already
 * traded for a cookie.
 */
export function shareToken(p: ShareScope, days = 30) {
  const exp = Math.floor((Date.now() + days * DAY) / 1000).toString(36);
  return `${p.shareEpoch}.${exp}.${sign(p.id, p.shareEpoch, exp)}`;
}

export function checkShareToken(p: ShareScope, token: string | undefined | null) {
  if (!token) return false;
  const [epoch, exp, sig] = token.split(".");
  if (!epoch || !exp || !sig || Number(epoch) !== p.shareEpoch) return false;
  if (parseInt(exp, 36) * 1000 < Date.now()) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(p.id, p.shareEpoch, exp));
  return a.length === b.length && timingSafeEqual(a, b);
}

export const previewOrigin = (projectId: string) => withHost(`${PREVIEW_PREFIX}${projectId}`);
export const previewUrl = (p: ShareScope, days = 30, path = "/") => `${previewOrigin(p.id)}${path}?share=${shareToken(p, days)}`;
export const appUrl = (slug: string) => withHost(slug);

/** Reads the subdomain of `*.localhost` (or of PUBLIC_URL's host) from a Host header. */
export function parseAppHost(host: string | undefined): { kind: "preview"; projectId: string } | { kind: "app"; slug: string } | null {
  if (!host) return null;
  const hostname = host.split(":")[0]!.toLowerCase();
  const rootHost = new URL(config.publicUrl).hostname;
  if (!hostname.endsWith(`.${rootHost}`)) return null;
  const sub = hostname.slice(0, -(rootHost.length + 1));
  if (!sub || sub.includes(".")) return null;
  if (sub.startsWith(PREVIEW_PREFIX)) return { kind: "preview", projectId: sub.slice(PREVIEW_PREFIX.length) };
  return { kind: "app", slug: sub };
}

export const RESERVED_SLUG = (slug: string) => slug.startsWith(PREVIEW_PREFIX) || ["www", "api", "app", "studio", "mcp"].includes(slug);
