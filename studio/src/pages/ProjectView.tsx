import { useCallback, useEffect, useRef, useState } from "react";
import { api, type Project } from "../api";
import { UserMenu, type Me } from "../App";
import { TurnDetails, type TurnDetail } from "../components/Changes";
import { Chat, type SelectedElement } from "../components/Chat";
import type { Problem } from "../components/Problems";
import { External, Refresh } from "../components/Icons";
import { AiPanel, CodePanel, EmailPanel, JobsPanel, LogsPanel, UsersPanel } from "../components/Panels";
import { AnalyticsPanel, DataPanel, DocsPanel, IntegrationsPanel, PaymentsPanel, SeoPanel, StoragePanel } from "../components/ServicePanels";
import { Avatar, copyText, Menu, MenuItem, useDismiss } from "../components/ui";
import { CheckpointPanel, Collaborators, DEVICES, PagePalette, PreviewCanvas, ProjectSettings, PublishPanel, type Device, type PreviewHandle } from "../components/Workspace";

type View = "preview" | "services" | "settings" | "details";
type ServiceKey = "data" | "users" | "ai" | "integrations" | "analytics" | "seo" | "docs" | "jobs" | "storage" | "email" | "payments" | "logs" | "code";
type LogLine = { at: string; env: string; level: string; source: string; message: string };

const SERVICES: { key: ServiceKey; label: string; icon: string }[] = [
  { key: "data", label: "Datos", icon: "⛁" },
  { key: "users", label: "Usuarios", icon: "☺" },
  { key: "ai", label: "IA", icon: "✦" },
  { key: "integrations", label: "Integraciones", icon: "⚷" },
  { key: "analytics", label: "Analítica", icon: "▥" },
  { key: "seo", label: "SEO", icon: "◎" },
  { key: "docs", label: "Docs", icon: "▢" },
  { key: "jobs", label: "Tareas", icon: "◷" },
  { key: "storage", label: "Archivos", icon: "⇪" },
  { key: "email", label: "Correo", icon: "✉" },
  { key: "payments", label: "Pagos", icon: "¤" },
  { key: "logs", label: "Registros", icon: "≡" },
];
/** Always listed among the used ones. */
const ALWAYS_USED = new Set<ServiceKey>(["seo", "logs"]);

const readDrawer = () => {
  try {
    return localStorage.getItem("forja:drawer") !== "0";
  } catch {
    return true;
  }
};

export function ProjectView({ id, me, onCredits }: { id: string; me: Me; onCredits: () => void }) {
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");
  const [view, setView] = useState<View>("preview");
  const [service, setService] = useState<ServiceKey>("data");
  const [used, setUsed] = useState<Record<string, boolean>>({});
  const [filesKey, setFilesKey] = useState(0);
  const [logLines, setLogLines] = useState<LogLine[]>([]);
  const [building, setBuilding] = useState(false);
  const [drawer, setDrawer] = useState(() => readDrawer() || new URLSearchParams(location.search).has("edit") || !!sessionStorage.getItem(`forja:first:${id}`));
  const [device, setDevice] = useState<Device>("desktop");
  const [fullscreen, setFullscreen] = useState(false);
  const [path, setPath] = useState("/");
  const [selecting, setSelecting] = useState(false);
  const [selection, setSelection] = useState<SelectedElement | null>(null);
  const [panel, setPanel] = useState<"checkpoints" | "publish" | null>(null);
  const [palette, setPalette] = useState(false);
  const [codeFile, setCodeFile] = useState<string | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [fixNonce, setFixNonce] = useState(0);
  const [chatKey, setChatKey] = useState(0);
  const [detail, setDetail] = useState<TurnDetail | null>(null);
  const [insert, setInsert] = useState<{ text: string; nonce: number } | null>(null);
  const preview = useRef<PreviewHandle>(null);
  const closePanel = useCallback(() => setPanel(null), []);
  const closeDetails = useCallback(() => setView("preview"), []);
  const checkpointRef = useDismiss<HTMLDivElement>(panel === "checkpoints", closePanel);
  const publishRef = useDismiss<HTMLDivElement>(panel === "publish", closePanel);

  const load = () =>
    api<{ project: Project }>(`/projects/${id}`)
      .then((r) => setProject(r.project))
      .catch((e) => setError(e.message));
  const loadUsed = () => api<Record<string, boolean>>(`/projects/${id}/services`).then(setUsed).catch(() => {});

  useEffect(() => {
    void load();
    void loadUsed();
    void api<{ problems: Problem[] }>(`/projects/${id}/problems`).then((r) => setProblems(r.problems)).catch(() => {});
    const es = new EventSource(`/api/projects/${id}/events`);
    let t: ReturnType<typeof setTimeout>;
    es.onmessage = (m) => {
      const e = JSON.parse(m.data);
      if (e.type === "files") {
        clearTimeout(t);
        t = setTimeout(() => (setFilesKey((k) => k + 1), void load()), 400);
      } else if (e.type === "log") setLogLines((l) => [...l.slice(-300), e.entry]);
      else if (e.type === "published") void load();
      else if (e.type === "problems") setProblems(e.problems);
      else if (e.type === "github" && e.status === "pulled") setChatKey((k) => k + 1);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "p")) {
        e.preventDefault();
        setPalette(true);
      }
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      es.close();
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleDrawer = () => {
    setDrawer((d) => {
      try {
        localStorage.setItem("forja:drawer", d ? "0" : "1");
      } catch {
        /* per-viewer convenience only */
      }
      return !d;
    });
  };
  const toggleSelect = () => {
    const on = !selecting;
    setSelecting(on);
    preview.current?.setSelecting(on);
    if (on && !drawer) toggleDrawer();
  };
  const onSelected = useCallback((el: SelectedElement) => setSelection(el), []);
  const onSelectEnded = useCallback(() => setSelecting(false), []);
  const onFix = useCallback(() => {
    setDrawer(true);
    setFixNonce((n) => n + 1);
  }, []);
  const openService = (key: ServiceKey) => {
    setService(key);
    setView("services");
  };

  if (error) return <div className="empty">{error}</div>;
  if (!project) return <div className="empty">Cargando…</div>;

  const errors = logLines.filter((l) => l.level === "error").length;
  const isUsed = (k: ServiceKey) => ALWAYS_USED.has(k) || !!used[k];
  const ordered = [...SERVICES.filter((s) => isUsed(s.key)), ...SERVICES.filter((s) => !isUsed(s.key))];
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
                <button className="sm icon-btn ghost" title="Pantalla completa (Esc para salir)" onClick={() => setFullscreen(true)}>
                  ⛶
                </button>
                <button className="page-chip" title="Ir a una página (Ctrl+K)" onClick={() => setPalette(true)}>
                  ▭ {pageLabel} {project.appUrl && <span className="live-dot" title="Publicada" />} ▾
                </button>
                <button className="sm icon-btn ghost" title="Recargar" onClick={() => preview.current?.reload()}>
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
                  <Collaborators projectId={id} onLeft={() => (location.href = "/")} />
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
                  <MenuItem onClick={() => (close(), drawer || toggleDrawer())}>✦ Abrir el chat aquí</MenuItem>
                  <div className="menu-sep" />
                  <div className="menu-label">¿Usas otro agente?</div>
                  <MenuItem onClick={() => (close(), void copyText(`Ayúdame a hacer cambios en mi proyecto de Forja ${project.id}: `))}>⧉ Copiar prompt para Claude o ChatGPT</MenuItem>
                  <MenuItem onClick={() => (close(), (location.href = "/account"))}>＋ Conectar un agente por MCP…</MenuItem>
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
          </div>
        )}
      </div>

      <div className="ws-body">
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
        <section style={{ minWidth: 0, minHeight: 0, display: "grid" }}>
          {/* The preview stays mounted while other views are open, so it does not reload. */}
          <div style={{ display: view === "preview" ? "grid" : "none", minHeight: 0 }}>
            <PreviewCanvas ref={preview} project={project} device={device} fullscreen={fullscreen} onPath={setPath} onSelected={onSelected} onSelectEnded={onSelectEnded} onFix={onFix} />
          </div>
          {view === "services" && (
            <div className="services">
              <nav className="svc-nav">
                {ordered.map((s, i) => (
                  <div key={s.key} style={{ display: "contents" }}>
                    {i > 0 && isUsed(ordered[i - 1]!.key) && !isUsed(s.key) && <div className="sep" />}
                    <button className={`${service === s.key ? "on" : ""} ${isUsed(s.key) ? "" : "unused"}`} onClick={() => setService(s.key)}>
                      <span className="svc-icon">{s.icon}</span> {s.label}
                      {s.key === "logs" && errors > 0 && <span className="pill err" style={{ marginLeft: "auto", padding: "0 6px" }}>{errors}</span>}
                    </button>
                  </div>
                ))}
                <div className="sep" />
                <div className="menu-label">Avanzado</div>
                <button className={service === "code" ? "on" : ""} onClick={() => setService("code")}>
                  <span className="svc-icon">{"{}"}</span> Código
                </button>
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
