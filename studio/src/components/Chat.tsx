import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { api, streamPost } from "../api";
import { AgentLanes, type Lane, type TeamTurn } from "./AgentLanes";
import { ChangeCard, type TimelineEntry, type TurnDetail } from "./Changes";
import { GithubCommitCard, type GithubCard } from "./GitHub";
import { Check, Cross, Send } from "./Icons";
import { fixMessage, ProblemsBar, type Problem } from "./Problems";
import { filterSkills, SlashMenu, type Skill } from "./Skills";
import { copyText, useDismiss } from "./ui";

type Mode = "build" | "chat" | "plan";
const MODES: Record<Mode, { label: string; hint: string; placeholder: string; icon: string }> = {
  build: { label: "Construir", hint: "Hace los cambios directamente", placeholder: "Pide un cambio o una función nueva…", icon: "✦" },
  chat: { label: "Chat", hint: "Pregunta, investiga errores o explora ideas sin cambiar nada (más barato)", placeholder: "Pregunta lo que quieras sobre tu app…", icon: "◌" },
  plan: { label: "Plan", hint: "Prepara un plan detallado para revisarlo antes de construir", placeholder: "Describe lo que quieres planificar…", icon: "◇" },
};
const MODE_ORDER: Mode[] = ["build", "chat", "plan"];

type Block =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string; is_error?: boolean }
  | GithubCard;

interface Message {
  role: "user" | "assistant";
  content: Block[];
  turnId?: string | null;
  createdAt?: string;
}

/** "30 jun, 16:53" — the year only when it is not this one. */
function when(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleString(undefined, { day: "numeric", month: "short", year: sameYear ? undefined : "numeric", hour: "2-digit", minute: "2-digit" });
}

/** One agent's run in a turn, as stored by the server (agent_tasks). */
interface TaskRow {
  id: string;
  turnId: string;
  role: string;
  goal: string;
  model: string | null;
  status: "pending" | "running" | "done" | "failed";
  summary: string | null;
  steps: { tool: string; summary: string; ok: boolean }[] | null;
  dependsOn: string[] | null;
  doneWhen?: string[] | null;
  inputTokens: number | null;
  outputTokens: number | null;
  cacheReadTokens: number | null;
  usd: number | string | null;
  startedAt: string | null;
}

function teamOf(rows: TaskRow[]): TeamTurn {
  const sorted = [...rows].sort((a, b) => (a.startedAt ?? "9").localeCompare(b.startedAt ?? "9"));
  return {
    lanes: sorted.map((t) => ({
      id: t.id.slice(t.id.indexOf(":") + 1),
      role: t.role,
      goal: t.role === "fast" ? "" : t.goal,
      model: t.model ?? undefined,
      status: t.status,
      steps: (t.steps ?? []).map((s, i) => ({ id: `${t.id}:${i}`, name: s.tool, summary: s.summary, state: s.ok ? "ok" : "err" })),
      note: t.role === "fast" ? undefined : (t.summary ?? undefined),
      usd: Number(t.usd ?? 0),
      tokens: (t.inputTokens ?? 0) + (t.outputTokens ?? 0) + (t.cacheReadTokens ?? 0),
      dependsOn: t.dependsOn ?? [],
      doneWhen: t.doneWhen ?? [],
    })),
  };
}

interface Step {
  id: string;
  name: string;
  summary: string;
  state: "running" | "ok" | "err";
  output?: string;
}

/** A rendered chat item. `turn` ties it to the turn it belongs to (for change cards and details). */
type Item = (
  | { kind: "user"; text: string; element?: string; attachments?: string[]; at?: string }
  | { kind: "ai"; text: string }
  | { kind: "steps"; steps: Step[] }
  | { kind: "team"; team: TeamTurn }
  | { kind: "github"; card: GithubCard }
  | { kind: "changes"; title: string }
) & { turn?: string | null };

/** An element picked with the Select tool in the preview. */
export interface SelectedElement {
  tag: string;
  text: string;
  selector: string;
  html: string;
  path: string;
}

const ELEMENT_MARK = "\n\n[Elemento seleccionado en la vista previa";

/** The builder gets the element's details; the chat shows only a chip. */
function withElement(text: string, el: SelectedElement | null) {
  if (!el) return text;
  return `${text}${ELEMENT_MARK} — página ${el.path}]\nSelector: ${el.selector}\nTexto: ${el.text || "(sin texto)"}\nHTML: ${el.html}`;
}

const ATTACH = /\[\[adjunto:([^\]]+)\]\]/g;

function userItem(raw: string): Item {
  // Attachments are [[adjunto:path]] markers added by the server; show them as chips.
  const attachments = [...raw.matchAll(ATTACH)].map((m) => m[1]!);
  const text = raw.replace(ATTACH, "").trimEnd();
  const i = text.indexOf(ELEMENT_MARK);
  if (i < 0) return { kind: "user", text, attachments };
  const selector = /Selector: (.*)/.exec(text.slice(i))?.[1] ?? "elemento";
  return { kind: "user", text: text.slice(0, i), element: selector, attachments };
}

const fileName = (path: string) => path.split("/").pop()!.replace(/^[a-z0-9]+-/, "");

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

/** Stable id for a reply, so a bookmark survives reloads. */
function markId(text: string) {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

const TOOL_LABEL: Record<string, string> = {
  list_files: "Revisó los archivos",
  read_files: "Leyó",
  write_file: "Escribió",
  edit_file: "Editó",
  delete_file: "Borró",
  rename_file: "Movió",
  describe_database: "Revisó la base de datos",
  execute_sql: "SQL",
  query_database: "Consultó",
  check_build: "Comprobó que compila",
  finish_gate: "Verificación automática",
  get_logs: "Leyó los registros",
  get_problems: "Revisó los problemas",
  list_secrets: "Revisó los secretos",
  request_secret: "Pidió el secreto",
  setup_auth: "Preparó el inicio de sesión",
  set_user_password: "Cambió contraseña de",
  run_job: "Ejecutó la tarea",
  create_checkpoint: "Checkpoint",
  publish_app: "Publicó la app",
  get_preview_url: "Enlace de vista previa",
  submit_plan: "Planificó",
  report_review: "Revisó el resultado",
};
const ROLE_LABEL: Record<string, string> = { planner: "Planificador", data: "Datos", backend: "Backend", ui: "Interfaz", qa: "Revisión", chat: "Chat" };
const WRITES = new Set(["write_file", "edit_file", "delete_file", "rename_file"]);

function summarize(name: string, input: Record<string, unknown>) {
  if (typeof input.path === "string") return input.path;
  if (Array.isArray(input.paths)) return (input.paths as string[]).join(", ");
  if (typeof input.from === "string" && typeof input.to === "string") return `${input.from} → ${input.to}`;
  if (typeof input.sql === "string") return input.sql.replace(/\s+/g, " ").slice(0, 70);
  if (typeof input.name === "string") return input.name;
  return "";
}

/** A change card's title: the request that started the turn, in one line. */
function turnTitle(text: string) {
  const line = text.replace(/```[\s\S]*?```/g, " ").replace(/\s+/g, " ").trim();
  return line.length > 72 ? `${line.slice(0, 70).trimEnd()}…` : line || "Cambios";
}

function toItems(messages: Message[], tasks: TaskRow[] = []): Item[] {
  const results = new Map<string, Extract<Block, { type: "tool_result" }>>();
  for (const m of messages) for (const b of m.content) if (b.type === "tool_result") results.set(b.tool_use_id, b);
  const byTurn = new Map<string, TaskRow[]>();
  for (const t of tasks) byTurn.set(t.turnId, [...(byTurn.get(t.turnId) ?? []), t]);
  const shown = new Set<string>();
  const items: Item[] = [];
  const wrote = new Set<string>();
  const firstText = new Map<string, string>();
  const pushStep = (s: Step, turn: string | null) => {
    const last = items[items.length - 1];
    if (last?.kind === "steps" && last.turn === turn) last.steps.push(s);
    else items.push({ kind: "steps", steps: [s], turn });
  };
  for (const m of messages) {
    const turn = m.turnId ?? null;
    // Multi-agent turns: the lanes go right before the turn's reply.
    if (m.role === "assistant" && turn && !shown.has(turn) && byTurn.has(turn)) {
      shown.add(turn);
      const rows = byTurn.get(turn)!;
      if (rows.some((t) => (t.steps ?? []).some((s) => s.ok && WRITES.has(s.tool)))) wrote.add(turn);
      items.push({ kind: "team", team: teamOf(rows), turn });
    }
    for (const b of m.content) {
      if (b.type === "github") items.push({ kind: "github", card: b, turn });
      if (b.type === "text" && b.text.trim()) {
        if (m.role === "user") {
          const it = userItem(b.text);
          if (turn && !firstText.has(turn) && it.kind === "user") firstText.set(turn, it.text);
          items.push(it.kind === "user" ? { ...it, at: m.createdAt, turn } : { ...it, turn });
        } else items.push({ kind: "ai", text: b.text, turn });
      }
      if (b.type === "tool_use") {
        const r = results.get(b.id);
        const ok = !!r && !r.is_error;
        if (ok && turn && WRITES.has(b.name)) wrote.add(turn);
        pushStep({ id: b.id, name: b.name, summary: summarize(b.name, b.input), state: ok ? "ok" : "err", output: r?.content }, turn);
      }
    }
  }
  // A change card closes each turn that wrote code.
  for (let i = items.length - 1; i >= 0; i--) {
    const t = items[i]!.turn;
    if (!t || !wrote.has(t) || items[i + 1]?.turn === t) continue;
    wrote.delete(t);
    items.splice(i + 1, 0, { kind: "changes", title: turnTitle(firstText.get(t) ?? ""), turn: t });
  }
  return items;
}

/** What the details view lists for a turn: the request, the steps and the replies, in order. */
function timelineOf(items: Item[], turn: string): TimelineEntry[] {
  const out: TimelineEntry[] = [];
  for (const it of items) {
    if (it.turn !== turn) continue;
    if (it.kind === "user") out.push({ kind: "user", text: it.text });
    else if (it.kind === "ai") out.push({ kind: "text", text: it.text });
    else if (it.kind === "steps") for (const s of it.steps) out.push({ kind: "step", label: TOOL_LABEL[s.name] ?? s.name, summary: s.summary, ok: s.state !== "err" });
    else if (it.kind === "team")
      for (const l of it.team.lanes)
        for (const s of l.steps)
          out.push({ kind: "step", label: [ROLE_LABEL[l.role], TOOL_LABEL[s.name] ?? s.name].filter(Boolean).join(" · "), summary: s.name === "submit_plan" || s.name === "report_review" ? "" : s.summary, ok: s.state !== "err" });
  }
  return out;
}

const inline = (s: string): ReactNode[] =>
  s.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("`") && part.endsWith("`") && part.length > 1 ? (
      <code key={i}>{part.slice(1, -1)}</code>
    ) : part.startsWith("**") && part.endsWith("**") && part.length > 3 ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );

/** Just enough markdown for builder replies: headings, paragraphs, lists, code blocks, **bold**, `code`. */
function Markdown({ text }: { text: string }) {
  const parts = text.split(/```[^\n]*\n?/);
  return (
    <>
      {parts.map((chunk, k) =>
        k % 2 ? (
          <pre key={k} className="md-code">
            {chunk.trimEnd()}
          </pre>
        ) : (
          chunk
            .split(/\n{2,}/)
            .filter((b) => b.trim())
            .map((b, i) => {
              const lines = b.split("\n").filter(Boolean);
              if (lines.length && lines.every((l) => /^\s*([-*]|\d+\.)\s/.test(l))) {
                const List = /^\s*\d+\./.test(lines[0]!) ? "ol" : "ul";
                return (
                  <List key={`${k}-${i}`}>
                    {lines.map((l, j) => (
                      <li key={j}>{inline(l.replace(/^\s*([-*]|\d+\.)\s/, ""))}</li>
                    ))}
                  </List>
                );
              }
              if (lines.length === 1 && /^#{1,4}\s/.test(lines[0]!)) return <h4 key={`${k}-${i}`}>{inline(lines[0]!.replace(/^#+\s*/, ""))}</h4>;
              return (
                <p key={`${k}-${i}`}>
                  {lines.map((l, j) => (
                    <Fragment key={j}>
                      {j > 0 && <br />}
                      {inline(l.replace(/^#+\s*/, ""))}
                    </Fragment>
                  ))}
                </p>
              );
            })
        ),
      )}
    </>
  );
}

const MENTION = /(@(?:[\w$.-]+\/)*[\w$.-]+\.\w+)/g;

/** The owner's text; pasted errors (```…```) render as code blocks and @file mentions as chips. */
function UserText({ text }: { text: string }) {
  const parts = text.split(/```\n?/);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <pre key={i} className="user-code">
            {p.trimEnd()}
          </pre>
        ) : (
          <Fragment key={i}>
            {p.split(MENTION).map((s, j) =>
              j % 2 ? (
                <span key={j} className="mention" title={s.slice(1)}>
                  {s.slice(1).split("/").pop()}
                </span>
              ) : (
                <Fragment key={j}>{s}</Fragment>
              ),
            )}
          </Fragment>
        ),
      )}
    </>
  );
}

/** Long requests fold to a few lines, like pasted logs. */
function UserBubble({ text }: { text: string }) {
  const long = text.length > 420 || text.split("\n").length > 8;
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className={long && !open ? "folded" : undefined}>
        <UserText text={text} />
      </div>
      {long && (
        <button className="link-btn" onClick={() => setOpen((o) => !o)}>
          {open ? "Mostrar menos" : "Mostrar más"}
        </button>
      )}
    </>
  );
}

function Steps({ steps }: { steps: Step[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [all, setAll] = useState(false);
  const running = steps.some((s) => s.state === "running");
  // Long runs fold to the last few steps, with a count of the rest.
  const shown = all || running || steps.length <= 5 ? steps : steps.slice(-3);
  return (
    <div className="steps">
      {shown.length < steps.length && (
        <button className="link-btn small" onClick={() => setAll(true)}>
          + {steps.length - shown.length} pasos más
        </button>
      )}
      {shown.map((s) => (
        <div key={s.id}>
          <button className={`step ${s.state === "err" ? "err" : ""}`} aria-expanded={open === s.id} onClick={() => setOpen(open === s.id ? null : s.id)} disabled={!s.output}>
            {s.state === "running" ? <span className="spinner" style={{ width: 11, height: 11 }} /> : s.state === "ok" ? <Check /> : <Cross />}
            <span>{TOOL_LABEL[s.name] ?? s.name}</span>
            {s.summary && <span className="what">{s.summary}</span>}
          </button>
          {open === s.id && s.output && <pre className="step-output">{s.output}</pre>}
        </div>
      ))}
    </div>
  );
}

// --- Composer menus ------------------------------------------------------------------------------

function ModeMenu({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss<HTMLDivElement>(open, () => setOpen(false));
  return (
    <div className="menu-anchor" ref={ref}>
      <button className={`mode-btn ${mode}`} aria-haspopup="listbox" aria-expanded={open} title={`${MODES[mode].hint} · Alt+P`} onClick={() => setOpen((o) => !o)}>
        <span aria-hidden>{MODES[mode].icon}</span> {MODES[mode].label} <span className="caret">▾</span>
      </button>
      {open && (
        <div className="popover up left mode-menu" role="listbox" aria-label="Modo del chat">
          {MODE_ORDER.map((m) => (
            <button
              key={m}
              role="option"
              aria-selected={mode === m}
              className="menu-item tall"
              onClick={() => {
                onChange(m);
                setOpen(false);
              }}
            >
              <span className="mode-ico" aria-hidden>
                {MODES[m].icon}
              </span>
              <span className="grow" style={{ textAlign: "left" }}>
                <span style={{ display: "block", fontWeight: 500 }}>
                  {MODES[m].label} {m === "chat" && <span className="pill ok tiny">más barato</span>}
                </span>
                <span className="small muted" style={{ whiteSpace: "normal" }}>
                  {MODES[m].hint}
                </span>
              </span>
              {mode === m && <span className="check">✓</span>}
            </button>
          ))}
          <div className="menu-sep" />
          <div className="small muted kbd-row">
            Cambiar de modo con <kbd>Alt</kbd> <kbd>P</kbd>
          </div>
        </div>
      )}
    </div>
  );
}

interface PlusAction {
  label: string;
  hint?: string;
  icon: string;
  run: () => void;
}

function PlusMenu({ actions, disabled }: { actions: PlusAction[]; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss<HTMLDivElement>(open, () => setOpen(false));
  return (
    <div className="menu-anchor" ref={ref}>
      <button className={`round-btn ${open ? "on" : ""}`} aria-label="Acciones del chat" aria-expanded={open} disabled={disabled} title="Adjuntar, mencionar archivos, comandos…" onClick={() => setOpen((o) => !o)}>
        <span style={{ transform: open ? "rotate(45deg)" : undefined, transition: "transform .15s", display: "inline-block" }}>＋</span>
      </button>
      {open && (
        <div className="popover up left plus-menu">
          {actions.map((a) => (
            <button
              key={a.label}
              className="menu-item"
              onClick={() => {
                setOpen(false);
                a.run();
              }}
            >
              <span className="mode-ico" aria-hidden>
                {a.icon}
              </span>
              <span className="grow" style={{ textAlign: "left" }}>
                {a.label}
              </span>
              {a.hint && <kbd>{a.hint}</kbd>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MentionMenu({ files, active, onPick, onHover }: { files: string[]; active: number; onPick: (p: string) => void; onHover: (i: number) => void }) {
  return (
    <div className="popover up left slash-menu" role="listbox" aria-label="Archivos del proyecto">
      <div className="menu-label">Mencionar un archivo · ↑↓ Enter</div>
      {files.length === 0 && <div className="small muted" style={{ padding: "6px 10px" }}>Ningún archivo coincide</div>}
      {files.map((f, i) => (
        <button key={f} role="option" aria-selected={i === active} className={`menu-item ${i === active ? "active" : ""}`} onMouseEnter={() => onHover(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => onPick(f)}>
          <span className="file-ico" aria-hidden>
            {/^pages\//.test(f) ? "▭" : /^components\//.test(f) ? "⬡" : /^endpoints\//.test(f) ? "⇄" : "▢"}
          </span>
          <span className="grow mention-name">{f.split("/").pop()}</span>
          <span className="small muted mention-path">{f.split("/").slice(0, -1).join("/")}</span>
        </button>
      ))}
    </div>
  );
}

/** Browser dictation (Web Speech API), when the browser has it. */
type Recognition = { lang: string; interimResults: boolean; continuous: boolean; start(): void; stop(): void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null };
const SpeechCtor: (new () => Recognition) | undefined =
  typeof window === "undefined" ? undefined : ((window as unknown as Record<string, unknown>).SpeechRecognition ?? (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as (new () => Recognition) | undefined;

const STARTERS = ["Explícame cómo está organizada la app", "Añade un modo oscuro", "Revisa la accesibilidad de la portada"];

export function Chat({
  projectId,
  onTurnEnd,
  onBuildingChange,
  selection = null,
  onClearSelection = () => {},
  onSelectElement,
  onOpenDetails,
  onRestored,
  insert,
  problems = [],
  fixNonce = 0,
  outbox = null,
  reloadKey = 0,
}: {
  projectId: string;
  onTurnEnd: () => void;
  onBuildingChange: (b: boolean) => void;
  selection?: SelectedElement | null;
  onClearSelection?: () => void;
  /** Starts the preview's element picker (from the + menu). */
  onSelectElement?: () => void;
  /** Opens a turn's details (timeline and diffs) in the stage. */
  onOpenDetails?: (d: TurnDetail) => void;
  /** Code went back to an earlier point from a change card. */
  onRestored?: () => void;
  /** Text to add to the composer from outside (e.g. "Mencionar en el chat"); a new nonce inserts again. */
  insert?: { text: string; nonce: number } | null;
  /** What is broken in the preview right now (live from the project's event feed). */
  problems?: Problem[];
  /** Bumped when the preview's "Intentar arreglar" button is pressed. */
  fixNonce?: number;
  /** A message to send now in build mode, from another panel; a new nonce sends it. */
  outbox?: { nonce: number; text: string } | null;
  /** Bumped when something outside a turn adds to the chat (a commit from GitHub). */
  reloadKey?: number;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [loadCount, setLoadCount] = useState(0);
  const [mode, setModeState] = useState<Mode>(() => {
    try {
      const m = localStorage.getItem("forja:chat-mode");
      return m === "chat" || m === "plan" ? m : "build";
    } catch {
      return "build";
    }
  });
  const setMode = (m: Mode) => {
    setModeState(m);
    try {
      localStorage.setItem("forja:chat-mode", m);
    } catch {}
  };
  // Alt+P cycles Construir → Chat → Plan.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey || e.code !== "KeyP") return;
      e.preventDefault();
      setMode(MODE_ORDER[(MODE_ORDER.indexOf(mode) + 1) % MODE_ORDER.length]!);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Bookmarks (replies and change cards), kept per project in this browser.
  const bmKey = `forja:bookmarks:${projectId}`;
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(bmKey) ?? "[]") as string[];
    } catch {
      return [];
    }
  });
  const [onlyMarked, setOnlyMarked] = useState(false);
  const toggleBookmark = (id: string) =>
    setBookmarks((b) => {
      const next = b.includes(id) ? b.filter((x) => x !== id) : [...b, id];
      try {
        localStorage.setItem(bmKey, JSON.stringify(next));
      } catch {}
      return next;
    });
  const cardMark = (turn: string) => `turn:${turn}`;

  // Follow-ups typed while the builder works are sent, in order, when it finishes.
  const [queue, setQueue] = useState<{ text: string; mode: Mode }[]>([]);
  const queueRef = useRef(queue);
  queueRef.current = queue;
  const [planTurn, setPlanTurn] = useState<string | null>(null);
  const [live, setLive] = useState<Item[]>([]);
  const [input, setInput] = useState("");
  const [caret, setCaret] = useState(0);
  const [menuIdx, setMenuIdx] = useState(0);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const recognition = useRef<Recognition | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [files, setFiles] = useState<string[] | null>(null);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState("");
  const logRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const stick = useRef(true);

  const attach = async (list: FileList | File[] | null) => {
    if (!list?.length) return;
    setUploading(true);
    setError("");
    try {
      for (const file of [...list].slice(0, 6)) {
        if (file.size > 5 * 1024 * 1024) throw new Error(`${file.name} supera 5 MB`);
        const r = await api<{ path: string }>(`/projects/${projectId}/attachments`, { body: { filename: file.name, dataUrl: await readAsDataUrl(file) } });
        setAttachments((a) => [...a, r.path]);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const load = () =>
    api<{ messages: Message[]; tasks?: TaskRow[]; building: boolean; pendingPlanTurn?: string | null }>(`/projects/${projectId}/chat`).then((r) => {
      setItems(toItems(r.messages, r.tasks));
      setPlanTurn(r.pendingPlanTurn ?? null);
      setLoadCount((n) => n + 1);
      return r;
    });

  useEffect(() => {
    if (reloadKey > 0 && !building) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  // The preview's own "Intentar arreglar" (on its build-error page).
  useEffect(() => {
    if (fixNonce > 0 && problems.length) void send(fixMessage(problems.filter((p) => p.kind === "build").length ? problems.filter((p) => p.kind === "build") : problems), { mode: "build" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixNonce]);

  useEffect(() => {
    if (insert?.text) addToInput(insert.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insert?.nonce]);

  // A link to a message (?msg=<turn>) opens the chat on it.
  const [linked] = useState(() => new URLSearchParams(location.search).get("msg"));
  const jumped = useRef(false);
  useEffect(() => {
    if (!linked || jumped.current || !items.length) return;
    const el = document.getElementById(`turn-${linked}`);
    if (!el) return;
    jumped.current = true;
    stick.current = false;
    el.scrollIntoView({ block: "center" });
  }, [items, linked]);

  useEffect(() => {
    if (outbox) void send(outbox.text, { mode: "build" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outbox?.nonce]);

  useEffect(() => {
    void load().then((r) => {
      // First message from the dashboard prompt box.
      const first = sessionStorage.getItem(`forja:first:${projectId}`);
      if (first && !started.current && r.messages.length === 0) {
        started.current = true;
        sessionStorage.removeItem(`forja:first:${projectId}`);
        void send(first);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Follow the log while it grows, unless the owner scrolled up to read. A jump, not a smooth
  // scroll: the scroll events of an animation would read as the owner scrolling away.
  const follow = () => {
    if (stick.current && logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  };
  useEffect(follow, [items, live, onlyMarked]);
  // Change cards fill in after the log renders; keep following while they grow.
  useEffect(() => {
    const log = logRef.current;
    if (!log || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(follow);
    for (const child of log.children) ro.observe(child);    return () => ro.disconnect();
  }, [items, live, onlyMarked]);

  // The composer grows with its text, up to a limit.
  useEffect(() => {
    const t = textarea.current;
    if (!t) return;
    t.style.height = "auto";
    t.style.height = `${Math.min(t.scrollHeight, 220)}px`;
  }, [input]);

  const setBusy = (b: boolean) => {
    setBuilding(b);
    onBuildingChange(b);
  };

  function addToInput(text: string) {
    setInput((v) => {
      const sep = v && !/\s$/.test(v) ? " " : "";
      const next = `${v}${sep}${text}`;
      setCaret(next.length);
      return next;
    });
    requestAnimationFrame(() => {
      const t = textarea.current;
      if (!t) return;
      t.focus();
      t.setSelectionRange(t.value.length, t.value.length);
    });
  }

  async function send(text: string, opts: { mode?: Mode; implementPlan?: boolean } = {}) {
    if (!text.trim()) return;
    const turnMode = opts.mode ?? mode;
    setInput("");
    stick.current = true;
    if (building) {
      setQueue((q) => [...q, { text, mode: turnMode }]);
      return;
    }
    setError("");
    setBusy(true);
    const message = withElement(text, selection);
    const files = attachments;
    onClearSelection();
    setAttachments([]);
    const turn: Item[] = [{ ...userItem(message), attachments: files } as Item];
    setLive([...turn]);
    const update = () => setLive(turn.map((it) => (it.kind === "team" ? { kind: "team", team: { ...it.team, lanes: it.team.lanes.map((l) => ({ ...l, steps: [...l.steps] })) } } : it)));
    let team: TeamTurn | null = null;
    const lane = (id: string, role = "fast"): Lane => {
      if (!team) {
        team = { lanes: [] };
        turn.push({ kind: "team", team });
      }
      let l = team.lanes.find((x) => x.id === id);
      if (!l) team.lanes.push((l = { id, role, goal: "", status: "pending", steps: [] }));
      return l;
    };
    try {
      await streamPost(`/projects/${projectId}/chat`, { message, attachments: files, mode: turnMode, implementPlan: !!opts.implementPlan }, (e) => {
        if (e.type === "route") {
          if (!e.fastPath) lane("plan", "planner").goal = "Planificar el trabajo del equipo";
        } else if (e.type === "plan") {
          for (const t of e.tasks as { id: string; role: string; goal: string; dependsOn: string[]; doneWhen?: string[] }[]) Object.assign(lane(t.id, t.role), { goal: t.goal, dependsOn: t.dependsOn, doneWhen: t.doneWhen ?? [] });
        } else if (e.type === "task_start") Object.assign(lane(e.taskId, e.role), { status: "running", model: e.model });
        else if (e.type === "task_end") Object.assign(lane(e.taskId), { status: e.ok ? "done" : "failed", usd: e.usd, tokens: e.tokens, note: e.taskId === "fast" || e.taskId === "chat" ? undefined : e.summary });
        else if (e.type === "review" && team) team.review = { ok: e.ok, summary: e.summary, issues: e.issues };
        else if (e.type === "done" && team) team.metrics = { usd: e.usd, baselineUsd: e.baselineUsd, cachedTokens: e.cachedTokens };
        else if (e.type === "text" && e.taskId && e.taskId !== "fast" && e.taskId !== "chat") lane(e.taskId).note = e.text;
        else if (e.type === "text") turn.push({ kind: "ai", text: e.text });
        else if (e.taskId && e.type === "tool_start") lane(e.taskId).steps.push({ id: e.id, name: e.name, summary: e.summary, state: "running" });
        else if (e.taskId && e.type === "tool_end") {
          const s = lane(e.taskId).steps.find((x) => x.id === e.id);
          if (s) Object.assign(s, { state: e.ok ? "ok" : "err", output: e.output });
        } else if (e.type === "tool_start") {
          const last = turn[turn.length - 1];
          const step: Step = { id: e.id, name: e.name, summary: e.summary, state: "running" };
          if (last?.kind === "steps") last.steps.push(step);
          else turn.push({ kind: "steps", steps: [step] });
        } else if (e.type === "tool_end") {
          for (const it of turn) if (it.kind === "steps") for (const s of it.steps) if (s.id === e.id) Object.assign(s, { state: e.ok ? "ok" : "err", output: e.output });
        } else if (e.type === "error") setError(e.message);
        update();
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      await load();
      setLive([]);
      setBusy(false);
      onTurnEnd();
    }
    const next = queueRef.current[0];
    if (next) {
      setQueue((q) => q.slice(1));
      void send(next.text, { mode: next.mode });
    }
  }

  // "/" at the start opens the skills; "@word" right before the caret opens the file list.
  const slashSkills = /^\/[^\s]*$/.test(input) ? filterSkills(input.slice(1)) : [];
  const mention = slashSkills.length ? null : /(^|\s)@([^\s@]*)$/.exec(input.slice(0, caret));
  useEffect(() => {
    if (mention && files === null) {
      setFiles([]);
      api<{ files: { path: string }[] }>(`/projects/${projectId}/files`)
        .then((r) => setFiles(r.files.map((f) => f.path).filter((p) => !p.startsWith("static/uploads/"))))
        .catch(() => setFiles(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!mention, projectId]);
  useEffect(() => setFiles(null), [loadCount]);
  const mentionFiles = useMemo(() => {
    if (!mention) return [];
    const q = mention[2]!.toLowerCase();
    const list = (files ?? []).filter((f) => !q || f.toLowerCase().includes(q));
    // Names that start with the query first, then the rest.
    return list.sort((a, b) => Number(!(a.split("/").pop() ?? "").toLowerCase().startsWith(q)) - Number(!(b.split("/").pop() ?? "").toLowerCase().startsWith(q))).slice(0, 30);
  }, [mention?.[2], files]);

  const pickSkill = (s: Skill) => {
    setMode(s.mode);
    setInput(s.prompt);
    setCaret(s.prompt.length);
    setMenuIdx(0);
    // Leave the caret where the owner fills in their part (e.g. after "Objetivo: ").
    requestAnimationFrame(() => {
      const t = textarea.current;
      if (!t) return;
      t.focus();
      const at = s.prompt.indexOf(": .") >= 0 ? s.prompt.indexOf(": .") + 2 : s.prompt.length;
      t.setSelectionRange(at, s.prompt.indexOf(": .") >= 0 ? at + 1 : at);
    });
  };
  const pickFile = (path: string) => {
    const before = input.slice(0, caret).replace(/@[^\s@]*$/, `@${path} `);
    const next = before + input.slice(caret);
    setInput(next);
    setCaret(before.length);
    setMenuIdx(0);
    requestAnimationFrame(() => textarea.current?.setSelectionRange(before.length, before.length));
  };
  const startMention = () => {
    addToInput("@");
  };
  const dictate = () => {
    if (!SpeechCtor) return;
    if (listening) return recognition.current?.stop();
    const r = new SpeechCtor();
    r.lang = navigator.language || "es-ES";
    r.interimResults = false;
    r.continuous = true;
    r.onresult = (e) => {
      const said = Array.from(e.results)
        .map((res) => res[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (said) addToInput(said);
    };
    r.onend = () => setListening(false);
    recognition.current = r;
    setListening(true);
    r.start();
  };
  useEffect(() => () => recognition.current?.stop(), []);

  const copyMsg = async (i: number, text: string) => {
    if (await copyText(text)) {
      setCopied(i);
      setTimeout(() => setCopied((c) => (c === i ? null : c)), 1200);
    }
  };

  const all = [...items, ...live];
  const isMarked = (it: Item) => (it.kind === "ai" && bookmarks.includes(markId(it.text))) || (it.kind === "changes" && !!it.turn && bookmarks.includes(cardMark(it.turn)));
  const visible = onlyMarked ? all.filter(isMarked) : all;
  const lastTurnIsPlan = !!planTurn && !building && items[items.length - 1]?.kind === "ai";
  const menuOpen = slashSkills.length > 0 || !!mention;
  const menuLen = slashSkills.length || mentionFiles.length;

  const plusActions: PlusAction[] = [
    { label: "Adjuntar archivos", icon: "📎", run: () => fileInput.current?.click() },
    { label: "Mencionar un archivo", icon: "@", hint: "@", run: startMention },
    { label: "Habilidades", icon: "/", hint: "/", run: () => (setInput("/"), setCaret(1), textarea.current?.focus()) },
    ...(onSelectElement ? [{ label: "Seleccionar en la vista previa", icon: "⌖", run: onSelectElement }] : []),
  ];

  return (
    <section
      className={`chat ${dragging ? "dropping" : ""}`}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) (e.preventDefault(), setDragging(true));
      }}
      onDragLeave={(e) => e.currentTarget === e.target && setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void attach(e.dataTransfer.files);
      }}
    >
      {bookmarks.length > 0 && (
        <div className="chat-filter">
          <div className="segmented" role="tablist" aria-label="Filtrar el chat">
            <button role="tab" aria-selected={!onlyMarked} className={!onlyMarked ? "on" : ""} onClick={() => setOnlyMarked(false)}>
              Historial
            </button>
            <button role="tab" aria-selected={onlyMarked} className={onlyMarked ? "on" : ""} onClick={() => setOnlyMarked(true)}>
              ★ Marcadores <span className="count">{all.filter(isMarked).length}</span>
            </button>
          </div>
        </div>
      )}
      <div
        className="chat-log"
        ref={logRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
      >
        {all.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-mark" aria-hidden>
              ✦
            </div>
            <div className="chat-empty-title">Cuéntame qué construimos</div>
            <div className="small muted">Describe pantallas, datos y quién la usará. Escribe «/» para ver las habilidades o «@» para mencionar un archivo.</div>
            <div className="starter-list">
              {STARTERS.map((s) => (
                <button key={s} className="starter" onClick={() => addToInput(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {onlyMarked && visible.length === 0 && <div className="small muted chat-empty">Aún no has marcado nada. Usa ☆ en una respuesta o en una tarjeta de cambios.</div>}
        {visible.map((it, i) =>
          it.kind === "user" ? (
            <div key={i} className={`msg-user-wrap ${it.turn && it.turn === linked ? "linked" : ""}`} id={it.turn ? `turn-${it.turn}` : undefined}>
              <div className="msg-user">
                {it.attachments?.map((a) => (
                  <div key={a} className="bubble-chip">
                    📎 {fileName(a)}
                  </div>
                ))}
                {it.element && <div className="bubble-chip">⌖ {it.element}</div>}
                <UserBubble text={it.text} />
              </div>
              {!building && (
                <div className="msg-actions right">
                  {it.at && (
                    <time className="msg-time" dateTime={it.at} title={new Date(it.at).toLocaleString()}>
                      {when(it.at)}
                    </time>
                  )}
                  {it.turn && (
                    <button
                      className="ghost sm"
                      aria-label="Copiar enlace del mensaje"
                      title="Copiar enlace del mensaje"
                      onClick={() => void copyMsg(-1 - i, `${location.origin}${location.pathname}?msg=${encodeURIComponent(it.turn!)}`)}
                    >
                      {copied === -1 - i ? "✓" : "🔗"}
                    </button>
                  )}
                  <button className="ghost sm" aria-label="Copiar mensaje" title="Copiar" onClick={() => void copyMsg(i, it.text)}>
                    {copied === i ? "✓" : "⧉"}
                  </button>
                  <button
                    className="ghost sm"
                    aria-label="Editar y reenviar"
                    title="Editar y reenviar"
                    onClick={() => {
                      setInput(it.text);
                      setCaret(it.text.length);
                      textarea.current?.focus();
                    }}
                  >
                    ✎
                  </button>
                </div>
              )}
            </div>
          ) : it.kind === "ai" ? (
            <div key={i} className="msg-ai">
              <Markdown text={it.text} />
              {!building && (
                <div className="msg-actions">
                  <button className="ghost sm" aria-label="Copiar respuesta" title="Copiar" onClick={() => void copyMsg(i, it.text)}>
                    {copied === i ? "✓" : "⧉"}
                  </button>
                  <button className={`ghost sm ${bookmarks.includes(markId(it.text)) ? "marked" : ""}`} aria-pressed={bookmarks.includes(markId(it.text))} aria-label="Marcar respuesta" title="Marcar en el historial" onClick={() => toggleBookmark(markId(it.text))}>
                    {bookmarks.includes(markId(it.text)) ? "★" : "☆"}
                  </button>
                </div>
              )}
            </div>
          ) : it.kind === "team" ? (
            <AgentLanes key={i} team={it.team} />
          ) : it.kind === "github" ? (
            <GithubCommitCard key={i} card={it.card} busy={false} onFix={(text) => void send(text, { mode: "build" })} />
          ) : it.kind === "changes" ? (
            it.turn && (
              <ChangeCard
                key={`c-${it.turn}`}
                projectId={projectId}
                turnId={it.turn}
                title={it.title}
                reloadKey={loadCount}
                marked={bookmarks.includes(cardMark(it.turn))}
                onToggleMark={() => toggleBookmark(cardMark(it.turn!))}
                onDetails={() => onOpenDetails?.({ turnId: it.turn!, title: it.title, timeline: timelineOf(all, it.turn!) })}
                onRestored={() => {
                  void load();
                  onRestored?.();
                }}
              />
            )
          ) : (
            <Steps key={i} steps={it.steps} />
          ),
        )}
        {lastTurnIsPlan && !onlyMarked && (
          <div className="plan-cta">
            <button className="primary sm" onClick={() => send("Implementa el plan.", { mode: "build", implementPlan: true })}>
              ▶ Implementar plan
            </button>
            <span className="small muted">o escribe qué cambiar y lo rehago</span>
          </div>
        )}
        {building && (
          <div className="thinking">
            <span className="dots" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            {live.some((it) => it.kind === "team" && it.team.lanes.some((l) => l.role === "chat")) ? "Pensando…" : "Construyendo…"}
          </div>
        )}
        {queue.map((q, i) => (
          <div key={i} className="queued small">
            <span className="muted">En cola{q.mode !== "build" ? ` · ${MODES[q.mode].label}` : ""}:</span> {q.text.slice(0, 160)}
            <button className="ghost sm icon-btn" style={{ height: 20, width: 20 }} aria-label="Quitar de la cola" onClick={() => setQueue((x) => x.filter((_, j) => j !== i))}>
              ×
            </button>
          </div>
        ))}
        {error && <div className="error-box">{error}</div>}
      </div>
      <div className="composer">
        <ProblemsBar problems={problems} disabled={false} onFix={(list) => void send(fixMessage(list), { mode: "build" })} />
        <div className={`composer-box mode-${mode}`}>
          {(attachments.length > 0 || selection || uploading) && (
            <div className="composer-chips">
              {attachments.map((a) => (
                <span key={a} className="selection-chip">
                  📎 {fileName(a)}
                  <button className="ghost sm icon-btn" style={{ height: 20, width: 20 }} aria-label={`Quitar ${fileName(a)}`} onClick={() => setAttachments((x) => x.filter((y) => y !== a))}>
                    ×
                  </button>
                </span>
              ))}
              {uploading && (
                <span className="selection-chip">
                  <span className="spinner" style={{ width: 11, height: 11 }} /> Subiendo…
                </span>
              )}
              {selection && (
                <span className="selection-chip">
                  ⌖ <code title={selection.html}>{selection.selector}</code>
                  <button className="ghost sm icon-btn" style={{ height: 20, width: 20 }} aria-label="Quitar selección" onClick={onClearSelection}>
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
          <div className="menu-anchor" style={{ display: "block" }}>
            {slashSkills.length > 0 && <SlashMenu skills={slashSkills} active={Math.min(menuIdx, slashSkills.length - 1)} onHover={setMenuIdx} onPick={pickSkill} />}
            {mention && <MentionMenu files={mentionFiles} active={Math.min(menuIdx, Math.max(0, mentionFiles.length - 1))} onHover={setMenuIdx} onPick={pickFile} />}
            <textarea
              ref={textarea}
              id="chatinput"
              aria-label="Mensaje para el constructor"
              rows={2}
              placeholder={building ? "Envía un seguimiento: se manda al terminar…" : selection ? "¿Qué cambio en este elemento?" : MODES[mode].placeholder}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setCaret(e.target.selectionStart);
                setMenuIdx(0);
              }}
              onSelect={(e) => setCaret(e.currentTarget.selectionStart)}
              onPaste={(e) => {
                const pasted = [...e.clipboardData.files];
                if (pasted.length) (e.preventDefault(), void attach(pasted));
              }}
              onKeyDown={(e) => {
                if (menuOpen && menuLen > 0) {
                  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                    e.preventDefault();
                    setMenuIdx((Math.min(menuIdx, menuLen - 1) + (e.key === "ArrowDown" ? 1 : menuLen - 1)) % menuLen);
                    return;
                  }
                  if (e.key === "Enter" || e.key === "Tab") {
                    e.preventDefault();
                    if (slashSkills.length) pickSkill(slashSkills[Math.min(menuIdx, menuLen - 1)]!);
                    else pickFile(mentionFiles[Math.min(menuIdx, menuLen - 1)]!);
                    return;
                  }
                }
                if (menuOpen && e.key === "Escape") {
                  e.preventDefault();
                  if (slashSkills.length) setInput("");
                  else setInput(input.slice(0, caret).replace(/@[^\s@]*$/, "") + input.slice(caret));
                  return;
                }
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  void send(input);
                }
              }}
            />
          </div>
          <div className="composer-tools">
            <input ref={fileInput} type="file" multiple hidden accept="image/*,.pdf,.txt,.md,.csv,.json,.svg" onChange={(e) => void attach(e.target.files)} />
            <PlusMenu actions={plusActions} />
            <ModeMenu mode={mode} onChange={setMode} />
            <span className="grow" />
            {SpeechCtor && (
              <button className={`round-btn ${listening ? "rec" : ""}`} aria-label={listening ? "Dejar de dictar" : "Dictar"} aria-pressed={listening} title={listening ? "Dejar de dictar" : "Dictar con la voz"} onClick={dictate}>
                {listening ? "■" : "🎙"}
              </button>
            )}
            {building ? (
              <>
                <button className="sm" disabled={!input.trim()} onClick={() => send(input)}>
                  Poner en cola
                </button>
                <button className="round-btn stop" aria-label="Detener" title="Detener" onClick={() => api(`/projects/${projectId}/chat/stop`, { body: {} })}>
                  ■
                </button>
              </>
            ) : (
              <button className="send-btn" aria-label="Enviar mensaje" title="Enviar (Enter) · Shift+Enter para salto de línea" disabled={!input.trim()} onClick={() => send(input)}>
                <Send />
              </button>
            )}
          </div>
        </div>
        <div className="composer-hint small muted">
          <span>
            <kbd>/</kbd> habilidades · <kbd>@</kbd> archivos · <kbd>Alt</kbd>+<kbd>P</kbd> modo
          </span>
          <span className="grow" />
          {mode === "chat" && <span>Chat: solo lee, no cambia el código</span>}
          {mode === "plan" && <span>Plan: nada cambia hasta que lo apruebes</span>}
        </div>
      </div>
      {dragging && <div className="drop-hint">Suelta para adjuntar</div>}
    </section>
  );
}
