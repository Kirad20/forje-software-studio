import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
window.addEventListener("popstate", () => listeners.forEach((l) => l()));

export function go(to: string) {
  history.pushState(null, "", to);
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
