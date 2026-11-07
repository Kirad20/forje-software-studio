import { ProjectPath, assertSafeRepositoryContent } from "../domain/ProjectPath.js";
import type { ProjectRuntime } from "../domain/ProjectSnapshot.js";
import type { Author, IProjectFileRepository } from "../ports/repositories.js";

export class WriteFileUseCase {
  constructor(private readonly fileRepo: IProjectFileRepository, private readonly runtime: (id: string) => Promise<ProjectRuntime> = async () => "native") {}

  async execute(projectId: string, path: string, content: string, author: Author = "owner", actor?: string): Promise<void> {
    const runtime = await this.runtime(projectId);
    ProjectPath.assertValid(path, runtime);
    if (runtime === "repository") {
      assertSafeRepositoryContent(path, content);
      const size = content.startsWith("base64:") ? Buffer.byteLength(content.slice(7), "base64") : Buffer.byteLength(content);
      if (size > 4 * 1024 * 1024) throw new Error("Archivo de repositorio demasiado grande (4 MB)");
      const current = await this.fileRepo.readAllFiles(projectId);
      let total = size;
      for (const [existingPath, value] of Object.entries(current)) {
        if (existingPath !== path) total += value.startsWith("base64:") ? Buffer.byteLength(value.slice(7), "base64") : Buffer.byteLength(value);
      }
      if (total > 64 * 1024 * 1024 || (!Object.hasOwn(current, path) && Object.keys(current).length >= 8000)) throw new Error("El repositorio supera el límite (64 MB o 8000 archivos)");
    }
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
