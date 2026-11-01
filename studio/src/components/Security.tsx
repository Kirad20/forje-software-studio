import { useEffect, useState } from "react";
import { api, timeAgo } from "../api";
import { Header, Loading, useLoad } from "./Panels";

type Severity = "critical" | "high" | "medium" | "low";

interface Finding {
  id: string;
  rule: string;
  severity: Severity;
  title: string;
  detail: string;
  fix: string;
  file?: string;
  line?: number;
  source: "quick" | "deep";
  ignored: boolean;
}

interface Scan {
  status: "running" | "done" | "failed";
  findings: Finding[];
  summary: string;
  scannedAt: string;
}

interface Security {
  quick: Scan | null;
  deep: Scan | null;
}

const SEVERITY: Record<Severity, { label: string; pill: string }> = {
  critical: { label: "Crítico", pill: "err" },
  high: { label: "Alto", pill: "err" },
  medium: { label: "Medio", pill: "warn" },
  low: { label: "Bajo", pill: "" },
};

/** The message sent to the builder for one finding. */
export function securityFixMessage(f: Finding) {
  const where = f.file ? ` en ${f.file}${f.line ? `:${f.line}` : ""}` : "";
  return `Arregla este problema de seguridad${where}: ${f.title}.\n\n${f.detail}\n\nArreglo sugerido: ${f.fix}\n\nCuando termines, pasa security_scan para comprobar que ha desaparecido.`;
}

/** Quick scan + deep review results, with "Arreglar" (sends to the builder) and "Ignorar". */
export function SecurityPanel({ projectId, reloadKey, building, onFix }: { projectId: string; reloadKey: number; building: boolean; onFix: (message: string) => void }) {
  const sec = useLoad<Security>(`/projects/${projectId}/security`, [reloadKey]);
  const [data, setData] = useState<Security | null>(null);
  const [busy, setBusy] = useState<"" | "quick" | "deep">("");
  const [error, setError] = useState("");
  const [showIgnored, setShowIgnored] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => setData(sec.data), [sec.data]);

  // While a deep review runs, poll until it finishes.
  const running = data?.deep?.status === "running";
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => void api<Security>(`/projects/${projectId}/security`).then(setData).catch(() => {}), 3000);
    return () => clearInterval(t);
  }, [running, projectId]);

  const act = async (kind: "quick" | "deep") => {
    setBusy(kind);
    setError("");
    try {
      setData(await api<Security>(`/projects/${projectId}/security/${kind === "quick" ? "scan" : "deep"}`, { method: "POST", body: {} }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  };
  const ignore = async (f: Finding) => setData(await api<Security>(`/projects/${projectId}/security/ignore`, { method: "POST", body: { id: f.id, ignored: !f.ignored } }));

  if (!data) return <Loading error={sec.error} />;
  const all = [...(data.quick?.findings ?? []), ...(data.deep?.findings ?? [])];
  const openFindings = all.filter((f) => !f.ignored);
  const ignored = all.filter((f) => f.ignored);
  const shown = showIgnored ? all : openFindings;
  const blocking = openFindings.filter((f) => f.severity === "critical").length;

  return (
    <div className="stack" style={{ gap: 16, maxWidth: 820, minWidth: 0 }}>
      <div>
        <Header title="Seguridad" hint="El escaneo rápido revisa reglas fijas y se pasa en cada publicación: los problemas críticos la bloquean. La revisión profunda lee todo el código con un agente y gasta créditos." />
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <button className="sm" disabled={!!busy} onClick={() => act("quick")}>
            {busy === "quick" ? "Escaneando…" : "Escanear"}
          </button>
          <button className="sm primary" disabled={!!busy || running} onClick={() => act("deep")}>
            {running ? "Revisando…" : "Revisión profunda"}
          </button>
        </div>
      </div>
      {error && <div className="small" style={{ color: "var(--err)" }}>{error}</div>}

      <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
        <div className="card grow" style={{ padding: 12, flexBasis: 200 }}>
          <div className="small muted">Escaneo rápido</div>
          <strong>{data.quick ? `${data.quick.findings.filter((f) => !f.ignored).length} abiertos` : "Sin pasar todavía"}</strong>
          {data.quick && <div className="small muted">{timeAgo(data.quick.scannedAt)}</div>}
        </div>
        <div className="card grow" style={{ padding: 12, flexBasis: 200 }}>
          <div className="small muted">Revisión profunda</div>
          <strong>
            {!data.deep ? "Sin pasar todavía" : data.deep.status === "running" ? "En curso…" : data.deep.status === "failed" ? "Falló" : `${data.deep.findings.filter((f) => !f.ignored).length} abiertos`}
          </strong>
          {data.deep && <div className="small muted">{data.deep.summary || timeAgo(data.deep.scannedAt)}</div>}
        </div>
      </div>

      {blocking > 0 && (
        <div className="card small" style={{ padding: 12, background: "var(--err-soft)", color: "var(--err)" }}>
          {blocking === 1 ? "Un problema crítico impide publicar." : `${blocking} problemas críticos impiden publicar.`} Arréglalos o, si de verdad no son un riesgo, ignóralos.
        </div>
      )}

      {data.quick && !shown.length && <div className="empty small">No hay problemas abiertos. 🎉</div>}
      <div className="stack" style={{ gap: 8 }}>
        {shown.map((f) => (
          <div key={`${f.source}:${f.id}`} className="card" style={{ padding: 12, opacity: f.ignored ? 0.6 : 1 }}>
            <div className="row" style={{ gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
              <span className={`pill ${SEVERITY[f.severity].pill}`}>{SEVERITY[f.severity].label}</span>
              <button
                className="ghost grow"
                style={{ display: "block", textAlign: "left", padding: 0, minWidth: 0, flexBasis: 240, whiteSpace: "normal", height: "auto" }}
                onClick={() => setOpen(open === f.id ? null : f.id)}
                aria-expanded={open === f.id}
              >
                <strong>{f.title}</strong>
                <div className="small muted">
                  {f.file ? `${f.file}${f.line ? `:${f.line}` : ""} · ` : ""}
                  {f.source === "deep" ? "revisión profunda" : "escaneo rápido"}
                </div>
              </button>
              <button className="ghost sm" onClick={() => ignore(f)}>
                {f.ignored ? "Reabrir" : "Ignorar"}
              </button>
              {!f.ignored && (
                <button className="sm primary" disabled={building} onClick={() => onFix(securityFixMessage(f))}>
                  Arreglar
                </button>
              )}
            </div>
            {open === f.id && (
              <div className="stack small" style={{ gap: 6, marginTop: 8 }}>
                <div>{f.detail}</div>
                <div>
                  <strong>Arreglo:</strong> {f.fix}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {ignored.length > 0 && (
        <button className="ghost sm" style={{ alignSelf: "flex-start" }} onClick={() => setShowIgnored((s) => !s)}>
          {showIgnored ? "Ocultar ignorados" : `Ver ${ignored.length} ignorado${ignored.length > 1 ? "s" : ""}`}
        </button>
      )}
    </div>
  );
}
