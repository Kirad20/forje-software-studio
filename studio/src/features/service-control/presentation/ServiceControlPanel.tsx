import { useCallback, useEffect, useMemo, useState } from "react";
import type { ControlledService, ServiceControlSnapshot } from "../../../shared/contracts/api.js";
import { serviceControlController } from "../application/controller.js";
import type { ServiceEnvironment } from "../../../shared/application/service-environment.js";
import "./ServiceControl.css";

type Actions = {
  busy: string;
  onRefresh(): void;
  onScale(service: string, replicas: number, maxConcurrency: number): Promise<void>;
  onRestart(service: string, env: "preview" | "published"): Promise<void>;
};
type Filter = "all" | "service" | "worker" | "failing";

const KIND_LABEL = { service: "API / servicio", worker: "Worker (tareas en segundo plano)", monolith: "Monolito (sin asignar)" } as const;
const STATUS_LABEL: Record<string, string> = { pending: "pendientes", running: "en curso", done: "completadas", succeeded: "completadas", failed: "fallidas" };

const observed = (service: ControlledService) => service.runtime.reduce((n, group) => n + group.replicas.filter((replica) => replica.pid !== null).length, 0);
const failed = (service: ControlledService) => service.queueCounts.failed ?? 0;

export function ServiceControlPanel({ projectId, reloadKey, env = "preview" }: { projectId: string; reloadKey: number; env?: ServiceEnvironment }) {
  const [data, setData] = useState<ServiceControlSnapshot | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const refresh = useCallback(async () => {
    try { setData(await serviceControlController.load(projectId, env)); setError(""); }
    catch (error) { setError((error as Error).message); }
  }, [projectId, env]);
  useEffect(() => { void refresh(); }, [refresh, reloadKey]);
  const execute = async (service: string, action: () => Promise<unknown>) => {
    setBusy(service);
    try { await action(); await refresh(); }
    catch (error) { setError((error as Error).message); }
    finally { setBusy(""); }
  };
  return <div className="sc">
    {error && <p role="alert" className="error-box">{error}</p>}
    {!data ? <p>{error ? "No se pudo cargar el centro de control." : "Cargando servicios…"}</p> :
      <ServiceControlView data={data} env={env} busy={busy} onRefresh={() => void refresh()}
        onScale={(service, replicas, maxConcurrency) => execute(service, () => serviceControlController.scale(projectId, service, { replicas, maxConcurrency }))}
        onRestart={(service, env) => execute(service, () => serviceControlController.restart(projectId, service, env))} />}
  </div>;
}

export function ServiceControlView({ data, env, ...actions }: Actions & { data: ServiceControlSnapshot; env?: ServiceEnvironment }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const stats = useMemo(() => ({
    services: data.services.filter((s) => s.kind === "service").length,
    workers: data.services.filter((s) => s.kind === "worker").length,
    replicas: data.services.reduce((n, s) => n + s.desired.replicas, 0),
    processes: data.services.reduce((n, s) => n + observed(s), 0),
    failed: data.services.reduce((n, s) => n + failed(s), 0),
  }), [data]);
  const visible = data.services.filter((service) => {
    const text = `${service.name} ${service.endpoints.join(" ")} ${service.jobs.join(" ")}`.toLowerCase();
    if (query.trim() && !text.includes(query.trim().toLowerCase())) return false;
    if (filter === "failing") return failed(service) > 0;
    return filter === "all" || service.kind === filter;
  });
  const filters: [Filter, string][] = [["all", `Todos (${data.services.length})`], ["service", "APIs"], ["worker", "Workers"], ["failing", "Con fallos"]];
  return <div className="sc">
    <header className="sc-head">
      <div><h2>Centro de control</h2>
        <p className="muted">Divide tu app en servicios independientes (APIs y workers), decide cuántas copias corren de cada uno y revisa su actividad. Se declaran en <code>forja.services.json</code>; puedes tener tantos como necesites (hasta 64).</p></div>
      <button onClick={actions.onRefresh} disabled={!!actions.busy}>Actualizar</button>
    </header>

    <details className="card sc-help">
      <summary>¿Cómo funciona este panel?</summary>
      <div className="sc-help-grid">
        <div><strong>Servicio</strong>Agrupa endpoints (API). Cada servicio corre en su propio grupo de procesos.</div>
        <div><strong>Worker</strong>Ejecuta tareas en segundo plano (jobs) desde una cola durable. No expone endpoints.</div>
        <div><strong>Réplicas y concurrencia</strong>Réplicas = copias del servicio. Concurrencia = ejecuciones simultáneas por copia. Guardar cambia el manifiesto de preview; publica para aplicarlo.</div>
        <div><strong>Procesos bajo demanda</strong>Las réplicas se crean al ejecutar un endpoint o tarea, no al guardar. Reiniciar cancela ejecuciones en curso.</div>
      </div>
    </details>

    {!data.manifest && <p className="card sc-empty">Compatibilidad monolito: este proyecto no tiene manifiesto de servicios. Las entradas sin asignar siguen en monolith. Pide al agente «extrae este módulo como servicio» para empezar.</p>}

    <div className="sc-stats">
      <div className="card sc-stat"><b>{stats.services}</b><span>Servicios API</span></div>
      <div className="card sc-stat"><b>{stats.workers}</b><span>Workers</span></div>
      <div className="card sc-stat"><b>{stats.replicas}</b><span>Réplicas deseadas</span></div>
      <div className="card sc-stat"><b>{stats.processes}</b><span>Procesos observados</span></div>
      <div className={`card sc-stat${stats.failed ? " err" : ""}`}><b>{stats.failed}</b><span>Tareas fallidas recientes</span></div>
    </div>

    <div className={`sc-banner ${data.runtime.available ? "ok" : "warn"}`}>
      <span className="sc-dot" aria-hidden="true" />
      <div><strong>{data.runtime.available ? "Runtime de aplicaciones disponible" : "Runtime no disponible"}</strong>
        {data.runtime.error && <p>{data.runtime.error}</p>}
        <p className="muted">Los procesos observados pertenecen solo al runtime de aplicaciones. Métricas de procesos de workers remotos no disponibles; esto no indica su salud.</p>
        <p className="muted">{data.queueScope}. {env ? `Contadores de ${env === "published" ? "producción" : "vista previa"}.` : "Los contadores incluyen preview y publicada."}</p></div>
    </div>

    {data.services.length > 4 && <div className="sc-tools" role="search">
      <input type="search" aria-label="Buscar servicio" placeholder="Buscar por servicio, endpoint o job…" value={query} onChange={(event) => setQuery(event.currentTarget.value)} />
      {filters.map(([id, label]) => <button key={id} type="button" className="sc-chip sm" aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>)}
    </div>}

    <div className="sc-list">
      {visible.map((service) => <ServiceCard key={`${env}:${service.name}:${service.desired.replicas}:${service.desired.maxConcurrency}`} service={service} environment={env} runtimeAvailable={data.runtime.available} {...actions} />)}
    </div>
    {!visible.length && <p className="card sc-empty">Ningún servicio coincide con el filtro.</p>}
  </div>;
}

function ServiceCard({ service, environment, runtimeAvailable, ...actions }: Actions & { service: ControlledService; environment?: ServiceEnvironment; runtimeAvailable: boolean }) {
  const [replicas, setReplicas] = useState(service.desired.replicas);
  const [concurrency, setConcurrency] = useState(service.desired.maxConcurrency ?? 1);
  const [env, setEnv] = useState<"preview" | "published">(environment ?? "preview");
  const [confirm, setConfirm] = useState(false);
  const total = observed(service);
  const entries = service.endpoints.length + service.jobs.length;
  return <section className={`card sc-card${failed(service) ? " has-fail" : ""}`} aria-label={`Servicio ${service.name}`}>
    <div className="sc-card-head">
      <div><h3><code>{service.name}</code></h3><p className="muted">{KIND_LABEL[service.kind]}</p></div>
      <span className={`pill ${failed(service) ? "err" : total ? "ok" : ""}`}>{failed(service) ? `${failed(service)} fallidas` : total ? `${total} procesos` : "Sin procesos"}</span>
    </div>

    <div className="sc-metrics">
      <div><b>{service.desired.replicas}</b><span>réplicas</span></div>
      <div><b>{service.desired.maxConcurrency ?? "∞"}</b><span>concurrencia</span></div>
      <div><b>{entries}</b><span>entradas</span></div>
    </div>

    <div className="sc-section"><strong>Entradas asignadas</strong>
      {entries ? <details><summary>{service.endpoints.length} endpoints · {service.jobs.length} jobs</summary>
        <ul>{[...service.endpoints, ...service.jobs].map((file) => <li key={file}><code>{file}</code></li>)}</ul></details> : <p className="muted">Sin entradas asignadas.</p>}</div>

    <div className="sc-section"><strong>{environment === "published" ? "Configuración publicada (producción)" : "Configuración deseada (preview)"}</strong>
      <p>{service.desired.replicas} réplicas · concurrencia por réplica: {service.desired.maxConcurrency ?? "sin límite (compatibilidad)"}</p>
      {service.scalable && <form className="sc-scale" onSubmit={(event) => { event.preventDefault(); void actions.onScale(service.name, replicas, concurrency); }}>
        <label>Réplicas (1–8) <input aria-label={`Réplicas ${service.name}`} type="number" min={1} max={8} step={1} required value={replicas} onChange={(event) => setReplicas(event.currentTarget.valueAsNumber)} /></label>
        <label>Concurrencia (1–32) <input aria-label={`Concurrencia ${service.name}`} type="number" min={1} max={32} step={1} required value={concurrency} onChange={(event) => setConcurrency(event.currentTarget.valueAsNumber)} /></label>
        <button className="primary" disabled={!!actions.busy}>Guardar escala</button>
      </form>}</div>

    <div className="sc-section"><strong>Procesos observados en app-runtime</strong>
      {!runtimeAvailable ? <p className="muted">No disponibles</p> : total === 0 ? <p className="muted">Sin procesos observados en este runtime; inicio bajo demanda. No es una comprobación de salud.</p> :
        service.runtime.map((group) => <p key={group.env}><span className="pill accent">{group.env}</span> {group.replicas.filter((replica) => replica.pid !== null).length} procesos · {group.replicas.filter((replica) => replica.pid !== null && replica.ready).length} listos · {group.replicas.reduce((n, replica) => n + replica.active, 0)} ejecuciones activas
          <span className="muted"> · PID: {group.replicas.map((replica) => replica.pid ?? "iniciando").join(", ")}</span></p>)}
      {service.kind === "worker" && <p className="muted">Procesos del worker de cola: métricas no disponibles desde app-runtime.</p>}</div>

    <div className="sc-restart">
      <label>Entorno a reiniciar <select aria-label={`Entorno ${service.name}`} value={env} onChange={(event) => { setEnv(event.target.value as typeof env); setConfirm(false); }}>
        <option value="preview">preview</option><option value="published">published</option></select></label>
      <button disabled={!!actions.busy || !runtimeAvailable} onClick={() => setConfirm(true)}>Reiniciar</button>
    </div>
    {confirm && <div role="alert" className="sc-confirm"><p>Reiniciar {service.name} ({env}) cancela ejecuciones en curso de este runtime. No reinicia workers remotos. Los procesos arrancan con la próxima ejecución; no es una pausa persistente.</p>
      <div className="row"><button className="danger" disabled={!!actions.busy} onClick={() => { setConfirm(false); void actions.onRestart(service.name, env); }}>Confirmar reinicio</button><button onClick={() => setConfirm(false)}>Cancelar</button></div></div>}

    <div className="sc-section"><strong>Cola reciente</strong>
      <p>{Object.entries(service.queueCounts).map(([status, count]) => `${count} ${STATUS_LABEL[status] ?? status}`).join(" · ") || "Sin tareas en la muestra reciente."}</p>
      {service.lastFailure && <p className="sc-fail" role="status">Último fallo: {service.lastFailure}</p>}
      {!!service.queue.length && <details><summary>Detalle de tareas ({service.queue.length})</summary><div className="sc-table"><table><thead><tr><th>Tarea</th><th>Entorno</th><th>Estado</th><th>Intentos</th><th>Fallo</th></tr></thead><tbody>
        {service.queue.map((entry) => <tr key={entry.id}><td><code>{entry.job}</code><br /><small>{entry.id}</small></td><td>{entry.env}</td><td>{entry.status}</td><td>{entry.attempts}/{entry.maxAttempts}</td><td>{entry.error ?? "—"}</td></tr>)}
      </tbody></table></div></details>}</div>
  </section>;
}
