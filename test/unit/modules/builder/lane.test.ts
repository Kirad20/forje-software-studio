import { describe, expect, it, vi } from "vitest";
import { RunTaskLaneUseCase } from "../../../../server/modules/builder/application/RunTaskLaneUseCase.js";

const result = { text: "done", model: null, usage: { input: 1, output: 2, cacheRead: 3, cacheWrite: 4 }, usd: 0.01, credits: 1, steps: [], buildOk: null, testsOk: null, toolErrors: 0, hitStepLimit: false, written: [], gate: null, gateFixes: 0 };
const task = { id: "ui", role: "ui", goal: "build", files: ["pages/a.tsx"], dependsOn: [] };
function fixture() {
  const events: any[] = [];
  const repository = { insert: vi.fn(async (_task: any) => {}), start: vi.fn(async (_id: string, _model: string) => {}), finish: vi.fn(async (_id: string, _completion: any) => {}) };
  const ports = {
    repository, emit: (e: any) => events.push(e), createGate: vi.fn(async () => undefined),
    run: vi.fn(async (_task: any, _input: any, hooks: any) => {
      await hooks.onModel({ id: "m", model: "model", vision: true, label: "Model" }, "why");
      expect(repository.start).toHaveBeenCalledWith("t:ui", "m");
      return result;
    }),
  };
  return { events, ports, useCase: new RunTaskLaneUseCase(ports) };
}
describe("task lane orchestration", () => {
  it("creates, starts and finishes a persisted lane around agent execution", async () => {
    const f = fixture();
    expect(await f.useCase.execute({ projectId: "p", turnId: "t" }, task, {})).toBe(result);
    expect(f.ports.repository.insert).toHaveBeenCalledWith({ ...task, id: "t:ui", projectId: "p", turnId: "t" });
    expect(f.events).toEqual([
      { type: "task_start", taskId: "ui", role: "ui", model: "Model", reason: "why" },
      { type: "task_end", taskId: "ui", ok: true, summary: "done", usd: 0.01, tokens: 10 },
    ]);
  });
  it("persists failed execution and emits failure, then propagates the original error", async () => {
    const f = fixture();
    f.ports.run.mockRejectedValueOnce(new Error("provider down"));
    await expect(f.useCase.execute({ projectId: "p", turnId: "t" }, task, {})).rejects.toThrow("provider down");
    expect(f.ports.repository.finish.mock.calls[0]![1].status).toBe("failed");
    expect(f.events.at(-1)).toMatchObject({ type: "task_end", ok: false, summary: "provider down" });
  });
  it("reports unavailable gate setup visibly rather than silently disabling verification", async () => {
    const f = fixture();
    f.ports.createGate.mockRejectedValueOnce(new Error("verifier down"));
    await f.useCase.execute({ projectId: "p", turnId: "t" }, task, {});
    expect(f.events.find(e => e.type === "tool_end")).toMatchObject({ type: "tool_end", taskId: "ui", ok: false, output: "No se pudo comprobar: verifier down" });
    expect(f.ports.repository.finish.mock.calls[0]![1].steps).toEqual([{ tool: "finish_gate", summary: "Comprobación automática antes de terminar", ok: false, output: "No se pudo comprobar: verifier down" }]);
  });
  it.each([false, true])("retains tool error diagnostics when execution fails later: %s", async (crash) => {
    const f = fixture();
    f.ports.run.mockImplementationOnce(async (_task, _input, hooks) => {
      hooks.emit({ type: "tool_start", id: "tool-1", name: "execute_sql", summary: "select * from missing", taskId: "ui" });
      hooks.emit({ type: "tool_end", id: "tool-1", ok: false, output: "Error: relation missing does not exist", taskId: "ui" });
      if (crash) throw new Error("provider down after tool");
      return result;
    });
    const execution = f.useCase.execute({ projectId: "p", turnId: "t" }, task, {});
    if (crash) await expect(execution).rejects.toThrow("provider down after tool");
    else await execution;
    expect(f.ports.repository.finish.mock.calls[0]![1]).toMatchObject({
      status: crash ? "failed" : "done",
      steps: [{ tool: "execute_sql", summary: "select * from missing", ok: false, output: "Error: relation missing does not exist" }],
    });
  });
});
