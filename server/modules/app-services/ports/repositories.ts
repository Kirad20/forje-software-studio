export interface QueryRepository<Operation extends string = string> {
  q<T = Record<string, unknown>>(operation: Operation, params?: unknown[]): Promise<T[]>;
  one<T = Record<string, unknown>>(operation: Operation, params?: unknown[]): Promise<T | undefined>;
}
export interface AuthRepository {
  query<T = Record<string, unknown>>(operation: string, params?: unknown[]): Promise<T[]>;
  one<T = Record<string, unknown>>(operation: string, params?: unknown[]): Promise<T | undefined>;
  transaction<T>(fn: (tx: Pick<AuthRepository, "query" | "one">) => Promise<T>): Promise<T>;
}
