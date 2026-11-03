import { useEffect, useState } from "react";
import { api } from "../application/controller.js";
import { ApiError } from "../../../shared/infrastructure/http-client.js";
import { Switch } from "../../../shared/ui.js";

export interface SettingView {
  key: string;
  group: string;
  label: string;
  help?: string;
  type: "string" | "url" | "number" | "boolean" | "enum" | "secret" | "list";
  options?: string[];
  min?: number;
  max?: number;
  integer?: boolean;
  default: unknown;
  value?: unknown;
  isDefault: boolean;
  secret?: { set: boolean; hint: string | null; broken: boolean };
}

const ENUM_LABELS: Record<string, string> = { open: "Abierto: cualquiera con un código por correo", invite: "Solo invitados", closed: "Cerrado: solo los administradores" };

/** Admin → General: every platform setting, grouped, generated from the server's registry. */
export function Settings() {
  const [data, setData] = useState<{ groups: Record<string, string>; settings: SettingView[] } | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const load = () => api<NonNullable<typeof data>>("/admin/settings").then(setData);
  useEffect(() => {
    void load();
  }, []);

  if (!data) return <div className="empty"><span className="spinner" /></div>;
  const dirty = Object.keys(draft).length > 0;
  const set = (key: string, value: unknown) => {
    setNotice("");
    setErrors(({ [key]: _, ...rest }) => rest);
    setDraft((d) => ({ ...d, [key]: value }));
  };
  const save = async (patch = draft) => {
    setBusy(true);
    try {
      const r = await api<{ settings: SettingView[]; changed: string[] }>("/admin/settings", { method: "PATCH", body: patch });
      setData({ ...data, settings: r.settings });
      setDraft((d) => Object.fromEntries(Object.entries(d).filter(([k]) => !(k in patch))));
      setNotice(`Guardado: ${r.changed.length} ${r.changed.length === 1 ? "ajuste" : "ajustes"}.`);
    } catch (e) {
      const field = e instanceof ApiError && typeof e.data.field === "string" ? e.data.field : "_";
      setErrors({ [field]: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };
  const reset = async (key: string) => {
    const r = await api<{ settings: SettingView[] }>(`/admin/settings/${encodeURIComponent(key)}`, { method: "DELETE" });
    setData({ ...data, settings: r.settings });
    setDraft(({ [key]: _, ...rest }) => rest);
  };

  const groups = [...new Set(data.settings.map((s) => s.group))];
  return (
    <div className="stack" style={{ gap: 18 }}>
      {groups.map((g) => (
        <section key={g} className="card" style={{ padding: "14px 18px" }}>
          <div className="section-title">{data.groups[g] ?? g}</div>
          {data.settings
            .filter((s) => s.group === g)
            .map((s) => (
              <div key={s.key} className="setting-row">
                <div>
                  <div style={{ fontWeight: 500 }}>{s.label}</div>
                  <div className="small muted">
                    <code>{s.key}</code> {s.isDefault ? <span className="pill">por defecto</span> : <span className="pill accent">cambiado</span>}
                  </div>
                </div>
                <div className="stack" style={{ gap: 4 }}>
                  <Field s={s} value={s.key in draft ? draft[s.key] : s.value} onChange={(v) => set(s.key, v)} onSecret={(v) => void save({ [s.key]: v })} />
                  {s.help && <div className="small muted">{s.help}</div>}
                  {errors[s.key] && <div className="error-box">{errors[s.key]}</div>}
                </div>
                <div>
                  {!s.isDefault && s.type !== "secret" && (
                    <button className="ghost small" title={`Valor por defecto: ${JSON.stringify(s.default)}`} onClick={() => void reset(s.key)}>
                      Restablecer
                    </button>
                  )}
                </div>
              </div>
            ))}
        </section>
      ))}
      <div className="row" style={{ position: "sticky", bottom: 0, background: "var(--bg)", padding: "10px 0" }}>
        <button className="primary" disabled={!dirty || busy} onClick={() => void save()}>
          {busy ? <span className="spinner" /> : "Guardar cambios"}
        </button>
        {dirty && (
          <button className="ghost" onClick={() => setDraft({})}>
            Descartar
          </button>
        )}
        {errors._ && <div className="error-box">{errors._}</div>}
        {notice && <span className="small muted">{notice}</span>}
      </div>
    </div>
  );
}

function Field({ s, value, onChange, onSecret }: { s: SettingView; value: unknown; onChange: (v: unknown) => void; onSecret: (v: string | null) => void }) {
  const [secret, setSecret] = useState("");
  const [editing, setEditing] = useState(false);
  switch (s.type) {
    case "boolean":
      return <Switch on={!!value} onChange={onChange} label={s.label} />;
    case "enum":
      return (
        <select value={String(value)} onChange={(e) => onChange(e.target.value)}>
          {s.options!.map((o) => (
            <option key={o} value={o}>
              {ENUM_LABELS[o] ?? o}
            </option>
          ))}
        </select>
      );
    case "number":
      return <input type="number" value={String(value ?? "")} min={s.min} max={s.max} step={s.integer ? 1 : "any"} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} />;
    case "list":
      return (
        <textarea
          className="code"
          rows={Math.min(14, Math.max(3, (value as string[]).length + 1))}
          value={(value as string[]).join("\n")}
          onChange={(e) => onChange(e.target.value.split("\n").map((x) => x.trim()).filter(Boolean))}
          placeholder="Un patrón por línea"
        />
      );
    case "secret":
      if (s.secret?.set && !editing)
        return (
          <div className="row">
            <code className="grow">{s.secret.hint ?? "••••••••"}</code>
            {s.secret.broken && <span className="pill err">no se puede descifrar</span>}
            <button onClick={() => setEditing(true)}>Cambiar</button>
            <button className="danger" onClick={() => onSecret(null)}>
              Quitar
            </button>
          </div>
        );
      return (
        <div className="row">
          <input className="grow" type="password" autoComplete="off" placeholder={s.secret?.set ? "Valor nuevo" : "Sin configurar"} value={secret} onChange={(e) => setSecret(e.target.value)} />
          <button
            className="primary"
            disabled={!secret.trim()}
            onClick={() => {
              onSecret(secret.trim());
              setSecret("");
              setEditing(false);
            }}
          >
            Guardar
          </button>
          {editing && <button onClick={() => setEditing(false)}>Cancelar</button>}
        </div>
      );
    default:
      return <input type={s.type === "url" ? "url" : "text"} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
  }
}
