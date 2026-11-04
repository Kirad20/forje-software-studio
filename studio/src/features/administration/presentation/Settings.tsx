import { useEffect, useState } from "react";
import { api } from "../application/controller.js";
import { ApiError } from "../../../shared/infrastructure/http-client.js";
import { Select, Switch } from "../../../shared/ui.js";

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
  const [filter, setFilter] = useState("");
  const [group, setGroup] = useState("");
  const [onlyChanged, setOnlyChanged] = useState(false);
  const load = () => api<NonNullable<typeof data>>("/admin/settings").then(setData);
  useEffect(() => {
    void load().catch((e) => setErrors({ _: (e as Error).message }));
  }, []);
  const dirty = Object.keys(draft).length > 0;
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!data) return <div className="empty">{errors._ ? <div role="alert">{errors._} <button onClick={() => { setErrors({}); void load().catch((e) => setErrors({ _: (e as Error).message })); }}>Reintentar</button></div> : <span className="spinner" />}</div>;
  const set = (key: string, value: unknown) => {
    setNotice("");
    setErrors(({ [key]: _, ...rest }) => rest);
    setDraft((d) => {
      const next = { ...d };
      if (JSON.stringify(value) === JSON.stringify(data.settings.find((s) => s.key === key)?.value)) delete next[key];
      else next[key] = value;
      return next;
    });
  };
  const save = async (patch = draft) => {
    setBusy(true);
    try {
      const r = await api<{ settings: SettingView[]; changed: string[] }>("/admin/settings", { method: "PATCH", body: patch });
      setData({ ...data, settings: r.settings });
      setDraft((d) => Object.fromEntries(Object.entries(d).filter(([k]) => !(k in patch))));
      setNotice(`Guardado: ${r.changed.length} ${r.changed.length === 1 ? "ajuste" : "ajustes"}.`);
      return true;
    } catch (e) {
      const field = e instanceof ApiError && typeof e.data.field === "string" ? e.data.field : "_";
      setErrors({ [field]: (e as Error).message });
      return false;
    } finally {
      setBusy(false);
    }
  };
  const reset = async (key: string) => {
    setBusy(true);
    setErrors({});
    setNotice("");
    try {
      const r = await api<{ settings: SettingView[] }>(`/admin/settings/${encodeURIComponent(key)}`, { method: "DELETE" });
      setData({ ...data, settings: r.settings });
      setDraft(({ [key]: _, ...rest }) => rest);
      setNotice("Valor por defecto restablecido.");
    } catch (e) { setErrors({ [key]: (e as Error).message }); } finally { setBusy(false); }
  };

  const groups = [...new Set(data.settings.map((s) => s.group))];
  const visible = data.settings.filter((s) => (!group || s.group === group)
    && (!onlyChanged || !s.isDefault || s.key in draft)
    && `${s.label} ${s.key} ${s.help ?? ""}`.toLocaleLowerCase().includes(filter.toLocaleLowerCase()));
  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="admin-toolbar">
        <input aria-label="Buscar ajustes" placeholder="Buscar ajustes por nombre o descripción…" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <Select label="Grupo de ajustes" value={group} onValueChange={setGroup} style={{ width: 230 }}
          options={[{ value: "", label: "Todos los grupos" }, ...groups.map((g) => ({ value: g, label: data.groups[g] ?? g }))]} />
        <label className="row small"><input type="checkbox" checked={onlyChanged} onChange={(e) => setOnlyChanged(e.target.checked)} style={{ width: "auto" }} />Solo modificados</label>
      </div>
      <div className="small muted" role="status">{visible.length} de {data.settings.length} ajustes · {Object.keys(draft).length} cambios sin guardar</div>
      {!visible.length && <div className="card empty">No hay ajustes con estos filtros. <button onClick={() => { setFilter(""); setGroup(""); setOnlyChanged(false); }}>Limpiar filtros</button></div>}
      {groups.filter((g) => visible.some((s) => s.group === g)).map((g) => (
        <section key={g} className="card" style={{ padding: "14px 18px" }}>
          <div className="section-title">{data.groups[g] ?? g}</div>
          {visible
            .filter((s) => s.group === g)
            .map((s) => (
              <div key={s.key} className="setting-row">
                <div>
                  <label htmlFor={`setting-${s.key}`} style={{ fontWeight: 500 }}>{s.label}</label>
                  <div className="small muted">
                    <code>{s.key}</code> {s.isDefault ? <span className="pill">por defecto</span> : <span className="pill accent">cambiado</span>}
                  </div>
                </div>
                <div className="stack" style={{ gap: 4 }}>
                  <Field s={s} disabled={busy} value={s.key in draft ? draft[s.key] : s.value} onChange={(v) => set(s.key, v)} onSecret={(v) => save({ [s.key]: v })} />
                  {s.help && <div className="small muted">{s.help}</div>}
                  {errors[s.key] && <div className="error-box">{errors[s.key]}</div>}
                </div>
                <div>
                  {!s.isDefault && s.type !== "secret" && (
                    <button disabled={busy} className="ghost small" title={`Valor por defecto: ${JSON.stringify(s.default)}`} onClick={() => void reset(s.key)}>
                      Restablecer
                    </button>
                  )}
                </div>
              </div>
            ))}
        </section>
      ))}
      <div className="row admin-save-bar">
        <button className="primary" disabled={!dirty || busy} onClick={() => void save()}>
          {busy ? <span className="spinner" /> : "Guardar cambios"}
        </button>
        {dirty && (
          <button className="ghost" disabled={busy} onClick={() => { setDraft({}); setErrors({}); setNotice(""); }}>
            Descartar
          </button>
        )}
        {errors._ && <div className="error-box" role="alert">{errors._}</div>}
        {notice && <span className="small muted" role="status">{notice}</span>}
      </div>
    </div>
  );
}

function Field({ s, value, onChange, onSecret, disabled }: { s: SettingView; value: unknown; onChange: (v: unknown) => void; onSecret: (v: string | null) => Promise<boolean>; disabled: boolean }) {
  const [secret, setSecret] = useState("");
  const [editing, setEditing] = useState(false);
  switch (s.type) {
    case "boolean":
      return <Switch on={!!value} onChange={onChange} label={s.label} disabled={disabled} />;
    case "enum":
      return (
        <Select id={`setting-${s.key}`} label={s.label} value={String(value)} onValueChange={onChange} disabled={disabled}
          options={(s.options ?? []).map((o) => ({ value: o, label: ENUM_LABELS[o] ?? o }))} />
      );
    case "number":
      return <input id={`setting-${s.key}`} disabled={disabled} type="number" value={String(value ?? "")} min={s.min} max={s.max} step={s.integer ? 1 : "any"} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} />;
    case "list":
      return (
        <ListField id={`setting-${s.key}`} disabled={disabled} value={value as string[]} onChange={onChange} />
      );
    case "secret":
      if (s.secret?.set && !editing)
        return (
          <div className="row">
            <code className="grow">{s.secret.hint ?? "••••••••"}</code>
            {s.secret.broken && <span className="pill err">no se puede descifrar</span>}
            <button disabled={disabled} onClick={() => setEditing(true)}>Cambiar</button>
            <button disabled={disabled} className="danger" onClick={() => { if (confirm(`¿Quitar ${s.label}?`)) void onSecret(null); }}>
              Quitar
            </button>
          </div>
        );
      return (
        <div className="row">
          <input id={`setting-${s.key}`} disabled={disabled} className="grow" type="password" autoComplete="off" placeholder={s.secret?.set ? "Valor nuevo" : "Sin configurar"} value={secret} onChange={(e) => setSecret(e.target.value)} />
          <button
            className="primary"
            disabled={disabled || !secret.trim()}
            onClick={async () => {
              if (await onSecret(secret.trim())) { setSecret(""); setEditing(false); }
            }}
          >
            Guardar
          </button>
          {editing && <button disabled={disabled} onClick={() => { setSecret(""); setEditing(false); }}>Cancelar</button>}
        </div>
      );
    default:
      return <input id={`setting-${s.key}`} disabled={disabled} type={s.type === "url" ? "url" : "text"} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
  }
}

const listValues = (text: string) => text.split("\n").map((line) => line.trim()).filter(Boolean);

function ListField({ id, value, disabled, onChange }: { id: string; value: string[]; disabled: boolean; onChange: (value: string[]) => void }) {
  const serialized = value.join("\n");
  const [text, setText] = useState(serialized);
  useEffect(() => {
    setText((current) => listValues(current).join("\n") === serialized ? current : serialized);
  }, [serialized]);
  return <textarea id={id} disabled={disabled} className="code" rows={Math.min(14, Math.max(3, text.split("\n").length + 1))}
    value={text} placeholder="Un patrón por línea" onChange={(event) => {
      setText(event.target.value);
      onChange(listValues(event.target.value));
    }} />;
}
