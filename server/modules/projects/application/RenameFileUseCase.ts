import { ProjectPath } from "../domain/ProjectPath.js";
import type { Author, IProjectFileRepository } from "../ports/repositories.js";

export class RenameFileUseCase {
  constructor(private readonly fileRepo: IProjectFileRepository) {}

  async execute(projectId: string, from: string, to: string, author: Author = "owner"): Promise<void> {
    ProjectPath.assertValid(to);
    const content = await this.fileRepo.readFile(projectId, from);
    if (content === undefined) {
      throw new Error(`No existe ${from}`);
    }
    const existing = await this.fileRepo.readFile(projectId, to);

    await this.fileRepo.renameFile(projectId, from, to);
    await this.fileRepo.logChange(projectId, {
      kind: "rename",
      paths: [from, to],
      author,
      before: { [from]: content, [to]: existing ?? null },
    });
    await this.fileRepo.touch(projectId, [from, to]);
  }
}
