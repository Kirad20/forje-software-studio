import { Project, type Visibility } from "../domain/Project.js";
import { Checkpoint } from "../domain/Checkpoint.js";
import { CreateCheckpointUseCase } from "./CreateCheckpointUseCase.js";
import type { ProjectSnapshot } from "../domain/ProjectSnapshot.js";
import type { ProjectsStore, ProjectServices } from "../ports/projects.js";
import { parseStarterTemplate, type StarterTemplate } from "../domain/StarterTemplate.js";

export interface CreateProjectInput {
  id?: string;
  ownerId: string;
  orgId?: string;
  name: string;
  description?: string;
  visibility?: Visibility;
  files?: Record<string, string>;
  template?: StarterTemplate;
}

export class CreateProjectUseCase {
  constructor(
    private readonly store: Pick<ProjectsStore, "create" | "getProject" | "logChange">,
    private readonly services: Pick<ProjectServices, "projectId" | "templates" | "warmup">,
  ) {}

  async execute(input: CreateProjectInput): Promise<ProjectSnapshot> {
    const template = parseStarterTemplate(input.template);
    const project = new Project({
      id: input.id ?? this.services.projectId(),
      ownerId: input.ownerId,
      orgId: input.orgId ?? null,
      name: input.name,
      description: input.description ?? "",
      visibility: input.visibility ?? "public",
      files: input.files,
    });

    await this.store.create(project, input.files ?? this.services.templates(input.name, template), input.orgId);
    await new CreateCheckpointUseCase(this.store).execute(project.id, new Checkpoint({
      projectId: project.id, label: "Proyecto creado", author: "system",
    }));
    // Warmup is best effort and must not delay the first project response.
    void Promise.resolve().then(() => this.services.warmup(project.id)).catch(() => {});
    return (await this.store.getProject(project.id))!;
  }
}
