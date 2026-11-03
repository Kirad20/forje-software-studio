import { createEventAdapters } from "./infrastructure/events.js";
import { createLogService, type ProjectEvent } from "./application/events.js";
export * from "./application/events.js";
const adapters = createEventAdapters();
export const projectEvents = adapters.projectEvents;
const listeners = new Set<(projectId: string, event: ProjectEvent) => void>();
export function onProjectEvent(listener: (projectId: string, event: ProjectEvent) => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export const emitProject = (projectId: string, event: ProjectEvent) => {
  projectEvents.emit(projectId, event);
  for (const listener of listeners) listener(projectId, event);
};
export const { log, readLogs } = createLogService(adapters.logRepository, emitProject, () => new Date().toISOString());
