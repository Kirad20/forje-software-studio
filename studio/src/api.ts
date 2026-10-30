export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function api<T = any>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: opts.method ?? (opts.body === undefined ? "GET" : "POST"),
    headers: opts.body === undefined ? undefined : { "content-type": "application/json" },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? `Error ${res.status}`, res.status);
  return data as T;
}

/** POSTs and reads a `text/event-stream` response, calling `onEvent` for each `data:` line. */
export async function streamPost(path: string, body: unknown, onEvent: (e: any) => void): Promise<void> {
  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.error ?? `Error ${res.status}`, res.status);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i: number;
    while ((i = buf.indexOf("\n\n")) >= 0) {
      const chunk = buf.slice(0, i);
      buf = buf.slice(i + 2);
      for (const line of chunk.split("\n")) if (line.startsWith("data: ")) onEvent(JSON.parse(line.slice(6)));
    }
  }
}

export interface Project {
  id: string;
  name: string;
  description: string;
  slug: string | null;
  visibility: "public" | "private";
  aiEnabled: boolean;
  emailDomain: string | null;
  emailDomainVerified: boolean;
  publishedAt: string | null;
  updatedAt: string;
  createdAt: string;
  lastOpenedAt: string;
  favorite: boolean;
  archived: boolean;
  folderId: string | null;
  systemPrompt: string;
  designPrompt: string;
  seo: { siteName?: string; siteDescription?: string; robots?: boolean; sitemap?: boolean; themeColor?: string };
  /** Present on projects opened by id: whether you own it or collaborate on it. */
  access?: "owner" | "editor";
  previewUrl: string;
  previewOrigin: string;
  appUrl: string | null;
  suggestedSlug: string;
  building: boolean;
  hasUnpublishedChanges: boolean;
}

export interface Folder {
  id: string;
  name: string;
}

export const timeAgo = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "hace un momento";
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
  return new Date(iso).toLocaleDateString();
};

export const bytes = (n: number) => (n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`);
