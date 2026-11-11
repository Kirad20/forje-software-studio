import { describe, expect, it } from "vitest";
import { BUILDER_SYSTEM_PROMPT } from "../../../../server/modules/builder/infrastructure/prompt.js";
import { BUILTIN_SKILLS } from "../../../../server/modules/builder/infrastructure/skillLibrary.js";
import { ROLE_PROMPTS } from "../../../../server/modules/builder/infrastructure/roles.js";

describe("builder topology guidance", () => {
  it("distinguishes durable acceptance from completion and documents shared database isolation", () => {
    const jobs = BUILTIN_SKILLS.find((skill) => skill.name === "jobs")!.body;
    expect(BUILDER_SYSTEM_PROMPT).toContain("forja.services.json");
    expect(BUILDER_SYSTEM_PROMPT).toContain("ctx.jobs.enqueue");
    expect(BUILDER_SYSTEM_PROMPT).toContain("shared project database");
    expect(jobs).toContain("at-least-once");
    expect(jobs).toContain("up to 64 services");
    expect(jobs).toContain("resolves before completion");
    expect(jobs).not.toContain("NOT retried");
  });

  it("loads DDD and hexagonal guidance for microservice work without promising unsupported infrastructure", () => {
    const skill = BUILTIN_SKILLS.find((entry) => entry.name === "microservices-ddd");
    expect(skill).toBeDefined();
    expect(BUILDER_SYSTEM_PROMPT).toContain('"microservices-ddd"');
    expect(skill!.body).toContain("bounded contexts");
    expect(skill!.body).toContain("domain pure");
    expect(skill!.body).toContain("all services share one project database");
    expect(skill!.body).toContain("no native gRPC listener");
    expect(skill!.body).toContain("at least once");
  });

  it("defaults apps to a feature-based frontend, hexagonal DDD contexts and the project's own components", () => {
    expect(BUILDER_SYSTEM_PROMPT).toContain("components/<feature>/<Name>.tsx");
    expect(BUILDER_SYSTEM_PROMPT).toContain("components/ui/<Name>.tsx");
    expect(BUILDER_SYSTEM_PROMPT).toMatch(/hexagonal with DDD: each feature is a bounded context in helpers\/<context>\//);
    for (const file of ["domain.ts", "ports.ts", "application.ts", "adapters.ts"]) expect(BUILDER_SYSTEM_PROMPT).toContain(`// helpers/todos/${file}`);
    expect(BUILDER_SYSTEM_PROMPT).toContain("never ship the kit's stock appearance");
    expect(BUILDER_SYSTEM_PROMPT).not.toContain("do not reinvent them");
    expect(ROLE_PROMPTS.backend).toContain("helpers/<context>/");
    expect(ROLE_PROMPTS.ui).toContain("components/<feature>/");
    expect(ROLE_PROMPTS.planner).toContain("bounded contexts (helpers/<context>/) belong to the backend task");
  });

  it("asks for striking motion that stays optimized, over the copied skills' restraint", () => {
    const anim = BUILTIN_SKILLS.find((s) => s.name === "animations")!.body;
    expect(BUILDER_SYSTEM_PROMPT).toContain("make it striking and polished");
    expect(BUILDER_SYSTEM_PROMPT).toContain("takes precedence over the advice in the copied design skills");
    expect(BUILDER_SYSTEM_PROMPT).not.toContain("keep it under 300 ms");
    for (const rule of ["transform and opacity", "LazyMotion", 'reducedMotion="user"', "whileInView", "layoutId"]) expect(anim).toContain(rule);
  });

  it("requires every table and list to be paginated", () => {
    expect(BUILDER_SYSTEM_PROMPT).toContain("Every list is paginated, always");
    expect(BUILDER_SYSTEM_PROMPT).toContain("Every table and long list is paginated");
    expect(BUILDER_SYSTEM_PROMPT).toContain("nextCursor: z.string().nullable()");
    expect(BUILTIN_SKILLS.find((s) => s.name === "data-tables")!.body).toContain("manualPagination: true");
  });
});
