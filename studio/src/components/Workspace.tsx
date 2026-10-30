import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { api, timeAgo, type Project } from "../api";
import { DeleteDialog } from "../pages/Dashboard";
import { go } from "../router";
import type { SelectedElement } from "./Chat";
import { Avatar, copyText, Modal, Switch } from "./ui";
import { ProjectModels } from "./Models";

// --- Preview canvas -----------------------------------------------------------------------

export const DEVICES = {
  desktop: { label: "Escritorio", hint: "Ancho completo", w: 0, h: 0 },
  iphone: { label: "iPhone", hint: "393 × 852", w: 393, h: 852 },
  pixel: { label: "Pixel", hint: "412 × 915", w: 412, h: 915 },
  ipad: { label: "iPad", hint: "820 × 1180", w: 820, h: 1180 },
  responsive: { label: "Responsive", hint: "Arrastra para ajustar", w: 0, h: 0 },
} as const;
export type Device = keyof typeof DEVICES;

export interface PreviewHandle {
  navigate(path: string): void;
  reload(): void;
  setSelecting(on: boolean): void;
}

const LOADING_STEPS = ["Preparando el entorno", "Compilando la app", "Cargando la vista previa"];

/**
 * The live preview in a cross-origin iframe. It talks to the app's injected preview
 * script by postMessage: the app reports its path and selected elements; the studio
 * asks it to navigate or to enter select mode.
 */
export const PreviewCanvas = forwardRef<
  PreviewHandle,
  { project: Project; device: Device; fullscreen: boolean; onPath: (p: string) => void; onSelected: (el: SelectedElement) => void; onSelectEnded: () => void }
>(function PreviewCanvas({ project, device, fullscreen, onPath, onSelected, onSelectEnded }, ref) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [nonce, setNonce] = useState(0);
  const [step, setStep] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const origin = project.previewOrigin;
  const share = new URL(project.previewUrl).searchParams.get("share");
  const [startPath, setStartPath] = useState("/");

  const post = (msg: unknown) => frame.current?.contentWindow?.postMessage(msg, origin);
  useImperativeHandle(ref, () => ({
    navigate: (path) => (loaded ? post({ type: "forja:navigate", path }) : setStartPath(path)),
    reload: () => {
      setLoaded(false);
      setNonce((n) => n + 1);
    },
    setSelecting: (on) => post({ type: "forja:select", on }),
  }));

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== origin || e.source !== frame.current?.contentWindow) return;
      const m = e.data ?? {};
      if (m.type === "forja:path") onPath(m.path);
      if (m.type === "forja:selected") onSelected(m.element);
      if (m.type === "forja:select-ended") onSelectEnded();
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [origin, onPath, onSelected, onSelectEnded]);

  useEffect(() => {
    if (loaded) return;
    setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)), 600);
    return () => clearInterval(t);
  }, [loaded, nonce]);

  const d = DEVICES[device];
  const src = `${origin}${startPath}?share=${share}`;
  const iframe = (
    <iframe
      key={nonce}
      ref={frame}
      title="Vista previa"
      src={src}
      onLoad={() => setLoaded(true)}
      style={
        device === "desktop" || fullscreen
          ? { width: "100%", height: "100%" }
          : device === "responsive"
            ? { width: "100%", height: "100%", borderRadius: 12 }
            : { width: d.w, height: d.h, maxHeight: "100%", borderRadius: 24, border: "8px solid #111827" }
      }
    />
  );
  return (
    <div className={`canvas ${fullscreen ? "fullscreen" : ""}`} style={device === "desktop" && !fullscreen ? { padding: 10 } : undefined}>
      {device === "responsive" && !fullscreen ? (
        <div className="responsive-frame" style={{ width: 720 }}>
          {iframe}
        </div>
      ) : (
        iframe
      )}
      {!loaded && (
        <div className="loading-card">
          <div className="card">
            <div style={{ textAlign: "center" }}>
              <span className="spinner" style={{ width: 22, height: 22, color: "var(--accent)" }} />
            </div>
            <strong style={{ textAlign: "center" }}>Preparando vista previa</strong>
            {LOADING_STEPS.map((s, i) => (
              <div key={s} className={`loading-step ${i < step ? "done" : i === step ? "now" : ""}`}>
                {i < step ? "✓" : i === step ? "●" : "○"} {s}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

// --- Checkpoint timeline --------------------------------------------------------------------

interface Change {
  id: number;
  kind: string;
  paths: string[];
  author: string;
  label: string | null;
  description: string | null;
  actor: string | null;
  createdAt: string;
}

const KIND_LABEL: Record<string, (c: Change) => string> = {
  create: () => "Creó un archivo",
  edit: () => "Editó un archivo",
  delete: () => "Borró un archivo",
  rename: () => "Movió un archivo",
  restore: (c) => c.label ?? "Restauración",
  checkpoint: (c) => c.label ?? "Checkpoint",
  publish: () => "App publicada",
};
const AUTHOR: Record<string, string> = { builder: "Constructor", owner: "Tú", mcp: "Agente MCP", system: "Forja" };
const ICON: Record<string, string> = { create: "＋", edit: "✎", delete: "−", rename: "⇄", restore: "↺", checkpoint: "⚑", publish: "🚀" };

export function CheckpointPanel({ projectId, reloadKey, onClose, myEmail }: { projectId: string; reloadKey: number; onClose: () => void; myEmail: string }) {
  const [changes, setChanges] = useState<Change[] | null>(null);
  const [onlyNamed, setOnlyNamed] = useState(false);
  const [naming, setNaming] = useState(false);
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const load = () => api<{ changes: Change[] }>(`/projects/${projectId}/changes`).then((r) => setChanges(r.changes));
  useEffect(() => {
    void load();
  }, [projectId, reloadKey]);

  const shown = (changes ?? []).filter((c) => !onlyNamed || ["checkpoint", "publish", "restore"].includes(c.kind));
  return (
    <div className="panel-pop" style={{ left: 0 }}>
      <div className="row" style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--surface)", zIndex: 1 }}>
        <strong className="grow">Checkpoints</strong>
        <button className={`sm icon-btn ${onlyNamed ? "primary" : "ghost"}`} title="Solo checkpoints con nombre" onClick={() => setOnlyNamed((v) => !v)}>
          ⚑
        </button>
        <button className="sm icon-btn ghost" title="Guardar un checkpoint" onClick={() => setNaming((v) => !v)}>
          ＋
        </button>
        <button className="sm icon-btn ghost" aria-label="Cerrar" onClick={onClose}>
          ×
        </button>
      </div>
      {naming && (
        <div className="stack" style={{ padding: 12, gap: 8, borderBottom: "1px solid var(--border)" }}>
          <input autoFocus placeholder="Nombre (p. ej. «antes del rediseño»)" value={label} onChange={(e) => setLabel(e.target.value)} />
          <textarea rows={2} placeholder="Descripción (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <button
            className="primary sm"
            disabled={!label.trim()}
            onClick={async () => {
              await api(`/projects/${projectId}/checkpoints`, { body: { label, description } });
              setLabel("");
              setDescription("");
              setNaming(false);
              void load();
            }}
          >
            Guardar checkpoint
          </button>
        </div>
      )}
      {!changes ? (
        <div className="empty">
          <span className="spinner" />
        </div>
      ) : shown.length === 0 ? (
        <div className="empty small">Aún no hay cambios registrados. Cada edición del constructor, de un agente MCP o tuya aparecerá aquí.</div>
      ) : (
        shown.map((c, i) => (
          <div key={c.id} className={`timeline-item ${c.kind}`}>
            <span className="ico">{ICON[c.kind] ?? "•"}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 500, fontSize: 13 }}>{(KIND_LABEL[c.kind] ?? (() => c.kind))(c)}</div>
              {c.description && <div className="small muted clamp">{c.description}</div>}
              {c.paths.length > 0 && c.kind !== "restore" && <div className="paths">{c.paths.join(", ")}</div>}
              <div className="small muted">
                {c.author === "owner" && c.actor && c.actor !== myEmail ? c.actor : (AUTHOR[c.author] ?? c.author)} · {timeAgo(c.createdAt)}
              </div>
            </div>
            {i > 0 && !onlyNamed ? (
              <button
                className="sm icon-btn ghost"
                title="Restaurar el código a este punto"
                onClick={async () => {
                  if (!confirm("¿Restaurar el código a este punto? Los datos de la app no cambian, y puedes deshacerlo desde aquí.")) return;
                  await api(`/projects/${projectId}/changes/${c.id}/restore`, { body: {} });
                  void load();
                }}
              >
                ↺
              </button>
            ) : (
              <span />
            )}
          </div>
        ))
      )}
    </div>
  );
}

// --- Page palette (Ctrl/Cmd+K) --------------------------------------------------------------

/** Same mapping the bundler uses: pages/posts.$id.tsx → /posts/:id. */
export function pagePattern(file: string) {
  const name = file.replace(/^pages\//, "").replace(/\.tsx$/, "");
  const segs = name
    .split(".")
    .filter((s) => s !== "_index")
    .map((s) => (s.startsWith("$") ? `:${s.slice(1)}` : s));
  return "/" + segs.join("/");
}

export function PagePalette({ projectId, onPage, onComponent, onClose }: { projectId: string; onPage: (path: string) => void; onComponent: (file: string) => void; onClose: () => void }) {
  const [files, setFiles] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  useEffect(() => {
    api<{ files: { path: string }[] }>(`/projects/${projectId}/files`).then((r) => setFiles(r.files.map((f) => f.path)));
  }, [projectId]);
  const items = useMemo(() => {
    const pages = files
      .filter((f) => /^pages\/[^/]+\.tsx$/.test(f) && !/\.(module|example)/.test(f) && (!f.includes("/_") || f.endsWith("/_index.tsx")))
      .map((f) => ({ kind: "page" as const, file: f, label: f === "pages/_index.tsx" ? "Inicio" : pagePattern(f), path: pagePattern(f) }));
    // Examples render each state of a component or page side by side in the preview.
    const examples = files
      .filter((f) => /^(components|pages)\/.+\.example\.tsx$/.test(f))
      .map((f) => ({ kind: "example" as const, file: f, label: f.replace(/^(components|pages)\/|\.example\.tsx$/g, ""), path: `/__examples/${f.replace(/\.tsx$/, "")}` }));
    const comps = files
      .filter((f) => /^components\/.+\.tsx$/.test(f) && !f.includes(".example."))
      .map((f) => ({ kind: "component" as const, file: f, label: f.replace(/^components\/|\.tsx$/g, ""), path: "" }));
    return [...pages, ...examples, ...comps].filter((i) => !q || `${i.label} ${i.file}`.toLowerCase().includes(q.toLowerCase()));
  }, [files, q]);
  const choose = (i: (typeof items)[number]) => {
    if (i.kind === "example") onPage(i.path);
    else if (i.kind === "page") {
      // Pages with params need a real value; ask for it once.
      let path = i.path;
      if (path.includes(":")) {
        const filled = prompt(`Ruta con parámetros (${path}):`, path.replace(/:(\w+)/g, "1"));
        if (!filled) return;
        path = filled;
      }
      onPage(path);
    } else onComponent(i.file);
    onClose();
  };
  return (
    <Modal onClose={onClose} className="palette">
      <input
        autoFocus
        placeholder="Escribe un nombre…"
        value={q}
        onChange={(e) => (setQ(e.target.value), setActive(0))}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") (e.preventDefault(), setActive((a) => Math.min(a + 1, items.length - 1)));
          if (e.key === "ArrowUp") (e.preventDefault(), setActive((a) => Math.max(a - 1, 0)));
          if (e.key === "Enter" && items[active]) choose(items[active]);
        }}
      />
      <div className="results">
        {items.length === 0 && <div className="empty">Sin resultados</div>}
        {(["page", "example", "component"] as const).map((kind) => {
          const group = items.filter((i) => i.kind === kind);
          if (!group.length) return null;
          return (
            <div key={kind}>
              <div className="menu-label">{kind === "page" ? "Páginas" : kind === "example" ? "Ejemplos · cada estado lado a lado" : "Componentes · abre el código"}</div>
              {group.map((i) => (
                <button key={i.file} className={`item ${items.indexOf(i) === active ? "on" : ""}`} onMouseEnter={() => setActive(items.indexOf(i))} onClick={() => choose(i)}>
                  <span style={{ width: 16, textAlign: "center" }}>{kind === "page" ? "▭" : kind === "example" ? "◫" : "⬡"}</span>
                  {i.label}
                  <span className="small muted" style={{ marginLeft: "auto", fontFamily: "var(--mono)" }}>
                    {i.file}
                  </span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

// --- Publish panel ---------------------------------------------------------------------------

export function PublishPanel({ project, onDone, onClose }: { project: Project; onDone: () => void; onClose: () => void }) {
  const [slug, setSlug] = useState(project.slug ?? project.suggestedSlug);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const host = new URL(project.previewOrigin).host.replace(/^pv-[^.]+\./, "");
  const state = !project.slug ? "draft" : project.hasUnpublishedChanges ? "behind" : "live";

  return (
    <div className="panel-pop right stack" style={{ padding: 16, gap: 12, width: 380 }}>
      <div className="row">
        <strong className="grow">Publicar</strong>
        <button className="sm icon-btn ghost" aria-label="Cerrar" onClick={onClose}>
          ×
        </button>
      </div>
      {state !== "draft" && (
        <div className="card" style={{ padding: 10, boxShadow: "none", display: "grid", gap: 4 }}>
          <div className="row small">
            <span className="live-dot" />
            <a className="grow" href={project.appUrl ?? "#"} target="_blank" rel="noreferrer" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
              {project.appUrl?.replace(/\?.*$/, "")}
            </a>
          </div>
          <div className="small muted">
            {state === "behind" ? "Hay cambios en la vista previa que aún no están en vivo." : "La versión en vivo está al día."}{" "}
            {project.publishedAt && `Publicada ${timeAgo(project.publishedAt)}.`}
          </div>
        </div>
      )}
      <label>
        Dirección
        <div className="row" style={{ gap: 4 }}>
          <input value={slug} disabled={!!project.slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} />
          <span className="muted small" style={{ whiteSpace: "nowrap" }}>
            .{host}
          </span>
        </div>
      </label>
      <div className="row-setting">
        <div>
          <div style={{ fontWeight: 500, fontSize: 13 }}>Publicación privada</div>
          <div className="small muted">Solo quien tenga el enlace con token puede abrirla.</div>
        </div>
        <Switch
          on={project.visibility === "private"}
          label="Publicación privada"
          onChange={async (on) => {
            await api(`/projects/${project.id}`, { method: "PATCH", body: { visibility: on ? "private" : "public" } });
            onDone();
          }}
        />
      </div>
      <div className="small muted">Se publica el código actual. La base de datos es la misma que en la vista previa; las tareas programadas corren con esta versión.</div>
      {error && <div className="error-box" style={{ maxHeight: 180, overflow: "auto" }}>{error}</div>}
      <div className="row">
        {project.slug && (
          <button
            className="sm danger"
            onClick={async () => {
              if (!confirm("¿Despublicar? La app dejará de estar en línea.")) return;
              await api(`/projects/${project.id}/unpublish`, { body: {} });
              onDone();
            }}
          >
            Despublicar
          </button>
        )}
        <div className="grow" />
        <button
          className="primary"
          disabled={busy || !slug || state === "live"}
          onClick={async () => {
            setBusy(true);
            setError("");
            try {
              await api(`/projects/${project.id}/publish`, { body: { slug } });
              onDone();
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? <span className="spinner" /> : state === "draft" ? "Publicar" : state === "behind" ? "Publicar cambios" : "Publicada ✓"}
        </button>
      </div>
    </div>
  );
}

// --- Collaborators ---------------------------------------------------------------------------

interface Members {
  owner: { email?: string; name?: string | null };
  members: { accountId: string; email: string; name: string | null; createdAt: string }[];
  invites: { email: string; createdAt: string }[];
  access: "owner" | "editor";
}

export function Collaborators({ projectId, onLeft }: { projectId: string; onLeft?: () => void }) {
  const [data, setData] = useState<Members | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = () => api<Members>(`/projects/${projectId}/members`).then(setData);
  useEffect(() => {
    void load();
  }, [projectId]);
  if (!data) return <span className="spinner" />;
  const isOwner = data.access === "owner";
  const Person = ({ email, name, tag, action }: { email: string; name?: string | null; tag: string; action?: React.ReactNode }) => (
    <div className="row" style={{ padding: "6px 0" }}>
      <span className="mini-avatar" style={{ background: "#64748b" }}>
        {(name || email).slice(0, 1).toUpperCase()}
      </span>
      <div className="grow" style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" }}>{name || email}</div>
        {name && <div className="small muted">{email}</div>}
      </div>
      <span className="pill">{tag}</span>
      {action}
    </div>
  );
  return (
    <div className="stack" style={{ gap: 8 }}>
      <Person email={data.owner.email ?? ""} name={data.owner.name} tag="Dueña" />
      {data.members.map((m) => (
        <Person
          key={m.accountId}
          email={m.email}
          name={m.name}
          tag="Editor"
          action={
            isOwner && (
              <button className="sm ghost danger" onClick={() => api(`/projects/${projectId}/members/${encodeURIComponent(m.email)}`, { method: "DELETE" }).then(load)}>
                Quitar
              </button>
            )
          }
        />
      ))}
      {data.invites.map((i) => (
        <Person
          key={i.email}
          email={i.email}
          tag="Invitación pendiente"
          action={
            isOwner && (
              <button className="sm ghost danger" onClick={() => api(`/projects/${projectId}/members/${encodeURIComponent(i.email)}`, { method: "DELETE" }).then(load)}>
                Cancelar
              </button>
            )
          }
        />
      ))}
      {isOwner ? (
        <>
          <div className="row">
            <input type="email" placeholder="correo@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button
              className="primary"
              disabled={!email.trim()}
              onClick={async () => {
                setError("");
                try {
                  const r = await api<{ joined: boolean }>(`/projects/${projectId}/members`, { body: { email } });
                  setNotice(r.joined ? `${email} ya puede abrir el proyecto.` : `Invitación guardada: ${email} entrará al iniciar sesión con ese correo.`);
                  setEmail("");
                  void load();
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Invitar
            </button>
          </div>
          <div className="small muted">Los colaboradores pueden construir, probar y publicar. Los créditos de IA se cobran siempre a la cuenta dueña.</div>
        </>
      ) : (
        <button
          className="danger sm"
          style={{ justifySelf: "start" }}
          onClick={async () => {
            if (!confirm("¿Salir de este proyecto? Necesitarás otra invitación para volver.")) return;
            const me = await api<{ account: { id: string } }>("/me");
            await api(`/projects/${projectId}/members/${me.account.id}`, { method: "DELETE" });
            onLeft?.();
          }}
        >
          Salir del proyecto
        </button>
      )}
      {error && <div className="error-box">{error}</div>}
      {notice && <div className="small" style={{ color: "var(--ok)" }}>{notice}</div>}
    </div>
  );
}

// --- Icon & appearance -------------------------------------------------------------------------

const ICON_PATHS = ["static/icon.png", "static/icon.svg", "static/icon.webp", "static/icon.jpg"];
const MIME_OF: Record<string, string> = { png: "image/png", svg: "image/svg+xml", webp: "image/webp", jpg: "image/jpeg" };

/** The app's icon (favicon, home screen, manifest) and the installed app's theme color. */
function AppearanceSection({ project, onChange }: { project: Project; onChange: () => void }) {
  const [icon, setIcon] = useState<string | null>(null);
  const [theme, setTheme] = useState(project.seo?.themeColor ?? "#ffffff");
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const load = async () => {
    const files = (await api<{ files: { path: string }[] }>(`/projects/${project.id}/files`)).files.map((f) => f.path);
    const path = ICON_PATHS.find((p) => files.includes(p));
    if (!path) return setIcon(null);
    const { content } = await api<{ content: string }>(`/projects/${project.id}/file?path=${encodeURIComponent(path)}`);
    const mime = MIME_OF[path.split(".").pop()!]!;
    setIcon(content.startsWith("base64:") ? `data:${mime};base64,${content.slice(7)}` : `data:${mime};charset=utf-8,${encodeURIComponent(content)}`);
  };
  useEffect(() => {
    void load();
  }, [project.id]);

  return (
    <section className="card section">
      <h3>◈ Icono y apariencia</h3>
      <div className="row-setting">
        <div>
          <strong>Icono de la app</strong>
          <div className="small muted">Pestaña del navegador, pantalla de inicio del móvil y app instalable. PNG cuadrado de 512×512 o SVG.</div>
        </div>
        <div className="row">
          <div style={{ width: 48, height: 48, borderRadius: 12, border: "1px solid var(--border)", display: "grid", placeItems: "center", overflow: "hidden", background: "var(--surface-2)" }}>
            {icon ? <img src={icon} alt="Icono actual" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span className="small muted">—</span>}
          </div>
          <input
            ref={input}
            type="file"
            hidden
            accept=".png,.svg,.webp,.jpg,.jpeg"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setError("");
              try {
                const dataUrl = await new Promise<string>((res, rej) => {
                  const r = new FileReader();
                  r.onload = () => res(String(r.result));
                  r.onerror = () => rej(r.error);
                  r.readAsDataURL(file);
                });
                await api(`/projects/${project.id}/icon`, { body: { filename: file.name, dataUrl } });
                await load();
              } catch (err) {
                setError((err as Error).message);
              }
            }}
          />
          <button onClick={() => input.current?.click()}>{icon ? "Cambiar" : "Subir icono"}</button>
        </div>
      </div>
      <div className="row-setting">
        <div>
          <strong>Color del tema</strong>
          <div className="small muted">Color de la barra del sistema cuando la app se instala en el móvil.</div>
        </div>
        <div className="row">
          <input type="color" value={theme} onChange={(e) => setTheme(e.target.value)} style={{ width: 44, height: 34, padding: 2 }} aria-label="Color del tema" />
          <button
            disabled={theme === (project.seo?.themeColor ?? "#ffffff")}
            onClick={async () => {
              await api(`/projects/${project.id}`, { method: "PATCH", body: { seo: { ...project.seo, themeColor: theme } } });
              onChange();
            }}
          >
            Guardar
          </button>
        </div>
      </div>
      {project.appUrl && <div className="small muted">En el móvil, abre la app publicada y usa «Añadir a pantalla de inicio» para instalarla.</div>}
      {error && <div className="error-box">{error}</div>}
    </section>
  );
}

// --- Project settings ------------------------------------------------------------------------

export function ProjectSettings({ project, onChange }: { project: Project; onChange: () => void }) {
  const [name, setName] = useState(project.name);
  const [systemPrompt, setSystemPrompt] = useState(project.systemPrompt);
  const [designPrompt, setDesignPrompt] = useState(project.designPrompt);
  const [stats, setStats] = useState<{ files: number; linesOfCode: number; creditsUsed: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState("");
  const save = async (body: Partial<Project>) => {
    await api(`/projects/${project.id}`, { method: "PATCH", body });
    onChange();
  };
  useEffect(() => {
    api<{ files: number; linesOfCode: number; creditsUsed: number }>(`/projects/${project.id}/stats`).then((s) => setStats({ ...s, linesOfCode: -1 }));
  }, [project.id]);

  return (
    <div style={{ overflow: "auto", height: "100%" }}>
      <div className="settings">
        <section className="card section">
          <h3>▤ Proyecto</h3>
          <div className="row">
            <Avatar id={project.id} name={name || project.name} />
            <input value={name} onChange={(e) => setName(e.target.value)} />
            <button disabled={!name.trim() || name === project.name} onClick={() => save({ name: name.trim() })}>
              Guardar
            </button>
          </div>
          <div className="row-setting">
            <div>
              <strong>Compartir</strong>
              <div className="small muted">Un enlace de 7 días a la vista previa en vivo, sin iniciar sesión. Quien lo abra ve los datos reales de la app.</div>
            </div>
            <div className="row">
              <button
                onClick={async () => {
                  const r = await api<{ url: string }>(`/projects/${project.id}/share-link`, { body: { days: 7 } });
                  setCopied(await copyText(r.url));
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? "✓ Copiado" : "⧉ Copiar enlace (7 días)"}
              </button>
              {project.access !== "editor" && (
                <button
                  className="danger"
                  title="Invalida todos los enlaces de vista previa y de app privada compartidos hasta ahora"
                  onClick={async () => {
                    if (!confirm("¿Revocar todos los enlaces compartidos? Quien los tenga perderá el acceso; tú seguirás viendo la vista previa.")) return;
                    await api(`/projects/${project.id}/share-links/revoke`, { body: {} });
                    onChange();
                  }}
                >
                  Revocar enlaces
                </button>
              )}
            </div>
          </div>
          <div className="row-setting">
            <div>
              <strong>Copiar</strong>
              <div className="small muted">Duplica el proyecto (código, ajustes y base de datos) o descarga su código.</div>
            </div>
            <div className="row">
              <button
                disabled={busy === "dup"}
                onClick={async () => {
                  setBusy("dup");
                  const r = await api<{ project: Project }>(`/projects/${project.id}/duplicate`, { body: {} });
                  go(`/p/${r.project.id}`);
                }}
              >
                {busy === "dup" ? <span className="spinner" /> : "⧉ Duplicar"}
              </button>
              <a className="btn" href={`/api/projects/${project.id}/export-code`}>
                ⇩ Descargar código
              </a>
            </div>
          </div>
        </section>

        <AppearanceSection project={project} onChange={onChange} />

        <ProjectModels projectId={project.id} canEdit={project.access !== "editor"} />

        <section className="card section">
          <h3>✦ Instrucciones para la IA</h3>
          <label>
            <span style={{ color: "var(--text)", fontWeight: 500 }}>Instrucciones del proyecto</span>
            <span className="small">Los datos clave de tu proyecto. El constructor las lee en cada turno; cuanto más largas, más créditos gasta.</span>
            <textarea rows={6} value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} placeholder="Para quién es la app, reglas de negocio, tono…" />
          </label>
          <label>
            <span style={{ color: "var(--text)", fontWeight: 500 }}>Guía de diseño</span>
            <span className="small">Tus preferencias de estilo: colores, tipografía, densidad, referencias.</span>
            <textarea rows={5} value={designPrompt} onChange={(e) => setDesignPrompt(e.target.value)} placeholder="Minimalista, tonos cálidos, titulares con serifa…" />
          </label>
          <div className="row">
            <button
              className="primary"
              disabled={systemPrompt === project.systemPrompt && designPrompt === project.designPrompt}
              onClick={() => save({ systemPrompt, designPrompt })}
            >
              Guardar instrucciones
            </button>
          </div>
        </section>

        <section className="card section">
          <h3>☺ Colaboradores</h3>
          <Collaborators projectId={project.id} onLeft={() => go("/")} />
        </section>

        <section className="card section">
          <h3>◉ Visibilidad</h3>
          <div className="row-setting">
            <div>
              <strong>Publicación privada</strong>
              <div className="small muted">La app publicada solo abre con el enlace que incluye el token, como la vista previa.</div>
            </div>
            <Switch on={project.visibility === "private"} label="Publicación privada" onChange={(on) => save({ visibility: on ? "private" : "public" })} />
          </div>
        </section>

        <section className="card section">
          <h3>◔ Uso</h3>
          <div className="row-setting">
            <div>
              <strong>Líneas de código</strong>
              <div className="small muted">Total de líneas en páginas, componentes, endpoints, tareas y estilos.</div>
            </div>
            {stats && stats.linesOfCode >= 0 ? (
              <strong>
                {stats.linesOfCode.toLocaleString()} <span className="small muted">en {stats.files} archivos</span>
              </strong>
            ) : (
              <button onClick={() => api<{ files: number; linesOfCode: number; creditsUsed: number }>(`/projects/${project.id}/stats`).then(setStats)}>Calcular</button>
            )}
          </div>
          <div className="row-setting">
            <div>
              <strong>Créditos usados</strong>
              <div className="small muted">Constructor e IA de la app, desde siempre.</div>
            </div>
            <strong>{stats?.creditsUsed.toLocaleString() ?? "—"}</strong>
          </div>
        </section>

        <section
          className="card section"
          style={{ borderColor: "color-mix(in srgb, var(--err) 35%, var(--border))", display: project.access === "editor" ? "none" : undefined }}
        >
          <div className="row-setting">
            <div>
              <strong>Borrar proyecto</strong>
              <div className="small muted">Borra para siempre el código, la base de datos, los archivos y el historial.</div>
            </div>
            <button className="danger" onClick={() => setDeleting(true)}>
              Borrar proyecto
            </button>
          </div>
        </section>
      </div>
      {deleting && <DeleteDialog project={project} onClose={() => setDeleting(false)} onDone={() => go("/")} />}
    </div>
  );
}
