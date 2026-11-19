import { assertPublishable, suggestSlug, validateSlug } from "../domain/publication.js";
import type { PublicationPorts } from "./ports.js";
import type { Author } from "../domain/publication.js";

/** A component schema nobody declares any more: kept with its data, and how to use or remove it. */
export const retiredSchemaWarning = (schema: string) =>
  `El esquema ${schema} ya no lo declara ningún componente: se conserva con sus datos, pero ningún servicio lo usa. Para recuperarlo, vuelve a poner "database": "${schema}" con sus migraciones; para mover sus datos, crea en el nuevo esquema una migración que los copie (las migraciones leen todos los esquemas).`;

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
      assertPublishable(await ports.checkProject(files, projectId));
      assertPublishable([], await ports.scan(projectId, files));
      const migrated = await ports.applyMigrations(projectId, files);
      await ports.ensureOwner(projectId);
      await ports.recordPublish(projectId, slug, files, author);
      await ports.scheduleProject(projectId);
      const warnings = (migrated?.retired ?? []).map(retiredSchemaWarning);
      return warnings.length ? { slug, url: ports.appUrl(slug), warnings } : { slug, url: ports.appUrl(slug) };
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
