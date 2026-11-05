import type { AiPorts } from "../ports/ai.js";
import type { AppAiInput } from "../domain/contracts.js";
export type { AppAiInput } from "../domain/contracts.js";

/**
 * Forja AI: the model an app calls for its own users. Every call is charged to the
 * project owner's credits, and the owner can switch it off per project.
 */
export class AiUnavailableError extends Error {
  name = "AiUnavailableError";
  status = 402;
}

export function createAi({ one, q, log, allowedModels, callModel }: AiPorts) {
async function appAiChat(projectId: string, input: AppAiInput) {
  const project = await one<{ owner_id: string; ai_enabled: boolean; credits: number }>(
    "aiProject",
    [projectId],
  );
  if (!project) throw new Error("Proyecto no encontrado");
  if (!project.ai_enabled) throw new AiUnavailableError("La IA está desactivada para este proyecto.");
  if (project.credits <= 0) throw new AiUnavailableError("Sin créditos: el dueño del proyecto debe añadir créditos.");

  // The app may name a model; it must be on the project's whitelist. Otherwise the router
  // routes eligible models (vision when images are sent, tools when given).
  const scope = { accountId: project.owner_id, projectId };
  const needsVision = input.messages.some((m) => typeof m.content !== "string" && m.content.some((b) => b.type === "image"));
  let explicit: Awaited<ReturnType<AiPorts["allowedModels"]>>[number] | undefined;
  if (input.model) {
    const allowed = await allowedModels(scope);
    explicit = allowed.find((m) => m.id === input.model || m.model === input.model);
    if (!explicit) throw new AiUnavailableError(`El modelo «${input.model}» no está permitido en este proyecto.`);
  }
  const { response, model, credits, usd, totalUsage, fusion } = await callModel(
    scope,
    "app",
    { complexity: input.tools?.length ? 2 : 1, domains: ["ai"], needsVision, needsTools: Boolean(input.tools?.length) },
    { system: input.system, messages: input.messages, tools: input.tools, maxTokens: input.maxTokens ?? 2048 },
    { billing: { payerId: project.owner_id, projectId, source: "app" }, explicit },
  );
  const u = totalUsage ?? response.usage;
  log(projectId, { env: "preview", level: "info", source: "ai", message: `IA ${model.label}: ${u.input + u.cacheRead + (u.cacheWrite ?? 0)}+${u.output} tokens, ${credits} créditos` });
  const text = response.content.filter((block) => block.type === "text").map((block) => block.text).join("");
  return { text, content: response.content, stopReason: response.stopReason, credits, model: model.id, usage: u, usd,
    ...(fusion ? { fusion: {
      operationId: fusion.operationId, effort: fusion.effort, pattern: fusion.pattern, warnings: fusion.warnings,
      steps: fusion.steps.map(step => ({
        id: step.id, phase: step.phase, modelId: step.modelId, servedBy: step.servedBy,
        effort: step.effort, ms: step.ms, usage: step.usage, usd: step.usd, credits: step.credits,
        context: step.context,
        ...(step.error ? { error: "Model call failed" } : {}),
      })),
    } } : {}) };
}

async function aiUsage(projectId: string) {
  return q(
    "aiUsage",
    [projectId],
  );
}
return { appAiChat, aiUsage };
}
