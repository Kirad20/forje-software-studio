import { Project, type Visibility } from "../domain/Project.js";
import { Checkpoint } from "../domain/Checkpoint.js";
import { CreateCheckpointUseCase } from "./CreateCheckpointUseCase.js";
import type { ProjectSnapshot, ProjectRuntime } from "../domain/ProjectSnapshot.js";
import { ProjectPath, assertSafeRepositoryContent } from "../domain/ProjectPath.js";
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
  runtime?: ProjectRuntime;
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
      runtime: input.runtime,
      description: input.description ?? "",
      visibility: input.visibility,
      files: input.files,
    });

    const files = input.files ?? (project.runtime === "repository" ? {} : this.services.templates(input.name, template));
    if (project.runtime === "repository") {
      if (Object.keys(files).length > 8000) throw new Error("El repositorio supera el límite de 8000 archivos");
      let total = 0;
      for (const [path, content] of Object.entries(files)) {
        ProjectPath.assertValid(path, project.runtime);
        assertSafeRepositoryContent(path, content);
        const size = content.startsWith("base64:") ? Buffer.byteLength(content.slice(7), "base64") : Buffer.byteLength(content);
        total += size;
        if (size > 4 * 1024 * 1024 || total > 64 * 1024 * 1024) throw new Error("Contenido de repositorio demasiado grande");
      }
    }
    await this.store.create(project, files, input.orgId);
    await new CreateCheckpointUseCase(this.store).execute(project.id, new Checkpoint({
      projectId: project.id, label: "Proyecto creado", author: "system",
    }));
    // Warmup is best effort and must not delay the first project response.
    if (project.runtime === "native") void Promise.resolve().then(() => this.services.warmup(project.id)).catch(() => {});
    return (await this.store.getProject(project.id))!;
  }
}
