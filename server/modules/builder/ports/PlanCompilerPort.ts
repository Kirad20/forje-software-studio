export interface PlanCompilerPort {
  compile(contract: string): Promise<string[]>;
}
