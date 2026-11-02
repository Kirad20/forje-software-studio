import type { AgentRole } from "../domain/AgentRole.js";
import type { ExecutionMetrics } from "../domain/ExecutionMetrics.js";

export interface IToolRegistry {
  hasTool(name: string): boolean;
  getToolsForRole(role: AgentRole): string[];
}

export interface ITracingService {
  recordTurn(turnId: string, role: string, metrics: ExecutionMetrics): Promise<void>;
}
