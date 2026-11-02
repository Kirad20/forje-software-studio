import type { Checkpoint } from "../domain/Checkpoint.js";
import type { IProjectFileRepository } from "../ports/repositories.js";

export class CreateCheckpointUseCase {
  constructor(private readonly fileRepo: IProjectFileRepository) {}

  async execute(projectId: string, checkpoint: Checkpoint): Promise<number> {
    return this.fileRepo.logChange(projectId, {
      kind: "checkpoint",
      paths: [],
      author: checkpoint.author,
      actor: checkpoint.actor ?? undefined,
      label: checkpoint.label,
      description: checkpoint.description ?? undefined,
    });
  }
}
