import { schemaOf, SETTINGS, type SettingDef } from "../../settings/registry.js";
import { listSettings, updateSettings, resetSetting } from "../../settings/store.js";
import { SettingDefinition } from "./domain/SettingDefinition.js";
import type { ISettingsRegistry, ISettingsStore } from "./ports/repositories.js";
import { GetPlatformSettingsUseCase } from "./application/GetPlatformSettingsUseCase.js";
import { UpdatePlatformSettingsUseCase } from "./application/UpdatePlatformSettingsUseCase.js";

// Domain & Value Objects
export * from "./domain/SettingDefinition.js";
export * from "./domain/SettingValue.js";
export * from "./ports/repositories.js";

export class PlatformSettingsRegistryAdapter implements ISettingsRegistry {
  getDefinition(key: string): SettingDefinition | undefined {
    const raw = SETTINGS.find((s) => s.key === key);
    if (!raw) return undefined;
    return this.toDomain(raw);
  }

  listDefinitions(): SettingDefinition[] {
    return SETTINGS.map((raw) => this.toDomain(raw));
  }

  private toDomain(raw: SettingDef): SettingDefinition {
    const isSecret = raw.type === "secret";
    const mappedType = raw.type === "number" ? "number" : raw.type === "boolean" ? "boolean" : raw.type === "enum" ? "select" : "string";
    return new SettingDefinition({
      key: raw.key,
      type: mappedType,
      default: raw.default,
      secret: isSecret,
      options: raw.options ? [...raw.options] : undefined,
      min: raw.min,
      max: raw.max,
    });
  }
}

export class PostgresPlatformSettingsStoreAdapter implements ISettingsStore {
  async get(key: string): Promise<unknown> {
    const items = await listSettings();
    const item = items.find((i) => i.key === key);
    return item?.default;
  }

  async set(key: string, value: unknown): Promise<void> {
    await updateSettings({ [key]: value }, null);
  }

  async reset(key: string): Promise<void> {
    await resetSetting(key, null);
  }

  async getAll(): Promise<Record<string, unknown>> {
    const items = await listSettings();
    const out: Record<string, unknown> = {};
    for (const item of items) {
      out[item.key] = item.default;
    }
    return out;
  }
}

export const settingsRegistry = new PlatformSettingsRegistryAdapter();
export const settingsStore = new PostgresPlatformSettingsStoreAdapter();

export const getPlatformSettingsUseCase = new GetPlatformSettingsUseCase(settingsRegistry, settingsStore);
export const updatePlatformSettingsUseCase = new UpdatePlatformSettingsUseCase(settingsRegistry, settingsStore);
