export type OrgRole = "owner" | "admin" | "member";
export const ORG_ROLES: OrgRole[] = ["owner", "admin", "member"];

export class OrgPolicy {
  static assertRole(role: string): asserts role is OrgRole {
    if (!ORG_ROLES.includes(role as OrgRole)) {
      throw new Error("Rol no válido");
    }
  }

  static assertCanManage(actor: OrgRole, target: OrgRole | null, newRole?: OrgRole): void {
    if (actor === "member") {
      throw new Error("Solo propietarios y administradores gestionan miembros.");
    }
    if (actor === "admin" && (target === "owner" || newRole === "owner")) {
      throw new Error("Solo un propietario puede gestionar propietarios.");
    }
  }

  static assertMinOwners(currentOwnerCount: number): void {
    if (currentOwnerCount <= 1) {
      throw new Error("La organización necesita al menos un propietario.");
    }
  }

  static validateName(rawName: string): string {
    const name = String(rawName ?? "").trim().slice(0, 60);
    if (name.length < 2) {
      throw new Error("Ponle un nombre a la organización");
    }
    return name;
  }

  static slugify(s: string): string {
    const slug = String(s ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
    return slug || "org";
  }
}
