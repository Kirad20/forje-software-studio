import type { Project } from "../domain/Project.js";
import type { BeforeImage } from "../domain/ChangeTimeline.js";
import type { FileMap, ProjectSnapshot, ProjectPatch, ChangeEntry } from "../domain/ProjectSnapshot.js";
import type { LogChangeInput } from "./repositories.js";
import type { StarterTemplate } from "../domain/StarterTemplate.js";

export interface ProjectEventPort {
  emit(projectId: string, event: { type: "files"; paths: string[] } | { type: "published"; slug: string }): void;
}

export interface ProjectServices extends ProjectEventPort {
  projectId(): string;
  id(): string;
  templates(name: string, template?: StarterTemplate): FileMap;
  warmup(projectId: string): Promise<unknown>;
  clone(sourceId: string, targetId: string): Promise<void>;
}

/** Creation and restoration each preserve their original database transaction boundary. */
export interface ProjectsStore {
  create(project: Project, files: FileMap, orgId?: string): Promise<void>;
  getProject(id: string): Promise<ProjectSnapshot | undefined>;
  getProjectBySlug(slug: string): Promise<ProjectSnapshot | undefined>;
  listProjects(ownerId: string): Promise<ProjectSnapshot[]>;
  listAccountOwnedProjectIds(accountId: string): Promise<string[]>;
  updateProject(id: string, patch: ProjectPatch): Promise<void>;
  revokeShareLinks(id: string): Promise<void>;
  markOpened(id: string): Promise<void>;
  deleteProject(id: string): Promise<void>;
  listFolders(accountId: string): Promise<{ id: string; name: string }[]>;
  createFolder(accountId: string, id: string, name: string): Promise<void>;
  deleteFolder(accountId: string, id: string): Promise<void>;
  readAllFiles(projectId: string): Promise<FileMap>;
  listFiles(projectId: string): Promise<{ path: string; size: number; updatedAt: string }[]>;
  readFile(projectId: string, path: string): Promise<string | undefined>;
  logChange(projectId: string, change: LogChangeInput): Promise<number>;
  touch(projectId: string): Promise<void>;
  projectVersion(projectId: string): Promise<number>;
  listChanges(projectId: string, limit: number): Promise<ChangeEntry[]>;
  turnSpan(projectId: string, turnId: string): Promise<{ start: string; last: number } | undefined>;
  nextTurn(projectId: string, last: number, turnId: string): Promise<{ at: string } | undefined>;
  builderChanges(projectId: string, start: string, end: string | null): Promise<{ id: number; before: BeforeImage }[]>;
  nextFileBefore(projectId: string, afterId: number, path: string): Promise<{ content: string | null } | undefined>;
  previousChange(projectId: string, firstId: number): Promise<number | null>;
  restoreTarget(projectId: string, changeId: number): Promise<{ id: number; label: string | null } | undefined>;
  changesAfter(projectId: string, changeId: number): Promise<{ before: BeforeImage }[]>;
  restoreFiles(projectId: string, desired: Map<string, string | null>): Promise<void>;
  publishedFiles(projectId: string): Promise<FileMap | undefined>;
  isSlugTaken(slug: string, projectId: string): Promise<boolean>;
  recordPublish(projectId: string, slug: string, versionId: string, files: FileMap): Promise<void>;
  unpublish(projectId: string): Promise<void>;
}
