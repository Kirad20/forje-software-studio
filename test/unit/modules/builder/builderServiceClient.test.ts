import { afterEach, expect, it, vi } from "vitest";
import { BuilderServiceClient } from "../../../../server/modules/builder/infrastructure/builderServiceClient.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

it("authenticates status, stop and tool requests to the builder worker", async () => {
  const fetch = vi.fn(async (_url: string | URL | Request, init?: RequestInit) =>
    init?.body && String(init.body).includes('"name"') ? Response.json({ output: "done" }) : Response.json({ building: true }),
  );
  vi.stubGlobal("fetch", fetch);
  const client = new BuilderServiceClient("http://builder:4300", "builder-token");

  await expect(client.status("p1")).resolves.toEqual({ building: true });
  await expect(client.stop("p1")).resolves.toBeUndefined();
  await expect(client.tool("read_file", { path: "README.md" }, {
    account: { id: "a1", email: "a@example.com", name: null, credits: 1, platformRole: "user" },
    projectId: "p1",
    author: "mcp",
  }, true)).resolves.toEqual({ output: "done" });

  expect(fetch.mock.calls.map(([url]) => url.toString())).toEqual([
    "http://builder:4300/internal/builder/status",
    "http://builder:4300/internal/builder/stop",
    "http://builder:4300/internal/builder/tool",
  ]);
  for (const [, init] of fetch.mock.calls) {
    expect(init?.headers).toEqual({ authorization: "Bearer builder-token", "content-type": "application/json" });
  }
});

it("returns the worker's SSE response without consuming it", async () => {
  const sse = new Response('data: {"type":"text","text":"done"}\n\n', {
    headers: { "content-type": "text/event-stream" },
  });
  const fetch = vi.fn(async () => sse);
  vi.stubGlobal("fetch", fetch);
  const client = new BuilderServiceClient("http://builder:4300", "builder-token");

  const response = await client.turn({
    account: { id: "a1", email: "a@example.com", name: null, credits: 1, platformRole: "user" },
    projectId: "p1",
    userText: "Build",
    attachments: [],
    mode: "build",
    implementPlan: false,
  });

  expect(response).toBe(sse);
  expect(response.headers.get("content-type")).toBe("text/event-stream");
});

it("opens a reconnectable stream for an active worker turn", async () => {
  const sse = new Response('data: {"type":"text","text":"resumed"}\n\n', {
    headers: { "content-type": "text/event-stream" },
  });
  const fetch = vi.fn(async () => sse);
  vi.stubGlobal("fetch", fetch);
  const client = new BuilderServiceClient("http://builder:4300", "builder-token");

  await expect(client.stream("p1")).resolves.toBe(sse);
  expect(fetch).toHaveBeenCalledWith("http://builder:4300/internal/builder/stream", expect.objectContaining({
    method: "POST",
    body: JSON.stringify({ projectId: "p1" }),
  }));
});

it("delegates deep security review requests to the worker", async () => {
  const fetch = vi.fn(async () => Response.json({ started: true }));
  vi.stubGlobal("fetch", fetch);
  const client = new BuilderServiceClient("http://builder:4300", "builder-token");
  const account = { id: "a1", email: "a@example.com", name: null, credits: 1, platformRole: "user" as const };

  await expect(client.securityReview(account, "p1")).resolves.toEqual({ started: true });

  expect(fetch).toHaveBeenCalledWith("http://builder:4300/internal/builder/security-review", expect.objectContaining({
    method: "POST",
    body: JSON.stringify({ account, projectId: "p1" }),
  }));
});

it("surfaces non-success responses for non-stream operations", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response("worker offline", { status: 503 })));
  const client = new BuilderServiceClient("http://builder:4300", "builder-token");

  await expect(client.status("p1")).rejects.toThrow("Builder service returned 503: worker offline");
});
