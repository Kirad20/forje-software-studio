import { one, q } from "../../../platform/db.js";
import { emitProject } from "../../../platform/events.js";
import type { IProjectFileRepository, LogChangeInput } from "../ports/repositories.js";

export class PostgresProjectFileRepository implements IProjectFileRepository {
  async readFile(projectId: string, path: string): Promise<string | undefined> {
    const r = await one<{ content: string }>(
      `select content from project_files where project_id = $1 and path = $2`,
      [projectId, path],
    );
    return r?.content;
  }

  async readAllFiles(projectId: string): Promise<Record<string, string>> {
    const rows = await q<{ path: string; content: string }>(
      `select path, content from project_files where project_id = $1`,
      [projectId],
    );
    return Object.fromEntries(rows.map((r) => [r.path, r.content]));
  }

  async writeFile(projectId: string, path: string, content: string): Promise<void> {
    await q(
      `insert into project_files (project_id, path, content) values ($1, $2, $3)
       on conflict (project_id, path) do update set content = excluded.content, updated_at = now()`,
      [projectId, path, content],
    );
  }

  async deleteFile(projectId: string, path: string): Promise<void> {
    await q(`delete from project_files where project_id = $1 and path = $2`, [projectId, path]);
  }

  async renameFile(projectId: string, from: string, to: string): Promise<void> {
    await q(`delete from project_files where project_id = $1 and path = $2`, [projectId, to]);
    await q(`update project_files set path = $3, updated_at = now() where project_id = $1 and path = $2`, [projectId, from, to]);
  }

  async logChange(projectId: string, change: LogChangeInput): Promise<number> {
    const r = await one<{ id: number }>(
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

  async touch(projectId: string, paths: string[]): Promise<void> {
    await q(`update projects set updated_at = now() where id = $1`, [projectId]);
    emitProject(projectId, { type: "files", paths });
  }
}
