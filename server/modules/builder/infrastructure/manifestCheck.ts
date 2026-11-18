import type { FileMap } from "../../projects/index.js";
import { endpointRoutes, jobFiles, pageRoutes, readProjectServices, SERVICES_MANIFEST } from "../../app-runtime/index.js";
import {
  COMPONENTS_MANIFEST, componentOf, DEFAULT_CONVENTIONS, DEFAULT_PATHS, isNativeProjectPath, layoutMigrations, layoutProblems, parseLayout,
  type ProjectComponent,
} from "../../../../contracts/projectLayout.js";

/**
 * How a project maps under a proposed forja.json and/or forja.services.json, without writing:
 * the components with their paths and conventions, what each serves (pages, endpoints, jobs,
 * migrations), the service topology with its patterns expanded, the problems and the files
 * left outside every component. For mapping projects that come with another structure.
 */
export function checkManifests(current: FileMap, proposed: { components?: string; services?: string }): string {
  const files: FileMap = { ...current };
  if (proposed.components !== undefined) files[COMPONENTS_MANIFEST] = proposed.components;
  if (proposed.services !== undefined) files[SERVICES_MANIFEST] = proposed.services;
  const lines: string[] = [];
  let layout;
  try {
    layout = parseLayout(files[COMPONENTS_MANIFEST]);
  } catch (error) {
    return `forja.json no es válido: ${(error as Error).message}\nNo se ha escrito nada.`;
  }
  const pages = pageRoutes(files, layout), endpoints = endpointRoutes(files, layout), jobs = jobFiles(files, layout);
  const migrations = layoutMigrations(files, layout);
  lines.push(layout.manifest ? `forja.json válido: ${layout.components.length - 1} componentes además de la app.` : "Sin forja.json: estructura nativa (solo la app).");
  const describe = (c: ProjectComponent) => {
    const extra: string[] = [];
    for (const [key, value] of Object.entries(c.paths)) if (value !== DEFAULT_PATHS[key as keyof typeof DEFAULT_PATHS]) extra.push(`${key}: "${value}"`);
    for (const [key, value] of Object.entries(c.conventions)) if (value !== DEFAULT_CONVENTIONS[key as keyof typeof DEFAULT_CONVENTIONS]) extra.push(`${key}: ${value}`);
    return extra.length ? ` · mapeo ${extra.join(", ")}` : "";
  };
  for (const c of layout.components) {
    const own = <T extends { component?: string }>(list: T[]) => list.filter((x) => (x.component ?? "app") === c.name);
    const where = c.kind === "app" ? "raíz" : c.root;
    const head = `\n## ${c.kind === "app" ? "app" : `${c.kind} "${c.name}"`} en ${where}${c.kind === "web" ? ` · mount ${c.mount}` : ""}${c.kind === "api" ? ` · /_api/${c.route}/…` : ""}${c.database ? ` · esquema ${c.database}` : ""}${describe(c)}`;
    const p = own(pages), e = own(endpoints), j = own(jobs);
    const m = migrations.filter((x) => (c.database ? x.schema === c.database : c.kind === "app" && !x.schema));
    if (c.kind === "app" && !p.length && !e.length && !j.length && !m.length) continue;
    lines.push(head);
    if (p.length) lines.push(`- Páginas (${p.length}): ${p.slice(0, 8).map((x) => `${x.pattern} ← ${x.file}`).join("; ")}${p.length > 8 ? `; +${p.length - 8}` : ""}`);
    if (e.length) lines.push(`- Endpoints (${e.length}): ${e.slice(0, 8).map((x) => `${x.method} /_api/${x.route} ← ${x.file}`).join("; ")}${e.length > 8 ? `; +${e.length - 8}` : ""}`);
    if (j.length) lines.push(`- Tareas (${j.length}): ${j.slice(0, 8).map((x) => `${x.name} ← ${x.file}`).join("; ")}`);
    if (m.length) lines.push(`- Migraciones (${m.length}): ${m.slice(0, 5).map((x) => x.path).join(", ")}${m.length > 5 ? "…" : ""}`);
    if (c.kind !== "app" && c.kind !== "library" && !p.length && !e.length && !j.length) {
      const inside = Object.keys(files).filter((f) => f.startsWith(c.root)).length;
      lines.push(inside ? `- Aviso: ${inside} archivos en ${c.root}, pero ninguno es página, endpoint ni tarea con este mapeo; revisa paths y conventions.` : `- Aviso: no hay archivos en ${c.root}.`);
    }
  }
  try {
    const topology = readProjectServices(files);
    if (topology) {
      lines.push("\n## Servicios (procesos propios)");
      for (const [name, s] of Object.entries(topology.services)) lines.push(`- ${name} · ${s.kind} · replicas ${s.replicas} · maxConcurrency ${s.maxConcurrency} · ${[...s.endpoints, ...s.jobs].length} archivos: ${[...s.endpoints, ...s.jobs].slice(0, 6).join(", ")}${[...s.endpoints, ...s.jobs].length > 6 ? "…" : ""}`);
    }
  } catch (error) {
    lines.push(`\nforja.services.json no es válido: ${(error as Error).message}`);
  }
  const problems = layoutProblems(files, layout).filter((x) => !x.text.startsWith("El archivo no pertenece"));
  if (problems.length) lines.push("\n## Problemas", ...problems.slice(0, 15).map((x) => `- ${x.file}: ${x.text}`));
  const outside = Object.keys(files).filter((f) => !componentOf(f, layout) && !isNativeProjectPath(f) && f !== COMPONENTS_MANIFEST);
  if (outside.length) lines.push(`\n## Fuera de cualquier componente (${outside.length}; no se compilan ni sirven)`, ...outside.slice(0, 10).map((f) => `- ${f}`), ...(outside.length > 10 ? [`- … +${outside.length - 10}`] : []));
  lines.push("\nNo se ha escrito nada. Si el mapeo es el que quieres, guarda los manifiestos con write_file y comprueba con check_build.");
  return lines.join("\n");
}
