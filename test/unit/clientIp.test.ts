import { describe, expect, it } from "vitest";
import { clientIp } from "../../server/shared/security.js";

describe("clientIp", () => {
  it("ignores X-Forwarded-For when no proxy is trusted", () => {
    expect(clientIp("10.0.0.2", "1.2.3.4", 0)).toBe("10.0.0.2");
  });
  it("takes the address the trusted proxy appended, not a client-supplied one", () => {
    // The client forged "6.6.6.6"; Traefik appended the real 1.2.3.4.
    expect(clientIp("10.0.0.2", "6.6.6.6, 1.2.3.4", 1)).toBe("1.2.3.4");
    expect(clientIp("10.0.0.2", "6.6.6.6, 1.2.3.4, 172.16.0.1", 2)).toBe("1.2.3.4");
  });
  it("falls back to the socket address without the header", () => {
    expect(clientIp("10.0.0.2", undefined, 1)).toBe("10.0.0.2");
    expect(clientIp(undefined, null, 1)).toBe("unknown");
  });
  it("uses the leftmost hop when there are fewer than trusted", () => {
    expect(clientIp("10.0.0.2", "1.2.3.4", 3)).toBe("1.2.3.4");
  });
});
