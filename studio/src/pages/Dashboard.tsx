import { useEffect, useMemo, useState } from "react";
import { api, timeAgo, type Folder, type Project } from "../api";
import { External, Send } from "../components/Icons";
import { Avatar, copyText, Menu, MenuItem, Modal } from "../components/ui";
import { go } from "../router";

const IDEAS = ["un CRM para mi agencia", "reservas para mi estudio de yoga", "un tablero de tareas para mi equipo", "un portal de clientes", "una tienda en línea", "un asistente con IA para mis documentos"];

type Status = "any" | "published" | "private" | "draft" | "archived";
type Sort = "opened" | "edited" | "name";

const STATUS_LABEL: Record<Status, string> = {
  any: "Cualquiera",
  published: "Publicada",
  private: "Publicada privada",
  draft: "Sin publicar",
  archived: "Archivada",
};
const SORT_LABEL: Record<Sort, string> = { opened: "Abierto recientemente", edited: "Editado recientemente", name: "Nombre A–Z" };

const stored = (k: string, d: string) => {
  try {
    return localStorage.getItem(k) ?? d;
  } catch {
    return d;
  }
};
const store = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* per-viewer convenience only */
  }
};

/** Cycles example ideas in the placeholder, like a cursor typing. */
function useTypingPlaceholder() {
  const [text, setText] = useState("");
  useEffect(() => {
    let i = 0;
    let j = 0;
    let deleting = false;
    const t = setInterval(() => {
      const idea = IDEAS[i % IDEAS.length]!;
      j += deleting ? -1 : 1;
      setText(idea.slice(0, j));
      if (!deleting && j >= idea.length + 12) deleting = true;
      if (deleting && j <= 0) {
        deleting = false;
        i++;
      }
    }, 70);
    return () => clearInterval(t);
  }, []);
  return `Constrúyeme ${text}`;
}

function statusOf(p: Project): Exclude<Status, "any"> {
  if (p.archived) return "archived";
  if (p.slug) return p.visibility === "private" ? "private" : "published";
  return "draft";
}

function StatusPill({ p }: { p: Project }) {
  const s = statusOf(p);
  const cls = s === "published" ? "ok" : s === "private" ? "accent" : s === "archived" ? "warn" : "";
  return <span className={`pill ${cls}`}>{s === "published" ? "● Publicada" : STATUS_LABEL[s]}</span>;
}

export function Dashboard() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [shared, setShared] = useState<Project[]>([]);
  const [tab, setTab] = useState<"mine" | "shared">("mine");
  const [folders, setFolders] = useState<Folder[]>([]);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState<string>("all");
  const [favorites, setFavorites] = useState(false);
  const [status, setStatus] = useState<Status>("any");
  const [sort, setSort] = useState<Sort>(stored("forja:sort", "opened") as Sort);
  const [view, setView] = useState<"grid" | "list">(stored("forja:view", "grid") as "grid" | "list");
  const [renaming, setRenaming] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [newFolder, setNewFolder] = useState(false);
  const placeholder = useTypingPlaceholder();

  const load = async () => {
    const [p, f] = await Promise.all([api<{ projects: Project[]; shared: Project[] }>("/projects"), api<{ folders: Folder[] }>("/folders")]);
    setProjects(p.projects);
    setShared(p.shared ?? []);
    setFolders(f.folders);
  };
  useEffect(() => {
    void load();
  }, []);

  const create = async () => {
    if (!prompt.trim()) return;
    setBusy(true);
    setError("");
    try {
      const { project } = await api<{ project: Project }>("/projects", { body: { prompt } });
      // The project view hands the idea to the builder when it opens.
      sessionStorage.setItem(`forja:first:${project.id}`, prompt);
      go(`/p/${project.id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  const patch = async (p: Project, body: Partial<Project>) => {
    await api(`/projects/${p.id}`, { method: "PATCH", body });
    await load();
  };

  const shown = useMemo(() => {
    let list = (tab === "mine" ? projects : shared) ?? [];
    if (search) list = list.filter((p) => `${p.name} ${p.description}`.toLowerCase().includes(search.toLowerCase()));
    if (folder === "none") list = list.filter((p) => !p.folderId);
    else if (folder !== "all") list = list.filter((p) => p.folderId === folder);
    if (favorites) list = list.filter((p) => p.favorite);
    // Archived projects only show when asked for.
    list = status === "any" ? list.filter((p) => !p.archived) : list.filter((p) => statusOf(p) === status);
    const by: Record<Sort, (a: Project, b: Project) => number> = {
      opened: (a, b) => b.lastOpenedAt.localeCompare(a.lastOpenedAt),
      edited: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return [...list].sort(by[sort]);
  }, [projects, shared, tab, search, folder, favorites, status, sort]);

  const favCount = (projects ?? []).filter((p) => p.favorite).length;
  const folderName = folder === "all" ? "Todas" : folder === "none" ? "Sin carpeta" : (folders.find((f) => f.id === folder)?.name ?? "Todas");

  const actions = (p: Project) =>
    tab === "shared" ? (
      <span className="pill accent" title="Proyecto de otra persona en el que colaboras">Compartido</span>
    ) : (
    <Menu
      align="right"
      button={(_, toggle) => (
        <button className="ghost icon-btn sm" title="Más acciones" aria-label="Más acciones" onClick={(e) => (e.stopPropagation(), toggle())}>
          ⋯
        </button>
      )}
    >
      {(close) => (
        <div onClick={(e) => e.stopPropagation()}>
          <MenuItem onClick={() => (close(), setRenaming(p))}>Renombrar</MenuItem>
          <MenuItem
            onClick={async () => {
              close();
              const r = await api<{ project: Project }>(`/projects/${p.id}/duplicate`, { body: {} });
              await load();
              go(`/p/${r.project.id}`);
            }}
          >
            Duplicar
          </MenuItem>
          <MenuItem onClick={() => (close(), void patch(p, { favorite: !p.favorite }))}>{p.favorite ? "Quitar de favoritos" : "Añadir a favoritos"}</MenuItem>
          <MenuItem onClick={() => (close(), void patch(p, { archived: !p.archived }))}>{p.archived ? "Desarchivar" : "Archivar"}</MenuItem>
          <div className="menu-sep" />
          <div className="menu-label">Mover a carpeta</div>
          <MenuItem checked={!p.folderId} onClick={() => (close(), void patch(p, { folderId: null }))}>
            Sin carpeta
          </MenuItem>
          {folders.map((f) => (
            <MenuItem key={f.id} checked={p.folderId === f.id} onClick={() => (close(), void patch(p, { folderId: f.id }))}>
              {f.name}
            </MenuItem>
          ))}
          <div className="menu-sep" />
          <MenuItem danger onClick={() => (close(), setDeleting(p))}>
            Borrar proyecto
          </MenuItem>
        </div>
      )}
    </Menu>
    );

  const links = (p: Project) => (
    <>
      {p.appUrl && (
        <a className="btn sm icon-btn" href={p.appUrl} target="_blank" rel="noreferrer" title="Abrir app en vivo" aria-label="Abrir app en vivo" onClick={(e) => e.stopPropagation()}>
          <External />
        </a>
      )}
      <button className="sm" title="Abrir en el constructor" onClick={(e) => (e.stopPropagation(), go(`/p/${p.id}?edit=1`))}>
        ✦ Editar
      </button>
    </>
  );

  return (
    <div className="page">
      <section style={{ padding: "8px 0 28px" }}>
        <div className="idea-bar">
          <span style={{ color: "var(--accent)" }}>✦</span>
          <input
            aria-label="Describe el proyecto que quieres crear"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => e.key === "Enter" && void create()}
          />
          <span className="small muted" style={{ whiteSpace: "nowrap" }}>
            Constructor incluido
          </span>
          <div className="split-btn">
            <button className="primary" disabled={!prompt.trim() || busy} onClick={create}>
              {busy ? <span className="spinner" /> : <Send />} Crear proyecto
            </button>
            <Menu
              align="right"
              button={(_, toggle) => (
                <button className="primary" aria-label="Más formas de construir" onClick={toggle}>
                  ▾
                </button>
              )}
            >
              {(close) => (
                <>
                  <MenuItem
                    disabled={!prompt.trim()}
                    onClick={async () => {
                      close();
                      await copyText(`Usa Forja para construir esta app: ${prompt}`);
                    }}
                  >
                    Copiar solo el prompt
                  </MenuItem>
                  <MenuItem onClick={() => (close(), go("/account"))}>Conectar Claude, ChatGPT o Cursor…</MenuItem>
                </>
              )}
            </Menu>
          </div>
        </div>
        {error && <div className="error-box" style={{ maxWidth: 760, margin: "12px auto 0" }}>{error}</div>}
      </section>

      <div className="segmented">
        <button className={tab === "mine" ? "on" : ""} onClick={() => setTab("mine")}>
          Tus proyectos <span className="count">{projects?.length ?? 0}</span>
        </button>
        <button className={tab === "shared" ? "on" : ""} onClick={() => (setTab("shared"), setFolder("all"), setFavorites(false))}>
          Compartidos contigo <span className="count">{shared.length}</span>
        </button>
      </div>

      <div className="filters">
        <input className="search" placeholder="Buscar proyectos…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Menu
          button={(_, toggle) => (
            <button className="chip-btn" onClick={toggle}>
              ▤ Carpeta: {folderName} ▾
            </button>
          )}
        >
          {(close) => (
            <>
              <MenuItem checked={folder === "all"} onClick={() => (close(), setFolder("all"))}>
                Todos los proyectos <span className="count">{projects?.length ?? 0}</span>
              </MenuItem>
              <MenuItem checked={folder === "none"} onClick={() => (close(), setFolder("none"))}>
                Sin carpeta <span className="count">{(projects ?? []).filter((p) => !p.folderId).length}</span>
              </MenuItem>
              {folders.map((f) => (
                <div key={f.id} className="row" style={{ gap: 0 }}>
                  <MenuItem checked={folder === f.id} onClick={() => (close(), setFolder(f.id))}>
                    {f.name} <span className="count">{(projects ?? []).filter((p) => p.folderId === f.id).length}</span>
                  </MenuItem>
                  <button
                    className="ghost sm icon-btn"
                    title="Borrar carpeta"
                    aria-label={`Borrar carpeta ${f.name}`}
                    onClick={async () => {
                      await api(`/folders/${f.id}`, { method: "DELETE" });
                      if (folder === f.id) setFolder("all");
                      await load();
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <div className="menu-sep" />
              <MenuItem onClick={() => (close(), setNewFolder(true))}>＋ Nueva carpeta…</MenuItem>
            </>
          )}
        </Menu>
        <button className={`chip-btn ${favorites ? "on" : ""}`} onClick={() => setFavorites((f) => !f)}>
          ☆ Favoritos <span className="count">{favCount}</span>
        </button>
        <Menu
          button={(_, toggle) => (
            <button className={`chip-btn ${status !== "any" ? "on" : ""}`} onClick={toggle}>
              ◈ Estado: {STATUS_LABEL[status]} ▾
            </button>
          )}
        >
          {(close) =>
            (Object.keys(STATUS_LABEL) as Status[]).map((s) => (
              <MenuItem key={s} checked={status === s} onClick={() => (close(), setStatus(s))}>
                {STATUS_LABEL[s]}
              </MenuItem>
            ))
          }
        </Menu>
        <Menu
          button={(_, toggle) => (
            <button className="chip-btn" onClick={toggle}>
              ⇅ {SORT_LABEL[sort]} ▾
            </button>
          )}
        >
          {(close) =>
            (Object.keys(SORT_LABEL) as Sort[]).map((s) => (
              <MenuItem key={s} checked={sort === s} onClick={() => (close(), setSort(s), store("forja:sort", s))}>
                {SORT_LABEL[s]}
              </MenuItem>
            ))
          }
        </Menu>
        <div className="segmented">
          <button className={view === "list" ? "on" : ""} aria-label="Vista de lista" onClick={() => (setView("list"), store("forja:view", "list"))}>
            ☰
          </button>
          <button className={view === "grid" ? "on" : ""} aria-label="Vista de cuadrícula" onClick={() => (setView("grid"), store("forja:view", "grid"))}>
            ▦
          </button>
        </div>
      </div>

      <div className="row small muted" style={{ marginBottom: 10 }}>
        <span className="grow">
          {shown.length} proyecto{shown.length === 1 ? "" : "s"}
        </span>
      </div>

      {projects === null ? (
        <div className="empty">
          <span className="spinner" />
        </div>
      ) : shown.length === 0 ? (
        <div className="card empty">
          {tab === "shared"
            ? "Nadie ha compartido proyectos contigo todavía."
            : projects.length
              ? "Ningún proyecto coincide con los filtros."
              : "Aún no tienes proyectos. Describe tu primera app arriba."}
        </div>
      ) : view === "grid" ? (
        <div className="projects-grid">
          {shown.map((p) => (
            <div key={p.id} className="card project-card">
              <div className="top" onClick={() => go(`/p/${p.id}`)}>
                <div className="row">
                  <StatusPill p={p} />
                  <button
                    className={`star ${p.favorite ? "on" : ""}`}
                    aria-label={p.favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                    onClick={(e) => (e.stopPropagation(), void patch(p, { favorite: !p.favorite }))}
                  >
                    {p.favorite ? "★" : "☆"}
                  </button>
                  <div className="grow" />
                  {actions(p)}
                </div>
                <div className="row">
                  <Avatar id={p.id} name={p.name} />
                  <div className="grow" style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div className="small muted clamp">{p.description || "Sin descripción"}</div>
                  </div>
                </div>
              </div>
              <div className="bottom">
                <span className="small muted grow">{timeAgo(p.lastOpenedAt)}</span>
                {links(p)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ overflow: "auto" }}>
          <table className="grid list-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Carpeta</th>
                <th>Abierto</th>
                <th>Dueño</th>
                <th>Enlaces</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p.id} onClick={() => go(`/p/${p.id}`)}>
                  <td>
                    <div className="row">
                      <Avatar id={p.id} name={p.name} size={24} />
                      <strong>{p.name}</strong>
                      {p.favorite && <span style={{ color: "#f59e0b" }}>★</span>}
                    </div>
                  </td>
                  <td>
                    <StatusPill p={p} />
                  </td>
                  <td>{folders.find((f) => f.id === p.folderId)?.name ?? "—"}</td>
                  <td>{timeAgo(p.lastOpenedAt)}</td>
                  <td>{tab === "shared" ? "Otra persona" : "Tú"}</td>
                  <td>
                    <div className="row" style={{ gap: 4 }}>
                      {links(p)}
                    </div>
                  </td>
                  <td style={{ textAlign: "right", overflow: "visible" }}>{actions(p)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {renaming && (
        <TextDialog
          title="Renombrar proyecto"
          initial={renaming.name}
          action="Guardar"
          onClose={() => setRenaming(null)}
          onSubmit={async (name) => {
            await patch(renaming, { name });
            setRenaming(null);
          }}
        />
      )}
      {newFolder && (
        <TextDialog
          title="Nueva carpeta"
          initial=""
          action="Crear"
          onClose={() => setNewFolder(false)}
          onSubmit={async (name) => {
            const r = await api<{ id: string }>("/folders", { body: { name } });
            setNewFolder(false);
            await load();
            setFolder(r.id);
          }}
        />
      )}
      {deleting && <DeleteDialog project={deleting} onClose={() => setDeleting(null)} onDone={load} />}
    </div>
  );
}

function TextDialog(props: { title: string; initial: string; action: string; onClose: () => void; onSubmit: (v: string) => Promise<void> }) {
  const [value, setValue] = useState(props.initial);
  return (
    <Modal onClose={props.onClose}>
      <h3>{props.title}</h3>
      <input autoFocus value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && value.trim() && void props.onSubmit(value.trim())} />
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <button onClick={props.onClose}>Cancelar</button>
        <button className="primary" disabled={!value.trim()} onClick={() => props.onSubmit(value.trim())}>
          {props.action}
        </button>
      </div>
    </Modal>
  );
}

export function DeleteDialog({ project, onClose, onDone }: { project: Project; onClose: () => void; onDone: () => void }) {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Modal onClose={onClose}>
      <h3>¿Borrar «{project.name}»?</h3>
      <p className="small muted" style={{ margin: 0 }}>
        Se borran para siempre el código, la base de datos, los archivos subidos y el historial. {project.slug && "La app publicada deja de estar en línea."}
      </p>
      <label>
        Escribe el nombre del proyecto para confirmar
        <input autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={project.name} />
      </label>
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <button onClick={onClose}>Cancelar</button>
        <button
          className="primary"
          style={{ background: "var(--err)", borderColor: "var(--err)" }}
          disabled={typed !== project.name || busy}
          onClick={async () => {
            setBusy(true);
            await api(`/projects/${project.id}`, { method: "DELETE" });
            onClose();
            onDone();
          }}
        >
          Borrar proyecto
        </button>
      </div>
    </Modal>
  );
}
