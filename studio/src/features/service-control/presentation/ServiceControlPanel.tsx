import { useCallback, useEffect, useState } from "react";
import type { ControlledService, ServiceControlSnapshot } from "../../../shared/contracts/api.js";
import { serviceControlController } from "../application/controller.js";

type Actions = {
  busy: string;
  onRefresh(): void;
  onScale(service: string, replicas: number, maxConcurrency: number): Promise<void>;
  onRestart(service: string, env: "preview" | "published"): Promise<void>;
};
export function ServiceControlPanel({ projectId, reloadKey }: { projectId: string; reloadKey: number }) {
  const [data, setData] = useState<ServiceControlSnapshot | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const refresh = useCallback(async () => {
    try { setData(await serviceControlController.load(projectId)); setError(""); }
    catch (error) { setError((error as Error).message); }
  }, [projectId]);
  useEffect(() => { void refresh(); }, [refresh, reloadKey]);
  const execute = async (service: string, action: () => Promise<unknown>) => {
    setBusy(service);
    try { await action(); await refresh(); }
    catch (error) { setError((error as Error).message); }
    finally { setBusy(""); }
  };
  return <div className="stack">
    {error && <p role="alert" className="error">{error}</p>}
    {!data ? <p>{error ? "No se pudo cargar el centro de control." : "Cargando servicios…"}</p> :
      <ServiceControlView data={data} busy={busy} onRefresh={() => void refresh()}
        onScale={(service, replicas, maxConcurrency) => execute(service, () => serviceControlController.scale(projectId, service, { replicas, maxConcurrency }))}
        onRestart={(service, env) => execute(service, () => serviceControlController.restart(projectId, service, env))} />}
  </div>;
}
export function ServiceControlView({ data, ...actions }: Actions & { data: ServiceControlSnapshot }) {
  return <div className="stack">
    <header className="panel-head"><div><h2>Centro de control</h2><p className="muted">Servicios y workers declarados en forja.services.json.</p></div>
      <button onClick={actions.onRefresh} disabled={!!actions.busy}>Actualizar</button></header>
    <p className="muted">Configuración deseada de preview. Guardar cambia el manifiesto del proyecto; publica para aplicar la escala a la app publicada.
      Las réplicas se crean bajo demanda al ejecutar un endpoint o tarea, no al guardar.</p>
    {!data.manifest && <p className="card">Compatibilidad monolito: este proyecto no tiene manifiesto de servicios. Las entradas sin asignar siguen en monolith.</p>}
    <div className="card">
      <strong>{data.runtime.available ? "Runtime de aplicaciones disponible" : "Runtime no disponible"}</strong>
      {data.runtime.error && <p>{data.runtime.error}</p>}
      <p className="muted">Los procesos observados pertenecen solo al runtime de aplicaciones. Métricas de procesos de workers remotos no disponibles; esto no indica su salud.</p>
      <p className="muted">{data.queueScope}. Los contadores incluyen preview y publicada.</p>
    </div>
    {data.services.map((service) => <ServiceCard key={`${service.name}:${service.desired.replicas}:${service.desired.maxConcurrency}`} service={service} runtimeAvailable={data.runtime.available} {...actions} />)}
  </div>;
}
function ServiceCard({ service, runtimeAvailable, ...actions }: Actions & { service: ControlledService; runtimeAvailable: boolean }) {
  const [replicas, setReplicas] = useState(service.desired.replicas);
  const [concurrency, setConcurrency] = useState(service.desired.maxConcurrency ?? 1);
  const [env, setEnv] = useState<"preview" | "published">("preview");
  const [confirm, setConfirm] = useState(false);
  const total = service.runtime.reduce((n, group) => n + group.replicas.filter((replica) => replica.pid !== null).length, 0);
  return <section className="card stack" aria-label={`Servicio ${service.name}`}>
    <h3><code>{service.name}</code> · {service.kind}</h3>
    <div><strong>Entradas asignadas</strong><ul>{[...service.endpoints, ...service.jobs].map((file) => <li key={file}><code>{file}</code></li>)}</ul>
      {!service.endpoints.length && !service.jobs.length && <p className="muted">Sin entradas asignadas.</p>}</div>
    <div><strong>Configuración deseada (preview)</strong><p>{service.desired.replicas} réplicas · concurrencia por réplica: {service.desired.maxConcurrency ?? "sin límite (compatibilidad)"}</p></div>
    {service.scalable && <form className="row" onSubmit={(event) => { event.preventDefault(); void actions.onScale(service.name, replicas, concurrency); }}>
      <label>Réplicas <input aria-label={`Réplicas ${service.name}`} type="number" min={1} max={8} step={1} required value={replicas} onChange={(event) => setReplicas(event.currentTarget.valueAsNumber)} /></label>
      <label>Concurrencia <input aria-label={`Concurrencia ${service.name}`} type="number" min={1} max={32} step={1} required value={concurrency} onChange={(event) => setConcurrency(event.currentTarget.valueAsNumber)} /></label>
      <button disabled={!!actions.busy}>Guardar escala</button>
    </form>}
    <div><strong>Procesos observados en app-runtime</strong>
      {!runtimeAvailable ? <p className="muted">No disponibles</p> : total === 0 ? <p className="muted">Sin procesos observados en este runtime; inicio bajo demanda. No es una comprobación de salud.</p> :
        service.runtime.map((group) => <p key={group.env}>{group.env}: {group.replicas.filter((replica) => replica.pid !== null).length} procesos · {group.replicas.filter((replica) => replica.pid !== null && replica.ready).length} listos · {group.replicas.reduce((n, replica) => n + replica.active, 0)} ejecuciones activas
          <span className="muted"> · PID: {group.replicas.map((replica) => replica.pid ?? "iniciando").join(", ")}</span></p>)}
      {service.kind === "worker" && <p className="muted">Procesos del worker de cola: métricas no disponibles desde app-runtime.</p>}
    </div>
    <div className="row"><label>Entorno a reiniciar <select aria-label={`Entorno ${service.name}`} value={env} onChange={(event) => { setEnv(event.target.value as typeof env); setConfirm(false); }}>
      <option value="preview">preview</option><option value="published">published</option></select></label>
      <button disabled={!!actions.busy || !runtimeAvailable} onClick={() => setConfirm(true)}>Reiniciar</button></div>
    {confirm && <div role="alert" className="stack"><p>Reiniciar {service.name} ({env}) cancela ejecuciones en curso de este runtime. No reinicia workers remotos. Los procesos arrancan con la próxima ejecución; no es una pausa persistente.</p>
      <div className="row"><button disabled={!!actions.busy} onClick={() => { setConfirm(false); void actions.onRestart(service.name, env); }}>Confirmar reinicio</button><button onClick={() => setConfirm(false)}>Cancelar</button></div></div>}
    <div><strong>Cola reciente</strong><p>{Object.entries(service.queueCounts).map(([status, count]) => `${status}: ${count}`).join(" · ") || "Sin tareas en la muestra reciente."}</p>
      {service.lastFailure && <p role="status">Último fallo: {service.lastFailure}</p>}
      {!!service.queue.length && <details><summary>Detalle de tareas ({service.queue.length})</summary><table className="grid"><thead><tr><th>Tarea</th><th>Entorno</th><th>Estado</th><th>Intentos</th><th>Fallo</th></tr></thead><tbody>
        {service.queue.map((entry) => <tr key={entry.id}><td><code>{entry.job}</code><br /><small>{entry.id}</small></td><td>{entry.env}</td><td>{entry.status}</td><td>{entry.attempts}/{entry.maxAttempts}</td><td>{entry.error ?? "—"}</td></tr>)}
      </tbody></table></details>}
    </div>
  </section>;
}
