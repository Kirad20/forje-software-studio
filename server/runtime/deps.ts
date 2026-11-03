import { exec, execFile } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { builtinModules } from "node:module";
import path from "node:path";
import { config, paths } from "../config.js";
import { sha256 } from "../lib/crypto.js";
import type { FileMap } from "../platform/projects.js";
import { KIT_BUILTIN, KIT_CATALOG, kitSummary } from "./catalog.js";

/**
 * npm packages for generated apps. A project lists them in its own package.json
 * ("dependencies" only, exact versions); each distinct set is installed once, shared by
 * every project that uses it, under node_modules/.forja-deps/<hash>. Install scripts never
 * run, so a package can't execute code on the platform at install time.
 */

/** Always available, from Forja's own node_modules; projects can't pin other versions. */
export const BUILTIN_PACKAGES = ["react", "react-dom", "zod", "@forja/client", "@forja/server", ...Object.keys(KIT_BUILTIN)];
export const MANIFEST = "package.json";
const MAX_DEPS = 40;
const INSTALL_TIMEOUT_MS = 5 * 60_000;

const NAME = /^(@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/;
const EXACT = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;
const NODE_BUILTINS = new Set(builtinModules);

export type Deps = Record<string, string>;

export const isValidPackageName = (name: string) => name.length <= 214 && NAME.test(name);

/** "lodash/fp" → "lodash", "@scope/pkg/sub" → "@scope/pkg". */
export function packageName(specifier: string): string {
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]!;
}

export const isNodeBuiltin = (specifier: string) => specifier.startsWith("node:") || NODE_BUILTINS.has(packageName(specifier));

/** The project's dependencies, validated. Throws with a message meant for the builder. */
export function readDeps(files: FileMap): Deps {
  const raw = files[MANIFEST];
  if (raw === undefined) return {};
  let manifest: { dependencies?: unknown };
  try {
    manifest = JSON.parse(raw);
  } catch {
    throw new Error("package.json no es JSON válido. Gestiona los paquetes con add_dependency / remove_dependency.");
  }
  const deps = manifest.dependencies ?? {};
  if (typeof deps !== "object" || Array.isArray(deps)) throw new Error('package.json: "dependencies" debe ser un objeto { "nombre": "versión" }.');
  const out: Deps = {};
  for (const [name, version] of Object.entries(deps as Record<string, unknown>)) {
    if (!isValidPackageName(name)) throw new Error(`package.json: nombre de paquete no válido: ${name}`);
    if (BUILTIN_PACKAGES.includes(name)) continue;
    // Exact versions only: no ranges, tags, git, file: or URLs, so every build is reproducible.
    if (typeof version !== "string" || !EXACT.test(version)) throw new Error(`package.json: ${name} necesita una versión exacta (p. ej. "1.4.2"), no "${String(version)}".`);
    out[name] = version;
  }
  if (Object.keys(out).length > MAX_DEPS) throw new Error(`Demasiados paquetes (${Object.keys(out).length}); el máximo es ${MAX_DEPS}.`);
  return out;
}

export function writeDeps(files: FileMap, deps: Deps): string {
  let manifest: Record<string, unknown> = {};
  try {
    manifest = files[MANIFEST] ? JSON.parse(files[MANIFEST]!) : {};
  } catch {
    // Rewritten from scratch below.
  }
  const sorted = Object.fromEntries(Object.entries(deps).sort(([a], [b]) => a.localeCompare(b)));
  return JSON.stringify({ ...manifest, private: true, dependencies: sorted }, null, 2) + "\n";
}

const depsKey = (deps: Deps) =>
  sha256(
    Object.entries(deps)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([n, v]) => `${n}@${v}`)
      .join("\n"),
  ).slice(0, 24);

/** Where a dependency set lives once installed (it may not be installed yet). */
export const depsDir = (deps: Deps) => path.join(paths.projectDeps, depsKey(deps));
const READY = ".forja-ready";

const installing = new Map<string, Promise<string>>();

function npm(args: string[], cwd: string): Promise<void> {
  const opts = { cwd, timeout: INSTALL_TIMEOUT_MS, maxBuffer: 10_000_000, env: { ...process.env, npm_config_update_notifier: "false" } };
  return new Promise((resolve, reject) => {
    const done = (err: Error | null, _out: string, stderr: string) => {
      if (err) reject(new Error(stderr.split("\n").filter((l) => /ERR!|error/i.test(l)).slice(-6).join("\n") || err.message));
      else resolve();
    };
    // npm is a .cmd on Windows, which Node only runs through a shell: pass one quoted command line.
    if (process.platform === "win32") exec(["npm", ...args.map((a) => `"${a}"`)].join(" "), opts, done);
    else execFile("npm", args, opts, done);
  });
}

/** Installs a dependency set if needed and returns its folder; null when there is nothing to install. */
export async function ensureDeps(deps: Deps): Promise<string | null> {
  if (!Object.keys(deps).length) return null;
  if (!config.npm.enabled) throw new Error("Los paquetes npm están desactivados en esta instalación de Forja (Administración → General → Constructor).");
  if (!/^https?:\/\/[^\s"'`$&|;<>]+$/.test(config.npm.registry)) throw new Error("El registro npm configurado no es una URL válida.");
  const dir = depsDir(deps);
  if (existsSync(path.join(dir, READY))) return dir;
  let p = installing.get(dir);
  if (!p) {
    p = (async () => {
      rmSync(dir, { recursive: true, force: true });
      mkdirSync(dir, { recursive: true });
      writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name: "forja-deps", private: true, dependencies: deps }, null, 2));
      try {
        await npm(["install", "--ignore-scripts", "--omit=dev", "--no-audit", "--no-fund", "--loglevel=error", `--registry=${config.npm.registry}`], dir);
      } catch (e) {
        rmSync(dir, { recursive: true, force: true });
        throw new Error(`No se pudieron instalar los paquetes: ${(e as Error).message}`);
      }
      writeFileSync(path.join(dir, READY), new Date().toISOString());
      return dir;
    })();
    installing.set(dir, p);
    p.finally(() => installing.delete(dir)).catch(() => {});
  }
  return p;
}

export interface PackageInfo {
  name: string;
  version: string;
  description: string;
  warnings: string[];
}

/** Looks a package up in the registry: `version` may be omitted, a dist-tag or an exact version. */
export async function resolvePackage(name: string, version = "latest"): Promise<PackageInfo> {
  if (!isValidPackageName(name)) throw new Error(`Nombre de paquete no válido: ${name}`);
  if (BUILTIN_PACKAGES.includes(name)) throw new Error(`${name} ya viene incluido; impórtalo sin instalar nada.`);
  if (isNodeBuiltin(name)) throw new Error(`${name} es un módulo de Node, no un paquete de npm.`);
  // The catalog is closed: only its packages install, always at the listed version.
  const pinned = KIT_CATALOG[name]?.version;
  if (!pinned) throw new Error(`${name} no está en el catálogo de Forja, así que no se puede instalar. Usa lo que ya hay:
${kitSummary()}
Si nada de eso sirve, resuélvelo con unas pocas líneas propias o dile al dueño que hace falta ese paquete.`);
  const wanted = pinned;
  const res = await fetch(`${config.npm.registry}/${name.replace("/", "%2f")}/${encodeURIComponent(wanted)}`, { signal: AbortSignal.timeout(20_000) });
  if (res.status === 404) throw new Error(`No existe ${name}@${wanted} en npm.`);
  if (!res.ok) throw new Error(`El registro de npm respondió ${res.status} para ${name}.`);
  const m = (await res.json()) as {
    version: string;
    description?: string;
    deprecated?: string;
    os?: string[];
    cpu?: string[];
    gypfile?: boolean;
    scripts?: Record<string, string>;
    peerDependencies?: Record<string, string>;
  };
  const warnings: string[] = [];
  if (version !== "latest" && version.replace(/^[\^~=v]/, "") !== pinned) warnings.push(`Se instaló la versión ${pinned} del catálogo de Forja, no ${version}.`);
  if (m.deprecated) warnings.push(`Está obsoleto: ${m.deprecated}`);
  if (m.gypfile || m.os || m.cpu || m.scripts?.install || m.scripts?.postinstall) {
    warnings.push("Usa código nativo o scripts de instalación, que aquí no se ejecutan: es probable que no funcione.");
  }
  const peers = Object.keys(m.peerDependencies ?? {}).filter((p) => !BUILTIN_PACKAGES.includes(p));
  if (peers.length) warnings.push(`Pide también: ${peers.join(", ")} (instálalos con add_dependency si los usas).`);
  return { name, version: m.version, description: m.description ?? "", warnings };
}

// One manifest per project, edited by agents that may run in parallel: serialize the edits.
const locks = new Map<string, Promise<unknown>>();
export function withManifestLock<T>(projectId: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(projectId) ?? Promise.resolve();
  const next = prev.catch(() => {}).then(fn);
  locks.set(projectId, next);
  next.finally(() => locks.get(projectId) === next && locks.delete(projectId)).catch(() => {});
  return next;
}
