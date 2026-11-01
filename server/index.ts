import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { WebSocketServer } from "ws";
import { config, ROOT_DIR } from "./config.js";
import { studioApi } from "./api/studioApi.js";
import { startJobRunner } from "./baas/jobs.js";
import { closeAll } from "./baas/projectDb.js";
import { attachSocket } from "./baas/realtime.js";
import { handleMcp } from "./mcp/server.js";
import { accountFromApiToken } from "./platform/accounts.js";
import { initBootstrap } from "./platform/bootstrap.js";
import { closePlatformDb, platformDb } from "./platform/db.js";
import { getProject, getProjectBySlug, type Project } from "./platform/projects.js";
import { cookie, parseCookies, serveApp } from "./runtime/appServer.js";
import { stopAllSandboxes } from "./runtime/sandbox.js";
import { startCatalogSync } from "./llm/catalog.js";
import { startGithubSync } from "./platform/github.js";
import { clientIp as ipOfClient, rateLimit, STUDIO_HEADERS } from "./lib/security.js";
import { langfuse } from "./builder/tracing.js";
import { closeBrowser } from "./runtime/browser.js";
import { checkShareToken, parseAppHost, SHARE_COOKIE } from "./runtime/urls.js";

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

await platformDb();
await initBootstrap();
await startJobRunner();
startCatalogSync();
startGithubSync();
if (config.evals.enabled) void import("./evals/runner.js").then((m) => m.recoverEvals()).catch(() => {});

const server = serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`[forja] plataforma en ${config.publicUrl} (puerto ${info.port})`);
  console.log(`[forja] MCP en ${config.publicUrl}/mcp`);
});

const wss = new WebSocketServer({ noServer: true });
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

const shutdown = async () => {
  stopAllSandboxes();
  await closeBrowser();
  await langfuse?.flush();
  await closeAll();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
