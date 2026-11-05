import { describe, expect, it } from "vitest";
import { checkPlanDoc, PLAN_DOC, PLAN_SECTIONS } from "../../../../server/modules/builder/domain/Plan.js";
import { ROLE_PROMPTS } from "../../../../server/modules/builder/infrastructure/roles.js";

const doc = (names: readonly string[] = PLAN_SECTIONS) => names.map((name) => `## ${name}\nContenido de ${name}.`).join("\n\n");

describe("implementation plan document", () => {
  it("accepts the seven sections in order", () => {
    expect(checkPlanDoc(doc())).toEqual([]);
    expect(checkPlanDoc(PLAN_SECTIONS.map((n) => `# **${n}**\ntexto`).join("\n"))).toEqual([]);
  });
  it("rejects a missing, empty, misordered or oversized document", () => {
    expect(checkPlanDoc(undefined)[0]).toContain(PLAN_DOC);
    expect(checkPlanDoc(doc(PLAN_SECTIONS.filter((n) => n !== "Backend")))).toEqual([expect.stringContaining('"Backend"')]);
    expect(checkPlanDoc(doc().replace("Contenido de Interfaz.", ""))).toEqual([expect.stringContaining("vacía")]);
    expect(checkPlanDoc(doc([...PLAN_SECTIONS].reverse()))).toEqual([expect.stringContaining("orden")]);
    expect(checkPlanDoc(`${doc()}\n${"x".repeat(20_000)}`)).toEqual([expect.stringContaining("máximo")]);
  });
  it("tells the planner to write it and every other agent to follow it", () => {
    expect(ROLE_PROMPTS.planner).toContain(PLAN_DOC);
    for (const name of PLAN_SECTIONS) expect(ROLE_PROMPTS.planner).toContain(`## ${name}`);
    for (const role of ["data", "backend", "ui", "qa", "fast"] as const) expect(ROLE_PROMPTS[role]).toContain(PLAN_DOC);
  });
});
