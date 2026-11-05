import { creditsAtRate, matchesModelPolicy, ModelError, validateModelInput, type ModelInfo, type ModelInput, type ModelScope } from "../domain/models.js";
import type { CatalogRepository } from "../ports/CatalogRepository.js";
import { classifyProviderModel, type ProviderModel } from "../domain/classification.js";

export function createCatalogService(repository: CatalogRepository) {
  const platformAllows = (model: ModelInfo) => matchesModelPolicy(model, repository.policy().allow);
  const availableModels = () => repository.available();
  async function listCatalog() {
    const usable = new Set(await repository.usableProviderIds());
    return (await repository.list()).map(m => ({ ...m, available: m.enabled && usable.has(m.provider), allowed: platformAllows(m) }));
  }
  async function allowedModels(scope: ModelScope) {
    let models = (await availableModels()).filter(platformAllows);
    if (await repository.accountCustomized(scope.accountId)) {
      const enabled = new Set(await repository.accountModels(scope.accountId));
      models = models.filter(m => enabled.has(m.id));
    }
    if (scope.projectId) {
      const enabled = new Set(await repository.projectModels(scope.projectId));
      if (enabled.size) models = models.filter(m => enabled.has(m.id));
    }
    return models;
  }
  async function modelReadiness(scope: ModelScope) {
    const customized = await repository.accountCustomized(scope.accountId);
    const account = customized ? new Set(await repository.accountModels(scope.accountId)) : null;
    const project = scope.projectId ? new Set(await repository.projectModels(scope.projectId)) : null;
    return (await listCatalog()).map(m => ({
      ...m,
      blockers: [
        !m.enabled ? "Modelo desactivado" : "",
        m.enabled && !m.available ? "Proveedor no disponible" : "",
        !m.allowed ? "Bloqueado por la lista de la plataforma" : "",
        account && !account.has(m.id) ? "No permitido en tu cuenta" : "",
        project?.size && !project.has(m.id) ? "No permitido en este proyecto" : "",
      ].filter((reason): reason is string => typeof reason === "string" && !!reason),
    }));
  }
  async function permitAccountModel(accountId: string, modelId: string) {
    const model = (await listCatalog()).find(m => m.id === modelId);
    if (!model?.available || !model.allowed) throw new ModelError("El modelo debe estar activo, tener un proveedor disponible y estar permitido por la plataforma.");
    if (await repository.accountCustomized(accountId)) {
      await repository.replaceAccountModels(accountId, [...new Set([...await repository.accountModels(accountId), modelId])]);
    }
  }
  async function saveModel(input: ModelInput, actorId: string | null, opts: { create?: boolean } = {}) {
    const { id, model, changes } = validateModelInput(input);
    const existing = await repository.find(id);
    if (opts.create) {
      if (existing) throw new ModelError(`El modelo ${id} ya existe.`);
      if (!await repository.hasProvider(input.provider)) throw new ModelError(`No existe el proveedor «${input.provider}».`);
      if (input.provider === "openrouter") throw new ModelError("Los modelos de OpenRouter llegan con la sincronización.");
      await repository.create(id, input.provider, model, changes);
      await repository.audit(id, actorId, "create");
    } else {
      if (!existing) throw new ModelError(`No existe el modelo ${id}.`);
      if (Object.values(changes).some(value => value !== undefined)) {
        await repository.update(id, changes);
        await repository.audit(id, actorId, "set");
      }
    }
    return id;
  }
  async function deleteModel(id: string, actorId: string | null) {
    const row = await repository.find(id);
    if (!row) throw new ModelError(`No existe el modelo ${id}.`);
    if (row.source !== "custom") throw new ModelError("Solo se borran los modelos propios: desactívalo.");
    await repository.remove(id);
    await repository.audit(id, actorId, "delete");
  }
  async function importProviderModels(provider: string, remote: ProviderModel[], actorId: string | null) {
    if (provider === "openrouter") throw new ModelError("Usa la sincronización de OpenRouter.");
    if (!await repository.hasProvider(provider)) throw new ModelError(`No existe el proveedor «${provider}».`);
    const existing = new Set((await repository.list()).map(m => m.id));
    const result = { created: 0, skipped: 0, errors: [] as { model: string; error: string }[] };
    for (const model of remote) {
      const input = classifyProviderModel(provider, model);
      const id = `${provider}:${model.id.trim()}`;
      if (existing.has(id)) { result.skipped++; continue; }
      try {
        await saveModel(input, actorId, { create: true });
        existing.add(id);
        result.created++;
      } catch (error) {
        result.errors.push({ model: model.id, error: (error as Error).message });
      }
    }
    return result;
  }
  const setAccountModels = (id: string, ids: string[] | null) => repository.replaceAccountModels(id, ids === null ? null : [...new Set(ids)]);
  const setProjectModels = (id: string, ids: string[]) => repository.replaceProjectModels(id, [...new Set(ids)]);
  const creditsForUsd = (usd: number) => creditsAtRate(usd, repository.policy().creditsPerUsd);
  const accountCustomized = (accountId: string) => repository.accountCustomized(accountId);
  return { platformAllows, availableModels, listCatalog, allowedModels, modelReadiness, permitAccountModel, saveModel, deleteModel, importProviderModels, setAccountModels, setProjectModels, creditsForUsd, accountCustomized };
}
