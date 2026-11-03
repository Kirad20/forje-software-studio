import type { LogEntry, ProjectEvent } from "./events.js";
export type ProblemKind = "build" | "runtime" | "network" | "server";
export interface Problem {
  id: string; kind: ProblemKind; title: string; detail: string; file?: string; line?: number; status?: number;
  count: number; firstAt: string; lastAt: string;
}
export interface BuildProblem { file: string; text: string; line?: number; column?: number }
export interface ProblemPorts {
  readAllFiles(projectId: string): Promise<Record<string, string>>;
  checkProject(files: Record<string, string>): Promise<BuildProblem[]>;
  formatProblem(problem: BuildProblem): string;
}
export interface ProblemRepository { get(projectId: string): Map<string, Problem> }
export interface ProblemEffects {
  now(): string;
  fingerprint(kind: string, text: string): string;
  emit(projectId: string, event: ProjectEvent): unknown;
  subscribe(projectId: string, listener: (event: ProjectEvent) => void): () => void;
  schedule(key: string, delay: number, action: () => void): void;
  stopTimers(): void;
}
function locate(text: string): { file?: string; line?: number } {
  const m = /((?:pages|components|helpers|endpoints|jobs)\/[\w./[\]-]+\.(?:tsx?|jsx?|css))(?::(\d+))?/.exec(text);
  return m ? { file: m[1], line: m[2] ? Number(m[2]) : undefined } : {};
}
export function formatProblems(list: Problem[], max = 12): string {
  if (!list.length) return "Sin problemas: compila y no hay errores recientes en la vista previa.";
  const labels: Record<ProblemKind, string> = { build: "COMPILACIÓN", runtime: "NAVEGADOR", network: "RED", server: "SERVIDOR" };
  return list.slice(0, max).map((p) => {
    const where = p.file ? ` (${p.file}${p.line ? `:${p.line}` : ""})` : "";
    const times = p.count > 1 ? ` ×${p.count}` : "";
    const detail = p.detail && p.detail !== p.title ? `\n${p.detail.slice(0, 1200)}` : "";
    return `[${labels[p.kind]}]${times} ${p.title}${where}${detail}`;
  }).join("\n\n");
}
export function createProblemService(repository: ProblemRepository, ports: ProblemPorts, effects: ProblemEffects) {
  const subscriptions = new Map<string, () => void>();
  const checks = new Set<Promise<Problem[]>>();
  let generation = 0;
  function listProblems(projectId: string): Problem[] {
    const order: Record<ProblemKind, number> = { build: 0, server: 1, runtime: 2, network: 3 };
    return [...repository.get(projectId).values()].sort((a, b) => order[a.kind] - order[b.kind] || b.lastAt.localeCompare(a.lastAt));
  }
  function changed(projectId: string) {
    effects.schedule(`emit:${projectId}`, 250, () => effects.emit(projectId, { type: "problems", problems: listProblems(projectId) }));
  }
  function clearProblems(projectId: string, kinds?: ProblemKind[]) {
    for (const [id, p] of repository.get(projectId)) if (!kinds || kinds.includes(p.kind)) repository.get(projectId).delete(id);
    changed(projectId);
  }
  function upsert(projectId: string, p: Omit<Problem, "id" | "count" | "firstAt" | "lastAt">) {
    const map = repository.get(projectId);
    const id = effects.fingerprint(p.kind, p.title + p.detail.slice(0, 200));
    const now = effects.now(), prev = map.get(id);
    if (prev) Object.assign(prev, { count: prev.count + 1, lastAt: now, detail: p.detail });
    else {
      map.set(id, { ...p, id, count: 1, firstAt: now, lastAt: now });
      if (map.size > 40) map.delete(map.keys().next().value!);
    }
    changed(projectId);
  }
  function fromLog(projectId: string, e: LogEntry) {
    if (e.env !== "preview") return;
    const first = e.message.split("\n")[0]!.slice(0, 300);
    if (e.source === "client" && e.level === "error") {
      const net = /^NETWORK (\w+) (\S+) → (\d{3}|ERR)(?::\s*([\s\S]*))?$/.exec(e.message);
      if (net) return upsert(projectId, { kind: "network", title: `${net[1]} ${net[2]} → ${net[3]}`, detail: (net[4] ?? "").slice(0, 2000), status: net[3] === "ERR" ? undefined : Number(net[3]) });
      return upsert(projectId, { kind: "runtime", title: first, detail: e.message.slice(0, 4000), ...locate(e.message) });
    }
    if ((e.source === "endpoint" || e.source === "job") && e.level === "error") upsert(projectId, { kind: "server", title: first, detail: e.message.slice(0, 4000), ...locate(e.message) });
  }
  function recheckBuild(projectId: string): Promise<Problem[]> {
    const epoch = generation;
    const work = (async () => {
      const problems = await ports.checkProject(await ports.readAllFiles(projectId)).catch((e: Error) => [{ file: "", text: e.message }] as BuildProblem[]);
      if (epoch !== generation) return [];
      const map = repository.get(projectId);
      for (const [id, p] of map) if (p.kind === "build") map.delete(id);
      for (const b of problems.slice(0, 15)) {
        const text = b.file ? ports.formatProblem(b) : b.text, now = effects.now(), id = effects.fingerprint("build", text);
        map.set(id, { id, kind: "build", title: text.split("\n")[0]!.slice(0, 300), detail: text, file: b.file || undefined, line: b.line, count: 1, firstAt: now, lastAt: now });
      }
      changed(projectId);
      return listProblems(projectId).filter((p) => p.kind === "build");
    })();
    checks.add(work);
    void work.finally(() => checks.delete(work)).catch(() => {});
    return work;
  }
  function watchProblems(projectId: string) {
    if (subscriptions.has(projectId)) return;
    subscriptions.set(projectId, effects.subscribe(projectId, (e) => {
      if (e.type === "log") fromLog(projectId, e.entry);
      else if (e.type === "files") {
        clearProblems(projectId, ["runtime", "network", "server"]);
        effects.schedule(`build:${projectId}`, 800, () => void recheckBuild(projectId).catch(() => {}));
      }
    }));
  }
  async function stopProblems() {
    generation++;
    for (const unsubscribe of subscriptions.values()) unsubscribe();
    subscriptions.clear();
    effects.stopTimers();
    await Promise.allSettled([...checks]);
  }
  return { listProblems, clearProblems, recheckBuild, watchProblems, stopProblems, formatProblems };
}
