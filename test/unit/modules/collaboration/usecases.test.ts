import { describe, it, expect, vi, beforeEach } from "vitest";
import { InviteMemberUseCase } from "../../../../server/modules/collaboration/application/InviteMemberUseCase.js";
import type {
  IMemberRepository,
  ICollaborationMailerService,
  ICollaborationAccountRepository,
} from "../../../../server/modules/collaboration/ports/repositories.js";

describe("Collaboration InviteMemberUseCase (TDD)", () => {
  let memberRepo: IMemberRepository;
  let accountRepo: ICollaborationAccountRepository;
  let mailerService: ICollaborationMailerService;
  let useCase: InviteMemberUseCase;

  const project = {
    id: "proj_123",
    name: "Proyecto Alpha",
    ownerId: "acc_owner",
  };

  beforeEach(() => {
    memberRepo = {
      checkAccess: vi.fn(),
      getSharedProjectIds: vi.fn(),
      claimInvites: vi.fn(),
      removeMember: vi.fn(),
      addMember: vi.fn().mockResolvedValue(undefined),
      createInvite: vi.fn().mockResolvedValue(undefined),
    };

    accountRepo = {
      findByEmail: vi.fn(),
    };

    mailerService = {
      sendInvitation: vi.fn().mockResolvedValue(true),
    };

    useCase = new InviteMemberUseCase(memberRepo, accountRepo, mailerService);
  });

  it("throws error when email format is invalid", async () => {
    await expect(
      useCase.execute(project, "owner@example.com", "correo-invalido"),
    ).rejects.toThrow("Correo no válido");
  });

  it("throws error when inviter invites themselves", async () => {
    await expect(
      useCase.execute(project, "owner@example.com", "owner@example.com"),
    ).rejects.toThrow("Ya tienes acceso a este proyecto");

    // Case insensitive test
    await expect(
      useCase.execute(project, "Owner@Example.com", "owner@example.com "),
    ).rejects.toThrow("Ya tienes acceso a este proyecto");
  });

  it("throws error when invited email belongs to the project owner", async () => {
    vi.spyOn(accountRepo, "findByEmail").mockResolvedValue({
      id: "acc_owner",
      email: "owner_personal@example.com",
    });

    await expect(
      useCase.execute(project, "admin@example.com", "owner_personal@example.com"),
    ).rejects.toThrow("Esa persona es la dueña del proyecto");
  });

  it("adds member directly when account already exists and sends notification email", async () => {
    vi.spyOn(accountRepo, "findByEmail").mockResolvedValue({
      id: "acc_existing",
      email: "existing@example.com",
    });

    const result = await useCase.execute(project, "owner@example.com", " Existing@example.com ");

    expect(result).toEqual({ joined: true });
    expect(accountRepo.findByEmail).toHaveBeenCalledWith("existing@example.com");
    expect(memberRepo.addMember).toHaveBeenCalledWith("proj_123", "acc_existing");
    expect(memberRepo.createInvite).not.toHaveBeenCalled();
    expect(mailerService.sendInvitation).toHaveBeenCalledWith({
      to: "existing@example.com",
      inviterEmail: "owner@example.com",
      projectId: "proj_123",
      projectName: "Proyecto Alpha",
    });
  });

  it("creates invite when account does not exist yet and sends notification email", async () => {
    vi.spyOn(accountRepo, "findByEmail").mockResolvedValue(null);

    const result = await useCase.execute(project, "owner@example.com", "new_user@example.com");

    expect(result).toEqual({ joined: false });
    expect(accountRepo.findByEmail).toHaveBeenCalledWith("new_user@example.com");
    expect(memberRepo.addMember).not.toHaveBeenCalled();
    expect(memberRepo.createInvite).toHaveBeenCalledWith(
      "proj_123",
      "new_user@example.com",
      "owner@example.com",
    );
    expect(mailerService.sendInvitation).toHaveBeenCalledWith({
      to: "new_user@example.com",
      inviterEmail: "owner@example.com",
      projectId: "proj_123",
      projectName: "Proyecto Alpha",
    });
  });
});
