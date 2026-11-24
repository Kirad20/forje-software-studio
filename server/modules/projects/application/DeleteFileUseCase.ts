import { contentEtag, FileConflictError } from "../../../../contracts/fileEtag.js";
import type { Author, IProjectFileRepository } from "../ports/repositories.js";

export class DeleteFileUseCase {
  constructor(private readonly fileRepo: IProjectFileRepository) {}

  /** `expected` (optional): sha of the content the caller read; the delete applies only if the file still has it. */
  async execute(projectId: string, path: string, author: Author = "owner", expected?: string): Promise<void> {
    const before = await this.fileRepo.readFile(projectId, path);
    if (before === undefined) return;

    if (expected === undefined) await this.fileRepo.deleteFile(projectId, path);
    else if (contentEtag(before) !== expected || !(await this.fileRepo.deleteFileIf(projectId, path, expected))) {
      const now = await this.fileRepo.readFile(projectId, path);
      throw new FileConflictError(path, expected, now === undefined ? null : contentEtag(now));
    }
    await this.fileRepo.logChange(projectId, {
      kind: "delete",
      paths: [path],
      author,
      before: { [path]: before },
    });
    await this.fileRepo.touch(projectId, [path]);
  }
}
