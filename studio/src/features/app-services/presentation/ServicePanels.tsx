import { useEffect, useState } from "react";
import { api } from "../application/controller.js";
import { bytes, timeAgo } from "../../../shared/presentation/format.js";
import type { Project } from "../../../shared/contracts/index.js";
import { CreateDialog, TYPE_ICON, type Integration } from "../../integrations/index.js";
import { browser } from "../../../shared/infrastructure/browser.js";
import { Refresh } from "../../../shared/Icons.js";
import { Header, Loading, SecretsPanel, useLoad } from "../../files/index.js";
import { Menu, MenuItem, Modal, Switch } from "../../../shared/ui.js";

const fmt = (v: unknown) => (v === null || v === undefined ? "NULL" : v instanceof Object ? JSON.stringify(v) : String(v));

// --- Data: database card · table grid --------------------------------------------------

type Col = { name: string; type: string; nullable: boolean; default: string | null };
type Rows = { rows: Record<string, unknown>[]; total: number; columns: Col[]; primaryKey: string | null };

export function DataPanel({ projectId, projectName, reloadKey }: { projectId: string; projectName: string; reloadKey: number }) {
  const schema = useLoad<{ tables: Record<string, Col[]>; awake: boolean }>(`/projects/${projectId}/db/schema?internal=1`, [reloadKey]);
  const metrics = useLoad<{ active: boolean; opens: number; openFailures: number; closes: number; operations: number; failedOperations: number; openMs: number; queueWaitMs: number; operationMs: number }>(
    `/projects/${projectId}/db/metrics`,
    [reloadKey],
  );
  const [opened, setOpened] = useState(false);
  const [table, setTable] = useState<string>("");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Rows | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [sqlOpen, setSqlOpen] = useState(false);
  const [error, setError] = useState("");
  const PAGE = 50;

  const names = Object.keys(schema.data?.tables ?? {}).sort((a, b) => Number(a.startsWith("_")) - Number(b.startsWith("_")) || a.localeCompare(b));
  useEffect(() => {
    if (!table && names.length) setTable(names[0]!);
  }, [names.join(","), table]);

  const loadRows = () =>
    table
      ? api<Rows>(`/projects/${projectId}/db/rows?table=${encodeURIComponent(table)}&limit=${PAGE}&offset=${page * PAGE}&search=${encodeURIComponent(search)}`)
          .then((r) => {
            setRows(r);
            setSelected(new Set());
          })
          .catch((e) => setError(e.message))
      : undefined;
  useEffect(() => {
    if (opened) void loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, table, page, search, reloadKey]);

  if (!schema.data) return <Loading error={schema.error} />;
  const key = (r: Record<string, unknown>) => (rows?.primaryKey ? String(r[rows.primaryKey]) : "");

  return (
    <div className="two-col" style={{ gridTemplateColumns: "240px 1fr" }}>
      <div className="list" style={{ padding: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Datos</div>
        <div className="small muted" style={{ marginBottom: 10 }}>
          Los datos de tu app.
        </div>
        <div className="card" style={{ padding: 12, boxShadow: "none", borderColor: opened ? "var(--accent)" : undefined, display: "grid", gap: 6 }}>
          <span className="pill ok" style={{ justifySelf: "start" }}>
            ⛁ Postgres de Forja
          </span>
          <strong style={{ fontSize: 13 }}>Base de datos de {projectName}</strong>
          <span className="small muted">
            {names.filter((n) => !n.startsWith("_")).length} tablas · {schema.data.awake ? "despierta" : "dormida"}
          </span>
          {metrics.data && (
            <span className="small muted">
              {metrics.data.operations} consultas · {metrics.data.queueWaitMs} ms en cola · {metrics.data.openFailures} fallos al abrir
            </span>
          )}
          <a href="#" className="small" onClick={(e) => (e.preventDefault(), setOpened(true))}>
            Ver datos →
          </a>
        </div>
      </div>
      {!opened ? (
        <div className="empty" style={{ alignSelf: "center" }}>
          <div style={{ fontSize: 28 }}>⛁</div>
          <strong style={{ color: "var(--text)" }}>Datos</strong>
          <div>Elige un elemento a la izquierda para ver sus detalles.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateRows: "auto 1fr auto", minHeight: 0 }}>
          <div className="row" style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
            <Menu
              button={(_, toggle) => (
                <button className="sm icon-btn" title="Ajustes de la base de datos" aria-label="Ajustes de la base de datos" onClick={toggle}>
                  ⚙
                </button>
              )}
            >
              {(close) => (
                <>
                  <MenuItem onClick={() => (close(), setSqlOpen(true))}>Consola SQL…</MenuItem>
                  <MenuItem onClick={() => (close(), browser.navigate(`/api/projects/${projectId}/db/export`))}>Exportar base de datos</MenuItem>
                </>
              )}
            </Menu>
            <select value={table} onChange={(e) => (setTable(e.target.value), setPage(0))} style={{ width: 220, height: 30, padding: "0 8px" }}>
              {names.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <div className="grow" />
            <input placeholder="Buscar en la tabla…" value={search} onChange={(e) => (setSearch(e.target.value), setPage(0))} style={{ width: 220, height: 30 }} />
            {selected.size > 0 && (
              <button
                className="sm danger"
                onClick={async () => {
                  if (!confirm(`¿Borrar ${selected.size} fila(s)? Es definitivo y afecta también a la app publicada.`)) return;
                  try {
                    await api(`/projects/${projectId}/db/rows/delete`, { body: { table, keys: [...selected] } });
                    void loadRows();
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                Borrar {selected.size}
              </button>
            )}
            <button className="primary sm" onClick={() => setAdding(true)} disabled={!table}>
              ＋ Añadir fila
            </button>
          </div>
          <div style={{ overflow: "auto", minHeight: 0 }}>
            {error && <div className="error-box" style={{ margin: 12 }}>{error}</div>}
            {!rows ? (
              <Loading />
            ) : (
              <table className="grid">
                <thead>
                  <tr>
                    <th style={{ width: 32 }}>
                      <input
                        type="checkbox"
                        style={{ width: "auto" }}
                        disabled={!rows.primaryKey}
                        checked={rows.rows.length > 0 && selected.size === rows.rows.length}
                        onChange={(e) => setSelected(e.target.checked ? new Set(rows.rows.map(key)) : new Set())}
                      />
                    </th>
                    {rows.columns.map((c) => (
                      <th key={c.name} title={`${c.type}${c.default ? ` · por defecto ${c.default}` : ""}`}>
                        {c.name}
                        {!c.nullable && !c.default && <span style={{ color: "var(--err)" }}>*</span>}{" "}
                        <span style={{ fontWeight: 400 }}>{c.type}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.rows.map((r, i) => (
                    <tr key={i}>
                      <td>
                        <input
                          type="checkbox"
                          style={{ width: "auto" }}
                          disabled={!rows.primaryKey}
                          checked={selected.has(key(r))}
                          onChange={(e) => {
                            const s = new Set(selected);
                            if (e.target.checked) s.add(key(r));
                            else s.delete(key(r));
                            setSelected(s);
                          }}
                        />
                      </td>
                      {rows.columns.map((c) => (
                        <td key={c.name} title={fmt(r[c.name])} style={r[c.name] === null ? { color: "var(--muted)", fontStyle: "italic" } : undefined}>
                          {fmt(r[c.name])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {rows && rows.rows.length === 0 && <div className="empty">{search ? "Ninguna fila coincide." : "La tabla está vacía."}</div>}
          </div>
          {rows && (
            <div className="row small" style={{ padding: "8px 12px", borderTop: "1px solid var(--border)" }}>
              <span className="grow muted">
                Mostrando {rows.total ? page * PAGE + 1 : 0}–{Math.min((page + 1) * PAGE, rows.total)} de {rows.total} filas
              </span>
              <button className="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                ‹ Anterior
              </button>
              <span className="pill accent">{page + 1}</span>
              <button className="sm" disabled={(page + 1) * PAGE >= rows.total} onClick={() => setPage((p) => p + 1)}>
                Siguiente ›
              </button>
            </div>
          )}
        </div>
      )}
      {adding && rows && (
        <AddRowDialog
          table={table}
          columns={rows.columns}
          onClose={() => setAdding(false)}
          onSubmit={async (values) => {
            await api(`/projects/${projectId}/db/rows`, { body: { table, values } });
            setAdding(false);
            void loadRows();
          }}
        />
      )}
      {sqlOpen && <SqlConsole projectId={projectId} onClose={() => (setSqlOpen(false), void schema.reload(), void loadRows())} />}
    </div>
  );
}

function AddRowDialog(props: { table: string; columns: Col[]; onClose: () => void; onSubmit: (v: Record<string, string>) => Promise<void> }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  return (
    <Modal onClose={props.onClose}>
      <h3>Añadir fila a {props.table}</h3>
      <div className="small muted">Deja vacío un campo para usar su valor por defecto.</div>
      <div className="stack" style={{ maxHeight: "50vh", overflow: "auto", gap: 8 }}>
        {props.columns.map((c) => (
          <label key={c.name}>
            <span>
              {c.name} <span className="small">{c.type}</span>
              {!c.nullable && !c.default && <span style={{ color: "var(--err)" }}> *</span>}
            </span>
            <input
              value={values[c.name] ?? ""}
              placeholder={c.default ? `por defecto: ${c.default}` : c.nullable ? "NULL" : ""}
              onChange={(e) => setValues((v) => ({ ...v, [c.name]: e.target.value }))}
            />
          </label>
        ))}
      </div>
      {error && <div className="error-box">{error}</div>}
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <button onClick={props.onClose}>Cancelar</button>
        <button className="primary" onClick={() => props.onSubmit(values).catch((e) => setError(e.message))}>
          Añadir
        </button>
      </div>
    </Modal>
  );
}

function SqlConsole({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const [sql, setSql] = useState("");
  const [out, setOut] = useState<{ error?: string; results?: { fields: string[]; rows: Record<string, unknown>[]; affectedRows: number }[] } | null>(null);
  return (
    <Modal onClose={onClose} className="modal" >
      <h3>Consola SQL</h3>
      <textarea className="code" rows={6} autoFocus placeholder="select * from …" value={sql} onChange={(e) => setSql(e.target.value)} />
      <div className="row">
        <span className="small muted grow">Postgres 18. Los cambios son reales e inmediatos.</span>
        <button
          className="primary sm"
          disabled={!sql.trim()}
          onClick={async () => {
            try {
              setOut(await api(`/projects/${projectId}/db/sql`, { body: { sql } }));
            } catch (e) {
              setOut({ error: (e as Error).message });
            }
          }}
        >
          Ejecutar
        </button>
      </div>
      <div style={{ maxHeight: "40vh", overflow: "auto" }}>
        {out?.error && <div className="error-box">{out.error}</div>}
        {out?.results?.map((r, i) =>
          r.fields.length ? (
            <table key={i} className="grid">
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
    </Modal>
  );
}

// --- Integrations: account integrations connected here + project secrets ---------------------

type Types = Record<Integration["type"], { label: string; env: string }>;

export function IntegrationsPanel({ projectId, reloadKey }: { projectId: string; reloadKey: number }) {
  const { data, reload, error } = useLoad<{ all: Integration[]; connected: string[] }>(`/projects/${projectId}/integrations`, [reloadKey]);
  const [types, setTypes] = useState<Types | null>(null);
  const [creating, setCreating] = useState(false);
  useEffect(() => {
    api<{ types: Types }>("/integrations").then((r) => setTypes(r.types));
  }, []);
  if (!data) return <Loading error={error} />;
  const connected = data.all.filter((i) => data.connected.includes(i.id));
  const available = data.all.filter((i) => !data.connected.includes(i.id));
  return (
    <div className="stack" style={{ gap: 18 }}>
      <Header title="Integraciones" hint="Claves guardadas en tu cuenta que usa esta app. Llegan a tu código de servidor como ctx.env.NOMBRE.">
        <Menu
          align="right"
          button={(_, toggle) => (
            <button className="primary sm" onClick={toggle}>
              Conectar integración ▾
            </button>
          )}
        >
          {(close) => (
            <>
              {available.length === 0 && <div className="menu-label">No hay más integraciones guardadas</div>}
              {available.map((i) => (
                <MenuItem
                  key={i.id}
                  onClick={async () => {
                    close();
                    await api(`/projects/${projectId}/integrations/${i.id}`, { body: {} });
                    void reload();
                  }}
                >
                  {TYPE_ICON[i.type]} {i.name} <code className="small muted">{i.envName}</code>
                </MenuItem>
              ))}
              <div className="menu-sep" />
              <MenuItem onClick={() => (close(), setCreating(true))}>＋ Nueva integración…</MenuItem>
            </>
          )}
        </Menu>
      </Header>
      {connected.length === 0 ? (
        <div className="card empty">Esta app no usa integraciones de tu cuenta.</div>
      ) : (
        connected.map((i) => (
          <div key={i.id} className="card row" style={{ padding: 14 }}>
            <span style={{ fontSize: 18 }}>{TYPE_ICON[i.type]}</span>
            <div className="grow">
              <strong>{i.name}</strong>
              <div className="small muted">
                Servicio externo · <code>ctx.env.{i.envName}</code>
                {i.description && ` · ${i.description}`}
              </div>
            </div>
            <button
              className="sm"
              onClick={async () => {
                await api(`/projects/${projectId}/integrations/${i.id}`, { method: "DELETE" });
                void reload();
              }}
            >
              Desconectar
            </button>
          </div>
        ))
      )}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 18 }}>
        <SecretsPanel projectId={projectId} reloadKey={reloadKey} />
      </div>
      {creating && types && (
        <CreateDialog
          types={types}
          onClose={() => setCreating(false)}
          onDone={async (id) => {
            await api(`/projects/${projectId}/integrations/${id}`, { body: {} });
            void reload();
          }}
        />
      )}
    </div>
  );
}

// --- Analytics ---------------------------------------------------------------------------

interface Analytics {
  currentVisitors: number;
  visitors: number;
  views: number;
  trend: { day: string; visitors: number; views: number }[];
  topPages: { label: string; count: number }[];
  topReferrers: { label: string; count: number }[];
  browsers: { label: string; count: number }[];
  devices: { label: string; count: number }[];
}

function Bars({ title, items }: { title: string; items: { label: string; count: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="stat stack" style={{ gap: 8 }}>
      <strong style={{ fontSize: 13 }}>{title}</strong>
      {items.length === 0 ? (
        <div className="small muted">Sin datos</div>
      ) : (
        <div className="bars">
          {items.map((i) => (
            <div key={i.label} className="bar-row">
              <div className="fill" style={{ width: `${(i.count / max) * 100}%` }} />
              <span>{i.label}</span>
              <span>{i.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AnalyticsPanel({ project }: { project: Project }) {
  const [days, setDays] = useState(7);
  const { data, error, reload } = useLoad<Analytics>(`/projects/${project.id}/analytics?days=${days}`, [days]);
  if (!data) return <Loading error={error} />;
  const max = Math.max(1, ...data.trend.map((t) => t.views));
  return (
    <div className="stack" style={{ gap: 14 }}>
      <Header title="Analítica" hint="Visitas a tu app publicada, sin cookies: un visitante es un identificador anónimo que cambia cada día.">
        <div className="segmented">
          {[7, 30, 90].map((d) => (
            <button key={d} className={days === d ? "on" : ""} onClick={() => setDays(d)}>
              {d} días
            </button>
          ))}
        </div>
        <button className="sm icon-btn" onClick={reload} aria-label="Actualizar">
          <Refresh />
        </button>
      </Header>
      {!project.slug && <div className="pill warn" style={{ padding: 10, borderRadius: 8 }}>La app no está publicada: aquí verás las visitas en cuanto la publiques.</div>}
      <div className="stat-grid">
        <div className="stat">
          <div className="small muted">Visitantes ahora</div>
          <div className="n">
            <span className="live-dot" style={{ display: "inline-block", marginRight: 8, verticalAlign: "middle" }} />
            {data.currentVisitors}
          </div>
        </div>
        <div className="stat">
          <div className="small muted">Visitantes</div>
          <div className="n">{data.visitors.toLocaleString()}</div>
        </div>
        <div className="stat">
          <div className="small muted">Páginas vistas</div>
          <div className="n">{data.views.toLocaleString()}</div>
        </div>
      </div>
      <div className="stat">
        <strong style={{ fontSize: 13 }}>Tendencia</strong>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 120, marginTop: 10 }}>
          {data.trend.map((t) => (
            <div key={t.day} title={`${t.day}: ${t.visitors} visitantes · ${t.views} vistas`} style={{ flex: 1, display: "grid", alignItems: "end", height: "100%" }}>
              <div style={{ height: `${(t.views / max) * 100}%`, minHeight: 2, background: "var(--accent)", borderRadius: 3, opacity: 0.85 }} />
            </div>
          ))}
        </div>
        <div className="row small muted" style={{ justifyContent: "space-between", marginTop: 4 }}>
          <span>{data.trend[0]?.day}</span>
          <span>{data.trend.at(-1)?.day}</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
        <Bars title="Páginas más vistas" items={data.topPages} />
        <Bars title="De dónde llegan" items={data.topReferrers} />
        <Bars title="Navegadores" items={data.browsers} />
        <Bars title="Dispositivos" items={data.devices} />
      </div>
    </div>
  );
}

// --- SEO ------------------------------------------------------------------------------------

export function SeoPanel({ project, onChange }: { project: Project; onChange: () => void }) {
  const [seo, setSeo] = useState(project.seo ?? {});
  const [saved, setSaved] = useState(false);
  const save = async (next = seo) => {
    await api(`/projects/${project.id}`, { method: "PATCH", body: { seo: next } });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    onChange();
  };
  const toggle = (k: "robots" | "sitemap") => {
    const next = { ...seo, [k]: !seo[k] };
    setSeo(next);
    void save(next);
  };
  return (
    <div className="stack" style={{ gap: 16, maxWidth: 720 }}>
      <Header title="SEO" hint="Ayuda a Google y a las IA a encontrar y recomendar tu app. Se aplica al publicar." />
      <div className="card stack" style={{ padding: 16 }}>
        <label>
          Nombre del sitio
          <input value={seo.siteName ?? ""} placeholder={project.name} onChange={(e) => setSeo({ ...seo, siteName: e.target.value })} />
          <span className="small">Aparece en los resultados de búsqueda y en la pestaña del navegador.</span>
        </label>
        <label>
          Descripción
          <textarea rows={3} value={seo.siteDescription ?? ""} placeholder={project.description} onChange={(e) => setSeo({ ...seo, siteDescription: e.target.value })} />
          <span className="small">Aparece bajo el título en los resultados. Unos 155 caracteres.</span>
        </label>
        <div className="row">
          <button className="primary sm" onClick={() => save()}>
            Guardar
          </button>
          {saved && <span className="small" style={{ color: "var(--ok)" }}>Guardado</span>}
        </div>
      </div>
      <div className="card" style={{ padding: "4px 16px" }}>
        <div className="section-title" style={{ margin: "12px 0 0" }}>Descubrimiento</div>
        <div className="row-setting" style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
          <div>
            <strong>robots.txt</strong>
            <div className="small muted">Permite que Google y las herramientas de IA rastreen tu app.</div>
          </div>
          <Switch on={!!seo.robots} onChange={() => toggle("robots")} label="robots.txt" />
        </div>
        <div className="row-setting" style={{ padding: "12px 0" }}>
          <div>
            <strong>sitemap.xml</strong>
            <div className="small muted">Lista tus páginas para que Google las encuentre todas (las rutas con parámetros no se incluyen).</div>
          </div>
          <Switch on={!!seo.sitemap} onChange={() => toggle("sitemap")} label="sitemap.xml" />
        </div>
      </div>
      {project.appUrl && (
        <div className="small muted">
          Compruébalo en <a href={`${project.appUrl.replace(/\/?\?.*$/, "")}/robots.txt`} target="_blank" rel="noreferrer">robots.txt</a> ·{" "}
          <a href={`${project.appUrl.replace(/\/?\?.*$/, "")}/sitemap.xml`} target="_blank" rel="noreferrer">sitemap.xml</a>
        </div>
      )}
    </div>
  );
}

// --- Docs: the builder's markdown notes in static/__dev/ ------------------------------------

export function DocsPanel({ projectId, reloadKey }: { projectId: string; reloadKey: number }) {
  const files = useLoad<{ files: { path: string; updatedAt: string }[] }>(`/projects/${projectId}/files`, [reloadKey]);
  const [path, setPath] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState("");
  const docs = (files.data?.files ?? []).filter((f) => f.path.startsWith("static/__dev/"));
  useEffect(() => {
    if (!path && docs[0]) setPath(docs[0].path);
  }, [docs.length]);
  useEffect(() => {
    if (path) {
      api<{ content: string }>(`/projects/${projectId}/file?path=${encodeURIComponent(path)}`).then((r) => {
        setContent(r.content);
        setSaved(r.content);
      });
    }
  }, [path, reloadKey, projectId]);
  if (!files.data) return <Loading error={files.error} />;
  const fileName = path?.split("/").pop() ?? "";
  const lineCount = content ? content.split("\n").length : 0;
  return (
    <div className="tool-file-panel tool-docs-panel">
      <aside className="tool-file-sidebar">
        <div className="tool-file-sidebar-head">
          <span className="tool-eyebrow">CONOCIMIENTO DEL PROYECTO</span>
          <div className="tool-file-sidebar-title">
            <strong>Planes y docs</strong>
            <span className="tool-count">{docs.length}</span>
          </div>
          <p className="tool-sidebar-description">Documentación interna que los agentes consultan y mantienen.</p>
        </div>
        <div className="tool-file-list">
          {docs.map((d) => {
            const name = d.path.split("/").pop() ?? d.path;
            const label = name === "design.md" ? "Diseño" : name === "architecture.md" ? "Arquitectura" : name.replace(/\.md$/, "");
            const detail = name === "design.md"
              ? "Experiencia y criterios visuales"
              : name === "architecture.md"
                ? "Estructura y decisiones técnicas"
                : d.path.replace("static/__dev/", "");
            return (
              <button
                key={d.path}
                className={`tool-file-button${d.path === path ? " active" : ""}`}
                onClick={() => setPath(d.path)}
                title={d.path}
                aria-current={d.path === path ? "page" : undefined}
              >
                <span className="tool-doc-mark">MD</span>
                <span className="tool-file-label">
                  <strong>{label}</strong>
                  <small>{detail}</small>
                </span>
              </button>
            );
          })}
          {docs.length === 0 && (
            <div className="tool-docs-empty">
              <strong>Sin documentación todavía</strong>
              <span>El agente puede crear design.md y architecture.md al planificar o implementar cambios.</span>
            </div>
          )}
        </div>
        <div className="tool-sidebar-foot">Se guarda en <code>static/__dev/</code> y no se publica.</div>
      </aside>
      <section className="tool-file-workspace tool-doc-workspace">
        {path ? (
          <>
            <header className="tool-file-toolbar">
              <div className="tool-file-heading">
                <span className="tool-eyebrow">DOCUMENTACIÓN INTERNA</span>
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
              <span>MARKDOWN</span>
              <span>{lineCount} líneas</span>
            </div>
            <textarea
              className="code code-editor tool-code-editor tool-doc-editor"
              aria-label={`Editar ${path}`}
              spellCheck={false}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </>
        ) : (
          <div className="tool-file-empty">
            <span className="tool-empty-mark">#</span>
            <strong>Planes y decisiones, en un solo lugar</strong>
            <p>Los agentes pueden crear y actualizar el diseño y la arquitectura del proyecto aquí.</p>
          </div>
        )}
      </section>
    </div>
  );
}

// --- Payments --------------------------------------------------------------------------------

export function PaymentsPanel({ projectId }: { projectId: string }) {
  const { data } = useLoad<{ secrets: { name: string; isSet: boolean }[] }>(`/projects/${projectId}/secrets`);
  const ready = data?.secrets.some((s) => s.name === "STRIPE_SECRET_KEY" && s.isSet);
  return (
    <div className="stack" style={{ gap: 14, maxWidth: 720 }}>
      <Header title="Pagos" hint="Cobra en tu app con Stripe Checkout. El dinero llega a tu propia cuenta de Stripe." />
      <div className="card stack" style={{ padding: 16 }}>
        <div className="row">
          <strong className="grow">Stripe</strong>
          {ready ? <span className="pill ok">Configurado</span> : <span className="pill">Sin configurar</span>}
        </div>
        {ready ? (
          <div className="small muted">Tu código usa ctx.payments.checkout(...). Con una clave sk_test_ los cobros son de prueba (tarjeta 4242 4242 4242 4242).</div>
        ) : (
          <div className="small muted">
            Esta app aún no cobra. Pide al constructor «añade pagos»: creará el checkout y te pedirá la clave STRIPE_SECRET_KEY en Integraciones. Empieza
            con una clave de prueba sk_test_.
          </div>
        )}
      </div>
    </div>
  );
}

// --- Storage ---------------------------------------------------------------------------------

export function StoragePanel({ projectId, reloadKey }: { projectId: string; reloadKey: number }) {
  const store = useLoad<{ objects: { key: string; filename: string; contentType: string; size: number; createdAt: string }[]; bytes: number; quotaBytes: number }>(
    `/projects/${projectId}/storage`,
    [reloadKey],
  );
  const files = useLoad<{ files: { path: string; size: number }[] }>(`/projects/${projectId}/files`, [reloadKey]);
  const [section, setSection] = useState<"uploads" | "static">("uploads");
  if (!store.data || !files.data) return <Loading error={store.error || files.error} />;
  const statics = files.data.files.filter((f) => f.path.startsWith("static/") && !f.path.startsWith("static/__dev/"));
  const LIMIT = store.data.quotaBytes;
  return (
    <div className="two-col" style={{ gridTemplateColumns: "240px 1fr" }}>
      <div className="list" style={{ padding: 12, display: "grid", alignContent: "start", gap: 6 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Archivos</div>
        <div className="small muted" style={{ marginBottom: 6 }}>
          Lo que guarda tu app
        </div>
        <button className={section === "uploads" ? "active" : ""} onClick={() => setSection("uploads")}>
          ⇪ Subidos por usuarios <span className="count" style={{ marginLeft: "auto" }}>{store.data.objects.length}</span>
        </button>
        <button className={section === "static" ? "active" : ""} onClick={() => setSection("static")}>
          ◫ Estáticos de la app <span className="count" style={{ marginLeft: "auto" }}>{statics.length}</span>
        </button>
        <div className="meter" style={{ marginTop: 10 }}>
          <strong style={{ fontSize: 13 }}>Uso</strong>
          <div className="meter-bar">
            <div style={{ width: `${Math.min(100, (store.data.bytes / LIMIT) * 100)}%` }} />
          </div>
          <span className="small muted">{bytes(store.data.bytes)} de {bytes(LIMIT)} · 100 MB por archivo</span>
        </div>
      </div>
      <div style={{ overflow: "auto", padding: 18 }}>
        {section === "uploads" ? (
          store.data.objects.length === 0 ? (
            <div className="card empty">Tus usuarios aún no han subido archivos.</div>
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
                {store.data.objects.map((o) => (
                  <tr key={o.key}>
                    <td title={o.key}>{o.filename}</td>
                    <td>{o.contentType}</td>
                    <td>{bytes(o.size)}</td>
                    <td>{timeAgo(o.createdAt)}</td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="sm danger"
                        onClick={() => api(`/projects/${projectId}/storage/${o.key}`, { method: "DELETE" }).then(store.reload)}
                      >
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : statics.length === 0 ? (
          <div className="card empty">La app no tiene archivos en static/.</div>
        ) : (
          <table className="grid card">
            <thead>
              <tr>
                <th>Ruta pública</th>
                <th>Tamaño</th>
              </tr>
            </thead>
            <tbody>
              {statics.map((f) => (
                <tr key={f.path}>
                  <td>
                    <code>/{f.path}</code>
                  </td>
                  <td>{bytes(f.size)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
