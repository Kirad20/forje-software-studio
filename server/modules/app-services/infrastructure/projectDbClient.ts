import type { ProjectDb } from "../ports/database.js";

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

  forProject(projectId: string): ProjectDb {
    const request = <T>(operation: string, body: unknown) =>
      this.request<T>(`${encodeURIComponent(projectId)}/${operation}`, body);
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

  execSql(projectId: string, sql: string): Promise<SqlExecutionResult[]> {
    return this.request<SqlExecutionResult[]>(`${encodeURIComponent(projectId)}/exec-sql`, { sql });
  }

  async dumpDatabase(projectId: string): Promise<Blob> {
    const { data } = await this.request<{ data: string }>(`${encodeURIComponent(projectId)}/dump`, {});
    return new Blob([Buffer.from(data, "base64")]);
  }

  closeProject(projectId: string) {
    return this.request<void>(`${encodeURIComponent(projectId)}/close`, {});
  }

  cloneDatabase(fromProjectId: string, toProjectId: string) {
    return this.request<void>(`${encodeURIComponent(fromProjectId)}/clone`, { toProjectId });
  }

  closeAll() {
    return this.request<void>("close-all", {});
  }

  isAwake(projectId: string) {
    return this.request<boolean>(`${encodeURIComponent(projectId)}/awake`, {});
  }

  metrics<T = Record<string, unknown>>(projectId: string): Promise<T> {
    return this.request<T>(`${encodeURIComponent(projectId)}/metrics`, {});
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
