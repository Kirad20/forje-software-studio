import { newBuildProblems, newRuntimeProblems, problemKey, type BuildProblem, type RuntimeProblem, type Ownership } from "../domain/FinishGatePolicy.js";
import type { FinishGatePorts } from "../ports/FinishGatePorts.js";

export class CreateFinishGateUseCase<Build extends BuildProblem, Runtime extends RuntimeProblem> {
  constructor(private readonly ports: FinishGatePorts<Build, Runtime>) {}
  async execute(projectId: string, ctx: Ownership): Promise<{ check(): Promise<string | null> }> {
    const since = this.ports.now();
    this.ports.watch(projectId);
    const inspect = () => this.ports.inspect
      ? this.ports.inspect(projectId)
      : this.ports.verify(projectId).then(build => ({ build, standards: [] as Build[] }));
    const start = await inspect();
    const baseline = new Set(start.build.map(problemKey));
    const standardsBaseline = new Set(start.standards.map(problemKey));
    return {
      check: async () => {
        const now = await inspect();
        const build = newBuildProblems(baseline, now.build, ctx);
        const standards = newBuildProblems(standardsBaseline, now.standards, ctx);
        const runtime = newRuntimeProblems(this.ports.runtimeProblems(projectId), since, ctx);
        if (!build.length && !runtime.length && !standards.length) return null;
        const parts = [];
        if (build.length) parts.push(`## Compilación y tipos\n${build.slice(0, 20).map(p => this.ports.formatBuild(p)).join("\n")}`);
        if (standards.length) parts.push(`## Estándares de Forja (contrato, kit de interfaz, tokens, pruebas)\n${standards.slice(0, 12).map(p => this.ports.formatStandard ? this.ports.formatStandard(p) : this.ports.formatBuild(p)).join("\n")}`);
        if (runtime.length) parts.push(`## En la vista previa\n${this.ports.formatRuntime(runtime, 8)}`);
        return parts.join("\n\n");
      },
    };
  }
}
