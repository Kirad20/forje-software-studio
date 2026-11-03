import { describe, expect, it } from "vitest";
import { BUILDER_SYSTEM_PROMPT } from "../../server/builder/prompt.js";
import { ROLE_PROMPTS, ROLE_TOOLS } from "../../server/builder/roles.js";
import { BUILTIN_SKILLS } from "../../server/builder/skillLibrary.js";
import { SKILLS_DIR, allSkills, findSkill, parseSkill, projectSkills, skillIndex } from "../../server/builder/skills.js";
import { builderTools } from "../../server/builder/tools.js";
import { buildClient } from "../../server/runtime/bundler.js";
import { KIT_CATALOG } from "../../server/runtime/catalog.js";
import { typecheckProject } from "../../server/runtime/typecheck.js";

describe("skills", () => {
  it("ships skills with a name, a one-line description and a body, with no duplicates", () => {
    expect(BUILTIN_SKILLS.length).toBeGreaterThanOrEqual(8);
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
    for (const skill of BUILTIN_SKILLS) {
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
