import { useEffect, useState } from "react";
import { api, bytes } from "../api";

interface Usage {
  actionsToday: number;
  actionsLimit: number;
  actionsHistory: { day: string; count: number }[];
  credits: number;
  creditsSpent: { builder: number; app: number };
  storageBytes: number;
}

const Meter = ({ color, title, value, of, note }: { color: string; title: string; value: string; of?: number; note: string }) => (
  <div className="meter">
    <div className="row">
      <span className="dot" style={{ background: color }} />
      <strong className="grow">{title}</strong>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
    {of !== undefined && (
      <div className="meter-bar">
        <div style={{ width: `${Math.min(100, Math.max(0, of * 100))}%`, background: color }} />
      </div>
    )}
    <div className="small muted">{note}</div>
  </div>
);

export function Plan() {
  const [u, setU] = useState<Usage | null>(null);
  const [tab, setTab] = useState<"plan" | "actions" | "credits">("plan");
  useEffect(() => {
    api<Usage>("/usage").then(setU);
  }, []);
  if (!u) return <div className="empty"><span className="spinner" /></div>;
  const max = Math.max(1, ...u.actionsHistory.map((h) => h.count));

  return (
    <div className="page stack" style={{ gap: 18 }}>
      <h1 style={{ fontSize: 24 }}>Plan y uso</h1>
      <div className="segmented" style={{ justifySelf: "start" }}>
        <button className={tab === "plan" ? "on" : ""} onClick={() => setTab("plan")}>Plan actual</button>
        <button className={tab === "actions" ? "on" : ""} onClick={() => setTab("actions")}>
          <span className="dot" style={{ background: "#059669" }} /> Acciones
        </button>
        <button className={tab === "credits" ? "on" : ""} onClick={() => setTab("credits")}>
          <span className="dot" style={{ background: "#7c3aed" }} /> Créditos IA
        </button>
      </div>

      {tab === "plan" && (
        <div className="card" style={{ padding: 16, display: "grid", gridTemplateColumns: "minmax(220px, 300px) 1fr", gap: 18 }}>
          <div className="plan-card">
            <span className="pill" style={{ justifySelf: "start", background: "#1f2937", color: "#d1d5db" }}>AUTOALOJADO</span>
            <div style={{ fontSize: 30, fontWeight: 700 }}>
              $0 <span className="muted" style={{ fontSize: 14, fontWeight: 400 }}>/ mes</span>
            </div>
            <div className="muted small">Tu propia instalación: sin cuotas de hosting ni dominios de pago.</div>
            <div className="small">✓ {u.actionsLimit.toLocaleString()} acciones de construcción al día</div>
            <div className="small">✓ Enlaces de vista previa para compartir</div>
            <div className="small">✓ Base de datos, auth, archivos, correo, tareas y tiempo real</div>
            <div className="small">✓ Constructor por chat y servidor MCP</div>
          </div>
          <div className="stack" style={{ gap: 10, alignContent: "start" }}>
            <div className="row">
              <strong className="grow">Lo incluido en este ciclo</strong>
              <span className="pill warn">Los saldos no se transfieren entre sí</span>
            </div>
            <Meter
              color="#059669"
              title="Acciones de construcción"
              value={`${Math.max(0, u.actionsLimit - u.actionsToday).toLocaleString()} de ${u.actionsLimit.toLocaleString()} libres`}
              of={u.actionsToday / u.actionsLimit}
              note="Cada herramienta que usa el constructor o un agente MCP. Se reinician cada día y no se acumulan."
            />
            <Meter
              color="#7c3aed"
              title="Créditos de IA"
              value={`${u.credits.toLocaleString()} restantes`}
              of={u.credits / Math.max(u.credits + u.creditsSpent.builder + u.creditsSpent.app, 1)}
              note="Los gastan el constructor integrado y la IA dentro de tus apps."
            />
            <Meter color="#2563eb" title="Almacenamiento" value={bytes(u.storageBytes)} note="Archivos que suben los usuarios de todas tus apps." />
          </div>
        </div>
      )}

      {tab === "actions" && (
        <div className="card stack" style={{ padding: 18 }}>
          <strong>Acciones por día (últimas 2 semanas)</strong>
          {u.actionsHistory.length === 0 ? (
            <div className="empty">Sin actividad todavía.</div>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 160 }}>
              {u.actionsHistory.map((h) => (
                <div key={h.day} title={`${h.day}: ${h.count}`} style={{ flex: 1, display: "grid", gap: 4, justifyItems: "center" }}>
                  <div style={{ width: "100%", height: `${(h.count / max) * 130}px`, minHeight: 2, background: "#059669", borderRadius: 4 }} />
                  <span className="small muted">{h.day.slice(8)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "credits" && (
        <div className="card stack" style={{ padding: 18 }}>
          <div className="stat-grid">
            <div className="stat">
              <div className="small muted">Restantes</div>
              <div className="n">{u.credits.toLocaleString()}</div>
            </div>
            <div className="stat">
              <div className="small muted">Gastados por el constructor</div>
              <div className="n">{u.creditsSpent.builder.toLocaleString()}</div>
            </div>
            <div className="stat">
              <div className="small muted">Gastados por tus apps</div>
              <div className="n">{u.creditsSpent.app.toLocaleString()}</div>
            </div>
          </div>
          <div className="small muted">El detalle por modelo de cada proyecto está en Servicios → IA.</div>
        </div>
      )}
    </div>
  );
}
