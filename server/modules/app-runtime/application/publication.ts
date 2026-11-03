import { assertPublishable, suggestSlug, validateSlug } from "../domain/publication.js";
import type { PublicationPorts } from "./ports.js";
import type { Author } from "../domain/publication.js";

/** Every gate completes before the published snapshot is mutated. */
export function createPublication(ports: PublicationPorts) {
  return {
    async publishProject(projectId: string, requestedSlug?: string, author: Author = "owner") {
      const project = await ports.getProject(projectId);
      const slug = suggestSlug(requestedSlug ?? project.slug ?? project.name);
      validateSlug(slug);
      if (await ports.isSlugTaken(slug, projectId)) throw new Error(`La dirección "${slug}" ya está en uso. Prueba otra.`);
      const files = await ports.readAllFiles(projectId);
      assertPublishable(await ports.checkProject(files));
      assertPublishable([], await ports.scan(projectId, files));
      await ports.recordPublish(projectId, slug, files, author);
      await ports.scheduleProject(projectId);
      return { slug, url: ports.appUrl(slug) };
    },
    async unpublishProject(projectId: string) {
      await ports.unpublish(projectId);
      await ports.scheduleProject(projectId);
    },
  };
}
