import { spawn } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";

import { ROOT_DIR } from "../config.js";
import type { FileMap } from "../platform/projects.js";
import { checkProject, type BuildProblem } from "./bundler.js";
import { depsDir, readDeps } from "./deps.js";

/**
 * Type-checks a project's TypeScript with the native compiler (TypeScript 7). esbuild only
 * strips types, so without this a wrong prop, a field that does not exist or an API shape
 * that does not match the contract builds fine and breaks at run time.
 *
 * The settings aim at real bugs, not style: strict, but without noImplicitAny and
 * strictNullChecks, which flood generated code with noise. Missing modules are left to
 * esbuild, which already reports them in the builder's words.
 *
 * Best effort: when the compiler is missing, times out or crashes, it returns no problems
 * (and says so on the console) instead of blocking the builder.
 */

const require = createRequire(import.meta.url);
const SDK = path.join(ROOT_DIR, "sdk");
const MODULES = path.join(ROOT_DIR, "node_modules");
const TIMEOUT_MS = 60_000;
const MAX_PROBLEMS = 40;
/** Diagnostics that duplicate esbuild's or only mean "no types for this package". */
const IGNORED = new Set([2307, 2792, 7016, 2875]);

const AMBIENT = `declare module "*.module.css" { const classes: Record<string, string>; export default classes; }
declare module "*.css";
declare module "*.svg" { const url: string; export default url; }
declare module "*.png" { const url: string; export default url; }
declare module "*.jpg" { const url: string; export default url; }
declare module "*.webp" { const url: string; export default url; }
`;

function tsconfig(depsFolder: string | null) {
  const lookup = (spec: string) => [...(depsFolder ? [path.join(depsFolder, "node_modules", spec)] : []), path.join(MODULES, spec)];
  return {
    compilerOptions: {
      target: "ES2023",
      module: "ESNext",
      moduleResolution: "Bundler",
      jsx: "react-jsx",
      lib: ["ES2023", "DOM", "DOM.Iterable"],
      strict: true,
      noImplicitAny: false,
      strictNullChecks: false,
      noEmit: true,
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      // Endpoints and jobs run on Node and may import its modules; pages cannot (esbuild
      // already refuses node: imports in the browser bundle), so one program serves both.
      types: ["node"],
      typeRoots: [path.join(MODULES, "@types")],
      paths: {
        "~/*": ["./*"],
        "@/*": ["./*"],
        "@forja/client": [path.join(SDK, "client", "index.ts")],
        "@forja/ui": [path.join(SDK, "ui", "index.tsx")],
        "@forja/server": [path.join(SDK, "server", "index.ts")],
        // One React, Forja's, with its types (the packages themselves ship none).
        react: [path.join(MODULES, "@types", "react")],
        "react/*": [path.join(MODULES, "@types", "react", "*")],
        "react-dom": [path.join(MODULES, "@types", "react-dom")],
        "react-dom/*": [path.join(MODULES, "@types", "react-dom", "*")],
        "*": lookup("*"),
      },
    },
    include: ["**/*.ts", "**/*.tsx"],
  };
}

const isSource = (f: string) => /\.(tsx?|d\.ts)$/.test(f) && !f.startsWith("static/");

/** `file(line,col): error TS1234: message`, plus indented continuation lines. */
export function parseDiagnostics(out: string, known: Set<string>): BuildProblem[] {
  const problems: BuildProblem[] = [];
  let last: BuildProblem | null = null;
  for (const line of out.split(/\r?\n/)) {
    const m = /^(.+?)\((\d+),(\d+)\): error TS(\d+): (.*)$/.exec(line);
    if (m) {
      const file = m[1]!.replace(/\\/g, "/").replace(/^\.\//, "");
      last = null;
      if (IGNORED.has(Number(m[4])) || !known.has(file)) continue;
      last = { file, line: Number(m[2]), column: Number(m[3]), text: `Tipo: ${m[5]}` };
      problems.push(last);
    } else if (last && /^\s+\S/.test(line) && last.text.length < 600) {
      last.text += ` ${line.trim()}`;
    } else if (!line.trim()) last = null;
  }
  return problems;
}

function tscPath(): string | null {
  try {
    return path.join(path.dirname(require.resolve("typescript/package.json")), "bin", "tsc");
  } catch {
    return null;
  }
}

function run(cmd: string, args: string[], cwd: string): Promise<{ code: number | null; out: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cmd, ...args], { cwd, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`tiempo agotado (${TIMEOUT_MS / 1000} s)`));
    }, TIMEOUT_MS);
    child.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, out });
    });
  });
}

export async function typecheckProject(files: FileMap): Promise<BuildProblem[]> {
  const sources = Object.keys(files).filter(isSource);
  if (!sources.length) return [];
  const tsc = tscPath();
  if (!tsc) return [];
  const deps = readDeps(files);
  const dir = await mkdtemp(path.join(tmpdir(), "forja-tsc-"));
  try {
    for (const f of sources) {
      const target = path.join(dir, f);
      if (!target.startsWith(dir + path.sep)) continue;
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, files[f]!);
    }
    await writeFile(path.join(dir, "forja-env.d.ts"), AMBIENT);
    await writeFile(path.join(dir, "tsconfig.json"), JSON.stringify(tsconfig(Object.keys(deps).length ? depsDir(deps) : null)));
    const { code, out } = await run(tsc, ["-p", "tsconfig.json", "--pretty", "false"], dir);
    const problems = parseDiagnostics(out, new Set(sources));
    if (code !== 0 && !problems.length && !/error TS\d+/.test(out)) console.warn(`[typecheck] el compilador falló: ${out.slice(0, 500)}`);
    return problems.slice(0, MAX_PROBLEMS);
  } catch (e) {
    console.warn(`[typecheck] omitido: ${(e as Error).message}`);
    return [];
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

/**
 * What check_build and the builder's finish gate run: compile everything, and only when it
 * compiles, check the types (a syntax error would just repeat as type errors).
 */
export async function verifyBuild(files: FileMap): Promise<{ ok: boolean; problems: BuildProblem[] }> {
  const compiled = await checkProject(files);
  const problems = compiled.length ? compiled : await typecheckProject(files);
  return { ok: !problems.length, problems };
}
