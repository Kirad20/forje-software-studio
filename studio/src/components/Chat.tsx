import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { api, streamPost } from "../api";
import { Check, Cross, Send } from "./Icons";

type Block =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string; is_error?: boolean };

interface Message {
  role: "user" | "assistant";
  content: Block[];
}

interface Step {
  id: string;
  name: string;
  summary: string;
  state: "running" | "ok" | "err";
  output?: string;
}

/** A rendered turn item: user text, assistant text, or a group of tool steps. */
type Item = { kind: "user"; text: string; element?: string } | { kind: "ai"; text: string } | { kind: "steps"; steps: Step[] };

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

function userItem(text: string): Item {
  const i = text.indexOf(ELEMENT_MARK);
  if (i < 0) return { kind: "user", text };
  const selector = /Selector: (.*)/.exec(text.slice(i))?.[1] ?? "elemento";
  return { kind: "user", text: text.slice(0, i), element: selector };
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

function toItems(messages: Message[]): Item[] {
  const results = new Map<string, Extract<Block, { type: "tool_result" }>>();
  for (const m of messages) for (const b of m.content) if (b.type === "tool_result") results.set(b.tool_use_id, b);
  const items: Item[] = [];
  const pushStep = (s: Step) => {
    const last = items[items.length - 1];
    if (last?.kind === "steps") last.steps.push(s);
    else items.push({ kind: "steps", steps: [s] });
  };
  for (const m of messages) {
    for (const b of m.content) {
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
}: {
  projectId: string;
  onTurnEnd: () => void;
  onBuildingChange: (b: boolean) => void;
  selection?: SelectedElement | null;
  onClearSelection?: () => void;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [live, setLive] = useState<Item[]>([]);
  const [input, setInput] = useState("");
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState("");
  const logRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const load = () =>
    api<{ messages: Message[]; building: boolean }>(`/projects/${projectId}/chat`).then((r) => {
      setItems(toItems(r.messages));
      return r;
    });

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

  async function send(text: string) {
    if (!text.trim() || building) return;
    setInput("");
    setError("");
    setBusy(true);
    const message = withElement(text, selection);
    onClearSelection();
    const turn: Item[] = [userItem(message)];
    setLive([...turn]);
    const update = () => setLive([...turn]);
    try {
      await streamPost(`/projects/${projectId}/chat`, { message }, (e) => {
        if (e.type === "text") turn.push({ kind: "ai", text: e.text });
        else if (e.type === "tool_start") {
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
  }

  const all = [...items, ...live];
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
              {it.element && (
                <div className="small" style={{ opacity: 0.85, marginBottom: 4 }}>
                  ⌖ {it.element}
                </div>
              )}
              {it.text}
            </div>
          ) : it.kind === "ai" ? (
            <div key={i} className="msg-ai">
              <Markdown text={it.text} />
            </div>
          ) : (
            <Steps key={i} steps={it.steps} />
          ),
        )}
        {building && (
          <div className="row muted small">
            <span className="spinner" /> Construyendo…
          </div>
        )}
        {error && <div className="error-box">{error}</div>}
      </div>
      <div className="composer">
        {selection && (
          <div className="selection-chip">
            ⌖ <code title={selection.html}>{selection.selector}</code>
            <button className="ghost sm icon-btn" style={{ height: 22, width: 22 }} aria-label="Quitar selección" onClick={onClearSelection}>
              ×
            </button>
          </div>
        )}
        <textarea
          placeholder={building ? "Espera a que termine o detenlo…" : selection ? "¿Qué cambio en este elemento?" : "Pide un cambio o una función nueva…"}
          value={input}
          disabled={building}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
        />
        <div className="row">
          <span className="small muted grow">Enter para enviar · Shift+Enter nueva línea</span>
          {building ? (
            <button className="sm" onClick={() => api(`/projects/${projectId}/chat/stop`, { body: {} })}>
              Detener
            </button>
          ) : (
            <button className="primary sm" disabled={!input.trim()} onClick={() => send(input)}>
              <Send /> Enviar
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
