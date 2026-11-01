import { useEffect, useRef, useState } from "react";
import { api } from "../../api";

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
  const [models, setModels] = useState<{ id: string; label: string }[]>([]);
  const [role, setRole] = useState("backend");
  const [model, setModel] = useState("");
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState("");
  const [run, setRun] = useState<RunView | null>(null);
  const [error, setError] = useState("");
  const poll = useRef<number | undefined>(undefined);

  useEffect(() => {
    void api<{ roles: RoleInfo[] }>("/admin/agents/roles").then((r) => setRoles(r.roles));
    void api<{ models: { id: string; label: string; available: boolean; allowed: boolean }[] }>("/admin/models").then((r) => {
      const usable = r.models.filter((m) => m.available && m.allowed);
      setModels(usable);
      setModel((m) => m || usable[0]?.id || "");
    });
    return () => window.clearInterval(poll.current);
  }, []);

  const watch = (id: string) => {
    window.clearInterval(poll.current);
    const tick = async () => {
      const r = await api<RunView>(`/admin/agents/runs/${id}`).catch(() => null);
      if (!r) return;
      setRun(r);
      if (r.status !== "running") window.clearInterval(poll.current);
    };
    void tick();
    poll.current = window.setInterval(tick, 1500);
  };
  const start = async () => {
    setError("");
    let initial: Record<string, string> | undefined;
    if (files.trim()) {
      try {
        initial = JSON.parse(files);
      } catch {
        return setError("Los archivos iniciales deben ser JSON: { \"ruta\": \"contenido\" }");
      }
    }
    try {
      const r = await api<{ runId: string }>("/admin/agents/runs", { body: { role, modelId: model, prompt, files: initial } });
      watch(r.runId);
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const info = roles.find((r) => r.role === role);
  const running = run?.status === "running";

  return (
    <div className="stack" style={{ gap: 16 }}>
      <p className="small muted" style={{ margin: 0 }}>
        Ejecuta un solo agente con el modelo que elijas, en un proyecto desechable de la cuenta interna: no toca proyectos ni créditos de nadie y el enrutador no aprende de ello. El gasto cuenta para los topes de los evals.
      </p>
      <section className="card stack" style={{ padding: 16 }}>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <label className="small">
            Rol
            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: 280 }}>
              {roles.map((r) => (
                <option key={r.role} value={r.role}>
                  {ROLE_LABEL[r.role] ?? r.role}
                </option>
              ))}
            </select>
          </label>
          <label className="small grow">
            Modelo
            <select value={model} onChange={(e) => setModel(e.target.value)}>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} — {m.id}
                </option>
              ))}
            </select>
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
        {error && <div className="error-box">{error}</div>}
        <div className="row">
          <button className="primary" disabled={running || !prompt.trim() || !model} onClick={() => void start()}>
            {running ? <span className="spinner" /> : "Ejecutar"}
          </button>
          {running && (
            <button className="danger" onClick={() => void api(`/admin/agents/runs/${run!.id}/cancel`, { body: {} })}>
              Cancelar
            </button>
          )}
          {!models.length && <span className="small muted">No hay modelos utilizables: configura un proveedor primero.</span>}
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
