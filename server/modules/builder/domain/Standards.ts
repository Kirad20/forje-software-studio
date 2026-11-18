import type { BuildProblem } from "./FinishGatePolicy.js";
import { contractRoutes } from "./Plan.js";
import { componentOf, layoutOf, roleIn, type ProjectLayout } from "../../../../contracts/projectLayout.js";

/**
 * The house standards, checked deterministically over a project's source: what the manual
 * asks for and a model forgets under pressure (tokens instead of colors, the project's own
 * components/ui/ instead of the kit's stock look, thin endpoints over a hexagonal context,
 * the contract instead of guessed types, specs for business rules).
 *
 * Findings use the shape of build problems so the finish gate treats them alike: only the
 * ones that are new since the agent started, and only in files it owns. Style is advice,
 * never a reason to block a publish (that is the security scan's job).
 */

type FileMap = Record<string, string>;

const isUiSource = (f: string) => /^(pages|components)\/.+\.(tsx|css)$/.test(f) && !/\.example\.tsx$/.test(f);
const lineOf = (text: string, index: number) => text.slice(0, index).split("\n").length;

const COLOR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/;
const INLINE_VISUAL = /style=\{\{[^}]*\b(color|background|backgroundColor|fontSize|fontFamily|padding|margin|borderRadius)\s*:/;
const INTERNAL_ANCHOR = /<a\s[^>]*href=["']\/(?!\/)/;
/** `api.get<T>("route"`, `api.post<T>("route"` and `useApi<T>("route"`: a call typed by hand. */
const HAND_TYPED_API = /\b(api\.get|api\.post|useApi)\s*<[^()]*>\s*\(\s*["'`]([^"'`]+)["'`]/g;
const HAS_RULES = /Math\.|\.reduce\(|\b(price|total|amount|tax|discount)\b/i;
const NOT_LOGIC = /^helpers\/(types|contract|api)\.ts$|(^|\/)(adapters|ports)(\.ts$|\/)/;
const isHelperSource = (f: string) => /^helpers\/(?:[^/]+\/)*[^/]+\.ts$/.test(f) && !f.endsWith(".spec.ts");
const isClientSource = (f: string) => /^(pages|components)\/.+\.tsx?$/.test(f) && !/\.example\.tsx$/.test(f);
/** Server-only adapters (`helpers/<context>/adapters` or `adapters/<name>`) imported from browser code. */
const ADAPTER_IMPORT = /from\s+["']([^"']*helpers\/[^"']*\badapters\b[^"']*)["']/;
const KIT_IMPORT = /import\s*\{([^}]*)\}\s*from\s*["']@forja\/ui["']/g;
/** Utilities with no look of their own: fine to import from @forja/ui anywhere. */
const KIT_UTILITIES = new Set(["toast", "Toaster", "FadeIn", "cx"]);
const DIRECT_DB = /\bctx\.db\.(query|one|exec|transaction)\s*[<(]/;
/** A table in the UI: an HTML table or a TanStack table. */
const UI_TABLE = /<table[\s>]|\buseReactTable\s*\(/;
const UI_PAGINATED = /getPaginationRowModel|manualPagination|\bpagination\b|nextCursor|\bcursor\b|loadMore|fetchNextPage|<Pagination\b|Paginaci[oó]n/i;
/** `.query(` calls (many rows) with their SQL literal; `.one(` returns a single row and is fine. */
const QUERY_SQL = /\.query\s*(?:<[^>()]*>)?\s*\(\s*(["'`])([\s\S]*?)\1/g;
const isListSelect = (sql: string) => /^\s*(with\b[\s\S]*?\)\s*)?select\b/i.test(sql) && /\bfrom\b/i.test(sql) && !/\blimit\b/i.test(sql) && !/^\s*select\s+(count|sum|avg|min|max|exists)\s*\(/i.test(sql);

export function standardsScan(files: FileMap): BuildProblem[] {
  const out: BuildProblem[] = [];
  const add = (file: string, text: string, line?: number) => out.push({ file, line, text: `Estándar: ${text}` });
  const contract = files["helpers/contract.ts"];
  const routes = contract ? contractRoutes(contract) : [];

  for (const [file, text] of Object.entries(files)) {
    if (text.startsWith("base64:")) continue;

    if (isUiSource(file)) {
      const color = COLOR.exec(text);
      if (color) add(file, `color escrito a mano (${color[0]}); usa un token de base.css, p. ej. var(--primary), var(--muted) o var(--danger)`, lineOf(text, color.index));
      if (file.endsWith(".tsx")) {
        const inline = INLINE_VISUAL.exec(text);
        if (inline) add(file, "estilo visual en línea (color, fondo, tipografía o espaciado); ponlo en el .module.css con tokens, o usa una variante del componente", lineOf(text, inline.index));
        const anchor = INTERNAL_ANCHOR.exec(text);
        if (anchor) add(file, 'enlace interno con <a href="/…">; usa <Link to="/…"> de @forja/client para no recargar la página', lineOf(text, anchor.index));
        // Only routes the contract already covers: a call to anything else has nothing to be typed by.
        const api = [...text.matchAll(HAND_TYPED_API)].find((m) => routes.some((r) => r.route === m[2]!.replace(/^\//, "") && r.method === (m[1] === "api.post" ? "POST" : "GET")));
        if (api) add(file, `llamada a ${api[2]} con tipo escrito a mano, pero la ruta está en helpers/contract.ts; usa el cliente tipado createApi(contract) de helpers/api.ts`, lineOf(text, api.index!));
      }
    }

    if (isClientSource(file)) {
      const adapter = ADAPTER_IMPORT.exec(text);
      if (adapter) add(file, `importa ${adapter[1]}, un adaptador solo de servidor; las páginas y componentes usan el dominio (helpers/<contexto>/domain.ts) y el cliente tipado, nunca adaptadores`, lineOf(text, adapter.index));
      if (!file.startsWith("components/ui/")) {
        const stock = [...text.matchAll(KIT_IMPORT)].map((m) => ({ m, names: m[1]!.split(",").map((n) => n.trim()).filter((n) => n && !n.startsWith("type ")).map((n) => n.split(/\s+as\s+/)[0]!).filter((n) => !KIT_UTILITIES.has(n)) })).find((x) => x.names.length);
        if (stock) add(file, `usa ${stock.names.join(", ")} de @forja/ui con su aspecto por defecto; crea o reutiliza la variante del proyecto en components/ui/ (con el diseño de base.css) e impórtala desde ahí`, lineOf(text, stock.m.index!));
      }
      const table = UI_TABLE.exec(text);
      if (table && !UI_PAGINATED.test(text)) add(file, "tabla sin paginación; todas las tablas se paginan: pide la página al endpoint (limit y cursor o page) y muestra controles Anterior/Siguiente (skill data-tables)", lineOf(text, table.index));
    }

    if (/^(endpoints\/.+|helpers\/.*\badapters\b.*)\.ts$/.test(file) && !file.endsWith(".spec.ts")) {
      const list = [...text.matchAll(QUERY_SQL)].find((m) => isListSelect(m[2]!));
      if (list) add(file, "consulta de lista sin LIMIT; toda lista se pagina: recibe limit (máx. 100) y cursor u offset, y termina la consulta con limit $n", lineOf(text, list.index!));
    }

    if (isHelperSource(file) && !NOT_LOGIC.test(file) && /export\s+(async\s+)?function\s/.test(text) && HAS_RULES.test(text)) {
      const spec = file.replace(/\.ts$/, ".spec.ts");
      if (!(spec in files)) add(file, `tiene lógica de negocio (cálculos o reglas) sin pruebas; crea ${spec} con describe/it/expect y córrelo con run_tests`);
    }

    if (/^(endpoints|jobs)\/.+\.ts$/.test(file)) {
      const db = DIRECT_DB.exec(text);
      if (db) add(file, "accede a la base de datos desde el punto de entrada; mueve el SQL a un adaptador (helpers/<contexto>/adapters.ts) que implemente un puerto y llama a un caso de uso de helpers/<contexto>/application.ts", lineOf(text, db.index));
    }

    const endpoint = /^endpoints\/(.+)_(GET|POST)\.ts$/.exec(file);
    if (endpoint && routes.some((r) => r.route === endpoint[1] && r.method === endpoint[2]) && !/helpers\/contract|\bcontract\b/.test(text)) {
      add(file, `la ruta ${endpoint[2]} ${endpoint[1]} está en helpers/contract.ts pero el endpoint no lo usa; valida con el esquema de entrada del contrato y tipa la salida con el de salida`);
    }
  }
  const layout = layoutOf(files);
  if (layout.manifest) componentStandards(files, layout, add);
  return out;
}

/** `~/x` and relative specifiers to a project path (without extension), or null for packages. */
function importTarget(from: string, spec: string): string | null {
  if (/^(~|@)\//.test(spec)) return spec.slice(2);
  if (!spec.startsWith(".")) return null;
  const parts = from.split("/").slice(0, -1);
  for (const part of spec.split("/")) {
    if (part === "..") parts.pop();
    else if (part !== "." && part) parts.push(part);
  }
  return parts.join("/");
}

const IMPORT_SPEC = /(?:import|from)\s*["']([^"']+)["']/g;

/**
 * Standards of forja.json components: the same UI and entrypoint rules inside each component's
 * root, plus the boundaries between components and between hexagonal layers.
 */
function componentStandards(files: FileMap, layout: ProjectLayout, add: (file: string, text: string, line?: number) => void) {
  for (const [file, text] of Object.entries(files)) {
    if (text.startsWith("base64:")) continue;
    const owner = componentOf(file, layout);
    if (!owner || owner.component.kind === "app") continue;
    const { component, local } = owner;
    const code = /\.tsx?$/.test(local) && !/\.(spec|example)\.tsx?$/.test(local);

    const role = roleIn(component, local);
    if (component.kind === "web" && /\.(tsx|css)$/.test(local) && role !== "example" && role !== "static" && role !== "note") {
      const color = COLOR.exec(text);
      if (color && role !== "styles") add(file, `color escrito a mano (${color[0]}); usa un token del base.css del componente`, lineOf(text, color.index));
      if (local.endsWith(".tsx")) {
        const anchor = INTERNAL_ANCHOR.exec(text);
        if (anchor) add(file, 'enlace interno con <a href="/…">; usa <Link to="/…"> de @forja/client (dentro del mismo componente web)', lineOf(text, anchor.index));
        const table = UI_TABLE.exec(text);
        if (table && !UI_PAGINATED.test(text)) add(file, "tabla sin paginación; pide la página al endpoint y muestra controles Anterior/Siguiente (skill data-tables)", lineOf(text, table.index));
      }
    }

    if ((component.kind === "api" || component.kind === "worker") && (role === "endpoint" || role === "job")) {
      const db = DIRECT_DB.exec(text);
      if (db) add(file, `accede a la base de datos desde el punto de entrada; mueve el SQL a un adaptador en ${component.root}infrastructure/ que implemente un puerto y llama a un caso de uso de ${component.root}application/`, lineOf(text, db.index));
    }
    if ((component.kind === "api" || component.kind === "worker") && (role === "endpoint" || /^infrastructure\/.+\.ts$/.test(local)) && !local.endsWith(".spec.ts")) {
      const list = [...text.matchAll(QUERY_SQL)].find((m) => isListSelect(m[2]!));
      if (list) add(file, "consulta de lista sin LIMIT; toda lista se pagina: recibe limit (máx. 100) y cursor u offset", lineOf(text, list.index!));
    }
    if (!code) continue;

    const layer = /^(domain|application)\//.exec(local)?.[1];
    if (layer === "domain" && /\bctx\b/.test(text) && /\bctx\.(db|jobs|email|storage|ai|realtime|payments)\b/.test(text)) {
      add(file, "el dominio usa ctx; el dominio es puro: recibe datos y devuelve decisiones, y el acceso a servicios va en infrastructure/ detrás de un puerto");
    }
    for (const m of text.matchAll(IMPORT_SPEC)) {
      const target = importTarget(file, m[1]!);
      if (!target) continue;
      const line = lineOf(text, m.index!);
      const to = componentOf(target, layout);
      if (to && to.component.name !== component.name) {
        if (component.kind === "web" && (to.component.kind === "api" || to.component.kind === "worker")) {
          add(file, `importa código del servicio ${to.component.name} (${m[1]}); un frontend llama a su API por /_api/${to.component.route || "…"} y comparte tipos a través de una library`, line);
        }
        if (component.kind === "library" && to.component.kind !== "library") {
          add(file, `la librería importa del componente ${to.component.name} (${m[1]}); una library no depende de apps ni servicios`, line);
        }
        if ((component.kind === "api" || component.kind === "worker") && to.component.kind !== "library") {
          add(file, `importa del componente ${to.component.name} (${m[1]}); los servicios se comunican por HTTP (/_api) o eventos (ctx.jobs.enqueue) y comparten código solo a través de una library`, line);
        }
      }
      if (layer && to?.component.name === component.name && /^infrastructure\//.test(to.local)) {
        add(file, `la capa ${layer} importa infrastructure (${m[1]}); depende de un puerto y deja que el punto de entrada inyecte el adaptador`, line);
      }
    }
  }
}

export const formatStandard = (p: BuildProblem) => `${p.file}${p.line ? `:${p.line}` : ""} — ${p.text}`;
