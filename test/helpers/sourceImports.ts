import { parse } from "@babel/parser";

export interface SourceImport {
  specifier: string;
  runtime: boolean;
}

function stringLiteral(value: unknown): string | undefined {
  if (value === null || typeof value !== "object" || !("type" in value)) return undefined;
  if (value.type === "StringLiteral" && "value" in value && typeof value.value === "string") return value.value;
  if (value.type === "TemplateLiteral" && "expressions" in value && Array.isArray(value.expressions)
    && value.expressions.length === 0 && "quasis" in value && Array.isArray(value.quasis)) {
    const quasi: unknown = value.quasis[0];
    if (quasi !== null && typeof quasi === "object" && "value" in quasi && quasi.value !== null
      && typeof quasi.value === "object" && "cooked" in quasi.value && typeof quasi.value.cooked === "string") return quasi.value.cooked;
  }
  return undefined;
}

export function sourceImports(source: string): SourceImport[] {
  const ast = parse(source, { sourceType: "unambiguous", plugins: ["typescript", "jsx"] });
  const imports: SourceImport[] = [];
  for (const node of ast.program.body) {
    if (node.type === "ImportDeclaration") {
      const onlyTypes = node.importKind === "type" || (node.specifiers.length > 0
        && node.specifiers.every((specifier) => specifier.type === "ImportSpecifier" && specifier.importKind === "type"));
      imports.push({ specifier: node.source.value, runtime: !onlyTypes });
    } else if (node.type === "ExportAllDeclaration" || (node.type === "ExportNamedDeclaration" && node.source)) {
      const onlyTypes = node.exportKind === "type" || (node.type === "ExportNamedDeclaration" && node.specifiers.length > 0
        && node.specifiers.every((specifier) => specifier.type === "ExportSpecifier" && specifier.exportKind === "type"));
      imports.push({ specifier: node.source!.value, runtime: !onlyTypes });
    }
  }
  function visit(value: unknown): void {
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
    } else if (value !== null && typeof value === "object") {
      let specifier: string | undefined;
      let runtime = true;
      if ("type" in value) {
        if (value.type === "ImportExpression" && "source" in value) specifier = stringLiteral(value.source);
        else if (value.type === "TSImportType" && "argument" in value) {
          specifier = stringLiteral(value.argument);
          runtime = false;
        } else if (value.type === "CallExpression" && "callee" in value && value.callee !== null
          && typeof value.callee === "object" && "type" in value.callee && value.callee.type === "Import"
          && "arguments" in value && Array.isArray(value.arguments)) specifier = stringLiteral(value.arguments[0]);
        else if (value.type === "CallExpression" && "callee" in value && value.callee !== null
          && typeof value.callee === "object" && "type" in value.callee && value.callee.type === "MemberExpression"
          && "object" in value.callee && value.callee.object !== null && typeof value.callee.object === "object"
          && "name" in value.callee.object && value.callee.object.name === "vi"
          && "property" in value.callee && value.callee.property !== null && typeof value.callee.property === "object"
          && "name" in value.callee.property && typeof value.callee.property.name === "string"
          && ["mock", "doMock", "unmock", "doUnmock"].includes(value.callee.property.name)
          && "arguments" in value && Array.isArray(value.arguments)) {
          specifier = stringLiteral(value.arguments[0]);
          runtime = false;
        }
      }
      if (specifier) imports.push({ specifier, runtime });
      for (const child of Object.values(value)) visit(child);
    }
  }
  visit(ast.program);
  return imports;
}
