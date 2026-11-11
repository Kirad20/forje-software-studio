import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { compress } from "hono/compress";
import { WebSocketServer } from "ws";
import { config, ROOT_DIR } from "../shared/config.js";
import { createStudioApi } from "./http/studioApi.js";
import { withDefaultHeaders } from "./http/responseHeaders.js";
import { startJobRunner, stopJobRunner } from "../modules/app-services/jobs.js";
import { closeAll } from "../modules/app-services/projectDb.js";
import { attachSocket, stopRealtime } from "../modules/app-services/realtime.js";
import { createMcpHandler } from "./mcp/server.js";
import { accountFromOAuthAccessToken, createMcpOAuthRouter } from "./mcp/oauth.js";
import { createAdminMcpHandler } from "./mcp/adminServer.js";
import { closePlatformDb, platformDb } from "../shared/database/index.js";
import { createLocalSeed } from "./database/localSeed.js";
import { reloadProviders } from "../modules/model-management/providers.js";
import { createSettingReactions } from "./settingReactions.js";
import { warnMovedEnv } from "../modules/settings/index.js";
import { cookie, serveApp } from "../modules/app-runtime/index.js";
import { startGithubSync, stopGithubSync } from "../modules/integrations/github.js";
import { rateLimit, RateLimitError, RateLimitStoreError, STUDIO_HEADERS, startRateLimitCleanup, stopRateLimitCleanup, studioOrigins } from "../shared/security.js";
import { BuilderServiceClient, langfuse, metricsIdle, stopBuilder, reloadLangfuse } from "../modules/builder/index.js";
import { stopAppRuntime } from "../modules/app-runtime/index.js";
import { checkShareToken, parseAppHost } from "../modules/app-runtime/index.js";
import { ApplicationLifecycle } from "./ApplicationLifecycle.js";
import { createMonolith } from "./composition.js";
import { resetTransport, stopEmailTransport } from "../modules/app-services/email.js";
import { reschedulePoll } from "../modules/integrations/github.js";
import { stopProblems } from "../modules/project-observability/problems.js";
import { resolveApp as resolveRuntimeApp, handleAppRuntimeRequest } from "./appRuntimeHttp.js";
import { startAppRuntimeEventRelay } from "./appRuntimeEventRelay.js";
import { emitProject } from "../modules/project-observability/events.js";

const monolith = createMonolith();
const builderClient = config.builderServiceUrl ? new BuilderServiceClient(config.builderServiceUrl, config.builderServiceToken) : undefined;
const studioApi = createStudioApi(monolith, builderClient);
const handleMcp = createMcpHandler(monolith, builderClient);
const handleAdminMcp = createAdminMcpHandler(monolith);
const { getProject, getProjectBySlug } = monolith.projects;
const { accountFromApiToken, accountFromAdminApiToken } = monolith.identity;
const seedLocal = createLocalSeed(monolith.settings);
const reactions = createSettingReactions(monolith.settings, {
  resetTransport,
  reloadLangfuse,
  reschedulePoll,
  reloadServices: () => {
    const services = [
    [config.appRuntimeInternalUrl, "/internal/runtime/reload", config.appDataServiceToken],
    [config.builderServiceUrl, "/internal/builder/reload", config.builderServiceToken],
    ] as const;
  for (const [baseUrl, path, token] of services) {
      if (!baseUrl) continue;
      void fetch(`${baseUrl.replace(/\/+$/, "")}${path}`, {
        method: "POST",
      headers: { authorization: `Bearer ${token}` },
      }).then((response) => {
        if (!response.ok) throw new Error(`Settings reload returned ${response.status}: ${response.statusText}`);
      }).catch((error) => {
        console.error("[forja] service settings reload:", error);
      });
    }
  },
});
let stopRuntimeEventRelay = () => {};

const STUDIO_DIST = path.join(ROOT_DIR, "dist", "studio");

/** Finds the app a Host header points at, and whether this browser may open it. */
const runtimeAccessPorts = {
  getProject,
  getProjectBySlug,
  parseAppHost,
  checkShareToken,
};
const runtimeHttpPorts = {
  ...runtimeAccessPorts,
  cookie,
  serveApp,
  internalToken: config.appDataServiceToken,
  emitProject,
  reloadSettings: async () => {
    await monolith.settings.loadSettings();
    await reloadProviders();
  },
};
const resolveApp = (host: string | undefined, url: URL, cookieHeader: string | null) =>
  resolveRuntimeApp(host, url, cookieHeader, runtimeAccessPorts);

const app = new Hono();
app.use("*", compress());

app.use("*", async (c, next) => {
  const socketIp = (c.env as { incoming?: { socket?: { remoteAddress?: string } } })?.incoming?.socket?.remoteAddress;
  const response = await handleAppRuntimeRequest(c.req.raw, runtimeHttpPorts, socketIp);
  return response ?? next();
});

// The studio itself: never framed, no sniffing. Apps returned above set their own headers.
app.use("*", async (c, next) => {
  await next();
  c.res = withDefaultHeaders(c.res, STUDIO_HEADERS);
});

app.route("/", createMcpOAuthRouter(monolith.identity));
app.route("/api", studioApi);

app.all("/mcp", async (c) => {
  const bearer = /^Bearer\s+(\S+)$/i.exec(c.req.header("authorization") ?? "")?.[1];
  // Tokens only: a cookie fallback would let any page the owner visits drive the builder.
  const account = bearer?.startsWith("mcp_at_")
    ? await accountFromOAuthAccessToken(bearer)
    : await accountFromApiToken(bearer);
  if (account) {
    try {
      await rateLimit(`mcp:${account.id}`, 240, 60_000);
    } catch (e) {
      if (e instanceof RateLimitError) return c.json({ error: e.message }, 429, { "retry-after": String(e.retryAfterSec) });
      if (e instanceof RateLimitStoreError) return c.json({ error: e.message }, 503);
      throw e;
    }
  }
  if (!account) return c.json(
    { error: "Se requiere un token MCP válido. Conecta Claude mediante OAuth o usa un token de Cuenta → Tokens MCP." },
    401,
    { "www-authenticate": `Bearer resource_metadata="${new URL("/.well-known/oauth-protected-resource/mcp", config.publicUrl).toString()}"` },
  );
  return handleMcp(c.req.raw, account);
});

app.all("/admin/mcp", async (c) => {
  const origin = c.req.header("origin");
  if (origin && !studioOrigins().includes(origin)) return c.json({ error: "Origen no permitido." }, 403);
  const bearer = /^Bearer\s+(\S+)$/i.exec(c.req.header("authorization") ?? "")?.[1];
  const account = await accountFromAdminApiToken(bearer);
  if (!account || account.platformRole !== "admin" || account.disabled) {
    return c.json({ error: "Usa un token de Administración → API tokens como Authorization: Bearer." }, 401);
  }
  try {
    await rateLimit(`admin-mcp:${account.id}`, 30, 60_000);
  } catch (e) {
    if (e instanceof RateLimitError) return c.json({ error: e.message }, 429, { "retry-after": String(e.retryAfterSec) });
    if (e instanceof RateLimitStoreError) return c.json({ error: e.message }, 503);
    throw e;
  }
  return handleAdminMcp(c.req.raw);
});

app.get("/healthz", (c) => c.json({ ok: true }));

// The built studio (npm run build). In development Vite serves it and proxies /api here.
if (existsSync(STUDIO_DIST)) {
  app.use("/*", async (c, next) => {
    await next();
    const file = c.req.path;
    c.header("Cache-Control", file.startsWith("/assets/") && c.res.status === 200
      ? "public, max-age=31536000, immutable" : "no-cache");
    if (file === "/sw.js") c.header("Service-Worker-Allowed", "/");
  });
  app.use("/*", serveStatic({ root: path.relative(process.cwd(), STUDIO_DIST) }));
  // Cached by mtime: a rebuild renames the hashed assets the page points at and bumps it.
  let indexCache: { mtimeMs: number; html: string } | undefined;
  const studioIndex = () => {
    const file = path.join(STUDIO_DIST, "index.html");
    const { mtimeMs } = statSync(file);
    if (indexCache?.mtimeMs !== mtimeMs) indexCache = { mtimeMs, html: readFileSync(file, "utf8") };
    return indexCache.html;
  };
  app.get("*", (c) => {
    if (c.req.path.startsWith("/assets/") || c.req.path.startsWith("/icons/")
      || ["/sw.js", "/manifest.webmanifest", "/offline.html"].includes(c.req.path)) return c.notFound();
    return c.html(studioIndex());
  });
} else {
  app.get("/", (c) => c.html(page("Forja", "El studio corre con Vite en desarrollo: <code>npm run dev</code> y abre http://localhost:5173")));
}

function page(title: string, body: string) {
  return `<!doctype html><meta charset="utf-8"><title>${title}</title><body style="font-family:system-ui;display:grid;place-items:center;min-height:100vh;margin:0;background:#fafaf9;color:#1c1917"><div style="text-align:center"><h1>${title}</h1><p>${body}</p></div>`;
}

let server: ReturnType<typeof serve>;
const wss = new WebSocketServer({ noServer: true, maxPayload: 64 * 1024 });

function listening(info: { port: number }) {
  console.log(`[forja] plataforma en ${config.publicUrl} (puerto ${info.port})`);
  if (process.env.NODE_ENV === "production" && /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(config.publicUrl))
    console.warn(
      "[forja] PUBLIC_URL apunta a localhost en producción: las vistas previas, los enlaces de los correos, GitHub y MCP usarán esa dirección. En Coolify: pon el dominio en Domains del servicio forja (https://dominio:4100) y FORJA_DOMAIN en Environment Variables, y vuelve a desplegar. Fuera de Coolify: define PUBLIC_URL.",
    );
  console.log(`[forja] MCP en ${config.publicUrl}/mcp`);
  console.log(`[forja] MCP de administración en ${config.publicUrl}/admin/mcp`);
}

async function startHttp() {
  await new Promise<void>((resolve, reject) => {
    server = serve({ fetch: app.fetch, port: config.port }, (info) => {
      server.off("error", reject);
      listening(info);
      resolve();
    });
    server.once("error", reject);
    server.on("upgrade", async (req, socket, head) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
    const resolved = await resolveApp(req.headers.host, url, req.headers.cookie ?? null);
    if (!resolved?.project || !resolved.allowed || url.pathname !== "/_baas/realtime") throw new Error("rejected");
    const projectId = resolved.project.id;
    wss.handleUpgrade(req, socket, head, (ws) => attachSocket(projectId, ws));
  } catch {
    socket.destroy();
  }
    });
  });
}

async function stopHttp() {
  for (const socket of wss.clients) socket.terminate();
  await Promise.all([
    new Promise<void>((resolve, reject) => wss.close((error) => error ? reject(error) : resolve())),
    new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
      if ("closeAllConnections" in server) server.closeAllConnections();
    }),
  ]);
}

const lifecycle = new ApplicationLifecycle([
  { name: "platform database", start: async () => {
    try {
      await platformDb();
    } catch (error) {
      await closePlatformDb();
      throw error;
    }
  }, stop: closePlatformDb },
  { name: "rate limiting", start: async () => { startRateLimitCleanup(); }, stop: async () => { stopRateLimitCleanup(); } },
  { name: "module bindings", start: monolith.startBindings, stop: monolith.stopBindings },
  { name: "application databases", start: async () => {}, stop: closeAll },
  { name: "application runtime", start: async () => {}, stop: stopAppRuntime },
  { name: "application runtime event relay", start: async () => {
    stopRuntimeEventRelay = startAppRuntimeEventRelay(config.appRuntimeInternalUrl, config.appDataServiceToken);
  }, stop: async () => { stopRuntimeEventRelay(); } },
  { name: "project observation", start: async () => {}, stop: stopProblems },
  { name: "application transports", start: async () => {}, stop: async () => {
    stopRealtime();
    stopEmailTransport();
  } },
  { name: "builder telemetry", start: async () => {}, stop: async () => {
    await metricsIdle();
    await langfuse?.flush();
  } },
  { name: "settings", start: async () => {
    await monolith.settings.start();
    reloadLangfuse();
  }, stop: async () => { monolith.settings.stop(); } },
  { name: "model management", start: monolith.models.start, stop: monolith.models.stop },
  { name: "installation configuration", start: async () => {
    warnMovedEnv();
    const seeded = await seedLocal(config.seedFile);
    if (seeded.length) console.log(`[forja] ${config.seedFile}: ${seeded.join(", ")}`);
    await reloadProviders();
  }, stop: async () => {} },
  { name: "identity bootstrap", start: monolith.identity.start, stop: async () => { monolith.identity.stop(); } },
  { name: "setting reactions", start: async () => { reactions.start(); }, stop: async () => { reactions.stop(); } },
  { name: "GitHub synchronization", start: async () => { startGithubSync(); }, stop: async () => { await stopGithubSync(); } },
  { name: "builder runs", start: async () => {}, stop: stopBuilder },
  { name: "evaluation recovery", start: async () => {
    await (await import("../modules/evaluations/runner.js")).recoverEvals();
  }, stop: async () => {
    await (await import("../modules/evaluations/runner.js")).stopEvals();
  } },
  { name: "application jobs", start: startJobRunner, stop: stopJobRunner },
  { name: "HTTP and WebSocket", start: startHttp, stop: stopHttp },
]);

await lifecycle.start();

let shuttingDown = false;
async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  try {
    await lifecycle.stop();
    process.exit(0);
  } catch (error) {
    console.error("[forja] shutdown:", error);
    process.exit(1);
  }
}
process.on("SIGINT", () => { void shutdown(); });
process.on("SIGTERM", () => { void shutdown(); });
