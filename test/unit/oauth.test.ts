import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { socialProviderList } from "better-auth/social-providers";
import {
  BUILTIN_OAUTH_PROVIDERS,
  mayLinkByEmail,
  oauthSecretNames,
  parseOAuthConfig,
} from "../../contracts/oauthProviders.js";
import { oauthEngine, oauthSecret, resolveOAuthProviders, safeReturnPath } from "../../server/shared/oauth.js";
import { assertOwnerRequestedOAuthSetup } from "../../server/modules/builder/domain/OwnerActionPolicy.js";
// @ts-expect-error plain JS test helper
import { cookieJar, startFakeOAuth } from "../fakeOAuth.mjs";

describe("forja.auth.json", () => {
  it("lists exactly the providers Better Auth ships", () => {
    expect([...BUILTIN_OAUTH_PROVIDERS].sort()).toEqual([...socialProviderList].sort());
  });

  it("enables built-in providers by name, with secrets named after them", () => {
    const config = parseOAuthConfig(JSON.stringify({ version: 1, providers: { google: {}, facebook: { scopes: ["email"] }, "azure-ad": { type: "oidc", discoveryUrl: "https://login.example.com/.well-known/openid-configuration" } } }));
    const [google, facebook, azure] = config.providers;
    expect(google).toMatchObject({ id: "google", type: "builtin", name: "Google", clientIdSecret: "GOOGLE_CLIENT_ID", clientSecretSecret: "GOOGLE_CLIENT_SECRET", trustEmail: true });
    expect(facebook).toMatchObject({ name: "Facebook", scopes: ["email"], trustEmail: true });
    expect(azure).toMatchObject({ type: "oidc", clientIdSecret: "AZURE_AD_CLIENT_ID", scopes: ["openid", "email", "profile"], trustEmail: false });
    expect(azure!.profile).toEqual({ id: "sub", email: "email", name: "name", image: "picture", emailVerified: "email_verified" });
    expect(config.signUp).toBe(true);
  });

  it("declares any OAuth 2.0 service with its endpoints, profile paths and secret options", () => {
    const [p] = parseOAuthConfig(JSON.stringify({
      providers: {
        strava: {
          type: "oauth2", name: "Strava", authorizationUrl: "https://www.strava.com/oauth/authorize", tokenUrl: "https://www.strava.com/oauth/token",
          userInfoUrl: "https://www.strava.com/api/v3/athlete", scopes: ["read"], pkce: false, authentication: "post",
          profile: { id: "id", email: "contact.email", name: "firstname", image: "profile" },
          clientIdSecret: "STRAVA_ID", secretOptions: { audience: "STRAVA_AUDIENCE" }, options: { prompt: "consent" },
        },
      },
    })).providers;
    expect(p).toMatchObject({ type: "oauth2", name: "Strava", pkce: false, clientIdSecret: "STRAVA_ID", clientSecretSecret: "STRAVA_CLIENT_SECRET" });
    expect(p!.profile).toEqual({ id: "id", email: "contact.email", name: "firstname", image: "profile" });
    expect(oauthSecretNames(p!)).toEqual(["STRAVA_ID", "STRAVA_CLIENT_SECRET", "STRAVA_AUDIENCE"]);
  });

  it("rejects credentials in the file, unknown providers, insecure URLs and reserved options", () => {
    const bad = (providers: unknown) => () => parseOAuthConfig(JSON.stringify({ providers }));
    expect(bad({ google: { clientId: "x" } })).toThrow(/las credenciales no van en el archivo/);
    expect(bad({ myidp: {} })).toThrow(/no es un proveedor integrado/);
    expect(bad({ myidp: { type: "oidc", discoveryUrl: "http://sso.example.com/x" } })).toThrow(/https/);
    expect(bad({ google: { options: { clientSecret: "x" } } })).toThrow(/no está permitido/);
    expect(bad({ google: { discoveryUrl: "https://x.example.com" } })).toThrow(/solo aplica/);
    expect(bad({ Google: {} })).toThrow(/id de proveedor/);
    expect(() => parseOAuthConfig("{")).toThrow(/forja\.auth\.json: no es JSON/);
    expect(parseOAuthConfig(undefined).providers).toEqual([]);
    // The studio's setting may carry the credentials inline.
    expect(parseOAuthConfig(JSON.stringify({ providers: { google: { clientId: "a", clientSecret: "b" } } }), { inlineCredentials: true }).providers[0]).toMatchObject({ clientId: "a", clientSecret: "b" });
  });

  it("joins an existing account only for verified addresses or providers that verify them", () => {
    expect(mayLinkByEmail({ trustEmail: false }, false)).toBe(false);
    expect(mayLinkByEmail({ trustEmail: false }, true)).toBe(true);
    expect(mayLinkByEmail({ trustEmail: true }, false)).toBe(true);
  });

  it("reports providers whose secrets are missing instead of using them", () => {
    const config = parseOAuthConfig(JSON.stringify({ providers: { google: {}, github: {} } }));
    const { ready, missing } = resolveOAuthProviders(config, { GOOGLE_CLIENT_ID: "id", GOOGLE_CLIENT_SECRET: "s", GITHUB_CLIENT_ID: "x" });
    expect(ready.map((p) => p.spec.id)).toEqual(["google"]);
    expect(missing).toEqual([{ id: "github", name: "GitHub", secrets: ["GITHUB_CLIENT_SECRET"] }]);
  });

  it("only returns to paths on the same app", () => {
    expect(safeReturnPath("/panel?x=1", "")).toBe("/panel?x=1");
    expect(safeReturnPath("//evil.com", "")).toBe("/");
    expect(safeReturnPath("https://evil.com", "")).toBe("/");
    expect(safeReturnPath("/panel", "/p/abc")).toBe("/p/abc/panel");
    expect(safeReturnPath("/p/abc/panel", "/p/abc")).toBe("/p/abc/panel");
  });
});

describe("setup_oauth needs the owner to ask for it", () => {
  it("accepts a provider, social networks, SSO or OAuth, and refuses otherwise", () => {
    for (const ok of ["Agrega inicio de sesión con Google y Facebook", "que los usuarios inicien sesión con redes sociales", "Add GitHub login", "conecta el SSO de la empresa (Keycloak)", "usa OAuth2 de Strava"]) {
      expect(() => assertOwnerRequestedOAuthSetup(ok)).not.toThrow();
    }
    for (const no of ["Haz una lista de tareas", "no quiero login con Google", undefined]) {
      expect(() => assertOwnerRequestedOAuthSetup(no)).toThrow(/requiere que el dueño lo pida/);
    }
  });
});

describe("Better Auth OAuth engine", () => {
  let idp: Awaited<ReturnType<typeof startFakeOAuth>>;
  beforeAll(async () => { idp = await startFakeOAuth(); });
  afterAll(async () => { await idp.close(); });

  async function signIn(spec: Record<string, unknown>, providerId: string, others: Record<string, Record<string, unknown>> = {}) {
    const all = Object.fromEntries(Object.entries({ ...others, [providerId]: spec }).sort(([a], [b]) => a.localeCompare(b)));
    const config = parseOAuthConfig(JSON.stringify({ providers: all }));
    const secrets = Object.fromEntries(Object.keys(all).flatMap((id) => {
      const prefix = id.toUpperCase().replace(/-/g, "_");
      return [[`${prefix}_CLIENT_ID`, idp.clientId], [`${prefix}_CLIENT_SECRET`, idp.clientSecret]];
    }));
    const { ready } = resolveOAuthProviders(config, secrets);
    const engine = oauthEngine({
      secret: oauthSecret("k".repeat(64), "test"),
      origin: "http://app.localhost",
      basePath: "/_baas/auth/oauth",
      cookiePrefix: "forja_oa_test",
      providers: ready,
    });
    const jar = cookieJar();
    const start = await engine.start(providerId, { callbackURL: "/_baas/auth/oauth/complete", errorCallbackURL: "/_baas/auth/oauth/complete?failed=1" });
    for (const c of start.cookies) jar.take(new Response(null, { headers: [["set-cookie", c]] }));
    const atProvider = await fetch(start.location, { redirect: "manual" });
    const callback = atProvider.headers.get("location")!;
    expect(callback).toContain(`http://app.localhost/_baas/auth/oauth/callback/${providerId}?code=`);
    const back = await engine.handle(new Request(callback, { headers: { cookie: jar.header() } }));
    jar.take(back);
    expect(back.status).toBe(302);
    return { location: back.headers.get("location"), ...(await engine.finish(jar.header())) };
  }

  it("signs in with an OpenID Connect provider found by discovery, with PKCE", async () => {
    idp.state.profile = { sub: "oidc-7", email: "Ana@Example.com", email_verified: true, name: "Ana", picture: "https://img.example/a.png" };
    const r = await signIn({ type: "oidc", discoveryUrl: idp.discoveryUrl }, "empresa");
    expect(r.location).toBe("/_baas/auth/oauth/complete");
    expect(r.profile).toEqual({ provider: "empresa", accountId: "oidc-7", email: "ana@example.com", emailVerified: true, name: "Ana", image: "https://img.example/a.png" });
    expect(r.clearCookies.length).toBeGreaterThan(0);
    expect(r.clearCookies.every((c) => c.includes("Max-Age=0"))).toBe(true);
  });

  it("maps any OAuth 2.0 profile shape through the configured paths", async () => {
    idp.state.profile = { id: 991, contact: { email: "luis@example.com" }, firstname: "Luis", profile: "https://img.example/l.png" };
    const r = await signIn({
      type: "oauth2", authorizationUrl: idp.authorizationUrl, tokenUrl: idp.tokenUrl, userInfoUrl: idp.userInfoUrl,
      profile: { id: "id", email: "contact.email", name: "firstname", image: "profile" },
    }, "strava");
    expect(r.profile).toEqual({ provider: "strava", accountId: "991", email: "luis@example.com", emailVerified: false, name: "Luis", image: "https://img.example/l.png" });
  });

  it("keeps nothing between sign-ins: a later provider's claim about the same address is its own", async () => {
    idp.state.profile = { sub: "same-1", email: "same@example.com", email_verified: true, name: "Verificada" };
    const uno = { type: "oidc", discoveryUrl: idp.discoveryUrl };
    const dos = { type: "oauth2", authorizationUrl: idp.authorizationUrl, tokenUrl: idp.tokenUrl, userInfoUrl: idp.userInfoUrl };
    // Same engine (same configuration) for both sign-ins.
    const first = await signIn(uno, "uno", { dos });
    expect(first.profile).toMatchObject({ provider: "uno", emailVerified: true });
    idp.state.profile = { id: "same-2", email: "same@example.com", name: "Sin verificar" };
    const second = await signIn(dos, "dos", { uno });
    expect(second.profile).toEqual({ provider: "dos", accountId: "same-2", email: "same@example.com", emailVerified: false, name: "Sin verificar", image: null });
  });

  it("sends a failed sign-in to the error URL without a profile", async () => {
    idp.state.profile = { name: "Sin id" };
    const r = await signIn({ type: "oauth2", authorizationUrl: idp.authorizationUrl, tokenUrl: idp.tokenUrl, userInfoUrl: idp.userInfoUrl }, "noid");
    expect(r.location).toContain("/_baas/auth/oauth/complete?failed=1");
    expect(r.profile).toBeNull();
  });

  it("builds the authorization URL of built-in providers like Google and Facebook", async () => {
    const config = parseOAuthConfig(JSON.stringify({ providers: { google: {}, facebook: {} } }));
    const { ready } = resolveOAuthProviders(config, { GOOGLE_CLIENT_ID: "g-id", GOOGLE_CLIENT_SECRET: "g-s", FACEBOOK_CLIENT_ID: "f-id", FACEBOOK_CLIENT_SECRET: "f-s" });
    const engine = oauthEngine({ secret: oauthSecret("k".repeat(64), "b"), origin: "https://mi-app.example.com", basePath: "/_baas/auth/oauth", cookiePrefix: "forja_oa_b", providers: ready });
    const google = new URL((await engine.start("google", { callbackURL: "/x", errorCallbackURL: "/y" })).location);
    expect(google.origin).toBe("https://accounts.google.com");
    expect(google.searchParams.get("client_id")).toBe("g-id");
    expect(google.searchParams.get("redirect_uri")).toBe("https://mi-app.example.com/_baas/auth/oauth/callback/google");
    const facebook = new URL((await engine.start("facebook", { callbackURL: "/x", errorCallbackURL: "/y" })).location);
    expect(facebook.hostname).toContain("facebook.com");
    expect(facebook.searchParams.get("redirect_uri")).toBe("https://mi-app.example.com/_baas/auth/oauth/callback/facebook");
    await expect(engine.start("github", { callbackURL: "/x", errorCallbackURL: "/y" })).rejects.toThrow(/no está configurado/);
  });
});
