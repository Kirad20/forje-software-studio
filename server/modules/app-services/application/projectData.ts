import type { ProjectSchemaPort, ProjectRowsPort } from "../ports/projectData.js";
export class ProjectDataError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export function createProjectData(schemaRows: ProjectSchemaPort) {
  async function describeSchema(projectId: string, includeInternal = false) {
    const rows = await schemaRows(projectId);
    const tables: Record<string, { name: string; type: string; nullable: boolean; default: string | null }[]> = {};
    for (const row of rows) {
      if (!includeInternal && row.table_name.startsWith("_forja_")) continue;
      (tables[row.table_name] ??= []).push({ name: row.column_name, type: row.data_type, nullable: row.is_nullable === "YES", default: row.column_default });
    }
    return tables;
  }
  return { describeSchema };
}

export function createProjectRows(schemaRows: ProjectSchemaPort, repository: ProjectRowsPort) {
  const { describeSchema } = createProjectData(schemaRows);
  async function columnsFor(projectId: string, table: string) {
    const columns = (await describeSchema(projectId, true))[table];
    if (!columns) throw new ProjectDataError("Tabla no encontrada", 404);
    return columns;
  }
  function mask(table: string, row: Record<string, unknown>) {
    return table === "_forja_users" ? { ...row, password_hash: row.password_hash ? "••••" : null } : row;
  }
  async function listProjectRows(projectId: string, input: { table: string; limit?: number; offset?: number; search?: string }) {
    const columns = await columnsFor(projectId, input.table);
    const keys = await repository.primaryKeys(projectId, input.table);
    const primaryKey = keys.length === 1 ? keys[0]! : null;
    const limit = Math.min(Math.max(Number.isFinite(input.limit) ? Math.trunc(input.limit!) : 50, 0), 500);
    const offset = Math.max(Number.isFinite(input.offset) ? Math.trunc(input.offset!) : 0, 0);
    const { rows, total } = await repository.read(projectId, input.table, columns.map((column) => column.name), primaryKey, limit, offset, (input.search ?? "").trim());
    return { columns, rows: rows.map((row) => mask(input.table, row)), total, primaryKey };
  }
  async function createProjectRow(projectId: string, table: string, values: Record<string, unknown>) {
    const columns = await columnsFor(projectId, table);
    const entries = Object.entries(values ?? {}).filter(([name, value]) => columns.some((column) => column.name === name) && value !== "" && value !== undefined);
    const row = await repository.create(projectId, table, entries);
    return row && mask(table, row);
  }
  async function deleteProjectRows(projectId: string, table: string, keys: unknown[]) {
    await columnsFor(projectId, table);
    const primaryKeys = await repository.primaryKeys(projectId, table);
    if (primaryKeys.length !== 1) throw new ProjectDataError("La tabla no tiene clave primaria; bórralas con SQL.", 400);
    return repository.delete(projectId, table, primaryKeys[0]!, (keys ?? []).map(String));
  }
  return { listProjectRows, createProjectRow, deleteProjectRows, listAppUsers: repository.users, projectServiceCounts: repository.counts };
}
