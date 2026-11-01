/**
 * Visual text edits from the preview: the owner rewrites a text in place and we patch the
 * source directly, without the builder (and without credits), when the change is unambiguous.
 */
import type { FileMap } from "../platform/projects.js";

export type TextEditResult =
  | { ok: true; path: string; content: string }
  | { ok: false; reason: "not_found" | "ambiguous" | "unsafe" | "empty"; matches?: string[] };

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Source files a visible text can live in. Data from the database or an API is not here. */
const SOURCE = /^(pages|components)\/.+\.tsx$/;

/**
 * Finds `before` as JSX text in the project's pages and components (whitespace may differ,
 * as the browser collapses it) and replaces it with `after` when it appears exactly once.
 */
export function replaceVisibleText(files: FileMap, before: string, after: string): TextEditResult {
  const from = before.replace(/\s+/g, " ").trim();
  const to = after.replace(/\s+/g, " ").trim();
  if (!from || !to) return { ok: false, reason: "empty" };
  // JSX would read these as code; leave such edits to the builder.
  if (/[{}<>]/.test(to)) return { ok: false, reason: "unsafe" };
  // Only a whole text between tags, or a whole quoted string (e.g. title="…" or a label in an array).
  const words = from.split(" ").map(escapeRe).join("\\s+");
  const jsxText = new RegExp(`(>\\s*)(${words})(?=\\s*<)`, "g");
  const quoted = new RegExp(`(["'\`])(${words})(?=\\1)`, "g");
  const hits: { path: string; index: number; length: number; quote: string }[] = [];
  for (const [path, content] of Object.entries(files)) {
    if (!SOURCE.test(path) || content.startsWith("base64:")) continue;
    for (const m of content.matchAll(jsxText)) hits.push({ path, index: m.index! + m[1]!.length, length: m[2]!.length, quote: "" });
    for (const m of content.matchAll(quoted)) hits.push({ path, index: m.index! + 1, length: m[2]!.length, quote: m[1]! });
  }
  if (hits.length === 0) return { ok: false, reason: "not_found" };
  if (hits.length > 1) return { ok: false, reason: "ambiguous", matches: [...new Set(hits.map((h) => h.path))] };
  const hit = hits[0]!;
  // Inside a quoted string the new text must not close it early.
  if (hit.quote && to.includes(hit.quote)) return { ok: false, reason: "unsafe" };
  const content = files[hit.path]!;
  return { ok: true, path: hit.path, content: content.slice(0, hit.index) + to + content.slice(hit.index + hit.length) };
}
