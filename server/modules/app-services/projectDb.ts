export type { ProjectDb } from "./ports/database.js";
export {
  projectDb, execSql, dumpDatabase, closeProject, cloneDatabase, closeAll, isAwake, projectDbMetrics,
  applyProjectMigrations, projectDbStats,
} from "./infrastructure/projectDb.js";
export type { ProjectDbEnv, ProjectMigration, ProjectDbMetrics } from "./infrastructure/projectDb.js";
import { schemaRows } from "./infrastructure/repositories.js";
import { createProjectData } from "./application/projectData.js";
export { createProjectData } from "./application/projectData.js";
export const { describeSchema } = createProjectData(schemaRows);
import { createProjectRows } from "./application/projectData.js";
import { projectRowsRepository } from "./infrastructure/projectRows.js";
export { createProjectRows, ProjectDataError } from "./application/projectData.js";
export const { listProjectRows, createProjectRow, deleteProjectRows, listAppUsers, projectServiceCounts } = createProjectRows(schemaRows, projectRowsRepository);
