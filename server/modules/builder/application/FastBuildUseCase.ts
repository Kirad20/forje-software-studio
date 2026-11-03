import { assertRunning } from "../domain/BuilderWorkflow.js";
import type { FastBuildPorts } from "../ports/FastBuildPorts.js";

export class FastBuildUseCase<Result extends { text: string }, Problem extends { title: string }> {
  constructor(private readonly ports: FastBuildPorts<Result, Problem>) {}
  async execute(): Promise<void> {
    const p = this.ports;
    assertRunning(p.signal);
    const result = await p.run();
    const initial = result.text || "Listo.";
    let reply = initial;
    let broken = p.wrote() ? await p.check() : [];
    await p.learn(result, broken);
    for (let round = 1; round <= 2 && broken.length && !p.signal.aborted; round++) {
      const fix = await p.fix(round, reply, broken);
      broken = await p.check();
      if (fix.text) reply += `\n\n${fix.text}`;
    }
    if (broken.length) reply += `\n\n⚠ Todavía no compila: ${broken[0]!.title}`;
    await p.reply(reply, initial);
  }
}
