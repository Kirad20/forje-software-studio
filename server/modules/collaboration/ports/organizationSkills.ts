import type { OrganizationSkill, OrganizationSkillContent } from "../domain/OrganizationSkill.js";

export interface OrganizationSkillsRepository {
  list(orgId: string): Promise<OrganizationSkill[]>;
  enabled(orgId: string): Promise<Pick<OrganizationSkill, "name" | "description" | "body">[]>;
  countExcept(orgId: string, name: string): Promise<number>;
  save(orgId: string, accountId: string, skill: OrganizationSkillContent): Promise<void>;
  delete(orgId: string, name: string): Promise<void>;
}

export interface SecretDetector {
  findSecret(text: string): string | null;
}
