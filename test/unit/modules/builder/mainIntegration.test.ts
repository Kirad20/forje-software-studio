import { describe, expect, it, vi } from "vitest";
import { CheckPlanUseCase } from "../../../../server/modules/builder/application/CheckPlanUseCase.js";
import { CreateFinishGateUseCase } from "../../../../server/modules/builder/application/CreateFinishGateUseCase.js";
import { RunAgentUseCase } from "../../../../server/modules/builder/application/RunAgentUseCase.js";
import type { Block, Message } from "../../../../server/modules/builder/domain/AgentExecution.js";

describe("latest main features through module ports", () => {
  it("validates contract ownership before compilation and propagates compiler I/O failures", async () => {
    const source = 'import { z } from "zod"; export const contract = { "GET list": { input: z.object({}), output: z.string() } } as const;';
    const compile = vi.fn(async (_source: string) => [] as string[]);
    const useCase = new CheckPlanUseCase({ compile });
    const raw = { summary: "build", contract: source, tasks: [{ id: "api", role: "backend", goal: "list", files: ["endpoints/list_GET.ts"], done_when: ["GET list responds"], depends_on: [] }] };
    const checked = await useCase.execute(raw);
    expect(checked.plan?.tasks[0]?.doneWhen).toEqual(["GET list responds"]);
    expect(compile).toHaveBeenCalledWith(source);
    compile.mockClear();
    const invalid = await useCase.execute({ ...raw, tasks: [{ ...raw.tasks[0], files: ["endpoints/other_GET.ts"] }] });
    expect(invalid.plan).toBeNull();
    expect(compile).not.toHaveBeenCalled();
    compile.mockRejectedValueOnce(new Error("compiler unavailable"));
    await expect(useCase.execute(raw)).rejects.toThrow("compiler unavailable");
  });

  it("finish gate detects only new owned standards using the same build snapshot", async () => {
    const old = { file: "pages/a.tsx", text: "old" };
    const fresh = { file: "pages/a.tsx", text: "new" };
    const inspect = vi.fn()
      .mockResolvedValueOnce({ build: [], standards: [old] })
      .mockResolvedValueOnce({ build: [], standards: [{ ...old, line: 30 }, fresh, { file: "helpers/contract.ts", text: "other" }] });
    const gate = await new CreateFinishGateUseCase({
      now: () => 0, watch: () => {}, verify: async () => [],
      inspect, runtimeProblems: () => [], formatBuild: (p: { text: string }) => p.text,
      formatStandard: (p: { text: string }) => p.text, formatRuntime: () => "",
    }).execute("p", { owned: ["pages/"] });
    expect(await gate.check()).toBe("## Estándares de Forja (contrato, kit de interfaz, tokens, pruebas)\nnew");
    expect(inspect).toHaveBeenCalledTimes(2);
  });

  it("compacts long runs through a summarizer port, counts summary billing and clears read-dedupe state", async () => {
    let step = 0;
    const requests: Message[][] = [];
    const usage = { input: 1, output: 2, cacheRead: 3, cacheWrite: 4 };
    const model = { id: "m", model: "model", vision: false, context: 20_000 };
    const summarize = vi.fn(async (_transcript: string) => ({ text: "COMPACT", usage, usd: 0.1, credits: 2 }));
    let clears = 0;
    const reads = new Map<string, string>();
    const originalClear = reads.clear.bind(reads);
    reads.clear = () => { clears++; originalClear(); };
    const result = await new RunAgentUseCase({
      callModel: async request => {
        requests.push(structuredClone(request.messages));
        const content: Block[] = step++ < 10
          ? [{ type: "tool_use", id: String(step), name: "read", input: {} }]
          : [{ type: "text", text: "done" }];
        return { model, failed: [], response: { content, usage }, usd: 0, credits: 0 };
      },
      summarize, newRunId: () => "r", now: () => 0, save: async () => {},
      countAction: async () => {}, recordStep: () => {}, recordToolCall: () => {},
    }).execute({
      role: "ui", system: "system", messages: [{ role: "user", content: "opening" }],
      tools: [{ name: "read", description: "", input_schema: {}, run: async () => { reads.set("file", "hash"); return "x".repeat(10_000); } }],
      ctx: { projectId: "p", account: { id: "a" }, reads }, maxSteps: 20,
      signal: { aborted: false }, emit: () => {}, turnId: "t",
    });
    expect(summarize.mock.calls.length).toBeGreaterThan(0);
    expect(result.usd).toBeCloseTo(0.1 * summarize.mock.calls.length);
    expect(result.credits).toBe(2 * summarize.mock.calls.length);
    expect(requests.some(messages => JSON.stringify(messages).includes("COMPACT"))).toBe(true);
    expect(clears).toBeGreaterThan(0);
  });
});
