import type { AgentEvent, AgentExecutionResult, ExecutionModel } from "../domain/AgentExecution.js";
import { requiresFinishGate } from "../domain/BuilderWorkflow.js";
import type { LaneTask, TaskLanePorts } from "../ports/TaskLanePorts.js";
import { TaskLifecycleUseCase } from "./TaskLifecycleUseCase.js";

export class RunTaskLaneUseCase<Input, M extends ExecutionModel, Task extends LaneTask> {
  constructor(private readonly ports: TaskLanePorts<Input, M, Task>) {}
  async execute(scope: { projectId: string; turnId: string }, task: Task, input: Input): Promise<AgentExecutionResult<M>> {
    const lifecycle = new TaskLifecycleUseCase(this.ports.repository);
    const steps = new Map<string, AgentExecutionResult["steps"][number]>();
    const emit = (event: AgentEvent) => {
      if (event.type === "tool_start") steps.set(event.id, { tool: event.name, summary: event.summary, ok: false });
      if (event.type === "tool_end") {
        const step = steps.get(event.id);
        if (step) Object.assign(step, { ok: event.ok, ...(!event.ok ? { output: event.output.slice(0, 2000) } : {}) });
      }
      this.ports.emit(event);
    };
    await lifecycle.insert(scope, task);
    try {
      let finishGate: { check(): Promise<string | null> } | undefined;
      try {
        if (requiresFinishGate(task.role)) finishGate = await this.ports.createGate(task, input);
      } catch (error) {
        const id = `gate-${scope.turnId}-${task.id}-setup`;
        emit({ type: "tool_start", id, name: "finish_gate", summary: "Comprobación automática antes de terminar", taskId: task.id });
        emit({ type: "tool_end", id, ok: false, output: `No se pudo comprobar: ${(error as Error).message}`, taskId: task.id });
      }
      const result = await this.ports.run(task, input, {
        emit,
        finishGate,
        onModel: async (model, reason) => {
          await lifecycle.start(scope.turnId, task.id, model.id);
          this.ports.emit({ type: "task_start", taskId: task.id, role: task.role, model: model.label, reason });
        },
      });
      this.ports.recordResult?.(result);
      await lifecycle.finish(scope.turnId, task.id, result, steps.size ? [...steps.values()] : undefined);
      this.ports.emit({ type: "task_end", taskId: task.id, ok: true, summary: result.text.slice(0, 600), usd: result.usd, tokens: result.usage.input + result.usage.cacheRead + result.usage.cacheWrite + result.usage.output });
      return result;
    } catch (error) {
      const failure = error instanceof Error ? error : new Error(String(error));
      await lifecycle.finish(scope.turnId, task.id, failure, [...steps.values()]);
      this.ports.emit({ type: "task_end", taskId: task.id, ok: false, summary: failure.message, usd: 0, tokens: 0 });
      throw failure;
    }
  }
}
