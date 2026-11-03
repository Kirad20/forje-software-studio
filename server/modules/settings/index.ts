import { GetPlatformSettingsUseCase } from "./application/GetPlatformSettingsUseCase.js";
import { PlatformSettingsService } from "./application/PlatformSettingsService.js";
import { UpdatePlatformSettingsUseCase } from "./application/UpdatePlatformSettingsUseCase.js";
import type { ISettingsRegistry, ISettingsStore } from "./ports/repositories.js";

export * from "./domain/SettingDefinition.js";
export * from "./domain/SettingValue.js";
export * from "./domain/PlatformSetting.js";
export * from "./ports/repositories.js";
export * from "./ports/platform.js";
export { PlatformSettingsService } from "./application/PlatformSettingsService.js";
export { GROUPS, SETTINGS, settingDef, getPath, setPath, schemaOf } from "./infrastructure/SettingRegistry.js";
export { PlatformSettingsRegistryAdapter, PostgresPlatformSettingsStoreAdapter } from "./infrastructure/SettingsAdapters.js";
export { createPlatformSettings } from "./infrastructure/createPlatformSettings.js";

export interface SettingsModuleDependencies {
  service: PlatformSettingsService;
  registry: ISettingsRegistry;
  store: ISettingsStore;
}

export function createSettingsModule(dependencies: SettingsModuleDependencies) {
  const { service } = dependencies;
  const getPlatformSettingsUseCase = new GetPlatformSettingsUseCase(dependencies.registry, dependencies.store);
  const updatePlatformSettingsUseCase = new UpdatePlatformSettingsUseCase(dependencies.registry, dependencies.store);
  let started = false;

  return {
    service,
    registry: dependencies.registry,
    store: dependencies.store,
    getPlatformSettingsUseCase,
    updatePlatformSettingsUseCase,
    getPlatformSettings: () => getPlatformSettingsUseCase.execute(),
    updatePlatformSettings: (patch: Record<string, unknown>) => updatePlatformSettingsUseCase.execute(patch),
    onSettingsChanged: (listener: (keys: string[]) => void) => service.onChanged(listener),
    loadSettings: () => service.load(),
    listSettings: () => service.list(),
    updateSettings: (patch: Record<string, unknown>, actorId: string | null) => service.update(patch, actorId),
    resetSetting: (key: string, actorId: string | null) => service.reset(key, actorId),
    audit: (key: string, actorId: string | null, action: Parameters<PlatformSettingsService["audit"]>[2]) =>
      service.audit(key, actorId, action),
    async start() {
      if (started) return;
      started = true;
      try {
        await service.load();
      } catch (error) {
        started = false;
        throw error;
      }
    },
    stop() {
      started = false;
    },
  };
}

export type SettingsModule = ReturnType<typeof createSettingsModule>;

const MOVED_ENV = [
  "ANTHROPIC_API_KEY", "OPENROUTER_API_KEY", "OPENAI_BASE_URL", "OPENAI_API_KEY",
  "FORJA_PROVIDERS", "FORJA_MODELS", "BUILDER_MODEL", "APP_AI_MODEL", "FORJA_SIGNUP",
  "FREE_CREDITS", "CREDITS_PER_USD", "SMTP_URL", "EMAIL_FROM", "STRIPE_SECRET_KEY",
  "FORJA_MODELS_ALLOW", "GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET", "GITHUB_WEBHOOK_SECRET",
  "GITHUB_POLL_MS", "GITHUB_API_URL", "GITHUB_WEB_URL", "LANGFUSE_PUBLIC_KEY",
  "LANGFUSE_SECRET_KEY", "LANGFUSE_BASE_URL", "FORJA_NPM", "FORJA_NPM_REGISTRY",
  "FORJA_EVALS", "FORJA_EVALS_MAX_RUN_USD", "FORJA_EVALS_MAX_DAILY_USD", "FORJA_EVALS_CONCURRENCY",
];

export function warnMovedEnv() {
  const set = MOVED_ENV.filter((key) => process.env[key]);
  if (set.length) console.warn(`[forja] Estas variables de entorno ya no se leen: ${set.join(", ")}. Configúralas en el studio, Administración (o en seed.local.json).`);
}
