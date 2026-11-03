import { describe, expect, it, vi } from "vitest";
import { createController } from "../../../studio/src/shared/application/create-controller.js";
import { ApiError, HttpClient } from "../../../studio/src/shared/infrastructure/http-client.js";
import { RequestCache } from "../../../studio/src/shared/infrastructure/request-cache.js";

describe("Studio HTTP client", () => {
  it("sends typed JSON requests and includes session credentials", async () => {
    const fetch = vi.fn(async () => new Response(JSON.stringify({ value: 7 }), { status: 200 }));
    const client = new HttpClient(fetch);

    await expect(client.request<{ value: number }>("/value")).resolves.toEqual({ value: 7 });
    expect(fetch).toHaveBeenCalledWith(
      "/api/value",
      expect.objectContaining({ credentials: "include", method: "GET" }),
    );
  });

  it("exposes request and streaming through the feature controller port", async () => {
    const fetch = vi.fn(async () => new Response(JSON.stringify({ value: 3 }), { status: 200 }));
    const controller = createController(new HttpClient(fetch));

    await expect(controller.request<{ value: number }>("/value")).resolves.toEqual({ value: 3 });
    expect(fetch).toHaveBeenCalledWith("/api/value", expect.objectContaining({ method: "GET" }));
  });

  it("preserves structured error response details", async () => {
    const client = new HttpClient(async () => new Response(JSON.stringify({ error: "No access", field: "role" }), { status: 403 }));

    await expect(client.request("/private")).rejects.toMatchObject({
      name: "ApiError",
      message: "No access",
      status: 403,
      data: { error: "No access", field: "role" },
    } satisfies Partial<ApiError>);
  });

  it("reports malformed error bodies with a status-based fallback", async () => {
    const client = new HttpClient(async () => new Response("not json", { status: 502 }));

    await expect(client.request("/failure")).rejects.toMatchObject({ message: "Error 502", status: 502, data: {} });
  });

  it("decodes SSE events across chunk boundaries and flushes the last event", async () => {
    const chunks = ["data: {\"n\":", "1}\r\n\r\ndata: {\"n\":2}"];
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        const next = chunks.shift();
        if (next === undefined) controller.close();
        else controller.enqueue(new TextEncoder().encode(next));
      },
    });
    const client = new HttpClient(async () => new Response(stream, { status: 200 }));
    const onEvent = vi.fn();

    await client.stream<{ n: number }>("/events", {}, onEvent);

    expect(onEvent.mock.calls).toEqual([[{ n: 1 }], [{ n: 2 }]]);
  });

  it("propagates cancellation and cancels the response reader", async () => {
    const canceled = vi.fn();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("data: {\"n\":1}\n\n"));
      },
      cancel() {
        canceled();
      },
    });
    const client = new HttpClient(async () => new Response(stream, { status: 200 }));
    const abort = new AbortController();
    const onEvent = vi.fn(() => abort.abort());

    await expect(client.stream("/events", {}, onEvent, abort.signal)).rejects.toMatchObject({ name: "AbortError" });
    expect(onEvent).toHaveBeenCalledOnce();
    expect(canceled).toHaveBeenCalledOnce();
  });
});

describe("RequestCache", () => {
  it("deduplicates concurrent loads and invalidates cached values", async () => {
    const cache = new RequestCache();
    const load = vi.fn(async () => ({ value: 1 }));

    const [first, second] = await Promise.all([cache.get("key", load), cache.get("key", load)]);
    expect(first).toBe(second);
    expect(load).toHaveBeenCalledOnce();

    cache.invalidate("key");
    await cache.get("key", load);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("does not retain rejected loads", async () => {
    const cache = new RequestCache();
    const load = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce("online");

    await expect(cache.get("key", load)).rejects.toThrow("offline");
    await expect(cache.get("key", load)).resolves.toBe("online");
  });
});
