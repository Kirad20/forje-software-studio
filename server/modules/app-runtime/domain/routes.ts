import type { FileMap } from "./publication.js";
import { isExampleFile, layoutEndpoints, layoutJobs, layoutOf, layoutPages, type ProjectLayout } from "../../../../contracts/projectLayout.js";
export interface PageInfo { file: string; pattern: string; component?: string }
export interface EndpointInfo { file: string; method: "GET" | "POST"; route: string; component?: string }
export interface JobInfo { file: string; name: string; component?: string }

/**
 * Pages of the app (root pages/) and of every web component in forja.json, with the
 * component's mount prefixed. Without forja.json: exactly the root pages, as always.
 */
export function pageRoutes(files: FileMap, layout: ProjectLayout = layoutOf(files)): PageInfo[] {
  return layoutPages(files, layout);
}

/** Example files of the app and of web components (components/ or pages/ relative to their root). */
export const exampleFiles = (files: FileMap, layout: ProjectLayout = layoutOf(files)) => Object.keys(files).filter((f) => isExampleFile(f, layout)).sort();

/** Endpoints of the app and of every api component (its route prefixed): `endpoints/todos/list_GET.ts` → `GET todos/list`. */
export function endpointRoutes(files: FileMap, layout: ProjectLayout = layoutOf(files)): EndpointInfo[] {
  return layoutEndpoints(files, layout);
}

/** Jobs of the app (`cleanup`) and of api/worker components (`billing.invoice`). */
export const jobFiles = (files: FileMap, layout: ProjectLayout = layoutOf(files)): JobInfo[] => layoutJobs(files, layout);
export function readJobSettings(source: string): { schedule: string | null; timezone: string | null } {
  const lit = (name: string) => new RegExp(String.raw`export\s+const\s+${name}\s*(?::\s*string)?\s*=\s*(["'` + "`" + String.raw`])([^"'` + "`" + String.raw`\n]+)\1`).exec(source)?.[2] ?? null;
  return { schedule: lit("schedule"), timezone: lit("timezone") };
}
