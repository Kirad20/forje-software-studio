import type { IMemberQueries } from "../ports/queries.js";

export class MemberQueries {
  constructor(private readonly queries: IMemberQueries) {}

  listMembers(projectId: string) {
    return this.queries.listMembers(projectId);
  }

  sharedProjectIds(accountId: string) {
    return this.queries.getSharedProjectIds(accountId);
  }

  hasProjectInvite(email: string) {
    return this.queries.hasProjectInvite(email.toLowerCase());
  }
}
