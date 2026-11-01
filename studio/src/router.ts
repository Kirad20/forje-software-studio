import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
window.addEventListener("popstate", () => listeners.forEach((l) => l()));

export function go(to: string, opts: { replace?: boolean } = {}) {
  if (opts.replace) history.replaceState(null, "", to);
  else history.pushState(null, "", to);
  listeners.forEach((l) => l());
}

export function usePath() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => location.pathname + location.search,
  );
}
