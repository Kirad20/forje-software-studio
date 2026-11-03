import type { JsonObject } from "../contracts/api.js";
import type { HttpOptions, HttpPort } from "../application/http-port.js";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data: JsonObject = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type FetchPort = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
export class HttpClient implements HttpPort {
  constructor(private readonly fetchPort: FetchPort = globalThis.fetch.bind(globalThis)) {}

  async response(path: string, signal?: AbortSignal): Promise<Response> {
    const response = await this.fetchPort(`/api${path}`, {
      credentials: "include",
      signal,
    });
    if (!response.ok) throw toApiError(response.status, await readJson(response));
    return response;
  }

  async request<T = unknown, Body = unknown>(path: string, options: HttpOptions<Body> = {}): Promise<T> {
    const hasBody = options.body !== undefined;
    const response = await this.fetchPort(`/api${path}`, {
      method: options.method ?? (hasBody ? "POST" : "GET"),
      headers: hasBody ? { "content-type": "application/json" } : undefined,
      body: hasBody ? JSON.stringify(options.body) : undefined,
      credentials: "include",
      signal: options.signal,
    });
    const data = await readJson(response);
    if (!response.ok) throw toApiError(response.status, data);
    return data as T;
  }

  async stream<T>(
    path: string,
    body: unknown,
    onEvent: (event: T) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    throwIfAborted(signal);
    const response = await this.fetchPort(`/api${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
      signal,
    });

    if (!response.ok || !response.body) {
      throw toApiError(response.status, await readJson(response));
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let completed = false;
    const abortReader = () => {
      void reader.cancel(signal?.reason).catch(() => undefined);
    };
    signal?.addEventListener("abort", abortReader, { once: true });

    try {
      for (;;) {
        throwIfAborted(signal);
        const { done, value } = await reader.read();
        throwIfAborted(signal);
        if (done) {
          completed = true;
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        buffer = dispatchEvents(buffer, onEvent);
      }

      buffer += decoder.decode();
      if (buffer.trim()) dispatchEvents(`${buffer}\n\n`, onEvent);
    } finally {
      signal?.removeEventListener("abort", abortReader);
      if (!completed) await reader.cancel(signal?.reason).catch(() => undefined);
      reader.releaseLock();
    }
  }
}

export const httpClient = new HttpClient();

function dispatchEvents<T>(buffer: string, onEvent: (event: T) => void): string {
  const normalized = buffer.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const chunks = normalized.split("\n\n");
  const rest = chunks.pop() ?? "";
  for (const chunk of chunks) {
    const data = chunk
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).replace(/^ /, ""));
    if (data.length) onEvent(JSON.parse(data.join("\n")) as T);
  }
  return rest;
}

async function readJson(response: Response): Promise<JsonObject> {
  const value: unknown = await response.json().catch(() => ({}));
  return isJsonObject(value) ? value : {};
}

function toApiError(status: number, data: JsonObject): ApiError {
  const message = typeof data.error === "string" ? data.error : `Error ${status}`;
  return new ApiError(message, status, data);
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function throwIfAborted(signal?: AbortSignal): void {
  if (!signal?.aborted) return;
  throw signal.reason ?? Object.assign(new Error("The operation was aborted"), { name: "AbortError" });
}
