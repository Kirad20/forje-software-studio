import { EVAL_SET_VERSION, type EvalSize } from "./cases.js";

type FileMap = Record<string, string>;

/**
 * Scoring and reporting for evals. Everything here is pure: the runner measures, this turns
 * measurements into numbers, so the arithmetic can be tested without a model or a browser.
 *
 * The score is a blend of three objective checks (does it compile, does it type-check, does
 * the running app load clean) and design (an LLM judge with a fixed rubric plus a few static
 * signals). Each part is also reported on its own: the blend is for sorting, the parts are for
 * diagnosing.
 */

// --- Shapes ----------------------------------------------------------------------------------------

export const JUDGE_DIMENSIONS = ["hierarchy", "spacing", "color", "typography", "states", "responsive", "copy", "fidelity"] as const;
export type JudgeDimension = (typeof JUDGE_DIMENSIONS)[number];

export interface Judgement {
  /** 1 (poor) to 5 (professional) per rubric dimension. */
  scores: Record<JudgeDimension, number>;
  overall: number;
  issues: string[];
  model: string;
}

export interface DesignSignals {
  /** Colour literals (#hex, rgb(), hsl()) outside base.css: the manual says tokens only. */
  hardcodedColors: number;
  /** style={{ … }} props. */
  inlineStyles: number;
  /** <a href="/…"> to an internal route instead of <Link>. */
  internalAnchors: number;
  /** CSS custom properties defined in base.css. */
  tokens: number;
  darkTheme: boolean;
  pages: number;
  /** Pages without an <h1> or without useHead. */
  pagesWithoutH1: number;
  pagesWithoutHead: number;
}

export interface PreviewCheck {
  path: string;
  signedIn: boolean;
  viewport: "desktop" | "mobile";
  ok: boolean;
  status: number | null;
  consoleErrors: string[];
  failedRequests: string[];
  textChars: number;
  error?: string;
}

export interface CaseResult {
  caseId: string;
  size: EvalSize;
  repeat: number;
  status: "done" | "failed" | "aborted" | "over_budget";
  error?: string;
  durationMs: number;
  usd: number;
  turn: {
    fastPath: boolean | null;
    steps: number;
    toolErrors: number;
    /** Times the finish gate sent an agent back to fix something. */
    gateRounds: number;
    models: string[];
    replyChars: number;
    turnId: string | null;
  };
  checks: {
    compile: { ok: boolean; problems: number; first?: string };
    /** null when it did not compile: types are only checked on code that builds. */
    types: { ok: boolean; problems: number; first?: string } | null;
    preview: PreviewCheck[];
  };
  design: { signals: DesignSignals; judge: Judgement | { error: string } | null };
  score: ScoreParts;
}

export interface ScoreParts {
  /** 0–100. */
  total: number;
  compile: number;
  types: number;
  runtime: number;
  /** null when the judge did not run. */
  judge: number | null;
  hygiene: number;
}

// --- Static design signals ------------------------------------------------------------------------

const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch|oklab)\(/g;

export function designSignals(files: FileMap): DesignSignals {
  let hardcodedColors = 0;
  let inlineStyles = 0;
  let internalAnchors = 0;
  const pages = Object.keys(files).filter((f) => {
    const m = /^pages\/([^/]+)\.tsx$/.exec(f);
    return !!m && !/\.(module|example)$/.test(m[1]!) && (m[1] === "_index" || !m[1]!.startsWith("_"));
  });
  for (const [path, content] of Object.entries(files)) {
    if (/\.example\.tsx$/.test(path) || path.startsWith("static/")) continue;
    const isStyle = path.endsWith(".css");
    const isCode = /\.(tsx|ts)$/.test(path);
    if ((isStyle || isCode) && path !== "base.css") {
      // Fallbacks inside var(--token, #fff) and comments are not decisions; strip them first.
      const bare = content.replace(/\/\*[\s\S]*?\*\//g, "").replace(/var\(--[\w-]+\s*,[^)]*\)/g, "var(--x)");
      hardcodedColors += bare.match(COLOR_LITERAL)?.length ?? 0;
    }
    if (isCode) {
      inlineStyles += content.match(/style=\{\{/g)?.length ?? 0;
      internalAnchors += content.match(/<a\s[^>]*href=["']\/(?!\/)/g)?.length ?? 0;
    }
  }
  const base = files["base.css"] ?? "";
  return {
    hardcodedColors,
    inlineStyles,
    internalAnchors,
    tokens: new Set(base.match(/--[\w-]+(?=\s*:)/g) ?? []).size,
    darkTheme: /prefers-color-scheme:\s*dark|\[data-theme=["']?dark/.test(base),
    pages: pages.length,
    pagesWithoutH1: pages.filter((p) => !/<h1[\s>]/.test(files[p] ?? "")).length,
    pagesWithoutHead: pages.filter((p) => !/useHead\s*\(/.test(files[p] ?? "")).length,
  };
}

/** 0–1: how well the code follows the manual's design rules. Static, so it cannot judge taste. */
export function hygieneScore(s: DesignSignals): number {
  let v = 1;
  if (!s.darkTheme) v -= 0.25;
  if (s.tokens < 8) v -= 0.25;
  v -= Math.min(0.25, s.hardcodedColors * 0.01);
  v -= Math.min(0.1, s.inlineStyles * 0.02);
  v -= Math.min(0.1, s.internalAnchors * 0.05);
  if (s.pages) v -= 0.05 * (s.pagesWithoutH1 / s.pages) + 0.05 * (s.pagesWithoutHead / s.pages);
  return clamp01(v);
}

// --- Score ------------------------------------------------------------------------------------------

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const round = (n: number, digits = 1) => Math.round(n * 10 ** digits) / 10 ** digits;
export const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
export const stdev = (xs: number[]) => {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
};

/** Share of checked pages that load without errors; 0 when nothing could be opened. */
export function runtimeScore(checks: PreviewCheck[]): number {
  if (!checks.length) return 0;
  return checks.filter((c) => c.ok).length / checks.length;
}

/** The judge's mean over the rubric, mapped from 1–5 to 0–1. */
export const judgeScore = (j: Judgement) => clamp01((j.overall - 1) / 4);

/** Weights of the blend. When the judge did not run, its weight is shared out, not counted as zero. */
export const WEIGHTS = { compile: 0.25, types: 0.15, runtime: 0.25, judge: 0.25, hygiene: 0.1 };

export function scoreCase(r: Pick<CaseResult, "checks" | "design">): ScoreParts {
  const compile = r.checks.compile.ok ? 1 : 0;
  const types = r.checks.types?.ok ? 1 : 0;
  const runtime = compile ? runtimeScore(r.checks.preview) : 0;
  const judge = r.design.judge && !("error" in r.design.judge) ? judgeScore(r.design.judge) : null;
  const hygiene = hygieneScore(r.design.signals);
  const parts: [number, number | null][] = [
    [WEIGHTS.compile, compile],
    [WEIGHTS.types, types],
    [WEIGHTS.runtime, runtime],
    [WEIGHTS.judge, judge],
    [WEIGHTS.hygiene, hygiene],
  ];
  const used = parts.filter(([, v]) => v !== null) as [number, number][];
  const total = used.reduce((a, [w, v]) => a + w * v, 0) / used.reduce((a, [w]) => a + w, 0);
  return { total: round(total * 100), compile, types, runtime: round(runtime, 2), judge: judge === null ? null : round(judge, 2), hygiene: round(hygiene, 2) };
}

/** An objective pass: it builds, type-checks and every page loads clean. Design is not part of it. */
export const passed = (r: CaseResult) => r.status === "done" && r.checks.compile.ok && !!r.checks.types?.ok && r.checks.preview.length > 0 && r.checks.preview.every((c) => c.ok);

// --- Summary ---------------------------------------------------------------------------------------

export interface Aggregate {
  runs: number;
  /** Fraction of runs that passed the objective checks. */
  passRate: number;
  score: { mean: number; min: number; max: number; stdev: number };
  judge: number | null;
  usd: number;
  meanUsd: number;
  meanSeconds: number;
  meanSteps: number;
  gateRounds: number;
  toolErrors: number;
}

export function aggregate(rs: CaseResult[]): Aggregate {
  const totals = rs.map((r) => r.score.total);
  const judged = rs.map((r) => r.score.judge).filter((j): j is number => j !== null);
  return {
    runs: rs.length,
    passRate: rs.length ? round(rs.filter(passed).length / rs.length, 2) : 0,
    score: { mean: round(mean(totals)), min: round(Math.min(...totals, 100)), max: round(Math.max(...totals, 0)), stdev: round(stdev(totals)) },
    judge: judged.length ? round(mean(judged), 2) : null,
    usd: round(rs.reduce((a, r) => a + r.usd, 0), 4),
    meanUsd: round(mean(rs.map((r) => r.usd)), 4),
    meanSeconds: round(mean(rs.map((r) => r.durationMs / 1000))),
    meanSteps: round(mean(rs.map((r) => r.turn.steps))),
    gateRounds: rs.reduce((a, r) => a + r.turn.gateRounds, 0),
    toolErrors: rs.reduce((a, r) => a + r.turn.toolErrors, 0),
  };
}

export interface Summary {
  overall: Aggregate;
  bySize: Partial<Record<EvalSize, Aggregate>>;
  byCase: Record<string, Aggregate>;
}

/** Runs that finished, pass or fail. Ones cut short by a cancel or the budget say nothing about quality. */
export const counted = (rs: CaseResult[]) => rs.filter((r) => r.status === "done" || r.status === "failed");

export function summarize(all: CaseResult[]): Summary {
  const rs = counted(all);
  const group = <K extends string>(key: (r: CaseResult) => K) => {
    const m = new Map<K, CaseResult[]>();
    for (const r of rs) m.set(key(r), [...(m.get(key(r)) ?? []), r]);
    return m;
  };
  return {
    overall: aggregate(rs),
    bySize: Object.fromEntries([...group((r) => r.size)].map(([k, v]) => [k, aggregate(v)])),
    byCase: Object.fromEntries([...group((r) => r.caseId)].map(([k, v]) => [k, aggregate(v)])),
  };
}

// --- Report ----------------------------------------------------------------------------------------

export interface RunView {
  id: string;
  status: string;
  createdAt: string;
  finishedAt: string | null;
  budgetUsd: number;
  spentUsd: number;
  error: string | null;
  config: { cases: string[]; repeats: number; models: string[] | null; judge: boolean; judgeModel?: string | null };
  results: CaseResult[];
}

const pct = (n: number) => `${Math.round(n * 100)}%`;
const usd = (n: number) => `$${n.toFixed(n < 0.1 ? 4 : 2)}`;

/** A short text report an admin can paste back into a conversation. */
export function renderReport(run: RunView, meta: { version: string }): string {
  const sum = summarize(run.results);
  const o = sum.overall;
  const lines = [
    `# Informe de evals ${run.id}`,
    "",
    `- Conjunto de casos: v${EVAL_SET_VERSION} · Forja ${meta.version}`,
    `- Estado: ${run.status}${run.error ? ` (${run.error})` : ""} · creado ${run.createdAt}${run.finishedAt ? ` · terminó ${run.finishedAt}` : ""}`,
    `- Configuración: ${run.config.cases.length} casos × ${run.config.repeats} repeticiones · modelos: ${run.config.models?.join(", ") ?? "enrutado automático"} · juez de diseño: ${run.config.judge ? (run.config.judgeModel ?? "automático") : "desactivado"}`,
    `- Gasto: ${usd(run.spentUsd)} de ${usd(run.budgetUsd)}${run.results.length > counted(run.results).length ? ` · ${run.results.length - counted(run.results).length} ejecuciones sin terminar (cancelación o presupuesto), no cuentan en las medias` : ""}`,
    "",
    "## Resultado global",
    "",
    `Puntuación media **${o.score.mean}**/100 (mín ${o.score.min}, máx ${o.score.max}, σ ${o.score.stdev}) · pasan las comprobaciones objetivas ${pct(o.passRate)} · juez ${o.judge === null ? "—" : `${o.judge}`} · ${usd(o.meanUsd)} y ${o.meanSeconds} s por ejecución · ${o.meanSteps} pasos de media · ${o.gateRounds} rondas de la puerta de salida · ${o.toolErrors} errores de herramientas`,
    "",
    "| Tamaño | Ejecuciones | Pasan | Puntuación | σ | Juez | $/ejec. | s/ejec. |",
    "|---|---|---|---|---|---|---|---|",
    ...(["small", "medium", "large"] as const)
      .filter((s) => sum.bySize[s])
      .map((s) => {
        const a = sum.bySize[s]!;
        return `| ${s} | ${a.runs} | ${pct(a.passRate)} | ${a.score.mean} | ${a.score.stdev} | ${a.judge ?? "—"} | ${usd(a.meanUsd)} | ${a.meanSeconds} |`;
      }),
    "",
    "## Por caso",
    "",
    "| Caso | Ejec. | Pasan | Puntuación (mín–máx) | Compila | Tipos | Runtime | Juez | Puerta | $ |",
    "|---|---|---|---|---|---|---|---|---|---|",
    ...Object.entries(sum.byCase).map(([id, a]) => {
      const rs = counted(run.results).filter((r) => r.caseId === id);
      const m = (f: (r: CaseResult) => number | null) => {
        const xs = rs.map(f).filter((x): x is number => x !== null);
        return xs.length ? round(mean(xs), 2) : "—";
      };
      return `| ${id} | ${a.runs} | ${pct(a.passRate)} | ${a.score.mean} (${a.score.min}–${a.score.max}) | ${m((r) => r.score.compile)} | ${m((r) => r.score.types)} | ${m((r) => r.score.runtime)} | ${m((r) => r.score.judge)} | ${a.gateRounds} | ${usd(a.usd)} |`;
    }),
  ];

  const problems = counted(run.results).filter((r) => r.status !== "done" || !passed(r));
  if (problems.length) {
    lines.push("", "## Ejecuciones con problemas", "");
    for (const r of problems) {
      const why = [
        r.status !== "done" ? `estado ${r.status}${r.error ? `: ${r.error}` : ""}` : "",
        !r.checks.compile.ok ? `no compila (${r.checks.compile.problems}): ${r.checks.compile.first ?? ""}` : "",
        r.checks.types && !r.checks.types.ok ? `tipos (${r.checks.types.problems}): ${r.checks.types.first ?? ""}` : "",
        ...r.checks.preview.filter((c) => !c.ok).map((c) => `${c.signedIn ? "con sesión " : ""}${c.viewport} ${c.path}: ${c.error ?? [...c.consoleErrors, ...c.failedRequests][0] ?? "sin contenido"}`),
      ].filter(Boolean);
      lines.push(`- **${r.caseId}** #${r.repeat} (${r.score.total}) — ${why.join(" · ") || "sin detalle"}`);
    }
  }

  const issues = new Map<string, number>();
  for (const r of counted(run.results)) if (r.design.judge && !("error" in r.design.judge)) for (const i of r.design.judge.issues) issues.set(i, (issues.get(i) ?? 0) + 1);
  if (issues.size) {
    lines.push("", "## Defectos de diseño señalados por el juez", "");
    for (const [i, n] of [...issues].sort((a, b) => b[1] - a[1]).slice(0, 12)) lines.push(`- ${i}${n > 1 ? ` (×${n})` : ""}`);
  }

  const dims = JUDGE_DIMENSIONS.map((d) => {
    const xs = counted(run.results).flatMap((r) => (r.design.judge && !("error" in r.design.judge) ? [r.design.judge.scores[d]] : []));
    return xs.length ? `${d} ${round(mean(xs), 1)}` : null;
  }).filter(Boolean);
  if (dims.length) lines.push("", `Rúbrica (1–5, media): ${dims.join(" · ")}`);

  const sig = counted(run.results).map((r) => r.design.signals);
  if (sig.length)
    lines.push(
      "",
      `Señales estáticas (media por app): ${round(mean(sig.map((s) => s.hardcodedColors)))} colores fijos, ${round(mean(sig.map((s) => s.inlineStyles)))} estilos en línea, ${round(mean(sig.map((s) => s.tokens)))} tokens, tema oscuro en ${pct(sig.filter((s) => s.darkTheme).length / sig.length)}.`,
    );
  return lines.join("\n") + "\n";
}
