import { useEffect, useMemo, useState } from "react";
import { api } from "../application/controller.js";
import { timeAgo } from "../../../shared/presentation/format.js";
import { Select, Switch } from "../../../shared/ui.js";
import { EditDialog } from "../../../shared/EditDialog.js";
import { useConfirmation } from "../../../shared/ConfirmDialog.js";
import type { SettingView } from "./Settings.js";
import { modelBlockers, usableModel } from "../application/model-readiness.js";
import { ConfigurationHeader } from "./ConfigurationHeader.js";

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
  capabilities?: { reasoning: number; coding: number; debugging: number; toolUse: number; confidence: number; source: "declared" | "classification" | "evaluation" };
  reasoningEffort?: boolean;
  enabled: boolean;
  available: boolean;
  allowed: boolean;
  blockers?: string[];
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

const SHOWN = 25;
const enc = (id: string) => encodeURIComponent(id);
/** Same matching as the server (llm/catalog.ts platformAllows). */
const matches = (glob: string, m: CatalogModel) =>
  glob.trim() === "custom:*" ? m.source === "custom" : new RegExp(`^${glob.trim().replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`).test(m.id);

/** Admin → Modelos: the whole catalog, its whitelist, OpenRouter sync and a test per model. */
export function Models() {
  const { confirm, dialog } = useConfirmation();
  const [data, setData] = useState<{ models: CatalogModel[]; openrouter: { configured: boolean; lastSync: string | null } } | null>(null);
  const [filter, setFilter] = useState("");
  const [provider, setProvider] = useState(() => new URLSearchParams(window.location.search).get("provider") ?? "");
  const [onlyUsable, setOnlyUsable] = useState(false);
  const [probes, setProbes] = useState<Record<string, Probe | "running">>({});
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<CatalogModel | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const load = () => api<NonNullable<typeof data>>("/admin/models").then(setData);
  useEffect(() => {
    void load().catch((e) => setError((e as Error).message));
  }, []);
  useEffect(() => { setPage(0); }, [filter, provider, onlyUsable]);

  const shown = useMemo(
    () =>
      (data?.models ?? []).filter(
        (m) => (!provider || m.provider === provider) && (!onlyUsable || usableModel(m)) && (!filter || `${m.label} ${m.id}`.toLowerCase().includes(filter.toLowerCase())),
      ),
    [data, provider, onlyUsable, filter],
  );
  if (!data) return <div className="empty">{error ? <div role="alert">{error} <button onClick={() => { setError(""); void load().catch((e) => setError((e as Error).message)); }}>Reintentar</button></div> : <span className="spinner" />}</div>;

  const patch = async (m: CatalogModel, body: Partial<CatalogModel>) => {
    setError("");
    setPending(m.id);
    try {
      await api(`/admin/models/item/${enc(m.id)}`, { method: "PATCH", body });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(null);
    }
  };
  const test = async (m: CatalogModel) => {
    setProbes((p) => ({ ...p, [m.id]: "running" }));
    const r = await api<Probe>(`/admin/models/test/${enc(m.id)}`, { body: {} }).catch((e) => ({ ok: false, error: (e as Error).message }) as Probe);
    setProbes((p) => ({ ...p, [m.id]: r }));
  };
  const providers = [...new Set(data.models.map((m) => m.provider))];
  const pages = Math.max(1, Math.ceil(shown.length / SHOWN));
  const currentPage = Math.min(page, pages - 1);

  return (
    <div className="ai-config stack">
      <ConfigurationHeader current="models" />
      <div className="ai-config-actions">
        <AddModel existing={new Set(data.models.map((m) => m.id))} onAdded={load} />
        {data.openrouter.configured && (
            <button disabled={syncing}
              onClick={async () => {
                setSyncing(true);
                setError("");
                setNote("Sincronizando…");
                try {
                  const r = await api<{ synced: number }>("/admin/models/sync", { body: {} });
                  setNote(`OpenRouter: ${r.synced} modelos actualizados.`);
                  await load();
                } catch (e) {
                  setNote("");
                  setError((e as Error).message);
                } finally { setSyncing(false); }
              }}
            >
              {syncing ? "Sincronizando…" : "Sincronizar OpenRouter"}
            </button>
        )}
        <span className="grow" />
        <a href="/admin/agents">Probar un agente →</a>
      </div>
      <section className="stack" style={{ gap: 12 }}>
        <div className="admin-toolbar">
          <input type="search" aria-label="Buscar modelo" placeholder="Buscar por nombre o identificador…" value={filter} onChange={(e) => setFilter(e.target.value)} />
          <Select label="Filtrar por proveedor" value={provider} onValueChange={setProvider} style={{ width: 220, maxWidth: "100%" }}
            options={[{ value: "", label: "Todos los proveedores" }, ...providers.map((p) => ({ value: p, label: p }))]} />
          <label className="row small" style={{ color: "var(--text)" }}>
            <input type="checkbox" checked={onlyUsable} onChange={(e) => setOnlyUsable(e.target.checked)} style={{ width: "auto" }} /> Solo utilizables
          </label>
        </div>
        <div className="ai-config-summary small muted">
          <span>{shown.length} de {data.models.length} modelos · {data.models.filter(usableModel).length} listos para usar</span>
          <span>{data.models.filter(m => usableModel(m) && m.tools).length} para construir · {data.models.filter(m => usableModel(m) && m.vision).length} para imágenes</span>
        </div>
        {error && <div className="error-box" role="alert">{error}</div>}
        {note && <div role="status" className="small">{note}</div>}
        <div className="ai-config-list" aria-label="Catálogo de modelos">
              {shown.slice(currentPage * SHOWN, (currentPage + 1) * SHOWN).map((m) => {
                const p = probes[m.id];
                const blockers = modelBlockers(m);
                return (
                  <article className="ai-model" key={m.id} aria-label={m.label}>
                    <div className="ai-model-main">
                      <Switch on={m.enabled} disabled={pending !== null} onChange={(v) => void patch(m, { enabled: v })} label={`Activar ${m.label}`} />
                      <div className="ai-model-name">
                        <strong>{m.label}</strong>
                        <div className="small muted">{m.id}</div>
                      </div>
                      <span className={`pill ${usableModel(m) ? "ok" : "warn"}`}>{blockers.join(" · ") || "Listo para usar"}</span>
                      <div className="ai-config-actions">
                        <button disabled={pending !== null} onClick={() => setEditing(m)} aria-label={`Editar ${m.label}`}>Editar</button>
                        <button disabled={!usableModel(m) || pending !== null || p === "running"} onClick={() => void test(m)}>
                          {p === "running" ? "Probando…" : "Probar"}
                        </button>
                      </div>
                    </div>
                    <div className="ai-model-meta small muted">
                      <span>{[m.tools && "Herramientas", m.vision && "Imágenes"].filter(Boolean).join(" · ") || "Solo texto"}</span>
                      <span>{m.context.toLocaleString()} tokens</span>
                      <span>{m.inPrice === 0 && m.outPrice === 0 ? (m.source === "custom" ? "$0 / $0 · verificar" : "Gratis") : `$${m.inPrice} / $${m.outPrice}`} por MTok</span>
                    </div>
                    {(blockers.includes("Proveedor no disponible") || !m.allowed || blockers.includes("No permitido en tu cuenta")) && <div className="ai-model-recovery ai-config-actions small">
                      {blockers.includes("Proveedor no disponible") && <a href="/admin/providers">Conectar proveedor</a>}
                      {!m.allowed && <a href="#model-platform-permissions" onClick={() => setPermissionsOpen(true)}>Revisar permisos de plataforma</a>}
                      {m.available && m.allowed && modelBlockers(m).includes("No permitido en tu cuenta") && <button className="small" disabled={pending !== null} onClick={async () => {
                        setPending(m.id); setError("");
                        try {
                          await api(`/admin/models/permit/${enc(m.id)}`, { body: {} });
                          await load();
                        } catch (e) { setError((e as Error).message); } finally { setPending(null); }
                      }}>Permitir {m.label} en mi cuenta</button>}
                    </div>}
                      {p && p !== "running" && (
                        <div className={p.ok ? "ai-model-feedback small" : "error-box small"} role={p.ok ? "status" : "alert"}>
                          {p.ok ? `✓ ${p.ms} ms · $${p.usd.toFixed(5)}${p.toolsOk === false ? " · no llamó a la herramienta" : p.toolsOk ? " · herramientas ✓" : ""}` : `✗ ${p.error}`}
                        </div>
                      )}
                    <details className="ai-model-details">
                      <summary className="small muted">Detalles y opciones</summary>
                      <div className="ai-config-actions small">
                        <span>Calidad {m.tier}/5 · Velocidad {m.speed}/5 · {m.source}</span>
                        {m.source === "custom" && <>
                          <Switch on={m.tools} disabled={pending !== null} onChange={(tools) => void patch(m, { tools })} label={`Herramientas: ${m.label}`} /><span>Herramientas</span>
                          <Switch on={m.vision} disabled={pending !== null} onChange={(vision) => void patch(m, { vision })} label={`Imágenes: ${m.label}`} /><span>Imágenes</span>
                        </>}
                        {m.capabilities && <span>Fusion R{m.capabilities.reasoning} · C{m.capabilities.coding} · D{m.capabilities.debugging} · H{m.capabilities.toolUse} · {m.capabilities.source} · confianza {Math.round(m.capabilities.confidence * 100)}%</span>}
                        <span className="muted">{m.reasoningEffort === undefined ? "Esfuerzo de razonamiento sin verificar" : `Esfuerzo de razonamiento ${m.reasoningEffort ? "verificado" : "no compatible"}`}</span>
                      {m.source === "custom" && (
                        <button
                          className="ghost danger small"
                          disabled={pending !== null}
                          onClick={async () => {
                            if (!await confirm(`¿Borrar ${m.id}? Esta acción no se puede deshacer.`)) return;
                            setPending(m.id);
                            setError("");
                            try {
                              await api(`/admin/models/item/${enc(m.id)}`, { method: "DELETE" });
                              await load();
                              setNote("Modelo eliminado.");
                            } catch (e) {
                              setError((e as Error).message);
                            } finally {
                              setPending(null);
                            }
                          }}
                        >
                          Borrar
                        </button>
                      )}
                      </div>
                    </details>
                  </article>
                );
              })}
              {!shown.length && <div className="empty">No hay modelos con estos filtros. <button onClick={() => { setFilter(""); setProvider(""); setOnlyUsable(false); }}>Ver todos</button></div>}
        </div>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <span className="small muted grow">{shown.length ? `${currentPage * SHOWN + 1}–${Math.min((currentPage + 1) * SHOWN, shown.length)} de ${shown.length}` : "0 modelos"}</span>
          <button disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Anterior</button>
          <span className="small">Página {currentPage + 1} de {pages}</span>
          <button disabled={currentPage + 1 >= pages} onClick={() => setPage(currentPage + 1)}>Siguiente</button>
        </div>
      </section>
      <div className="ai-config-summary small muted">
        <a href="/account">Permisos de mi cuenta y valores por defecto →</a>
        {data.openrouter.configured && <span>OpenRouter sincronizado {data.openrouter.lastSync ? timeAgo(data.openrouter.lastSync) : "nunca"}</span>}
      </div>

      <details id="model-platform-permissions" open={permissionsOpen} onToggle={(event) => setPermissionsOpen(event.currentTarget.open)} className="card" style={{ padding: 16 }}>
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>Permisos de la plataforma · lista blanca</summary>
        <p className="small muted">Controla qué modelos pueden utilizar las cuentas. Los permisos de cada cuenta pueden restringir esta lista.</p>
        <Whitelist models={data.models} onSaved={load} />
      </details>
      {editing && <ModelEditor key={editing.id} model={editing} onClose={() => setEditing(null)} onSaved={async () => { await load(); setEditing(null); setNote("Modelo actualizado."); }} />}
      {dialog}
    </div>
  );
}

function ModelEditor({ model: m, onClose, onSaved }: { model: CatalogModel; onClose: () => void; onSaved: () => Promise<void> }) {
  const [draft, setDraft] = useState({
    label: m.label, context: m.context, inPrice: m.inPrice, outPrice: m.outPrice, cacheReadPrice: m.cacheReadPrice,
    tier: m.tier, speed: m.speed, tools: m.tools, vision: m.vision, enabled: m.enabled,
  });
  const [capabilities, setCapabilities] = useState(() => m.capabilities ?? {
    reasoning: 3, coding: 3, debugging: 3, toolUse: 3, confidence: 0.5, source: "declared" as const,
  });
  const [capabilitiesTouched, setCapabilitiesTouched] = useState(false);
  const [reasoningEffort, setReasoningEffort] = useState<"unverified" | "supported" | "unsupported">(
    m.reasoningEffort === undefined ? "unverified" : m.reasoningEffort ? "supported" : "unsupported",
  );
  const [reasoningEffortTouched, setReasoningEffortTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dirty = Object.entries(draft).some(([key, value]) => value !== m[key as keyof CatalogModel])
    || capabilitiesTouched || reasoningEffortTouched;
  return (
    <EditDialog title="Editar modelo" description={m.id} onClose={onClose} busy={busy}>
      <form className="stack" onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        try {
          const changes: Record<string, unknown> = Object.fromEntries(Object.entries(draft).filter(([key, value]) => value !== m[key as keyof CatalogModel]));
          if (capabilitiesTouched) changes.capabilities = capabilities;
          if (reasoningEffortTouched) changes.reasoningEffort = reasoningEffort === "supported";
          await api(`/admin/models/item/${enc(m.id)}`, { method: "PATCH", body: changes });
          await onSaved();
        } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
      }}>
        <fieldset disabled={busy} className="admin-form-grid">
          <label>Nombre visible<input required maxLength={120} value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} /></label>
          <label>Contexto (tokens)<input required type="number" min={1000} max={100_000_000} value={draft.context} onChange={(e) => setDraft({ ...draft, context: Number(e.target.value) })} /></label>
          {(["inPrice", "outPrice", "cacheReadPrice"] as const).map((key, index) => (
            <label key={key}>{["Entrada ($/MTok)", "Salida ($/MTok)", "Lectura de caché ($/MTok)"][index]}
              <input required type="number" min={0} max={1000} step="any" value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: Number(e.target.value) })} />
            </label>
          ))}
          {(["tier", "speed"] as const).map((key) => (
            <label key={key}>{key === "tier" ? "Calidad" : "Velocidad"}
              <Select label={key === "tier" ? "Calidad" : "Velocidad"} value={String(draft[key])} onValueChange={(v) => setDraft({ ...draft, [key]: Number(v) })}
                searchable={false} options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} de 5` }))} />
            </label>
          ))}
        </fieldset>
        <div className="row" style={{ flexWrap: "wrap" }}>
          {(["enabled", "vision", "tools"] as const).map((key) => (
            <label key={key} className="row small">
              <input type="checkbox" disabled={busy} checked={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.checked })} style={{ width: "auto" }} />
              {{ enabled: "Activo", vision: "Imágenes", tools: "Herramientas" }[key]}
            </label>
          ))}
        </div>
        <details className="ai-editor-advanced">
        <summary>Avanzado · perfil de Fusion</summary>
        <fieldset disabled={busy} className="stack" style={{ border: 0, padding: "12px 0" }}>
          <strong>Perfil de Fusion</strong>
          <div className="small muted">Solo guarda valores fundamentados; la confianza y la fuente se conservan para mostrar su procedencia.</div>
          <div className="row" style={{ flexWrap: "wrap" }}>
            {(["reasoning", "coding", "debugging", "toolUse"] as const).map((key) => (
              <label className="small" key={key}>{({ reasoning: "Razonamiento", coding: "Código", debugging: "Depuración", toolUse: "Uso de herramientas" })[key]}
                <input type="number" min={1} max={5} step="0.1" value={capabilities[key]} onChange={(e) => {
                  setCapabilities({ ...capabilities, [key]: Number(e.target.value) });
                  setCapabilitiesTouched(true);
                }} />
              </label>
            ))}
            <label className="small">Confianza (0–1)
              <input type="number" min={0} max={1} step="0.05" value={capabilities.confidence} onChange={(e) => {
                setCapabilities({ ...capabilities, confidence: Number(e.target.value) });
                setCapabilitiesTouched(true);
              }} />
            </label>
            <label className="small">Fuente
              <Select label="Fuente del perfil" value={capabilities.source} onValueChange={(source) => {
                setCapabilities({ ...capabilities, source: source as typeof capabilities.source });
                setCapabilitiesTouched(true);
              }} searchable={false} options={[
                { value: "declared", label: "Declarada" }, { value: "classification", label: "Clasificación" },
                { value: "evaluation", label: "Evaluación" },
              ]} />
            </label>
          </div>
          <label className="small">Soporte verificado de reasoning effort
            <Select label="Soporte de reasoning effort" value={reasoningEffort} onValueChange={(value) => {
              setReasoningEffort(value as typeof reasoningEffort);
              setReasoningEffortTouched(true);
            }} searchable={false} options={[
              ...(m.reasoningEffort === undefined ? [{ value: "unverified", label: "Sin verificar" }] : []),
              { value: "supported", label: "Compatible" }, { value: "unsupported", label: "No compatible" },
            ]} />
          </label>
        </fieldset>
        </details>
        {m.source === "openrouter" && <div className="small muted">La próxima sincronización puede actualizar las capacidades, el contexto y los precios de OpenRouter.</div>}
        {error && <div className="error-box" role="alert">{error}</div>}
        <div className="row"><button className="primary" disabled={busy || !dirty}>{busy ? "Guardando…" : "Guardar cambios"}</button><button type="button" disabled={busy} onClick={onClose}>Cancelar</button></div>
      </form>
    </EditDialog>
  );
}

/** The platform whitelist (setting models.allow), with how many models each pattern matches. */
function Whitelist({ models, onSaved }: { models: CatalogModel[]; onSaved: () => Promise<void> }) {
  const [setting, setSetting] = useState<SettingView | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = () => api<{ settings: SettingView[] }>("/admin/settings").then((r) => {
    const s = r.settings.find((x) => x.key === "models.allow");
    if (!s) throw new Error("No se encontró la lista blanca de modelos.");
    setSetting(s);
    setText((s.value as string[]).join("\n"));
  });
  useEffect(() => {
    void load().catch((e) => setError((e as Error).message));
  }, []);
  if (!setting) return error ? <div className="error-box" role="alert">{error} <button onClick={() => { setError(""); void load().catch((e) => setError((e as Error).message)); }}>Reintentar</button></div> : <div role="status">Cargando permisos…</div>;
  const globs = text.split("\n").map((g) => g.trim()).filter(Boolean);
  const usable = models.filter((m) => m.available);
  const dirty = globs.join("\n") !== (setting.value as string[]).join("\n");
  const save = async (value: string[] | null) => {
    setError("");
    setBusy(true);
    try {
      const r = value
        ? await api<{ settings: SettingView[] }>("/admin/settings", { method: "PATCH", body: { "models.allow": value } })
        : await api<{ settings: SettingView[] }>("/admin/settings/models.allow", { method: "DELETE" });
      const s = r.settings.find((x) => x.key === "models.allow")!;
      setSetting(s);
      setText((s.value as string[]).join("\n"));
      await onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="card stack" style={{ padding: 16, gap: 10 }}>
      <div>
        <strong>Lista blanca de la plataforma</strong>
        <div className="small muted">{setting.help}</div>
      </div>
      <div className="row" style={{ alignItems: "stretch", flexWrap: "wrap" }}>
        <textarea aria-label="Patrones permitidos de modelos" disabled={busy} className="code grow" rows={Math.min(14, globs.length + 2)} value={text} onChange={(e) => setText(e.target.value)} style={{ minWidth: 0, flexBasis: 260 }} />
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
        <button className="primary" disabled={busy || !dirty} onClick={() => void save(globs)}>
          {busy ? "Guardando…" : "Guardar lista"}
        </button>
        {!setting.isDefault && <button disabled={busy} onClick={() => void save(null)}>Volver a la lista por defecto</button>}
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

function AddModel({ existing, onAdded }: { existing: Set<string>; onAdded: () => Promise<void> }) {
  const [open, setOpen] = useState(() => new URLSearchParams(window.location.search).get("add") === "1");
  // Registered providers, not the ones that already have models: a freshly added provider has none.
  const [providers, setProviders] = useState<string[]>([]);
  useEffect(() => {
    if (!open) return;
    void api<{ providers: { id: string }[] }>("/admin/providers").then((r) => {
      const ids = r.providers.map((p) => p.id).filter((id) => id !== "openrouter");
      setProviders(ids);
      setF((cur) => (ids.includes(cur.provider) ? cur : { ...cur, provider: ids.find((id) => id !== "anthropic") ?? ids[0] ?? "" }));
    }).catch((e) => setError((e as Error).message));
  }, [open]);
  const [f, setF] = useState(() => ({ provider: new URLSearchParams(window.location.search).get("provider") ?? "", model: "", label: "", inPrice: 0, outPrice: 0, context: 128000, tier: 3, speed: 3, tools: false, vision: false }));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
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
      label: m?.label ?? name,
      context: m?.context ?? 128000,
      inPrice: m?.inPrice ?? 0,
      outPrice: m?.outPrice ?? 0,
      tools: false,
      vision: false,
    }));
  };
  if (!open)
    return (
      <div>
        <button className="primary" onClick={() => setOpen(true)}>+ Añadir modelo propio</button>
      </div>
    );
  const field = (k: keyof typeof f, label: string, type = "text") => (
    <label className="small">
      {label}
      <input
        type={type}
        value={String(f[k])}
        onChange={(e) => setF({ ...f, [k]: type === "number" ? Number(e.target.value) : e.target.value })}
        min={type === "number" ? (k === "context" ? 1000 : k === "tier" || k === "speed" ? 1 : 0) : undefined}
        max={type === "number" ? (k === "context" ? 100_000_000 : k === "tier" || k === "speed" ? 5 : 1000) : undefined}
        step={type === "number" ? (k === "inPrice" || k === "outPrice" ? "any" : 1) : undefined}
      />
    </label>
  );
  return (
    <EditDialog title="Añadir modelo propio" description="Elige un modelo del proveedor o escribe su nombre en la API. Confirma sus capacidades antes de usarlo." busy={busy} onClose={() => setOpen(false)}>
    <form
      className="stack"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        setBusy(true);
        try {
          await api("/admin/models", { body: f });
          await onAdded();
          setOpen(false);
        } catch (x) {
          setError((x as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <fieldset disabled={busy} className="admin-form-grid">
        <label className="small">
          Proveedor
          <Select label="Proveedor del nuevo modelo" value={f.provider} disabled={busy} onValueChange={(provider) => setF({ ...f, provider, model: "", label: "" })}
            options={providers.map((p) => ({ value: p, label: p }))} />
        </label>
        <div className="small">
          <div>Modelos disponibles</div>
          <Select label="Modelo del proveedor" value={f.model} onValueChange={pick} disabled={busy || remote.loading || !pickable.length}
            placeholder={remote.loading ? "Cargando modelos…" : "Buscar en el proveedor"}
            options={pickable.map((m) => ({ value: m.id, label: m.id, description: m.label }))} />
        </div>
        <label className="small">
          Nombre en la API
          <input required maxLength={200} value={f.model} onChange={(e) => pick(e.target.value)} placeholder="Elige arriba o escribe el nombre" />
        </label>
        {field("label", "Nombre visible")}
        <label className="row small" style={{ color: "var(--text)" }}>
          <input type="checkbox" checked={f.tools} onChange={(e) => setF({ ...f, tools: e.target.checked })} style={{ width: "auto" }} /> Herramientas
        </label>
        <label className="row small" style={{ color: "var(--text)" }}>
          <input type="checkbox" checked={f.vision} onChange={(e) => setF({ ...f, vision: e.target.checked })} style={{ width: "auto" }} /> Imágenes
        </label>
      </fieldset>
      <details className="ai-editor-advanced">
        <summary className="small muted" style={{ cursor: "pointer" }}>Precios, contexto y rendimiento</summary>
        <fieldset disabled={busy} className="admin-form-grid" style={{ marginTop: 8 }}>
          {field("inPrice", "$ entrada/MTok", "number")}
          {field("outPrice", "$ salida/MTok", "number")}
          {field("context", "Contexto", "number")}
          {field("tier", "Calidad 1–5", "number")}
          {field("speed", "Velocidad 1–5", "number")}
        </fieldset>
      </details>
      <div className="small muted">Herramientas permite construir; Imágenes permite evaluar capturas. Revisa los precios: un valor de 0 sin verificar no significa gratis.</div>
      <div className="small muted">
        {remote.loading
          ? "Consultando los modelos del proveedor…"
          : remote.error
            ? `No se pudo listar los modelos del proveedor (${remote.error}); escribe el nombre a mano.`
            : `${pickable.length} modelos del proveedor sin añadir; también puedes escribir el nombre a mano.`}
      </div>
      {error && <div className="error-box" role="alert">{error}</div>}
      {!providers.length && <div className="small muted">Añade primero un proveedor en la sección Proveedores.</div>}
      <div className="row">
        <button className="primary" disabled={busy || !f.model.trim() || !f.provider || existing.has(`${f.provider}:${f.model.trim()}`)}>
          {busy ? "Añadiendo…" : "Añadir"}
        </button>
        <button type="button" className="ghost" disabled={busy} onClick={() => setOpen(false)}>
          Cancelar
        </button>
      </div>
    </form>
    </EditDialog>
  );
}
