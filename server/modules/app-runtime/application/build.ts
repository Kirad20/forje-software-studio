import type { BuildPorts } from "./ports.js";
import type { FileMap } from "../domain/publication.js";

export function createBuildVerification(ports: BuildPorts) {
  return async (files: FileMap, projectId?: string) => {
    const compiled = await ports.compile(files, projectId);
    const problems = compiled.length ? compiled : await ports.typecheck(files);
    return { ok: !problems.length, problems };
  };
}
