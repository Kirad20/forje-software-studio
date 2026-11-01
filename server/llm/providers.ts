import { z } from "zod";
import { decrypt, encrypt } from "../lib/crypto.js";
import { one, q } from "../platform/db.js";
import { audit } from "../settings/store.js";

/**
 * Model providers, stored in the database and edited from the admin panel. The router reads
 * them on every call, synchronously, so they are kept in an in-memory cache that every change
 * reloads. API keys are encrypted at rest and never leave the server.
 */

export const OPENROUTER_URL = "https://openrouter.ai/api/v1";

export interface ProviderRecord {
  id: string;
  kind: "anthropic" | "openai";
  label: string;
  baseUrl: string | null;
  headers: Record<string, string>;
  enabled: boolean;
  builtin: boolean;
  /** Decrypted; "" when unset or unreadable. */
  apiKey: string;
  /** Stored but cannot be decrypted (SECRETS_KEY changed). */
  keyBroken: boolean;
}

/** What the admin panel sees: the key only as a hint, the headers only by name (they may carry credentials). */
export type ProviderView = Omit<ProviderRecord, "apiKey" | "headers"> & { headerNames: string[]; keySet: boolean; keyHint: string | null; available: boolean; missing: string | null };

let cache: ProviderRecord[] = [];
let loaded = false;
const listeners: (() => void)[] = [];
/** Runs after providers change (cached SDK clients, catalog sync). */
export const onProvidersChanged = (fn: () => void) => void listeners.push(fn);

/** Why a provider cannot be used yet, or null when it can. */
function missing(p: ProviderRecord): string | null {
  if (!p.enabled) return "Desactivado";
  if (p.keyBroken) return "La clave guardada no se puede descifrar: vuelve a introducirla";
  if ((p.id === "anthropic" || p.id === "openrouter") && !p.apiKey) return "Falta la clave de API";
  if (p.kind === "openai" && p.id !== "openrouter" && !p.baseUrl) return "Falta la URL base";
  return null;
}

export async function reloadProviders(): Promise<void> {
  const rows = await q<{ id: string; kind: "anthropic" | "openai"; label: string; base_url: string | null; api_key_enc: string | null; headers_enc: string | null; enabled: boolean; builtin: boolean }>(
    `select id, kind, label, base_url, api_key_enc, headers_enc, enabled, builtin from providers order by builtin desc, id`,
  );
  cache = rows.map((r) => {
    let apiKey = "";
    let headers: Record<string, string> = {};
    let keyBroken = false;
    if (r.api_key_enc || r.headers_enc) {
      try {
        if (r.api_key_enc) apiKey = decrypt(r.api_key_enc);
        if (r.headers_enc) headers = JSON.parse(decrypt(r.headers_enc));
      } catch {
        keyBroken = true;
        console.warn(`[forja] La clave del proveedor ${r.id} no se puede descifrar (¿cambió SECRETS_KEY?). Vuelve a introducirla en Administración → Proveedores.`);
      }
    }
    return { id: r.id, kind: r.kind, label: r.label, baseUrl: r.base_url, headers, enabled: r.enabled, builtin: r.builtin, apiKey, keyBroken };
  });
  loaded = true;
  for (const fn of listeners) fn();
}

export async function ensureProviders() {
  if (!loaded) await reloadProviders();
}

/** Providers the router may call right now. Empty until ensureProviders() ran. */
export const usableProviders = () => cache.filter((p) => !missing(p));

export const providerSecret = (id: string) => cache.find((p) => p.id === id && !missing(p))?.apiKey || undefined;

export async function listProviders(): Promise<ProviderView[]> {
  await reloadProviders();
  return cache.map(({ apiKey, headers, ...p }) => ({
    ...p,
    headerNames: Object.keys(headers),
    keySet: !!apiKey || p.keyBroken,
    keyHint: apiKey.length >= 8 ? `…${apiKey.slice(-4)}` : null,
    available: !missing({ apiKey, headers, ...p }),
    missing: missing({ apiKey, headers, ...p }),
  }));
}

export class ProviderError extends Error {}

const encryptHeaders = (h: Record<string, string> | undefined) => (h && Object.keys(h).length ? encrypt(JSON.stringify(h)) : null);

const ProviderInput = z.object({
  id: z.string().regex(/^[a-z0-9-]{2,32}$/, "El id usa minúsculas, números y guiones (2–32)"),
  kind: z.enum(["anthropic", "openai"]).optional(),
  label: z.string().trim().min(1).max(80).optional(),
  baseUrl: z.string().trim().url("La URL base debe ser una URL (https://…/v1)").max(500).nullable().optional(),
  /** A new key replaces the old one; null removes it; absent keeps it. */
  apiKey: z.string().trim().min(1).max(4000).nullable().optional(),
  headers: z.record(z.string(), z.string().max(1000)).optional(),
  enabled: z.boolean().optional(),
});
export type ProviderInput = z.input<typeof ProviderInput>;

/**
 * Creates or updates a provider. New providers are always OpenAI-compatible. `seed` writes
 * without marking the provider as edited (updated_at), so the seed file keeps applying until
 * an admin changes it in the panel.
 */
export async function saveProvider(input: ProviderInput, actorId: string | null, opts: { create?: boolean; seed?: boolean } = {}): Promise<void> {
  const parsed = ProviderInput.safeParse(input);
  if (!parsed.success) throw new ProviderError(parsed.error.issues[0]?.message ?? "Datos no válidos");
  const p = parsed.data;
  const existing = await one<{ builtin: boolean; kind: string }>(`select builtin, kind from providers where id = $1`, [p.id]);
  if (opts.create && existing) throw new ProviderError(`Ya existe un proveedor «${p.id}».`);
  if (!existing && !opts.create) throw new ProviderError(`No existe el proveedor «${p.id}».`);
  if (p.kind && existing && p.kind !== existing.kind) throw new ProviderError("El tipo de un proveedor no se puede cambiar.");
  if (p.id === "openrouter" && p.baseUrl) throw new ProviderError("La URL de OpenRouter es fija.");
  const baseUrl = p.baseUrl === undefined ? undefined : p.baseUrl?.replace(/\/$/, "") ?? null;
  if (!existing) {
    if (!baseUrl) throw new ProviderError("Un proveedor compatible con OpenAI necesita la URL base (https://…/v1).");
    await q(
      `insert into providers (id, kind, label, base_url, api_key_enc, headers_enc, enabled) values ($1, 'openai', $2, $3, $4, $5, $6)`,
      [p.id, p.label ?? p.id, baseUrl, p.apiKey ? encrypt(p.apiKey) : null, encryptHeaders(p.headers), p.enabled ?? true],
    );
    if (!opts.seed) await audit(`provider:${p.id}`, actorId, "create");
  } else {
    const sets: string[] = [];
    const params: unknown[] = [p.id];
    const set = (col: string, v: unknown) => (params.push(v), sets.push(`${col} = $${params.length}`));
    if (p.label !== undefined) set("label", p.label);
    if (baseUrl !== undefined) set("base_url", baseUrl);
    if (p.apiKey !== undefined) set("api_key_enc", p.apiKey === null ? null : encrypt(p.apiKey));
    if (p.headers !== undefined) set("headers_enc", encryptHeaders(p.headers));
    if (p.enabled !== undefined) set("enabled", p.enabled);
    if (sets.length) {
      await q(`update providers set ${sets.join(", ")}${opts.seed ? "" : ", updated_at = now()"} where id = $1`, params);
      if (!opts.seed) await audit(`provider:${p.id}`, actorId, "set");
    }
  }
  await reloadProviders();
}

/** Removes an admin-added provider and its custom models. Builtin providers can only be switched off. */
export async function deleteProvider(id: string, actorId: string | null): Promise<void> {
  const row = await one<{ builtin: boolean }>(`select builtin from providers where id = $1`, [id]);
  if (!row) throw new ProviderError(`No existe el proveedor «${id}».`);
  if (row.builtin) throw new ProviderError("Los proveedores integrados no se borran: desactívalo.");
  await q(`delete from model_catalog where provider = $1 and source = 'custom'`, [id]);
  await q(`delete from providers where id = $1`, [id]);
  await audit(`provider:${id}`, actorId, "delete");
  await reloadProviders();
}
