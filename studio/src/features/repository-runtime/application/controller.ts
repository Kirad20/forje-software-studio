import { createController } from "../../../shared/application/create-controller.js";
import { httpClient } from "../../../shared/infrastructure/http-client.js";

export const api = createController(httpClient).request;

export interface RepositoryConfig {
  rootDirectory: string;
  dockerfile: string | null;
  port: number;
  healthPath: string;
  postgres: boolean;
  storagePath: string | null;
}

export interface RepositoryRevision {
  id: string;
  image: string;
  createdAt: string;
  status: "ready" | "failed";
  error: string | null;
}

export interface RepositorySnapshot {
  available: boolean;
  config: RepositoryConfig;
  status: "idle" | "building" | "ready" | "failed";
  error: string | null;
  preview: RepositoryRevision | null;
  published: RepositoryRevision | null;
  revisions: RepositoryRevision[];
  logs: string;
}
