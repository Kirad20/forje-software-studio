import { describe, expect, it, vi } from "vitest";
import { ApiError, createClient } from "../../../sdk/client/index.js";

function transport(base = "/p/a") {
  const fetch = vi.fn(async (_url: string, _init: RequestInit) => new Response(JSON.stringify({ user: { id: "1", email: "a", name: null, role: "user" } })));
  return { fetch, base: () => base };
}

describe("injected SDK workflows", () => {
  it("uses the injected transport for API, auth, storage and AI without browser globals", async () => {
    const port = transport();
    const client = createClient(port);
    await client.api.get("/todos", { empty: null, page: 2 });
    expect(port.fetch).toHaveBeenLastCalledWith("/p/a/_api/todos?page=2", expect.objectContaining({ credentials: "include" }));
    await client.auth.signIn({ email: "a", password: "secret" });
    expect(client.auth.getSnapshot()?.id).toBe("1");
    expect(port.fetch).toHaveBeenLastCalledWith("/p/a/_baas/auth/login", expect.objectContaining({ method: "POST" }));
    expect(client.storage.url("a/b")).toBe("/p/a/_baas/storage/files/a%2Fb");
    await client.storage.upload(new Blob(["hello"]), "hello.txt");
    expect(port.fetch.mock.calls.at(-1)?.[1]?.body).toBeInstanceOf(FormData);
    await client.ai.chat({ messages: [] });
    expect(port.fetch).toHaveBeenLastCalledWith("/p/a/_baas/ai/chat", expect.anything());
  });

  it("isolates authentication state between clients and notifies subscribers", async () => {
    const first = createClient(transport());
    const second = createClient(transport());
    const listener = vi.fn();
    const unsubscribe = first.auth.subscribe(listener);
    await first.auth.signUp({ email: "a", password: "secret" });
    expect(second.auth.getSnapshot()).toBeUndefined();
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    await first.auth.signOut();
    expect(first.auth.getSnapshot()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("preserves HTTP error bodies and auth refresh failure behavior", async () => {
    const client = createClient({ base: () => "", fetch: async () => new Response('{"error":"Denied"}', { status: 403 }) });
    await expect(client.api.get("secret")).rejects.toMatchObject({ message: "Denied", status: 403, body: { error: "Denied" } });
    await expect(client.api.post("secret")).rejects.toBeInstanceOf(ApiError);
    await client.auth.refresh();
    expect(client.auth.getSnapshot()).toBeNull();
  });

  it("preserves empty and plain-text responses", async () => {
    const client = createClient({
      base: () => "",
      fetch: async (url) => new Response(url.endsWith("empty") ? null : "plain"),
    });
    expect(await client.api.get("empty")).toBeNull();
    expect(await client.api.get("text")).toBe("plain");
  });

  it("routes realtime subscriptions, publications and reconnects through injected ports", () => {
    const sockets: WebSocket[] = [];
    const connect = vi.fn(() => {
      const socket = {
        readyState: 0,
        send: vi.fn(),
        addEventListener: vi.fn(),
        onopen: null, onmessage: null, onclose: null,
      } as unknown as WebSocket;
      sockets.push(socket);
      return socket;
    });
    const schedule = vi.fn();
    const client = createClient(transport(), { url: () => "wss://example/realtime", connect, schedule });
    expect(connect).not.toHaveBeenCalled();
    const handler = vi.fn();
    const unsubscribe = client.realtime!.subscribe("todos", handler);
    const first = sockets[0]!;
    expect(connect).toHaveBeenCalledWith("wss://example/realtime");
    Object.assign(first, { readyState: 1 });
    first.onopen!(new Event("open"));
    expect(first.send).toHaveBeenCalledWith('{"type":"subscribe","channel":"todos"}');
    first.onmessage!(new MessageEvent("message", { data: '{"channel":"todos","data":{"id":1}}' }));
    expect(handler).toHaveBeenCalledWith({ id: 1 });
    client.realtime!.publish("todos", { id: 2 });
    expect(first.send).toHaveBeenLastCalledWith('{"type":"publish","channel":"todos","data":{"id":2}}');
    first.onclose!(new Event("close") as CloseEvent);
    expect(schedule).toHaveBeenCalledWith(expect.any(Function), 1000);
    schedule.mock.calls[0]![0]();
    expect(connect).toHaveBeenCalledTimes(2);
    Object.assign(sockets[1]!, { readyState: 1 });
    unsubscribe();
    expect(sockets[1]!.send).toHaveBeenLastCalledWith('{"type":"unsubscribe","channel":"todos"}');
  });
});
