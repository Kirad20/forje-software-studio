import { describe, expect, it, vi } from "vitest";
import { createLangfuse } from "../../server/modules/builder/index.js";

const usage = { input: 1000, output: 50, cacheRead: 200, cacheWrite: 10 };

function fakeFetch(status = 207) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fn = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init! });
    return new Response("{}", { status });
  });
  return { fn: fn as unknown as typeof fetch, calls, batch: (i = 0) => JSON.parse(String(calls[i]!.init.body)).batch as { type: string; body: Record<string, any> }[] };
}

describe("Langfuse export", () => {
  it("sends a run as one trace with a generation per step and a span per builder tool call", async () => {
    const f = fakeFetch();
    const lf = createLangfuse({ publicKey: "pk", secretKey: "sk", baseUrl: "https://lf.test", fetch: f.fn, flushMs: 60_000 });
    lf.step({ runId: "r1", projectId: "p1", turnId: "t1", taskId: "k1", role: "backend", step: 0, modelId: "anthropic:claude-sonnet-5-5", usage, ms: 1500, usd: 0.01 });
    lf.toolCall({ runId: "r1", projectId: "p1", source: "builder", role: "backend", step: 0, tool: "read_files", inputChars: 40, resultChars: 4000, ok: true, ms: 12 });
    lf.toolCall({ runId: "r1", projectId: "p1", source: "builder", role: "backend", step: 0, tool: "write_file", inputChars: 900, resultChars: 30, ok: false, ms: 3 });
    lf.step({ runId: "r1", projectId: "p1", turnId: "t1", role: "backend", step: 1, modelId: "anthropic:claude-sonnet-5-5", usage });
    // MCP calls belong to an external client's run: not traced.
    lf.toolCall({ runId: "", projectId: "p1", source: "mcp", step: 0, tool: "read_files", inputChars: 1, resultChars: 1, ok: true, ms: 1 });
    await lf.flush();

    expect(f.calls).toHaveLength(1);
    expect(f.calls[0]!.url).toBe("https://lf.test/api/public/ingestion");
    expect((f.calls[0]!.init.headers as Record<string, string>).authorization).toBe("Basic " + Buffer.from("pk:sk").toString("base64"));
    const b = f.batch();
    expect(b.map((e) => e.type)).toEqual(["trace-create", "generation-create", "span-create", "span-create", "generation-create"]);
    expect(b[0]!.body).toMatchObject({ id: "r1", name: "agent:backend", sessionId: "t1", metadata: { projectId: "p1", taskId: "k1" } });
    const gen = b[1]!.body;
    expect(gen).toMatchObject({ traceId: "r1", model: "anthropic:claude-sonnet-5-5", costDetails: { total: 0.01 } });
    expect(gen.usageDetails).toEqual({ input: 1000, output: 50, cache_read_input_tokens: 200, cache_creation_input_tokens: 10 });
    expect(Date.parse(gen.endTime) - Date.parse(gen.startTime)).toBe(1500);
    expect(b[2]!.body).toMatchObject({ traceId: "r1", name: "read_files", level: "DEFAULT", metadata: { resultChars: 4000 } });
    expect(b[3]!.body.level).toBe("ERROR");
    expect(b[4]!.body.costDetails).toBeUndefined();
  });

  it("never throws when Langfuse is down, and drops the batch", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const down = vi.fn(async () => {
      throw new Error("ECONNREFUSED");
    }) as unknown as typeof fetch;
    const lf = createLangfuse({ publicKey: "pk", secretKey: "sk", baseUrl: "https://lf.test", fetch: down, flushMs: 60_000 });
    lf.step({ runId: "r2", projectId: "p1", role: "fast", step: 0, usage });
    await expect(lf.flush()).resolves.toBeUndefined();
    await lf.flush();
    expect(down).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it("is off without keys", async () => {
    vi.stubEnv("LANGFUSE_PUBLIC_KEY", "");
    vi.resetModules();
    const { langfuse } = await import("../../server/modules/builder/index.js");
    expect(langfuse).toBeNull();
    vi.unstubAllEnvs();
  });

  it("sends a finished eval case as a trace in the run's session, with one score per measure", async () => {
    const f = fakeFetch();
    const lf = createLangfuse({ publicKey: "pk", secretKey: "sk", baseUrl: "https://lf.test", fetch: f.fn, flushMs: 60_000 });
    lf.evalCase({ runId: "run1", caseId: "small-cafe-landing", size: "small", repeat: 2, turnId: "t9", scores: { total: 81.5, judge: null, compile: 1 } });
    await lf.flush();
    const b = f.batch();
    expect(b.map((e) => e.type)).toEqual(["trace-create", "score-create", "score-create"]);
    expect(b[0]!.body).toMatchObject({ name: "eval:small-cafe-landing", sessionId: "eval:run1", tags: ["eval", "small", "small-cafe-landing"], metadata: { turnId: "t9", repeat: 2 } });
    expect(b.slice(1).map((e) => [e.body.name, e.body.value, e.body.traceId === b[0]!.body.id])).toEqual([
      ["total", 81.5, true],
      ["compile", 1, true],
    ]);
  });
});
