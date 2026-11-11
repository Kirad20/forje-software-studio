import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

import * as esbuild from "esbuild";
import { ROOT_DIR, paths } from "../../../shared/config.js";
import { sha256 } from "../../../shared/crypto.js";
import { formatProblem, type FileMap, type BuildProblem } from "../domain/publication.js";
export { formatProblem, type BuildProblem } from "../domain/publication.js";
import { createProjectCheck } from "../application/projectBuild.js";
import { endpointRoutes, exampleFiles, jobFiles, pageRoutes } from "../domain/routes.js";
import { detectSpringProject } from "../domain/spring.js";
export { endpointRoutes, exampleFiles, jobFiles, pageRoutes, readJobSettings, type EndpointInfo, type JobInfo, type PageInfo } from "../domain/routes.js";
import { BUILTIN_PACKAGES, ensureDeps, isNodeBuiltin, MANIFEST, packageName, readDeps, type Deps } from "./deps.js";

const SDK_CLIENT = path.join(ROOT_DIR, "sdk", "client", "index.ts");
const SDK_UI = path.join(ROOT_DIR, "sdk", "ui", "index.tsx");
const RESOLVE_EXT = ["", ".tsx", ".ts", ".jsx", ".js", ".css", ".json", "/index.tsx", "/index.ts"];

export class BuildError extends Error {
  constructor(public problems: BuildProblem[]) {
    super(problems.map(formatProblem).join("\n"));
  }
}

interface Packages {
  deps: Deps;
  /** Installed folder for `deps`, or null when the project has none. */
  dir: string | null;
}

/** The project's packages, installed on first use. Problems point at package.json. */
async function projectPackages(files: FileMap): Promise<Packages> {
  try {
    const deps = readDeps(files);
    return { deps, dir: await ensureDeps(deps) };
  } catch (e) {
    throw new BuildError([{ file: MANIFEST, text: (e as Error).message }]);
  }
}

const SKIP = { forjaSkip: true };

/** Resolves a bare import from another folder, through esbuild's own resolver. */
async function resolveFrom(build: esbuild.PluginBuild, args: esbuild.OnResolveArgs, resolveDir: string): Promise<esbuild.OnResolveResult> {
  const r = await build.resolve(args.path, { kind: args.kind, resolveDir, importer: args.importer, pluginData: SKIP });
  return r.errors.length ? { errors: r.errors } : { path: r.path, namespace: r.namespace, external: r.external, sideEffects: r.sideEffects };
}

/**
 * Serves a project's files to esbuild from memory. Relative imports and the `~/` alias
 * resolve inside the project. Bare imports resolve to react, react-dom and zod from
 * Forja's own node_modules, or to the packages listed in the project's package.json.
 * React always comes from Forja (one copy, even when a package brings its own).
 * In node builds packages stay external: Node loads them at run time next to the bundle.
 */
function vfsPlugin(files: FileMap, pkgs: Packages, opts: { entry?: { path: string; contents: string }; node?: boolean } = {}): esbuild.Plugin {
  const resolveIn = (p: string) => RESOLVE_EXT.map((e) => p + e).find((c) => c in files);
  const { entry } = opts;
  return {
    name: "forja-vfs",
    setup(build) {
      build.onResolve({ filter: /^@forja\/client$/ }, () => ({ path: SDK_CLIENT }));
      // The interface kit is browser-only: endpoints and jobs have no use for it.
      build.onResolve({ filter: /^@forja\/ui$/ }, () => (opts.node ? { errors: [{ text: "@forja/ui es solo para páginas y componentes: los endpoints y las tareas no pueden importarlo." }] } : { path: SDK_UI }));
      // Types only (ctx of endpoints and jobs); a value import of it bundles to nothing.
      build.onResolve({ filter: /^@forja\/server$/ }, () => ({ path: "@forja/server", namespace: "forja-types" }));
      build.onLoad({ filter: /.*/, namespace: "forja-types" }, () => ({ contents: "export {};", loader: "js" }));
      if (entry) build.onResolve({ filter: /^forja:entry$/ }, () => ({ path: entry.path, namespace: "vfs" }));
      if (!opts.node) {
        build.onResolve({ filter: /^react(-dom)?(\/.*)?$/ }, (args) => (args.pluginData?.forjaSkip ? undefined : resolveFrom(build, args, ROOT_DIR)));
      }
      // Bare imports written in project files (imports inside packages resolve normally).
      build.onResolve({ filter: /^[A-Za-z0-9@_]/ }, (args) => {
        if (args.namespace !== "vfs" || args.path.startsWith("@/")) return undefined;
        if (isNodeBuiltin(args.path)) {
          return opts.node ? { path: args.path, external: true } : { errors: [{ text: `"${args.path}" es un módulo de Node: no existe en el navegador.` }] };
        }
        const name = packageName(args.path);
        if (name in pkgs.deps) {
          if (opts.node) return { path: args.path, external: true };
          return resolveFrom(build, args, pkgs.dir!);
        }
        if (BUILTIN_PACKAGES.includes(name)) return opts.node ? { path: args.path, external: true } : undefined;
        return { errors: [{ text: `El paquete "${name}" no está instalado. Añádelo con add_dependency antes de importarlo.` }] };
      });
      build.onResolve({ filter: /^(\.{1,2}\/|~\/|@\/|\/)/ }, (args) => {
        if (args.namespace !== "vfs" && args.kind !== "entry-point") return undefined;
        let target: string;
        if (/^(~|@)\//.test(args.path)) target = args.path.slice(2);
        else if (args.path.startsWith("/")) target = args.path.slice(1);
        else target = path.posix.normalize(path.posix.join(path.posix.dirname(args.importer), args.path));
        const found = resolveIn(target);
        if (!found) return { errors: [{ text: `No se encuentra "${args.path}" (importado desde ${args.importer})` }] };
        return { path: found, namespace: "vfs" };
      });
      build.onLoad({ filter: /.*/, namespace: "vfs" }, (args) => {
        const contents = entry && args.path === entry.path ? entry.contents : files[args.path];
        if (contents === undefined) return { errors: [{ text: `Archivo no encontrado: ${args.path}` }] };
        const ext = args.path.endsWith(".module.css") ? "module.css" : path.extname(args.path).slice(1);
        const loader: Record<string, esbuild.Loader> = {
          tsx: "tsx",
          ts: "ts",
          jsx: "jsx",
          js: "js",
          css: "css",
          "module.css": "local-css",
          json: "json",
        };
        return { contents, loader: loader[ext] ?? "text", resolveDir: ROOT_DIR };
      });
    },
  };
}

function toProblems(e: unknown): BuildProblem[] {
  const errs = (e as esbuild.BuildFailure).errors;
  if (!errs) return [{ file: "?", text: String((e as Error).message ?? e) }];
  return errs.map((m) => ({
    file: m.location?.file?.replace(/^vfs:/, "") ?? "?",
    line: m.location?.line,
    column: m.location?.column,
    text: m.text,
  }));
}

// --- Pages & routes -------------------------------------------------------------

/** `pages/_index.tsx` → `/`, `pages/about.tsx` → `/about`, `pages/posts.$id.tsx` → `/posts/:id`. */
export async function buildClient(files: FileMap, opts: { minify?: boolean } = {}): Promise<{ js: string; css: string }> {
  const routes = pageRoutes(files);
  const lines = [
    `import { createElement } from "react";`,
    `import { createRoot } from "react-dom/client";`,
    `import { ForjaApp } from "@forja/client";`,
  ];
  if ("base.css" in files) lines.push(`import "./base.css";`);
  routes.forEach((r, i) => lines.push(`import P${i} from "./${r.file}";`));
  const layout = files["pages/_layout.tsx"] !== undefined;
  const notFound = files["pages/_404.tsx"] !== undefined;
  if (layout) lines.push(`import Layout from "./pages/_layout.tsx";`);
  if (notFound) lines.push(`import NotFound from "./pages/_404.tsx";`);
  lines.push(
    `const routes = [${routes.map((r, i) => `{ pattern: ${JSON.stringify(r.pattern)}, component: P${i} }`).join(", ")}];`,
    `createRoot(document.getElementById("root")).render(createElement(ForjaApp, { routes${layout ? ", layout: Layout" : ""}${notFound ? ", notFound: NotFound" : ""} }));`,
  );
  return bundleBrowser(files, lines.join("\n"), opts.minify);
}

async function bundleBrowser(files: FileMap, entry: string, minify = false): Promise<{ js: string; css: string }> {
  const pkgs = await projectPackages(files);
  try {
    const result = await esbuild.build({
      entryPoints: ["forja:entry"],
      bundle: true,
      write: false,
      outdir: "out",
      format: "esm",
      platform: "browser",
      target: "es2022",
      jsx: "automatic",
      minify,
      sourcemap: minify ? false : "inline",
      logLevel: "silent",
      define: { "process.env.NODE_ENV": JSON.stringify(minify ? "production" : "development") },
      plugins: [vfsPlugin(files, pkgs, { entry: { path: "__entry__.tsx", contents: entry } })],
    });
    const out = (ext: string) => result.outputFiles.find((f) => f.path.endsWith(ext))?.text ?? "";
    return { js: out(".js"), css: out(".css") };
  } catch (e) {
    throw new BuildError(toProblems(e));
  }
}

// --- Examples: every state of a component or page, side by side ----------------------------

/** components/Card.example.tsx, pages/orders.example.tsx: each named export is one example. */
export async function buildExamples(files: FileMap, file: string): Promise<{ js: string; css: string }> {
  if (!exampleFiles(files).includes(file)) throw new BuildError([{ file, text: "No existe ese archivo de ejemplos" }]);
  const entry = [
    `import { createElement as h, Component } from "react";`,
    `import { createRoot } from "react-dom/client";`,
    "base.css" in files ? `import "./base.css";` : "",
    `import * as examples from "./${file}";`,
    // One failing example must not hide the others.
    `class Boundary extends Component { constructor(p) { super(p); this.state = { error: null }; }
      static getDerivedStateFromError(error) { return { error }; }
      render() { return this.state.error ? h("pre", { style: { color: "#b91c1c", whiteSpace: "pre-wrap", font: "12px ui-monospace, monospace" } }, String(this.state.error.stack || this.state.error)) : this.props.children; } }`,
    `const items = Object.entries(examples).filter(([, v]) => typeof v === "function");`,
    `const label = { font: "600 11px system-ui", color: "#64748b", textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 8px" };`,
    `createRoot(document.getElementById("root")).render(h("main", { style: { padding: 24, display: "grid", gap: 28 } },
      items.length ? items.map(([name, C]) => h("section", { key: name }, h("p", { style: label }, name),
        h("div", { style: { border: "1px dashed #cbd5e1", borderRadius: 12, padding: 16 } }, h(Boundary, null, h(C)))))
      : h("p", { style: label }, "Este archivo no exporta ejemplos")));`,
  ].join("\n");
  return bundleBrowser(files, entry);
}

// --- Server modules (endpoints & jobs) ---------------------------------------------

/** `endpoints/todos/list_GET.ts` → `GET todos/list`. */
export interface CompiledModule {
  /** Absolute path of the bundled .mjs, loaded only inside a project's sandbox. */
  file: string;
  exports: string[];
}

const compileCache = new Map<string, Promise<CompiledModule>>();

/** Server code depends on endpoints/, jobs/, helpers/ and package.json only; hash just those. */
function serverHash(files: FileMap, entry: string) {
  const relevant = Object.keys(files)
    .filter((f) => /^(endpoints|jobs|helpers)\//.test(f) || f === MANIFEST)
    .sort()
    .map((f) => `${f}\0${files[f]}`)
    .join("\0");
  return sha256(entry + "\0" + relevant).slice(0, 32);
}

/**
 * Bundles one endpoint or job to a file. The platform never imports it: it runs in the
 * project's sandbox (runtime/sandbox.ts). The cache lives under node_modules so the
 * bundle's bare imports (zod...) resolve, and so the sandbox can read it.
 */
export async function compileServerModule(files: FileMap, entry: string): Promise<CompiledModule> {
  const key = serverHash(files, entry);
  let p = compileCache.get(key);
  if (!p) {
    p = (async () => {
      let code: string;
      let exports: string[] = [];
      const pkgs = await projectPackages(files);
      try {
        const result = await esbuild.build({
          entryPoints: [`./${entry}`],
          bundle: true,
          write: false,
          outfile: "out.mjs",
          format: "esm",
          platform: "node",
          target: "node22",
          logLevel: "silent",
          metafile: true,
          plugins: [vfsPlugin(files, pkgs, { node: true })],
          absWorkingDir: ROOT_DIR,
        });
        code = result.outputFiles[0]!.text;
        exports = Object.values(result.metafile.outputs)[0]?.exports ?? [];
      } catch (e) {
        throw new BuildError(toProblems(e));
      }
      // Next to the installed packages, so Node finds them first (then Forja's own).
      const dir = pkgs.dir ? path.join(pkgs.dir, ".bundles") : paths.bundleCache;
      mkdirSync(dir, { recursive: true });
      const file = path.join(dir, `${key}.mjs`);
      if (!existsSync(file)) writeFileSync(file, code);
      return { file, exports };
    })();
    compileCache.set(key, p);
    p.catch(() => compileCache.delete(key));
    if (compileCache.size > 500) compileCache.delete(compileCache.keys().next().value!);
  }
  return p;
}

/**
 * A job's `schedule` and `timezone` exports, read from source so the platform never has
 * to execute project code to plan cron runs. Only string literals count.
 */
/** Compiles everything and reports every problem — the builder's "does it build?" check. */
export const checkProject = createProjectCheck({
  client: buildClient, server: compileServerModule, examples: buildExamples,
  problems: (error) => error instanceof BuildError ? error.problems : null,
  backend: async (files, projectId) =>
    detectSpringProject(files) ? (await import("./languages.js")).springRuntime.problems(files, projectId) : [],
});
