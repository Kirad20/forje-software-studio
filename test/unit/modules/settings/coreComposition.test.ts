import { describe, expect, it, vi } from "vitest";
import { createCoreModules } from "../../../../server/bootstrap/coreModules.js";
import { starterFiles, type ProjectServices } from "../../../../server/modules/projects/index.js";
import { config } from "../../../../server/shared/config.js";

describe("Core module bootstrap composition", () => {
  it("constructs all four module instances without starting them", () => {
    const projectServices: ProjectServices = {
      projectId: () => "project",
      id: () => "id",
      templates: starterFiles,
      warmup: vi.fn().mockResolvedValue(undefined),
      clone: vi.fn().mockResolvedValue(undefined),
      emit: vi.fn(),
    };
    const modules = createCoreModules({
      projectServices,
      sendPlatformEmail: vi.fn().mockResolvedValue(true),
      findSecret: () => null,
    });

    expect(Object.keys(modules).sort()).toEqual(["collaboration", "identity", "projects", "settings"]);
    for (const module of Object.values(modules)) {
      expect(module.start).toEqual(expect.any(Function));
      expect(module.stop).toEqual(expect.any(Function));
    }
    expect(modules.identity.getAccountSecurity).toEqual(expect.any(Function));
    expect(modules.identity.listAccounts).toEqual(expect.any(Function));
    expect(modules.projects.getProject).toEqual(expect.any(Function));
    expect(modules.settings.onSettingsChanged).toEqual(expect.any(Function));
    expect(starterFiles("Demo")["pages/_index.tsx"]).toContain("<h1>Demo</h1>");
  });

  it("uses the current platform signup and free-credit settings", () => {
    const modules = createCoreModules({
      projectServices: {
        projectId: () => "project",
        id: () => "id",
        templates: starterFiles,
        warmup: vi.fn().mockResolvedValue(undefined),
        clone: vi.fn().mockResolvedValue(undefined),
        emit: vi.fn(),
      },
      sendPlatformEmail: vi.fn().mockResolvedValue(true),
      findSecret: () => null,
    });
    const originalSignup = config.signup;
    const originalFreeCredits = config.freeCredits;
    const policy = (modules.identity.service as unknown as {
      deps: { policy: { signup: string; freeCredits: number } };
    }).deps.policy;

    try {
      config.signup = "closed";
      config.freeCredits = 17;
      expect(policy.signup).toBe("closed");
      expect(policy.freeCredits).toBe(17);
    } finally {
      config.signup = originalSignup;
      config.freeCredits = originalFreeCredits;
    }
  });
});
