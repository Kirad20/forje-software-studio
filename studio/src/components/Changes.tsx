import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { copyText } from "./ui";
import { diffLines, hunks } from "../diff";

/** One file a chat turn touched, as the server's /turns/:id/changes returns it. */
export interface FileChange {
  path: string;
  kind: "create" | "edit" | "delete";
  before: string | null;
  after: string | null;
  omitted?: boolean;
}
interface TurnChanges {
  files: FileChange[];
  restoreTo: number | null;
  firstChange: number | null;
}

/** What the details view shows for a turn's timeline: its texts and tool steps, in order. */
export type TimelineEntry = { kind: "text"; text: string } | { kind: "step"; label: string; summary: string; ok: boolean } | { kind: "user"; text: string };

export interface TurnDetail {
  turnId: string;
  title: string;
  timeline: TimelineEntry[];
}

const cache = new Map<string, Promise<TurnChanges>>();

/** Loads a turn's changes once per (project, turn, reload) and shares the result between card and details. */
export function useTurnChanges(projectId: string, turnId: string | null, reloadKey = 0) {
  const [data, setData] = useState<TurnChanges | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!turnId) return;
    const key = `${projectId}:${turnId}:${reloadKey}`;
    if (!cache.has(key)) cache.set(key, api<TurnChanges>(`/projects/${projectId}/turns/${turnId}/changes`));
    let alive = true;
    cache
      .get(key)!
      .then((r) => alive && setData(r))
      .catch((e) => {
        cache.delete(key);
        if (alive) setError((e as Error).message);
      });
    return () => {
      alive = false;
    };
  }, [projectId, turnId, reloadKey]);
  return { data, error };
}

export function diffStats(f: FileChange) {
  if (f.omitted) return { add: 0, del: 0 };
  const lines = diffLines(f.before ?? "", f.after ?? "");
  return { add: lines.filter((l) => l.op === "+").length, del: lines.filter((l) => l.op === "-").length };
}

const KIND: Record<FileChange["kind"], string> = { create: "Creado", edit: "Editado", delete: "Borrado" };
const baseName = (p: string) => p.split("/").pop() ?? p;

// --- Change card (in the chat, after a turn that changed code) --------------------------------

export function ChangeCard({
  projectId,
  turnId,
  title,
  marked,
  onToggleMark,
  onDetails,
  onRestored,
  reloadKey,
}: {
  projectId: string;
  turnId: string;
  title: string;
  marked: boolean;
  onToggleMark: () => void;
  onDetails: () => void;
  onRestored: () => void;
  reloadKey: number;
}) {
  const { data, error } = useTurnChanges(projectId, turnId, reloadKey);
  const [restoring, setRestoring] = useState(false);
  const stats = useMemo(() => (data?.files ?? []).map((f) => ({ f, ...diffStats(f) })), [data]);
  if (data && data.files.length === 0) return null;
  const add = stats.reduce((n, s) => n + s.add, 0);
  const del = stats.reduce((n, s) => n + s.del, 0);
  return (
    <div className="change-card">
      <div className="change-head">
        <span className="change-ico" aria-hidden>
          ✎
        </span>
        <div className="grow" style={{ minWidth: 0 }}>
          <div className="change-title">{title}</div>
          <div className="small muted">
            {!data ? (error ? "No se pudieron cargar los cambios" : "Cargando cambios…") : `${data.files.length} ${data.files.length === 1 ? "archivo" : "archivos"}`}
            {data && (add > 0 || del > 0) && (
              <>
                {" · "}
                <span className="diff-add">+{add}</span> <span className="diff-del">−{del}</span>
              </>
            )}
          </div>
        </div>
        <button className={`ghost sm icon-btn ${marked ? "marked" : ""}`} aria-pressed={marked} aria-label={marked ? "Quitar marcador" : "Marcar"} title={marked ? "Quitar marcador" : "Marcar en el historial"} onClick={onToggleMark}>
          {marked ? "★" : "☆"}
        </button>
      </div>
      {stats.length > 0 && (
        <div className="change-files">
          {stats.slice(0, 4).map(({ f, add, del }) => (
            <span key={f.path} className={`file-chip ${f.kind}`} title={f.path}>
              {baseName(f.path)}
              {!f.omitted && (
                <span className="small">
                  {add > 0 && <span className="diff-add"> +{add}</span>}
                  {del > 0 && <span className="diff-del"> −{del}</span>}
                </span>
              )}
            </span>
          ))}
          {stats.length > 4 && <span className="file-chip more">+{stats.length - 4}</span>}
        </div>
      )}
      <div className="change-actions">
        <button className="sm" onClick={onDetails}>
          Detalles
        </button>
        <button
          className="sm ghost"
          disabled={!data || data.restoreTo === null || restoring}
          title="Devuelve el código a como estaba antes de este mensaje (los datos de la app no cambian)"
          onClick={async () => {
            if (!data?.restoreTo || !confirm("¿Restaurar el código a como estaba antes de este mensaje? Puedes deshacerlo desde Checkpoints.")) return;
            setRestoring(true);
            try {
              await api(`/projects/${projectId}/changes/${data.restoreTo}/restore`, { body: {} });
              onRestored();
            } finally {
              setRestoring(false);
            }
          }}
        >
          {restoring ? <span className="spinner" /> : "↺ Restaurar a antes"}
        </button>
      </div>
    </div>
  );
}

// --- Details view (fills the stage, like a commit page) ---------------------------------------

function FileDiff({ file, onOpen, onMention }: { file: FileChange; onOpen: () => void; onMention: () => void }) {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const rows = useMemo(() => (file.omitted ? [] : hunks(diffLines(file.before ?? "", file.after ?? ""))), [file]);
  const { add, del } = useMemo(() => diffStats(file), [file]);
  return (
    <section className="diff-file">
      <header className="diff-head">
        <button className="ghost sm icon-btn" aria-expanded={open} aria-label={open ? "Plegar" : "Desplegar"} onClick={() => setOpen((o) => !o)}>
          {open ? "▾" : "▸"}
        </button>
        <span className={`kind-tag ${file.kind}`}>{KIND[file.kind]}</span>
        <code className="grow diff-path" title={file.path}>
          {file.path}
        </code>
        {!file.omitted && (
          <span className="small">
            <span className="diff-add">+{add}</span> <span className="diff-del">−{del}</span>
          </span>
        )}
      </header>
      {open && (
        <>
          <div className="diff-tools">
            {file.kind !== "delete" && (
              <button className="sm" onClick={onOpen}>
                Ver archivo
              </button>
            )}
            <button className="sm" onClick={onMention}>
              Mencionar en el chat
            </button>
            <span className="grow" />
            {file.after !== null && !file.omitted && (
              <button
                className="sm ghost"
                title="Copiar el archivo"
                onClick={async () => {
                  setCopied(await copyText(file.after ?? ""));
                  setTimeout(() => setCopied(false), 1200);
                }}
              >
                {copied ? "✓ Copiado" : "⧉ Copiar"}
              </button>
            )}
          </div>
          {file.omitted ? (
            <div className="small muted" style={{ padding: "10px 14px" }}>
              Archivo binario o demasiado grande para mostrar las diferencias.
            </div>
          ) : (
            <div className="diff-body" role="table" aria-label={`Diferencias en ${file.path}`}>
              {rows.map((r, i) =>
                r.op === "gap" ? (
                  <div key={i} className="diff-gap">
                    ⋯ {r.count} {r.count === 1 ? "línea sin cambios" : "líneas sin cambios"}
                  </div>
                ) : (
                  <div key={i} className={`diff-line ${r.op === "+" ? "add" : r.op === "-" ? "del" : ""}`} role="row">
                    <span className="ln">{r.a ?? ""}</span>
                    <span className="ln">{r.b ?? ""}</span>
                    <span className="op">{r.op}</span>
                    <span className="txt">{r.text || " "}</span>
                  </div>
                ),
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export function TurnDetails({
  projectId,
  detail,
  reloadKey,
  onBack,
  onOpenFile,
  onMention,
}: {
  projectId: string;
  detail: TurnDetail;
  reloadKey: number;
  onBack: () => void;
  onOpenFile: (path: string) => void;
  onMention: (path: string) => void;
}) {
  const [tab, setTab] = useState<"timeline" | "changes">("changes");
  const { data, error } = useTurnChanges(projectId, detail.turnId, reloadKey);
  useEffect(() => {
    // Esc goes back, unless it is closing something in a text field (the composer's menus).
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !(e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) && onBack();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack]);
  return (
    <div className="details">
      <header className="details-bar">
        <button className="sm" onClick={onBack} title="Volver a la vista previa (Esc)">
          ← Volver a la vista previa
        </button>
        <strong className="grow details-title" title={detail.title}>
          {detail.title}
        </strong>
        <div className="segmented" role="tablist" aria-label="Vista de detalles">
          <button role="tab" aria-selected={tab === "timeline"} className={tab === "timeline" ? "on" : ""} onClick={() => setTab("timeline")}>
            Cronología
          </button>
          <button role="tab" aria-selected={tab === "changes"} className={tab === "changes" ? "on" : ""} onClick={() => setTab("changes")}>
            Cambios {data && <span className="count">{data.files.length}</span>}
          </button>
        </div>
      </header>
      <div className="details-body">
        {tab === "timeline" ? (
          <ol className="tl">
            {detail.timeline.map((e, i) =>
              e.kind === "step" ? (
                <li key={i} className={`tl-step ${e.ok ? "" : "err"}`}>
                  <span className="tl-dot">{e.ok ? "✓" : "✕"}</span>
                  <span>{e.label}</span>
                  {e.summary && <code className="tl-what">{e.summary}</code>}
                </li>
              ) : (
                <li key={i} className={e.kind === "user" ? "tl-user" : "tl-text"}>
                  {e.text}
                </li>
              ),
            )}
          </ol>
        ) : !data ? (
          <div className="empty">{error || <span className="spinner" />}</div>
        ) : data.files.length === 0 ? (
          <div className="empty">Este mensaje no cambió el código.</div>
        ) : (
          data.files.map((f) => <FileDiff key={f.path} file={f} onOpen={() => onOpenFile(f.path)} onMention={() => onMention(f.path)} />)
        )}
      </div>
    </div>
  );
}
