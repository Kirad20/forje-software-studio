export type Access = "owner" | "editor";

export class MemberAccess {
  static compute(accountId: string, projectOwnerId: string, isMemberOrOrgMember: boolean): Access | null {
    if (accountId === projectOwnerId) return "owner";
    if (isMemberOrOrgMember) return "editor";
    return null;
  }
}
