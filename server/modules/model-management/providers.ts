import { createProviderService } from "./application/ProviderService.js";
import { postgresProviderRepository } from "./infrastructure/PostgresProviderRepository.js";
export { createProviderService } from "./application/ProviderService.js";
export * from "./domain/providers.js";
export type { ProviderRepository } from "./ports/ProviderRepository.js";

export const createPlatformProviderService = () => createProviderService(postgresProviderRepository);
let platform: ReturnType<typeof createProviderService> | undefined;
const providers = () => platform ??= createPlatformProviderService();
export function bindProviderService(service: ReturnType<typeof createProviderService>) {
  platform = service;
  return () => { if (platform === service) platform = undefined; };
}
export const reloadProviders: ReturnType<typeof createProviderService>["reloadProviders"] = (...args) => providers().reloadProviders(...args);
export const ensureProviders: ReturnType<typeof createProviderService>["ensureProviders"] = (...args) => providers().ensureProviders(...args);
export const usableProviders: ReturnType<typeof createProviderService>["usableProviders"] = (...args) => providers().usableProviders(...args);
export const providerSecret: ReturnType<typeof createProviderService>["providerSecret"] = (...args) => providers().providerSecret(...args);
export const listProviders: ReturnType<typeof createProviderService>["listProviders"] = (...args) => providers().listProviders(...args);
export const saveProvider: ReturnType<typeof createProviderService>["saveProvider"] = (...args) => providers().saveProvider(...args);
export const deleteProvider: ReturnType<typeof createProviderService>["deleteProvider"] = (...args) => providers().deleteProvider(...args);
export const onProvidersChanged: ReturnType<typeof createProviderService>["onProvidersChanged"] = (...args) => providers().onProvidersChanged(...args);
