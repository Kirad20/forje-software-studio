import { platformDb, type PlatformDb } from "../../../shared/database/index.js";
import type { IProjectFileRepository, LogChangeInput } from "../ports/repositories.js";
import type { ProjectEventPort } from "../ports/projects.js";

export class PostgresProjectFileRepository implements IProjectFileRepository {
  constructor(
    protected readonly database: () => Promise<PlatformDb> = platformDb,
    private readonly events?: ProjectEventPort,
  ) {}

  protected async q<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    return (await (await this.database()).query<T>(sql, params)).rows;
  }

  protected async one<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T | undefined> {
    return (await this.q<T>(sql, params))[0];
  }

  async readFile(projectId: string, path: string): Promise<string | undefined> {
    const r = await this.one<{ content: string }>(
      `select content from project_files where project_id = $1 and path = $2`,
      [projectId, path],
    );
    return r?.content;
  }

  async readAllFiles(projectId: string): Promise<Record<string, string>> {
    const rows = await this.q<{ path: string; content: string }>(
      `select path, content from project_files where project_id = $1 order by path`,
      [projectId],
    );
    return Object.fromEntries(rows.map((r) => [r.path, r.content]));
  }

  async writeFile(projectId: string, path: string, content: string): Promise<void> {
    await this.q(
      `insert into project_files (project_id, path, content) values ($1, $2, $3)
       on conflict (project_id, path) do update set content = excluded.content, updated_at = now()`,
      [projectId, path, content],
    );
  }

  async deleteFile(projectId: string, path: string): Promise<void> {
    await this.q(`delete from project_files where project_id = $1 and path = $2`, [projectId, path]);
  }

  async renameFile(projectId: string, from: string, to: string): Promise<void> {
    await this.q(`delete from project_files where project_id = $1 and path = $2`, [projectId, to]);
    await this.q(`update project_files set path = $3, updated_at = now() where project_id = $1 and path = $2`, [projectId, from, to]);
  }

  async logChange(projectId: string, change: LogChangeInput): Promise<number> {
    const r = await this.one<{ id: number }>(
      `insert into project_changes (project_id, kind, paths, author, label, description, before, actor)
       values ($1, $2, $3, $4, $5, $6, $7, $8) returning id`,
      [
        projectId,
        change.kind,
        JSON.stringify(change.paths),
        change.author,
        change.label ?? null,
        change.description ?? null,
        JSON.stringify(change.before ?? {}),
        change.actor ?? null,
      ],
    );
    return r?.id ?? 0;
  }

  async touch(projectId: string, paths?: string[]): Promise<void> {
    await this.q(`update projects set updated_at = now() where id = $1`, [projectId]);
    if (paths) this.events?.emit(projectId, { type: "files", paths });
  }
}
