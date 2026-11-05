import { z } from "zod";
import { CONFIG_DEFAULTS } from "../../../shared/config.js";

/**
 * Every platform setting an admin can change from the studio. The key is also the setting's
 * path in `config` ("github.clientId" → config.github.clientId), and its default is whatever
 * server/shared/config.ts declares there. Adding a setting = a field in config.ts + a line here.
 */
import type { SettingDef, SettingGroup } from "../domain/PlatformSetting.js";
export type { SettingDef, SettingGroup, PlatformSettingType as SettingType } from "../domain/PlatformSetting.js";

export const GROUPS: Record<SettingGroup, string> = {
  accounts: "Cuentas",
  credits: "Créditos",
  models: "Modelos",
  email: "Correo",
  payments: "Pagos",
  github: "GitHub",
  observability: "Observabilidad",
  runtime: "Constructor",
  evals: "Evals de calidad",
};

export function getPath(obj: unknown, key: string): unknown {
  return key.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj);
}

export function setPath(obj: object, key: string, value: unknown) {
  const parts = key.split(".");
  const last = parts.pop()!;
  const parent = parts.reduce<Record<string, unknown>>((o, k) => o[k] as Record<string, unknown>, obj as Record<string, unknown>);
  // Lists are copied so a caller mutating its array cannot change the live config.
  parent[last] = Array.isArray(value) ? [...value] : value;
}

type Def = Omit<SettingDef, "default">;
const defs: Def[] = [
  { key: "signup", group: "accounts", label: "Quién puede crear cuenta", type: "enum", options: ["open", "invite", "closed"], help: "open: cualquiera con un código por correo · invite: solo correos invitados · closed: solo los administradores crean cuentas." },
  { key: "freeCredits", group: "credits", label: "Créditos iniciales por cuenta", type: "number", min: 0, max: 10_000_000, integer: true },
  { key: "creditsPerUsd", group: "credits", label: "Créditos por dólar de coste del modelo", type: "number", min: 1, max: 1_000_000, integer: true },
  {
    key: "models.allow",
    group: "models",
    label: "Lista blanca de modelos de la plataforma",
    type: "list",
    help: "Patrones sobre «proveedor:modelo» (con * como comodín). «custom:*» son los modelos propios. Cada cuenta y cada proyecto pueden restringirla más.",
  },
  ...(["fast", "standard", "high", "max"] as const).flatMap((effort) => [
    { key: `models.fusion.${effort}.maxCalls`, group: "models" as const, label: `Fusion ${effort}: máximo de llamadas`, type: "number" as const, min: 1, max: 20, integer: true },
    { key: `models.fusion.${effort}.timeoutMs`, group: "models" as const, label: `Fusion ${effort}: tiempo máximo (ms)`, type: "number" as const, min: 1_000, max: 600_000, integer: true },
    { key: `models.fusion.${effort}.maxUsd`, group: "models" as const, label: `Fusion ${effort}: presupuesto máximo (USD)`, type: "number" as const, min: 0, max: 100, help: "Un precio desconocido se contabiliza como desconocido, no como gratis." },
  ]),
  { key: "smtpUrl", group: "email", label: "Servidor SMTP", type: "secret", help: "smtp://usuario:clave@host:587. Sin él, los correos solo quedan en el registro del proyecto y los códigos de acceso salen en el log." },
  { key: "emailFrom", group: "email", label: "Remitente", type: "string" },
  { key: "stripeKey", group: "payments", label: "Clave secreta de Stripe", type: "secret", help: "La usan las apps que no definen su propia STRIPE_SECRET_KEY." },
  { key: "github.clientId", group: "github", label: "Client ID de la OAuth App", type: "string", help: "Callback: <URL pública>/api/github/oauth/callback. Sin OAuth App, cada cuenta conecta con un token personal." },
  { key: "github.clientSecret", group: "github", label: "Client secret de la OAuth App", type: "secret" },
  { key: "github.webhookSecret", group: "github", label: "Secreto del webhook de push", type: "secret", help: "POST <URL pública>/api/github/webhook. Sin él, los repositorios enlazados se consultan periódicamente." },
  { key: "github.pollMs", group: "github", label: "Intervalo de consulta (ms)", type: "number", min: 10_000, max: 86_400_000, integer: true },
  { key: "github.apiUrl", group: "github", label: "URL de la API", type: "url", help: "GitHub Enterprise: https://host/api/v3" },
  { key: "github.webUrl", group: "github", label: "URL web", type: "url" },
  { key: "langfuse.publicKey", group: "observability", label: "Langfuse: clave pública", type: "string", help: "Con las dos claves, cada ejecución de agente se envía como traza (tokens, coste, latencia; sin prompts ni código)." },
  { key: "langfuse.secretKey", group: "observability", label: "Langfuse: clave secreta", type: "secret" },
  { key: "langfuse.baseUrl", group: "observability", label: "Langfuse: URL", type: "url", help: "UE: https://cloud.langfuse.com · EE. UU.: https://us.cloud.langfuse.com · o la de tu instancia." },
  { key: "npm.enabled", group: "runtime", label: "Paquetes npm en las apps", type: "boolean", help: "Apagado, las apps solo tienen react, react-dom y zod." },
  { key: "npm.registry", group: "runtime", label: "Registro npm", type: "url" },
  { key: "browser.enabled", group: "runtime", label: "Pruebas en navegador (browser_test)", type: "boolean", help: "Requiere una imagen con Chromium (FORJA_BROWSER distinto de 0)." },
  { key: "evals.enabled", group: "evals", label: "Activar evals de calidad", type: "boolean", help: "Gastan crédito real de modelos, en proyectos desechables de una cuenta interna." },
  { key: "evals.maxRunUsd", group: "evals", label: "Tope por ejecución (USD)", type: "number", min: 0.1, max: 1000 },
  { key: "evals.maxDailyUsd", group: "evals", label: "Tope diario (USD)", type: "number", min: 0.1, max: 10_000 },
  { key: "evals.concurrency", group: "evals", label: "Casos a la vez", type: "number", min: 1, max: 4, integer: true },
];

export const SETTINGS: SettingDef[] = defs.map((d) => ({ ...d, default: structuredClone(getPath(CONFIG_DEFAULTS, d.key)) }));

const byKey = new Map(SETTINGS.map((d) => [d.key, d]));
export const settingDef = (key: string) => byKey.get(key);

/** The schema a value of this setting must satisfy. A secret accepts null (= remove it). */
export function schemaOf(def: SettingDef): z.ZodType {
  switch (def.type) {
    case "string":
      return z.string().trim().max(500);
    case "url":
      return z.string().trim().max(500).url("Debe ser una URL (https://…)").transform((u) => u.replace(/\/$/, ""));
    case "secret":
      return z.string().trim().min(1, "Vacío: usa «Quitar» para borrarlo").max(4000).nullable();
    case "number": {
      let n = z.number({ error: "Debe ser un número" }).finite();
      if (def.integer) n = n.int("Debe ser un número entero");
      if (def.min !== undefined) n = n.min(def.min, `Mínimo ${def.min}`);
      if (def.max !== undefined) n = n.max(def.max, `Máximo ${def.max}`);
      return n;
    }
    case "boolean":
      return z.boolean({ error: "Debe ser sí o no" });
    case "enum":
      return z.enum(def.options as [string, ...string[]], { error: `Valores válidos: ${def.options!.join(", ")}` });
    case "list":
      return z.array(z.string().trim().min(1).max(200)).max(200);
  }
}
