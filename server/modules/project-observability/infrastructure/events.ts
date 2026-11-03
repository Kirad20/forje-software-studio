import { EventEmitter } from "node:events";
import type { LogEntry, LogRepository } from "../application/events.js";
export function createEventAdapters() {
  const projectEvents = new EventEmitter();
  projectEvents.setMaxListeners(0);
  const logs = new Map<string, LogEntry[]>();
  const logRepository: LogRepository = { get: (p) => logs.get(p) ?? [], set: (p, entries) => { logs.set(p, entries); } };
  return { projectEvents, logRepository };
}
