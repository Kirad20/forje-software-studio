import { config } from "../../shared/config.js";
import { createCatalogService } from "./application/CatalogService.js";
import { createCatalogSync } from "./infrastructure/OpenRouterCatalogSync.js";
import { postgresCatalogRepository } from "./infrastructure/PostgresCatalogRepository.js";
import { OPENROUTER_URL, usableProviders } from "./providers.js";
import type { Provider } from "./domain/models.js";
export * from "./domain/models.js";
export { createCatalogService } from "./application/CatalogService.js";
export type { CatalogRepository } from "./ports/CatalogRepository.js";

export const createPlatformCatalogService = () => createCatalogService(postgresCatalogRepository);
export { createCatalogSync } from "./infrastructure/OpenRouterCatalogSync.js";
let platform: ReturnType<typeof createCatalogService> | undefined;
let synchronization: ReturnType<typeof createCatalogSync> | undefined;
const catalog = () => platform ??= createPlatformCatalogService();
const sync = () => synchronization ??= createCatalogSync();
export function bindCatalogService(service: ReturnType<typeof createCatalogService>) {
  platform = service;
  return () => { if (platform === service) platform = undefined; };
}
export function bindCatalogSync(service: ReturnType<typeof createCatalogSync>) {
  synchronization = service;
  return () => { if (synchronization === service) synchronization = undefined; };
}
export const platformAllows: ReturnType<typeof createCatalogService>["platformAllows"] = (...args) => catalog().platformAllows(...args);
export const availableModels: ReturnType<typeof createCatalogService>["availableModels"] = (...args) => catalog().availableModels(...args);
export const listCatalog: ReturnType<typeof createCatalogService>["listCatalog"] = (...args) => catalog().listCatalog(...args);
export const allowedModels: ReturnType<typeof createCatalogService>["allowedModels"] = (...args) => catalog().allowedModels(...args);
export const saveModel: ReturnType<typeof createCatalogService>["saveModel"] = (...args) => catalog().saveModel(...args);
export const deleteModel: ReturnType<typeof createCatalogService>["deleteModel"] = (...args) => catalog().deleteModel(...args);
export const setAccountModels: ReturnType<typeof createCatalogService>["setAccountModels"] = (...args) => catalog().setAccountModels(...args);
export const setProjectModels: ReturnType<typeof createCatalogService>["setProjectModels"] = (...args) => catalog().setProjectModels(...args);
export const creditsForUsd: ReturnType<typeof createCatalogService>["creditsForUsd"] = (...args) => catalog().creditsForUsd(...args);
export const syncOpenRouter = () => sync().syncOpenRouter();
export const lastSync = () => sync().lastSync();
export const startCatalogSync = () => sync().startCatalogSync();
export const stopCatalogSync = () => synchronization?.stopCatalogSync() ?? Promise.resolve();

export function providers(): Provider[] {
  return usableProviders().map(p => p.kind === "anthropic"
    ? { id: p.id, kind: p.kind }
    : p.id === "openrouter"
      ? { id: p.id, kind: p.kind, endpoint: { baseUrl: OPENROUTER_URL, apiKey: p.apiKey,
        headers: { "HTTP-Referer": config.publicUrl, "X-Title": "Forja", ...p.headers } } }
      : { id: p.id, kind: p.kind, endpoint: { baseUrl: p.baseUrl!, apiKey: p.apiKey || undefined, headers: p.headers } });
}
export const providerOf = (id: string) => providers().find(p => p.id === id);
