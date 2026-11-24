import { platformDb, type PlatformDb } from "../../../shared/database/index.js";
import type { IProjectFileRepository, LogChangeInput } from "../ports/repositories.js";
import type { ProjectEventPort } from "../ports/projects.js";
import type { FileExpectation } from "../../../../contracts/fileEtag.js";

/** Same value as contentEtag() in the domain. */
const SHA = `encode(sha256(convert_to(content, 'UTF8')), 'hex')`;

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

  // Each compare-and-set is ONE statement, so the check and the write cannot be split by another writer.
  async writeFileIf(projectId: string, path: string, content: string, expected: FileExpectation): Promise<boolean> {
    const rows = expected === null
      ? await this.q(
          `insert into project_files (project_id, path, content) values ($1, $2, $3)
           on conflict (project_id, path) do nothing returning 1 as ok`,
          [projectId, path, content],
        )
      : await this.q(
          `update project_files set content = $3, updated_at = now()
           where project_id = $1 and path = $2 and ${SHA} = $4 returning 1 as ok`,
          [projectId, path, content, expected],
        );
    return rows.length > 0;
  }

  async deleteFileIf(projectId: string, path: string, expected: string): Promise<boolean> {
    return (await this.q(`delete from project_files where project_id = $1 and path = $2 and ${SHA} = $3 returning 1 as ok`, [projectId, path, expected])).length > 0;
  }

  async renameFileIf(projectId: string, from: string, to: string, expected: string): Promise<boolean> {
    return (
      await this.q(
        `update project_files set path = $3, updated_at = now()
         where project_id = $1 and path = $2 and ${SHA} = $4
           and not exists (select 1 from project_files t where t.project_id = $1 and t.path = $3)
         returning 1 as ok`,
        [projectId, from, to, expected],
      )
    ).length > 0;
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
