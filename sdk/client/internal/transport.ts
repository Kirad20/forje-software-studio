export interface HttpTransport {
  base(): string;
  fetch(url: string, init: RequestInit): Promise<Response>;
}

export class ApiError extends Error {
  constructor(message: string, public status: number, public body: unknown) {
    super(message);
  }
}

export function createHttp(transport: HttpTransport) {
  const request = async <T>(method: string, url: string, body?: unknown): Promise<T> => {
    const isForm = typeof FormData !== "undefined" && body instanceof FormData;
    const res = await transport.fetch(url, {
      method,
      credentials: "include",
      headers: body !== undefined && !isForm ? { "content-type": "application/json" } : undefined,
      body: body === undefined ? undefined : isForm ? body as FormData : JSON.stringify(body),
    });
    const text = await res.text();
    let data: unknown = text;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      /* plain text */
    }
    if (!res.ok) throw new ApiError((data as { error?: string } | null)?.error ?? `HTTP ${res.status}`, res.status, data);
    return data as T;
  };
  const apiUrl = (path: string, query?: Record<string, unknown>) => {
    const qs = query ? "?" + new URLSearchParams(Object.entries(query)
      .filter(([, value]) => value !== undefined && value !== null).map(([key, value]) => [key, String(value)])) : "";
    return `${transport.base()}/_api/${path.replace(/^\//, "")}${qs}`;
  };
  return { request, apiUrl, baas: (path: string) => `${transport.base()}/_baas/${path}` };
}

export type Http = ReturnType<typeof createHttp>;
