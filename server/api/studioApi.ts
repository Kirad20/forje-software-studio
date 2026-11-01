import { Hono, type Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { aiUsage } from "../baas/ai.js";
import { listEmails, receiveEmail, sendEmail } from "../baas/email.js";
import { cancelTimer, listJobs, runJob, scheduleProject, setJobEnabled } from "../baas/jobs.js";
import { describeSchema, dumpDatabase, execSql, isAwake, projectDb } from "../baas/projectDb.js";
import { realtimeStats } from "../baas/realtime.js";
import { deleteSecret, listSecrets, setSecret } from "../baas/secrets.js";
import { deleteObject, listObjects, storageUsage } from "../baas/storage.js";
import { loadHistory, type AgentEvent } from "../builder/agent.js";
import { isBuilding, penalizeTurn, pendingPlan, runBuilderTurn, stopBuilding, type ChatMode } from "../builder/orchestrator.js";
import { replaceVisibleText } from "../builder/textEdit.js";
import * as accounts from "../platform/accounts.js";
import { completeSetup, needsSetup } from "../platform/bootstrap.js";
import * as orgs from "../platform/orgs.js";
import { projectEvents, readLogs, type ProjectEvent } from "../platform/events.js";
import { clearProblems, listProblems, recheckBuild, watchProblems } from "../platform/problems.js";
import { getSecurity, runQuickScan, setIgnored } from "../platform/security.js";
import { startSecurityReview } from "../builder/securityReview.js";
import { addMemory, deleteMemory, listMemories, setMemoryEnabled, updateMemory } from "../platform/memory.js";
import * as github from "../platform/github.js";
import * as projects from "../platform/projects.js";
import { adminApi } from "../admin/api.js";
import { evalsApi } from "../evals/api.js";
import { EVAL_EMAIL } from "../evals/runner.js";
import { removeProjectData } from "../runtime/projectData.js";
import { publishProject, suggestSlug, unpublishProject } from "../runtime/publish.js";
import { appUrl, previewOrigin, previewUrl, shareToken } from "../runtime/urls.js";
import path from "node:path";
import { config } from "../config.js";
import { analyticsSummary } from "../baas/analytics.js";
import { zip } from "../lib/zip.js";
import { one, q } from "../platform/db.js";
import {
  INTEGRATION_TYPES,
  connectIntegration,
  createIntegration,
  deleteIntegration,
  disconnectIntegration,
  listIntegrations,
  projectIntegrationIds,
  updateIntegrationValue,
} from "../platform/integrations.js";
import { usageSummary } from "../platform/usage.js";
import {
  allowedModels,
  availableModels,
  lastSync,
  platformAllows,
  providers,
  setAccountModels,
  setProjectModels,
  syncOpenRouter,
  type ModelInfo,
} from "../llm/catalog.js";
import { providerSecret } from "../llm/providers.js";
import { meanOf, posteriors } from "../llm/bandit.js";
import { metricsReport } from "../builder/metrics.js";
import { TOOL_HINTS } from "../mcp/server.js";
import { taskClassOf, type Role } from "../llm/router.js";
import { accessOf, inviteMember, listMembers, removeMember, sharedProjectIds, type Access } from "../platform/members.js";
import { clientIp, isHttps, rateLimit, RateLimitError, requestOrigin, studioOrigins } from "../lib/security.js";

const quoteIdent = (name: string) => `"${name.replace(/"/g, '""')}"`;

/** Single-column primary key of a table, if it has one. */
async function primaryKeyOf(projectId: string, table: string): Promise<string | null> {
  const rows = await projectDb(projectId).query<{ column_name: string }>(
    `select kcu.column_name from information_schema.table_constraints tc
     join information_schema.key_column_usage kcu on kcu.constraint_name = tc.constraint_name and kcu.table_schema = tc.table_schema
     where tc.table_schema = 'public' and tc.table_name = $1 and tc.constraint_type = 'PRIMARY KEY'`,
    [table],
  );
  return rows.length === 1 ? rows[0]!.column_name : null;
}

type Env = { Variables: { account: accounts.Account; project: projects.Project; access: Access; orgRole: orgs.OrgRole } };

export const SESSION_COOKIE = "forja_session";

export const studioApi = new Hono<Env>();

studioApi.onError((err, c) => {
  if (err instanceof RateLimitError) return c.json({ error: err.message }, 429, { "retry-after": String(err.retryAfterSec) });
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

export const ipOf = (c: Context) =>
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
studioApi.get("/auth/status", async (c) => c.json({ needsSetup: await needsSetup(), signup: config.signup }));

/** First run: the one-time token from the server log creates the first administrator. */
studioApi.post("/auth/setup", async (c) => {
  const body = await c.req.json<{ token: string; email: string; password: string; name?: string }>();
  rateLimit(`setup-ip:${ipOf(c)}`, 5, 15 * 60_000);
  startSession(c, await completeSetup(body));
  return c.json({ ok: true });
});

studioApi.post("/auth/login", async (c) => {
  const { email, password } = await c.req.json<{ email: string; password: string }>();
  if (!validEmail(email) || typeof password !== "string") return c.json({ error: "Correo o contraseña incorrectos" }, 401);
  rateLimit(`pw-ip:${ipOf(c)}`, 30, 15 * 60_000);
  rateLimit(`pw-email:${email.toLowerCase()}`, 10, 15 * 60_000);
  const token = await accounts.loginWithPassword(email, password);
  if (!token) return c.json({ error: "Correo o contraseña incorrectos" }, 401);
  startSession(c, token);
  return c.json({ ok: true });
});

studioApi.post("/auth/request", async (c) => {
  const { email } = await c.req.json<{ email: string }>();
  if (!validEmail(email)) return c.json({ error: "Correo no válido" }, 400);
  rateLimit(`login-ip:${ipOf(c)}`, 20, 15 * 60_000);
  rateLimit(`login-email:${email.toLowerCase()}`, 5, 15 * 60_000);
  // Same answer whether or not a code went out, so this cannot be used to probe who has an account.
  if (await accounts.canSignUp(email)) await accounts.requestLoginCode(email);
  return c.json({ ok: true, hint: "Si el correo puede entrar, recibirá un código. Sin SMTP configurado, el código está en la consola del servidor." });
});

studioApi.post("/auth/verify", async (c) => {
  const { email, code } = await c.req.json<{ email: string; code: string }>();
  rateLimit(`verify-ip:${ipOf(c)}`, 30, 15 * 60_000);
  const token = await accounts.verifyLoginCode(email, code);
  if (!token) return c.json({ error: "Código incorrecto o caducado" }, 401);
  startSession(c, token);
  return c.json({ ok: true });
});

studioApi.post("/auth/password/forgot", async (c) => {
  const { email } = await c.req.json<{ email: string }>();
  if (!validEmail(email)) return c.json({ error: "Correo no válido" }, 400);
  rateLimit(`reset-ip:${ipOf(c)}`, 10, 15 * 60_000);
  rateLimit(`reset-email:${email.toLowerCase()}`, 3, 15 * 60_000);
  await accounts.requestPasswordReset(email);
  return c.json({ ok: true, hint: "Si el correo tiene cuenta, recibirá un código. Sin SMTP configurado, está en la consola del servidor." });
});

studioApi.post("/auth/password/reset", async (c) => {
  const { email, code, password } = await c.req.json<{ email: string; code: string; password: string }>();
  rateLimit(`reset-verify-ip:${ipOf(c)}`, 20, 15 * 60_000);
  if (!(await accounts.resetPassword(email ?? "", code, password))) return c.json({ error: "Código incorrecto o caducado" }, 401);
  return c.json({ ok: true });
});

studioApi.post("/auth/logout", async (c) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) await accounts.endSession(token);
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  return c.json({ ok: true });
});

// GitHub push webhook: signed with GITHUB_WEBHOOK_SECRET, no session.
studioApi.post("/github/webhook", async (c) => {
  if (c.req.header("x-github-event") === "ping") return c.json({ ok: true });
  const raw = await c.req.text();
  const projects = await github.handleWebhook(raw, c.req.header("x-hub-signature-256"));
  return c.json({ ok: true, projects });
});

// Everything below needs a signed-in account.
studioApi.use("*", async (c, next) => {
  const account = await accounts.accountFromSession(getCookie(c, SESSION_COOKIE));
  if (!account) return c.json({ error: "No has iniciado sesión" }, 401);
  c.set("account", account);
  await next();
});

studioApi.get("/me", async (c) => {
  const id = c.get("account").id;
  return c.json({ account: { ...(await accounts.getAccount(id)), sessions: await accounts.countSessions(id) } });
});
studioApi.patch("/me", async (c) => {
  const { name } = await c.req.json<{ name: string }>();
  await accounts.updateAccountName(c.get("account").id, name ?? "");
  return c.json({ ok: true });
});
studioApi.get("/me/security", async (c) => {
  const r = await one<{ hasPassword: boolean; changedAt: string | null }>(
    `select password_hash is not null as "hasPassword", password_changed_at as "changedAt" from accounts where id = $1`,
    [c.get("account").id],
  );
  return c.json(r);
});
studioApi.put("/me/password", async (c) => {
  const account = c.get("account");
  const { current, password } = await c.req.json<{ current?: string; password: string }>();
  rateLimit(`pw-change:${account.id}`, 5, 15 * 60_000);
  await accounts.changePassword(account.id, current, password, account.email);
  // Every session ended with the old password; this one continues under a fresh token.
  startSession(c, await accounts.createSession(account.id));
  return c.json({ ok: true });
});
studioApi.post("/me/sign-out-others", async (c) =>
  c.json({ ended: await accounts.signOutOtherSessions(c.get("account").id, getCookie(c, SESSION_COOKIE)!) }),
);
studioApi.delete("/me", async (c) => {
  const account = c.get("account");
  const { confirmEmail } = await c.req.json<{ confirmEmail: string }>();
  if (confirmEmail?.trim().toLowerCase() !== account.email) return c.json({ error: "Escribe tu correo para confirmar." }, 400);
  for (const p of await projects.listProjects(account.id)) await unpublishProject(p.id);
  const ids = await accounts.deleteAccount(account.id);
  for (const id of ids) await removeProjectData(id);
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  return c.json({ ok: true });
});

studioApi.get("/usage", async (c) => c.json(await usageSummary(c.get("account").id)));

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

studioApi.get("/models", async (c) => {
  const me = c.get("account");
  const all = await availableModels();
  const allowed = new Set((await allowedModels({ accountId: me.id })).map((m) => m.id));
  const acc = await one<{ models_customized: boolean }>(`select models_customized from accounts where id = $1`, [me.id]);
  // The platform list can be long (OpenRouter has hundreds): only platform-allowed models are offered.
  const models = all.filter(platformAllows).map((m) => modelView(m, allowed, true));
  return c.json({
    models,
    customized: !!acc?.models_customized,
    providers: providers().map((p) => ({ id: p.id, kind: p.kind })),
    openrouter: { configured: !!providerSecret("openrouter"), lastSync: await lastSync(), total: all.filter((m) => m.provider === "openrouter").length },
  });
});
studioApi.put("/models/account", async (c) => {
  const { enabled } = await c.req.json<{ enabled: string[] | null }>();
  await setAccountModels(c.get("account").id, Array.isArray(enabled) ? enabled.map(String) : null);
  return c.json({ ok: true });
});
studioApi.post("/models/sync", async (c) => {
  if (!providerSecret("openrouter")) return c.json({ error: "Configura OpenRouter en Administración → Proveedores para sincronizar el catálogo." }, 400);
  rateLimit(`sync:${c.get("account").id}`, 3, 60 * 60_000);
  return c.json({ synced: await syncOpenRouter() });
});

// --- GitHub account: a token typed in the studio (never in chat), or OAuth when configured ----------
studioApi.get("/github", async (c) => c.json(await github.accountStatus(c.get("account").id)));
studioApi.post("/github/token", async (c) => {
  const { token } = await c.req.json<{ token: string }>();
  rateLimit(`github-token:${c.get("account").id}`, 10, 60 * 60_000);
  try {
    return c.json(await github.connectAccount(c.get("account").id, String(token ?? "")));
  } catch (e) {
    return c.json({ error: (e as github.GithubError).status === 401 ? "GitHub no aceptó ese token." : (e as Error).message }, 400);
  }
});
studioApi.delete("/github", async (c) => {
  await github.disconnectAccount(c.get("account").id);
  return c.json({ ok: true });
});
studioApi.get("/github/oauth/start", (c) => {
  if (!config.github.clientId) return c.json({ error: "OAuth de GitHub no configurado" }, 404);
  return c.redirect(github.oauthStart(c.get("account").id));
});
studioApi.get("/github/oauth/callback", async (c) => {
  try {
    await github.oauthFinish(c.get("account").id, c.req.query("code") ?? "", c.req.query("state") ?? "");
    return c.redirect("/account?github=ok");
  } catch (e) {
    return c.redirect(`/account?github=${encodeURIComponent((e as Error).message)}`);
  }
});

// Folders
studioApi.get("/folders", async (c) => c.json({ folders: await projects.listFolders(c.get("account").id) }));
studioApi.post("/folders", async (c) => {
  const { name } = await c.req.json<{ name: string }>();
  return c.json({ id: await projects.createFolder(c.get("account").id, name ?? "") });
});
studioApi.delete("/folders/:id", async (c) => {
  await projects.deleteFolder(c.get("account").id, c.req.param("id"));
  return c.json({ ok: true });
});

// Account-level integrations
studioApi.get("/integrations", async (c) => c.json({ integrations: await listIntegrations(c.get("account").id), types: INTEGRATION_TYPES }));
studioApi.post("/integrations", async (c) => c.json({ id: await createIntegration(c.get("account").id, await c.req.json()) }));
studioApi.put("/integrations/:id", async (c) => {
  const { value } = await c.req.json<{ value: string }>();
  await updateIntegrationValue(c.get("account").id, c.req.param("id"), value ?? "");
  return c.json({ ok: true });
});
studioApi.delete("/integrations/:id", async (c) => {
  await deleteIntegration(c.get("account").id, c.req.param("id"));
  return c.json({ ok: true });
});

studioApi.get("/tokens", async (c) => c.json({ tokens: await accounts.listApiTokens(c.get("account").id) }));
studioApi.post("/tokens", async (c) => {
  const { name, orgId } = await c.req.json<{ name?: string; orgId?: string | null }>();
  // A token may be limited to one organization: an agent wired to a client's workspace sees nothing else.
  if (orgId && !(await orgs.orgRoleOf(orgId, c.get("account").id))) return c.json({ error: "Organización no encontrada" }, 404);
  return c.json({ token: await accounts.createApiToken(c.get("account").id, name || "Cliente MCP", orgId || null) });
});
studioApi.delete("/tokens/:id", async (c) => {
  await accounts.deleteApiToken(c.get("account").id, c.req.param("id"));
  return c.json({ ok: true });
});

// --- Organizations (tenants) and platform administration ------------------------------

studioApi.get("/orgs", async (c) => c.json({ orgs: await orgs.listOrgs(c.get("account").id) }));
studioApi.post("/orgs", async (c) => {
  const { name } = await c.req.json<{ name: string }>();
  return c.json({ org: await orgs.createOrg(c.get("account").id, name ?? "") });
});

/** Resolves :id to the caller's role in that organization; non-members get a 404, as if it did not exist. */
studioApi.use("/orgs/:id/*", async (c, next) => {
  const role = await orgs.orgRoleOf(c.req.param("id"), c.get("account").id);
  if (!role) return c.json({ error: "Organización no encontrada" }, 404);
  c.set("orgRole", role);
  await next();
});
studioApi.get("/orgs/:id/members", async (c) => c.json({ members: await orgs.listOrgMembers(c.req.param("id")!), role: c.get("orgRole") }));
studioApi.post("/orgs/:id/members", async (c) => {
  const { email, role } = await c.req.json<{ email: string; role?: orgs.OrgRole }>();
  await orgs.addOrgMember(c.req.param("id")!, c.get("orgRole"), email ?? "", role ?? "member");
  return c.json({ ok: true });
});
studioApi.patch("/orgs/:id/members/:accountId", async (c) => {
  const { role } = await c.req.json<{ role: orgs.OrgRole }>();
  await orgs.setOrgMemberRole(c.req.param("id")!, c.get("orgRole"), c.req.param("accountId")!, role);
  return c.json({ ok: true });
});
studioApi.delete("/orgs/:id/members/:accountId", async (c) => {
  await orgs.removeOrgMember(c.req.param("id")!, c.get("orgRole"), c.get("account").id, c.req.param("accountId")!);
  return c.json({ ok: true });
});

/** Platform administrators manage accounts; they get no access to other tenants' projects through this. */
studioApi.use("/admin/*", async (c, next) => {
  if (c.get("account").platformRole !== "admin") return c.json({ error: "Solo administradores de la plataforma." }, 403);
  await next();
});
studioApi.get("/admin/users", async (c) =>
  c.json({
    users: await q(
      `select id, email, name, platform_role as "platformRole", disabled, credits, created_at as "createdAt" from accounts where email <> $1 order by created_at`,
      [EVAL_EMAIL],
    ),
  }),
);
studioApi.patch("/admin/users/:id", async (c) => {
  const id = c.req.param("id")!;
  const { disabled, platformRole } = await c.req.json<{ disabled?: boolean; platformRole?: "admin" | "user" }>();
  const me = c.get("account").id;
  if (!(await accounts.getAccount(id))) return c.json({ error: "Cuenta no encontrada" }, 404);
  if (id === me && (disabled || platformRole === "user")) return c.json({ error: "No puedes quitarte el acceso ni el rol a ti misma." }, 400);
  if (platformRole && platformRole !== "admin" && platformRole !== "user") return c.json({ error: "Rol no válido" }, 400);
  if (platformRole) await q(`update accounts set platform_role = $2 where id = $1`, [id, platformRole]);
  if (disabled !== undefined) {
    await q(`update accounts set disabled = $2 where id = $1`, [id, !!disabled]);
    if (disabled) await q(`delete from account_sessions where account_id = $1`, [id]);
  }
  return c.json({ ok: true });
});

// Quality evals (admin only, and only with the evals.enabled setting on): see server/evals.
studioApi.route("/admin/evals", evalsApi);
// Settings, providers, models, agent playground and router (see server/admin).
studioApi.route("/admin", adminApi);

// --- Projects -------------------------------------------------------------------------

const projectView = async (p: projects.Project) => ({
  ...p,
  previewUrl: previewUrl(p),
  previewOrigin: previewOrigin(p.id),
  // A private app's link carries the share token, like the preview's.
  appUrl: p.slug ? (p.visibility === "private" ? `${appUrl(p.slug)}/?share=${shareToken(p, 365)}` : appUrl(p.slug)) : null,
  suggestedSlug: p.slug ?? suggestSlug(p.name),
  building: isBuilding(p.id),
  hasUnpublishedChanges: p.slug ? await projects.hasUnpublishedChanges(p.id) : false,
});

studioApi.get("/projects", async (c) => {
  const me = c.get("account").id;
  const own = await projects.listProjects(me);
  const shared = (await Promise.all((await sharedProjectIds(me)).map((id) => projects.getProject(id)))).filter((p): p is projects.Project => !!p);
  const view = (p: projects.Project, access: Access) => ({ ...p, access, appUrl: p.slug ? appUrl(p.slug) : null });
  return c.json({ projects: own.map((p) => view(p, "owner")), shared: shared.map((p) => view(p, "editor")) });
});

// Agent telemetry (Code Mode decision): how many input tokens go to re-sending tool results.
const metricsDays = (c: Context<Env>) => Math.min(Math.max(Number(c.req.query("days")) || 30, 1), 365);
const isReadOnlyTool = (tool: string) => TOOL_HINTS[tool]?.readOnlyHint === true;
studioApi.get("/agent-metrics", async (c) => {
  const own = await projects.listProjects(c.get("account").id);
  return c.json(await metricsReport(own.map((p) => p.id), metricsDays(c), isReadOnlyTool));
});

/** The dashboard's prompt box: the project is named from the idea, and the studio then sends the idea to the builder. */
studioApi.post("/projects", async (c) => {
  const { name, prompt, orgId } = await c.req.json<{ name?: string; prompt?: string; orgId?: string }>();
  if (orgId && !(await orgs.orgRoleOf(orgId, c.get("account").id))) return c.json({ error: "Organización no encontrada" }, 404);
  const title = (name ?? prompt ?? "").trim().split(/\s+/).slice(0, 5).join(" ").replace(/[.,;:]+$/, "") || "Proyecto nuevo";
  const p = await projects.createProject(c.get("account").id, title.slice(0, 60), (prompt ?? "").slice(0, 2000), undefined, orgId);
  return c.json({ project: await projectView(p) });
});

studioApi.use("/projects/:id/*", async (c, next) => {
  const p = await projects.getProject(c.req.param("id")!);
  const access = await accessOf(c.get("account").id, p);
  if (!p || !access) return c.json({ error: "Proyecto no encontrado" }, 404);
  c.set("project", p);
  c.set("access", access);
  await next();
});
studioApi.use("/projects/:id", async (c, next) => {
  const p = await projects.getProject(c.req.param("id")!);
  const access = await accessOf(c.get("account").id, p);
  if (!p || !access) return c.json({ error: "Proyecto no encontrado" }, 404);
  c.set("project", p);
  c.set("access", access);
  await next();
});

/** Owner-only actions answer 403 to collaborators. */
const ownerOnly = (c: Context<Env>) => (c.get("access") === "owner" ? null : c.json({ error: "Solo la persona dueña del proyecto puede hacer esto." }, 403));

const pid = (c: Context<Env>) => c.get("project").id;

studioApi.get("/projects/:id", async (c) => {
  if (c.get("access") === "owner") await projects.markOpened(pid(c));
  return c.json({ project: { ...(await projectView(c.get("project"))), access: c.get("access") } });
});
studioApi.patch("/projects/:id", async (c) => {
  const patch = await c.req.json<projects.ProjectPatch>();
  // Folders, favorites and archive are the owner's own organisation.
  if (c.get("access") !== "owner") for (const k of ["folderId", "favorite", "archived"] as const) delete patch[k];
  if (patch.folderId) {
    const mine = await projects.listFolders(c.get("account").id);
    if (!mine.some((f) => f.id === patch.folderId)) return c.json({ error: "Carpeta no encontrada" }, 404);
  }
  await projects.updateProject(pid(c), patch);
  return c.json({ project: await projectView((await projects.getProject(pid(c)))!) });
});
studioApi.delete("/projects/:id", async (c) => {
  const denied = ownerOnly(c);
  if (denied) return denied;
  await unpublishProject(pid(c));
  await projects.deleteProject(pid(c));
  await removeProjectData(pid(c));
  return c.json({ ok: true });
});
studioApi.post("/projects/:id/duplicate", async (c) => {
  const copy = await projects.duplicateProject(c.get("account").id, pid(c));
  return c.json({ project: await projectView(copy) });
});

/** "Get code": the project's source as a zip, without the builder's working notes. */
studioApi.get("/projects/:id/export-code", async (c) => {
  const files = Object.fromEntries(Object.entries(await projects.readAllFiles(pid(c))).filter(([p]) => !projects.isDevFile(p)));
  const slug = suggestSlug(c.get("project").name);
  return new Response(new Uint8Array(zip(Object.fromEntries(Object.entries(files).map(([p, v]) => [`${slug}/${p}`, v])))), {
    headers: { "content-type": "application/zip", "content-disposition": `attachment; filename="${slug}.zip"` },
  });
});

studioApi.get("/projects/:id/stats", async (c) => {
  const files = await projects.readAllFiles(pid(c));
  const code = Object.entries(files).filter(([p]) => !projects.isDevFile(p) && /\.(tsx?|css)$/.test(p));
  const credits = await one<{ n: number }>(`select coalesce(sum(credits), 0)::int as n from ai_usage where project_id = $1`, [pid(c)]);
  return c.json({
    files: code.length,
    linesOfCode: code.reduce((n, [, v]) => n + v.split("\n").length, 0),
    creditsUsed: credits?.n ?? 0,
  });
});

/** Which services this project already uses: the services nav lists those first and dims the rest. */
studioApi.get("/projects/:id/services", async (c) => {
  const id = pid(c);
  const files = Object.keys(await projects.readAllFiles(id));
  const tables = Object.keys(await describeSchema(id));
  const count = async (sql: string) => (await one<{ n: number }>(sql, [id]))?.n ?? 0;
  const secrets = await listSecrets(id);
  const users = await projectDb(id).one<{ n: number }>(`select count(*)::int as n from _forja_users`);
  return c.json({
    data: tables.length > 0,
    users: (users?.n ?? 0) > 0,
    ai: (await count(`select count(*)::int as n from ai_usage where project_id = $1`)) > 0,
    integrations: secrets.length > 0 || (await projectIntegrationIds(id)).length > 0,
    analytics: !!c.get("project").slug,
    docs: files.some(projects.isDevFile),
    jobs: files.some((f) => f.startsWith("jobs/")),
    storage: (await count(`select count(*)::int as n from storage_objects where project_id = $1`)) > 0,
    email: (await count(`select count(*)::int as n from emails where project_id = $1`)) > 0,
    payments: secrets.some((s) => s.name === "STRIPE_SECRET_KEY" && s.isSet),
  });
});

studioApi.get("/projects/:id/analytics", async (c) => c.json(await analyticsSummary(pid(c), Number(c.req.query("days") ?? 7))));

// Security: the quick scan (rules, also run on publish) and the deep review (an agent, spends credits).
studioApi.get("/projects/:id/security", async (c) => c.json(await getSecurity(pid(c))));
studioApi.post("/projects/:id/security/scan", async (c) => {
  await runQuickScan(pid(c));
  return c.json(await getSecurity(pid(c)));
});
studioApi.post("/projects/:id/security/deep", async (c) => {
  const started = await startSecurityReview(c.get("account"), pid(c));
  return c.json({ started, ...(await getSecurity(pid(c))) }, started ? 202 : 409);
});
studioApi.post("/projects/:id/security/ignore", async (c) => {
  const { id, ignored } = await c.req.json<{ id?: string; ignored?: boolean }>();
  if (!id || !/^[0-9a-f]{12}$/.test(id)) return c.json({ error: "Hallazgo no válido" }, 400);
  await setIgnored(pid(c), id, ignored !== false);
  return c.json(await getSecurity(pid(c)));
});

// Memory: what the builder keeps between conversations. Project memories are shared by the
// project's editors; personal ones belong to whoever is signed in.
const memoryOf = (c: Context<Env>) => listMemories(pid(c), c.get("account").id);
studioApi.get("/projects/:id/memory", async (c) => c.json(await memoryOf(c)));
studioApi.post("/projects/:id/memory", async (c) => {
  const { text, kind, scope } = await c.req.json<{ text?: string; kind?: string; scope?: string }>();
  try {
    await addMemory(pid(c), c.get("account").id, { scope: scope === "personal" ? "personal" : "project", kind: kind ?? "", text: text ?? "", source: "owner" });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
  return c.json(await memoryOf(c));
});
studioApi.patch("/projects/:id/memory/:mid", async (c) => {
  const { text, kind } = await c.req.json<{ text?: string; kind?: string }>();
  try {
    if (!(await updateMemory(pid(c), c.get("account").id, c.req.param("mid"), { text, kind }))) return c.json({ error: "Memoria no encontrada" }, 404);
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
  return c.json(await memoryOf(c));
});
studioApi.delete("/projects/:id/memory/:mid", async (c) => {
  if (!(await deleteMemory(pid(c), c.get("account").id, c.req.param("mid")))) return c.json({ error: "Memoria no encontrada" }, 404);
  return c.json(await memoryOf(c));
});
studioApi.post("/projects/:id/memory/settings", async (c) => {
  const { project, personal } = await c.req.json<{ project?: boolean; personal?: boolean }>();
  await setMemoryEnabled(pid(c), c.get("account").id, { project, personal });
  return c.json(await memoryOf(c));
});

// Share links: Floot-style 7-day development links, and revoking every link at once.
studioApi.post("/projects/:id/share-link", async (c) => {
  const { days } = await c.req.json<{ days?: number }>().catch(() => ({ days: 7 }));
  const d = Math.min(Math.max(Number(days) || 7, 1), 30);
  return c.json({ url: previewUrl(c.get("project"), d), expiresAt: new Date(Date.now() + d * 86_400_000).toISOString() });
});
studioApi.post("/projects/:id/share-links/revoke", async (c) => {
  const denied = ownerOnly(c);
  if (denied) return denied;
  await projects.revokeShareLinks(pid(c));
  return c.json({ project: await projectView((await projects.getProject(pid(c)))!) });
});

// Models for this project: cost/quality mode, its own whitelist, how many agents run at once.
studioApi.get("/projects/:id/models", async (c) => {
  const p = await one<{ model_mode: string; agent_concurrency: number }>(`select model_mode, agent_concurrency from projects where id = $1`, [pid(c)]);
  const owner = c.get("project").ownerId;
  const accountAllowed = await allowedModels({ accountId: owner });
  const projectList = (await q<{ model_id: string }>(`select model_id from project_models where project_id = $1`, [pid(c)])).map((r) => r.model_id);
  const effective = new Set((await allowedModels({ accountId: owner, projectId: pid(c) })).map((m) => m.id));
  return c.json({
    mode: p?.model_mode ?? "balanced",
    concurrency: p?.agent_concurrency ?? 3,
    restricted: projectList.length > 0,
    models: accountAllowed.map((m) => modelView(m, effective, true)),
  });
});
studioApi.put("/projects/:id/models", async (c) => {
  const denied = ownerOnly(c);
  if (denied) return denied;
  const { mode, concurrency, enabled } = await c.req.json<{ mode?: string; concurrency?: number; enabled?: string[] }>();
  if (mode && !["saving", "balanced", "quality"].includes(mode)) return c.json({ error: "Modo no válido" }, 400);
  await q(`update projects set model_mode = coalesce($2, model_mode), agent_concurrency = coalesce($3, agent_concurrency) where id = $1`, [
    pid(c),
    mode ?? null,
    concurrency ? Math.min(5, Math.max(1, Math.round(concurrency))) : null,
  ]);
  if (Array.isArray(enabled)) await setProjectModels(pid(c), enabled.map(String));
  return c.json({ ok: true });
});

/** Why the router picked what it picked, and what it has learnt for the models in play. */
studioApi.get("/projects/:id/router", async (c) => {
  const decisions = await q(
    `select role, task_class as "taskClass", model_id as "modelId", reason, candidates, created_at as "createdAt"
     from router_decisions where project_id = $1 order by id desc limit 40`,
    [pid(c)],
  );
  const models = await allowedModels({ accountId: c.get("project").ownerId, projectId: pid(c) });
  const roles: Role[] = ["planner", "data", "backend", "ui", "qa", "fast"];
  const learnt = [];
  for (const role of roles) {
    const taskClass = taskClassOf(role, { complexity: 3, domains: [role === "ui" ? "ui" : "data"], needsVision: false });
    const post = await posteriors(taskClass, models);
    learnt.push({ role, taskClass, models: models.map((m) => ({ id: m.id, label: m.label, mean: meanOf(post.get(m.id)!), uses: post.get(m.id)!.uses })).sort((a, b) => b.mean - a.mean).slice(0, 5) });
  }
  const spend = await q(
    `select model, role, count(*)::int as calls, sum(input_tokens + cache_write_tokens)::int as "inputTokens", sum(cache_read_tokens)::int as "cachedTokens",
       sum(output_tokens)::int as "outputTokens", round(sum(usd)::numeric, 4)::float as usd
     from ai_usage where project_id = $1 and source = 'builder' group by model, role order by sum(usd) desc`,
    [pid(c)],
  );
  return c.json({ decisions, learnt, spend });
});

// GitHub: this project's repository (two-way sync).
const githubError = (c: Context<Env>, e: unknown) =>
  c.json({ error: (e as Error).message }, (e instanceof github.GithubError && [400, 401, 403, 404, 409, 422].includes(e.status) ? e.status : 502) as 400);
studioApi.get("/projects/:id/github", async (c) =>
  c.json({ account: await github.accountStatus(c.get("account").id), link: await github.getLink(pid(c)), canEdit: c.get("access") === "owner" }),
);
studioApi.post("/projects/:id/github", async (c) => {
  const denied = ownerOnly(c);
  if (denied) return denied;
  const body = await c.req.json<{ mode: "create" | "link"; name?: string; private?: boolean; repo?: string; branch?: string }>();
  rateLimit(`github-link:${c.get("account").id}`, 10, 60 * 60_000);
  try {
    const result =
      body.mode === "link"
        ? await github.linkRepo(pid(c), c.get("account").id, { repo: body.repo ?? "", branch: body.branch })
        : await github.createRepo(pid(c), c.get("account").id, { name: body.name || c.get("project").name, private: body.private, description: c.get("project").description });
    github.watchLinked(pid(c));
    return c.json({ link: await github.getLink(pid(c)), result });
  } catch (e) {
    return githubError(c, e);
  }
});
studioApi.post("/projects/:id/github/sync", async (c) => {
  rateLimit(`github-sync:${pid(c)}`, 30, 10 * 60_000);
  try {
    const result = await github.syncProject(pid(c), { message: "Sincronización manual desde Forja" });
    return c.json({ link: await github.getLink(pid(c)), result });
  } catch (e) {
    return githubError(c, e);
  }
});
studioApi.delete("/projects/:id/github", async (c) => {
  const denied = ownerOnly(c);
  if (denied) return denied;
  await github.unlink(pid(c));
  return c.json({ ok: true });
});

// Collaborators
studioApi.get("/projects/:id/members", async (c) => {
  const owner = await accounts.getAccount(c.get("project").ownerId);
  return c.json({ owner: { email: owner?.email, name: owner?.name }, ...(await listMembers(pid(c))), access: c.get("access") });
});
studioApi.post("/projects/:id/members", async (c) => {
  const denied = ownerOnly(c);
  if (denied) return denied;
  const { email } = await c.req.json<{ email: string }>();
  rateLimit(`invite:${c.get("account").id}`, 30, 60 * 60_000);
  return c.json(await inviteMember(c.get("project"), c.get("account").email, email ?? ""));
});
studioApi.delete("/projects/:id/members/:who", async (c) => {
  // The owner removes anyone; a collaborator can only leave.
  const who = decodeURIComponent(c.req.param("who"));
  const me = c.get("account");
  if (c.get("access") !== "owner" && who !== me.id && who !== me.email) return c.json({ error: "No puedes quitar a otras personas." }, 403);
  await removeMember(pid(c), who);
  return c.json({ ok: true });
});

// Integrations connected to this project
studioApi.get("/projects/:id/integrations", async (c) =>
  c.json({ all: await listIntegrations(c.get("account").id), connected: await projectIntegrationIds(pid(c)) }),
);
studioApi.post("/projects/:id/integrations/:iid", async (c) => {
  await connectIntegration(c.get("account").id, pid(c), c.req.param("iid"));
  return c.json({ ok: true });
});
studioApi.delete("/projects/:id/integrations/:iid", async (c) => {
  await disconnectIntegration(pid(c), c.req.param("iid"));
  return c.json({ ok: true });
});

// What is broken in the preview right now (build, browser, network, server).
studioApi.get("/projects/:id/problems", async (c) => {
  watchProblems(pid(c));
  if (c.req.query("recheck") !== "0") await recheckBuild(pid(c));
  return c.json({ problems: listProblems(pid(c)) });
});
studioApi.post("/projects/:id/problems/clear", (c) => {
  clearProblems(pid(c));
  return c.json({ ok: true });
});

/** Live feed for the studio: file changes, publishes, log lines and problems. */
studioApi.get("/projects/:id/events", (c) => {
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
studioApi.get("/projects/:id/files", async (c) => c.json({ files: await projects.listFiles(pid(c)) }));
studioApi.get("/projects/:id/file", async (c) => {
  const content = await projects.readFile(pid(c), c.req.query("path") ?? "");
  return content === undefined ? c.json({ error: "No existe" }, 404) : c.json({ content });
});
studioApi.put("/projects/:id/file", async (c) => {
  const { path, content } = await c.req.json<{ path: string; content: string }>();
  await projects.writeFile(pid(c), path, content, "owner", c.get("account").email);
  return c.json({ ok: true });
});

/**
 * A text rewritten in place in the preview. Patched straight into the source when it appears
 * exactly once in a page or component (no builder, no credits); otherwise the studio asks the builder.
 */
studioApi.post("/projects/:id/text-edit", async (c) => {
  const { before, after } = await c.req.json<{ before: string; after: string }>();
  if (typeof before !== "string" || typeof after !== "string" || before.length > 2000 || after.length > 2000) return c.json({ error: "Texto no válido" }, 400);
  if (isBuilding(pid(c))) return c.json({ ok: false, reason: "building" });
  const r = replaceVisibleText(await projects.readAllFiles(pid(c)), before, after);
  if (!r.ok) return c.json(r);
  // The point to restore for "Deshacer": the last change before this edit.
  const prev = await one<{ id: number | null }>(`select max(id) as id from project_changes where project_id = $1`, [pid(c)]);
  await projects.writeFile(pid(c), r.path, r.content, "owner", c.get("account").email);
  return c.json({ ok: true, path: r.path, undo: prev?.id ?? null });
});

studioApi.get("/projects/:id/agent-metrics", async (c) => c.json(await metricsReport([pid(c)], metricsDays(c), isReadOnlyTool)));

// Chat with the builder
studioApi.get("/projects/:id/chat", async (c) => {
  // Agent lanes per turn: which role ran on which model, with steps, tokens and cost.
  const tasks = await q(
    `select t.id, t.turn_id as "turnId", t.role, t.goal, t.model_id as "modelId", coalesce(m.label, t.model_id) as "model", t.status, t.summary,
       t.steps, t.files, t.depends_on as "dependsOn", t.input_tokens as "inputTokens", t.output_tokens as "outputTokens",
       t.cache_read_tokens as "cacheReadTokens", t.usd, t.started_at as "startedAt", t.finished_at as "finishedAt"
     from agent_tasks t left join model_catalog m on m.id = t.model_id
     where t.project_id = $1 order by t.created_at desc limit 300`,
    [pid(c)],
  );
  // Custom (env-declared) models are not in model_catalog: label them from the live catalog.
  const labels = new Map((await availableModels()).map((m) => [m.id, m.label]));
  for (const t of tasks as { modelId: string | null; model: string | null }[]) if (t.modelId && labels.has(t.modelId)) t.model = labels.get(t.modelId)!;
  const plan = await pendingPlan(pid(c));
  return c.json({ messages: await loadHistory(pid(c)), tasks, building: isBuilding(pid(c)), pendingPlanTurn: plan?.turnId ?? null });
});
studioApi.post("/projects/:id/chat", async (c) => {
  const { message, attachments, mode, implementPlan } = await c.req.json<{ message: string; attachments?: string[]; mode?: string; implementPlan?: boolean }>();
  const chatMode: ChatMode = mode === "chat" || mode === "plan" ? mode : "build";
  if (!message?.trim()) return c.json({ error: "Mensaje vacío" }, 400);
  if (message.length > 20_000) return c.json({ error: "Mensaje demasiado largo" }, 400);
  if (isBuilding(pid(c))) return c.json({ error: "El constructor ya está trabajando" }, 409);
  const account = c.get("account");
  const id = pid(c);
  const files = (Array.isArray(attachments) ? attachments : []).filter((p) => typeof p === "string");
  return sse((send, close) => {
    void runBuilderTurn(account, id, message, (e: AgentEvent) => send(e), files, chatMode, !!implementPlan).finally(close);
    return () => {};
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
studioApi.post("/projects/:id/attachments", async (c) => {
  const { filename, dataUrl } = await c.req.json<{ filename: string; dataUrl: string }>();
  const name = safeName(String(filename ?? "archivo"));
  const { content, size } = fromDataUrl(dataUrl, name);
  const path = `static/uploads/${Date.now().toString(36)}-${name}`;
  await projects.writeFile(pid(c), path, content, "owner", c.get("account").email);
  return c.json({ path, size });
});

/** App icon: used as favicon, home-screen icon and in the web app manifest. */
studioApi.post("/projects/:id/icon", async (c) => {
  const { filename, dataUrl } = await c.req.json<{ filename: string; dataUrl: string }>();
  const ext = (/\.(png|svg|jpg|jpeg|webp)$/i.exec(String(filename ?? ""))?.[1] ?? "").toLowerCase().replace("jpeg", "jpg");
  if (!ext) return c.json({ error: "Usa una imagen PNG, SVG, JPG o WebP" }, 400);
  const { content } = fromDataUrl(dataUrl, `icon.${ext}`);
  const files = await projects.listFiles(pid(c));
  for (const f of files) if (/^static\/icon\.(png|svg|jpg|webp)$/.test(f.path) && f.path !== `static/icon.${ext}`) await projects.deleteFile(pid(c), f.path, "owner");
  await projects.writeFile(pid(c), `static/icon.${ext}`, content, "owner", c.get("account").email);
  return c.json({ path: `static/icon.${ext}` });
});
studioApi.post("/projects/:id/chat/stop", (c) => {
  stopBuilding(pid(c));
  return c.json({ ok: true });
});

// Data
studioApi.get("/projects/:id/db/schema", async (c) =>
  c.json({ tables: await describeSchema(pid(c), c.req.query("internal") === "1"), awake: isAwake(pid(c)) }),
);
studioApi.get("/projects/:id/db/rows", async (c) => {
  const table = c.req.query("table") ?? "";
  const schema = await describeSchema(pid(c), true);
  if (!schema[table]) return c.json({ error: "Tabla no encontrada" }, 404);
  const limit = Math.min(Number(c.req.query("limit") ?? 50), 500);
  const offset = Number(c.req.query("offset") ?? 0);
  const search = (c.req.query("search") ?? "").trim();
  const db = projectDb(pid(c));
  const ident = quoteIdent(table);
  // Search matches any column's text form; column names come from the catalog, not the request.
  const where = search ? `where ${schema[table]!.map((col) => `${quoteIdent(col.name)}::text ilike $3`).join(" or ")}` : "";
  const params = search ? [limit, offset, `%${search}%`] : [limit, offset];
  const primaryKey = await primaryKeyOf(pid(c), table);
  const order = primaryKey ? `order by ${quoteIdent(primaryKey)}` : "";
  const rows = await db.query(`select * from ${ident} ${where} ${order} limit $1 offset $2`, params);
  const total = (await db.one<{ n: number }>(`select count(*)::int as n from ${ident} ${search ? where.replace(/\$3/g, "$1") : ""}`, search ? [`%${search}%`] : []))!.n;
  // Never show password hashes in the studio.
  const safe = table === "_forja_users" ? rows.map(({ password_hash, ...r }) => ({ ...r, password_hash: password_hash ? "••••" : null })) : rows;
  return c.json({ columns: schema[table], rows: safe, total, primaryKey });
});

studioApi.post("/projects/:id/db/rows", async (c) => {
  const { table, values } = await c.req.json<{ table: string; values: Record<string, unknown> }>();
  const schema = await describeSchema(pid(c), true);
  const cols = schema[table];
  if (!cols) return c.json({ error: "Tabla no encontrada" }, 404);
  // Empty fields are left out so column defaults (ids, timestamps) apply.
  const entries = Object.entries(values ?? {}).filter(([k, v]) => cols.some((col) => col.name === k) && v !== "" && v !== undefined);
  const sql = entries.length
    ? `insert into ${quoteIdent(table)} (${entries.map(([k]) => quoteIdent(k)).join(", ")}) values (${entries.map((_, i) => `$${i + 1}`).join(", ")}) returning *`
    : `insert into ${quoteIdent(table)} default values returning *`;
  try {
    return c.json({ row: await projectDb(pid(c)).one(sql, entries.map(([, v]) => v)) });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
});

studioApi.post("/projects/:id/db/rows/delete", async (c) => {
  const { table, keys } = await c.req.json<{ table: string; keys: unknown[] }>();
  const schema = await describeSchema(pid(c), true);
  if (!schema[table]) return c.json({ error: "Tabla no encontrada" }, 404);
  const pk = await primaryKeyOf(pid(c), table);
  if (!pk) return c.json({ error: "La tabla no tiene clave primaria; bórralas con SQL." }, 400);
  try {
    const rows = await projectDb(pid(c)).query(`delete from ${quoteIdent(table)} where ${quoteIdent(pk)}::text = any($1::text[]) returning 1`, [
      (keys ?? []).map(String),
    ]);
    return c.json({ deleted: rows.length });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
});
studioApi.post("/projects/:id/db/sql", async (c) => {
  const { sql } = await c.req.json<{ sql: string }>();
  try {
    return c.json({ results: await execSql(pid(c), sql) });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
});
studioApi.get("/projects/:id/db/export", async (c) => {
  const blob = await dumpDatabase(pid(c));
  return new Response(blob, {
    headers: {
      "content-type": "application/gzip",
      "content-disposition": `attachment; filename="${suggestSlug(c.get("project").name)}-db.tar.gz"`,
    },
  });
});

// App users
studioApi.get("/projects/:id/users", async (c) =>
  c.json({
    users: await projectDb(pid(c)).query(
      `select id, email, name, role, password_hash is not null as "hasPassword", created_at as "createdAt" from _forja_users order by created_at desc limit 500`,
    ),
  }),
);

// Storage
studioApi.get("/projects/:id/storage", async (c) =>
  c.json({ objects: await listObjects(pid(c)), bytes: await storageUsage(pid(c)), origin: previewOrigin(pid(c)) }),
);
studioApi.delete("/projects/:id/storage/:key{.+}", async (c) => {
  await deleteObject(pid(c), c.req.param("key"));
  return c.json({ ok: true });
});

// Email
studioApi.get("/projects/:id/emails", async (c) => c.json({ emails: await listEmails(pid(c)) }));
studioApi.post("/projects/:id/emails/test", async (c) => {
  const { to } = await c.req.json<{ to: string }>();
  return c.json({ results: await sendEmail(pid(c), { to, subject: "Correo de prueba", html: "<p>Funciona 🎉</p>" }) });
});
studioApi.post("/projects/:id/emails/inbound", async (c) => {
  await receiveEmail(pid(c), await c.req.json());
  return c.json({ ok: true });
});

// Jobs
studioApi.get("/projects/:id/jobs", async (c) => c.json(await listJobs(pid(c))));
studioApi.post("/projects/:id/jobs/:name/run", async (c) => {
  try {
    await runJob(pid(c), "preview", c.req.param("name"), null, "manual");
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
});
studioApi.post("/projects/:id/jobs/:name/enabled", async (c) => {
  const { enabled } = await c.req.json<{ enabled: boolean }>();
  await setJobEnabled(pid(c), c.req.param("name"), enabled);
  return c.json({ ok: true, note: "Se aplica a la app publicada en la próxima publicación." });
});
studioApi.delete("/projects/:id/timers/:timerId", async (c) => {
  await cancelTimer(pid(c), c.req.param("timerId"));
  return c.json({ ok: true });
});

// Secrets
studioApi.get("/projects/:id/secrets", async (c) => c.json({ secrets: await listSecrets(pid(c)) }));
studioApi.put("/projects/:id/secrets", async (c) => {
  const { name, value } = await c.req.json<{ name: string; value: string }>();
  try {
    await setSecret(pid(c), name, value);
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
});
studioApi.delete("/projects/:id/secrets/:name", async (c) => {
  await deleteSecret(pid(c), c.req.param("name"));
  return c.json({ ok: true });
});

// AI usage, realtime, logs
studioApi.get("/projects/:id/ai", async (c) => c.json({ usage: await aiUsage(pid(c)), enabled: c.get("project").aiEnabled }));
studioApi.get("/projects/:id/realtime", async (c) => c.json({ channels: realtimeStats(pid(c)) }));
studioApi.get("/projects/:id/logs", (c) => c.json({ logs: readLogs(pid(c), { limit: 300, level: c.req.query("level") }) }));

// Change timeline and named checkpoints
studioApi.get("/projects/:id/changes", async (c) => c.json({ changes: await projects.listChanges(pid(c)) }));
/** One chat turn's code changes, file by file, for the change card and its details view. */
studioApi.get("/projects/:id/turns/:turnId/changes", async (c) => {
  const r = await projects.turnChanges(pid(c), c.req.param("turnId"));
  return r ? c.json(r) : c.json({ error: "Turno no encontrado" }, 404);
});
studioApi.post("/projects/:id/checkpoints", async (c) => {
  const { label, description } = await c.req.json<{ label: string; description?: string }>();
  return c.json({ id: await projects.createCheckpoint(pid(c), label || "Checkpoint", "owner", description, c.get("account").email) });
});
studioApi.post("/projects/:id/changes/:cid/restore", async (c) => {
  await projects.restoreToChange(pid(c), Number(c.req.param("cid")), "owner", c.get("account").email);
  // Undoing the builder's work within minutes is a (soft) signal against the models that did it.
  void penalizeTurn(pid(c), null, 0.5).catch(() => {});
  return c.json({ ok: true });
});

// Publishing
studioApi.post("/projects/:id/publish", async (c) => {
  const { slug } = await c.req.json<{ slug?: string }>().catch(() => ({ slug: undefined }));
  try {
    return c.json(await publishProject(pid(c), slug));
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
});
studioApi.post("/projects/:id/unpublish", async (c) => {
  await unpublishProject(pid(c));
  await scheduleProject(pid(c));
  return c.json({ ok: true });
});
