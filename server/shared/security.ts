import { createHmac } from "node:crypto";
import { config } from "./config.js";
import { q } from "./database/index.js";

export class RateLimitError extends Error {
  status = 429;
  constructor(public retryAfterSec: number) {
    super(`Demasiados intentos. Prueba de nuevo en ${retryAfterSec} s.`);
  }
}

export class RateLimitStoreError extends Error {
  status = 503;
  constructor(cause: unknown) {
    super("El servicio de protección contra abuso no está disponible", { cause });
    this.name = "RateLimitStoreError";
  }
}

type RateLimitQuery = <T = Record<string, unknown>>(sql: string, params?: unknown[]) => Promise<T[]>;

export function createRateLimiter(
  query: RateLimitQuery,
  hashKey = (key: string) => createHmac("sha256", config.secretsKey).update(key).digest("hex"),
) {
  return async (key: string, limit: number, windowMs: number) => {
    if (!key || !Number.isSafeInteger(limit) || limit < 1 || !Number.isFinite(windowMs) || windowMs < 1) {
      throw new RangeError("Límite de solicitudes no válido");
    }
    let window: { count: number; retry_after_sec: number } | undefined;
    try {
      [window] = await query<{ count: number; retry_after_sec: number }>(
        `insert into rate_limit_windows (key, count, reset_at)
         values ($1, 1, now() + ($2::double precision * interval '1 millisecond'))
         on conflict (key) do update set
           count = case when rate_limit_windows.reset_at <= now() then 1 else rate_limit_windows.count + 1 end,
           reset_at = case when rate_limit_windows.reset_at <= now()
             then now() + ($2::double precision * interval '1 millisecond')
             else rate_limit_windows.reset_at end
         returning count, greatest(1, ceil(extract(epoch from (reset_at - now()))))::integer as retry_after_sec`,
        [hashKey(key), windowMs],
      );
    } catch (error) {
      throw new RateLimitStoreError(error);
    }
    if (!window) throw new RateLimitStoreError(new Error("La consulta no devolvió un contador"));
    if (Number(window.count) > limit) throw new RateLimitError(Number(window.retry_after_sec));
  };
}

export const rateLimit = createRateLimiter(q);

let cleanupTimer: NodeJS.Timeout | undefined;

export function startRateLimitCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    void q("delete from rate_limit_windows where reset_at <= now()").catch((error) =>
      console.warn("[forja] no se pudieron limpiar límites de solicitudes:", (error as Error).message),
    );
  }, 60_000).unref();
}

export function stopRateLimitCleanup() {
  if (cleanupTimer) clearInterval(cleanupTimer);
  cleanupTimer = undefined;
}

/** Origins allowed to make state-changing calls to the studio API. */
export function studioOrigins(): string[] {
  return [new URL(config.publicUrl).origin, "http://localhost:5173"];
}

/**
 * The origin a request was addressed to, as the browser saw it: the Host header, or what the
 * trusted proxy forwarded (X-Forwarded-Host / -Proto). An Origin equal to it is same-origin by
 * definition, so it is no CSRF whatever PUBLIC_URL says; a cross-site page still sends its own
 * Origin, which never matches (a browser cannot forge Origin or Host).
 */
export function requestOrigin(headers: { host?: string; forwardedHost?: string; forwardedProto?: string }, trustProxy = config.trustProxy): string | null {
  const first = (v?: string) => v?.split(",")[0]?.trim() || undefined;
  const host = (trustProxy > 0 && first(headers.forwardedHost)) || headers.host;
  if (!host) return null;
  const proto = (trustProxy > 0 && first(headers.forwardedProto)) || "http";
  try {
    return new URL(`${proto}://${host}`).origin;
  } catch {
    return null;
  }
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
