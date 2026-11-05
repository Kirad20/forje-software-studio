import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("../../server/modules/model-management/providers.js", () => ({ providerSecret: () => "test-only-key" }));
const { anthropicChat, resetAnthropicClient } = await import("../../server/modules/model-management/infrastructure/anthropic.js");
afterEach(() => {
  resetAnthropicClient();
  vi.unstubAllGlobals();
});

describe("Anthropic physical-call accounting", () => {
  it("does not hide additional physical calls in SDK retries", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => Response.json(
      { type: "error", error: { type: "rate_limit_error", message: "limited" } }, { status: 429 },
    ));
    vi.stubGlobal("fetch", fetchMock);
    await expect(anthropicChat("claude-test", { messages: [{ role: "user", content: "Hi" }] }))
      .rejects.toMatchObject({ status: 429, retryable: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("retains billable refusal usage for the Fusion ledger", async () => {
    vi.stubGlobal("fetch", vi.fn<typeof fetch>(async () => Response.json({
      id: "message-test", type: "message", role: "assistant", model: "claude-test", content: [],
      stop_reason: "refusal", stop_sequence: null,
      usage: { input_tokens: 12, output_tokens: 1, cache_read_input_tokens: 2, cache_creation_input_tokens: 3 },
    })));
    expect(await anthropicChat("claude-test", { messages: [{ role: "user", content: "Hi" }] })).toMatchObject({
      stopReason: "refusal", usage: { input: 12, output: 1, cacheRead: 2, cacheWrite: 3 },
    });
  });
});
