import { ExecutionAudit } from "./application/ExecutionAudit.js";
import { postgresExecutionAuditRepository } from "./infrastructure/PostgresExecutionAuditRepository.js";
import type { AuditFilter, ContextEvent } from "./domain/audit.js";

const audit = new ExecutionAudit(postgresExecutionAuditRepository);

export const readExecutionAudit = (filter: AuditFilter = {}) => audit.read(filter);
export const recordContextEvent = (event: ContextEvent) => audit.record(event);
export { ExecutionAudit, auditWindow } from "./application/ExecutionAudit.js";
export type { AuditFilter, AuditWindow, AuditReport, ContextEvent } from "./domain/audit.js";
export type { ExecutionAuditRepository } from "./ports/ExecutionAuditRepository.js";
