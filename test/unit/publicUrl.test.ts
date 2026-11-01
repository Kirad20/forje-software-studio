import { describe, expect, it } from "vitest";
import { resolvePublicUrl } from "../../server/config.js";
import { requestOrigin } from "../../server/lib/security.js";

describe("resolvePublicUrl", () => {
  it("prefers PUBLIC_URL and trims the trailing slash", () => {
    expect(resolvePublicUrl({ PUBLIC_URL: "https://forja.example.com/", SERVICE_URL_FORJA_4100: "https://other.example.com" })).toBe("https://forja.example.com");
  });

  it("falls back to Coolify's SERVICE_URL_FORJA_4100 when PUBLIC_URL is empty", () => {
    expect(resolvePublicUrl({ PUBLIC_URL: "", SERVICE_URL_FORJA_4100: "https://forja-abc.example.com" })).toBe("https://forja-abc.example.com");
  });

  it("drops the container port behind a proxy (Coolify writes https://host:4100)", () => {
    expect(resolvePublicUrl({ SERVICE_URL_FORJA_4100: "https://forja-abc.example.com:4100", FORJA_TRUST_PROXY: "1" })).toBe("https://forja-abc.example.com");
    expect(resolvePublicUrl({ PUBLIC_URL: "https://forja-abc.example.com:4100", FORJA_TRUST_PROXY: "1", PORT: "4100" })).toBe("https://forja-abc.example.com");
  });

  it("keeps a port that is not ours, and every port when nothing is in front", () => {
    expect(resolvePublicUrl({ PUBLIC_URL: "https://forja.example.com:8443", FORJA_TRUST_PROXY: "1" })).toBe("https://forja.example.com:8443");
    expect(resolvePublicUrl({ PUBLIC_URL: "http://localhost:4100", FORJA_TRUST_PROXY: "0" })).toBe("http://localhost:4100");
  });

  it("defaults to localhost on PORT and rejects garbage", () => {
    expect(resolvePublicUrl({ PORT: "4300" })).toBe("http://localhost:4300");
    expect(() => resolvePublicUrl({ PUBLIC_URL: "not a url" })).toThrow(/PUBLIC_URL/);
  });
});

describe("requestOrigin", () => {
  it("uses the proxy's forwarded host and scheme only when a proxy is trusted", () => {
    const h = { host: "forja:4100", forwardedHost: "forja.example.com", forwardedProto: "https" };
    expect(requestOrigin(h, 1)).toBe("https://forja.example.com");
    expect(requestOrigin(h, 0)).toBe("http://forja:4100");
  });

  it("takes the first value of comma-separated forwarded headers", () => {
    expect(requestOrigin({ host: "x", forwardedHost: "forja.example.com, inner", forwardedProto: "https, http" }, 1)).toBe("https://forja.example.com");
  });

  it("returns null without a usable host", () => {
    expect(requestOrigin({}, 1)).toBeNull();
    expect(requestOrigin({ host: "bad host/" }, 0)).toBeNull();
  });
});
