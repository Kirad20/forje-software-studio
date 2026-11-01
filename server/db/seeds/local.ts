import { existsSync, readFileSync } from "node:fs";
import { z } from "zod";
import { saveModel } from "../../llm/catalog.js";
import { saveProvider } from "../../llm/providers.js";
import { one, q } from "../../platform/db.js";
import { updateSettings } from "../../settings/store.js";

/**
 * seed.local.json (or FORJA_SEED_FILE): settings, providers and models for a machine, kept out
 * of git. By default it only fills what an admin has not set in the studio, so the panel wins:
 *  - a setting is applied when it has no stored value;
 *  - a provider, while nobody edited it in the panel (its updated_at is still its created_at);
 *  - a model, when it does not exist yet.
 * `force` applies everything.
 */
export const SeedFile = z.object({
  settings: z.record(z.string(), z.unknown()).default({}),
  providers: z
    .array(
      z.object({
        id: z.string(),
        label: z.string().optional(),
        baseUrl: z.string().nullable().optional(),
        apiKey: z.string().nullable().optional(),
        headers: z.record(z.string(), z.string()).optional(),
        enabled: z.boolean().optional(),
      }),
    )
    .default([]),
  models: z
    .array(
      z.object({
        provider: z.string(),
        model: z.string(),
        label: z.string().optional(),
        inPrice: z.number().optional(),
        outPrice: z.number().optional(),
        cacheReadPrice: z.number().optional(),
        context: z.number().optional(),
        tools: z.boolean().optional(),
        vision: z.boolean().optional(),
        tier: z.number().optional(),
        speed: z.number().optional(),
        enabled: z.boolean().optional(),
      }),
    )
    .default([]),
});
export type SeedFile = z.infer<typeof SeedFile>;

export function readSeedFile(file: string): SeedFile | null {
  if (!file || !existsSync(file)) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    throw new Error(`${file} no es JSON válido: ${(e as Error).message}`);
  }
  const parsed = SeedFile.safeParse(raw);
  if (!parsed.success) throw new Error(`${file}: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  return parsed.data;
}

/** Applies the seed file. Returns what it wrote, for the log. */
export async function seedLocal(file: string, opts: { force?: boolean } = {}): Promise<string[]> {
  const seed = readSeedFile(file);
  if (!seed) return [];
  const done: string[] = [];

  const stored = new Set((await q<{ key: string }>(`select key from settings`)).map((r) => r.key));
  const settings = Object.fromEntries(Object.entries(seed.settings).filter(([k]) => opts.force || !stored.has(k)));
  done.push(...(await updateSettings(settings, null)).map((k) => `ajuste ${k}`));

  for (const p of seed.providers) {
    const row = await one<{ untouched: boolean }>(`select updated_at = created_at as untouched from providers where id = $1`, [p.id]);
    if (row && !row.untouched && !opts.force) continue;
    await saveProvider(p, null, { create: !row, seed: !opts.force });
    done.push(`proveedor ${p.id}`);
  }

  for (const m of seed.models) {
    const exists = await one(`select 1 from model_catalog where id = $1`, [`${m.provider}:${m.model}`]);
    if (exists && !opts.force) continue;
    done.push(`modelo ${await saveModel(m, null, { create: !exists })}`);
  }
  return done;
}
