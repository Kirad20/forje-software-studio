import { describe, expect, it, vi } from "vitest";
import { createSettingsModule } from "../../../../server/modules/settings/index.js";
import { PlatformSettingsService } from "../../../../server/modules/settings/application/PlatformSettingsService.js";
import type { SettingsDependencies } from "../../../../server/modules/settings/ports/platform.js";

function fixture() {
  const definition = { key: "feature", group: "runtime" as const, label: "Feature", type: "boolean" as const, default: false };
  const settings: SettingsDependencies = {
    registry: { list: () => [definition], find: (key) => key === definition.key ? definition : undefined, validate: (_def, value) => value },
    repository: { read: vi.fn().mockResolvedValue([]), save: vi.fn(), reset: vi.fn(), audit: vi.fn() },
    cipher: { encrypt: (value) => value, decrypt: (value) => value },
    runtime: { get: () => undefined, apply: vi.fn() },
    warn: vi.fn(),
  };
  const service = new PlatformSettingsService(settings);
  const registry = { getDefinition: () => undefined, listDefinitions: () => [] };
  const store = { get: vi.fn(), set: vi.fn(), setMany: vi.fn(), reset: vi.fn(), getAll: vi.fn().mockResolvedValue({}) };
  return { service, registry, store, settings };
}

describe("Settings module factory", () => {
  it("initializes idempotently and supports explicit stop and restart", async () => {
    const { service, registry, store, settings } = fixture();
    const module = createSettingsModule({ service, registry, store });
    await module.start();
    await module.start();
    expect(settings.repository.read).toHaveBeenCalledOnce();
    module.stop();
    module.stop();
    await module.start();
    expect(settings.repository.read).toHaveBeenCalledTimes(2);
  });

  it("returns an idempotent unsubscribe function for settings listeners", async () => {
    const { service, registry, store } = fixture();
    const module = createSettingsModule({ service, registry, store });
    const listener = vi.fn();
    const unsubscribe = module.onSettingsChanged(listener);
    unsubscribe();
    unsubscribe();
    await service.reset("feature", null);
    expect(listener).not.toHaveBeenCalled();
  });
});
