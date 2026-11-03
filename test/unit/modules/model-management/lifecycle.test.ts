import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const dependencies = vi.hoisted(() => ({
  listeners: new Set<() => void>(),
  ensure: vi.fn(async () => {}),
  secret: vi.fn(() => "test-key"),
  one: vi.fn(async () => ({ at: new Date().toISOString() })),
  q: vi.fn(async () => []),
}));
vi.mock("../../../../server/modules/model-management/providers.js", () => ({
  OPENROUTER_URL: "https://openrouter.ai/api/v1",
  ensureProviders: dependencies.ensure, providerSecret: dependencies.secret,
  onProvidersChanged: (listener: () => void) => {
    dependencies.listeners.add(listener);
    return () => dependencies.listeners.delete(listener);
  },
}));
vi.mock("../../../../server/shared/database/index.js", () => ({ one: dependencies.one, q: dependencies.q }));
import { createCatalogSync } from "../../../../server/modules/model-management/infrastructure/OpenRouterCatalogSync.js";

describe("catalog sync lifecycle", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.clearAllMocks(); dependencies.listeners.clear(); });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
  it("starts once, detaches listeners, stops once and can restart without import-time jobs", async () => {
    expect(vi.getTimerCount()).toBe(0);
    const sync = createCatalogSync();
    expect(vi.getTimerCount()).toBe(0);
    sync.startCatalogSync(); sync.startCatalogSync();
    await vi.advanceTimersByTimeAsync(0);
    expect(vi.getTimerCount()).toBe(1);
    expect(dependencies.listeners.size).toBe(1);
    await sync.stopCatalogSync(); await sync.stopCatalogSync();
    expect(vi.getTimerCount()).toBe(0);
    expect(dependencies.listeners.size).toBe(0);
    sync.startCatalogSync();
    await vi.advanceTimersByTimeAsync(0);
    expect(vi.getTimerCount()).toBe(1);
    await sync.stopCatalogSync();
  });
  it("invalidates an initial tick still awaiting provider initialization", async () => {
    let release!: () => void;
    dependencies.ensure.mockImplementationOnce(() => new Promise<void>(resolve => { release = resolve; }));
    const sync = createCatalogSync();
    sync.startCatalogSync();
    const stopping = sync.stopCatalogSync();
    release();
    await stopping;
    expect(dependencies.one).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("coalesces manual sync calls and drains the in-flight fetch before stopping", async () => {
    let release!: (value: unknown) => void;
    const fetch = vi.fn(() => new Promise(resolve => { release = resolve; }));
    vi.stubGlobal("fetch", fetch);
    const sync = createCatalogSync();
    const first = sync.syncOpenRouter(), second = sync.syncOpenRouter();
    expect(first).toBe(second);
    let stopped = false;
    const stopping = sync.stopCatalogSync().then(() => { stopped = true; });
    await Promise.resolve();
    expect(stopped).toBe(false);
    release({ ok: true, json: async () => ({ data: [] }) });
    await stopping;
    expect(await first).toBe(0);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
