import { browserAvailable, config } from "../../../shared/config.js";
import { decrypt, encrypt } from "../../../shared/crypto.js";
import { getPath, schemaOf, setPath, settingDef, SETTINGS } from "./SettingRegistry.js";
import { PlatformSettingsService } from "../application/PlatformSettingsService.js";
import { PostgresSettingsRepository } from "./PostgresSettingsRepository.js";

export function createPlatformSettings(): PlatformSettingsService {
  return new PlatformSettingsService({
    registry: {
      list: () => SETTINGS,
      find: settingDef,
      validate: (def, value) => {
        const parsed = schemaOf(def).safeParse(value);
        if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "valor no válido");
        return parsed.data;
      },
    },
    repository: new PostgresSettingsRepository(),
    cipher: { decrypt, encrypt },
    runtime: {
      get: (key) => getPath(config, key),
      apply: (values) => {
        for (const [key, value] of values) setPath(config, key, value);
        if (!browserAvailable) config.browser.enabled = false;
      },
    },
    warn: (message) => console.warn(message),
  });
}
