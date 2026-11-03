import type { IOrganizationQueries } from "../ports/queries.js";

export class OrganizationQueries {
  constructor(private readonly queries: IOrganizationQueries) {}

  listOrgs(accountId: string) {
    return this.queries.listOrgs(accountId);
  }

  listOrgMembers(orgId: string) {
    return this.queries.listOrgMembers(orgId);
  }

  async orgRoleOf(orgId: string | null | undefined, accountId: string) {
    if (!orgId) return null;
    return this.queries.getOrgRole(orgId, accountId);
  }
}
