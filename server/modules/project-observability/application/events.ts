import type { Problem } from "./problems.js";
export type ProjectEvent =
  | { type: "files"; paths: string[] } | { type: "published"; slug: string }
  | { type: "log"; entry: LogEntry } | { type: "problems"; problems: Problem[] }
  | { type: "github"; status: string; message?: string };
export interface LogEntry {
  at: string; env: "preview" | "published"; level: "info" | "warn" | "error";
  source: "request" | "endpoint" | "job" | "email" | "ai" | "build" | "client"; message: string;
}
export interface LogRepository { get(projectId: string): LogEntry[]; set(projectId: string, entries: LogEntry[]): void }
export function createLogService(repository: LogRepository, emit: (projectId: string, event: ProjectEvent) => unknown, now: () => string) {
  return {
    log(projectId: string, entry: Omit<LogEntry, "at">) {
      const full = { ...entry, at: now() };
      const list = [...repository.get(projectId), full].slice(-500);
      repository.set(projectId, list);
      emit(projectId, { type: "log", entry: full });
    },
    readLogs(projectId: string, opts: { level?: string; limit?: number; env?: "preview" | "published" } = {}) {
      let list = repository.get(projectId);
      if (opts.level === "error") list = list.filter((l) => l.level === "error");
      if (opts.env) list = list.filter((l) => l.env === opts.env);
      return list.slice(-(opts.limit ?? 100));
    },
  };
}
