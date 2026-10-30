import { sha256 } from "../lib/crypto.js";
import { config } from "../config.js";
import { appAiChat, AiUnavailableError } from "../baas/ai.js";
import * as auth from "../baas/auth.js";
import { HttpError, serviceContext, type AppEnv, type EndpointContext } from "../baas/context.js";
import { getObject, putObject } from "../baas/storage.js";
import { log, projectEvents, type ProjectEvent } from "../platform/events.js";
import { publishedFiles, readAllFiles, type FileMap, type Project } from "../platform/projects.js";
import { BuildError, buildClient, endpointRoutes, formatProblem, loadServerModule } from "./bundler.js";

export interface AppTarget {
  project: Project;
  env: AppEnv;
  /** URL prefix the app is mounted at: `/p/<id>` for previews, `` on <slug>.localhost. */
  base: string;
}

const clientCache = new Map<string, Promise<{ js: string; css: string }>>();

function filesHash(files: FileMap) {
  return sha256(
    Object.keys(files)
      .sort()
      .map((k) => `${k}\0${files[k]}`)
      .join("\0"),
  );
}

async function clientBundle(files: FileMap, minify: boolean) {
  const key = filesHash(files) + (minify ? ":min" : "");
  let p = clientCache.get(key);
  if (!p) {
    p = buildClient(files, { minify });
    clientCache.set(key, p);
    p.catch(() => clientCache.delete(key));
    if (clientCache.size > 50) clientCache.delete(clientCache.keys().next().value!);
  }
  return p;
}

const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", ...headers } });

export function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (header ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

/**
 * Previews run inside the studio's iframe on another site, where browsers drop Lax cookies
 * as third-party. There they are partitioned (CHIPS) instead; *.localhost counts as a
 * secure context, so `Secure` works over plain http in development.
 */
export const cookie = (name: string, value: string, path: string, maxAge: number, env: AppEnv = "published") =>
  `${name}=${encodeURIComponent(value)}; Path=${path || "/"}; HttpOnly; ${
    env === "preview" ? "SameSite=None; Secure; Partitioned" : "SameSite=Lax"
  }; Max-Age=${maxAge}`;

async function loadFiles(t: AppTarget): Promise<FileMap> {
  return t.env === "preview" ? readAllFiles(t.project.id) : ((await publishedFiles(t.project.id)) ?? {});
}

/** Handles every request under an app's base path. `rest` is the path after the base. */
export async function serveApp(req: Request, t: AppTarget, rest: string): Promise<Response> {
  const started = Date.now();
  try {
    const res = await route(req, t, rest);
    if (rest.startsWith("/_api/") || rest.startsWith("/_baas/")) {
      log(t.project.id, {
        env: t.env,
        level: res.status >= 500 ? "error" : "info",
        source: "request",
        message: `${req.method} ${rest} → ${res.status} (${Date.now() - started} ms)`,
      });
    }
    return res;
  } catch (e) {
    const err = e as Error;
    log(t.project.id, { env: t.env, level: "error", source: "request", message: `${req.method} ${rest} → 500: ${err.stack ?? err.message}` });
    return json({ error: t.env === "preview" ? err.message : "Error interno" }, 500);
  }
}

async function route(req: Request, t: AppTarget, rest: string): Promise<Response> {
  const pid = t.project.id;
  if (rest.startsWith("/_api/")) return callEndpoint(req, t, rest.slice("/_api/".length));
  if (rest.startsWith("/_baas/")) return baasRoute(req, t, rest.slice("/_baas/".length));

  const files = await loadFiles(t);
  if (rest.startsWith("/static/")) {
    const content = files[rest.slice(1)];
    if (content === undefined) return new Response("Not found", { status: 404 });
    return staticFile(rest, content);
  }
  if (rest === "/_forja/app.js" || rest === "/_forja/app.css") {
    const b = await clientBundle(files, t.env === "published");
    return rest.endsWith(".js")
      ? new Response(b.js, { headers: { "content-type": "text/javascript; charset=utf-8", "cache-control": "no-cache" } })
      : new Response(b.css, { headers: { "content-type": "text/css; charset=utf-8", "cache-control": "no-cache" } });
  }
  if (rest === "/_forja/live" && t.env === "preview") return liveReload(pid);
  if (req.method !== "GET") return new Response("Method not allowed", { status: 405 });
  return html(t, files);
}

const MIME: Record<string, string> = {
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  ico: "image/x-icon",
  json: "application/json",
  txt: "text/plain; charset=utf-8",
  css: "text/css",
  js: "text/javascript",
  woff2: "font/woff2",
  webmanifest: "application/manifest+json",
};

/** Text files are stored as-is; binary ones as `base64:<data>`. */
function staticFile(p: string, content: string) {
  const ext = p.split(".").pop()!.toLowerCase();
  const body = content.startsWith("base64:") ? Buffer.from(content.slice(7), "base64") : content;
  return new Response(body, { headers: { "content-type": MIME[ext] ?? "application/octet-stream" } });
}

async function html(t: AppTarget, files: FileMap): Promise<Response> {
  let problem = "";
  try {
    await clientBundle(files, t.env === "published");
  } catch (e) {
    problem = e instanceof BuildError ? e.problems.map(formatProblem).join("\n") : (e as Error).message;
    log(t.project.id, { env: t.env, level: "error", source: "build", message: problem });
  }
  const runtime = JSON.stringify({ base: t.base, projectId: t.project.id, env: t.env });
  const title = escapeHtml(t.project.name);
  const reporter =
    t.env === "preview"
      ? `<script>(()=>{const b=${JSON.stringify(t.base)};const send=(level,message)=>navigator.sendBeacon(b+"/_baas/log",JSON.stringify({level,message:String(message).slice(0,4000)}));
addEventListener("error",e=>send("error",(e.error&&e.error.stack)||e.message));addEventListener("unhandledrejection",e=>send("error",(e.reason&&e.reason.stack)||e.reason));
const ce=console.error;console.error=(...a)=>{send("error",a.map(x=>x&&x.stack||(typeof x==="string"?x:JSON.stringify(x))).join(" "));ce(...a)};
const es=new EventSource(b+"/_forja/live");es.onmessage=()=>location.reload();})();</script>`
      : "";
  const body = problem
    ? `<pre style="margin:24px;padding:16px;background:#fff1f0;color:#a8071a;border-radius:8px;white-space:pre-wrap;font:13px ui-monospace,monospace">La app no compila:\n\n${escapeHtml(problem)}</pre>`
    : `<div id="root"></div><script type="module" src="${t.base}/_forja/app.js"></script>`;
  const doc = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title><meta name="description" content="${escapeHtml(t.project.description.slice(0, 160))}">
${files["static/favicon.svg"] ? `<link rel="icon" href="${t.base}/static/favicon.svg">` : ""}
<link rel="stylesheet" href="${t.base}/_forja/app.css"><script>window.__FORJA__=${runtime}</script>${reporter}</head>
<body>${body}${t.env === "published" ? badge() : ""}</body></html>`;
  return new Response(doc, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" } });
}

const badge = () =>
  `<a href="${config.publicUrl}" target="_blank" style="position:fixed;right:12px;bottom:12px;padding:4px 10px;border-radius:99px;background:#1c1917;color:#fff;font:12px system-ui;text-decoration:none;opacity:.8;z-index:99999">Hecho con Forja</a>`;

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function liveReload(projectId: string): Response {
  let onEvent: (e: ProjectEvent) => void;
  let ping: NodeJS.Timeout;
  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      let timer: NodeJS.Timeout | undefined;
      onEvent = (e) => {
        if (e.type !== "files") return;
        // Debounce bursts of writes from the builder into one reload.
        clearTimeout(timer);
        timer = setTimeout(() => controller.enqueue(enc.encode(`data: reload\n\n`)), 300);
      };
      projectEvents.on(projectId, onEvent);
      ping = setInterval(() => controller.enqueue(enc.encode(`: ping\n\n`)), 25_000);
    },
    cancel() {
      projectEvents.off(projectId, onEvent);
      clearInterval(ping);
    },
  });
  return new Response(stream, { headers: { "content-type": "text/event-stream", "cache-control": "no-cache" } });
}

// --- Endpoints --------------------------------------------------------------------

async function callEndpoint(req: Request, t: AppTarget, routePath: string): Promise<Response> {
  const files = await loadFiles(t);
  const method = req.method === "HEAD" ? "GET" : req.method;
  const ep = endpointRoutes(files).find((e) => e.route === routePath.replace(/\/$/, "") && e.method === method);
  if (!ep) return json({ error: `No existe el endpoint ${method} /_api/${routePath}` }, 404);

  const url = new URL(req.url);
  const cookies = parseCookies(req.headers.get("cookie"));
  const user = await auth.userFromSession(t.project.id, cookies[auth.sessionCookie(t.project.id)]);
  let body: unknown = undefined;
  if (method === "POST") {
    const type = req.headers.get("content-type") ?? "";
    if (type.includes("application/json")) body = await req.json().catch(() => ({}));
    else if (type.includes("form")) body = await req.formData();
    else body = await req.text();
  }
  const setCookies: string[] = [];
  const ctx: EndpointContext = {
    ...(await serviceContext(t.project.id, t.env, t.base, "endpoint")),
    req,
    method,
    query: Object.fromEntries(url.searchParams),
    body,
    user,
    requireUser(role?: string) {
      if (!user) throw new HttpError(401, "Inicia sesión para continuar.");
      if (role && user.role !== role && user.role !== "admin") throw new HttpError(403, "No tienes permiso.");
      return user;
    },
    setCookie(name, value, opts) {
      setCookies.push(cookie(name, value, t.base || "/", opts?.maxAge ?? 3600 * 24 * 30, t.env));
    },
  };

  try {
    const mod = await loadServerModule(files, ep.file);
    const handler = mod.default as (ctx: EndpointContext) => unknown;
    if (typeof handler !== "function") throw new Error(`${ep.file} no exporta una función por defecto`);
    const result = await handler(ctx);
    const res = result instanceof Response ? result : json(result ?? null);
    for (const c of setCookies) res.headers.append("set-cookie", c);
    return res;
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    if (e instanceof auth.AuthError) return json({ error: e.message }, e.status);
    if (e instanceof AiUnavailableError) return json({ error: e.message }, 402);
    if (e instanceof BuildError) {
      log(t.project.id, { env: t.env, level: "error", source: "build", message: e.message });
      return json({ error: `No compila: ${e.message}` }, 500);
    }
    log(t.project.id, { env: t.env, level: "error", source: "endpoint", message: `${ep.file}: ${(e as Error).stack ?? e}` });
    return json({ error: t.env === "preview" ? (e as Error).message : "Error interno" }, 500);
  }
}

// --- Built-in services --------------------------------------------------------------

async function baasRoute(req: Request, t: AppTarget, p: string): Promise<Response> {
  const pid = t.project.id;
  const cookieName = auth.sessionCookie(pid);
  const token = parseCookies(req.headers.get("cookie"))[cookieName];
  const sessionCookie = (value: string, maxAge: number) => ({ "set-cookie": cookie(cookieName, value, t.base || "/", maxAge, t.env) });
  const body = async () => (await req.json().catch(() => ({}))) as Record<string, string>;

  try {
    switch (`${req.method} ${p}`) {
      case "GET auth/me":
        return json({ user: await auth.userFromSession(pid, token) });
      case "POST auth/signup": {
        const r = await auth.signUp(pid, (await body()) as never);
        return json({ user: r.user }, 200, sessionCookie(r.token, 3600 * 24 * 30));
      }
      case "POST auth/login": {
        const r = await auth.signIn(pid, (await body()) as never);
        return json({ user: r.user }, 200, sessionCookie(r.token, 3600 * 24 * 30));
      }
      case "POST auth/logout":
        if (token) await auth.signOut(pid, token);
        return json({ ok: true }, 200, sessionCookie("", 0));
      case "POST auth/reset/request":
        await auth.requestPasswordReset(pid, (await body()).email ?? "", t.project.name);
        return json({ ok: true });
      case "POST auth/reset/confirm":
        await auth.confirmPasswordReset(pid, (await body()) as never);
        return json({ ok: true });
      case "POST storage/upload": {
        const user = await auth.userFromSession(pid, token);
        if (!user && t.env === "published") return json({ error: "Inicia sesión para subir archivos." }, 401);
        const form = await req.formData();
        const file = form.get("file");
        if (!(file instanceof File)) return json({ error: "Falta el archivo" }, 400);
        const obj = await putObject(pid, new Uint8Array(await file.arrayBuffer()), { filename: file.name, contentType: file.type });
        return json({ ...obj, url: `${t.base}/_baas/storage/files/${encodeURIComponent(obj.key)}` });
      }
      case "POST ai/chat": {
        const user = await auth.userFromSession(pid, token);
        if (!user) return json({ error: "Inicia sesión para usar la IA." }, 401);
        const b = (await req.json()) as { messages: { role: "user" | "assistant"; content: string }[]; system?: string; model?: string };
        const r = await appAiChat(pid, { messages: b.messages, system: b.system, model: b.model });
        return json({ text: r.text, credits: r.credits });
      }
      case "POST log": {
        const b = JSON.parse(await req.text()) as { level?: string; message?: string };
        log(pid, { env: t.env, level: b.level === "error" ? "error" : "info", source: "client", message: String(b.message ?? "").slice(0, 4000) });
        return new Response(null, { status: 204 });
      }
    }
    if (req.method === "GET" && p.startsWith("storage/files/")) {
      const obj = await getObject(pid, decodeURIComponent(p.slice("storage/files/".length)));
      if (!obj) return new Response("Not found", { status: 404 });
      return new Response(new Uint8Array(obj.data), {
        headers: { "content-type": obj.contentType, "cache-control": "public, max-age=31536000, immutable" },
      });
    }
    return json({ error: "No encontrado" }, 404);
  } catch (e) {
    if (e instanceof auth.AuthError) return json({ error: e.message }, e.status);
    if (e instanceof AiUnavailableError) return json({ error: e.message }, 402);
    throw e;
  }
}
