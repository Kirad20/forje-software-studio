import type { FileMap } from "./publication.js";
export interface PageInfo { file: string; pattern: string }
export interface EndpointInfo { file: string; method: "GET" | "POST"; route: string }
export interface JobInfo { file: string; name: string }

export function pageRoutes(files: FileMap): PageInfo[] {
  const pages: PageInfo[] = [];
  for (const file of Object.keys(files)) {
    const m = /^pages\/([^/]+)\.tsx$/.exec(file);
    if (!m || m[1]!.endsWith(".module") || m[1]!.includes(".example")) continue;
    const name = m[1]!;
    if (name.startsWith("_") && name !== "_index") continue;
    const segs = name.split(".").filter((s) => s !== "_index").map((s) => s.startsWith("$") ? `:${s.slice(1)}` : s);
    pages.push({ file, pattern: "/" + segs.join("/") });
  }
  const score = (p: string) => p.split("/").map((s) => s.startsWith(":") ? 1 : 0).join("");
  return pages.sort((a, b) => score(a.pattern).localeCompare(score(b.pattern)) || b.pattern.length - a.pattern.length);
}

export const exampleFiles = (files: FileMap) => Object.keys(files).filter((f) => /^(components|pages)\/.+\.example\.tsx$/.test(f)).sort();
export function endpointRoutes(files: FileMap): EndpointInfo[] {
  const out: EndpointInfo[] = [];
  for (const file of Object.keys(files)) {
    const m = /^endpoints\/(.+)_(GET|POST)\.ts$/.exec(file);
    if (m) out.push({ file, route: m[1]!, method: m[2] as "GET" | "POST" });
  }
  return out;
}
export const jobFiles = (files: FileMap): JobInfo[] => Object.keys(files)
  .map((file) => ({ file, m: /^jobs\/([A-Za-z0-9_-]+)\.ts$/.exec(file) }))
  .filter((x) => x.m).map((x) => ({ file: x.file, name: x.m![1]! }));
export function readJobSettings(source: string): { schedule: string | null; timezone: string | null } {
  const lit = (name: string) => new RegExp(String.raw`export\s+const\s+${name}\s*(?::\s*string)?\s*=\s*(["'` + "`" + String.raw`])([^"'` + "`" + String.raw`\n]+)\1`).exec(source)?.[2] ?? null;
  return { schedule: lit("schedule"), timezone: lit("timezone") };
}
