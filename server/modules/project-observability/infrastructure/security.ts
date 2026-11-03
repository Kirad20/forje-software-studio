import { q } from "../../../shared/database/index.js";
import type { SecurityRepository, ScanRow } from "../application/security.js";
export const securityRepository: SecurityRepository = {
  scans: (p) => q<ScanRow>(`select kind, status, findings, summary, scanned_at from security_scans where project_id = $1`, [p]),
  async ignored(p) { return (await q<{ finding_id: string }>(`select finding_id from security_ignores where project_id = $1`, [p])).map((r) => r.finding_id); },
  async save(p, kind, status, findings, summary) {
    await q(`insert into security_scans (project_id, kind, status, findings, summary, scanned_at) values ($1, $2, $3, $4, $5, now())
     on conflict (project_id, kind) do update set status = excluded.status, findings = excluded.findings, summary = excluded.summary, scanned_at = now()`, [p, kind, status, JSON.stringify(findings), summary]);
  },
  async startDeep(p) {
    return (await q(`insert into security_scans (project_id, kind, status, findings, summary, scanned_at)
      values ($1, 'deep', 'running', '[]', 'Revisando el código…', now())
      on conflict (project_id, kind) do update set status = 'running', summary = 'Revisando el código…', scanned_at = now()
      where security_scans.status <> 'running' returning project_id`, [p])).length > 0;
  },
  async setIgnored(p, id, ignored) {
    if (ignored) await q(`insert into security_ignores (project_id, finding_id) values ($1, $2) on conflict do nothing`, [p, id]);
    else await q(`delete from security_ignores where project_id = $1 and finding_id = $2`, [p, id]);
  },
};
