import type { RepositoryConfig, RepositoryDeployment, RepositoryEnvironment, RepositoryRevision, RepositoryState } from "../domain/repository.js";

export interface RepositoryStore {
  load(id: string): Promise<RepositoryState | undefined>;
  save(id: string, state: RepositoryState): Promise<void>;
  list(): Promise<string[]>;
  delete(id: string): Promise<void>;
  exclusive<T>(id: string, work: () => Promise<T>): Promise<T>;
  buildSlot?<T>(work: () => Promise<T>): Promise<T>;
}
export interface RepositoryRunner {
  unavailableReason?: string;
  available(): Promise<boolean>;
  build(projectId: string, revisionId: string, files: Record<string, string>, config: RepositoryConfig, log: (text: string) => void): Promise<string>;
  deploy(projectId: string, env: RepositoryEnvironment, revision: RepositoryRevision, config: RepositoryConfig, publicUrl: string): Promise<Omit<RepositoryDeployment, "revisionId">>;
  healthy(deployment: RepositoryDeployment, config: RepositoryConfig): Promise<boolean>;
  stop(projectId: string, env: RepositoryEnvironment, deployment?: RepositoryDeployment): Promise<void>;
  remove(projectId: string, images: string[]): Promise<void>;
  logs(deployment: RepositoryDeployment, projectId?: string, env?: RepositoryEnvironment): Promise<string>;
  cleanup?(projectId: string, activeContainers: string[]): Promise<void>;
}
export interface RepositoryRuntimePorts {
  store: RepositoryStore;
  runner: RepositoryRunner;
  readAllFiles(id: string): Promise<Record<string, string>>;
  recordPublish(id: string, slug: string, files: Record<string, string>, author?: "owner" | "builder" | "mcp" | "github" | "system"): Promise<unknown>;
  isSlugTaken(slug: string, id: string): Promise<boolean>;
  appUrl(slug: string): string;
  previewUrl(id: string): string;
  id(): string;
  now(): string;
  proxy(request: Request, deployment: RepositoryDeployment, env: RepositoryEnvironment): Promise<Response>;
}
