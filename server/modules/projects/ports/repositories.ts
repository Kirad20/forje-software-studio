import type { Project, Visibility } from "../domain/Project.js";

import type { Author } from "../domain/Author.js";
import type { FileExpectation } from "../../../../contracts/fileEtag.js";
export type { Author } from "../domain/Author.js";

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
  /** Atomic compare-and-set by content sha (see FileEtag): false when the file no longer matches `expected`. */
  writeFileIf(projectId: string, path: string, content: string, expected: FileExpectation): Promise<boolean>;
  deleteFileIf(projectId: string, path: string, expected: string): Promise<boolean>;
  /** Moves `from` to `to` only if `from` still has `expected` and `to` does not exist. */
  renameFileIf(projectId: string, from: string, to: string, expected: string): Promise<boolean>;
  logChange(projectId: string, change: LogChangeInput): Promise<number>;
  touch(projectId: string, paths: string[]): Promise<void>;
}
