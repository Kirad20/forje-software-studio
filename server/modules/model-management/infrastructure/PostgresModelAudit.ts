import { q } from "../../../shared/database/index.js";
import type { ModelAudit } from "../ports/ModelAudit.js";
export const postgresModelAudit: ModelAudit = async (key, actorId, action) => {
  await q("insert into settings_audit (key, actor_id, action) values ($1, $2, $3)", [key, actorId, action]);
};
