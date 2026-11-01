import { formatProblem, type BuildProblem } from "../runtime/bundler.js";
import { verifyBuild } from "../runtime/typecheck.js";
import { formatProblems, listProblems, watchProblems, type Problem } from "../platform/problems.js";
import { readAllFiles } from "../platform/projects.js";
import type { ToolContext } from "./tools.js";

/**
 * The finish gate (see AgentSpec.finishGate): what the orchestrator checks itself when an
 * agent that changed files wants to stop.
 *
 * It reports only what is NEW since the agent started, so an old app with type errors does
 * not send every small change on a cleanup tour; a change that breaks an importer elsewhere
 * still shows up. A specialist working in parallel only hears about its own files: the
 * others are still being written.
 */

/** Line numbers move with every edit; a problem is the same if file and message are. */
const key = (p: BuildProblem) => `${p.file}\0${p.text}`;

const mine = (ctx: ToolContext, file: string | undefined) =>
  !ctx.owned || (!!file && ctx.owned.some((o) => file === o || (o.endsWith("/") && file.startsWith(o))));

/** Build and type problems that are new, and that this agent may fix. */
export function newBuildProblems(baseline: Set<string>, now: BuildProblem[], ctx: ToolContext): BuildProblem[] {
  return now.filter((p) => !baseline.has(key(p)) && mine(ctx, p.file));
}

/**
 * Preview problems (browser errors, failed API calls, endpoint crashes) seen since `since`.
 * Only for an agent that owns the whole app: in a team, a failed call may just be an
 * endpoint another agent has not written yet.
 */
export function newRuntimeProblems(list: Problem[], since: number, ctx: ToolContext): Problem[] {
  if (ctx.owned) return [];
  return list.filter((p) => p.kind !== "build" && Date.parse(p.lastAt) >= since);
}

export async function createFinishGate(projectId: string, ctx: ToolContext): Promise<{ check(): Promise<string | null> }> {
  const since = Date.now();
  watchProblems(projectId);
  const baseline = new Set((await verifyBuild(await readAllFiles(projectId))).problems.map(key));
  return {
    async check() {
      const build = newBuildProblems(baseline, (await verifyBuild(await readAllFiles(projectId))).problems, ctx);
      const runtime = newRuntimeProblems(listProblems(projectId), since, ctx);
      if (!build.length && !runtime.length) return null;
      const parts = [];
      if (build.length) parts.push(`## Compilación y tipos\n${build.slice(0, 20).map(formatProblem).join("\n")}`);
      if (runtime.length) parts.push(`## En la vista previa\n${formatProblems(runtime, 8)}`);
      return parts.join("\n\n");
    },
  };
}
