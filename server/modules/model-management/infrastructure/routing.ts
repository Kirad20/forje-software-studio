import { createHash, randomUUID } from "node:crypto";
import { one, q } from "../../../shared/database/index.js";
import { prior } from "../domain/bandit.js";
import { ModelCallError } from "../domain/messages.js";
import type { ModelRouterPorts } from "../ports/ModelRouterPorts.js";
import { anthropicChat } from "./anthropic.js";
import { allowedModels, costUsd, creditsForUsd, providerOf } from "../catalog.js";
import { compatChat } from "./openaiCompat.js";
import { ollamaChat } from "./ollama.js";
import { FUSION_BUDGETS } from "../domain/fusion.js";
import type { Mode } from "../domain/routing.js";
import { recordFusionStep, recordFusionTrace } from "./FusionLedger.js";
import { modelHealth, recordModelHealth } from "./ModelHealth.js";
import { config } from "../../../shared/config.js";
import { validateToolInput } from "./ToolProposalValidation.js";

export const routingPorts: ModelRouterPorts = {
  allowedModels,
  async projectMode(projectId) {
    if (!projectId) return "standard";
    return (await one<{ model_mode: Mode }>(
      `select model_mode from projects where id = $1`, [projectId],
    ))?.model_mode ?? "standard";
  },
  async posteriors(taskClass, models) {
    const rows = await q<{ model_id: string; alpha: number; beta: number; uses: number }>(
      `select model_id, alpha, beta, uses from router_stats where task_class = $1`, [taskClass],
    );
    const stored = new Map(rows.map(r => [r.model_id, { alpha: r.alpha, beta: r.beta, uses: r.uses }]));
    return new Map(models.map(m => [m.id, stored.get(m.id) ?? prior(m.tier)]));
  },
  async recordOutcome(taskClass, model, reward, usd = 0, weight = 1) {
    const r = Math.min(1, Math.max(0, reward)) * weight;
    const f = (1 - Math.min(1, Math.max(0, reward))) * weight;
    const p = prior(model.tier);
    await q(
      `insert into router_stats (task_class, model_id, alpha, beta, uses, usd) values ($1, $2, $3, $4, 1, $5)
       on conflict (task_class, model_id) do update set alpha = router_stats.alpha + $6, beta = router_stats.beta + $7,
         uses = router_stats.uses + 1, usd = router_stats.usd + $5`,
      [taskClass, model.id, p.alpha + r, p.beta + f, usd, r, f],
    );
  },
  async invoke(model, request) {
    if (model.provider === "anthropic") return anthropicChat(model.model, request);
    const provider = providerOf(model.provider);
    if (!provider?.endpoint) throw new ModelCallError(`Proveedor no configurado: ${model.provider}`, false);
    if (provider.kind === "ollama") return ollamaChat(provider.endpoint, model.model, model.context, request);
    return compatChat(provider.endpoint, model.model, request, model.reasoningEffort === true);
  },
  async charge(billing, role, model, usage) {
    const usd = costUsd(model, usage), credits = creditsForUsd(usd);
    await q(
      `insert into ai_usage (project_id, account_id, source, role, model, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, usd, credits)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [billing.projectId, billing.payerId, billing.source, role, model.id, usage.input, usage.output, usage.cacheRead, usage.cacheWrite, usd, credits],
    );
    if (credits) await q(`update accounts set credits = greatest(credits - $2, 0) where id = $1`, [billing.payerId, credits]);
    return { usd, credits };
  },
  async logDecision(projectId, role, pick, log) {
    await q(
      `insert into router_decisions (project_id, turn_id, task_id, role, task_class, model_id, reason, candidates) values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [projectId, log?.turnId ?? null, log?.taskId ?? null, role, pick.taskClass, pick.model.id, pick.reason, JSON.stringify(pick.candidates)],
    );
  },
  requestKey: value => createHash("sha256").update(value).digest("hex"),
  nextOperationId: () => randomUUID(),
  fusionBudget: effort => ({ ...FUSION_BUDGETS[effort], ...config.models.fusion[effort] }),
  recordFusionStep,
  recordFusionTrace,
  modelHealth,
  recordModelHealth,
  validateToolInput,
};
