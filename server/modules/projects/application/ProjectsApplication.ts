import { Checkpoint } from "../domain/Checkpoint.js";
import { CreateProjectUseCase } from "./CreateProjectUseCase.js";
import { CreateCheckpointUseCase } from "./CreateCheckpointUseCase.js";
import { beforeImages, restoredFiles, turnFileChange } from "../domain/ChangeTimeline.js";
import { ProjectPath, assertSafeRepositoryPath } from "../domain/ProjectPath.js";
import type { FileMap, ProjectSnapshot, ProjectPatch, TurnChanges, ProjectRuntime } from "../domain/ProjectSnapshot.js";
import type { Author } from "../ports/repositories.js";
import type { ProjectsStore, ProjectServices } from "../ports/projects.js";
import type { StarterTemplate } from "../domain/StarterTemplate.js";

export const isDevFile = (path: string) => ProjectPath.isDevPath(path);

export class ProjectsApplication {
  constructor(private readonly store: ProjectsStore, private readonly services: ProjectServices) {}

  getProject(id: string) { return this.store.getProject(id); }
  getProjectBySlug(slug: string) { return this.store.getProjectBySlug(slug); }
  listProjects(ownerId: string) { return this.store.listProjects(ownerId); }
  listAccountOwnedProjectIds(accountId: string) { return this.store.listAccountOwnedProjectIds(accountId); }
  updateProject(id: string, patch: ProjectPatch) { return this.store.updateProject(id, patch); }
  revokeShareLinks(id: string) { return this.store.revokeShareLinks(id); }
  markOpened(id: string) { return this.store.markOpened(id); }
  deleteProject(id: string) { return this.store.deleteProject(id); }
  listFolders(accountId: string) { return this.store.listFolders(accountId); }
  deleteFolder(accountId: string, id: string) { return this.store.deleteFolder(accountId, id); }
  readAllFiles(projectId: string) { return this.store.readAllFiles(projectId); }
  listFiles(projectId: string) { return this.store.listFiles(projectId); }
  async readFile(projectId: string, path: string) {
    const runtime = await this.projectRuntime(projectId);
    if (runtime === "native" && !ProjectPath.isValid(path)) {
      assertSafeRepositoryPath(path);
      return undefined;
    }
    ProjectPath.assertValid(path, runtime);
    return this.store.readFile(projectId, path);
  }
  async projectRuntime(projectId: string): Promise<ProjectRuntime> {
    const project = await this.store.getProject(projectId);
    if (!project) throw new Error("Proyecto no encontrado");
    return project.runtime ?? "native";
  }
  async assertValidPathForProject(projectId: string, path: string): Promise<void> {
    ProjectPath.assertValid(path, await this.projectRuntime(projectId));
  }
  projectVersion(projectId: string) { return this.store.projectVersion(projectId); }
  listChanges(projectId: string, limit = 300) { return this.store.listChanges(projectId, limit); }
  publishedFiles(projectId: string) { return this.store.publishedFiles(projectId); }
  isSlugTaken(slug: string, projectId: string) { return this.store.isSlugTaken(slug, projectId); }
  unpublish(projectId: string) { return this.store.unpublish(projectId); }

  async createProject(ownerId: string, name: string, description = "", files?: FileMap, orgId?: string, template?: StarterTemplate, runtime?: ProjectRuntime): Promise<ProjectSnapshot> {
    return new CreateProjectUseCase(this.store, this.services).execute({ ownerId, name, description, files, orgId, template, runtime });
  }

  async duplicateProject(ownerId: string, sourceId: string): Promise<ProjectSnapshot> {
    const src = (await this.store.getProject(sourceId))!;
    const copy = await this.createProject(ownerId, `${src.name} (copia)`, src.description, await this.store.readAllFiles(sourceId), undefined, undefined, src.runtime);
    await this.store.updateProject(copy.id, { systemPrompt: src.systemPrompt, designPrompt: src.designPrompt, seo: src.seo, profile: src.profile, folderId: src.folderId });
    if (src.runtime !== "repository") await this.services.clone(sourceId, copy.id);
    return (await this.store.getProject(copy.id))!;
  }

  async createFolder(accountId: string, name: string): Promise<string> {
    const id = this.services.id();
    await this.store.createFolder(accountId, id, name.trim().slice(0, 60) || "Carpeta");
    return id;
  }

  async createCheckpoint(projectId: string, label: string, author: Author = "owner", description?: string, actor?: string): Promise<number> {
    const checkpoint = new Checkpoint({ projectId, label, author, description, actor });
    return new CreateCheckpointUseCase(this.store).execute(projectId, checkpoint);
  }

  async turnChanges(projectId: string, turnId: string): Promise<TurnChanges | null> {
    const span = await this.store.turnSpan(projectId, turnId);
    if (!span?.start) return null;
    const next = await this.store.nextTurn(projectId, span.last, turnId);
    const rows = await this.store.builderChanges(projectId, span.start, next?.at ?? null);
    if (!rows.length) return { files: [], restoreTo: null, firstChange: null };
    const first = new Map<string, string | null>();
    const lastId = new Map<string, number>();
    for (const row of rows) {
      for (const [path, content] of Object.entries(row.before)) {
        if (!first.has(path)) first.set(path, content);
        lastId.set(path, row.id);
      }
    }
    const current = await this.store.readAllFiles(projectId);
    const files = [];
    for (const [path, before] of first) {
      const later = await this.store.nextFileBefore(projectId, lastId.get(path)!, path);
      const diff = turnFileChange(path, before, later ? later.content : current[path] ?? null);
      if (diff) files.push(diff);
    }
    return {
      files: files.sort((a, b) => a.path.localeCompare(b.path)),
      restoreTo: await this.store.previousChange(projectId, rows[0]!.id), firstChange: rows[0]!.id,
    };
  }

  async restoreToChange(projectId: string, changeId: number, author: Author = "owner", actor?: string): Promise<void> {
    const target = await this.store.restoreTarget(projectId, changeId);
    if (!target) throw new Error("Punto de restauración no encontrado");
    const desired = restoredFiles(await this.store.changesAfter(projectId, changeId));
    if (!desired.size) return;
    const undo = beforeImages(desired.keys(), await this.store.readAllFiles(projectId));
    await this.store.restoreFiles(projectId, desired);
    await this.store.logChange(projectId, {
      kind: "restore", paths: [...desired.keys()], author, actor,
      label: `Restaurado a ${target.label ?? `cambio #${target.id}`}`, before: undo,
    });
    await this.store.touch(projectId);
    this.services.emit(projectId, { type: "files", paths: [...desired.keys()] });
  }

  async recordPublish(projectId: string, slug: string, files: FileMap, author: Author = "owner"): Promise<void> {
    const runtime = await this.projectRuntime(projectId);
    const shipped = runtime === "repository" ? files : Object.fromEntries(Object.entries(files).filter(([path]) => !isDevFile(path)));
    await this.store.recordPublish(projectId, slug, this.services.id(), shipped);
    await this.store.logChange(projectId, { kind: "publish", paths: [], author, label: "App publicada" });
    this.services.emit(projectId, { type: "published", slug });
  }

  async hasUnpublishedChanges(projectId: string): Promise<boolean> {
    const live = await this.store.publishedFiles(projectId);
    if (!live) return false;
    const current = await this.store.readAllFiles(projectId);
    const runtime = await this.projectRuntime(projectId);
    const keys = new Set([...Object.keys(live), ...Object.keys(current)].filter((path) => runtime === "repository" || !isDevFile(path)));
    for (const path of keys) if (live[path] !== current[path]) return true;
    return false;
  }
}
