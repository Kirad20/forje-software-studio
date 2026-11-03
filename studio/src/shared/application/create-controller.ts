import type { HttpOptions, HttpPort } from "./http-port.js";

export function createController(client: HttpPort) {
  return {
    request: <T = unknown, Body = unknown>(path: string, options?: HttpOptions<Body>) => client.request<T, Body>(path, options),
    stream: <T, Body = unknown>(path: string, body: Body, onEvent: (event: T) => void, signal?: AbortSignal) =>
      client.stream(path, body, onEvent, signal),
  };
}
