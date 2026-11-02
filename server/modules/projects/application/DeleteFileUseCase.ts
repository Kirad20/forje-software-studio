import type { Author, IProjectFileRepository } from "../ports/repositories.js";

export class DeleteFileUseCase {
  constructor(private readonly fileRepo: IProjectFileRepository) {}

  async execute(projectId: string, path: string, author: Author = "owner"): Promise<void> {
    const before = await this.fileRepo.readFile(projectId, path);
    if (before === undefined) return;

    await this.fileRepo.deleteFile(projectId, path);
    await this.fileRepo.logChange(projectId, {
      kind: "delete",
      paths: [path],
      author,
      before: { [path]: before },
    });
    await this.fileRepo.touch(projectId, [path]);
  }
}
