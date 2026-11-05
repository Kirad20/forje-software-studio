import { useEffect, useState } from "react";
import { api } from "../application/controller.js";
import { Switch } from "../../../shared/ui.js";
import { EditDialog } from "../../../shared/EditDialog.js";
import { useConfirmation } from "../../../shared/ConfirmDialog.js";
import { WandSparkles } from "lucide-react";

interface ProviderView {
  id: string;
  kind: "anthropic" | "openai" | "ollama";
  label: string;
  baseUrl: string | null;
  headerNames: string[];
  enabled: boolean;
  builtin: boolean;
  keySet: boolean;
  keyHint: string | null;
  keyBroken: boolean;
  available: boolean;
  missing: string | null;
}

interface Probe {
  ok: boolean;
  ms: number;
  models?: number;
  error?: string;
}

const KIND_HINT: Record<string, string> = {
  anthropic: "Modelos Claude con la API de Anthropic.",
  openrouter: "Cientos de modelos con una sola clave; su catálogo se sincroniza a diario.",
  openai: "OpenAI o cualquier servidor compatible (Ollama, vLLM, LM Studio…).",
  ollama: "API nativa de Ollama: herramientas, imágenes y contexto configurado por modelo.",
};

/** Admin → Proveedores: keys, URLs and a connection test for each model provider. */
export function Providers() {
  const [list, setList] = useState<ProviderView[] | null>(null);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState("");
  const load = () => api<{ providers: ProviderView[] }>("/admin/providers").then((r) => setList(r.providers));
  useEffect(() => {
    void load().catch((e) => setError((e as Error).message));
  }, []);
  if (!list) return <div className="empty">{error ? <div role="alert">{error} <button onClick={() => { setError(""); void load().catch((e) => setError((e as Error).message)); }}>Reintentar</button></div> : <span className="spinner" />}</div>;
  const patch = async (id: string, body: Record<string, unknown>) => {
    setError("");
    try {
      setList((await api<{ providers: ProviderView[] }>(`/admin/providers/${id}`, { method: "PATCH", body })).providers);
      return null;
    } catch (e) {
      setError((e as Error).message);
      return (e as Error).message;
    }
  };
  return (
    <div className="stack" style={{ gap: 14 }}>
      <p className="small muted" style={{ margin: 0 }}>
        Un proveedor se usa cuando está activado y tiene su clave (o su URL). Las claves se guardan cifradas y nunca vuelven al navegador.
      </p>
      <p className="small muted" style={{ margin: 0 }}>
        El alta mágica usa un modelo habilitado y permitido en tu cuenta, elegido por el router, para clasificar con IA. Conserva los metadatos del proveedor y estima los datos restantes; no usa una tabla fija por familia. Si la IA desconoce un dato, se usa contexto de 128 000, precios de 0 pendientes de revisión y capacidades desactivadas. Los nuevos modelos quedan desactivados; no cambia permisos ni modelos existentes. Las llamadas generan costo en el proveedor.
      </p>
      <div className="admin-toolbar">
        <input type="search" name="provider-search" autoComplete="off" autoCorrect="off" spellCheck={false} aria-label="Buscar proveedores" placeholder="Buscar por nombre, identificador o URL…" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <button className="primary" disabled={adding} onClick={() => setAdding(true)}>+ Añadir proveedor</button>
      </div>
      <div className="small muted">{list.filter((p) => p.available).length} de {list.length} proveedores disponibles</div>
      {error && <div className="error-box" role="alert">{error}</div>}
      {list.filter((p) => `${p.label} ${p.id} ${p.baseUrl ?? ""}`.toLowerCase().includes(filter.toLowerCase())).map((p) => (
        <ProviderCard key={p.id} p={p} onPatch={(b) => patch(p.id, b)} onDeleted={(l) => setList(l)} />
      ))}
      {filter && !list.some((p) => `${p.label} ${p.id} ${p.baseUrl ?? ""}`.toLowerCase().includes(filter.toLowerCase())) && <div className="empty">No hay proveedores con ese filtro. <button onClick={() => setFilter("")}>Limpiar búsqueda</button></div>}
      {adding && (
        <AddProvider onDone={(l) => (l && setList(l), setAdding(false))} />
      )}
    </div>
  );
}

function ProviderCard({ p, onPatch, onDeleted }: { p: ProviderView; onPatch: (b: Record<string, unknown>) => Promise<string | null>; onDeleted: (l: ProviderView[]) => void }) {
  const { confirm, dialog } = useConfirmation();
  const [key, setKey] = useState("");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [probe, setProbe] = useState<Probe | null>(null);
  const [testing, setTesting] = useState(false);
  const update = async (body: Record<string, unknown>) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const failure = await onPatch(body);
      if (!failure) { setNotice("Proveedor actualizado."); setProbe(null); }
      return failure;
    } finally { setBusy(false); }
  };
  const test = async () => {
    setTesting(true);
    setProbe(null);
    try {
      setProbe(await api<Probe>(`/admin/providers/${p.id}/test`, { body: {} }));
    } catch (e) {
      setProbe({ ok: false, ms: 0, error: (e as Error).message });
    } finally {
      setTesting(false);
    }
  };
  const importModels = async () => {
    if (!await confirm(`¿Dar de alta y clasificar con IA los modelos de ${p.label}? Se usará un modelo habilitado y permitido en tu cuenta; las llamadas generan costo en el proveedor. Los existentes no se modifican. Los nuevos quedan desactivados: revisa las estimaciones de precios, contexto, calidad, velocidad y capacidades antes de activarlos.`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await api<{ created: number; skipped: number; errors: { model: string; error: string }[]; classifiedBy: string[]; usd: number }>(
        `/admin/providers/${encodeURIComponent(p.id)}/models/import`, { body: {} },
      );
      setNotice(`${result.created} modelos propios creados y desactivados para revisión · ${result.skipped} existentes o duplicados sin cambios. ${result.classifiedBy.length ? `Clasificados por ${result.classifiedBy.join(", ")} · costo estimado $${result.usd.toFixed(5)} USD. ` : ""}Revisa y activa los nuevos en Administración → Modelos (desmarca «Solo utilizables»).`);
      if (result.errors.length) setError(result.errors.map(e => `${e.model}: ${e.error}`).join(" · "));
    } catch (e) {
      setError((e as Error).message);
    } finally { setBusy(false); }
  };
  return (
    <section className="card stack" style={{ padding: 16, gap: 10 }}>
      <div className="row">
        <div className="grow">
          <strong>{p.label}</strong> <code className="small muted">{p.id}</code>
          <div className="small muted">{KIND_HINT[p.id] ?? KIND_HINT[p.kind]}</div>
        </div>
        {p.available ? <span className="pill ok">Disponible</span> : <span className={`pill ${p.enabled ? "warn" : ""}`}>{p.missing}</span>}
        <Switch on={p.enabled} disabled={busy || testing} onChange={(v) => void update({ enabled: v })} label={`Activar ${p.label}`} />
      </div>
      <div className="kv" style={{ alignItems: "center" }}>
        <span className="muted">Clave de API</span>
        <div className="row">
          {p.keySet && <code>{p.keyBroken ? "no se puede descifrar" : (p.keyHint ?? "••••")}</code>}
          <input className="grow" name={`provider-key-${p.id}`} aria-label={`Clave de API de ${p.label}`} disabled={busy} type="password" autoComplete="new-password" placeholder={p.keySet ? "Reemplazar clave" : p.kind !== "anthropic" && p.id !== "openrouter" ? "Opcional en servidores locales" : "Pega la clave"} value={key} onChange={(e) => setKey(e.target.value)} />
          <button
            disabled={busy || !key.trim()}
            onClick={async () => {
              if (!await update({ apiKey: key.trim() })) setKey("");
            }}
          >
            Guardar
          </button>
          {p.keySet && (
            <button disabled={busy} className="danger" onClick={async () => { if (await confirm(`¿Quitar la clave de ${p.label}?`)) void update({ apiKey: null }); }}>
              Quitar
            </button>
          )}
        </div>
        {p.kind !== "anthropic" && p.id !== "openrouter" && (
          <>
            <span className="muted">URL base</span>
            <div className="row">
              <code style={{ overflowWrap: "anywhere" }}>{p.baseUrl}</code>
            </div>
          </>
        )}
      </div>
      {p.headerNames.length > 0 && <div className="small muted">Cabeceras configuradas: {p.headerNames.join(", ")}</div>}
      {error && <div className="error-box" role="alert">{error}</div>}
      {notice && <div className="small muted" role="status">{notice}</div>}
      <div className="row">
        <button onClick={() => setEditing(true)} disabled={busy || testing}>Editar proveedor</button>
        <button onClick={() => void test()} disabled={busy || testing || !p.available}>
          {testing ? <span className="spinner" /> : "Probar conexión"}
        </button>
        {p.id !== "openrouter" && <button className="primary" onClick={() => void importModels()} disabled={busy || testing || !p.available}>
          {busy ? <span className="spinner" /> : <WandSparkles size={16} aria-hidden="true" />} Dar de alta y clasificar con IA
        </button>}
        {probe &&
          (probe.ok ? (
            <span className="pill ok">
              Conecta en {probe.ms} ms{probe.models !== undefined ? ` · ${probe.models} modelos` : ""}
            </span>
          ) : (
            <span className="pill err" style={{ whiteSpace: "normal" }}>
              {probe.error}
            </span>
          ))}
        <span className="grow" />
        {!p.builtin && (
          <button
            className="danger"
            disabled={busy || testing}
            onClick={async () => {
              if (!await confirm(`¿Borrar el proveedor «${p.label}» y sus modelos propios? Esta acción no se puede deshacer.`)) return;
              setBusy(true);
              setError("");
              try {
                onDeleted((await api<{ providers: ProviderView[] }>(`/admin/providers/${p.id}`, { method: "DELETE" })).providers);
              } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
            }}
          >
            Borrar
          </button>
        )}
      </div>
      {editing && <ProviderEditor p={p} onClose={() => setEditing(false)} onSave={async (body) => {
        const failure = await update(body);
        if (!failure) setEditing(false);
        return failure;
      }} />}
      {dialog}
    </section>
  );
}

function ProviderEditor({ p, onClose, onSave }: {
  p: ProviderView; onClose: () => void; onSave: (body: Record<string, unknown>) => Promise<string | null>;
}) {
  const [label, setLabel] = useState(p.label);
  const [url, setUrl] = useState(p.baseUrl ?? "");
  const [replaceHeaders, setReplaceHeaders] = useState(false);
  const [headers, setHeaders] = useState("{}");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const editableUrl = p.kind !== "anthropic" && p.id !== "openrouter";
  const dirty = label !== p.label || (editableUrl && url !== (p.baseUrl ?? "")) || replaceHeaders;
  return (
    <EditDialog title="Editar proveedor" description={`Identificador: ${p.id}. Las claves y los valores de cabeceras no se muestran por seguridad.`} onClose={onClose} busy={busy}>
      <form className="stack" onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        const body: Record<string, unknown> = {};
        if (label !== p.label) body.label = label.trim();
        if (editableUrl && url !== (p.baseUrl ?? "")) body.baseUrl = url.trim();
        if (replaceHeaders) {
          try {
            const parsed: unknown = JSON.parse(headers);
            if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || Object.values(parsed).some((v) => typeof v !== "string")) {
              throw new Error("Usa un objeto JSON con nombres y valores de texto.");
            }
            body.headers = parsed;
          } catch (e) { setError(`Cabeceras no válidas: ${(e as Error).message}`); return; }
        }
        setBusy(true);
        try {
          const failure = await onSave(body);
          if (failure) setError(failure);
        } finally { setBusy(false); }
      }}>
        <fieldset disabled={busy} className="stack">
          <label>Nombre visible<input required maxLength={80} value={label} onChange={(e) => setLabel(e.target.value)} /></label>
          {editableUrl && <label>URL base<input required type="url" maxLength={500} placeholder={p.kind === "ollama" ? "http://localhost:11434" : "http://localhost:11434/v1"} value={url} onChange={(e) => setUrl(e.target.value)} /></label>}
          <label className="row small"><input type="checkbox" checked={replaceHeaders} onChange={(e) => setReplaceHeaders(e.target.checked)} style={{ width: "auto" }} />Reemplazar cabeceras personalizadas</label>
          {replaceHeaders && <>
            <div className="small muted">Reemplaza todas las cabeceras existentes{p.headerNames.length ? ` (${p.headerNames.join(", ")})` : ""}. Usa {"{}"} para quitarlas; desmarca para conservarlas.</div>
            <label htmlFor="provider-headers">Cabeceras (JSON)</label>
            <textarea id="provider-headers" className="code" rows={4} spellCheck={false} value={headers} onChange={(e) => setHeaders(e.target.value)} />
          </>}
        </fieldset>
        {error && <div className="error-box" role="alert">{error}</div>}
        <div className="row"><button className="primary" disabled={busy || !dirty}>{busy ? "Guardando…" : "Guardar cambios"}</button><button type="button" disabled={busy} onClick={onClose}>Cancelar</button></div>
      </form>
    </EditDialog>
  );
}

function AddProvider({ onDone }: { onDone: (list?: ProviderView[]) => void }) {
  const [kind, setKind] = useState<"openai" | "ollama">("openai");
  const [id, setId] = useState("");
  const [label, setLabel] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="card stack"
      style={{ padding: 16 }}
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        setBusy(true);
        try {
          const r = await api<{ providers: ProviderView[] }>("/admin/providers", { body: { id, kind, label: label || id, baseUrl, apiKey: apiKey || undefined, enabled: true } });
          onDone(r.providers);
        } catch (x) {
          setError((x as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <strong>Nuevo proveedor</strong>
      <fieldset disabled={busy} className="admin-form-grid">
        <label>Tipo<select value={kind} onChange={(e) => setKind(e.target.value === "ollama" ? "ollama" : "openai")}><option value="openai">Compatible con OpenAI</option><option value="ollama">Ollama nativo</option></select></label>
        <label>Identificador<input required placeholder="p. ej. ollama" pattern="[a-z0-9-]{2,32}" value={id} onChange={(e) => setId(e.target.value.toLowerCase())} /></label>
        <label>Nombre visible<input maxLength={80} placeholder="p. ej. Ollama local" value={label} onChange={(e) => setLabel(e.target.value)} /></label>
        <label>URL base<input required type="url" maxLength={500} placeholder={kind === "ollama" ? "http://localhost:11434" : "http://localhost:11434/v1"} value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} /></label>
        <label>Clave (opcional)<input name="new-provider-api-key" type="password" autoComplete="new-password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} /></label>
      </fieldset>
      {error && <div className="error-box">{error}</div>}
      <div className="row">
        <button className="primary" disabled={busy}>{busy ? "Añadiendo…" : "Añadir"}</button>
        <button type="button" className="ghost" disabled={busy} onClick={() => onDone()}>
          Cancelar
        </button>
        <span className="small muted">Después, añade sus modelos en la pestaña Modelos.</span>
      </div>
    </form>
  );
}
