import type { BuilderTool } from "../../modules/builder/index.js";

/**
 * TypeScript declarations of the typed tools, generated from the same registry as the MCP tool
 * list: the API an agent would write code against in Code Mode (`await forja.readFiles(...)`).
 * Only tools with an output schema are included; the rest stay plain MCP tools.
 */

type Schema = Record<string, any>;

const IDENT = /^[A-Za-z_$][\w$]*$/;
const key = (k: string) => (IDENT.test(k) ? k : JSON.stringify(k));
const doc = (text: string | undefined, indent: string) => (text ? `${indent}/** ${text.replace(/\*\//g, "*\\/").replace(/\s+/g, " ").trim()} */\n` : "");

/** `read_files` → `readFiles` */
export const methodName = (tool: string) => tool.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());

export function schemaToTs(schema: Schema | undefined, indent = ""): string {
  if (!schema) return "unknown";
  if (Array.isArray(schema.enum)) return schema.enum.map((v: unknown) => JSON.stringify(v)).join(" | ");
  if (Array.isArray(schema.type)) return schema.type.map((t: string) => schemaToTs({ ...schema, type: t }, indent)).join(" | ");
  switch (schema.type) {
    case "string":
      return "string";
    case "integer":
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "null":
      return "null";
    case "array": {
      const item = schemaToTs(schema.items, indent);
      return /[|&{]/.test(item) && !item.startsWith("{") ? `(${item})[]` : `${item}[]`;
    }
    case "object": {
      const props = Object.entries((schema.properties ?? {}) as Record<string, Schema>);
      if (!props.length) return schema.additionalProperties === false ? "{}" : "Record<string, unknown>";
      const required = new Set<string>(schema.required ?? []);
      const inner = indent + "  ";
      const lines = props.map(([k, v]) => `${doc(v.description, inner)}${inner}${key(k)}${required.has(k) ? "" : "?"}: ${schemaToTs(v, inner)};`);
      return `{\n${lines.join("\n")}\n${indent}}`;
    }
    default:
      return "unknown";
  }
}

export function apiTypes(tools: BuilderTool[]): string {
  const methods = tools
    .filter((t) => t.output_schema)
    .map((t) => {
      const input = t.input_schema as Schema;
      const noArgs = !Object.keys(input.properties ?? {}).length;
      const optional = noArgs || !(input.required ?? []).length;
      const param = noArgs ? "input?: {}" : `input${optional ? "?" : ""}: ${schemaToTs(input, "  ")}`;
      return `${doc(t.description, "  ")}  ${methodName(t.name)}(${param}): Promise<${schemaToTs(t.output_schema, "  ")}>;`;
    });
  return [
    "// Generado desde el registro de herramientas de Forja (server/bootstrap/mcp/apiTypes.ts). No editar a mano.",
    "/** API de Forja para código: cada método llama a la herramienta del mismo nombre en snake_case. */",
    "declare const forja: {",
    methods.join("\n"),
    "};",
    "",
  ].join("\n");
}
