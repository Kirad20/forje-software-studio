import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const dir = mkdtempSync(path.join(os.tmpdir(), "forja-tools-"));
process.env.DATA_DIR = dir;
const { runFixture } = await import("./toolOutputs.fixture.js");
afterAll(() => rmSync(dir, { recursive: true, force: true }));

/**
 * The text each typed tool returned BEFORE the data/format split, captured from the old code
 * on the same fixture. Agents parse some of it (e.g. "Compila sin errores", "Todo en verde"),
 * so the split must not change a byte.
 */
const BEFORE: Record<string, string> = {
  "list_files {}": "Archivos:\n  endpoints/items_GET.ts (82 B)\n  helpers/sum.ts (52 B)\n  pages/_index.tsx (59 B)\n\nPáginas: / ← pages/_index.tsx\nEndpoints: GET /_api/items\nTareas: ninguna",
  "read_files {\"paths\":[\"helpers/sum.ts\",\"pages/_index.tsx:2-3\",\"nope.ts\"]}": "### helpers/sum.ts\n   1\texport const sum = (a: number, b: number) => a + b;\n   2\t\n\n### pages/_index.tsx (líneas 2-3 de 4)\n   2\t  return <h1>Hola</h1>;\n   3\t}\n\n### nope.ts\n(no existe)",
  "search_code {\"pattern\":\"export\",\"path_prefix\":\"helpers/\"}": "helpers/sum.ts:1: export const sum = (a: number, b: number) => a + b;",
  "search_code {\"pattern\":\"zzz_nothing\"}": "Sin coincidencias.",
  "describe_database {}": "items(\n  id integer not null default nextval('items_id_seq'::regclass),\n  name text not null,\n  price numeric default 0\n)",
  "query_database {\"sql\":\"select id, name from items order by id\"}": "2 filas\n[\n {\n  \"id\": 1,\n  \"name\": \"a\"\n },\n {\n  \"id\": 2,\n  \"name\": \"b\"\n }\n]",
  "list_secrets {}": "Sin secretos.",
  "get_logs {\"limit\":5}": "Sin registros.",
  "run_tests {}": "No hay pruebas. Crea helpers/<nombre>.spec.ts que importe el helper y use describe/it/expect."
};

/** Minimal JSON Schema check: types, required keys, no extra keys, enums. Enough for our output schemas. */
function conforms(value: unknown, schema: Record<string, any>, at = "$"): string[] {
  const types: string[] = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : [];
  const kind = value === null ? "null" : Array.isArray(value) ? "array" : Number.isInteger(value) ? "integer" : typeof value;
  if (types.length && !types.includes(kind) && !(kind === "integer" && types.includes("number"))) return [`${at}: ${kind} no es ${types.join("|")}`];
  if (schema.enum && !schema.enum.includes(value)) return [`${at}: ${String(value)} fuera de enum`];
  const errs: string[] = [];
  if (kind === "array" && schema.items) (value as unknown[]).forEach((v, i) => errs.push(...conforms(v, schema.items, `${at}[${i}]`)));
  if (kind === "object" && schema.properties) {
    const obj = value as Record<string, unknown>;
    for (const k of schema.required ?? []) if (!(k in obj)) errs.push(`${at}.${k}: falta`);
    for (const [k, v] of Object.entries(obj)) {
      if (schema.properties[k]) errs.push(...conforms(v, schema.properties[k], `${at}.${k}`));
      else if (schema.additionalProperties === false) errs.push(`${at}.${k}: no está en el schema`);
    }
  }
  return errs;
}

describe("typed tools", async () => {
  const { out, tools, ctx } = await runFixture();

  it("keeps every text output byte for byte", () => {
    expect(out).toEqual(BEFORE);
  });

  it("returns data that matches each tool's output schema", async () => {
    const inputs: Record<string, Record<string, unknown>> = {};
    for (const key of Object.keys(BEFORE)) {
      const [name, ...rest] = key.split(" ");
      inputs[name!] ??= JSON.parse(rest.join(" "));
    }
    for (const [name, input] of Object.entries(inputs)) {
      const tool = tools.find((t) => t.name === name)!;
      expect(tool.output_schema, name).toBeDefined();
      const { data } = await tool.call!(input, ctx);
      expect(conforms(data, tool.output_schema!), name).toEqual([]);
    }
  });

  it("gives structured results code can use without parsing text", async () => {
    const tool = (n: string) => tools.find((t) => t.name === n)!;
    const q = await tool("query_database").call!({ sql: "select name from items order by id" }, ctx);
    expect(q.data).toEqual({ rowCount: 2, rows: [{ name: "a" }, { name: "b" }] });
    const r = await tool("read_files").call!({ paths: ["pages/_index.tsx:2-2"] }, ctx);
    expect(r.data).toEqual({ files: [{ path: "pages/_index.tsx", exists: true, content: "  return <h1>Hola</h1>;", range: { from: 2, to: 2, total: 4 } }] });
    const s = await tool("search_code").call!({ pattern: "sum" }, ctx);
    expect((s.data as { matches: unknown[] }).matches).toEqual([{ path: "helpers/sum.ts", line: 1, text: "export const sum = (a: number, b: number) => a + b;" }]);
  });

  it("covers the build, scan, problems and preview tools too", async () => {
    for (const name of ["check_build", "security_scan", "get_problems", "get_preview_url"]) {
      const tool = tools.find((t) => t.name === name)!;
      const { data, output } = await tool.call!({}, ctx);
      expect(conforms(data, tool.output_schema!), name).toEqual([]);
      expect(output).toBe(await tool.run({}, ctx));
    }
  }, 60_000);

  it("serves outputSchema and structuredContent over MCP, accepted by the SDK client", async () => {
    const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
    const { StreamableHTTPClientTransport } = await import("@modelcontextprotocol/sdk/client/streamableHttp.js");
    const { handleMcp } = await import("../../server/mcp/server.js");
    const transport = new StreamableHTTPClientTransport(new URL("http://forja.test/mcp"), {
      fetch: (url, init) => handleMcp(new Request(url, init), ctx.account),
    });
    const client = new Client({ name: "test", version: "0" });
    await client.connect(transport);
    const { tools: listed } = await client.listTools();
    const typedNames = tools.filter((t) => t.output_schema).map((t) => t.name);
    expect(typedNames.length).toBeGreaterThanOrEqual(12);
    for (const n of typedNames) expect(listed.find((t) => t.name === n)?.outputSchema, n).toBeDefined();
    // The SDK client validates structuredContent against outputSchema and throws on a mismatch.
    const r = await client.callTool({ name: "describe_database", arguments: { projectId: ctx.projectId } });
    expect(r.structuredContent).toMatchObject({ tables: [{ name: "items" }] });
    expect((r.content as { text: string }[])[0]!.text).toBe(BEFORE["describe_database {}"]);
    const plain = await client.callTool({ name: "find_symbol", arguments: { projectId: ctx.projectId, name: "sum" } });
    expect(plain.structuredContent).toBeUndefined();
    // A slow call answers PENDING; that shape is part of the advertised schema, so strict clients accept it.
    process.env.FORJA_MCP_INLINE_MS = "0";
    try {
      const pending = await client.callTool({ name: "check_build", arguments: { projectId: ctx.projectId } });
      expect(pending.structuredContent).toMatchObject({ status: "pending" });
      const jobId = (pending.structuredContent as { jobId: string }).jobId;
      const done = await client.callTool({ name: "get_job_status", arguments: { jobId, wait_seconds: 25 } });
      expect(done.structuredContent).toEqual({ ok: true, problems: [] });
    } finally {
      delete process.env.FORJA_MCP_INLINE_MS;
    }
    await client.close();
  }, 60_000);

  it("still rejects writes in query_database", async () => {
    await expect(tools.find((t) => t.name === "query_database")!.call!({ sql: "delete from items" }, ctx)).rejects.toThrow(/solo acepta lecturas/);
  });
});
