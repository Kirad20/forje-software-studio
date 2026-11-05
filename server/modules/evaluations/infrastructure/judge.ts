import { callModel, type Billing } from "../../model-management/router.js";
import type { ModelInfo, ModelScope } from "../../model-management/catalog.js";
import { textOf, type Block } from "../../model-management/types.js";
import { JUDGE_DIMENSIONS, type Judgement, type JudgeDimension } from "../domain/score.js";

/**
 * The design judge: a vision model scores screenshots of the finished app against a fixed
 * rubric. It is a measuring instrument with noise, so: the rubric is concrete (each point on
 * the scale says what it looks like), the output is strict JSON, and the report always shows
 * the spread over repeated runs next to the mean. Do not read a one-point difference on one
 * case as a signal.
 */

export const JUDGE_SYSTEM = `Eres un revisor de diseño de producto con criterio exigente. Te enseño capturas de una app web recién construida por un agente y lo que el dueño le pidió. Puntúa de 1 a 5 cada dimensión, mirando SOLO lo que se ve en las capturas:

- hierarchy: jerarquía visual. 1 = nada destaca, todo pesa igual; 3 = se entiende qué es lo principal pero hay ruido; 5 = el ojo recorre la pantalla en el orden correcto, un título claro y una acción primaria evidente.
- spacing: espaciado y alineación. 1 = elementos pegados, desalineados o desbordados; 3 = correcto pero irregular; 5 = ritmo constante, rejilla clara, márgenes generosos.
- color: color y contraste. 1 = texto ilegible o colores chocantes; 3 = legible pero genérico; 5 = paleta coherente con un acento, contraste cómodo en todas las superficies.
- typography: tipografía. 1 = una sola talla o fuentes por defecto sin cuidado; 3 = escala razonable; 5 = escala clara de 3–4 tallas, pesos bien usados, líneas cómodas de leer.
- states: estados y completitud. 1 = pantalla vacía, rota o con datos de relleno absurdos; 3 = funcional pero con huecos (listas vacías sin explicación, sin feedback); 5 = se ve terminada: contenido de ejemplo creíble, vacíos y errores cuidados.
- responsive: móvil. 1 = en móvil se desborda o es inusable; 3 = se adapta con fallos; 5 = pensada para el móvil, objetivos táctiles cómodos.
- copy: textos. 1 = lorem ipsum, genérico o en otro idioma; 3 = correcto pero impersonal; 5 = específico del negocio, tono adecuado, sin errores.
- fidelity: fidelidad a lo pedido. 1 = no se parece a lo que pidió; 3 = cubre lo básico; 5 = cubre lo pedido y se nota el criterio del producto.

Reglas: sé crítico y no regales puntos; un 5 es raro. Una captura de error, una página en blanco o un inicio de sesión sin más cuenta como muy mala en states y fidelity. Si hay capturas "con sesión", son la parte principal de la app.
Responde SOLO con un objeto JSON, sin texto alrededor ni bloques de código:
{"scores":{"hierarchy":n,"spacing":n,"color":n,"typography":n,"states":n,"responsive":n,"copy":n,"fidelity":n},"issues":["defecto concreto y visible, máximo 6, el más grave primero"]}`;

export interface JudgeInput {
  prompt: string;
  /** Captured pages, in the order they should be read. */
  shots: { label: string; media_type: string; data: string }[];
  /** A short excerpt of the visible text, to catch lorem ipsum and wrong language. */
  text: string;
}

/** Extracts and validates the judge's JSON; throws a readable error when it is not usable. */
export function parseJudgement(raw: string, model: string): Judgement {
  const json = /\{[\s\S]*\}/.exec(raw)?.[0];
  if (!json) throw new Error("el juez no devolvió JSON");
  let parsed: { scores?: Record<string, unknown>; issues?: unknown };
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("el JSON del juez no es válido");
  }
  const scores = {} as Record<JudgeDimension, number>;
  for (const d of JUDGE_DIMENSIONS) {
    const v = Number(parsed.scores?.[d]);
    if (!Number.isFinite(v)) throw new Error(`falta la dimensión ${d}`);
    scores[d] = Math.min(5, Math.max(1, Math.round(v * 2) / 2));
  }
  const overall = JUDGE_DIMENSIONS.reduce((a, d) => a + scores[d], 0) / JUDGE_DIMENSIONS.length;
  const issues = (Array.isArray(parsed.issues) ? parsed.issues : []).filter((i): i is string => typeof i === "string" && !!i.trim()).map((i) => i.trim().slice(0, 240)).slice(0, 6);
  return { scores, overall: Math.round(overall * 100) / 100, issues, model };
}

/**
 * Judges one app with a fixed model: a judge that changed from case to case would add its own
 * variance to every score. The billing charges the eval account, so the run's budget sees the
 * judge's cost too. Only an explicit user choice forbids provider fallback.
 */
export async function judgeDesign(scope: ModelScope, billing: Billing, model: ModelInfo, input: JudgeInput, signal: AbortSignal, explicit = false): Promise<{ judgement?: Judgement; error?: string; usd: number }> {
  const content: Block[] = [
    { type: "text", text: `Lo que pidió el dueño:\n${input.prompt}\n\nTexto visible (extracto):\n${input.text.slice(0, 1500) || "(vacío)"}\n\nCapturas, en orden:` },
  ];
  input.shots.slice(0, 6).forEach((s, i) => {
    content.push({ type: "text", text: `${i + 1}. ${s.label}` }, { type: "image", source: { type: "base64", media_type: s.media_type, data: s.data } });
  });
  // Two tries: the only failure worth retrying is a reply that is not the JSON we asked for.
  // The cost is returned either way, so the run's budget sees what the judge spent.
  let error = "";
  let usd = 0;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await callModel(
        scope,
        "qa",
        { complexity: 3, domains: ["ui"], needsVision: true, needsTools: false },
        { system: JUDGE_SYSTEM, messages: [{ role: "user", content }], maxTokens: 1200, signal },
        { billing, ...(explicit ? { explicit: model } : { pinned: model }), decisionBoundary: false },
      );
      usd += res.usd;
      try {
        return { judgement: parseJudgement(textOf(res.response.content), res.model.label), usd };
      } catch (e) {
        error = (e as Error).message;
      }
    } catch (e) {
      if (signal.aborted) throw e;
      return { error: (e as Error).message, usd };
    }
  }
  return { error, usd };
}

/** Cheapest model of at least tier 4 that can see images; failing that, the strongest one that can. */
export function defaultJudge(models: ModelInfo[]): ModelInfo | undefined {
  const seeing = models.filter((m) => m.vision);
  const strong = seeing.filter((m) => m.tier >= 4).sort((a, b) => a.inPrice + a.outPrice - (b.inPrice + b.outPrice));
  return strong[0] ?? [...seeing].sort((a, b) => b.tier - a.tier)[0];
}
