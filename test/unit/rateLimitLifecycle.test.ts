import { afterEach, expect, it, vi } from "vitest";
import { startRateLimitCleanup, stopRateLimitCleanup, rateLimit } from "../../server/shared/security.js";

afterEach(() => {
  stopRateLimitCleanup();
  vi.useRealTimers();
});

it("rate-limit cleanup starts explicitly once and releases its timer and counters", () => {
  vi.useFakeTimers();
  expect(vi.getTimerCount()).toBe(0);
  startRateLimitCleanup();
  startRateLimitCleanup();
  expect(vi.getTimerCount()).toBe(1);
  rateLimit("test-lifecycle", 1, 1000);
  expect(() => rateLimit("test-lifecycle", 1, 1000)).toThrow();
  stopRateLimitCleanup();
  stopRateLimitCleanup();
  expect(vi.getTimerCount()).toBe(0);
  expect(() => rateLimit("test-lifecycle", 1, 1000)).not.toThrow();
});
