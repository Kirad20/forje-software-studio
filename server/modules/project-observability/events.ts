import { createEventAdapters } from "./infrastructure/events.js";
import { createLogService, type ProjectEvent } from "./application/events.js";
export * from "./application/events.js";
const adapters = createEventAdapters();
export const projectEvents = adapters.projectEvents;
export const emitProject = (projectId: string, event: ProjectEvent) => projectEvents.emit(projectId, event);
export const { log, readLogs } = createLogService(adapters.logRepository, emitProject, () => new Date().toISOString());
