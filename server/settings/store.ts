import { browserAvailable, config } from "../config.js";
import { decrypt, encrypt } from "../lib/crypto.js";
import { platformDb, q } from "../platform/db.js";
import { getPath, schemaOf, setPath, settingDef, SETTINGS, type SettingDef } from "./registry.js";

/**
 * Platform settings stored in the database and written onto the live `config` object.
 * Only changed settings have a row; removing the row brings the default back.
 */

export class SettingsError extends Error {
  constructor(
    public field: string,
    message: string,
  ) {
    super(message);
  }
}

export interface SettingView extends SettingDef {
  /** Absent for secrets: they never leave the server. */
  value?: unknown;
  isDefault: boolean;
  secret?: { set: boolean; hint: string | null; broken: boolean };
}

/** Settings whose stored value could not be read (bad JSON, or a secret under another SECRETS_KEY). */
const broken = new Set<string>();
const listeners: ((keys: string[]) => void)[] = [];

/** Runs after every change, with the keys that changed (caches derived from config subscribe here). */
export const onSettingsChanged = (fn: (keys: string[]) => void) => void listeners.push(fn);

const hintOf = (secret: string) => (secret.length >= 8 ? `…${secret.slice(-4)}` : null);

/**
 * Every setting at its stored value, or its default when it has none. Never throws on a bad row.
 * The values are worked out first and written onto `config` in one synchronous pass: a request
 * served meanwhile never sees a mix of defaults (signup "open", no SMTP…) and stored values.
 */
export async function loadSettings(): Promise<void> {
  const rows = await q<{ key: string; value: unknown; value_enc: string | null }>(`select key, value, value_enc from settings`);
  const next = new Map(SETTINGS.map((def) => [def.key, structuredClone(def.default)]));
  const unreadable = new Set<string>();
  for (const row of rows) {
    const def = settingDef(row.key);
    if (!def) continue; // a setting a newer or older version knew about
    try {
      const raw = def.type === "secret" ? decrypt(row.value_enc ?? "") : row.value;
      const parsed = schemaOf(def).safeParse(raw);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "valor no válido");
      if (parsed.data !== null && parsed.data !== undefined) next.set(def.key, parsed.data);
    } catch (e) {
      unreadable.add(def.key);
      console.warn(`[forja] El ajuste ${def.key} guardado no se puede usar (${(e as Error).message}); se usa el valor por defecto. Vuelve a guardarlo en Administración.`);
    }
  }
  for (const [key, value] of next) setPath(config, key, value);
  if (!browserAvailable) config.browser.enabled = false;
  broken.clear();
  for (const k of unreadable) broken.add(k);
}

export async function listSettings(): Promise<SettingView[]> {
  const stored = new Set((await q<{ key: string }>(`select key from settings`)).map((r) => r.key));
  return SETTINGS.map((def) => {
    const current = getPath(config, def.key);
    const view: SettingView = { ...def, isDefault: !stored.has(def.key) };
    if (def.type === "secret") {
      view.default = "";
      view.secret = { set: !!current, hint: current ? hintOf(String(current)) : null, broken: broken.has(def.key) };
    } else view.value = current;
    return view;
  });
}

/**
 * Validates the whole patch first (nothing is written if any key fails), then stores it in one
 * transaction. A secret set to null is removed. Returns the keys that changed.
 */
export async function updateSettings(patch: Record<string, unknown>, actorId: string | null): Promise<string[]> {
  const parsed: { def: SettingDef; value: unknown }[] = [];
  for (const [key, raw] of Object.entries(patch)) {
    const def = settingDef(key);
    if (!def) throw new SettingsError(key, `Ajuste desconocido: ${key}`);
    const r = schemaOf(def).safeParse(raw);
    if (!r.success) throw new SettingsError(key, `${def.label}: ${r.error.issues[0]?.message ?? "valor no válido"}`);
    parsed.push({ def, value: r.data });
  }
  if (!parsed.length) return [];
  await (await platformDb()).transaction(async (tx) => {
    for (const { def, value } of parsed) {
      if (def.type === "secret" && value === null) {
        await tx.query(`delete from settings where key = $1`, [def.key]);
        await tx.query(`insert into settings_audit (key, actor_id, action) values ($1, $2, 'reset')`, [def.key, actorId]);
        continue;
      }
      const secret = def.type === "secret";
      await tx.query(
        `insert into settings (key, value, value_enc, updated_by, updated_at) values ($1, $2, $3, $4, now())
         on conflict (key) do update set value = excluded.value, value_enc = excluded.value_enc, updated_by = excluded.updated_by, updated_at = now()`,
        // jsonb from a JSON string: pg would send a JS array as a Postgres array.
        [def.key, secret ? null : JSON.stringify(value), secret ? encrypt(String(value)) : null, actorId],
      );
      await tx.query(`insert into settings_audit (key, actor_id, action) values ($1, $2, 'set')`, [def.key, actorId]);
    }
  });
  const keys = parsed.map((p) => p.def.key);
  await loadSettings();
  emit(keys);
  return keys;
}

/** Back to the default value. */
export async function resetSetting(key: string, actorId: string | null): Promise<void> {
  if (!settingDef(key)) throw new SettingsError(key, `Ajuste desconocido: ${key}`);
  await (await platformDb()).transaction(async (tx) => {
    await tx.query(`delete from settings where key = $1`, [key]);
    await tx.query(`insert into settings_audit (key, actor_id, action) values ($1, $2, 'reset')`, [key, actorId]);
  });
  await loadSettings();
  emit([key]);
}

/** Records a change that does not go through `settings` (providers, models) in the same audit log. */
export async function audit(key: string, actorId: string | null, action: "set" | "reset" | "create" | "delete") {
  await q(`insert into settings_audit (key, actor_id, action) values ($1, $2, $3)`, [key, actorId, action]);
}

function emit(keys: string[]) {
  for (const fn of listeners) {
    try {
      fn(keys);
    } catch (e) {
      console.warn("[forja] al aplicar ajustes:", (e as Error).message);
    }
  }
}

/** Variables of older versions that now live in the database: said once at start-up so nobody is surprised. */
const MOVED_ENV = [
  "ANTHROPIC_API_KEY",
  "OPENROUTER_API_KEY",
  "OPENAI_BASE_URL",
  "OPENAI_API_KEY",
  "FORJA_PROVIDERS",
  "FORJA_MODELS",
  "BUILDER_MODEL",
  "APP_AI_MODEL",
  "FORJA_SIGNUP",
  "FREE_CREDITS",
  "CREDITS_PER_USD",
  "SMTP_URL",
  "EMAIL_FROM",
  "STRIPE_SECRET_KEY",
  "FORJA_MODELS_ALLOW",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "GITHUB_WEBHOOK_SECRET",
  "GITHUB_POLL_MS",
  "GITHUB_API_URL",
  "GITHUB_WEB_URL",
  "LANGFUSE_PUBLIC_KEY",
  "LANGFUSE_SECRET_KEY",
  "LANGFUSE_BASE_URL",
  "FORJA_NPM",
  "FORJA_NPM_REGISTRY",
  "FORJA_EVALS",
  "FORJA_EVALS_MAX_RUN_USD",
  "FORJA_EVALS_MAX_DAILY_USD",
  "FORJA_EVALS_CONCURRENCY",
];
export function warnMovedEnv() {
  const set = MOVED_ENV.filter((k) => process.env[k]);
  if (set.length) console.warn(`[forja] Estas variables de entorno ya no se leen: ${set.join(", ")}. Configúralas en el studio, Administración (o en seed.local.json).`);
}
