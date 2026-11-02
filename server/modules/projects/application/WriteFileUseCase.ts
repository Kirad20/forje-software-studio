import { ProjectPath } from "../domain/ProjectPath.js";
import type { Author, IProjectFileRepository } from "../ports/repositories.js";

export class WriteFileUseCase {
  constructor(private readonly fileRepo: IProjectFileRepository) {}

  async execute(projectId: string, path: string, content: string, author: Author = "owner", actor?: string): Promise<void> {
    ProjectPath.assertValid(path);
    const before = await this.fileRepo.readFile(projectId, path);
    if (before === content) return;

    await this.fileRepo.writeFile(projectId, path, content);
    await this.fileRepo.logChange(projectId, {
      kind: before === undefined ? "create" : "edit",
      paths: [path],
      author,
      actor,
      before: { [path]: before ?? null },
    });
    await this.fileRepo.touch(projectId, [path]);
  }
}
