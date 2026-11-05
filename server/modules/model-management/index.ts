export * from "./messages.js";
export { createModelRouter, createPlatformModelRouter } from "./router.js";
export type { ModelInfo, ModelScope, Provider, CompatEndpoint } from "./domain/models.js";
export type { Role, Mode, Features, PickInput, Billing, CallOptions, CallResult } from "./domain/routing.js";
import { createPlatformModelRouter, bindModelRouter } from "./router.js";
import { createPlatformProviderService, bindProviderService } from "./providers.js";
import { createPlatformCatalogService, createCatalogSync, bindCatalogService, bindCatalogSync } from "./catalog.js";
import { resetAnthropicClient } from "./anthropic.js";
import { bindModelAudit, type ModelAudit } from "./audit.js";
import { createModelManagementQueries } from "./application/ModelManagementQueries.js";
import { postgresModelManagementRepository } from "./infrastructure/PostgresModelManagementRepository.js";
import { routingPorts } from "./infrastructure/routing.js";
import { createRouterAdministration } from "./application/RouterAdministration.js";
import { postgresRouterAdministrationRepository } from "./infrastructure/PostgresRouterAdministrationRepository.js";
import { createModelClassification } from "./application/ModelClassification.js";
import { recordClassificationUsage } from "./infrastructure/PostgresClassificationUsage.js";
export { createModelManagementQueries } from "./application/ModelManagementQueries.js";
export type { ProjectModelPatch, RouterDecisionView, ModelSpendView } from "./domain/management.js";
export type { ModelManagementRepository } from "./ports/ModelManagementRepository.js";

/** Bootstrap owns the instances and their lifecycle; named entrypoints consume the bindings. */
export function createPlatformModelManagement(audit?: ModelAudit) {
  const providers = createPlatformProviderService();
  const catalog = createPlatformCatalogService();
  const router = createPlatformModelRouter();
  const classification = createModelClassification({ catalog, callModel: router.callModel, recordUsage: recordClassificationUsage });
  const sync = createCatalogSync();
  const management = {
    ...createModelManagementQueries(postgresModelManagementRepository, catalog, routingPorts.posteriors),
    ...createRouterAdministration(postgresRouterAdministrationRepository),
  };
  let active = false;
  let generation = 0;
  let starting: Promise<void> | undefined;
  let releases: (() => void)[] = [];
  const unbind = () => {
    for (const release of releases.reverse()) release();
    releases = [];
    resetAnthropicClient();
  };
  const start = () => {
    if (active) return starting ?? Promise.resolve();
    active = true;
    const current = ++generation;
    releases = [
      bindProviderService(providers), bindCatalogService(catalog), bindModelRouter(router), bindCatalogSync(sync),
      ...(audit ? [bindModelAudit(audit)] : []),
    ];
    starting = providers.ensureProviders().then(() => {
      if (active && generation === current) sync.startCatalogSync();
    }).catch(error => {
      if (generation === current) { active = false; unbind(); }
      throw error;
    });
    return starting;
  };
  const stop = async () => {
    active = false;
    ++generation;
    await starting?.catch(() => {});
    await sync.stopCatalogSync();
    unbind();
    starting = undefined;
  };
  return { providers, catalog, router, classification, sync, management, start, stop };
}
