import { afterEach, describe, expect, it, vi } from "vitest";
import { buildClient, checkProject } from "../../server/runtime/bundler.js";
import { KIT_BUILTIN, KIT_CATALOG } from "../../server/runtime/catalog.js";
import { BUILTIN_PACKAGES, resolvePackage } from "../../server/runtime/deps.js";
import { typecheckProject } from "../../server/runtime/typecheck.js";

const CONTRACT = `import { z } from "zod";
export const Note = z.object({ id: z.number(), title: z.string() });
export const contract = {
  "GET notes/list": { input: z.object({ q: z.string().optional() }), output: z.object({ notes: z.array(Note) }) },
  "POST notes/create": { input: z.object({ title: z.string() }), output: z.object({ note: Note }) },
} as const;
`;

describe("interface kit", () => {
  it("ships the built-in kit without installing it, and pins the rest", () => {
    for (const name of Object.keys(KIT_BUILTIN)) expect(BUILTIN_PACKAGES, name).toContain(name);
    for (const [name, e] of Object.entries(KIT_CATALOG)) expect(e.version, name).toMatch(/^\d+\.\d+\.\d+$/);
    expect(Object.keys(KIT_CATALOG).some((n) => BUILTIN_PACKAGES.includes(n))).toBe(false);
  });

  it("bundles @forja/ui with icons and motion into the browser build, with its styles", async () => {
    const { js, css } = await buildClient({
      "pages/_index.tsx": [
        'import { Button, Card, EmptyState, FadeIn, Toaster } from "@forja/ui";',
        'import { Plus } from "lucide-react";',
        'import { motion } from "motion/react";',
        "export default function Home() {",
        '  return <FadeIn><Card><EmptyState title="Sin notas" action={<Button><Plus />Crear</Button>} /><motion.div /><Toaster /></Card></FadeIn>;',
        "}",
      ].join("\n"),
    });
    expect(js).toContain("fj-btn");
    expect(css).toContain(".fj-btn-primary");
    expect(css).toContain("var(--primary)");
  }, 60_000);

  it("keeps a single React even though the kit's packages depend on it", async () => {
    const { js } = await buildClient({ "pages/_index.tsx": 'import { Spinner } from "@forja/ui";\nexport default () => <Spinner />;' });
    expect((js.match(/react\.transitional\.element|react\.element/g) ?? []).length).toBeGreaterThan(0);
  }, 60_000);

  it("refuses @forja/ui in endpoints and jobs", async () => {
    const problems = await checkProject({ "endpoints/x_GET.ts": 'import { Button } from "@forja/ui";\nexport default async () => String(Button);\n' });
    expect(problems.map((p) => p.text).join("\n")).toMatch(/solo para páginas/);
  });
});

describe("typed API from the contract", () => {
  const page = (body: string) => ({
    "helpers/contract.ts": CONTRACT,
    "helpers/api.ts": 'import { createApi } from "@forja/client";\nimport { contract } from "./contract";\nexport const notes = createApi(contract);\n',
    "pages/_index.tsx": `import { notes } from "../helpers/api";\n${body}\n`,
  });

  it("accepts correct calls and infers the output", async () => {
    const files = page(
      [
        "export default function Home() {",
        '  const { data } = notes.useGet("notes/list", { q: "a" });',
        '  const title: string = data?.notes[0]?.title ?? "";',
        '  void notes.post("notes/create", { title });',
        "  return <p>{title}</p>;",
        "}",
      ].join("\n"),
    );
    expect(await typecheckProject(files)).toEqual([]);
  }, 90_000);

  it("fails the build on an unknown route, a wrong body and a misread field", async () => {
    const files = page(
      [
        "export default function Home() {",
        '  const { data } = notes.useGet("notes/lisst");',
        '  void notes.post("notes/create", { name: "x" });',
        '  const n: number = notes.get("notes/list").then ? 1 : 0;',
        '  return <p>{data?.notes[0]?.titulo}</p>;',
        "}",
      ].join("\n"),
    );
    const problems = (await typecheckProject(files)).filter((p) => p.file === "pages/_index.tsx");
    expect(problems.length).toBeGreaterThanOrEqual(3);
    expect(problems.map((p) => p.text).join("\n")).toMatch(/notes\/lisst|titulo|name/);
  }, 90_000);
});

describe("catalog pinning", () => {
  afterEach(() => vi.unstubAllGlobals());
  const registry = (seen: string[]) =>
    vi.stubGlobal("fetch", async (url: string) => {
      seen.push(url);
      return new Response(JSON.stringify({ version: url.split("/").pop(), description: "x" }), { status: 200 });
    });

  it("installs the catalog version whatever was asked for, and says so", async () => {
    const seen: string[] = [];
    registry(seen);
    const r = await resolvePackage("recharts", "latest");
    expect(r.version).toBe(KIT_CATALOG.recharts!.version);
    expect(seen[0]).toMatch(new RegExp(`recharts/${KIT_CATALOG.recharts!.version}$`));
    expect(r.warnings.join()).not.toMatch(/no está en el catálogo/);
    const other = await resolvePackage("recharts", "2.0.0");
    expect(other.warnings.join()).toMatch(/versión .* del catálogo/);
  });

  it("refuses a package outside the catalog, listing the kit, and one that is built in", async () => {
    const seen: string[] = [];
    registry(seen);
    await expect(resolvePackage("canvas-confetti", "1.9.3")).rejects.toThrow(/no está en el catálogo de Forja[\s\S]*@forja\/ui/);
    expect(seen).toEqual([]);
    await expect(resolvePackage("lucide-react")).rejects.toThrow(/ya viene incluido/);
  });
});
