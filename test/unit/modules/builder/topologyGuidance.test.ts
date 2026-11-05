import { describe, expect, it } from "vitest";
import { BUILDER_SYSTEM_PROMPT } from "../../../../server/modules/builder/infrastructure/prompt.js";
import { BUILTIN_SKILLS } from "../../../../server/modules/builder/infrastructure/skillLibrary.js";

describe("builder topology guidance", () => {
  it("distinguishes durable acceptance from completion and documents shared database isolation", () => {
    const jobs = BUILTIN_SKILLS.find((skill) => skill.name === "jobs")!.body;
    expect(BUILDER_SYSTEM_PROMPT).toContain("forja.services.json");
    expect(BUILDER_SYSTEM_PROMPT).toContain("ctx.jobs.enqueue");
    expect(BUILDER_SYSTEM_PROMPT).toContain("shared project database");
    expect(jobs).toContain("at-least-once");
    expect(jobs).toContain("up to 64 services");
    expect(jobs).toContain("waits for completion");
    expect(jobs).not.toContain("NOT retried");
  });
});
