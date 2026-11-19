import { randomBytes } from "node:crypto";
import { config } from "../../../shared/config.js";
import { rateLimit } from "../../../shared/security.js";
import { oauthEngine, oauthSecret, OAuthStartError, resolveOAuthProviders, safeReturnPath } from "../../../shared/oauth.js";
import { AUTH_MANIFEST, OAUTH_BASE_PATH, safeOAuthConfig } from "../../../../contracts/oauthProviders.js";
import * as auth from "../../app-services/auth.js";
import { secretEnv } from "../../app-services/secrets.js";
import type { AppEnv } from "../../app-services/context.js";
import type { FileMap } from "../domain/publication.js";

/**
 * Social and OAuth sign-in for the users of an app (forja.auth.json), with Better Auth as the
 * engine. Routes, under the app's /_baas/:
 *
 *   GET  auth/providers                    configured providers ({ id, name }) for the login page
 *   GET  auth/oauth/<id>/start?redirect=   sends the browser to the provider
 *   *    auth/oauth/callback/<id>          the provider comes back here (register this URL)
 *   GET  auth/oauth/complete               signs the person in and returns to the app
 *   POST auth/oauth/<id>/begin             preview only: a popup URL plus a key to poll
 *   POST auth/oauth/poll                   preview only: trades the popup's ticket for a session
 */
export interface OAuthRouteTarget {
  projectId: string;
  projectName: string;
  env: AppEnv;
  base: string;
  /** Public origin the visitor's browser uses for this app. */
  origin: string;
  clientIp: string;
  loadFiles(): Promise<FileMap>;
  /** A short-lived share token so a preview popup can reach the private preview. */
  shareToken?(): string;
  sessionCookie(token: string, maxAge: number): string;
  log(level: "info" | "error", message: string): void;
}

const json = (data: unknown, status = 200, headers: [string, string][] = []) =>
  new Response(JSON.stringify(data), { status, headers: [["content-type", "application/json; charset=utf-8"], ...headers] });

const ERRORS: Record<string, string> = {
  email_not_found: "El proveedor no compartió tu correo; permite el acceso al correo e inténtalo de nuevo.",
  access_denied: "Cancelaste el acceso.",
  state_mismatch: "El intento de acceso caducó; vuelve a intentarlo.",
  please_restart_the_process: "El intento de acceso caducó; vuelve a intentarlo.",
  unable_to_get_user_info: "No se pudo leer tu perfil en el proveedor.",
  invalid_code: "El proveedor rechazó el código de acceso; vuelve a intentarlo.",
};
const errorMessage = (code: string | null) => (code && ERRORS[code]) || `No se pudo iniciar sesión${code ? ` (${code.slice(0, 80)})` : ""}.`;

async function providersOf(t: OAuthRouteTarget) {
  const files = await t.loadFiles();
  const { config: oauth, error } = safeOAuthConfig(files[AUTH_MANIFEST]);
  if (error) t.log("error", error);
  const { ready, missing } = resolveOAuthProviders(oauth, oauth.providers.length ? await secretEnv(t.projectId) : {});
  return { oauth, ready, missing };
}

function engineFor(t: OAuthRouteTarget, ready: ReturnType<typeof resolveOAuthProviders>["ready"]) {
  return oauthEngine({
    secret: oauthSecret(config.secretsKey, `${t.projectId}:${t.env}`),
    origin: t.origin,
    basePath: `${t.base}${OAUTH_BASE_PATH}`,
    cookiePrefix: `forja_oa_${t.projectId.replace(/[^A-Za-z0-9]/g, "")}_${t.env === "preview" ? "p" : "a"}`,
    providers: ready,
    onError: (message) => t.log("error", `OAuth: ${message}`),
  });
}

const PROVIDER_ROUTE = /^auth\/oauth\/([a-z][a-z0-9-]{0,39})\/(start|begin)$/;
const CALLBACK_ROUTE = /^auth\/oauth\/callback\/[a-z][a-z0-9-]{0,39}$/;
const POLL_KEY = /^[A-Za-z0-9_-]{32,64}$/;

/** Providers may come back with a form post (response_mode=form_post), not JSON. */
export const isOAuthCallback = (p: string) => CALLBACK_ROUTE.test(p);

export async function oauthRoute(req: Request, t: OAuthRouteTarget, p: string): Promise<Response | null> {
  const url = new URL(req.url);

  if (p === "auth/providers" && req.method === "GET") {
    const { ready, missing } = await providersOf(t);
    return json({
      providers: ready.map((r) => ({ id: r.spec.id, name: r.spec.name })),
      // The builder and the owner see what is missing; visitors of a published app do not.
      ...(t.env === "preview" ? { missing } : {}),
    });
  }

  const provider = PROVIDER_ROUTE.exec(p);
  if (provider) {
    const [, id, action] = provider as unknown as [string, string, "start" | "begin"];
    await rateLimit(`app:${t.projectId}:oauth:${t.clientIp}`, 30, 10 * 60_000);
    const { ready } = await providersOf(t);
    if (!ready.some((r) => r.spec.id === id)) {
      return action === "begin" ? json({ error: `El acceso con ${id} no está configurado.` }, 404) : backWithError(t, url.searchParams.get("redirect"), `El acceso con ${id} no está configurado.`);
    }
    if (action === "begin") {
      if (req.method !== "POST") return null;
      // A popup with its own polling is only for the preview inside the studio's iframe.
      if (t.env !== "preview") return json({ error: "Solo en la vista previa; usa la redirección." }, 400);
      const body = (await req.json().catch(() => ({}))) as { redirect?: string };
      const poll = randomBytes(32).toString("base64url");
      const start = new URL(`${t.origin}${t.base}${OAUTH_BASE_PATH}/${id}/start`);
      start.searchParams.set("redirect", safeReturnPath(body.redirect, t.base));
      start.searchParams.set("poll", poll);
      const share = t.shareToken?.();
      if (share) start.searchParams.set("share", share);
      return json({ url: start.toString(), poll });
    }
    if (req.method !== "GET") return null;
    const complete = new URL(`${t.base}${OAUTH_BASE_PATH}/complete`, "http://x");
    complete.searchParams.set("r", safeReturnPath(url.searchParams.get("redirect"), t.base));
    const poll = url.searchParams.get("poll");
    if (poll && POLL_KEY.test(poll)) complete.searchParams.set("poll", poll);
    const callbackURL = complete.pathname + complete.search;
    try {
      const started = await engineFor(t, ready).start(id, { callbackURL, errorCallbackURL: callbackURL });
      return new Response(null, { status: 302, headers: [["location", started.location], ...started.cookies.map((c) => ["set-cookie", c] as [string, string])] });
    } catch (error) {
      if (!(error instanceof OAuthStartError)) throw error;
      t.log("error", error.message);
      return backWithError(t, url.searchParams.get("redirect"), error.message);
    }
  }

  if (CALLBACK_ROUTE.test(p) && (req.method === "GET" || req.method === "POST")) {
    const { ready } = await providersOf(t);
    // Better Auth matches its own base path, so it gets the URL the provider was given.
    const inner = new Request(`${t.origin}${t.base}/_baas/${p}${url.search}`, {
      method: req.method,
      headers: req.headers,
      body: req.method === "POST" ? await req.arrayBuffer() : undefined,
    });
    return engineFor(t, ready).handle(inner);
  }

  if (p === "auth/oauth/complete" && req.method === "GET") {
    const back = safeReturnPath(url.searchParams.get("r"), t.base);
    const poll = url.searchParams.get("poll");
    const popup = !!poll && POLL_KEY.test(poll);
    const { oauth, ready } = await providersOf(t);
    const engine = engineFor(t, ready);
    const { profile, clearCookies } = await engine.finish(req.headers.get("cookie"));
    const clear = clearCookies.map((c) => ["set-cookie", c] as [string, string]);
    const failed = url.searchParams.get("error");
    if (failed || !profile) {
      const message = errorMessage(failed ?? "please_restart_the_process");
      return popup ? popupPage(message, clear) : backWithError(t, back, message, clear);
    }
    const spec = oauth.providers.find((s) => s.id === profile.provider);
    try {
      const result = await auth.signInWithOAuth(t.projectId, profile, { trustEmail: spec?.trustEmail ?? false, signUp: oauth.signUp }, t.env);
      t.log("info", `Acceso con ${profile.provider}: ${result.user.email}`);
      if (popup) {
        await auth.endSession(t.projectId, result.token, t.env);
        await auth.createOAuthTicket(t.projectId, poll!, result.user.id, t.env);
        return popupPage(null, clear);
      }
      return new Response(null, { status: 302, headers: [["location", back], ["set-cookie", t.sessionCookie(result.token, 3600 * 24 * 30)], ...clear] });
    } catch (error) {
      if (!(error instanceof auth.AuthError)) throw error;
      return popup ? popupPage(error.message, clear) : backWithError(t, back, error.message, clear);
    }
  }

  if (p === "auth/oauth/poll" && req.method === "POST") {
    if (t.env !== "preview") return json({ error: "Solo en la vista previa." }, 400);
    await rateLimit(`app:${t.projectId}:oauth-poll:${t.clientIp}`, 400, 10 * 60_000);
    const { poll } = (await req.json().catch(() => ({}))) as { poll?: string };
    if (!poll || !POLL_KEY.test(poll)) return json({ error: "Clave no válida." }, 400);
    const result = await auth.takeOAuthTicket(t.projectId, poll, t.env);
    if (!result) return json({ pending: true });
    return json({ user: result.user }, 200, [["set-cookie", t.sessionCookie(result.token, 3600 * 24 * 30)]]);
  }

  return null;
}

/** Back to the app with the reason in ?auth_error= (auth.oauthError() in @forja/client reads it). */
function backWithError(t: OAuthRouteTarget, raw: string | null, message: string, headers: [string, string][] = []) {
  const back = new URL(safeReturnPath(raw, t.base), "http://x");
  back.searchParams.set("auth_error", message);
  return new Response(null, { status: 302, headers: [["location", back.pathname + back.search], ...headers] });
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** The end of a preview popup: closes itself; the app picks the session up by polling. */
function popupPage(error: string | null, headers: [string, string][]) {
  const text = error ? escapeHtml(error) : "Listo. Ya puedes volver a la app.";
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Inicio de sesión</title>
<body style="font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:90vh;margin:0;color:#222">
<p style="max-width:28rem;text-align:center">${text}</p>
${error ? "" : "<script>setTimeout(function(){window.close()},300)</script>"}</body>`;
  return new Response(html, { status: error ? 400 : 200, headers: [["content-type", "text/html; charset=utf-8"], ["cache-control", "no-store"], ...headers] });
}
