import { ProjectInvite } from "../domain/ProjectInvite.js";
import type {
  IMemberRepository,
  ICollaborationAccountRepository,
  ICollaborationMailerService,
} from "../ports/repositories.js";

export interface ProjectTarget {
  id: string;
  name: string;
  ownerId: string;
}

export interface InviteMemberResult {
  joined: boolean;
}

export class InviteMemberUseCase {
  constructor(
    private readonly memberRepo: IMemberRepository,
    private readonly accountRepo: ICollaborationAccountRepository,
    private readonly mailerService: ICollaborationMailerService,
  ) {}

  async execute(
    project: ProjectTarget,
    inviterEmail: string,
    rawEmail: string,
  ): Promise<InviteMemberResult> {
    const invite = new ProjectInvite({
      projectId: project.id,
      email: rawEmail,
      invitedBy: inviterEmail,
    });

    const account = await this.accountRepo.findByEmail(invite.email);
    if (account?.id === project.ownerId) {
      throw new Error("Esa persona es la dueña del proyecto");
    }

    if (account) {
      await this.memberRepo.addMember(project.id, account.id);
    } else {
      await this.memberRepo.createInvite(project.id, invite.email, invite.invitedBy);
    }

    await this.mailerService.sendInvitation({
      to: invite.email,
      inviterEmail: invite.invitedBy,
      projectId: project.id,
      projectName: project.name,
    });

    return { joined: !!account };
  }
}
