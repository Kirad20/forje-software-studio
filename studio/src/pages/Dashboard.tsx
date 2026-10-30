import { useEffect, useState } from "react";
import { api, timeAgo, type Project } from "../api";
import { Send } from "../components/Icons";
import { go } from "../router";

const IDEAS = [
  "Un CRM sencillo para mi agencia con contactos, embudo y notas",
  "Reservas para mi estudio de yoga con pagos y recordatorios por correo",
  "Un tablero de tareas en tiempo real para mi equipo",
  "Un asistente con IA que responde preguntas sobre mis documentos",
];

const COLORS = ["#4f46e5", "#0891b2", "#059669", "#d97706", "#db2777", "#7c3aed"];
const colorFor = (id: string) => COLORS[parseInt(id.slice(0, 4), 16) % COLORS.length];

export function Dashboard() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    api<{ projects: Project[] }>("/projects").then((r) => setProjects(r.projects));
  }, []);

  const create = async () => {
    if (!prompt.trim()) return;
    setBusy(true);
    setError("");
    try {
      const { project } = await api<{ project: Project }>("/projects", { body: { prompt } });
      // The project view sends the idea to the builder on open.
      sessionStorage.setItem(`forja:first:${project.id}`, prompt);
      go(`/p/${project.id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  const shown = (projects ?? []).filter((p) => !filter || p.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="page">
      <section className="hero">
        <h1>¿Qué quieres construir?</h1>
        <p className="muted">Descríbelo con tus palabras. Forja escribe la app, crea su base de datos y la publica.</p>
        <div className="card prompt-box">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Una app para…"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void create();
              }
            }}
          />
          <div className="row">
            <span className="small muted grow">Incluye base de datos, inicio de sesión, archivos, correo, IA y publicación.</span>
            <button className="primary" disabled={!prompt.trim() || busy} onClick={create}>
              {busy ? <span className="spinner" /> : <Send />} Crear app
            </button>
          </div>
        </div>
        {error && <div className="error-box" style={{ maxWidth: 720, margin: "12px auto 0" }}>{error}</div>}
        <div className="chips">
          {IDEAS.map((i) => (
            <button key={i} onClick={() => setPrompt(i)}>
              {i}
            </button>
          ))}
        </div>
      </section>

      <div className="row" style={{ marginBottom: 14 }}>
        <h2 className="grow" style={{ fontSize: 18 }}>
          Tus proyectos {projects && <span className="muted">· {projects.length}</span>}
        </h2>
        <input style={{ width: 220 }} placeholder="Buscar proyectos…" value={filter} onChange={(e) => setFilter(e.target.value)} />
      </div>

      {projects === null ? (
        <div className="empty">
          <span className="spinner" />
        </div>
      ) : shown.length === 0 ? (
        <div className="card empty">{projects.length ? "Ningún proyecto coincide." : "Aún no tienes proyectos. Describe tu primera app arriba."}</div>
      ) : (
        <div className="projects-grid">
          {shown.map((p) => (
            <div key={p.id} className="card project-card" onClick={() => go(`/p/${p.id}`)}>
              <div className="row">
                <div className="avatar" style={{ background: colorFor(p.id) }}>
                  {p.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="grow">
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div className="small muted">{timeAgo(p.updatedAt)}</div>
                </div>
                {p.slug ? <span className="pill ok">Publicada</span> : <span className="pill">Borrador</span>}
              </div>
              <div className="small muted clamp">{p.description || "Sin descripción"}</div>
              {p.appUrl && (
                <a className="small" href={p.appUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                  {p.appUrl.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
