import { existsSync, readFileSync } from "node:fs";
import { z } from "zod";
import { q } from "../../platform/db.js";
import { updateSettings } from "../../settings/store.js";

/**
 * seed.local.json (or FORJA_SEED_FILE): settings, providers and models for a machine, kept out
 * of git. By default it only fills what is missing, so what an admin changed in the studio wins;
 * `force` overwrites with the file.
 */
export const SeedFile = z.object({
  settings: z.record(z.string(), z.unknown()).default({}),
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
  return done;
}
