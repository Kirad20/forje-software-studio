import type { Access } from "../domain/MemberAccess.js";

export interface IMemberRepository {
  checkAccess(accountId: string, projectId: string, orgId: string | null): Promise<boolean>;
  getSharedProjectIds(accountId: string): Promise<string[]>;
  claimInvites(accountId: string, email: string): Promise<number>;
  removeMember(projectId: string, emailOrAccount: string): Promise<void>;
}
