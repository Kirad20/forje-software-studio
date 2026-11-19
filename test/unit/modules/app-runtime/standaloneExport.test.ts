import { describe, expect, it } from "vitest";
import { exportStandalone } from "../../../../server/modules/app-runtime/index.js";
import { starterFiles } from "../../../../server/modules/projects/index.js";

const text = (tree: Record<string, string | Uint8Array>, p: string) => String(tree[`demo/${p}`]);

describe("Exportar para producción", () => {
  it("exports the components starter as a stack: gateway, one service per component, migrations", async () => {
    const tree = await exportStandalone({ name: "Demo", slug: "demo", files: starterFiles("Demo", "components"), secrets: ["STRIPE_KEY"] });
    const paths = Object.keys(tree).sort();
    expect(paths).toEqual(expect.arrayContaining([
      "demo/docker-compose.yml", "demo/.env.example", "demo/README.md",
      "demo/gateway/nginx.conf", "demo/gateway/html/index.html", "demo/gateway/html/admin/index.html",
      "demo/services/orders/server.mjs", "demo/services/orders/manifest.json", "demo/services/billing/manifest.json",
      "demo/migrate/plan.json", "demo/migrate/migrations/services/orders/migrations/001_orders.sql",
    ]));
    expect(paths.every((p) => p.startsWith("demo/"))).toBe(true);
    expect(text(tree, "docker-compose.yml")).toContain("STRIPE_KEY: ${STRIPE_KEY:-}");
    expect(text(tree, ".env.example")).toContain("DB_PASSWORD_BILLING=");
    expect(JSON.parse(text(tree, "services/billing/manifest.json"))).toMatchObject({ component: "billing", schema: "billing", endpoints: [], jobs: [{ name: "billing.invoice" }] });
  });

  it("serves a project without forja.json as one app service and one frontend", async () => {
    const files = { ...starterFiles("Demo"), "endpoints/hello_GET.ts": "export default async () => ({ hi: true });\n" };
    const tree = await exportStandalone({ name: "Demo", slug: "demo", files, secrets: [] });
    expect(Object.keys(tree).filter((p) => p.startsWith("demo/services/")).map((p) => p.split("/")[2])).toEqual(expect.arrayContaining(["app"]));
    expect(text(tree, "migrate/plan.json")).toContain('"schemas": []');
    expect(text(tree, "gateway/nginx.conf")).toContain("location /_api/ { proxy_pass http://app:3000;");
  });

  it("refuses to export an app that does not build", async () => {
    const files = { ...starterFiles("Demo"), "pages/broken.tsx": "export default function B() { return <main> }" };
    await expect(exportStandalone({ name: "Demo", slug: "demo", files, secrets: [] })).rejects.toThrow(/pages\/broken\.tsx/);
  });

  it("exports a project mapped with paths and conventions", async () => {
    const manifest = {
      version: 1,
      components: {
        site: { kind: "web", root: "src", mount: "/", paths: { pages: "routes", static: "public", styles: "index.css" }, conventions: { pages: "folders" } },
        backend: { kind: "api", root: "backend", route: "api", paths: { endpoints: "handlers", migrations: "db/sql" }, conventions: { endpoints: "dot" }, database: true },
      },
    };
    const files = {
      "forja.json": JSON.stringify(manifest),
      "src/index.css": ".x { color: teal; }",
      "src/routes/index.tsx": "export default function H() { return <h1>Hola</h1>; }",
      "src/public/logo.svg": "<svg xmlns='http://www.w3.org/2000/svg'/>",
      "backend/handlers/posts/list.get.ts": "export default async (ctx: any) => ctx.db.query('select 1 limit 1');",
      "backend/db/sql/001_posts.sql": "create table posts (id serial primary key);",
    };
    const tree = await exportStandalone({ name: "Demo", slug: "demo", files, secrets: [] });
    expect(text(tree, "gateway/html/static/logo.svg")).toContain("<svg");
    expect(text(tree, "gateway/html/_forja/site.css")).toContain("teal");
    expect(JSON.parse(text(tree, "migrate/plan.json")).migrations).toEqual([{ path: "backend/db/sql/001_posts.sql", schema: "backend" }]);
    expect(JSON.parse(text(tree, "services/backend/manifest.json")).endpoints[0]).toMatchObject({ method: "GET", route: "api/posts/list" });
  });
});
