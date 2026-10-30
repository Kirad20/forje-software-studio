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
  freeCredits: Number(env.FREE_CREDITS ?? 3000),
  smtpUrl: env.SMTP_URL ?? "",
  emailFrom: env.EMAIL_FROM ?? "noreply@forja.local",
  stripeKey: env.STRIPE_SECRET_KEY ?? "",
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
};
