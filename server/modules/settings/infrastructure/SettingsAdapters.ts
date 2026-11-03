import { schemaOf, SETTINGS, type SettingDef } from "./SettingRegistry.js";
import { SettingDefinition } from "../domain/SettingDefinition.js";
import type { ISettingsRegistry, ISettingsStore } from "../ports/repositories.js";
import type { PlatformSettingsService } from "../application/PlatformSettingsService.js";

export class PlatformSettingsRegistryAdapter implements ISettingsRegistry {
  getDefinition(key: string): SettingDefinition | undefined {
    const raw = SETTINGS.find((setting) => setting.key === key);
    return raw ? this.toDomain(raw) : undefined;
  }

  listDefinitions(): SettingDefinition[] {
    return SETTINGS.map((raw) => this.toDomain(raw));
  }

  private toDomain(raw: SettingDef): SettingDefinition {
    return new SettingDefinition({
      key: raw.key,
      type: raw.type === "number" ? "number" : raw.type === "boolean" ? "boolean" : raw.type === "enum" ? "select" : "string",
      default: raw.default,
      secret: raw.type === "secret",
      options: raw.options ? [...raw.options] : undefined,
      min: raw.min,
      max: raw.max,
      validate: (value) => {
        const result = schemaOf(raw).safeParse(value);
        if (!result.success) throw new Error(result.error.issues[0]?.message ?? "valor no válido");
        return result.data;
      },
    });
  }
}

export class PostgresPlatformSettingsStoreAdapter implements ISettingsStore {
  constructor(private readonly service: PlatformSettingsService) {}

  async get(key: string): Promise<unknown> {
    return (await this.getAll())[key];
  }

  async set(key: string, value: unknown): Promise<void> {
    await this.setMany({ [key]: value });
  }

  async setMany(patch: Record<string, unknown>): Promise<void> {
    await this.service.update(patch, null);
  }

  reset(key: string): Promise<void> {
    return this.service.reset(key, null);
  }

  async getAll(): Promise<Record<string, unknown>> {
    return Object.fromEntries((await this.service.list()).map((item) => [
      item.key, item.secret ? (item.secret.set ? "••••••••" : "") : item.value,
    ]));
  }
}
