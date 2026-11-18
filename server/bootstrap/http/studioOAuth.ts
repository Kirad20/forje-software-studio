import { config } from "../../shared/config.js";
import { oauthEngine, oauthSecret, resolveOAuthProviders } from "../../shared/oauth.js";
import { parseOAuthConfig, type OAuthConfig } from "../../../contracts/oauthProviders.js";

/** Where Better Auth answers for the studio: <public URL>/api/auth/oauth/callback/<provider>. */
export const STUDIO_OAUTH_BASE = "/api/auth/oauth";

/**
 * The studio's providers: Google and Facebook from their settings, plus any other provider
 * from the "auth.providers" setting (forja.auth.json shape, credentials inline). A broken
 * setting is reported in the log and ignored, so the other ways in keep working.
 */
export function studioOAuthConfig(): OAuthConfig {
  let extra: OAuthConfig = { version: 1, providers: [], signUp: true };
  try {
    extra = parseOAuthConfig(config.auth.providers, { inlineCredentials: true, file: "auth.providers" });
  } catch (error) {
    console.warn(`[forja] ${(error as Error).message}`);
  }
  const named = (["google", "facebook"] as const).filter((id) => config.auth[id].clientId && config.auth[id].clientSecret);
  const fromSettings = named.length
    ? parseOAuthConfig(JSON.stringify({ providers: Object.fromEntries(named.map((id) => [id, { clientId: config.auth[id].clientId, clientSecret: config.auth[id].clientSecret }])) }), { inlineCredentials: true })
    : extra;
  const providers = [...(named.length ? fromSettings.providers : []), ...extra.providers.filter((p) => !named.includes(p.id as "google" | "facebook"))];
  return { version: 1, providers, signUp: extra.signUp };
}

export function studioOAuth() {
  const oauth = studioOAuthConfig();
  const { ready, missing } = resolveOAuthProviders(oauth, {});
  for (const m of missing) console.warn(`[forja] OAuth: al proveedor ${m.id} le faltan las credenciales (clientId/clientSecret).`);
  return {
    oauth,
    ready,
    engine: oauthEngine({
      secret: oauthSecret(config.secretsKey, "studio"),
      origin: new URL(config.publicUrl).origin,
      basePath: STUDIO_OAUTH_BASE,
      cookiePrefix: "forja_oa_studio",
      providers: ready,
      onError: (message) => console.warn(`[forja] OAuth: ${message}`),
    }),
  };
}
