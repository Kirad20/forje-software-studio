import { describe, expect, it } from "vitest";
import { standardsScan } from "../../server/modules/builder/contracts.js";

const CONTRACT = `import { z } from "zod";
export const contract = { "GET notes/list": { input: z.object({}), output: z.object({}) } } as const;
`;
const texts = (files: Record<string, string>) => standardsScan(files).map((p) => `${p.file}: ${p.text}`);

describe("standards scan", () => {
  it("flags hard-coded colors in pages and components but not in base.css or examples", () => {
    const files = {
      "base.css": ":root { --primary: #ea580c; }",
      "components/Card.module.css": ".card { background: #fff; }",
      "pages/_index.tsx": 'export default () => <p style={{ color: "red" }} />;',
      "components/Card.example.tsx": 'export const A = () => <p style={{ color: "#fff" }} />;',
    };
    const found = texts(files).join("\n");
    expect(found).toMatch(/components\/Card\.module\.css: Estándar: color escrito a mano \(#fff\)/);
    expect(found).toMatch(/pages\/_index\.tsx: Estándar: estilo visual en línea/);
    expect(standardsScan(files).map((p) => p.file).sort()).toEqual(["components/Card.module.css", "pages/_index.tsx"]);
  });

  it("accepts tokens and layout-only inline styles", () => {
    expect(standardsScan({ "components/Bar.module.css": ".a { color: var(--primary); background: color-mix(in srgb, var(--primary) 10%, transparent); }", "components/Bar.tsx": "export const Bar = ({ w }) => <i style={{ width: w }} />;" })).toEqual([]);
  });

  it("asks for Link instead of an internal anchor", () => {
    expect(texts({ "pages/a.tsx": 'export default () => <a href="/about">x</a>;' }).join()).toMatch(/Link/);
    expect(standardsScan({ "pages/a.tsx": 'export default () => <a href="https://x.com">x</a>;' })).toEqual([]);
  });

  it("asks for the typed client only for routes the contract covers", () => {
    const page = (route: string) => `import { api } from "@forja/client";
export default () => { api.get<Note[]>("${route}"); return null; };`;
    expect(standardsScan({ "pages/a.tsx": page("notes/list") })).toEqual([]);
    expect(standardsScan({ "pages/a.tsx": page("other/route"), "helpers/contract.ts": CONTRACT })).toEqual([]);
    expect(texts({ "pages/a.tsx": page("notes/list"), "helpers/contract.ts": CONTRACT }).join()).toMatch(/notes\/list con tipo escrito a mano[\s\S]*createApi\(contract\)/);
  });

  it("asks for an endpoint to use the contract it is listed in", () => {
    const files = { "helpers/contract.ts": CONTRACT, "endpoints/notes/list_GET.ts": "export default async () => ({ notes: [] });" };
    expect(texts(files).join()).toMatch(/GET notes\/list está en helpers\/contract\.ts/);
    expect(standardsScan({ ...files, "endpoints/notes/list_GET.ts": 'import { contract } from "../../helpers/contract";\nexport default async () => contract;' })).toEqual([]);
  });

  it("asks for specs on business rules, not on plain helpers or the contract", () => {
    const logic = "export function total(items: { price: number }[]) { return items.reduce((s, i) => s + i.price, 0); }";
    expect(texts({ "helpers/cart.ts": logic }).join()).toMatch(/helpers\/cart\.spec\.ts/);
    expect(standardsScan({ "helpers/cart.ts": logic, "helpers/cart.spec.ts": "describe('x', () => {});" })).toEqual([]);
    expect(standardsScan({ "helpers/contract.ts": CONTRACT, "helpers/slug.ts": "export function slug(s: string) { return s.toLowerCase(); }" })).toEqual([]);
  });

  it("asks for specs on rules inside a bounded context, but not on its adapters or ports", () => {
    const logic = "export function total(items: { price: number }[]) { return items.reduce((s, i) => s + i.price, 0); }";
    expect(texts({ "helpers/orders/domain.ts": logic }).join()).toMatch(/helpers\/orders\/domain\.spec\.ts/);
    expect(standardsScan({ "helpers/orders/domain.ts": logic, "helpers/orders/domain.spec.ts": "" })).toEqual([]);
    expect(standardsScan({ "helpers/orders/adapters.ts": logic, "helpers/orders/adapters/pg.ts": logic, "helpers/orders/ports.ts": logic })).toEqual([]);
  });

  it("keeps server adapters out of pages and components", () => {
    const found = texts({ "components/orders/useOrders.ts": 'import { postgresOrders } from "~/helpers/orders/adapters";' }).join();
    expect(found).toMatch(/helpers\/orders\/adapters, un adaptador solo de servidor/);
    expect(standardsScan({ "components/orders/List.tsx": 'import type { Order } from "~/helpers/orders/domain";' })).toEqual([]);
  });

  it("asks features to use the project's components/ui variants instead of the kit's stock look", () => {
    const page = 'import { Button, toast, type ButtonProps } from "@forja/ui";\nexport default () => <Button />;';
    expect(texts({ "components/orders/List.tsx": page }).join()).toMatch(/usa Button de @forja\/ui[\s\S]*components\/ui\//);
    expect(standardsScan({ "components/ui/Button.tsx": page })).toEqual([]);
    expect(standardsScan({ "pages/_layout.tsx": 'import { Toaster, cx, FadeIn, toast } from "@forja/ui";' })).toEqual([]);
  });

  it("asks endpoints and jobs to reach the database through an adapter", () => {
    const endpoint = 'export default async (ctx) => ctx.db.query("select 1");';
    expect(texts({ "endpoints/orders/list_GET.ts": endpoint, "jobs/sync.ts": endpoint }).join("\n")).toMatch(/list_GET\.ts: Estándar: accede a la base de datos[\s\S]*jobs\/sync\.ts: Estándar: accede a la base de datos/);
    expect(standardsScan({ "endpoints/orders/list_GET.ts": 'import { listOrders } from "../../helpers/orders/application";\nexport default async (ctx) => listOrders({ orders: postgresOrders(ctx) });' })).toEqual([]);
  });

  it("asks every table to be paginated, in the UI and in the query", () => {
    expect(texts({ "components/orders/OrdersTable.tsx": "export const T = ({ rows }) => <table><tbody /></table>;" }).join()).toMatch(/tabla sin paginación/);
    expect(standardsScan({ "components/orders/OrdersTable.tsx": 'export const T = () => <div><table /><nav aria-label="Paginación" /></div>;' })).toEqual([]);
    expect(standardsScan({ "components/orders/T.tsx": "useReactTable({ manualPagination: true }); <table />" })).toEqual([]);

    const adapter = (sql: string) => ({ "helpers/orders/adapters.ts": `export const list = (db) => db.query<{ id: number }>(\`${sql}\`, []);` });
    expect(texts(adapter("select id from orders where user_id = $1 order by created_at desc")).join()).toMatch(/consulta de lista sin LIMIT/);
    expect(standardsScan(adapter("select id from orders where user_id = $1 order by created_at desc, id desc limit $2"))).toEqual([]);
    expect(standardsScan(adapter("select count(*) from orders"))).toEqual([]);
    expect(standardsScan(adapter("insert into orders (id) values ($1)"))).toEqual([]);
    expect(standardsScan({ "helpers/orders/domain.ts": 'export const sql = (db) => db.query("select * from orders");' })).toEqual([]);
  });
});
