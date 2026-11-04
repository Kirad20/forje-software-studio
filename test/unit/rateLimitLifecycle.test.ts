import { afterEach, expect, it, vi } from "vitest";
import { createRateLimiter, RateLimitStoreError, startRateLimitCleanup, stopRateLimitCleanup } from "../../server/shared/security.js";

afterEach(() => {
  stopRateLimitCleanup();
  vi.useRealTimers();
});

it("rate-limit cleanup starts explicitly once and releases its timer", () => {
  vi.useFakeTimers();
  expect(vi.getTimerCount()).toBe(0);
  startRateLimitCleanup();
  startRateLimitCleanup();
  expect(vi.getTimerCount()).toBe(1);
  stopRateLimitCleanup();
  stopRateLimitCleanup();
  expect(vi.getTimerCount()).toBe(0);
});

it("uses the shared database counter and returns the persisted retry window", async () => {
  const query = vi.fn()
    .mockResolvedValueOnce([{ count: 1, retry_after_sec: 60 }])
    .mockResolvedValueOnce([{ count: 2, retry_after_sec: 42 }]);
  const hashKey = vi.fn((key: string) => `hashed:${key}`);
  const limit = createRateLimiter(query, hashKey);

  await expect(limit("login:user@example.com", 1, 60_000)).resolves.toBeUndefined();
  await expect(limit("login:user@example.com", 1, 60_000)).rejects.toMatchObject({ retryAfterSec: 42 });
  expect(query).toHaveBeenCalledTimes(2);
  expect(query.mock.calls[0]?.[0]).toContain("on conflict (key) do update");
  expect(query.mock.calls[0]?.[1]).toEqual(["hashed:login:user@example.com", 60_000]);
  expect(hashKey).toHaveBeenCalledWith("login:user@example.com");
});

it("rejects invalid rate-limit settings without touching the database", async () => {
  const query = vi.fn();
  const limit = createRateLimiter(query);

  await expect(limit("", 1, 1000)).rejects.toThrow("no válido");
  await expect(limit("valid", 0, 1000)).rejects.toThrow("no válido");
  expect(query).not.toHaveBeenCalled();
});

it("surfaces shared-store failures as service-unavailable errors", async () => {
  const cause = new Error("database down");
  const limit = createRateLimiter(vi.fn().mockRejectedValue(cause), (key) => key);

  await expect(limit("login", 5, 1000)).rejects.toMatchObject({ name: "RateLimitStoreError", cause });
});
