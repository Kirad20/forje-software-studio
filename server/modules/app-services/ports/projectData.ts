export type ProjectSchemaPort = (projectId: string) => Promise<{
  table_name: string; column_name: string; data_type: string; is_nullable: string; column_default: string | null;
}[]>;
export interface ProjectRowsPort {
  primaryKeys(projectId: string, table: string): Promise<string[]>;
  read(projectId: string, table: string, columns: string[], primaryKey: string | null, limit: number, offset: number, search: string): Promise<{ rows: Record<string, unknown>[]; total: number }>;
  create(projectId: string, table: string, entries: [string, unknown][]): Promise<Record<string, unknown> | undefined>;
  delete(projectId: string, table: string, primaryKey: string, keys: string[]): Promise<number>;
  users(projectId: string): Promise<Record<string, unknown>[]>;
  counts(projectId: string): Promise<{ users: number; ai: number; storage: number; email: number; creditsUsed: number }>;
}
