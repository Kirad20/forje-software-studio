import { createPlatformSettings } from "./infrastructure/createPlatformSettings.js";
import { PlatformSettingsRegistryAdapter, PostgresPlatformSettingsStoreAdapter } from "./infrastructure/SettingsAdapters.js";
import { GetPlatformSettingsUseCase } from "./application/GetPlatformSettingsUseCase.js";
import { UpdatePlatformSettingsUseCase } from "./application/UpdatePlatformSettingsUseCase.js";

export * from "./domain/SettingDefinition.js";
export * from "./domain/SettingValue.js";
export * from "./domain/PlatformSetting.js";
export * from "./ports/repositories.js";
export * from "./ports/platform.js";
export { PlatformSettingsService } from "./application/PlatformSettingsService.js";
export { PlatformSettingsRegistryAdapter, PostgresPlatformSettingsStoreAdapter };

export const platformSettings = createPlatformSettings();
export const settingsRegistry = new PlatformSettingsRegistryAdapter();
export const settingsStore = new PostgresPlatformSettingsStoreAdapter(platformSettings);
export const getPlatformSettingsUseCase = new GetPlatformSettingsUseCase(settingsRegistry, settingsStore);
export const updatePlatformSettingsUseCase = new UpdatePlatformSettingsUseCase(settingsRegistry, settingsStore);
