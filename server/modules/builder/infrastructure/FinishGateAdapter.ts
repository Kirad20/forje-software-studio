import { formatProblem } from "../../app-runtime/index.js";
import { verifyBuild } from "../../app-runtime/index.js";
import { formatProblems, listProblems, watchProblems } from "../../project-observability/problems.js";
import { readAllFiles, builderCoreModules } from "./CoreModulesAdapter.js";
import { CreateFinishGateUseCase } from "../application/CreateFinishGateUseCase.js";
import type { Ownership } from "../domain/FinishGatePolicy.js";
import { formatStandard, standardsScan } from "../domain/Standards.js";

export async function createFinishGate(projectId: string, ctx: Ownership & { wrote?: boolean }): Promise<{ check(): Promise<string | null> }> {
  if ((await builderCoreModules().projects.getProject?.(projectId))?.runtime === "repository") {
    return {
      async check() {
        if (!ctx.wrote) return null;
        const runtime = builderCoreModules().repositoryRuntime;
        if (!runtime) throw new Error("Repository runtime no configurado; no se ejecutó la verificación nativa.");
        const snapshot = await runtime.build(projectId);
        return snapshot.status === "ready" && snapshot.preview?.status === "ready" ? null : `Repository build falló: ${snapshot.error ?? "No hay una vista previa saludable."}`;
      },
    };
  }
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
