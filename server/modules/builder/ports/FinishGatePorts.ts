import type { BuildProblem, RuntimeProblem } from "../domain/FinishGatePolicy.js";

export interface FinishGatePorts<Build extends BuildProblem, Runtime extends RuntimeProblem> {
  now(): number;
  watch(projectId: string): void;
  verify(projectId: string): Promise<Build[]>;
  inspect?(projectId: string): Promise<{ build: Build[]; standards: Build[] }>;
  runtimeProblems(projectId: string): Runtime[];
  formatBuild(problem: Build): string;
  formatStandard?(problem: Build): string;
  formatRuntime(problems: Runtime[], limit: number): string;
}
