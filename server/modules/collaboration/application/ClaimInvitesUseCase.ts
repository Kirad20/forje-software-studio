import type { IMemberRepository } from "../ports/repositories.js";

export class ClaimInvitesUseCase {
  constructor(private readonly memberRepo: Pick<IMemberRepository, "claimInvites">) {}

  execute(accountId: string, email: string): Promise<number> {
    return this.memberRepo.claimInvites(accountId, email.toLowerCase());
  }
}
