export type HttpOptions<Body = unknown> = { method?: string; body?: Body; signal?: AbortSignal };

export interface HttpPort {
  request<T = unknown, Body = unknown>(path: string, options?: HttpOptions<Body>): Promise<T>;
  response(path: string, signal?: AbortSignal): Promise<Response>;
  stream<T, Body = unknown>(path: string, body: Body, onEvent: (event: T) => void, signal?: AbortSignal): Promise<void>;
  streamGet<T>(path: string, onEvent: (event: T) => void, signal?: AbortSignal): Promise<void>;
}
