import { createHash } from "node:crypto";
import { checkProject, formatProblem, type BuildProblem } from "../runtime/bundler.js";
import { emitProject, projectEvents, type LogEntry } from "./events.js";
import { readAllFiles } from "./projects.js";

/**
 * What is broken in a project's preview right now, deduplicated, so the studio can show it
 * next to the chat ("Intentar arreglar") and the builder can read it like a developer reads
 * the console: build errors, uncaught browser errors, failed API calls and server crashes.
 */
export type ProblemKind = "build" | "runtime" | "network" | "server";

export interface Problem {
  id: string;
  kind: ProblemKind;
  title: string;
  detail: string;
  file?: string;
  line?: number;
  status?: number;
  count: number;
  firstAt: string;
  lastAt: string;
}

const MAX = 40;
const state = new Map<string, Map<string, Problem>>();
const watched = new Set<string>();
const timers = new Map<string, NodeJS.Timeout>();

const fingerprint = (kind: string, text: string) =>
  createHash("sha1")
    .update(kind + "\0" + text.replace(/\d+ ms/g, "").replace(/:\d+:\d+\)?/g, "").replace(/\s+/g, " ").slice(0, 300))
    .digest("hex")
    .slice(0, 12);

/** The first project file a stack trace or build message points at. */
function locate(text: string): { file?: string; line?: number } {
  const m = /((?:pages|components|helpers|endpoints|jobs)\/[\w./[\]-]+\.(?:tsx?|jsx?|css))(?::(\d+))?/.exec(text);
  return m ? { file: m[1], line: m[2] ? Number(m[2]) : undefined } : {};
}

function upsert(projectId: string, p: Omit<Problem, "id" | "count" | "firstAt" | "lastAt">) {
  let map = state.get(projectId);
  if (!map) state.set(projectId, (map = new Map()));
  const id = fingerprint(p.kind, p.title + p.detail.slice(0, 200));
  const now = new Date().toISOString();
  const prev = map.get(id);
  if (prev) Object.assign(prev, { count: prev.count + 1, lastAt: now, detail: p.detail });
  else {
    map.set(id, { ...p, id, count: 1, firstAt: now, lastAt: now });
    if (map.size > MAX) map.delete(map.keys().next().value!);
  }
  changed(projectId);
}

function changed(projectId: string) {
  clearTimeout(timers.get(`emit:${projectId}`));
  timers.set(
    `emit:${projectId}`,
    setTimeout(() => emitProject(projectId, { type: "problems", problems: listProblems(projectId) }), 250),
  );
}

export function listProblems(projectId: string): Problem[] {
  const order: Record<ProblemKind, number> = { build: 0, server: 1, runtime: 2, network: 3 };
  return [...(state.get(projectId)?.values() ?? [])].sort((a, b) => order[a.kind] - order[b.kind] || b.lastAt.localeCompare(a.lastAt));
}

export function clearProblems(projectId: string, kinds?: ProblemKind[]) {
  const map = state.get(projectId);
  if (!map) return;
  for (const [id, p] of map) if (!kinds || kinds.includes(p.kind)) map.delete(id);
  changed(projectId);
}

/** Turns one preview log line into a problem when it is one. */
function fromLog(projectId: string, e: LogEntry) {
  if (e.env !== "preview") return;
  const first = e.message.split("\n")[0]!.slice(0, 300);
  if (e.source === "client" && e.level === "error") {
    // The preview's fetch wrapper reports failed API calls as "NETWORK <method> <path> → <status>: <body>".
    const net = /^NETWORK (\w+) (\S+) → (\d{3}|ERR)(?::\s*([\s\S]*))?$/.exec(e.message);
    if (net) {
      const status = net[3] === "ERR" ? undefined : Number(net[3]);
      return upsert(projectId, { kind: "network", title: `${net[1]} ${net[2]} → ${net[3]}`, detail: (net[4] ?? "").slice(0, 2000), status });
    }
    return upsert(projectId, { kind: "runtime", title: first, detail: e.message.slice(0, 4000), ...locate(e.message) });
  }
  if ((e.source === "endpoint" || e.source === "job") && e.level === "error") {
    return upsert(projectId, { kind: "server", title: first, detail: e.message.slice(0, 4000), ...locate(e.message) });
  }
}

/** Recomputes build problems from scratch: they disappear as soon as the code compiles. */
export async function recheckBuild(projectId: string): Promise<Problem[]> {
  const problems: BuildProblem[] = await checkProject(await readAllFiles(projectId)).catch((e: Error) => [{ file: "", text: e.message }]);
  const map = state.get(projectId) ?? new Map<string, Problem>();
  state.set(projectId, map);
  for (const [id, p] of map) if (p.kind === "build") map.delete(id);
  for (const b of problems.slice(0, 15)) {
    const text = b.file ? formatProblem(b) : b.text;
    const id = fingerprint("build", text);
    const now = new Date().toISOString();
    map.set(id, { id, kind: "build", title: text.split("\n")[0]!.slice(0, 300), detail: text, file: b.file || undefined, line: b.line, count: 1, firstAt: now, lastAt: now });
  }
  changed(projectId);
  return listProblems(projectId).filter((p) => p.kind === "build");
}

/**
 * Starts tracking a project (idempotent): logs become problems; on every code change the
 * old runtime errors are dropped (the page reloads and reports again if they persist) and
 * the build is re-checked after a short quiet period.
 */
export function watchProblems(projectId: string) {
  if (watched.has(projectId)) return;
  watched.add(projectId);
  projectEvents.on(projectId, (e) => {
    if (e.type === "log") fromLog(projectId, e.entry);
    else if (e.type === "files") {
      clearProblems(projectId, ["runtime", "network", "server"]);
      clearTimeout(timers.get(`build:${projectId}`));
      timers.set(`build:${projectId}`, setTimeout(() => void recheckBuild(projectId).catch(() => {}), 800));
    }
  });
}

/** Compact, model-friendly listing for the builder (the "console" it reads before fixing). */
export function formatProblems(list: Problem[], max = 12): string {
  if (!list.length) return "Sin problemas: compila y no hay errores recientes en la vista previa.";
  const label: Record<ProblemKind, string> = { build: "COMPILACIÓN", runtime: "NAVEGADOR", network: "RED", server: "SERVIDOR" };
  return list
    .slice(0, max)
    .map((p) => {
      const where = p.file ? ` (${p.file}${p.line ? `:${p.line}` : ""})` : "";
      const times = p.count > 1 ? ` ×${p.count}` : "";
      const detail = p.detail && p.detail !== p.title ? `\n${p.detail.slice(0, 1200)}` : "";
      return `[${label[p.kind]}]${times} ${p.title}${where}${detail}`;
    })
    .join("\n\n");
}
