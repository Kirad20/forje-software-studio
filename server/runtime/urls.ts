import { createHmac, timingSafeEqual } from "node:crypto";
import { config } from "../config.js";

/**
 * Every app runs on its own origin so its code can never reach the studio's session:
 *   preview   → pv-<projectId>.localhost:<port>  (needs the share token)
 *   published → <slug>.localhost:<port>
 * Browsers resolve any *.localhost name to the loopback address.
 */
const PREVIEW_PREFIX = "pv-";

const withHost = (sub: string) => config.publicUrl.replace("://", `://${sub}.`);

export const shareToken = (projectId: string) =>
  createHmac("sha256", config.secretsKey).update(`preview:${projectId}`).digest("base64url").slice(0, 24);

export function checkShareToken(projectId: string, token: string | undefined | null) {
  if (!token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(shareToken(projectId));
  return a.length === b.length && timingSafeEqual(a, b);
}

export const previewOrigin = (projectId: string) => withHost(`${PREVIEW_PREFIX}${projectId}`);
export const previewUrl = (projectId: string, path = "/") => `${previewOrigin(projectId)}${path}?share=${shareToken(projectId)}`;
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
