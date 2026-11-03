import type { OrgRole } from "../domain/OrgPolicy.js";
import {
  canWriteOrganizationSkill,
  OrgSkillError,
  validateOrganizationSkill,
} from "../domain/OrganizationSkill.js";
import type { OrganizationSkillsRepository, SecretDetector } from "../ports/organizationSkills.js";

const MAX_SKILLS = 30;

export class OrganizationSkillsService {
  constructor(
    private readonly repository: OrganizationSkillsRepository,
    private readonly secretDetector: SecretDetector,
  ) {}

  list(orgId: string) {
    return this.repository.list(orgId);
  }

  enabled(orgId: string | null | undefined) {
    return orgId ? this.repository.enabled(orgId) : Promise.resolve([]);
  }

  async save(
    orgId: string,
    role: OrgRole,
    accountId: string,
    input: { name?: unknown; description?: unknown; body?: unknown; enabled?: unknown },
  ) {
    if (!canWriteOrganizationSkill(role)) {
      throw new OrgSkillError("Solo los dueños y administradores de la organización pueden editar sus skills.");
    }
    const skill = validateOrganizationSkill(input, (text) => this.secretDetector.findSecret(text));
    if (await this.repository.countExcept(orgId, skill.name) >= MAX_SKILLS) {
      throw new OrgSkillError(`Una organización puede tener hasta ${MAX_SKILLS} skills.`);
    }
    await this.repository.save(orgId, accountId, skill);
    return this.list(orgId);
  }

  async delete(orgId: string, role: OrgRole, name: string) {
    if (!canWriteOrganizationSkill(role)) {
      throw new OrgSkillError("Solo los dueños y administradores de la organización pueden editar sus skills.");
    }
    await this.repository.delete(orgId, name);
    return this.list(orgId);
  }
}
