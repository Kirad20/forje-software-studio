import { createRouterAdministration } from "./application/RouterAdministration.js";
import { postgresRouterAdministrationRepository } from "./infrastructure/PostgresRouterAdministrationRepository.js";
export { createRouterAdministration } from "./application/RouterAdministration.js";
export type { RouterStats } from "./domain/routerAdmin.js";
export type { RouterAdministrationRepository } from "./ports/RouterAdministrationRepository.js";
export const routerStats = (limit = 100) => createRouterAdministration(postgresRouterAdministrationRepository).routerStats(limit);
export const resetRouter = (filter: { taskClass?: string; modelId?: string }) =>
  createRouterAdministration(postgresRouterAdministrationRepository).resetRouter(filter);
