import { StaticToolRegistryAdapter } from "./infrastructure/StaticToolRegistryAdapter.js";
import { CalculateSpendUseCase } from "./application/CalculateSpendUseCase.js";

// Domain & Models
export * from "./domain/AgentRole.js";
export * from "./domain/ExecutionMetrics.js";
export * from "./ports/repositories.js";

// Infrastructure Singleton Adapters
export const toolRegistry = new StaticToolRegistryAdapter();

// Application Use Cases
export const calculateSpendUseCase = new CalculateSpendUseCase();
