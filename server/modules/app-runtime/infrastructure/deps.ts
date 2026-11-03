import { exec, execFile } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { builtinModules } from "node:module";
import path from "node:path";
import { config, paths } from "../../../shared/config.js";
import { sha256 } from "../../../shared/crypto.js";
import { createDependencyResolution } from "../application/dependencies.js";
import { BUILTIN_PACKAGES, MANIFEST, readDeps, writeDeps, isValidPackageName, packageName, type Deps, type RegistryPackage } from "../domain/dependencies.js";
export { BUILTIN_PACKAGES, MANIFEST, readDeps, writeDeps, isValidPackageName, packageName, type Deps, type PackageInfo } from "../domain/dependencies.js";

/**
 * npm packages for generated apps. A project lists them in its own package.json
 * ("dependencies" only, exact versions); each distinct set is installed once, shared by
 * every project that uses it, under node_modules/.forja-deps/<hash>. Install scripts never
 * run, so a package can't execute code on the platform at install time.
 */

/** Always available, from Forja's own node_modules; projects can't pin other versions. */
const INSTALL_TIMEOUT_MS = 5 * 60_000;
const NODE_BUILTINS = new Set(builtinModules);

export const isNodeBuiltin = (specifier: string) => specifier.startsWith("node:") || NODE_BUILTINS.has(packageName(specifier));

/** The project's dependencies, validated. Throws with a message meant for the builder. */
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

/** Looks a package up in the registry: `version` may be omitted, a dist-tag or an exact version. */
export const resolvePackage = createDependencyResolution({
  isNodeBuiltin,
  async lookup(name, version): Promise<RegistryPackage> {
    const res = await fetch(`${config.npm.registry}/${name.replace("/", "%2f")}/${encodeURIComponent(version)}`, { signal: AbortSignal.timeout(20_000) });
    if (res.status === 404) throw new Error(`No existe ${name}@${version} en npm.`);
    if (!res.ok) throw new Error(`El registro de npm respondió ${res.status} para ${name}.`);
    return await res.json() as RegistryPackage;
  },
});

// One manifest per project, edited by agents that may run in parallel: serialize the edits.
const locks = new Map<string, Promise<unknown>>();
export function withManifestLock<T>(projectId: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(projectId) ?? Promise.resolve();
  const next = prev.catch(() => {}).then(fn);
  locks.set(projectId, next);
  next.finally(() => locks.get(projectId) === next && locks.delete(projectId)).catch(() => {});
  return next;
}
