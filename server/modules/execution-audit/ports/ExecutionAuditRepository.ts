import type { AuditReport, AuditWindow, ContextEvent } from "../domain/audit.js";

export interface ExecutionAuditRepository {
  read(window: AuditWindow): Promise<AuditReport>;
  record(event: ContextEvent): Promise<void>;
}
