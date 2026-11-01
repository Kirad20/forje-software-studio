import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { builderTools } from "../../server/builder/tools.js";
import { apiTypes, methodName, schemaToTs } from "../../server/mcp/apiTypes.js";

describe("Forja API types", () => {
  it("names methods in camelCase", () => {
    expect(methodName("read_files")).toBe("readFiles");
    expect(methodName("get_preview_url")).toBe("getPreviewUrl");
  });

  it("maps JSON Schema to TypeScript", () => {
    expect(schemaToTs({ type: ["string", "null"] })).toBe("string | null");
    expect(schemaToTs({ type: "string", enum: ["a", "b"] })).toBe('"a" | "b"');
    expect(schemaToTs({ type: "array", items: { type: "integer" } })).toBe("number[]");
    expect(schemaToTs({ type: "array", items: { type: ["string", "null"] } })).toBe("(string | null)[]");
    expect(schemaToTs({ type: "object" })).toBe("Record<string, unknown>");
    expect(schemaToTs({ type: "object", properties: { a: { type: "string" }, b: { type: "number" } }, required: ["a"] })).toBe("{\n  a: string;\n  b?: number;\n}");
  });

  it("declares every typed tool and nothing else", () => {
    const d = apiTypes(builderTools);
    for (const t of builderTools) {
      const declared = d.includes(`  ${methodName(t.name)}(`);
      expect(declared, t.name).toBe(!!t.output_schema);
    }
    expect(d).toContain("readFiles(input: {");
    expect(d).toContain("listFiles(input?: {}): Promise<{");
  });

  it("compiles, and code written against it type-checks", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "forja-api-"));
    try {
      writeFileSync(path.join(dir, "forja.d.ts"), apiTypes(builderTools));
      // What an agent would write in Code Mode: several reads, filtered in code, one small result back.
      writeFileSync(
        path.join(dir, "agent.ts"),
        [
          "export async function main() {",
          '  const { matches } = await forja.searchCode({ pattern: "fetch\\\\(", path_prefix: "pages/" });',
          "  const { files } = await forja.readFiles({ paths: [...new Set(matches.map((m) => m.path))] });",
          "  const { tables } = await forja.describeDatabase();",
          "  const build = await forja.checkBuild();",
          "  return { pages: files.filter((f) => f.exists).length, tables: tables.map((t) => t.name), ok: build.ok };",
          "}",
          "",
        ].join("\n"),
      );
      writeFileSync(
        path.join(dir, "tsconfig.json"),
        JSON.stringify({ compilerOptions: { strict: true, noEmit: true, target: "es2022", module: "es2022", lib: ["es2022"], types: [] }, include: ["*.ts"] }),
      );
      const tsc = path.resolve("node_modules/.bin/tsc");
      execFileSync(tsc, ["-p", path.join(dir, "tsconfig.json")], { encoding: "utf8" });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 60_000);
});
