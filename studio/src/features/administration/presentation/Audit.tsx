import { useEffect, useState } from "react";
import { api } from "../application/controller.js";
import type { AuditReport, AuditStep } from "../application/audit.js";
import { contextChange } from "../application/audit.js";

const count = (value: number) => value.toLocaleString("es");
const money = (value: number) => `$${value.toFixed(5)}`;
const when = (value: string) => new Date(value).toLocaleString("es");
const missing = "No registrado";

function ContextTrend({ steps }: { steps: AuditStep[] }) {
  const points = [...steps].reverse().filter(step => step.context !== null);
  if (!points.length) return <div className="small muted">{missing}: contexto de estas peticiones.</div>;
  const max = Math.max(1, ...points.map(step => step.context!.estimatedInputTokens));
  const x = (index: number) => 10 + index * 580 / Math.max(1, points.length - 1);
  const y = (step: AuditStep) => 110 - step.context!.estimatedInputTokens / max * 100;
  return <div>
    <svg viewBox="0 0 600 125" role="img" aria-label="Contexto estimado por petición en orden temporal" style={{ width: "100%", maxHeight: 150 }}>
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points.map((step, index) => `${x(index)},${y(step)}`).join(" ")} />
      {points.map((step, index) => <circle key={step.id} cx={x(index)} cy={y(step)} r="3" fill="currentColor">
        <title>{`${step.phase} · ${step.requestedModel} · ${count(step.context!.estimatedInputTokens)} tokens estimados · ${when(step.at)}`}</title>
      </circle>)}
    </svg>
    <div className="small muted">Peticiones registradas de este turno (página actual); escala máxima {count(max)} tokens estimados. Las fases pueden usar contextos distintos.</div>
  </div>;
}

function Step({ step, previous }: { step: AuditStep; previous?: AuditStep }) {
  const context = step.context;
  const change = contextChange(step, previous);
  const delta = (value: number) => `${value > 0 ? "+" : ""}${count(value)}`;
  return <details>
    <summary className="small" style={{ cursor: "pointer" }}>
      {when(step.at)} · {step.role} / {step.phase} · {step.requestedModel} · {count(step.inputTokens)} entrada · {money(step.usd)} {step.failed && "· fallo (uso puede faltar)"}
    </summary>
    <div className="stack small" style={{ gap: 5, padding: "8px 0" }}>
      <div>Proyecto: {step.projectId ?? missing} · Agente: {step.agentId ?? missing} · Tarea: {step.taskId ?? missing}</div>
      <div>Operación: <code>{step.traceId}</code> · Patrón: {step.pattern ?? missing} · Esfuerzo: {step.effort}</div>
      <div>Estado: {step.status ?? missing} · Modelo final elegido: {step.finalModelId ?? missing} · Fin de este paso: {step.stopReason ?? missing}</div>
      {step.retryOf && <div>Reintento del paso: <code>{step.retryOf}</code></div>}
      <div>Proveedor solicitado: {step.provider} · Servido por: {step.servedModel ?? missing} · {count(step.ms)} ms</div>
      <div>Uso proveedor: entrada {count(step.inputTokens)} · salida {count(step.outputTokens)} · caché lectura {count(step.cacheReadTokens)} / escritura {count(step.cacheWriteTokens)} · {step.credits} créditos</div>
      {context ? <>
        <strong>Contexto estimado: {count(context.estimatedInputTokens)} tokens</strong>
        <div>Sistema {count(context.systemTokens)} · historial {count(context.historyTokens)} · esquemas de herramientas {count(context.toolSchemaTokens)} · framing {count(context.framingTokens)}</div>
        <div>Bytes medidos: sistema {count(context.systemBytes)} · historial {count(context.historyBytes)} · esquemas {count(context.toolSchemaBytes)}</div>
        <div>Mensajes {count(context.messages)} · imágenes {count(context.images)} · tokens de imagen estimados {context.imageTokens === undefined ? missing : count(context.imageTokens)} · bytes {context.imageBytes === undefined ? missing : count(context.imageBytes)} (tokenización exacta: {missing})</div>
        <div>Historial de herramientas: llamadas {count(context.toolCalls)} · resultados {count(context.toolResults)} · {count(context.toolResultBytes)} bytes</div>
        <div>Lecturas de archivos en contexto: {count(context.fileReadCalls)} · archivos solicitados {count(context.requestedFileCount)} · resultados {count(context.fileToolResultBytes)} bytes</div>
        {change && <div className="muted">
          Delta frente a la petición anterior registrada del mismo agente, turno y fase:
          total estimado {delta(change.estimatedTokens)} · sistema {delta(change.systemTokens)} · historial (incluye imágenes) {delta(change.historyTokens)} · esquemas {delta(change.toolSchemaTokens)} tokens;
          historial {delta(change.historyBytes)} / resultados de herramientas {delta(change.toolResultBytes)} bytes medidos · imágenes {delta(change.images)}.
          Son diferencias de snapshots, no causalidad demostrada.
        </div>}
      </> : <strong className="muted">Desglose de contexto: {missing}</strong>}
    </div>
  </details>;
}

export function Audit() {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [project, setProject] = useState("");
  const [days, setDays] = useState("7");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = async (offset = 0, retainWindow = false) => {
    setBusy(true);
    setError("");
    const to = retainWindow && report ? report.window.to : new Date().toISOString();
    const from = retainWindow && report ? report.window.from : new Date(Date.parse(to) - Number(days) * 86_400_000).toISOString();
    const params = new URLSearchParams({ from, to, limit: "50", offset: String(offset) });
    const projectId = retainWindow && report ? report.window.projectId : project.trim();
    if (projectId) params.set("projectId", projectId);
    try { setReport(await api<AuditReport>(`/admin/audit?${params}`)); }
    catch (cause) { setError((cause as Error).message); }
    finally { setBusy(false); }
  };
  useEffect(() => { void load(); }, []);
  const turns = new Map<string, AuditStep[]>();
  for (const step of report?.timeline ?? []) {
    const key = `${step.projectId ?? missing} / ${step.turnId ?? `operación ${step.traceId}`}`;
    turns.set(key, [...turns.get(key) ?? [], step]);
  }
  const hasMore = report && Object.values(report.pagination).some(Boolean);
  return <div className="stack" style={{ gap: 16 }}>
    <form className="row" style={{ flexWrap: "wrap" }} onSubmit={event => { event.preventDefault(); void load(); }}>
      <label className="small">Proyecto (ID; vacío = plataforma)
        <input value={project} maxLength={200} onChange={event => setProject(event.target.value)} placeholder="ID de proyecto" />
      </label>
      <label className="small">Ventana
        <select value={days} onChange={event => setDays(event.target.value)}>
          <option value="1">24 horas</option><option value="7">7 días</option><option value="31">31 días</option>
        </select>
      </label>
      <button disabled={busy}>Consultar</button>
    </form>
    {error && <div role="alert" className="small">{error}</div>}
    {busy && <div className="small muted">Cargando auditoría…</div>}
    {report && <>
      <div className="small muted">{when(report.window.from)} — {when(report.window.to)} · Proyecto: {report.window.projectId ?? "Toda la plataforma"}</div>
      <section className="card stack" style={{ padding: 16, gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Uso y cobertura</h2>
        <div>{count(report.summary.calls)} llamadas · {money(report.summary.usd)} · {count(report.summary.credits)} créditos</div>
        <div className="small">Entrada {count(report.summary.inputTokens)} · salida {count(report.summary.outputTokens)} · caché lectura {count(report.summary.cacheReadTokens)} / escritura {count(report.summary.cacheWriteTokens)}</div>
        <div className="small">{count(report.summary.turns)} turnos · {count(report.summary.tasks)} tareas · {count(report.summary.traces)} operaciones Fusion · {count(report.summary.failedCalls)} fallos</div>
        <div className="small">{count(report.summary.retries)} reintentos registrados · {count(report.summary.additionalCalls)} llamadas adicionales (incluye revisión/escalado) · {count(report.summary.modelSwitches)} cambios de modelo solicitado · {count(report.summary.degradations)} operaciones con avisos/degradación</div>
        <div className="small muted">{report.evidence.retries}</div>
        <div className="small">Contexto registrado en {count(report.summary.contextRecordedCalls)} / {count(report.summary.fusionCalls)} llamadas Fusion. {count(report.summary.legacyCalls)} llamadas históricas sin fases/contexto.</div>
        <div className="small muted">{report.evidence.usage} {report.evidence.legacy}</div>
      </section>
      <section className="card stack" style={{ padding: 16, gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Modelos, proveedores y fases</h2>
        {!report.stages.length && <div className="small muted">Sin pasos Fusion registrados en esta ventana.</div>}
        {report.stages.map((stage, index) => <div className="small" key={index}>
          <strong>{stage.phase} · {stage.requestedModel}</strong> · proveedor {stage.provider} · servido {stage.servedModel ?? missing}
          <div>{count(stage.calls)} llamadas · {count(stage.failures)} fallos · entrada {count(stage.inputTokens)} / salida {count(stage.outputTokens)} · caché {count(stage.cacheReadTokens)} / {count(stage.cacheWriteTokens)} · {money(stage.usd)} · {count(stage.credits)} créditos</div>
        </div>)}
      </section>
      <section className="card stack" style={{ padding: 16, gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Turnos y crecimiento de contexto</h2>
        <p className="small muted" style={{ margin: 0 }}>{report.evidence.context} {report.evidence.attribution}</p>
        {!turns.size && <div className="small muted">Sin peticiones con detalle registrado.</div>}
        {[...turns].map(([turn, steps]) => <details key={turn}>
          <summary style={{ cursor: "pointer" }} className="small">Proyecto / turno: {turn} · {steps.length} pasos en esta página</summary>
          <ContextTrend steps={steps} />
          <div className="stack" style={{ gap: 8 }}>{steps.map((step, index) => <Step key={step.id} step={step}
            previous={steps.slice(index + 1).find(candidate => candidate.context && candidate.role === step.role
              && candidate.phase === step.phase && candidate.agentId === step.agentId && candidate.taskId === step.taskId)} />)}</div>
        </details>)}
      </section>
      <section className="card stack" style={{ padding: 16, gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Archivos y compactación</h2>
        <div className="small">{count(report.summary.fileReadEvents)} eventos de lectura · archivos solicitados {report.summary.fileReadCountRecordedEvents ? count(report.summary.requestedFiles) : missing} · bytes de resultados medidos {report.summary.fileReadBytesRecordedEvents ? count(report.summary.fileReadBytes) : missing}</div>
        <div className="small muted">Cobertura de lecturas: cantidades en {count(report.summary.fileReadCountRecordedEvents)} / {count(report.summary.fileReadEvents)} eventos; bytes en {count(report.summary.fileReadBytesRecordedEvents)} / {count(report.summary.fileReadEvents)}.</div>
        <div className="small">{count(report.summary.compactions)} compactaciones · delta neto estimado antes − después: {report.summary.compactionDeltaRecordedEvents ? count(report.summary.estimatedCompactionDelta) : missing} tokens (negativo = creció) · cobertura {count(report.summary.compactionDeltaRecordedEvents)} / {count(report.summary.compactions)} eventos</div>
        <p className="small muted" style={{ margin: 0 }}>Solo eventos registrados. Los bytes leídos no prueban su contribución al siguiente prompt. La reducción de contexto no demuestra mejora de calidad, latencia ni coste.</p>
        {report.events.map(event => <div className="small" key={event.id}>
          {when(event.timestamp)} · {event.kind === "compaction" ? "Compactación" : "Lectura de archivos"} · {event.measured ? "medido" : "estimado"} · turno {event.turnId ?? missing} · agente {event.agentId ?? missing}
          {event.kind === "compaction"
            ? <div>Antes {event.beforeTokens === undefined ? missing : count(event.beforeTokens)} → después {event.afterTokens === undefined ? missing : count(event.afterTokens)} tokens</div>
            : <div>{event.count === undefined ? missing : count(event.count)} archivos · {event.bytes === undefined ? missing : count(event.bytes)} bytes</div>}
        </div>)}
        {!report.events.length && <div className="small muted">Eventos de lectura/compactación: {missing} en esta página.</div>}
      </section>
      <section className="card stack" style={{ padding: 16, gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Actividad administrativa</h2>
        <div className="small muted">{report.evidence.activity}</div>
        {report.activity.map(item => <div className="small" key={item.id}>{when(item.at)} · {item.action} · <code>{item.key}</code> · administrador {item.actorId ?? missing}</div>)}
        {!report.activity.length && <div className="small muted">Sin cambios registrados en esta página.</div>}
      </section>
      <div className="row">
        <button disabled={busy || report.window.offset === 0} onClick={() => void load(Math.max(0, report.window.offset - 50), true)}>Anterior</button>
        <span className="small muted">Página {1 + report.window.offset / 50}</span>
        <button disabled={busy || !hasMore || report.window.offset >= 10000} onClick={() => void load(report.window.offset + 50, true)}>Siguiente</button>
      </div>
    </>}
  </div>;
}
