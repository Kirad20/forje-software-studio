import { afterEach, describe, expect, it, vi } from "vitest";
import { ollamaBaseUrl, ollamaChat } from "../../server/modules/model-management/infrastructure/ollama.js";

afterEach(() => vi.unstubAllGlobals());

describe("native Ollama transport", () => {
  it.each(["http://localhost:11434", "http://localhost:11434/v1/", "http://localhost:11434/api"])("normalizes the server URL %s", (url) => {
    expect(ollamaBaseUrl(url)).toBe("http://localhost:11434");
  });

  it("sends native tool history, images, context and authenticated headers", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => Response.json({
      model: "local", message: { role: "assistant", content: "", tool_calls: [{ function: { name: "check_build", arguments: {} } }] },
      prompt_eval_count: 100, eval_count: 12,
    }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await ollamaChat({ baseUrl: "http://localhost:11434/v1", apiKey: "test-key", headers: { "x-test": "yes" } }, "local", 32768, {
      system: "Build an app", maxTokens: 2000, effort: "high",
      tools: [{ name: "check_build", description: "Check", input_schema: { type: "object" } }],
      messages: [
        { role: "assistant", content: [{ type: "tool_use", id: "previous", name: "check_build", input: {} }] },
        { role: "user", content: [
          { type: "tool_result", tool_use_id: "previous", content: "Passed" },
          { type: "text", text: "Screenshot" },
          { type: "image", source: { type: "base64", media_type: "image/png", data: "aW1hZ2U=" } },
        ] },
      ],
    });
    const [url, options] = fetchMock.mock.calls[0]!;
    expect(url).toBe("http://localhost:11434/api/chat");
    expect(options?.headers).toMatchObject({ authorization: "Bearer test-key", "x-test": "yes" });
    expect(JSON.parse(String(options?.body))).toEqual({
      model: "local", stream: false, options: { num_ctx: 32768, num_predict: 2000 },
      tools: [{ type: "function", function: { name: "check_build", description: "Check", parameters: { type: "object" } } }],
      messages: [
        { role: "system", content: "Build an app" },
        { role: "assistant", content: "", tool_calls: [{ function: { name: "check_build", arguments: {} } }] },
        { role: "tool", content: "Passed", tool_name: "check_build" },
        { role: "user", content: "Screenshot", images: ["aW1hZ2U="] },
      ],
    });
    expect(result).toMatchObject({
      stopReason: "tool_use", servedBy: "local",
      content: [{ type: "tool_use", id: expect.any(String), name: "check_build", input: {} }],
      usage: { input: 100, output: 12, cacheRead: 0, cacheWrite: 0 },
    });
    const second = await ollamaChat({ baseUrl: "http://localhost:11434" }, "local", 32768, { messages: [] });
    expect(second.content[0]).not.toEqual(result.content[0]);
  });

  it("maps text and a truncated response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({
      model: "local", message: { content: "Partial" }, done_reason: "length",
    })));
    const response = await ollamaChat({ baseUrl: "http://localhost:11434" }, "local", 32768, { messages: [{ role: "user", content: "Hi" }] });
    expect(response.stopReason).toBe("max_tokens");
    expect(response.content).toEqual([{ type: "text", text: "Partial" }]);
  });

  it("surfaces API errors without treating a bad request as retryable", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("bad message", { status: 400 })));
    await expect(ollamaChat({ baseUrl: "http://localhost:11434" }, "local", 32768, { messages: [] }))
      .rejects.toMatchObject({ status: 400, retryable: false, message: "local 400: bad message" });
  });
});
