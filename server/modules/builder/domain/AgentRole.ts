export type RoleName = "fast" | "planner" | "data" | "backend" | "ui" | "qa" | "chat" | "security_reviewer" | "title";

const VALID_ROLES = new Set<RoleName>([
  "fast",
  "planner",
  "data",
  "backend",
  "ui",
  "qa",
  "chat",
  "security_reviewer",
  "title",
]);

const SPECIALIST_ROLES = new Set<RoleName>(["data", "backend", "ui", "qa"]);

export class AgentRole {
  readonly name: RoleName;

  constructor(name: RoleName) {
    if (!VALID_ROLES.has(name)) {
      throw new Error(`Rol de agente no válido: "${name}"`);
    }
    this.name = name;
  }

  isSpecialist(): boolean {
    return SPECIALIST_ROLES.has(this.name);
  }

  toString(): string {
    return this.name;
  }
}
