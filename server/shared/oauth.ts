import { AsyncLocalStorage } from "node:async_hooks";
import { createHash, createHmac } from "node:crypto";
import { betterAuth, type BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import { getAccountCookie } from "better-auth/cookies";
import { genericOAuth } from "better-auth/plugins";
import {
  oauthSecretNames,
  profileValue,
  type OAuthConfig,
  type OAuthOptionValue,
  type OAuthProviderSpec,
} from "../../contracts/oauthProviders.js";

/**
 * Better Auth as Forja's OAuth engine.
 *
 * Better Auth runs without a database: the OAuth state, PKCE verifier and the result of the
 * callback travel in its own encrypted cookies. Forja only uses it for the provider dance
 * (authorization URL, callback, token exchange, profile) and then reads the profile and
 * signs the person in with its own sessions: the studio's accounts or the app's
 * _forja_users. So email/password, codes, resets and every existing session keep working.
 */

export interface ResolvedOAuthProvider {
  spec: OAuthProviderSpec;
  clientId: string;
  clientSecret?: string;
  secretOptions: Record<string, string>;
}

export interface OAuthProfile {
  provider: string;
  accountId: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
  image: string | null;
}

export interface OAuthEngineOptions {
  /** Signs Better Auth's cookies; derive one per tenant with oauthSecret(). */
  secret: string;
  /** Public origin the browser sees, e.g. https://mi-app.forja.app. */
  origin: string;
  /** Path Better Auth answers under, e.g. /_baas/auth/oauth. */
  basePath: string;
  /** Keeps every tenant's cookies apart on a shared host. */
  cookiePrefix: string;
  providers: ResolvedOAuthProvider[];
  onError?: (message: string) => void;
}

export interface OAuthEngine {
  /** Where to send the browser to sign in, plus the state cookies to set first. */
  start(providerId: string, urls: { callbackURL: string; errorCallbackURL: string }): Promise<{ location: string; cookies: string[] }>;
  /** Better Auth's own routes: /callback/:provider (GET, or POST for form_post providers). */
  handle(request: Request): Promise<Response>;
  /** After the callback: the profile, and the cookies that clear Better Auth's state. */
  finish(cookieHeader: string | null): Promise<{ profile: OAuthProfile | null; clearCookies: string[] }>;
}

/** Credentials for each configured provider; providers whose secrets are not set are reported, not used. */
export function resolveOAuthProviders(config: OAuthConfig, values: Record<string, string | undefined>) {
  const ready: ResolvedOAuthProvider[] = [];
  const missing: { id: string; name: string; secrets: string[] }[] = [];
  for (const spec of config.providers) {
    const value = (name: string | null) => (name ? values[name]?.trim() || undefined : undefined);
    const clientId = spec.clientId ?? value(spec.clientIdSecret);
    const clientSecret = spec.clientSecret ?? value(spec.clientSecretSecret);
    const secretOptions: Record<string, string> = {};
    const absent: string[] = [];
    if (!clientId) absent.push(spec.clientIdSecret);
    if (spec.clientSecretSecret && !clientSecret) absent.push(spec.clientSecretSecret);
    for (const [option, name] of Object.entries(spec.secretOptions)) {
      const v = value(name);
      if (v) secretOptions[option] = v;
      else absent.push(name);
    }
    if (absent.length) missing.push({ id: spec.id, name: spec.name, secrets: absent });
    else ready.push({ spec, clientId: clientId!, clientSecret, secretOptions });
  }
  return { ready, missing };
}

export { oauthSecretNames };

/** A per-tenant Better Auth secret derived from the server's key. */
export const oauthSecret = (serverKey: string, tenant: string) => createHmac("sha256", serverKey).update(`oauth:${tenant}`).digest("hex");

const asString = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : typeof v === "number" ? String(v) : null);
const asBool = (v: unknown) => v === true || v === "true" || v === 1;

function builtinOptions(p: ResolvedOAuthProvider): Record<string, unknown> {
  const options: Record<string, OAuthOptionValue | string | undefined> = {
    ...p.spec.options,
    ...p.secretOptions,
    clientId: p.clientId,
    clientSecret: p.clientSecret,
  };
  return { ...options, ...(p.spec.scopes ? { scope: p.spec.scopes } : {}) };
}

function genericConfig(p: ResolvedOAuthProvider) {
  const s = p.spec;
  const map = s.profile!;
  return {
    providerId: s.id,
    name: s.name,
    clientId: p.clientId,
    clientSecret: p.clientSecret,
    discoveryUrl: s.discoveryUrl,
    authorizationUrl: s.authorizationUrl,
    tokenUrl: s.tokenUrl,
    userInfoUrl: s.userInfoUrl,
    scopes: s.scopes,
    pkce: s.pkce,
    ...(s.authentication ? { authentication: s.authentication } : {}),
    ...(Object.keys(s.authorizationParams).length ? { authorizationUrlParams: s.authorizationParams } : {}),
    ...p.spec.options,
    ...p.secretOptions,
    accountSubject: ({ profile }: { profile: unknown }) => asString(profileValue(profile, map.id)) ?? asString(profileValue(profile, "sub")) ?? asString(profileValue(profile, "id")) ?? "",
    mapProfileToUser: (profile: unknown) => {
      const email = asString(profileValue(profile, map.email));
      return {
        ...(email ? { email: email.toLowerCase() } : {}),
        name: asString(profileValue(profile, map.name)) ?? email ?? "",
        image: asString(profileValue(profile, map.image)) ?? undefined,
        ...(map.emailVerified ? { emailVerified: asBool(profileValue(profile, map.emailVerified)) } : {}),
      };
    },
  };
}

/**
 * Without a database Better Auth still writes the user, account and session of a callback to
 * a process-local in-memory store before it puts them in its cookies. Forja deletes them as
 * soon as the callback answers: everything needed afterwards travels in the cookies, the
 * store does not grow, and a later sign-in never meets a stale user (which could be
 * another provider's claim about the same address).
 */
const created = new AsyncLocalStorage<string[]>();

/** Reads the result of the callback from Better Auth's own cookies: works on any process. */
const finishPlugin = {
  id: "forja-finish",
  endpoints: {
    forjaFinish: createAuthEndpoint("/forja/finish", { method: "GET", use: [sessionMiddleware] }, async (c) => {
      const account = (await getAccountCookie(c)) as { providerId?: string; accountId?: string } | null;
      return c.json({
        user: c.context.session.user,
        account: account?.providerId && account.accountId ? { providerId: account.providerId, accountId: String(account.accountId) } : null,
      });
    }),
  },
} satisfies BetterAuthPlugin;

const engines = new Map<string, OAuthEngine>();
const MAX_ENGINES = 200;

/** Better Auth instances are cached per configuration (tenant, origin, providers and credentials). */
export function oauthEngine(opts: OAuthEngineOptions): OAuthEngine {
  const key = createHash("sha256")
    .update(JSON.stringify([opts.secret, opts.origin, opts.basePath, opts.cookiePrefix, opts.providers]))
    .digest("hex");
  let engine = engines.get(key);
  if (engine) {
    engines.delete(key);
    engines.set(key, engine);
    return engine;
  }
  engine = createEngine(opts);
  engines.set(key, engine);
  if (engines.size > MAX_ENGINES) engines.delete(engines.keys().next().value!);
  return engine;
}

function createEngine(opts: OAuthEngineOptions): OAuthEngine {
  const builtin = opts.providers.filter((p) => p.spec.type === "builtin");
  const generic = opts.providers.filter((p) => p.spec.type !== "builtin");
  const secure = opts.origin.startsWith("https://");
  const auth = betterAuth({
    appName: "Forja",
    secret: opts.secret,
    baseURL: opts.origin,
    basePath: opts.basePath,
    trustedOrigins: [opts.origin],
    telemetry: { enabled: false },
    socialProviders: Object.fromEntries(builtin.map((p) => [p.spec.id, builtinOptions(p)])) as never,
    plugins: [finishPlugin, ...(generic.length ? [genericOAuth({ config: generic.map(genericConfig) as never })] : [])],
    databaseHooks: {
      user: { create: { after: async (user: { id: string }) => { created.getStore()?.push(user.id); } } },
    },
    session: { expiresIn: 600 },
    account: { accountLinking: { enabled: false } },
    advanced: { cookiePrefix: opts.cookiePrefix, useSecureCookies: secure },
    logger: {
      level: "error",
      log: (_level: string, message: string, ...args: unknown[]) => opts.onError?.(
        [message, ...args.map((a) => (a instanceof Error ? a.message : typeof a === "string" ? a : JSON.stringify(a)))].join(" ").slice(0, 2000),
      ),
    },
  });

  const cookieName = (c: string) => c.split(";")[0]!.split("=")[0]!.trim();
  const ownCookies = (header: string | null) =>
    (header ?? "").split(";").map((c) => c.trim().split("=")[0]!).filter((n) => n.includes(`${opts.cookiePrefix}.`));
  const clear = (name: string) => `${name}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax${secure || name.startsWith("__Secure-") ? "; Secure" : ""}`;

  return {
    async start(providerId, urls) {
      if (!opts.providers.some((p) => p.spec.id === providerId)) throw new OAuthStartError(`El proveedor "${providerId}" no está configurado.`);
      const res = await auth.api.signInSocial({
        body: { provider: providerId, callbackURL: urls.callbackURL, errorCallbackURL: urls.errorCallbackURL, disableRedirect: true },
        headers: new Headers(),
        asResponse: true,
      });
      if (!res.ok) throw new OAuthStartError(`No se pudo iniciar el acceso con ${providerId}: ${(await res.text()).slice(0, 300)}`);
      const { url } = (await res.json()) as { url?: string };
      if (!url) throw new OAuthStartError(`No se pudo iniciar el acceso con ${providerId}.`);
      return { location: url, cookies: res.headers.getSetCookie() };
    },
    async handle(request) {
      const ids: string[] = [];
      try {
        return await created.run(ids, () => auth.handler(request));
      } finally {
        if (ids.length) {
          const { internalAdapter } = await auth.$context;
          await Promise.all(ids.map((id) => internalAdapter.deleteUser(id).catch(() => undefined)));
        }
      }
    },
    async finish(cookieHeader) {
      const clearCookies = [...new Set(ownCookies(cookieHeader))].map(clear);
      const headers = new Headers(cookieHeader ? { cookie: cookieHeader } : {});
      const result = (await auth.api.forjaFinish({ headers }).catch(() => null)) as
        | { user: { email?: string | null; emailVerified?: boolean; name?: string | null; image?: string | null }; account: { providerId: string; accountId: string } | null }
        | null;
      const account = result?.account;
      if (!result?.user || !account) return { profile: null, clearCookies };
      const user = result.user;
      const email = asString(user.email);
      return {
        profile: {
          provider: account.providerId,
          accountId: String(account.accountId),
          email: email ? email.toLowerCase() : null,
          emailVerified: user.emailVerified === true,
          name: asString(user.name),
          image: asString(user.image),
        },
        clearCookies: [...new Set([...clearCookies.map(cookieName)])].map(clear),
      };
    },
  };
}

export class OAuthStartError extends Error {}

/** Safe same-site return path: a path on this app, never another host. */
export function safeReturnPath(raw: string | null | undefined, base: string): string {
  const fallback = `${base}/`;
  if (!raw || typeof raw !== "string" || raw.length > 2000) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\") || /[\r\n]/.test(raw)) return fallback;
  return base && !raw.startsWith(`${base}/`) && raw !== base ? `${base}${raw}` : raw;
}
