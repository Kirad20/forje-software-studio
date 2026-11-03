import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildClient, checkProject, compileServerModule } from "../../server/modules/app-runtime/index.js";
import { depsDir, packageName, readDeps, writeDeps } from "../../server/modules/app-runtime/index.js";

describe("project packages: manifest", () => {
  it("parses package names from import specifiers", () => {
    expect(packageName("date-fns")).toBe("date-fns");
    expect(packageName("date-fns/format")).toBe("date-fns");
    expect(packageName("@tanstack/react-table")).toBe("@tanstack/react-table");
    expect(packageName("@scope/pkg/sub/path")).toBe("@scope/pkg");
  });

  it("accepts exact versions only and ignores the built-in packages", () => {
    expect(readDeps({})).toEqual({});
    expect(readDeps({ "package.json": JSON.stringify({ dependencies: { "date-fns": "4.1.0", react: "18.0.0" } }) })).toEqual({ "date-fns": "4.1.0" });
    expect(() => readDeps({ "package.json": JSON.stringify({ dependencies: { "date-fns": "^4.1.0" } }) })).toThrow(/versión exacta/);
    expect(() => readDeps({ "package.json": JSON.stringify({ dependencies: { x: "git+https://evil/x.git" } }) })).toThrow(/versión exacta/);
    expect(() => readDeps({ "package.json": JSON.stringify({ dependencies: { "../x": "1.0.0" } }) })).toThrow(/no válido/);
    expect(() => readDeps({ "package.json": "{" })).toThrow(/JSON/);
  });

  it("writes a sorted manifest and keeps other fields", () => {
    const out = JSON.parse(writeDeps({ "package.json": '{"name":"mi-app"}' }, { zeta: "1.0.0", alfa: "2.0.0" }));
    expect(out.name).toBe("mi-app");
    expect(Object.keys(out.dependencies)).toEqual(["alfa", "zeta"]);
  });
});

describe("project packages: bundling", () => {
  // A dependency set "installed" by hand, so the test needs no network.
  const deps = { "forja-test-pkg": "1.0.0" };
  const dir = depsDir(deps);
  const manifest = JSON.stringify({ dependencies: deps });
  const put = (rel: string, content: string) => {
    mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    writeFileSync(path.join(dir, rel), content);
  };

  beforeAll(() => {
    put("node_modules/forja-test-pkg/package.json", JSON.stringify({ name: "forja-test-pkg", version: "1.0.0", main: "index.js" }));
    put("node_modules/forja-test-pkg/index.js", 'import { useState } from "react";\nexport const greet = () => "hola-desde-paquete";\nexport { useState };\n');
    // A second React brought along by the package: the bundle must not use it.
    put("node_modules/react/package.json", JSON.stringify({ name: "react", version: "0.0.1", main: "index.js" }));
    put("node_modules/react/index.js", 'export const useState = () => "REACT-DUPLICADO";\n');
    put(".forja-ready", "test");
  });
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  const page = 'import { greet } from "forja-test-pkg";\nexport default function Home() { return <p>{greet()}</p>; }\n';

  it("bundles an installed package into the browser build, with Forja's React", async () => {
    const { js } = await buildClient({ "package.json": manifest, "pages/_index.tsx": page });
    expect(js).toContain("hola-desde-paquete");
    expect(js).not.toContain("REACT-DUPLICADO");
  });

  it("reports a package that is imported but not installed", async () => {
    const problems = await checkProject({ "pages/_index.tsx": 'import confetti from "canvas-confetti";\nexport default () => String(confetti);\n' });
    expect(problems.map((p) => p.text).join("\n")).toMatch(/canvas-confetti.*add_dependency/);
  });

  it("reports node modules imported from the browser", async () => {
    const problems = await checkProject({ "pages/_index.tsx": 'import fs from "node:fs";\nexport default () => String(fs);\n' });
    expect(problems.map((p) => p.text).join("\n")).toMatch(/módulo de Node/);
  });

  it("keeps packages external in endpoints and writes the bundle next to them", async () => {
    const files = {
      "package.json": manifest,
      "endpoints/hello_GET.ts": 'import { greet } from "forja-test-pkg";\nimport { z } from "zod";\nimport { randomUUID } from "node:crypto";\nexport default async () => ({ msg: greet(), ok: z.string().parse("x"), id: randomUUID() });\n',
    };
    const mod = await compileServerModule(files, "endpoints/hello_GET.ts");
    expect(mod.file.startsWith(dir)).toBe(true);
    expect(mod.exports).toContain("default");
    const code = (await import("node:fs")).readFileSync(mod.file, "utf8");
    expect(code).toMatch(/from "forja-test-pkg"/);
    expect(code).not.toContain("hola-desde-paquete");
  });

  it("fails the build when a package is imported in an endpoint without being installed", async () => {
    const problems = await checkProject({ "endpoints/x_GET.ts": 'import dayjs from "dayjs";\nexport default async () => dayjs();\n' });
    expect(problems.map((p) => p.text).join("\n")).toMatch(/dayjs.*add_dependency/);
  });
});
