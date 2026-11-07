import type { Author, BuildProblem, FileMap, PublicationFinding } from "../domain/publication.js";

export interface PublicationPorts {
  getProject(id: string): Promise<{ id: string; name: string; slug?: string | null }>;
  isSlugTaken(slug: string, projectId: string): Promise<boolean>;
  readAllFiles(id: string): Promise<FileMap>;
  checkProject(files: FileMap): Promise<BuildProblem[]>;
  scan(id: string, files: FileMap): Promise<PublicationFinding[]>;
  applyMigrations(id: string, files: FileMap): Promise<{ applied: string[] }>;
  recordPublish(id: string, slug: string, files: FileMap, author: Author): Promise<unknown>;
  unpublish(id: string): Promise<unknown>;
  scheduleProject(id: string): Promise<unknown>;
  appUrl(slug: string): string;
}

export interface RuntimeProjectsPort {
  getProject(id: string): Promise<{ id: string; name: string; slug?: string | null; runtime?: "native" | "repository" } | null | undefined>;
  isSlugTaken: PublicationPorts["isSlugTaken"];
  readAllFiles: PublicationPorts["readAllFiles"];
  recordPublish: PublicationPorts["recordPublish"];
  unpublish: PublicationPorts["unpublish"];
  publishedFiles(id: string): Promise<FileMap | null | undefined>;
  isDevFile(path: string): boolean;
}

export interface BuildPorts {
  compile(files: FileMap): Promise<BuildProblem[]>;
  typecheck(files: FileMap): Promise<BuildProblem[]>;
}

export interface SharePorts {
  now(): number;
  sign(projectId: string, epoch: number, expiry: string): string;
  equal(a: string, b: string): boolean;
  publicUrl(): string;
}

export interface RuntimeEvent { type: string; paths?: string[] }
export interface RuntimeObservationPorts {
  log(projectId: string, entry: { env: "preview" | "published"; level: "info" | "error"; source: "endpoint" | "request" | "build" | "client"; message: string }): unknown;
  watchProblems(projectId: string): unknown;
  projectEvents: {
    on(projectId: string, listener: (event: RuntimeEvent) => void): unknown;
    off(projectId: string, listener: (event: RuntimeEvent) => void): unknown;
  };
  scan(projectId: string, files: FileMap): Promise<PublicationFinding[]>;
}
