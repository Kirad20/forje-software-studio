import { useEffect, useState } from "react";
import { api } from "../application/controller.js";
import { timeAgo } from "../../../shared/presentation/format.js";
import { useConfirmation } from "../../../shared/ConfirmDialog.js";

interface Stats {
  classes: { taskClass: string; uses: number; models: { modelId: string; alpha: number; beta: number; mean: number; uses: number; usdPerUse: number }[] }[];
  decisions: { id: number; at: string; projectId: string | null; projectName: string | null; role: string; taskClass: string; modelId: string; reason: string }[];
  fusionTraces?: {
    operationId: string;
    effort: "standard" | "high" | "max" | "fast";
    pattern: "single" | "cascade" | "critique";
    warnings: string[];
    steps: { id: string; phase: string; modelId: string; servedBy?: string; effort: string; ms: number; usage: { input: number; output: number; cacheRead?: number; cacheWrite?: number }; usd: number; credits: number }[];
  }[];
}

/** Admin → Enrutador: bounded execution traces and historical feedback, without model drafts. */
export function Router() {
  const { confirm, dialog } = useConfirmation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [note, setNote] = useState("");
  const load = () => api<Stats>("/admin/router/stats").then(setStats);
  useEffect(() => {
    void load();
  }, []);
  if (!stats) return <div className="empty"><span className="spinner" /></div>;
  const forget = async (f: { taskClass?: string; modelId?: string }, what: string) => {
    if (!await confirm(`¿Borrar el feedback histórico ${what}? Esto no cambia el objetivo de selección de Fusion.`)) return;
    try {
      const r = await api<{ removed: number }>("/admin/router/reset", { body: f });
      setNote(`${r.removed} registros olvidados.`);
      await load();
    } catch (e) {
      setNote((e as Error).message);
    }
  };

  return (
    <div className="stack" style={{ gap: 16 }}>
      {dialog}
      <p className="small muted" style={{ margin: 0 }}>
        Los registros de ejecución muestran el patrón de Fusion, los pasos, los modelos, advertencias y coste total; no incluyen borradores ni razonamiento privado.
      </p>
      {stats.fusionTraces && (
        <section className="card stack" style={{ padding: 16, gap: 12 }}>
          <strong>Ejecuciones Fusion recientes</strong>
          {!stats.fusionTraces.length && <div className="small muted">Aún no hay ejecuciones registradas.</div>}
          {stats.fusionTraces.map((trace) => {
            const usd = trace.steps.reduce((sum, step) => sum + step.usd, 0);
            const credits = trace.steps.reduce((sum, step) => sum + step.credits, 0);
            return (
              <details key={trace.operationId}>
                <summary className="small" style={{ cursor: "pointer" }}>
                  {trace.effort} · {trace.pattern} · {trace.steps.length} pasos · ${usd.toFixed(4)} · {credits} créditos
                </summary>
                <div className="stack small" style={{ gap: 4, marginTop: 6 }}>
                  <code>{trace.operationId}</code>
                  {trace.warnings.map((warning, index) => <div className="muted" key={index}>Aviso: {warning}</div>)}
                  {trace.steps.map((step) => (
                    <div className="row" key={step.id} style={{ flexWrap: "wrap", gap: 8 }}>
                      <strong>{step.phase}</strong>
                      <span>{step.modelId}{step.servedBy ? ` (servido por ${step.servedBy})` : ""}</span>
                      <span className="muted">{step.ms} ms · {step.usage.input + step.usage.output} tokens · ${step.usd.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </details>
            );
          })}
        </section>
      )}
      <div className="row">
        <button className="danger" disabled={!stats.classes.length} onClick={() => void forget({}, "en todas las tareas")}>
          Borrar feedback histórico
        </button>
        {note && <span className="small muted">{note}</span>}
      </div>
      {!stats.classes.length && !stats.fusionTraces?.length && <div className="card empty">Aún no hay actividad del enrutador.</div>}
      {!!stats.classes.length && <div className="small muted">Señales históricas de calidad; no representan el objetivo de selección de Fusion.</div>}
      {stats.classes.map((c) => (
        <section key={c.taskClass} className="card" style={{ padding: 16 }}>
          <div className="row" style={{ marginBottom: 8 }}>
            <strong className="grow">
              <code>{c.taskClass}</code> <span className="small muted">· {c.uses} usos</span>
            </strong>
            <button className="ghost small" onClick={() => void forget({ taskClass: c.taskClass }, `en ${c.taskClass}`)}>
              Borrar
            </button>
          </div>
          <table className="grid">
            <thead>
              <tr>
                <th>Modelo</th>
                <th style={{ width: "40%" }}>Señal estimada</th>
                <th>Usos</th>
                <th>Coste medio</th>
              </tr>
            </thead>
            <tbody>
              {c.models.map((m) => (
                <tr key={m.modelId}>
                  <td>{m.modelId}</td>
                  <td>
                    <div className="row">
                      <div className="bar grow">
                        <span style={{ width: `${Math.round(m.mean * 100)}%` }} />
                      </div>
                      <span className="small">{Math.round(m.mean * 100)}%</span>
                    </div>
                  </td>
                  <td>{m.uses}</td>
                  <td>{m.uses ? `$${m.usdPerUse.toFixed(4)}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
      {stats.decisions.length > 0 && (
        <section className="card" style={{ padding: 0, overflow: "auto", maxHeight: 480 }}>
          <table className="grid">
            <thead>
              <tr>
                <th>Cuándo</th>
                <th>Proyecto</th>
                <th>Rol</th>
                <th>Tarea</th>
                <th>Modelo</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {stats.decisions.map((d) => (
                <tr key={d.id}>
                  <td>{timeAgo(d.at)}</td>
                  <td>{d.projectName ?? "—"}</td>
                  <td>{d.role}</td>
                  <td>
                    <code>{d.taskClass}</code>
                  </td>
                  <td>{d.modelId}</td>
                  <td title={d.reason}>{d.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
