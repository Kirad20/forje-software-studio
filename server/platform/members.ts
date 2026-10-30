import { sendPlatformEmail } from "../baas/email.js";
import { config } from "../config.js";
import { one, q } from "./db.js";
import type { Project } from "./projects.js";

/**
 * Collaborators. The owner invites by email; an existing account joins at once, anyone
 * else joins the first time they sign in with that email. Editors can build, test and
 * publish; only the owner can delete the project, manage collaborators or connect
 * account integrations. AI credits are always charged to the owner.
 */
export type Access = "owner" | "editor";

export async function accessOf(accountId: string, project: Project | undefined): Promise<Access | null> {
  if (!project) return null;
  if (project.ownerId === accountId) return "owner";
  const m = await one(`select 1 from project_members where project_id = $1 and account_id = $2`, [project.id, accountId]);
  return m ? "editor" : null;
}

export async function sharedProjectIds(accountId: string): Promise<string[]> {
  return (await q<{ project_id: string }>(`select project_id from project_members where account_id = $1`, [accountId])).map((r) => r.project_id);
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
  const email = rawEmail.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Correo no válido");
  if (email === inviterEmail.toLowerCase()) throw new Error("Ya tienes acceso a este proyecto");
  const account = await one<{ id: string }>(`select id from accounts where email = $1`, [email]);
  if (account?.id === project.ownerId) throw new Error("Esa persona es la dueña del proyecto");
  if (account) {
    await q(`insert into project_members (project_id, account_id) values ($1, $2) on conflict do nothing`, [project.id, account.id]);
  } else {
    await q(`insert into project_invites (project_id, email, invited_by) values ($1, $2, $3) on conflict do nothing`, [project.id, email, inviterEmail]);
  }
  await sendPlatformEmail(
    email,
    `${inviterEmail} te invitó a «${project.name}» en Forja`,
    `<p>${inviterEmail} te invitó a colaborar en <b>${project.name}</b>.</p><p><a href="${config.publicUrl}/p/${project.id}">Abrir el proyecto</a> (entra con este correo).</p>`,
  );
  return { joined: !!account };
}

export async function removeMember(projectId: string, emailOrAccount: string) {
  await q(`delete from project_members where project_id = $1 and account_id in (select id from accounts where email = $2 or id = $2)`, [
    projectId,
    emailOrAccount.toLowerCase(),
  ]);
  await q(`delete from project_invites where project_id = $1 and email = $2`, [projectId, emailOrAccount.toLowerCase()]);
}

/** Turns pending invites for this email into memberships; called on every sign-in. */
export async function claimInvites(accountId: string, email: string) {
  const rows = await q<{ project_id: string }>(`delete from project_invites where email = $1 returning project_id`, [email.toLowerCase()]);
  for (const r of rows) await q(`insert into project_members (project_id, account_id) values ($1, $2) on conflict do nothing`, [r.project_id, accountId]);
}
