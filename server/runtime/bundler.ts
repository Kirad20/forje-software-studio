import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import * as esbuild from "esbuild";
import { ROOT_DIR, paths } from "../config.js";
import { sha256 } from "../lib/crypto.js";
import type { FileMap } from "../platform/projects.js";

const SDK_CLIENT = path.join(ROOT_DIR, "sdk", "client", "index.ts");
const RESOLVE_EXT = ["", ".tsx", ".ts", ".jsx", ".js", ".css", ".json", "/index.tsx", "/index.ts"];

export interface BuildProblem {
  file: string;
  line?: number;
  column?: number;
  text: string;
}

export class BuildError extends Error {
  constructor(public problems: BuildProblem[]) {
    super(problems.map(formatProblem).join("\n"));
  }
}

export const formatProblem = (p: BuildProblem) => `${p.file}${p.line ? `:${p.line}:${p.column ?? 0}` : ""} — ${p.text}`;

/**
 * Serves a project's files to esbuild from memory. Relative imports and the `~/` alias
 * resolve inside the project; bare imports (react, zod...) resolve from Forja's own
 * node_modules, which is the set of packages generated apps may use.
 */
function vfsPlugin(files: FileMap, entry?: { path: string; contents: string }): esbuild.Plugin {
  const resolveIn = (p: string) => RESOLVE_EXT.map((e) => p + e).find((c) => c in files);
  return {
    name: "forja-vfs",
    setup(build) {
      build.onResolve({ filter: /^@forja\/client$/ }, () => ({ path: SDK_CLIENT }));
      if (entry) build.onResolve({ filter: /^forja:entry$/ }, () => ({ path: entry.path, namespace: "vfs" }));
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

export interface PageInfo {
  file: string;
  pattern: string;
}

/** `pages/_index.tsx` → `/`, `pages/about.tsx` → `/about`, `pages/posts.$id.tsx` → `/posts/:id`. */
export function pageRoutes(files: FileMap): PageInfo[] {
  const pages: PageInfo[] = [];
  for (const file of Object.keys(files)) {
    const m = /^pages\/([^/]+)\.tsx$/.exec(file);
    if (!m || m[1]!.endsWith(".module") || m[1]!.includes(".example")) continue;
    const name = m[1]!;
    if (name.startsWith("_") && name !== "_index") continue;
    const segs = name
      .split(".")
      .filter((s) => s !== "_index")
      .map((s) => (s.startsWith("$") ? `:${s.slice(1)}` : s));
    pages.push({ file, pattern: "/" + segs.join("/") });
  }
  // Static segments win over params.
  const score = (p: string) => p.split("/").map((s) => (s.startsWith(":") ? 1 : 0)).join("");
  return pages.sort((a, b) => score(a.pattern).localeCompare(score(b.pattern)) || b.pattern.length - a.pattern.length);
}

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
      minify: opts.minify,
      sourcemap: opts.minify ? false : "inline",
      logLevel: "silent",
      define: { "process.env.NODE_ENV": JSON.stringify(opts.minify ? "production" : "development") },
      plugins: [vfsPlugin(files, { path: "__entry__.tsx", contents: lines.join("\n") })],
    });
    const out = (ext: string) => result.outputFiles.find((f) => f.path.endsWith(ext))?.text ?? "";
    return { js: out(".js"), css: out(".css") };
  } catch (e) {
    throw new BuildError(toProblems(e));
  }
}

// --- Server modules (endpoints & jobs) ---------------------------------------------

export interface EndpointInfo {
  file: string;
  method: "GET" | "POST";
  route: string;
}

/** `endpoints/todos/list_GET.ts` → `GET todos/list`. */
export function endpointRoutes(files: FileMap): EndpointInfo[] {
  const out: EndpointInfo[] = [];
  for (const file of Object.keys(files)) {
    const m = /^endpoints\/(.+)_(GET|POST)\.ts$/.exec(file);
    if (m) out.push({ file, route: m[1]!, method: m[2] as "GET" | "POST" });
  }
  return out;
}

export interface JobInfo {
  file: string;
  name: string;
}

export const jobFiles = (files: FileMap): JobInfo[] =>
  Object.keys(files)
    .map((file) => ({ file, m: /^jobs\/([A-Za-z0-9_-]+)\.ts$/.exec(file) }))
    .filter((x) => x.m)
    .map((x) => ({ file: x.file, name: x.m![1]! }));

const moduleCache = new Map<string, Promise<Record<string, unknown>>>();

/** Server code depends on endpoints/, jobs/ and helpers/ only; hash just those. */
function serverHash(files: FileMap, entry: string) {
  const relevant = Object.keys(files)
    .filter((f) => /^(endpoints|jobs|helpers)\//.test(f))
    .sort()
    .map((f) => `${f}\0${files[f]}`)
    .join("\0");
  return sha256(entry + "\0" + relevant).slice(0, 32);
}

export async function loadServerModule(files: FileMap, entry: string): Promise<Record<string, unknown>> {
  const key = serverHash(files, entry);
  let p = moduleCache.get(key);
  if (!p) {
    p = (async () => {
      let code: string;
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
          packages: "external",
          plugins: [vfsPlugin(files)],
          absWorkingDir: ROOT_DIR,
        });
        code = result.outputFiles[0]!.text;
      } catch (e) {
        throw new BuildError(toProblems(e));
      }
      mkdirSync(paths.bundleCache, { recursive: true });
      const file = path.join(paths.bundleCache, `${key}.mjs`);
      if (!existsSync(file)) writeFileSync(file, code);
      return (await import(pathToFileURL(file).href)) as Record<string, unknown>;
    })();
    moduleCache.set(key, p);
    p.catch(() => moduleCache.delete(key));
  }
  return p;
}

/** Compiles everything and reports every problem — the builder's "does it build?" check. */
export async function checkProject(files: FileMap): Promise<BuildProblem[]> {
  const problems: BuildProblem[] = [];
  try {
    await buildClient(files);
  } catch (e) {
    if (e instanceof BuildError) problems.push(...e.problems);
    else throw e;
  }
  for (const f of [...endpointRoutes(files).map((e) => e.file), ...jobFiles(files).map((j) => j.file)]) {
    try {
      const mod = await loadServerModule(files, f);
      if (typeof mod.default !== "function") problems.push({ file: f, text: "Debe exportar por defecto una función (export default async function ...)." });
    } catch (e) {
      if (e instanceof BuildError) problems.push(...e.problems);
      else problems.push({ file: f, text: `Error al cargar: ${(e as Error).message}` });
    }
  }
  return problems;
}
