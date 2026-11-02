import { q } from "./db.js";
import type { Project } from "./projects.js";
import {
  checkAccessUseCase,
  inviteMemberUseCase,
  removeMemberUseCase,
  memberRepository,
  type Access,
} from "../modules/collaboration/index.js";

export type { Access };

export async function accessOf(accountId: string, project: Project | undefined): Promise<Access | null> {
  return checkAccessUseCase.execute(accountId, project);
}

/** Projects the account can open without owning them: as a collaborator or through an organization. */
export async function sharedProjectIds(accountId: string): Promise<string[]> {
  return memberRepository.getSharedProjectIds(accountId);
}

export async function listMembers(projectId: string) {
  const members = await q<{ accountId: string; email: string; name: string | null; role: string; createdAt: string }>(
    `select m.account_id as "accountId", a.email, a.name, m.role, m.created_at as "createdAt"
     from project_members m join accounts a on a.id = m.account_id where m.project_id = $1 order by m.created_at`,
    [projectId],
  );
  const invites = await q<{ email: string; role: string; createdAt: string }>(
    `select email, role, created_at as "createdAt" from project_invites where project_id = $1 order by created_at`,
    [projectId],
  );
  return { members, invites };
}

export async function inviteMember(project: Project, inviterEmail: string, rawEmail: string) {
  return inviteMemberUseCase.execute(project, inviterEmail, rawEmail);
}

export async function removeMember(projectId: string, emailOrAccount: string) {
  await removeMemberUseCase.execute(projectId, emailOrAccount);
}

/** Turns pending invites for this email into memberships; called on every sign-in. */
export async function claimInvites(accountId: string, email: string) {
  await memberRepository.claimInvites(accountId, email);
}
