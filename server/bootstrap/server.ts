import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { WebSocketServer } from "ws";
import { config, ROOT_DIR } from "../shared/config.js";
import { createStudioApi } from "./http/studioApi.js";
import { startJobRunner, stopJobRunner } from "../modules/app-services/jobs.js";
import { closeAll } from "../modules/app-services/projectDb.js";
import { attachSocket, stopRealtime } from "../modules/app-services/realtime.js";
import { createMcpHandler } from "./mcp/server.js";
import { closePlatformDb, platformDb } from "../shared/database/index.js";
import { createLocalSeed } from "./database/localSeed.js";
import { reloadProviders } from "../modules/model-management/providers.js";
import { createSettingReactions } from "./settingReactions.js";
import { warnMovedEnv } from "../modules/settings/index.js";
import type { Project } from "../modules/projects/index.js";
import { cookie, parseCookies, serveApp } from "../modules/app-runtime/index.js";
import { startGithubSync, stopGithubSync } from "../modules/integrations/github.js";
import { clientIp as ipOfClient, rateLimit, STUDIO_HEADERS, startRateLimitCleanup, stopRateLimitCleanup } from "../shared/security.js";
import { langfuse, metricsIdle, stopBuilder, reloadLangfuse } from "../modules/builder/index.js";
import { stopAppRuntime } from "../modules/app-runtime/index.js";
import { checkShareToken, parseAppHost, SHARE_COOKIE } from "../modules/app-runtime/index.js";
import { ApplicationLifecycle } from "./ApplicationLifecycle.js";
import { createMonolith } from "./composition.js";
import { resetTransport, stopEmailTransport } from "../modules/app-services/email.js";
import { reschedulePoll } from "../modules/integrations/github.js";
import { stopProblems } from "../modules/project-observability/problems.js";

const monolith = createMonolith();
const studioApi = createStudioApi(monolith);
const handleMcp = createMcpHandler(monolith);
const { getProject, getProjectBySlug } = monolith.projects;
const { accountFromApiToken } = monolith.identity;
const seedLocal = createLocalSeed(monolith.settings);
const reactions = createSettingReactions(monolith.settings, { resetTransport, reloadLangfuse, reschedulePoll });

const STUDIO_DIST = path.join(ROOT_DIR, "dist", "studio");

/** Finds the app a Host header points at, and whether this browser may open it. */
async function resolveApp(host: string | undefined, url: URL, cookieHeader: string | null) {
  const target = parseAppHost(host);
  if (!target) return null;
  let project: Project | undefined;
  let env: "preview" | "published";
  if (target.kind === "preview") {
    project = await getProject(target.projectId);
    env = "preview";
  } else {
    project = await getProjectBySlug(target.slug);
    env = "published";
  }
  if (!project || (env === "published" && !project.publishedVersionId)) return { project: undefined, env, allowed: false, fromQuery: false };
  // Previews and private apps need the share token, once from the link, then from a cookie.
  const needsToken = env === "preview" || project.visibility === "private";
  const fromQuery = checkShareToken(project, url.searchParams.get("share"));
  const allowed = !needsToken || fromQuery || checkShareToken(project, parseCookies(cookieHeader)[SHARE_COOKIE]);
  return { project, env, allowed, fromQuery };
}

const app = new Hono();

app.use("*", async (c, next) => {
  const url = new URL(c.req.url);
  const resolved = await resolveApp(c.req.header("host"), url, c.req.header("cookie") ?? null);
  if (!resolved) return next();
  if (!resolved.project) return c.html(page("App no encontrada", "Esta dirección no tiene ninguna app publicada."), 404);
  if (!resolved.allowed) return c.html(page("Enlace privado", "Abre esta app desde el enlace que te compartieron."), 403);
  if (resolved.fromQuery) {
    // Trade the token in the link for a cookie on this app's own host, and clean the URL.
    url.searchParams.delete("share");
    return new Response(null, {
      status: 302,
      headers: {
        location: url.pathname + (url.search || ""),
        "set-cookie": cookie(SHARE_COOKIE, c.req.query("share")!, "/", 3600 * 24 * 30, resolved.env),
      },
    });
  }
  const socketIp = (c.env as { incoming?: { socket?: { remoteAddress?: string } } })?.incoming?.socket?.remoteAddress;
  const ip = ipOfClient(socketIp, c.req.header("x-forwarded-for"));
  const clientIp = ip === "unknown" ? undefined : ip;
  return serveApp(c.req.raw, { project: resolved.project, env: resolved.env, base: "", clientIp }, url.pathname);
});

// The studio itself: never framed, no sniffing. Apps returned above set their own headers.
app.use("*", async (c, next) => {
  await next();
  for (const [k, v] of Object.entries(STUDIO_HEADERS)) if (!c.res.headers.has(k)) c.res.headers.set(k, v);
});

app.route("/api", studioApi);

app.all("/mcp", async (c) => {
  const bearer = c.req.header("authorization")?.replace(/^Bearer\s+/i, "");
  // Tokens only: a cookie fallback would let any page the owner visits drive the builder.
  const account = await accountFromApiToken(bearer);
  if (account) {
    try {
      rateLimit(`mcp:${account.id}`, 240, 60_000);
    } catch (e) {
      return c.json({ error: (e as Error).message }, 429);
    }
  }
  if (!account) return c.json({ error: "Crea un token en el studio (Cuenta → Tokens MCP) y envíalo como Authorization: Bearer" }, 401);
  return handleMcp(c.req.raw, account);
});

app.get("/healthz", (c) => c.json({ ok: true }));

// The built studio (npm run build). In development Vite serves it and proxies /api here.
if (existsSync(STUDIO_DIST)) {
  app.use("/*", serveStatic({ root: path.relative(process.cwd(), STUDIO_DIST) }));
  // Read per request: a rebuild renames the hashed assets the page points at.
  app.get("*", (c) => c.html(readFileSync(path.join(STUDIO_DIST, "index.html"), "utf8")));
} else {
  app.get("/", (c) => c.html(page("Forja", "El studio corre con Vite en desarrollo: <code>npm run dev</code> y abre http://localhost:5173")));
}

function page(title: string, body: string) {
  return `<!doctype html><meta charset="utf-8"><title>${title}</title><body style="font-family:system-ui;display:grid;place-items:center;min-height:100vh;margin:0;background:#fafaf9;color:#1c1917"><div style="text-align:center"><h1>${title}</h1><p>${body}</p></div>`;
}

let server: ReturnType<typeof serve>;
const wss = new WebSocketServer({ noServer: true });

function listening(info: { port: number }) {
  console.log(`[forja] plataforma en ${config.publicUrl} (puerto ${info.port})`);
  if (process.env.NODE_ENV === "production" && /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(config.publicUrl))
    console.warn(
      "[forja] PUBLIC_URL apunta a localhost en producción: las vistas previas, los enlaces de los correos, GitHub y MCP usarán esa dirección. En Coolify: pon el dominio en Domains del servicio forja (https://dominio:4100) y FORJA_DOMAIN en Environment Variables, y vuelve a desplegar. Fuera de Coolify: define PUBLIC_URL.",
    );
  console.log(`[forja] MCP en ${config.publicUrl}/mcp`);
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
  { name: "project observation", start: async () => {}, stop: stopProblems },
  { name: "application transports", start: async () => {}, stop: async () => {
    stopRealtime();
    stopEmailTransport();
  } },
  { name: "builder telemetry", start: async () => {}, stop: async () => {
    await metricsIdle();
    await langfuse?.flush();
  } },
  { name: "settings", start: monolith.settings.start, stop: async () => { monolith.settings.stop(); } },
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
