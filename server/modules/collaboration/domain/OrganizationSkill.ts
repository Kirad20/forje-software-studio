import type { OrgRole } from "./OrgPolicy.js";

export interface OrganizationSkill {
  name: string;
  description: string;
  body: string;
  enabled: boolean;
  updatedAt: string;
}

export interface OrganizationSkillContent {
  name: string;
  description: string;
  body: string;
  enabled: boolean;
}

export class OrgSkillError extends Error {}

const NAME = /^[a-z0-9][a-z0-9-]{1,39}$/;
const MAX_BODY = 8000;
const MAX_DESCRIPTION = 160;

export function canWriteOrganizationSkill(role: OrgRole): boolean {
  return role === "owner" || role === "admin";
}

export function validateOrganizationSkill(
  input: { name?: unknown; description?: unknown; body?: unknown; enabled?: unknown },
  findSecret: (text: string) => string | null,
): OrganizationSkillContent {
  const name = String(input.name ?? "").trim().toLowerCase();
  const description = String(input.description ?? "").trim();
  const body = String(input.body ?? "").trim();
  if (!NAME.test(name)) throw new OrgSkillError("El nombre debe tener de 2 a 40 caracteres: minúsculas, números y guiones.");
  if (!description) throw new OrgSkillError("Escribe una descripción de una línea: es lo que decide si el constructor la carga.");
  if (description.length > MAX_DESCRIPTION || description.includes("\n")) {
    throw new OrgSkillError(`La descripción es una sola línea de hasta ${MAX_DESCRIPTION} caracteres.`);
  }
  if (!body) throw new OrgSkillError("La skill necesita contenido.");
  if (body.length > MAX_BODY) {
    throw new OrgSkillError(`El contenido es demasiado largo (máximo ${MAX_BODY} caracteres): divídelo en dos skills.`);
  }
  const secret = findSecret(`${description}\n${body}`);
  if (secret) {
    throw new OrgSkillError(`Parece que el texto contiene una ${secret}. Las skills las leen los agentes de todos los proyectos: no guardes claves aquí.`);
  }
  return { name, description, body, enabled: input.enabled !== false };
}
