import { createHmac, timingSafeEqual } from "node:crypto";
import { config, resolveAppRuntimePublicUrl } from "../../../shared/config.js";
import { createShareAccess } from "../application/share.js";

/**
 * Every app runs on its own origin so its code can never reach the studio's session:
 *   preview   → pv-<projectId>.localhost:<port>  (needs a share token)
 *   published → <slug>.localhost:<port>
 * Browsers resolve any *.localhost name to the loopback address.
 */
/** Cookie a share link is traded for on the app's own host. */
export { SHARE_COOKIE, type ShareScope } from "../domain/share.js";

const sign = (projectId: string, epoch: number, exp: string) =>
  createHmac("sha256", config.secretsKey).update(`share:${projectId}:${epoch}:${exp}`).digest("base64url").slice(0, 22);

const appPublicUrl = () => resolveAppRuntimePublicUrl(config.publicUrl, config.appRuntimePublicPort);

/**
 * `<epoch>.<expiry>.<signature>`. Tokens expire, and bumping the project's share epoch
 * ("revoke links") invalidates every token handed out before, including ones already
 * traded for a cookie.
 */
export const { shareToken, checkShareToken, previewOrigin, previewUrl, appUrl, parseAppHost } = createShareAccess({
  now: () => Date.now(),
  publicUrl: appPublicUrl,
  sign,
  equal(a, b) {
    const left = Buffer.from(a);
    const right = Buffer.from(b);
    return left.length === right.length && timingSafeEqual(left, right);
  },
});
export { reservedSlug as RESERVED_SLUG } from "../domain/publication.js";
