import { describe, expect, it } from "vitest";
import { BUILDER_SYSTEM_PROMPT } from "../../server/modules/builder/prompt.js";
import { builderTools } from "../../server/modules/builder/index.js";
import { GUIDES, SECTION_IDS, guideList, readGuides } from "../../server/bootstrap/mcp/guides.js";
import { projectInTokenScope, SERVER_INSTRUCTIONS, TOOL_HINTS } from "../../server/bootstrap/mcp/server.js";

describe("MCP guides", () => {
  it("gives every heading of the builder manual a stable id", () => {
    const headings = [...BUILDER_SYSTEM_PROMPT.matchAll(/^# (.+)$/gm)].map((m) => m[1]!.trim());
    expect(headings.length).toBeGreaterThan(5);
    for (const h of headings) expect(SECTION_IDS[h], `falta un id para "# ${h}" en SECTION_IDS`).toBeDefined();
  });

  it("covers the whole manual without losing text", () => {
    const sections = GUIDES.filter((g) => g.id !== "forja-overview" && !g.title.startsWith("Skill: "));
    for (const g of sections) expect(BUILDER_SYSTEM_PROMPT).toContain(g.body.split("\n").slice(1).join("\n").trim().slice(0, 200));
    expect(new Set(GUIDES.map((g) => g.id)).size).toBe(GUIDES.length);
  });

  it("starts with an overview that holds the allowed paths and the workflow", () => {
    const overview = GUIDES[0]!;
    expect(overview.id).toBe("forja-overview");
    expect(overview.body).toContain("# Project structure");
    expect(overview.body).toContain("# How to work");
    expect(overview.body).not.toContain("# Design");
  });

  it("lists guides and reports unknown ids with the list", () => {
    expect(guideList()).toContain("- design:");
    const r = readGuides(["design", "nope"]);
    expect(r.unknown).toEqual(["nope"]);
    expect(r.text).toContain("# Design");
    expect(r.text).toContain("Guía desconocida: nope");
  });
});

describe("MCP tool hints", () => {
  it("enforces project and organization token scopes", () => {
    const project = { id: "p1", orgId: "org1" };
    expect(projectInTokenScope({ tokenProjectId: "p1", tokenOrgId: null }, project)).toBe(true);
    expect(projectInTokenScope({ tokenProjectId: "p1", tokenOrgId: null }, { ...project, id: "p2" })).toBe(false);
    expect(projectInTokenScope({ tokenProjectId: null, tokenOrgId: "org1" }, project)).toBe(true);
    expect(projectInTokenScope({ tokenProjectId: null, tokenOrgId: "org1" }, { ...project, orgId: "org2" })).toBe(false);
  });

  it("annotates every tool the server exposes", () => {
    for (const name of [...builderTools.map((t) => t.name), "list_projects", "create_project", "get_guides", "get_job_status"]) {
      expect(TOOL_HINTS[name], `falta TOOL_HINTS.${name}`).toBeDefined();
    }
  });

  it("marks writes to real data as destructive and reads as read-only", () => {
    expect(TOOL_HINTS.execute_sql!.destructiveHint).toBe(true);
    expect(TOOL_HINTS.delete_file!.destructiveHint).toBe(true);
    expect(TOOL_HINTS.query_database!.readOnlyHint).toBe(true);
    expect(TOOL_HINTS.read_files!.readOnlyHint).toBe(true);
  });

  it("teaches the allowed paths and the guides in the server instructions", () => {
    expect(SERVER_INSTRUCTIONS).toContain("pages/_index.tsx");
    expect(SERVER_INSTRUCTIONS).toContain('get_guides("forja-overview")');
    expect(SERVER_INSTRUCTIONS).toContain("<project-context>");
    expect(SERVER_INSTRUCTIONS).toContain("Los tokens limitados a un proyecto solo ven ese proyecto y no pueden crear otros");
    expect(TOOL_HINTS.question!.readOnlyHint).toBe(true);
  });

  it("sets metadata before building only for new projects and avoids inventing details", () => {
    expect(SERVER_INSTRUCTIONS).toContain("antes de construir o escribir archivos llama create_project");
    expect(SERVER_INSTRUCTIONS).toContain("basados solo en lo que el dueño ya dijo");
    expect(SERVER_INSTRUCTIONS).toContain("un perfil estructurado con propósito, audiencia, tipo de app");
    expect(builderTools.some((tool) => tool.name === "set_project_profile")).toBe(true);
    expect(SERVER_INSTRUCTIONS).toContain("haz una sola pregunta breve");
    expect(SERVER_INSTRUCTIONS).toContain("sin cambiar sus metadatos");
  });
});
