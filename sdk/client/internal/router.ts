import { createElement, useEffect, useSyncExternalStore, type ComponentType, type MouseEvent, type ReactNode } from "react";
import { base } from "./browser.js";

export interface RouteMatch {
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
}

export interface PageRoute {
  pattern: string;
  component: ComponentType;
}

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  if (!listeners.size) window.addEventListener("popstate", notify);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("popstate", notify);
  };
};

function currentPath(): string {
  const path = window.location.pathname.slice(base().length) || "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  const url = to.startsWith("/") ? base() + to : to;
  if (opts.replace) history.replaceState(null, "", url);
  else history.pushState(null, "", url);
  window.scrollTo(0, 0);
  notify();
}

export function Link(props: { to: string; className?: string; children?: ReactNode; style?: React.CSSProperties }) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    navigate(props.to);
  };
  return createElement("a", { href: base() + props.to, onClick, className: props.className, style: props.style }, props.children);
}

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
  for (const route of routeTable) {
    const params = matchRoute(route.pattern, path);
    if (params) return { path, params, query: new URLSearchParams(search) };
  }
  return { path, params: {}, query: new URLSearchParams(search) };
}

export function useHead(head: { title?: string; description?: string; canonical?: string }) {
  const { title, description, canonical } = head;
  useEffect(() => {
    const previousTitle = document.title;
    if (title) document.title = title;
    const restore = [
      setHeadTag("meta", "name", "description", "content", description),
      setHeadTag("link", "rel", "canonical", "href", canonical && new URL(canonical, window.location.origin).href),
    ];
    return () => {
      document.title = previousTitle;
      restore.forEach((undo) => undo());
    };
  }, [title, description, canonical]);
}

function setHeadTag(tag: string, key: string, keyValue: string, attr: string, value: string | undefined): () => void {
  if (!value) return () => {};
  let element = document.head.querySelector<HTMLElement>(`${tag}[${key}="${keyValue}"]`);
  const created = !element;
  if (!element) {
    element = document.createElement(tag);
    element.setAttribute(key, keyValue);
    document.head.appendChild(element);
  }
  const previous = element.getAttribute(attr);
  element.setAttribute(attr, value);
  return () => (created ? element!.remove() : previous === null ? element!.removeAttribute(attr) : element!.setAttribute(attr, previous));
}

export function ForjaApp(props: { routes: PageRoute[]; layout?: ComponentType<{ children: ReactNode }>; notFound?: ComponentType }) {
  routeTable = props.routes;
  const { path } = useRoute();
  const route = props.routes.find((route) => matchRoute(route.pattern, path));
  const page = route ? createElement(route.component) : props.notFound ? createElement(props.notFound)
    : createElement("div", { style: { padding: 48, fontFamily: "system-ui" } }, "Página no encontrada");
  return props.layout ? createElement(props.layout, null, page) : page;
}
