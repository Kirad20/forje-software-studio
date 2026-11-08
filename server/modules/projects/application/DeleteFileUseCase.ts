import type { Author, IProjectFileRepository } from "../ports/repositories.js";
import { ProjectPath } from "../domain/ProjectPath.js";
import type { ProjectRuntime } from "../domain/ProjectSnapshot.js";

export class DeleteFileUseCase {
  constructor(private readonly fileRepo: IProjectFileRepository, private readonly runtime: (id: string) => Promise<ProjectRuntime> = async () => "native") {}

  async execute(projectId: string, path: string, author: Author = "owner"): Promise<void> {
    ProjectPath.assertValid(path, await this.runtime(projectId));
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
