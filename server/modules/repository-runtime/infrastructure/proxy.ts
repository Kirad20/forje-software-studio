import type { RepositoryDeployment } from "../domain/repository.js";
import { request as httpRequest, type IncomingMessage } from "node:http";
import { Readable, type Duplex } from "node:stream";
import { createBrotliDecompress, createGunzip, createInflate } from "node:zlib";
import { createHash } from "node:crypto";

const hop = ["connection", "keep-alive", "proxy-authenticate", "proxy-authorization", "te", "trailer", "transfer-encoding", "upgrade"];
const sessionAlias = "forja_repository_session";
function scopedSessionAlias(deployment: RepositoryDeployment, fallback: string): string {
  return deployment.projectId && deployment.environment
    ? `${sessionAlias}_${createHash("sha256").update(`${deployment.projectId}:${deployment.environment}:${new URL(deployment.publicUrl ?? fallback).origin}`).digest("hex").slice(0, 20)}`
    : sessionAlias;
}
function childCookies(headers: Headers, alias: string): void {
  const cookies = (headers.get("cookie") ?? "").split(";").map((cookie) => cookie.trim()).filter(Boolean);
  const child = cookies.find((cookie) => cookie.includes("=") && cookie.split("=")[0]!.trim() === alias);
  const forwarded = cookies.filter((cookie) => {
    const name = cookie.split("=")[0]!.trim();
    return !["forja_session", sessionAlias, "forja_repository_share"].includes(name) && !name.startsWith(sessionAlias + "_");
  });
  if (child) forwarded.push("forja_session=" + child.slice(child.indexOf("=") + 1).trim());
  if (forwarded.length) headers.set("cookie", forwarded.join("; ")); else headers.delete("cookie");
}
function childSetCookie(cookie: string, host: string, preview: boolean, alias: string): string | undefined {
  const parts = cookie.split(";").map((part) => part.trim());
  const name = parts[0]!.split("=")[0]!.trim();
  if (name === "forja_repository_share" || name === sessionAlias || name?.startsWith(sessionAlias + "_")) return undefined;
  if (name !== "forja_session") {
    const domain = parts.find((part) => /^domain=/i.test(part))?.slice(7).replace(/^\./, "").toLowerCase();
    return domain && domain !== host && !domain.endsWith("." + host) ? undefined : cookie;
  }
  const attributes = parts.slice(1).filter((part) => !/^domain=/i.test(part) && !(preview && /^(samesite=|secure$|partitioned$)/i.test(part)));
  if (!attributes.some((part) => /^httponly$/i.test(part))) attributes.push("HttpOnly");
  if (preview) attributes.push("SameSite=None", "Secure", "Partitioned");
  return [alias + "=" + parts[0]!.slice(parts[0]!.indexOf("=") + 1).trim(), ...attributes].join("; ");
}
export function proxyHeaders(input: Headers): Headers {
  const headers = new Headers(input);
  const connection = headers.get("connection")?.split(",").map((s) => s.trim()) ?? [];
  for (const name of [...hop, ...connection]) headers.delete(name);
  return headers;
}

/** Call only after the same project/share-token authorization as HTTP serving. */
export function proxyRepositoryUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer, deployment: RepositoryDeployment, preview = false): () => void {
  const requested = new URL(request.url ?? "/", deployment.origin);
  const target = new URL(deployment.origin);
  target.pathname = requested.pathname;
  target.search = requested.search;
  const alias = scopedSessionAlias(deployment, `http://${request.headers.host ?? target.host}`);
  const headers = proxyHeaders(new Headers(Object.entries(request.headers).flatMap(([key, value]) => value === undefined ? [] : [[key, Array.isArray(value) ? value.join(", ") : value]])));
  childCookies(headers, alias);
  headers.set("connection", "Upgrade");
  headers.set("upgrade", "websocket");
  headers.set("host", request.headers.host ?? target.host);
  headers.set("x-forwarded-host", request.headers.host ?? "");
  headers.set("x-forwarded-proto", deployment.publicUrl ? new URL(deployment.publicUrl).protocol.slice(0, -1) : (socket as Duplex & { encrypted?: boolean }).encrypted ? "https" : "http");
  headers.delete("x-forwarded-for");
  const upstream = httpRequest(target, { headers: Object.fromEntries(headers), timeout: 10_000 });
  let remoteSocket: Duplex | undefined;
  const failed = () => { upstream.destroy(); remoteSocket?.destroy(); socket.destroy(); };
  socket.once("error", failed);
  socket.once("close", () => upstream.destroy());
  upstream.once("timeout", failed);
  upstream.once("error", () => socket.destroy());
  upstream.once("response", (response) => {
    socket.end(`HTTP/1.1 ${response.statusCode ?? 502} Upgrade rejected\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`);
    response.destroy();
  });
  upstream.once("upgrade", (response, remote, remoteHead) => {
    remoteSocket = remote;
    upstream.setTimeout(0);
    const cookieHost = new URL(deployment.publicUrl ?? `http://${request.headers.host ?? target.host}`).hostname;
    const responseHeaders = Object.entries(response.headers).flatMap(([key, value]) => value === undefined ? [] : (Array.isArray(value) ? value : [value]).flatMap((v) => {
      const forwarded = key.toLowerCase() === "set-cookie" ? childSetCookie(v, cookieHost, preview, alias) : v;
      return forwarded === undefined ? [] : [`${key}: ${forwarded}`];
    }));
    socket.write(`HTTP/1.1 101 Switching Protocols\r\n${responseHeaders.join("\r\n")}\r\n\r\n`);
    if (remoteHead.length) socket.write(remoteHead);
    if (head.length) remote.write(head);
    socket.pipe(remote).pipe(socket);
    remote.once("error", () => socket.destroy());
    remote.once("close", () => socket.destroy());
    socket.once("close", () => remote.destroy());
  });
  upstream.end();
  return failed;
}
export async function proxyRepositoryRequest(request: Request, deployment: RepositoryDeployment, options?: { frameAncestors: string[] }): Promise<Response> {
  if (request.headers.get("upgrade")) return new Response("Repository runtime supports HTTP and SSE; WebSocket upgrades are not supported", { status: 501 });
  const incoming = new URL(request.url);
  const target = new URL(deployment.origin);
  target.pathname = incoming.pathname;
  target.search = incoming.search;
  const alias = scopedSessionAlias(deployment, request.url);
  const headers = proxyHeaders(request.headers);
  childCookies(headers, alias);
  headers.set("host", request.headers.get("host") ?? incoming.host);
  headers.delete("x-forwarded-for");
  headers.set("x-forwarded-host", incoming.host);
  headers.set("x-forwarded-proto", new URL(deployment.publicUrl ?? request.url).protocol.slice(0, -1));
  return new Promise<Response>((resolve) => {
    let timedOut = false;
    // Docker port relays can close idle sockets before Node observes the FIN.
    const upstream = httpRequest(target, { method: request.method, headers: Object.fromEntries(headers), agent: false });
    const timer = setTimeout(() => { timedOut = true; upstream.destroy(new Error("Upstream timeout")); }, 30_000);
    timer.unref();
    const abort = () => upstream.destroy(new Error("Client disconnected"));
    request.signal.addEventListener("abort", abort, { once: true });
    const cleanup = () => { clearTimeout(timer); request.signal.removeEventListener("abort", abort); };
    upstream.once("error", (error) => {
      cleanup();
      console.error("[repository-runtime] Upstream request failed", deployment.projectId, deployment.environment, error.message, { reusedSocket: upstream.reusedSocket });
      resolve(new Response("Repository application upstream unavailable", { status: timedOut ? 504 : 502 }));
    });
    upstream.once("response", (incoming) => {
      const rawHeaders = new Headers();
      const cookieHost = new URL(deployment.publicUrl ?? request.url).hostname;
      for (let index = 0; index < incoming.rawHeaders.length; index += 2) {
        const name = incoming.rawHeaders[index]!;
        const value = name.toLowerCase() === "set-cookie" ? childSetCookie(incoming.rawHeaders[index + 1]!, cookieHost, !!options, alias) : incoming.rawHeaders[index + 1]!;
        if (value !== undefined) rawHeaders.append(name, value);
      }
      const responseHeaders = proxyHeaders(rawHeaders);
      let body: Readable = incoming;
      const encoding = responseHeaders.get("content-encoding")?.toLowerCase();
      const decoder = encoding === "gzip" ? createGunzip() : encoding === "deflate" ? createInflate() : encoding === "br" ? createBrotliDecompress() : undefined;
      if (decoder) { body = incoming.pipe(decoder); responseHeaders.delete("content-encoding"); }
      responseHeaders.delete("content-length");
      if (options?.frameAncestors.length) {
        const origins = options.frameAncestors.filter((origin) => { try { return new URL(origin).origin === origin; } catch { return false; } });
        if (origins.length) {
          responseHeaders.delete("x-frame-options");
          const csp = (responseHeaders.get("content-security-policy") ?? "").replace(/(?:^|;)\s*frame-ancestors[^;]*/gi, "").replace(/^;\s*/, "").trim();
          const ancestors = [...new Set([...origins, new URL(deployment.publicUrl ?? request.url).origin, "'self'"])];
          responseHeaders.set("content-security-policy", `${csp}${csp ? "; " : ""}frame-ancestors ${ancestors.join(" ")}`);
        }
      }
      incoming.once("error", (error) => { body.destroy(error); cleanup(); });
      incoming.once("end", cleanup);
      const status = incoming.statusCode ?? 502;
      if (request.method === "HEAD" || [204, 205, 304].includes(status)) { incoming.resume(); resolve(new Response(null, { status, headers: responseHeaders })); return; }
      const reader = Readable.toWeb(body).getReader();
      resolve(new Response(new ReadableStream({
        async pull(controller) {
          try {
            const { done, value } = await reader.read();
            if (done) { cleanup(); controller.close(); } else controller.enqueue(value as Uint8Array);
          } catch (error) { cleanup(); controller.error(error); }
        },
        async cancel() { try { await reader.cancel(); } finally { upstream.destroy(); incoming.destroy(); cleanup(); } },
      }), { status, headers: responseHeaders }));
    });
    if (request.body && !["GET", "HEAD"].includes(request.method)) {
      const source = Readable.fromWeb(request.body as import("node:stream/web").ReadableStream);
      source.once("error", (error) => upstream.destroy(error));
      source.pipe(upstream);
    } else upstream.end();
  });
}
