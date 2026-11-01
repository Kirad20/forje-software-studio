import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

export const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const env = process.env;

export const config = {
  port: Number(env.PORT ?? 4100),
  publicUrl: (env.PUBLIC_URL ?? `http://localhost:${env.PORT ?? 4100}`).replace(/\/$/, ""),
  dataDir: path.resolve(ROOT_DIR, env.DATA_DIR ?? "data"),
  secretsKey: env.SECRETS_KEY ?? "",
  builder: {
    provider: (env.BUILDER_PROVIDER ?? "anthropic") as "anthropic" | "openai",
    model: env.BUILDER_MODEL ?? "claude-sonnet-5-5",
  },
  appAi: {
    provider: (env.APP_AI_PROVIDER ?? "anthropic") as "anthropic" | "openai",
    model: env.APP_AI_MODEL ?? "claude-haiku-5-5",
  },
  anthropicKey: env.ANTHROPIC_API_KEY ?? "",
  openaiBaseUrl: (env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, ""),
  openaiKey: env.OPENAI_API_KEY ?? "",
  /** True when OPENAI_BASE_URL was set: that endpoint (Ollama, vLLM…) becomes the "openai" provider. */
  openaiConfigured: !!env.OPENAI_BASE_URL || !!env.OPENAI_API_KEY,
  openrouterKey: env.OPENROUTER_API_KEY ?? "",
  /** Extra OpenAI-compatible providers: [{"id":"lab","baseUrl":"https://…/v1","apiKeyEnv":"LAB_KEY"}]. */
  extraProviders: env.FORJA_PROVIDERS ?? "",
  /** Extra models: [{"provider":"lab","model":"qwen3.8:latest","tier":3,"inPrice":0,"outPrice":0}]. */
  extraModels: env.FORJA_MODELS ?? "",
  /** Platform whitelist: comma-separated globs over "provider:model" ids. Empty = the defaults in llm/catalog.ts. */
  modelsAllow: env.FORJA_MODELS_ALLOW ?? "",
  /** 1 credit = $0.001 of model usage. */
  creditsPerUsd: Number(env.CREDITS_PER_USD ?? 1000),
  freeCredits: Number(env.FREE_CREDITS ?? 3000),
  /**
   * First-run setup. While there are no accounts, the server only accepts POST /api/auth/setup with this
   * token. Unset, a random one is generated at startup and printed to the log.
   */
  bootstrapToken: env.FORJA_BOOTSTRAP_TOKEN ?? "",
  /** Who may create an account: "open" (anyone, by email code), "invite" (only invited emails), "closed" (admins add people). */
  signup: (["open", "invite", "closed"].includes(env.FORJA_SIGNUP ?? "") ? env.FORJA_SIGNUP : "open") as "open" | "invite" | "closed",
  smtpUrl: env.SMTP_URL ?? "",
  emailFrom: env.EMAIL_FROM ?? "noreply@forja.local",
  stripeKey: env.STRIPE_SECRET_KEY ?? "",
  github: {
    /** REST API base (GitHub Enterprise: https://host/api/v3). */
    apiUrl: (env.GITHUB_API_URL ?? "https://api.github.com").replace(/\/$/, ""),
    /** Optional OAuth app for "Conectar con GitHub"; without it, accounts connect with a personal access token. */
    clientId: env.GITHUB_CLIENT_ID ?? "",
    clientSecret: env.GITHUB_CLIENT_SECRET ?? "",
    webUrl: (env.GITHUB_WEB_URL ?? "https://github.com").replace(/\/$/, ""),
    /** Verifies push webhooks (POST /api/github/webhook); without it, linked repos are polled. */
    webhookSecret: env.GITHUB_WEBHOOK_SECRET ?? "",
    pollMs: Number(env.GITHUB_POLL_MS ?? 60_000),
  },
  npm: {
    /** Registry the builder resolves and installs project packages from. */
    registry: (env.FORJA_NPM_REGISTRY ?? "https://registry.npmjs.org").replace(/\/$/, ""),
    /** "0" turns project packages off: apps get only react, react-dom and zod. */
    enabled: env.FORJA_NPM !== "0",
  },
  browser: {
    /** "0" turns off browser_test (the builder's headless Chromium against the preview). */
    enabled: env.FORJA_BROWSER !== "0",
    /** A Chrome/Chromium binary to use instead of Playwright's own download. */
    executablePath: env.FORJA_CHROMIUM ?? "",
  },
  /** Optional agent tracing to Langfuse (cloud or self-hosted). Off unless both keys are set. */
  langfuse: {
    publicKey: env.LANGFUSE_PUBLIC_KEY ?? "",
    secretKey: env.LANGFUSE_SECRET_KEY ?? "",
    baseUrl: (env.LANGFUSE_BASE_URL ?? env.LANGFUSE_HOST ?? "https://cloud.langfuse.com").replace(/\/$/, ""),
  },
  /**
   * Quality evals (server/evals): run the builder on a fixed set of requests, in throwaway
   * projects, and score the result. Off unless FORJA_EVALS=1: it spends real model credit.
   * The limits are deploy-time on purpose; the admin UI can ask for less, never for more.
   */
  evals: {
    enabled: env.FORJA_EVALS === "1",
    /** Most one run may spend, in USD (model calls of the builder and the judge). */
    maxRunUsd: Math.max(0.1, Number(env.FORJA_EVALS_MAX_RUN_USD ?? 5)),
    /** Most all runs together may spend in a rolling 24 hours. */
    maxDailyUsd: Math.max(0.1, Number(env.FORJA_EVALS_MAX_DAILY_USD ?? 20)),
    /** Cases building at the same time (each one is a full builder turn plus a headless browser). */
    concurrency: Math.min(4, Math.max(1, Math.floor(Number(env.FORJA_EVALS_CONCURRENCY ?? 2)) || 1)),
  },
  /** A project database closes after this long without queries ("sleeps"). */
  dbIdleMs: 60_000,
  /** Longest a single endpoint call or job run may take. */
  maxRunMs: 15 * 60_000,
};

if (!config.secretsKey) {
  // Dev fallback: secrets stay readable only for this process lifetime.
  config.secretsKey = randomBytes(32).toString("hex");
  console.warn("[forja] SECRETS_KEY no está definido; los secretos guardados no sobrevivirán un reinicio.");
}

export const paths = {
  platformDb: path.join(config.dataDir, "platform"),
  projectDb: (projectId: string) => path.join(config.dataDir, "projects", projectId, "db"),
  projectStorage: (projectId: string) => path.join(config.dataDir, "projects", projectId, "storage"),
  // Compiled endpoints import npm packages by name, so they must live where Node resolves
  // Forja's node_modules — not under DATA_DIR, which may be anywhere.
  bundleCache: path.join(ROOT_DIR, "node_modules", ".cache", "forja-endpoints"),
  // Installed project packages, one folder per dependency set; inside node_modules so the
  // endpoint sandbox (which may read only node_modules) can load them.
  projectDeps: path.join(ROOT_DIR, "node_modules", ".forja-deps"),
};
