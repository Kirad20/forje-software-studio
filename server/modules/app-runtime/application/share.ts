import { DAY, parseHost, PREVIEW_PREFIX, tokenParts, type ShareScope } from "../domain/share.js";
import type { SharePorts } from "./ports.js";

export function createShareAccess(ports: SharePorts) {
  const withHost = (sub: string) => ports.publicUrl().replace("://", `://${sub}.`);
  const previewOrigin = (id: string) => withHost(`${PREVIEW_PREFIX}${id}`);
  const shareToken = (p: ShareScope, days = 30) => {
    const exp = Math.floor((ports.now() + days * DAY) / 1000).toString(36);
    return `${p.shareEpoch}.${exp}.${ports.sign(p.id, p.shareEpoch, exp)}`;
  };
  return {
    shareToken,
    checkShareToken(p: ShareScope, token: string | undefined | null) {
      const parts = tokenParts(p, token, ports.now());
      return !!parts && ports.equal(parts.sig, ports.sign(p.id, p.shareEpoch, parts.exp));
    },
    previewOrigin,
    previewUrl: (p: ShareScope, days = 30, path = "/") => `${previewOrigin(p.id)}${path}?share=${shareToken(p, days)}`,
    appUrl: (slug: string) => withHost(slug),
    parseAppHost: (host: string | undefined) => parseHost(host, new URL(ports.publicUrl()).hostname),
  };
}
