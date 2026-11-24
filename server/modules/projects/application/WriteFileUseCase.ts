import { AUTH_MANIFEST, parseOAuthConfig } from "../../../../contracts/oauthProviders.js";
import { COMPONENTS_MANIFEST, parseLayout, safeLayout, NATIVE_LAYOUT, type ProjectLayout } from "../../../../contracts/projectLayout.js";
import { ProjectPath } from "../domain/ProjectPath.js";
import { contentEtag, FileConflictError, type FileExpectation } from "../../../../contracts/fileEtag.js";
import type { Author, IProjectFileRepository } from "../ports/repositories.js";

/**
 * The layout a path is validated against. Native paths and forja.json need no read; other
 * paths are valid only inside a component root declared in the project's forja.json.
 */
export async function layoutForPath(fileRepo: IProjectFileRepository, projectId: string, path: string): Promise<ProjectLayout> {
  if (ProjectPath.isValidWithoutManifest(path)) return NATIVE_LAYOUT;
  const manifest = await fileRepo.readFile(projectId, COMPONENTS_MANIFEST);
  return manifest === undefined ? NATIVE_LAYOUT : safeLayout({ [COMPONENTS_MANIFEST]: manifest }).layout;
}

export class WriteFileUseCase {
  constructor(private readonly fileRepo: IProjectFileRepository) {}

  /**
   * `expected` (optional): the sha of the content the caller read (null = file must not exist).
   * The write then applies only if the file still has it, atomically; otherwise FileConflictError.
   * Without it the write is last-writer-wins, as before.
   */
  async execute(projectId: string, path: string, content: string, author: Author = "owner", actor?: string, expected?: FileExpectation): Promise<void> {
    ProjectPath.assertValid(path, await layoutForPath(this.fileRepo, projectId, path));
    // A manifest that does not parse would silently drop every component: refuse it.
    if (path === COMPONENTS_MANIFEST) parseLayout(content);
    if (path === AUTH_MANIFEST) parseOAuthConfig(content);
    const before = await this.fileRepo.readFile(projectId, path);
    if (before === content) return;

    if (expected === undefined) await this.fileRepo.writeFile(projectId, path, content);
    else {
      const seen = before === undefined ? null : contentEtag(before);
      if (seen !== expected || !(await this.fileRepo.writeFileIf(projectId, path, content, expected))) {
        const now = await this.fileRepo.readFile(projectId, path);
        throw new FileConflictError(path, expected, now === undefined ? null : contentEtag(now));
      }
    }
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
