import { useEffect, useState } from "react";
import { api, timeAgo } from "../api";

export interface ModelRow {
  id: string;
  label: string;
  provider: string;
  inPrice: number;
  outPrice: number;
  context: number;
  vision: boolean;
  tier: number;
  enabled: boolean;
}

const PROVIDER: Record<string, string> = { anthropic: "Anthropic", openrouter: "OpenRouter", openai: "Compatible OpenAI" };
const price = (m: ModelRow) => (m.inPrice === 0 && m.outPrice === 0 ? "gratis" : `$${m.inPrice} / $${m.outPrice} por Mtok`);

/** A filterable checklist of models, grouped by provider. */
function ModelChecklist({ models, enabled, onToggle }: { models: ModelRow[]; enabled: Set<string>; onToggle: (id: string, on: boolean) => void }) {
  const [filter, setFilter] = useState("");
  const shown = models.filter((m) => !filter || `${m.label} ${m.id}`.toLowerCase().includes(filter.toLowerCase()));
  const groups = [...new Set(shown.map((m) => m.provider))];
  return (
    <div className="stack" style={{ gap: 8 }}>
      {models.length > 8 && <input placeholder="Filtrar modelos…" value={filter} onChange={(e) => setFilter(e.target.value)} />}
      {groups.map((g) => (
        <div key={g} className="stack" style={{ gap: 2 }}>
          <div className="small muted" style={{ fontWeight: 600 }}>{PROVIDER[g] ?? g}</div>
          {shown
            .filter((m) => m.provider === g)
            .map((m) => (
              <label key={m.id} className="row" style={{ gap: 8, padding: "4px 0", cursor: "pointer" }}>
                <input type="checkbox" style={{ width: "auto" }} checked={enabled.has(m.id)} onChange={(e) => onToggle(m.id, e.target.checked)} />
                <span className="grow">
                  {m.label} <span className="small muted">{"★".repeat(m.tier)}</span>
                </span>
                {m.vision && <span className="pill">imágenes</span>}
                <span className="small muted">{price(m)}</span>
              </label>
            ))}
        </div>
      ))}
      {shown.length === 0 && <div className="small muted">No hay modelos{filter ? " con ese nombre" : ""}.</div>}
    </div>
  );
}

/** Account → Modelos: which models Forja may use for you, and the catalog status. */
export function AccountModels() {
  const [data, setData] = useState<{ models: ModelRow[]; customized: boolean; providers: { id: string }[]; openrouter: { configured: boolean; lastSync: string | null; total: number } } | null>(null);
  const [enabled, setEnabled] = useState<Set<string>>(new Set());
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const load = () =>
    api<NonNullable<typeof data>>("/models").then((r) => {
      setData(r);
      setEnabled(new Set(r.models.filter((m) => m.enabled).map((m) => m.id)));
      setDirty(false);
    });
  useEffect(() => {
    void load();
  }, []);
  const save = async (list: string[] | null) => {
    setBusy("save");
    setError("");
    try {
      await api("/models/account", { method: "PUT", body: { enabled: list } });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  };
  if (!data) return null;
  return (
    <section className="card stack" style={{ padding: 18 }}>
      <div>
        <div className="section-title" style={{ margin: 0 }}>Modelos</div>
        <div className="small muted">
          El enrutador elige, para cada agente y tarea, el modelo con mejor calidad por precio entre los que marques aquí, y aprende de los resultados.
          {data.customized ? " Usas una lista propia." : " Ahora se permiten todos los que ofrece la plataforma."}
        </div>
      </div>
      <ModelChecklist
        models={data.models}
        enabled={enabled}
        onToggle={(id, on) => {
          const next = new Set(enabled);
          if (on) next.add(id);
          else next.delete(id);
          setEnabled(next);
          setDirty(true);
        }}
      />
      <div className="row" style={{ flexWrap: "wrap" }}>
        <button className="primary" disabled={!dirty || busy !== ""} onClick={() => save([...enabled])}>
          {busy === "save" ? <span className="spinner" /> : "Guardar"}
        </button>
        {data.customized && (
          <button disabled={busy !== ""} onClick={() => save(null)} title="Vuelve a permitir todos los modelos de la plataforma, incluidos los que se añadan">
            Usar todos
          </button>
        )}
        <span className="grow" />
        <span className="small muted">
          OpenRouter: {data.openrouter.configured ? `${data.openrouter.total} modelos${data.openrouter.lastSync ? ` · sincronizado ${timeAgo(data.openrouter.lastSync)}` : ""}` : "sin configurar"}
        </span>
        {data.openrouter.configured && (
          <button
            className="sm"
            disabled={busy !== ""}
            onClick={async () => {
              setBusy("sync");
              setError("");
              try {
                await api("/models/sync", { body: {} });
                await load();
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy("");
              }
            }}
          >
            {busy === "sync" ? <span className="spinner" /> : "⟳ Sincronizar"}
          </button>
        )}
      </div>
      {error && <div className="error-box">{error}</div>}
    </section>
  );
}

interface RouterInfo {
  decisions: { role: string; modelId: string; reason: string; createdAt: string }[];
  learnt: { role: string; models: { id: string; label: string; mean: number; uses: number }[] }[];
  spend: { model: string; role: string | null; calls: number; inputTokens: number; cachedTokens: number; outputTokens: number; usd: number }[];
}

const ROLE_LABEL: Record<string, string> = { planner: "Planificador", data: "Datos", backend: "Backend", ui: "Interfaz", qa: "Revisión", fast: "Cambios rápidos", summarizer: "Resumen", router: "Análisis" };
const MODES = [
  { id: "saving", label: "Ahorro", hint: "Modelos baratos salvo cuando la tarea lo exige." },
  { id: "balanced", label: "Equilibrado", hint: "Calidad y precio a partes iguales." },
  { id: "quality", label: "Calidad", hint: "Los mejores modelos permitidos; cuesta más." },
] as const;

/** Project settings → Modelos: cost/quality mode, parallel agents, project whitelist and what the router learnt. */
export function ProjectModels({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const [cfg, setCfg] = useState<{ mode: string; concurrency: number; restricted: boolean; models: ModelRow[] } | null>(null);
  const [enabled, setEnabled] = useState<Set<string>>(new Set());
  const [dirty, setDirty] = useState(false);
  const [info, setInfo] = useState<RouterInfo | null>(null);
  const [error, setError] = useState("");
  const load = () =>
    api<NonNullable<typeof cfg>>(`/projects/${projectId}/models`).then((r) => {
      setCfg(r);
      setEnabled(new Set(r.models.filter((m) => m.enabled).map((m) => m.id)));
      setDirty(false);
    });
  useEffect(() => {
    void load();
    void api<RouterInfo>(`/projects/${projectId}/router`).then(setInfo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);
  const put = async (body: Record<string, unknown>) => {
    setError("");
    try {
      await api(`/projects/${projectId}/models`, { method: "PUT", body });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  if (!cfg) return null;
  const label = (id: string) => cfg.models.find((m) => m.id === id)?.label ?? id;
  const totalUsd = info?.spend.reduce((s, r) => s + r.usd, 0) ?? 0;
  const cached = info?.spend.reduce((s, r) => s + r.cachedTokens, 0) ?? 0;
  const input = info?.spend.reduce((s, r) => s + r.inputTokens, 0) ?? 0;

  return (
    <section className="card section">
      <h3>◈ Modelos y agentes</h3>
      <div className="row-setting">
        <div>
          <strong>Modo</strong>
          <div className="small muted">{MODES.find((m) => m.id === cfg.mode)?.hint}</div>
        </div>
        <div className="segmented">
          {MODES.map((m) => (
            <button key={m.id} className={cfg.mode === m.id ? "on" : ""} disabled={!canEdit} onClick={() => put({ mode: m.id })}>
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div className="row-setting">
        <div>
          <strong>Agentes en paralelo</strong>
          <div className="small muted">Cuántos especialistas (datos, backend, interfaz) trabajan a la vez en los cambios grandes.</div>
        </div>
        <div className="segmented">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} className={cfg.concurrency === n ? "on" : ""} disabled={!canEdit} onClick={() => put({ concurrency: n })}>
              {n}
            </button>
          ))}
        </div>
      </div>
      <div className="stack" style={{ gap: 6 }}>
        <div>
          <strong>Modelos de este proyecto</strong>
          <div className="small muted">{cfg.restricted ? "Este proyecto usa solo los marcados." : "Usa todos los permitidos en la cuenta. Desmarca alguno para limitar este proyecto."}</div>
        </div>
        <ModelChecklist
          models={cfg.models}
          enabled={enabled}
          onToggle={(id, on) => {
            if (!canEdit) return;
            const next = new Set(enabled);
            if (on) next.add(id);
            else next.delete(id);
            setEnabled(next);
            setDirty(true);
          }}
        />
        {canEdit && (
          <div className="row">
            <button className="primary" disabled={!dirty || enabled.size === 0} onClick={() => put({ enabled: [...enabled] })}>
              Guardar
            </button>
            {cfg.restricted && <button onClick={() => put({ enabled: [] })}>Usar todos los de la cuenta</button>}
          </div>
        )}
      </div>
      {error && <div className="error-box">{error}</div>}

      {info && info.spend.length > 0 && (
        <div className="stack" style={{ gap: 6 }}>
          <strong>Gasto del constructor</strong>
          <div className="small muted">
            ${totalUsd.toFixed(3)} en total{input + cached > 0 && cached > 0 ? ` · ${Math.round((cached / (input + cached)) * 100)}% de la entrada servida desde caché` : ""}
          </div>
          <table className="list-table small">
            <thead>
              <tr>
                <th>Modelo</th>
                <th>Agente</th>
                <th>Llamadas</th>
                <th>Tokens</th>
                <th>Coste</th>
              </tr>
            </thead>
            <tbody>
              {info.spend.slice(0, 12).map((r, i) => (
                <tr key={i}>
                  <td>{label(r.model)}</td>
                  <td>{ROLE_LABEL[r.role ?? ""] ?? r.role ?? "—"}</td>
                  <td>{r.calls}</td>
                  <td>{((r.inputTokens + r.cachedTokens + r.outputTokens) / 1000).toFixed(1)}k</td>
                  <td>${r.usd.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {info && info.learnt.some((l) => l.models.some((m) => m.uses > 0)) && (
        <div className="stack" style={{ gap: 6 }}>
          <strong>Lo que ha aprendido el enrutador</strong>
          <div className="small muted">Calidad estimada de cada modelo por agente, según compilaciones, pruebas, revisiones y deshacer.</div>
          {info.learnt
            .filter((l) => l.models.some((m) => m.uses > 0))
            .map((l) => (
              <div key={l.role} className="small row" style={{ flexWrap: "wrap", gap: 6 }}>
                <span style={{ minWidth: 110, fontWeight: 500 }}>{ROLE_LABEL[l.role] ?? l.role}</span>
                {l.models.slice(0, 3).map((m) => (
                  <span key={m.id} className="pill" title={`${m.uses} usos`}>
                    {m.label} · {Math.round(m.mean * 100)}%
                  </span>
                ))}
              </div>
            ))}
        </div>
      )}
      {info && info.decisions.length > 0 && (
        <details>
          <summary className="small muted" style={{ cursor: "pointer" }}>
            Últimas decisiones ({info.decisions.length})
          </summary>
          <div className="stack small" style={{ gap: 4, marginTop: 6 }}>
            {info.decisions.slice(0, 15).map((d, i) => (
              <div key={i}>
                <strong>{ROLE_LABEL[d.role] ?? d.role}</strong> → {label(d.modelId)} <span className="muted">· {d.reason} · {timeAgo(d.createdAt)}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
