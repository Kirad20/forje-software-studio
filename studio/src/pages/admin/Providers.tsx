import { useEffect, useState } from "react";
import { api } from "../../api";
import { Switch } from "../../components/ui";

interface ProviderView {
  id: string;
  kind: "anthropic" | "openai";
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
};

/** Admin → Proveedores: keys, URLs and a connection test for each model provider. */
export function Providers() {
  const [list, setList] = useState<ProviderView[] | null>(null);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const load = () => api<{ providers: ProviderView[] }>("/admin/providers").then((r) => setList(r.providers));
  useEffect(() => {
    void load();
  }, []);
  if (!list) return <div className="empty"><span className="spinner" /></div>;
  const patch = async (id: string, body: Record<string, unknown>) => {
    setError("");
    try {
      setList((await api<{ providers: ProviderView[] }>(`/admin/providers/${id}`, { method: "PATCH", body })).providers);
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <div className="stack" style={{ gap: 14 }}>
      <p className="small muted" style={{ margin: 0 }}>
        Un proveedor se usa cuando está activado y tiene su clave (o su URL). Las claves se guardan cifradas y nunca vuelven al navegador.
      </p>
      {error && <div className="error-box">{error}</div>}
      {list.map((p) => (
        <ProviderCard key={p.id} p={p} onPatch={(b) => patch(p.id, b)} onDeleted={(l) => setList(l)} />
      ))}
      {adding ? (
        <AddProvider onDone={(l) => (l && setList(l), setAdding(false))} />
      ) : (
        <div>
          <button onClick={() => setAdding(true)}>+ Añadir proveedor compatible con OpenAI</button>
        </div>
      )}
    </div>
  );
}

function ProviderCard({ p, onPatch, onDeleted }: { p: ProviderView; onPatch: (b: Record<string, unknown>) => Promise<void>; onDeleted: (l: ProviderView[]) => void }) {
  const [key, setKey] = useState("");
  const [url, setUrl] = useState(p.baseUrl ?? "");
  const [probe, setProbe] = useState<Probe | null>(null);
  const [testing, setTesting] = useState(false);
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
  return (
    <section className="card stack" style={{ padding: 16, gap: 10 }}>
      <div className="row">
        <div className="grow">
          <strong>{p.label}</strong> <code className="small muted">{p.id}</code>
          <div className="small muted">{KIND_HINT[p.id] ?? "Proveedor compatible con OpenAI."}</div>
        </div>
        {p.available ? <span className="pill ok">Disponible</span> : <span className={`pill ${p.enabled ? "warn" : ""}`}>{p.missing}</span>}
        <Switch on={p.enabled} onChange={(v) => void onPatch({ enabled: v })} label={`Activar ${p.label}`} />
      </div>
      <div className="kv" style={{ alignItems: "center" }}>
        <span className="muted">Clave de API</span>
        <div className="row">
          {p.keySet && <code>{p.keyBroken ? "no se puede descifrar" : (p.keyHint ?? "••••")}</code>}
          <input className="grow" type="password" autoComplete="off" placeholder={p.keySet ? "Reemplazar clave" : p.kind === "openai" && p.id !== "openrouter" ? "Opcional en servidores locales" : "Pega la clave"} value={key} onChange={(e) => setKey(e.target.value)} />
          <button
            disabled={!key.trim()}
            onClick={() => {
              void onPatch({ apiKey: key.trim() });
              setKey("");
            }}
          >
            Guardar
          </button>
          {p.keySet && (
            <button className="danger" onClick={() => void onPatch({ apiKey: null })}>
              Quitar
            </button>
          )}
        </div>
        {p.kind === "openai" && p.id !== "openrouter" && (
          <>
            <span className="muted">URL base</span>
            <div className="row">
              <input className="grow" type="url" placeholder="https://host/v1" value={url} onChange={(e) => setUrl(e.target.value)} />
              <button disabled={url === (p.baseUrl ?? "") || !url.trim()} onClick={() => void onPatch({ baseUrl: url.trim() })}>
                Guardar
              </button>
            </div>
          </>
        )}
      </div>
      <div className="row">
        <button onClick={() => void test()} disabled={testing || !p.available}>
          {testing ? <span className="spinner" /> : "Probar conexión"}
        </button>
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
            onClick={async () => {
              if (!confirm(`¿Borrar el proveedor «${p.label}» y sus modelos propios?`)) return;
              onDeleted((await api<{ providers: ProviderView[] }>(`/admin/providers/${p.id}`, { method: "DELETE" })).providers);
            }}
          >
            Borrar
          </button>
        )}
      </div>
    </section>
  );
}

function AddProvider({ onDone }: { onDone: (list?: ProviderView[]) => void }) {
  const [id, setId] = useState("");
  const [label, setLabel] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  return (
    <form
      className="card stack"
      style={{ padding: 16 }}
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        try {
          const r = await api<{ providers: ProviderView[] }>("/admin/providers", { body: { id, label: label || id, baseUrl, apiKey: apiKey || undefined, enabled: true } });
          onDone(r.providers);
        } catch (x) {
          setError((x as Error).message);
        }
      }}
    >
      <strong>Nuevo proveedor compatible con OpenAI</strong>
      <div className="row" style={{ flexWrap: "wrap" }}>
        <input required placeholder="id (p. ej. ollama)" pattern="[a-z0-9-]{2,32}" value={id} onChange={(e) => setId(e.target.value.toLowerCase())} style={{ width: 180 }} />
        <input placeholder="Nombre visible" value={label} onChange={(e) => setLabel(e.target.value)} style={{ width: 200 }} />
        <input required type="url" className="grow" placeholder="URL base, p. ej. http://localhost:11434/v1" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
        <input type="password" autoComplete="off" placeholder="Clave (opcional)" value={apiKey} onChange={(e) => setApiKey(e.target.value)} style={{ width: 200 }} />
      </div>
      {error && <div className="error-box">{error}</div>}
      <div className="row">
        <button className="primary">Añadir</button>
        <button type="button" className="ghost" onClick={() => onDone()}>
          Cancelar
        </button>
        <span className="small muted">Después, añade sus modelos en la pestaña Modelos.</span>
      </div>
    </form>
  );
}
