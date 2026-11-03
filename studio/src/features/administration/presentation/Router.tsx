import { useEffect, useState } from "react";
import { api } from "../application/controller.js";
import { timeAgo } from "../../../shared/presentation/format.js";

interface Stats {
  classes: { taskClass: string; uses: number; models: { modelId: string; alpha: number; beta: number; mean: number; uses: number; usdPerUse: number }[] }[];
  decisions: { id: number; at: string; projectId: string | null; projectName: string | null; role: string; taskClass: string; modelId: string; reason: string }[];
}

/** Admin → Enrutador: what the router learned per task class, and the choices it made lately. */
export function Router() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [note, setNote] = useState("");
  const load = () => api<Stats>("/admin/router/stats").then(setStats);
  useEffect(() => {
    void load();
  }, []);
  if (!stats) return <div className="empty"><span className="spinner" /></div>;
  const forget = async (f: { taskClass?: string; modelId?: string }, what: string) => {
    if (!confirm(`¿Olvidar lo aprendido ${what}? El enrutador vuelve a partir de la calidad declarada de cada modelo.`)) return;
    const r = await api<{ removed: number }>("/admin/router/reset", { body: f });
    setNote(`${r.removed} registros olvidados.`);
    await load();
  };

  return (
    <div className="stack" style={{ gap: 16 }}>
      <p className="small muted" style={{ margin: 0 }}>
        Para cada tipo de tarea, el enrutador estima la probabilidad de éxito de cada modelo (compila, la revisión aprueba, el dueño conserva el cambio) y la combina con el coste. Olvídalo tras cambiar precios o
        modelos para que vuelva a explorar.
      </p>
      <div className="row">
        <button className="danger" disabled={!stats.classes.length} onClick={() => void forget({}, "en todas las tareas")}>
          Olvidar todo
        </button>
        {note && <span className="small muted">{note}</span>}
      </div>
      {!stats.classes.length && <div className="card empty">Aún no ha aprendido nada: aparece aquí tras los primeros turnos del constructor.</div>}
      {stats.classes.map((c) => (
        <section key={c.taskClass} className="card" style={{ padding: 16 }}>
          <div className="row" style={{ marginBottom: 8 }}>
            <strong className="grow">
              <code>{c.taskClass}</code> <span className="small muted">· {c.uses} usos</span>
            </strong>
            <button className="ghost small" onClick={() => void forget({ taskClass: c.taskClass }, `en ${c.taskClass}`)}>
              Olvidar
            </button>
          </div>
          <table className="grid">
            <thead>
              <tr>
                <th>Modelo</th>
                <th style={{ width: "40%" }}>Éxito estimado</th>
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
