import { SettingValue } from "../domain/SettingValue.js";
import type { ISettingsRegistry, ISettingsStore } from "../ports/repositories.js";

export class GetPlatformSettingsUseCase {
  constructor(
    private readonly registry: ISettingsRegistry,
    private readonly store: ISettingsStore,
  ) {}

  async execute(): Promise<Record<string, unknown>> {
    const all = await this.store.getAll();
    const result: Record<string, unknown> = {};

    for (const def of this.registry.listDefinitions()) {
      const raw = all[def.key] ?? def.defaultValue;
      const settingVal = new SettingValue(raw, def.isSecret());
      result[def.key] = settingVal.toPublicRepresentation();
    }

    return result;
  }
}
