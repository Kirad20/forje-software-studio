import { PostgresProjectRepository } from "./infrastructure/PostgresProjectRepository.js";
import { PostgresProjectsStore } from "./infrastructure/PostgresProjectsStore.js";
import { projectOrganizations, projectServices } from "./infrastructure/services.js";
import { platformDb } from "../../platform/db.js";
import { ProjectsApplication } from "./application/ProjectsApplication.js";
import { ProjectPath } from "./domain/ProjectPath.js";
import { WriteFileUseCase } from "./application/WriteFileUseCase.js";
import { DeleteFileUseCase } from "./application/DeleteFileUseCase.js";
import { RenameFileUseCase } from "./application/RenameFileUseCase.js";
import { CreateCheckpointUseCase } from "./application/CreateCheckpointUseCase.js";
import { CreateProjectUseCase } from "./application/CreateProjectUseCase.js";

// Domain & Models
export * from "./domain/Project.js";
export * from "./domain/ProjectPath.js";
export * from "./domain/Checkpoint.js";

// Repositories & Ports
export * from "./ports/repositories.js";
export type { ProjectSnapshot, ProjectPatch, FileMap, SeoSettings, ChangeEntry, TurnFileChange } from "./domain/ProjectSnapshot.js";
export type { ProjectsStore, ProjectServices, ProjectEventPort } from "./ports/projects.js";

// Infrastructure Singleton Adapters
export const projectRepository = new PostgresProjectRepository();
export const projectsStore = new PostgresProjectsStore(platformDb, projectOrganizations, projectServices);
export const projectFileRepository = projectsStore;

// Application Use Cases
export const writeFileUseCase = new WriteFileUseCase(projectFileRepository);
export const deleteFileUseCase = new DeleteFileUseCase(projectFileRepository);
export const renameFileUseCase = new RenameFileUseCase(projectFileRepository);
export const createCheckpointUseCase = new CreateCheckpointUseCase(projectFileRepository);
export const createProjectUseCase = new CreateProjectUseCase(projectsStore, projectServices);

export const projectsApplication = new ProjectsApplication(projectsStore, projectServices);
export { isDevFile } from "./application/ProjectsApplication.js";
export const assertValidPath = ProjectPath.assertValid;
export const createProject = projectsApplication.createProject.bind(projectsApplication);
export const duplicateProject = projectsApplication.duplicateProject.bind(projectsApplication);
export const createFolder = projectsApplication.createFolder.bind(projectsApplication);
export const createCheckpoint = projectsApplication.createCheckpoint.bind(projectsApplication);
export const turnChanges = projectsApplication.turnChanges.bind(projectsApplication);
export const restoreToChange = projectsApplication.restoreToChange.bind(projectsApplication);
export const recordPublish = projectsApplication.recordPublish.bind(projectsApplication);
export const hasUnpublishedChanges = projectsApplication.hasUnpublishedChanges.bind(projectsApplication);
export const getProject = projectsApplication.getProject.bind(projectsApplication);
export const getProjectBySlug = projectsApplication.getProjectBySlug.bind(projectsApplication);
export const listProjects = projectsApplication.listProjects.bind(projectsApplication);
export const listAccountOwnedProjectIds = projectsApplication.listAccountOwnedProjectIds.bind(projectsApplication);
export const updateProject = projectsApplication.updateProject.bind(projectsApplication);
export const revokeShareLinks = projectsApplication.revokeShareLinks.bind(projectsApplication);
export const markOpened = projectsApplication.markOpened.bind(projectsApplication);
export const deleteProject = projectsApplication.deleteProject.bind(projectsApplication);
export const listFolders = projectsApplication.listFolders.bind(projectsApplication);
export const deleteFolder = projectsApplication.deleteFolder.bind(projectsApplication);
export const readAllFiles = projectsApplication.readAllFiles.bind(projectsApplication);
export const listFiles = projectsApplication.listFiles.bind(projectsApplication);
export const readFile = projectsApplication.readFile.bind(projectsApplication);
export const projectVersion = projectsApplication.projectVersion.bind(projectsApplication);
export const listChanges = projectsApplication.listChanges.bind(projectsApplication);
export const publishedFiles = projectsApplication.publishedFiles.bind(projectsApplication);
export const isSlugTaken = projectsApplication.isSlugTaken.bind(projectsApplication);
export const unpublish = projectsApplication.unpublish.bind(projectsApplication);
export const writeFile = writeFileUseCase.execute.bind(writeFileUseCase);
export const deleteFile = deleteFileUseCase.execute.bind(deleteFileUseCase);
export const renameFile = renameFileUseCase.execute.bind(renameFileUseCase);
