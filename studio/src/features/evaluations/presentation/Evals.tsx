import { useCallback, useEffect, useRef, useState } from "react";
import { api, evaluationsController } from "../application/controller.js";
import { go } from "../../../app/router.js";
import { browser } from "../../../shared/infrastructure/browser.js";
import { Select } from "../../../shared/ui.js";
import { useConfirmation } from "../../../shared/ConfirmDialog.js";
import "./Evals.css";

interface EvalCfg {
  enabled: boolean;
  limits: { maxRunUsd: number; maxDailyUsd: number; concurrency: number; maxJobs: number; maxRepeats: number };
  spentLast24hUsd: number;
  browser: boolean;
  activeRunId: string | null;
  cases: { id: string; size: "small" | "medium" | "large"; title: string }[];
  models: { id: string; label: string; tier: number; vision: boolean }[];
  modelDiagnostics?: { id: string; label: string; vision: boolean; tools: boolean; blockers: string[] }[];
}

interface Agg {
  runs: number;
  passRate: number;
  score: { mean: number; min: number; max: number; stdev: number };
  judge: number | null;
  usd: number;
  meanSeconds: number;
  gateRounds: number;
}

interface RunSummary {
  id: string;
  status: string;
  createdAt: string;
  budgetUsd: number;
  spentUsd: number;
  error: string | null;
  total: number;
  done: number;
  active: boolean;
}

interface RunDetail extends Omit<RunSummary, "done"> {
  summary: { overall: Agg; byCase: Record<string, Agg>; bySize: Record<string, Agg> };
  config: { cases: string[]; repeats: number; models: string[] | null; judge: boolean; judgeModel?: string | null };
  results: { caseId: string; repeat: number; status: string; error?: string; usd: number; durationMs: number;
    score: { total: number; compile: number; types: number; runtime: number; judge: number | null; hygiene: number };
    turn: { models: string[]; steps: number; toolErrors: number };
    checks: { compile: { ok: boolean; first?: string }; types: { ok: boolean; first?: string } | null;
      preview: { path: string; viewport: string; ok: boolean; error?: string; consoleErrors: string[]; failedRequests: string[] }[] };
    design: { judge: { error?: string; issues?: string[]; scores?: Record<string, number> } | null };
  }[];
}

const money = (n: number) => `$${n.toFixed(n < 0.1 ? 4 : 2)}`;
const SIZE = { small: "Pequeños", medium: "Medianos", large: "Grandes" };
const STATUS: Record<string, [string, string]> = { running: ["En curso", "accent"], done: ["Terminada", "ok"], cancelled: ["Cancelada", "warn"], failed: ["Falló", "err"], interrupted: ["Interrumpida", "warn"] };

export function Evals() {
  const { confirm, dialog } = useConfirmation();
  const [cfg, setCfg] = useState<EvalCfg | null>(null);
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [detail, setDetail] = useState<RunDetail | null>(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  // Form
  const [cases, setCases] = useState<Set<string>>(new Set());
  const [repeats, setRepeats] = useState(2);
  const [budget, setBudget] = useState(2);
  const [models, setModels] = useState<Set<string>>(new Set());
  const [judge, setJudge] = useState(true);
  const [judgeModel, setJudgeModel] = useState("");
  const [busy, setBusy] = useState("");
  const [detailError, setDetailError] = useState("");
  const [caseSearch, setCaseSearch] = useState("");
  const [runStatus, setRunStatus] = useState("");
  const [resultSearch, setResultSearch] = useState("");
  const [onlyProblems, setOnlyProblems] = useState(false);
  const [detailVersion, setDetailVersion] = useState(0);
  const initialized = useRef(false);

  const reload = useCallback(async () => {
    const c = await api<EvalCfg>("/admin/evals/config");
    setCfg(c);
    if (c.enabled) setRuns((await api<{ runs: RunSummary[] }>("/admin/evals/runs")).runs);
  }, []);
  useEffect(() => {
    reload().catch((e) => setError(e.message));
  }, [reload]);
  useEffect(() => {
    if (cfg && !initialized.current) {
      initialized.current = true;
      setCases(new Set(cfg.cases.map((c) => c.id)));
    }
    if (cfg) setBudget((b) => Math.min(b, cfg.limits.maxRunUsd));
  }, [cfg]); // eslint-disable-line react-hooks/exhaustive-deps

  const anyActive = !!cfg?.activeRunId || runs.some((r) => r.active);
  useEffect(() => {
    if (!anyActive && !(open && detail?.status === "running")) return;
    const t = setInterval(() => {
      reload().catch((e) => setError(e.message));
      if (open) setDetailVersion(v => v + 1);
    }, 3000);
    return () => clearInterval(t);
  }, [anyActive, open, detail?.status, reload]);

  useEffect(() => {
    let cancelled = false;
    setDetailError("");
    if (!open) { setDetail(null); return; }
    api<RunDetail>(`/admin/evals/runs/${open}`).then(r => {
      if (!cancelled) setDetail(r);
    }).catch((e) => { if (!cancelled) setDetailError(e.message); });
    return () => { cancelled = true; };
  }, [open, detailVersion]);

  if (!cfg) return <div className="empty">{error ? <div role="alert">{error} <button onClick={() => { setError(""); void reload().catch(e => setError(e.message)); }}>Reintentar</button></div> : <span className="spinner" />}</div>;
  if (!cfg.enabled)
    return (
      <div className="card" style={{ padding: 16 }}>
        Los evals están desactivados. Gastan crédito real de modelos: actívalos y fija sus topes en{" "}
        <a
          href="/admin/general"
          onClick={(e) => {
            e.preventDefault();
            go("/admin/general");
          }}
        >
          General → Evals de calidad
        </a>
        .
      </div>
    );

  const jobs = cases.size * repeats;
  const visualModels = cfg.models.filter(m => m.vision);
  const judgeReady = !judge || (judgeModel ? visualModels.some(m => m.id === judgeModel) : visualModels.length > 0);
  const remaining = Math.max(0, cfg.limits.maxDailyUsd - cfg.spentLast24hUsd);
  const valid = jobs > 0 && jobs <= cfg.limits.maxJobs && Number.isInteger(repeats) && repeats >= 1 && repeats <= cfg.limits.maxRepeats
    && budget > 0 && budget <= cfg.limits.maxRunUsd && remaining > 0.01 && judgeReady
    && [...models].every(id => cfg.models.some(m => m.id === id));
  const selectRun = (id: string) => {
    setDetail(null); setDetailError(""); setOpen(id); setDetailVersion(v => v + 1); setResultSearch(""); setOnlyProblems(false);
  };
  const start = async () => {
    if (busy || anyActive || !valid) return;
    setBusy("start");
    setError("");
    setNote("");
    try {
      const r = await api<{ runId: string }>("/admin/evals/runs", {
        body: { cases: [...cases], repeats, budgetUsd: budget, models: models.size ? [...models] : undefined, judge, judgeModel: judgeModel || undefined },
      });
      await reload();
      selectRun(r.runId);
    } catch (e) {
      setError((e as Error).message);
    } finally { setBusy(""); }
  };
  const toggle = (set: Set<string>, id: string, fn: (s: Set<string>) => void) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    fn(next);
  };
  const exportRun = async (id: string, format: "json" | "md", mode: "download" | "copy") => {
    setBusy("export"); setError("");
    try {
      const text = await evaluationsController.exportRun(id, format);
      if (mode === "download") browser.download(`evals-${id}.${format}`, text, format === "md" ? "text/markdown" : "application/json");
      else { await browser.writeClipboard(text); setNote("Informe copiado."); }
    } catch (e) { setError((e as Error).message); } finally { setBusy(""); }
  };
  const shownRuns = runs.filter(r => !runStatus || r.status === runStatus);
  const problem = (r: RunDetail["results"][number]) => r.status !== "done" || !!r.error || !r.checks.compile.ok || !r.checks.types?.ok
    || r.checks.preview.some(p => !p.ok) || !!r.design.judge?.error || !!r.design.judge?.issues?.length || r.turn.toolErrors > 0;
  const shownResults = detail?.results.filter(r => (!onlyProblems || problem(r)) && (!resultSearch || `${r.caseId} ${cfg.cases.find(c => c.id === r.caseId)?.title ?? ""} ${r.error ?? ""} ${r.turn.models.join(" ")}`.toLowerCase().includes(resultSearch.toLowerCase()))) ?? [];

  return (
    <div className="evals stack">
      {dialog}
      <header className="evals-heading row">
        <div className="grow"><span className="small muted">LABORATORIO DE CALIDAD</span><h2>Evalúa, compara y encuentra fallos</h2>
          <p className="muted small">Pruebas reproducibles del constructor en proyectos desechables. Compilación, tipos, runtime y diseño, sin tocar tus proyectos.</p></div>
        <button disabled={!!busy} onClick={async () => { setBusy("refresh"); setError(""); try { await reload(); if (open) setDetailVersion(v => v + 1); } catch (e) { setError((e as Error).message); } finally { setBusy(""); } }}>Actualizar</button>
      </header>
      {error && <div className="error-box" role="alert">{error}</div>}
      {note && <div role="status" className="pill ok">{note}</div>}
      <div className="evals-metrics">
        <Metric label="Disponible hoy" value={money(remaining)} hint={`${money(cfg.spentLast24hUsd)} gastados de ${money(cfg.limits.maxDailyUsd)}`} />
        <Metric label="Máximo por ejecución" value={money(cfg.limits.maxRunUsd)} hint={`${cfg.limits.concurrency} casos en paralelo`} />
        <Metric label="Jueces visuales" value={String(visualModels.length)} hint={visualModels.length ? "Permitidos en tu cuenta" : "Revisa modelos y permisos"} />
        <Metric label="Vista previa" value={cfg.browser ? "Disponible" : "Desactivada"} hint={cfg.browser ? "Comprobaciones de navegador habilitadas" : "No se podrá medir el runtime visual"} />
      </div>
      {anyActive && <div className="card row evals-active"><span className="spinner" /><span className="grow">Hay una evaluación en curso. El historial se actualiza automáticamente.</span>
        {cfg.activeRunId && <button onClick={() => selectRun(cfg.activeRunId!)}>Ver ejecución activa</button>}</div>}

      <section className="card evals-panel stack">
        <div className="row"><h3 className="grow">Nueva evaluación</h3><span className="pill">{cases.size} casos · {jobs} ejecuciones</span></div>
        <fieldset disabled={!!busy} className="evals-form">
        <div className="stack">
        <div className="row evals-wrap"><strong>1. Selecciona los casos</strong><span className="grow" />
          <button type="button" onClick={() => setCases(new Set(cfg.cases.map(c => c.id)))}>Todos</button>
          <button type="button" onClick={() => setCases(new Set())}>Ninguno</button>
          {(["small", "medium", "large"] as const).map(size => <button type="button" key={size} onClick={() => setCases(new Set(cfg.cases.filter(c => c.size === size).map(c => c.id)))}>{SIZE[size]}</button>)}
        </div>
        <input type="search" autoComplete="off" aria-label="Buscar casos" placeholder="Buscar casos…" value={caseSearch} onChange={e => setCaseSearch(e.target.value)} />
        <div className="evals-cases">
          {cfg.cases.filter(c => `${c.title} ${c.id}`.toLowerCase().includes(caseSearch.toLowerCase())).map((c) => (
            <label key={c.id} className={`evals-case ${cases.has(c.id) ? "selected" : ""}`}>
              <input type="checkbox" checked={cases.has(c.id)} onChange={() => toggle(cases, c.id, setCases)} style={{ width: "auto" }} />
              <span className="grow">{c.title}<code className="small muted">{c.id}</code></span>
              <span className="pill">{SIZE[c.size]}</span>
            </label>
          ))}
        </div>
        </div>
        <div className="stack evals-config">
        <strong>2. Configura la ejecución</strong>
        {judge && <Select label="Modelo juez de diseño" value={judgeModel} onValueChange={setJudgeModel}
          options={[{ value: "", label: "Automático entre modelos con visión permitidos" }, ...visualModels.map(m => ({ value: m.id, label: m.label, description: m.id }))]} />}
        {judge && !judgeReady && <div className="error-box" role="alert">
          No hay un juez visual permitido para esta cuenta. No se iniciará una ejecución que vaya a fallar.
          {(cfg.modelDiagnostics ?? []).filter(m => m.vision).map(m => <div key={m.id}><strong>{m.label}</strong>: {m.blockers.length ? m.blockers.join(" · ") : "Recarga la configuración para volver a comprobarlo"}</div>)}
          {!(cfg.modelDiagnostics ?? []).some(m => m.vision) && <div>Ningún modelo del catálogo tiene Imágenes activado. Un modelo de texto/código no se vuelve visual al activar esa opción.</div>}
          <button onClick={() => go("/admin/models")}>Configurar modelos y permisos</button>
          <button onClick={() => { setError(""); void reload().catch(e => setError(e.message)); }}>Volver a comprobar</button>
        </div>}
        <div className="row" style={{ flexWrap: "wrap", alignItems: "end" }}>
          <label>
            Repeticiones por caso
            <input type="number" min={1} max={cfg.limits.maxRepeats} value={repeats} onChange={(e) => setRepeats(Number(e.target.value) || 1)} style={{ width: 90 }} />
          </label>
          <label>
            Presupuesto (USD)
            <input type="number" min={0.1} max={cfg.limits.maxRunUsd} step={0.5} value={budget} onChange={(e) => setBudget(Number(e.target.value) || 0.1)} style={{ width: 110 }} />
          </label>
          <label className="row" style={{ color: "var(--text)", paddingBottom: 8 }}>
            <input type="checkbox" checked={judge} onChange={(e) => setJudge(e.target.checked)} style={{ width: "auto" }} /> Juez de diseño (modelo con visión, cuesta más)
          </label>
        </div>
        <details>
          <summary className="small muted" style={{ cursor: "pointer" }}>
            Modelos: {models.size ? `${models.size} fijados` : "enrutado automático, como en producción"}
          </summary>
          <div className="stack" style={{ gap: 4, marginTop: 8 }}>
            <div className="small muted">Para comparar modelos fija uno (o varios) y repite: con el enrutado automático el modelo cambia de una ejecución a otra.</div>
            {cfg.models.map((m) => (
              <label key={m.id} className="row" style={{ color: "var(--text)" }}>
                <input type="checkbox" checked={models.has(m.id)} onChange={() => toggle(models, m.id, setModels)} style={{ width: "auto" }} /> {m.label}
                <span className="pill">nivel {m.tier}</span>
                {!m.vision && <span className="pill warn">sin visión</span>}
              </label>
            ))}
          </div>
        </details>
        </div>
        </fieldset>
        <div className="evals-launch row evals-wrap">
          <button className="primary" disabled={!valid || anyActive || !!busy} onClick={start}>
            {busy === "start" ? "Iniciando…" : anyActive ? "Hay una ejecución en curso" : `Ejecutar ${jobs} ${jobs === 1 ? "caso" : "casos"}`}
          </button>
          <span className="small muted">{jobs > cfg.limits.maxJobs ? `Máximo ${cfg.limits.maxJobs} ejecuciones. Reduce casos o repeticiones.` : !cases.size ? "Selecciona al menos un caso." : remaining <= 0.01 ? "Se alcanzó el presupuesto diario." : budget <= 0 || budget > cfg.limits.maxRunUsd ? `El presupuesto debe ser mayor que cero y como máximo ${money(cfg.limits.maxRunUsd)}.` : `Tope efectivo: ${money(Math.min(budget, remaining))}. Se detiene al llegar al presupuesto; no es una estimación de coste.`}</span>
        </div>
      </section>

      <section className="card evals-panel stack">
        <div className="row evals-wrap"><h3 className="grow">Historial de evaluaciones</h3><Select label="Estado de evaluación" value={runStatus} onValueChange={setRunStatus}
          options={[{ value: "", label: "Todos los estados" }, ...Object.entries(STATUS).map(([value, [label]]) => ({ value, label }))]} /></div>
        <div className="evals-table">
        <table className="grid">
          <thead>
            <tr>
              <th>Ejecución</th>
              <th>Estado</th>
              <th>Progreso</th>
              <th>Gasto</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {shownRuns.map((r) => (
              <tr key={r.id} style={{ background: open === r.id ? "var(--surface-2)" : undefined }}>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td>
                  <span className={`pill ${STATUS[r.status]?.[1] ?? ""}`}>{STATUS[r.status]?.[0] ?? r.status}</span>
                </td>
                <td>
                  {r.done}/{r.total}
                  <progress aria-label={`Progreso de ${r.id}`} value={r.done} max={r.total || 1} />
                </td>
                <td>
                  {money(r.spentUsd)} / {money(r.budgetUsd)}
                </td>
                <td><button aria-expanded={open === r.id} onClick={() => open === r.id ? setOpen(null) : selectRun(r.id)}>Ver resultados</button>{r.error && <div className="small error-box">{r.error}</div>}</td>
              </tr>
            ))}
            {!shownRuns.length && (
              <tr>
                <td colSpan={5} className="muted">
                  {runs.length ? "No hay evaluaciones con este estado." : "Tu primera evaluación aparecerá aquí. Selecciona casos y modelos para empezar."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </section>
      {open && !detail && !detailError && <div className="card empty" role="status"><span className="spinner" /> Cargando resultados…</div>}
      {open && detailError && <div className="error-box" role="alert">{detailError} <button onClick={() => setDetailVersion(v => v + 1)}>Reintentar resultados</button></div>}

      {open && detail && (
        <section className="card stack evals-panel">
          <div className="row" style={{ flexWrap: "wrap" }}>
            <h3 className="grow">Resultados · {new Date(detail.createdAt).toLocaleString()}</h3>
            {detail.status === "running" && (
              <button disabled={!!busy} className="danger" onClick={async () => {
                if (!await confirm("¿Cancelar esta evaluación? Los casos ya ejecutados y su gasto se conservarán.")) return;
                setBusy("cancel"); setError("");
                try { await api(`/admin/evals/runs/${detail.id}/cancel`, { body: {} }); await reload(); setDetailVersion(v => v + 1); }
                catch (e) { setError((e as Error).message); } finally { setBusy(""); }
              }}>
                Cancelar
              </button>
            )}
            <button disabled={!!busy} onClick={() => exportRun(detail.id, "md", "copy")}>Copiar informe</button>
            <button disabled={!!busy} onClick={() => exportRun(detail.id, "md", "download")}>Informe .md</button>
            <button disabled={!!busy} onClick={() => exportRun(detail.id, "json", "download")}>JSON</button>
          </div>
          <div className="small muted">Modelos: {detail.config.models?.join(", ") ?? "Automático"} · Juez: {detail.config.judge ? detail.config.judgeModel ?? "Automático" : "Desactivado"} · {detail.config.repeats} repeticiones</div>
          {detail.error && <div className="error-box" role="alert">{detail.error}</div>}
          <div className="evals-metrics">
            <Metric label="Puntuación media" value={detail.summary.overall.runs ? `${detail.summary.overall.score.mean}/100` : "—"} hint="Solo casos terminados, no cancelados" />
            <Metric label="Comprobaciones aprobadas" value={detail.summary.overall.runs ? `${Math.round(detail.summary.overall.passRate * 100)}%` : "—"} hint={`${detail.summary.overall.runs} casos contabilizados`} />
            <Metric label="Gasto" value={money(detail.spentUsd)} hint={`Tope ${money(detail.budgetUsd)}`} />
            <Metric label="Duración media" value={`${detail.summary.overall.meanSeconds} s`} hint={`Dispersión de puntuación: ${detail.summary.overall.score.stdev}`} />
          </div>
          {detail.summary.overall.runs > 0 && (
            <div className="small">
              Puntuación media <strong>{detail.summary.overall.score.mean}</strong>/100 (σ {detail.summary.overall.score.stdev}) · pasan las comprobaciones objetivas {Math.round(detail.summary.overall.passRate * 100)}% · juez {detail.summary.overall.judge ?? "—"} ·{" "}
              {detail.summary.overall.meanSeconds} s por ejecución · {detail.summary.overall.gateRounds} rondas de la puerta de salida
            </div>
          )}
          <div className="evals-table"><table className="grid">
            <thead>
              <tr>
                <th>Caso</th>
                <th>Ejec.</th>
                <th>Pasan</th>
                <th>Puntuación</th>
                <th>Juez</th>
                <th>Gasto</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(detail.summary.byCase).map(([id, a]) => (
                <tr key={id}>
                  <td>{cfg.cases.find((c) => c.id === id)?.title ?? id}</td>
                  <td>{a.runs}</td>
                  <td>{Math.round(a.passRate * 100)}%</td>
                  <td>
                    {a.score.mean} <span className="muted">({a.score.min}–{a.score.max})</span>
                  </td>
                  <td>{a.judge ?? "—"}</td>
                  <td>{money(a.usd)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
          <h3>Detalle de cada repetición</h3>
          <div className="row evals-wrap">
            <input type="search" className="grow" aria-label="Buscar resultados" placeholder="Buscar caso, modelo o error…" value={resultSearch} onChange={e => setResultSearch(e.target.value)} />
            <label className="row"><input type="checkbox" checked={onlyProblems} onChange={e => setOnlyProblems(e.target.checked)} style={{ width: "auto" }} /> Solo con problemas</label>
          </div>
          {shownResults.map(r => <details className="evals-result" key={`${r.caseId}:${r.repeat}`}>
            <summary><span>{cfg.cases.find(c => c.id === r.caseId)?.title ?? r.caseId} · repetición {r.repeat}</span><span className={`pill ${problem(r) ? "warn" : "ok"}`}>{r.status === "done" ? problem(r) ? "Con problemas" : "Completado" : r.status === "over_budget" ? "Tope alcanzado" : r.status === "aborted" ? "Cancelado" : "Falló"}</span><strong>{r.score.total}/100</strong></summary>
            <div className="stack">
              <div className="small muted">{money(r.usd)} · {(r.durationMs / 1000).toFixed(1)} s · {r.turn.steps} pasos · {r.turn.toolErrors} errores de herramientas</div>
              <div className="small">Modelos: {r.turn.models.join(", ") || "Sin llamadas registradas"}</div>
              <div className="row evals-wrap">{Object.entries(r.score).filter(([key]) => key !== "total").map(([key, value]) => <span className="pill" key={key}>{({ compile: "Compilación", types: "Tipos", runtime: "Runtime", judge: "Juez", hygiene: "Higiene" } as Record<string, string>)[key]}: {value ?? "No medido"}</span>)}</div>
              {[r.error, r.checks.compile.first, r.checks.types?.first, r.design.judge?.error].filter(Boolean).map((text, i) => <pre key={i} className="error-box">{text}</pre>)}
              {r.checks.preview.map((p, i) => <div key={i} className="stack">
                <span className={`pill ${p.ok ? "ok" : "err"}`}>{p.path} · {p.viewport} · {p.ok ? "Correcto" : "Falló"}</span>
                {[p.error, ...p.consoleErrors, ...p.failedRequests].filter(Boolean).map((text, j) => <pre className="error-box" key={j}>{text}</pre>)}
              </div>)}
              {r.design.judge?.issues?.map((issue, i) => <div className="error-box" key={i}>{issue}</div>)}
            </div>
          </details>)}
          {!shownResults.length && <div className="empty">{detail.results.length ? "No hay resultados con estos filtros." : "Los resultados aparecerán al terminar cada caso."}</div>}
          <div className="small muted">Pega el informe en la conversación para revisar los resultados juntos; el JSON trae el detalle de cada ejecución.</div>
        </section>
      )}
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return <div className="evals-metric"><span className="small muted">{label}</span><strong>{value}</strong><span className="small muted">{hint}</span></div>;
}
