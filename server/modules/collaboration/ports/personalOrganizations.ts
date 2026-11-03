/** Allows another context to enlist personal-tenant creation in its own transaction. */
export interface QueryHandle {
  query(sql: string, params?: unknown[]): Promise<unknown>;
}

export interface IPersonalOrganizationRepository {
  create(orgId: string, accountId: string, name: string): Promise<void>;
  ensure(orgId: string, accountId: string): Promise<void>;
  delete(orgId: string): Promise<void>;
}
