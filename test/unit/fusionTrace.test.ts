import { describe, expect, it } from "vitest";
import { fusionDisplay } from "../../studio/src/features/builder/application/fusionTrace.js";

describe("builder Fusion trace display", () => {
  it("shows call metadata rather than provider errors or private review contents", () => {
    const step = { id: "review", phase: "critic" as const, modelId: "reviewer", effort: "high", ms: 123.4, usd: 0.002, credits: 1,
      error: "provider error with private contents", thinking: "private reviewer reasoning" };
    const display = fusionDisplay({ type: "fusion_step", step });
    expect(display).toMatchObject({ summary: "Revisión · reviewer · 123 ms · $0.0020", state: "err" });
    expect(JSON.stringify(display)).not.toContain("private");
  });

  it("shows the final pattern, total expense and visible degradation warnings", () => {
    expect(fusionDisplay({ type: "fusion_done", operationId: "op", pattern: "cascade",
      usd: 0.02, credits: 2, warnings: ["No reviewer available; unreviewed proposal"] }))
      .toMatchObject({ summary: "cascade · $0.0200 · 2 créditos", output: "No reviewer available; unreviewed proposal" });
  });

  it("labels context tokens as estimates, not billed provider usage", () => {
    expect(fusionDisplay({ type: "fusion_step", step: { id: "draft", phase: "draft", modelId: "author",
      effort: "low", ms: 10, usd: 0, credits: 0,
      context: { estimatedInputTokens: 800, messages: 3, requestedFileCount: 2, fileReadCalls: 1 } } }).summary)
      .toContain("~800 tokens entrada · 3 mensajes · 2 archivos");
  });
});
