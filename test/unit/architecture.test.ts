import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve("server");
const modulesRoot = path.join(root, "modules");
const contexts = ["identity", "projects", "collaboration", "settings", "builder"];

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? sources(file) : file.endsWith(".ts") ? [file] : [];
  });
}

function imports(file: string): string[] {
  const source = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\/|^\s*\/\/[^\n]*/gm, "");
  return [...source.matchAll(/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)["']([^"']+)["']/g)].map((match) => match[1]!);
}

describe("Modular monolith architecture", () => {
  for (const context of contexts) {
    it(`${context}: domain, application and ports are independent of adapters`, () => {
      const contextRoot = path.join(modulesRoot, context);
      const violations: string[] = [];
      for (const layer of ["domain", "application", "ports"]) {
        for (const file of sources(path.join(contextRoot, layer))) {
          for (const spec of imports(file)) {
            const target = path.resolve(path.dirname(file), spec);
            const relative = path.relative(contextRoot, target);
            const allowed = layer === "domain" ? /^domain[\\/]/ : layer === "ports" ? /^(domain|ports)[\\/]/ : /^(domain|application|ports)[\\/]/;
            if (!spec.startsWith(".") || relative.startsWith("..") || !allowed.test(relative)) {
              violations.push(`${path.relative(root, file)} -> ${spec}`);
            }
          }
        }
      }
      expect(violations).toEqual([]);
    });
  }

  it("consumers access bounded contexts only through public entrypoints", () => {
    const violations: string[] = [];
    for (const file of sources(root)) {
      for (const spec of imports(file)) {
        if (!spec.startsWith(".")) continue;
        const target = path.resolve(path.dirname(file), spec);
        const relative = path.relative(modulesRoot, target);
        const segments = relative.split(path.sep);
        if (!contexts.includes(segments[0] ?? "")) continue;
        const owner = path.relative(modulesRoot, file).split(path.sep)[0];
        if (owner === segments[0]) continue;
        if (segments.length !== 2 || !["index.js", "registry.js", "contracts.js"].includes(segments[1]!)) {
          violations.push(`${path.relative(root, file)} -> ${spec}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("legacy platform and settings entrypoints do not execute SQL", () => {
    const files = ["platform/accounts.ts", "platform/projects.ts", "platform/orgs.ts", "platform/members.ts", "settings/store.ts"];
    const violations = files.filter((file) => {
      const code = readFileSync(path.join(root, ...file.split("/")), "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "");
      return /\b(select|insert\s+into|update\s+\w+\s+set|delete\s+from)\b/i.test(code);
    });
    expect(violations).toEqual([]);
  });

  it("modules do not call back into their own compatibility facades", () => {
    const facades: Record<string, string[]> = {
      identity: ["platform/accounts.js", "platform/bootstrap.js"],
      projects: ["platform/projects.js"],
      collaboration: ["platform/orgs.js", "platform/members.js"],
      settings: ["settings/store.js", "settings/registry.js"],
      builder: ["builder/agent.js", "builder/orchestrator.js", "builder/gate.js", "builder/tools.js"],
    };
    const violations: string[] = [];
    for (const context of contexts) {
      const forbidden = new Set(facades[context]!.map((file) => path.join(root, ...file.split("/"))));
      for (const file of sources(path.join(modulesRoot, context))) {
        for (const spec of imports(file)) {
          if (spec.startsWith(".") && forbidden.has(path.resolve(path.dirname(file), spec))) {
            violations.push(`${path.relative(root, file)} -> ${spec}`);
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
