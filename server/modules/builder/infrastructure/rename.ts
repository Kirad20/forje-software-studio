import path from "node:path";
import type { FileMap } from "../../projects/index.js";
import { resolveImport } from "./projectIndex.js";

/** import x from "…", export … from "…", import "…", import("…") */
const SPEC = /((?:import|export)\b[^"'`;]*?\bfrom\s*|\bimport\s*\(?\s*)(["'])([^"']+)\2/g;
const CODE = /\.(tsx?|css)$/;

/** The specifier that points from `fromFile` to `target`, in the same style as `original`. */
function specFor(fromFile: string, target: string, original: string, oldTarget: string): string {
  // Keep the original's extension style: "./Button" stays extensionless, "./Button.module.css" keeps it.
  const oldExt = path.posix.extname(oldTarget);
  const dropExt = !original.endsWith(oldExt) && path.posix.extname(target) === oldExt;
  const bare = dropExt ? target.slice(0, -oldExt.length) : target;
  if (/^(~|@)\//.test(original)) return original.slice(0, 2) + bare;
  let rel = path.posix.relative(path.posix.dirname(fromFile), bare);
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel;
}

/**
 * Many moves at once, in ONE pass over the project (rewriteImports rescans everything per move,
 * which is quadratic for a whole-project migration). An import is rewritten when its target moved
 * or when the importing file moved and the import is relative. Imports that now cross between
 * `groupOf` groups (components) use the "~/" alias, never "../../.." climbing out of a root.
 * Keys are paths AFTER the moves. Pure: nothing is written.
 */
export function rewriteImportsBulk(files: FileMap, moves: ReadonlyMap<string, string>, groupOf: (path: string) => string): FileMap {
  const after: FileMap = {};
  for (const [file, content] of Object.entries(files)) {
    if (!CODE.test(file) || content.startsWith("base64:")) continue;
    const newFile = moves.get(file) ?? file;
    let changed = false;
    const next = content.replace(SPEC, (whole, head: string, quote: string, spec: string) => {
      const target = resolveImport(file, spec, files);
      if (!target) return whole;
      const newTarget = moves.get(target) ?? target;
      if (newTarget === target && !(newFile !== file && spec.startsWith("."))) return whole;
      const crossing = groupOf(newFile) !== groupOf(newTarget);
      const ns = crossing && spec.startsWith(".") ? `~/${stripLike(newTarget, spec, target)}` : specFor(newFile, newTarget, spec, target);
      if (ns === spec) return whole;
      changed = true;
      return `${head}${quote}${ns}${quote}`;
    });
    if (changed) after[newFile] = next;
  }
  return after;
}

/** `target` without the extension the original specifier did not write ("./Button" stays extensionless). */
function stripLike(target: string, original: string, oldTarget: string): string {
  const oldExt = path.posix.extname(oldTarget);
  return !original.endsWith(oldExt) && path.posix.extname(target) === oldExt ? target.slice(0, -oldExt.length) : target;
}

/**
 * New contents for every file whose imports change when `from` moves to `to`: the files
 * that import it, and the moved file itself when its own relative imports change folder.
 * Keys are paths AFTER the rename. Pure: nothing is written.
 */
export function rewriteImports(files: FileMap, from: string, to: string): FileMap {
  const after: FileMap = {};
  for (const [file, content] of Object.entries(files)) {
    if (!CODE.test(file) || content.startsWith("base64:")) continue;
    const newFile = file === from ? to : file;
    let changed = false;
    const next = content.replace(SPEC, (whole, head: string, quote: string, spec: string) => {
      const target = resolveImport(file, spec, files);
      if (!target) return whole;
      const newTarget = target === from ? to : target;
      // Only rewrite what the rename breaks: imports of the moved file, and the moved file's relative imports.
      if (target !== from && !(file === from && spec.startsWith("."))) return whole;
      const ns = specFor(newFile, newTarget, spec, target);
      if (ns === spec) return whole;
      changed = true;
      return `${head}${quote}${ns}${quote}`;
    });
    if (changed) after[newFile] = next;
  }
  return after;
}
