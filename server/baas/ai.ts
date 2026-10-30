import { config } from "../config.js";
import { chat, creditsFor, textOf, type LlmMessage, type LlmTool } from "../lib/llm.js";
import { one, q } from "../platform/db.js";
import { log } from "../platform/events.js";

/**
 * Forja AI: the model an app calls for its own users. Every call is charged to the
 * project owner's credits, and the owner can switch it off per project.
 */
export class AiUnavailableError extends Error {
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

  const model = input.model ?? config.appAi.model;
  const res = await chat({
    provider: config.appAi.provider,
    model,
    system: input.system,
    messages: input.messages,
    tools: input.tools,
    maxTokens: input.maxTokens ?? 2048,
  });
  const credits = await charge(project.owner_id, projectId, "app", model, res.usage);
  log(projectId, { env: "preview", level: "info", source: "ai", message: `IA ${model}: ${res.usage.input}+${res.usage.output} tokens, ${credits} créditos` });
  return { text: textOf(res.content), content: res.content, stopReason: res.stopReason, credits };
}

export async function charge(
  accountId: string,
  projectId: string | null,
  source: "app" | "builder",
  model: string,
  usage: { input: number; output: number },
) {
  const credits = creditsFor(usage);
  await q(
    `insert into ai_usage (project_id, account_id, source, model, input_tokens, output_tokens, credits) values ($1, $2, $3, $4, $5, $6, $7)`,
    [projectId, accountId, source, model, usage.input, usage.output, credits],
  );
  await q(`update accounts set credits = greatest(credits - $2, 0) where id = $1`, [accountId, credits]);
  return credits;
}

export async function aiUsage(projectId: string) {
  return q(
    `select source, model, sum(input_tokens)::int as "inputTokens", sum(output_tokens)::int as "outputTokens",
       sum(credits)::int as credits, count(*)::int as calls
     from ai_usage where project_id = $1 group by source, model order by credits desc`,
    [projectId],
  );
}
