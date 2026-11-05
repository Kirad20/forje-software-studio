import type { AgentExecutionResult } from "./AgentExecution.js";
import { ROLE_FOLDERS, CONTRACT_FILE, covers, type PlanTask, type SpecialistRole } from "./Plan.js";
export { ROLE_FOLDERS, PLAN_DOC, checkPlanDoc, validatePlan, type Plan, type PlanTask, type SpecialistRole } from "./Plan.js";

export interface Review {
  ok: boolean;
  summary: string;
  issues: { role: SpecialistRole; files: string[]; problem: string; fix: string }[];
}
export function rewardOf(r: Pick<AgentExecutionResult, "buildOk" | "testsOk" | "hitStepLimit" | "toolErrors" | "gate" | "gateFixes" | "written">, reviewOk: boolean | null): number {
  let reward = reviewOk === false ? 0.4 : reviewOk === true ? 1 : 0.7;
  if (r.buildOk === false || r.gate === "failed") reward = Math.min(reward, 0.2);
  else if (r.written.length && r.gate === null && r.buildOk === null) reward = Math.min(reward, 0.5);
  reward -= 0.1 * r.gateFixes;
  if (r.testsOk === false) reward -= 0.2;
  if (r.hitStepLimit) reward -= 0.3;
  reward -= Math.min(0.3, r.toolErrors * 0.05);
  return Math.max(0, Math.min(1, reward));
}

export function reviewFixTasks(tasks: PlanTask[], review: Review, round: number): PlanTask[] {
  const claimed = new Set<string>();
  const fixes: PlanTask[] = [];
  for (const role of ["data", "backend", "ui"] as const) {
    const issues = review.issues.filter(issue => issue.role === role);
    if (!issues.length) continue;
    const original = tasks.filter(task => task.role === role).flatMap(task => task.files);
    const files = [...new Set([...issues.flatMap(issue => issue.files), ...original])]
      .filter(file => ROLE_FOLDERS[role].test(file) && !covers(file, CONTRACT_FILE) && ![...claimed].some(owner => covers(owner, file) || covers(file, owner)));
    files.forEach(file => claimed.add(file));
    fixes.push({
      id: `${role}-fix${round}`,
      role,
      goal: `Corrige lo que encontró la revisión:\n${issues.map(issue => `- ${issue.problem}${issue.fix ? ` → ${issue.fix}` : ""}${issue.files.length ? ` (${issue.files.join(", ")})` : ""}`).join("\n")}`,
      files,
      dependsOn: [],
      doneWhen: [],
    });
  }
  return fixes;
}
