import { allowedModels, type ModelInfo } from "../llm/catalog.js";
import { callModel } from "../llm/router.js";
import { textOf, type LlmMessage, type LlmTool } from "../llm/types.js";
import { one, q } from "../platform/db.js";
import { log } from "../platform/events.js";

/**
 * Forja AI: the model an app calls for its own users. Every call is charged to the
 * project owner's credits, and the owner can switch it off per project.
 */
export class AiUnavailableError extends Error {
  name = "AiUnavailableError";
  status = 402;
}

export interface AppAiInput {
  messages: LlmMessage[];
  system?: string;
  model?: string;
  tools?: LlmTool[];
  maxTokens?: number;
}

export async function appAiChat(projectId: string, input: AppAiInput) {
  const project = await one<{ owner_id: string; ai_enabled: boolean; credits: number }>(
    `select p.owner_id, p.ai_enabled, a.credits from projects p join accounts a on a.id = p.owner_id where p.id = $1`,
    [projectId],
  );
  if (!project) throw new Error("Proyecto no encontrado");
  if (!project.ai_enabled) throw new AiUnavailableError("La IA está desactivada para este proyecto.");
  if (project.credits <= 0) throw new AiUnavailableError("Sin créditos: el dueño del proyecto debe añadir créditos.");

  // The app may name a model; it must be on the project's whitelist. Otherwise the router
  // picks the cheapest model that fits (vision when images are sent, tools when given).
  const scope = { accountId: project.owner_id, projectId };
  const needsVision = input.messages.some((m) => typeof m.content !== "string" && m.content.some((b) => b.type === "image"));
  let pinned: ModelInfo | undefined;
  if (input.model) {
    const allowed = await allowedModels(scope);
    pinned = allowed.find((m) => m.id === input.model || m.model === input.model);
    if (!pinned) throw new AiUnavailableError(`El modelo «${input.model}» no está permitido en este proyecto.`);
  }
  const { response, model, credits } = await callModel(
    scope,
    "app",
    { complexity: input.tools?.length ? 2 : 1, domains: ["ai"], needsVision },
    { system: input.system, messages: input.messages, tools: input.tools, maxTokens: input.maxTokens ?? 2048 },
    { billing: { payerId: project.owner_id, projectId, source: "app" }, pinned },
  );
  const u = response.usage;
  log(projectId, { env: "preview", level: "info", source: "ai", message: `IA ${model.label}: ${u.input + u.cacheRead}+${u.output} tokens, ${credits} créditos` });
  return { text: textOf(response.content), content: response.content, stopReason: response.stopReason, credits, model: model.id };
}

export async function aiUsage(projectId: string) {
  return q(
    `select source, model, sum(input_tokens + cache_read_tokens + cache_write_tokens)::int as "inputTokens", sum(output_tokens)::int as "outputTokens",
       sum(cache_read_tokens)::int as "cachedTokens", round(sum(usd)::numeric, 4)::float as usd,
       sum(credits)::int as credits, count(*)::int as calls
     from ai_usage where project_id = $1 group by source, model order by sum(usd) desc`,
    [projectId],
  );
}
