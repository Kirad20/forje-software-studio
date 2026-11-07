export interface BuildProblem {
  file?: string;
  text: string;
  line?: number;
}
export interface RuntimeProblem {
  kind: string;
  lastAt: string;
}
export interface Ownership {
  owned?: string[];
}
export const problemKey = (p: BuildProblem) => `${p.file}\0${p.text}`;
export const isSafeProjectPath = (file: string) =>
  !!file && !file.startsWith("/") && !file.includes("\\") && !file.includes(":") && !file.includes("\0") &&
  file.split("/").every(part => !!part && part !== "." && part !== "..");
export const isMigrationPath = (file: string) => file === "migrations" || file.startsWith("migrations/");
export const ownsFile = (ctx: Ownership, file: string | undefined) =>
  !ctx.owned || (!!file && ctx.owned.some(o => file === o || (o.endsWith("/") && file.startsWith(o))));
export function newBuildProblems<P extends BuildProblem>(baseline: Set<string>, now: P[], ctx: Ownership): P[] {
  return now.filter(p => !baseline.has(problemKey(p)) && ownsFile(ctx, p.file));
}
export function newRuntimeProblems<P extends RuntimeProblem>(list: P[], since: number, ctx: Ownership): P[] {
  if (ctx.owned) return [];
  return list.filter(p => p.kind !== "build" && Date.parse(p.lastAt) >= since);
}
