import { Hono } from "hono";
import {
  ModelError,
  type ModelInput,
} from "../../modules/model-management/catalog.js";
import {
  ProviderError,
  type ProviderInput,
} from "../../modules/model-management/providers.js";
import { listProviderModels, probeModel, probeProvider } from "../../modules/model-management/probe.js";
import { createAdministrationApi, type AdministrationEnv } from "../../modules/administration/index.js";
import type { IdentityModule, PublicAccount } from "../../modules/identity/index.js";
import type { ProjectsModule } from "../../modules/projects/index.js";
import type { CollaborationModule } from "../../modules/collaboration/index.js";
import { GROUPS, SettingsError, type SettingsModule } from "../../modules/settings/index.js";
import {
  cancelPlayground,
  listPlaygroundRuns,
  PlaygroundError,
  playgroundRoles,
  playgroundRun,
  startPlayground,
} from "../../modules/evaluations/playground.js";
import { EVAL_EMAIL } from "../../modules/evaluations/runner.js";
import { createPlatformModelManagement } from "../../modules/model-management/index.js";
import { rateLimit, RateLimitError, RateLimitStoreError } from "../../shared/security.js";

type AdminApiModules = {
  identity: IdentityModule;
  projects: ProjectsModule;
  collaboration: CollaborationModule;
  settings: SettingsModule;
  models: ReturnType<typeof createPlatformModelManagement>;
};

const me = (c: { get(k: "account"): PublicAccount }) => c.get("account").id;
const body = async <T,>(c: { req: { json<X>(): Promise<X> } }) => ((await c.req.json<T>().catch(() => ({}))) ?? {}) as T;

export function createAdminApi({ identity, settings, models }: AdminApiModules) {
  const accountRoutes = new Hono<AdministrationEnv>();
  const settingsRoutes = new Hono<AdministrationEnv>();
  const modelRoutes = new Hono<AdministrationEnv>();
  const agentRoutes = new Hono<AdministrationEnv>();
  const routerRoutes = new Hono<AdministrationEnv>();

  accountRoutes.get("/users", async (c) => c.json({ users: await identity.listAccounts(EVAL_EMAIL) }));
  accountRoutes.patch("/users/:id", async (c) => {
    const id = c.req.param("id")!;
    const { disabled, platformRole } = await c.req.json<{ disabled?: boolean; platformRole?: "admin" | "user" }>();
    const actorId = me(c);
    if (!(await identity.getAccount(id))) return c.json({ error: "Cuenta no encontrada" }, 404);
    if (id === actorId && (disabled || platformRole === "user")) return c.json({ error: "No puedes quitarte el acceso ni el rol a ti misma." }, 400);
    if (platformRole && platformRole !== "admin" && platformRole !== "user") return c.json({ error: "Rol no válido" }, 400);
    await identity.updateAccountAccess(id, {
      ...(platformRole ? { platformRole } : {}),
      ...(disabled === undefined ? {} : { disabled: !!disabled }),
    });
    return c.json({ ok: true });
  });

  settingsRoutes.get("/settings", async (c) => c.json({ groups: GROUPS, settings: await settings.listSettings() }));
  settingsRoutes.patch("/settings", async (c) => {
    const patch = await body<Record<string, unknown>>(c);
    if (typeof patch !== "object" || Array.isArray(patch)) return c.json({ error: "Se espera un objeto { clave: valor }" }, 400);
    return c.json({ changed: await settings.updateSettings(patch, me(c)), settings: await settings.listSettings() });
  });
  settingsRoutes.delete("/settings/:key", async (c) => {
    await settings.resetSetting(c.req.param("key")!, me(c));
    return c.json({ settings: await settings.listSettings() });
  });

  modelRoutes.get("/providers", async (c) => c.json({ providers: await models.providers.listProviders() }));
  modelRoutes.post("/providers", async (c) => {
    const input = await body<ProviderInput>(c);
    if (input.kind !== undefined && input.kind !== "openai" && input.kind !== "ollama") {
      throw new ProviderError("El tipo debe ser OpenAI u Ollama.");
    }
    await models.providers.saveProvider({ ...input, kind: input.kind ?? "openai" }, me(c), { create: true });
    return c.json({ providers: await models.providers.listProviders() }, 201);
  });
  modelRoutes.patch("/providers/:id", async (c) => {
    const input = await body<ProviderInput>(c);
    await models.providers.saveProvider({ ...input, id: c.req.param("id")! }, me(c));
    return c.json({ providers: await models.providers.listProviders() });
  });
  modelRoutes.delete("/providers/:id", async (c) => {
    await models.providers.deleteProvider(c.req.param("id")!, me(c));
    return c.json({ providers: await models.providers.listProviders() });
  });
  modelRoutes.post("/providers/:id/test", async (c) => {
    await rateLimit(`probe:${me(c)}`, 30, 60_000);
    return c.json(await probeProvider(c.req.param("id")!));
  });
  modelRoutes.get("/providers/:id/models", async (c) => {
    await rateLimit(`probe:${me(c)}`, 30, 60_000);
    return c.json(await listProviderModels(c.req.param("id")!));
  });
  modelRoutes.post("/providers/:id/models/import", async (c) => {
    await rateLimit(`sync:${me(c)}`, 5, 60 * 60_000);
    const provider = c.req.param("id")!;
    if (provider === "openrouter") throw new ModelError("Usa la sincronización de OpenRouter.");
    const remote = await listProviderModels(provider);
    if (remote.error) return c.json({ error: remote.error }, 400);
    return c.json(await models.classification.importProviderModels({ accountId: me(c) }, provider, remote.models));
  });

  modelRoutes.get("/models", async (c) =>
    c.json({
      models: await models.catalog.modelReadiness({ accountId: me(c) }),
      openrouter: { configured: !!models.providers.providerSecret("openrouter"), lastSync: await models.sync.lastSync() },
    }),
  );
  modelRoutes.post("/models", async (c) => {
    const id = await models.catalog.saveModel(await body<ModelInput>(c), me(c), { create: true });
    return c.json({ id }, 201);
  });
  modelRoutes.post("/models/permit/*", async (c) => {
    await models.catalog.permitAccountModel(me(c), modelIdOf(c.req.path, "/models/permit/"));
    return c.json({ ok: true });
  });
  modelRoutes.post("/models/sync", async (c) => {
    if (!models.providers.providerSecret("openrouter")) return c.json({ error: "Configura y activa OpenRouter para sincronizar su catálogo." }, 400);
    await rateLimit(`sync:${me(c)}`, 5, 60 * 60_000);
    return c.json({ synced: await models.sync.syncOpenRouter() });
  });
  modelRoutes.post("/models/test/*", async (c) => {
    await rateLimit(`probe:${me(c)}`, 30, 60_000);
    return c.json(await probeModel(modelIdOf(c.req.path, "/models/test/"), me(c)));
  });
  modelRoutes.patch("/models/item/*", async (c) => {
    const id = modelIdOf(c.req.path, "/models/item/");
    const [provider, ...rest] = id.split(":");
    await models.catalog.saveModel({ ...(await body<Partial<ModelInput>>(c)), provider: provider!, model: rest.join(":") }, me(c));
    return c.json({ ok: true });
  });
  modelRoutes.delete("/models/item/*", async (c) => {
    await models.catalog.deleteModel(modelIdOf(c.req.path, "/models/item/"), me(c));
    return c.json({ ok: true });
  });

  agentRoutes.get("/agents/roles", (c) => c.json({ roles: playgroundRoles() }));
  agentRoutes.get("/agents/runs", (c) => c.json({ runs: listPlaygroundRuns() }));
  agentRoutes.post("/agents/runs", async (c) => {
    await rateLimit(`playground:${me(c)}`, 20, 60 * 60_000);
    try {
      return c.json({ runId: await startPlayground(await body(c), me(c)) }, 202);
    } catch (error) {
      if (error instanceof PlaygroundError) return c.json({ error: error.message }, error.status);
      throw error;
    }
  });
  agentRoutes.get("/agents/runs/:id", (c) => {
    const run = playgroundRun(c.req.param("id")!);
    return run ? c.json(run) : c.json({ error: "Ejecución no encontrada" }, 404);
  });
  agentRoutes.post("/agents/runs/:id/cancel", (c) => c.json({ cancelled: cancelPlayground(c.req.param("id")!) }));

  routerRoutes.get("/router/stats", async (c) => c.json(await models.management.routerStats()));
  routerRoutes.post("/router/reset", async (c) => {
    const f = await body<{ taskClass?: string; modelId?: string }>(c);
    return c.json({ removed: await models.management.resetRouter({ taskClass: f.taskClass ? String(f.taskClass) : undefined, modelId: f.modelId ? String(f.modelId) : undefined }) });
  });

  const api = createAdministrationApi({
    accounts: accountRoutes,
    settings: settingsRoutes,
    models: modelRoutes,
    agents: agentRoutes,
    router: routerRoutes,
  });
  api.onError((error, c) => {
    if (error instanceof RateLimitError) return c.json({ error: error.message }, 429, { "retry-after": String(error.retryAfterSec) });
    if (error instanceof RateLimitStoreError) return c.json({ error: error.message }, 503);
    if (error instanceof SettingsError) return c.json({ error: error.message, field: error.field }, 400);
    if (error instanceof ProviderError || error instanceof ModelError) return c.json({ error: error.message }, 400);
    return c.json({ error: (error as Error).message }, 400);
  });
  return api;
}

function modelIdOf(path: string, marker: string) {
  return decodeURIComponent(path.slice(path.indexOf(marker) + marker.length));
}
