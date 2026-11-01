import path from "node:path";
import type { FileMap } from "../platform/projects.js";
import { resolveImport } from "./index.js";

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
