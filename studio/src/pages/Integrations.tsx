import { useEffect, useState } from "react";
import { api, timeAgo } from "../api";
import { Modal } from "../components/ui";

export interface Integration {
  id: string;
  type: "openai" | "anthropic" | "postgres" | "generic";
  name: string;
  description: string;
  envName: string;
  createdAt: string;
  projectCount: number;
}

type Types = Record<Integration["type"], { label: string; env: string }>;

export const TYPE_ICON: Record<Integration["type"], string> = { openai: "◎", anthropic: "✳", postgres: "⛁", generic: "⚷" };
const TYPE_HINT: Record<Integration["type"], string> = {
  openai: "Conexión con OpenAI",
  anthropic: "Conexión con Anthropic",
  postgres: "Conecta tu propia base de datos",
  generic: "Clave de API de uso general",
};

export function Integrations() {
  const [data, setData] = useState<{ integrations: Integration[]; types: Types } | null>(null);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Integration | null>(null);
  const load = () => api<{ integrations: Integration[]; types: Types }>("/integrations").then(setData);
  useEffect(() => {
    void load();
  }, []);

  const shown = (data?.integrations ?? []).filter((i) => `${i.name} ${i.description} ${i.envName}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page stack" style={{ gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 24 }}>Integraciones</h1>
        <div className="muted">Tus claves de API y conexiones externas. Guárdalas una vez y conéctalas a cualquier proyecto.</div>
      </div>
      <div className="row">
        <input placeholder="Buscar integraciones…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 360 }} />
        <div className="grow" />
        <button className="primary" onClick={() => setCreating(true)}>
          ＋ Nueva integración
        </button>
      </div>
      {!data ? (
        <div className="empty">
          <span className="spinner" />
        </div>
      ) : shown.length === 0 ? (
        <div className="card empty">{data.integrations.length ? "Ninguna coincide." : "Aún no tienes integraciones."}</div>
      ) : (
        shown.map((i) => (
          <div key={i.id} className="card" style={{ padding: 16, display: "grid", gap: 8 }}>
            <div className="row">
              <span className="avatar" style={{ background: "var(--surface-2)", color: "var(--text)", width: 34, height: 34 }}>
                {TYPE_ICON[i.type]}
              </span>
              <div className="grow">
                <strong>{i.name}</strong>
                <div className="small muted">
                  {data.types[i.type].label.toUpperCase()} · <code>{i.envName}</code>
                </div>
              </div>
              <span className="pill">{i.projectCount} proyecto{i.projectCount === 1 ? "" : "s"}</span>
            </div>
            {i.description && <div className="small muted">{i.description}</div>}
            <div className="row">
              <span className="small muted grow">Creada {timeAgo(i.createdAt)}</span>
              <button className="sm" onClick={() => setEditing(i)}>
                Cambiar valor
              </button>
              <button
                className="sm danger"
                onClick={async () => {
                  if (!confirm(`¿Borrar «${i.name}»? Se desconecta de ${i.projectCount} proyecto(s).`)) return;
                  await api(`/integrations/${i.id}`, { method: "DELETE" });
                  void load();
                }}
              >
                Borrar
              </button>
            </div>
          </div>
        ))
      )}
      {creating && data && <CreateDialog types={data.types} onClose={() => setCreating(false)} onDone={load} />}
      {editing && <ValueDialog integration={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

export function CreateDialog({ types, onClose, onDone }: { types: Types; onClose: () => void; onDone: (id: string) => void }) {
  const [type, setType] = useState<Integration["type"] | null>(null);
  const [name, setName] = useState("");
  const [envName, setEnvName] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  return (
    <Modal onClose={onClose} className="modal" >
      {!type ? (
        <>
          <div>
            <h3>Tipo de integración</h3>
            <div className="small muted">Elige qué quieres añadir</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {(Object.keys(types) as Integration["type"][]).map((t) => (
              <button
                key={t}
                style={{ height: "auto", padding: 12, justifyContent: "flex-start", textAlign: "left" }}
                onClick={() => {
                  setType(t);
                  setName(types[t].label);
                  setEnvName(types[t].env);
                }}
              >
                <span style={{ fontSize: 18 }}>{TYPE_ICON[t]}</span>
                <span>
                  <div>{types[t].label}</div>
                  <div className="small muted" style={{ fontWeight: 400 }}>
                    {TYPE_HINT[t]}
                  </div>
                </span>
              </button>
            ))}
          </div>
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button onClick={onClose}>Cancelar</button>
          </div>
        </>
      ) : (
        <>
          <h3>
            {TYPE_ICON[type]} {types[type].label}
          </h3>
          <label>
            Nombre
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Variable de entorno
            <input value={envName} onChange={(e) => setEnvName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"))} placeholder="MI_CLAVE" />
            <span className="small">Tu código la lee como ctx.env.{envName || "NOMBRE"}.</span>
          </label>
          <label>
            Descripción (opcional)
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Para qué sirve" />
          </label>
          <label>
            {type === "postgres" ? "Cadena de conexión" : "Valor"}
            <input type="password" autoComplete="off" value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === "postgres" ? "postgres://usuario:clave@host/db" : "Pega la clave"} />
            <span className="small">Se guarda cifrada. Nunca se vuelve a mostrar, ni a ti ni al constructor.</span>
          </label>
          {error && <div className="error-box">{error}</div>}
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button onClick={() => setType(null)}>Atrás</button>
            <button
              className="primary"
              disabled={!value || !envName}
              onClick={async () => {
                try {
                  const r = await api<{ id: string }>("/integrations", { body: { type, name, envName, description, value } });
                  onClose();
                  onDone(r.id);
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Guardar
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

function ValueDialog({ integration, onClose }: { integration: Integration; onClose: () => void }) {
  const [value, setValue] = useState("");
  return (
    <Modal onClose={onClose}>
      <h3>Cambiar valor de «{integration.name}»</h3>
      <div className="small muted">Afecta a todos los proyectos conectados. Las apps publicadas lo usan desde su siguiente petición.</div>
      <input type="password" autoFocus autoComplete="off" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Nuevo valor" />
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <button onClick={onClose}>Cancelar</button>
        <button
          className="primary"
          disabled={!value}
          onClick={async () => {
            await api(`/integrations/${integration.id}`, { method: "PUT", body: { value } });
            onClose();
          }}
        >
          Guardar
        </button>
      </div>
    </Modal>
  );
}
