import { OrgPolicy, type OrgRole } from "../domain/OrgPolicy.js";
import type {
  IOrganizationRepository,
  ICollaborationAccountRepository,
} from "../ports/repositories.js";

export class ManageOrgMemberUseCase {
  constructor(
    private readonly orgRepo: IOrganizationRepository,
    private readonly accountRepo: ICollaborationAccountRepository,
  ) {}

  async addMember(orgId: string, actorRole: OrgRole, email: string, role: OrgRole): Promise<void> {
    OrgPolicy.assertRole(role);
    OrgPolicy.assertCanManage(actorRole, null, role);

    const org = await this.orgRepo.findById(orgId);
    if (org?.personal) {
      throw new Error("Una organización personal no admite miembros. Crea una organización de equipo.");
    }

    const account = await this.accountRepo.findByEmail(email.trim().toLowerCase());
    if (!account) {
      throw new Error("Esa persona aún no tiene cuenta en Forja. Pídele que entre una vez con su correo.");
    }

    await this.orgRepo.addOrgMember(orgId, account.id, role);
  }

  async setRole(orgId: string, actorRole: OrgRole, accountId: string, role: OrgRole): Promise<void> {
    OrgPolicy.assertRole(role);
    const current = await this.orgRepo.getOrgRole(orgId, accountId);
    if (!current) {
      throw new Error("Esa persona no es miembro");
    }

    OrgPolicy.assertCanManage(actorRole, current, role);

    if (current === "owner" && role !== "owner") {
      const owners = await this.orgRepo.getOwnerCount(orgId);
      OrgPolicy.assertMinOwners(owners);
    }

    await this.orgRepo.updateOrgMemberRole(orgId, accountId, role);
  }

  async removeMember(
    orgId: string,
    actorRole: OrgRole,
    actorId: string,
    accountId: string,
  ): Promise<void> {
    const current = await this.orgRepo.getOrgRole(orgId, accountId);
    if (!current) return;

    if (accountId !== actorId) {
      OrgPolicy.assertCanManage(actorRole, current);
    }

    if (current === "owner") {
      const owners = await this.orgRepo.getOwnerCount(orgId);
      OrgPolicy.assertMinOwners(owners);
    }

    await this.orgRepo.removeOrgMember(orgId, accountId);
  }
}
