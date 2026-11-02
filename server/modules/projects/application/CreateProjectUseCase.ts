import { Project, type Visibility } from "../domain/Project.js";
import type { IProjectRepository, IProjectFileRepository } from "../ports/repositories.js";

export interface CreateProjectInput {
  id: string;
  ownerId: string;
  orgId: string;
  name: string;
  description?: string;
  visibility?: Visibility;
  files?: Record<string, string>;
}

export class CreateProjectUseCase {
  constructor(
    private readonly projectRepo: IProjectRepository,
    private readonly fileRepo: IProjectFileRepository,
  ) {}

  async execute(input: CreateProjectInput): Promise<Project> {
    const project = new Project({
      id: input.id,
      ownerId: input.ownerId,
      orgId: input.orgId,
      name: input.name,
      description: input.description ?? "",
      visibility: input.visibility ?? "public",
      files: input.files,
    });

    await this.projectRepo.save(project);

    if (input.files) {
      for (const [path, content] of Object.entries(input.files)) {
        await this.fileRepo.writeFile(input.id, path, content);
      }
    }

    await this.fileRepo.logChange(input.id, {
      kind: "checkpoint",
      paths: [],
      author: "system",
      label: "Proyecto creado",
    });

    return project;
  }
}
