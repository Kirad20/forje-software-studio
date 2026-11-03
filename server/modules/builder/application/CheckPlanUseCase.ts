import { checkContract, validatePlan, type Plan } from "../domain/Plan.js";
import type { PlanCompilerPort } from "../ports/PlanCompilerPort.js";

export class CheckPlanUseCase {
  constructor(private readonly compiler: PlanCompilerPort) {}
  async execute(raw: unknown): Promise<{ plan: Plan | null; errors: string[] }> {
    const { plan, errors } = validatePlan(raw);
    if (!plan) return { plan, errors };
    errors.push(...checkContract(plan));
    if (!errors.length) errors.push(...await this.compiler.compile(plan.contract));
    return { plan: errors.length ? null : plan, errors };
  }
}
