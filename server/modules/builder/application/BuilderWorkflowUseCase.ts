import { assertRunning, useFastPath, type ChatMode, type BuilderRequestFeatures } from "../domain/BuilderWorkflow.js";
import type { BuilderWorkflowPorts } from "../ports/BuilderWorkflowPorts.js";

export class BuilderWorkflowUseCase<Features extends BuilderRequestFeatures, ApprovedPlan> {
  constructor(private readonly ports: BuilderWorkflowPorts<Features, ApprovedPlan>) {}
  async execute(options: { mode: ChatMode; implementPlan: boolean; synthetic?: boolean }): Promise<void> {
    const p = this.ports;
    try {
      assertRunning(p.signal);
      if ((await p.credits()) <= 0) throw new Error("La cuenta dueña del proyecto no tiene créditos para el constructor.");
      await p.prepare();
      assertRunning(p.signal);
      const features = await p.analyze();
      assertRunning(p.signal);
      const approved = options.implementPlan && options.mode === "build" ? await p.pendingPlan() : null;
      const fast = options.mode === "chat" || (options.mode === "build" && !approved && useFastPath(features));
      p.route(fast, features);
      assertRunning(p.signal);
      if (options.mode === "chat") await p.chat();
      else if (options.mode === "plan") {
        if (!(await p.team({ planOnly: true }))) throw new Error("No pude preparar un plan. Prueba a describir la petición con más detalle.");
      } else if (approved) {
        await p.consumePlan();
        assertRunning(p.signal);
        await p.team({ given: approved });
      } else if (fast) await p.fast();
      else if (!(await p.team({}))) {
        assertRunning(p.signal);
        p.fallback();
        await p.fast();
      }
      assertRunning(p.signal);
      await p.done();
    } catch (error) {
      await p.error(error instanceof Error ? error : new Error(String(error)), p.signal.aborted);
    } finally {
      await p.cleanup();
      if (p.wrote()) await p.checkpoint();
      if (!options.synthetic) {
        p.releaseSync();
        p.updateSummary();
      }
    }
  }
}
