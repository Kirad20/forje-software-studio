import { missingProvider, ProviderError, type ProviderInput, type ProviderRecord, type ProviderView } from "../domain/providers.js";
import type { ProviderRepository } from "../ports/ProviderRepository.js";

export function createProviderService(repository: ProviderRepository) {
  let cache: ProviderRecord[] = [];
  let loaded = false;
  const listeners: (() => void)[] = [];
  const onProvidersChanged = (fn: () => void) => {
    listeners.push(fn);
    return () => {
      const index = listeners.indexOf(fn);
      if (index >= 0) listeners.splice(index, 1);
    };
  };
  async function reloadProviders() {
    cache = await repository.list();
    loaded = true;
    for (const listener of [...listeners]) listener();
  }
  async function ensureProviders() {
    if (!loaded) await reloadProviders();
  }
  const usableProviders = () => cache.filter(p => !missingProvider(p));
  const providerSecret = (id: string) => cache.find(p => p.id === id && !missingProvider(p))?.apiKey || undefined;
  async function listProviders(): Promise<ProviderView[]> {
    await reloadProviders();
    return cache.map(({ apiKey, headers, ...p }) => ({
      ...p, headerNames: Object.keys(headers), keySet: !!apiKey || p.keyBroken,
      keyHint: apiKey.length >= 8 ? `…${apiKey.slice(-4)}` : null,
      available: !missingProvider({ apiKey, headers, ...p }), missing: missingProvider({ apiKey, headers, ...p }),
    }));
  }
  async function saveProvider(input: ProviderInput, actorId: string | null, opts: { create?: boolean; seed?: boolean } = {}) {
    const p = repository.validate(input);
    const existing = await repository.find(p.id);
    if (opts.create && existing) throw new ProviderError(`Ya existe un proveedor «${p.id}».`);
    if (!existing && !opts.create) throw new ProviderError(`No existe el proveedor «${p.id}».`);
    if (p.kind && existing && p.kind !== existing.kind) throw new ProviderError("El tipo de un proveedor no se puede cambiar.");
    if (p.id === "openrouter" && p.baseUrl) throw new ProviderError("La URL de OpenRouter es fija.");
    const baseUrl = p.baseUrl === undefined ? undefined : p.baseUrl?.replace(/\/$/, "") ?? null;
    if (!existing) {
      if (!baseUrl) throw new ProviderError("El proveedor necesita una URL base.");
      await repository.create({ ...p, baseUrl });
      if (!opts.seed) await repository.audit(p.id, actorId, "create");
    } else {
      const changed = await repository.update({ ...p, baseUrl }, !!opts.seed);
      if (changed && !opts.seed) await repository.audit(p.id, actorId, "set");
    }
    await reloadProviders();
  }
  async function deleteProvider(id: string, actorId: string | null) {
    const row = await repository.find(id);
    if (!row) throw new ProviderError(`No existe el proveedor «${id}».`);
    if (row.builtin) throw new ProviderError("Los proveedores integrados no se borran: desactívalo.");
    await repository.remove(id);
    await repository.audit(id, actorId, "delete");
    await reloadProviders();
  }
  return { reloadProviders, ensureProviders, usableProviders, providerSecret, listProviders, saveProvider, deleteProvider, onProvidersChanged };
}
