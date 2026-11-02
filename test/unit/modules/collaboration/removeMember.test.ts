import { describe, it, expect, vi, beforeEach } from "vitest";
import { RemoveMemberUseCase } from "../../../../server/modules/collaboration/application/RemoveMemberUseCase.js";
import type { IMemberRepository } from "../../../../server/modules/collaboration/ports/repositories.js";

describe("RemoveMemberUseCase (TDD)", () => {
  let memberRepo: IMemberRepository;

  beforeEach(() => {
    memberRepo = {
      checkAccess: vi.fn(),
      getSharedProjectIds: vi.fn(),
      claimInvites: vi.fn(),
      removeMember: vi.fn(),
      addMember: vi.fn(),
      createInvite: vi.fn(),
    };
  });

  it("delegates member removal to repository", async () => {
    const useCase = new RemoveMemberUseCase(memberRepo);
    await useCase.execute("p1", "bob@example.com");
    expect(memberRepo.removeMember).toHaveBeenCalledWith("p1", "bob@example.com");
  });
});
