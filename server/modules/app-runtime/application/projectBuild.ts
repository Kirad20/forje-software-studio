import type { BuildProblem, FileMap } from "../domain/publication.js";
import { endpointRoutes, exampleFiles, jobFiles, readJobSettings } from "../domain/routes.js";
import { readProjectServices, SERVICES_MANIFEST } from "../domain/services.js";

export interface ProjectCompilerPort {
  client(files: FileMap): Promise<unknown>;
  server(files: FileMap, entry: string): Promise<{ exports: string[] }>;
  examples(files: FileMap, file: string): Promise<unknown>;
  problems(error: unknown): BuildProblem[] | null;
  /** Backends in other languages (Spring Boot…); they build per project, so they need its id. */
  backend?(files: FileMap, projectId?: string): Promise<BuildProblem[]>;
}
export function createProjectCheck(compiler: ProjectCompilerPort) {
  return async (files: FileMap, projectId?: string): Promise<BuildProblem[]> => {
    const problems: BuildProblem[] = [];
    try { readProjectServices(files); } catch (error) {
      problems.push({ file: SERVICES_MANIFEST, text: (error as Error).message });
    }
    try { await compiler.client(files); } catch (error) {
      const known = compiler.problems(error);
      if (!known) throw error;
      problems.push(...known);
    }
    for (const file of [...endpointRoutes(files).map((e) => e.file), ...jobFiles(files).map((j) => j.file)]) {
      try {
        const module = await compiler.server(files, file);
        if (!module.exports.includes("default")) problems.push({ file, text: "Debe exportar por defecto una función (export default async function ...)." });
      } catch (error) {
        problems.push(...(compiler.problems(error) ?? [{ file, text: `Error al compilar: ${(error as Error).message}` }]));
      }
    }
    for (const file of exampleFiles(files)) {
      try { await compiler.examples(files, file); } catch (error) {
        const known = compiler.problems(error);
        if (known) problems.push(...known);
      }
    }
    for (const job of jobFiles(files)) {
      const source = files[job.file]!;
      if (/export\s+const\s+schedule/.test(source) && !readJobSettings(source).schedule) {
        problems.push({ file: job.file, text: '`schedule` debe ser un texto literal, p. ej. export const schedule = "0 8 * * *".' });
      }
    }
    if (compiler.backend) problems.push(...await compiler.backend(files, projectId));
    return problems;
  };
}
