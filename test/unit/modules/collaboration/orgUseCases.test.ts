import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateOrgUseCase } from "../../../../server/modules/collaboration/application/CreateOrgUseCase.js";
import { ManageOrgMemberUseCase } from "../../../../server/modules/collaboration/application/ManageOrgMemberUseCase.js";
import type {
  IOrganizationRepository,
  ICollaborationAccountRepository,
} from "../../../../server/modules/collaboration/ports/repositories.js";

describe("Organization Use Cases (TDD)", () => {
  let orgRepo: IOrganizationRepository;
  let accountRepo: ICollaborationAccountRepository;

  beforeEach(() => {
    orgRepo = {
      findById: vi.fn(),
      findBySlug: vi.fn(),
      isSlugTaken: vi.fn().mockResolvedValue(false),
      saveOrg: vi.fn().mockResolvedValue(undefined),
      addOrgMember: vi.fn().mockResolvedValue(undefined),
      getOrgRole: vi.fn(),
      getOwnerCount: vi.fn().mockResolvedValue(2),
      updateOrgMemberRole: vi.fn().mockResolvedValue(undefined),
      removeOrgMember: vi.fn().mockResolvedValue(undefined),
    };
    accountRepo = {
      findByEmail: vi.fn(),
    };
  });

  describe("CreateOrgUseCase", () => {
    it("creates an organization with unique slug and assigns owner role", async () => {
      const idGenerator = () => "org_new_id";
      const useCase = new CreateOrgUseCase(orgRepo, idGenerator);

      const org = await useCase.execute("acc_1", "  Equipo Alpha  ");
      expect(org).toEqual({
        id: "org_new_id",
        name: "Equipo Alpha",
        slug: "equipo-alpha",
        personal: false,
        role: "owner",
      });
      expect(orgRepo.saveOrg).toHaveBeenCalledWith({
        id: "org_new_id",
        name: "Equipo Alpha",
        slug: "equipo-alpha",
      });
      expect(orgRepo.addOrgMember).toHaveBeenCalledWith("org_new_id", "acc_1", "owner");
    });

    it("resolves slug conflicts by incrementing suffix", async () => {
      vi.spyOn(orgRepo, "isSlugTaken")
        .mockResolvedValueOnce(true) // 'alpha' taken
        .mockResolvedValueOnce(true) // 'alpha-2' taken
        .mockResolvedValueOnce(false); // 'alpha-3' free

      const idGenerator = () => "org_new_id";
      const useCase = new CreateOrgUseCase(orgRepo, idGenerator);

      const org = await useCase.execute("acc_1", "alpha");
      expect(org.slug).toBe("alpha-3");
    });
  });

  describe("ManageOrgMemberUseCase", () => {
    let useCase: ManageOrgMemberUseCase;

    beforeEach(() => {
      useCase = new ManageOrgMemberUseCase(orgRepo, accountRepo);
    });

    it("adds member to organization when actor has permission and target exists", async () => {
      vi.spyOn(orgRepo, "findById").mockResolvedValue({
        id: "org_1",
        name: "Org",
        personal: false,
      });
      vi.spyOn(accountRepo, "findByEmail").mockResolvedValue({
        id: "acc_target",
        email: "target@example.com",
      });

      await useCase.addMember("org_1", "owner", "target@example.com", "admin");

      expect(orgRepo.addOrgMember).toHaveBeenCalledWith("org_1", "acc_target", "admin");
    });

    it("refuses to add members to personal organizations", async () => {
      vi.spyOn(orgRepo, "findById").mockResolvedValue({
        id: "org_personal",
        name: "Personal",
        personal: true,
      });

      await expect(
        useCase.addMember("org_personal", "owner", "target@example.com", "member"),
      ).rejects.toThrow("Una organización personal no admite miembros. Crea una organización de equipo.");
    });

    it("refuses if actor role is not allowed to add role", async () => {
      await expect(
        useCase.addMember("org_1", "member", "target@example.com", "member"),
      ).rejects.toThrow("Solo propietarios y administradores gestionan miembros.");
    });

    it("updates role and enforces owner count on demotion", async () => {
      vi.spyOn(orgRepo, "getOrgRole").mockResolvedValue("owner");
      vi.spyOn(orgRepo, "getOwnerCount").mockResolvedValue(1);

      await expect(
        useCase.setRole("org_1", "owner", "acc_target", "member"),
      ).rejects.toThrow("La organización necesita al menos un propietario.");
    });
  });
});
