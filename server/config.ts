import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

export const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Empty counts as unset: a compose file passes `VAR=` for every variable it lists, and
 * `PORT=""` must mean "default", not port 0.
 */
const env = new Proxy(process.env, { get: (t, k) => (typeof k === "string" && t[k] !== "" ? t[k] : undefined) });

/**
 * The studio's public origin, from the first of: PUBLIC_URL; Coolify's generated service URL;
 * COOLIFY_URL; https://FORJA_DOMAIN, the domain the proxy routes apps and the studio under; and
 * only then localhost. In production, a public candidate wins over a leftover localhost value.
 * Behind a trusted proxy, a port equal to our own PORT is the container port the proxy routes to
 * (Coolify writes https://host:4100), not the one browsers use: it is dropped, or no browser
 * Origin would ever match it.
 */
export function resolvePublicUrl(vars: Record<string, string | undefined>): string {
  const get = (k: string) => (vars[k] ? vars[k] : undefined);
  const port = get("PORT") ?? "4100";
  const domain = get("FORJA_DOMAIN")?.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const publicUrl = get("PUBLIC_URL");
  if (publicUrl) {
    try {
      new URL(publicUrl);
    } catch {
      throw new Error(`PUBLIC_URL no es una URL válida: ${publicUrl}`);
    }
  }
  const absolute = (value: string | undefined) =>
    value && /^https?:\/\//i.test(value) ? value.split(",", 1)[0]!.trim() : undefined;
  const candidates = [
    publicUrl,
    absolute(get("SERVICE_URL_FORJA_4100")),
    absolute(get("SERVICE_URL_FORJA")),
    absolute(get("COOLIFY_URL")),
    domain ? `https://${domain}` : undefined,
  ].filter((value): value is string => Boolean(value));
  const isLoopback = (value: string) => /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(value);
  const raw =
    get("NODE_ENV") === "production" ? candidates.find((value) => !isLoopback(value)) ?? candidates[0] : candidates[0];
  if (!raw) return `http://localhost:${port}`;
  try {
    const url = new URL(raw);
    const behindProxy = Number(get("FORJA_TRUST_PROXY") ?? 0) > 0;
    if (behindProxy && url.port === port) url.port = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    throw new Error(`PUBLIC_URL no es una URL válida: ${raw}`);
  }
}

/**
 * Platform defaults when FORJA_MODELS_ALLOW is empty: Sonnet and Haiku, every model of
 * self-declared OpenAI-compatible providers, and a curated, cheap-to-strong spread from
 * OpenRouter. Opus is declared but only used when explicitly allowed.
 */
export const DEFAULT_MODELS_ALLOW = [
  "anthropic:claude-sonnet-5-5",
  "anthropic:claude-haiku-5-5",
  "openai:*",
  "custom:*",
  "openrouter:anthropic/claude-sonnet*",
  "openrouter:anthropic/claude-haiku*",
  "openrouter:google/gemini-*",
  "openrouter:openai/gpt-*",
  "openrouter:deepseek/*",
  "openrouter:qwen/*",
  "openrouter:mistralai/*",
  "openrouter:meta-llama/*",
  "openrouter:moonshotai/*",
  "openrouter:z-ai/*",
];

/**
 * Two kinds of configuration live here:
 *  - Start-up settings, read from the environment once: what the process needs before it can
 *    reach its database (port, URLs, DATABASE_URL, SECRETS_KEY…).
 *  - Platform settings, whose values below are only the defaults. An admin changes them in the
 *    studio (server/settings): they are stored in the database and written onto this same
 *    object, so code that reads `config.x` at call time always sees the current value.
 */
export const config = {
  port: Number(env.PORT ?? 4100),
  publicUrl: resolvePublicUrl(process.env),
  dataDir: path.resolve(ROOT_DIR, env.DATA_DIR ?? "data"),
  /** The platform database (Postgres). Project app databases stay in PGlite under dataDir. */
  databaseUrl: env.DATABASE_URL ?? "",
  secretsKey: env.SECRETS_KEY ?? "",
  /**
   * Reverse proxies in front of Forja (Traefik in Coolify, nginx…). With N > 0 the client IP is
   * the N-th address from the right of X-Forwarded-For, the one the outermost trusted proxy
   * appended; without it, rate limits would see every user as the proxy. 0 = direct exposure.
   */
  trustProxy: Math.max(0, Math.floor(Number(env.FORJA_TRUST_PROXY ?? 0)) || 0),
  /**
   * First-run setup. While there are no accounts, the server only accepts POST /api/auth/setup with this
   * token. Unset, a random one is generated at startup and printed to the log.
   */
  bootstrapToken: env.FORJA_BOOTSTRAP_TOKEN ?? "",
  /** Optional seed file (settings, providers, models) applied at start-up; see server/db/seeds/local.ts. */
  seedFile: env.FORJA_SEED_FILE === undefined ? path.join(ROOT_DIR, "seed.local.json") : env.FORJA_SEED_FILE,
  // --- Platform settings (defaults; see server/settings/registry.ts) ---
  /** Who may create an account: "open" (anyone, by email code), "invite" (only invited emails), "closed" (admins add people). */
  signup: "open" as "open" | "invite" | "closed",
  /** 1 credit = $0.001 of model usage. */
  creditsPerUsd: 1000,
  freeCredits: 3000,
  smtpUrl: "",
  emailFrom: "noreply@forja.local",
  stripeKey: "",
  models: {
    /** Platform whitelist: globs over "provider:model" ids. Each account and project can narrow it. */
    allow: [...DEFAULT_MODELS_ALLOW],
  },
  github: {
    /** REST API base (GitHub Enterprise: https://host/api/v3). */
    apiUrl: "https://api.github.com",
    /** Optional OAuth app for "Conectar con GitHub"; without it, accounts connect with a personal access token. */
    clientId: "",
    clientSecret: "",
    webUrl: "https://github.com",
    /** Verifies push webhooks (POST /api/github/webhook); without it, linked repos are polled. */
    webhookSecret: "",
    pollMs: 60_000,
  },
  npm: {
    /** Registry the builder resolves and installs project packages from. */
    registry: "https://registry.npmjs.org",
    /** Off: apps get only react, react-dom and zod. */
    enabled: true,
  },
  browser: {
    /** browser_test (the builder's headless Chromium against the preview). FORJA_BROWSER=0 (an image without Chromium) forces it off. */
    enabled: true,
    /** A Chrome/Chromium binary to use instead of Playwright's own download. Depends on the image: stays in the environment. */
    executablePath: env.FORJA_CHROMIUM ?? "",
  },
  /** Optional agent tracing to Langfuse (cloud or self-hosted). Off unless both keys are set. */
  langfuse: {
    publicKey: "",
    secretKey: "",
    baseUrl: "https://cloud.langfuse.com",
  },
  /**
   * Quality evals (server/evals): run the builder on a fixed set of requests, in throwaway
   * projects, and score the result. Off by default: it spends real model credit.
   * The limits are platform settings; the evals page can ask for less, never for more.
   */
  evals: {
    enabled: false,
    /** Most one run may spend, in USD (model calls of the builder and the judge). */
    maxRunUsd: 5,
    /** Most all runs together may spend in a rolling 24 hours. */
    maxDailyUsd: 20,
    /** Cases building at the same time (each one is a full builder turn plus a headless browser). */
    concurrency: 2,
  },
  /** A project database closes after this long without queries ("sleeps"). */
  dbIdleMs: 60_000,
  /** Longest a single endpoint call or job run may take. */
  maxRunMs: 15 * 60_000,
};

/** The platform settings' defaults, before anything from the database is applied. */
export const CONFIG_DEFAULTS: Readonly<typeof config> = structuredClone(config);

/** False when the image was built without Chromium (FORJA_BROWSER=0): no setting can turn it on. */
export const browserAvailable = env.FORJA_BROWSER !== "0";

if (config.secretsKey && !/^[0-9a-f]{64}$/i.test(config.secretsKey)) {
  // AES-256-GCM needs exactly 32 bytes; a wrong key would only fail at the first encrypt.
  throw new Error("SECRETS_KEY debe ser de 64 caracteres hexadecimales (32 bytes): openssl rand -hex 32");
}
if (!config.secretsKey) {
  // Dev fallback: secrets stay readable only for this process lifetime.
  config.secretsKey = randomBytes(32).toString("hex");
  console.warn("[forja] SECRETS_KEY no está definido; los secretos guardados no sobrevivirán un reinicio.");
}

export const paths = {
  projectDb: (projectId: string) => path.join(config.dataDir, "projects", projectId, "db"),
  projectStorage: (projectId: string) => path.join(config.dataDir, "projects", projectId, "storage"),
  // Compiled endpoints import npm packages by name, so they must live where Node resolves
  // Forja's node_modules — not under DATA_DIR, which may be anywhere.
  bundleCache: path.join(ROOT_DIR, "node_modules", ".cache", "forja-endpoints"),
  // Installed project packages, one folder per dependency set; inside node_modules so the
  // endpoint sandbox (which may read only node_modules) can load them.
  projectDeps: path.join(ROOT_DIR, "node_modules", ".forja-deps"),
};
