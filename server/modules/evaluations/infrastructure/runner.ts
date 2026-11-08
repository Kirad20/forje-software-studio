import { readFileSync } from "node:fs";
import path from "node:path";

import { config, ROOT_DIR } from "../../../shared/config.js";
import { newId } from "../../../shared/crypto.js";
import { sessionCookie, testSession, endSession } from "../../app-services/auth.js";
import { allowedModels, modelReadiness, creditsForUsd, setAccountModels, type ModelInfo } from "../../model-management/catalog.js";
import type { Account } from "../../identity/index.js";
import { one, q } from "../../../shared/database/index.js";
import type { Project } from "../../projects/index.js";
import { inspectPreview, type PageInspection, checkProject, formatProblem, pageRoutes, removeProjectData, typecheckProject } from "../../app-runtime/index.js";
import { EVAL_CASES, EVAL_SET_VERSION, type EvalCase } from "../domain/cases.js";
import { defaultJudge, judgeDesign } from "./judge.js";
import { designSignals, renderReport, scoreCase, summarize, type CaseResult, type PreviewCheck, type RunView, type Summary } from "../domain/score.js";
import { admission, MAX_JOBS, MAX_REPEATS, startEvaluation, type ActiveRun as Active, type RunRequest } from "../application/admission.js";
import { executeRun, recoverRuns } from "../application/run.js";
import { evaluationBuilder, evaluationResources } from "./bindings.js";
import { EVAL_EMAIL, ensureEvalAccount, spentLast24h, sweepEvalProjects } from "./account.js";

export { EvalError, type RunRequest } from "../application/admission.js";
export { EVAL_EMAIL, ensureEvalAccount, spentLast24h, sweepEvalProjects } from "./account.js";
export { bindEvaluationBuilder, bindEvaluationResources } from "./bindings.js";
export type { EvaluationBuilderPort } from "../ports/builder.js";
export type { EvaluationResourcesPort } from "../ports/resources.js";

/**
 * Quality evals: run the real builder on fixed requests and score what it produces.
 *
 * Safe to run in production because of how it is fenced in, not because it is careful:
 *  - Off unless the evals.enabled setting is on, and only platform admins reach it (see api.ts).
 *  - Every case runs in a throwaway project owned by a dedicated, disabled account
 *    (EVAL_EMAIL) with its own credits. It touches no user's project, data, credits or
 *    daily quota, and the router's bandit learns nothing from it (`synthetic` turns).
 *  - A hard budget: the run's credit balance is the budget, a watcher aborts the builds
 *    when the measured spend reaches it, and a rolling 24 h cap spans all runs.
 *  - One run at a time, at most `concurrency` cases building at once.
 *  - Projects are deleted after each case; a startup sweep removes the ones a crash left.
 */

/** A case that has not finished by now is stuck. */
const CASE_TIMEOUT_MS = 12 * 60_000;
const WATCH_MS = 1500;

const forjaVersion = () => {
  try {
    return String(JSON.parse(readFileSync(path.join(ROOT_DIR, "package.json"), "utf8")).version ?? "dev");
  } catch {
    return "dev";
  }
};

// --- Eval account ------------------------------------------------------------------------------------

/** At startup: a run that was going when the server stopped did not finish. */
export async function recoverEvals() {
  await recoverRuns({
    interrupt: () => q(`update eval_runs set status = 'interrupted', error = 'El servidor se reinició durante la ejecución.', finished_at = now() where status = 'running'`),
    sweep: sweepEvalProjects,
  });
}

// --- Active run ---------------------------------------------------------------------------------------

export const activeRunId = () => admission.activeRunId();

export async function cancelRun(runId: string): Promise<boolean> {
  if (activeRunId() !== runId) return false;
  return admission.cancel(runId, (id) => evaluationBuilder().stopBuilding(id));
}

/** Abort and drain admission, builders, playground agents and disposable cleanup. */
export async function stopEvals(): Promise<void> {
  await admission.stop((id) => evaluationBuilder().stopBuilding(id));
}

export async function evalConfig(admin: Account) {
  return {
    enabled: config.evals.enabled,
    limits: { maxRunUsd: config.evals.maxRunUsd, maxDailyUsd: config.evals.maxDailyUsd, concurrency: config.evals.concurrency, maxJobs: MAX_JOBS, maxRepeats: MAX_REPEATS },
    spentLast24hUsd: config.evals.enabled ? await spentLast24h() : 0,
    browser: config.browser.enabled,
    evalSetVersion: EVAL_SET_VERSION,
    activeRunId: activeRunId(),
    modelDiagnostics: config.evals.enabled
      ? (await modelReadiness({ accountId: admin.id })).map(({ id, label, vision, tools, blockers }) => ({ id, label, vision, tools, blockers }))
      : [],
    cases: EVAL_CASES.map(({ id, size, title, prompt, routes }) => ({ id, size, title, prompt, routes })),
    models: config.evals.enabled
      ? (await allowedModels({ accountId: admin.id })).map((m) => ({ id: m.id, label: m.label, tier: m.tier, vision: m.vision, inPrice: m.inPrice, outPrice: m.outPrice }))
      : [],
  };
}

export async function startRun(admin: Account, req: RunRequest): Promise<{ runId: string; jobs: number; budgetUsd: number }> {
  return startEvaluation(admin.id, req, config.evals, admission, {
    newId,
    allowedModels: (adminId) => allowedModels({ accountId: adminId }),
    defaultJudge: (models) => defaultJudge(models) ?? undefined,
    spent: spentLast24h,
    save: (run, cfg, budget) => q(`insert into eval_runs (id, created_by, status, config, budget_usd) values ($1, $2, 'running', $3, $4)`, [run.runId, admin.id, JSON.stringify(cfg), budget]),
    launch: (run, cases, cfg, budget) => {
      void admission.track(execute(run, admin, cases, cfg, budget))
        .catch((e) => console.warn(`[forja] evals: ${(e as Error).message}`));
    },
  });
}

// --- Executing ---------------------------------------------------------------------------------------

async function execute(run: Active, admin: Account, cases: EvalCase[], cfg: { repeats: number; models: string[] | null; judge: ModelInfo | null; judgeExplicit?: boolean }, budgetUsd: number) {
  let evalAccount: Account;
  await executeRun(run, cases, cfg.repeats, config.evals.concurrency, budgetUsd, {
    prepare: async () => {
      evalAccount = await ensureEvalAccount();
      await sweepEvalProjects().catch(() => {});
      await q(`update accounts set credits = $2 where id = $1`, [evalAccount.id, creditsForUsd(budgetUsd) + 1]);
      await setAccountModels(evalAccount.id, cfg.models);
    },
    measure: spentOn,
    saveSpent: (r, usd) => q(`update eval_runs set spent_usd = $2 where id = $1`, [r.runId, usd]),
    runCase: (r, job, over, ledger) => runCase(r, admin, evalAccount, job.c, job.repeat, cfg.judge, over, ledger, cfg.models?.length === 1 ? cfg.models[0] : undefined, cfg.judgeExplicit),
    failedResult: (job, error) => failedResult(job.c, job.repeat, error),
    saveResult: (r, job, result) => q(`insert into eval_results (run_id, case_id, repeat, result) values ($1, $2, $3, $4)`, [r.runId, job.c.id, job.repeat, JSON.stringify(result)]),
    trace: (r, job, result) => {
      evaluationBuilder().langfuse?.evalCase({
        runId: r.runId, caseId: job.c.id, size: job.c.size, repeat: job.repeat, turnId: result.turn.turnId,
        scores: { total: result.score.total, compile: result.score.compile, types: result.score.types, runtime: result.score.runtime, judge: result.score.judge, hygiene: result.score.hygiene, usd: result.usd },
      });
    },
    stop: (id) => evaluationBuilder().stopBuilding(id),
    finish: (r, out) => q(`update eval_runs set status = $2, error = $3, spent_usd = $4, finished_at = now() where id = $1`, [r.runId, out.status, out.error, out.spent]),
    cleanup: async () => {
      const acc = await one<{ id: string }>(`select id from accounts where email = $1`, [EVAL_EMAIL]).catch(() => undefined);
      if (acc) {
        await q(`update accounts set credits = 0 where id = $1`, [acc.id]).catch(() => {});
        await setAccountModels(acc.id, null).catch(() => {});
      }
      await evaluationBuilder().langfuse?.flush().catch(() => {});
    },
    watch: (tick) => {
      const timer = setInterval(() => { void tick().catch(() => {}); }, WATCH_MS);
      return () => clearInterval(timer);
    },
  }, () => admission.release(run));
}

const emptyResult = (c: EvalCase, repeat: number, status: CaseResult["status"], error?: string): CaseResult => ({
  caseId: c.id,
  size: c.size,
  repeat,
  status,
  error,
  durationMs: 0,
  usd: 0,
  turn: { fastPath: null, steps: 0, toolErrors: 0, gateRounds: 0, models: [], replyChars: 0, turnId: null },
  checks: { compile: { ok: false, problems: 0 }, types: null, preview: [] },
  design: { signals: designSignals({}), judge: null },
  score: { total: 0, compile: 0, types: 0, runtime: 0, judge: null, hygiene: 0 },
});
const failedResult = (c: EvalCase, repeat: number, error: string) => emptyResult(c, repeat, "failed", error);

/** One case, start to finish, in a throwaway project. Always cleans up after itself. */
async function runCase(
  run: Active,
  admin: Account,
  evalAccount: Account,
  c: EvalCase,
  repeat: number,
  judgeModel: ModelInfo | null,
  isOverBudget: () => boolean,
  ledger: { update(id: string, usd: number): void; settle(id: string, usd: number): void },
  explicitModelId?: string,
  judgeExplicit = false,
): Promise<CaseResult> {
  if (run.abort.signal.aborted) return emptyResult(c, repeat, isOverBudget() ? "over_budget" : "aborted");
  const project = await evaluationResources().projects.createProject(evalAccount.id, `eval ${c.id} #${repeat}`, "Proyecto efímero de los evals de calidad.");
  run.inflight.add(project.id);
  const started = Date.now();
  const timer = setTimeout(() => evaluationBuilder().stopBuilding(project.id), CASE_TIMEOUT_MS);
  let costSoFar = 0;
  try {
    if (run.abort.signal.aborted) return emptyResult(c, repeat, isOverBudget() ? "over_budget" : "aborted");
    // --- Build ---
    const turn = { fastPath: null as boolean | null, steps: 0, toolErrors: 0, gateRounds: 0, models: new Set<string>(), reply: "", error: "" };
    await evaluationBuilder().runBuilderTurn(
      evalAccount,
      project.id,
      c.prompt,
      (e) => {
        if (e.type === "route") turn.fastPath = e.fastPath;
        else if (e.type === "task_start") turn.models.add(e.model);
        else if (e.type === "tool_end") {
          if (e.id.startsWith("gate-")) {
            if (!e.ok) turn.gateRounds++;
          } else {
            turn.steps++;
            if (!e.ok) turn.toolErrors++;
          }
        } else if (e.type === "text" && !e.taskId) turn.reply = e.text;
        else if (e.type === "error") turn.error = e.message;
      },
      [],
      "build",
      false,
      { synthetic: true, ...(explicitModelId ? { explicitModelId } : {}) },
    );
    const buildUsd = await spentOn(project.id);
    costSoFar = buildUsd;
    ledger.update(project.id, buildUsd);
    const timedOut = Date.now() - started >= CASE_TIMEOUT_MS;
    if (run.abort.signal.aborted) return { ...emptyResult(c, repeat, isOverBudget() ? "over_budget" : "aborted"), usd: buildUsd, durationMs: Date.now() - started };

    // --- Measure ---
    const files = await evaluationResources().projects.readAllFiles(project.id);
    const compileProblems = await checkProject(files).catch((e: Error) => [{ file: "", text: e.message }]);
    const typeProblems = compileProblems.length ? null : await typecheckProject(files);
    const preview = compileProblems.length ? { checks: [], shots: [], text: "" } : await checkPreview({ ...project, runtime: "native" }, evalAccount.email, c, files, !!judgeModel);
    const signals = designSignals(files);

    // --- Judge ---
    let judge: CaseResult["design"]["judge"] = null;
    let judgeUsd = 0;
    if (judgeModel && !compileProblems.length && !isOverBudget()) {
      const shots = preview.shots.slice(0, 6);
      if (!shots.length) judge = { error: "no hubo capturas que juzgar" };
      else {
        try {
          const r = await judgeDesign(
            { accountId: admin.id },
            { payerId: evalAccount.id, projectId: project.id, source: "builder" },
            judgeModel,
            { prompt: c.prompt, shots, text: preview.text },
            run.abort.signal,
            judgeExplicit,
          );
          judgeUsd = r.usd;
          judge = r.judgement ?? { error: r.error ?? "sin veredicto" };
        } catch (e) {
          judge = { error: (e as Error).message };
        }
        judgeUsd = Math.max(judgeUsd, (await spentOn(project.id)) - buildUsd);
      }
    }
    const usd = buildUsd + judgeUsd;
    costSoFar = usd;
    ledger.update(project.id, usd);

    const turnRow = await one<{ turn_id: string | null }>(`select turn_id from chat_messages where project_id = $1 order by id limit 1`, [project.id]).catch(() => undefined);
    const partial = {
      checks: {
        compile: { ok: !compileProblems.length, problems: compileProblems.length, first: compileProblems[0] ? formatProblem(compileProblems[0]) : undefined },
        types: typeProblems ? { ok: !typeProblems.length, problems: typeProblems.length, first: typeProblems[0] ? formatProblem(typeProblems[0]) : undefined } : null,
        preview: preview.checks,
      },
      design: { signals, judge },
    };
    return {
      caseId: c.id,
      size: c.size,
      repeat,
      status: turn.error || timedOut ? "failed" : "done",
      error: timedOut ? "tiempo agotado" : turn.error || undefined,
      durationMs: Date.now() - started,
      usd,
      turn: { fastPath: turn.fastPath, steps: turn.steps, toolErrors: turn.toolErrors, gateRounds: turn.gateRounds, models: [...turn.models], replyChars: turn.reply.length, turnId: turnRow?.turn_id ?? null },
      ...partial,
      score: scoreCase(partial),
    };
  } finally {
    clearTimeout(timer);
    // The ai_usage rows go with the project, so the cost is settled before it is deleted.
    ledger.settle(project.id, Math.max(costSoFar, await spentOn(project.id).catch(() => 0)));
    if (evaluationBuilder().isBuilding(project.id)) evaluationBuilder().stopBuilding(project.id);
    await evaluationResources().projects.deleteProject(project.id).catch(() => {});
    await removeProjectData(project.id);
  }
}

const spentOn = async (projectId: string) => (await one<{ n: number }>(`select coalesce(sum(usd), 0)::float8 as n from ai_usage where project_id = $1`, [projectId]))?.n ?? 0;

// --- Preview checks ------------------------------------------------------------------------------------

const isFatal = (line: string) => !line.startsWith("[warning]");

/** A page counts as fine when it loads, shows content, and logs no console errors or failed requests. */
export function checkOf(p: PageInspection, signedIn: boolean, viewport: "desktop" | "mobile"): PreviewCheck {
  // Signed out, an app may rightly answer 401/403 to its private endpoints.
  const failedRequests = signedIn ? p.failedRequests : p.failedRequests.filter((l) => !/→ (401|403)$/.test(l));
  const consoleErrors = p.consoleErrors.filter(isFatal);
  const ok = !p.error && p.status !== null && p.status < 400 && p.textChars >= 20 && !consoleErrors.length && !failedRequests.length;
  return { path: p.path, signedIn, viewport, ok, status: p.status, consoleErrors: p.consoleErrors, failedRequests, textChars: p.textChars, error: p.error };
}

async function checkPreview(
  project: Project,
  ownerEmail: string,
  c: EvalCase,
  files: Record<string, string>,
  screenshots: boolean,
): Promise<{ checks: PreviewCheck[]; shots: { label: string; media_type: string; data: string }[]; text: string }> {
  const projectId = project.id;
  const pages = pageRoutes(files)
    .map((p) => p.pattern)
    .filter((p) => !p.includes(":"));
  const wanted = c.routes.filter((r) => pages.includes(r));
  // The request's routes if they exist; otherwise whatever pages the builder made.
  const paths = (wanted.length ? wanted : pages).slice(0, 3);
  const checks: PreviewCheck[] = [];
  const shots: { label: string; media_type: string; data: string }[] = [];
  let text = "";
  const visit = async (viewport: "desktop" | "mobile", opts: { paths: string[]; session?: { name: string; token: string } }) => {
    const inspected = await inspectPreview(project, { paths: opts.paths, viewport, session: opts.session, screenshot: screenshots });
    for (const p of inspected) {
      checks.push(checkOf(p, !!opts.session, viewport));
      if (!text && !opts.session && viewport === "desktop") text = p.text;
      if (p.screenshot) shots.push({ label: `${viewport === "mobile" ? "móvil" : "escritorio"}${opts.session ? ", con sesión del dueño" : ""}: ${p.path}`, ...p.screenshot });
    }
  };
  try {
    if (!paths.length) {
      checks.push({ path: "/", signedIn: false, viewport: "desktop", ok: false, status: null, consoleErrors: [], failedRequests: [], textChars: 0, error: "la app no tiene ninguna página" });
      return { checks, shots, text };
    }
    await visit("desktop", { paths });
    await visit("mobile", { paths: paths.slice(0, 1) });
    // Apps with accounts keep their real screens behind sign-in: look at them as the owner.
    if (c.needsAuth) {
      const session = await testSession(projectId, ownerEmail).catch(() => null);
      if (session) {
        try {
          const auth = { name: sessionCookie(projectId), token: session.token };
          await visit("desktop", { paths: ["/"], session: auth });
          await visit("mobile", { paths: ["/"], session: auth });
        } finally {
          await endSession(projectId, session.token).catch(() => {});
        }
      }
    }
  } catch (e) {
    checks.push({ path: paths[0] ?? "/", signedIn: false, viewport: "desktop", ok: false, status: null, consoleErrors: [], failedRequests: [], textChars: 0, error: (e as Error).message });
  }
  return { checks, shots, text };
}

// --- Reading -----------------------------------------------------------------------------------------

interface RunRow {
  id: string;
  status: string;
  config: RunView["config"] & { total?: number; evalSetVersion?: number };
  budget_usd: number;
  spent_usd: number;
  error: string | null;
  created_at: string;
  finished_at: string | null;
}

const toView = (r: RunRow, results: CaseResult[]): RunView & { total: number; evalSetVersion: number } => ({
  id: r.id,
  status: r.status,
  createdAt: new Date(r.created_at).toISOString(),
  finishedAt: r.finished_at ? new Date(r.finished_at).toISOString() : null,
  budgetUsd: r.budget_usd,
  spentUsd: r.spent_usd,
  error: r.error,
  config: r.config,
  total: r.config.total ?? results.length,
  evalSetVersion: r.config.evalSetVersion ?? EVAL_SET_VERSION,
  results,
});

const SELECT_RUN = `select id, status, config, budget_usd::float8 as budget_usd, spent_usd::float8 as spent_usd, error, created_at, finished_at from eval_runs`;

export async function listRuns(limit = 20) {
  const rows = await q<RunRow & { done: number }>(
    `select id, status, config, budget_usd::float8 as budget_usd, spent_usd::float8 as spent_usd, error, created_at, finished_at,
            (select count(*)::int from eval_results e where e.run_id = eval_runs.id) as done
     from eval_runs order by created_at desc limit $1`,
    [limit],
  );
  return rows.map((r) => {
    const { results: _results, ...view } = toView(r, []);
    return { ...view, done: r.done, active: r.id === activeRunId() };
  });
}

export async function getRun(runId: string): Promise<(ReturnType<typeof toView> & { summary: Summary; active: boolean }) | null> {
  const row = await one<RunRow>(`${SELECT_RUN} where id = $1`, [runId]);
  if (!row) return null;
  const results = (await q<{ result: CaseResult }>(`select result from eval_results where run_id = $1 order by id`, [runId])).map((r) => r.result);
  return { ...toView(row, results), summary: summarize(results), active: row.id === activeRunId() };
}

/** Everything an admin needs to hand over: JSON for tools, a report for people. */
export async function exportRun(runId: string, format: "json" | "md") {
  const run = await getRun(runId);
  if (!run) return null;
  if (format === "md") return { type: "text/markdown; charset=utf-8", body: renderReport(run, { version: forjaVersion() }) };
  return { type: "application/json", body: JSON.stringify({ forjaVersion: forjaVersion(), evalSetVersion: run.evalSetVersion, run }, null, 2) };
}
