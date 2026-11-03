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

export { runAgent, type AgentSpec } from "./infrastructure/AgentExecutionAdapter.js";
export { save, loadHistory, imageBlocks, UPLOADS } from "./infrastructure/SqlChatHistoryAdapter.js";
export { GATE_FIXES } from "./application/RunAgentUseCase.js";
export type { AgentEvent, AgentExecutionResult } from "./domain/AgentExecution.js";
export { isBuilding, stopBuilding, pendingPlan, runBuilderTurn, penalizeTurn, type ChatMode } from "./infrastructure/BuilderTurnAdapter.js";
export { rewardOf } from "./domain/OrchestrationPolicy.js";
export { createFinishGate } from "./infrastructure/FinishGateAdapter.js";
export { newBuildProblems, newRuntimeProblems } from "./domain/FinishGatePolicy.js";
export { builderTools, toolByName, previewUrl, type ToolContext, type ToolOutput, type BuilderTool } from "./infrastructure/BuilderToolsAdapter.js";
