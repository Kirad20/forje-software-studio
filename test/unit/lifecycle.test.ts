import { describe, expect, it, vi } from "vitest";
import { ApplicationLifecycle } from "../../server/bootstrap/ApplicationLifecycle.js";

describe("Monolith lifecycle", () => {
  it("starts once and releases resources in reverse dependency order", async () => {
    const calls: string[] = [];
    const lifecycle = new ApplicationLifecycle([
      { name: "database", start: async () => { calls.push("db-start"); }, stop: async () => { calls.push("db-stop"); } },
      { name: "http", start: async () => { calls.push("http-start"); }, stop: async () => { calls.push("http-stop"); } },
    ]);
    await Promise.all([lifecycle.start(), lifecycle.start()]);
    await Promise.all([lifecycle.stop(), lifecycle.stop()]);
    expect(calls).toEqual(["db-start", "http-start", "http-stop", "db-stop"]);
  });

  it("rolls back acquired resources if a dependent service cannot start", async () => {
    const close = vi.fn();
    const failedStop = vi.fn();
    const lifecycle = new ApplicationLifecycle([
      { name: "database", start: async () => {}, stop: close },
      { name: "http", start: async () => { throw new Error("port unavailable"); }, stop: failedStop },
    ]);
    await expect(lifecycle.start()).rejects.toThrow("port unavailable");
    expect(close).toHaveBeenCalledOnce();
    expect(failedStop).not.toHaveBeenCalled();
  });

  it("does not hide shutdown errors or skip cleanup for other services", async () => {
    const close = vi.fn();
    const lifecycle = new ApplicationLifecycle([
      { name: "database", start: async () => {}, stop: close },
      { name: "http", start: async () => {}, stop: async () => { throw new Error("close failed"); } },
    ]);
    await lifecycle.start();
    await expect(lifecycle.stop()).rejects.toThrow("http");
    expect(close).toHaveBeenCalledOnce();
  });

  it("records startup and cleanup failures together", async () => {
    const lifecycle = new ApplicationLifecycle([
      { name: "database", start: async () => {}, stop: async () => { throw new Error("db close failed"); } },
      { name: "http", start: async () => { throw new Error("listen failed"); }, stop: async () => {} },
    ]);
    await expect(lifecycle.start()).rejects.toBeInstanceOf(AggregateError);
  });

  it("cannot acquire resources after shutdown, including before the first start", async () => {
    const start = vi.fn(async () => {});
    const lifecycle = new ApplicationLifecycle([{ name: "database", start, stop: async () => {} }]);
    await lifecycle.stop();
    await expect(lifecycle.start()).rejects.toThrow("shutdown");
    expect(start).not.toHaveBeenCalled();
  });
});
