import { describe, expect, it } from "vitest";
import { allowedRequest } from "../../server/runtime/browser.js";

describe("browser_test network filter", () => {
  const origin = "http://pv-abc.localhost:4000";
  it("allows the preview itself and public https", () => {
    expect(allowedRequest(`${origin}/_api/todos/list`, origin)).toBe(true);
    expect(allowedRequest("https://fonts.googleapis.com/css2?family=Inter", origin)).toBe(true);
    expect(allowedRequest("data:image/png;base64,AAAA", origin)).toBe(true);
  });
  it("blocks the studio, other apps and private networks", () => {
    expect(allowedRequest("http://localhost:4000/api/projects", origin)).toBe(false);
    expect(allowedRequest("http://pv-other.localhost:4000/", origin)).toBe(false);
    expect(allowedRequest("https://pv-other.localhost:4000/", origin)).toBe(false);
    expect(allowedRequest("https://192.168.1.10/admin", origin)).toBe(false);
    expect(allowedRequest("https://169.254.169.254/latest/meta-data", origin)).toBe(false);
    expect(allowedRequest("http://example.com/", origin)).toBe(false);
    // A look-alike host that only starts with the preview's origin.
    expect(allowedRequest("http://pv-abc.localhost:4000.evil.com/", origin)).toBe(false);
  });
});
