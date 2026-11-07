// Runs the typed read tools against a small fixture project and returns their text outputs.
// Used by toolOutputs.test.ts to prove the data/format split keeps every string the agents see.
let release: (() => Promise<void>) | undefined;
export async function closeFixture() { await release?.(); }

export async function runFixture() {
  const { createMonolith } = await import("../../server/bootstrap/composition.js");
  const monolith = createMonolith();
  const projects = monolith.projects;
  const { applyProjectMigrations, execSql, closeAll } = await import("../../server/modules/app-services/projectDb.js");
  await monolith.startBindings();
  release = async () => {
    await closeAll();
    await monolith.stopBindings();
  };
  const { q } = await import("../../server/shared/database/index.js");
  const { builderTools } = await import("../../server/modules/builder/index.js");
  await q(`insert into accounts (id, email) values ('acc', 'o@x.test') on conflict do nothing`);
  const p = await projects.createProject("acc", "Fixture", "", {
    "pages/_index.tsx": "export default function Home() {\n  return <h1>Hola</h1>;\n}\n",
    "helpers/sum.ts": "export const sum = (a: number, b: number) => a + b;\n",
    "migrations/20260101000000000_fixture.sql": "create table items (id serial primary key, name text not null, price numeric default 0);",
    "endpoints/items_GET.ts": "export default async function handler() {\n  return Response.json({ ok: true });\n}\n",
  });
  await applyProjectMigrations(p.id, [{
    path: "migrations/20260101000000000_fixture.sql",
    sql: "create table items (id serial primary key, name text not null, price numeric default 0);",
  }], "preview");
  await execSql(p.id, "insert into items (name) values ('a'), ('b');", "preview");
  const account = await monolith.identity.getAccount("acc");
  if (!account) throw new Error("Fixture account is missing");
  const ctx = { account, projectId: p.id, author: "builder" as const };
  const calls: [string, Record<string, unknown>][] = [
    ["list_files", {}],
    ["read_files", { paths: ["helpers/sum.ts", "pages/_index.tsx:2-3", "nope.ts"] }],
    ["search_code", { pattern: "export", path_prefix: "helpers/" }],
    ["search_code", { pattern: "zzz_nothing" }],
    ["describe_database", {}],
    ["query_database", { sql: "select id, name from items order by id" }],
    ["list_secrets", {}],
    ["get_logs", { limit: 5 }],
    ["run_tests", {}],
  ];
  const out: Record<string, string> = {};
  for (const [name, input] of calls) {
    const tool = builderTools.find((t) => t.name === name)!;
    const r = await tool.run(input, ctx);
    out[`${name} ${JSON.stringify(input)}`] = typeof r === "string" ? r.replace(p.id, "<id>") : r.text;
  }
  return { out, tools: builderTools, ctx, modules: monolith };
}
