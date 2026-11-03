import type { BuildProblem, FileMap } from "../domain/publication.js";
import { endpointRoutes, exampleFiles, jobFiles, readJobSettings } from "../domain/routes.js";

export interface ProjectCompilerPort {
  client(files: FileMap): Promise<unknown>;
  server(files: FileMap, entry: string): Promise<{ exports: string[] }>;
  examples(files: FileMap, file: string): Promise<unknown>;
  problems(error: unknown): BuildProblem[] | null;
}
export function createProjectCheck(compiler: ProjectCompilerPort) {
  return async (files: FileMap): Promise<BuildProblem[]> => {
    const problems: BuildProblem[] = [];
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
    return problems;
  };
}
