import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { api, streamPost } from "../api";
import { AgentLanes, type Lane, type TeamTurn } from "./AgentLanes";
import { GithubCommitCard, type GithubCard } from "./GitHub";
import { fixMessage, ProblemsBar, type Problem } from "./Problems";

type Mode = "build" | "chat" | "plan";
const MODES: Record<Mode, { label: string; hint: string; placeholder: string }> = {
  build: { label: "Construir", hint: "Hace los cambios directamente", placeholder: "Pide un cambio o una función nueva…" },
  chat: { label: "Chat", hint: "Pregunta, investiga errores o explora ideas sin cambiar nada (más barato)", placeholder: "Pregunta lo que quieras sobre tu app…" },
  plan: { label: "Plan", hint: "Prepara un plan detallado para revisarlo antes de construir", placeholder: "Describe lo que quieres planificar…" },
};

/** The owner's text; pasted errors (```…```) render as code blocks. */
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
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}
import { Check, Cross, Send } from "./Icons";

type Block =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string; is_error?: boolean }
  | GithubCard;

interface Message {
  role: "user" | "assistant";
  content: Block[];
  turnId?: string | null;
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

/** A rendered turn item: user text, assistant text, or a group of tool steps. */
type Item =
  | { kind: "user"; text: string; element?: string; attachments?: string[] }
  | { kind: "ai"; text: string }
  | { kind: "steps"; steps: Step[] }
  | { kind: "team"; team: TeamTurn }
  | { kind: "github"; card: GithubCard };

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
  get_logs: "Leyó los registros",
  list_secrets: "Revisó los secretos",
  request_secret: "Pidió el secreto",
  setup_auth: "Preparó el inicio de sesión",
  set_user_password: "Cambió contraseña de",
  run_job: "Ejecutó la tarea",
  create_checkpoint: "Checkpoint",
  publish_app: "Publicó la app",
  get_preview_url: "Enlace de vista previa",
};

function summarize(name: string, input: Record<string, unknown>) {
  if (typeof input.path === "string") return input.path;
  if (Array.isArray(input.paths)) return (input.paths as string[]).join(", ");
  if (typeof input.sql === "string") return input.sql.replace(/\s+/g, " ").slice(0, 70);
  if (typeof input.name === "string") return input.name;
  return "";
}

function toItems(messages: Message[], tasks: TaskRow[] = []): Item[] {
  const results = new Map<string, Extract<Block, { type: "tool_result" }>>();
  for (const m of messages) for (const b of m.content) if (b.type === "tool_result") results.set(b.tool_use_id, b);
  const byTurn = new Map<string, TaskRow[]>();
  for (const t of tasks) byTurn.set(t.turnId, [...(byTurn.get(t.turnId) ?? []), t]);
  const shown = new Set<string>();
  const items: Item[] = [];
  const pushStep = (s: Step) => {
    const last = items[items.length - 1];
    if (last?.kind === "steps") last.steps.push(s);
    else items.push({ kind: "steps", steps: [s] });
  };
  for (const m of messages) {
    // Multi-agent turns: the lanes go right before the turn's reply.
    if (m.role === "assistant" && m.turnId && !shown.has(m.turnId) && byTurn.has(m.turnId)) {
      shown.add(m.turnId);
      items.push({ kind: "team", team: teamOf(byTurn.get(m.turnId)!) });
    }
    for (const b of m.content) {
      if (b.type === "github") items.push({ kind: "github", card: b });
      if (b.type === "text" && b.text.trim()) items.push(m.role === "user" ? userItem(b.text) : { kind: "ai", text: b.text });
      if (b.type === "tool_use") {
        const r = results.get(b.id);
        pushStep({ id: b.id, name: b.name, summary: summarize(b.name, b.input), state: !r ? "err" : r.is_error ? "err" : "ok", output: r?.content });
      }
    }
  }
  return items;
}

/** Just enough markdown for builder replies: paragraphs, lists, **bold**, `code`. */
function Markdown({ text }: { text: string }) {
  const inline = (s: string): ReactNode[] =>
    s.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith("`") && part.endsWith("`") ? (
        <code key={i}>{part.slice(1, -1)}</code>
      ) : part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      ),
    );
  const blocks = text.replace(/```[\s\S]*?```/g, "").split(/\n{2,}/);
  return (
    <>
      {blocks.map((b, i) => {
        const lines = b.split("\n").filter(Boolean);
        if (lines.length && lines.every((l) => /^\s*([-*]|\d+\.)\s/.test(l)))
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*([-*]|\d+\.)\s/, ""))}</li>
              ))}
            </ul>
          );
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {inline(l.replace(/^#+\s*/, ""))}
              </Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}

function Steps({ steps }: { steps: Step[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="steps">
      {steps.map((s) => (
        <div key={s.id}>
          <div className={`step ${s.state === "err" ? "err" : ""}`} onClick={() => setOpen(open === s.id ? null : s.id)} style={{ cursor: "pointer" }}>
            {s.state === "running" ? <span className="spinner" style={{ width: 11, height: 11 }} /> : s.state === "ok" ? <Check /> : <Cross />}
            <span>{TOOL_LABEL[s.name] ?? s.name}</span>
            {s.summary && <span className="what">{s.summary}</span>}
          </div>
          {open === s.id && s.output && (
            <pre className="card" style={{ margin: "4px 0", padding: 8, maxHeight: 220, overflow: "auto", fontSize: 11.5, boxShadow: "none", whiteSpace: "pre-wrap" }}>
              {s.output}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}

export function Chat({
  projectId,
  onTurnEnd,
  onBuildingChange,
  selection = null,
  onClearSelection = () => {},
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
  // Follow-ups typed while the builder works are sent, in order, when it finishes.
  const [queue, setQueue] = useState<{ text: string; mode: Mode }[]>([]);
  const queueRef = useRef(queue);
  queueRef.current = queue;
  const [planTurn, setPlanTurn] = useState<string | null>(null);
  const [live, setLive] = useState<Item[]>([]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const attach = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    try {
      for (const file of [...files].slice(0, 6)) {
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
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState("");
  const logRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const load = () =>
    api<{ messages: Message[]; tasks?: TaskRow[]; building: boolean; pendingPlanTurn?: string | null }>(`/projects/${projectId}/chat`).then((r) => {
      setItems(toItems(r.messages, r.tasks));
      setPlanTurn(r.pendingPlanTurn ?? null);
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

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [items, live]);

  const setBusy = (b: boolean) => {
    setBuilding(b);
    onBuildingChange(b);
  };

  async function send(text: string, opts: { mode?: Mode; implementPlan?: boolean } = {}) {
    if (!text.trim()) return;
    const turnMode = opts.mode ?? mode;
    setInput("");
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
          for (const t of e.tasks as { id: string; role: string; goal: string; dependsOn: string[] }[]) Object.assign(lane(t.id, t.role), { goal: t.goal, dependsOn: t.dependsOn });
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

  const all = [...items, ...live];
  const lastTurnIsPlan = !!planTurn && !building && items[items.length - 1]?.kind === "ai";
  return (
    <section className="chat">
      <div className="chat-log" ref={logRef}>
        {all.length === 0 && (
          <div className="empty">
            <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>Cuéntame qué construimos</div>
            Describe pantallas, datos y quién la usará. Puedes pedir cambios en cualquier momento.
          </div>
        )}
        {all.map((it, i) =>
          it.kind === "user" ? (
            <div key={i} className="msg-user">
              {it.attachments?.map((a) => (
                <div key={a} className="small" style={{ opacity: 0.85, marginBottom: 4 }}>
                  📎 {fileName(a)}
                </div>
              ))}
              {it.element && (
                <div className="small" style={{ opacity: 0.85, marginBottom: 4 }}>
                  ⌖ {it.element}
                </div>
              )}
              <UserText text={it.text} />
            </div>
          ) : it.kind === "ai" ? (
            <div key={i} className="msg-ai">
              <Markdown text={it.text} />
            </div>
          ) : it.kind === "team" ? (
            <AgentLanes key={i} team={it.team} />
          ) : it.kind === "github" ? (
            <GithubCommitCard key={i} card={it.card} busy={false} onFix={(text) => void send(text, { mode: "build" })} />
          ) : (
            <Steps key={i} steps={it.steps} />
          ),
        )}
        {lastTurnIsPlan && (
          <div className="row" style={{ gap: 8 }}>
            <button className="primary sm" onClick={() => send("Implementa el plan.", { mode: "build", implementPlan: true })}>
              ▶ Implementar plan
            </button>
            <span className="small muted">o escribe qué cambiar y lo rehago</span>
          </div>
        )}
        {building && (
          <div className="row muted small">
            <span className="spinner" /> {live.some((it) => it.kind === "team" && it.team.lanes.some((l) => l.role === "chat")) ? "Pensando…" : "Construyendo…"}
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
        {attachments.length > 0 && (
          <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
            {attachments.map((a) => (
              <span key={a} className="selection-chip" style={{ padding: "3px 8px" }}>
                📎 {fileName(a)}
                <button className="ghost sm icon-btn" style={{ height: 20, width: 20 }} aria-label={`Quitar ${fileName(a)}`} onClick={() => setAttachments((x) => x.filter((y) => y !== a))}>
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        {selection && (
          <div className="selection-chip">
            ⌖ <code title={selection.html}>{selection.selector}</code>
            <button className="ghost sm icon-btn" style={{ height: 22, width: 22 }} aria-label="Quitar selección" onClick={onClearSelection}>
              ×
            </button>
          </div>
        )}
        <textarea
          placeholder={building ? "Envía un seguimiento: se manda al terminar…" : selection ? "¿Qué cambio en este elemento?" : MODES[mode].placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
        />
        <div className="row">
          <div className="segmented mode-switch" role="radiogroup" aria-label="Modo del chat">
            {(Object.keys(MODES) as Mode[]).map((m) => (
              <button key={m} role="radio" aria-checked={mode === m} className={mode === m ? "on" : ""} title={MODES[m].hint} onClick={() => setMode(m)}>
                {MODES[m].label}
              </button>
            ))}
          </div>
          <span className="grow" />
          {building ? (
            <>
              <button className="sm" disabled={!input.trim()} onClick={() => send(input)}>
                Poner en cola
              </button>
              <button className="sm" onClick={() => api(`/projects/${projectId}/chat/stop`, { body: {} })}>
                Detener
              </button>
            </>
          ) : (
            <>
              <input ref={fileInput} type="file" multiple hidden accept="image/*,.pdf,.txt,.md,.csv,.json,.svg" onChange={(e) => void attach(e.target.files)} />
              <button className="sm ghost icon-btn" title="Adjuntar imágenes o archivos (logo, captura, CSV…)" aria-label="Adjuntar archivo" disabled={uploading} onClick={() => fileInput.current?.click()}>
                {uploading ? <span className="spinner" /> : "📎"}
              </button>
              <button className="primary sm" disabled={!input.trim()} onClick={() => send(input)}>
                <Send /> Enviar
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
