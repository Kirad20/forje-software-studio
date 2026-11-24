import { ProjectPath } from "../domain/ProjectPath.js";
import { contentEtag, FileConflictError } from "../../../../contracts/fileEtag.js";
import { layoutForPath } from "./WriteFileUseCase.js";
import type { Author, IProjectFileRepository } from "../ports/repositories.js";

export class RenameFileUseCase {
  constructor(private readonly fileRepo: IProjectFileRepository) {}

  /** `expected` (optional): sha of `from` as the caller read it; the move then also refuses an existing `to`. */
  async execute(projectId: string, from: string, to: string, author: Author = "owner", expected?: string): Promise<void> {
    ProjectPath.assertValid(to, await layoutForPath(this.fileRepo, projectId, to));
    const content = await this.fileRepo.readFile(projectId, from);
    if (content === undefined) {
      throw new Error(`No existe ${from}`);
    }
    const existing = await this.fileRepo.readFile(projectId, to);

    if (expected === undefined) await this.fileRepo.renameFile(projectId, from, to);
    else if (contentEtag(content) !== expected || existing !== undefined || !(await this.fileRepo.renameFileIf(projectId, from, to, expected))) {
      const now = await this.fileRepo.readFile(projectId, from);
      if (now !== undefined && existing !== undefined) throw new Error(`Ya existe ${to}. Elige otra ruta o borra ese archivo primero con delete_file.`);
      throw new FileConflictError(from, expected, now === undefined ? null : contentEtag(now));
    }
    await this.fileRepo.logChange(projectId, {
      kind: "rename",
      paths: [from, to],
      author,
      before: { [from]: content, [to]: existing ?? null },
    });
    await this.fileRepo.touch(projectId, [from, to]);
  }
}
