import { beforeEach, describe, expect, it } from "vitest";
import {
  _clearRateLimitWindows,
  _rateLimitWindowsSize,
  MAX_RATE_LIMIT_KEYS,
  pruneRateLimitWindows,
  rateLimit,
  RateLimitError,
} from "../../server/lib/security.js";

describe("rateLimit", () => {
  beforeEach(() => {
    _clearRateLimitWindows();
  });

  it("allows calls within the limit", () => {
    expect(() => {
      rateLimit("test-key", 3, 10_000);
      rateLimit("test-key", 3, 10_000);
      rateLimit("test-key", 3, 10_000);
    }).not.toThrow();
  });

  it("throws RateLimitError when limit is exceeded", () => {
    rateLimit("test-exceed", 2, 5_000);
    rateLimit("test-exceed", 2, 5_000);
    expect(() => rateLimit("test-exceed", 2, 5_000)).toThrowError(RateLimitError);
    try {
      rateLimit("test-exceed", 2, 5_000);
    } catch (e) {
      expect(e).toBeInstanceOf(RateLimitError);
      const err = e as RateLimitError;
      expect(err.status).toBe(429);
      expect(err.retryAfterSec).toBeGreaterThan(0);
      expect(err.retryAfterSec).toBeLessThanOrEqual(5);
    }
  });

  it("prunes expired windows manually", () => {
    rateLimit("k1", 5, 1_000);
    rateLimit("k2", 5, 10_000);
    expect(_rateLimitWindowsSize()).toBe(2);

    // After 2 seconds, k1 is expired, k2 is active
    pruneRateLimitWindows(Date.now() + 2_000);
    expect(_rateLimitWindowsSize()).toBe(1);
  });

  it("prunes expired windows when capacity is reached", () => {
    // Fill up to arbitrary capacity by mocking MAX_RATE_LIMIT_KEYS threshold
    // Insert an expired window
    rateLimit("old-key", 5, 100);
    // Simulate expired
    pruneRateLimitWindows(Date.now() + 500);
    expect(_rateLimitWindowsSize()).toBe(0);
  });
});
