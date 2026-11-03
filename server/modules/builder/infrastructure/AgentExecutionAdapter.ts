import { callModel, maxTokensFor, type Billing, type PickInput, type Role } from "../../../llm/router.js";
import { textOf } from "../../../llm/types.js";
import type { ModelInfo, ModelScope } from "../../../llm/catalog.js";
import { countAction } from "../../../platform/usage.js";
import { newRunId, recordStep, recordToolCall } from "../../../builder/metrics.js";
import type { ToolContext } from "./BuilderToolsAdapter.js";
import type { AgentExecutionResult, AgentExecutionSpec } from "../domain/AgentExecution.js";
import { RunAgentUseCase } from "../application/RunAgentUseCase.js";
import { save } from "./SqlChatHistoryAdapter.js";

export interface AgentSpec extends AgentExecutionSpec<ModelInfo, ToolContext> {
  scope: ModelScope;
  billing: Billing;
  role: Role;
  routing: PickInput;
  system: string;
  signal: AbortSignal;
}

export function runAgent(spec: AgentSpec): Promise<AgentExecutionResult<ModelInfo>> {
  return new RunAgentUseCase<ModelInfo>({
    callModel: ({ messages, tools, pinned }) => callModel(
      spec.scope, spec.role, spec.routing,
      { system: spec.system, messages, tools, maxTokens: maxTokensFor(spec.role), signal: spec.signal },
      { billing: spec.billing, pinned, log: { turnId: spec.turnId, taskId: spec.taskId } },
    ),
    summarize: async transcript => {
      const result = await callModel(spec.scope, "summarizer", { complexity: 1, domains: [], needsVision: false }, {
        system: "Resumes el trabajo hecho hasta ahora por un agente que construye una app, para que pueda seguir sin releer todo. Escribe en español, máximo 400 palabras, solo hechos: el objetivo, qué archivos leyó y qué aprendió de ellos (rutas, nombres, firmas), qué archivos escribió o cambió, decisiones tomadas, errores o avisos sin resolver y qué falta por hacer.",
        messages: [{ role: "user", content: transcript }],
        maxTokens: 1200,
        signal: spec.signal,
      }, { billing: spec.billing });
      return { text: textOf(result.response.content), usage: result.response.usage, usd: result.usd, credits: result.credits };
    },
    compactionFailed: error => console.warn("[builder] Context compaction failed; continuing with pruned history:", error),
    save,
    countAction,
    newRunId,
    now: () => performance.now(),
    recordStep,
    recordToolCall,
  }).execute(spec);
}
