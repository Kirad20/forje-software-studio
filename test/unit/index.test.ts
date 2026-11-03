import { describe, expect, it } from "vitest";
import { buildIndex, findSymbol, projectMap, relatedFiles, selectContext } from "../../server/modules/builder/infrastructure/projectIndex.js";

const files = {
  "base.css": ":root { --primary: #000; }",
  "pages/_index.tsx": `import { useApi } from "@forja/client";\nimport { TodoList } from "~/components/TodoList";\nexport default function Home() { const { data } = useApi("todos/list"); return <TodoList items={data} />; }`,
  "components/TodoList.tsx": `/** Lista de tareas con casillas. */\nimport styles from "./TodoList.module.css";\nexport function TodoList(p: any) { return <ul className={styles.list} />; }`,
  "components/TodoList.module.css": ".list { margin: 0 }",
  "endpoints/todos/list_GET.ts": `// Tareas del usuario actual.\nexport default async (ctx: any) => ctx.db.query("select * from todos where user_id = $1", [ctx.requireUser().id]);`,
  "endpoints/todos/create_POST.ts": `export default async (ctx: any) => ctx.db.one("insert into todos (title) values ($1) returning *", [ctx.body.title]);`,
  "helpers/money.ts": `export const cents = (n: number) => Math.round(n * 100);\nexport type Money = number;`,
  "static/__dev/todos.md": "- [ ] algo",
};

describe("project index", () => {
  it("extracts exports, imports, tables and API calls", () => {
    const idx = buildIndex(files);
    expect(idx.facts.get("helpers/money.ts")!.exports).toEqual(expect.arrayContaining(["cents", "Money"]));
    expect(idx.facts.get("pages/_index.tsx")!.imports).toContain("components/TodoList.tsx");
    expect(idx.facts.get("pages/_index.tsx")!.apiCalls).toEqual(["todos/list"]);
    expect(idx.facts.get("pages/_index.tsx")!.components).toContain("TodoList");
    expect(idx.facts.get("endpoints/todos/list_GET.ts")!.tables).toEqual(["todos"]);
    expect(idx.facts.get("components/TodoList.tsx")!.summary).toBe("Lista de tareas con casillas.");
  });

  it("builds a compact map that names routes, endpoints, users and tables", () => {
    const map = projectMap(files, { todos: [{ name: "id", type: "integer" }, { name: "title", type: "text" }] });
    expect(map).toContain("/ ← pages/_index.tsx");
    expect(map).toContain("GET todos/list · tablas todos");
    expect(map).toContain("usado por _index.tsx");
    expect(map).toContain("todos(id, title)");
    expect(map.length).toBeLessThan(2000);
  });

  it("links pages and endpoints through API calls", () => {
    expect(relatedFiles(files, "pages/_index.tsx")).toEqual(expect.arrayContaining(["components/TodoList.tsx", "endpoints/todos/list_GET.ts"]));
    expect(relatedFiles(files, "endpoints/todos/list_GET.ts")).toContain("pages/_index.tsx");
    expect(relatedFiles(files, "components/TodoList.tsx")).toEqual(expect.arrayContaining(["components/TodoList.module.css", "pages/_index.tsx"]));
  });

  it("finds definitions and uses", () => {
    const out = findSymbol(files, "TodoList");
    expect(out).toMatch(/Definido en:\ncomponents\/TodoList\.tsx:3/);
    expect(out).toContain("pages/_index.tsx");
  });

  it("selects owned files and their neighbours first, within budget", () => {
    const picked = selectContext(files, "añadir filtro a la lista de tareas", ["components/TodoList.tsx"], 10_000);
    expect(picked[0]).toBe("components/TodoList.tsx");
    expect(picked).toContain("pages/_index.tsx");
    expect(selectContext(files, "todos", ["endpoints/"], 50).length).toBe(0);
  });

  it("re-indexes only what changed (cache by content)", () => {
    const a = buildIndex(files).facts.get("helpers/money.ts");
    const b = buildIndex({ ...files, "pages/_index.tsx": files["pages/_index.tsx"] + "\n" }).facts.get("helpers/money.ts");
    expect(b).toBe(a);
  });
});
