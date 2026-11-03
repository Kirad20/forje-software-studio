import { useEffect, useState } from "react";
import { api } from "../api";
import { Switch } from "./ui";

interface OrgSkill {
  name: string;
  description: string;
  body: string;
  enabled: boolean;
}

interface View {
  skills: OrgSkill[];
  role: "owner" | "admin" | "member";
}

const EMPTY: OrgSkill = { name: "", description: "", body: "", enabled: true };

/** Settings section: skills the whole organization shares; every project's builder can load them. */
export function OrgSkillsSection({ orgId }: { orgId: string }) {
  const [data, setData] = useState<View | null>(null);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<(OrgSkill & { isNew: boolean }) | null>(null);
  const call = async (path: string, opts: { method?: string; body?: unknown } = {}) => {
    setError("");
    try {
      const r = await api<{ skills: OrgSkill[]; role?: View["role"] }>(`/orgs/${orgId}/skills${path}`, opts);
      setData((d) => ({ skills: r.skills, role: r.role ?? d?.role ?? "member" }));
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    }
  };
  useEffect(() => void call(""), [orgId]);

  if (!data) return null;
  const canEdit = data.role === "owner" || data.role === "admin";
  const save = async (s: OrgSkill) => call(`/${encodeURIComponent(s.name)}`, { method: "PUT", body: { description: s.description, body: s.body, enabled: s.enabled } });
  return (
    <section className="card section">
      <h3>❖ Skills de la organización</h3>
      <div className="small muted">
        Guías que el constructor carga bajo demanda en todos los proyectos de la organización: cómo factura tu equipo, qué patrones de tabla usa, qué proveedores prefiere. Una skill del proyecto con el mismo nombre tiene prioridad.
        {!canEdit && " Solo los dueños y administradores pueden editarlas."}
      </div>
      {error && <div className="error-box">{error}</div>}
      {!data.skills.length && <div className="small muted">Todavía no hay skills de la organización.</div>}
      {data.skills.map((s) => (
        <div key={s.name} className="row" style={{ gap: 8, alignItems: "flex-start", opacity: s.enabled ? 1 : 0.6 }}>
          <div className="grow" style={{ minWidth: 0 }}>
            <strong>{s.name}</strong>
            <div className="small muted" style={{ overflowWrap: "anywhere" }}>{s.description}</div>
          </div>
          {canEdit && (
            <>
              <Switch on={s.enabled} label={`Activar ${s.name}`} onChange={(on) => void save({ ...s, enabled: on })} />
              <button className="sm ghost" onClick={() => setDraft({ ...s, isNew: false })} aria-label={`Editar ${s.name}`}>
                Editar
              </button>
              <button className="sm ghost danger" onClick={() => void call(`/${encodeURIComponent(s.name)}`, { method: "DELETE" })} aria-label={`Borrar ${s.name}`}>
                Borrar
              </button>
            </>
          )}
        </div>
      ))}
      {canEdit &&
        (draft ? (
          <div className="stack" style={{ gap: 8 }}>
            <input value={draft.name} disabled={!draft.isNew} placeholder="nombre-en-minusculas" maxLength={40} onChange={(e) => setDraft({ ...draft, name: e.target.value })} aria-label="Nombre" />
            <input value={draft.description} placeholder="Una línea: cuándo debe cargarla el constructor" maxLength={160} onChange={(e) => setDraft({ ...draft, description: e.target.value })} aria-label="Descripción" />
            <textarea rows={8} value={draft.body} placeholder="Los pasos, reglas y ejemplos que el constructor debe seguir" maxLength={8000} onChange={(e) => setDraft({ ...draft, body: e.target.value })} aria-label="Contenido" />
            <div className="row" style={{ gap: 8 }}>
              <button className="sm primary" disabled={!draft.name.trim() || !draft.description.trim() || !draft.body.trim()} onClick={async () => (await save({ ...draft, name: draft.name.trim().toLowerCase() })) && setDraft(null)}>
                Guardar skill
              </button>
              <button className="sm ghost" onClick={() => setDraft(null)}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div>
            <button className="sm" onClick={() => setDraft({ ...EMPTY, isNew: true })}>
              + Añadir skill
            </button>
          </div>
        ))}
    </section>
  );
}
