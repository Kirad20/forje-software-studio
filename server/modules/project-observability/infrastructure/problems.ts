import { createHash } from "node:crypto";
import type { Problem, ProblemRepository } from "../application/problems.js";
export function createProblemAdapters() {
  const state = new Map<string, Map<string, Problem>>();
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const repository: ProblemRepository = {
    get(p) { let map = state.get(p); if (!map) { map = new Map(); state.set(p, map); } return map; },
  };
  return {
    repository,
    now: () => new Date().toISOString(),
    fingerprint: (kind: string, text: string) => createHash("sha1").update(kind + "\0" + text.replace(/\d+ ms/g, "").replace(/:\d+:\d+\)?/g, "").replace(/\s+/g, " ").slice(0, 300)).digest("hex").slice(0, 12),
    schedule(key: string, delay: number, action: () => void) {
      clearTimeout(timers.get(key));
      timers.set(key, setTimeout(() => { timers.delete(key); action(); }, delay));
    },
    stopTimers() { for (const timer of timers.values()) clearTimeout(timer); timers.clear(); },
  };
}
