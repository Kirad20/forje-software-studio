import { afterEach, expect, it, vi } from "vitest";
import { callRuntimeEndpoint } from "../../../../server/modules/app-runtime/infrastructure/runtimeClient.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

it("calls the private runtime endpoint using the internal credential", async () => {
  const fetch = vi.fn(async () => Response.json({ status: 201, body: "created", contentType: "text/plain" }));
  vi.stubGlobal("fetch", fetch);

  await expect(callRuntimeEndpoint({
    projectId: "p1",
    method: "POST",
    route: "items",
    query: { page: "2" },
    cookie: "forja_session=token",
    body: "{\"name\":\"sample\"}",
  }, "http://app-runtime:4200", "runtime-token")).resolves.toEqual({
    status: 201,
    body: "created",
    contentType: "text/plain",
  });
  expect(fetch).toHaveBeenCalledWith(
    "http://app-runtime:4200/internal/runtime/call-endpoint",
    expect.objectContaining({
      method: "POST",
      headers: { authorization: "Bearer runtime-token", "content-type": "application/json" },
      body: JSON.stringify({
        projectId: "p1",
        method: "POST",
        route: "items",
        query: { page: "2" },
        cookie: "forja_session=token",
        body: "{\"name\":\"sample\"}",
      }),
    }),
  );
});

it("surfaces runtime service errors", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response("runtime unavailable", { status: 503 })));

  await expect(callRuntimeEndpoint({ projectId: "p1", method: "GET", route: "items" }, "http://app-runtime:4200", "runtime-token"))
    .rejects.toThrow("App runtime service returned 503: runtime unavailable");
});
