import { KIT_BUILTIN } from "./catalog.js";
import type { FileMap } from "./publication.js";

export const BUILTIN_PACKAGES = ["react", "react-dom", "zod", "@forja/client", "@forja/server", ...Object.keys(KIT_BUILTIN)];
export const MANIFEST = "package.json";
const MAX_DEPS = 40;
const NAME = /^(@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/;
const EXACT = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;
export type Deps = Record<string, string>;
export const isValidPackageName = (name: string) => name.length <= 214 && NAME.test(name);
export function packageName(specifier: string) {
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]!;
}

export function readDeps(files: FileMap): Deps {
  const raw = files[MANIFEST];
  if (raw === undefined) return {};
  let manifest: { dependencies?: unknown };
  try { manifest = JSON.parse(raw); } catch {
    throw new Error("package.json no es JSON válido. Gestiona los paquetes con add_dependency / remove_dependency.");
  }
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) throw new Error("package.json debe ser un objeto.");
  const deps = manifest.dependencies ?? {};
  if (typeof deps !== "object" || Array.isArray(deps)) throw new Error('package.json: "dependencies" debe ser un objeto { "nombre": "versión" }.');
  const out: Deps = {};
  for (const [name, version] of Object.entries(deps)) {
    if (!isValidPackageName(name)) throw new Error(`package.json: nombre de paquete no válido: ${name}`);
    if (BUILTIN_PACKAGES.includes(name)) continue;
    if (typeof version !== "string" || !EXACT.test(version)) throw new Error(`package.json: ${name} necesita una versión exacta (p. ej. "1.4.2"), no "${String(version)}".`);
    out[name] = version;
  }
  if (Object.keys(out).length > MAX_DEPS) throw new Error(`Demasiados paquetes (${Object.keys(out).length}); el máximo es ${MAX_DEPS}.`);
  return out;
}

export function writeDeps(files: FileMap, deps: Deps): string {
  let manifest: Record<string, unknown> = {};
  try {
    const parsed = files[MANIFEST] ? JSON.parse(files[MANIFEST]!) : {};
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) manifest = parsed;
  } catch {}
  const sorted = Object.fromEntries(Object.entries(deps).sort(([a], [b]) => a.localeCompare(b)));
  return JSON.stringify({ ...manifest, private: true, dependencies: sorted }, null, 2) + "\n";
}

export function validatePackageName(name: string) {
  if (!isValidPackageName(name)) throw new Error(`Nombre de paquete no válido: ${name}`);
  if (BUILTIN_PACKAGES.includes(name)) throw new Error(`${name} ya viene incluido; impórtalo sin instalar nada.`);
}

export interface RegistryPackage {
  version: string; description?: string; deprecated?: string; os?: string[]; cpu?: string[];
  gypfile?: boolean; scripts?: Record<string, string>; peerDependencies?: Record<string, string>;
}
export interface PackageInfo { name: string; version: string; description: string; warnings: string[] }
export function packageInfo(name: string, metadata: RegistryPackage): PackageInfo {
  if (typeof metadata.version !== "string" || !EXACT.test(metadata.version)) {
    throw new Error(`El registro de npm devolvió una versión no válida para ${name}.`);
  }
  const warnings: string[] = [];
  if (metadata.deprecated) warnings.push(`Está obsoleto: ${metadata.deprecated}`);
  if (metadata.gypfile || metadata.os || metadata.cpu || metadata.scripts?.install || metadata.scripts?.postinstall) warnings.push("Usa código nativo o scripts de instalación, que aquí no se ejecutan: es probable que no funcione.");
  const peers = Object.keys(metadata.peerDependencies ?? {}).filter((p) => !BUILTIN_PACKAGES.includes(p));
  if (peers.length) warnings.push(`Pide también: ${peers.join(", ")} (instálalos con add_dependency si los usas).`);
  return { name, version: metadata.version, description: metadata.description ?? "", warnings };
}
