/**
 * Social and OAuth sign-in: the forja.auth.json contract.
 *
 * A project lists the identity providers its users can sign in with. Any provider that
 * Better Auth ships (Google, Facebook, GitHub, Apple, Microsoft…) is enabled by name; any
 * other OAuth 2.0 or OpenID Connect service is declared with its endpoints. Credentials
 * never live in the file: each provider names the project secrets that hold them
 * (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET by default).
 *
 *   {
 *     "version": 1,
 *     "providers": {
 *       "google": {},
 *       "facebook": {},
 *       "empresa": { "type": "oidc", "name": "Empresa", "discoveryUrl": "https://sso.empresa.com/.well-known/openid-configuration" },
 *       "strava": { "type": "oauth2", "authorizationUrl": "…", "tokenUrl": "…", "userInfoUrl": "…",
 *                   "profile": { "id": "id", "email": "email", "name": "firstname", "image": "profile" } }
 *     }
 *   }
 *
 * The studio's own sign-in uses the same shape, with the credentials written inline
 * (allowed only there, through parseOAuthConfig's inlineCredentials).
 */

export const AUTH_MANIFEST = "forja.auth.json";

/** Providers Better Auth implements (better-auth/social-providers socialProviderList). */
export const BUILTIN_OAUTH_PROVIDERS = [
  "apple", "atlassian", "cloudflare", "cognito", "discord", "facebook", "figma", "github", "microsoft", "google",
  "huggingface", "slack", "spotify", "twitch", "twitter", "dropbox", "kick", "linear", "linkedin", "gitlab",
  "tiktok", "reddit", "roblox", "salesforce", "vk", "zoom", "notion", "kakao", "naver", "line", "paybin",
  "paypal", "polar", "railway", "vercel", "wechat",
] as const;
export type BuiltinOAuthProvider = (typeof BUILTIN_OAUTH_PROVIDERS)[number];
const BUILTIN = new Set<string>(BUILTIN_OAUTH_PROVIDERS);
export const isBuiltinOAuthProvider = (id: string): id is BuiltinOAuthProvider => BUILTIN.has(id);

const LABELS: Record<string, string> = {
  apple: "Apple", atlassian: "Atlassian", cloudflare: "Cloudflare", cognito: "Amazon Cognito", discord: "Discord",
  facebook: "Facebook", figma: "Figma", github: "GitHub", microsoft: "Microsoft", google: "Google",
  huggingface: "Hugging Face", slack: "Slack", spotify: "Spotify", twitch: "Twitch", twitter: "X", dropbox: "Dropbox",
  kick: "Kick", linear: "Linear", linkedin: "LinkedIn", gitlab: "GitLab", tiktok: "TikTok", reddit: "Reddit",
  roblox: "Roblox", salesforce: "Salesforce", vk: "VK", zoom: "Zoom", notion: "Notion", kakao: "Kakao", naver: "Naver",
  line: "LINE", paybin: "Paybin", paypal: "PayPal", polar: "Polar", railway: "Railway", vercel: "Vercel", wechat: "WeChat",
};

/**
 * Providers that only hand out addresses their owners confirmed, even when they do not say
 * so in the profile (Facebook never sends email_verified). Only for these, or when the
 * provider marks the address verified, does a social sign-in join an existing account.
 */
const TRUSTED_EMAIL = new Set(["google", "apple", "microsoft", "facebook", "github", "gitlab"]);

export type OAuthProviderType = "builtin" | "oidc" | "oauth2";
export type OAuthOptionValue = string | number | boolean | string[];

/** Where to read each field of a generic OAuth 2.0 profile (dotted paths: "data.user.email"). */
export interface OAuthProfileMap {
  id: string;
  email: string;
  name: string;
  image: string;
  emailVerified?: string;
}

export interface OAuthProviderSpec {
  id: string;
  type: OAuthProviderType;
  /** Button label. */
  name: string;
  /** Project secret (or studio setting) names that hold the credentials. */
  clientIdSecret: string;
  /** null: a public client (PKCE without a secret); only generic providers. */
  clientSecretSecret: string | null;
  /** Studio only: credentials written inline. */
  clientId?: string;
  clientSecret?: string;
  scopes?: string[];
  /** Extra provider options passed to Better Auth as they are (tenantId, prompt, hd…). */
  options: Record<string, OAuthOptionValue>;
  /** Provider options whose value is read from a secret: { "clientKey": "TIKTOK_CLIENT_KEY" }. */
  secretOptions: Record<string, string>;
  /** Join an existing account with the same address even if the provider does not mark it verified. */
  trustEmail: boolean;
  /** Generic providers. */
  discoveryUrl?: string;
  authorizationUrl?: string;
  tokenUrl?: string;
  userInfoUrl?: string;
  pkce: boolean;
  authentication?: "basic" | "post";
  authorizationParams: Record<string, string>;
  profile?: OAuthProfileMap;
}

export interface OAuthConfig {
  version: 1;
  providers: OAuthProviderSpec[];
  /** Whether a first social sign-in creates the account (default true). */
  signUp: boolean;
}

export class OAuthConfigError extends Error {
  constructor(message: string, readonly file = AUTH_MANIFEST) {
    super(`${file}: ${message}`);
  }
}

const PROVIDER_ID = /^[a-z][a-z0-9-]{0,39}$/;
const SECRET = /^[A-Z][A-Z0-9_]{1,63}$/;
const OPTION_KEY = /^[A-Za-z][A-Za-z0-9_]{0,63}$/;
const PROFILE_PATH = /^[A-Za-z0-9_$-]+(?:\.[A-Za-z0-9_$-]+)*$/;
const MAX_PROVIDERS = 30;
/** Options Forja owns: set through the spec's own fields, never through "options". */
const RESERVED_OPTIONS = new Set(["clientId", "clientSecret", "redirectURI", "scope", "scopes", "providerId", "getUserInfo", "mapProfileToUser"]);

export const defaultSecretPrefix = (id: string) => id.toUpperCase().replace(/-/g, "_");
export const oauthProviderLabel = (id: string) => LABELS[id] ?? id.charAt(0).toUpperCase() + id.slice(1);

const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

function httpsUrl(value: unknown, field: string, id: string): string {
  if (typeof value !== "string") throw new OAuthConfigError(`providers.${id}.${field} debe ser una URL`);
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new OAuthConfigError(`providers.${id}.${field} no es una URL válida`);
  }
  // Plain http only for local test servers.
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname.endsWith(".localhost");
  if (url.protocol !== "https:" && !(url.protocol === "http:" && local)) {
    throw new OAuthConfigError(`providers.${id}.${field} debe usar https`);
  }
  return url.toString();
}

function stringList(value: unknown, field: string, id: string): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some((s) => typeof s !== "string" || !s.trim() || s.length > 200) || value.length > 30) {
    throw new OAuthConfigError(`providers.${id}.${field} debe ser una lista de textos`);
  }
  return value.map((s: string) => s.trim());
}

function secretName(value: unknown, field: string, id: string, fallback: string): string {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !SECRET.test(value)) {
    throw new OAuthConfigError(`providers.${id}.${field} debe ser un nombre de secreto en MAYÚSCULAS_CON_GUIONES`);
  }
  return value;
}

function parseProvider(id: string, raw: unknown, inlineCredentials: boolean): OAuthProviderSpec {
  if (!PROVIDER_ID.test(id)) throw new OAuthConfigError(`"${id}" no es un id de proveedor válido (minúsculas, números y guiones)`);
  if (!isRecord(raw)) throw new OAuthConfigError(`providers.${id} debe ser un objeto`);
  const known = new Set([
    "type", "name", "clientIdSecret", "clientSecretSecret", "public", "clientId", "clientSecret", "scopes", "options", "secretOptions",
    "trustEmail", "discoveryUrl", "authorizationUrl", "tokenUrl", "userInfoUrl", "pkce", "authentication", "authorizationParams", "profile",
  ]);
  for (const key of Object.keys(raw)) if (!known.has(key)) throw new OAuthConfigError(`providers.${id}: campo desconocido "${key}"`);

  const type = raw.type === undefined ? (isBuiltinOAuthProvider(id) ? "builtin" : undefined) : raw.type;
  if (type === undefined) {
    throw new OAuthConfigError(`providers.${id}: "${id}" no es un proveedor integrado; declara "type": "oidc" (con discoveryUrl) o "oauth2" (con sus URLs)`);
  }
  if (type !== "builtin" && type !== "oidc" && type !== "oauth2") throw new OAuthConfigError(`providers.${id}.type debe ser "oidc" u "oauth2"`);
  if (type === "builtin" && !isBuiltinOAuthProvider(id)) throw new OAuthConfigError(`providers.${id}: no hay un proveedor integrado con ese nombre`);

  if (!inlineCredentials && (raw.clientId !== undefined || raw.clientSecret !== undefined)) {
    throw new OAuthConfigError(`providers.${id}: las credenciales no van en el archivo; guárdalas como secretos y nómbralas con clientIdSecret / clientSecretSecret`);
  }
  if (raw.name !== undefined && (typeof raw.name !== "string" || !raw.name.trim() || raw.name.length > 60)) {
    throw new OAuthConfigError(`providers.${id}.name debe ser un texto corto`);
  }
  const isPublic = raw.public === true;
  if (raw.public !== undefined && typeof raw.public !== "boolean") throw new OAuthConfigError(`providers.${id}.public debe ser true o false`);
  if (isPublic && type === "builtin") throw new OAuthConfigError(`providers.${id}.public solo aplica a proveedores oidc u oauth2`);

  const prefix = defaultSecretPrefix(id);
  const spec: OAuthProviderSpec = {
    id,
    type,
    name: typeof raw.name === "string" ? raw.name.trim() : oauthProviderLabel(id),
    clientIdSecret: secretName(raw.clientIdSecret, "clientIdSecret", id, `${prefix}_CLIENT_ID`),
    clientSecretSecret: isPublic ? null : secretName(raw.clientSecretSecret, "clientSecretSecret", id, `${prefix}_CLIENT_SECRET`),
    scopes: stringList(raw.scopes, "scopes", id),
    options: {},
    secretOptions: {},
    trustEmail: raw.trustEmail === undefined ? TRUSTED_EMAIL.has(id) && type === "builtin" : raw.trustEmail === true,
    pkce: raw.pkce === undefined ? true : raw.pkce === true,
    authorizationParams: {},
  };
  if (raw.trustEmail !== undefined && typeof raw.trustEmail !== "boolean") throw new OAuthConfigError(`providers.${id}.trustEmail debe ser true o false`);
  if (raw.pkce !== undefined && typeof raw.pkce !== "boolean") throw new OAuthConfigError(`providers.${id}.pkce debe ser true o false`);
  if (inlineCredentials) {
    for (const field of ["clientId", "clientSecret"] as const) {
      const value = raw[field];
      if (value === undefined) continue;
      if (typeof value !== "string" || !value.trim()) throw new OAuthConfigError(`providers.${id}.${field} debe ser un texto`);
      spec[field] = value.trim();
    }
  }

  if (raw.options !== undefined) {
    if (!isRecord(raw.options)) throw new OAuthConfigError(`providers.${id}.options debe ser un objeto`);
    for (const [key, value] of Object.entries(raw.options)) {
      if (!OPTION_KEY.test(key) || RESERVED_OPTIONS.has(key)) throw new OAuthConfigError(`providers.${id}.options.${key} no está permitido`);
      const ok = typeof value === "string" || typeof value === "number" || typeof value === "boolean"
        || (Array.isArray(value) && value.every((v) => typeof v === "string"));
      if (!ok) throw new OAuthConfigError(`providers.${id}.options.${key} debe ser texto, número, booleano o lista de textos`);
      spec.options[key] = value as OAuthOptionValue;
    }
  }
  if (raw.secretOptions !== undefined) {
    if (!isRecord(raw.secretOptions)) throw new OAuthConfigError(`providers.${id}.secretOptions debe ser un objeto`);
    for (const [key, value] of Object.entries(raw.secretOptions)) {
      if (!OPTION_KEY.test(key) || RESERVED_OPTIONS.has(key)) throw new OAuthConfigError(`providers.${id}.secretOptions.${key} no está permitido`);
      spec.secretOptions[key] = secretName(value, `secretOptions.${key}`, id, "");
      if (Object.hasOwn(spec.options, key)) throw new OAuthConfigError(`providers.${id}: ${key} está en options y en secretOptions`);
    }
  }

  const genericOnly = ["discoveryUrl", "authorizationUrl", "tokenUrl", "userInfoUrl", "authentication", "authorizationParams", "profile"] as const;
  if (type === "builtin") {
    for (const field of genericOnly) if (raw[field] !== undefined) throw new OAuthConfigError(`providers.${id}.${field} solo aplica a proveedores oidc u oauth2`);
    return spec;
  }

  if (raw.authentication !== undefined) {
    if (raw.authentication !== "basic" && raw.authentication !== "post") throw new OAuthConfigError(`providers.${id}.authentication debe ser "basic" o "post"`);
    if (raw.authentication === "basic" && isPublic) throw new OAuthConfigError(`providers.${id}: authentication "basic" necesita un client secret`);
    spec.authentication = raw.authentication;
  }
  if (raw.authorizationParams !== undefined) {
    if (!isRecord(raw.authorizationParams)) throw new OAuthConfigError(`providers.${id}.authorizationParams debe ser un objeto`);
    for (const [key, value] of Object.entries(raw.authorizationParams)) {
      if (typeof value !== "string" || !OPTION_KEY.test(key)) throw new OAuthConfigError(`providers.${id}.authorizationParams.${key} debe ser texto`);
      spec.authorizationParams[key] = value;
    }
  }
  if (type === "oidc") {
    spec.discoveryUrl = httpsUrl(raw.discoveryUrl, "discoveryUrl", id);
    for (const field of ["authorizationUrl", "tokenUrl", "userInfoUrl"] as const) {
      if (raw[field] !== undefined) spec[field] = httpsUrl(raw[field], field, id);
    }
    spec.scopes ??= ["openid", "email", "profile"];
  } else {
    if (raw.discoveryUrl !== undefined) throw new OAuthConfigError(`providers.${id}: discoveryUrl es de "oidc"; con "oauth2" declara authorizationUrl, tokenUrl y userInfoUrl`);
    spec.authorizationUrl = httpsUrl(raw.authorizationUrl, "authorizationUrl", id);
    spec.tokenUrl = httpsUrl(raw.tokenUrl, "tokenUrl", id);
    spec.userInfoUrl = httpsUrl(raw.userInfoUrl, "userInfoUrl", id);
  }
  if (raw.profile !== undefined) {
    if (!isRecord(raw.profile)) throw new OAuthConfigError(`providers.${id}.profile debe ser un objeto`);
    for (const key of Object.keys(raw.profile)) {
      if (!["id", "email", "name", "image", "emailVerified"].includes(key)) throw new OAuthConfigError(`providers.${id}.profile: campo desconocido "${key}"`);
      const value = raw.profile[key];
      if (typeof value !== "string" || !PROFILE_PATH.test(value)) throw new OAuthConfigError(`providers.${id}.profile.${key} debe ser una ruta como "email" o "data.user.email"`);
    }
  }
  const p = isRecord(raw.profile) ? (raw.profile as Record<string, string>) : {};
  spec.profile = {
    id: p.id ?? (type === "oidc" ? "sub" : "id"),
    email: p.email ?? "email",
    name: p.name ?? "name",
    image: p.image ?? (type === "oidc" ? "picture" : "avatar_url"),
    ...(p.emailVerified ? { emailVerified: p.emailVerified } : type === "oidc" ? { emailVerified: "email_verified" } : {}),
  };
  return spec;
}

/** Parses forja.auth.json (or the studio's provider setting). An absent or empty source means no providers. */
export function parseOAuthConfig(source: string | undefined | null, opts: { inlineCredentials?: boolean; file?: string } = {}): OAuthConfig {
  const file = opts.file ?? AUTH_MANIFEST;
  if (source === undefined || source === null || !source.trim()) return { version: 1, providers: [], signUp: true };
  let raw: unknown;
  try {
    raw = JSON.parse(source);
  } catch (e) {
    throw new OAuthConfigError(`no es JSON válido (${(e as Error).message})`, file);
  }
  try {
    if (!isRecord(raw)) throw new OAuthConfigError("debe ser un objeto");
    for (const key of Object.keys(raw)) if (!["version", "providers", "signUp", "$schema"].includes(key)) throw new OAuthConfigError(`campo desconocido "${key}"`);
    if (raw.version !== undefined && raw.version !== 1) throw new OAuthConfigError("version debe ser 1");
    if (raw.signUp !== undefined && typeof raw.signUp !== "boolean") throw new OAuthConfigError("signUp debe ser true o false");
    const providers = raw.providers ?? {};
    if (!isRecord(providers)) throw new OAuthConfigError('providers debe ser un objeto { "google": {}, … }');
    const entries = Object.entries(providers);
    if (entries.length > MAX_PROVIDERS) throw new OAuthConfigError(`como máximo ${MAX_PROVIDERS} proveedores`);
    return { version: 1, providers: entries.map(([id, spec]) => parseProvider(id, spec, !!opts.inlineCredentials)), signUp: raw.signUp !== false };
  } catch (e) {
    if (e instanceof OAuthConfigError && file !== AUTH_MANIFEST) throw new OAuthConfigError(e.message.slice(AUTH_MANIFEST.length + 2), file);
    throw e;
  }
}

/** The config, or null with the error when it does not parse (for builds and the studio's checks). */
export function safeOAuthConfig(source: string | undefined | null): { config: OAuthConfig; error?: string } {
  try {
    return { config: parseOAuthConfig(source) };
  } catch (e) {
    return { config: { version: 1, providers: [], signUp: true }, error: (e as Error).message };
  }
}

/** Every secret a provider reads: client id, client secret and secret options. */
export function oauthSecretNames(spec: OAuthProviderSpec): string[] {
  return [spec.clientIdSecret, ...(spec.clientSecretSecret ? [spec.clientSecretSecret] : []), ...Object.values(spec.secretOptions)];
}

/** Whether a social sign-in may join an existing account that has the same address. */
export function mayLinkByEmail(spec: Pick<OAuthProviderSpec, "trustEmail">, emailVerified: boolean): boolean {
  return emailVerified || spec.trustEmail;
}

/** Reads a dotted path from a provider profile. */
export function profileValue(profile: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (isRecord(o) ? o[k] : undefined), profile);
}

/** Paths under the app's base where providers send users back (to register with each provider). */
export const OAUTH_BASE_PATH = "/_baas/auth/oauth";
export const oauthCallbackPath = (providerId: string) => `${OAUTH_BASE_PATH}/callback/${providerId}`;
