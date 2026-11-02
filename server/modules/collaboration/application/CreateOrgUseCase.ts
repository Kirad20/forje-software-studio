import { OrgPolicy, type OrgRole } from "../domain/OrgPolicy.js";
import type { IOrganizationRepository } from "../ports/repositories.js";

export interface CreateOrgResult {
  id: string;
  name: string;
  slug: string;
  personal: boolean;
  role: OrgRole;
}

export class CreateOrgUseCase {
  constructor(
    private readonly orgRepo: IOrganizationRepository,
    private readonly newId: () => string,
  ) {}

  async execute(accountId: string, rawName: string): Promise<CreateOrgResult> {
    const name = OrgPolicy.validateName(rawName);
    const base = OrgPolicy.slugify(name);
    let slug = base;
    for (let i = 2; await this.orgRepo.isSlugTaken(slug); i++) {
      slug = `${base}-${i}`;
    }
    const id = this.newId();
    await this.orgRepo.saveOrg({ id, name, slug });
    await this.orgRepo.addOrgMember(id, accountId, "owner");
    return { id, name, slug, personal: false, role: "owner" };
  }
}
