import type { PlatformDb } from "../../../shared/database/index.js";
import type { Project } from "../domain/Project.js";
import type { BeforeImage } from "../domain/ChangeTimeline.js";
import type { FileMap, ProjectSnapshot, ProjectPatch, ChangeEntry } from "../domain/ProjectSnapshot.js";
import type { ProjectEventPort, ProjectsStore } from "../ports/projects.js";
import type { ProjectOrganizations } from "../ports/collaboration.js";
import { PostgresProjectFileRepository } from "./PostgresProjectFileRepository.js";

const PROJECT_COLS = `id, owner_id as "ownerId", org_id as "orgId", name, runtime, description, slug, visibility, ai_enabled as "aiEnabled",
  email_domain as "emailDomain", email_domain_verified as "emailDomainVerified",
  published_version_id as "publishedVersionId", published_at as "publishedAt",
  favorite, archived, folder_id as "folderId", last_opened_at as "lastOpenedAt",
  system_prompt as "systemPrompt", design_prompt as "designPrompt", seo, profile, share_epoch as "shareEpoch",
  created_at as "createdAt", updated_at as "updatedAt"`;

const PATCHABLE: Record<string, string> = {
  name: "name", description: "description", aiEnabled: "ai_enabled", visibility: "visibility",
  emailDomain: "email_domain", emailDomainVerified: "email_domain_verified", favorite: "favorite",
  archived: "archived", folderId: "folder_id", systemPrompt: "system_prompt", designPrompt: "design_prompt", seo: "seo", profile: "profile",
};

export class PostgresProjectsStore extends PostgresProjectFileRepository implements ProjectsStore {
  constructor(database: () => Promise<PlatformDb>, private readonly organizations: ProjectOrganizations, events?: ProjectEventPort) {
    super(database, events);
  }

  async create(project: Project, files: FileMap, orgId?: string): Promise<void> {
    const db = await this.database();
    await db.transaction(async (tx) => {
      if (!orgId) await this.organizations.ensurePersonalOrg(tx, project.ownerId);
      await tx.query(`insert into projects (id, owner_id, org_id, name, description, runtime, visibility) values ($1, $2, $3, $4, $5, $6, $7)`, [
        project.id, project.ownerId, orgId ?? this.organizations.personalOrgId(project.ownerId), project.name, project.description, project.runtime, project.visibility,
      ]);
      for (const [path, content] of Object.entries(files)) {
        await tx.query(`insert into project_files (project_id, path, content) values ($1, $2, $3)`, [project.id, path, content]);
      }
    });
  }

  getProject(id: string) {
    return this.one<ProjectSnapshot>(`select ${PROJECT_COLS} from projects where id = $1`, [id]);
  }

  getProjectBySlug(slug: string) {
    return this.one<ProjectSnapshot>(`select ${PROJECT_COLS} from projects where slug = $1`, [slug]);
  }

  listProjects(ownerId: string) {
    return this.q<ProjectSnapshot>(`select ${PROJECT_COLS} from projects where owner_id = $1 order by last_opened_at desc`, [ownerId]);
  }

  async listAccountOwnedProjectIds(accountId: string): Promise<string[]> {
    return (await this.q<{ id: string }>(`select id from projects where owner_id = $1`, [accountId])).map((row) => row.id);
  }

  async updateProject(id: string, patch: ProjectPatch): Promise<void> {
    const sets: string[] = [];
    const params: unknown[] = [id];
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || !Object.hasOwn(PATCHABLE, key)) continue;
      params.push(key === "seo" || key === "profile" ? JSON.stringify(value) : value);
      sets.push(`${PATCHABLE[key]} = $${params.length}`);
    }
    if (sets.length) await this.q(`update projects set ${sets.join(", ")} where id = $1`, params);
  }

  async revokeShareLinks(id: string): Promise<void> {
    await this.q(`update projects set share_epoch = share_epoch + 1 where id = $1`, [id]);
  }

  async markOpened(id: string): Promise<void> {
    await this.q(`update projects set last_opened_at = now() where id = $1`, [id]);
  }

  async deleteProject(id: string): Promise<void> {
    await this.q(`delete from projects where id = $1`, [id]);
  }

  listFolders(accountId: string) {
    return this.q<{ id: string; name: string }>(`select id, name from folders where account_id = $1 order by name`, [accountId]);
  }

  async createFolder(accountId: string, id: string, name: string): Promise<void> {
    await this.q(`insert into folders (id, account_id, name) values ($1, $2, $3)`, [id, accountId, name]);
  }

  async deleteFolder(accountId: string, id: string): Promise<void> {
    await this.q(`delete from folders where account_id = $1 and id = $2`, [accountId, id]);
  }

  listFiles(projectId: string) {
    return this.q<{ path: string; size: number; updatedAt: string }>(
      `select path, length(content) as size, updated_at as "updatedAt" from project_files where project_id = $1 order by path`, [projectId],
    );
  }

  async projectVersion(projectId: string): Promise<number> {
    const row = await this.one<{ v: number | null }>(
      `select max(id) as v from project_changes where project_id = $1 and kind not in ('checkpoint', 'publish')`, [projectId],
    );
    return Number(row?.v ?? 0);
  }

  listChanges(projectId: string, limit: number) {
    return this.q<ChangeEntry>(
      `select id, kind, paths, author, label, description, actor, created_at as "createdAt"
       from project_changes where project_id = $1 order by id desc limit $2`, [projectId, limit],
    );
  }

  turnSpan(projectId: string, turnId: string) {
    return this.one<{ start: string; last: number }>(
      `select min(created_at) as start, max(id) as last from chat_messages where project_id = $1 and turn_id = $2`, [projectId, turnId],
    );
  }

  nextTurn(projectId: string, last: number, turnId: string) {
    return this.one<{ at: string }>(
      `select created_at as at from chat_messages where project_id = $1 and id > $2 and coalesce(turn_id, '') <> $3 order by id limit 1`,
      [projectId, last, turnId],
    );
  }

  builderChanges(projectId: string, start: string, end: string | null) {
    return this.q<{ id: number; before: BeforeImage }>(
      `select id, kind, paths, before from project_changes
       where project_id = $1 and author = 'builder' and created_at >= $2 and ($3::timestamptz is null or created_at < $3)
       order by id`, [projectId, start, end],
    );
  }

  nextFileBefore(projectId: string, afterId: number, path: string) {
    return this.one<{ content: string | null }>(
      `select before -> $3 #>> '{}' as content from project_changes where project_id = $1 and id > $2 and before ? $3 order by id limit 1`,
      [projectId, afterId, path],
    );
  }

  async previousChange(projectId: string, firstId: number): Promise<number | null> {
    return (await this.one<{ id: number | null }>(`select max(id) as id from project_changes where project_id = $1 and id < $2`, [projectId, firstId]))?.id ?? null;
  }

  restoreTarget(projectId: string, changeId: number) {
    return this.one<{ id: number; label: string | null }>(
      `select id, label, kind, created_at from project_changes where project_id = $1 and id = $2`, [projectId, changeId],
    );
  }

  changesAfter(projectId: string, changeId: number) {
    return this.q<{ before: BeforeImage }>(
      `select before from project_changes where project_id = $1 and id > $2 order by id desc`, [projectId, changeId],
    );
  }

  async restoreFiles(projectId: string, desired: Map<string, string | null>): Promise<void> {
    const db = await this.database();
    await db.transaction(async (tx) => {
      for (const [path, content] of desired) {
        if (content === null) await tx.query(`delete from project_files where project_id = $1 and path = $2`, [projectId, path]);
        else await tx.query(
          `insert into project_files (project_id, path, content) values ($1, $2, $3)
           on conflict (project_id, path) do update set content = excluded.content, updated_at = now()`, [projectId, path, content],
        );
      }
    });
  }

  async publishedFiles(projectId: string): Promise<FileMap | undefined> {
    return (await this.one<{ files: FileMap }>(
      `select v.files from published_versions v join projects p on p.published_version_id = v.id where p.id = $1`, [projectId],
    ))?.files;
  }

  async isSlugTaken(slug: string, projectId: string): Promise<boolean> {
    return !!(await this.one(`select 1 from projects where slug = $1 and id <> $2`, [slug, projectId]));
  }

  async recordPublish(projectId: string, slug: string, versionId: string, files: FileMap): Promise<void> {
    await this.q(`insert into published_versions (id, project_id, files) values ($1, $2, $3)`, [versionId, projectId, JSON.stringify(files)]);
    await this.q(`update projects set slug = $2, published_version_id = $3, published_at = now() where id = $1`, [projectId, slug, versionId]);
  }

  async unpublish(projectId: string): Promise<void> {
    await this.q(`update projects set slug = null, published_version_id = null, published_at = null where id = $1`, [projectId]);
  }
}
