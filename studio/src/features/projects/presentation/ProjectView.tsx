import { Fragment, useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { api, projectsController } from "../application/controller.js";
import type { ProjectLogLine } from "../application/contracts.js";
import type { Project, Me } from "../../../shared/contracts/index.js";
import { browser } from "../../../shared/infrastructure/browser.js";
import { TurnDetails, type TurnDetail } from "../../files/index.js";
import { Chat, type SelectedElement } from "../../builder/index.js";
import { SecurityPanel, type Problem } from "../../observability/index.js";
import { External, Refresh } from "../../../shared/Icons.js";
import { AiPanel, CodePanel, EmailPanel, JobsPanel, LogsPanel, UsersPanel } from "../../files/index.js";
import { AnalyticsPanel, DataPanel, DocsPanel, IntegrationsPanel, PaymentsPanel, SeoPanel, StoragePanel } from "../../app-services/index.js";
import { Avatar, copyText, Menu, MenuItem, useDismiss } from "../../../shared/ui.js";
import { CheckpointPanel, Collaborators, DEVICES, PagePalette, PreviewCanvas, ProjectSettings, PublishPanel, type Device, type PreviewHandle, type TextEdit } from "./Workspace.js";

type Notice = { text: string; tone?: "ok" | "warn"; action?: { label: string; run: () => void } };

const TEXT_EDIT_WHY: Record<string, string> = {
  not_found: "Ese texto no está escrito en el código (puede venir de la base de datos).",
  ambiguous: "Ese texto aparece en varios sitios.",
  unsafe: "El texto nuevo tiene caracteres que el código interpretaría.",
  building: "El constructor está trabajando.",
  empty: "El texto no puede quedar vacío.",
};

type View = "preview" | "services" | "settings" | "details";
type ServiceKey = "data" | "users" | "ai" | "integrations" | "analytics" | "seo" | "docs" | "jobs" | "storage" | "email" | "payments" | "logs" | "security" | "code";

const SERVICES: { key: ServiceKey; label: string; icon: string; search: string }[] = [
  { key: "data", label: "Datos", icon: "⛁", search: "base de datos postgres sql tablas" },
  { key: "users", label: "Usuarios", icon: "☺", search: "cuentas autenticacion login" },
  { key: "ai", label: "IA", icon: "✦", search: "inteligencia artificial modelos" },
  { key: "integrations", label: "Integraciones", icon: "⚷", search: "servicios externos api claves" },
  { key: "analytics", label: "Analítica", icon: "▥", search: "estadisticas metricas visitas" },
  { key: "seo", label: "SEO", icon: "◎", search: "buscadores metadatos posicionamiento" },
  { key: "docs", label: "Docs", icon: "▢", search: "documentacion archivos" },
  { key: "jobs", label: "Tareas", icon: "◷", search: "trabajos programados cron temporizadores" },
  { key: "storage", label: "Archivos", icon: "⇪", search: "almacenamiento subidas uploads" },
  { key: "email", label: "Correo", icon: "✉", search: "email mensajes envio" },
  { key: "payments", label: "Pagos", icon: "¤", search: "cobros suscripciones stripe" },
  { key: "logs", label: "Registros", icon: "≡", search: "logs errores actividad" },
  { key: "security", label: "Seguridad", icon: "⛨", search: "vulnerabilidades escaneo" },
];
const normalizeServiceSearch = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
/** Always listed among the used ones. */
const ALWAYS_USED = new Set<ServiceKey>(["seo", "logs", "security"]);

const readDrawer = () => {
  try {
    return browser.localStorage.getItem("forja:drawer") !== "0";
  } catch {
    return true;
  }
};

export function ProjectView({
  id,
  me,
  onCredits,
  userMenu: UserMenu,
}: {
  id: string;
  me: Me;
  onCredits: () => void;
  userMenu: ComponentType<{ me: Me; up?: boolean; asLogo?: boolean }>;
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");
  const [view, setView] = useState<View>("preview");
  const [service, setService] = useState<ServiceKey>("data");
  const [serviceSearch, setServiceSearch] = useState("");
  const [used, setUsed] = useState<Record<string, boolean>>({});
  const [filesKey, setFilesKey] = useState(0);
  const [logLines, setLogLines] = useState<ProjectLogLine[]>([]);
  const [building, setBuilding] = useState(false);
  const [drawer, setDrawer] = useState(() => readDrawer() || new URLSearchParams(browser.location.search).has("edit") || !!browser.sessionStorage.getItem(`forja:first:${id}`));
  const [device, setDevice] = useState<Device>("desktop");
  const [mobilePane, setMobilePane] = useState<"preview" | "chat">("preview");
  const [fullscreen, setFullscreen] = useState(false);
  const [path, setPath] = useState("/");
  const [selecting, setSelecting] = useState(false);
  const [selection, setSelection] = useState<SelectedElement | null>(null);
  const [panel, setPanel] = useState<"checkpoints" | "publish" | null>(null);
  const [palette, setPalette] = useState(false);
  const [codeFile, setCodeFile] = useState<string | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [fixNonce, setFixNonce] = useState(0);
  // A message another panel asks the chat to send (Security's "Arreglar").
  const [outbox, setOutbox] = useState<{ nonce: number; text: string } | null>(null);
  const [chatKey, setChatKey] = useState(0);
  const [detail, setDetail] = useState<TurnDetail | null>(null);
  const [insert, setInsert] = useState<{ text: string; nonce: number } | null>(null);
  const preview = useRef<PreviewHandle>(null);
  const closePanel = useCallback(() => setPanel(null), []);
  const closeDetails = useCallback(() => setView("preview"), []);
  const [editingText, setEditingText] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), notice.action ? 9000 : 4500);
    return () => clearTimeout(t);
  }, [notice]);
  const toggleEditText = () => {
    const on = !editingText;
    setEditingText(on);
    if (on && selecting) setSelecting(false);
    preview.current?.setEditingText(on);
  };
  const showChat = useCallback(() => {
    setDrawer(true);
    setMobilePane("chat");
  }, []);
  useEffect(() => {
    if (view !== "preview" && mobilePane !== "preview") setMobilePane("preview");
  }, [view, mobilePane]);
  const onEditEnded = useCallback(() => setEditingText(false), []);
  // A text rewritten in the preview: patched directly when unambiguous, otherwise handed to the builder.
  const onTextEdit = useCallback(
    async (e: TextEdit) => {
      try {
        const r = await api<{ ok: boolean; path?: string; undo?: number | null; reason?: string; matches?: string[] }>(`/projects/${id}/text-edit`, {
          body: { before: e.before, after: e.after },
        });
        if (r.ok) {
          setNotice({
            text: `Texto cambiado en ${r.path} · sin créditos`,
            tone: "ok",
            action:
              r.undo != null
                ? {
                    label: "Deshacer",
                    run: () => void api(`/projects/${id}/changes/${r.undo}/restore`, { body: {} }).then(() => setNotice({ text: "Cambio deshecho" })),
                  }
                : undefined,
          });
          return;
        }
        const why = TEXT_EDIT_WHY[r.reason ?? ""] ?? "No pude cambiarlo directamente.";
        showChat();
        setInsert({
          text: `Cambia el texto «${e.before.trim()}» por «${e.after.trim()}» en la página ${e.path}${r.matches?.length ? ` (aparece en ${r.matches.join(", ")})` : ""}.`,
          nonce: Date.now(),
        });
        setNotice({ text: `${why} Te dejé la petición en el chat para el constructor.`, tone: "warn" });
      } catch (err) {
        setNotice({ text: (err as Error).message, tone: "warn" });
      }
    },
    [id, showChat],
  );
  const checkpointRef = useDismiss<HTMLDivElement>(panel === "checkpoints", closePanel);
  const publishRef = useDismiss<HTMLDivElement>(panel === "publish", closePanel);

  const load = () =>
    projectsController.loadProject(id)
      .then((r) => setProject(r.project))
      .catch((e) => setError(e.message));
  const loadUsed = () => api<Record<string, boolean>>(`/projects/${id}/services`).then(setUsed).catch(() => {});

  useEffect(() => {
    void load();
    void loadUsed();
    void api<{ problems: Problem[] }>(`/projects/${id}/problems`).then((r) => setProblems(r.problems)).catch(() => {});
    let t: ReturnType<typeof setTimeout>;
    const unsubscribe = projectsController.subscribeToEvents(id, (e) => {
      if (e.type === "files") {
        clearTimeout(t);
        t = setTimeout(() => (setFilesKey((k) => k + 1), void load()), 400);
      } else if (e.type === "log") setLogLines((l) => [...l.slice(-300), e.entry]);
      else if (e.type === "published") void load();
      else if (e.type === "problems") setProblems(e.problems);
      else if (e.type === "github" && e.status === "pulled") setChatKey((k) => k + 1);
    });
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "p")) {
        e.preventDefault();
        setPalette(true);
      }
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      unsubscribe();
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleDrawer = () => {
    if (view !== "preview") {
      setView("preview");
      showChat();
      return;
    }
    setDrawer((d) => {
      const next = !d;
      try {
        browser.localStorage.setItem("forja:drawer", next ? "1" : "0");
      } catch {
        /* per-viewer convenience only */
      }
      setMobilePane(next ? "chat" : "preview");
      return next;
    });
  };
  const toggleSelect = () => {
    const on = !selecting;
    setSelecting(on);
    if (on) setEditingText(false);
    preview.current?.setSelecting(on);
    if (on && !drawer) showChat();
  };
  const onSelected = useCallback((el: SelectedElement) => setSelection(el), []);
  const onSelectEnded = useCallback(() => setSelecting(false), []);
  const onFix = useCallback(() => {
    showChat();
    setFixNonce((n) => n + 1);
  }, [showChat]);
  const openService = (key: ServiceKey) => {
    setService(key);
    setView("services");
  };

  if (error) return <div className="empty">{error}</div>;
  if (!project) return <div className="empty">Cargando…</div>;

  const errors = logLines.filter((l) => l.level === "error").length;
  const isUsed = (k: ServiceKey) => ALWAYS_USED.has(k) || !!used[k];
  const ordered = [...SERVICES.filter((s) => isUsed(s.key)), ...SERVICES.filter((s) => !isUsed(s.key))];
  const query = normalizeServiceSearch(serviceSearch.trim());
  const visibleServices = ordered.filter((s) => !query || normalizeServiceSearch(`${s.label} ${s.key} ${s.search}`).includes(query));
  const showCode = !query || normalizeServiceSearch("codigo code archivos fuente editor").includes(query);
  const pageLabel = path === "/" ? "Inicio" : path;
  const publishLabel = !project.slug ? "Publicar" : project.hasUnpublishedChanges ? "Publicar cambios" : "Publicada";

  return (
    <div className="ws">
      <div>
        <header className="ws-bar">
          <UserMenu me={me} asLogo />
          <button className={`project-chip ${view === "settings" ? "on" : ""}`} onClick={() => setView("settings")} title="Ajustes del proyecto">
            <Avatar id={project.id} name={project.name} size={24} />
            <span style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.name}</span>
          </button>
          <div className="ws-tabs">
            <button className={view === "preview" ? "on" : ""} onClick={() => setView("preview")}>
              Vista previa
            </button>
            <button className={view === "services" ? "on" : ""} onClick={() => setView("services")}>
              Servicios
            </button>
            <button title="Datos" aria-label="Datos" onClick={() => openService("data")}>
              ⛁
            </button>
            <button title="Correo" aria-label="Correo" onClick={() => openService("email")}>
              ✉
            </button>
            <button title="Registros" aria-label="Registros" onClick={() => openService("logs")} style={errors ? { color: "var(--err)" } : undefined}>
              ≡{errors > 0 && <span className="small"> {errors}</span>}
            </button>
          </div>
          <div className="center">
            {view === "preview" ? (
              <>
                <button className="sm icon-btn ghost" title="Pantalla completa (Esc para salir)" aria-label="Pantalla completa" onClick={() => setFullscreen(true)}>
                  ⛶
                </button>
                <button className="page-chip" title="Ir a una página (Ctrl+K)" onClick={() => setPalette(true)}>
                  ▭ {pageLabel} {project.appUrl && <span className="live-dot" title="Publicada" />} ▾
                </button>
                <button className="sm icon-btn ghost" title="Recargar" aria-label="Recargar vista previa" onClick={() => preview.current?.reload()}>
                  <Refresh />
                </button>
              </>
            ) : view === "services" ? (
              <span className="page-chip">
                {SERVICES.find((s) => s.key === service)?.icon} {SERVICES.find((s) => s.key === service)?.label ?? "Código"}
                <button className="ghost sm icon-btn" style={{ height: 20, width: 20 }} aria-label="Volver a la vista previa" onClick={() => setView("preview")}>
                  ×
                </button>
              </span>
            ) : view === "details" ? (
              <span className="page-chip">✎ Detalles del cambio</span>
            ) : (
              <span className="page-chip">⚙ Ajustes del proyecto</span>
            )}
          </div>
          {building && (
            <span className="pill accent">
              <span className="spinner" style={{ width: 10, height: 10 }} /> construyendo
            </span>
          )}
          <Menu
            align="right"
            className="panel-pop"
            button={(_, toggle) => (
              <button className="sm ghost" style={{ height: 32 }} title="Colaboradores" aria-label="Colaboradores" onClick={toggle}>
                <span className="mini-avatar" style={{ background: "#4f46e5", width: 22, height: 22 }}>
                  {(me.name || me.email).slice(0, 1).toUpperCase()}
                </span>
                ＋
              </button>
            )}
          >
            {() => (
              <div style={{ padding: 14, width: 340 }}>
                <strong>Colaboradores</strong>
                <div style={{ marginTop: 10 }}>
                  <Collaborators projectId={id} onLeft={() => browser.navigate("/")} />
                </div>
              </div>
            )}
          </Menu>
          {project.appUrl && (
            <a className="btn sm" href={project.appUrl} target="_blank" rel="noreferrer" title="Abrir la app en vivo">
              <External /> En vivo
            </a>
          )}
          <div className="split-btn">
            <button className={`sm ${drawer ? "" : "primary"}`} style={{ height: 32 }} onClick={toggleDrawer} title="Chat con el constructor">
              ✦ {drawer ? "Ocultar chat" : "Editar"}
            </button>
            <Menu
              align="right"
              button={(_, toggle) => (
                <button className={`sm ${drawer ? "" : "primary"}`} style={{ height: 32 }} aria-label="Otros agentes" onClick={toggle}>
                  ▾
                </button>
              )}
            >
              {(close) => (
                <>
                  <div className="menu-label">Constructor integrado</div>
                  <MenuItem
                    onClick={() => {
                      close();
                      setView("preview");
                      showChat();
                    }}
                  >
                    ✦ Abrir el chat aquí
                  </MenuItem>
                  <div className="menu-sep" />
                  <div className="menu-label">¿Usas otro agente?</div>
                  <MenuItem onClick={() => (close(), void copyText(`Ayúdame a hacer cambios en mi proyecto de Forja ${project.id}: `))}>⧉ Copiar prompt para Claude o ChatGPT</MenuItem>
                  <MenuItem onClick={() => (close(), browser.navigate("/account"))}>＋ Conectar un agente por MCP…</MenuItem>
                </>
              )}
            </Menu>
          </div>
          <div className="menu-anchor" ref={publishRef}>
            <button className="primary sm" style={{ height: 32 }} onClick={() => setPanel(panel === "publish" ? null : "publish")}>
              ⇪ {publishLabel}
            </button>
            {panel === "publish" && <PublishPanel project={project} onDone={load} onClose={closePanel} />}
          </div>
        </header>
        {view === "preview" && (
          <div className="tool-row">
            <div className="menu-anchor" ref={checkpointRef}>
              <button className={`tool ${panel === "checkpoints" ? "on" : ""}`} onClick={() => setPanel(panel === "checkpoints" ? null : "checkpoints")}>
                ⚑ Checkpoint
              </button>
              {panel === "checkpoints" && <CheckpointPanel projectId={id} reloadKey={filesKey} onClose={closePanel} myEmail={me.email} />}
            </div>
            <button className={`tool ${selecting ? "on" : ""}`} onClick={toggleSelect} title="Elige un elemento de la vista previa para pedir un cambio sobre él">
              ⌖ Seleccionar
            </button>
            <button
              className={`tool ${editingText ? "on" : ""}`}
              aria-pressed={editingText}
              onClick={toggleEditText}
              title="Haz clic en un texto de la vista previa y reescríbelo. Se guarda sin gastar créditos cuando el texto está en el código."
            >
              <span style={{ fontFamily: "Georgia, serif", fontWeight: 700 }}>T</span> Editar texto
            </button>
            <Menu
              button={(_, toggle) => (
                <button className="tool" onClick={toggle}>
                  ▭ {DEVICES[device].label} ▾
                </button>
              )}
            >
              {(close) =>
                (Object.keys(DEVICES) as Device[]).map((d) => (
                  <MenuItem key={d} checked={device === d} onClick={() => (close(), setDevice(d))}>
                    <span>
                      {DEVICES[d].label} <span className="small muted">{DEVICES[d].hint}</span>
                    </span>
                  </MenuItem>
                ))
              }
            </Menu>
            {selecting && <span className="small muted">Haz clic en un elemento de la vista previa · Esc para cancelar</span>}
            {editingText && <span className="small muted">Haz clic en un texto y escribe · Enter guarda · Esc cancela</span>}
          </div>
        )}
        {view === "preview" && (
          <nav className="mobile-pane-tabs" aria-label="Espacio de trabajo">
            <button className={mobilePane === "chat" ? "on" : ""} aria-pressed={mobilePane === "chat"} onClick={showChat}>
              ✦ Chat
            </button>
            <button
              className={mobilePane === "preview" ? "on" : ""}
              aria-pressed={mobilePane === "preview"}
              onClick={() => setMobilePane("preview")}
            >
              ▭ Vista previa
            </button>
          </nav>
        )}
      </div>

      <div className={`ws-body ${mobilePane === "chat" ? "mobile-chat" : "mobile-preview"}`}>
        {drawer ? (
          <aside className="drawer">
            <div className="drawer-head">
              <strong className="grow">
                <span className="drawer-mark" aria-hidden>
                  ✦
                </span>{" "}
                Constructor
              </strong>
              <span className="credits-pill" title="Créditos de la cuenta dueña">
                ◎ {me.credits.toLocaleString()}
              </span>
              <button className="sm icon-btn ghost" aria-label="Cerrar chat" onClick={toggleDrawer}>
                ×
              </button>
            </div>
            <Chat
              projectId={id}
              onBuildingChange={setBuilding}
              selection={selection}
              onClearSelection={() => setSelection(null)}
              onSelectElement={() => {
                setView("preview");
                if (!selecting) toggleSelect();
              }}
              onOpenDetails={(d) => {
                setDetail(d);
                setView("details");
              }}
              onRestored={() => preview.current?.reload()}
              insert={insert}
              problems={problems}
              fixNonce={fixNonce}
              outbox={outbox}
              reloadKey={chatKey}
              onTurnEnd={() => {
                void load();
                void loadUsed();
                onCredits();
              }}
            />
          </aside>
        ) : (
          <div />
        )}
        <section style={{ minWidth: 0, minHeight: 0, display: "grid", position: "relative" }}>
          {/* The preview stays mounted while other views are open, so it does not reload. */}
          <div style={{ display: view === "preview" ? "grid" : "none", minHeight: 0 }}>
            <PreviewCanvas
              ref={preview}
              project={project}
              device={device}
              fullscreen={fullscreen}
              onPath={setPath}
              onSelected={onSelected}
              onSelectEnded={onSelectEnded}
              onFix={onFix}
              onTextEdit={onTextEdit}
              onEditEnded={onEditEnded}
            />
          </div>
          {notice && (
            <div className={`toast ${notice.tone ?? ""}`} role="status">
              <span>{notice.text}</span>
              {notice.action && (
                <button
                  className="sm"
                  onClick={() => {
                    notice.action!.run();
                    setNotice(null);
                  }}
                >
                  {notice.action.label}
                </button>
              )}
              <button className="sm ghost icon-btn" style={{ height: 24, width: 24 }} aria-label="Cerrar aviso" onClick={() => setNotice(null)}>
                ×
              </button>
            </div>
          )}
          {view === "services" && (
            <div className="services">
              <nav className="svc-nav" aria-label="Herramientas del proyecto">
                <div className="svc-nav-head">
                  <strong>Herramientas</strong>
                  <span className="count">{visibleServices.length + Number(showCode)}</span>
                </div>
                <label className="svc-search">
                  <span className="sr-only">Buscar herramientas</span>
                  <input
                    type="search"
                    placeholder="Buscar herramientas…"
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                  />
                </label>
                <div className="svc-nav-items">
                  {visibleServices.map((s, i) => (
                    <Fragment key={s.key}>
                      {i > 0 && isUsed(visibleServices[i - 1]!.key) && !isUsed(s.key) && <div className="sep" />}
                      <button
                        className={`${service === s.key ? "on" : ""} ${isUsed(s.key) ? "" : "unused"}`}
                        aria-current={service === s.key ? "page" : undefined}
                        onClick={() => setService(s.key)}
                      >
                        <span className="svc-icon" aria-hidden>{s.icon}</span>
                        <span className="svc-label">{s.label}</span>
                        {s.key === "logs" && errors > 0 && <span className="pill err svc-count">{errors}</span>}
                      </button>
                    </Fragment>
                  ))}
                  {visibleServices.length > 0 && showCode && <div className="sep" />}
                  {showCode && (
                    <>
                      <div className="menu-label">Avanzado</div>
                      <button className={service === "code" ? "on" : ""} aria-current={service === "code" ? "page" : undefined} onClick={() => setService("code")}>
                        <span className="svc-icon" aria-hidden>{"{}"}</span>
                        <span className="svc-label">Código</span>
                      </button>
                    </>
                  )}
                  {visibleServices.length === 0 && !showCode && <div className="svc-no-results">No hay herramientas que coincidan.</div>}
                </div>
              </nav>
              <div className={`svc-detail ${["data", "docs", "storage", "code"].includes(service) ? "" : "pad"}`}>
                {service === "data" && <DataPanel projectId={id} projectName={project.name} reloadKey={filesKey} />}
                {service === "users" && <UsersPanel projectId={id} />}
                {service === "ai" && <AiPanel project={project} onChange={load} />}
                {service === "integrations" && <IntegrationsPanel projectId={id} reloadKey={filesKey} />}
                {service === "analytics" && <AnalyticsPanel project={project} />}
                {service === "seo" && <SeoPanel project={project} onChange={load} />}
                {service === "docs" && <DocsPanel projectId={id} reloadKey={filesKey} />}
                {service === "jobs" && <JobsPanel projectId={id} reloadKey={filesKey} />}
                {service === "storage" && <StoragePanel projectId={id} reloadKey={filesKey} />}
                {service === "email" && <EmailPanel project={project} onChange={load} />}
                {service === "payments" && <PaymentsPanel projectId={id} />}
                {service === "logs" && <LogsPanel projectId={id} lines={logLines} />}
                {service === "security" && (
                  <SecurityPanel
                    projectId={id}
                    reloadKey={filesKey}
                    building={building}
                    onFix={(text) => {
                      showChat();
                      setOutbox((o) => ({ nonce: (o?.nonce ?? 0) + 1, text }));
                    }}
                  />
                )}
                {service === "code" && <CodePanel key={codeFile ?? ""} projectId={id} reloadKey={filesKey} initialPath={codeFile} />}
              </div>
            </div>
          )}
          {view === "settings" && <ProjectSettings project={project} onChange={load} />}
          {view === "details" && detail && (
            <TurnDetails
              projectId={id}
              detail={detail}
              reloadKey={filesKey}
              onBack={closeDetails}
              onOpenFile={(file) => {
                setCodeFile(file);
                openService("code");
              }}
              onMention={(file) => {
                if (!drawer) toggleDrawer();
                setInsert({ text: `@${file} `, nonce: Date.now() });
              }}
            />
          )}
        </section>
      </div>
      {palette && (
        <PagePalette
          projectId={id}
          onClose={() => setPalette(false)}
          onPage={(p) => {
            setView("preview");
            setPath(p);
            preview.current?.navigate(p);
          }}
          onComponent={(file) => {
            setCodeFile(file);
            openService("code");
          }}
        />
      )}
    </div>
  );
}
