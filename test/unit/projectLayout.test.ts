import { describe, expect, it } from "vitest";
import {
  APP_COMPONENT, COMPONENTS_MANIFEST, componentForUrl, fileKind, fileSide, isProjectPath, layoutEndpoints, layoutJobs,
  layoutPages, layoutProblems, NATIVE_LAYOUT, parseLayout, safeLayout, writableRoots,
} from "../../contracts/projectLayout.js";
import { ProjectPath } from "../../server/modules/projects/domain/ProjectPath.js";
import { starterFiles } from "../../server/modules/projects/index.js";

// --- The rules Forja had before the layout, copied literally: the layout must reproduce them. ---
const OLD_ALLOWED = /^(pages|components|helpers|endpoints|jobs|static|src\/(?:main|test))\/[A-Za-z0-9_.$\-/[\]]+$|^migrations\/\d+_[A-Za-z0-9_.$-]+\.sql$|^base\.css$|^package\.json$|^forja\.services\.json$|^pom\.xml$|^(?:build|settings)\.gradle(?:\.kts)?$|^gradle\.properties$/;
const oldValid = (path: string) => !(!OLD_ALLOWED.test(path) || path.includes("..") || path.includes("//") || path.endsWith("/"));
function oldKind(p: string) {
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
const oldClient = (p: string) => p.startsWith("pages/") || p.startsWith("components/") || (p.startsWith("static/") && !p.startsWith("static/__dev/")) || p === "base.css";
const oldServer = (p: string) => p.startsWith("endpoints/") || p.startsWith("jobs/") || p.startsWith("helpers/");
function oldPages(files: Record<string, string>) {
  const pages: { file: string; pattern: string }[] = [];
  for (const file of Object.keys(files)) {
    const m = /^pages\/([^/]+)\.tsx$/.exec(file);
    if (!m || m[1]!.endsWith(".module") || m[1]!.includes(".example")) continue;
    const name = m[1]!;
    if (name.startsWith("_") && name !== "_index") continue;
    const segs = name.split(".").filter((s) => s !== "_index").map((s) => (s.startsWith("$") ? `:${s.slice(1)}` : s));
    pages.push({ file, pattern: "/" + segs.join("/") });
  }
  const score = (p: string) => p.split("/").map((s) => (s.startsWith(":") ? 1 : 0)).join("");
  return pages.sort((a, b) => score(a.pattern).localeCompare(score(b.pattern)) || b.pattern.length - a.pattern.length);
}
function oldEndpoints(files: Record<string, string>) {
  const out: { file: string; route: string; method: string }[] = [];
  for (const file of Object.keys(files)) {
    const m = /^endpoints\/(.+)_(GET|POST)\.ts$/.exec(file);
    if (m) out.push({ file, route: m[1]!, method: m[2]! });
  }
  return out;
}
const oldJobs = (files: Record<string, string>) => Object.keys(files)
  .map((file) => ({ file, m: /^jobs\/([A-Za-z0-9_-]+)\.ts$/.exec(file) }))
  .filter((x) => x.m).map((x) => ({ file: x.file, name: x.m![1]! }));

const CORPUS = [
  "pages/_index.tsx", "pages/_layout.tsx", "pages/_404.tsx", "pages/about.tsx", "pages/posts.$id.tsx", "pages/a.module.tsx",
  "pages/orders.example.tsx", "pages/style.css", "pages/nested/deep.tsx", "components/Card.tsx", "components/ui/Button.tsx",
  "components/Card.example.tsx", "components/card.module.css", "helpers/contract.ts", "helpers/orders/domain.ts",
  "helpers/orders/domain.spec.ts", "helpers/.env", "endpoints/todos/list_GET.ts", "endpoints/todos/create_POST.ts",
  "endpoints/x_PUT.ts", "endpoints/a/b/c_GET.ts", "jobs/cleanup.ts", "jobs/nested/x.ts", "jobs/bad name.ts", "static/logo.svg",
  "static/__dev/notes.md", "static/fonts/a.woff2", "migrations/0001_init.sql", "migrations/init.sql", "migrations/1_x.txt",
  "base.css", "package.json", "forja.services.json", "pom.xml", "build.gradle", "build.gradle.kts", "settings.gradle",
  "gradle.properties", "src/main/java/App.java", "src/test/java/AppTest.java", "src/other/x.ts", "README.md", ".github/ci.yml",
  "docs/a.md", "apps/admin/pages/_index.tsx", "services/orders/endpoints/create_POST.ts", "lib/x.ts", "pages/../x.ts",
  "pages//x.tsx", "pages/", "pages", "/pages/x.tsx", "pages/x y.tsx", "pages/ñ.tsx", "components/[id].tsx", "helpers/$x.ts",
];

const files = (paths: string[]) => Object.fromEntries(paths.map((p) => [p, "export default () => null;"]));

describe("project layout — equivalence with the native rules (no forja.json)", () => {
  it("accepts and rejects exactly the same paths (forja.json aside, now creatable)", () => {
    for (const path of CORPUS) expect([path, ProjectPath.isValid(path)]).toEqual([path, oldValid(path)]);
    expect(ProjectPath.isValid(COMPONENTS_MANIFEST)).toBe(true);
  });

  it("classifies every file kind and side exactly as before", () => {
    for (const path of CORPUS) {
      expect([path, fileKind(path)]).toEqual([path, oldKind(path)]);
      const side = fileSide(path);
      expect([path, side === "client", side === "server"]).toEqual([path, oldClient(path), oldServer(path)]);
    }
  });

  it("derives the same pages, endpoints and jobs from the corpus and from the starter templates", () => {
    for (const map of [files(CORPUS), starterFiles("Demo"), starterFiles("Demo", "orders-invoices")]) {
      expect(layoutPages(map)).toEqual(oldPages(map));
      expect(layoutEndpoints(map)).toEqual(oldEndpoints(map));
      expect(layoutJobs(map)).toEqual(oldJobs(map));
      expect(layoutProblems(map)).toEqual([]);
    }
  });

  it("keeps the starter templates valid and every URL served by the app", () => {
    for (const map of [starterFiles("Demo"), starterFiles("Demo", "orders-invoices")]) {
      for (const path of Object.keys(map)) expect([path, ProjectPath.isValid(path)]).toEqual([path, true]);
    }
    expect(componentForUrl("/admin/users", NATIVE_LAYOUT)).toBe(APP_COMPONENT);
    expect(writableRoots(NATIVE_LAYOUT)).toEqual([]);
  });
});

const MANIFEST = JSON.stringify({
  version: 1,
  components: {
    admin: { kind: "web", root: "apps/admin", mount: "/admin" },
    site: { kind: "web", root: "apps/site", mount: "/" },
    orders: { kind: "api", root: "services/orders", replicas: 2 },
    billing: { kind: "worker", root: "services/billing", maxConcurrency: 2 },
    domain: { kind: "library", root: "packages/domain" },
  },
});

describe("forja.json components", () => {
  const layout = parseLayout(MANIFEST);

  it("parses components with defaults and keeps the implicit app first", () => {
    expect(layout.manifest).toBe(true);
    expect(layout.components.map((c) => [c.name, c.kind, c.root, c.mount, c.route])).toEqual([
      ["app", "app", "", "/", ""],
      ["admin", "web", "apps/admin/", "/admin", ""],
      ["site", "web", "apps/site/", "/", ""],
      ["orders", "api", "services/orders/", "", "orders"],
      ["billing", "worker", "services/billing/", "", ""],
      ["domain", "library", "packages/domain/", "", ""],
    ]);
    expect(layout.components.find((c) => c.name === "orders")!.replicas).toBe(2);
    expect(writableRoots(layout)).toEqual(["apps/admin/", "apps/site/", "services/orders/", "services/billing/", "packages/domain/"]);
  });

  it("accepts free folders inside component roots and nothing outside them", () => {
    for (const ok of ["apps/admin/pages/users.$id.tsx", "apps/admin/features/users/UsersTable.tsx", "services/orders/domain/order.ts",
      "services/orders/application/placeOrder.ts", "services/orders/infrastructure/ordersRepo.ts", "packages/domain/money.ts", "pages/_index.tsx"]) {
      expect([ok, isProjectPath(ok, layout)]).toEqual([ok, true]);
    }
    for (const bad of ["apps/other/x.ts", "services/x.ts", "apps/admin", "apps/admin/", "apps/admin/../x.ts", "apps/admin/node_modules/x.js",
      "services/orders/a b.ts", "README.md", "lib/x.ts"]) {
      expect([bad, isProjectPath(bad, layout)]).toEqual([bad, false]);
    }
    expect(() => ProjectPath.assertValid("lib/x.ts", layout)).toThrow(/apps\/admin\//);
  });

  it("serves each component at its own routes", () => {
    const map = files([
      "pages/about.tsx", "apps/admin/pages/_index.tsx", "apps/admin/pages/users.$id.tsx", "apps/site/pages/pricing.tsx",
      "endpoints/todos/list_GET.ts", "services/orders/endpoints/create_POST.ts", "services/orders/jobs/reindex.ts",
      "services/billing/jobs/invoice.ts", "jobs/cleanup.ts", COMPONENTS_MANIFEST,
    ]);
    map[COMPONENTS_MANIFEST] = MANIFEST;
    expect(layoutPages(map).map((p) => [p.pattern, p.component ?? "app"]).sort()).toEqual([
      ["/about", "app"], ["/admin", "admin"], ["/admin/users/:id", "admin"], ["/pricing", "site"],
    ]);
    expect(layoutEndpoints(map).map((e) => `${e.method} ${e.route}`).sort()).toEqual(["GET todos/list", "POST orders/create"]);
    expect(layoutJobs(map).map((j) => j.name).sort()).toEqual(["billing.invoice", "cleanup", "orders.reindex"]);
    expect(componentForUrl("/admin/users/3", layout).name).toBe("admin");
    expect(componentForUrl("/administrator", layout).name).toBe("site");
    expect(fileSide("apps/admin/features/x.tsx", layout)).toBe("client");
    expect(fileSide("services/orders/domain/order.ts", layout)).toBe("server");
    expect(fileKind("services/orders/endpoints/create_POST.ts", layout)).toBe("endpoint");
    expect(fileKind("services/billing/endpoints/x_GET.ts", layout)).toBe("helper");
  });

  it("reports conventions a kind cannot use, collisions and orphan files", () => {
    const map = files([
      "pages/_index.tsx", "apps/site/pages/_index.tsx", "services/billing/endpoints/x_GET.ts", "apps/admin/jobs/x.ts",
      "packages/domain/pages/y.tsx", "endpoints/orders/create_POST.ts", "services/orders/endpoints/create_POST.ts",
    ]);
    map[COMPONENTS_MANIFEST] = MANIFEST;
    const texts = layoutProblems(map).map((p) => `${p.file}: ${p.text}`);
    expect(texts.some((t) => t.includes('site.mount es "/"'))).toBe(true);
    expect(texts.some((t) => t.startsWith("services/billing/endpoints/x_GET.ts") && t.includes("api"))).toBe(true);
    expect(texts.some((t) => t.startsWith("apps/admin/jobs/x.ts"))).toBe(true);
    expect(texts.some((t) => t.startsWith("packages/domain/pages/y.tsx"))).toBe(true);
    expect(texts.some((t) => t.includes("POST orders/create ya la sirve"))).toBe(true);
    expect(layoutProblems({ ...map, "lib/x.ts": "" }).some((p) => p.file === "lib/x.ts")).toBe(true);
  });

  it("rejects invalid manifests with a message about forja.json", () => {
    const bad = (components: unknown, extra: Record<string, unknown> = {}) => () => parseLayout(JSON.stringify({ version: 1, components, ...extra }));
    expect(() => parseLayout("{")).toThrow(/forja\.json: JSON no válido/);
    expect(bad({}, { version: 2 })).toThrow(/version/);
    expect(bad({})).toThrow(/entre 1 y 32/);
    expect(bad({ App: { kind: "web", root: "apps/x" } })).toThrow(/nombre de componente/);
    expect(bad({ app: { kind: "web", root: "apps/x" } })).toThrow(/reservado/);
    expect(bad({ x: { kind: "lambda", root: "apps/x" } })).toThrow(/kind/);
    expect(bad({ x: { kind: "web" } })).toThrow(/root es obligatorio/);
    expect(bad({ x: { kind: "web", root: "pages/x" } })).toThrow(/no puede empezar por "pages"/);
    expect(bad({ x: { kind: "web", root: "Apps/X" } })).toThrow(/root no válido/);
    expect(bad({ x: { kind: "web", root: "apps" }, y: { kind: "api", root: "apps/y" } })).toThrow(/se solapa/);
    expect(bad({ x: { kind: "web", root: "apps/x", mount: "/static" } })).toThrow(/reservado/);
    expect(bad({ x: { kind: "web", root: "apps/x", mount: "/_api" } })).toThrow(/mount no válido/);
    expect(bad({ x: { kind: "web", root: "apps/x", mount: "/a" }, y: { kind: "web", root: "apps/y", mount: "/a" } })).toThrow(/ya lo usa x/);
    expect(bad({ x: { kind: "api", root: "s/x", route: "a" }, y: { kind: "api", root: "s/y", route: "a" } })).toThrow(/ya lo usa x/);
    expect(bad({ x: { kind: "api", root: "s/x", replicas: 9 } })).toThrow(/entre 1 y 8/);
    expect(bad({ x: { kind: "web", root: "apps/x", replicas: 2 } })).toThrow(/campo desconocido "replicas"/);
    expect(bad({ x: { kind: "library", root: "lib/x", mount: "/x" } })).toThrow(/campo desconocido "mount"/);
  });

  it("falls back to the native layout when the manifest is invalid, reporting why", () => {
    const { layout: fallback, error } = safeLayout({ [COMPONENTS_MANIFEST]: "nope" });
    expect(fallback).toBe(NATIVE_LAYOUT);
    expect(error).toMatch(/forja\.json/);
  });
});

describe("legacyJobNames (contexts extracted from a legacy project)", () => {
  it("keeps the bare job names of an api or worker and reports collisions", () => {
    const manifest = JSON.stringify({ version: 1, components: { billing: { kind: "worker", root: "services/billing", legacyJobNames: true } } });
    const map = { [COMPONENTS_MANIFEST]: manifest, "services/billing/jobs/invoice.ts": "", "jobs/cleanup.ts": "" };
    expect(layoutJobs(map).map((j) => j.name).sort()).toEqual(["cleanup", "invoice"]);
    expect(layoutProblems(map)).toEqual([]);
    const clash = { ...map, "jobs/invoice.ts": "" };
    expect(layoutProblems(clash).some((p) => /La tarea "invoice" ya la define/.test(p.text))).toBe(true);
    expect(() => parseLayout(JSON.stringify({ version: 1, components: { x: { kind: "worker", root: "s/x", legacyJobNames: "yes" } } }))).toThrow(/legacyJobNames/);
    expect(() => parseLayout(JSON.stringify({ version: 1, components: { x: { kind: "web", root: "a/x", legacyJobNames: true } } }))).toThrow(/campo desconocido "legacyJobNames"/);
  });
});
