import { ROLE_TOOLS } from "./roles.js";
import { AgentRole } from "../domain/AgentRole.js";
import type { IToolRegistry } from "../ports/repositories.js";

export class StaticToolRegistryAdapter implements IToolRegistry {
  hasTool(name: string): boolean {
    return Object.values(ROLE_TOOLS).some((tools: string[]) => tools.includes(name));
  }

  getToolsForRole(role: AgentRole): string[] {
    const tools = (ROLE_TOOLS as Record<string, string[]>)[role.name];
    return tools ? [...tools] : [];
  }
}
