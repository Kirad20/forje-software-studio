import { useCallback, useEffect, useRef, useState } from "react";
import type { Project } from "../../../shared/contracts/index.js";
import { Switch } from "../../../shared/ui.js";
import { api, type RepositoryConfig, type RepositorySnapshot } from "../application/controller.js";
import "./repository.css";

export function RepositoryWorkspace({ project, reloadKey, onChange, showPreview = true }: {
  project: Project; reloadKey: number; onChange(): void; showPreview?: boolean;
}) {
  const [data, setData] = useState<RepositorySnapshot | null>(null);
  const [draft, setDraft] = useState<RepositoryConfig | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [revisionId, setRevisionId] = useState("");
  const [rollbackId, setRollbackId] = useState("");
  const [slug, setSlug] = useState(project.slug ?? project.suggestedSlug);
  const [nonce, setNonce] = useState(0);
  const [logEnv, setLogEnv] = useState<"preview" | "published">("preview");
  const [runtimeLogs, setRuntimeLogs] = useState("");
  const alive = useRef(true);
  const epoch = useRef(0);
  const endpoint = `/projects/${project.id}/repository`;
  const owner = project.access !== "editor";
  useEffect(() => {
    if (!owner) { setLogEnv("preview"); setRuntimeLogs(""); }
  }, [owner]);
  const accept = useCallback((snapshot: RepositorySnapshot) => {
    if (!alive.current) return;
    setData(snapshot);
    setDraft((previous) => previous ?? snapshot.config);
    setRevisionId((previous) => previous || snapshot.preview?.id || "");
  }, []);
  const refresh = useCallback(async () => {
    const current = epoch.current;
    try {
      const snapshot = await api<RepositorySnapshot>(endpoint);
      if (current === epoch.current) accept(snapshot);
    } catch (err) { if (alive.current && current === epoch.current) setError((err as Error).message); }
  }, [endpoint, accept]);
  useEffect(() => {
    alive.current = true;
    void refresh();
    return () => { alive.current = false; epoch.current++; };
  }, [refresh, reloadKey]);
  useEffect(() => {
    if (busy !== "build" && data?.status !== "building") return;
    const timer = setInterval(() => void refresh(), 3000);
    return () => clearInterval(timer);
  }, [busy, data?.status, refresh]);
  const execute = async (action: string, body: unknown) => {
    epoch.current++;
    setBusy(action);
    setError("");
    try {
      const snapshot = await api<RepositorySnapshot>(action === "configure" ? endpoint : `${endpoint}/${action}`, {
        method: action === "configure" ? "PATCH" : "POST", body,
      });
      if (!alive.current) return;
      epoch.current++;
      accept(snapshot);
      if (action === "configure") setDraft(snapshot.config);
      if (action === "build") {
        setRuntimeLogs("");
        setRevisionId(snapshot.preview?.id ?? "");
        setNonce((previous) => previous + 1);
      }
      onChange();
    } catch (err) { epoch.current++; if (alive.current) setError((err as Error).message); }
    finally { if (alive.current) setBusy(""); }
  };
  const disabled = !!busy || !data?.available;
  const ready = data?.revisions.filter((revision) => revision.status === "ready") ?? [];
  const loadLogs = async () => {
    setBusy("logs");
    setError("");
    try {
      const result = await api<{ logs: string }>(`${endpoint}/logs?env=${logEnv}`);
      if (alive.current) setRuntimeLogs(result.logs);
    } catch (err) { if (alive.current) setError((err as Error).message); }
    finally { if (alive.current) setBusy(""); }
  };
  const setPrivate = async (privateApp: boolean) => {
    setBusy("visibility");
    setError("");
    try {
      await api(`/projects/${project.id}`, { method: "PATCH", body: { visibility: privateApp ? "private" : "public" } });
      if (alive.current) onChange();
    } catch (err) { if (alive.current) setError((err as Error).message); }
    finally { if (alive.current) setBusy(""); }
  };
  return <div className="repository-workspace">
    <section className="repository-controls stack">
      <div className="row" style={{ flexWrap: "wrap" }}>
        <h2 className="grow">Repositorio Docker / Node</h2>
        <button disabled={!!busy} onClick={() => { setError(""); void refresh(); }}>Actualizar estado</button>
      </div>
      <p className="small muted">El código mantiene su estructura original. Preview y producción tienen datos, secretos y almacenamiento independientes.</p>
      {owner && <div className="stack">
        <Switch on={project.visibility === "private"} onChange={(value) => void setPrivate(value)} label="Publicación privada" disabled={!!busy} />
        <p className="small muted">Los repositorios nuevos nacen privados. Inicializa las cuentas de tu aplicación antes de hacerla pública; producción no copia las cuentas de preview.</p>
      </div>}
      {error && <div className="error-box" role="alert">{error}</div>}
      {!data ? <p role="status">{error ? "No se pudo cargar el runtime." : "Cargando runtime…"}</p> : <>
        {!data.available && <div className="error-box" role="alert">Runner Docker no disponible. El administrador debe configurar FORJA_REPOSITORY_RUNNER=docker en un runner aislado.</div>}
        {data.error && data.error !== error && <div className="error-box" role="alert">{data.error}</div>}
        <div className="row" style={{ flexWrap: "wrap" }}>
          <span className="pill">{busy === "build" || data.status === "building" ? "Construyendo y verificando salud…" : data.preview ? "Vista previa lista" : "Sin vista previa"}</span>
          <button className="primary" disabled={disabled} onClick={() => void execute("build", {})}>
            {busy === "build" ? "Construyendo…" : "Construir vista previa"}
          </button>
          {data.preview && <a className="btn" href={project.previewUrl} target="_blank" rel="noreferrer">Abrir vista previa</a>}
          {owner && data.preview && <button disabled={disabled} onClick={() => void execute("stop", { env: "preview" })}>Detener vista previa</button>}
        </div>
        {owner && draft && <details>
          <summary>Configuración de ejecución</summary>
          <form className="stack" onSubmit={(event) => { event.preventDefault(); void execute("configure", draft); }}>
            <div className="repository-fields">
              <label>Directorio raíz<input value={draft.rootDirectory} disabled={!!busy} onChange={(event) => setDraft({ ...draft, rootDirectory: event.target.value })} /></label>
              <label>Dockerfile (vacío para Node)<input value={draft.dockerfile ?? ""} disabled={!!busy} onChange={(event) => setDraft({ ...draft, dockerfile: event.target.value || null })} /></label>
              <label>Puerto HTTP<input type="number" min={1} max={65535} required value={draft.port} disabled={!!busy} onChange={(event) => setDraft({ ...draft, port: event.target.valueAsNumber })} /></label>
              <label>Ruta de salud<input value={draft.healthPath} disabled={!!busy} onChange={(event) => setDraft({ ...draft, healthPath: event.target.value })} /></label>
              <label>Volumen persistente<input value={draft.storagePath ?? ""} disabled={!!busy} onChange={(event) => setDraft({ ...draft, storagePath: event.target.value || null })} /></label>
              <label className="row"><input type="checkbox" checked={draft.postgres} disabled={!!busy} onChange={(event) => setDraft({ ...draft, postgres: event.target.checked })} /> PostgreSQL independiente por entorno</label>
            </div>
            <p className="small muted">Los cambios se aplican en la siguiente construcción, sin alterar la imagen publicada.</p>
            <div><button disabled={!!busy}>Guardar configuración</button></div>
          </form>
        </details>}
        {owner && <details open={!!data.preview}>
          <summary>Publicación y versiones</summary>
          <div className="stack">
            <label>Nombre público<input aria-label="Nombre público" value={slug} disabled={!!busy || !!project.slug} onChange={(event) => setSlug(event.target.value)} /></label>
            <label>Imagen probada<select aria-label="Imagen probada" value={revisionId} disabled={disabled} onChange={(event) => setRevisionId(event.target.value)}>
              <option value="">Selecciona una imagen saludable</option>
              {ready.map((revision) => <option key={revision.id} value={revision.id}>{revision.id}</option>)}
            </select></label>
            <div><button className="primary" disabled={disabled || !slug || !revisionId} onClick={() => void execute("publish", { slug, revisionId })}>Publicar imagen probada</button></div>
            {data.published && <p role="status">Imagen publicada: <code>{data.published.id}</code></p>}
            <p className="small muted">Rollback restaura únicamente el código. No revierte migraciones ni datos.</p>
            {data.published && ready.some((revision) => revision.id !== data.published?.id) && <>
              <label>Versión para rollback<select aria-label="Versión para rollback" value={rollbackId} disabled={disabled} onChange={(event) => setRollbackId(event.target.value)}>
                <option value="">Selecciona una versión anterior</option>
                {ready.filter((revision) => revision.id !== data.published?.id).map((revision) => <option key={revision.id} value={revision.id}>{revision.id}</option>)}
              </select></label>
              <div><button disabled={disabled || !rollbackId} onClick={() => {
                if (confirm("¿Restaurar esta imagen? No se revierten migraciones ni datos.")) void execute("rollback", { revisionId: rollbackId });
              }}>Restaurar imagen</button></div>
            </>}
            {data.published && <div><button className="danger" disabled={disabled} onClick={() => {
              if (confirm("¿Despublicar esta aplicación? Sus datos se conservarán.")) void execute("stop", { env: "published" });
            }}>Despublicar repositorio</button></div>}
          </div>
        </details>}
        <details open={!!data.logs || !!busy || !!data.error}>
          <summary>Logs de construcción y ejecución</summary>
          <pre className="repository-logs">{data.logs || "Sin logs todavía."}</pre>
          <div className="row" style={{ flexWrap: "wrap" }}>
            <label>Entorno de logs<select aria-label="Entorno de logs" value={logEnv} onChange={(event) => { setLogEnv(event.target.value === "published" ? "published" : "preview"); setRuntimeLogs(""); }}>
              <option value="preview">Vista previa</option>{owner && <option value="published">Producción</option>}
            </select></label>
            <button disabled={disabled || !(logEnv === "preview" ? data.preview : data.published)} onClick={() => void loadLogs()}>Cargar logs de ejecución</button>
          </div>
          {runtimeLogs && <pre className="repository-logs">{runtimeLogs}</pre>}
        </details>
      </>}
    </section>
    {showPreview && data?.preview && <iframe key={`${data.preview.id}:${reloadKey}:${nonce}`} className="repository-preview" title="Vista previa del repositorio" src={project.previewUrl} />}
  </div>;
}
