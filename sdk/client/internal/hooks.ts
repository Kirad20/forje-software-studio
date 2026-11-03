import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { z } from "zod";
import type { AppUser } from "./auth.js";
import { api, auth, realtime } from "./default-client.js";
import { base } from "./browser.js";
import type { Handler } from "./realtime.js";
import { createHttp } from "./transport.js";

export interface RouteSpec {
  input: z.ZodType;
  output: z.ZodType;
}
export type Contract = Record<`${"GET" | "POST"} ${string}`, RouteSpec>;
type Spec<C, M extends string, R extends string> = C[Extract<keyof C, `${M} ${R}`>] extends RouteSpec ? C[Extract<keyof C, `${M} ${R}`>] : never;
type Routes<C, M extends string> = keyof C extends infer K ? (K extends `${M} ${infer R}` ? R : never) : never;
export type RouteInput<C extends Contract, K extends keyof C> = C[K] extends RouteSpec ? z.input<C[K]["input"]> : never;
export type RouteOutput<C extends Contract, K extends keyof C> = C[K] extends RouteSpec ? z.output<C[K]["output"]> : never;

export function createApi<C extends Contract>(_contract: C) {
  return {
    get: <R extends Routes<C, "GET">>(route: R, query?: z.input<Spec<C, "GET", R>["input"]>) =>
      api.get<z.output<Spec<C, "GET", R>["output"]>>(route, query as Record<string, unknown> | undefined),
    post: <R extends Routes<C, "POST">>(route: R, body: z.input<Spec<C, "POST", R>["input"]>) => api.post<z.output<Spec<C, "POST", R>["output"]>>(route, body),
    useGet: <R extends Routes<C, "GET">>(route: R | null, query?: z.input<Spec<C, "GET", R>["input"]>) =>
      useApi<z.output<Spec<C, "GET", R>["output"]>>(route, query as Record<string, unknown> | undefined),
  };
}

const { apiUrl } = createHttp({ base, fetch: (url, init) => fetch(url, init) });

export function useApi<T = unknown>(path: string | null, query?: Record<string, unknown>) {
  const [state, setState] = useState<{ data?: T; error?: Error; loading: boolean }>({ loading: !!path });
  const key = path ? apiUrl(path, query) : null;
  const load = useCallback(async () => {
    if (!path) return;
    setState((state) => ({ ...state, loading: true }));
    try {
      setState({ data: await api.get<T>(path, query), loading: false });
    } catch (error) {
      setState({ error: error as Error, loading: false });
    }
  }, [key]);
  useEffect(() => { void load(); }, [load]);
  return { ...state, reload: load };
}

export function useUser(): AppUser | null | undefined {
  const user = useSyncExternalStore(auth.subscribe, auth.getSnapshot);
  useEffect(() => {
    if (auth.getSnapshot() === undefined) void auth.refresh();
  }, []);
  return user;
}

export function useChannel(channel: string, handler: Handler) {
  useEffect(() => realtime.subscribe(channel, handler), [channel, handler]);
}
