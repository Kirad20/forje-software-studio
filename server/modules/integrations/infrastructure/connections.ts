import { decrypt, encrypt } from "../../../shared/crypto.js";
import { q } from "../../../shared/database/index.js";
import type { Integration, IntegrationRepository } from "../application/connections.js";
export const integrationRepository: IntegrationRepository = {
  list: (accountId) => q<Integration>(`select i.id, i.type, i.name, i.description, i.env_name as "envName", i.created_at as "createdAt",
       (select count(*)::int from project_integrations pi where pi.integration_id = i.id) as "projectCount"
     from account_integrations i where i.account_id = $1 order by i.created_at desc`, [accountId]),
  async create(accountId, m) { await q(`insert into account_integrations (id, account_id, type, name, description, env_name, value_enc) values ($1, $2, $3, $4, $5, $6, $7)`, [m.id, accountId, m.type, m.name, m.description, m.envName, encrypt(m.value)]); },
  async updateValue(a, id, value) { await q(`update account_integrations set value_enc = $3 where account_id = $1 and id = $2`, [a, id, encrypt(value)]); },
  async delete(a, id) { await q(`delete from account_integrations where account_id = $1 and id = $2`, [a, id]); },
  async exists(a, id) { return (await q(`select 1 from account_integrations where account_id = $1 and id = $2`, [a, id])).length > 0; },
  async connect(p, id) { await q(`insert into project_integrations (project_id, integration_id) values ($1, $2) on conflict do nothing`, [p, id]); },
  async disconnect(p, id) { await q(`delete from project_integrations where project_id = $1 and integration_id = $2`, [p, id]); },
  async projectIds(p) { return (await q<{ integration_id: string }>(`select integration_id from project_integrations where project_id = $1`, [p])).map((r) => r.integration_id); },
  async env(p) {
    const rows = await q<{ env_name: string; value_enc: string }>(`select i.env_name, i.value_enc from project_integrations pi join account_integrations i on i.id = pi.integration_id where pi.project_id = $1`, [p]);
    const env: Record<string, string> = {};
    for (const r of rows) {
      try { env[r.env_name] = decrypt(r.value_enc); } catch { /* A rotated key makes this integration unavailable. */ }
    }
    return env;
  },
};
