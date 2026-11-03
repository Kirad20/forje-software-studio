import { z } from "zod";
import { decrypt, encrypt } from "../../../shared/crypto.js";
import { one, q } from "../../../shared/database/index.js";
import { audit } from "../audit.js";
import { ProviderError } from "../domain/providers.js";
import type { ProviderRepository } from "../ports/ProviderRepository.js";

const Input = z.object({
  id: z.string().regex(/^[a-z0-9-]{2,32}$/, "El id usa minúsculas, números y guiones (2–32)"),
  kind: z.enum(["anthropic", "openai"]).optional(),
  label: z.string().trim().min(1).max(80).optional(),
  baseUrl: z.string().trim().url("La URL base debe ser una URL (https://…/v1)").max(500).nullable().optional(),
  apiKey: z.string().trim().min(1).max(4000).nullable().optional(),
  headers: z.record(z.string(), z.string().max(1000)).optional(),
  enabled: z.boolean().optional(),
});
const encryptHeaders = (h: Record<string, string> | undefined) =>
  h && Object.keys(h).length ? encrypt(JSON.stringify(h)) : null;

export const postgresProviderRepository: ProviderRepository = {
  async list() {
    const rows = await q<{ id: string; kind: "anthropic" | "openai"; label: string; base_url: string | null;
      api_key_enc: string | null; headers_enc: string | null; enabled: boolean; builtin: boolean }>(
      `select id, kind, label, base_url, api_key_enc, headers_enc, enabled, builtin from providers order by builtin desc, id`,
    );
    return rows.map(r => {
      let apiKey = "", headers: Record<string, string> = {}, keyBroken = false;
      if (r.api_key_enc || r.headers_enc) {
        try {
          if (r.api_key_enc) apiKey = decrypt(r.api_key_enc);
          if (r.headers_enc) headers = JSON.parse(decrypt(r.headers_enc));
        } catch {
          keyBroken = true;
          console.warn(`[forja] La clave del proveedor ${r.id} no se puede descifrar (¿cambió SECRETS_KEY?). Vuelve a introducirla en Administración → Proveedores.`);
        }
      }
      return { id: r.id, kind: r.kind, label: r.label, baseUrl: r.base_url, headers, enabled: r.enabled,
        builtin: r.builtin, apiKey, keyBroken };
    });
  },
  async find(id) {
    return await one<{ builtin: boolean; kind: string }>(`select builtin, kind from providers where id = $1`, [id]) ?? undefined;
  },
  async create(p) {
    await q(
      `insert into providers (id, kind, label, base_url, api_key_enc, headers_enc, enabled) values ($1, 'openai', $2, $3, $4, $5, $6)`,
      [p.id, p.label ?? p.id, p.baseUrl, p.apiKey ? encrypt(p.apiKey) : null, encryptHeaders(p.headers), p.enabled ?? true],
    );
  },
  async update(p, seed) {
    const sets: string[] = [], params: unknown[] = [p.id];
    const set = (column: string, value: unknown) => (params.push(value), sets.push(`${column} = $${params.length}`));
    if (p.label !== undefined) set("label", p.label);
    if (p.baseUrl !== undefined) set("base_url", p.baseUrl);
    if (p.apiKey !== undefined) set("api_key_enc", p.apiKey === null ? null : encrypt(p.apiKey));
    if (p.headers !== undefined) set("headers_enc", encryptHeaders(p.headers));
    if (p.enabled !== undefined) set("enabled", p.enabled);
    if (!sets.length) return false;
    await q(`update providers set ${sets.join(", ")}${seed ? "" : ", updated_at = now()"} where id = $1`, params);
    return true;
  },
  async remove(id) {
    await q(`delete from model_catalog where provider = $1 and source = 'custom'`, [id]);
    await q(`delete from providers where id = $1`, [id]);
  },
  audit: (id, actorId, action) => audit(`provider:${id}`, actorId, action),
  validate(input) {
    const parsed = Input.safeParse(input);
    if (!parsed.success) throw new ProviderError(parsed.error.issues[0]?.message ?? "Datos no válidos");
    return parsed.data;
  },
};
