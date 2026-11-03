/**
 * The planner's output: what submit_plan accepts and how it is checked.
 *
 * A plan is rejected, with every problem listed, instead of being quietly repaired: the
 * planner is still running and can fix it, whereas a task silently left without files, or
 * two tasks that overlap, only show up much later as a specialist that cannot write or
 * two specialists that overwrite each other.
 */

export type SpecialistRole = "data" | "backend" | "ui";

export interface PlanTask {
  id: string;
  role: SpecialistRole;
  goal: string;
  files: string[];
  dependsOn: string[];
  /** Observable results the reviewer checks one by one. */
  doneWhen: string[];
}

export interface Plan {
  summary: string;
  /** TypeScript source of helpers/contract.ts, the single source of truth for the API. */
  contract: string;
  tasks: PlanTask[];
  /** Work deliberately left for a later round, so a big request is built in phases. */
  later: string[];
}

/** Where the shared contract lives. Only the planner writes it; every specialist imports it. */
export const CONTRACT_FILE = "helpers/contract.ts";

export const ROLE_FOLDERS: Record<SpecialistRole, RegExp> = {
  data: /^(helpers\/|static\/__dev\/)/,
  backend: /^(endpoints\/|jobs\/|helpers\/|static\/)/,
  ui: /^(pages\/|components\/|base\.css$|static\/|helpers\/)/,
};

export const MAX_TASKS = 6;
export const MAX_GOAL = 4000;
export const MAX_CONTRACT = 12_000;
const MAX_CRITERIA = 8;
const MAX_LATER = 8;

type Raw = { id?: string; role?: string; goal?: string; files?: unknown; depends_on?: unknown; done_when?: unknown };

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : []);

/** A path or a folder prefix ending in "/" covers another when it is the same or contains it. */
export const covers = (owner: string, file: string) => owner === file || (owner.endsWith("/") && file.startsWith(owner));
const overlap = (a: string, b: string) => covers(a, b) || covers(b, a);

/** Task ids in dependency order, or null when the dependencies form a cycle. */
function order(tasks: PlanTask[]): string[] | null {
  const left = new Map(tasks.map((t) => [t.id, new Set(t.dependsOn)]));
  const out: string[] = [];
  while (left.size) {
    const ready = [...left].filter(([, deps]) => ![...deps].some((d) => left.has(d))).map(([id]) => id);
    if (!ready.length) return null;
    for (const id of ready) {
      left.delete(id);
      out.push(id);
    }
  }
  return out;
}

export function validatePlan(raw: unknown): { plan: Plan | null; errors: string[] } {
  const p = raw as { summary?: unknown; contract?: unknown; tasks?: unknown; later?: unknown } | null;
  const errors: string[] = [];
  if (!p || !Array.isArray(p.tasks) || !p.tasks.length) return { plan: null, errors: ["tasks está vacío: hace falta al menos una tarea."] };
  if (p.tasks.length > MAX_TASKS) errors.push(`Hay ${p.tasks.length} tareas y el máximo es ${MAX_TASKS}: agrupa las que son del mismo rol o deja lo demás para "later".`);

  const tasks: PlanTask[] = [];
  const seen = new Set<string>();
  for (const [i, t] of (p.tasks as Raw[]).slice(0, MAX_TASKS).entries()) {
    const at = `Tarea ${i + 1}${t?.id ? ` (${t.id})` : ""}`;
    const role = t?.role as SpecialistRole;
    if (!(role in ROLE_FOLDERS)) {
      errors.push(`${at}: role debe ser data, backend o ui.`);
      continue;
    }
    const id = String(t.id ?? "").trim();
    if (!/^[a-z0-9_-]{1,30}$/i.test(id)) errors.push(`${at}: id debe ser corto, con letras, números, guion o guion bajo.`);
    else if (seen.has(id)) errors.push(`${at}: el id "${id}" está repetido.`);
    seen.add(id);

    const goal = String(t.goal ?? "").trim();
    if (!goal) errors.push(`${at}: goal está vacío.`);
    else if (goal.length > MAX_GOAL) errors.push(`${at}: goal tiene ${goal.length} caracteres y el máximo es ${MAX_GOAL}: resume y apóyate en el contrato.`);

    const files = [...new Set(strings(t.files))];
    if (!files.length) errors.push(`${at}: files está vacío; una tarea sin archivos no puede escribir nada.`);
    for (const f of files) {
      if (!/^[\w$@./-]+$/.test(f) || f.startsWith("/") || f.includes("..")) errors.push(`${at}: "${f}" no es una ruta válida (usa rutas relativas exactas o carpetas terminadas en "/").`);
      else if (!ROLE_FOLDERS[role].test(f)) errors.push(`${at}: "${f}" queda fuera de lo que puede escribir el rol ${role}.`);
      else if (covers(f, CONTRACT_FILE)) errors.push(`${at}: "${f}" incluye ${CONTRACT_FILE}, que escribe solo el planeador (campo contract).`);
    }

    const doneWhen = strings(t.done_when).map((c) => c.slice(0, 300));
    if (!doneWhen.length) errors.push(`${at}: done_when está vacío; da de 1 a ${MAX_CRITERIA} resultados observables (qué debe verse o responder cuando termine).`);
    else if (doneWhen.length > MAX_CRITERIA) errors.push(`${at}: done_when tiene ${doneWhen.length} criterios y el máximo es ${MAX_CRITERIA}.`);

    tasks.push({ id, role, goal, files, dependsOn: strings(t.depends_on), doneWhen });
  }

  // A file belongs to exactly one task, counting folder prefixes against exact paths.
  for (const [i, a] of tasks.entries()) {
    for (const b of tasks.slice(i + 1)) {
      const clash = a.files.flatMap((x) => b.files.filter((y) => overlap(x, y)).map((y) => (x === y ? x : `${x} y ${y}`)));
      if (clash.length) errors.push(`Las tareas ${a.id} y ${b.id} comparten archivos (${clash.slice(0, 3).join(", ")}): cada archivo debe ser de una sola tarea.`);
    }
  }

  const ids = new Set(tasks.map((t) => t.id));
  for (const t of tasks) {
    for (const d of t.dependsOn) {
      if (d === t.id) errors.push(`La tarea ${t.id} depende de sí misma.`);
      else if (!ids.has(d)) errors.push(`La tarea ${t.id} depende de "${d}", que no existe.`);
    }
  }
  if (!errors.length && !order(tasks)) errors.push("Las dependencias (depends_on) forman un ciclo: ninguna tarea podría empezar.");

  const contract = String(p.contract ?? "").trim();
  if (!contract) errors.push(`contract está vacío: debe ser el código TypeScript completo de ${CONTRACT_FILE}.`);
  else if (contract.length > MAX_CONTRACT) errors.push(`contract tiene ${contract.length} caracteres y el máximo es ${MAX_CONTRACT}: si es tan grande, deja parte del alcance en "later".`);

  if (errors.length) return { plan: null, errors };
  return {
    plan: { summary: String(p.summary ?? "").slice(0, 2000), contract, tasks, later: strings(p.later).slice(0, MAX_LATER).map((l) => l.slice(0, 300)) },
    errors,
  };
}

/** `"GET todos/list": {` and `'POST todos/create': {` keys of the contract. */
export function contractRoutes(source: string): { method: "GET" | "POST"; route: string }[] {
  return [...source.matchAll(/["'`](GET|POST) ([a-z0-9][a-z0-9/_.-]*)["'`]\s*:/g)].map((m) => ({ method: m[1] as "GET" | "POST", route: m[2]! }));
}

/**
 * The contract against the plan: every route has an owner among the backend tasks and
 * every endpoint a backend task lists is in the contract, so no side can call or write
 * something the other does not know about.
 */
export function checkContract(plan: Plan): string[] {
  const errors: string[] = [];
  const source = plan.contract;
  const routes = contractRoutes(source);
  const backend = plan.tasks.filter((t) => t.role === "backend");

  if (!/from\s+["']zod["']/.test(source)) errors.push(`${CONTRACT_FILE} debe importar zod: cada ruta define sus esquemas de entrada y de salida.`);
  if (!/\bexport\s+const\s+contract\b/.test(source)) errors.push(`${CONTRACT_FILE} debe exportar "export const contract = { … } as const" con una entrada por ruta.`);
  if (backend.length && !routes.length) errors.push(`El contrato no define ninguna ruta, pero hay tareas de backend: añade claves como "GET todos/list" o "POST todos/create".`);

  for (const r of routes) {
    const file = `endpoints/${r.route}_${r.method}.ts`;
    if (!backend.some((t) => t.files.some((f) => covers(f, file)))) errors.push(`La ruta "${r.method} ${r.route}" del contrato no tiene dueño: ningún backend incluye ${file} en files.`);
  }
  const known = new Set(routes.map((r) => `endpoints/${r.route}_${r.method}.ts`));
  for (const t of backend) {
    for (const f of t.files) {
      if (/^endpoints\/.+_(GET|POST)\.ts$/.test(f) && !known.has(f)) errors.push(`La tarea ${t.id} escribe ${f}, que no está en el contrato: añade la ruta al contrato o quita el archivo.`);
    }
  }

  const inputs = source.match(/\binput\s*:/g)?.length ?? 0;
  const outputs = source.match(/\boutput\s*:/g)?.length ?? 0;
  if (routes.length && (inputs < routes.length || outputs < routes.length)) {
    errors.push(`Cada ruta necesita input y output (hay ${routes.length} rutas, ${inputs} input y ${outputs} output).`);
  }
  return errors;
}

/** The plan as the specialists and the reviewer read it: one line per task plus its criteria. */
export const planOverview = (plan: Plan) =>
  plan.tasks
    .map((t) => `- ${t.id} (${t.role}): ${t.goal.split("\n")[0]!.slice(0, 160)} · archivos: ${t.files.join(", ") || "—"}${t.dependsOn.length ? ` · después de ${t.dependsOn.join(", ")}` : ""}`)
    .join("\n");

/** What a task is judged by, for its specialist and for the reviewer. */
export const criteriaOf = (t: PlanTask) => (t.doneWhen.length ? t.doneWhen.map((c) => `- ${c}`).join("\n") : "");
