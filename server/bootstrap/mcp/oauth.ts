import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { platformDb, q } from "../../shared/database/index.js";
import { config } from "../../shared/config.js";
import { clientIp, isHttps, rateLimit, RateLimitError, RateLimitStoreError, requestOrigin, studioOrigins } from "../../shared/security.js";
import type { IdentityModule, PublicAccount } from "../../modules/identity/index.js";

const SESSION_COOKIE = "forja_session";
const CSRF_COOKIE = "forja_mcp_oauth_csrf";
const ACCESS_TOKEN_TTL = 60 * 60;
const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60;
const SCOPE = "mcp";
const authorizationServer = new URL(config.publicUrl).origin;
const resourceServer = new URL("/mcp", authorizationServer).toString();
const validChallenge = (value: string | null) => !!value && /^[A-Za-z0-9_-]{43}$/.test(value);
const validState = (value: string | null) => value === null || (value.length <= 1024 && !/[\u0000-\u001f]/.test(value));

type Client = { client_id: string; client_name: string; redirect_uris: string[] };
type AuthorizationCode = {
  account_id: string;
  redirect_uri: string;
  code_challenge: string;
  scope: string;
};
type RefreshGrant = { account_id: string; scope: string };

const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const opaque = (prefix: string) => `${prefix}${randomBytes(32).toString("base64url")}`;
const noStore = { "cache-control": "no-store", pragma: "no-cache" };
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: noStore });
const oauthError = (error: string, status = 400) => json({ error }, status);
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]!);

function validRedirectUri(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const url = new URL(value);
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    return (url.protocol === "https:" || (url.protocol === "http:" && loopback))
      && !url.username && !url.password && !url.hash;
  } catch {
    return false;
  }
}

function validScope(value: string | null): boolean {
  return !value || value.trim().split(/\s+/).every((scope) => scope === SCOPE);
}

function validResource(value: string | null): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.toString() === resourceServer;
  } catch {
    return false;
  }
}

function redirectWithError(uri: string, error: string, state: string | null): Response {
  const redirect = new URL(uri);
  redirect.searchParams.set("error", error);
  if (state) redirect.searchParams.set("state", state);
  return Response.redirect(redirect, 302);
}

function authorizationHtml(clientName: string, account: PublicAccount | null, csrf: string, params: URLSearchParams) {
  const hidden = [...params.entries()]
    .map(([key, value]) => `<input type="hidden" name="${escapeHtml(key)}" value="${escapeHtml(value)}">`)
    .join("");
  const content = account
    ? `<p>Conectando como <strong>${escapeHtml(account.email)}</strong></p><p><strong>${escapeHtml(clientName)}</strong> podrá usar tus proyectos y crear proyectos con las herramientas de Forja.</p>
       <form method="post" action="/oauth/authorize">${hidden}<input type="hidden" name="csrf" value="${escapeHtml(csrf)}"><button name="decision" value="approve">Autorizar</button><button name="decision" value="deny">Cancelar</button></form>`
    : `<p>Inicia sesión en Forja para autorizar este conector. Después vuelve a esta pestaña y recárgala.</p><p><a href="/" target="_blank" rel="noopener">Abrir Forja en otra pestaña</a></p>`;
  return `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Conectar ${escapeHtml(clientName)} · Forja</title><body style="font:16px system-ui;max-width:38rem;margin:10vh auto;padding:0 1.5rem;color:#292524"><h1>Autorizar conector MCP</h1>${content}</body></html>`;
}

async function findClient(clientId: string): Promise<Client | null> {
  return (await q<Client>(
    `select client_id, client_name, redirect_uris from mcp_oauth_clients where client_id = $1`,
    [clientId],
  ))[0] ?? null;
}

async function issueTokens(accountId: string, clientId: string, scope: string) {
  const accessToken = opaque("mcp_at_");
  const refreshToken = opaque("mcp_rt_");
  await q(
    `insert into mcp_oauth_tokens
       (access_token_hash, refresh_token_hash, client_id, account_id, scope, expires_at, refresh_expires_at)
     values ($1, $2, $3, $4, $5, now() + ($6::double precision * interval '1 second'),
       now() + ($7::double precision * interval '1 second'))`,
    [digest(accessToken), digest(refreshToken), clientId, accountId, scope, ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL],
  );
  return {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: ACCESS_TOKEN_TTL,
    refresh_token: refreshToken,
    scope,
  };
}

export function createMcpOAuthRouter(identity: IdentityModule) {
  const router = new Hono();

  router.use("/oauth/*", async (c, next) => {
    const remote = (c.env as { incoming?: { socket?: { remoteAddress?: string } } })?.incoming?.socket?.remoteAddress;
    try {
      await rateLimit(`mcp-oauth:${clientIp(remote, c.req.header("x-forwarded-for"))}`, 60, 60_000);
    } catch (error) {
      if (error instanceof RateLimitError) return c.json({ error: error.message }, 429, { "retry-after": String(error.retryAfterSec) });
      if (error instanceof RateLimitStoreError) return c.json({ error: error.message }, 503);
      throw error;
    }
    await next();
  });

  router.get("/.well-known/oauth-protected-resource/mcp", (c) => c.json({
    resource: resourceServer,
    authorization_servers: [authorizationServer],
    bearer_methods_supported: ["header"],
    scopes_supported: [SCOPE],
  }, 200, noStore));

  router.get("/.well-known/oauth-authorization-server", (c) => c.json({
    issuer: authorizationServer,
    authorization_endpoint: `${authorizationServer}/oauth/authorize`,
    token_endpoint: `${authorizationServer}/oauth/token`,
    registration_endpoint: `${authorizationServer}/oauth/register`,
    revocation_endpoint: `${authorizationServer}/oauth/revoke`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
    scopes_supported: [SCOPE],
  }, 200, noStore));

  router.post("/oauth/register", async (c) => {
    if (!(c.req.header("content-type") ?? "").toLowerCase().includes("application/json")) return oauthError("invalid_client_metadata");
    let body: Record<string, unknown>;
    try {
      body = await c.req.json<Record<string, unknown>>();
    } catch {
      return oauthError("invalid_client_metadata");
    }
    const redirects = body.redirect_uris;
    if (!Array.isArray(redirects) || redirects.length < 1 || redirects.length > 10 || !redirects.every(validRedirectUri)) {
      return oauthError("invalid_redirect_uri");
    }
    if (body.grant_types !== undefined
      && (!Array.isArray(body.grant_types) || body.grant_types.some((grant) => !["authorization_code", "refresh_token"].includes(String(grant))))) {
      return oauthError("invalid_client_metadata");
    }
    if (body.response_types !== undefined
      && (!Array.isArray(body.response_types) || body.response_types.some((type) => type !== "code"))) {
      return oauthError("invalid_client_metadata");
    }
    const clientId = randomBytes(24).toString("base64url");
    const clientName = typeof body.client_name === "string" && body.client_name.trim()
      ? body.client_name.trim().slice(0, 100)
      : "Cliente MCP";
    await q(
      `insert into mcp_oauth_clients (client_id, client_name, redirect_uris) values ($1, $2, $3::jsonb)`,
      [clientId, clientName, JSON.stringify(redirects)],
    );
    return c.json({
      client_id: clientId,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      client_name: clientName,
      redirect_uris: redirects,
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    }, 201, noStore);
  });

  router.get("/oauth/authorize", async (c) => {
    const params = new URL(c.req.url).searchParams;
    const clientId = params.get("client_id") ?? "";
    const redirectUri = params.get("redirect_uri") ?? "";
    const state = params.get("state");
    const client = await findClient(clientId);
    if (params.get("response_type") !== "code" || !client || !client.redirect_uris.includes(redirectUri)
      || !validScope(params.get("scope")) || !validResource(params.get("resource"))
      || params.get("code_challenge_method") !== "S256"
      || !validChallenge(params.get("code_challenge")) || !validState(state)) {
      return oauthError("invalid_request");
    }
    const account = await identity.accountFromSession(getCookie(c, SESSION_COOKIE));
    const csrf = randomBytes(32).toString("base64url");
    setCookie(c, CSRF_COOKIE, csrf, { httpOnly: true, sameSite: "Lax", secure: isHttps(), path: "/", maxAge: 600 });
    return c.html(authorizationHtml(client.client_name, account, csrf, params), 200, {
      ...noStore,
      "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    });
  });

  router.post("/oauth/authorize", async (c) => {
    const origin = c.req.header("origin");
    const ownOrigin = requestOrigin({
      host: c.req.header("host"),
      forwardedHost: c.req.header("x-forwarded-host"),
      forwardedProto: c.req.header("x-forwarded-proto"),
    });
    if (!origin || (origin !== ownOrigin && !studioOrigins().includes(origin))) return oauthError("access_denied", 403);
    let form: FormData;
    try {
      form = await c.req.formData();
    } catch {
      return oauthError("invalid_request");
    }
    const params = new URLSearchParams();
    for (const [key, value] of form.entries()) if (typeof value === "string" && key !== "csrf" && key !== "decision") params.set(key, value);
    const clientId = params.get("client_id") ?? "";
    const redirectUri = params.get("redirect_uri") ?? "";
    const state = params.get("state");
    const client = await findClient(clientId);
    const cookieCsrf = getCookie(c, CSRF_COOKIE);
    const formCsrf = form.get("csrf");
    if (!cookieCsrf || typeof formCsrf !== "string" || cookieCsrf.length !== formCsrf.length
      || !timingSafeEqual(Buffer.from(cookieCsrf), Buffer.from(formCsrf))) return oauthError("access_denied", 403);
    if (!client || !client.redirect_uris.includes(redirectUri) || params.get("response_type") !== "code"
      || !validScope(params.get("scope")) || !validResource(params.get("resource"))
      || params.get("code_challenge_method") !== "S256"
      || !validChallenge(params.get("code_challenge")) || !validState(state)) return oauthError("invalid_request");
    const account = await identity.accountFromSession(getCookie(c, SESSION_COOKIE));
    if (!account) return c.html(authorizationHtml(client.client_name, null, cookieCsrf, params), 401, {
      ...noStore,
      "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    });
    if (form.get("decision") !== "approve") return redirectWithError(redirectUri, "access_denied", state);

    const code = opaque("mcp_code_");
    await q(`delete from mcp_oauth_codes where expires_at <= now() or consumed_at < now() - interval '10 minutes'`);
    await q(
      `insert into mcp_oauth_codes
         (code_hash, client_id, account_id, redirect_uri, code_challenge, scope, expires_at)
       values ($1, $2, $3, $4, $5, $6, now() + interval '5 minutes')`,
      [digest(code), clientId, account.id, redirectUri, params.get("code_challenge"), SCOPE],
    );
    const redirect = new URL(redirectUri);
    redirect.searchParams.set("code", code);
    if (state) redirect.searchParams.set("state", state);
    return c.redirect(redirect.toString(), 302);
  });

  router.post("/oauth/token", async (c) => {
    if (!(c.req.header("content-type") ?? "").toLowerCase().includes("application/x-www-form-urlencoded")) return oauthError("invalid_request");
    let form: FormData;
    try {
      form = await c.req.formData();
    } catch {
      return oauthError("invalid_request");
    }
    const value = (key: string) => {
      const field = form.get(key);
      return typeof field === "string" ? field : "";
    };
    const clientId = value("client_id");
    const client = await findClient(clientId);
    if (!client) return oauthError("invalid_client", 401);
    const grant = value("grant_type");
    if (grant === "authorization_code") {
      const code = value("code");
      const redirectUri = value("redirect_uri");
      const verifier = value("code_verifier");
      if (!code || !validRedirectUri(redirectUri) || !/^[A-Za-z0-9._~-]{43,128}$/.test(verifier)) return oauthError("invalid_grant");
      const db = await platformDb();
      const result = await db.transaction(async (tx) => {
        const found = (await tx.query<AuthorizationCode>(
          `select account_id, redirect_uri, code_challenge, scope from mcp_oauth_codes
           where code_hash = $1 and client_id = $2 and expires_at > now() and consumed_at is null`,
          [digest(code), clientId],
        )).rows[0];
        if (!found || found.redirect_uri !== redirectUri
          || !timingSafeEqual(Buffer.from(createHash("sha256").update(verifier).digest("base64url")), Buffer.from(found.code_challenge))) return null;
        const consumed = await tx.query(
          `update mcp_oauth_codes set consumed_at = now()
           where code_hash = $1 and client_id = $2 and consumed_at is null and expires_at > now() returning code_hash`,
          [digest(code), clientId],
        );
        return consumed.rows.length ? found : null;
      });
      if (!result) return oauthError("invalid_grant");
      return c.json(await issueTokens(result.account_id, clientId, result.scope), 200, noStore);
    }
    if (grant === "refresh_token") {
      const refreshToken = value("refresh_token");
      if (!refreshToken.startsWith("mcp_rt_")) return oauthError("invalid_grant");
      const db = await platformDb();
      const result = await db.transaction(async (tx) => {
        const consumed = await tx.query<RefreshGrant>(
          `update mcp_oauth_tokens t set revoked_at = now()
           from accounts a
           where t.refresh_token_hash = $1 and t.client_id = $2 and t.revoked_at is null
             and t.refresh_expires_at > now() and t.account_id = a.id and not a.disabled
           returning t.account_id, t.scope`,
          [digest(refreshToken), clientId],
        );
        return consumed.rows[0] ?? null;
      });
      if (!result) return oauthError("invalid_grant");
      return c.json(await issueTokens(result.account_id, clientId, result.scope), 200, noStore);
    }
    return oauthError("unsupported_grant_type");
  });

  router.post("/oauth/revoke", async (c) => {
    if (!(c.req.header("content-type") ?? "").toLowerCase().includes("application/x-www-form-urlencoded")) return oauthError("invalid_request");
    let form: FormData;
    try {
      form = await c.req.formData();
    } catch {
      return oauthError("invalid_request");
    }
    const token = form.get("token");
    const clientId = form.get("client_id");
    if (typeof token !== "string" || typeof clientId !== "string" || !token.startsWith("mcp_")) return c.body(null, 200, noStore);
    await q(
      `update mcp_oauth_tokens set revoked_at = now()
       where client_id = $1 and revoked_at is null and
       (access_token_hash = $2 or refresh_token_hash = $2)`,
      [clientId, digest(token)],
    );
    return c.body(null, 200, noStore);
  });

  return router;
}

export async function accountFromOAuthAccessToken(token: string | undefined): Promise<PublicAccount | null> {
  if (!token?.startsWith("mcp_at_")) return null;
  const account = (await q<PublicAccount>(
    `update mcp_oauth_tokens t set last_used_at = now()
     from accounts a
     where t.access_token_hash = $1 and t.account_id = a.id and t.revoked_at is null
       and t.expires_at > now() and not a.disabled
     returning a.id, a.email, a.name, a.credits, a.platform_role as "platformRole", null::text as "tokenOrgId", null::text as "tokenProjectId"`,
    [digest(token)],
  ))[0];
  return account ?? null;
}
