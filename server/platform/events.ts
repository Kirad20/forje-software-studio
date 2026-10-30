import { EventEmitter } from "node:events";

export type ProjectEvent =
  | { type: "files"; paths: string[] }
  | { type: "published"; slug: string }
  | { type: "log"; entry: LogEntry }
  | { type: "problems"; problems: import("./problems.js").Problem[] }
  | { type: "github"; status: string; message?: string };

export interface LogEntry {
  at: string;
  env: "preview" | "published";
  level: "info" | "warn" | "error";
  source: "request" | "endpoint" | "job" | "email" | "ai" | "build" | "client";
  message: string;
}

/** In-process fan-out of project changes: drives live preview reloads and log tails. */
export const projectEvents = new EventEmitter();
projectEvents.setMaxListeners(0);

export const emitProject = (projectId: string, event: ProjectEvent) => projectEvents.emit(projectId, event);

const LOG_LIMIT = 500;
const logs = new Map<string, LogEntry[]>();

/** Logs are kept in memory, newest last, capped per project. */
export function log(projectId: string, entry: Omit<LogEntry, "at">) {
  const full = { ...entry, at: new Date().toISOString() };
  const list = logs.get(projectId) ?? [];
  list.push(full);
  if (list.length > LOG_LIMIT) list.splice(0, list.length - LOG_LIMIT);
  logs.set(projectId, list);
  emitProject(projectId, { type: "log", entry: full });
}

export function readLogs(projectId: string, opts: { level?: string; limit?: number } = {}): LogEntry[] {
  let list = logs.get(projectId) ?? [];
  if (opts.level === "error") list = list.filter((l) => l.level === "error");
  return list.slice(-(opts.limit ?? 100));
}
