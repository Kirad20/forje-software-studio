import { useEffect, useRef, useState } from "react";
import { api } from "../application/controller.js";
import { Select } from "../../../shared/ui.js";
import { playgroundModel } from "../application/model-readiness.js";
import { ModelSetupSteps } from "./ModelSetupSteps.js";

interface RoleInfo {
  role: string;
  maxSteps: number;
  tools: string[];
}

type AgentEvent = { type: "text"; text: string } | { type: "tool_start"; id: string; name: string; summary: string } | { type: "tool_end"; id: string; ok: boolean; output: string } | { type: string; [k: string]: unknown };

interface RunView {
  id: string;
  status: "running" | "done" | "failed" | "cancelled";
  role: string;
  modelId: string;
  prompt: string;
  budgetUsd: number;
  events: AgentEvent[];
  result?: { text: string; usd: number; steps: { tool: string; ok: boolean }[]; gate: string | null; buildOk: boolean | null; hitStepLimit: boolean; inputTokens: number; outputTokens: number; files: Record<string, string> };
  error?: string;
}

const ROLE_LABEL: Record<string, string> = {
  fast: "Rápido (cambios pequeños, todo el manual)",
  data: "Datos (tablas y tipos)",
  backend: "Backend (endpoints)",
  ui: "Interfaz (páginas y componentes)",
  chat: "Chat (solo lee y responde)",
};

/** Admin → Agentes: run one agent of one role on one model, in a throwaway project, and watch it work. */
export function Agents() {
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [models, setModels] = useState<{ id: string; label: string; available: boolean; allowed: boolean; tools: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [role, setRole] = useState("backend");
  const [model, setModel] = useState("");
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState("");
  const [run, setRun] = useState<RunView | null>(null);
  const [error, setError] = useState("");
  const [pollError, setPollError] = useState("");
  const [runId, setRunId] = useState("");
  const poll = useRef<number | undefined>(undefined);
  const generation = useRef(0);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [roleData, modelData] = await Promise.all([
        api<{ roles: RoleInfo[] }>("/admin/agents/roles"),
        api<{ models: typeof models }>("/admin/models"),
      ]);
      setRoles(roleData.roles);
      setModels(modelData.models);
    } catch (e) { setError((e as Error).message); } finally { setLoading(false); }
  };
  useEffect(() => {
    void load();
    return () => { generation.current++; window.clearTimeout(poll.current); };
  }, []);

  const compatible = models.filter((m) => playgroundModel(m, role));
  useEffect(() => {
    setModel((selected) => compatible.some((m) => m.id === selected) ? selected : compatible[0]?.id ?? "");
  }, [models, role]);

  const watch = (id: string) => {
    window.clearTimeout(poll.current);
    const current = ++generation.current;
    setPollError("");
    const tick = async () => {
      try {
        const r = await api<RunView>(`/admin/agents/runs/${id}`);
        if (current !== generation.current) return;
        setRun(r);
        if (r.status === "running") poll.current = window.setTimeout(tick, 1500);
      } catch (e) {
        if (current === generation.current) setPollError(`No se pudo consultar la ejecución: ${(e as Error).message}`);
      }
    };
    void tick();
  };
  const start = async () => {
    setError("");
    let initial: Record<string, string> | undefined;
    if (files.trim()) {
      try {
        const parsed: unknown = JSON.parse(files);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || Object.values(parsed).some((value) => typeof value !== "string")) {
          throw new Error("Formato no válido");
        }
        initial = Object.fromEntries(Object.entries(parsed));
      } catch {
        return setError("Los archivos iniciales deben ser JSON: { \"ruta\": \"contenido\" }");
      }
    }
    setStarting(true);
    try {
      const r = await api<{ runId: string }>("/admin/agents/runs", { body: { role, modelId: model, prompt, files: initial } });
      setRunId(r.runId);
      setRun(null);
      watch(r.runId);
    } catch (e) {
      setError((e as Error).message);
    } finally { setStarting(false); }
  };
  const info = roles.find((r) => r.role === role);
  const running = starting || run?.status === "running" || (!!runId && !run);

  return (
    <div className="stack" style={{ gap: 16 }}>
      <ModelSetupSteps current="agents" />
      <p className="small muted" style={{ margin: 0 }}>
        Ejecuta un solo agente con el modelo que elijas, en un proyecto desechable de la cuenta interna: no toca proyectos ni créditos de nadie y el enrutador no aprende de ello. El gasto cuenta para los topes de los evals.
      </p>
      <section className="card stack" style={{ padding: 16 }}>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <label className="small">
            Rol
            <Select label="Rol del agente" value={role} onValueChange={setRole} disabled={loading || running} style={{ width: 280 }}
              options={roles.map((r) => ({ value: r.role, label: ROLE_LABEL[r.role] ?? r.role }))} />
          </label>
          <label className="small grow">
            Modelo
            <Select label="Modelo del agente" value={model} onValueChange={setModel} disabled={loading || running || !compatible.length}
              placeholder={loading ? "Cargando modelos…" : "Sin modelos compatibles"}
              options={compatible.map((m) => ({ value: m.id, label: m.label, description: m.id }))} />
          </label>
        </div>
        {info && (
          <div className="small muted">
            Hasta {info.maxSteps} pasos · herramientas: {info.tools.join(", ")}
          </div>
        )}
        <textarea rows={4} placeholder="Qué tiene que hacer, como se lo pediría el planificador. P. ej.: «Crea el endpoint GET tasks/list que devuelve las tareas del usuario con sesión»." value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <details>
          <summary className="small muted" style={{ cursor: "pointer" }}>
            Archivos iniciales (opcional)
          </summary>
          <textarea className="code" rows={5} style={{ marginTop: 8, width: "100%" }} placeholder='{ "helpers/types.ts": "export type Task = { id: number; title: string };" }' value={files} onChange={(e) => setFiles(e.target.value)} />
        </details>
        {error && <div className="error-box" role="alert">{error} {!running && !roles.length && <button onClick={() => void load()}>Reintentar carga</button>}</div>}
        {pollError && <div className="error-box" role="alert">{pollError} La ejecución puede seguir en curso. <button onClick={() => watch(runId)}>Reintentar seguimiento</button></div>}
        <div className="row">
          <button className="primary" aria-label="Ejecutar" aria-busy={running} disabled={loading || running || !prompt.trim() || !compatible.some((m) => m.id === model) || !info} onClick={() => void start()}>
            {running ? <><span className="spinner" /> Ejecutando…</> : "Ejecutar"}
          </button>
          {running && runId && !starting && (
            <button className="danger" disabled={cancelling} onClick={async () => {
              setCancelling(true); setError("");
              try {
                await api(`/admin/agents/runs/${runId}/cancel`, { body: {} });
                watch(runId);
              } catch (e) { setError((e as Error).message); } finally { setCancelling(false); }
            }}>
              Cancelar
            </button>
          )}
          {!loading && !compatible.length && <span className="small muted">
            {role === "chat" ? "No hay modelos disponibles." : "Este rol necesita un modelo activo con Herramientas."} <a href="/admin/models">Configurar modelos →</a>
          </span>}
        </div>
      </section>

      {run && <RunPanel run={run} />}
    </div>
  );
}

function RunPanel({ run }: { run: RunView }) {
  const ends = new Map(run.events.filter((e): e is Extract<AgentEvent, { type: "tool_end" }> => e.type === "tool_end").map((e) => [e.id, e]));
  const r = run.result;
  return (
    <section className="card stack" style={{ padding: 16 }}>
      <div className="row">
        <strong className="grow">
          {ROLE_LABEL[run.role]?.split(" (")[0] ?? run.role} con <code>{run.modelId}</code>
        </strong>
        <span className={`pill ${run.status === "done" ? "ok" : run.status === "running" ? "accent" : "err"}`}>{{ running: "En curso", done: "Terminada", failed: "Falló", cancelled: "Cancelada" }[run.status]}</span>
      </div>
      {r && (
        <div className="small muted">
          ${r.usd.toFixed(4)} · {r.inputTokens.toLocaleString()} tokens de entrada · {r.outputTokens.toLocaleString()} de salida · {r.steps.length} herramientas
          {r.gate && ` · comprobación final: ${r.gate === "passed" ? "sin problemas" : "con problemas"}`}
          {r.hitStepLimit && " · llegó al límite de pasos"}
        </div>
      )}
      {run.error && <div className="error-box">{run.error}</div>}
      <div className="stack" style={{ gap: 4 }}>
        {run.events.map((e, i) =>
          e.type === "text" ? (
            <div key={i} style={{ whiteSpace: "pre-wrap" }}>
              {(e as { text: string }).text}
            </div>
          ) : e.type === "tool_start" ? (
            <ToolLine key={i} start={e as Extract<AgentEvent, { type: "tool_start" }>} end={ends.get((e as { id: string }).id)} />
          ) : null,
        )}
      </div>
      {r && Object.keys(r.files).length > 0 && (
        <div className="stack" style={{ gap: 8 }}>
          <div className="section-title">Archivos que escribió</div>
          {Object.entries(r.files).map(([path, content]) => (
            <details key={path}>
              <summary style={{ cursor: "pointer" }}>
                <code>{path}</code>
              </summary>
              <pre className="card" style={{ padding: 10, overflow: "auto", maxHeight: 360 }}>{content}</pre>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}

function ToolLine({ start, end }: { start: { name: string; summary: string }; end?: { ok: boolean; output: string } }) {
  return (
    <details className="log-line">
      <summary style={{ cursor: "pointer" }}>
        {end ? (end.ok ? "✓" : "✗") : "…"} <strong>{start.name}</strong> {start.summary}
      </summary>
      {end && <div className="muted">{end.output}</div>}
    </details>
  );
}
