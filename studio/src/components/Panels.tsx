import { useEffect, useState, type ReactNode } from "react";
import { api, bytes, timeAgo, type Project } from "../api";
import { External, Refresh } from "./Icons";

function useLoad<T>(path: string, deps: unknown[] = []) {
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

const Loading = ({ error }: { error?: string }) =>
  error ? (
    <div className="error-box" style={{ margin: 16 }}>
      {error}
    </div>
  ) : (
    <div className="empty">
      <span className="spinner" />
    </div>
  );

const Header = ({ title, hint, children }: { title: string; hint?: ReactNode; children?: ReactNode }) => (
  <div className="row" style={{ marginBottom: 14, alignItems: "flex-start" }}>
    <div className="grow">
      <h3 style={{ fontSize: 16 }}>{title}</h3>
      {hint && <div className="small muted">{hint}</div>}
    </div>
    {children}
  </div>
);

// --- Preview -------------------------------------------------------------------

const DEVICES = {
  desktop: null,
  iphone: { w: 393, h: 852 },
  pixel: { w: 412, h: 915 },
  ipad: { w: 820, h: 1180 },
} as const;

export function PreviewPanel({ project, reloadKey }: { project: Project; reloadKey: number }) {
  const [device, setDevice] = useState<keyof typeof DEVICES>("desktop");
  const [nonce, setNonce] = useState(0);
  const [path, setPath] = useState("/");
  const d = DEVICES[device];
  const src = `${project.previewOrigin}${path}?share=${new URL(project.previewUrl).searchParams.get("share")}`;
  return (
    <div style={{ display: "grid", gridTemplateRows: "40px 1fr", height: "100%" }}>
      <div className="row" style={{ padding: "0 10px", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
        <button className="ghost sm" title="Recargar" onClick={() => setNonce((n) => n + 1)}>
          <Refresh />
        </button>
        <input
          style={{ height: 28, maxWidth: 320, fontFamily: "var(--mono)", fontSize: 12 }}
          value={path}
          onChange={(e) => setPath(e.target.value.startsWith("/") ? e.target.value : `/${e.target.value}`)}
          onKeyDown={(e) => e.key === "Enter" && setNonce((n) => n + 1)}
        />
        <div className="grow" />
        <select style={{ width: 130, height: 28, padding: "0 6px" }} value={device} onChange={(e) => setDevice(e.target.value as keyof typeof DEVICES)}>
          <option value="desktop">Escritorio</option>
          <option value="iphone">iPhone</option>
          <option value="pixel">Pixel</option>
          <option value="ipad">iPad</option>
        </select>
        <a className="btn sm" style={{ height: 28 }} href={project.previewUrl} target="_blank" rel="noreferrer" title="Abrir en otra pestaña">
          <External />
        </a>
      </div>
      <div className="preview-wrap">
        <iframe
          key={`${reloadKey}-${nonce}`}
          title="Vista previa"
          src={src}
          className={`preview-frame ${d ? "device" : ""}`}
          style={d ? { width: d.w + 20, height: d.h + 20, maxHeight: "100%" } : undefined}
        />
      </div>
    </div>
  );
}

// --- Code ---------------------------------------------------------------------------

export function CodePanel({ projectId, reloadKey }: { projectId: string; reloadKey: number }) {
  const files = useLoad<{ files: { path: string; size: number }[] }>(`/projects/${projectId}/files`, [reloadKey]);
  const [path, setPath] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState("");
  useEffect(() => {
    if (!path) return;
    api<{ content: string }>(`/projects/${projectId}/file?path=${encodeURIComponent(path)}`).then((r) => {
      setContent(r.content);
      setSaved(r.content);
    });
  }, [path, projectId, reloadKey]);
  if (!files.data) return <Loading error={files.error} />;
  return (
    <div className="two-col">
      <div className="list">
        {files.data.files.map((f) => (
          <button key={f.path} className={f.path === path ? "active" : ""} onClick={() => setPath(f.path)} title={f.path}>
            {f.path}
          </button>
        ))}
      </div>
      {path ? (
        <div style={{ display: "grid", gridTemplateRows: "40px 1fr", minHeight: 0 }}>
          <div className="row" style={{ padding: "0 12px", borderBottom: "1px solid var(--border)" }}>
            <code className="grow">{path}</code>
            {content !== saved && <span className="pill warn">Sin guardar</span>}
            <button
              className="primary sm"
              disabled={content === saved}
              onClick={async () => {
                await api(`/projects/${projectId}/file`, { method: "PUT", body: { path, content } });
                setSaved(content);
              }}
            >
              Guardar
            </button>
          </div>
          <textarea className="code code-editor" spellCheck={false} value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
      ) : (
        <div className="empty">Elige un archivo. Para cambios grandes, pídeselo al constructor.</div>
      )}
    </div>
  );
}

// --- Data ---------------------------------------------------------------------------

type Col = { name: string; type: string };

export function DataPanel({ projectId, reloadKey }: { projectId: string; reloadKey: number }) {
  const schema = useLoad<{ tables: Record<string, Col[]>; awake: boolean }>(`/projects/${projectId}/db/schema?internal=1`, [reloadKey]);
  const [table, setTable] = useState<string | null>(null);
  const [rows, setRows] = useState<{ rows: Record<string, unknown>[]; total: number; columns: Col[] } | null>(null);
  const [sql, setSql] = useState("");
  const [sqlOut, setSqlOut] = useState<{ error?: string; results?: { fields: string[]; rows: Record<string, unknown>[]; affectedRows: number }[] } | null>(null);

  useEffect(() => {
    if (!table) return setRows(null);
    api(`/projects/${projectId}/db/rows?table=${encodeURIComponent(table)}&limit=100`).then(setRows);
  }, [table, projectId, reloadKey]);

  if (!schema.data) return <Loading error={schema.error} />;
  const names = Object.keys(schema.data.tables);
  const appTables = names.filter((n) => !n.startsWith("_forja_"));
  const internal = names.filter((n) => n.startsWith("_forja_"));
  return (
    <div className="two-col">
      <div className="list">
        <div className="section-title" style={{ padding: "4px 8px" }}>
          Tablas
        </div>
        {appTables.length === 0 && <div className="small muted" style={{ padding: 8 }}>Sin tablas todavía</div>}
        {appTables.map((t) => (
          <button key={t} className={t === table ? "active" : ""} onClick={() => setTable(t)}>
            {t}
          </button>
        ))}
        <div className="section-title" style={{ padding: "12px 8px 4px" }}>
          Sistema
        </div>
        {internal.map((t) => (
          <button key={t} className={t === table ? "active" : ""} onClick={() => setTable(t)}>
            {t}
          </button>
        ))}
        <button className={table === null ? "active" : ""} onClick={() => setTable(null)} style={{ marginTop: 12 }}>
          ▸ Consola SQL
        </button>
      </div>
      <div style={{ overflow: "auto", minHeight: 0 }}>
        <div className="row" style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
          <span className="grow small muted">
            Postgres 18 · {schema.data.awake ? <span className="pill ok">despierta</span> : <span className="pill">dormida</span>} · la vista previa y la app publicada comparten
            estos datos
          </span>
          <a className="btn sm" href={`/api/projects/${projectId}/db/export`}>
            Exportar
          </a>
        </div>
        {table ? (
          !rows ? (
            <Loading />
          ) : (
            <>
              <div className="small muted" style={{ padding: "8px 14px" }}>
                {rows.total} filas{rows.total > rows.rows.length ? ` · mostrando ${rows.rows.length}` : ""}
              </div>
              <table className="grid">
                <thead>
                  <tr>
                    {rows.columns.map((c) => (
                      <th key={c.name}>
                        {c.name} <span style={{ fontWeight: 400 }}>{c.type}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.rows.map((r, i) => (
                    <tr key={i}>
                      {rows.columns.map((c) => (
                        <td key={c.name} title={fmt(r[c.name])}>
                          {fmt(r[c.name])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )
        ) : (
          <div className="stack" style={{ padding: 14 }}>
            <textarea className="code" rows={6} placeholder="select * from …" value={sql} onChange={(e) => setSql(e.target.value)} />
            <div className="row">
              <button
                className="primary sm"
                disabled={!sql.trim()}
                onClick={async () => {
                  try {
                    setSqlOut(await api(`/projects/${projectId}/db/sql`, { body: { sql } }));
                    void schema.reload();
                  } catch (e) {
                    setSqlOut({ error: (e as Error).message });
                  }
                }}
              >
                Ejecutar
              </button>
              <span className="small muted">Los cambios son reales e inmediatos.</span>
            </div>
            {sqlOut?.error && <div className="error-box">{sqlOut.error}</div>}
            {sqlOut?.results?.map((r, i) =>
              r.fields.length ? (
                <table key={i} className="grid card">
                  <thead>
                    <tr>
                      {r.fields.map((f) => (
                        <th key={f}>{f}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {r.rows.slice(0, 200).map((row, j) => (
                      <tr key={j}>
                        {r.fields.map((f) => (
                          <td key={f}>{fmt(row[f])}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div key={i} className="pill ok">
                  OK · {r.affectedRows} filas afectadas
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const fmt = (v: unknown) => (v === null || v === undefined ? "∅" : v instanceof Object ? JSON.stringify(v) : String(v));

// --- Users -----------------------------------------------------------------------------

export function UsersPanel({ projectId }: { projectId: string }) {
  const { data, error } = useLoad<{ users: { id: string; email: string; name: string | null; role: string; hasPassword: boolean; createdAt: string }[] }>(
    `/projects/${projectId}/users`,
  );
  if (!data) return <Loading error={error} />;
  return (
    <>
      <Header
        title="Usuarios de la app"
        hint="Cuentas de las personas que usan tu app. Viven en la base de datos del proyecto, separadas de tu cuenta de Forja."
      />
      {data.users.length === 0 ? (
        <div className="card empty">Nadie se ha registrado todavía. Pide al constructor «añade inicio de sesión».</div>
      ) : (
        <table className="grid card">
          <thead>
            <tr>
              <th>Correo</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Contraseña</th>
              <th>Alta</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.name ?? "—"}</td>
                <td>{u.role === "admin" ? <span className="pill accent">admin</span> : u.role}</td>
                <td>{u.hasPassword ? "sí" : <span className="pill warn">sin fijar</span>}</td>
                <td>{timeAgo(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

// --- Storage ---------------------------------------------------------------------------

export function StoragePanel({ projectId }: { projectId: string }) {
  const { data, reload, error } = useLoad<{
    objects: { key: string; filename: string; contentType: string; size: number; createdAt: string }[];
    bytes: number;
  }>(`/projects/${projectId}/storage`);
  if (!data) return <Loading error={error} />;
  return (
    <>
      <Header title="Archivos" hint={`Lo que suben los usuarios de tu app · ${bytes(data.bytes)} usados · máx. 100 MB por archivo`} />
      {data.objects.length === 0 ? (
        <div className="card empty">Aún no hay archivos.</div>
      ) : (
        <table className="grid card">
          <thead>
            <tr>
              <th>Archivo</th>
              <th>Tipo</th>
              <th>Tamaño</th>
              <th>Subido</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.objects.map((o) => (
              <tr key={o.key}>
                <td title={o.key}>{o.filename}</td>
                <td>{o.contentType}</td>
                <td>{bytes(o.size)}</td>
                <td>{timeAgo(o.createdAt)}</td>
                <td style={{ textAlign: "right" }}>
                  <button className="sm danger" onClick={() => api(`/projects/${projectId}/storage/${o.key}`, { method: "DELETE" }).then(reload)}>
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

// --- Email -------------------------------------------------------------------------------

export function EmailPanel({ project, onChange }: { project: Project; onChange: () => void }) {
  const { data, reload, error } = useLoad<{
    emails: { id: number; direction: string; to: string; intendedTo: string | null; from: string; subject: string; html: string; status: string; createdAt: string }[];
  }>(`/projects/${project.id}/emails`);
  const [domain, setDomain] = useState(project.emailDomain ?? "");
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="stack">
      <Header title="Correo" hint="Correos que envía y recibe tu app." />
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

export function JobsPanel({ projectId, reloadKey }: { projectId: string; reloadKey: number }) {
  const { data, reload, error } = useLoad<{
    jobs: { name: string; schedule: string | null; timezone: string | null; enabled: boolean; nextRun: string | null }[];
    runs: { id: number; job: string; trigger: string; status: string; error: string | null; startedAt: string }[];
    timers: { id: string; job: string; env: string; runAt: string }[];
  }>(`/projects/${projectId}/jobs`, [reloadKey]);
  const [busy, setBusy] = useState("");
  if (!data) return <Loading error={error} />;
  return (
    <div className="stack">
      <Header
        title="Tareas programadas"
        hint="Las tareas con horario solo corren en la app publicada, con el código de la última publicación. «Ejecutar ahora» usa el código actual y datos reales."
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
                      setBusy(j.name);
                      await api(`/projects/${projectId}/jobs/${j.name}/run`, { body: {} }).catch((e) => alert(e.message));
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

export function LogsPanel({ projectId, lines }: { projectId: string; lines: { at: string; env: string; level: string; source: string; message: string }[] }) {
  const { data, error } = useLoad<{ logs: typeof lines }>(`/projects/${projectId}/logs`);
  const [errorsOnly, setErrorsOnly] = useState(false);
  const all = [...(data?.logs ?? []), ...lines].filter((l) => !errorsOnly || l.level === "error");
  return (
    <div className="stack">
      <Header title="Registros" hint="Peticiones, errores del servidor y de la consola del navegador, correos y tareas. En memoria; se pierden al reiniciar.">
        <label className="row" style={{ color: "var(--text)" }}>
          <input type="checkbox" style={{ width: "auto" }} checked={errorsOnly} onChange={(e) => setErrorsOnly(e.target.checked)} />
          Solo errores
        </label>
      </Header>
      <div className="card" style={{ padding: "6px 12px" }}>
        {all.length === 0 && <div className="empty">Sin registros.</div>}
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

// --- Checkpoints ------------------------------------------------------------------------------

export function CheckpointsPanel({ projectId, reloadKey }: { projectId: string; reloadKey: number }) {
  const { data, reload, error } = useLoad<{ checkpoints: { id: string; label: string; createdAt: string; fileCount: number }[] }>(`/projects/${projectId}/checkpoints`, [reloadKey]);
  const [label, setLabel] = useState("");
  if (!data) return <Loading error={error} />;
  return (
    <div className="stack">
      <Header title="Checkpoints" hint="Cada turno del constructor guarda uno. Restaurar cambia el código, no los datos." />
      <div className="row">
        <input placeholder="Etiqueta (p. ej. «antes del rediseño»)" value={label} onChange={(e) => setLabel(e.target.value)} />
        <button
          onClick={async () => {
            await api(`/projects/${projectId}/checkpoints`, { body: { label: label || "Manual" } });
            setLabel("");
            void reload();
          }}
        >
          Guardar checkpoint
        </button>
      </div>
      <div className="card">
        {data.checkpoints.map((c, i) => (
          <div key={c.id} className="row" style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
            <div className="grow">
              <div style={{ fontWeight: 500 }}>{c.label}</div>
              <div className="small muted">
                {timeAgo(c.createdAt)} · {c.fileCount} archivos
              </div>
            </div>
            {i === 0 ? (
              <span className="pill">actual</span>
            ) : (
              <button
                className="sm"
                onClick={async () => {
                  if (!confirm(`¿Restaurar el código a «${c.label}»? Los datos no cambian.`)) return;
                  await api(`/projects/${projectId}/checkpoints/${c.id}/restore`, { body: {} });
                  void reload();
                }}
              >
                Restaurar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
