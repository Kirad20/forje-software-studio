import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { sourceImports } from "../helpers/sourceImports.js";

const root = path.resolve(".");
const modulesRoot = path.join(root, "server", "modules");
const featuresRoot = path.join(root, "studio", "src", "features");

function files(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === "skills" ? [] : files(file);
    return /\.(tsx?|mjs)$/.test(entry.name) ? [file] : [];
  });
}

function imports(file: string, runtimeOnly = false): string[] {
  return sourceImports(readFileSync(file, "utf8"))
    .filter((reference) => !runtimeOnly || reference.runtime)
    .map((reference) => reference.specifier);
}

function relative(file: string): string {
  return path.relative(root, file).replaceAll("\\", "/");
}

function internalOwner(base: string, file: string): string | undefined {
  const parts = path.relative(base, file).split(path.sep);
  return parts[0] !== ".." && parts.length >= 2 ? parts[0] : undefined;
}

function findCycles(edges: Map<string, Set<string>>): string[] {
  const cycles = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];
  function visit(node: string) {
    const index = stack.indexOf(node);
    if (index !== -1) {
      const cycle = stack.slice(index);
      const first = cycle.reduce((best, value, i) => value < cycle[best]! ? i : best, 0);
      const ordered = [...cycle.slice(first), ...cycle.slice(0, first)];
      cycles.add([...ordered, ordered[0]].join(" -> "));
      return;
    }
    if (visited.has(node)) return;
    stack.push(node);
    for (const next of edges.get(node) ?? []) visit(next);
    stack.pop();
    visited.add(node);
  }
  for (const node of edges.keys()) visit(node);
  return [...cycles].sort();
}

describe("Complete modular monolith architecture", () => {
  it("has no deprecated directories or moved legacy facades", () => {
    const deprecated = [
      "server/platform", "server/llm", "server/runtime", "server/baas", "server/evals",
      "server/admin", "server/api", "server/mcp", "server/settings", "server/builder", "server/lib", "server/db",
      "server/modules/builder/agent.ts", "server/modules/builder/tools.ts",
      "server/modules/builder/gate.ts", "server/modules/builder/orchestrator.ts",
      "studio/src/api.ts", "studio/src/pages", "studio/src/components",
    ];
    expect(deprecated.filter((entry) => existsSync(path.join(root, entry)))).toEqual([]);
  });

  it("all backend domain, application and ports depend inward", () => {
    const violations: string[] = [];
    for (const context of readdirSync(modulesRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory())) {
      const contextRoot = path.join(modulesRoot, context.name);
      for (const layer of ["domain", "application", "ports"]) {
        for (const file of files(path.join(contextRoot, layer))) {
          for (const spec of imports(file)) {
            const target = path.resolve(path.dirname(file), spec);
            const local = path.relative(contextRoot, target).replaceAll("\\", "/");
            const allowed = layer === "domain" ? /^domain\// : layer === "ports" ? /^(domain|ports)\// : /^(domain|ports|application)\//;
            const contract = target.startsWith(path.join(root, "contracts") + path.sep);
            if (!spec.startsWith(".") || (!allowed.test(local) && !contract)) violations.push(`${relative(file)} -> ${spec}`);
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("cross-context and cross-feature consumers use public entrypoints", () => {
    const violations: string[] = [];
    for (const [base, consumers] of [[modulesRoot, files(path.join(root, "server"))], [featuresRoot, files(path.join(root, "studio", "src"))]] as const) {
      for (const file of consumers) {
        const owner = internalOwner(base, file);
        for (const spec of imports(file).filter((value) => value.startsWith("."))) {
          const target = path.resolve(path.dirname(file), spec);
          const targetOwner = internalOwner(base, target);
          if (!targetOwner || targetOwner === owner) continue;
          if (path.relative(base, target).split(path.sep).length !== 2) violations.push(`${relative(file)} -> ${spec}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("runtime context and feature dependency graphs are acyclic", () => {
    const violations: string[] = [];
    for (const base of [modulesRoot, featuresRoot]) {
      const edges = new Map<string, Set<string>>();
      for (const file of files(base)) {
        const owner = internalOwner(base, file)!;
        for (const spec of imports(file, true).filter((value) => value.startsWith("."))) {
          const targetOwner = internalOwner(base, path.resolve(path.dirname(file), spec));
          if (!targetOwner || targetOwner === owner) continue;
          if (!edges.has(owner)) edges.set(owner, new Set());
          edges.get(owner)!.add(targetOwner);
        }
      }
      violations.push(...findCycles(edges).map((cycle) => `${relative(base)}: ${cycle}`));
    }
    expect(violations).toEqual([]);
  });

  it("SDK and Studio do not import backend implementations", () => {
    const violations: string[] = [];
    for (const file of [...files(path.join(root, "sdk")), ...files(path.join(root, "studio", "src"))]) {
      for (const spec of imports(file)) {
        if (spec.startsWith(".") && path.resolve(path.dirname(file), spec).startsWith(path.join(root, "server") + path.sep)) violations.push(`${relative(file)} -> ${spec}`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("relative source imports resolve after relocation", () => {
    const violations: string[] = [];
    const sources = [...files(path.join(root, "server")), ...files(path.join(root, "sdk")), ...files(path.join(root, "studio", "src")), ...files(path.join(root, "test"))];
    for (const file of sources) {
      for (const spec of imports(file).filter((value) => value.startsWith("."))) {
        const target = path.resolve(path.dirname(file), spec);
        const stem = target.replace(/\.js$/, "");
        if (![target, `${stem}.ts`, `${stem}.tsx`, path.join(target, "index.ts"), path.join(target, "index.tsx")].some((candidate) => existsSync(candidate))) {
          violations.push(`${relative(file)} -> ${spec}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("SQL is confined to infrastructure, never core or HTTP/MCP handlers", () => {
    const violations: string[] = [];
    for (const file of [...files(modulesRoot), ...files(path.join(root, "server", "bootstrap", "http")), ...files(path.join(root, "server", "bootstrap", "mcp"))]) {
      if (relative(file).includes("/infrastructure/")) continue;
      const source = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\/|^\s*\/\/[^\n]*/gm, "");
      if (/\b(?:select\s+.+?\s+from|insert\s+into|delete\s+from|update\s+\w+\s+set)\b/i.test(source)) violations.push(relative(file));
    }
    expect(violations).toEqual([]);
  });
});
