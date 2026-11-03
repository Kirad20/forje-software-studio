import { one, q } from "../../../shared/database/index.js";
import type { Memory, MemoryRepository } from "../application/service.js";
const COLS = `id, scope, kind, text, source, created_at as "createdAt", updated_at as "updatedAt"`;
const visible = `id = $1 and ((scope = 'project' and project_id = $2) or (scope = 'personal' and account_id = $3))`;
export const memoryRepository: MemoryRepository = {
  async settings(projectId, accountId) {
    const p = await one<{ on: boolean }>(`select memory_enabled as on from projects where id = $1`, [projectId]);
    const a = await one<{ on: boolean }>(`select memory_enabled as on from accounts where id = $1`, [accountId]);
    return { projectEnabled: p?.on ?? true, personalEnabled: a?.on ?? true };
  },
  async setEnabled(projectId, accountId, patch) {
    if (typeof patch.project === "boolean") await q(`update projects set memory_enabled = $2 where id = $1`, [projectId, patch.project]);
    if (typeof patch.personal === "boolean") await q(`update accounts set memory_enabled = $2 where id = $1`, [accountId, patch.personal]);
  },
  list: (projectId, accountId, scope) => q<Memory>(`select ${COLS} from memories where scope = $2 and ${scope === "project" ? "project_id" : "account_id"} = $1 order by created_at`, [scope === "project" ? projectId : accountId, scope]),
  async refresh(id, kind) {
    return (await one<Memory>(`update memories set kind = $2, updated_at = now() where id = $1 returning ${COLS}`, [id, kind]))!;
  },
  async insert(m) {
    return (await one<Memory>(`insert into memories (id, scope, project_id, account_id, kind, text, source) values ($1, $2, $3, $4, $5, $6, $7) returning ${COLS}`, [m.id, m.scope, m.projectId, m.accountId, m.kind, m.text, m.source]))!;
  },
  update: (p, a, id, patch) => one<Memory>(`update memories set kind = coalesce($4, kind), text = coalesce($5, text), updated_at = now() where ${visible} returning ${COLS}`, [id, p, a, patch.kind ?? null, patch.text ?? null]),
  async delete(p, a, id) { return (await q(`delete from memories where ${visible} returning id`, [id, p, a])).length > 0; },
};
