import { createHash } from "node:crypto";
import path from "node:path";
import type { FileMap } from "../platform/projects.js";
import { endpointRoutes, pageRoutes } from "../runtime/bundler.js";

/**
 * A graphify-style index of a project: per-file facts (exports, imports, routes, tables,
 * API calls, components) and the graph between files. Agents read a compact map and
 * fetch only the files they need, instead of reading the whole project every turn.
 * Facts are cached by content hash, so re-indexing after a write only parses that file.
 */
export interface FileFacts {
  path: string;
  kind: "page" | "component" | "endpoint" | "job" | "helper" | "test" | "example" | "style" | "static" | "note" | "other";
  summary: string;
  exports: string[];
  imports: string[];
  tables: string[];
  apiCalls: string[];
  components: string[];
  lines: number;
}

const cache = new Map<string, FileFacts>();
const RESOLVE = ["", ".tsx", ".ts", ".css", "/index.tsx", "/index.ts"];
const SQL_WORDS = new Set(["select", "where", "set", "values", "the", "a", "an", "on", "as", "if", "not", "exists", "lateral", "only", "now", "unnest"]);

/** Dependencies as written in package.json, without validating them (the build does that). */
function declaredDeps(files: FileMap): Record<string, string> {
  try {
    const deps = JSON.parse(files["package.json"] ?? "{}").dependencies;
    return deps && typeof deps === "object" ? deps : {};
  } catch {
    return {};
  }
}

function kindOf(p: string): FileFacts["kind"] {
  if (p.startsWith("static/__dev/")) return "note";
  if (p.startsWith("pages/")) return p.includes(".example.") ? "example" : p.endsWith(".css") ? "style" : "page";
  if (p.startsWith("components/")) return p.includes(".example.") ? "example" : p.endsWith(".css") ? "style" : "component";
  if (p.startsWith("endpoints/")) return "endpoint";
  if (p.startsWith("jobs/")) return "job";
  if (/\.spec\.tsx?$/.test(p)) return "test";
  if (p.startsWith("helpers/")) return "helper";
  if (p.endsWith(".css")) return "style";
  if (p.startsWith("static/")) return "static";
  return "other";
}

function resolveImport(from: string, spec: string, files: FileMap): string | null {
  let target: string;
  if (/^(~|@)\//.test(spec)) target = spec.slice(2);
  else if (spec.startsWith(".")) target = path.posix.normalize(path.posix.join(path.posix.dirname(from), spec));
  else return null;
  return RESOLVE.map((e) => target + e).find((c) => c in files) ?? null;
}

function factsOf(p: string, content: string, files: FileMap): FileFacts {
  const key = createHash("sha1").update(p).update("\0").update(content).digest("hex");
  const hit = cache.get(key);
  // Imports depend on which files exist, so only reuse when they still resolve the same.
  if (hit && hit.imports.every((i) => i in files)) return hit;
  const kind = kindOf(p);
  const code = /\.(tsx?|css)$/.test(p);
  const exports = code
    ? [
        ...new Set([
          ...[...content.matchAll(/export\s+(?:default\s+)?(?:async\s+)?(?:function|const|let|class|interface|type|enum)\s+([A-Za-z0-9_$]+)/g)].map((m) => m[1]!),
          ...(/export\s+default\b/.test(content) ? ["default"] : []),
          ...[...content.matchAll(/export\s*\{([^}]+)\}/g)].flatMap((m) => m[1]!.split(",").map((s) => s.trim().split(/\s+as\s+/).pop()!).filter(Boolean)),
        ]),
      ]
    : [];
  const imports = code
    ? [...new Set([...content.matchAll(/(?:import|from)\s*["']([^"']+)["']/g)].map((m) => resolveImport(p, m[1]!, files)).filter((x): x is string => !!x))]
    : [];
  const tables =
    kind === "endpoint" || kind === "job" || kind === "helper"
      ? [
          ...new Set(
            [...content.matchAll(/\b(?:from|into|update|join|references|table(?:\s+if\s+not\s+exists)?)\s+"?([a-z_][a-z0-9_]*)"?/gi)]
              .map((m) => m[1]!.toLowerCase())
              .filter((t) => !SQL_WORDS.has(t)),
          ),
        ]
      : [];
  const apiCalls = [...new Set([...content.matchAll(/(?:api\.(?:get|post)|useApi)(?:<[^>]*>)?\(\s*["'`]([^"'`$]+)["'`]/g)].map((m) => m[1]!.replace(/^\//, "")))];
  const components = p.endsWith(".tsx") ? [...new Set([...content.matchAll(/<([A-Z][A-Za-z0-9]*)[\s/>]/g)].map((m) => m[1]!))] : [];
  const comment = /^\s*(?:\/\*\*?\s*([\s\S]*?)\*\/|\/\/\s*(.+))/.exec(content.slice(0, 600));
  const summary = (comment?.[1] ?? comment?.[2] ?? "")
    .replace(/\s*\*\s?/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
  const facts: FileFacts = { path: p, kind, summary, exports, imports, tables, apiCalls, components, lines: content.split("\n").length };
  cache.set(key, facts);
  if (cache.size > 20_000) cache.delete(cache.keys().next().value!);
  return facts;
}

export interface ProjectIndex {
  facts: Map<string, FileFacts>;
  importers: Map<string, Set<string>>;
  /** endpoint route → file, to link pages that call it. */
  endpoints: Map<string, string>;
}

export function buildIndex(files: FileMap): ProjectIndex {
  const facts = new Map(Object.entries(files).map(([p, c]) => [p, factsOf(p, c, files)]));
  const importers = new Map<string, Set<string>>();
  for (const f of facts.values()) for (const i of f.imports) (importers.get(i) ?? importers.set(i, new Set()).get(i)!).add(f.path);
  const endpoints = new Map(endpointRoutes(files).map((e) => [e.route, e.file]));
  return { facts, importers, endpoints };
}

const short = (xs: string[], n = 6) => (xs.length > n ? `${xs.slice(0, n).join(", ")} +${xs.length - n}` : xs.join(", "));

/**
 * The whole project in ~1–2k tokens: routes, endpoints and their tables, components and
 * who uses them, helpers, jobs, notes and the database schema. Agents start from this.
 */
export function projectMap(files: FileMap, schema: Record<string, { name: string; type: string }[]> = {}): string {
  const idx = buildIndex(files);
  const all = [...idx.facts.values()];
  const by = (k: FileFacts["kind"]) => all.filter((f) => f.kind === k).sort((a, b) => a.path.localeCompare(b.path));
  const usedBy = (p: string) => [...(idx.importers.get(p) ?? [])];
  const lines = [`# Mapa del proyecto — ${all.length} archivos, ${all.reduce((n, f) => n + f.lines, 0)} líneas`];
  const routes = new Map(pageRoutes(files).map((r) => [r.file, r.pattern]));
  const section = (title: string, items: string[]) => items.length && lines.push(`\n## ${title}`, ...items);
  section(
    "Páginas",
    by("page").map((f) => `${routes.get(f.path) ?? "(layout/especial)"} ← ${f.path}${f.components.length ? ` · usa ${short(f.components)}` : ""}${f.apiCalls.length ? ` · llama ${short(f.apiCalls)}` : ""}`),
  );
  section(
    "Endpoints",
    endpointRoutes(files).map((e) => {
      const f = idx.facts.get(e.file)!;
      return `${e.method} ${e.route}${f.tables.length ? ` · tablas ${short(f.tables)}` : ""}${f.summary ? ` — ${f.summary}` : ""}`;
    }),
  );
  section(
    "Componentes",
    by("component").map((f) => `${f.path} — ${short(f.exports)}${usedBy(f.path).length ? ` · usado por ${short(usedBy(f.path).map((p) => path.posix.basename(p)), 4)}` : " · sin usar"}`),
  );
  section("Helpers", by("helper").map((f) => `${f.path} — ${short(f.exports)}${f.summary ? ` — ${f.summary}` : ""}`));
  section("Tareas", by("job").map((f) => `${f.path}${f.tables.length ? ` · tablas ${short(f.tables)}` : ""}`));
  section("Pruebas y ejemplos", [...by("test"), ...by("example")].map((f) => f.path));
  section("Estilos", by("style").map((f) => f.path));
  section("Notas del constructor", by("note").map((f) => f.path));
  section("Paquetes npm (package.json)", Object.entries(declaredDeps(files)).map(([n, v]) => `${n}@${v}`));
  const tables = Object.entries(schema).filter(([t]) => !t.startsWith("_forja_"));
  section("Base de datos", tables.map(([t, cols]) => `${t}(${cols.map((c) => c.name).join(", ")})`));
  if (Object.keys(schema).some((t) => t === "_forja_users")) lines.push("(auth activo: _forja_users)");
  return lines.join("\n");
}

/** Graph neighbours: what it imports, who imports it, and endpoint ↔ page links. */
export function relatedFiles(files: FileMap, p: string): string[] {
  const idx = buildIndex(files);
  const f = idx.facts.get(p);
  if (!f) return [];
  const out = new Set<string>([...f.imports, ...(idx.importers.get(p) ?? [])]);
  for (const call of f.apiCalls) {
    const ep = idx.endpoints.get(call);
    if (ep) out.add(ep);
  }
  if (f.kind === "endpoint") {
    const route = [...idx.endpoints.entries()].find(([, file]) => file === p)?.[0];
    for (const g of idx.facts.values()) if (route && g.apiCalls.includes(route)) out.add(g.path);
  }
  const css = p.replace(/\.tsx$/, ".module.css");
  if (css !== p && css in files) out.add(css);
  out.delete(p);
  return [...out].sort();
}

/** Where a name is defined and used, with line numbers. */
export function findSymbol(files: FileMap, name: string): string {
  const re = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
  const defs: string[] = [];
  const uses: string[] = [];
  for (const [p, content] of Object.entries(files)) {
    content.split("\n").forEach((line, i) => {
      if (!re.test(line)) return;
      const entry = `${p}:${i + 1}: ${line.trim().slice(0, 160)}`;
      if (/\b(export|function|const|let|class|interface|type|create table)\b/.test(line) && new RegExp(`(function|const|let|class|interface|type|table(?: if not exists)?)\\s+"?${name}\\b`).test(line)) defs.push(entry);
      else if (uses.length < 60) uses.push(entry);
    });
  }
  return [defs.length ? `Definido en:\n${defs.join("\n")}` : "Sin definición encontrada.", uses.length ? `Usos:\n${uses.join("\n")}` : ""].filter(Boolean).join("\n\n");
}

/**
 * Files to preload for a task, best first: the files it owns, their graph neighbours, then
 * files whose path, exports or routes match words in the goal — within a character budget.
 */
export function selectContext(files: FileMap, goal: string, owned: string[], budgetChars = 40_000): string[] {
  const idx = buildIndex(files);
  const words = [...new Set(goal.toLowerCase().match(/[a-záéíóúñ0-9_]{4,}/g) ?? [])];
  const ownedMatch = (p: string) => owned.some((o) => p === o || (o.endsWith("/") && p.startsWith(o)));
  const scores = new Map<string, number>();
  const bump = (p: string, s: number) => p in files && !p.startsWith("static/") && scores.set(p, (scores.get(p) ?? 0) + s);
  for (const f of idx.facts.values()) {
    if (ownedMatch(f.path)) bump(f.path, 10);
    const hay = `${f.path} ${f.exports.join(" ")} ${f.tables.join(" ")} ${f.apiCalls.join(" ")} ${f.summary}`.toLowerCase();
    for (const w of words) if (hay.includes(w)) bump(f.path, 2);
  }
  for (const [p, s] of [...scores]) if (s >= 10) for (const n of relatedFiles(files, p)) bump(n, 3);
  if ("base.css" in files && owned.some((o) => o.startsWith("pages") || o.startsWith("components") || o === "base.css")) bump("base.css", 4);
  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]).map(([p]) => p);
  const out: string[] = [];
  let used = 0;
  for (const p of ranked) {
    const size = files[p]!.length;
    if (used + size > budgetChars) continue;
    out.push(p);
    used += size;
  }
  return out;
}
