import { postgresModelAudit } from "./infrastructure/PostgresModelAudit.js";
import type { ModelAudit } from "./ports/ModelAudit.js";
export type { ModelAudit } from "./ports/ModelAudit.js";
let target: ModelAudit = postgresModelAudit;
export function bindModelAudit(audit: ModelAudit) {
  target = audit;
  return () => { if (target === audit) target = postgresModelAudit; };
}
export const audit: ModelAudit = (...args) => target(...args);
