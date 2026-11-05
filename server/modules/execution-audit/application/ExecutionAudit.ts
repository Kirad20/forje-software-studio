import type { AuditFilter, AuditWindow, ContextEvent } from "../domain/audit.js";
import type { ExecutionAuditRepository } from "../ports/ExecutionAuditRepository.js";

const DAY = 86_400_000;
const identifier = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0 && value.length <= 200 && !/[\u0000-\u001f]/.test(value);

export function auditWindow(input: AuditFilter, now = Date.now()): AuditWindow {
  if (!input || typeof input !== "object" || Array.isArray(input)
    || Object.keys(input).some(key => !["projectId", "from", "to", "limit", "offset"].includes(key))) {
    throw new Error("Filtros de auditoría no válidos.");
  }
  if (input.projectId !== undefined && !identifier(input.projectId)) throw new Error("Proyecto no válido.");
  for (const key of ["from", "to"] as const) {
    if (input[key] !== undefined && (typeof input[key] !== "string" || !Number.isFinite(Date.parse(input[key]!)))) {
      throw new Error("Fecha de auditoría no válida.");
    }
  }
  const to = input.to === undefined ? now : Date.parse(input.to);
  const from = input.from === undefined ? to - 7 * DAY : Date.parse(input.from);
  if (from >= to || to - from > 31 * DAY) throw new Error("Usa una ventana de hasta 31 días.");
  const limit = input.limit ?? 50;
  const offset = input.offset ?? 0;
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100
    || !Number.isSafeInteger(offset) || offset < 0 || offset > 10_000) {
    throw new Error("Paginación no válida: límite 1–100, desplazamiento 0–10000.");
  }
  return { ...(input.projectId === undefined ? {} : { projectId: input.projectId }), from: new Date(from).toISOString(),
    to: new Date(to).toISOString(), limit, offset };
}

export class ExecutionAudit {
  constructor(private readonly repository: ExecutionAuditRepository) {}

  read(input: AuditFilter = {}) {
    return this.repository.read(auditWindow(input));
  }

  record(input: ContextEvent) {
    if (!identifier(input.projectId) || !["file_read", "compaction"].includes(input.kind)
      || typeof input.measured !== "boolean") throw new Error("Evento de contexto no válido.");
    const event: ContextEvent = { projectId: input.projectId, kind: input.kind, measured: input.measured };
    for (const key of ["taskId", "turnId", "traceId", "agentId"] as const) {
      if (input[key] !== undefined) {
        if (!identifier(input[key])) throw new Error("Identificador de contexto no válido.");
        event[key] = input[key];
      }
    }
    for (const key of ["beforeTokens", "afterTokens", "bytes", "count"] as const) {
      if (input[key] !== undefined) {
        if (!Number.isSafeInteger(input[key]) || input[key]! < 0) throw new Error("Métrica de contexto no válida.");
        event[key] = input[key];
      }
    }
    if (input.timestamp !== undefined) {
      if (typeof input.timestamp !== "string" || !Number.isFinite(Date.parse(input.timestamp))) throw new Error("Fecha de contexto no válida.");
      event.timestamp = new Date(input.timestamp).toISOString();
    }
    return this.repository.record(event);
  }
}
