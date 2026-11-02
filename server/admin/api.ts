import { Hono } from "hono";
import { deleteModel, listCatalog, ModelError, saveModel, syncOpenRouter, lastSync, type ModelInput } from "../llm/catalog.js";
import { deleteProvider, listProviders, ProviderError, providerSecret, saveProvider, type ProviderInput } from "../llm/providers.js";
import { rateLimit, RateLimitError } from "../lib/security.js";
import type { Account } from "../platform/accounts.js";
import { GROUPS } from "../settings/registry.js";
import { listSettings, resetSetting, SettingsError, updateSettings } from "../settings/store.js";
import { cancelPlayground, listPlaygroundRuns, PlaygroundError, playgroundRoles, playgroundRun, startPlayground } from "./playground.js";
import { listProviderModels, probeModel, probeProvider } from "./probe.js";
import { resetRouter, routerStats } from "./router.js";

/**
 * /api/admin/*  Platform configuration (settings, model providers, the model catalog) and the
 * tools to try it (connection tests, the agent playground, what the router learned).
 * Mounted under studioApi's admin guard, so only platform admins get here.
 */
export const adminApi = new Hono<{ Variables: { account: Account } }>();

adminApi.onError((err, c) => {
  if (err instanceof RateLimitError) return c.json({ error: err.message }, 429, { "retry-after": String(err.retryAfterSec) });
  if (err instanceof SettingsError) return c.json({ error: err.message, field: err.field }, 400);
  if (err instanceof ProviderError || err instanceof ModelError) return c.json({ error: err.message }, 400);
  return c.json({ error: err.message }, 400);
});

const me = (c: { get(k: "account"): Account }) => c.get("account").id;
const body = async <T,>(c: { req: { json<X>(): Promise<X> } }) => ((await c.req.json<T>().catch(() => ({}))) ?? {}) as T;

// --- Settings ----------------------------------------------------------------------------

adminApi.get("/settings", async (c) => c.json({ groups: GROUPS, settings: await listSettings() }));
adminApi.patch("/settings", async (c) => {
  const patch = await body<Record<string, unknown>>(c);
  if (typeof patch !== "object" || Array.isArray(patch)) return c.json({ error: "Se espera un objeto { clave: valor }" }, 400);
  return c.json({ changed: await updateSettings(patch, me(c)), settings: await listSettings() });
});
adminApi.delete("/settings/:key", async (c) => {
  await resetSetting(c.req.param("key")!, me(c));
  return c.json({ settings: await listSettings() });
});

// --- Providers ---------------------------------------------------------------------------

adminApi.get("/providers", async (c) => c.json({ providers: await listProviders() }));
adminApi.post("/providers", async (c) => {
  const input = await body<ProviderInput>(c);
  await saveProvider({ ...input, kind: "openai" }, me(c), { create: true });
  return c.json({ providers: await listProviders() }, 201);
});
adminApi.patch("/providers/:id", async (c) => {
  const input = await body<ProviderInput>(c);
  await saveProvider({ ...input, id: c.req.param("id")! }, me(c));
  return c.json({ providers: await listProviders() });
});
adminApi.delete("/providers/:id", async (c) => {
  await deleteProvider(c.req.param("id")!, me(c));
  return c.json({ providers: await listProviders() });
});
adminApi.post("/providers/:id/test", async (c) => {
  rateLimit(`probe:${me(c)}`, 30, 60_000);
  return c.json(await probeProvider(c.req.param("id")!));
});

adminApi.get("/providers/:id/models", async (c) => {
  rateLimit(`probe:${me(c)}`, 30, 60_000);
  return c.json(await listProviderModels(c.req.param("id")!));
});

// --- Models ------------------------------------------------------------------------------

adminApi.get("/models", async (c) =>
  c.json({
    models: await listCatalog(),
    openrouter: { configured: !!providerSecret("openrouter"), lastSync: await lastSync() },
  }),
);
adminApi.post("/models", async (c) => {
  const id = await saveModel(await body<ModelInput>(c), me(c), { create: true });
  return c.json({ id }, 201);
});
adminApi.post("/models/sync", async (c) => {
  if (!providerSecret("openrouter")) return c.json({ error: "Configura y activa OpenRouter para sincronizar su catálogo." }, 400);
  rateLimit(`sync:${me(c)}`, 5, 60 * 60_000);
  return c.json({ synced: await syncOpenRouter() });
});
// Model ids contain ":" and often "/" (openrouter:qwen/qwen3-coder): taken from the rest of the path.
adminApi.post("/models/test/*", async (c) => {
  rateLimit(`probe:${me(c)}`, 30, 60_000);
  return c.json(await probeModel(modelIdOf(c.req.path, "/models/test/"), me(c)));
});
adminApi.patch("/models/item/*", async (c) => {
  const id = modelIdOf(c.req.path, "/models/item/");
  const [provider, ...rest] = id.split(":");
  await saveModel({ ...(await body<Partial<ModelInput>>(c)), provider: provider!, model: rest.join(":") }, me(c));
  return c.json({ ok: true });
});
adminApi.delete("/models/item/*", async (c) => {
  await deleteModel(modelIdOf(c.req.path, "/models/item/"), me(c));
  return c.json({ ok: true });
});

// --- Agent playground --------------------------------------------------------------------

adminApi.get("/agents/roles", (c) => c.json({ roles: playgroundRoles() }));
adminApi.get("/agents/runs", (c) => c.json({ runs: listPlaygroundRuns() }));
adminApi.post("/agents/runs", async (c) => {
  rateLimit(`playground:${me(c)}`, 20, 60 * 60_000);
  try {
    return c.json({ runId: await startPlayground(await body(c), me(c)) }, 202);
  } catch (e) {
    if (e instanceof PlaygroundError) return c.json({ error: e.message }, e.status);
    throw e;
  }
});
adminApi.get("/agents/runs/:id", (c) => {
  const run = playgroundRun(c.req.param("id")!);
  return run ? c.json(run) : c.json({ error: "Ejecución no encontrada" }, 404);
});
adminApi.post("/agents/runs/:id/cancel", (c) => c.json({ cancelled: cancelPlayground(c.req.param("id")!) }));

// --- Router ------------------------------------------------------------------------------

adminApi.get("/router/stats", async (c) => c.json(await routerStats()));
adminApi.post("/router/reset", async (c) => {
  const f = await body<{ taskClass?: string; modelId?: string }>(c);
  return c.json({ removed: await resetRouter({ taskClass: f.taskClass ? String(f.taskClass) : undefined, modelId: f.modelId ? String(f.modelId) : undefined }) });
});

function modelIdOf(path: string, marker: string) {
  return decodeURIComponent(path.slice(path.indexOf(marker) + marker.length));
}
