import type { AppEnv } from "../domain/contracts.js";

export type ProjectSchemaPort = (projectId: string, env?: AppEnv) => Promise<{
  table_name: string; column_name: string; data_type: string; is_nullable: string; column_default: string | null;
}[]>;
export interface ProjectRowsPort {
  primaryKeys(projectId: string, table: string, env?: AppEnv): Promise<string[]>;
  read(projectId: string, table: string, columns: string[], primaryKey: string | null, limit: number, offset: number, search: string, env?: AppEnv): Promise<{ rows: Record<string, unknown>[]; total: number }>;
  create(projectId: string, table: string, entries: [string, unknown][], env?: AppEnv): Promise<Record<string, unknown> | undefined>;
  delete(projectId: string, table: string, primaryKey: string, keys: string[], env?: AppEnv): Promise<number>;
  users(projectId: string, env?: AppEnv): Promise<Record<string, unknown>[]>;
  counts(projectId: string, env?: AppEnv): Promise<{ users: number; ai: number; storage: number; email: number; creditsUsed: number }>;
}
