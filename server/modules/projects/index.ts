import { DeleteFileUseCase } from "./application/DeleteFileUseCase.js";
import { ProjectsApplication, isDevFile } from "./application/ProjectsApplication.js";
import { RenameFileUseCase } from "./application/RenameFileUseCase.js";
import { WriteFileUseCase } from "./application/WriteFileUseCase.js";
import { ProjectPath } from "./domain/ProjectPath.js";
import { Project as ProjectEntity } from "./domain/Project.js";
import type { Author, IProjectFileRepository } from "./ports/repositories.js";
import type { ProjectsStore, ProjectServices } from "./ports/projects.js";
import type { StarterTemplate } from "./domain/StarterTemplate.js";
import { starterFiles as monolithStarterFiles, parseStarterTemplate } from "./domain/StarterTemplate.js";
import { ordersInvoicesFiles } from "./infrastructure/OrdersInvoicesStarter.js";
import type { ProjectRuntime } from "./domain/ProjectSnapshot.js";

export * from "./domain/ProjectPath.js";
export * from "./domain/Checkpoint.js";
export { parseStarterTemplate } from "./domain/StarterTemplate.js";
export type { StarterTemplate } from "./domain/StarterTemplate.js";
export function starterFiles(name: string, template?: StarterTemplate): Record<string, string> {
  parseStarterTemplate(template);
  const files = monolithStarterFiles(name);
  return template === "orders-invoices" ? { ...files, ...ordersInvoicesFiles() } : files;
}
export * from "./ports/repositories.js";
export { normalizeProjectProfile } from "./domain/ProjectSnapshot.js";
export type { ProjectSnapshot, ProjectPatch, FileMap, SeoSettings, ProjectProfile, ChangeEntry, TurnFileChange, ProjectRuntime } from "./domain/ProjectSnapshot.js";
export type { ProjectsStore, ProjectServices, ProjectEventPort } from "./ports/projects.js";
export type { ProjectOrganizations } from "./ports/collaboration.js";
export type { ProjectSnapshot as Project } from "./domain/ProjectSnapshot.js";
export { ProjectEntity };
export { PostgresProjectsStore } from "./infrastructure/PostgresProjectsStore.js";

export interface ProjectsModuleDependencies {
  store: ProjectsStore;
  files: IProjectFileRepository;
  services: ProjectServices;
}

export function createProjectsModule(dependencies: ProjectsModuleDependencies) {
  const application = new ProjectsApplication(dependencies.store, dependencies.services);
  const runtime = (id: string) => application.projectRuntime(id);
  const writeFileUseCase = new WriteFileUseCase(dependencies.files, runtime);
  const deleteFileUseCase = new DeleteFileUseCase(dependencies.files, runtime);
  const renameFileUseCase = new RenameFileUseCase(dependencies.files, runtime);

  return {
    application,
    isDevFile,
    assertValidPath: ProjectPath.assertValid,
    assertValidPathForProject: (id: string, path: string) => application.assertValidPathForProject(id, path),
    projectRuntime: runtime,
    createProject: (ownerId: string, name: string, description = "", files?: Parameters<typeof application.createProject>[3], orgId?: string, template?: StarterTemplate, runtime?: ProjectRuntime) =>
      application.createProject(ownerId, name, description, files, orgId, template, runtime),
    duplicateProject: (ownerId: string, sourceId: string) => application.duplicateProject(ownerId, sourceId),
    createFolder: (accountId: string, name: string) => application.createFolder(accountId, name),
    createCheckpoint: (projectId: string, label: string, author?: Author, description?: string, actor?: string) =>
      application.createCheckpoint(projectId, label, author, description, actor),
    turnChanges: (projectId: string, turnId: string) => application.turnChanges(projectId, turnId),
    restoreToChange: (projectId: string, changeId: number, author?: Author, actor?: string) =>
      application.restoreToChange(projectId, changeId, author, actor),
    recordPublish: (projectId: string, slug: string, files: Parameters<typeof application.recordPublish>[2], author?: Author) =>
      application.recordPublish(projectId, slug, files, author),
    hasUnpublishedChanges: (projectId: string) => application.hasUnpublishedChanges(projectId),
    getProject: (id: string) => application.getProject(id),
    getProjectBySlug: (slug: string) => application.getProjectBySlug(slug),
    listProjects: (ownerId: string) => application.listProjects(ownerId),
    listAccountOwnedProjectIds: (accountId: string) => application.listAccountOwnedProjectIds(accountId),
    updateProject: (id: string, patch: Parameters<typeof application.updateProject>[1]) => application.updateProject(id, patch),
    revokeShareLinks: (id: string) => application.revokeShareLinks(id),
    markOpened: (id: string) => application.markOpened(id),
    deleteProject: (id: string) => application.deleteProject(id),
    listFolders: (accountId: string) => application.listFolders(accountId),
    deleteFolder: (accountId: string, id: string) => application.deleteFolder(accountId, id),
    readAllFiles: (projectId: string) => application.readAllFiles(projectId),
    listFiles: (projectId: string) => application.listFiles(projectId),
    readFile: (projectId: string, path: string) => application.readFile(projectId, path),
    projectVersion: (projectId: string) => application.projectVersion(projectId),
    listChanges: (projectId: string, limit?: number) => application.listChanges(projectId, limit),
    publishedFiles: (projectId: string) => application.publishedFiles(projectId),
    isSlugTaken: (slug: string, projectId: string) => application.isSlugTaken(slug, projectId),
    unpublish: (projectId: string) => application.unpublish(projectId),
    writeFile: (projectId: string, path: string, content: string, author?: Author, actor?: string) =>
      writeFileUseCase.execute(projectId, path, content, author, actor),
    deleteFile: (projectId: string, path: string, author?: Author) =>
      deleteFileUseCase.execute(projectId, path, author),
    renameFile: (projectId: string, oldPath: string, newPath: string, author?: Author) =>
      renameFileUseCase.execute(projectId, oldPath, newPath, author),
    async start() {},
    async stop() {},
  };
}

export type ProjectsModule = ReturnType<typeof createProjectsModule>;
