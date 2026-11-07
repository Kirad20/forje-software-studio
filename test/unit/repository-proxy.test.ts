import { createServer } from "node:http";
import { once } from "node:events";
import { WebSocket, WebSocketServer } from "ws";
import { describe, expect, it } from "vitest";
import { proxyHeaders, proxyRepositoryRequest, proxyRepositoryUpgrade } from "../../server/modules/repository-runtime/index.js";
import { handleAppRuntimeRequest, resolveApp } from "../../server/bootstrap/appRuntimeHttp.js";

describe("repository HTTP proxy (TDD)", () => {
  it("strips connection-nominated and standard hop headers", () => {
    const headers = proxyHeaders(new Headers({ connection: "x-private", "x-private": "secret", "transfer-encoding": "chunked", "content-type": "text/plain" }));
    expect(headers.has("x-private")).toBe(false);
    expect(headers.has("connection")).toBe(false);
    expect(headers.get("content-type")).toBe("text/plain");
  });
  it("streams request and response bodies and preserves cross-origin redirect URLs", async () => {
    const server = createServer(async (req, res) => {
      let body = "";
      for await (const chunk of req) body += chunk;
      res.writeHead(201, { "content-type": "text/plain", location: "https://app.example/next" });
      res.end(req.url + ":" + body + ":" + req.headers["x-forwarded-host"] + ":" + req.headers.host + ":" + req.headers["x-forwarded-proto"]);
    });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    try {
      const address = server.address() as { port: number };
      const response = await proxyRepositoryRequest(new Request("http://child.example/api?key=value", { method: "POST", body: "streamed" }), { container: "owned", revisionId: "r", origin: `http://127.0.0.1:${address.port}`, publicUrl: "https://child.example" });
      expect(response.status).toBe(201);
      expect(response.headers.get("location")).toBe("https://app.example/next");
      expect(await response.text()).toBe("/api?key=value:streamed:child.example:child.example:https");
    } finally { await new Promise<void>((resolve) => server.close(() => resolve())); }
  });
  it("does not reuse a closing upstream connection or replay mutations", async () => {
    let socket: import("node:net").Socket | undefined;
    const writes: string[] = [];
    const server = createServer(async (req, res) => {
      let body = "";
      for await (const chunk of req) body += chunk;
      writes.push(body);
      res.end("saved");
    });
    server.on("connection", (connected) => { socket = connected; });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const target = { container: "owned", revisionId: "r", origin: `http://127.0.0.1:${(server.address() as { port: number }).port}` };
    try {
      const first = await proxyRepositoryRequest(new Request("http://child.example/secrets", { method: "PUT", body: "secret" }), target);
      expect(await first.text()).toBe("saved");
      socket!.end();
      const second = await proxyRepositoryRequest(new Request("http://child.example/file", { method: "PUT", body: "source" }), target);
      expect(second.status).toBe(200);
      expect(await second.text()).toBe("saved");
      expect(writes).toEqual(["secret", "source"]);
    } finally { await new Promise<void>((resolve) => server.close(() => resolve())); }
  });
  it("proxies authenticated WebSocket upgrades to an isolated child including head data", async () => {
    const upstream = createServer();
    const ws = new WebSocketServer({ server: upstream });
    let upstreamCookies: string | undefined;
    ws.on("connection", (socket, request) => {
      upstreamCookies = request.headers.cookie;
      socket.on("message", (message) => socket.send(message));
    });
    upstream.listen(0, "127.0.0.1");
    await once(upstream, "listening");
    const upstreamPort = (upstream.address() as { port: number }).port;
    const gateway = createServer();
    gateway.on("upgrade", (request, socket, head) => {
      proxyRepositoryUpgrade(request, socket, head, { container: "owned", revisionId: "r", origin: `http://127.0.0.1:${upstreamPort}` });
    });
    gateway.listen(0, "127.0.0.1");
    await once(gateway, "listening");
    const client = new WebSocket(`ws://127.0.0.1:${(gateway.address() as { port: number }).port}/_baas/realtime`, {
      headers: { cookie: "forja_session=parent-secret; forja_repository_session=child-session; forja_repository_share=parent-grant; forja_share=native-child-grant" },
    });
    try {
      await once(client, "open");
      client.send("forja realtime");
      expect(String((await once(client, "message"))[0])).toBe("forja realtime");
      expect(upstreamCookies).toBe("forja_share=native-child-grant; forja_session=child-session");
    } finally {
      client.terminate();
      for (const socket of ws.clients) socket.terminate();
      await Promise.all([new Promise<void>((resolve) => upstream.close(() => resolve())), new Promise<void>((resolve) => gateway.close(() => resolve()))]);
      ws.close();
    }
  }, 5000);
  it("routes child Forja app subdomains only behind the outer repository token boundary", async () => {
    const project = { id: "outer", runtime: "repository", visibility: "private", publishedVersionId: null };
    const ports = {
      getProject: async () => project as never, getProjectBySlug: async () => undefined,
      parseAppHost: (host?: string) => host === "pv-outer.example" ? { kind: "preview" as const, projectId: "outer" } : null,
      checkShareToken: (_project: unknown, token: string | null | undefined) => token === "outer-token",
      checkRepositoryShareToken: (_project: unknown, token: string | null | undefined) => token === "outer-token",
      cookie: () => "forja_repository_share=outer-token; HttpOnly", internalToken: "", emitProject: () => {}, reloadSettings: async () => {},
      serveApp: async () => { throw new Error("Native serving forbidden"); },
      repositoryRuntime: { serve: async () => new Response("nested app") },
    };
    const nested = "pv-child.pv-outer.example";
    expect((await resolveApp(nested, new URL(`https://${nested}/?share=child-token`), null, ports))?.allowed).toBe(false);
    expect((await resolveApp(nested, new URL(`https://${nested}/?share=child-token`), "forja_repository_share=outer-token", ports))?.allowed).toBe(true);
    const login = await handleAppRuntimeRequest(new Request("https://pv-outer.example/?share=outer-token", { headers: { host: "pv-outer.example" } }), ports);
    expect(login?.headers.get("set-cookie")).toContain("Domain=pv-outer.example");
    const response = await handleAppRuntimeRequest(new Request(`https://${nested}/?share=child-token`, { headers: { host: nested, cookie: "forja_repository_share=outer-token" } }), ports);
    expect(await response?.text()).toBe("nested app");
  });
  it("allows preview framing only by trusted Studio origins while published policy is untouched", async () => {
    const server = createServer((_req, res) => {
      res.writeHead(200, { "content-type": "text/html", "x-frame-options": "DENY", "content-security-policy": "frame-ancestors 'none'; base-uri 'self'" });
      res.end("<html>Forja Studio</html>");
    });
    server.listen(0, "127.0.0.1"); await once(server, "listening");
    const target = { container: "c", revisionId: "r", origin: `http://127.0.0.1:${(server.address() as { port: number }).port}`, publicUrl: "https://outer.example" };
    try {
      const preview = await proxyRepositoryRequest(new Request("https://child.example/"), target, { frameAncestors: ["https://studio.example"] });
      expect(preview.headers.has("x-frame-options")).toBe(false);
      expect(preview.headers.get("content-security-policy")).toContain("frame-ancestors https://studio.example");
      expect(preview.headers.get("content-security-policy")).toContain("https://outer.example");
      expect(preview.headers.get("content-security-policy")).toContain("base-uri 'self'");
      await preview.body?.cancel();
      const published = await proxyRepositoryRequest(new Request("https://child.example/"), target);
      expect(published.headers.get("x-frame-options")).toBe("DENY");
      await published.body?.cancel();
    } finally { await new Promise<void>((resolve) => server.close(() => resolve())); }
  });
  it("never leaks parent sessions or grants and aliases child cookies with iframe-safe preview policy", async () => {
    let upstreamCookies: string | undefined;
    const server = createServer((request, response) => {
      upstreamCookies = request.headers.cookie;
      response.writeHead(200, { "set-cookie": [
        "forja_session =child-new; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600; Domain=.example",
        "application=value; Path=/",
        "forja_repository_share=poison; Domain=.example",
      ] });
      response.end("ok");
    });
    server.listen(0, "127.0.0.1"); await once(server, "listening");
    const target = { container: "c", revisionId: "r", origin: `http://127.0.0.1:${(server.address() as { port: number }).port}` };
    const request = new Request("https://child.example/api/me", {
      headers: { cookie: "forja_session =parent-secret; forja_repository_session =child-session; forja_repository_share=parent-grant; application=value" },
    });
    try {
      const preview = await proxyRepositoryRequest(request, target, { frameAncestors: ["https://studio.example"] });
      expect(upstreamCookies).toBe("application=value; forja_session=child-session");
      expect(preview.headers.getSetCookie()).toEqual([
        "forja_repository_session=child-new; HttpOnly; Path=/; Max-Age=3600; SameSite=None; Secure; Partitioned",
        "application=value; Path=/",
      ]);
      await preview.body?.cancel();
      const published = await proxyRepositoryRequest(request, target);
      expect(published.headers.getSetCookie()).toEqual([
        "forja_repository_session=child-new; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600",
        "application=value; Path=/",
      ]);
      await published.body?.cancel();
      const parentOnly = await proxyRepositoryRequest(new Request("https://child.example/", { headers: { cookie: "forja_session=parent-secret" } }), target);
      expect(upstreamCookies).toBeUndefined();
      await parentOnly.body?.cancel();
    } finally { await new Promise<void>((resolve) => server.close(() => resolve())); }
  });
  it("does not expose a previous project's session when a publication host is reused", async () => {
    let upstreamCookies: string | undefined;
    const server = createServer((request, response) => {
      upstreamCookies = request.headers.cookie;
      response.writeHead(200, { "set-cookie": "forja_session=old-project-session; HttpOnly; Path=/" });
      response.end("ok");
    });
    server.listen(0, "127.0.0.1"); await once(server, "listening");
    const target = { container: "c", revisionId: "r", origin: `http://127.0.0.1:${(server.address() as { port: number }).port}`, publicUrl: "https://publication.example", projectId: "original", environment: "published" as const };
    try {
      const original = await proxyRepositoryRequest(new Request(target.publicUrl), target);
      const oldCookie = original.headers.getSetCookie()[0]!.split(";")[0]!;
      await original.body?.cancel();
      const replacement = await proxyRepositoryRequest(new Request(target.publicUrl, { headers: { cookie: oldCookie } }), { ...target, projectId: "replacement" });
      expect(upstreamCookies).toBeUndefined();
      await replacement.body?.cancel();
    } finally { await new Promise<void>((resolve) => server.close(() => resolve())); }
  });
  it("never changes the private upstream authority for protocol-relative HTTP or WS paths", async () => {
    const owned = createServer((request, response) => response.end("owned:" + request.url));
    const outside = createServer((_request, response) => response.end("outside"));
    const ownedWs = new WebSocketServer({ server: owned });
    const outsideWs = new WebSocketServer({ server: outside });
    ownedWs.on("connection", (socket) => socket.on("message", () => socket.send("owned")));
    outsideWs.on("connection", (socket) => socket.on("message", () => socket.send("outside")));
    owned.listen(0, "127.0.0.1"); outside.listen(0, "127.0.0.1");
    await Promise.all([once(owned, "listening"), once(outside, "listening")]);
    const target = { container: "c", revisionId: "r", origin: `http://127.0.0.1:${(owned.address() as { port: number }).port}` };
    const gateway = createServer();
    let close: (() => void) | undefined;
    gateway.on("upgrade", (request, socket, head) => { close = proxyRepositoryUpgrade(request, socket, head, target); });
    gateway.listen(0, "127.0.0.1"); await once(gateway, "listening");
    const path = `//127.0.0.1:${(outside.address() as { port: number }).port}/probe`;
    const client = new WebSocket(`ws://127.0.0.1:${(gateway.address() as { port: number }).port}${path}`);
    const opened = once(client, "open");
    try {
      const response = await proxyRepositoryRequest(new Request("https://project.example" + path), target);
      expect.soft(await response.text()).toBe("owned:" + path);
      await opened;
      client.send("probe");
      expect(String((await once(client, "message"))[0])).toBe("owned");
    } finally {
      client.terminate(); close?.();
      for (const server of [ownedWs, outsideWs]) { for (const socket of server.clients) socket.terminate(); server.close(); }
      await Promise.all([owned, outside, gateway].map((server) => new Promise<void>((resolve) => server.close(() => resolve()))));
    }
  });
});
