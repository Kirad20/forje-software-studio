import { one, q } from "../../../platform/db.js";
import { Project, type Visibility } from "../domain/Project.js";
import type { IProjectRepository } from "../ports/repositories.js";

interface ProjectRow {
  id: string;
  ownerId: string;
  orgId: string | null;
  name: string;
  description: string;
  visibility: Visibility;
  slug: string | null;
  publishedVersionId: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export class PostgresProjectRepository implements IProjectRepository {
  async findById(id: string): Promise<Project | null> {
    const r = await one<ProjectRow>(
      `select id, owner_id as "ownerId", org_id as "orgId", name, description, visibility,
              slug, published_version_id as "publishedVersionId", created_at as "createdAt", updated_at as "updatedAt"
       from projects where id = $1`,
      [id],
    );
    if (!r) return null;
    return new Project(r);
  }

  async findBySlug(slug: string): Promise<Project | null> {
    const r = await one<ProjectRow>(
      `select id, owner_id as "ownerId", org_id as "orgId", name, description, visibility,
              slug, published_version_id as "publishedVersionId", created_at as "createdAt", updated_at as "updatedAt"
       from projects where slug = $1`,
      [slug],
    );
    if (!r) return null;
    return new Project(r);
  }

  async isSlugTaken(slug: string, excludeProjectId: string): Promise<boolean> {
    return !!(await one(`select 1 from projects where slug = $1 and id <> $2`, [slug, excludeProjectId]));
  }

  async save(project: Project): Promise<void> {
    await q(
      `insert into projects (id, owner_id, org_id, name, description, visibility, slug, published_version_id)
       values ($1, $2, $3, $4, $5, $6, $7, $8)
       on conflict (id) do update set name = excluded.name, description = excluded.description,
       visibility = excluded.visibility, slug = excluded.slug, published_version_id = excluded.published_version_id, updated_at = now()`,
      [project.id, project.ownerId, project.orgId, project.name, project.description, project.visibility, project.slug, project.publishedVersionId],
    );
  }

  async updateMetadata(id: string, name: string, description: string, visibility?: Visibility): Promise<void> {
    if (visibility) {
      await q(`update projects set name = $2, description = $3, visibility = $4, updated_at = now() where id = $1`, [id, name, description, visibility]);
    } else {
      await q(`update projects set name = $2, description = $3, updated_at = now() where id = $1`, [id, name, description]);
    }
  }

  async updatePublished(id: string, slug: string | null, versionId: string | null): Promise<void> {
    await q(`update projects set slug = $2, published_version_id = $3, published_at = case when $3 is null then null else now() end where id = $1`, [
      id,
      slug,
      versionId,
    ]);
  }

  async delete(id: string): Promise<void> {
    await q(`delete from projects where id = $1`, [id]);
  }
}
