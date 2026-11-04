import { meanOf, sampleBeta } from "../domain/bandit.js";
import { costUsd, type ModelInfo, type ModelScope } from "../domain/models.js";
import { ModelCallError, textOf, type Effort, type LlmRequest } from "../domain/messages.js";
import { NoModelError, type Role, type Mode, type Intent, type Domain, type Features, type AnalysisContext, type PickInput, type Candidate, type Pick, type CallOptions, type CallResult } from "../domain/routing.js";
import type { ModelRouterPorts } from "../ports/ModelRouterPorts.js";

// --- Roles ------------------------------------------------------------------------------------

interface RoleProfile {
  /** Minimum tier before complexity adjustments. */
  minTier: number;
  effort: Effort;
  needsTools: boolean;
  /** Rough tokens per task, for cost estimates when comparing models. */
  estIn: number;
  estOut: number;
}

/** Output budget of one step. Writers keep the full 16k (a cut-off write_file is lost); short roles get less. */
export const maxTokensFor = (role: Role) => Math.min(16_000, Math.max(6_000, ROLES[role].estOut * 4));

export const ROLES: Record<Role, RoleProfile> = {
  router: { minTier: 1, effort: "low", needsTools: false, estIn: 1_500, estOut: 200 },
  summarizer: { minTier: 1, effort: "low", needsTools: false, estIn: 6_000, estOut: 600 },
  planner: { minTier: 4, effort: "high", needsTools: true, estIn: 25_000, estOut: 3_000 },
  data: { minTier: 3, effort: "medium", needsTools: true, estIn: 30_000, estOut: 3_000 },
  backend: { minTier: 3, effort: "medium", needsTools: true, estIn: 60_000, estOut: 8_000 },
  ui: { minTier: 3, effort: "medium", needsTools: true, estIn: 60_000, estOut: 12_000 },
  qa: { minTier: 3, effort: "medium", needsTools: true, estIn: 50_000, estOut: 3_000 },
  fast: { minTier: 2, effort: "medium", needsTools: true, estIn: 40_000, estOut: 5_000 },
  chat: { minTier: 1, effort: "low", needsTools: true, estIn: 25_000, estOut: 1_500 },
  app: { minTier: 1, effort: "low", needsTools: false, estIn: 2_000, estOut: 500 },
};

/** How much cost weighs against quality, per project mode. */
const LAMBDA: Record<Mode, number> = { saving: 0.75, balanced: 0.35, quality: 0.08 };

// --- Request analysis ------------------------------------------------------------------------------

const KEYWORDS: Record<Domain, RegExp> = {
  ui: /\b(dise[ñn]o|color(es)?|estilo|bot[oó]n|p[aá]gina|pantalla|layout|css|responsive|fuente|tipograf|logo|men[uú]|tarjeta|modal|tema|oscuro|animaci|ui|ux|design|style|button|page|screen|font|theme|dark mode|landing|portada|formulario|form)\w*/i,
  data: /\b(tabla|base de datos|campo|columna|sql|registro|migraci|esquema|datos|importar|csv|table|database|column|schema|record|filtr|orden|b[uú]squeda|search)\w*/i,
  auth: /\b(login|inicio de sesi[oó]n|iniciar sesi[oó]n|registr|contrase[ñn]a|usuario|rol(es)?|admin|permiso|cuenta|auth|sign ?in|sign ?up|password|role|account)\w*/i,
  payments: /\b(pago|cobr|stripe|suscripci|checkout|precio|factur|carrito|payment|subscription|price|invoice|cart)\w*/i,
  email: /\b(correo|e-?mail|notificar|notificaci|enviar un mensaje|newsletter)\w*/i,
  jobs: /\b(cada (d[ií]a|semana|hora|lunes|mes)|programad|recordatorio|cron|diari|semanal|todas las ma[ñn]anas|every (day|week|hour)|schedul|reminder|daily|weekly)\w*/i,
  integrations: /\b(api|integraci|webhook|whatsapp|slack|google|calendar|openai|hubspot|shopify|twilio|clave de|token|integration)\w*/i,
  ai: /\b(ia|inteligencia artificial|chatbot|asistente|gpt|claude|resum|clasific|embedding|llm|agente|ai assistant|summar)\w*/i,
  realtime: /\b(tiempo real|en vivo|colaborativ|presencia|chat en vivo|realtime|real-time|live)\w*/i,
  files: /\b(archivo|subir|adjunt|imagen|foto|pdf|upload|file|image|photo)\w*/i,
};

const BUG = /\b(error|falla|fallo|no funciona|no carga|bug|roto|rompi|arregl|pantalla en blanco|500|crash|excepci|fix|broken|doesn'?t work)\w*/i;
const QUESTION = /^(¿|qu[eé]|c[oó]mo|por qu[eé]|cu[aá]l|d[oó]nde|cu[aá]ndo|puedes explicar|what|how|why|which|where|can you explain)\b/i;
const IMPERATIVE = /\b(haz|crea|agrega|añade|cambia|quita|pon|arregla|construye|implementa|make|create|add|change|remove|build|fix|implement)\b/i;
const NEW_APP = /\b(crea(r)? (una|la) (app|aplicaci[oó]n|plataforma|web|tienda|sistema)|construye (una|la)|haz (una|la) (app|aplicaci[oó]n|web)|build (an|a|the) (app|platform|site))/i;

/** Fast, free analysis. Returns null when it can't tell (then the LLM classifier decides). */
export function analyzeHeuristic(text: string, ctx: AnalysisContext): Features | null {
  const t = text.trim();
  const domains = (Object.keys(KEYWORDS) as Domain[]).filter((d) => KEYWORDS[d].test(t));
  const isQuestion = (QUESTION.test(t) || t.endsWith("?")) && !IMPERATIVE.test(t);
  let intent: Intent;
  if (isQuestion) intent = "question";
  else if (NEW_APP.test(t) || ctx.fileCount <= 4) intent = "new_app";
  else if (BUG.test(t)) intent = "fix";
  else if (domains.length === 1 && domains[0] === "ui" && t.length < 300) intent = "style";
  else if (domains.length === 1 && domains[0] === "data") intent = "data";
  else intent = "feature";

  let complexity = t.length < 80 ? 1 : t.length < 250 ? 2 : t.length < 700 ? 3 : 4;
  if (domains.length >= 3) complexity += 1;
  if (domains.length >= 5) complexity += 1;
  if (intent === "new_app") complexity = Math.max(complexity, 3);
  if (intent === "question" || intent === "style") complexity = Math.min(complexity, 2);
  if (ctx.targeted) complexity = Math.min(complexity, 2);
  complexity = Math.min(5, Math.max(1, complexity));

  // Long requests with no recognisable domain are where keyword rules go wrong.
  const ambiguous = !domains.length && t.length > 120 && intent === "feature";
  if (ambiguous) return null;
  return { intent, complexity, domains, needsVision: ctx.images > 0, targeted: ctx.targeted, source: "heuristic" };
}

export const useFastPath = (f: Features) =>
  f.intent === "question" || f.intent === "style" || f.targeted || f.complexity <= 2 || (f.domains.length <= 1 && f.complexity <= 3 && f.intent !== "new_app");

export const taskClassOf = (role: Role, f: PickInput) =>
  `${role}:${f.complexity <= 2 ? "low" : f.complexity <= 3 ? "mid" : "high"}:${f.domains[0] ?? "general"}`;

export function createModelRouter(ports: ModelRouterPorts) {
const { allowedModels, projectMode, posteriors, recordOutcome, invoke, charge, logDecision } = ports;
const analysisCache = new Map<string, Features>();

/**
 * Two layers: keyword heuristics (free), and only when they can't tell, a one-shot
 * classification by the cheapest allowed model. Results are cached by request hash.
 */
async function analyzeRequest(scope: ModelScope, text: string, ctx: AnalysisContext): Promise<Features> {
  const key = ports.requestKey(`${text}\0${ctx.images}\0${ctx.targeted}\0${ctx.fileCount > 4}`);
  const cached = analysisCache.get(key);
  if (cached) return cached;
  let features = analyzeHeuristic(text, ctx);
  if (!features) {
    features = { intent: "feature", complexity: 3, domains: [], needsVision: ctx.images > 0, targeted: ctx.targeted, source: "llm" };
    try {
      const res = await callModel(scope, "router", { complexity: 1, domains: [], needsVision: false }, {
        system:
          'Classify an app-builder request. Reply with JSON only: {"intent":"new_app|feature|fix|style|data|question","complexity":1-5,"domains":[...]} where domains ⊆ ["ui","data","auth","payments","email","jobs","integrations","ai","realtime","files"]. complexity: 1 trivial tweak, 3 one feature across UI+backend, 5 a large multi-part system.',
        messages: [{ role: "user", content: text.slice(0, 4000) }],
        maxTokens: 300,
      });
      const json = JSON.parse(/\{[\s\S]*\}/.exec(textOf(res.response.content))?.[0] ?? "{}");
      features = {
        intent: (["new_app", "feature", "fix", "style", "data", "question"] as Intent[]).includes(json.intent) ? json.intent : "feature",
        complexity: Math.min(5, Math.max(1, Number(json.complexity) || 3)),
        domains: (Array.isArray(json.domains) ? json.domains : []).filter((d: string) => d in KEYWORDS),
        needsVision: ctx.images > 0,
        targeted: ctx.targeted,
        source: "llm",
      };
    } catch {
      // No classifier available: the conservative default above stands.
    }
  }
  analysisCache.set(key, features);
  if (analysisCache.size > 2000) analysisCache.delete(analysisCache.keys().next().value!);
  return features;
}

// --- Choosing a model --------------------------------------------------------------------------------

/**
 * score = quality (Thompson sample of the bandit) − λ(mode)·normalised cost − latency − tier gap.
 * Expensive models only explore once they have a few uses, so sampling noise alone never
 * picks a pricey model for cheap work.
 */
async function pick(scope: ModelScope, role: Role, f: PickInput, opts: { exclude?: Set<string>; rand?: () => number } = {}): Promise<Pick> {
  const profile = ROLES[role];
  const needsTools = f.needsTools ?? profile.needsTools;
  const mode = await projectMode(scope.projectId);
  const estIn = profile.estIn * (f.complexity >= 4 ? 1.6 : 1);
  const candidates = (await allowedModels(scope)).filter(
    (m) => !opts.exclude?.has(m.id) && (!needsTools || m.tools) && (!f.needsVision || m.vision) && m.context >= Math.min(estIn * 2, 128_000),
  );
  if (!candidates.length) {
    throw new NoModelError(
      `No hay ningún modelo permitido que sirva para «${role}»${f.needsVision ? " con imágenes" : ""}. Revisa la lista de modelos en Ajustes → Modelos.`,
    );
  }
  const taskClass = taskClassOf(role, f);
  const post = await posteriors(taskClass, candidates);
  const usd = new Map(candidates.map((m) => [m.id, costUsd(m, { input: estIn * 0.4, cacheRead: estIn * 0.6, cacheWrite: 0, output: profile.estOut })]));
  const maxUsd = Math.max(...usd.values(), 1e-9);
  const minUsd = Math.min(...usd.values());
  const required = Math.max(1, profile.minTier + (f.complexity >= 4 ? 1 : 0) - (mode === "saving" ? 1 : 0) + (mode === "quality" ? 1 : 0));
  const rand = opts.rand ?? Math.random;

  const scored: Candidate[] = candidates.map((m) => {
    const p = post.get(m.id)!;
    const cost = usd.get(m.id)!;
    // Limit exploration of models far pricier than the cheapest option until they have history.
    const quality = cost > minUsd * 4 + 0.001 && p.uses < 3 ? meanOf(p) : sampleBeta(p, rand);
    const gap = Math.max(0, required - m.tier) * 0.25;
    const latency = ((5 - m.speed) / 4) * 0.05;
    const score = quality - LAMBDA[mode] * (cost / maxUsd) - latency - gap;
    return { id: m.id, label: m.label, score, quality, usd: cost, tier: m.tier };
  });
  scored.sort((a, b) => b.score - a.score);
  const best = candidates.find((m) => m.id === scored[0]!.id)!;
  const top = scored[0]!;
  const reason = `${best.label} para ${role} (${taskClass}): calidad ${top.quality.toFixed(2)}, ~$${top.usd.toFixed(3)} por tarea, modo ${mode}`;
  return { model: best, taskClass, reason, candidates: scored.slice(0, 6) };
}

// --- Calling, with fallback and billing ---------------------------------------------------------------

/**
 * Calls the best model for the role; on a retryable failure (rate limit, overload,
 * timeout, refusal) records it and moves to the next best. Non-retryable errors (a bad
 * request) are raised, since another model would fail the same way.
 */
async function callModel(scope: ModelScope, role: Role, f: PickInput, req: LlmRequest, opts: CallOptions = {}): Promise<CallResult> {
  const exclude = new Set(opts.exclude ?? []);
  const failed: string[] = [];
  let next: ModelInfo | undefined = opts.pinned;
  for (let attempt = 0; attempt < 4; attempt++) {
    let model = next;
    if (!model) {
      const p = await pick(scope, role, f, { exclude });
      model = p.model;
      if (!opts.pinned || attempt > 0) await logDecision(scope.projectId ?? null, role, p, opts.log);
    }
    next = undefined;
    try {
      const response = await invoke(model, { ...req, effort: req.effort ?? ROLES[role].effort });
      const bill = opts.billing ? await charge(opts.billing, role, model, response.usage) : { usd: costUsd(model, response.usage), credits: 0 };
      return { response, model, usd: bill.usd, credits: bill.credits, failed };
    } catch (e) {
      if (req.signal?.aborted || (e as Error).name === "AbortError") throw e;
      const retryable = e instanceof ModelCallError ? e.retryable : true;
      // A provider error is a weak signal about the model, so it counts for a quarter.
      await recordOutcome(taskClassOf(role, f), model, 0, 0, 0.25).catch(() => {});
      failed.push(`${model.label}: ${(e as Error).message.slice(0, 160)}`);
      if (!retryable) throw e;
      exclude.add(model.id);
    }
  }
  throw new ModelCallError(`Ningún modelo pudo responder: ${failed.join(" · ")}`, false);
}

return { analyzeRequest, pick, callModel, invoke, charge, logDecision, recordOutcome };
}
