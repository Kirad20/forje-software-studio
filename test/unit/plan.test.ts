import { describe, expect, it } from "vitest";
import { checkContract, contractRoutes, covers, validatePlan, type Plan } from "../../server/modules/builder/contracts.js";

const CONTRACT = `import { z } from "zod";
export const Note = z.object({ id: z.number(), title: z.string() });
export const contract = {
  "GET notes/list": { input: z.object({}), output: z.object({ notes: z.array(Note) }) },
  "POST notes/create": { input: z.object({ title: z.string() }), output: z.object({ note: Note }) },
} as const;
`;

const task = (over: Record<string, unknown> = {}) => ({ id: "db", role: "data", goal: "Crear la tabla notes", files: ["helpers/types.ts"], done_when: ["la tabla notes existe"], ...over });
const plan = (tasks: unknown[], over: Record<string, unknown> = {}) => ({ summary: "Notas", contract: CONTRACT, tasks, ...over });

const GOOD = [
  task(),
  task({ id: "api", role: "backend", goal: "Endpoints", files: ["endpoints/notes/"], depends_on: ["db"] }),
  task({ id: "pages", role: "ui", goal: "Pantallas", files: ["pages/", "components/", "helpers/api.ts"], depends_on: ["db"] }),
];

describe("validatePlan", () => {
  it("accepts a coherent plan and keeps done_when and later", () => {
    const { plan: p, errors } = validatePlan(plan(GOOD, { later: ["Exportar a PDF"] }));
    expect(errors).toEqual([]);
    expect(p!.tasks.map((t) => t.id)).toEqual(["db", "api", "pages"]);
    expect(p!.tasks[0]!.doneWhen).toEqual(["la tabla notes existe"]);
    expect(p!.later).toEqual(["Exportar a PDF"]);
  });

  it("rejects instead of silently repairing, and lists every problem", () => {
    const { plan: p, errors } = validatePlan(
      plan([
        task({ files: [] }),
        task({ id: "api", role: "backend", files: ["pages/x.tsx"], done_when: [] }),
        task({ id: "api", role: "ui", files: ["pages/"], depends_on: ["nada"] }),
      ]),
    );
    expect(p).toBeNull();
    const all = errors.join("\n");
    expect(all).toMatch(/files está vacío/);
    expect(all).toMatch(/"pages\/x.tsx" queda fuera/);
    expect(all).toMatch(/done_when está vacío/);
    expect(all).toMatch(/"api" está repetido/);
    expect(all).toMatch(/depende de "nada"/);
  });

  it("detects overlap between a folder and a file inside it", () => {
    const { errors } = validatePlan(plan([task({ id: "a", role: "ui", files: ["components/"] }), task({ id: "b", role: "ui", files: ["components/Button.tsx"] })]));
    expect(errors.join("\n")).toMatch(/a y b comparten archivos/);
  });

  it("refuses tasks that claim the contract file, too many tasks and dependency cycles", () => {
    expect(validatePlan(plan([task({ files: ["helpers/"] })])).errors.join("\n")).toMatch(/helpers\/contract\.ts/);
    const seven = Array.from({ length: 7 }, (_, i) => task({ id: `t${i}`, files: [`helpers/f${i}.ts`] }));
    expect(validatePlan(plan(seven)).errors.join("\n")).toMatch(/máximo es 6/);
    const cycle = [task({ id: "a", files: ["helpers/a.ts"], depends_on: ["b"] }), task({ id: "b", files: ["helpers/b.ts"], depends_on: ["a"] })];
    expect(validatePlan(plan(cycle)).errors.join("\n")).toMatch(/ciclo/);
  });

  it("rejects an empty or oversized contract and unsafe paths", () => {
    expect(validatePlan(plan(GOOD, { contract: "" })).errors.join("\n")).toMatch(/contract está vacío/);
    expect(validatePlan(plan(GOOD, { contract: "x".repeat(12_001) })).errors.join("\n")).toMatch(/máximo es 12000/);
    expect(validatePlan(plan([task({ files: ["../secreto.ts"] })])).errors.join("\n")).toMatch(/no es una ruta válida/);
  });
});

describe("checkContract", () => {
  const ok = () => validatePlan(plan(GOOD)).plan as Plan;

  it("reads the routes of the contract", () => {
    expect(contractRoutes(CONTRACT)).toEqual([
      { method: "GET", route: "notes/list" },
      { method: "POST", route: "notes/create" },
    ]);
    expect(covers("endpoints/", "endpoints/a_GET.ts")).toBe(true);
    expect(covers("endpoints/a_GET.ts", "endpoints/")).toBe(false);
  });

  it("passes when every route has a backend owner and nothing extra is written", () => {
    expect(checkContract(ok())).toEqual([]);
  });

  it("flags a route nobody owns and an endpoint missing from the contract", () => {
    const p = ok();
    p.tasks[1]!.files = ["endpoints/notes/list_GET.ts", "endpoints/notes/extra_POST.ts"];
    const errors = checkContract(p).join("\n");
    expect(errors).toMatch(/"POST notes\/create" del contrato no tiene dueño/);
    expect(errors).toMatch(/endpoints\/notes\/extra_POST\.ts, que no está en el contrato/);
  });

  it("requires zod, the exported contract and input/output on every route", () => {
    const p = ok();
    p.contract = `export const contract = { "GET notes/list": { input: 1 } } as const;`;
    p.tasks[1]!.files = ["endpoints/notes/list_GET.ts"];
    const errors = checkContract(p).join("\n");
    expect(errors).toMatch(/importar zod/);
    expect(errors).toMatch(/necesita input y output/);
    p.contract = "export const x = 1;";
    expect(checkContract(p).join("\n")).toMatch(/export const contract/);
  });

  it("does not ask for routes when the plan has no backend work", () => {
    const p = validatePlan(plan([task({ id: "pages", role: "ui", files: ["pages/"] })], { contract: `import { z } from "zod";\nexport const contract = {} as const;` })).plan as Plan;
    expect(checkContract(p)).toEqual([]);
  });
});
