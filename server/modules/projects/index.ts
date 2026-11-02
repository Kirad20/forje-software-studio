import { PostgresProjectRepository } from "./infrastructure/PostgresProjectRepository.js";
import { PostgresProjectFileRepository } from "./infrastructure/PostgresProjectFileRepository.js";
import { WriteFileUseCase } from "./application/WriteFileUseCase.js";
import { DeleteFileUseCase } from "./application/DeleteFileUseCase.js";
import { CreateCheckpointUseCase } from "./application/CreateCheckpointUseCase.js";

// Domain & Models
export * from "./domain/Project.js";
export * from "./domain/ProjectPath.js";
export * from "./domain/Checkpoint.js";

// Repositories & Ports
export * from "./ports/repositories.js";

// Infrastructure Singleton Adapters
export const projectRepository = new PostgresProjectRepository();
export const projectFileRepository = new PostgresProjectFileRepository();

// Application Use Cases
export const writeFileUseCase = new WriteFileUseCase(projectFileRepository);
export const deleteFileUseCase = new DeleteFileUseCase(projectFileRepository);
export const createCheckpointUseCase = new CreateCheckpointUseCase(projectFileRepository);
