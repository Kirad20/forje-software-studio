export interface QueryHandle {
  query(sql: string, params?: unknown[]): Promise<unknown>;
}

export interface ProjectOrganizations {
  ensurePersonalOrg(tx: QueryHandle, accountId: string): Promise<unknown>;
  personalOrgId(accountId: string): string;
}
