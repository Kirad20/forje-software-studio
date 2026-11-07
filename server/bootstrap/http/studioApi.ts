import { Hono, type Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { aiUsage } from "../../modules/app-services/ai.js";
import { listEmails, receiveEmail, sendEmail } from "../../modules/app-services/email.js";
import { cancelTimer, listJobs, runJob, scheduleProject, setJobEnabled } from "../../modules/app-services/jobs.js";
import {
  describeSchema,
  dumpDatabase,
  execSql,
  isAwake,
  projectDbMetrics,
  listProjectRows,
  createProjectRow,
  deleteProjectRows,
  listAppUsers,
  projectServiceCounts,
  ProjectDataError,
} from "../../modules/app-services/projectDb.js";
import { realtimeStats } from "../../modules/app-services/realtime.js";
import { deleteSecret, listSecrets, setSecret } from "../../modules/app-services/secrets.js";
import { deleteObject, listObjects, MAX_PROJECT_STORAGE_BYTES, storageUsage } from "../../modules/app-services/storage.js";
import { BuilderServiceClient, listTasks, loadHistory, type AgentEvent } from "../../modules/builder/index.js";
import { isBuilding, penalizeTurn, pendingPlan, runBuilderTurn, stopBuilding, type ChatMode } from "../../modules/builder/index.js";
import { replaceVisibleText } from "../../modules/builder/contracts.js";
import type { IdentityModule, PublicAccount } from "../../modules/identity/index.js";
import type { ProjectsModule, Project } from "../../modules/projects/index.js";
import type { ProjectKnowledgeModule } from "../../modules/project-knowledge/index.js";
import { parseStarterTemplate } from "../../modules/projects/index.js";
import type { CollaborationModule, Access, OrgRole } from "../../modules/collaboration/index.js";
import type { SettingsModule } from "../../modules/settings/index.js";
import { projectEvents, readLogs, type ProjectEvent } from "../../modules/project-observability/events.js";
import { clearProblems, listProblems, recheckBuild, watchProblems } from "../../modules/project-observability/problems.js";
import { getSecurity, runQuickScan, setIgnored } from "../../modules/project-observability/security.js";
import { startSecurityReview, metricsReport } from "../../modules/builder/index.js";
import { addMemory, deleteMemory, listMemories, setMemoryEnabled, updateMemory } from "../../modules/memory/memory.js";
import * as github from "../../modules/integrations/github.js";
import { createAdminApi } from "./adminApi.js";
import { evalsApi } from "../../modules/evaluations/api.js";
import {
  removeProjectData,
  publishProject,
  suggestSlug,
  unpublishProject,
  appUrl,
  previewOrigin,
  previewUrl,
  shareToken,
  createServiceControl,
  readServiceRuntime,
  restartServiceRuntime,
  SERVICES_MANIFEST,
  withManifestLock,
  type ServiceQueueEntry,
} from "../../modules/app-runtime/index.js";
import path from "node:path";
import { config } from "../../shared/config.js";
import { analyticsSummary } from "../../modules/app-services/analytics.js";
import { zip } from "../../shared/zip.js";
import {
  INTEGRATION_TYPES,
  connectIntegration,
  createIntegration,
  deleteIntegration,
  disconnectIntegration,
  listIntegrations,
  projectIntegrationIds,
  updateIntegrationValue,
} from "../../modules/integrations/connections.js";
import { usageSummary } from "../../modules/usage/usage.js";
import { createPlatformModelManagement, type ModelInfo } from "../../modules/model-management/index.js";
import { TOOL_HINTS } from "../mcp/server.js";
import { clientIp, isHttps, rateLimit, RateLimitError, RateLimitStoreError, requestOrigin, studioOrigins } from "../../shared/security.js";

type Env = { Variables: { account: PublicAccount; project: Project; access: Access; orgRole: OrgRole } };
type StudioApiModules = {
  identity: IdentityModule;
  projects: ProjectsModule;
  knowledge: ProjectKnowledgeModule;
  collaboration: CollaborationModule;
  settings: SettingsModule;
  models: ReturnType<typeof createPlatformModelManagement>;
};

export const SESSION_COOKIE = "forja_session";

export function createStudioApi(
  { identity: accounts, projects, knowledge, collaboration: orgs, settings, models }: StudioApiModules,
  builderClient = config.builderServiceUrl ? new BuilderServiceClient(config.builderServiceUrl, config.builderServiceToken) : undefined,
) {
const building = async (projectId: string) => builderClient ? (await builderClient.status(projectId)).building : isBuilding(projectId);
const stopBuild = async (projectId: string) => builderClient ? builderClient.stop(projectId) : stopBuilding(projectId);
const studioApi = new Hono<Env>();
const publicRoutes = new Hono<Env>();

studioApi.onError((err, c) => {
  if (err instanceof RateLimitError) return c.json({ error: err.message }, 429, { "retry-after": String(err.retryAfterSec) });
  if (err instanceof RateLimitStoreError) return c.json({ error: err.message }, 503);
  if (err instanceof github.GithubError) return c.json({ error: err.message }, ([400, 401, 403, 404, 409, 413, 422].includes(err.status) ? err.status : 502) as 400);
  return c.json({ error: err.message }, 400);
});

const sse = (start: (send: (data: unknown) => void, close: () => void) => () => void) => {
  let cleanup = () => {};
  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      let open = true;
      const send = (data: unknown) => open && controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`));
      const close = () => {
        if (!open) return;
        open = false;
        cleanup();
        controller.close();
      };
      cleanup = start(send, close);
    },
    cancel() {
      cleanup();
    },
  });
  return new Response(stream, { headers: { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" } });
};

type ChatStreamSubscriber = { send: (data: unknown) => void; close: () => void };
const activeChatStreams = new Map<string, { events: AgentEvent[]; subscribers: Set<ChatStreamSubscriber> }>();

const ipOf = (c: Context) =>
  clientIp((c.env as { incoming?: { socket?: { remoteAddress?: string } } })?.incoming?.socket?.remoteAddress, c.req.header("x-forwarded-for"));

/**
 * CSRF defence for the studio API. State-changing requests must come from the studio's
 * own origin (when the browser says where it comes from) and carry JSON, which a
 * cross-site form or beacon cannot send without a CORS preflight that we never grant.
 */
studioApi.use("*", async (c, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(c.req.method)) {
    const origin = c.req.header("origin");
    const sameOrigin = origin === requestOrigin({ host: c.req.header("host"), forwardedHost: c.req.header("x-forwarded-host"), forwardedProto: c.req.header("x-forwarded-proto") });
    if (origin && !sameOrigin && !studioOrigins().includes(origin)) return c.json({ error: "Origen no permitido" }, 403);
    const hasBody = Number(c.req.header("content-length") ?? 0) > 0 || !!c.req.header("transfer-encoding");
    if (hasBody && !(c.req.header("content-type") ?? "").includes("application/json")) return c.json({ error: "Se espera JSON" }, 415);
  }
  await next();
});

// --- Auth -------------------------------------------------------------------------

const startSession = (c: Context<Env>, token: string) =>
  setCookie(c, SESSION_COOKIE, token, { httpOnly: true, sameSite: "Lax", secure: isHttps(), path: "/", maxAge: 3600 * 24 * 30 });
const validEmail = (email: unknown): email is string => typeof email === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

/** What the sign-in screen needs before anyone is signed in. */
publicRoutes.get("/auth/status", async (c) => c.json({ needsSetup: await accounts.needsSetup(), signup: config.signup }));

/** First run: the one-time token from the server log creates the first administrator. */
publicRoutes.post("/auth/setup", async (c) => {
  const body = await c.req.json<{ token: string; email: string; password: string; name?: string }>();
  await rateLimit(`setup-ip:${ipOf(c)}`, 5, 15 * 60_000);
  startSession(c, await accounts.completeSetup(body));
  return c.json({ ok: true });
});

publicRoutes.post("/auth/login", async (c) => {
  const { email, password } = await c.req.json<{ email: string; password: string }>();
  if (!validEmail(email) || typeof password !== "string") return c.json({ error: "Correo o contraseña incorrectos" }, 401);
  await rateLimit(`pw-ip:${ipOf(c)}`, 30, 15 * 60_000);
  await rateLimit(`pw-email:${email.toLowerCase()}`, 10, 15 * 60_000);
  const token = await accounts.loginWithPassword(email, password);
  if (!token) return c.json({ error: "Correo o contraseña incorrectos" }, 401);
  startSession(c, token);
  return c.json({ ok: true });
});

publicRoutes.post("/auth/request", async (c) => {
  const { email } = await c.req.json<{ email: string }>();
  if (!validEmail(email)) return c.json({ error: "Correo no válido" }, 400);
  await rateLimit(`login-ip:${ipOf(c)}`, 20, 15 * 60_000);
  await rateLimit(`login-email:${email.toLowerCase()}`, 5, 15 * 60_000);
  // Same answer whether or not a code went out, so this cannot be used to probe who has an account.
  if (await accounts.canSignUp(email)) await accounts.requestLoginCode(email);
  return c.json({ ok: true, hint: "Si el correo puede entrar, recibirá un código. Sin SMTP configurado, el código está en la consola del servidor." });
});

publicRoutes.post("/auth/verify", async (c) => {
  const { email, code } = await c.req.json<{ email: string; code: string }>();
  await rateLimit(`verify-ip:${ipOf(c)}`, 30, 15 * 60_000);
  const token = await accounts.verifyLoginCode(email, code);
  if (!token) return c.json({ error: "Código incorrecto o caducado" }, 401);
  startSession(c, token);
  return c.json({ ok: true });
});

publicRoutes.post("/auth/password/forgot", async (c) => {
  const { email } = await c.req.json<{ email: string }>();
  if (!validEmail(email)) return c.json({ error: "Correo no válido" }, 400);
  await rateLimit(`reset-ip:${ipOf(c)}`, 10, 15 * 60_000);
  await rateLimit(`reset-email:${email.toLowerCase()}`, 3, 15 * 60_000);
  await accounts.requestPasswordReset(email);
  return c.json({ ok: true, hint: "Si el correo tiene cuenta, recibirá un código. Sin SMTP configurado, está en la consola del servidor." });
});

publicRoutes.post("/auth/password/reset", async (c) => {
  const { email, code, password } = await c.req.json<{ email: string; code: string; password: string }>();
  await rateLimit(`reset-verify-ip:${ipOf(c)}`, 20, 15 * 60_000);
  if (!(await accounts.resetPassword(email ?? "", code, password))) return c.json({ error: "Código incorrecto o caducado" }, 401);
  return c.json({ ok: true });
});

publicRoutes.post("/auth/logout", async (c) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) await accounts.endSession(token);
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  return c.json({ ok: true });
});

// GitHub push webhook: signed with GITHUB_WEBHOOK_SECRET, no session.
publicRoutes.post("/github/webhook", async (c) => {
  const chunks: Uint8Array[] = [];
  let size = 0;
  if (c.req.raw.body) for await (const chunk of c.req.raw.body) {
    size += chunk.byteLength;
    if (size > 2 * 1024 * 1024) throw new github.GithubError("Webhook demasiado grande.", 413);
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  const projects = await github.handleWebhook(raw, c.req.header("x-hub-signature-256"));
  return c.json({ ok: true, projects });
});

studioApi.route("/", publicRoutes);

// Everything below needs a signed-in account.
studioApi.use("*", async (c, next) => {
  const account = await accounts.accountFromSession(getCookie(c, SESSION_COOKIE));
  if (!account) return c.json({ error: "No has iniciado sesión" }, 401);
  c.set("account", account);
  await next();
});
const accountRoutes = new Hono<Env>();

accountRoutes.get("/me", async (c) => {
  const id = c.get("account").id;
  return c.json({ account: { ...(await accounts.getAccount(id)), sessions: await accounts.countSessions(id) } });
});
accountRoutes.patch("/me", async (c) => {
  const { name } = await c.req.json<{ name: string }>();
  await accounts.updateAccountName(c.get("account").id, name ?? "");
  return c.json({ ok: true });
});
accountRoutes.get("/me/security", async (c) => {
  return c.json(await accounts.getAccountSecurity(c.get("account").id));
});
accountRoutes.put("/me/password", async (c) => {
  const account = c.get("account");
  const { current, password } = await c.req.json<{ current?: string; password: string }>();
  await rateLimit(`pw-change:${account.id}`, 5, 15 * 60_000);
  await accounts.changePassword(account.id, current, password, account.email);
  // Every session ended with the old password; this one continues under a fresh token.
  startSession(c, await accounts.createSession(account.id));
  return c.json({ ok: true });
});
accountRoutes.post("/me/sign-out-others", async (c) =>
  c.json({ ended: await accounts.signOutOtherSessions(c.get("account").id, getCookie(c, SESSION_COOKIE)!) }),
);
accountRoutes.delete("/me", async (c) => {
  const account = c.get("account");
  const { confirmEmail } = await c.req.json<{ confirmEmail: string }>();
  if (confirmEmail?.trim().toLowerCase() !== account.email) return c.json({ error: "Escribe tu correo para confirmar." }, 400);
  for (const p of await projects.listProjects(account.id)) await unpublishProject(p.id);
  const ids = await accounts.deleteAccount(account.id);
  for (const id of ids) await removeProjectData(id);
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  return c.json({ ok: true });
});

accountRoutes.get("/usage", async (c) => c.json(await usageSummary(c.get("account").id)));

// --- Models: catalog, account whitelist, OpenRouter sync ---------------------------------------
const modelView = (m: ModelInfo, allowed: Set<string>, platform: boolean) => ({
  id: m.id,
  label: m.label,
  provider: m.provider,
  inPrice: m.inPrice,
  outPrice: m.outPrice,
  context: m.context,
  tools: m.tools,
  vision: m.vision,
  tier: m.tier,
  speed: m.speed,
  source: m.source,
  platformAllowed: platform,
  enabled: allowed.has(m.id),
});

accountRoutes.get("/models", async (c) => {
  const me = c.get("account");
  const all = await models.catalog.availableModels();
  const allowed = new Set((await models.catalog.allowedModels({ accountId: me.id })).map((m) => m.id));
  // The platform list can be long (OpenRouter has hundreds): only platform-allowed models are offered.
  const items = all.filter(models.catalog.platformAllows).map((m) => modelView(m, allowed, true));
  return c.json({
    models: items,
    customized: await models.catalog.accountCustomized(me.id),
    providers: models.providers.usableProviders().map((p) => ({ id: p.id, kind: p.kind })),
    openrouter: { configured: !!models.providers.providerSecret("openrouter"), lastSync: await models.sync.lastSync(), total: all.filter((m) => m.provider === "openrouter").length },
  });
});
accountRoutes.put("/models/account", async (c) => {
  const { enabled } = await c.req.json<{ enabled: string[] | null }>();
  await models.catalog.setAccountModels(c.get("account").id, Array.isArray(enabled) ? enabled.map(String) : null);
  return c.json({ ok: true });
});
accountRoutes.post("/models/sync", async (c) => {
  if (!models.providers.providerSecret("openrouter")) return c.json({ error: "Configura OpenRouter en Administración → Proveedores para sincronizar el catálogo." }, 400);
  await rateLimit(`sync:${c.get("account").id}`, 3, 60 * 60_000);
  return c.json({ synced: await models.sync.syncOpenRouter() });
});

// --- GitHub account: a token typed in the studio (never in chat), or OAuth when configured ----------
accountRoutes.get("/github", async (c) => c.json(await github.accountStatus(c.get("account").id)));
accountRoutes.post("/github/app/start", async (c) => {
  await rateLimit(`github-app:${c.get("account").id}`, 10, 60 * 60_000);
  return c.json(await github.appStart(c.get("account").id, getCookie(c, SESSION_COOKIE) ?? ""));
});
accountRoutes.get("/github/app/callback", async (c) => {
  try {
    await github.appFinish(c.get("account").id, getCookie(c, SESSION_COOKIE) ?? "", c.req.query("code") ?? "", c.req.query("state") ?? "");
    return c.redirect("/integrations?github=app-created");
  } catch (e) { return c.redirect(`/integrations?github=${encodeURIComponent((e as Error).message)}`); }
});
accountRoutes.get("/github/app/install", async (c) => c.redirect(await github.appInstallStart(c.get("account").id, getCookie(c, SESSION_COOKIE) ?? "")));
accountRoutes.get("/github/app/install/callback", async (c) => {
  try {
    await github.appInstallFinish(c.get("account").id, getCookie(c, SESSION_COOKIE) ?? "", Number(c.req.query("installation_id")), c.req.query("state") ?? "");
    return c.redirect("/integrations?github=connected");
  } catch (e) { return c.redirect(`/integrations?github=${encodeURIComponent((e as Error).message)}`); }
});
accountRoutes.get("/github/repos", async (c) => c.json(await github.listRepositories(c.get("account").id, Number(c.req.query("page") ?? 1))));
accountRoutes.get("/github/branches", async (c) => c.json(await github.listBranches(c.get("account").id, c.req.query("repo") ?? "", c.req.query("installationId") == null ? undefined : Number(c.req.query("installationId")), Number(c.req.query("page") ?? 1))));
accountRoutes.post("/github/token", async (c) => {
  const { token } = await c.req.json<{ token: string }>();
  await rateLimit(`github-token:${c.get("account").id}`, 10, 60 * 60_000);
  try {
    return c.json(await github.connectAccount(c.get("account").id, String(token ?? "")));
  } catch (e) {
    return c.json({ error: (e as github.GithubError).status === 401 ? "GitHub no aceptó ese token." : (e as Error).message }, 400);
  }
});
accountRoutes.delete("/github", async (c) => {
  await github.disconnectAccount(c.get("account").id);
  return c.json({ ok: true });
});
accountRoutes.get("/github/oauth/start", (c) => {
  if (!config.github.clientId) return c.json({ error: "OAuth de GitHub no configurado" }, 404);
  return c.redirect(github.oauthStart(c.get("account").id));
});
accountRoutes.get("/github/oauth/callback", async (c) => {
  try {
    await github.oauthFinish(c.get("account").id, c.req.query("code") ?? "", c.req.query("state") ?? "");
    return c.redirect("/account?github=ok");
  } catch (e) {
    return c.redirect(`/account?github=${encodeURIComponent((e as Error).message)}`);
  }
});

// Folders
accountRoutes.get("/folders", async (c) => c.json({ folders: await projects.listFolders(c.get("account").id) }));
accountRoutes.post("/folders", async (c) => {
  const { name } = await c.req.json<{ name: string }>();
  return c.json({ id: await projects.createFolder(c.get("account").id, name ?? "") });
});
accountRoutes.delete("/folders/:id", async (c) => {
  await projects.deleteFolder(c.get("account").id, c.req.param("id"));
  return c.json({ ok: true });
});

// Account-level integrations
accountRoutes.get("/integrations", async (c) => c.json({ integrations: await listIntegrations(c.get("account").id), types: INTEGRATION_TYPES }));
accountRoutes.post("/integrations", async (c) => c.json({ id: await createIntegration(c.get("account").id, await c.req.json()) }));
accountRoutes.put("/integrations/:id", async (c) => {
  const { value } = await c.req.json<{ value: string }>();
  await updateIntegrationValue(c.get("account").id, c.req.param("id"), value ?? "");
  return c.json({ ok: true });
});
accountRoutes.delete("/integrations/:id", async (c) => {
  await deleteIntegration(c.get("account").id, c.req.param("id"));
  return c.json({ ok: true });
});

accountRoutes.get("/tokens", async (c) => c.json({ tokens: await accounts.listApiTokens(c.get("account").id) }));
accountRoutes.post("/tokens", async (c) => {
  const { name, orgId, projectId } = await c.req.json<{ name?: string; orgId?: string | null; projectId?: string | null }>();
  if (orgId && projectId) return c.json({ error: "Elige un alcance de organización o de proyecto, no ambos." }, 400);
  if (projectId) {
    const project = await projects.getProject(projectId);
    if (!project || !(await orgs.accessOf(c.get("account").id, project))) return c.json({ error: "Proyecto no encontrado" }, 404);
  }
  // A token may be limited to one organization: an agent wired to a client's workspace sees nothing else.
  if (orgId && !(await orgs.orgRoleOf(orgId, c.get("account").id))) return c.json({ error: "Organización no encontrada" }, 404);
  return c.json({ token: await accounts.createApiToken(c.get("account").id, name || "Cliente MCP", orgId || null, projectId || null) });
});
accountRoutes.delete("/tokens/:id", async (c) => {
  await accounts.deleteApiToken(c.get("account").id, c.req.param("id"));
  return c.json({ ok: true });
});

// --- Organizations (tenants) and platform administration ------------------------------

accountRoutes.get("/orgs", async (c) => c.json({ orgs: await orgs.listOrgs(c.get("account").id) }));
accountRoutes.post("/orgs", async (c) => {
  const { name } = await c.req.json<{ name: string }>();
  return c.json({ org: await orgs.createOrg(c.get("account").id, name ?? "") });
});

/** Resolves :id to the caller's role in that organization; non-members get a 404, as if it did not exist. */
accountRoutes.use("/orgs/:id/*", async (c, next) => {
  const role = await orgs.orgRoleOf(c.req.param("id"), c.get("account").id);
  if (!role) return c.json({ error: "Organización no encontrada" }, 404);
  c.set("orgRole", role);
  await next();
});
accountRoutes.get("/orgs/:id/members", async (c) => c.json({ members: await orgs.listOrgMembers(c.req.param("id")!), role: c.get("orgRole") }));
accountRoutes.get("/orgs/:id/skills", async (c) => c.json({ skills: await orgs.listOrgSkills(c.req.param("id")!), role: c.get("orgRole") }));
accountRoutes.put("/orgs/:id/skills/:name", async (c) => {
  const input = await c.req.json<{ description?: string; body?: string; enabled?: boolean }>().catch(() => ({}));
  return c.json({ skills: await orgs.saveOrgSkill(c.req.param("id")!, c.get("orgRole"), c.get("account").id, { ...input, name: c.req.param("name") }) });
});
accountRoutes.delete("/orgs/:id/skills/:name", async (c) => c.json({ skills: await orgs.deleteOrgSkill(c.req.param("id")!, c.get("orgRole"), c.req.param("name")!) }));
accountRoutes.post("/orgs/:id/members", async (c) => {
  const { email, role } = await c.req.json<{ email: string; role?: OrgRole }>();
  await orgs.addOrgMember(c.req.param("id")!, c.get("orgRole"), email ?? "", role ?? "member");
  return c.json({ ok: true });
});
accountRoutes.patch("/orgs/:id/members/:accountId", async (c) => {
  const { role } = await c.req.json<{ role: OrgRole }>();
  await orgs.setOrgMemberRole(c.req.param("id")!, c.get("orgRole"), c.req.param("accountId")!, role);
  return c.json({ ok: true });
});
accountRoutes.delete("/orgs/:id/members/:accountId", async (c) => {
  await orgs.removeOrgMember(c.req.param("id")!, c.get("orgRole"), c.get("account").id, c.req.param("accountId")!);
  return c.json({ ok: true });
});

/** Platform administrators manage accounts; they get no access to other tenants' projects through this. */
accountRoutes.use("/admin/*", async (c, next) => {
  if (c.get("account").platformRole !== "admin") return c.json({ error: "Solo administradores de la plataforma." }, 403);
  await next();
});
const adminApi = createAdminApi({ identity: accounts, projects, collaboration: orgs, settings, models });

// Quality evals (admin only, and only with the evals.enabled setting on): see server/evals.
accountRoutes.route("/admin/evals", evalsApi);
// Settings, providers, models, agent playground and router (see server/admin).
accountRoutes.route("/admin", adminApi);

// --- Projects -------------------------------------------------------------------------

const projectView = async (p: Project) => ({
  ...p,
  previewUrl: previewUrl(p),
  previewOrigin: previewOrigin(p.id),
  // A private app's link carries the share token, like the preview's.
  appUrl: p.slug ? (p.visibility === "private" ? `${appUrl(p.slug)}/?share=${shareToken(p, 365)}` : appUrl(p.slug)) : null,
  suggestedSlug: p.slug ?? suggestSlug(p.name),
  building: await building(p.id),
  hasUnpublishedChanges: p.slug ? await projects.hasUnpublishedChanges(p.id) : false,
});

accountRoutes.post("/github/import", async (c) => {
  const input = await c.req.json<{ repo: string; branch?: string; installationId?: number | null; name?: string; orgId?: string }>();
  const accountId = c.get("account").id;
  if (input.orgId && !(await orgs.orgRoleOf(input.orgId, accountId))) return c.json({ error: "Organización no encontrada" }, 404);
  await rateLimit(`github-import:${accountId}`, 10, 60 * 60_000);
  // Fetch and validate the entire native snapshot before allocating a project.
  const prepared = await github.prepareImport(accountId, input);
  let created: Project | undefined;
  try {
    created = await projects.createProject(accountId, (input.name?.trim() || prepared.repo).slice(0, 60), `Importado de ${prepared.owner}/${prepared.repo}`, prepared.files, input.orgId);
    const result = await github.attachImport(created.id, accountId, prepared);
    const warnings = [...prepared.warnings];
    try {
      const problems = await recheckBuild(created.id);
      warnings.push(...problems.map((p) => `Compilación: ${p.title}`));
    } catch (e) { warnings.push(`No se pudo verificar la compilación: ${(e as Error).message}`); }
    github.watchLinked(created.id);
    return c.json({ project: await projectView(created), result, warnings });
  } catch (e) {
    if (created) {
      await github.unlink(created.id);
      await projects.deleteProject(created.id);
      await removeProjectData(created.id);
    }
    throw e;
  }
});

accountRoutes.get("/projects", async (c) => {
  const me = c.get("account").id;
  const own = await projects.listProjects(me);
  const shared = (await Promise.all((await orgs.sharedProjectIds(me)).map((id) => projects.getProject(id)))).filter((p): p is Project => !!p);
  const view = (p: Project, access: Access) => ({ ...p, access, appUrl: p.slug ? appUrl(p.slug) : null });
  return c.json({ projects: own.map((p) => view(p, "owner")), shared: shared.map((p) => view(p, "editor")) });
});

// Agent telemetry (Code Mode decision): how many input tokens go to re-sending tool results.
const metricsDays = (c: Context<Env>) => Math.min(Math.max(Number(c.req.query("days")) || 30, 1), 365);
const isReadOnlyTool = (tool: string) => TOOL_HINTS[tool]?.readOnlyHint === true;
accountRoutes.get("/agent-metrics", async (c) => {
  const own = await projects.listProjects(c.get("account").id);
  return c.json(await metricsReport(own.map((p) => p.id), metricsDays(c), isReadOnlyTool));
});

/** The dashboard's prompt box: the project is named from the idea, and the studio then sends the idea to the builder. */
accountRoutes.post("/projects", async (c) => {
  const { name, prompt, orgId, template: rawTemplate } = await c.req.json<{ name?: string; prompt?: string; orgId?: string; template?: unknown }>();
  const template = parseStarterTemplate(rawTemplate);
  if (orgId && !(await orgs.orgRoleOf(orgId, c.get("account").id))) return c.json({ error: "Organización no encontrada" }, 404);
  const title = (name ?? prompt ?? "").trim().split(/\s+/).slice(0, 5).join(" ").replace(/[.,;:]+$/, "") || "Proyecto nuevo";
  const p = await projects.createProject(c.get("account").id, title.slice(0, 60), (prompt ?? "").slice(0, 2000), undefined, orgId, template);
  return c.json({ project: await projectView(p) });
});

studioApi.route("/", accountRoutes);
const projectRoutes = new Hono<Env>();

projectRoutes.use("/projects/:id/*", async (c, next) => {
  const p = await projects.getProject(c.req.param("id")!);
  const access = await orgs.accessOf(c.get("account").id, p);
  if (!p || !access) return c.json({ error: "Proyecto no encontrado" }, 404);
  c.set("project", p);
  c.set("access", access);
  await next();
});
projectRoutes.use("/projects/:id", async (c, next) => {
  const p = await projects.getProject(c.req.param("id")!);
  const access = await orgs.accessOf(c.get("account").id, p);
  if (!p || !access) return c.json({ error: "Proyecto no encontrado" }, 404);
  c.set("project", p);
  c.set("access", access);
  await next();
});

/** Owner-only actions answer 403 to collaborators. */
const ownerOnly = (c: Context<Env>) => (c.get("access") === "owner" ? null : c.json({ error: "Solo la persona dueña del proyecto puede hacer esto." }, 403));

const pid = (c: Context<Env>) => c.get("project").id;

projectRoutes.get("/projects/:id/knowledge", async (c) => c.json(await knowledge.graph(pid(c))));
projectRoutes.post("/projects/:id/knowledge/rebuild", async (c) => c.json(await knowledge.graph(pid(c), true)));
projectRoutes.get("/projects/:id/knowledge/source", async (c) => {
  const path = c.req.query("path");
  if (!path) return c.json({ error: "Indica la ruta del archivo." }, 400);
  return c.json(await knowledge.source(pid(c), path));
});
projectRoutes.post("/projects/:id/knowledge/question", async (c) => {
  const body: unknown = await c.req.json();
  if (!body || typeof body !== "object" || !("query" in body) || typeof body.query !== "string" || !body.query.trim() || body.query.length > 1000) {
    return c.json({ error: "La pregunta debe tener entre 1 y 1000 caracteres." }, 400);
  }
  return c.json(await knowledge.question(pid(c), body.query));
});

const serviceControl = (c: Context<Env>) => createServiceControl({
  readFiles: (id) => projects.readAllFiles(id),
  writeManifest: (id, content) => projects.writeFile(id, SERVICES_MANIFEST, content, "owner", c.get("account").email),
  listQueue: async (id) => (await listJobs(id)).queue as unknown as ServiceQueueEntry[],
  runtime: readServiceRuntime,
  restart: restartServiceRuntime,
});
projectRoutes.get("/projects/:id/service-control", async (c) => c.json(await serviceControl(c).snapshot(pid(c))));
projectRoutes.patch("/projects/:id/service-control/:service", async (c) => {
  const patch: unknown = await c.req.json();
  return c.json(await withManifestLock(pid(c), () => serviceControl(c).scale(pid(c), c.req.param("service"), patch)));
});
projectRoutes.post("/projects/:id/service-control/:service/restart", async (c) => {
  const body: unknown = await c.req.json();
  if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).some((key) => key !== "env")) {
    return c.json({ error: "Solo env es válido para reiniciar" }, 400);
  }
  return c.json(await serviceControl(c).restart(pid(c), c.req.param("service"), (body as { env?: unknown }).env));
});

projectRoutes.get("/projects/:id", async (c) => {
  if (c.get("access") === "owner") await projects.markOpened(pid(c));
  return c.json({ project: { ...(await projectView(c.get("project"))), access: c.get("access") } });
});
projectRoutes.patch("/projects/:id", async (c) => {
  const patch = await c.req.json<import("../../modules/projects/index.js").ProjectPatch>();
  // Folders, favorites and archive are the owner's own organisation.
  if (c.get("access") !== "owner") for (const k of ["folderId", "favorite", "archived"] as const) delete patch[k];
  if (patch.folderId) {
    const mine = await projects.listFolders(c.get("account").id);
    if (!mine.some((f) => f.id === patch.folderId)) return c.json({ error: "Carpeta no encontrada" }, 404);
  }
  await projects.updateProject(pid(c), patch);
  return c.json({ project: await projectView((await projects.getProject(pid(c)))!) });
});
projectRoutes.delete("/projects/:id", async (c) => {
  const denied = ownerOnly(c);
  if (denied) return denied;
  await unpublishProject(pid(c));
  await projects.deleteProject(pid(c));
  await removeProjectData(pid(c));
  return c.json({ ok: true });
});
projectRoutes.post("/projects/:id/duplicate", async (c) => {
  const copy = await projects.duplicateProject(c.get("account").id, pid(c));
  return c.json({ project: await projectView(copy) });
});

/** "Get code": the project's source as a zip, without the builder's working notes. */
projectRoutes.get("/projects/:id/export-code", async (c) => {
  const files = Object.fromEntries(Object.entries(await projects.readAllFiles(pid(c))).filter(([p]) => !projects.isDevFile(p)));
  const slug = suggestSlug(c.get("project").name);
  return new Response(new Uint8Array(zip(Object.fromEntries(Object.entries(files).map(([p, v]) => [`${slug}/${p}`, v])))), {
    headers: { "content-type": "application/zip", "content-disposition": `attachment; filename="${slug}.zip"` },
  });
});

projectRoutes.get("/projects/:id/stats", async (c) => {
  const id = pid(c);
  const files = await projects.readAllFiles(id);
  const code = Object.entries(files).filter(([p]) => !projects.isDevFile(p) && /\.(tsx?|css)$/.test(p));
  const services = await projectServiceCounts(id);
  return c.json({
    files: code.length,
    linesOfCode: code.reduce((n, [, v]) => n + v.split("\n").length, 0),
    creditsUsed: services.creditsUsed,
  });
});

/** Which services this project already uses: the services nav lists those first and dims the rest. */
projectRoutes.get("/projects/:id/services", async (c) => {
  const id = pid(c);
  const files = Object.keys(await projects.readAllFiles(id));
  const tables = Object.keys(await describeSchema(id));
  const counts = await projectServiceCounts(id);
  const secrets = await listSecrets(id);
  return c.json({
    data: tables.length > 0,
    users: counts.users > 0,
    ai: counts.ai > 0,
    integrations: secrets.length > 0 || (await projectIntegrationIds(id)).length > 0,
    analytics: !!c.get("project").slug,
    docs: files.some(projects.isDevFile),
    jobs: files.some((f) => f.startsWith("jobs/")),
    storage: counts.storage > 0,
    email: counts.email > 0,
    payments: secrets.some((s) => s.name === "STRIPE_SECRET_KEY" && s.isSet),
  });
});

projectRoutes.get("/projects/:id/analytics", async (c) => c.json(await analyticsSummary(pid(c), Number(c.req.query("days") ?? 7))));

// Security: the quick scan (rules, also run on publish) and the deep review (an agent, spends credits).
projectRoutes.get("/projects/:id/security", async (c) => c.json(await getSecurity(pid(c))));
projectRoutes.post("/projects/:id/security/scan", async (c) => {
  await runQuickScan(pid(c));
  return c.json(await getSecurity(pid(c)));
});
projectRoutes.post("/projects/:id/security/deep", async (c) => {
  const started = builderClient
    ? (await builderClient.securityReview(c.get("account"), pid(c))).started
    : await startSecurityReview(c.get("account"), pid(c));
  return c.json({ started, ...(await getSecurity(pid(c))) }, started ? 202 : 409);
});
projectRoutes.post("/projects/:id/security/ignore", async (c) => {
  const { id, ignored } = await c.req.json<{ id?: string; ignored?: boolean }>();
  if (!id || !/^[0-9a-f]{12}$/.test(id)) return c.json({ error: "Hallazgo no válido" }, 400);
  await setIgnored(pid(c), id, ignored !== false);
  return c.json(await getSecurity(pid(c)));
});

// Memory: what the builder keeps between conversations. Project memories are shared by the
// project's editors; personal ones belong to whoever is signed in.
const memoryOf = (c: Context<Env>) => listMemories(pid(c), c.get("account").id);
projectRoutes.get("/projects/:id/memory", async (c) => c.json(await memoryOf(c)));
projectRoutes.post("/projects/:id/memory", async (c) => {
  const { text, kind, scope } = await c.req.json<{ text?: string; kind?: string; scope?: string }>();
  try {
    await addMemory(pid(c), c.get("account").id, { scope: scope === "personal" ? "personal" : "project", kind: kind ?? "", text: text ?? "", source: "owner" });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
  return c.json(await memoryOf(c));
});
projectRoutes.patch("/projects/:id/memory/:mid", async (c) => {
  const { text, kind } = await c.req.json<{ text?: string; kind?: string }>();
  try {
    if (!(await updateMemory(pid(c), c.get("account").id, c.req.param("mid"), { text, kind }))) return c.json({ error: "Memoria no encontrada" }, 404);
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
  return c.json(await memoryOf(c));
});
projectRoutes.delete("/projects/:id/memory/:mid", async (c) => {
  if (!(await deleteMemory(pid(c), c.get("account").id, c.req.param("mid")))) return c.json({ error: "Memoria no encontrada" }, 404);
  return c.json(await memoryOf(c));
});
projectRoutes.post("/projects/:id/memory/settings", async (c) => {
  const { project, personal } = await c.req.json<{ project?: boolean; personal?: boolean }>();
  await setMemoryEnabled(pid(c), c.get("account").id, { project, personal });
  return c.json(await memoryOf(c));
});

// Share links: Floot-style 7-day development links, and revoking every link at once.
projectRoutes.post("/projects/:id/share-link", async (c) => {
  const { days } = await c.req.json<{ days?: number }>().catch(() => ({ days: 7 }));
  const d = Math.min(Math.max(Number(days) || 7, 1), 30);
  return c.json({ url: previewUrl(c.get("project"), d), expiresAt: new Date(Date.now() + d * 86_400_000).toISOString() });
});
projectRoutes.post("/projects/:id/share-links/revoke", async (c) => {
  const denied = ownerOnly(c);
  if (denied) return denied;
  await projects.revokeShareLinks(pid(c));
  return c.json({ project: await projectView((await projects.getProject(pid(c)))!) });
});

// Models for this project: cost/quality mode, its own whitelist, how many agents run at once.
projectRoutes.get("/projects/:id/models", async (c) => {
  const projectModels = await models.management.projectModels(pid(c), c.get("project").ownerId);
  const effective = new Set(projectModels.effective.map((m) => m.id));
  return c.json({
    mode: projectModels.mode,
    concurrency: projectModels.concurrency,
    restricted: projectModels.restricted,
    models: projectModels.accountAllowed.map((m) => modelView(m, effective, true)),
  });
});
projectRoutes.put("/projects/:id/models", async (c) => {
  const denied = ownerOnly(c);
  if (denied) return denied;
  const { mode, concurrency, enabled } = await c.req.json<{ mode?: string; concurrency?: number; enabled?: string[] }>();
  try {
    await models.management.updateProjectModels(pid(c), { mode, concurrency, enabled });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
  return c.json({ ok: true });
});

/** Why the router picked what it picked, and what it has learnt for the models in play. */
projectRoutes.get("/projects/:id/router", async (c) =>
  c.json(await models.management.routerAudit(pid(c), c.get("project").ownerId)),
);

// GitHub: this project's repository (two-way sync).
const githubError = (c: Context<Env>, e: unknown) =>
  c.json({ error: (e as Error).message }, (e instanceof github.GithubError && [400, 401, 403, 404, 409, 422].includes(e.status) ? e.status : 502) as 400);
projectRoutes.get("/projects/:id/github", async (c) =>
  c.json({ account: await github.accountStatus(c.get("account").id), link: await github.getLink(pid(c)), canEdit: c.get("access") === "owner" }),
);
projectRoutes.post("/projects/:id/github", async (c) => {
  const denied = ownerOnly(c);
  if (denied) return denied;
  const body = await c.req.json<{ mode: "create" | "link"; name?: string; private?: boolean; repo?: string; branch?: string; installationId?: number | null }>();
  await rateLimit(`github-link:${c.get("account").id}`, 10, 60 * 60_000);
  try {
    const result =
      body.mode === "link"
        ? await github.linkRepo(pid(c), c.get("account").id, { repo: body.repo ?? "", branch: body.branch, installationId: body.installationId })
        : await github.createRepo(pid(c), c.get("account").id, { name: body.name || c.get("project").name, private: body.private, description: c.get("project").description });
    github.watchLinked(pid(c));
    return c.json({ link: await github.getLink(pid(c)), result });
  } catch (e) {
    return githubError(c, e);
  }
});
projectRoutes.post("/projects/:id/github/sync", async (c) => {
  await rateLimit(`github-sync:${pid(c)}`, 30, 10 * 60_000);
  try {
    const result = await github.syncProject(pid(c), { message: "Sincronización manual desde Forja" });
    return c.json({ link: await github.getLink(pid(c)), result });
  } catch (e) {
    return githubError(c, e);
  }
});
projectRoutes.delete("/projects/:id/github", async (c) => {
  const denied = ownerOnly(c);
  if (denied) return denied;
  await github.unlink(pid(c));
  return c.json({ ok: true });
});

// Collaborators
projectRoutes.get("/projects/:id/members", async (c) => {
  const owner = await accounts.getAccount(c.get("project").ownerId);
  return c.json({ owner: { email: owner?.email, name: owner?.name }, ...(await orgs.listMembers(pid(c))), access: c.get("access") });
});
projectRoutes.post("/projects/:id/members", async (c) => {
  const denied = ownerOnly(c);
  if (denied) return denied;
  const { email } = await c.req.json<{ email: string }>();
  await rateLimit(`invite:${c.get("account").id}`, 30, 60 * 60_000);
  return c.json(await orgs.inviteMember(c.get("project"), c.get("account").email, email ?? ""));
});
projectRoutes.delete("/projects/:id/members/:who", async (c) => {
  // The owner removes anyone; a collaborator can only leave.
  const who = decodeURIComponent(c.req.param("who"));
  const me = c.get("account");
  if (c.get("access") !== "owner" && who !== me.id && who !== me.email) return c.json({ error: "No puedes quitar a otras personas." }, 403);
  await orgs.removeMember(pid(c), who);
  return c.json({ ok: true });
});

// Integrations connected to this project
projectRoutes.get("/projects/:id/integrations", async (c) =>
  c.json({ all: await listIntegrations(c.get("account").id), connected: await projectIntegrationIds(pid(c)) }),
);
projectRoutes.post("/projects/:id/integrations/:iid", async (c) => {
  await connectIntegration(c.get("account").id, pid(c), c.req.param("iid"));
  return c.json({ ok: true });
});
projectRoutes.delete("/projects/:id/integrations/:iid", async (c) => {
  await disconnectIntegration(pid(c), c.req.param("iid"));
  return c.json({ ok: true });
});

// What is broken in the preview right now (build, browser, network, server).
projectRoutes.get("/projects/:id/problems", async (c) => {
  watchProblems(pid(c));
  if (c.req.query("recheck") !== "0") await recheckBuild(pid(c));
  return c.json({ problems: listProblems(pid(c)) });
});
projectRoutes.post("/projects/:id/problems/clear", (c) => {
  clearProblems(pid(c));
  return c.json({ ok: true });
});

/** Live feed for the studio: file changes, publishes, log lines and problems. */
projectRoutes.get("/projects/:id/events", (c) => {
  const id = pid(c);
  watchProblems(id);
  return sse((send) => {
    const on = (e: ProjectEvent) => send(e);
    projectEvents.on(id, on);
    const ping = setInterval(() => send({ type: "ping" }), 25_000);
    return () => {
      projectEvents.off(id, on);
      clearInterval(ping);
    };
  });
});

// Files
projectRoutes.get("/projects/:id/files", async (c) => c.json({ files: await projects.listFiles(pid(c)) }));
projectRoutes.get("/projects/:id/file", async (c) => {
  const content = await projects.readFile(pid(c), c.req.query("path") ?? "");
  return content === undefined ? c.json({ error: "No existe" }, 404) : c.json({ content });
});
projectRoutes.put("/projects/:id/file", async (c) => {
  const { path, content } = await c.req.json<{ path: string; content: string }>();
  await projects.writeFile(pid(c), path, content, "owner", c.get("account").email);
  return c.json({ ok: true });
});

/**
 * A text rewritten in place in the preview. Patched straight into the source when it appears
 * exactly once in a page or component (no builder, no credits); otherwise the studio asks the builder.
 */
projectRoutes.post("/projects/:id/text-edit", async (c) => {
  const { before, after } = await c.req.json<{ before: string; after: string }>();
  if (typeof before !== "string" || typeof after !== "string" || before.length > 2000 || after.length > 2000) return c.json({ error: "Texto no válido" }, 400);
  if (await building(pid(c))) return c.json({ ok: false, reason: "building" });
  const r = replaceVisibleText(await projects.readAllFiles(pid(c)), before, after);
  if (!r.ok) return c.json(r);
  // The point to restore for "Deshacer": the last change before this edit.
  const prev = (await projects.listChanges(pid(c), 1))[0];
  await projects.writeFile(pid(c), r.path, r.content, "owner", c.get("account").email);
  return c.json({ ok: true, path: r.path, undo: prev?.id ?? null });
});

projectRoutes.get("/projects/:id/agent-metrics", async (c) => c.json(await metricsReport([pid(c)], metricsDays(c), isReadOnlyTool)));

// Chat with the builder
projectRoutes.get("/projects/:id/chat", async (c) => {
  // Custom (env-declared) models are not in model_catalog: label them from the live catalog.
  const tasks = await listTasks(pid(c));
  const labels = new Map((await models.catalog.availableModels()).map((m) => [m.id, m.label]));
  for (const t of tasks) if (t.modelId && labels.has(t.modelId)) t.model = labels.get(t.modelId)!;
  const plan = await pendingPlan(pid(c));
  return c.json({ messages: await loadHistory(pid(c)), tasks, building: await building(pid(c)), pendingPlanTurn: plan?.turnId ?? null });
});
projectRoutes.get("/projects/:id/chat/stream", async (c) => {
  if (builderClient) {
    const response = await builderClient.stream(pid(c));
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers: response.headers });
  }
  const active = activeChatStreams.get(pid(c));
  return sse((send, close) => {
    if (!active) {
      send({ type: "idle" });
      close();
      return () => {};
    }
    for (const event of active.events) send(event);
    const subscriber = { send, close };
    active.subscribers.add(subscriber);
    return () => active.subscribers.delete(subscriber);
  });
});
projectRoutes.post("/projects/:id/chat", async (c) => {
  const { message, attachments, mode, implementPlan } = await c.req.json<{ message: string; attachments?: string[]; mode?: string; implementPlan?: boolean }>();
  const chatMode: ChatMode = mode === "chat" || mode === "plan" ? mode : "build";
  if (!message?.trim()) return c.json({ error: "Mensaje vacío" }, 400);
  if (message.length > 20_000) return c.json({ error: "Mensaje demasiado largo" }, 400);
  if (await building(pid(c))) return c.json({ error: "El constructor ya está trabajando" }, 409);
  const account = c.get("account");
  const id = pid(c);
  const files = (Array.isArray(attachments) ? attachments : []).filter((p) => typeof p === "string");
  if (builderClient) {
    const response = await builderClient.turn({ account, projectId: id, userText: message, attachments: files, mode: chatMode, implementPlan: !!implementPlan });
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers: response.headers });
  }
  if (activeChatStreams.has(id)) return c.json({ error: "El constructor ya está trabajando" }, 409);
  const active = { events: [] as AgentEvent[], subscribers: new Set<ChatStreamSubscriber>() };
  activeChatStreams.set(id, active);
  return sse((send, close) => {
    const subscriber = { send, close };
    active.subscribers.add(subscriber);
    void runBuilderTurn(account, id, message, (event: AgentEvent) => {
      active.events.push(event);
      for (const listener of active.subscribers) listener.send(event);
    }, files, chatMode, !!implementPlan).finally(() => {
      if (activeChatStreams.get(id) === active) activeChatStreams.delete(id);
      for (const listener of [...active.subscribers]) listener.close();
    });
    return () => active.subscribers.delete(subscriber);
  });
});

const MAX_ATTACHMENT = 5 * 1024 * 1024;
const TEXT_EXT = /\.(txt|md|csv|json|svg|html|css)$/i;

/** Decodes a data: URL from the studio, keeping text files readable for the builder. */
function fromDataUrl(dataUrl: string, filename: string): { content: string; size: number } {
  const m = /^data:([^;,]*)(;base64)?,(.*)$/s.exec(dataUrl ?? "");
  if (!m) throw new Error("Archivo no válido");
  const bytes = m[2] ? Buffer.from(m[3]!, "base64") : Buffer.from(decodeURIComponent(m[3]!), "utf8");
  if (bytes.byteLength > MAX_ATTACHMENT) throw new Error("El archivo supera 5 MB");
  return { content: TEXT_EXT.test(filename) ? bytes.toString("utf8") : `base64:${bytes.toString("base64")}`, size: bytes.byteLength };
}

const safeName = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-60) || "archivo";

/** Files the owner attaches in the chat land in static/uploads/, usable by the app and visible to the builder. */
projectRoutes.post("/projects/:id/attachments", async (c) => {
  const { filename, dataUrl } = await c.req.json<{ filename: string; dataUrl: string }>();
  const name = safeName(String(filename ?? "archivo"));
  const { content, size } = fromDataUrl(dataUrl, name);
  const path = `static/uploads/${Date.now().toString(36)}-${name}`;
  await projects.writeFile(pid(c), path, content, "owner", c.get("account").email);
  return c.json({ path, size });
});

/** App icon: used as favicon, home-screen icon and in the web app manifest. */
projectRoutes.post("/projects/:id/icon", async (c) => {
  const { filename, dataUrl } = await c.req.json<{ filename: string; dataUrl: string }>();
  const ext = (/\.(png|svg|jpg|jpeg|webp)$/i.exec(String(filename ?? ""))?.[1] ?? "").toLowerCase().replace("jpeg", "jpg");
  if (!ext) return c.json({ error: "Usa una imagen PNG, SVG, JPG o WebP" }, 400);
  const { content } = fromDataUrl(dataUrl, `icon.${ext}`);
  const files = await projects.listFiles(pid(c));
  for (const f of files) if (/^static\/icon\.(png|svg|jpg|webp)$/.test(f.path) && f.path !== `static/icon.${ext}`) await projects.deleteFile(pid(c), f.path, "owner");
  await projects.writeFile(pid(c), `static/icon.${ext}`, content, "owner", c.get("account").email);
  return c.json({ path: `static/icon.${ext}` });
});
projectRoutes.post("/projects/:id/chat/stop", async (c) => {
  await stopBuild(pid(c));
  return c.json({ ok: true });
});

// Data
projectRoutes.get("/projects/:id/db/schema", async (c) =>
  c.json({ tables: await describeSchema(pid(c), c.req.query("internal") === "1"), awake: await isAwake(pid(c)) }),
);
projectRoutes.get("/projects/:id/db/rows", async (c) => {
  const table = c.req.query("table") ?? "";
  const limit = Math.min(Number(c.req.query("limit") ?? 50), 500);
  const offset = Number(c.req.query("offset") ?? 0);
  const search = (c.req.query("search") ?? "").trim();
  try {
    return c.json(await listProjectRows(pid(c), { table, limit, offset, search }));
  } catch (error) {
    if (error instanceof ProjectDataError) return c.json({ error: error.message }, error.status as 400 | 404);
    throw error;
  }
});

projectRoutes.post("/projects/:id/db/rows", async (c) => {
  const { table, values } = await c.req.json<{ table: string; values: Record<string, unknown> }>();
  try {
    return c.json({ row: await createProjectRow(pid(c), table, values ?? {}) });
  } catch (e) {
    if (e instanceof ProjectDataError) return c.json({ error: e.message }, e.status as 400 | 404);
    return c.json({ error: (e as Error).message }, 400);
  }
});

projectRoutes.post("/projects/:id/db/rows/delete", async (c) => {
  const { table, keys } = await c.req.json<{ table: string; keys: unknown[] }>();
  try {
    return c.json({ deleted: await deleteProjectRows(pid(c), table, keys ?? []) });
  } catch (e) {
    if (e instanceof ProjectDataError) return c.json({ error: e.message }, e.status as 400 | 404);
    return c.json({ error: (e as Error).message }, 400);
  }
});
projectRoutes.post("/projects/:id/db/sql", async (c) => {
  const { sql } = await c.req.json<{ sql: string }>();
  try {
    return c.json({ results: await execSql(pid(c), sql) });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
});
projectRoutes.get("/projects/:id/db/export", async (c) => {
  const blob = await dumpDatabase(pid(c));
  return new Response(blob, {
    headers: {
      "content-type": "application/gzip",
      "content-disposition": `attachment; filename="${suggestSlug(c.get("project").name)}-db.tar.gz"`,
    },
  });
});
projectRoutes.get("/projects/:id/db/metrics", async (c) => c.json(await projectDbMetrics(pid(c))));

// App users
projectRoutes.get("/projects/:id/users", async (c) => c.json({ users: await listAppUsers(pid(c)) }));

// Storage
projectRoutes.get("/projects/:id/storage", async (c) =>
  c.json({ objects: await listObjects(pid(c)), bytes: await storageUsage(pid(c)), quotaBytes: MAX_PROJECT_STORAGE_BYTES, origin: previewOrigin(pid(c)) }),
);
projectRoutes.delete("/projects/:id/storage/:key{.+}", async (c) => {
  await deleteObject(pid(c), c.req.param("key"));
  return c.json({ ok: true });
});

// Email
projectRoutes.get("/projects/:id/emails", async (c) => c.json({ emails: await listEmails(pid(c)) }));
projectRoutes.post("/projects/:id/emails/test", async (c) => {
  const { to } = await c.req.json<{ to: string }>();
  return c.json({ results: await sendEmail(pid(c), { to, subject: "Correo de prueba", html: "<p>Funciona 🎉</p>" }) });
});
projectRoutes.post("/projects/:id/emails/inbound", async (c) => {
  await receiveEmail(pid(c), await c.req.json());
  return c.json({ ok: true });
});

// Jobs
projectRoutes.get("/projects/:id/jobs", async (c) => c.json(await listJobs(pid(c))));
projectRoutes.post("/projects/:id/jobs/:name/run", async (c) => {
  try {
    await runJob(pid(c), "preview", c.req.param("name"), null, "manual");
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
});
projectRoutes.post("/projects/:id/jobs/:name/enabled", async (c) => {
  const { enabled } = await c.req.json<{ enabled: boolean }>();
  await setJobEnabled(pid(c), c.req.param("name"), enabled);
  return c.json({ ok: true, note: "Se aplica a la app publicada en la próxima publicación." });
});
projectRoutes.delete("/projects/:id/timers/:timerId", async (c) => {
  await cancelTimer(pid(c), c.req.param("timerId"));
  return c.json({ ok: true });
});

// Secrets
projectRoutes.get("/projects/:id/secrets", async (c) => c.json({ secrets: await listSecrets(pid(c)) }));
projectRoutes.put("/projects/:id/secrets", async (c) => {
  const { name, value } = await c.req.json<{ name: string; value: string }>();
  try {
    await setSecret(pid(c), name, value);
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
});
projectRoutes.delete("/projects/:id/secrets/:name", async (c) => {
  await deleteSecret(pid(c), c.req.param("name"));
  return c.json({ ok: true });
});

// AI usage, realtime, logs
projectRoutes.get("/projects/:id/ai", async (c) => c.json({ usage: await aiUsage(pid(c)), enabled: c.get("project").aiEnabled }));
projectRoutes.get("/projects/:id/realtime", async (c) => c.json({ channels: realtimeStats(pid(c)) }));
projectRoutes.get("/projects/:id/logs", (c) => c.json({ logs: readLogs(pid(c), { limit: 300, level: c.req.query("level") }) }));

// Change timeline and named checkpoints
projectRoutes.get("/projects/:id/changes", async (c) => c.json({ changes: await projects.listChanges(pid(c)) }));
/** One chat turn's code changes, file by file, for the change card and its details view. */
projectRoutes.get("/projects/:id/turns/:turnId/changes", async (c) => {
  const r = await projects.turnChanges(pid(c), c.req.param("turnId"));
  return r ? c.json(r) : c.json({ error: "Turno no encontrado" }, 404);
});
projectRoutes.post("/projects/:id/checkpoints", async (c) => {
  const { label, description } = await c.req.json<{ label: string; description?: string }>();
  return c.json({ id: await projects.createCheckpoint(pid(c), label || "Checkpoint", "owner", description, c.get("account").email) });
});
projectRoutes.post("/projects/:id/changes/:cid/restore", async (c) => {
  await projects.restoreToChange(pid(c), Number(c.req.param("cid")), "owner", c.get("account").email);
  // Undoing the builder's work within minutes is a (soft) signal against the models that did it.
  void penalizeTurn(pid(c), null, 0.5).catch(() => {});
  return c.json({ ok: true });
});

// Publishing
projectRoutes.post("/projects/:id/publish", async (c) => {
  const { slug } = await c.req.json<{ slug?: string }>().catch(() => ({ slug: undefined }));
  try {
    return c.json(await publishProject(pid(c), slug));
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
});
projectRoutes.post("/projects/:id/unpublish", async (c) => {
  await unpublishProject(pid(c));
  await scheduleProject(pid(c));
  return c.json({ ok: true });
});

studioApi.route("/", projectRoutes);
return studioApi;
}
