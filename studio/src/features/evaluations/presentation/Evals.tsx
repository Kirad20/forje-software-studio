import { useCallback, useEffect, useState } from "react";
import { api, evaluationsController } from "../application/controller.js";
import { go } from "../../../app/router.js";
import { browser } from "../../../shared/infrastructure/browser.js";

interface EvalCfg {
  enabled: boolean;
  limits: { maxRunUsd: number; maxDailyUsd: number; concurrency: number; maxJobs: number; maxRepeats: number };
  spentLast24hUsd: number;
  browser: boolean;
  activeRunId: string | null;
  cases: { id: string; size: "small" | "medium" | "large"; title: string }[];
  models: { id: string; label: string; tier: number; vision: boolean }[];
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
  results: { caseId: string; repeat: number; status: string; error?: string; usd: number; score: { total: number } }[];
}

const money = (n: number) => `$${n.toFixed(n < 0.1 ? 4 : 2)}`;
const STATUS: Record<string, [string, string]> = { running: ["En curso", "accent"], done: ["Terminada", "ok"], cancelled: ["Cancelada", "warn"], failed: ["Falló", "err"], interrupted: ["Interrumpida", "warn"] };

export function Evals() {
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

  const reload = useCallback(async () => {
    const c = await api<EvalCfg>("/admin/evals/config");
    setCfg(c);
    if (c.enabled) setRuns((await api<{ runs: RunSummary[] }>("/admin/evals/runs")).runs);
  }, []);
  useEffect(() => {
    reload().catch((e) => setError(e.message));
  }, [reload]);
  useEffect(() => {
    if (cfg && !cases.size) setCases(new Set(cfg.cases.map((c) => c.id)));
    if (cfg) setBudget((b) => Math.min(b, cfg.limits.maxRunUsd));
  }, [cfg]); // eslint-disable-line react-hooks/exhaustive-deps

  const anyActive = runs.some((r) => r.status === "running");
  useEffect(() => {
    if (!anyActive && !(open && detail?.status === "running")) return;
    const t = setInterval(() => {
      reload().catch(() => {});
      if (open) api<RunDetail>(`/admin/evals/runs/${open}`).then(setDetail).catch(() => {});
    }, 3000);
    return () => clearInterval(t);
  }, [anyActive, open, detail?.status, reload]);

  useEffect(() => {
    if (!open) return setDetail(null);
    api<RunDetail>(`/admin/evals/runs/${open}`).then(setDetail).catch((e) => setError(e.message));
  }, [open]);

  if (!cfg) return <div className="empty"><span className="spinner" /></div>;
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
  const start = async () => {
    setError("");
    setNote("");
    try {
      const r = await api<{ runId: string }>("/admin/evals/runs", {
        body: { cases: [...cases], repeats, budgetUsd: budget, models: models.size ? [...models] : undefined, judge },
      });
      await reload();
      setOpen(r.runId);
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const toggle = (set: Set<string>, id: string, fn: (s: Set<string>) => void) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    fn(next);
  };
  const exportRun = async (id: string, format: "json" | "md", mode: "download" | "copy") => {
    const text = await evaluationsController.exportRun(id, format);
    if (mode === "download") return browser.download(`evals-${id}.${format}`, text, format === "md" ? "text/markdown" : "application/json");
    await browser.writeClipboard(text);
    setNote(format === "md" ? "Informe copiado. Pégalo en la conversación." : "JSON copiado.");
  };

  return (
    <div className="stack" style={{ gap: 18 }}>
      <p className="muted small" style={{ margin: 0 }}>
        Ejecutan el constructor con peticiones fijas en proyectos desechables (cuenta interna, sin tocar datos ni créditos de nadie) y puntúan compilación, tipos, vista previa y diseño.
        Topes: {money(cfg.limits.maxRunUsd)} por ejecución, {money(cfg.limits.maxDailyUsd)} al día (llevas {money(cfg.spentLast24hUsd)}), {cfg.limits.concurrency} en paralelo.
        {!cfg.browser && " El navegador está desactivado en este servidor: no se podrá medir la vista previa."}
      </p>

      <div className="card stack" style={{ padding: 16 }}>
        <strong>Nueva ejecución</strong>
        <div className="stack" style={{ gap: 6 }}>
          {cfg.cases.map((c) => (
            <label key={c.id} className="row" style={{ color: "var(--text)" }}>
              <input type="checkbox" checked={cases.has(c.id)} onChange={() => toggle(cases, c.id, setCases)} style={{ width: "auto" }} />
              <span className="grow">{c.title}</span>
              <span className="pill">{c.size}</span>
            </label>
          ))}
        </div>
        <div className="row" style={{ flexWrap: "wrap", alignItems: "end" }}>
          <label>
            Repeticiones (la media y la dispersión mandan, no una sola)
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
        {error && <div className="error-box">{error}</div>}
        <div className="row">
          <button className="primary" disabled={!jobs || anyActive} onClick={start}>
            {anyActive ? "Hay una ejecución en curso" : `Ejecutar ${jobs} ${jobs === 1 ? "caso" : "casos"}`}
          </button>
          <span className="small muted">Se detiene sola al llegar al presupuesto.</span>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "auto" }}>
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
            {runs.map((r) => (
              <tr key={r.id} style={{ cursor: "pointer", background: open === r.id ? "var(--surface-2)" : undefined }} onClick={() => setOpen(open === r.id ? null : r.id)}>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td>
                  <span className={`pill ${STATUS[r.status]?.[1] ?? ""}`}>{STATUS[r.status]?.[0] ?? r.status}</span>
                </td>
                <td>
                  {r.done}/{r.total}
                </td>
                <td>
                  {money(r.spentUsd)} / {money(r.budgetUsd)}
                </td>
                <td className="small muted">{r.error ?? ""}</td>
              </tr>
            ))}
            {!runs.length && (
              <tr>
                <td colSpan={5} className="muted">
                  Todavía no hay ejecuciones.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {open && detail && (
        <div className="card stack" style={{ padding: 16 }}>
          <div className="row" style={{ flexWrap: "wrap" }}>
            <strong className="grow">Resultado</strong>
            {detail.status === "running" && (
              <button className="danger" onClick={() => api(`/admin/evals/runs/${detail.id}/cancel`, { body: {} }).then(reload)}>
                Cancelar
              </button>
            )}
            <button onClick={() => exportRun(detail.id, "md", "copy")}>Copiar informe</button>
            <button onClick={() => exportRun(detail.id, "md", "download")}>Informe .md</button>
            <button onClick={() => exportRun(detail.id, "json", "download")}>JSON</button>
          </div>
          {note && <div className="small" style={{ color: "var(--ok)" }}>{note}</div>}
          {detail.summary.overall.runs > 0 && (
            <div className="small">
              Puntuación media <strong>{detail.summary.overall.score.mean}</strong>/100 (σ {detail.summary.overall.score.stdev}) · pasan las comprobaciones objetivas {Math.round(detail.summary.overall.passRate * 100)}% · juez {detail.summary.overall.judge ?? "—"} ·{" "}
              {detail.summary.overall.meanSeconds} s por ejecución · {detail.summary.overall.gateRounds} rondas de la puerta de salida
            </div>
          )}
          <table className="grid">
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
          </table>
          <div className="small muted">Pega el informe en la conversación para revisar los resultados juntos; el JSON trae el detalle de cada ejecución.</div>
        </div>
      )}
    </div>
  );
}
