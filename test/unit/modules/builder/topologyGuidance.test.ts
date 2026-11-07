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
});
