import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Block, LlmMessage } from "../../server/modules/model-management/types.js";

const calls: { role: string; messages: LlmMessage[] }[] = [];
let mainSteps = 0;
const usage = { input: 1, output: 1, cacheRead: 0, cacheWrite: 0 };
const model = { id: "m", model: "m", context: 20_000, vision: false };

vi.mock("../../server/modules/model-management/router.js", () => ({
  maxTokensFor: () => 4000,
  callModel: async (_scope: unknown, role: string, _f: unknown, req: { messages: LlmMessage[] }) => {
    calls.push({ role, messages: structuredClone(req.messages) });
    let content: Block[];
    if (role === "summarizer") content = [{ type: "text", text: "RESUMEN: leí varios archivos" }];
    else if (mainSteps++ < 10) content = [{ type: "tool_use", id: `u${mainSteps}`, name: "t", input: { path: `f${mainSteps}.ts` } }];
    else content = [{ type: "text", text: "Listo" }];
    return { model, failed: [], usd: 0, credits: 0, response: { content, usage, stopReason: "end", servedBy: "m" } };
  },
}));
vi.mock("../../server/shared/database/index.js", () => ({ q: async () => [], one: async () => undefined }));
vi.mock("../../server/modules/builder/infrastructure/CoreModulesAdapter.js", () => ({ readFile: async () => undefined }));
vi.mock("../../server/modules/usage/usage.js", () => ({ countAction: async () => {} }));
vi.mock("../../server/modules/builder/infrastructure/metrics.js", () => ({ newRunId: () => "r", recordStep: () => {}, recordToolCall: () => {} }));

const { runAgent } = await import("../../server/modules/builder/index.js");

const results = (m: LlmMessage) => (typeof m.content === "string" ? [] : m.content.filter((b): b is Extract<Block, { type: "tool_result" }> => b.type === "tool_result"));
const uses = (m: LlmMessage) => (typeof m.content === "string" ? [] : m.content.filter((b): b is Extract<Block, { type: "tool_use" }> => b.type === "tool_use"));

beforeEach(() => {
  calls.length = 0;
  mainSteps = 0;
});

describe("runAgent context compaction", () => {
  it("prunes, then folds old steps into a summary once the window fills, and still finishes", async () => {
    const r = await runAgent({
      scope: {} as never,
      billing: {} as never,
      role: "ui",
      routing: { complexity: 1, domains: [], needsVision: false },
      system: "sys",
      messages: [{ role: "user", content: "Haz la tarea" }],
      tools: [{ name: "t", description: "", input_schema: {}, run: async () => "y".repeat(10_000) }],
      ctx: { account: { id: "a" }, projectId: "p", author: "builder" } as never,
      maxSteps: 20,
      signal: new AbortController().signal,
      emit: () => {},
      turnId: "t",
    });
    expect(r.text).toBe("Listo");
    expect(r.hitStepLimit).toBe(false);

    const summaries = calls.filter((c) => c.role === "summarizer");
    expect(summaries.length).toBeGreaterThan(0);

    const main = calls.filter((c) => c.role !== "summarizer");
    const after = main.find((c) => JSON.stringify(c.messages[0]).includes("RESUMEN"))!;
    expect(after).toBeDefined();
    expect(JSON.stringify(after.messages[0])).toContain("Haz la tarea");

    // Every request is valid: roles alternate and no tool_result lacks its tool_use.
    for (const c of main) {
      c.messages.forEach((m, i) => expect(m.role).toBe(i % 2 === 0 ? "user" : "assistant"));
      const ids = new Set(c.messages.flatMap(uses).map((b) => b.id));
      for (const m of c.messages) for (const b of results(m)) expect(ids.has(b.tool_use_id)).toBe(true);
    }
    // The window is respected from the moment compaction kicks in: the last request is far smaller than the raw history.
    const raw = main.length * 10_000;
    const last = JSON.stringify(main[main.length - 1]!.messages).length;
    expect(last).toBeLessThan(raw / 2);
  });
});
