import { useEffect, useState } from "react";
import { api } from "../api";
import { Switch } from "./ui";

type Kind = "preference" | "decision" | "rejected" | "business";
type Scope = "project" | "personal";

interface Memory {
  id: string;
  scope: Scope;
  kind: Kind;
  text: string;
  source: "agent" | "owner" | "summary";
}

interface MemoryView {
  project: Memory[];
  personal: Memory[];
  projectEnabled: boolean;
  personalEnabled: boolean;
}

const KINDS: { value: Kind; label: string; pill: string }[] = [
  { value: "preference", label: "Preferencia", pill: "accent" },
  { value: "decision", label: "Decisión", pill: "ok" },
  { value: "rejected", label: "Descartado", pill: "warn" },
  { value: "business", label: "Negocio", pill: "" },
];
const kindOf = (k: Kind) => KINDS.find((x) => x.value === k)!;
const SOURCE = { agent: "lo guardó el constructor", owner: "lo escribiste tú", summary: "sacado de la conversación" };

/** Settings section: what the builder remembers between conversations, editable and switchable. */
export function MemorySection({ projectId }: { projectId: string }) {
  const [data, setData] = useState<MemoryView | null>(null);
  const [error, setError] = useState("");
  const call = async (path: string, opts: { method?: string; body?: unknown } = {}) => {
    setError("");
    try {
      setData(await api<MemoryView>(`/projects/${projectId}/memory${path}`, opts));
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    }
  };
  useEffect(() => void call(""), [projectId]);

  if (!data) return null;
  return (
    <section className="card section">
      <h3>◈ Memoria</h3>
      <div className="small muted">
        Lo que el constructor recuerda entre conversaciones: tus preferencias, decisiones, enfoques descartados y datos del negocio. Lo guarda él mientras trabaja y al resumir el chat; también puedes escribirlo tú. Cada memoria se lee en cada turno.
      </div>
      {error && <div className="error-box">{error}</div>}
      <MemoryList
        title="Del proyecto"
        hint="Compartida con quien edita este proyecto."
        scope="project"
        items={data.project}
        enabled={data.projectEnabled}
        onToggle={(on) => call("/settings", { body: { project: on } })}
        call={call}
      />
      <MemoryList
        title="Personal"
        hint="Solo tuya; el constructor la aplica en todos tus proyectos."
        scope="personal"
        items={data.personal}
        enabled={data.personalEnabled}
        onToggle={(on) => call("/settings", { body: { personal: on } })}
        call={call}
      />
    </section>
  );
}

function MemoryList({
  title,
  hint,
  scope,
  items,
  enabled,
  onToggle,
  call,
}: {
  title: string;
  hint: string;
  scope: Scope;
  items: Memory[];
  enabled: boolean;
  onToggle: (on: boolean) => void;
  call: (path: string, opts?: { method?: string; body?: unknown }) => Promise<boolean>;
}) {
  const [text, setText] = useState("");
  const [kind, setKind] = useState<Kind>("preference");
  const [editing, setEditing] = useState<{ id: string; text: string; kind: Kind } | null>(null);

  return (
    <div className="stack" style={{ gap: 8, minWidth: 0 }}>
      <div className="row-setting">
        <div>
          <strong>{title}</strong>
          <div className="small muted">{enabled ? hint : "Apagada: el constructor no la lee ni guarda nada nuevo."}</div>
        </div>
        <Switch on={enabled} label={`Memoria ${title.toLowerCase()}`} onChange={onToggle} />
      </div>
      {!items.length && <div className="small muted">Todavía no hay nada.</div>}
      {items.map((m) =>
        editing?.id === m.id ? (
          <div key={m.id} className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <select style={{ width: "auto" }} value={editing.kind} onChange={(e) => setEditing({ ...editing, kind: e.target.value as Kind })} aria-label="Tipo">
              {KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
            <input className="grow" style={{ minWidth: 0, flexBasis: 220 }} value={editing.text} maxLength={300} onChange={(e) => setEditing({ ...editing, text: e.target.value })} aria-label="Texto" />
            <button className="sm primary" disabled={!editing.text.trim()} onClick={async () => (await call(`/${m.id}`, { method: "PATCH", body: { text: editing.text, kind: editing.kind } })) && setEditing(null)}>
              Guardar
            </button>
            <button className="sm ghost" onClick={() => setEditing(null)}>
              Cancelar
            </button>
          </div>
        ) : (
          <div key={m.id} className="row" style={{ gap: 8, alignItems: "flex-start", opacity: enabled ? 1 : 0.6 }}>
            <span className={`pill ${kindOf(m.kind).pill}`}>{kindOf(m.kind).label}</span>
            <div className="grow" style={{ minWidth: 0 }}>
              <div style={{ overflowWrap: "anywhere" }}>{m.text}</div>
              <div className="small muted">{SOURCE[m.source]}</div>
            </div>
            <button className="sm ghost" onClick={() => setEditing({ id: m.id, text: m.text, kind: m.kind })} aria-label={`Editar: ${m.text}`}>
              Editar
            </button>
            <button className="sm ghost" onClick={() => call(`/${m.id}`, { method: "DELETE" })} aria-label={`Olvidar: ${m.text}`}>
              Olvidar
            </button>
          </div>
        ),
      )}
      <form
        className="row"
        style={{ gap: 8, flexWrap: "wrap" }}
        onSubmit={async (e) => {
          e.preventDefault();
          if (await call("", { body: { text, kind, scope } })) setText("");
        }}
      >
        <select style={{ width: "auto" }} value={kind} onChange={(e) => setKind(e.target.value as Kind)} aria-label={`Tipo de la nueva memoria ${title.toLowerCase()}`}>
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
        <input
          className="grow"
          style={{ minWidth: 0, flexBasis: 220 }}
          value={text}
          maxLength={300}
          onChange={(e) => setText(e.target.value)}
          placeholder={scope === "project" ? "Los precios se muestran con IVA incluido" : "Respóndeme siempre en tono informal"}
          aria-label={`Nueva memoria ${title.toLowerCase()}`}
        />
        <button className="sm" type="submit" disabled={!text.trim()}>
          Añadir
        </button>
      </form>
    </div>
  );
}
