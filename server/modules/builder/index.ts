import { StaticToolRegistryAdapter } from "./infrastructure/StaticToolRegistryAdapter.js";
import { CalculateSpendUseCase } from "./application/CalculateSpendUseCase.js";
import type { ModelInfo } from "../model-management/catalog.js";
import type { AgentExecutionResult } from "./domain/AgentExecution.js";

export type AgentResult = AgentExecutionResult<ModelInfo>;
export { bindBuilderCoreModules } from "./infrastructure/CoreModulesAdapter.js";
export { listTasks } from "./infrastructure/TaskQueriesAdapter.js";
export type { AgentTaskView } from "./ports/AgentTaskQueries.js";

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
export { isBuilding, stopBuilding, stopBuilder, pendingPlan, runBuilderTurn, penalizeTurn, type ChatMode } from "./infrastructure/BuilderTurnAdapter.js";
export { metricsIdle, metricsReport, recordToolCall, recordStep, newRunId, estTokens, GATE_THRESHOLD, type MetricsReport } from "./infrastructure/metrics.js";
export { langfuse, reloadLangfuse, createLangfuse } from "./infrastructure/tracing.js";
export { startSecurityReview } from "./infrastructure/securityReview.js";
export { projectMap } from "./infrastructure/projectIndex.js";
export { BUILDER_SYSTEM_PROMPT } from "./infrastructure/prompt.js";
export { BUILTIN_SKILLS } from "./infrastructure/skillLibrary.js";
export { renderSkill } from "./infrastructure/skills.js";
export { FAST_EXCLUDED_TOOLS, MAX_STEPS, ROLE_PROMPTS, ROLE_TOOLS } from "./infrastructure/roles.js";
export { rewardOf } from "./domain/OrchestrationPolicy.js";
export { createFinishGate } from "./infrastructure/FinishGateAdapter.js";
export { newBuildProblems, newRuntimeProblems } from "./domain/FinishGatePolicy.js";
export { builderTools, toolByName, previewUrl, type ToolContext, type ToolOutput, type BuilderTool } from "./infrastructure/BuilderToolsAdapter.js";
