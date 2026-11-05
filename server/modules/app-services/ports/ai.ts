import type { ObserverPorts } from "./observer.js";
import type { QueryRepository } from "./repositories.js";
import type { AppAiInput, AiBlock, AiUsage, AiFusionTrace } from "../domain/contracts.js";
export interface AiModel { id: string; model: string; label: string }
export interface AiPorts extends QueryRepository<"aiProject" | "aiUsage">, ObserverPorts {
  allowedModels(scope: { accountId: string; projectId: string }): Promise<AiModel[]>;
  callModel(
    scope: { accountId: string; projectId: string }, intent: "app",
    needs: { complexity: number; domains: string[]; needsVision: boolean; needsTools: boolean },
    input: Omit<AppAiInput, "model">,
    options: { billing: { payerId: string; projectId: string; source: "app" }; explicit?: AiModel },
  ): Promise<{ response: { content: AiBlock[]; stopReason: "tool_use" | "end" | "max_tokens" | "refusal"; usage: AiUsage }; model: AiModel; credits: number; usd?: number; totalUsage?: AiUsage; fusion?: AiFusionTrace }>;
}
