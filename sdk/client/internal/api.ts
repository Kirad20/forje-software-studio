import type { Http } from "./transport.js";

export function createApiWorkflow(http: Http) {
  return {
    get: <T = unknown>(path: string, query?: Record<string, unknown>) => http.request<T>("GET", http.apiUrl(path, query)),
    post: <T = unknown>(path: string, body?: unknown) => http.request<T>("POST", http.apiUrl(path), body ?? {}),
  };
}
