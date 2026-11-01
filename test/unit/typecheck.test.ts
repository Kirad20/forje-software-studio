import { describe, expect, it } from "vitest";
import { parseDiagnostics, typecheckProject, verifyBuild } from "../../server/runtime/typecheck.js";

describe("parseDiagnostics", () => {
  const known = new Set(["pages/a.tsx", "endpoints/x_GET.ts"]);

  it("keeps project errors, joins continuation lines and drops the ones esbuild already reports", () => {
    const out = [
      "pages/a.tsx(3,7): error TS2322: Type 'string' is not assignable to type 'number'.",
      "  The expected type comes from property 'n'.",
      "",
      "pages/a.tsx(1,20): error TS2307: Cannot find module './nope' or its corresponding type declarations.",
      "../../sdk/client/index.ts(9,1): error TS2304: Cannot find name 'x'.",
      "endpoints/x_GET.ts(2,10): error TS2339: Property 'requireUsr' does not exist on type 'Ctx'.",
    ].join("\n");
    expect(parseDiagnostics(out, known)).toEqual([
      { file: "pages/a.tsx", line: 3, column: 7, text: "Tipo: Type 'string' is not assignable to type 'number'. The expected type comes from property 'n'." },
      { file: "endpoints/x_GET.ts", line: 2, column: 10, text: "Tipo: Property 'requireUsr' does not exist on type 'Ctx'." },
    ]);
  });
});

describe("typecheckProject", () => {
  it("catches wrong props, misspelt fields and ctx methods, and accepts correct code", async () => {
    const files = {
      "pages/_index.tsx": [
        `import { useApi, Link } from "@forja/client";`,
        `import styles from "./_index.module.css";`,
        `import { Button } from "~/components/Button";`,
        `export default function Home() {`,
        `  const { data } = useApi<{ items: { title: string }[] }>("todos/list");`,
        `  return <main className={styles.main}><Link href="/x">x</Link><Button variant="primary">Hola</Button>{data?.items.map((i) => <p key={i.title}>{i.titel}</p>)}</main>;`,
        `}`,
      ].join("\n"),
      "components/Button.tsx": `import type { ReactNode } from "react";\nexport function Button(p: { variant: "primary" | "ghost"; children: ReactNode }) { return <button>{p.children}</button>; }\n`,
      "endpoints/todos/list_GET.ts": `import type { Ctx } from "@forja/server";\nimport { z } from "zod";\nconst Q = z.object({ q: z.string().optional() });\nexport default async function handler(ctx: Ctx) {\n  const user = ctx.requireUsr();\n  const rows = await ctx.db.query("select title from todos where q = $1", [Q.parse(ctx.query).q]);\n  return { items: rows.map((r) => r.title) };\n}\n`,
      "helpers/math.ts": `export const add = (a, b) => a + b;\n`,
    };
    const problems = await typecheckProject(files);
    const texts = problems.map((p) => `${p.file}:${p.line} ${p.text}`);
    expect(texts.some((t) => t.startsWith("pages/_index.tsx:6") && t.includes("'href'"))).toBe(true);
    expect(texts.some((t) => t.includes("'titel'"))).toBe(true);
    expect(texts.some((t) => t.startsWith("endpoints/todos/list_GET.ts:5") && t.includes("requireUsr"))).toBe(true);
    // No noise from implicit any or untyped rows.
    expect(problems).toHaveLength(3);
  }, 60_000);

  it("knows Node in endpoints (they run on the server) and the DOM in pages", async () => {
    const problems = await typecheckProject({
      "endpoints/files_GET.ts": `import fs from "node:fs";\nexport default async () => { try { return fs.readFileSync("x", "utf8"); } catch (e: any) { return Buffer.from(String(e.code)).length; } };\n`,
      "pages/_index.tsx": `export default function Home() { return <h1>{document.title}</h1>; }\n`,
    });
    expect(problems).toEqual([]);
  }, 60_000);

  it("only type-checks once the project compiles", async () => {
    const broken = await verifyBuild({ "pages/_index.tsx": `export default function Home() { return <main> }` });
    expect(broken.ok).toBe(false);
    expect(broken.problems.every((p) => !p.text.startsWith("Tipo:"))).toBe(true);
    const ok = await verifyBuild({ "pages/_index.tsx": `export default function Home() { return <main>Hola</main>; }` });
    expect(ok).toEqual({ ok: true, problems: [] });
  }, 60_000);
});
