import { Organization } from "../domain/Organization.js";
import type { IPersonalOrganizationRepository } from "../ports/personalOrganizations.js";

export class PersonalOrganizationUseCase {
  constructor(private readonly repository: IPersonalOrganizationRepository) {}

  create(accountId: string, name: string): Promise<void> {
    return this.repository.create(Organization.personalId(accountId), accountId, name);
  }

  ensure(accountId: string): Promise<void> {
    return this.repository.ensure(Organization.personalId(accountId), accountId);
  }

  delete(accountId: string): Promise<void> {
    return this.repository.delete(Organization.personalId(accountId));
  }
}
