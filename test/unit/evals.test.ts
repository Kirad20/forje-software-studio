import { describe, expect, it } from "vitest";
import { EVAL_CASES } from "../../server/evals/cases.js";
import { defaultJudge, parseJudgement } from "../../server/evals/judge.js";
import type { ModelInfo } from "../../server/llm/catalog.js";
import { checkOf } from "../../server/evals/runner.js";
import { aggregate, designSignals, hygieneScore, passed, renderReport, scoreCase, summarize, type CaseResult, type PreviewCheck, type RunView } from "../../server/evals/score.js";
import type { PageInspection } from "../../server/runtime/browser.js";

const okCheck = (over: Partial<PreviewCheck> = {}): PreviewCheck => ({ path: "/", signedIn: false, viewport: "desktop", ok: true, status: 200, consoleErrors: [], failedRequests: [], textChars: 400, ...over });
const signals = { hardcodedColors: 0, inlineStyles: 0, internalAnchors: 0, tokens: 12, darkTheme: true, pages: 1, pagesWithoutH1: 0, pagesWithoutHead: 0 };
const judge = (overall: number) => ({
  scores: { hierarchy: overall, spacing: overall, color: overall, typography: overall, states: overall, responsive: overall, copy: overall, fidelity: overall },
  overall,
  issues: ["El botón principal no destaca"],
  model: "Fake",
});

function result(over: Partial<CaseResult> = {}): CaseResult {
  const base = {
    caseId: "small-cafe-landing",
    size: "small" as const,
    repeat: 1,
    status: "done" as const,
    durationMs: 60_000,
    usd: 0.5,
    turn: { fastPath: true, steps: 10, toolErrors: 1, gateRounds: 0, models: ["Fake"], replyChars: 200, turnId: "t1" },
    checks: { compile: { ok: true, problems: 0 }, types: { ok: true, problems: 0 }, preview: [okCheck()] },
    design: { signals, judge: judge(4) },
    ...over,
  };
  return { ...base, score: scoreCase(base) } as CaseResult;
}

describe("eval cases", () => {
  it("have unique ids, cover every size and give routes", () => {
    expect(new Set(EVAL_CASES.map((c) => c.id)).size).toBe(EVAL_CASES.length);
    expect(new Set(EVAL_CASES.map((c) => c.size))).toEqual(new Set(["small", "medium", "large"]));
    for (const c of EVAL_CASES) expect(c.routes.every((r) => r.startsWith("/")) && c.prompt.length > 80).toBe(true);
  });
});

describe("scoring", () => {
  it("a clean, well-designed app scores high; a broken build scores only its hygiene", () => {
    expect(result().score.total).toBeGreaterThan(90);
    const broken = result({ checks: { compile: { ok: false, problems: 3 }, types: null, preview: [] } });
    expect(broken.score).toMatchObject({ compile: 0, types: 0, runtime: 0 });
    expect(broken.score.total).toBeLessThan(40);
  });

  it("shares the judge's weight out when it did not run, instead of counting it as zero", () => {
    const withJudge = result({ design: { signals, judge: judge(5) } }).score.total;
    const without = result({ design: { signals, judge: null } }).score;
    expect(without.judge).toBeNull();
    expect(without.total).toBe(100);
    expect(withJudge).toBe(100);
    const errored = result({ design: { signals, judge: { error: "sin visión" } } }).score;
    expect(errored.judge).toBeNull();
  });

  it("type errors cost points but keep the build score", () => {
    const r = result({ checks: { compile: { ok: true, problems: 0 }, types: { ok: false, problems: 2 }, preview: [okCheck()] } });
    expect(r.score).toMatchObject({ compile: 1, types: 0, runtime: 1 });
    expect(passed(r)).toBe(false);
    expect(passed(result())).toBe(true);
  });

  it("runtime is the share of pages that load clean", () => {
    const r = result({ checks: { compile: { ok: true, problems: 0 }, types: { ok: true, problems: 0 }, preview: [okCheck(), okCheck({ ok: false, path: "/x" })] } });
    expect(r.score.runtime).toBe(0.5);
  });

  it("hygiene penalises hard-coded colours, inline styles and a missing dark theme", () => {
    expect(hygieneScore(signals)).toBe(1);
    expect(hygieneScore({ ...signals, darkTheme: false })).toBe(0.75);
    expect(hygieneScore({ ...signals, hardcodedColors: 100, inlineStyles: 100, tokens: 2, darkTheme: false })).toBeCloseTo(0.15, 2);
  });
});

describe("design signals", () => {
  it("counts colour literals outside base.css, ignoring var() fallbacks and comments", () => {
    const s = designSignals({
      "base.css": ":root { --bg: #fff; --text: #111; --primary: #ea580c; } @media (prefers-color-scheme: dark) { :root { --bg: #000; } }",
      "pages/_index.tsx": `export default function H() { return <main style={{ color: "#f00" }}><a href="/x">x</a><h1>t</h1></main>; }`,
      "pages/_index.module.css": ".a { color: #123456; background: var(--bg, #fff); } /* #abc */ .b { border: 1px solid rgb(0 0 0); }",
    });
    expect(s).toMatchObject({ hardcodedColors: 3, inlineStyles: 1, internalAnchors: 1, tokens: 3, darkTheme: true, pages: 1, pagesWithoutH1: 0, pagesWithoutHead: 1 });
  });
});

describe("judge parsing", () => {
  it("accepts JSON surrounded by prose, rounds to halves and clamps to 1–5", () => {
    const j = parseJudgement(
      'Aquí va:\n{"scores":{"hierarchy":4,"spacing":3.3,"color":9,"typography":0,"states":2,"responsive":5,"copy":4,"fidelity":3},"issues":["a","","b"]}',
      "Fake",
    );
    expect(j.scores).toMatchObject({ spacing: 3.5, color: 5, typography: 1 });
    expect(j.issues).toEqual(["a", "b"]);
    expect(j.overall).toBeCloseTo(3.44, 2);
  });
  it("rejects replies that are not usable", () => {
    expect(() => parseJudgement("no sé", "m")).toThrow(/JSON/);
    expect(() => parseJudgement('{"scores":{"hierarchy":4}}', "m")).toThrow(/dimensión/);
  });
});

describe("preview check", () => {
  const page = (over: Partial<PageInspection> = {}): PageInspection => ({ path: "/", status: 200, consoleErrors: [], failedRequests: [], textChars: 300, text: "", ...over });
  it("fails blank pages, console errors and failed requests", () => {
    expect(checkOf(page(), false, "desktop").ok).toBe(true);
    expect(checkOf(page({ textChars: 3 }), false, "desktop").ok).toBe(false);
    expect(checkOf(page({ consoleErrors: ["[excepción] boom"] }), false, "desktop").ok).toBe(false);
    expect(checkOf(page({ consoleErrors: ["[warning] deprecated"] }), false, "desktop").ok).toBe(true);
    expect(checkOf(page({ status: 500 }), false, "desktop").ok).toBe(false);
  });
  it("lets a signed-out visit get 401/403 from private endpoints, but not a signed-in one", () => {
    const p = page({ failedRequests: ["GET /_api/tasks/list → 401"] });
    expect(checkOf(p, false, "desktop").ok).toBe(true);
    expect(checkOf(p, true, "desktop").ok).toBe(false);
    expect(checkOf(page({ failedRequests: ["GET /_api/x → 500"] }), false, "desktop").ok).toBe(false);
  });
});

describe("summary and report", () => {
  const rs = [result({ repeat: 1 }), result({ repeat: 2, design: { signals, judge: judge(2) } }), result({ caseId: "large-store", size: "large", status: "failed", error: "boom", checks: { compile: { ok: false, problems: 1, first: "pages/a.tsx:1:1 — x" }, types: null, preview: [] } }), result({ status: "aborted" })];

  it("ignores runs cut short and reports spread and pass rate", () => {
    const sum = summarize(rs);
    expect(sum.overall.runs).toBe(3);
    expect(sum.byCase["small-cafe-landing"]!.runs).toBe(2);
    expect(sum.byCase["small-cafe-landing"]!.score.stdev).toBeGreaterThan(0);
    expect(sum.byCase["small-cafe-landing"]!.passRate).toBe(1);
    expect(sum.byCase["large-store"]!.passRate).toBe(0);
    expect(aggregate([]).runs).toBe(0);
  });

  it("renders a report with the problems, the judge's top issues and the limits of the run", () => {
    const run: RunView = {
      id: "run1",
      status: "done",
      createdAt: "2026-11-01T10:00:00Z",
      finishedAt: "2026-11-01T10:30:00Z",
      budgetUsd: 5,
      spentUsd: 2.5,
      error: null,
      config: { cases: ["small-cafe-landing", "large-store"], repeats: 2, models: null, judge: true },
      results: rs,
    };
    const md = renderReport(run, { version: "1.2.3" });
    expect(md).toContain("# Informe de evals run1");
    expect(md).toContain("Forja 1.2.3");
    expect(md).toContain("$2.50 de $5.00");
    expect(md).toContain("1 ejecuciones sin terminar");
    expect(md).toMatch(/\| small-cafe-landing \| 2 \| 100% \|/);
    expect(md).toContain("**large-store** #1");
    expect(md).toContain("El botón principal no destaca (×3)");
  });
});

describe("default judge", () => {
  const m = (id: string, over: Partial<ModelInfo>) => ({ id, tier: 3, inPrice: 1, outPrice: 5, vision: true, tools: true, ...over }) as ModelInfo;
  it("is the cheapest strong model that sees images", () => {
    const models = [m("cheap", { tier: 2, inPrice: 0.1 }), m("strong-pricey", { tier: 5, inPrice: 5, outPrice: 25 }), m("strong-cheap", { tier: 4, inPrice: 2, outPrice: 10 }), m("blind", { tier: 5, vision: false, inPrice: 0.1, outPrice: 0.1 })];
    expect(defaultJudge(models)?.id).toBe("strong-cheap");
  });
  it("falls back to the strongest one that sees, or to none", () => {
    expect(defaultJudge([m("a", { tier: 2 }), m("b", { tier: 3 })])?.id).toBe("b");
    expect(defaultJudge([m("blind", { vision: false })])).toBeUndefined();
  });
});
