import type { ProjectDb } from "../ports/database.js";
import type { AppEnv } from "../domain/contracts.js";
import type { ProjectMigration } from "./projectDb.js";

type TransactionAction = "query" | "commit" | "rollback";

export interface SqlExecutionResult {
  fields: string[];
  rows: unknown[];
  affectedRows: number;
}

export class ProjectDbClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string, private readonly token: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    if (!this.baseUrl) throw new Error("App data service URL is required");
    if (!token) throw new Error("App data service token is required");
  }

  /** `scope`: schema of a forja.json component with its own database (its role and schema apply). */
  forProject(projectId: string, env: AppEnv = "published", scope?: string): ProjectDb {
    const request = <T>(operation: string, body: unknown) =>
      this.request<T>(`${encodeURIComponent(projectId)}/${operation}`, { ...body as object, env, ...(scope ? { scope } : {}) });
    const api: ProjectDb = {
      query: <T = Record<string, unknown>>(sql: string, params: unknown[] = []) => request<T[]>("query", { sql, params }),
      one: async <T = Record<string, unknown>>(sql: string, params: unknown[] = []) => (await api.query<T>(sql, params))[0],
      exec: async (sql) => { await request("exec", { sql }); },
      transaction: async (fn) => {
        const { transactionId } = await request<{ transactionId: string }>("transaction/begin", {});
        const txRequest = <T>(action: TransactionAction, body: unknown = {}) =>
          request<T>(`transaction/${action}`, { transactionId, ...body as object });
        const tx = {
          query: <T = Record<string, unknown>>(sql: string, params: unknown[] = []) => txRequest<T[]>("query", { sql, params }),
          one: async <T = Record<string, unknown>>(sql: string, params: unknown[] = []) => (await tx.query<T>(sql, params))[0],
        };
        try {
          const result = await fn(tx);
          await txRequest("commit");
          return result;
        } catch (transactionError) {
          try {
            await txRequest("rollback");
          } catch (rollbackError) {
            throw new AggregateError([transactionError, rollbackError], "Remote project database transaction rollback failed");
          }
          throw transactionError;
        }
      },
    };
    return api;
  }

  execSql(projectId: string, sql: string, env: AppEnv = "preview", scope?: string): Promise<SqlExecutionResult[]> {
    return this.request<SqlExecutionResult[]>(`${encodeURIComponent(projectId)}/exec-sql`, { sql, env, ...(scope ? { scope } : {}) });
  }

  /** `schemas`: component schemas forja.json still declares; applied history of any other is retired. */
  applyProjectMigrations(projectId: string, migrations: ProjectMigration[], env: AppEnv = "preview", schemas?: string[]) {
    return this.request<{ applied: string[]; retired?: string[] }>(`${encodeURIComponent(projectId)}/migrations/apply`, { migrations, env, ...(schemas?.length ? { schemas } : {}) });
  }

  async dumpDatabase(projectId: string, env: AppEnv = "preview"): Promise<Blob> {
    const { data } = await this.request<{ data: string }>(`${encodeURIComponent(projectId)}/dump`, { env });
    return new Blob([Buffer.from(data, "base64")]);
  }

  closeProject(projectId: string, env?: AppEnv) {
    return this.request<void>(`${encodeURIComponent(projectId)}/close`, { env });
  }

  cloneDatabase(fromProjectId: string, toProjectId: string) {
    return this.request<void>(`${encodeURIComponent(fromProjectId)}/clone`, { toProjectId });
  }

  closeAll() {
    return this.request<void>("close-all", {});
  }

  isAwake(projectId: string, env?: AppEnv) {
    return this.request<boolean>(`${encodeURIComponent(projectId)}/awake`, { env });
  }

  metrics<T = Record<string, unknown>>(projectId: string, env: AppEnv = "preview"): Promise<T> {
    return this.request<T>(`${encodeURIComponent(projectId)}/metrics`, { env });
  }

  private async request<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}/internal/data/${path}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(`App data service returned ${response.status}: ${message}`);
    }
    return response.json() as Promise<T>;
  }
}
