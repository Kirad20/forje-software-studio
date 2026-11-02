import { MemberAccess, type Access } from "../domain/MemberAccess.js";
import type { IMemberRepository } from "../ports/repositories.js";

export interface ProjectIdentity {
  id: string;
  ownerId: string;
  orgId?: string | null;
}

export class CheckAccessUseCase {
  constructor(private readonly memberRepo: IMemberRepository) {}

  async execute(accountId: string, project: ProjectIdentity | undefined): Promise<Access | null> {
    if (!project) return null;
    if (project.ownerId === accountId) return "owner";
    const hasMembership = await this.memberRepo.checkAccess(accountId, project.id, project.orgId ?? null);
    return MemberAccess.compute(accountId, project.ownerId, hasMembership);
  }
}
