import { useEffect, useMemo, useState } from "react";
import { api } from "../application/controller.js";
import { timeAgo } from "../../../shared/presentation/format.js";
import { Switch } from "../../../shared/ui.js";
import type { SettingView } from "./Settings.js";

interface CatalogModel {
  id: string;
  provider: string;
  model: string;
  label: string;
  inPrice: number;
  outPrice: number;
  cacheReadPrice: number;
  context: number;
  tools: boolean;
  vision: boolean;
  tier: number;
  speed: number;
  source: "builtin" | "openrouter" | "custom";
  enabled: boolean;
  available: boolean;
  allowed: boolean;
}

interface Probe {
  ok: boolean;
  ms: number;
  inputTokens: number;
  outputTokens: number;
  usd: number;
  toolsOk: boolean | null;
  text: string;
  error?: string;
}

const SHOWN = 200;
const enc = (id: string) => encodeURIComponent(id);
/** Same matching as the server (llm/catalog.ts platformAllows). */
const matches = (glob: string, m: CatalogModel) =>
  glob.trim() === "custom:*" ? m.source === "custom" : new RegExp(`^${glob.trim().replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`).test(m.id);

/** Admin → Modelos: the whole catalog, its whitelist, OpenRouter sync and a test per model. */
export function Models() {
  const [data, setData] = useState<{ models: CatalogModel[]; openrouter: { configured: boolean; lastSync: string | null } } | null>(null);
  const [filter, setFilter] = useState("");
  const [provider, setProvider] = useState("");
  const [onlyUsable, setOnlyUsable] = useState(true);
  const [probes, setProbes] = useState<Record<string, Probe | "running">>({});
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const load = () => api<NonNullable<typeof data>>("/admin/models").then(setData);
  useEffect(() => {
    void load();
  }, []);

  const shown = useMemo(
    () =>
      (data?.models ?? []).filter(
        (m) => (!provider || m.provider === provider) && (!onlyUsable || (m.available && m.allowed)) && (!filter || `${m.label} ${m.id}`.toLowerCase().includes(filter.toLowerCase())),
      ),
    [data, provider, onlyUsable, filter],
  );
  if (!data) return <div className="empty"><span className="spinner" /></div>;

  const patch = async (m: CatalogModel, body: Partial<CatalogModel>) => {
    setError("");
    try {
      await api(`/admin/models/item/${enc(m.id)}`, { method: "PATCH", body });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const test = async (m: CatalogModel) => {
    setProbes((p) => ({ ...p, [m.id]: "running" }));
    const r = await api<Probe>(`/admin/models/test/${enc(m.id)}`, { body: {} }).catch((e) => ({ ok: false, error: (e as Error).message }) as Probe);
    setProbes((p) => ({ ...p, [m.id]: r }));
  };
  const providers = [...new Set(data.models.map((m) => m.provider))];

  return (
    <div className="stack" style={{ gap: 16 }}>
      <Whitelist models={data.models} onSaved={load} />

      <section className="card stack" style={{ padding: 16, gap: 10 }}>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <input className="grow" placeholder="Buscar modelo…" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ minWidth: 200 }} />
          <select value={provider} onChange={(e) => setProvider(e.target.value)} style={{ width: 180 }}>
            <option value="">Todos los proveedores</option>
            {providers.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <label className="row small" style={{ color: "var(--text)" }}>
            <input type="checkbox" checked={onlyUsable} onChange={(e) => setOnlyUsable(e.target.checked)} style={{ width: "auto" }} /> Solo utilizables
          </label>
          {data.openrouter.configured && (
            <button
              onClick={async () => {
                setNote("Sincronizando…");
                try {
                  const r = await api<{ synced: number }>("/admin/models/sync", { body: {} });
                  setNote(`OpenRouter: ${r.synced} modelos actualizados.`);
                  await load();
                } catch (e) {
                  setNote("");
                  setError((e as Error).message);
                }
              }}
            >
              Sincronizar OpenRouter
            </button>
          )}
        </div>
        <div className="small muted">
          {shown.length} de {data.models.length} modelos
          {data.openrouter.configured && ` · OpenRouter sincronizado ${data.openrouter.lastSync ? timeAgo(data.openrouter.lastSync) : "nunca"}`}
          {note && ` · ${note}`}
        </div>
        {error && <div className="error-box">{error}</div>}
        <div style={{ overflow: "auto", maxHeight: 620 }}>
          <table className="grid">
            <thead>
              <tr>
                <th>Activo</th>
                <th>Modelo</th>
                <th>Estado</th>
                <th>$ entrada / salida (MTok)</th>
                <th>Calidad</th>
                <th>Velocidad</th>
                <th>Prueba</th>
              </tr>
            </thead>
            <tbody>
              {shown.slice(0, SHOWN).map((m) => {
                const p = probes[m.id];
                return (
                  <tr key={m.id}>
                    <td>
                      <Switch on={m.enabled} onChange={(v) => void patch(m, { enabled: v })} label={`Activar ${m.label}`} />
                    </td>
                    <td title={m.id}>
                      {m.label}
                      <div className="small muted">
                        {m.id} {m.vision && <span className="pill">imágenes</span>} {!m.tools && <span className="pill warn">sin herramientas</span>}
                      </div>
                    </td>
                    <td>
                      {!m.available ? <span className="pill">{m.enabled ? "proveedor no disponible" : "desactivado"}</span> : m.allowed ? <span className="pill ok">en uso</span> : <span className="pill warn">fuera de la lista blanca</span>}
                    </td>
                    <td>
                      <Price m={m} onSave={(b) => void patch(m, b)} />
                    </td>
                    <td>
                      <Stars value={m.tier} onChange={(tier) => void patch(m, { tier })} />
                    </td>
                    <td>
                      <Stars value={m.speed} onChange={(speed) => void patch(m, { speed })} />
                    </td>
                    <td style={{ whiteSpace: "normal", minWidth: 160 }}>
                      <button className="small" disabled={!m.available || p === "running"} onClick={() => void test(m)}>
                        {p === "running" ? <span className="spinner" /> : "Probar"}
                      </button>{" "}
                      {p && p !== "running" && (
                        <span className={`small ${p.ok ? "" : "muted"}`}>
                          {p.ok ? `✓ ${p.ms} ms · $${p.usd.toFixed(5)}${p.toolsOk === false ? " · no llamó a la herramienta" : p.toolsOk ? " · herramientas ✓" : ""}` : `✗ ${p.error}`}
                        </span>
                      )}
                      {m.source === "custom" && (
                        <button
                          className="ghost danger small"
                          onClick={async () => {
                            if (!confirm(`¿Borrar ${m.id}?`)) return;
                            await api(`/admin/models/item/${enc(m.id)}`, { method: "DELETE" });
                            await load();
                          }}
                        >
                          Borrar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {shown.length > SHOWN && <div className="small muted" style={{ padding: 8 }}>Mostrando {SHOWN}; filtra para ver el resto.</div>}
        </div>
      </section>

      <AddModel existing={new Set(data.models.map((m) => m.id))} onAdded={load} />
    </div>
  );
}

function Stars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <span className="row" style={{ gap: 0 }} role="radiogroup">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} className="ghost" aria-label={String(n)} style={{ padding: "0 2px", height: 22, color: n <= value ? "var(--accent)" : "var(--border)" }} onClick={() => n !== value && onChange(n)}>
          ★
        </button>
      ))}
    </span>
  );
}

function Price({ m, onSave }: { m: CatalogModel; onSave: (b: Partial<CatalogModel>) => void }) {
  const [edit, setEdit] = useState(false);
  const [inP, setIn] = useState(String(m.inPrice));
  const [outP, setOut] = useState(String(m.outPrice));
  if (!edit)
    return (
      <button className="ghost small" title="Editar precios" onClick={() => setEdit(true)}>
        {m.inPrice === 0 && m.outPrice === 0 ? "gratis" : `$${m.inPrice} / $${m.outPrice}`}
      </button>
    );
  return (
    <span className="row">
      <input type="number" min={0} step="any" value={inP} onChange={(e) => setIn(e.target.value)} style={{ width: 70 }} />
      <input type="number" min={0} step="any" value={outP} onChange={(e) => setOut(e.target.value)} style={{ width: 70 }} />
      <button
        className="small"
        onClick={() => {
          onSave({ inPrice: Number(inP), outPrice: Number(outP) });
          setEdit(false);
        }}
      >
        ✓
      </button>
    </span>
  );
}

/** The platform whitelist (setting models.allow), with how many models each pattern matches. */
function Whitelist({ models, onSaved }: { models: CatalogModel[]; onSaved: () => void }) {
  const [setting, setSetting] = useState<SettingView | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    void api<{ settings: SettingView[] }>("/admin/settings").then((r) => {
      const s = r.settings.find((x) => x.key === "models.allow")!;
      setSetting(s);
      setText((s.value as string[]).join("\n"));
    });
  }, []);
  if (!setting) return null;
  const globs = text.split("\n").map((g) => g.trim()).filter(Boolean);
  const usable = models.filter((m) => m.available);
  const dirty = globs.join("\n") !== (setting.value as string[]).join("\n");
  const save = async (value: string[] | null) => {
    setError("");
    try {
      const r = value
        ? await api<{ settings: SettingView[] }>("/admin/settings", { method: "PATCH", body: { "models.allow": value } })
        : await api<{ settings: SettingView[] }>("/admin/settings/models.allow", { method: "DELETE" });
      const s = r.settings.find((x) => x.key === "models.allow")!;
      setSetting(s);
      setText((s.value as string[]).join("\n"));
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <section className="card stack" style={{ padding: 16, gap: 10 }}>
      <div>
        <strong>Lista blanca de la plataforma</strong>
        <div className="small muted">{setting.help}</div>
      </div>
      <div className="row" style={{ alignItems: "stretch", flexWrap: "wrap" }}>
        <textarea className="code grow" rows={Math.min(14, globs.length + 2)} value={text} onChange={(e) => setText(e.target.value)} style={{ minWidth: 260 }} />
        <div className="stack small" style={{ gap: 2, minWidth: 220 }}>
          {globs.map((g) => {
            const n = usable.filter((m) => matches(g, m)).length;
            return (
              <div key={g} className="row">
                <code className="grow">{g}</code>
                <span className={`pill ${n ? "" : "warn"}`}>{n}</span>
              </div>
            );
          })}
        </div>
      </div>
      {error && <div className="error-box">{error}</div>}
      <div className="row">
        <button className="primary" disabled={!dirty} onClick={() => void save(globs)}>
          Guardar lista
        </button>
        {!setting.isDefault && <button onClick={() => void save(null)}>Volver a la lista por defecto</button>}
        <span className="small muted">{usable.filter((m) => globs.some((g) => matches(g, m))).length} modelos utilizables permitidos.</span>
      </div>
    </section>
  );
}

interface RemoteModel {
  id: string;
  label?: string;
  context?: number;
  inPrice?: number;
  outPrice?: number;
}

function AddModel({ existing, onAdded }: { existing: Set<string>; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  // Registered providers, not the ones that already have models: a freshly added provider has none.
  const [providers, setProviders] = useState<string[]>([]);
  useEffect(() => {
    if (!open) return;
    void api<{ providers: { id: string }[] }>("/admin/providers").then((r) => {
      const ids = r.providers.map((p) => p.id).filter((id) => id !== "openrouter");
      setProviders(ids);
      setF((cur) => (ids.includes(cur.provider) ? cur : { ...cur, provider: ids.find((id) => id !== "anthropic") ?? ids[0] ?? "" }));
    });
  }, [open]);
  const [f, setF] = useState({ provider: "", model: "", label: "", inPrice: 0, outPrice: 0, context: 128000, tier: 3, speed: 3, tools: true, vision: false });
  const [error, setError] = useState("");
  // What the chosen provider lists in its API, to pick from; typing a name by hand still works.
  const [remote, setRemote] = useState<{ loading: boolean; models: RemoteModel[]; error?: string }>({ loading: false, models: [] });
  useEffect(() => {
    if (!open || !f.provider) return;
    let stale = false;
    setRemote({ loading: true, models: [] });
    api<{ models: RemoteModel[]; error?: string }>(`/admin/providers/${encodeURIComponent(f.provider)}/models`)
      .then((r) => !stale && setRemote({ loading: false, models: r.models, error: r.error }))
      .catch((e) => !stale && setRemote({ loading: false, models: [], error: (e as Error).message }));
    return () => {
      stale = true;
    };
  }, [open, f.provider]);
  const pickable = remote.models.filter((m) => !existing.has(`${f.provider}:${m.id}`));
  const pick = (name: string) => {
    const m = remote.models.find((x) => x.id === name);
    // Whatever the provider publishes fills the form; the rest keeps its value.
    setF((cur) => ({
      ...cur,
      model: name,
      ...(m ? { label: m.label ?? cur.label, context: m.context ?? cur.context, inPrice: m.inPrice ?? cur.inPrice, outPrice: m.outPrice ?? cur.outPrice } : {}),
    }));
  };
  if (!open)
    return (
      <div>
        <button onClick={() => setOpen(true)}>+ Añadir modelo propio</button>
      </div>
    );
  const field = (k: keyof typeof f, label: string, type = "text", width = 120) => (
    <label className="small">
      {label}
      <input
        type={type}
        value={String(f[k])}
        onChange={(e) => setF({ ...f, [k]: type === "number" ? Number(e.target.value) : e.target.value })}
        style={{ width }}
      />
    </label>
  );
  return (
    <form
      className="card stack"
      style={{ padding: 16 }}
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        try {
          await api("/admin/models", { body: f });
          setOpen(false);
          onAdded();
        } catch (x) {
          setError((x as Error).message);
        }
      }}
    >
      <strong>Modelo propio</strong>
      <div className="row" style={{ flexWrap: "wrap", alignItems: "end" }}>
        <label className="small">
          Proveedor
          <select value={f.provider} onChange={(e) => setF({ ...f, provider: e.target.value })} style={{ width: 160 }}>
            {providers.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className="small">
          Nombre en la API
          <input list="provider-models" value={f.model} onChange={(e) => pick(e.target.value)} placeholder={remote.loading ? "Cargando modelos…" : "Elige de la lista o escribe"} style={{ width: 260 }} />
          <datalist id="provider-models">
            {pickable.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </datalist>
        </label>
        {field("label", "Nombre visible", "text", 160)}
        {field("inPrice", "$ entrada/MTok", "number", 90)}
        {field("outPrice", "$ salida/MTok", "number", 90)}
        {field("context", "Contexto", "number", 110)}
        {field("tier", "Calidad 1–5", "number", 80)}
        {field("speed", "Velocidad 1–5", "number", 80)}
        <label className="row small" style={{ color: "var(--text)" }}>
          <input type="checkbox" checked={f.tools} onChange={(e) => setF({ ...f, tools: e.target.checked })} style={{ width: "auto" }} /> Herramientas
        </label>
        <label className="row small" style={{ color: "var(--text)" }}>
          <input type="checkbox" checked={f.vision} onChange={(e) => setF({ ...f, vision: e.target.checked })} style={{ width: "auto" }} /> Imágenes
        </label>
      </div>
      <div className="small muted">
        {remote.loading
          ? "Consultando los modelos del proveedor…"
          : remote.error
            ? `No se pudo listar los modelos del proveedor (${remote.error}); escribe el nombre a mano.`
            : `${pickable.length} modelos del proveedor sin añadir; también puedes escribir el nombre a mano.`}
      </div>
      {error && <div className="error-box">{error}</div>}
      <div className="row">
        <button className="primary" disabled={!f.model.trim() || !f.provider}>
          Añadir
        </button>
        <button type="button" className="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
