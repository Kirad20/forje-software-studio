import { assertPublishable, suggestSlug, validateSlug } from "../domain/publication.js";
import type { PublicationPorts } from "./ports.js";
import type { Author } from "../domain/publication.js";

/** Every gate completes before the published snapshot is mutated. */
export function createPublication(ports: PublicationPorts) {
  const projectLocks = new Map<string, Promise<void>>();
  async function serialize<T>(projectId: string, operation: () => Promise<T>): Promise<T> {
    const previous = projectLocks.get(projectId) ?? Promise.resolve();
    let release!: () => void;
    const current = new Promise<void>((resolve) => { release = resolve; });
    projectLocks.set(projectId, current);
    await previous;
    try {
      return await operation();
    } finally {
      release();
      if (projectLocks.get(projectId) === current) projectLocks.delete(projectId);
    }
  }

  return {
    publishProject(projectId: string, requestedSlug?: string, author: Author = "owner") {
      return serialize(projectId, async () => {
      const project = await ports.getProject(projectId);
      const slug = suggestSlug(requestedSlug ?? project.slug ?? project.name);
      validateSlug(slug);
      if (await ports.isSlugTaken(slug, projectId)) throw new Error(`La dirección "${slug}" ya está en uso. Prueba otra.`);
      const files = await ports.readAllFiles(projectId);
      assertPublishable(await ports.checkProject(files));
      assertPublishable([], await ports.scan(projectId, files));
      await ports.applyMigrations(projectId, files);
      await ports.ensureOwner(projectId);
      await ports.recordPublish(projectId, slug, files, author);
      await ports.scheduleProject(projectId);
      return { slug, url: ports.appUrl(slug) };
      });
    },
    unpublishProject(projectId: string) {
      return serialize(projectId, async () => {
      await ports.unpublish(projectId);
      await ports.scheduleProject(projectId);
      });
    },
  };
}
