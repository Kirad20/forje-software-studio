import { describe, expect, it } from "vitest";
import { applySummary, estimateTokens, pruneToolResults, renderTranscript, splitForSummary, thresholds } from "../../server/builder/compact.js";
import type { Block, LlmMessage } from "../../server/llm/types.js";

const big = "x".repeat(5000);

/** opening user message + `n` steps of assistant tool_use / user tool_result. */
function run(n: number): LlmMessage[] {
  const msgs: LlmMessage[] = [{ role: "user", content: "Haz la tarea" }];
  for (let i = 0; i < n; i++) {
    msgs.push({ role: "assistant", content: [{ type: "thinking", thinking: `t${i}`, signature: `s${i}` }, { type: "tool_use", id: `u${i}`, name: "read_files", input: { paths: [`f${i}.ts`] } }] });
    msgs.push({ role: "user", content: [{ type: "tool_result", tool_use_id: `u${i}`, content: big }, { type: "image", source: { type: "base64", media_type: "image/png", data: "AAA" } }] });
  }
  return msgs;
}

const resultsOf = (m: LlmMessage) => (m.content as Block[]).filter((b): b is Extract<Block, { type: "tool_result" }> => b.type === "tool_result");

describe("pruneToolResults", () => {
  it("stubs old results and screenshots, keeps the latest ones and the opening", () => {
    const { messages, pruned } = pruneToolResults(run(10), 1, 3);
    expect(pruned).toBeGreaterThan(0);
    expect(messages[0]).toEqual({ role: "user", content: "Haz la tarea" });
    const first = resultsOf(messages[2]!)[0]!;
    expect(first.content).toContain("read_files f0.ts");
    expect(first.content.length).toBeLessThan(300);
    expect((messages[2]!.content as Block[]).some((b) => b.type === "image")).toBe(false);
    expect(resultsOf(messages[20]!)[0]!.content).toBe(big);
    expect((messages[20]!.content as Block[]).some((b) => b.type === "image")).toBe(true);
  });

  it("keeps every tool_use paired and the assistant messages (thinking) untouched", () => {
    const src = run(8);
    const { messages } = pruneToolResults(src, 1, 2);
    expect(messages.length).toBe(src.length);
    for (let i = 1; i < src.length; i += 2) expect(messages[i]).toBe(src[i]);
    for (let i = 2; i < src.length; i += 2) expect(resultsOf(messages[i]!)[0]!.tool_use_id).toBe(resultsOf(src[i]!)[0]!.tool_use_id);
  });

  it("is idempotent and returns the same array when there is nothing to prune", () => {
    const once = pruneToolResults(run(10), 1, 3).messages;
    const twice = pruneToolResults(once, 1, 3);
    expect(twice.pruned).toBe(0);
    expect(twice.messages).toBe(once);
    const few = run(2);
    expect(pruneToolResults(few, 1, 6).messages).toBe(few);
  });

  it("shrinks the estimate a lot", () => {
    const src = run(12);
    expect(estimateTokens(pruneToolResults(src, 1, 3).messages)).toBeLessThan(estimateTokens(src) / 2);
  });
});

describe("splitForSummary / applySummary", () => {
  it("cuts at an assistant message and keeps the last steps", () => {
    const src = run(10);
    const cut = splitForSummary(src, 1, 4)!;
    expect(src[cut]!.role).toBe("assistant");
    expect(src.slice(cut).filter((m) => m.role === "assistant")).toHaveLength(4);
  });

  it("does nothing for short runs", () => {
    expect(splitForSummary(run(3), 1, 4)).toBeNull();
  });

  it("folds the middle into the opening message and keeps roles alternating", () => {
    const src = run(10);
    const cut = splitForSummary(src, 1, 4)!;
    const out = applySummary(src, 1, cut, "Leí f0..f5 y no escribí nada");
    expect(out.map((m) => m.role)).toEqual(["user", ...Array.from({ length: 8 }, (_, i) => (i % 2 === 0 ? "assistant" : "user"))]);
    expect(JSON.stringify(out[0])).toContain("Leí f0..f5");
    expect(JSON.stringify(out[0])).toContain("Haz la tarea");
    // Every kept tool_result still has its tool_use.
    const uses = new Set(out.flatMap((m) => (typeof m.content === "string" ? [] : m.content)).filter((b) => b.type === "tool_use").map((b) => (b as { id: string }).id));
    for (const m of out) for (const r of typeof m.content === "string" ? [] : resultsOf(m)) expect(uses.has(r.tool_use_id)).toBe(true);
  });
});

describe("renderTranscript / thresholds", () => {
  it("describes calls and results without the full payloads", () => {
    const t = renderTranscript(run(2));
    expect(t).toContain("→ read_files f0.ts");
    expect(t).toContain("← read_files f0.ts");
    expect(t.length).toBeLessThan(1500);
  });

  it("scales with the window but is capped", () => {
    expect(thresholds(128_000)).toEqual({ prune: 44_800, summarize: 76_800 });
    expect(thresholds(1_000_000)).toEqual({ prune: 60_000, summarize: 100_000 });
  });
});
