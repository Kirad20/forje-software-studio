import { afterEach, describe, expect, it, vi } from "vitest";
import { compatChat } from "../../server/modules/model-management/infrastructure/openaiCompat.js";

afterEach(() => vi.unstubAllGlobals());

describe("OpenAI-compatible tool history", () => {
  it.each(["", "Checking the project"])("sends string content for assistant tool calls with text %j", async (text) => {
    const fetchMock = vi.fn<typeof fetch>(async () => Response.json({
      choices: [{ message: { role: "assistant", content: "Done" }, finish_reason: "stop" }],
    }));
    vi.stubGlobal("fetch", fetchMock);

    await compatChat({ baseUrl: "http://localhost:11434/v1" }, "qwen3.5:9b-32k", {
      messages: [
        {
          role: "assistant",
          content: [
            ...(text ? [{ type: "text" as const, text }] : []),
            { type: "tool_use", id: "call-1", name: "check_build", input: {} },
          ],
        },
        { role: "user", content: [{ type: "tool_result", tool_use_id: "call-1", content: "Build passed" }] },
      ],
    });

    const [, options] = fetchMock.mock.calls[0]!;
    const body = JSON.parse(String(options?.body));
    expect(body.messages).toEqual([
      {
        role: "assistant",
        content: text,
        tool_calls: [{ id: "call-1", type: "function", function: { name: "check_build", arguments: "{}" } }],
      },
      { role: "tool", tool_call_id: "call-1", content: "Build passed" },
    ]);
  });
});
