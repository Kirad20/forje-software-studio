import { platformSettings } from "../modules/settings/index.js";
export { SettingsError } from "../modules/settings/index.js";
export type { SettingView } from "../modules/settings/index.js";

export const onSettingsChanged = platformSettings.onChanged.bind(platformSettings);
export const loadSettings = platformSettings.load.bind(platformSettings);
export const listSettings = platformSettings.list.bind(platformSettings);
export const updateSettings = platformSettings.update.bind(platformSettings);
export const resetSetting = platformSettings.reset.bind(platformSettings);
export const audit = platformSettings.audit.bind(platformSettings);

const MOVED_ENV = [
  "ANTHROPIC_API_KEY", "OPENROUTER_API_KEY", "OPENAI_BASE_URL", "OPENAI_API_KEY",
  "FORJA_PROVIDERS", "FORJA_MODELS", "BUILDER_MODEL", "APP_AI_MODEL", "FORJA_SIGNUP",
  "FREE_CREDITS", "CREDITS_PER_USD", "SMTP_URL", "EMAIL_FROM", "STRIPE_SECRET_KEY",
  "FORJA_MODELS_ALLOW", "GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET", "GITHUB_WEBHOOK_SECRET",
  "GITHUB_POLL_MS", "GITHUB_API_URL", "GITHUB_WEB_URL", "LANGFUSE_PUBLIC_KEY",
  "LANGFUSE_SECRET_KEY", "LANGFUSE_BASE_URL", "FORJA_NPM", "FORJA_NPM_REGISTRY",
  "FORJA_EVALS", "FORJA_EVALS_MAX_RUN_USD", "FORJA_EVALS_MAX_DAILY_USD", "FORJA_EVALS_CONCURRENCY",
];

export function warnMovedEnv() {
  const set = MOVED_ENV.filter((key) => process.env[key]);
  if (set.length) console.warn(`[forja] Estas variables de entorno ya no se leen: ${set.join(", ")}. Configúralas en el studio, Administración (o en seed.local.json).`);
}
