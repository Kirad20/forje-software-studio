import { formatProblem } from "../../../runtime/bundler.js";
import { verifyBuild } from "../../../runtime/typecheck.js";
import { formatProblems, listProblems, watchProblems } from "../../../platform/problems.js";
import { readAllFiles } from "../../../platform/projects.js";
import { CreateFinishGateUseCase } from "../application/CreateFinishGateUseCase.js";
import type { Ownership } from "../domain/FinishGatePolicy.js";
import { formatStandard, standardsScan } from "../domain/Standards.js";

export function createFinishGate(projectId: string, ctx: Ownership): Promise<{ check(): Promise<string | null> }> {
  return new CreateFinishGateUseCase({
    now: () => Date.now(),
    watch: watchProblems,
    verify: async id => (await verifyBuild(await readAllFiles(id))).problems,
    inspect: async id => {
      const files = await readAllFiles(id);
      return { build: (await verifyBuild(files)).problems, standards: standardsScan(files) };
    },
    runtimeProblems: listProblems,
    formatBuild: formatProblem,
    formatStandard,
    formatRuntime: formatProblems,
  }).execute(projectId, ctx);
}
