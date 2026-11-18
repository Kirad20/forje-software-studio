import { describe, expect, it } from "vitest";
import {
  layoutMigrations, layoutProblems, matchesPathPattern, parseEndpoint, parseLayout, parsePage, roleIn, isProjectPath,
} from "../../contracts/projectLayout.js";
import { buildClient, checkProject, endpointRoutes, jobFiles, pageRoutes, readProjectServices, resolveServiceExecution } from "../../server/modules/app-runtime/index.js";
import { checkManifests } from "../../server/modules/builder/infrastructure/manifestCheck.js";
import { roleCanWrite } from "../../server/modules/builder/domain/Plan.js";

/** A project with another framework's structure, mapped by forja.json instead of rewritten. */
const manifest = {
  version: 1,
  components: {
    site: {
      kind: "web", root: "src", mount: "/",
      paths: { pages: "routes", components: "ui", static: "public", styles: "index.css" },
      conventions: { pages: "folders" },
    },
    backend: {
      kind: "api", root: "backend", route: "api",
      paths: { endpoints: "handlers", jobs: "workers", migrations: "db/sql" },
      conventions: { endpoints: "dot" },
      database: "backend",
    },
  },
};

function project(): Record<string, string> {
  return {
    "forja.json": JSON.stringify(manifest),
    "src/index.css": ".shell { color: teal; }",
    "src/routes/_layout.tsx": `export default function L({ children }: { children: any }) { return <div className="shell">{children}</div>; }`,
    "src/routes/index.tsx": `import { Hero } from "../ui/Hero";\nexport default function Home() { return <Hero />; }`,
    "src/routes/posts/[id].tsx": `export default function Post() { return <p>Detalle de entrada</p>; }`,
    "src/routes/posts/index.tsx": `export default function Posts() { return <p>Lista de entradas</p>; }`,
    "src/routes/_private/helper.tsx": `export const x = 1;`,
    "src/ui/Hero.tsx": `export function Hero() { return <h1>Portada mapeada</h1>; }`,
    "src/ui/Hero.example.tsx": `import { Hero } from "./Hero";\nexport const Default = () => <Hero />;`,
    "src/public/logo.svg": `<svg xmlns="http://www.w3.org/2000/svg"/>`,
    "backend/handlers/posts/list.get.ts": `export default async (ctx: any) => ctx.db.query("select id from posts order by id limit 20");`,
    "backend/handlers/posts/create.post.ts": `export default async (ctx: any) => ({ ok: true });`,
    "backend/workers/reindex.ts": `export default async () => {};`,
    "backend/db/sql/001_posts.sql": "create table posts (id serial primary key, title text not null);",
    "backend/lib/slug.ts": `export const slug = (s: string) => s.toLowerCase();`,
  };
}

describe("mapping another structure with forja.json paths and conventions", () => {
  const layout = parseLayout(JSON.stringify(manifest));
  const site = layout.components.find((c) => c.name === "site")!;
  const backend = layout.components.find((c) => c.name === "backend")!;

  it("reads pages by folders and endpoints by dot or folders", () => {
    expect(parsePage("index.tsx", "folders")).toBe("/");
    expect(parsePage("posts/index.tsx", "folders")).toBe("/posts");
    expect(parsePage("posts/[id].tsx", "folders")).toBe("/posts/:id");
    expect(parsePage("posts/[id]/edit.tsx", "folders")).toBe("/posts/:id/edit");
    expect(parsePage("_private/x.tsx", "folders")).toBeNull();
    expect(parsePage("posts/[...rest].tsx", "folders")).toBeNull();
    expect(parsePage("Card.module.tsx", "folders")).toBeNull();
    expect(parsePage("posts.$id.tsx", "dots")).toBe("/posts/:id");
    expect(parseEndpoint("posts/create.post.ts", "dot")).toEqual({ route: "posts/create", method: "POST" });
    expect(parseEndpoint("posts/list/GET.ts", "folders")).toEqual({ route: "posts/list", method: "GET" });
    expect(parseEndpoint("posts/list_GET.ts", "suffix")).toEqual({ route: "posts/list", method: "GET" });
    expect(parseEndpoint("posts/[id].get.ts", "dot")).toBeNull();
  });

  it("gives every file its role inside the mapped folders", () => {
    expect(roleIn(site, "routes/posts/[id].tsx")).toBe("page");
    expect(roleIn(site, "routes/_layout.tsx")).toBe("layout");
    expect(roleIn(site, "ui/Hero.tsx")).toBe("component");
    expect(roleIn(site, "ui/Hero.example.tsx")).toBe("example");
    expect(roleIn(site, "public/logo.svg")).toBe("static");
    expect(roleIn(site, "index.css")).toBe("styles");
    expect(roleIn(backend, "handlers/posts/create.post.ts")).toBe("endpoint");
    expect(roleIn(backend, "workers/reindex.ts")).toBe("job");
    expect(roleIn(backend, "db/sql/001_posts.sql")).toBe("migration");
    expect(roleIn(backend, "lib/slug.ts")).toBe("other");
    expect(isProjectPath("src/routes/posts/[id].tsx", layout)).toBe(true);
  });

  it("validates the mapping and keeps src/main and src/test for Spring", () => {
    const bad = (component: Record<string, unknown>) => () => parseLayout(JSON.stringify({ version: 1, components: { x: component } }));
    expect(bad({ kind: "web", root: "web", paths: { endpoints: "api" } })).toThrow(/campo desconocido "endpoints"/);
    expect(bad({ kind: "web", root: "web", paths: { pages: "../pages" } })).toThrow(/paths\.pages no válido/);
    expect(bad({ kind: "web", root: "web", paths: { static: "" } })).toThrow(/paths\.static no válido/);
    expect(bad({ kind: "web", root: "web", paths: { styles: "theme.scss" } })).toThrow(/archivo \.css/);
    expect(bad({ kind: "web", root: "web", conventions: { pages: "nested" } })).toThrow(/"dots".*"folders"/);
    expect(bad({ kind: "api", root: "api", conventions: { endpoints: "verb" } })).toThrow(/"suffix".*"dot".*"folders"/);
    expect(bad({ kind: "worker", root: "w", conventions: { pages: "folders" } })).toThrow(/campo desconocido "conventions"/);
    expect(bad({ kind: "web", root: "src/main/web" })).toThrow(/src\/main y src\/test son del backend Spring/);
    expect(parseLayout(JSON.stringify({ version: 1, components: { x: { kind: "api", root: "api", paths: { endpoints: "" } } } })).components[1]!.paths.endpoints).toBe("");
    const spring = layoutProblems({ "forja.json": JSON.stringify(manifest), "src/main/java/App.java": "class App {}" });
    expect(spring.some((p) => /contiene src\/main/.test(p.text))).toBe(true);
  });

  it("builds, routes and migrates the mapped project like a native one", async () => {
    const files = project();
    expect(await checkProject(files)).toEqual([]);
    expect(pageRoutes(files).map((p) => p.pattern).sort()).toEqual(["/", "/posts", "/posts/:id"]);
    expect(endpointRoutes(files).map((e) => `${e.method} ${e.route}`).sort()).toEqual(["GET api/posts/list", "POST api/posts/create"]);
    expect(jobFiles(files).map((j) => j.name)).toEqual(["backend.reindex"]);
    expect(layoutMigrations(files)).toEqual([{ path: "backend/db/sql/001_posts.sql", sql: files["backend/db/sql/001_posts.sql"], schema: "backend" }]);
    const { js, css } = await buildClient(files, { component: "site" });
    expect(js).toContain("Portada mapeada");
    expect(js).toContain("/posts/:id");
    expect(js).toContain("shell");
    expect(css).toContain("teal");
    expect(js).not.toContain("_private");
  });

  it("assigns services by patterns in forja.services.json", () => {
    const files = { ...project(), "forja.services.json": JSON.stringify({ version: 1, services: { writers: { kind: "service", endpoints: ["backend/handlers/**/*.post.ts"] } } }) };
    expect(readProjectServices(files)!.services.writers!.endpoints).toEqual(["backend/handlers/posts/create.post.ts"]);
    expect(resolveServiceExecution(files, "backend/handlers/posts/create.post.ts").service).toBe("writers");
    expect(resolveServiceExecution(files, "backend/handlers/posts/list.get.ts").service).toBe("monolith");
    const none = { ...files, "forja.services.json": JSON.stringify({ version: 1, services: { w: { kind: "worker", jobs: ["backend/nothing/**"] } } }) };
    expect(() => readProjectServices(none)).toThrow(/el patrón "backend\/nothing\/\*\*" no coincide/);
    expect(matchesPathPattern("a/**/b.ts", "a/b.ts")).toBe(true);
    expect(matchesPathPattern("a/**/b.ts", "a/x/y/b.ts")).toBe(true);
    expect(matchesPathPattern("a/*.ts", "a/x/b.ts")).toBe(false);
  });

  it("previews a proposed mapping without writing and lets the backend role edit both manifests", () => {
    const files = project();
    const loose = { ...files, "forja.json": JSON.stringify({ version: 1, components: { site: { kind: "web", root: "src", mount: "/" } } }) };
    const before = checkManifests(loose, {});
    expect(before).toMatch(/ninguno es página, endpoint ni tarea con este mapeo/);
    expect(before).toMatch(/Fuera de cualquier componente/);
    const after = checkManifests(loose, { components: JSON.stringify(manifest) });
    expect(after).toMatch(/web "site" en src\/ · mount \/ · mapeo pages: "routes"/);
    expect(after).toMatch(/\/posts\/:id ← src\/routes\/posts\/\[id\]\.tsx/);
    expect(after).toMatch(/POST \/_api\/api\/posts\/create ← backend\/handlers\/posts\/create\.post\.ts/);
    expect(after).toMatch(/No se ha escrito nada/);
    expect(checkManifests(files, { components: "{" })).toMatch(/forja\.json no es válido/);
    expect(roleCanWrite("backend", "forja.services.json")).toBe(true);
    expect(roleCanWrite("backend", "forja.json")).toBe(true);
    expect(roleCanWrite("ui", "forja.services.json")).toBe(false);
  });
});
