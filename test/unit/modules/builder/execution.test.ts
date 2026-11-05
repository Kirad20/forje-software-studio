import { describe, expect, it, vi } from "vitest";
import { RunAgentUseCase } from "../../../../server/modules/builder/application/RunAgentUseCase.js";
import { ScheduleTasksUseCase } from "../../../../server/modules/builder/application/ScheduleTasksUseCase.js";
import { validatePlan, rewardOf } from "../../../../server/modules/builder/domain/OrchestrationPolicy.js";
import type { BuilderFusionTrace } from "../../../../server/modules/builder/domain/AgentExecution.js";

const usage = { input: 10, output: 2, cacheRead: 3, cacheWrite: 1 };
const model = { id: "m", model: "model", vision: true };
const response = (content: any[]) => ({ model, failed: [], response: { content, usage }, usd: 0.01, credits: 1 });
function fixture(responses: (ReturnType<typeof response> & { totalUsage?: typeof usage; fusion?: BuilderFusionTrace })[]) {
  const messages: any[] = [];
  const events: any[] = [];
  const ports = {
    callModel: vi.fn(async (_request: { messages: any[] }) => responses.shift()!),
    save: vi.fn(async (_project: string, message: any) => { messages.push(message); }),
    countAction: vi.fn(async () => {}),
    newRunId: () => "run",
    now: () => 10,
    recordStep: vi.fn(),
    recordToolCall: vi.fn(),
    recordContextEvent: vi.fn(),
  };
  const spec = {
    role: "fast", messages: [{ role: "user" as const, content: "build" }],
    tools: [] as any[], ctx: { projectId: "p", account: { id: "a" }, wrote: false, written: new Set<string>() },
    maxSteps: 3, signal: { aborted: false }, emit: (e: any) => events.push(e), taskId: "task", turnId: "turn",
    persist: { projectId: "p" },
  };
  return { ports, spec, messages, events, useCase: new RunAgentUseCase(ports) };
}

describe("agent execution through ports", () => {
  it("accounts for every physical call but executes only the accepted proposal and emits metadata only", async () => {
    const totalUsage = { input: 50, output: 20, cacheRead: 9, cacheWrite: 4 };
    const step = { id: "critic-1", phase: "critic" as const, modelId: "reviewer", effort: "high" as const, usage, usd: 0.03, credits: 3, ms: 20 };
    const accepted = {
      ...response([{ type: "tool_use", id: "final", name: "write_file", input: {} }]),
      usd: 0.06, credits: 6, totalUsage,
      fusion: { operationId: "op", effort: "high" as const, pattern: "critique" as const, warnings: ["budget limit"], steps: [step] },
    };
    const f = fixture([accepted]);
    f.spec.maxSteps = 1;
    const write = vi.fn(async () => "written");
    f.spec.tools.push({ name: "write_file", description: "", input_schema: {}, run: write });
    const original = f.ports.callModel.getMockImplementation()!;
    f.ports.callModel.mockImplementation(async request => {
      (request as any).onFusionStep({ ...step, reasoning: "private critic reasoning", content: [{ type: "tool_use", name: "write_file" }] });
      return original(request);
    });

    const result = await f.useCase.execute(f.spec);
    expect(result).toMatchObject({ usage: totalUsage, usd: 0.06, credits: 6 });
    expect(write).toHaveBeenCalledOnce();
    expect(f.ports.countAction).toHaveBeenCalledOnce();
    expect(f.ports.recordStep).toHaveBeenCalledWith(expect.objectContaining({ usage: totalUsage, usd: 0.06 }));
    expect(f.events.find(e => e.type === "fusion_step")).toMatchObject({ taskId: "task", step });
    expect(f.events.find(e => e.type === "fusion_done")).toMatchObject({ pattern: "critique", warnings: ["budget limit"], usd: 0.06 });
    expect(JSON.stringify(f.events)).not.toContain("private critic reasoning");
    expect(f.messages[0].content).toEqual(accepted.response.content);
  });

  it("never executes or persists an unaccepted draft when Fusion exhausts its review budget", async () => {
    const f = fixture([]);
    const write = vi.fn(async () => "written");
    f.spec.tools.push({ name: "write_file", description: "", input_schema: {}, run: write });
    f.ports.callModel.mockImplementation(async request => {
      (request as any).onFusionStep({ id: "draft", phase: "draft", modelId: "author", effort: "low", ms: 10, usage, usd: 0.01, credits: 1,
        content: [{ type: "tool_use", id: "draft-tool", name: "write_file", input: {} }] });
      throw new Error("Review budget exhausted");
    });
    await expect(f.useCase.execute(f.spec)).rejects.toThrow("Review budget exhausted");
    expect(write).not.toHaveBeenCalled();
    expect(f.ports.countAction).not.toHaveBeenCalled();
    expect(f.ports.save).not.toHaveBeenCalled();
    expect(f.events.map(e => e.type)).toEqual(["fusion_step"]);
    expect(JSON.stringify(f.events)).not.toContain("draft-tool");
  });

  it("audits measured file-result bytes and correlation IDs without leaking paths or contents", async () => {
    const f = fixture([{
      ...response([{ type: "tool_use", id: "read", name: "read_files", input: { paths: ["private.ts"] } }]),
      fusion: { operationId: "trace", effort: "standard", pattern: "single", warnings: [], steps: [] },
    }]);
    f.spec.maxSteps = 1;
    f.spec.tools.push({ name: "read_files", description: "", input_schema: {}, run: async () => "á💡private source" });
    await f.useCase.execute(f.spec);
    expect(f.ports.recordContextEvent).toHaveBeenCalledExactlyOnceWith({
      projectId: "p", turnId: "turn", taskId: "task", agentId: "run", traceId: "trace",
      kind: "file_read", measured: true, bytes: new TextEncoder().encode("á💡private source").length, count: 1,
    });
    expect(JSON.stringify(f.ports.recordContextEvent.mock.calls)).not.toContain("private");
  });

  it("runs tools concurrently, keeps thinking blocks, persists text results, bills every model response", async () => {
    const thinking = { type: "thinking", thinking: "reason", signature: "sig" };
    const f = fixture([
      response([thinking, { type: "tool_use", id: "1", name: "screenshot", input: {} }, { type: "tool_use", id: "2", name: "missing", input: {} }]),
      response([{ type: "text", text: "Done" }]),
    ]);
    f.spec.tools.push({ name: "screenshot", description: "", input_schema: {}, run: async () => ({ text: "shot", images: [{ media_type: "image/png", data: "pixels" }] }) });
    const result = await f.useCase.execute(f.spec);
    expect(result).toMatchObject({ text: "Done", usd: 0.02, credits: 2, toolErrors: 1 });
    expect(result.usage).toEqual({ input: 20, output: 4, cacheRead: 6, cacheWrite: 2 });
    expect(f.messages[0].content[0]).toBe(thinking);
    expect(f.messages[1].content.map((b: any) => b.type)).toEqual(["tool_result", "tool_result"]);
    expect(f.ports.callModel.mock.calls[1]![0].messages[2].content.at(-1).type).toBe("image");
    expect(f.events.filter(e => e.type === "tool_end").every(e => e.taskId === "task")).toBe(true);
    expect(f.ports.countAction).toHaveBeenCalledTimes(2);
    expect(result.steps.find(s => s.tool === "missing")).toMatchObject({ ok: false, output: "Error: Herramienta no disponible para este agente: missing" });
  });

  it("keeps a bounded diagnostic for failed tools without persisting successful tool contents in task steps", async () => {
    const f = fixture([response([
      { type: "tool_use", id: "1", name: "broken", input: {} },
      { type: "tool_use", id: "2", name: "read", input: {} },
    ])]);
    f.spec.maxSteps = 1;
    f.spec.tools.push(
      { name: "broken", description: "", input_schema: {}, run: async () => { throw new Error("database unavailable\n" + "x".repeat(3000)); } },
      { name: "read", description: "", input_schema: {}, run: async () => "successful contents" },
    );
    const result = await f.useCase.execute(f.spec);
    const failed = result.steps.find(s => s.tool === "broken")!;
    expect(failed.output).toHaveLength(2000);
    expect(failed.output).toMatch(/^Error: database unavailable\n/);
    expect(result.steps.find(s => s.tool === "read")).not.toHaveProperty("output");
    expect(f.events.find(e => e.id === "1" && e.type === "tool_end").output).toBe(failed.output);
  });

  it("reminds a missing required tool once and grants a further step", async () => {
    const f = fixture([response([{ type: "text", text: "plan" }]), response([{ type: "tool_use", id: "1", name: "submit_plan", input: {} }])]);
    f.spec.maxSteps = 1;
    f.spec.tools.push({ name: "submit_plan", description: "", input_schema: {}, run: async () => "ok" });
    const result = await f.useCase.execute({ ...f.spec, requiredTool: "submit_plan" });
    expect(f.ports.callModel).toHaveBeenCalledTimes(2);
    expect(result.steps[0].ok).toBe(true);
    expect(result.hitStepLimit).toBe(true);
  });

  it("enforces finish gate retries, then records a failed verdict", async () => {
    const f = fixture([response([]), response([]), response([])]);
    f.spec.ctx.wrote = true;
    const check = vi.fn(async () => "broken");
    const result = await f.useCase.execute({ ...f.spec, finishGate: { check } });
    expect(result).toMatchObject({ gate: "failed", gateFixes: 2 });
    expect(check).toHaveBeenCalledTimes(3);
    expect(f.ports.callModel.mock.calls.every(([request]) => (request as any).decisionBoundary)).toBe(true);
  });

  it("records a gate infrastructure failure visibly without claiming a pass", async () => {
    const f = fixture([response([])]);
    f.spec.ctx.wrote = true;
    const result = await f.useCase.execute({ ...f.spec, finishGate: { check: async () => { throw new Error("unavailable"); } } });
    expect(result.gate).toBe(null);
    expect(f.events.find(e => e.type === "tool_end")).toMatchObject({ ok: false, output: "No se pudo comprobar: unavailable" });
  });

  it("stops before provider or persistence I/O when cancelled", async () => {
    const f = fixture([]);
    f.spec.signal.aborted = true;
    await expect(f.useCase.execute(f.spec)).rejects.toThrow("Detenido.");
    expect(f.ports.callModel).not.toHaveBeenCalled();
  });

  it("runs independent tools concurrently and still gates last-step file changes", async () => {
    const f = fixture([response([
      { type: "tool_use", id: "1", name: "first", input: {} },
      { type: "tool_use", id: "2", name: "second", input: {} },
    ])]);
    f.spec.maxSteps = 1;
    let release!: () => void;
    const started = new Promise<void>(resolve => { release = resolve; });
    f.spec.tools.push(
      { name: "first", description: "", input_schema: {}, run: async () => {
        await started;
        f.spec.ctx.wrote = true;
        f.spec.ctx.written.add("pages/a.tsx");
        return "written";
      } },
      { name: "second", description: "", input_schema: {}, run: async () => { release(); return "read"; } },
    );
    const check = vi.fn(async () => null);
    const result = await f.useCase.execute({ ...f.spec, finishGate: { check } });
    expect(result).toMatchObject({ hitStepLimit: true, gate: "passed", written: ["pages/a.tsx"] });
    expect(check).toHaveBeenCalledOnce();
  });

  it("omits image bytes for non-vision models and tracks build and test tool verdicts", async () => {
    const call = response([
      { type: "tool_use", id: "1", name: "check_build", input: {} },
      { type: "tool_use", id: "2", name: "run_tests", input: {} },
      { type: "tool_use", id: "3", name: "shot", input: {} },
    ]);
    call.model = { ...model, vision: false };
    const f = fixture([call]);
    f.spec.maxSteps = 1;
    f.spec.tools.push(
      { name: "check_build", description: "", input_schema: {}, run: async () => "Compila sin errores" },
      { name: "run_tests", description: "", input_schema: {}, run: async () => "tests failed" },
      { name: "shot", description: "", input_schema: {}, run: async () => ({ text: "shot", images: [{ media_type: "image/png", data: "secret-pixels" }] }) },
    );
    const result = await f.useCase.execute(f.spec);
    expect(result).toMatchObject({ buildOk: true, testsOk: false });
    expect(JSON.stringify(f.messages)).not.toContain("secret-pixels");
    expect(JSON.stringify(f.messages)).toContain("captura(s) omitida(s)");
  });
});

describe("orchestration policies", () => {
  it("rejects invalid role ownership, duplicate ids and impossible dependencies rather than silently repairing", () => {
    const result = validatePlan({ tasks: [
      { id: "a", role: "backend", goal: "api", files: ["helpers/types.ts"], depends_on: ["b"], done_when: ["works"] },
      { id: "a", role: "data", goal: "types", files: ["helpers/types.ts"], done_when: ["works"] },
      { id: "b", role: "ui", goal: "ui", files: ["pages/a.tsx", "endpoints/a_GET.ts"], depends_on: ["a", "b", "unknown"], done_when: ["works"] },
    ], contract: "contract" });
    expect(result.plan).toBeNull();
    expect(result.errors.join("\n")).toMatch(/repetido/);
    expect(result.errors.join("\n")).toMatch(/comparten archivos/);
    expect(result.errors.join("\n")).toMatch(/depende de sí misma/);
  });
  it("reports malformed planner tasks without violating folder ownership", () => {
    const result = validatePlan({ tasks: [null, { role: "toString", goal: "bad" }, { role: "ui", goal: "ok", files: "pages/a.tsx", depends_on: 1 }] });
    expect(result.plan).toBeNull();
    expect(result.errors.join("\n")).toMatch(/role debe ser/);
  });
  it("penalizes objectively broken or unverified changes", () => {
    const result = { buildOk: null, testsOk: null, hitStepLimit: false, toolErrors: 0, gate: null, gateFixes: 0, written: ["a"] };
    expect(rewardOf(result, true)).toBe(0.5);
    expect(rewardOf({ ...result, gate: "failed", gateFixes: 2, toolErrors: 10 }, false)).toBe(0);
  });
});

describe("dependency scheduler", () => {
  it("respects parallel capacity and starts dependents after failed prerequisites too", async () => {
    let concurrent = 0;
    let maximum = 0;
    const finished = new Set<string>();
    const tasks = [{ id: "a", dependsOn: [] }, { id: "b", dependsOn: [] }, { id: "c", dependsOn: ["a", "b"] }];
    const results = await new ScheduleTasksUseCase().execute(tasks, 2, { aborted: false }, async t => {
      expect(t.dependsOn.every(d => finished.has(d))).toBe(true);
      maximum = Math.max(maximum, ++concurrent);
      await Promise.resolve();
      concurrent--;
      finished.add(t.id);
      if (t.id === "a") throw new Error("failed");
      return t.id;
    });
    expect(maximum).toBe(2);
    expect(results.get("a")).toBeInstanceOf(Error);
    expect(results.get("c")).toBe("c");
  });
  it("rejects duplicate ids and impossible capacity instead of hanging", async () => {
    const scheduler = new ScheduleTasksUseCase();
    await expect(scheduler.execute([{ id: "a", dependsOn: [] }, { id: "a", dependsOn: [] }], 1, { aborted: false }, async () => 1)).rejects.toThrow("duplicate");
    await expect(scheduler.execute([{ id: "a", dependsOn: [] }], 0, { aborted: false }, async () => 1)).rejects.toThrow("limit");
    await expect(scheduler.execute([{ id: "a", dependsOn: ["unknown"] }], 1, { aborted: false }, async () => 1)).rejects.toThrow("dependencies");
  });
});
