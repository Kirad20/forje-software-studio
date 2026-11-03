import { describe, expect, it } from "vitest";
import { standardsScan } from "../../server/builder/standards.js";

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
});
