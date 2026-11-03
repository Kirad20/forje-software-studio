import { findSecret } from "../runtime/securityScan.js";
import type { Skill } from "../builder/skillLibrary.js";
import { q } from "./db.js";
import type { OrgRole } from "./orgs.js";

/**
 * Skills shared by an organization. Owners and admins write them; every member sees them and
 * every project of the organization loads them like the built-in ones (a project's own skill
 * of the same name still wins). They are instructions the builder follows, so they are
 * limited in size, refuse anything that looks like a secret and are written only by the
 * people who already control the organization.
 */

export class OrgSkillError extends Error {}

export interface OrgSkill extends Skill {
  enabled: boolean;
  updatedAt: string;
}

const NAME = /^[a-z0-9][a-z0-9-]{1,39}$/;
const MAX_BODY = 8000;
const MAX_DESCRIPTION = 160;
const MAX_SKILLS = 30;

export const listOrgSkills = (orgId: string) =>
  q<OrgSkill>(
    `select name, description, body, enabled, updated_at as "updatedAt" from org_skills where org_id = $1 order by name`,
    [orgId],
  );

/** The ones the builder loads. */
export async function enabledOrgSkills(orgId: string | null | undefined): Promise<Skill[]> {
  if (!orgId) return [];
  return q<Skill>(`select name, description, body from org_skills where org_id = $1 and enabled order by name`, [orgId]);
}

const canWrite = (role: OrgRole) => role === "owner" || role === "admin";

export async function saveOrgSkill(orgId: string, role: OrgRole, accountId: string, input: { name?: unknown; description?: unknown; body?: unknown; enabled?: unknown }) {
  if (!canWrite(role)) throw new OrgSkillError("Solo los dueños y administradores de la organización pueden editar sus skills.");
  const name = String(input.name ?? "").trim().toLowerCase();
  const description = String(input.description ?? "").trim();
  const body = String(input.body ?? "").trim();
  if (!NAME.test(name)) throw new OrgSkillError("El nombre debe tener de 2 a 40 caracteres: minúsculas, números y guiones.");
  if (!description) throw new OrgSkillError("Escribe una descripción de una línea: es lo que decide si el constructor la carga.");
  if (description.length > MAX_DESCRIPTION || description.includes("\n")) throw new OrgSkillError(`La descripción es una sola línea de hasta ${MAX_DESCRIPTION} caracteres.`);
  if (!body) throw new OrgSkillError("La skill necesita contenido.");
  if (body.length > MAX_BODY) throw new OrgSkillError(`El contenido es demasiado largo (máximo ${MAX_BODY} caracteres): divídelo en dos skills.`);
  const secret = findSecret(`${description}\n${body}`);
  if (secret) throw new OrgSkillError(`Parece que el texto contiene una ${secret}. Las skills las leen los agentes de todos los proyectos: no guardes claves aquí.`);
  const existing = await q<{ n: number }>(`select count(*)::int as n from org_skills where org_id = $1 and name <> $2`, [orgId, name]);
  if ((existing[0]?.n ?? 0) >= MAX_SKILLS) throw new OrgSkillError(`Una organización puede tener hasta ${MAX_SKILLS} skills.`);
  await q(
    `insert into org_skills (org_id, name, description, body, enabled, updated_by) values ($1, $2, $3, $4, $5, $6)
     on conflict (org_id, name) do update set description = excluded.description, body = excluded.body, enabled = excluded.enabled, updated_by = excluded.updated_by, updated_at = now()`,
    [orgId, name, description, body, input.enabled !== false, accountId],
  );
  return listOrgSkills(orgId);
}

export async function deleteOrgSkill(orgId: string, role: OrgRole, name: string) {
  if (!canWrite(role)) throw new OrgSkillError("Solo los dueños y administradores de la organización pueden editar sus skills.");
  await q(`delete from org_skills where org_id = $1 and name = $2`, [orgId, name]);
  return listOrgSkills(orgId);
}
