import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  projects: { getProject: vi.fn(async () => ({ runtime: "repository", ownerId: "owner" })), readAllFiles: vi.fn(async () => ({ "Dockerfile": "FROM node:22" })), writeFile: vi.fn(), listFiles: vi.fn(async () => [{ path: "Dockerfile", size: 12 }]) },
  runtime: { build: vi.fn(), get: vi.fn() },
  verifyBuild: vi.fn(async () => ({ ok: true, problems: [] })),
  publishProject: vi.fn(async () => ({ url: "https://published.example.test" })),
}));
vi.mock("../../../../server/modules/builder/infrastructure/CoreModulesAdapter.js", () => ({
  builderCoreModules: () => ({ projects: mocks.projects, repositoryRuntime: mocks.runtime }),
  readAllFiles: mocks.projects.readAllFiles,
}));
vi.mock("../../../../server/modules/app-runtime/index.js", async (original) => ({
  ...await original<typeof import("../../../../server/modules/app-runtime/index.js")>(),
  verifyBuild: mocks.verifyBuild,
  publishProject: mocks.publishProject,
}));
import { builderTools } from "../../../../server/modules/builder/infrastructure/BuilderToolsAdapter.js";
import { systemPromptForRuntime } from "../../../../server/modules/builder/infrastructure/prompt.js";
import { createFinishGate } from "../../../../server/modules/builder/infrastructure/FinishGateAdapter.js";
const context = { projectId: "p", account: {} as never, author: "mcp" as const };
const tool = (name: string) => builderTools.find((tool) => tool.name === name)!;
describe("repository builder tools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.runtime.build.mockResolvedValue({ status: "ready", error: null, preview: { status: "ready" } });
  });
  it("requires repository publication ownership even when tools are called outside MCP routing", async () => {
    await expect(tool("publish_app").run({}, { ...context, account: { id: "editor" } as never })).rejects.toThrow(/dueño|owner/);
    expect(mocks.publishProject).not.toHaveBeenCalled();
    expect(await tool("publish_app").run({}, { ...context, account: { id: "owner" } as never })).toContain("https://published.example.test");
    expect(mocks.publishProject).toHaveBeenCalledOnce();
  });
  it("dispatches check_build to the isolated runtime rather than falsely succeeding with no native pages", async () => {
    expect(await tool("check_build").run({}, context)).toBe("Compila sin errores.");
    expect(mocks.runtime.build).toHaveBeenCalledWith("p");
    expect(mocks.verifyBuild).not.toHaveBeenCalled();
    mocks.runtime.build.mockRejectedValueOnce(new Error("Docker unavailable"));
    await expect(tool("check_build").run({}, context)).rejects.toThrow("Docker unavailable");
  });
  it("blocks native SQL/auth/dependency/tests tools in both MCP structured and builder text paths", async () => {
    for (const name of ["execute_sql", "setup_auth", "add_dependency", "run_tests"]) {
      await expect(tool(name).run({}, context)).rejects.toThrow(/repository/i);
      if (tool(name).call) await expect(tool(name).call!({}, context)).rejects.toThrow(/repository/i);
    }
  });
  it("edits original migration paths in repository mode without the native SQL generator", async () => {
    await tool("write_file").run({ path: "migrations/014_mode.sql", content: "select 1;" }, context);
    expect(mocks.projects.writeFile).toHaveBeenCalledWith("p", "migrations/014_mode.sql", "select 1;", "mcp", undefined);
  });
  it("replaces native SDK guidance with original repository conventions, retaining question-first context", () => {
    const prompt = systemPromptForRuntime("native prompt using @forja/client", "repository");
    expect(prompt).toContain("question");
    expect(prompt).toContain("Dockerfile");
    expect(prompt).toContain("package-lock.json");
    expect(prompt).not.toContain("native prompt using @forja/client");
    expect(systemPromptForRuntime("native prompt", "native")).toBe("native prompt");
  });
  it("finish gates verify repository builds and never invoke the native compiler", async () => {
    const ctx = { wrote: true };
    const gate = await createFinishGate("p", ctx);
    expect(await gate.check()).toBeNull();
    expect(mocks.runtime.build).toHaveBeenCalledWith("p");
    expect(mocks.verifyBuild).not.toHaveBeenCalled();
    mocks.runtime.build.mockResolvedValueOnce({ status: "failed", error: "Original build failed", preview: null });
    expect(await gate.check()).toContain("Original build failed");
  });
});
