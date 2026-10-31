/**
 * @forja/client — the browser half of the Forja BaaS. Every generated app imports it.
 * It knows the app's base path (preview `/p/<id>` or published `/` on <slug>.localhost)
 * from `window.__FORJA__`, injected by the app server.
 */
import {
  createElement,
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type ComponentType,
  type MouseEvent,
  type ReactNode,
} from "react";

declare global {
  interface Window {
    __FORJA__?: { base: string; projectId: string; env: "preview" | "published" };
  }
}

const runtime = () => window.__FORJA__ ?? { base: "", projectId: "", env: "preview" as const };
const base = () => runtime().base;

// --- Router ---------------------------------------------------------------------

export interface RouteMatch {
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
}

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
if (typeof window !== "undefined") window.addEventListener("popstate", notify);

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** The current location relative to the app base. */
function currentPath(): string {
  const p = window.location.pathname.slice(base().length) || "/";
  return p.startsWith("/") ? p : `/${p}`;
}

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  const url = to.startsWith("/") ? base() + to : to;
  if (opts.replace) history.replaceState(null, "", url);
  else history.pushState(null, "", url);
  window.scrollTo(0, 0);
  notify();
}

export function Link(props: { to: string; className?: string; children?: ReactNode; style?: React.CSSProperties }) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate(props.to);
  };
  return createElement("a", { href: base() + props.to, onClick, className: props.className, style: props.style }, props.children);
}

/** Converts a page pattern like `/posts/:id` into a matcher. */
export function matchRoute(pattern: string, path: string): Record<string, string> | null {
  const a = pattern.split("/").filter(Boolean);
  const b = path.split("/").filter(Boolean);
  if (a.length !== b.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i]!.startsWith(":")) params[a[i]!.slice(1)] = decodeURIComponent(b[i]!);
    else if (a[i] !== b[i]) return null;
  }
  return params;
}

let routeTable: { pattern: string }[] = [];

export function useRoute(): RouteMatch {
  const path = useSyncExternalStore(subscribe, currentPath);
  const search = useSyncExternalStore(subscribe, () => window.location.search);
  for (const r of routeTable) {
    const params = matchRoute(r.pattern, path);
    if (params) return { path, params, query: new URLSearchParams(search) };
  }
  return { path, params: {}, query: new URLSearchParams(search) };
}

/** Sets the page's <title>, meta description and canonical URL while the page is shown. */
export function useHead(head: { title?: string; description?: string; canonical?: string }) {
  const { title, description, canonical } = head;
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;
    const restore = [
      setHeadTag("meta", "name", "description", "content", description),
      setHeadTag("link", "rel", "canonical", "href", canonical && new URL(canonical, window.location.origin).href),
    ];
    return () => {
      document.title = prevTitle;
      restore.forEach((r) => r());
    };
  }, [title, description, canonical]);
}

/** Sets one attribute of a <meta>/<link> in <head> (creating it if needed); returns an undo. */
function setHeadTag(tag: string, key: string, keyValue: string, attr: string, value: string | undefined): () => void {
  if (!value) return () => {};
  let el = document.head.querySelector<HTMLElement>(`${tag}[${key}="${keyValue}"]`);
  const created = !el;
  if (!el) {
    el = document.createElement(tag);
    el.setAttribute(key, keyValue);
    document.head.appendChild(el);
  }
  const prev = el.getAttribute(attr);
  el.setAttribute(attr, value);
  return () => (created ? el!.remove() : prev === null ? el!.removeAttribute(attr) : el!.setAttribute(attr, prev));
}

export interface PageRoute {
  pattern: string;
  component: ComponentType;
}

/** Root component the generated entry renders. Not meant to be used by app code. */
export function ForjaApp(props: { routes: PageRoute[]; layout?: ComponentType<{ children: ReactNode }>; notFound?: ComponentType }) {
  routeTable = props.routes;
  const { path } = useRoute();
  const route = props.routes.find((r) => matchRoute(r.pattern, path));
  const page = route
    ? createElement(route.component)
    : props.notFound
      ? createElement(props.notFound)
      : createElement("div", { style: { padding: 48, fontFamily: "system-ui" } }, "Página no encontrada");
  return props.layout ? createElement(props.layout, null, page) : page;
}

// --- API ----------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: unknown,
  ) {
    super(message);
  }
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: body !== undefined && !isForm ? { "content-type": "application/json" } : undefined,
    body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
  });
  const text = await res.text();
  let data: unknown = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* plain text */
  }
  if (!res.ok) {
    const msg = (data as { error?: string } | null)?.error ?? `HTTP ${res.status}`;
    throw new ApiError(msg, res.status, data);
  }
  return data as T;
}

const apiUrl = (path: string, query?: Record<string, unknown>) => {
  const qs = query
    ? "?" +
      new URLSearchParams(
        Object.entries(query)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([k, v]) => [k, String(v)]),
      )
    : "";
  return `${base()}/_api/${path.replace(/^\//, "")}${qs}`;
};

/** Calls the app's own endpoints: `endpoints/todos/list_GET.ts` → `api.get("todos/list")`. */
export const api = {
  get: <T = unknown>(path: string, query?: Record<string, unknown>) => request<T>("GET", apiUrl(path, query)),
  post: <T = unknown>(path: string, body?: unknown) => request<T>("POST", apiUrl(path), body ?? {}),
};

/** Small data hook: `const { data, loading, error, reload } = useApi("todos/list")`. */
export function useApi<T = unknown>(path: string | null, query?: Record<string, unknown>) {
  const [state, setState] = useState<{ data?: T; error?: Error; loading: boolean }>({ loading: !!path });
  const key = path ? apiUrl(path, query) : null;
  const load = useCallback(async () => {
    if (!path) return;
    setState((s) => ({ ...s, loading: true }));
    try {
      setState({ data: await api.get<T>(path, query), loading: false });
    } catch (error) {
      setState({ error: error as Error, loading: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => {
    void load();
  }, [load]);
  return { ...state, reload: load };
}

// --- Auth ---------------------------------------------------------------------

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

let currentUser: AppUser | null | undefined;
const userListeners = new Set<() => void>();
const setUser = (u: AppUser | null) => {
  currentUser = u;
  userListeners.forEach((l) => l());
};
const baas = (p: string) => `${base()}/_baas/${p}`;

async function refreshUser() {
  try {
    setUser((await request<{ user: AppUser | null }>("GET", baas("auth/me"))).user);
  } catch {
    setUser(null);
  }
}

export const auth = {
  async signUp(input: { email: string; password: string; name?: string }) {
    const r = await request<{ user: AppUser }>("POST", baas("auth/signup"), input);
    setUser(r.user);
    return r.user;
  },
  async signIn(input: { email: string; password: string }) {
    const r = await request<{ user: AppUser }>("POST", baas("auth/login"), input);
    setUser(r.user);
    return r.user;
  },
  async signOut() {
    await request("POST", baas("auth/logout"), {});
    setUser(null);
  },
  /** Emails an 8-digit code. Always succeeds, so it can't reveal who is registered. */
  requestPasswordReset: (email: string) => request("POST", baas("auth/reset/request"), { email }),
  async resetPassword(input: { email: string; code: string; password: string }) {
    await request("POST", baas("auth/reset/confirm"), input);
  },
  refresh: refreshUser,
};

/** `undefined` while loading, `null` when signed out. */
export function useUser(): AppUser | null | undefined {
  const user = useSyncExternalStore(
    (l) => {
      userListeners.add(l);
      return () => userListeners.delete(l);
    },
    () => currentUser,
  );
  useEffect(() => {
    if (currentUser === undefined) void refreshUser();
  }, []);
  return user;
}

// --- Storage --------------------------------------------------------------------

export interface StoredFile {
  key: string;
  url: string;
  filename: string;
  size: number;
  contentType: string;
}

export const storage = {
  async upload(file: File | Blob, filename?: string): Promise<StoredFile> {
    const form = new FormData();
    form.append("file", file, filename ?? (file as File).name ?? "file");
    return request<StoredFile>("POST", baas("storage/upload"), form);
  },
  url: (key: string) => baas(`storage/files/${encodeURIComponent(key)}`),
};

// --- Realtime -------------------------------------------------------------------

type Handler = (data: unknown) => void;
let socket: WebSocket | null = null;
const channels = new Map<string, Set<Handler>>();

function ensureSocket() {
  if (socket && socket.readyState <= 1) return socket;
  const proto = location.protocol === "https:" ? "wss" : "ws";
  socket = new WebSocket(`${proto}://${location.host}${baas("realtime")}`);
  socket.onopen = () => channels.forEach((_, ch) => socket!.send(JSON.stringify({ type: "subscribe", channel: ch })));
  socket.onmessage = (e) => {
    const msg = JSON.parse(e.data as string) as { channel: string; data: unknown };
    channels.get(msg.channel)?.forEach((h) => h(msg.data));
  };
  socket.onclose = () => {
    socket = null;
    if (channels.size) setTimeout(ensureSocket, 1000);
  };
  return socket;
}

export const realtime = {
  subscribe(channel: string, handler: Handler) {
    const set = channels.get(channel) ?? new Set();
    const isNew = set.size === 0;
    set.add(handler);
    channels.set(channel, set);
    const ws = ensureSocket();
    if (isNew && ws.readyState === 1) ws.send(JSON.stringify({ type: "subscribe", channel }));
    return () => {
      set.delete(handler);
      if (!set.size) {
        channels.delete(channel);
        if (socket?.readyState === 1) socket.send(JSON.stringify({ type: "unsubscribe", channel }));
      }
    };
  },
  /** Broadcast from the browser to everyone on the channel (presence, cursors...). */
  publish(channel: string, data: unknown) {
    const ws = ensureSocket();
    const send = () => ws.send(JSON.stringify({ type: "publish", channel, data }));
    if (ws.readyState === 1) send();
    else ws.addEventListener("open", send, { once: true });
  },
};

export function useChannel(channel: string, handler: Handler) {
  useEffect(() => realtime.subscribe(channel, handler), [channel, handler]);
}

// --- AI -------------------------------------------------------------------------

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Direct AI call for signed-in users. For anything with your data or tools, call AI from an endpoint. */
export const ai = {
  chat: (input: { messages: ChatMessage[]; system?: string; model?: string }) =>
    request<{ text: string; credits: number }>("POST", baas("ai/chat"), input),
};
