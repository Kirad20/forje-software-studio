import { useEffect, useState, type ReactNode } from "react";
import { api } from "../application/controller.js";
import { bytes, timeAgo } from "../../../shared/presentation/format.js";
import type { Project } from "../../../shared/contracts/index.js";
import { Refresh } from "../../../shared/Icons.js";
import { Modal, Select } from "../../../shared/ui.js";
import { servicePath, type ServiceEnvironment } from "../../../shared/application/service-environment.js";

export function useLoad<T>(path: string, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const reload = () =>
    api<T>(path)
      .then((d) => {
        setData(d);
        setError("");
      })
      .catch((e) => setError(e.message));
  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps]);
  return { data, error, reload };
}

export const Loading = ({ error }: { error?: string }) =>
  error ? (
    <div className="error-box" style={{ margin: 16 }}>
      {error}
    </div>
  ) : (
    <div className="empty">
      <span className="spinner" />
    </div>
  );

export const Header = ({ title, hint, children }: { title: string; hint?: ReactNode; children?: ReactNode }) => (
  <div className="row" style={{ marginBottom: 14, alignItems: "flex-start" }}>
    <div className="grow">
      <h3 style={{ fontSize: 16 }}>{title}</h3>
      {hint && <div className="small muted">{hint}</div>}
    </div>
    {children}
  </div>
);

// --- Code ---------------------------------------------------------------------------

export function CodePanel({ projectId, reloadKey, initialPath = null }: { projectId: string; reloadKey: number; initialPath?: string | null }) {
  const files = useLoad<{ files: { path: string; size: number }[] }>(`/projects/${projectId}/files`, [reloadKey]);
  const [path, setPath] = useState<string | null>(initialPath);
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState("");
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (!path) return;
    api<{ content: string }>(`/projects/${projectId}/file?path=${encodeURIComponent(path)}`).then((r) => {
      setContent(r.content);
      setSaved(r.content);
    });
  }, [path, projectId, reloadKey]);
  if (!files.data) return <Loading error={files.error} />;
  const visibleFiles = files.data.files.filter((f) => f.path.toLowerCase().includes(query.trim().toLowerCase()));
  const fileName = path?.split("/").pop() ?? "";
  const lineCount = content ? content.split("\n").length : 0;
  return (
    <div className="tool-file-panel">
      <aside className="tool-file-sidebar">
        <div className="tool-file-sidebar-head">
          <span className="tool-eyebrow">PROYECTO</span>
          <div className="tool-file-sidebar-title">
            <strong>Archivos</strong>
            <span className="tool-count">{visibleFiles.length}</span>
          </div>
          <input
            className="tool-file-search"
            aria-label="Buscar archivos"
            placeholder="Buscar archivo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="tool-file-list">
          {visibleFiles.map((f) => {
            const name = f.path.split("/").pop() ?? f.path;
            const folder = f.path.slice(0, Math.max(0, f.path.length - name.length)).replace(/\/$/, "");
            const extension = name.includes(".") ? name.slice(name.lastIndexOf(".") + 1).toUpperCase() : "FILE";
            return (
              <button
                key={f.path}
                className={`tool-file-button${f.path === path ? " active" : ""}`}
                onClick={() => setPath(f.path)}
                title={f.path}
                aria-current={f.path === path ? "page" : undefined}
              >
                <span className="tool-file-extension">{extension}</span>
                <span className="tool-file-label">
                  <strong>{name}</strong>
                  <small>{folder || "raíz"}</small>
                </span>
              </button>
            );
          })}
          {visibleFiles.length === 0 && <div className="tool-file-list-empty">No se encontraron archivos.</div>}
        </div>
      </aside>
      <section className="tool-file-workspace">
        {path ? (
          <>
            <header className="tool-file-toolbar">
              <div className="tool-file-heading">
                <span className="tool-eyebrow">CÓDIGO DEL PROYECTO</span>
                <strong>{fileName}</strong>
                <code>{path}</code>
              </div>
              <div className="tool-file-actions">
                <span className={`tool-save-state${content !== saved ? " dirty" : ""}`} role="status">
                  {content !== saved ? "Cambios sin guardar" : "Guardado"}
                </span>
                <button
                  className="primary sm"
                  disabled={content === saved}
                  onClick={async () => {
                    await api(`/projects/${projectId}/file`, { method: "PUT", body: { path, content } });
                    setSaved(content);
                  }}
                >
                  Guardar cambios
                </button>
              </div>
            </header>
            <div className="tool-editor-meta">
              <span>EDITOR</span>
              <span>{lineCount} líneas</span>
            </div>
            <textarea
              className="code code-editor tool-code-editor"
              aria-label={`Editar ${path}`}
              spellCheck={false}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </>
        ) : (
          <div className="tool-file-empty">
            <span className="tool-empty-mark">&lt;/&gt;</span>
            <strong>Selecciona un archivo</strong>
            <p>Busca en los archivos del proyecto y selecciona uno para verlo o editarlo.</p>
          </div>
        )}
      </section>
    </div>
  );
}

// --- Users -----------------------------------------------------------------------------

export function UsersPanel({ projectId, env = "preview", canManage }: { projectId: string; env?: ServiceEnvironment; canManage: boolean }) {
  const { data, error, reload } = useLoad<{ users: { id: string; email: string; name: string | null; role: string; hasPassword: boolean; createdAt: string }[] }>(
    servicePath(projectId, "users", env),
  );
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<{ id: string; email: string } | "create" | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");
  const closeEditor = () => {
    if (busy) return;
    setEditing(null);
    setPassword("");
    setSaveError("");
  };
  const openEditor = (user?: { id: string; email: string }) => {
    setEditing(user ?? "create");
    setEmail(user?.email ?? "");
    setName("");
    setPassword("");
    setSaveError("");
    setNotice("");
  };
  if (!data) return <Loading error={error} />;
  const visible = data.users.filter((u) => `${u.email} ${u.name ?? ""} ${u.role}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return (
    <div className="stack">
      <Header
        title="Usuarios de la app"
        hint="Cuentas separadas de tu cuenta de Forja y del otro entorno. La cuenta propietaria se crea como administradora sin contraseña: fíjala aquí o usa la recuperación de la app."
      >
        <div className="row" style={{ flexWrap: "wrap" }}>
          {canManage && <button className="primary sm" onClick={() => openEditor()}>Crear usuario</button>}
          <button className="sm" onClick={reload}><Refresh /> Actualizar</button>
        </div>
      </Header>
      {error && <div className="error-box" role="alert">{error}</div>}
      {notice && <p className="small" role="status">{notice}</p>}
      {!canManage && <p className="small muted">Solo la persona dueña del proyecto puede crear usuarios o cambiar contraseñas.</p>}
      <div className="tools-summary">
        <div><strong>{data.users.length}</strong><span>Usuarios registrados</span></div>
        <div><strong>{data.users.filter((u) => u.role === "admin").length}</strong><span>Administradores</span></div>
        <div><strong>{data.users.filter((u) => !u.hasPassword).length}</strong><span>Sin contraseña fijada</span></div>
      </div>
      {data.users.length > 0 && (
        <div className="panel-filters">
          <input type="search" aria-label="Buscar usuarios" placeholder="Buscar por nombre, correo o rol…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <span className="small muted">{visible.length} de {data.users.length}</span>
        </div>
      )}
      {data.users.length === 0 ? (
        <div className="card empty">No hay usuarios en este entorno.</div>
      ) : visible.length === 0 ? (
        <div className="tools-empty"><strong>No hay usuarios que coincidan</strong><p>Prueba con otro nombre, correo o rol.</p><button className="sm" onClick={() => setQuery("")}>Limpiar búsqueda</button></div>
      ) : (
        <div className="panel-table">
        <table className="grid card">
          <thead>
            <tr>
              <th>Correo</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Contraseña</th>
              <th>Alta</th>
              {canManage && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {visible.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.name ?? "—"}</td>
                <td>{u.role === "admin" ? <span className="pill accent">admin</span> : u.role}</td>
                <td>{u.hasPassword ? "sí" : <span className="pill warn">sin fijar</span>}</td>
                <td>{timeAgo(u.createdAt)}</td>
                {canManage && <td><button className="sm" aria-label={`Cambiar contraseña de ${u.email}`} onClick={() => openEditor(u)}>{u.hasPassword ? "Cambiar contraseña" : "Fijar contraseña"}</button></td>}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
      {editing && (
        <Modal onClose={closeEditor}>
          <form
            className="stack"
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-user-title"
            onSubmit={async (event) => {
              event.preventDefault();
              if (busy) return;
              setBusy(true);
              setSaveError("");
              try {
                if (editing === "create") {
                  await api(servicePath(projectId, "users", env), { method: "POST", body: { email, password, name: name.trim() || undefined } });
                } else {
                  await api(servicePath(projectId, `users/${encodeURIComponent(editing.id)}/password`, env), { method: "PATCH", body: { password } });
                }
                setNotice(editing === "create" ? `Usuario creado en ${env === "published" ? "producción" : "vista previa"}.` : "Contraseña actualizada. Se cerraron las sesiones anteriores de este usuario.");
                setPassword("");
                setEditing(null);
                setQuery("");
                await reload();
              } catch (e) {
                setSaveError(e instanceof Error ? e.message : "No se pudieron guardar las credenciales.");
              } finally {
                setBusy(false);
              }
            }}
          >
            <h3 id="app-user-title">{editing === "create" ? "Crear usuario" : "Cambiar contraseña"}</h3>
            <p className={env === "published" ? "small pill warn" : "small muted"}>
              {env === "published" ? "Modificarás una cuenta real de producción." : "Solo se modificará vista previa."} {editing !== "create" && "Se cerrarán sus sesiones y se invalidarán sus códigos de recuperación."}
            </p>
            <label className="stack">Correo electrónico
              <input type="email" autoComplete="off" autoFocus={editing === "create"} required value={email} readOnly={editing !== "create"} disabled={busy} onChange={(e) => setEmail(e.target.value)} />
            </label>
            {editing === "create" && <label className="stack">Nombre (opcional)
              <input autoComplete="off" value={name} disabled={busy} onChange={(e) => setName(e.target.value)} />
            </label>}
            <label className="stack">Nueva contraseña
              <input type="password" autoComplete="new-password" autoFocus={editing !== "create"} required minLength={8} value={password} disabled={busy} onChange={(e) => setPassword(e.target.value)} />
              <span className="small muted">Al menos 8 caracteres. No se puede consultar después de guardarla.</span>
            </label>
            {saveError && <div className="error-box" role="alert">{saveError}</div>}
            <div className="row" style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button type="button" disabled={busy} onClick={closeEditor}>Cancelar</button>
              <button className="primary" type="submit" disabled={busy || password.length < 8}>{busy ? "Guardando…" : editing === "create" ? "Crear usuario" : "Guardar contraseña"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// --- Email -------------------------------------------------------------------------------

export function EmailPanel({ project, onChange, env = "preview" }: { project: Project; onChange: () => void; env?: ServiceEnvironment }) {
  const { data, reload, error } = useLoad<{
    emails: { id: number; direction: string; env: ServiceEnvironment | null; to: string; intendedTo: string | null; from: string; subject: string; html: string; status: string; createdAt: string }[];
  }>(servicePath(project.id, "emails", env));
  const [domain, setDomain] = useState(project.emailDomain ?? "");
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="stack">
      <Header title="Correo" hint={`Correos de ${env === "published" ? "producción" : "vista previa"}, incluidos los simulados y los códigos de recuperación. El dominio de envío es compartido.`} />
      {error && data && <div className="error-box" role="alert">{error}</div>}
      <div className="card stack" style={{ padding: 14 }}>
        <div className="section-title">Dominio de envío</div>
        {!project.emailDomainVerified && (
          <div className="pill warn" style={{ borderRadius: 8, padding: 10, display: "block" }}>
            Sin dominio verificado, los correos dirigidos a otras personas te llegan a ti, con el destinatario real en el asunto. Así nada llega a clientes por
            accidente mientras pruebas.
          </div>
        )}
        <div className="row">
          <input placeholder="mail.tudominio.com" value={domain} onChange={(e) => setDomain(e.target.value)} />
          <button
            onClick={async () => {
              await api(`/projects/${project.id}`, { method: "PATCH", body: { emailDomain: domain || null, emailDomainVerified: false } });
              onChange();
            }}
          >
            Guardar
          </button>
          <button
            className="primary"
            disabled={!project.emailDomain}
            onClick={async () => {
              await api(`/projects/${project.id}`, { method: "PATCH", body: { emailDomainVerified: !project.emailDomainVerified } });
              onChange();
            }}
          >
            {project.emailDomainVerified ? "Marcar sin verificar" : "Marcar verificado"}
          </button>
        </div>
        <p className="small muted">Sin SMTP, los mensajes quedan registrados aquí. La recuperación solo genera correo si la cuenta existe en este entorno; revisa Usuarios. Las solicitudes omitidas se explican en Registros. Los registros históricos sin entorno se muestran en ambos entornos.</p>
        <div className="small muted">
          Añade en tu DNS los registros DKIM, SPF y DMARC de tu proveedor SMTP y márcalo como verificado. Entonces los correos enviados desde una dirección
          @{project.emailDomain || "tudominio"} llegan a su destinatario real.
        </div>
      </div>
      <div className="row">
        <div className="section-title grow">Registro</div>
        <button className="sm" onClick={reload}>
          <Refresh />
        </button>
      </div>
      {!data ? (
        <Loading error={error} />
      ) : data.emails.length === 0 ? (
        <div className="card empty">Tu app aún no ha enviado correos.</div>
      ) : (
        <div className="card">
          {data.emails.map((e) => (
            <div key={e.id} style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", cursor: "pointer" }} onClick={() => setOpen(open === e.id ? null : e.id)}>
              <div className="row">
                <span className="pill">{e.env === "published" ? "producción" : e.env === "preview" ? "vista previa" : "histórico · sin entorno"}</span>
                <span className={`pill ${e.direction === "in" ? "accent" : e.status === "failed" ? "err" : e.status === "sent" ? "ok" : ""}`}>
                  {e.direction === "in" ? "recibido" : e.status === "logged" ? "registrado" : e.status === "sent" ? "enviado" : e.status}
                </span>
                <strong className="grow" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {e.subject}
                </strong>
                <span className="small muted">{timeAgo(e.createdAt)}</span>
              </div>
              <div className="small muted">
                para {e.to}
                {e.intendedTo && ` (destinatario real: ${e.intendedTo})`} · de {e.from}
              </div>
              {open === e.id && <iframe title="correo" sandbox="" srcDoc={e.html} style={{ width: "100%", height: 220, border: "1px solid var(--border)", borderRadius: 8, marginTop: 8, background: "#fff" }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Jobs -------------------------------------------------------------------------------

export function JobsPanel({ projectId, reloadKey, env = "preview" }: { projectId: string; reloadKey: number; env?: ServiceEnvironment }) {
  const { data, reload, error } = useLoad<{
    jobs: { name: string; schedule: string | null; timezone: string | null; enabled: boolean; nextRun: string | null }[];
    runs: { id: number; job: string; env: ServiceEnvironment | null; trigger: string; status: string; error: string | null; startedAt: string }[];
    timers: { id: string; job: string; env: string; runAt: string }[];
  }>(servicePath(projectId, "jobs", env), [reloadKey]);
  const [busy, setBusy] = useState("");
  if (!data) return <Loading error={error} />;
  return (
    <div className="stack">
      <Header
        title="Tareas programadas"
        hint={`Las tareas con horario solo corren en producción. «Ejecutar ahora» usa el código y los datos de ${env === "published" ? "la última publicación" : "vista previa"}. La programación es compartida y los cambios se aplican a producción.`}
      />
      {data.jobs.length === 0 ? (
        <div className="card empty">Sin tareas. Pide algo como «cada mañana a las 8 envíame un resumen de pedidos».</div>
      ) : (
        <table className="grid card">
          <thead>
            <tr>
              <th>Tarea</th>
              <th>Horario</th>
              <th>Próxima</th>
              <th>Activa</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.jobs.map((j) => (
              <tr key={j.name}>
                <td>
                  <code>jobs/{j.name}.ts</code>
                </td>
                <td>{j.schedule ? `${j.schedule} (${j.timezone ?? "UTC"})` : <span className="muted">en segundo plano</span>}</td>
                <td>{j.nextRun ? new Date(j.nextRun).toLocaleString() : "—"}</td>
                <td>
                  <input
                    type="checkbox"
                    style={{ width: "auto" }}
                    checked={j.enabled}
                    onChange={(e) => api(`/projects/${projectId}/jobs/${j.name}/enabled`, { body: { enabled: e.target.checked } }).then(reload)}
                  />
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    className="sm"
                    disabled={!!busy}
                    onClick={async () => {
                      if (env === "published" && !confirm(`¿Ejecutar ${j.name} en producción con datos reales?`)) return;
                      setBusy(j.name);
                      await api(servicePath(projectId, `jobs/${j.name}/run`, env), { body: {} }).catch((e) => alert(e.message));
                      setBusy("");
                      void reload();
                    }}
                  >
                    {busy === j.name ? <span className="spinner" /> : "Ejecutar ahora"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {data.timers.length > 0 && (
        <>
          <div className="section-title">Temporizadores pendientes</div>
          <table className="grid card">
            <tbody>
              {data.timers.map((t) => (
                <tr key={t.id}>
                  <td>{t.job}</td>
                  <td>{new Date(t.runAt).toLocaleString()}</td>
                  <td>{t.env === "published" ? "publicada" : "vista previa"}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="sm danger" onClick={() => api(`/projects/${projectId}/timers/${t.id}`, { method: "DELETE" }).then(reload)}>
                      Cancelar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      <div className="section-title">Ejecuciones recientes</div>
      {data.runs.length === 0 ? (
        <div className="small muted">Ninguna todavía.</div>
      ) : (
        <table className="grid card">
          <tbody>
            {data.runs.map((r) => (
              <tr key={r.id}>
                <td>{r.job}</td>
                <td>{r.env === "published" ? "producción" : r.env === "preview" ? "vista previa" : "histórico · sin entorno"}</td>
                <td>{r.trigger}</td>
                <td>
                  <span className={`pill ${r.status === "ok" ? "ok" : r.status === "error" ? "err" : "warn"}`}>{r.status}</span>
                </td>
                <td title={r.error ?? ""}>{r.error ?? ""}</td>
                <td>{timeAgo(r.startedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// --- Secrets ------------------------------------------------------------------------------

export function SecretsPanel({ projectId, reloadKey }: { projectId: string; reloadKey: number }) {
  const { data, reload, error: loadError } = useLoad<{ secrets: { name: string; description: string; isSet: boolean }[] }>(`/projects/${projectId}/secrets`, [reloadKey]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const save = async (name: string, value: string) => {
    setError("");
    try {
      await api(`/projects/${projectId}/secrets`, { method: "PUT", body: { name, value } });
      setValues((v) => ({ ...v, [name]: "" }));
      void reload();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  if (!data) return <Loading error={loadError} />;
  return (
    <div className="stack">
      <Header
        title="Secretos"
        hint="Claves de API y otros valores privados. Tu código los lee como ctx.env.NOMBRE en el servidor. El constructor solo conoce los nombres, nunca los valores."
      />
      {error && <div className="error-box">{error}</div>}
      {data.secrets.map((s) => (
        <div key={s.name} className="card" style={{ padding: 12 }}>
          <div className="row">
            <code className="grow">{s.name}</code>
            {s.isSet ? <span className="pill ok">configurado</span> : <span className="pill warn">pendiente</span>}
            <button className="sm danger ghost" onClick={() => api(`/projects/${projectId}/secrets/${s.name}`, { method: "DELETE" }).then(reload)}>
              Quitar
            </button>
          </div>
          {s.description && <div className="small muted" style={{ margin: "4px 0 8px" }}>{s.description}</div>}
          <div className="row">
            <input
              type="password"
              autoComplete="off"
              placeholder={s.isSet ? "Escribe un valor nuevo para reemplazarlo" : "Pega el valor"}
              value={values[s.name] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [s.name]: e.target.value }))}
            />
            <button className="primary sm" disabled={!values[s.name]} onClick={() => save(s.name, values[s.name]!)}>
              Guardar
            </button>
          </div>
        </div>
      ))}
      <div className="row">
        <input placeholder="NUEVO_SECRETO" value={newName} onChange={(e) => setNewName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"))} />
        <input type="password" autoComplete="off" placeholder="Valor" value={values.__new ?? ""} onChange={(e) => setValues((v) => ({ ...v, __new: e.target.value }))} />
        <button
          disabled={!newName || !values.__new}
          onClick={async () => {
            await save(newName, values.__new!);
            setNewName("");
            setValues((v) => ({ ...v, __new: "" }));
          }}
        >
          Añadir
        </button>
      </div>
    </div>
  );
}

// --- AI ----------------------------------------------------------------------------------

export function AiPanel({ project, onChange }: { project: Project; onChange: () => void }) {
  const { data, error } = useLoad<{ usage: { source: string; model: string; inputTokens: number; outputTokens: number; credits: number; calls: number }[] }>(
    `/projects/${project.id}/ai`,
  );
  return (
    <div className="stack">
      <Header title="IA" hint="Uso de modelos en este proyecto: el constructor y la IA que llama tu app para sus usuarios. Todo se cobra de tus créditos.">
        <label className="row" style={{ color: "var(--text)" }}>
          <input
            type="checkbox"
            style={{ width: "auto" }}
            checked={project.aiEnabled}
            onChange={async (e) => {
              await api(`/projects/${project.id}`, { method: "PATCH", body: { aiEnabled: e.target.checked } });
              onChange();
            }}
          />
          IA de la app activa
        </label>
      </Header>
      {!data ? (
        <Loading error={error} />
      ) : data.usage.length === 0 ? (
        <div className="card empty">Sin uso todavía.</div>
      ) : (
        <table className="grid card">
          <thead>
            <tr>
              <th>Origen</th>
              <th>Modelo</th>
              <th>Llamadas</th>
              <th>Tokens</th>
              <th>Créditos</th>
            </tr>
          </thead>
          <tbody>
            {data.usage.map((u) => (
              <tr key={u.source + u.model}>
                <td>{u.source === "builder" ? "Constructor" : "App"}</td>
                <td>
                  <code>{u.model}</code>
                </td>
                <td>{u.calls}</td>
                <td>{(u.inputTokens + u.outputTokens).toLocaleString()}</td>
                <td>{u.credits.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// --- Logs ------------------------------------------------------------------------------------

export function LogsPanel({ projectId, lines, env: selectedEnv }: { projectId: string; lines: { at: string; env: string; level: string; source: string; message: string }[]; env?: ServiceEnvironment }) {
  const { data, error, reload } = useLoad<{ logs: typeof lines }>(selectedEnv ? servicePath(projectId, "logs", selectedEnv) : `/projects/${projectId}/logs`);
  const [errorsOnly, setErrorsOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [env, setEnv] = useState(selectedEnv ?? "all");
  const entries = [...(data?.logs ?? []), ...lines];
  const all = entries.filter((l) => (!errorsOnly || l.level === "error") && (env === "all" || l.env === env) && `${l.source} ${l.message}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const filtered = errorsOnly || !!query || env !== "all";
  return (
    <div className="stack">
      <Header title="Registros" hint="Peticiones, errores del servidor y de la consola del navegador, correos y tareas. En memoria; se pierden al reiniciar.">
        <button className="sm" onClick={reload}><Refresh /> Actualizar</button>
      </Header>
      {error && <div className="error-box" role="alert">{error}</div>}
      <div className="panel-filters">
        <input type="search" aria-label="Buscar registros" placeholder="Buscar mensaje o fuente…" value={query} onChange={(e) => setQuery(e.target.value)} />
        {!selectedEnv && <Select label="Entorno de los registros" value={env} onValueChange={setEnv}
          options={[{ value: "all", label: "Todos los entornos" }, { value: "preview", label: "Vista previa" }, { value: "published", label: "Publicada" }]} />}
        <label className="row" style={{ color: "var(--text)" }}>
          <input type="checkbox" style={{ width: "auto" }} checked={errorsOnly} onChange={(e) => setErrorsOnly(e.target.checked)} />
          Solo errores
        </label>
      </div>
      <div className="small muted">{Math.min(all.length, 400)} registros visibles · Más recientes primero</div>
      <div className="card" style={{ padding: "6px 12px" }}>
        {!data && !error && <div className="chat-history-state" role="status"><span className="spinner" /> Cargando registros…</div>}
        {data && all.length === 0 && <div className="tools-empty">
         <strong>{filtered ? "No hay registros con estos filtros" : "Todavía no hay actividad"}</strong>
         <p>{filtered ? "Prueba con otra búsqueda o muestra todos los entornos." : "Aquí aparecerán las peticiones, tareas y mensajes de tu app."}</p>
         {filtered && <button className="sm" onClick={() => { setQuery(""); setEnv(selectedEnv ?? "all"); setErrorsOnly(false); }}>Limpiar filtros</button>}
        </div>}
        {all
          .slice(-400)
          .reverse()
          .map((l, i) => (
            <div key={i} className={`log-line ${l.level}`}>
              <span className="muted">{new Date(l.at).toLocaleTimeString()}</span> [{l.env === "published" ? "pub" : "prev"}/{l.source}] {l.message}
            </div>
          ))}
      </div>
    </div>
  );
}
