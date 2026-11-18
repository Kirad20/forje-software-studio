/**
 * Layout of a generated project: which component owns each file, what the file is (page,
 * endpoint, job, client or server code...) and where it is served. It is the single source
 * of truth for every module that used to test path prefixes (project paths, routes, bundler,
 * security scan, project index, builder ownership).
 *
 * Without `forja.json` the layout is exactly the native one: the files at the project root
 * form the implicit component `app` with the rules Forja always had. `forja.json` adds
 * components (web, api, worker, library), each rooted at a folder that reuses the native
 * conventions relative to its root (pages/, endpoints/, jobs/, components/, static/,
 * base.css) plus free folders (domain/, application/, infrastructure/, features/...).
 *
 * Pure: no I/O, no imports. Every bounded context's domain layer may depend on it.
 */

export const COMPONENTS_MANIFEST = "forja.json";
export const IMPLICIT_COMPONENT = "app";
export const MAX_COMPONENTS = 32;
export const MAX_COMPONENT_REPLICAS = 8;
export const MAX_COMPONENT_CONCURRENCY = 32;

/** The native rules, unchanged: these paths are valid in every project. */
const NATIVE_PATTERN = /^(pages|components|helpers|endpoints|jobs|static|src\/(?:main|test))\/[A-Za-z0-9_.$\-/[\]]+$|^migrations\/\d+_[A-Za-z0-9_.$-]+\.sql$|^base\.css$|^package\.json$|^forja\.services\.json$|^forja\.auth\.json$|^pom\.xml$|^(?:build|settings)\.gradle(?:\.kts)?$|^gradle\.properties$/;
/** Same character set as native paths, for files inside a component root. */
const COMPONENT_FILE = /^[A-Za-z0-9_.$\-/[\]]+$/;
const ROOT_SEGMENT = /^[a-z0-9][a-z0-9._-]*$/;
const NAME = /^[a-z][a-z0-9-]{0,39}$/;
const MOUNT = /^\/(?:[a-z0-9][a-z0-9-]*)(?:\/[a-z0-9][a-z0-9-]*)?$/;
const ROUTE = /^[a-z0-9][a-z0-9-]*(?:\/[a-z0-9][a-z0-9-]*)?$/;

/** First segments a component root cannot take: native folders, root files and reserved names. */
const RESERVED_ROOTS = new Set([
  "pages", "components", "helpers", "endpoints", "jobs", "static", "migrations",
  "node_modules", "_forja", "docs", ".git", ".github",
  "base.css", "package.json", COMPONENTS_MANIFEST, "forja.services.json", "forja.auth.json", "pom.xml",
  "build.gradle", "build.gradle.kts", "settings.gradle", "settings.gradle.kts", "gradle.properties",
]);
const RESERVED_NAMES = new Set([IMPLICIT_COMPONENT, "monolith"]);
const SCHEMA = /^[a-z][a-z0-9_]{0,40}$/;
const RESERVED_SCHEMAS = new Set(["public", "information_schema"]);
const RESERVED_MOUNTS = ["/_api", "/_baas", "/_forja", "/static", "/__examples", "/manifest.webmanifest", "/robots.txt", "/sitemap.xml"];
const FORBIDDEN_SEGMENTS = new Set(["node_modules", ".git"]);

export type ComponentKind = "app" | "web" | "api" | "worker" | "library";

/**
 * Where each convention lives inside a component, relative to its root. forja.json can map
 * a project with a different structure (e.g. pages in "src/routes", static in "public").
 */
export interface ComponentPaths { pages: string; components: string; endpoints: string; jobs: string; static: string; migrations: string; styles: string }
/** "dots": posts.$id.tsx (Forja). "folders": posts/[id].tsx, index.tsx for a folder's root. */
export type PageConvention = "dots" | "folders";
/** "suffix": create_POST.ts (Forja). "dot": create.post.ts. "folders": create/POST.ts. */
export type EndpointConvention = "suffix" | "dot" | "folders";
export interface ComponentConventions { pages: PageConvention; endpoints: EndpointConvention }

export const DEFAULT_PATHS: ComponentPaths = Object.freeze({
  pages: "pages", components: "components", endpoints: "endpoints", jobs: "jobs", static: "static", migrations: "migrations", styles: "base.css",
}) as ComponentPaths;
export const DEFAULT_CONVENTIONS: ComponentConventions = Object.freeze({ pages: "dots", endpoints: "suffix" }) as ComponentConventions;

export interface ProjectComponent {
  name: string;
  kind: ComponentKind;
  /** Folder that holds the component, ending in "/" ("" for the implicit app). */
  root: string;
  /** Web and app: where its pages are served ("/" for the app). */
  mount: string;
  /** Api: prefix of its /_api routes ("" for the app). */
  route: string;
  /** Api and worker: when set, the component runs in its own process pool. */
  replicas?: number;
  maxConcurrency?: number;
  /** Api and worker: Postgres schema the component owns. Its ctx.db runs as a role that can only use that schema. */
  database?: string;
  /** Api and worker: jobs keep their bare names (`invoice`, not `billing.invoice`), e.g. after extracting a legacy context. */
  legacyJobNames?: boolean;
  /** Folders of each convention inside the root (Forja's own by default; forja.json "paths" maps others). */
  paths: ComponentPaths;
  /** File naming of pages and endpoints (Forja's own by default; forja.json "conventions"). */
  conventions: ComponentConventions;
}

export interface ProjectLayout {
  /** True when forja.json declared the components. */
  manifest: boolean;
  /** The implicit app first, then the declared components in manifest order. */
  components: ProjectComponent[];
}

export class LayoutError extends Error {
  constructor(message: string) {
    super(`${COMPONENTS_MANIFEST}: ${message}`);
    this.name = "LayoutError";
  }
}

export const APP_COMPONENT: ProjectComponent = Object.freeze({ name: IMPLICIT_COMPONENT, kind: "app", root: "", mount: "/", route: "", paths: DEFAULT_PATHS, conventions: DEFAULT_CONVENTIONS }) as ProjectComponent;
export const NATIVE_LAYOUT: ProjectLayout = Object.freeze({ manifest: false, components: Object.freeze([APP_COMPONENT]) as ProjectComponent[] }) as ProjectLayout;

type FileMap = Record<string, string>;

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fail(message: string): never {
  throw new LayoutError(message);
}

function onlyKeys(value: Record<string, unknown>, allowed: string[], where: string) {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) fail(`${where}: campo desconocido "${key}"`);
}

function integer(value: unknown, max: number, label: string): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > max) fail(`${label} debe ser un entero entre 1 y ${max}`);
  return value;
}

const KINDS: ComponentKind[] = ["web", "api", "worker", "library"];
const PATH_KEYS: Partial<Record<ComponentKind, (keyof ComponentPaths)[]>> = {
  web: ["pages", "components", "static", "styles"],
  api: ["endpoints", "jobs", "migrations"],
  worker: ["jobs", "migrations"],
};
const FOLDER = /^[A-Za-z0-9_.$@()-]+(?:\/[A-Za-z0-9_.$@()-]+){0,5}$/;

function parsePaths(name: string, kind: ComponentKind, value: unknown): ComponentPaths {
  const paths: ComponentPaths = { ...DEFAULT_PATHS };
  if (value === undefined) return paths;
  if (!object(value)) fail(`${name}.paths debe ser un objeto, por ejemplo { "pages": "src/routes" }`);
  onlyKeys(value, PATH_KEYS[kind] ?? [], `${name}.paths`);
  for (const [key, raw] of Object.entries(value) as [keyof ComponentPaths, unknown][]) {
    if (typeof raw !== "string") fail(`${name}.paths.${key} debe ser un texto`);
    const v = raw.replace(/^\.\/?/, "").replace(/\/$/, "");
    // Only pages and endpoints may sit at the component's root itself ("").
    const atRoot = v === "" && (key === "pages" || key === "endpoints");
    if (!atRoot && (!FOLDER.test(v) || v.split("/").some((s) => s === "." || s === ".." || FORBIDDEN_SEGMENTS.has(s)))) {
      fail(`${name}.paths.${key} no válido: "${raw}" (carpeta relativa al componente, por ejemplo "src/routes"${key === "pages" || key === "endpoints" ? ', o "" para su raíz' : ""})`);
    }
    if (key === "styles" && !v.endsWith(".css")) fail(`${name}.paths.styles debe ser un archivo .css, por ejemplo "src/index.css"`);
    paths[key] = v;
  }
  return paths;
}

function parseConventions(name: string, kind: ComponentKind, value: unknown): ComponentConventions {
  const conventions: ComponentConventions = { ...DEFAULT_CONVENTIONS };
  if (value === undefined) return conventions;
  if (!object(value)) fail(`${name}.conventions debe ser un objeto, por ejemplo { "pages": "folders" }`);
  onlyKeys(value, kind === "web" ? ["pages"] : kind === "api" ? ["endpoints"] : [], `${name}.conventions`);
  if (value.pages !== undefined) {
    if (value.pages !== "dots" && value.pages !== "folders") fail(`${name}.conventions.pages debe ser "dots" (posts.$id.tsx) o "folders" (posts/[id].tsx)`);
    conventions.pages = value.pages;
  }
  if (value.endpoints !== undefined) {
    if (!["suffix", "dot", "folders"].includes(value.endpoints as string)) fail(`${name}.conventions.endpoints debe ser "suffix" (create_POST.ts), "dot" (create.post.ts) o "folders" (create/POST.ts)`);
    conventions.endpoints = value.endpoints as EndpointConvention;
  }
  return conventions;
}

/** Parses and validates forja.json. Missing source → the native layout. Throws LayoutError. */
export function parseLayout(source: string | undefined): ProjectLayout {
  if (source === undefined) return NATIVE_LAYOUT;
  let value: unknown;
  try { value = JSON.parse(source); } catch { fail("JSON no válido"); }
  if (!object(value)) fail("debe ser un objeto");
  onlyKeys(value, ["$schema", "version", "components"], "raíz");
  if (value.version !== 1) fail('requiere "version": 1');
  if (!object(value.components)) fail('requiere "components" (un objeto con un componente por nombre)');
  const entries = Object.entries(value.components);
  if (!entries.length || entries.length > MAX_COMPONENTS) fail(`declara entre 1 y ${MAX_COMPONENTS} componentes`);
  const components: ProjectComponent[] = [APP_COMPONENT];
  const mounts = new Map<string, string>(), routes = new Map<string, string>(), schemas = new Map<string, string>();
  for (const [name, entry] of entries) {
    if (!NAME.test(name)) fail(`nombre de componente no válido: "${name}" (minúsculas, dígitos y guiones; empieza por letra; máximo 40)`);
    if (RESERVED_NAMES.has(name)) fail(`"${name}" es un nombre reservado`);
    if (!object(entry)) fail(`${name} debe ser un objeto`);
    const kind = entry.kind;
    if (typeof kind !== "string" || !KINDS.includes(kind as ComponentKind)) fail(`${name}.kind debe ser web, api, worker o library`);
    const allowed = ["kind", "root", "description"];
    if (kind === "web") allowed.push("mount", "paths", "conventions");
    if (kind === "api") allowed.push("route", "replicas", "maxConcurrency", "database", "legacyJobNames", "paths", "conventions");
    if (kind === "worker") allowed.push("replicas", "maxConcurrency", "database", "legacyJobNames", "paths");
    onlyKeys(entry, allowed, name);
    if (entry.description !== undefined && (typeof entry.description !== "string" || entry.description.length > 300)) fail(`${name}.description debe ser un texto de hasta 300 caracteres`);
    const root = entry.root;
    if (typeof root !== "string") fail(`${name}.root es obligatorio (carpeta del componente, por ejemplo "apps/${name}")`);
    const segments = root.replace(/\/$/, "").split("/");
    if (!segments.length || segments.length > 4 || !segments.every((s) => ROOT_SEGMENT.test(s))) {
      fail(`${name}.root no válido: "${root}" (1 a 4 carpetas en minúsculas, por ejemplo "services/${name}")`);
    }
    if (RESERVED_ROOTS.has(segments[0]!)) fail(`${name}.root no puede empezar por "${segments[0]}": esa carpeta pertenece al formato nativo o está reservada`);
    const normalized = segments.join("/") + "/";
    // src/ may hold another framework's code, but src/main and src/test belong to a Spring backend.
    if (/^src\/(main|test)\//.test(normalized)) fail(`${name}.root no puede ser "${normalized.slice(0, -1)}": src/main y src/test son del backend Spring`);
    for (const other of components) {
      if (other.root && (normalized.startsWith(other.root) || other.root.startsWith(normalized))) fail(`${name}.root se solapa con ${other.name}.root ("${other.root}")`);
    }
    const component: ProjectComponent = {
      name, kind: kind as ComponentKind, root: normalized, mount: "", route: "",
      paths: parsePaths(name, kind as ComponentKind, entry.paths), conventions: parseConventions(name, kind as ComponentKind, entry.conventions),
    };
    if (kind === "web") {
      const mount = entry.mount === undefined ? `/${name}` : entry.mount;
      if (typeof mount !== "string" || (mount !== "/" && !MOUNT.test(mount))) fail(`${name}.mount no válido: "${String(mount)}" (por ejemplo "/admin" o "/")`);
      if (RESERVED_MOUNTS.some((r) => mount === r || mount.startsWith(r + "/"))) fail(`${name}.mount "${mount}" está reservado por Forja`);
      if (mounts.has(mount)) fail(`${name}.mount "${mount}" ya lo usa ${mounts.get(mount)}`);
      mounts.set(mount, name);
      component.mount = mount;
    }
    if (kind === "api") {
      const route = entry.route === undefined ? name : entry.route;
      if (typeof route !== "string" || !ROUTE.test(route)) fail(`${name}.route no válido: "${String(route)}" (por ejemplo "orders" o "v1/orders")`);
      if (routes.has(route)) fail(`${name}.route "${route}" ya lo usa ${routes.get(route)}`);
      routes.set(route, name);
      component.route = route;
    }
    if (kind === "api" || kind === "worker") {
      const replicas = integer(entry.replicas, MAX_COMPONENT_REPLICAS, `${name}.replicas`);
      const maxConcurrency = integer(entry.maxConcurrency, MAX_COMPONENT_CONCURRENCY, `${name}.maxConcurrency`);
      if (replicas !== undefined) component.replicas = replicas;
      if (maxConcurrency !== undefined) component.maxConcurrency = maxConcurrency;
      if (entry.legacyJobNames !== undefined) {
        if (typeof entry.legacyJobNames !== "boolean") fail(`${name}.legacyJobNames debe ser true o false`);
        if (entry.legacyJobNames) component.legacyJobNames = true;
      }
      if (entry.database !== undefined && entry.database !== false) {
        const schema = entry.database === true ? name.replaceAll("-", "_") : entry.database;
        if (typeof schema !== "string" || !SCHEMA.test(schema) || RESERVED_SCHEMAS.has(schema) || schema.startsWith("pg_") || schema.startsWith("_forja")) {
          fail(`${name}.database debe ser true o un nombre de esquema (minúsculas, dígitos y _; no public, pg_* ni _forja*)`);
        }
        if (schemas.has(schema)) fail(`${name}.database "${schema}" ya lo usa ${schemas.get(schema)}`);
        schemas.set(schema, name);
        component.database = schema;
      }
    }
    components.push(component);
  }
  return { manifest: true, components };
}

export function readLayout(files: FileMap): ProjectLayout {
  return parseLayout(files[COMPONENTS_MANIFEST]);
}

/** Never throws: an invalid manifest yields the native layout and the error to report. */
export function safeLayout(files: FileMap): { layout: ProjectLayout; error: string | null } {
  try {
    return { layout: readLayout(files), error: null };
  } catch (e) {
    return { layout: NATIVE_LAYOUT, error: (e as Error).message };
  }
}

/** Layout from files, falling back to the native one when the manifest is invalid. */
export const layoutOf = (files: FileMap): ProjectLayout => safeLayout(files).layout;

// --- Paths --------------------------------------------------------------------------------

/** The component that owns a path and the path relative to its root, or null (root config files...). */
export function componentOf(path: string, layout: ProjectLayout = NATIVE_LAYOUT): { component: ProjectComponent; local: string } | null {
  for (const component of layout.components) {
    if (component.root && path.startsWith(component.root)) return { component, local: path.slice(component.root.length) };
  }
  if (/^(pages|components|helpers|endpoints|jobs|static)\//.test(path) || path === "base.css") return { component: APP_COMPONENT, local: path };
  return null;
}

const structurallySafe = (path: string) => !!path && !path.includes("..") && !path.includes("//") && !path.endsWith("/") && !path.startsWith("/");

/** Native paths only: exactly the rules Forja always had. */
export const isNativeProjectPath = (path: string) => NATIVE_PATTERN.test(path) && structurallySafe(path);

/** A path the project may hold under this layout. */
export function isProjectPath(path: string, layout: ProjectLayout = NATIVE_LAYOUT): boolean {
  if (!structurallySafe(path)) return false;
  if (NATIVE_PATTERN.test(path) || path === COMPONENTS_MANIFEST) return true;
  if (!layout.manifest) return false;
  const owner = componentOf(path, layout);
  if (!owner || owner.component.kind === "app" || !owner.local) return false;
  return COMPONENT_FILE.test(owner.local) && !owner.local.split("/").some((s) => FORBIDDEN_SEGMENTS.has(s));
}

/** Folders and files the builder may write under this layout. */
export function writableRoots(layout: ProjectLayout): string[] {
  return layout.components.filter((c) => c.root).map((c) => c.root);
}

// --- What a file is ------------------------------------------------------------------------

// --- What a file is inside its component (paths and conventions) -------------------------------

/** The rest of `local` inside `folder` ("" = the component's root), or null when outside it. */
export const under = (local: string, folder: string): string | null =>
  folder === "" ? local : local.startsWith(folder + "/") ? local.slice(folder.length + 1) : null;

const MIGRATION_NAME = /^\d+_[A-Za-z0-9_.$-]+\.sql$/;

/** URL pattern of a page file (relative to its pages folder), or null when it is not a page. */
export function parsePage(rel: string, convention: PageConvention): string | null {
  if (convention === "dots") {
    const m = /^([^/]+)\.tsx$/.exec(rel);
    if (!m || m[1]!.endsWith(".module") || m[1]!.includes(".example")) return null;
    const name = m[1]!;
    if (name.startsWith("_") && name !== "_index") return null;
    const segs = name.split(".").filter((s) => s !== "_index").map((s) => (s.startsWith("$") ? `:${s.slice(1)}` : s));
    return "/" + segs.join("/");
  }
  if (!rel.endsWith(".tsx") || /\.(module|example|spec|test)\.tsx$/.test(rel)) return null;
  const segs = rel.slice(0, -4).split("/");
  if (segs.some((s) => s.startsWith("_"))) return null;
  if (segs[segs.length - 1] === "index") segs.pop();
  const out: string[] = [];
  for (const s of segs) {
    const param = /^\[([A-Za-z_][A-Za-z0-9_]*)\]$/.exec(s) ?? /^\$([A-Za-z_][A-Za-z0-9_]*)$/.exec(s);
    if (param) out.push(`:${param[1]}`);
    else if (/[[\]]/.test(s)) return null;
    else out.push(s);
  }
  return "/" + out.join("/");
}

/** Route and method of an endpoint file (relative to its endpoints folder), or null. */
export function parseEndpoint(rel: string, convention: EndpointConvention): { route: string; method: "GET" | "POST" } | null {
  const m = convention === "suffix" ? /^(.+)_(GET|POST)\.ts$/.exec(rel)
    : convention === "dot" ? /^(.+)\.(get|post|GET|POST)\.ts$/.exec(rel)
      : /^(.+)\/(GET|POST)\.ts$/.exec(rel);
  if (!m || (convention !== "suffix" && /[[\]]/.test(m[1]!))) return null;
  return { route: m[1]!, method: m[2]!.toUpperCase() as "GET" | "POST" };
}

export type LocalRole = "page" | "layout" | "notFound" | "example" | "component" | "endpoint" | "job" | "static" | "note" | "styles" | "migration" | "other";

/** What a path (relative to its component's root) is, by the component's paths and conventions. */
export function roleIn(component: ProjectComponent, local: string): LocalRole {
  const p = component.paths;
  if (local === p.styles) return "styles";
  const st = under(local, p.static);
  if (st !== null) return st.startsWith("__dev/") ? "note" : "static";
  const cm = under(local, p.components);
  if (cm !== null) return /\.example\.tsx$/.test(cm) ? "example" : "component";
  const ep = under(local, p.endpoints);
  if (ep !== null && parseEndpoint(ep, component.conventions.endpoints)) return "endpoint";
  const jb = under(local, p.jobs);
  if (jb !== null && /^[A-Za-z0-9_-]+\.ts$/.test(jb)) return "job";
  const mg = under(local, p.migrations);
  if (mg !== null && mg.endsWith(".sql")) return "migration";
  const pg = under(local, p.pages);
  if (pg !== null) {
    if (pg === "_layout.tsx") return "layout";
    if (pg === "_404.tsx") return "notFound";
    if (/\.example\.tsx$/.test(pg)) return "example";
    if (parsePage(pg, component.conventions.pages) !== null) return "page";
  }
  return "other";
}

/** Example files (each named export is one state), of the app and of web components. */
export function isExampleFile(path: string, layout: ProjectLayout): boolean {
  const owner = componentOf(path, layout);
  return !!owner && (owner.component.kind === "app" || owner.component.kind === "web") && roleIn(owner.component, owner.local) === "example";
}

export type FileKind = "page" | "component" | "endpoint" | "job" | "helper" | "style" | "static" | "example" | "test" | "note" | "other";
export type FileSide = "client" | "server" | "none";

/** Native kind of a path relative to a component root (identical to the old projectIndex rule). */
function nativeKind(p: string): FileKind {
  if (p.startsWith("static/__dev/")) return "note";
  if (p.startsWith("pages/")) return p.includes(".example.") ? "example" : p.endsWith(".css") ? "style" : "page";
  if (p.startsWith("components/")) return p.includes(".example.") ? "example" : p.endsWith(".css") ? "style" : "component";
  if (p.startsWith("endpoints/")) return "endpoint";
  if (p.startsWith("jobs/")) return "job";
  if (/\.spec\.tsx?$/.test(p)) return "test";
  if (p.startsWith("helpers/")) return "helper";
  if (p.endsWith(".css")) return "style";
  if (p.startsWith("static/")) return "static";
  return "other";
}

export function fileKind(path: string, layout: ProjectLayout = NATIVE_LAYOUT): FileKind {
  const owner = layout.manifest ? componentOf(path, layout) : null;
  if (!owner || owner.component.kind === "app") return nativeKind(path);
  const { component, local } = owner;
  // Conventions only mean something where the component kind supports them.
  const web = component.kind === "web";
  switch (roleIn(component, local)) {
    case "note": return "note";
    case "static": return "static";
    case "styles": return "style";
    case "example": return web ? "example" : "helper";
    case "page": case "layout": case "notFound": return web ? "page" : "helper";
    case "component": return web ? (local.endsWith(".css") ? "style" : "component") : "helper";
    case "endpoint": return component.kind === "api" ? "endpoint" : "helper";
    case "job": return component.kind === "api" || component.kind === "worker" ? "job" : "helper";
    default: break;
  }
  if (/\.spec\.tsx?$/.test(local)) return "test";
  if (local.endsWith(".css")) return "style";
  if (/\.(tsx?|jsx?)$/.test(local)) return web && local.endsWith("x") ? "component" : "helper";
  return "other";
}

const nativeClient = (p: string) => p.startsWith("pages/") || p.startsWith("components/") || (p.startsWith("static/") && !p.startsWith("static/__dev/")) || p === "base.css";
const nativeServer = (p: string) => p.startsWith("endpoints/") || p.startsWith("jobs/") || p.startsWith("helpers/");

/**
 * Where a file's code runs, as the security scan sees it. Native helpers/ count as server
 * (they hold the bounded contexts), exactly as before. In a web component everything but
 * helpers/ runs in the browser; api, worker and library code runs on the server.
 */
export function fileSide(path: string, layout: ProjectLayout = NATIVE_LAYOUT): FileSide {
  const owner = layout.manifest ? componentOf(path, layout) : null;
  if (!owner || owner.component.kind === "app") return nativeClient(path) ? "client" : nativeServer(path) ? "server" : "none";
  const { component, local } = owner;
  if (roleIn(component, local) === "note") return "none";
  if (component.kind === "web") return local.startsWith("helpers/") ? "server" : "client";
  return "server";
}

// --- Public routes of each component ------------------------------------------------------

/** `component` is set only for components declared in forja.json (the app's entries keep their old shape). */
export interface LayoutPage { file: string; pattern: string; component?: string }
export interface LayoutEndpoint { file: string; method: "GET" | "POST"; route: string; component?: string }
export interface LayoutJob { file: string; name: string; component?: string }

const tag = (component: ProjectComponent) => (component.kind === "app" ? {} : { component: component.name });

const joinMount = (mount: string, pattern: string) => (mount === "/" ? pattern : pattern === "/" ? mount : mount + pattern);

/** Components whose pages are served: the app (root pages/) and every web component. */
export const pageComponents = (layout: ProjectLayout) => layout.components.filter((c) => c.kind === "app" || c.kind === "web");

/** Pages of every page component. The app's are computed exactly as before. */
export function layoutPages(files: FileMap, layout: ProjectLayout = layoutOf(files)): LayoutPage[] {
  const pages: LayoutPage[] = [];
  for (const file of Object.keys(files)) {
    const owner = componentOf(file, layout);
    if (!owner || (owner.component.kind !== "app" && owner.component.kind !== "web")) continue;
    const { component, local } = owner;
    if (roleIn(component, local) !== "page") continue;
    const pattern = parsePage(under(local, component.paths.pages)!, component.conventions.pages)!;
    pages.push({ file, pattern: joinMount(component.mount, pattern), ...tag(component) });
  }
  const score = (p: string) => p.split("/").map((s) => (s.startsWith(":") ? 1 : 0)).join("");
  return pages.sort((a, b) => score(a.pattern).localeCompare(score(b.pattern)) || b.pattern.length - a.pattern.length);
}

export function layoutEndpoints(files: FileMap, layout: ProjectLayout = layoutOf(files)): LayoutEndpoint[] {
  const out: LayoutEndpoint[] = [];
  for (const file of Object.keys(files)) {
    const owner = componentOf(file, layout);
    if (!owner || (owner.component.kind !== "app" && owner.component.kind !== "api")) continue;
    const { component, local } = owner;
    if (roleIn(component, local) !== "endpoint") continue;
    const e = parseEndpoint(under(local, component.paths.endpoints)!, component.conventions.endpoints)!;
    const route = component.route ? `${component.route}/${e.route}` : e.route;
    out.push({ file, route, method: e.method, ...tag(component) });
  }
  return out;
}

export function layoutJobs(files: FileMap, layout: ProjectLayout = layoutOf(files)): LayoutJob[] {
  const out: LayoutJob[] = [];
  for (const file of Object.keys(files)) {
    const owner = componentOf(file, layout);
    if (!owner || !["app", "api", "worker"].includes(owner.component.kind)) continue;
    const { component, local } = owner;
    if (roleIn(component, local) !== "job") continue;
    const base = under(local, component.paths.jobs)!.slice(0, -3);
    out.push({ file, name: component.kind === "app" || component.legacyJobNames ? base : `${component.name}.${base}`, ...tag(component) });
  }
  return out;
}

/** The page component that serves a URL path: the web component with the longest matching mount, else the app. */
export function componentForUrl(urlPath: string, layout: ProjectLayout): ProjectComponent {
  let best: ProjectComponent | null = null;
  for (const c of layout.components) {
    if (c.kind !== "web") continue;
    const match = c.mount === "/" || urlPath === c.mount || urlPath.startsWith(c.mount + "/");
    if (match && (!best || c.mount.length > best.mount.length)) best = c;
  }
  return best ?? APP_COMPONENT;
}

/**
 * Problems a valid manifest can still have against the files: conventions a component kind
 * cannot use, route collisions, pages the app and a web component both serve at "/", and
 * files left outside every component. Empty without a manifest.
 */
export function layoutProblems(files: FileMap, layout: ProjectLayout = layoutOf(files)): { file: string; text: string }[] {
  if (!layout.manifest) return [];
  const problems: { file: string; text: string }[] = [];
  const rootPages = Object.keys(files).some((f) => /^pages\/[^/]+\.tsx$/.test(f));
  const jvm = Object.keys(files).some((f) => /^src\/(main|test)\//.test(f));
  for (const c of layout.components) {
    if (jvm && "src/main/".startsWith(c.root) && c.root) problems.push({ file: COMPONENTS_MANIFEST, text: `${c.name}.root ("${c.root}") contiene src/main o src/test del backend Spring; usa otra carpeta para el componente.` });
    if (c.kind === "web" && c.mount === "/" && rootPages) problems.push({ file: COMPONENTS_MANIFEST, text: `${c.name}.mount es "/" pero la raíz ya tiene pages/: mueve esas páginas a ${c.root}pages/ o usa otro mount.` });
  }
  for (const file of Object.keys(files)) {
    const owner = componentOf(file, layout);
    if (!owner) {
      if (!isNativeProjectPath(file) && file !== COMPONENTS_MANIFEST) problems.push({ file, text: "El archivo no pertenece a ningún componente de forja.json; no se compila ni se sirve." });
      continue;
    }
    const { component, local } = owner;
    if (component.kind === "app") continue;
    const role = roleIn(component, local);
    if (role === "endpoint" && component.kind !== "api") problems.push({ file, text: `${component.name} es ${component.kind}: los endpoints van en un componente api.` });
    if (role === "job" && component.kind !== "api" && component.kind !== "worker") problems.push({ file, text: `${component.name} es ${component.kind}: las tareas van en un componente api o worker.` });
    if (role === "page" && component.kind !== "web") problems.push({ file, text: `${component.name} es ${component.kind}: las páginas van en un componente web.` });
    if (component.kind === "api" && component.conventions.endpoints !== "suffix") {
      const ep = under(local, component.paths.endpoints);
      if (ep !== null && /\.ts$/.test(ep) && /[[\]]/.test(ep) && !ep.endsWith(".spec.ts")) problems.push({ file, text: "Los endpoints de Forja no llevan parámetros en la ruta ([id]); recibe el valor por ?query o en el cuerpo." });
    }
    if (role === "migration") {
      const folder = component.paths.migrations;
      if (!component.database) problems.push({ file, text: `${component.name} no declara "database" en forja.json: sus migraciones no se aplicarían. Añade "database": true o, si estás retirando su base de datos, borra sus migraciones (el esquema y sus datos se conservan).` });
      else if (!MIGRATION_NAME.test(under(local, folder)!)) problems.push({ file, text: `Las migraciones se llaman ${folder}/<número>_<nombre>.sql.` });
    }
  }
  const seen = new Map<string, string>();
  for (const e of layoutEndpoints(files, layout)) {
    const key = `${e.method} ${e.route}`;
    if (seen.has(key)) problems.push({ file: e.file, text: `La ruta ${key} ya la sirve ${seen.get(key)}.` });
    else seen.set(key, e.file);
  }
  const jobNames = new Map<string, string>();
  for (const j of layoutJobs(files, layout)) {
    if (jobNames.has(j.name)) problems.push({ file: j.file, text: `La tarea "${j.name}" ya la define ${jobNames.get(j.name)}; renómbrala o quita legacyJobNames de su componente.` });
    else jobNames.set(j.name, j.file);
  }
  const patterns = new Map<string, string>();
  for (const p of layoutPages(files, layout)) {
    if (patterns.has(p.pattern)) problems.push({ file: p.file, text: `La página ${p.pattern} ya la sirve ${patterns.get(p.pattern)}.` });
    else patterns.set(p.pattern, p.file);
  }
  return problems;
}

// --- Data owned by components (database per service) ---------------------------------------

/** Postgres role a data component's code runs as: it can only use the component's schema. */
export const dataRole = (schema: string) => `forja_c_${schema}`;

/** The schema the code at `path` runs against, or null for the app and components without a database. */
export function dataScopeOf(path: string, layout: ProjectLayout): string | null {
  const owner = layout.manifest ? componentOf(path, layout) : null;
  return owner?.component.database ?? null;
}

export interface LayoutMigration { path: string; sql: string; schema?: string }

const ROOT_MIGRATION = /^migrations\/\d+_[A-Za-z0-9_.$-]+\.sql$/;

/** A migration of a component with its own database, under its (possibly mapped) migrations folder. */
export function isLayoutMigrationPath(path: string, layout: ProjectLayout): boolean {
  const owner = layout.manifest ? componentOf(path, layout) : null;
  return !!owner && owner.component.kind !== "app" && roleIn(owner.component, owner.local) === "migration";
}

/** True for `<component root>migrations/<n>_<name>.sql` paths (not the app's root migrations/). */
export const isComponentMigrationPath = (path: string) =>
  !ROOT_MIGRATION.test(path) && /^[a-z0-9][^]*\/migrations\/\d+_[A-Za-z0-9_.$-]+\.sql$/.test(path) && !/^(pages|components|helpers|endpoints|jobs|static|src)\//.test(path);

/**
 * Every migration of the project: the app's migrations/ (public schema) and, for each data
 * component, `<root>migrations/` applied inside its schema. Each set keeps its own order.
 */
export function layoutMigrations(files: FileMap, layout: ProjectLayout = layoutOf(files)): LayoutMigration[] {
  const out: LayoutMigration[] = [];
  for (const [path, sql] of Object.entries(files)) {
    if (path.startsWith("migrations/")) { out.push({ path, sql }); continue; }
    const owner = layout.manifest ? componentOf(path, layout) : null;
    if (owner?.component.database && roleIn(owner.component, owner.local) === "migration" && MIGRATION_NAME.test(under(owner.local, owner.component.paths.migrations)!)) {
      out.push({ path, sql, schema: owner.component.database });
    }
  }
  return out;
}

// --- Patterns (forja.services.json) ------------------------------------------------------------

/** True when an entry is a pattern rather than an exact path. */
export const isPathPattern = (entry: string) => /[*?]/.test(entry);

/** `*` matches inside one folder, `**` any depth (including none, so "a/" + "**" + "/b.ts" matches "a/b.ts"), `?` one character. */
export function matchesPathPattern(pattern: string, path: string): boolean {
  let re = "";
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i]!;
    if (c === "*" && pattern[i + 1] === "*") {
      if (pattern[i + 2] === "/") { re += "(?:.*/)?"; i += 2; } else { re += ".*"; i += 1; }
    } else if (c === "*") re += "[^/]*";
    else if (c === "?") re += "[^/]";
    else re += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${re}$`).test(path);
}
