import { sha256 } from "../lib/crypto.js";
import { config } from "../config.js";
import { appAiChat, AiUnavailableError } from "../baas/ai.js";
import * as auth from "../baas/auth.js";
import { HttpError, serviceContext, type AppEnv, type EndpointContext } from "../baas/context.js";
import { getObject, putObject } from "../baas/storage.js";
import { log, projectEvents, type ProjectEvent } from "../platform/events.js";
import { publishedFiles, readAllFiles, type FileMap, type Project } from "../platform/projects.js";
import { BuildError, buildClient, buildExamples, compileServerModule, endpointRoutes, formatProblem, pageRoutes } from "./bundler.js";
import { runInSandbox, SandboxRunError, type SandboxError } from "./sandbox.js";
import { appHeaders, rateLimit, RateLimitError, uploadHeaders } from "../lib/security.js";
import { recordPageView } from "../baas/analytics.js";
import { isDevFile } from "../platform/projects.js";
import { watchProblems } from "../platform/problems.js";
import { appUrl, previewOrigin } from "./urls.js";

export interface AppTarget {
  project: Project;
  env: AppEnv;
  /** URL prefix the app is mounted at; empty on its own host. */
  base: string;
  /** Visitor IP, for the daily analytics hash only; never stored. */
  clientIp?: string;
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
  if (t.env === "preview") watchProblems(t.project.id);
  try {
    const res = await route(req, t, rest);
    for (const [k, v] of Object.entries(appHeaders(t.env))) if (!res.headers.has(k)) res.headers.set(k, v);
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
  const seo = t.project.seo ?? {};
  if (rest === "/manifest.webmanifest") {
    // Makes the app installable ("add to home screen") with its own name and icon.
    const icon = iconPath(files);
    const manifest = {
      name: seo.siteName || t.project.name,
      short_name: (seo.siteName || t.project.name).slice(0, 12),
      description: seo.siteDescription || t.project.description,
      start_url: `${t.base}/`,
      display: "standalone",
      background_color: "#ffffff",
      theme_color: seo.themeColor || "#ffffff",
      icons: icon ? [{ src: `${t.base}/${icon}`, sizes: icon.endsWith(".svg") ? "any" : "512x512", type: MIME[icon.split(".").pop()!] }] : [],
    };
    return new Response(JSON.stringify(manifest), { headers: { "content-type": "application/manifest+json" } });
  }
  if (rest === "/robots.txt") {
    if (!seo.robots) return new Response("Not found", { status: 404 });
    return new Response(`User-agent: *\nAllow: /\n${seo.sitemap ? `Sitemap: ${appOrigin(t)}/sitemap.xml\n` : ""}`, {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  if (rest === "/sitemap.xml") {
    if (!seo.sitemap) return new Response("Not found", { status: 404 });
    // Only pages without route params can be listed.
    const urls = pageRoutes(files)
      .filter((p) => !p.pattern.includes(":"))
      .map((p) => `<url><loc>${appOrigin(t)}${p.pattern}</loc></url>`)
      .join("");
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
      headers: { "content-type": "application/xml" },
    });
  }
  if (rest.startsWith("/static/")) {
    if (isDevFile(rest.slice(1))) return new Response("Not found", { status: 404 });
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
  // Examples render only in the preview: they are a building aid, never part of the app.
  if (t.env === "preview" && (rest === "/_forja/examples.js" || rest === "/_forja/examples.css")) {
    const file = new URL(req.url).searchParams.get("file") ?? "";
    const b = await buildExamples(files, file);
    return new Response(rest.endsWith(".js") ? b.js : b.css, {
      headers: { "content-type": rest.endsWith(".js") ? "text/javascript; charset=utf-8" : "text/css; charset=utf-8", "cache-control": "no-cache" },
    });
  }
  if (t.env === "preview" && rest.startsWith("/__examples/")) return examplesHtml(t, files, decodeURIComponent(rest.slice("/__examples/".length)) + ".tsx");
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
  const headers: Record<string, string> = { "content-type": MIME[ext] ?? "application/octet-stream" };
  // An SVG opened directly could run script on the app's origin; as an <img> it is unaffected.
  if (ext === "svg" || ext === "html") headers["content-security-policy"] = "sandbox; default-src 'none'; style-src 'unsafe-inline'; img-src data:";
  return new Response(body, { headers });
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
  const seo = t.project.seo ?? {};
  const title = escapeHtml(seo.siteName || t.project.name);
  const description = escapeHtml((seo.siteDescription || t.project.description).slice(0, 160));
  const reporter = t.env === "preview" ? previewScripts(t.base) : analyticsBeacon(t.base);
  const body = problem
    ? `<pre style="margin:24px;padding:16px;background:#fff1f0;color:#a8071a;border-radius:8px;white-space:pre-wrap;font:13px ui-monospace,monospace">La app no compila:\n\n${escapeHtml(problem)}</pre>${
        t.env === "preview"
          ? `<button data-forja-fix style="margin:0 24px;padding:8px 14px;border:0;border-radius:8px;background:#4f46e5;color:#fff;font:600 13px system-ui;cursor:pointer">Intentar arreglar</button>`
          : ""
      }`
    : `<div id="root"></div><script type="module" src="${t.base}/_forja/app.js"></script>`;
  const doc = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title><meta name="description" content="${description}"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}">
${iconLinks(t, files)}
<link rel="stylesheet" href="${t.base}/_forja/app.css"><script>window.__FORJA__=${runtime}</script>${reporter}</head>
<body>${body}${t.env === "published" ? badge() : ""}</body></html>`;
  return new Response(doc, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" } });
}

async function examplesHtml(t: AppTarget, files: FileMap, file: string): Promise<Response> {
  let problem = "";
  try {
    await buildExamples(files, file);
  } catch (e) {
    problem = e instanceof BuildError ? e.problems.map(formatProblem).join("\n") : (e as Error).message;
  }
  const q = `?file=${encodeURIComponent(file)}`;
  const doc = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ejemplos · ${escapeHtml(file)}</title><link rel="stylesheet" href="${t.base}/_forja/examples.css${q}">
<script>window.__FORJA__=${JSON.stringify({ base: t.base, projectId: t.project.id, env: t.env })}</script>${previewScripts(t.base)}</head>
<body>${problem ? `<pre style="margin:24px;padding:16px;background:#fff1f0;color:#a8071a;border-radius:8px;white-space:pre-wrap;font:13px ui-monospace,monospace">${escapeHtml(problem)}</pre>` : `<div id="root"></div><script type="module" src="${t.base}/_forja/examples.js${q}"></script>`}</body></html>`;
  return new Response(doc, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" } });
}

/** The app icon the owner uploaded (static/icon.*), else a static/favicon.svg the builder wrote. */
const iconPath = (files: FileMap) => ["static/icon.png", "static/icon.svg", "static/icon.webp", "static/icon.jpg", "static/favicon.svg"].find((p) => p in files);

function iconLinks(t: AppTarget, files: FileMap) {
  const icon = iconPath(files);
  const theme = t.project.seo?.themeColor;
  return [
    icon ? `<link rel="icon" href="${t.base}/${icon}"><link rel="apple-touch-icon" href="${t.base}/${icon}">` : "",
    `<link rel="manifest" href="${t.base}/manifest.webmanifest">`,
    theme && /^#[0-9a-f]{3,8}$/i.test(theme) ? `<meta name="theme-color" content="${theme}">` : "",
  ].join("");
}

const appOrigin = (t: AppTarget) => (t.env === "published" && t.project.slug ? appUrl(t.project.slug) : previewOrigin(t.project.id));

/** Studio origins allowed to drive a preview (select an element, navigate). */
const studioOrigins = () => [new URL(config.publicUrl).origin, "http://localhost:5173"];

/**
 * Injected into previews only: reports browser errors to the logs, reloads on file
 * changes, and talks to the studio around it — current path, page navigation, and the
 * Select tool, which outlines elements and sends the clicked one back as chat context.
 */
function previewScripts(base: string) {
  return `<script>(()=>{const b=${JSON.stringify(base)};const allowed=${JSON.stringify(studioOrigins())};
const send=(level,message)=>navigator.sendBeacon(b+"/_baas/log",JSON.stringify({level,message:String(message).slice(0,4000)}));
addEventListener("error",e=>send("error",(e.error&&e.error.stack)||e.message));addEventListener("unhandledrejection",e=>send("error",(e.reason&&e.reason.stack)||e.reason));
const ce=console.error;console.error=(...a)=>{send("error",a.map(x=>x&&x.stack||(typeof x==="string"?x:JSON.stringify(x))).join(" "));ce(...a)};
const of=window.fetch;window.fetch=async function(input,init){const u=new URL(typeof input==="string"?input:input.url,location.href);const m=((init&&init.method)||(input&&input.method)||"GET").toUpperCase();
const mine=u.origin===location.origin&&u.pathname.startsWith(b+"/_api/");try{const r=await of.apply(this,arguments);
if(mine&&r.status>=400&&r.status!==401){r.clone().text().then(t=>send("error","NETWORK "+m+" "+u.pathname.slice(b.length)+" → "+r.status+": "+t.slice(0,1500))).catch(()=>{})}return r}
catch(e){if(mine)send("error","NETWORK "+m+" "+u.pathname.slice(b.length)+" → ERR: "+(e&&e.message));throw e}};
const es=new EventSource(b+"/_forja/live");es.onmessage=()=>location.reload();
const parentOrigin=(location.ancestorOrigins&&location.ancestorOrigins[0])||"*";
const tell=m=>{if(parent!==window)parent.postMessage(m,parentOrigin)};
const path=()=>location.pathname.slice(b.length)||"/";
const ps=history.pushState;history.pushState=function(){ps.apply(this,arguments);tell({type:"forja:path",path:path()})};
addEventListener("popstate",()=>tell({type:"forja:path",path:path()}));addEventListener("load",()=>tell({type:"forja:path",path:path()}));
let selecting=false,box=null,hovered=null;
const cssPath=el=>{const p=[];while(el&&el.nodeType===1&&p.length<5&&el!==document.body){let s=el.tagName.toLowerCase();if(el.id)s+="#"+el.id;else if(el.classList.length)s+="."+[...el.classList].slice(0,2).join(".");p.unshift(s);el=el.parentElement}return p.join(" > ")};
const outline=el=>{if(!box){box=document.createElement("div");box.style.cssText="position:fixed;pointer-events:none;z-index:2147483647;border:2px solid #6366f1;background:rgba(99,102,241,.12);border-radius:4px;transition:all .05s"}document.body.appendChild(box);const r=el.getBoundingClientRect();Object.assign(box.style,{left:r.left+"px",top:r.top+"px",width:r.width+"px",height:r.height+"px"})};
const stop=()=>{selecting=false;box&&box.remove();document.documentElement.style.cursor=""};
document.addEventListener("mousemove",e=>{if(!selecting)return;hovered=e.target;outline(hovered)},true);
document.addEventListener("click",e=>{if(!selecting)return;e.preventDefault();e.stopPropagation();const el=e.target;
tell({type:"forja:selected",element:{tag:el.tagName.toLowerCase(),text:(el.innerText||"").trim().slice(0,200),selector:cssPath(el),html:el.outerHTML.slice(0,600),path:path()}});stop();tell({type:"forja:select-ended"})},true);
addEventListener("keydown",e=>{if(selecting&&e.key==="Escape"){stop();tell({type:"forja:select-ended"})}});
addEventListener("message",e=>{if(!allowed.includes(e.origin))return;const m=e.data||{};
if(m.type==="forja:select"){selecting=!!m.on;if(selecting)document.documentElement.style.cursor="crosshair";else stop()}
if(m.type==="forja:navigate"&&typeof m.path==="string"){history.pushState(null,"",b+m.path);dispatchEvent(new PopStateEvent("popstate"))}});
document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest("[data-forja-fix]");if(t){e.preventDefault();tell({type:"forja:fix"})}});
})();</script>`;
}

/** Published apps only: one beacon per page view, including client-side navigations. */
function analyticsBeacon(base: string) {
  return `<script>(()=>{const b=${JSON.stringify(base)};let last="";const pv=()=>{const p=location.pathname.slice(b.length)||"/";if(p===last)return;last=p;
navigator.sendBeacon(b+"/_baas/pv",JSON.stringify({path:p,referrer:document.referrer}))};
const ps=history.pushState;history.pushState=function(){ps.apply(this,arguments);pv()};addEventListener("popstate",pv);pv()})();</script>`;
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
        if (e.type !== "files" || e.paths.every(isDevFile)) return;
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
  if (method === "POST" && Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return json({ error: "Petición demasiado grande" }, 413);
  const rawBody = method === "POST" ? new Uint8Array(await req.arrayBuffer()) : undefined;
  if (rawBody && rawBody.byteLength > MAX_BODY_BYTES) return json({ error: "Petición demasiado grande" }, 413);

  try {
    const mod = await compileServerModule(files, ep.file);
    // Project code runs in the project's sandbox process, never in the platform.
    const out = (await runInSandbox(
      t.project.id,
      "endpoint",
      {
        env_name: t.env,
        file: mod.file,
        base: t.base,
        method,
        url: req.url,
        headers: [...req.headers.entries()].filter(([k]) => k !== "cookie"),
        rawBody,
        query: Object.fromEntries(url.searchParams),
        user,
      },
      "endpoint",
    )) as SandboxResult;
    const res =
      out.kind === "response"
        ? new Response(out.body.byteLength ? Buffer.from(out.body) : null, { status: out.status, headers: out.headers })
        : json(out.data ?? null);
    for (const c of out.setCookies) {
      // Apps cannot overwrite the platform's own session cookies.
      if (c.name.startsWith("forja_")) continue;
      res.headers.append("set-cookie", cookie(c.name, c.value, t.base || "/", c.maxAge ?? 3600 * 24 * 30, t.env));
    }
    return res;
  } catch (e) {
    if (e instanceof BuildError) {
      log(t.project.id, { env: t.env, level: "error", source: "build", message: e.message });
      return json({ error: `No compila: ${e.message}` }, 500);
    }
    const d: SandboxError = e instanceof SandboxRunError ? e.detail : { name: (e as Error).name, message: (e as Error).message, stack: (e as Error).stack };
    if (d.status) return json({ error: d.message }, d.status);
    if (d.name === "AiUnavailableError") return json({ error: d.message }, 402);
    if (d.name === "ZodError" && d.issues) {
      const error = d.issues.map((i) => (i.path?.length ? `${i.path.join(".")}: ${i.message}` : i.message)).join("; ");
      return json({ error, issues: d.issues }, 400);
    }
    log(t.project.id, { env: t.env, level: "error", source: "endpoint", message: `${ep.file}: ${d.stack ?? d.message}` });
    return json({ error: t.env === "preview" ? d.message : "Error interno" }, 500);
  }
}

type SandboxResult =
  | { kind: "json"; data: unknown; setCookies: { name: string; value: string; maxAge?: number }[] }
  | { kind: "response"; status: number; headers: [string, string][]; body: Uint8Array; setCookies: { name: string; value: string; maxAge?: number }[] };

const MAX_BODY_BYTES = 10 * 1024 * 1024;

// --- Built-in services --------------------------------------------------------------

async function baasRoute(req: Request, t: AppTarget, p: string): Promise<Response> {
  const pid = t.project.id;
  const cookieName = auth.sessionCookie(pid);
  const token = parseCookies(req.headers.get("cookie"))[cookieName];
  const sessionCookie = (value: string, maxAge: number) => ({ "set-cookie": cookie(cookieName, value, t.base || "/", maxAge, t.env) });
  const body = async () => (await req.json().catch(() => ({}))) as Record<string, string>;
  const ip = t.clientIp ?? "unknown";

  try {
    // Abuse limits, per visitor IP and app. Counts are in memory (one process).
    const limits: Record<string, [number, number]> = {
      "POST auth/signup": [10, 10 * 60_000],
      "POST auth/login": [20, 10 * 60_000],
      "POST auth/reset/request": [5, 15 * 60_000],
      "POST auth/reset/confirm": [20, 15 * 60_000],
      "POST storage/upload": [60, 10 * 60_000],
      "POST ai/chat": [30, 60_000],
      "POST pv": [120, 60_000],
      "POST log": [120, 60_000],
    };
    const key = `${req.method} ${p}`;
    if (limits[key]) rateLimit(`app:${pid}:${key}:${ip}`, ...limits[key]!);
    // Auth and AI calls must be JSON: a cross-site form cannot send that without a preflight.
    if ((p.startsWith("auth/") || p === "ai/chat") && req.method === "POST" && !(req.headers.get("content-type") ?? "").includes("application/json")) {
      return json({ error: "Se espera JSON" }, 415);
    }

    switch (key) {
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
      case "POST pv": {
        if (t.env !== "published") return new Response(null, { status: 204 });
        const b = JSON.parse(await req.text()) as { path?: string; referrer?: string };
        await recordPageView(pid, {
          ip: t.clientIp ?? "",
          userAgent: req.headers.get("user-agent") ?? "",
          path: String(b.path ?? "/"),
          referrer: b.referrer,
        });
        return new Response(null, { status: 204 });
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
      return new Response(new Uint8Array(obj.data), { headers: uploadHeaders(obj.contentType, obj.filename) });
    }
    return json({ error: "No encontrado" }, 404);
  } catch (e) {
    if (e instanceof RateLimitError) return json({ error: e.message }, 429, { "retry-after": String(e.retryAfterSec) });
    if (e instanceof auth.AuthError) return json({ error: e.message }, e.status);
    if (e instanceof AiUnavailableError) return json({ error: e.message }, 402);
    throw e;
  }
}
