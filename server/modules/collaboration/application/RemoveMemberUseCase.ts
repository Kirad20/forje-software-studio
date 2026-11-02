import type { IMemberRepository } from "../ports/repositories.js";

export class RemoveMemberUseCase {
  constructor(private readonly memberRepo: IMemberRepository) {}

  async execute(projectId: string, emailOrAccount: string): Promise<void> {
    await this.memberRepo.removeMember(projectId, emailOrAccount);
  }
}
