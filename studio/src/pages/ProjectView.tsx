import { useEffect, useState } from "react";
import { api, type Project } from "../api";
import type { Me } from "../App";
import { Chat } from "../components/Chat";
import { Back, External, Globe } from "../components/Icons";
import {
  AiPanel,
  CheckpointsPanel,
  CodePanel,
  DataPanel,
  EmailPanel,
  JobsPanel,
  LogsPanel,
  PreviewPanel,
  SecretsPanel,
  StoragePanel,
  UsersPanel,
} from "../components/Panels";
import { go } from "../router";

const TABS = [
  ["preview", "Vista previa"],
  ["code", "Código"],
  ["data", "Datos"],
  ["users", "Usuarios"],
  ["storage", "Archivos"],
  ["email", "Correo"],
  ["jobs", "Tareas"],
  ["secrets", "Secretos"],
  ["ai", "IA"],
  ["logs", "Registros"],
  ["checkpoints", "Checkpoints"],
] as const;
type Tab = (typeof TABS)[number][0];

type LogLine = { at: string; env: string; level: string; source: string; message: string };

export function ProjectView({ id, me, onCredits }: { id: string; me: Me; onCredits: () => void }) {
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("preview");
  const [filesKey, setFilesKey] = useState(0);
  const [logLines, setLogLines] = useState<LogLine[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [building, setBuilding] = useState(false);

  const load = () =>
    api<{ project: Project }>(`/projects/${id}`)
      .then((r) => setProject(r.project))
      .catch((e) => setError(e.message));

  useEffect(() => {
    void load();
    const es = new EventSource(`/api/projects/${id}/events`);
    let t: ReturnType<typeof setTimeout>;
    es.onmessage = (m) => {
      const e = JSON.parse(m.data);
      if (e.type === "files") {
        clearTimeout(t);
        t = setTimeout(() => setFilesKey((k) => k + 1), 400);
      } else if (e.type === "log") setLogLines((l) => [...l.slice(-300), e.entry]);
      else if (e.type === "published") void load();
    };
    return () => es.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (error) return <div className="empty">{error}</div>;
  if (!project) return <div className="empty">Cargando…</div>;

  const errorsSince = logLines.filter((l) => l.level === "error").length;

  return (
    <div className="workspace">
      <header className="topbar">
        <button className="ghost sm" onClick={() => go("/")} title="Proyectos">
          <Back />
        </button>
        <strong style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.name}</strong>
        {building && (
          <span className="pill accent">
            <span className="spinner" style={{ width: 10, height: 10 }} /> construyendo
          </span>
        )}
        <div className="grow" />
        <span className="small muted" style={{ whiteSpace: "nowrap" }}>
          {me.credits.toLocaleString()} créditos
        </span>
        {project.appUrl && (
          <a className="btn sm" href={project.appUrl} target="_blank" rel="noreferrer">
            <External /> App en vivo
          </a>
        )}
        <button className="primary sm" onClick={() => setPublishing(true)}>
          <Globe /> {project.appUrl ? (project.hasUnpublishedChanges ? "Publicar cambios" : "Publicada") : "Publicar"}
        </button>
      </header>
      <div className="split">
        <Chat
          projectId={id}
          onBuildingChange={setBuilding}
          onTurnEnd={() => {
            void load();
            onCredits();
          }}
        />
        <section className="stage">
          <nav className="tabs">
            {TABS.map(([key, label]) => (
              <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>
                {label}
                {key === "logs" && errorsSince > 0 && <span className="pill err" style={{ marginLeft: 4, padding: "0 6px" }}>{errorsSince}</span>}
              </button>
            ))}
          </nav>
          <div className={`panel ${["preview", "code", "data"].includes(tab) ? "flush" : ""}`}>
            {tab === "preview" && <PreviewPanel project={project} reloadKey={0} />}
            {tab === "code" && <CodePanel projectId={id} reloadKey={filesKey} />}
            {tab === "data" && <DataPanel projectId={id} reloadKey={filesKey} />}
            {tab === "users" && <UsersPanel projectId={id} />}
            {tab === "storage" && <StoragePanel projectId={id} />}
            {tab === "email" && <EmailPanel project={project} onChange={load} />}
            {tab === "jobs" && <JobsPanel projectId={id} reloadKey={filesKey} />}
            {tab === "secrets" && <SecretsPanel projectId={id} reloadKey={filesKey} />}
            {tab === "ai" && <AiPanel project={project} onChange={load} />}
            {tab === "logs" && <LogsPanel projectId={id} lines={logLines} />}
            {tab === "checkpoints" && <CheckpointsPanel projectId={id} reloadKey={filesKey} />}
          </div>
        </section>
      </div>
      {publishing && <PublishDialog project={project} onClose={() => setPublishing(false)} onDone={load} />}
    </div>
  );
}

function PublishDialog({ project, onClose, onDone }: { project: Project; onClose: () => void; onDone: () => void }) {
  const [slug, setSlug] = useState(project.slug ?? project.suggestedSlug);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const host = new URL(project.previewOrigin).host.replace(/^pv-[^.]+\./, "");

  const publish = async () => {
    setBusy(true);
    setError("");
    try {
      await api(`/projects/${project.id}/publish`, { body: { slug } });
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="card modal" onClick={(e) => e.stopPropagation()}>
        <h3>Publicar</h3>
        <p className="small muted" style={{ margin: 0 }}>
          Publica el código actual. La base de datos es la misma que en la vista previa. Las tareas programadas empiezan a correr con esta versión.
        </p>
        <label>
          Dirección
          <div className="row" style={{ gap: 4 }}>
            <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} disabled={!!project.slug} />
            <span className="muted" style={{ whiteSpace: "nowrap" }}>.{host}</span>
          </div>
        </label>
        {project.appUrl && (
          <div className="row small">
            <span className="pill ok">En vivo</span>
            <a href={project.appUrl} target="_blank" rel="noreferrer" className="grow">
              {project.appUrl}
            </a>
          </div>
        )}
        <label className="row" style={{ color: "var(--text)" }}>
          <input
            type="checkbox"
            style={{ width: "auto" }}
            checked={project.visibility === "private"}
            onChange={async (e) => {
              await api(`/projects/${project.id}`, { method: "PATCH", body: { visibility: e.target.checked ? "private" : "public" } });
              onDone();
            }}
          />
          Privada: solo quien tenga el enlace con token puede abrirla
        </label>
        {error && <div className="error-box" style={{ maxHeight: 200, overflow: "auto" }}>{error}</div>}
        <div className="row">
          {project.appUrl && (
            <button
              className="danger"
              onClick={async () => {
                if (!confirm("¿Despublicar? La app dejará de estar en línea.")) return;
                await api(`/projects/${project.id}/unpublish`, { body: {} });
                onDone();
              }}
            >
              Despublicar
            </button>
          )}
          <div className="grow" />
          <button onClick={onClose}>Cerrar</button>
          <button className="primary" disabled={busy || !slug} onClick={publish}>
            {busy ? <span className="spinner" /> : project.appUrl ? "Publicar cambios" : "Publicar"}
          </button>
        </div>
      </div>
    </div>
  );
}
