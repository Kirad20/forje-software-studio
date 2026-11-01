import { describe, expect, it } from "vitest";
import { BUILDER_SYSTEM_PROMPT } from "../../server/builder/prompt.js";
import { builderTools } from "../../server/builder/tools.js";
import { GUIDES, SECTION_IDS, guideList, readGuides } from "../../server/mcp/guides.js";
import { SERVER_INSTRUCTIONS, TOOL_HINTS } from "../../server/mcp/server.js";

describe("MCP guides", () => {
  it("gives every heading of the builder manual a stable id", () => {
    const headings = [...BUILDER_SYSTEM_PROMPT.matchAll(/^# (.+)$/gm)].map((m) => m[1]!.trim());
    expect(headings.length).toBeGreaterThan(5);
    for (const h of headings) expect(SECTION_IDS[h], `falta un id para "# ${h}" en SECTION_IDS`).toBeDefined();
  });

  it("covers the whole manual without losing text", () => {
    const sections = GUIDES.filter((g) => g.id !== "forja-overview");
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
  it("annotates every tool the server exposes", () => {
    for (const name of [...builderTools.map((t) => t.name), "list_projects", "create_project", "get_guides"]) {
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
  });
});
