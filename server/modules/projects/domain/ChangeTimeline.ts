import type { FileMap, TurnFileChange } from "./ProjectSnapshot.js";

export type BeforeImage = Record<string, string | null>;

/** Newest-first undo records collapse to the earliest before-image for each path. */
export function restoredFiles(newestFirst: { before: BeforeImage }[]): Map<string, string | null> {
  const desired = new Map<string, string | null>();
  for (const change of newestFirst) {
    for (const [path, content] of Object.entries(change.before)) desired.set(path, content);
  }
  return desired;
}

export function beforeImages(paths: Iterable<string>, files: FileMap): BeforeImage {
  return Object.fromEntries([...paths].map((path) => [path, files[path] ?? null]));
}

export function turnFileChange(path: string, before: string | null, after: string | null): TurnFileChange | undefined {
  if (before === after) return undefined;
  const kind = before === null ? "create" : after === null ? "delete" : "edit";
  const diffable = (s: string | null) => s === null || (!s.startsWith("base64:") && s.length <= 200_000);
  return diffable(before) && diffable(after)
    ? { path, kind, before, after }
    : { path, kind, before: null, after: null, omitted: true };
}
