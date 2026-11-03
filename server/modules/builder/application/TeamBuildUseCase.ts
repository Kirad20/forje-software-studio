import { assertRunning } from "../domain/BuilderWorkflow.js";
import type { Plan } from "../domain/OrchestrationPolicy.js";
import type { TeamBuildPorts } from "../ports/TeamBuildPorts.js";

export class TeamBuildUseCase<Result> {
  constructor(private readonly ports: TeamBuildPorts<Result>) {}
  async execute(options: { given?: Plan; planOnly?: boolean }): Promise<boolean> {
    const p = this.ports;
    assertRunning(p.signal);
    const plan = options.given
      ? { ...options.given, later: options.given.later ?? [], tasks: options.given.tasks.map(task => ({ ...task, doneWhen: task.doneWhen ?? [] })) }
      : await p.plan(!!options.planOnly);
    if (!plan) return false;
    p.announce(plan, !!options.given);
    assertRunning(p.signal);
    if (options.planOnly) {
      await p.storePlan(plan);
      return true;
    }
    await p.writeContract(plan);
    assertRunning(p.signal);
    const results = await p.specialists(plan);
    assertRunning(p.signal);
    const outcome = await p.review(plan, results);
    assertRunning(p.signal);
    await p.learn(plan, results, outcome);
    await p.reply(plan, results, outcome);
    return true;
  }
}
