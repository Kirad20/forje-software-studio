import type { FileMap } from "../../projects/index.js";
import { endpointRoutes, jobFiles, readProjectServices, SERVICES_MANIFEST } from "../../app-runtime/index.js";
import { COMPONENTS_MANIFEST, componentOf, isPathPattern, layoutOf, matchesPathPattern, parseLayout, type ProjectLayout } from "../../../../contracts/projectLayout.js";
import { buildIndex } from "./projectIndex.js";
import { rewriteImports } from "./rename.js";

/**
 * Migrating a legacy (native) project to forja.json components, one bounded context at a
 * time. Legacy projects keep working as they are; this only moves a context when asked:
 *
 *   endpoints/<ctx>/**     → services/<ctx>/endpoints/**   (api route = <ctx>: public URLs do not change)
 *   helpers/<ctx>/**       → services/<ctx>/**             (server code: domain, ports, application, adapters)
 *                          → packages/<ctx>/**             (what pages or components import: a library)
 *   jobs/<name>.ts         → services/<ctx>/jobs/<name>.ts (jobs of its forja.services.json service or that use only it)
 *
 * Jobs keep their names (legacyJobNames), so queued work, timers, settings and every
 * ctx.jobs.enqueue("name") call keep working. Pure: nothing is written here.
 */

const NAME = /^[a-z][a-z0-9-]{0,39}$/;
const ROUTE = /^[a-z0-9][a-z0-9-]*$/;

export interface ContextPlan {
  context: string;
  component: string;
  kind: "api" | "worker";
  root: string;
  library: { component: string; root: string } | null;
  moves: { from: string; to: string }[];
  /** Public routes after the move ("POST orders/create"); unchanged unless routeChanges says so. */
  routes: string[];
  routeChanges: { from: string; to: string }[];
  jobs: string[];
  tables: { exclusive: string[]; shared: string[] };
  replicas: number | null;
  maxConcurrency: number | null;
  warnings: string[];
}

export interface MigrationPlan {
  legacy: boolean;
  contexts: ContextPlan[];
  /** Files that stay in the app (root): pages, components, shared helpers, unassigned endpoints and jobs. */
  staysInApp: number;
  notes: string[];
}

const sanitize = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").replace(/^(\d)/, "c$1");

function uniqueName(base: string, taken: Set<string>): string {
  let name = NAME.test(base) && !["app", "monolith"].includes(base) ? base : `${base || "context"}-service`.replace(/^(\d)/, "c$1");
  for (let i = 2; taken.has(name); i++) name = `${base}-${i}`;
  return name;
}

/** Files reachable from browser code (pages and components), following imports. */
function clientReachable(files: FileMap): Set<string> {
  const idx = buildIndex(files);
  const seen = new Set<string>();
  const stack = Object.keys(files).filter((f) => /^(pages|components)\/.+\.(tsx?|css)$/.test(f));
  while (stack.length) {
    const f = stack.pop()!;
    if (seen.has(f)) continue;
    seen.add(f);
    for (const i of idx.facts.get(f)?.imports ?? []) stack.push(i);
  }
  return seen;
}

function contextOfHelper(file: string): string | null {
  return /^helpers\/([^/]+)\/.+/.exec(file)?.[1] ?? null;
}

/** Proposes one component per bounded context of the native part of the project. */
export function planComponentMigration(files: FileMap): MigrationPlan {
  const layout = layoutOf(files);
  const idx = buildIndex(files);
  const client = clientReachable(files);
  const services = (() => { try { return readProjectServices(files); } catch { return null; } })();
  const native = (f: string) => componentOf(f, layout)?.component.kind === "app";
  const endpoints = Object.keys(files).filter((f) => native(f) && /^endpoints\/[^/]+\/.+_(GET|POST)\.ts$/.test(f));
  const jobs = Object.keys(files).filter((f) => native(f) && /^jobs\/[A-Za-z0-9_-]+\.ts$/.test(f));
  const contexts = new Set<string>([
    ...endpoints.map((f) => f.split("/")[1]!),
    ...Object.keys(files).filter((f) => native(f) && contextOfHelper(f)).map((f) => contextOfHelper(f)!),
  ]);
  // A forja.services.json worker with only jobs is a context of its own.
  for (const [name, service] of Object.entries(services?.services ?? {})) if (service.kind === "worker" && service.jobs.length) contexts.add(name);

  const packages = new Set(Object.values(files).flatMap((c) => [...c.matchAll(/\b(?:import|export)\b[^;"'`]*?\bfrom\s*["']([^"'./][^"'/]*)["']/g)].map((m) => m[1]!.toLowerCase())));
  const taken = new Set(layout.components.map((c) => c.name));
  const takenRoots = layout.components.map((c) => c.root).filter(Boolean);
  const jobOwner = new Map<string, string>();
  for (const job of jobs) {
    const service = Object.entries(services?.services ?? {}).find(([, s]) => s.jobs.includes(job));
    if (service && contexts.has(service[0])) { jobOwner.set(job, service[0]); continue; }
    const used = new Set((idx.facts.get(job)?.imports ?? []).map(contextOfHelper).filter((c): c is string => !!c));
    if (used.size === 1) jobOwner.set(job, [...used][0]!);
  }

  const plans: ContextPlan[] = [];
  for (const context of [...contexts].sort()) {
    const component = uniqueName(sanitize(context), taken);
    taken.add(component);
    const root = `services/${component}/`;
    const ctxEndpoints = endpoints.filter((f) => f.split("/")[1] === context);
    const ctxHelpers = Object.keys(files).filter((f) => native(f) && contextOfHelper(f) === context);
    const ctxJobs = jobs.filter((j) => jobOwner.get(j) === context);
    if (!ctxEndpoints.length && !ctxJobs.length && !ctxHelpers.length) continue;
    const toLibrary = ctxHelpers.filter((f) => client.has(f) || (f.endsWith(".spec.ts") && client.has(f.replace(/\.spec\.ts$/, ".ts"))));
    const library = toLibrary.length ? { component: uniqueName(`${component}-shared`, taken), root: `packages/${component}/` } : null;
    if (library) taken.add(library.component);
    const warnings: string[] = [];
    if ([root, library?.root].some((r) => r && takenRoots.some((t) => r.startsWith(t) || t.startsWith(r)))) warnings.push(`La carpeta ${root} ya la usa otro componente.`);
    const moves = [
      ...ctxEndpoints.map((f) => ({ from: f, to: `${root}endpoints/${f.split("/").slice(2).join("/")}` })),
      ...ctxHelpers.map((f) => ({ from: f, to: `${toLibrary.includes(f) ? library!.root : root}${f.split("/").slice(2).join("/")}` })),
      ...ctxJobs.map((f) => ({ from: f, to: `${root}${f}` })),
    ];
    const route = ROUTE.test(context) ? context : component;
    const routeChanges = route === context ? [] : ctxEndpoints.map((f) => {
      const m = /^endpoints\/(.+)_(GET|POST)\.ts$/.exec(f)!;
      return { from: `${m[2]} ${m[1]}`, to: `${m[2]} ${route}/${m[1]!.split("/").slice(1).join("/")}` };
    });
    if (routeChanges.length) warnings.push(`"${context}" no puede ser un prefijo de ruta: las URLs pasarían a /_api/${route}/…; actualiza a quien las llame o renombra antes la carpeta.`);
    const routes = ctxEndpoints.map((f) => {
      const m = /^endpoints\/(.+)_(GET|POST)\.ts$/.exec(f)!;
      return `${m[2]} ${route}/${m[1]!.split("/").slice(1).join("/")}`;
    });
    const moving = new Set(moves.map((m) => m.from));
    const serverFiles = moves.filter((m) => m.to.startsWith(root)).map((m) => m.from);
    // The index's SQL heuristic also catches `from "zod"`: package names are not tables.
    const isTable = (t: string) => !packages.has(t);
    const ctxTables = new Set(serverFiles.flatMap((f) => idx.facts.get(f)?.tables ?? []).filter(isTable));
    const elsewhere = new Set(Object.keys(files).filter((f) => !moving.has(f) && !f.startsWith("migrations/")).flatMap((f) => idx.facts.get(f)?.tables ?? []).filter(isTable));
    const tables = { exclusive: [...ctxTables].filter((t) => !elsewhere.has(t)).sort(), shared: [...ctxTables].filter((t) => elsewhere.has(t)).sort() };
    for (const f of serverFiles) {
      for (const imported of idx.facts.get(f)?.imports ?? []) {
        if (moving.has(imported)) continue;
        const other = contextOfHelper(imported);
        if (other && other !== context) warnings.push(`${f} importa ${imported} (contexto ${other}): tras extraer ambos, comunícalos por HTTP o eventos, o mueve lo compartido a una library.`);
        else if (/^helpers\/[^/]+\.ts$/.test(imported)) warnings.push(`${f} comparte ${imported} con la app; funciona igual, pero conviene moverlo a una library.`);
      }
    }
    for (const f of toLibrary.filter((f) => /\badapters?\b/.test(f))) warnings.push(`${f} es un adaptador de servidor importado desde el navegador: irá a la library ${library!.root}; sácalo del código de las páginas.`);
    const service = Object.values(services?.services ?? {}).find((s) => [...ctxEndpoints, ...ctxJobs].some((f) => s.endpoints.includes(f) || s.jobs.includes(f)));
    plans.push({
      context, component, kind: ctxEndpoints.length ? "api" : "worker", root, library, moves, routes, routeChanges,
      jobs: ctxJobs.map((j) => j.slice(5, -3)), tables, replicas: service?.replicas ?? null, maxConcurrency: service?.maxConcurrency ?? null,
      warnings: [...new Set(warnings)],
    });
  }
  const moved = new Set(plans.flatMap((p) => p.moves.map((m) => m.from)));
  const notes = [
    "Las rutas /_api y los nombres de las tareas se conservan; las páginas siguen en la app.",
    "Extrae un contexto cada vez con extract_component y comprueba con check_build y call_endpoint antes del siguiente.",
    "La base de datos sigue compartida. Para darle a un servicio su propio esquema, extrae con database: true y move_tables con sus tablas exclusivas.",
  ];
  if (!layout.manifest && !plans.length) notes.unshift("No hay contextos que extraer: el proyecto no tiene endpoints/<contexto>/ ni helpers/<contexto>/. Organízalo primero por contextos (ver el manual) o déjalo como monolito.");
  return { legacy: !layout.manifest, contexts: plans, staysInApp: Object.keys(files).filter((f) => native(f) && !moved.has(f)).length, notes };
}

export interface ExtractOptions {
  context: string;
  /** Component name (defaults to the plan's). */
  name?: string;
  /** Give the component its own Postgres schema. */
  database?: boolean;
  /** Tables to move from public into the component's schema (must be exclusive to the context). */
  moveTables?: string[];
  /** Migration file name timestamp, for deterministic tests. */
  now?: Date;
}

export interface Extraction {
  plan: ContextPlan;
  /** Final project files after the extraction. */
  files: FileMap;
  /** Renames to perform (in order), then files to write with their final content, then files to delete. */
  renames: { from: string; to: string }[];
  writes: FileMap;
  deletes: string[];
  migration: string | null;
}

const migrationId = (now: Date) => now.toISOString().replace(/\D/g, "").slice(0, 17).padStart(17, "0");

/** Everything one extraction changes, computed in memory. Throws with the reason when it cannot. */
export function extractComponent(files: FileMap, options: ExtractOptions): Extraction {
  const plan0 = planComponentMigration(files).contexts.find((c) => c.context === options.context);
  if (!plan0) throw new Error(`No hay un contexto "${options.context}" que extraer. Consulta architecture_migration_plan para ver los disponibles.`);
  const name = options.name ?? plan0.component;
  if (!NAME.test(name)) throw new Error(`Nombre de componente no válido: "${name}".`);
  const root = `services/${name}/`;
  const plan: ContextPlan = name === plan0.component ? plan0 : { ...plan0, component: name, root, moves: plan0.moves.map((m) => ({ ...m, to: m.to.startsWith(plan0.root) ? root + m.to.slice(plan0.root.length) : m.to })) };
  const schema = name.replaceAll("-", "_");
  const moveTables = options.moveTables ?? [];
  if (moveTables.length && !options.database) throw new Error("move_tables necesita database: true.");
  const notExclusive = moveTables.filter((t) => !plan.tables.exclusive.includes(t));
  if (notExclusive.length) {
    throw new Error(`No se pueden mover ${notExclusive.join(", ")}: solo las tablas que usa únicamente este contexto (${plan.tables.exclusive.join(", ") || "ninguna"}). Las compartidas deben dejar de usarse desde fuera primero (API o eventos).`);
  }

  // forja.json first: the moved paths are valid only once it declares their component.
  const manifest = files[COMPONENTS_MANIFEST] ? JSON.parse(files[COMPONENTS_MANIFEST]!) : { version: 1, components: {} };
  if (manifest.components?.[name]) throw new Error(`Ya existe un componente "${name}" en forja.json; usa name para elegir otro.`);
  const route = plan.kind === "api" ? plan.routes[0]?.split(" ")[1]?.split("/")[0] ?? name : null;
  const sameRoute = route ? Object.entries<Record<string, unknown>>(manifest.components ?? {}).find(([n, c]) => c.kind === "api" && (c.route ?? n) === route) : undefined;
  if (sameRoute) {
    throw new Error(`El componente "${sameRoute[0]}" ya sirve /_api/${route}/. Mueve estos archivos dentro de él con rename_file (${plan.moves.map((m) => m.from).join(", ")}) en lugar de extraer otro componente.`);
  }
  const entry: Record<string, unknown> = { kind: plan.kind, root: root.slice(0, -1), description: `Extraído de los archivos legacy del contexto ${plan.context}` };
  if (route) entry.route = route;
  if (plan.jobs.length) entry.legacyJobNames = true;
  if (plan.replicas !== null) entry.replicas = plan.replicas;
  if (plan.maxConcurrency !== null) entry.maxConcurrency = plan.maxConcurrency;
  if (options.database) entry.database = schema;
  manifest.components = { ...manifest.components, [name]: entry };
  if (plan.library) manifest.components[plan.library.component] = { kind: "library", root: plan.library.root.slice(0, -1), description: `Código del contexto ${plan.context} que usa el frontend` };
  const manifestSource = JSON.stringify(manifest, null, 2) + "\n";
  parseLayout(manifestSource);

  let map: FileMap = { ...files, [COMPONENTS_MANIFEST]: manifestSource };
  const changed = new Set<string>([COMPONENTS_MANIFEST]);
  for (const { from, to } of plan.moves) {
    if (to in map) throw new Error(`Ya existe ${to}.`);
    const rewrites = rewriteImports(map, from, to);
    const content = map[from]!;
    delete map[from];
    map[to] = content;
    if (changed.delete(from)) changed.add(to);
    for (const [p, c] of Object.entries(rewrites)) { map[p] = c; changed.add(p); }
  }

  // forja.services.json: moved files leave their legacy service; the component carries its scale.
  const deletes: string[] = [];
  if (files[SERVICES_MANIFEST]) {
    const services = JSON.parse(files[SERVICES_MANIFEST]!);
    const movedFrom = new Set(plan.moves.map((m) => m.from));
    // Patterns stay while they still match something that was not moved.
    const remaining = [...endpointRoutes(map).map((e) => e.file), ...jobFiles(map).map((j) => j.file)].filter((f) => !f.startsWith(root));
    const keep = (entry: string) => (isPathPattern(entry) ? remaining.some((f) => matchesPathPattern(entry, f)) : !movedFrom.has(entry));
    for (const [service, value] of Object.entries<Record<string, unknown>>(services.services ?? {})) {
      for (const field of ["endpoints", "jobs"]) if (Array.isArray(value[field])) value[field] = (value[field] as string[]).filter(keep);
      if (!(value.endpoints as string[] | undefined)?.length && !(value.jobs as string[] | undefined)?.length) delete services.services[service];
    }
    if (Object.keys(services.services ?? {}).length) {
      map[SERVICES_MANIFEST] = JSON.stringify(services, null, 2) + "\n";
      changed.add(SERVICES_MANIFEST);
    } else {
      delete map[SERVICES_MANIFEST];
      deletes.push(SERVICES_MANIFEST);
    }
  }

  let migration: string | null = null;
  if (moveTables.length) {
    migration = `${root}migrations/${migrationId(options.now ?? new Date())}_extract_${schema}.sql`;
    map[migration] = `-- Generated by extract_component: moves the tables only ${name} uses into its own schema.\n${moveTables.map((t) => `alter table public."${t}" set schema "${schema}";`).join("\n")}\n`;
  }

  const renames = plan.moves;
  const writes: FileMap = {};
  for (const p of changed) if (map[p] !== undefined && map[p] !== files[p]) writes[p] = map[p]!;
  for (const { to } of renames) if (map[to] !== files[renames.find((r) => r.to === to)!.from]) writes[to] = map[to]!;
  if (migration) writes[migration] = map[migration]!;
  return { plan, files: map, renames, writes, deletes, migration };
}

/** One line per context, for the agent. */
export function formatMigrationPlan(plan: MigrationPlan): string {
  const lines = [plan.legacy ? "Proyecto legacy (sin forja.json): sigue funcionando igual; migrar es opcional y por contextos." : "El proyecto ya tiene forja.json; estos contextos siguen en la app y se pueden extraer:"];
  for (const c of plan.contexts) {
    lines.push(
      `\n## ${c.context} → ${c.kind} "${c.component}" en ${c.root}${c.library ? ` + library "${c.library.component}" en ${c.library.root}` : ""}`,
      `- ${c.moves.length} archivos: ${c.moves.slice(0, 6).map((m) => `${m.from} → ${m.to}`).join("; ")}${c.moves.length > 6 ? `; +${c.moves.length - 6}` : ""}`,
      c.routes.length ? `- Rutas: ${c.routes.join(", ")}${c.routeChanges.length ? " (cambian)" : " (sin cambios)"}` : "- Sin endpoints",
      c.jobs.length ? `- Tareas (conservan su nombre): ${c.jobs.join(", ")}` : "",
      c.tables.exclusive.length || c.tables.shared.length ? `- Tablas exclusivas (movibles a su esquema): ${c.tables.exclusive.join(", ") || "ninguna"}; compartidas: ${c.tables.shared.join(", ") || "ninguna"}` : "",
      c.replicas !== null ? `- Escala heredada de forja.services.json: replicas ${c.replicas}, maxConcurrency ${c.maxConcurrency}` : "",
      ...c.warnings.map((w) => `- Aviso: ${w}`),
    );
  }
  lines.push(`\n${plan.staysInApp} archivos siguen en la app.`, ...plan.notes.map((n) => `- ${n}`));
  return lines.filter(Boolean).join("\n");
}

export type { ProjectLayout };
