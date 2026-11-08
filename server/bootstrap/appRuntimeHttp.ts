import { Hono } from "hono";
import { z } from "zod";
import { clientIp as ipOfClient } from "../shared/security.js";
import { isInternalServiceRequest } from "../shared/internalServiceAuth.js";
import { cookie, parseCookies, serveApp, SHARE_COOKIE, checkShareToken, parseAppHost, getSandboxServices, restartSandboxService } from "../modules/app-runtime/index.js";
import type { Project } from "../modules/projects/index.js";
import type { ProjectEvent } from "../modules/project-observability/events.js";
import { checkRepositoryShareToken, type RepositoryRuntime } from "../modules/repository-runtime/index.js";

type AppHost = ReturnType<typeof parseAppHost>;
type AppEnv = "preview" | "published";
export const REPOSITORY_SHARE_COOKIE = "forja_repository_share";

export interface AppRuntimeHttpPorts {
  getProject(id: string): Promise<Project | undefined>;
  getProjectBySlug(slug: string): Promise<Project | undefined>;
  parseAppHost: typeof parseAppHost;
  checkShareToken(project: Project, token: string | null | undefined): boolean;
  cookie: typeof cookie;
  serveApp: typeof serveApp;
  internalToken: string;
  emitProject(projectId: string, event: ProjectEvent): unknown;
  reloadSettings(): Promise<void>;
  getSandboxServices?: typeof getSandboxServices;
  restartSandboxService?: typeof restartSandboxService;
  repositoryRuntime?: Pick<RepositoryRuntime, "serve">;
  checkRepositoryShareToken?: typeof checkRepositoryShareToken;
}

export interface ResolvedApp {
  project: Project | undefined;
  env: AppEnv;
  allowed: boolean;
  fromQuery: boolean;
  repositoryHost?: string;
}

type RequestPorts = AppRuntimeHttpPorts;

export async function resolveApp(
  host: string | undefined,
  url: URL,
  cookieHeader: string | null,
  ports: Pick<AppRuntimeHttpPorts, "getProject" | "getProjectBySlug" | "parseAppHost" | "checkShareToken" | "checkRepositoryShareToken">,
): Promise<ResolvedApp | null> {
  let target: AppHost = ports.parseAppHost(host);
  let repositoryHost: string | undefined;
  if (!target && host) {
    const parts = host.toLowerCase().split(".");
    for (let index = 1; index < parts.length - 1; index++) {
      const suffix = parts.slice(index).join(".");
      const outer = ports.parseAppHost(suffix);
      if (!outer) continue;
      const repository = outer.kind === "preview" ? await ports.getProject(outer.projectId) : await ports.getProjectBySlug(outer.slug);
      if (repository?.runtime === "repository") { target = outer; repositoryHost = suffix.split(":")[0]; break; }
    }
  }
  if (!target) return null;
  const env = target.kind === "preview" ? "preview" : "published";
  const project = target.kind === "preview"
    ? await ports.getProject(target.projectId)
    : await ports.getProjectBySlug(target.slug);
  if (!project || (env === "published" && !project.publishedVersionId)) {
    return { project: undefined, env, allowed: false, fromQuery: false };
  }
  const needsToken = env === "preview" || project.visibility === "private";
  if (project.runtime === "repository") repositoryHost ??= host?.split(":")[0];
  const validToken = (token: string | null | undefined) => project.runtime === "repository"
    ? (ports.checkRepositoryShareToken ?? checkRepositoryShareToken)(project, token, env)
    : ports.checkShareToken(project, token);
  const fromQuery = validToken(url.searchParams.get("share"));
  const cookies = parseCookies(cookieHeader);
  const allowed = !needsToken || fromQuery || validToken(cookies[project.runtime === "repository" ? REPOSITORY_SHARE_COOKIE : SHARE_COOKIE]);
  return { project, env, allowed, fromQuery, ...(repositoryHost ? { repositoryHost } : {}) };
}

export async function handleAppRuntimeRequest(
  request: Request,
  ports: RequestPorts,
  socketIp?: string,
): Promise<Response | null> {
  const url = new URL(request.url);
  const resolved = await resolveApp(request.headers.get("host") ?? undefined, url, request.headers.get("cookie"), ports);
  if (!resolved) return null;
  if (!resolved.project) return new Response(appErrorPage("App no encontrada", "Esta dirección no tiene ninguna app publicada."), { status: 404, headers: { "content-type": "text/html; charset=utf-8" } });
  if (!resolved.allowed) return new Response(appErrorPage("Enlace privado", "Abre esta app desde el enlace que te compartieron."), { status: 403, headers: { "content-type": "text/html; charset=utf-8" } });
  if (resolved.fromQuery) {
    const share = url.searchParams.get("share")!;
    url.searchParams.delete("share");
    return new Response(null, {
      status: 302,
      headers: {
        location: url.pathname + (url.search || ""),
        "set-cookie": resolved.repositoryHost
          ? `${ports.cookie(REPOSITORY_SHARE_COOKIE, share, "/", 3600 * 24 * 30, resolved.env)}; Domain=${resolved.repositoryHost}`
          : ports.cookie(SHARE_COOKIE, share, "/", 3600 * 24 * 30, resolved.env),
      },
    });
  }
  const ip = ipOfClient(socketIp, request.headers.get("x-forwarded-for"));
  if (resolved.project.runtime === "repository" && ports.repositoryRuntime) return ports.repositoryRuntime.serve(request, resolved.project.id, resolved.env);
  return ports.serveApp(
    request,
    { project: resolved.project, env: resolved.env, base: "", clientIp: ip === "unknown" ? undefined : ip },
    url.pathname,
  );
}

export function createAppRuntimeHttpApp(ports: AppRuntimeHttpPorts) {
  const app = new Hono();
  const serviceTarget = z.object({ projectId: z.string().min(1).max(200) }).strict();
  app.post("/internal/runtime/service-control/snapshot", async (c) => {
    if (!isInternalServiceRequest(c.req.header("authorization"), ports.internalToken)) return c.json({ error: "Unauthorized" }, 401);
    const parsed = serviceTarget.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: "Invalid service snapshot" }, 400);
    if (!await ports.getProject(parsed.data.projectId)) return c.json({ error: "Project not found" }, 404);
    return c.json({ available: true, scope: "app-runtime", services: (ports.getSandboxServices ?? getSandboxServices)(parsed.data.projectId) });
  });
  app.post("/internal/runtime/service-control/restart", async (c) => {
    if (!isInternalServiceRequest(c.req.header("authorization"), ports.internalToken)) return c.json({ error: "Unauthorized" }, 401);
    const parsed = serviceTarget.extend({
      service: z.string().regex(/^[a-z][a-z0-9-]{0,39}$/),
      env: z.enum(["preview", "published"]).optional(),
    }).strict().safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: "Invalid service restart" }, 400);
    if (!await ports.getProject(parsed.data.projectId)) return c.json({ error: "Project not found" }, 404);
    await (ports.restartSandboxService ?? restartSandboxService)(parsed.data.projectId, parsed.data.service, parsed.data.env);
    return c.json({ ok: true });
  });
  const endpointCall = z.object({
    projectId: z.string().min(1),
    method: z.enum(["GET", "POST"]),
    route: z.string().regex(/^[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*$/).refine((route) => !route.split("/").includes("..")),
    query: z.record(z.string(), z.string()).optional(),
    cookie: z.string().max(4096).optional(),
    body: z.string().max(1_048_576).optional(),
  });
  app.post("/internal/runtime/call-endpoint", async (c) => {
    if (!isInternalServiceRequest(c.req.header("authorization"), ports.internalToken)) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const parsed = endpointCall.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ error: "Invalid endpoint call", issues: parsed.error.issues }, 400);
    const input = parsed.data;
    const project = await ports.getProject(input.projectId);
    if (!project) return c.json({ error: "Project not found" }, 404);
    const rest = `/_api/${input.route}`;
    const url = new URL(rest, "http://app-runtime");
    for (const [key, value] of Object.entries(input.query ?? {})) url.searchParams.set(key, value);
    const endpointRequest = new Request(url, {
      method: input.method,
      headers: {
        "content-type": "application/json",
        ...(input.cookie ? { cookie: input.cookie } : {}),
      },
      body: input.method === "POST" ? input.body ?? "{}" : undefined,
    });
    const response = project.runtime === "repository" && ports.repositoryRuntime
      ? await ports.repositoryRuntime.serve(endpointRequest, project.id, "preview")
      : await ports.serveApp(endpointRequest, { project, env: "preview", base: "" }, rest);
    return c.json({
      status: response.status,
      body: await response.text(),
      contentType: response.headers.get("content-type"),
    });
  });
  app.post("/internal/runtime/project-event", async (c) => {
    if (!isInternalServiceRequest(c.req.header("authorization"), ports.internalToken)) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const parsed = z.object({
      projectId: z.string().min(1),
      event: z.object({ type: z.literal("files"), paths: z.array(z.string().min(1)).max(1000) }),
    }).safeParse(await c.req.json());
    if (!parsed.success) return c.json({ error: "Invalid project event", issues: parsed.error.issues }, 400);
    ports.emitProject(parsed.data.projectId, parsed.data.event);
    return c.json({ ok: true });
  });
  app.post("/internal/runtime/reload", async (c) => {
    if (!isInternalServiceRequest(c.req.header("authorization"), ports.internalToken)) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    await ports.reloadSettings();
    return c.json({ ok: true });
  });
  app.all("*", async (c) => {
    const socketIp = (c.env as { incoming?: { socket?: { remoteAddress?: string } } })?.incoming?.socket?.remoteAddress;
    return await handleAppRuntimeRequest(c.req.raw, ports, socketIp) ?? c.notFound();
  });
  return app;
}

function appErrorPage(title: string, body: string) {
  return `<!doctype html><meta charset="utf-8"><title>${title}</title><body style="font-family:system-ui;display:grid;place-items:center;min-height:100vh;margin:0;background:#fafaf9;color:#1c1917"><div style="text-align:center"><h1>${title}</h1><p>${body}</p></div>`;
}
