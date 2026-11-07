import { describe, expect, it, vi } from "vitest";
import { ProjectPath } from "../../../../server/modules/projects/domain/ProjectPath.js";
import { CreateProjectUseCase } from "../../../../server/modules/projects/application/CreateProjectUseCase.js";
import { WriteFileUseCase } from "../../../../server/modules/projects/application/WriteFileUseCase.js";
import { RenameFileUseCase } from "../../../../server/modules/projects/application/RenameFileUseCase.js";
import type { IProjectFileRepository } from "../../../../server/modules/projects/ports/repositories.js";

describe("repository project editing", () => {
  it("defaults repository creation to private while retaining public native creation", async () => {
    const store = { create: vi.fn(), getProject: vi.fn().mockResolvedValue({ id: "p" }), logChange: vi.fn() };
    const services = { projectId: () => "p", templates: vi.fn().mockReturnValue({}), warmup: vi.fn() };
    const create = new CreateProjectUseCase(store, services);
    await create.execute({ ownerId: "owner", name: "Repository", runtime: "repository" });
    expect(store.create).toHaveBeenLastCalledWith(expect.objectContaining({ runtime: "repository", visibility: "private" }), {}, undefined);
    await create.execute({ ownerId: "owner", name: "Native" });
    expect(store.create).toHaveBeenLastCalledWith(expect.objectContaining({ runtime: "native", visibility: "public" }), {}, undefined);
  });
  it("uses original paths only in repository mode and rejects unsafe or generated paths", () => {
    for (const path of ["Dockerfile", "package-lock.json", "studio/src/App.tsx", ".github/workflows/ci.yml"]) {
      expect(ProjectPath.isValid(path, "repository")).toBe(true);
      expect(ProjectPath.isValid(path)).toBe(false);
    }
    for (const path of ["../x", "/x", "C:/x", "src\\x", "src/\0x", "src//x", ".git/config", ".env.example", "node_modules/x", "graphify-out/graph.json"]) {
      expect(ProjectPath.isValid(path, "repository")).toBe(false);
    }
  });
  it("persists repository mode without injecting a native starter or warming the native compiler", async () => {
    const store = { create: vi.fn(), getProject: vi.fn().mockResolvedValue({ id: "p", runtime: "repository" }), logChange: vi.fn() };
    const services = { projectId: () => "p", templates: vi.fn(), warmup: vi.fn() };
    await new CreateProjectUseCase(store, services).execute({ ownerId: "a", name: "Forja", runtime: "repository" });
    expect(store.create).toHaveBeenCalledWith(expect.objectContaining({ runtime: "repository" }), {}, undefined);
    expect(services.templates).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(services.warmup).not.toHaveBeenCalled();
  });
  it("checks runtime before editing, retains before images and checks both rename paths", async () => {
    const files: IProjectFileRepository = { readFile: vi.fn().mockResolvedValue("old"), readAllFiles: vi.fn().mockResolvedValue({}), writeFile: vi.fn(), deleteFile: vi.fn(), renameFile: vi.fn(), logChange: vi.fn(), touch: vi.fn() };
    const runtime = vi.fn().mockResolvedValue("repository");
    await new WriteFileUseCase(files, runtime).execute("p", "server/index.ts", "new");
    expect(runtime).toHaveBeenCalledWith("p");
    expect(files.logChange).toHaveBeenCalledWith("p", expect.objectContaining({ before: { "server/index.ts": "old" } }));
    await expect(new RenameFileUseCase(files, runtime).execute("p", "../outside", "src/safe.ts")).rejects.toThrow();
    expect(files.renameFile).not.toHaveBeenCalled();
    await expect(new WriteFileUseCase(files, runtime).execute("p", "src/index.ts", "x".repeat(4 * 1024 * 1024 + 1))).rejects.toThrow();
  });
  it("rejects aggregate repository growth before writing or logging changes", async () => {
    const content = "x".repeat(4 * 1024 * 1024);
    const current = Object.fromEntries(Array.from({ length: 16 }, (_, index) => [`src/file${index}.txt`, content]));
    const files: IProjectFileRepository = { readFile: vi.fn(), readAllFiles: vi.fn().mockResolvedValue(current), writeFile: vi.fn(), deleteFile: vi.fn(), renameFile: vi.fn(), logChange: vi.fn(), touch: vi.fn() };
    await expect(new WriteFileUseCase(files, async () => "repository").execute("p", "src/new.ts", "new")).rejects.toThrow(/grande|límite/);
    expect(files.writeFile).not.toHaveBeenCalled();
    expect(files.logChange).not.toHaveBeenCalled();
  });
});
