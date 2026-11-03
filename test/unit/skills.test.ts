import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BUILDER_SYSTEM_PROMPT } from "../../server/builder/prompt.js";
import { ROLE_PROMPTS, ROLE_TOOLS } from "../../server/builder/roles.js";
import { BUILTIN_SKILLS } from "../../server/builder/skillLibrary.js";
import { SKILLS_DIR, allSkills, findSkill, parseSkill, projectSkills, renderSkill, skillIndex } from "../../server/builder/skills.js";
import { builderTools } from "../../server/builder/tools.js";
import { buildClient } from "../../server/runtime/bundler.js";
import { KIT_CATALOG } from "../../server/runtime/catalog.js";
import { typecheckProject } from "../../server/runtime/typecheck.js";

const OPEN_SOURCE = ["frontend-design", "impeccable", "hallmark", "taste-skill", "ui-ux-pro-max", "web-design-guidelines"];

describe("skills", () => {
  it("ships skills with a name, a one-line description and a body, with no duplicates", () => {
    expect(BUILTIN_SKILLS.length).toBeGreaterThanOrEqual(20);
    expect(new Set(BUILTIN_SKILLS.map((s) => s.name)).size).toBe(BUILTIN_SKILLS.length);
    for (const s of BUILTIN_SKILLS) {
      expect(s.name, s.name).toMatch(/^[a-z0-9-]+$/);
      expect(s.description.length, s.name).toBeGreaterThan(20);
      expect(s.description, s.name).not.toContain("\n");
      expect(s.body.length, s.name).toBeGreaterThan(200);
    }
  });

  it("parses front matter, falls back to the file name and first line, and ignores empty files", () => {
    expect(parseSkill(`${SKILLS_DIR}x.md`, "---\nname: Facturas MX\ndescription: Cómo facturamos\n---\nPasos")).toEqual({ name: "facturas-mx", description: "Cómo facturamos", body: "Pasos" });
    expect(parseSkill(`${SKILLS_DIR}tablas.md`, "# Tablas del equipo\nUsa siempre paginación.")).toMatchObject({ name: "tablas", description: "Tablas del equipo" });
    expect(parseSkill(`${SKILLS_DIR}vacia.md`, "   ")).toBeNull();
  });

  it("adds the project's skills to the index and lets one replace a built-in of the same name", () => {
    const files = {
      [`${SKILLS_DIR}facturas.md`]: "---\ndescription: Cómo emitimos facturas\n---\nUsa el RFC del cliente.",
      [`${SKILLS_DIR}forms.md`]: "---\ndescription: Nuestros formularios\n---\nSiempre en dos columnas.",
      [`${SKILLS_DIR}notas.txt`]: "no es markdown",
      "static/otra/cosa.md": "fuera de la carpeta",
    };
    expect(projectSkills(files).map((s) => s.name)).toEqual(["facturas", "forms"]);
    const all = allSkills(files);
    expect(all.length).toBe(BUILTIN_SKILLS.length + 1);
    expect(findSkill(files, "forms")!.body).toBe("Siempre en dos columnas.");
    expect(findSkill(files, " FACTURAS ")!.description).toBe("Cómo emitimos facturas");
    expect(findSkill({}, "forms")!.body).toContain("react-hook-form");
    expect(findSkill({}, "nope")).toBeUndefined();
    const index = skillIndex(files);
    expect(index).toContain("- facturas: Cómo emitimos facturas");
    expect(index).toContain("- forms: Nuestros formularios");
    expect(index).toContain("load_skill");
  });

  it("ships the design skills, wired into the planner, the ui role and the reviewer", () => {
    for (const n of ["design-brief", "design-system", "frontend-design", "impeccable", "hallmark", "taste-skill", "web-design-guidelines", "ui-ux-pro-max"]) expect(findSkill({}, n), n).toBeDefined();
    expect(ROLE_PROMPTS.ui).toMatch(/design-brief/);
    expect(ROLE_PROMPTS.planner).toMatch(/design-brief/);
    expect(ROLE_PROMPTS.qa).toMatch(/web-design-guidelines/);
  });

  it("ships the open-source skills as published, with license, notice and parts", () => {
    const root = path.resolve("server/builder/skills");
    const notice = readFileSync(path.join(root, "NOTICE.md"), "utf8");
    for (const name of OPEN_SOURCE) {
      expect(existsSync(path.join(root, name, "LICENSE")) || existsSync(path.join(root, name, "LICENSE.txt")), `${name} license`).toBe(true);
      expect(notice, name).toContain("`" + name + "/`");
      expect(findSkill({}, name)!.origin, name).toBeDefined();
    }
    // The upstream files are there with their scripts and data, untouched.
    for (const f of ["impeccable/scripts/impeccable", "impeccable/reference/critique.md", "hallmark/scripts/sloplint.mjs", "taste-skill/scripts/inspect.mjs", "ui-ux-pro-max/scripts/search.py", "ui-ux-pro-max/data/styles.csv", "web-design-guidelines/command.md"]) {
      expect(existsSync(path.join(root, f)), f).toBe(true);
    }
    expect(readFileSync(path.join(root, "frontend-design/SKILL.md"), "utf8")).toMatch(/^---\nname: frontend-design\n/);
    expect(Object.keys(findSkill({}, "impeccable")!.parts!)).toEqual(expect.arrayContaining(["reference/craft-floor", "reference/critique", "reference/audit", "reference/polish"]));
    expect(Object.keys(findSkill({}, "hallmark")!.parts!)).toContain("references/gates");
    expect(Object.keys(findSkill({}, "taste-skill")!.parts!)).toEqual(expect.arrayContaining(["references/copy", "references/tells", "references/critique"]));
    expect(Object.keys(findSkill({}, "ui-ux-pro-max")!.parts!)).toContain("references/quick-reference");
    expect(Object.keys(findSkill({}, "web-design-guidelines")!.parts!)).toContain("command");
    expect(skillIndex()).toMatch(/- impeccable: .*\[\d+ parts\]/);
  });

  it("serves a copied skill with the Forja note, lists its parts and returns a part by path", () => {
    for (const name of OPEN_SOURCE) {
      const text = renderSkill(findSkill({}, name)!);
      expect(text, name).toContain("> Forja note: this skill is copied unmodified from");
      expect(text, name).toContain("no shell");
    }
    const listing = renderSkill(findSkill({}, "impeccable")!);
    expect(listing).toMatch(/- reference\/ .*critique/);
    const part = renderSkill(findSkill({}, "impeccable")!, "reference/critique");
    expect(part).toContain("# Skill: impeccable / reference/critique");
    expect(renderSkill(findSkill({}, "impeccable")!, " Reference/Critique.md ")).toBe(part);
    expect(() => renderSkill(findSkill({}, "impeccable")!, "nada")).toThrow(/Sus partes:[\s\S]*reference\//);
    expect(() => renderSkill(findSkill({}, "forms")!, "x")).toThrow(/No tiene partes/);
    // Our own skills are served without a note.
    expect(renderSkill(findSkill({}, "forms")!)).not.toContain("Forja note");
  });

  it("only offers palettes that pass the contrast the skill itself asks for, in light and dark", () => {
    const lum = (hex: string) => {
      const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
      return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
    };
    const ratio = (a: string, b: string) => {
      const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
      return (hi! + 0.05) / (lo! + 0.05);
    };
    const rows = findSkill({}, "design-system")!.body.split("\n").filter((l) => /^\s+(light|dark)\s/.test(l));
    expect(rows.length).toBe(8);
    for (const row of rows) {
      const t = Object.fromEntries([...row.matchAll(/--([a-z-]+):(#[0-9a-f]{6})/g)].map((m) => [m[1]!, m[2]!])) as Record<string, string>;
      expect(ratio(t.text!, t.bg!), row).toBeGreaterThanOrEqual(4.5);
      expect(ratio(t.text!, t.surface!), row).toBeGreaterThanOrEqual(4.5);
      expect(ratio(t.muted!, t.surface!), row).toBeGreaterThanOrEqual(4.5);
      expect(ratio(t["primary-text"]!, t.primary!), row).toBeGreaterThanOrEqual(4.5);
      expect(ratio(t.primary!, t.bg!), row).toBeGreaterThanOrEqual(3);
    }
  });

  it("moved Jobs and Sign-in out of the manual into skills", () => {
    expect(BUILDER_SYSTEM_PROMPT).not.toMatch(/^# Jobs/m);
    expect(BUILDER_SYSTEM_PROMPT).not.toMatch(/^# Sign-in/m);
    expect(findSkill({}, "jobs")!.body).toContain("export const schedule");
    expect(findSkill({}, "auth")!.body).toContain("setup_auth");
    expect(ROLE_PROMPTS.backend).not.toContain("export const schedule");
  });

  it("is in every role's tools and tells the planner to name skills in each goal", () => {
    for (const [role, tools] of Object.entries(ROLE_TOOLS)) expect(tools, role).toContain("load_skill");
    expect(builderTools.some((t) => t.name === "load_skill")).toBe(true);
    expect(ROLE_PROMPTS.planner).toMatch(/skills/);
    expect(ROLE_PROMPTS.backend).toMatch(/load_skill/);
  });

  // Needs the network the first time (installs the catalog packages, then cached).
  it.skipIf(!process.env.FORJA_NETWORK_TESTS)("has code samples that compile against the kit's real packages", async () => {
    const files: Record<string, string> = { "package.json": JSON.stringify({ dependencies: Object.fromEntries(Object.entries(KIT_CATALOG).map(([n, e]) => [n, e.version])) }) };
    const imports: string[] = [];
    for (const skill of BUILTIN_SKILLS.filter((s) => !OPEN_SOURCE.includes(s.name))) {
      const blocks = skill.body.split(/\n\s*\n/).filter((b) => b.split("\n").every((l) => l.startsWith("  ") || !l.trim()) && /import /.test(b));
      blocks.forEach((b, i) => {
        const code = b.split("\n").map((l) => l.slice(2)).join("\n") + "\n";
        const id = `${skill.name.replace(/-/g, "_")}_${i}`;
        if (code.includes("@forja/server")) files[`endpoints/${id}_POST.ts`] = code;
        else if (/<\w/.test(code)) {
          files[`components/${id}.tsx`] = code;
          imports.push(`import "../components/${id}";`);
        } else files[`helpers/${id}.ts`] = code;
      });
    }
    expect(Object.keys(files).length).toBeGreaterThan(8);
    files["pages/_index.tsx"] = `${imports.join("\n")}\nexport default () => <p />;\n`;
    await buildClient(files);
    expect((await typecheckProject(files)).map((p) => `${p.file}:${p.line} ${p.text}`)).toEqual([]);
  }, 600_000);
});
