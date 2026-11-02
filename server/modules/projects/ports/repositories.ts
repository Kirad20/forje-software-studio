import type { Project, Visibility } from "../domain/Project.js";

export type Author = "owner" | "builder" | "mcp" | "github" | "system";

export interface LogChangeInput {
  kind: "create" | "edit" | "delete" | "rename" | "checkpoint" | "restore" | "publish";
  paths: string[];
  author: Author;
  actor?: string;
  label?: string;
  description?: string;
  before?: Record<string, string | null>;
}

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  findBySlug(slug: string): Promise<Project | null>;
  isSlugTaken(slug: string, excludeProjectId: string): Promise<boolean>;
  save(project: Project): Promise<void>;
  updateMetadata(id: string, name: string, description: string, visibility?: Visibility): Promise<void>;
  updatePublished(id: string, slug: string | null, versionId: string | null): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IProjectFileRepository {
  readFile(projectId: string, path: string): Promise<string | undefined>;
  readAllFiles(projectId: string): Promise<Record<string, string>>;
  writeFile(projectId: string, path: string, content: string): Promise<void>;
  deleteFile(projectId: string, path: string): Promise<void>;
  renameFile(projectId: string, from: string, to: string): Promise<void>;
  logChange(projectId: string, change: LogChangeInput): Promise<number>;
  touch(projectId: string, paths: string[]): Promise<void>;
}
