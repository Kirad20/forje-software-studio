/** Compatibility API. The projects module owns persistence and application policies. */
export {
  isDevFile, assertValidPath, createProject, getProject, getProjectBySlug, listProjects,
  updateProject, revokeShareLinks, markOpened, deleteProject, duplicateProject,
  listFolders, createFolder, deleteFolder, readAllFiles, listFiles, readFile,
  projectVersion, writeFile, deleteFile, renameFile, createCheckpoint, listChanges,
  turnChanges, restoreToChange, publishedFiles, isSlugTaken, recordPublish,
  unpublish, hasUnpublishedChanges,
} from "../modules/projects/index.js";
export type {
  ProjectSnapshot as Project, FileMap, Author, SeoSettings, ProjectPatch, ChangeEntry, TurnFileChange,
} from "../modules/projects/index.js";
