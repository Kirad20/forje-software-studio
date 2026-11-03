export interface Db {
  query<T = any>(sql: string, params?: unknown[]): Promise<T[]>;
  one<T = any>(sql: string, params?: unknown[]): Promise<T | undefined>;
  /** Runs several statements (no parameters). */
  exec(sql: string): Promise<void>;
  transaction<T>(fn: (tx: Pick<Db, "query" | "one">) => Promise<T>): Promise<T>;
}
