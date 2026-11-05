import type { FileMap } from "../domain/publication.js";
import type { ServiceQueueEntry, ServiceRuntimeSnapshot } from "../domain/serviceControl.js";

export interface ServiceControlPorts {
  readFiles(projectId: string): Promise<FileMap>;
  writeManifest(projectId: string, content: string): Promise<unknown>;
  listQueue(projectId: string): Promise<ServiceQueueEntry[]>;
  runtime(projectId: string): Promise<ServiceRuntimeSnapshot>;
  restart(projectId: string, service: string, env?: "preview" | "published"): Promise<unknown>;
}
