import { config } from "../config.js";

/**
 * Fixed-window rate limiter kept in memory. Good enough for one process; a multi-instance
 * deployment would move the counters to the database or Redis.
 */
const windows = new Map<string, { count: number; resetAt: number }>();

export class RateLimitError extends Error {
  status = 429;
  constructor(public retryAfterSec: number) {
    super(`Demasiados intentos. Prueba de nuevo en ${retryAfterSec} s.`);
  }
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  let w = windows.get(key);
  if (!w || w.resetAt <= now) windows.set(key, (w = { count: 0, resetAt: now + windowMs }));
  w.count++;
  if (w.count > limit) throw new RateLimitError(Math.ceil((w.resetAt - now) / 1000));
}

setInterval(() => {
  const now = Date.now();
  for (const [k, w] of windows) if (w.resetAt <= now) windows.delete(k);
}, 60_000).unref();

/** Origins allowed to make state-changing calls to the studio API. */
export function studioOrigins(): string[] {
  return [new URL(config.publicUrl).origin, "http://localhost:5173"];
}

/**
 * The client's address. Behind `config.trustProxy` proxies, each one appends the address it saw
 * to X-Forwarded-For, so the N-th entry from the right is what the outermost trusted proxy saw;
 * anything further left is client-supplied and spoofable.
 */
export function clientIp(socketAddress: string | undefined, forwardedFor: string | null | undefined, trustProxy = config.trustProxy): string {
  if (trustProxy > 0 && forwardedFor) {
    const hops = forwardedFor.split(",").map((s) => s.trim()).filter(Boolean);
    const ip = hops[Math.max(0, hops.length - trustProxy)];
    if (ip) return ip;
  }
  return socketAddress ?? "unknown";
}

export const isHttps = () => config.publicUrl.startsWith("https://");

/** Headers for the studio itself: it must never be framed, and sniffing is off. */
export const STUDIO_HEADERS: Record<string, string> = {
  "x-frame-options": "DENY",
  "content-security-policy": "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
};

/** Headers for generated apps. A preview may only be framed by the studio. */
export function appHeaders(env: "preview" | "published"): Record<string, string> {
  return {
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    ...(env === "preview" ? { "content-security-policy": `frame-ancestors ${studioOrigins().join(" ")}` } : {}),
  };
}

/** Types an upload may be shown inline as; anything else downloads. */
const INLINE = /^(image\/(png|jpe?g|gif|webp|avif)|video\/|audio\/|application\/pdf$|text\/plain)/;

/**
 * Headers for user-uploaded files. Scripts in uploaded HTML or SVG must never run on the
 * app's origin, so files are sandboxed by CSP and non-media types are forced to download.
 */
export function uploadHeaders(contentType: string, filename: string): Record<string, string> {
  const inline = INLINE.test(contentType);
  return {
    "content-type": inline ? contentType : "application/octet-stream",
    "content-security-policy": "sandbox; default-src 'none'; img-src 'self' data:; media-src 'self'; style-src 'unsafe-inline'",
    "x-content-type-options": "nosniff",
    "content-disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(filename)}`,
    "cache-control": "public, max-age=31536000, immutable",
  };
}
