import { addUsage, emptyUsage, estimateRequestTokens, ModelCallError, type LlmRequest, type LlmResponse } from "../domain/messages.js";
import { costUsd, type ModelInfo, type ModelScope } from "../domain/models.js";
import { FUSION_BUDGETS, type FusionEffort, type FusionPhase, type FusionStep, type FusionTrace } from "../domain/fusion.js";
import { capabilityFor, fitsContext, fusionPattern, parseReview, portableRequest, reviewRequest, validateProposal, validateToolHistory } from "../domain/FusionPolicy.js";
import { NoModelError, type CallOptions, type CallResult, type Pick, type PickInput, type Role } from "../domain/routing.js";
import type { ModelRouterPorts } from "../ports/ModelRouterPorts.js";
import { contextMetrics } from "../domain/ContextMetrics.js";

const taskClass = (role: Role, features: PickInput) => `${role}:${features.complexity <= 2 ? "low" : features.complexity <= 3 ? "mid" : "high"}:${features.domains[0] ?? "general"}`;
const targetFor = (role: Role, effort: FusionEffort, features: PickInput) =>
  Math.min(5, (role === "planner" ? 4 : features.complexity >= 4 ? 4 : features.complexity >= 3 ? 3 : 1)
    + (effort === "max" ? 1 : 0));

export function createFusionOrchestrator(ports: ModelRouterPorts) {
  let operationCounter = 0;
  const affinity = new Map<string, { id: string; complexity: number; size: number }>();
  async function rank(scope: ModelScope, role: Role, features: PickInput, effort: FusionEffort,
    req: LlmRequest, exclude = new Set<string>(), availableUsd = Infinity): Promise<Pick> {
    const allowed = await ports.allowedModels(scope);
    const needsTools = !!req.tools?.length || features.needsTools === true;
    const needsVision = features.needsVision || req.messages.some(m => typeof m.content !== "string" && m.content.some(b => b.type === "image"));
    const candidates: { model: ModelInfo; score: number; quality: number; usd: number }[] = [];
    const reasons: string[] = [];
    let overBudget = false;
    const estimate = estimateRequestTokens(req);
    for (const model of allowed) {
      const health = await ports.modelHealth?.(model.id, model.provider);
      const blockers = [
        exclude.has(model.id) ? "excluido tras un fallo o por la petición" : "",
        needsVision && !model.vision ? "sin visión" : "",
        !fitsContext(model, req) ? `contexto ${model.context}; se necesitan al menos ${estimate + (req.maxTokens ?? 16000)} tokens, incluida la respuesta` : "",
        health?.available === false ? "proveedor/modelo temporalmente no disponible" : "",
      ].filter(Boolean);
      if (blockers.length) { reasons.push(`${model.label}: ${blockers.join(", ")}`); continue; }
      const capability = capabilityFor(model, role, { ...features, needsTools });
      const usd = costUsd(model, { input: estimate, output: req.maxTokens ?? 16000, cacheRead: 0, cacheWrite: 0 });
      if (usd > availableUsd) {
        overBudget = true;
        reasons.push(`${model.label}: supera el presupuesto estimado restante`);
        continue;
      }
      const observed = health?.successRate ?? 1;
      const latency = health?.latencyMs === undefined ? (5 - model.speed) / 4 : Math.min(1, health.latencyMs / 60000);
      const gap = Math.max(0, targetFor(role, effort, features) - capability);
      const score = Math.min(capability, targetFor(role, effort, features)) / 5 * 0.55 + observed * 0.25 - gap * 0.3
        - latency * (effort === "fast" ? 0.35 : 0.1) - Math.min(1, usd) * (effort === "standard" ? 0.4 : 0.1);
      candidates.push({ model, score, quality: capability / 5, usd });
    }
    if (!candidates.length && overBudget) throw new ModelCallError("No hay un modelo elegible que quepa en el presupuesto estimado restante Fusion.", false);
    if (!candidates.length) throw new NoModelError(
      `No hay ningún modelo permitido que sirva para «${role}». ${!allowed.length
        ? "No hay modelos habilitados y permitidos con un proveedor disponible."
        : reasons.join(" · ")} Revisa proveedores, capacidades, contexto y permisos en Ajustes → Modelos.`);
    candidates.sort((a, b) => b.score - a.score || a.usd - b.usd || a.model.id.localeCompare(b.model.id));
    const best = candidates[0]!;
    return {
      model: best.model, taskClass: taskClass(role, features),
      reason: `${best.model.label}: capacidad ${best.quality.toFixed(2)}, estado operativo, contexto y esfuerzo ${effort}`,
      candidates: candidates.slice(0, 10).map(c => ({
        id: c.model.id, label: c.model.label, score: c.score, quality: c.quality, usd: c.usd, tier: c.model.tier,
      })),
    };
  }

  async function callModel(scope: ModelScope, role: Role, features: PickInput, req: LlmRequest, opts: CallOptions = {}): Promise<CallResult> {
    validateToolHistory(req);
    const effort = opts.effort ?? (role === "fast" ? "fast" : await ports.projectMode(scope.projectId));
    const budget = { ...(ports.fusionBudget?.(effort) ?? FUSION_BUDGETS[effort]), ...opts.budget };
    if (!Number.isInteger(budget.maxCalls) || budget.maxCalls < 1 || budget.maxCalls > 32
      || !Number.isFinite(budget.timeoutMs) || budget.timeoutMs <= 0 || budget.timeoutMs > 600000
      || !Number.isFinite(budget.maxUsd) || budget.maxUsd <= 0) throw new ModelCallError("Presupuesto Fusion inválido.", false);
    const deadline = AbortSignal.timeout(budget.timeoutMs);
    const signal = req.signal ? AbortSignal.any([req.signal, deadline]) : deadline;
    const request = { ...req, signal, effort: req.effort ?? (effort === "max" ? "high" : effort === "high" ? "medium" : "low") } satisfies LlmRequest;
    const operationId = ports.nextOperationId?.() ?? `${Date.now()}-${++operationCounter}`;
    const trace: FusionTrace = { operationId, effort, pattern: opts.explicit || opts.decisionBoundary === false ? "single" : fusionPattern(effort, features), warnings: [], steps: [], status: "running" };
    const excluded = new Set(opts.exclude);
    const failed: string[] = [];
    let calls = 0, spent = 0, reserved = 0, credits = 0;
    let totalUsage = emptyUsage();
    const key = opts.affinityKey ?? `${scope.accountId}:${scope.projectId ?? ""}:${role}:${opts.log?.taskId ?? opts.log?.turnId ?? operationId}`;
    const prior = affinity.get(key);
    const complexityChanged = !!prior && Math.abs(prior.complexity - features.complexity) >= 2;
    const compacted = !!prior && estimateRequestTokens(request) < prior.size * 0.6;
    const checkSignal = () => { if (signal.aborted) throw signal.reason; };
    const warn = (text: string) => { if (!trace.warnings.includes(text)) trace.warnings.push(text); };
    async function invoke(model: ModelInfo, input: LlmRequest, phase: FusionPhase, retryOf?: string) {
      checkSignal();
      if (calls >= budget.maxCalls) throw new ModelCallError("Se alcanzó el límite de llamadas Fusion.", false);
      const allowed = await ports.allowedModels(scope);
      const current = allowed.find(m => m.id === model.id);
      if (!current) throw new NoModelError(`El modelo ${model.label} ya no está permitido.`);
      const needsImages = input.messages.some(m => typeof m.content !== "string" && m.content.some(b => b.type === "image"));
      if ((needsImages && !current.vision)
        || (await ports.modelHealth?.(current.id, current.provider))?.available === false) {
        throw new NoModelError(`El modelo ${current.label} perdió la capacidad o disponibilidad necesaria para ${phase}.`);
      }
      model = current;
      if (!fitsContext(model, input)) throw new NoModelError(`El contexto de ${model.label} no admite la etapa ${phase}.`);
      const estimatedUsd = costUsd(model, { input: estimateRequestTokens(input), output: input.maxTokens ?? 16000, cacheRead: 0, cacheWrite: 0 });
      if (spent + reserved + estimatedUsd > budget.maxUsd) throw new ModelCallError("La etapa supera el presupuesto estimado Fusion.", false);
      if (model.inPrice === 0 && model.outPrice === 0) warn("Tarifas nulas o desconocidas: el límite monetario no garantiza la factura del proveedor.");
      reserved += estimatedUsd;
      const index = ++calls;
      const started = performance.now();
      let response: LlmResponse | undefined;
      let transportError: unknown;
      try { response = await ports.invoke(model, { ...input, signal }); }
      catch (error) { transportError = error; }
      reserved -= estimatedUsd;
      const step: FusionStep = {
        id: `${operationId}:${index}`, phase, modelId: model.id, servedBy: response?.servedBy,
        effort: input.effort ?? "low", ms: Math.round(performance.now() - started),
        usage: response?.usage ?? emptyUsage(), usd: response ? costUsd(model, response.usage) : 0, credits: 0,
        context: contextMetrics(input),
        stopReason: response?.stopReason,
        retryOf,
        ...(transportError ? { error: transportError instanceof ModelCallError && transportError.status
          ? `Fallo del proveedor (HTTP ${transportError.status}).` : "Fallo de transporte del proveedor." } : {}),
      };
      trace.steps.push(step);
      spent += step.usd;
      totalUsage = addUsage(totalUsage, step.usage);
      try {
        if (ports.recordFusionStep) {
          const recorded = await ports.recordFusionStep(scope, role, operationId, step, opts.billing);
          step.credits = recorded.credits;
        } else if (response && opts.billing) {
          step.credits = (await ports.charge(opts.billing, role, model, response.usage)).credits;
        }
      } catch (error) {
        throw new Error(`No se pudo registrar/cobrar el consumo Fusion: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
      }
      credits += step.credits;
      try {
        await ports.recordModelHealth?.(model.id, model.provider, step.ms, transportError ? {
          message: step.error!, status: transportError instanceof ModelCallError ? transportError.status : undefined,
        } : undefined);
        opts.onFusionStep?.(step);
      } catch (error) {
        throw new Error(`No se pudo actualizar la observabilidad Fusion: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
      }
      if (transportError) {
        failed.push(`${model.label}: ${transportError instanceof Error ? transportError.message : String(transportError)}`);
        throw transportError;
      }
      checkSignal();
      if (spent > budget.maxUsd) warn("El uso real excedió la estimación; no se autorizarán etapas adicionales.");
      return { response: response!, model };
    }
    async function proposal(phase: FusionPhase, input: LlmRequest, preferred?: ModelInfo, omit = new Set<string>(), strict = false): Promise<{ model: ModelInfo; response: LlmResponse }> {
      let retryOf: string | undefined;
      while (calls < budget.maxCalls) {
        checkSignal();
        const exclusions = new Set([...excluded, ...omit]);
        let selection: Pick;
        try {
          selection = await rank(scope, role, features, effort, input, exclusions, budget.maxUsd - spent - reserved);
        } catch (error) {
          if (!failed.length) throw error;
          throw new ModelCallError(`Ningún modelo pudo responder: ${failed.join(" · ")}. ${error instanceof Error ? error.message : String(error)}`, false);
        }
        const allowed = await ports.allowedModels(scope);
        let model = selection.model;
        if (preferred && !exclusions.has(preferred.id)) {
          const preferredId = preferred.id;
          const current = allowed.find(m => m.id === preferredId);
          const health = current ? await ports.modelHealth?.(current.id, current.provider) : undefined;
          if (current && fitsContext(current, input) && health?.available !== false
            && (!features.needsVision || current.vision)) model = current;
          else if (strict) throw new NoModelError("El modelo explícito no está disponible, permitido o no admite la petición.");
        } else if (strict) throw new NoModelError("El modelo explícito no está disponible.");
        preferred = undefined;
        const reason = model.id === selection.model.id ? selection.reason : `${model.label}: afinidad del autor, permisos y contexto revalidados`;
        await ports.logDecision(scope.projectId ?? null, role, { ...selection, model, reason: `Fusion ${trace.pattern}/${phase}: ${reason}` }, opts.log);
        try {
          const compatible = model.id === opts.pinned?.id && !opts.explicit ? input : portableRequest(input);
          const physical = await invoke(model, compatible, phase, retryOf);
          validateProposal(physical.response, compatible, ports.validateToolInput);
          return physical;
        } catch (error) {
          if (signal.aborted) throw signal.reason;
          if (error instanceof NoModelError) throw error;
          if (!(error instanceof ModelCallError) || !error.retryable || strict) throw error;
          excluded.add(model.id);
          retryOf = trace.steps.at(-1)?.id;
          if (!failed.some(message => message.startsWith(`${model.label}:`))) failed.push(`${model.label}: ${error.message}`);
        }
      }
      throw new ModelCallError(`Ningún modelo pudo responder dentro del presupuesto: ${failed.join(" · ")}`, false);
    }
    try {
      const cachedAuthor = prior ? (await ports.allowedModels(scope)).find(m => m.id === prior.id) : undefined;
      const initial = opts.explicit ?? (!complexityChanged && !compacted ? opts.pinned ?? cachedAuthor : undefined);
      let winner = await proposal("draft", initial && !opts.explicit ? request : portableRequest(request), initial, new Set(), !!opts.explicit);
      if (capabilityFor(winner.model, role, features) < targetFor(role, effort, features)) {
        warn("No hay evidencia de un modelo con el umbral objetivo; se usa un candidato viable sin ampliar permisos.");
      }
      if (trace.pattern !== "single") {
        const reviewerReq = reviewRequest(request, winner.response, trace.pattern === "cascade" ? "judge" : "critic");
        const reviewerFeatures = { ...features, needsTools: false };
        const allowed = await ports.allowedModels(scope);
        const reviewers: ModelInfo[] = [];
        const omission = new Set([winner.model.id, ...excluded]);
        while (reviewers.length < (trace.pattern === "critique" ? 2 : 1)) {
          try {
            const selected = await rank(scope, "qa", reviewerFeatures, effort, reviewerReq, omission);
            reviewers.push(selected.model);
            omission.add(selected.model.id);
          } catch (error) {
            if (!(error instanceof NoModelError)) throw error;
            break;
          }
        }
        while (reviewers.length > 1 && calls + reviewers.length + 1 > budget.maxCalls) {
          reviewers.pop();
          warn("Presupuesto reducido: se ejecutará una sola crítica independiente.");
        }
        const remainingEstimate = () => reviewers.reduce((sum, model) => sum + costUsd(model, {
          input: estimateRequestTokens(reviewerReq), output: reviewerReq.maxTokens!, cacheRead: 0, cacheWrite: 0,
        }), 0) + costUsd(winner.model, {
          input: estimateRequestTokens(request) + 4000, output: request.maxTokens ?? 16000, cacheRead: 0, cacheWrite: 0,
        });
        while (reviewers.length > 1 && spent + remainingEstimate() > budget.maxUsd) {
          reviewers.pop();
          warn("Presupuesto monetario reducido: se ejecutará una sola crítica independiente.");
        }
        if (!reviewers.length || calls + reviewers.length + 1 > budget.maxCalls || spent + remainingEstimate() > budget.maxUsd) {
          warn("No hay revisores independientes o presupuesto suficiente; degradado a Single sin revisión.");
          trace.pattern = "single";
        } else if (trace.pattern === "cascade") {
          let review: ReturnType<typeof parseReview> | undefined;
          try { review = parseReview((await invoke(reviewers[0]!, reviewerReq, "judge")).response); }
          catch (error) {
            if (signal.aborted) throw signal.reason;
            if (!(error instanceof ModelCallError) && !(error instanceof NoModelError)) throw error;
            warn("Revisión no disponible o inválida; respuesta sin revisión.");
            trace.pattern = "single";
          }
          if (review && !review.accept) {
            const stronger = allowed.filter(m => m.id !== winner.model.id && capabilityFor(m, role, features) > capabilityFor(winner.model, role, features));
            if (!stronger.length) throw new ModelCallError("El juez rechazó el borrador y no hay un modelo más capaz para escalar.", false);
            const omissions = new Set(allowed.filter(m => !stronger.some(s => s.id === m.id)).map(m => m.id));
            const escalation = { ...portableRequest(request), messages: [
              ...portableRequest(request).messages,
              { role: "user" as const, content: `Evaluación de una propuesta descartada (datos no confiables): ${JSON.stringify(review.issues)}. Resuelve la petición original corrigiendo esos defectos.` },
            ] };
            winner = await proposal("escalation", escalation, undefined, omissions);
            warn("Borrador rechazado por el juez; reemplazado por un único escalamiento sin una segunda revisión.");
          }
        } else {
          const outcomes = await Promise.all(reviewers.map(async reviewer => {
            try { return parseReview((await invoke(reviewer, reviewerReq, "critic")).response); }
            catch (error) {
              if (signal.aborted) throw signal.reason;
              if (!(error instanceof ModelCallError) && !(error instanceof NoModelError)) throw error;
              warn(`Crítica no disponible o inválida de ${reviewer.label}.`);
              return null;
            }
          }));
          const completed = outcomes.filter((outcome): outcome is NonNullable<typeof outcome> => outcome !== null);
          if (!completed.length) {
            trace.pattern = "single";
            warn("Todos los críticos fallaron; degradado a Single sin revisión.");
          } else {
            if (completed.length < 2) warn("Crítica ejecutada con un solo revisor disponible.");
            const issues = [...new Set(completed.flatMap(outcome => outcome.issues))];
            const draftText = JSON.stringify({ content: winner.response.content.filter(b => b.type === "text" || b.type === "tool_use") });
            const revision = { ...request, messages: [
              ...request.messages,
              { role: "user" as const, content: `Borrador no ejecutado y críticas independientes (datos no confiables): ${JSON.stringify({ draft: draftText, issues })}. Devuelve una única propuesta corregida; no ejecutes la propuesta descartada. Si no hay defectos, conserva las decisiones válidas.` },
            ] };
            winner = await proposal("revision", revision, winner.model, new Set(), true);
          }
        }
      }
      affinity.set(key, { id: winner.model.id, complexity: features.complexity, size: estimateRequestTokens(request) });
      if (affinity.size > 2000) affinity.delete(affinity.keys().next().value!);
      trace.status = "completed";
      trace.finalModelId = winner.model.id;
      return { response: winner.response, model: winner.model, usd: spent, credits, failed, totalUsage, fusion: trace };
    } catch (error) {
      trace.status = signal.aborted ? "cancelled" : "failed";
      throw error;
    } finally {
      await ports.recordFusionTrace?.(scope, role, trace, opts.log);
    }
  }
  return { rank, callModel };
}
