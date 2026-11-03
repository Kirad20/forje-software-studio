import type { ISettingsRegistry, ISettingsStore } from "../ports/repositories.js";

export class UpdatePlatformSettingsUseCase {
  constructor(
    private readonly registry: ISettingsRegistry,
    private readonly store: ISettingsStore,
  ) {}

  async execute(patch: Record<string, unknown>): Promise<void> {
    const parsed: [string, unknown][] = [];
    for (const [key, val] of Object.entries(patch)) {
      const def = this.registry.getDefinition(key);
      if (!def) {
        throw new Error(`Ajuste desconocido: "${key}"`);
      }
      if (def.isSecret() && (val === "••••••••" || val === "")) {
        continue;
      }
      const validated = def.validate(val);
      parsed.push([key, validated]);
    }
    await this.store.setMany(Object.fromEntries(parsed));
  }
}
