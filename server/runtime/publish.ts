import { scheduleProject } from "../baas/jobs.js";
import { getProject, isSlugTaken, readAllFiles, recordPublish, unpublish, type Project } from "../platform/projects.js";
import { checkProject, formatProblem } from "./bundler.js";
import { appUrl, RESERVED_SLUG } from "./urls.js";

export function suggestSlug(name: string) {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "app"
  );
}

/**
 * Publishing checks that everything compiles, then snapshots the files. A failed publish
 * leaves the live version untouched. The database is shared and is not part of a publish.
 */
export async function publishProject(projectId: string, requestedSlug?: string): Promise<{ url: string; slug: string }> {
  const project = (await getProject(projectId)) as Project;
  const slug = suggestSlug(requestedSlug ?? project.slug ?? project.name);
  if (!/^[a-z0-9][a-z0-9-]{1,39}$/.test(slug)) throw new Error("Dirección no válida: usa minúsculas, números y guiones.");
  if (RESERVED_SLUG(slug)) throw new Error(`La dirección "${slug}" está reservada. Prueba otra.`);
  if (await isSlugTaken(slug, projectId)) throw new Error(`La dirección "${slug}" ya está en uso. Prueba otra.`);
  const files = await readAllFiles(projectId);
  const problems = await checkProject(files);
  if (problems.length) throw new Error(`No se publicó: la app tiene errores.\n${problems.map(formatProblem).join("\n")}`);
  await recordPublish(projectId, slug, files);
  await scheduleProject(projectId);
  return { slug, url: appUrl(slug) };
}

export async function unpublishProject(projectId: string) {
  await unpublish(projectId);
  await scheduleProject(projectId);
}
