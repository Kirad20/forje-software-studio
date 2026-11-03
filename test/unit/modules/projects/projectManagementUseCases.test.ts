import { describe, it, expect, vi, beforeEach } from "vitest";
import { RenameFileUseCase } from "../../../../server/modules/projects/application/RenameFileUseCase.js";
import { CreateProjectUseCase } from "../../../../server/modules/projects/application/CreateProjectUseCase.js";
import type { IProjectFileRepository } from "../../../../server/modules/projects/ports/repositories.js";
import { Project } from "../../../../server/modules/projects/domain/Project.js";

describe("Projects Management Use Cases (TDD)", () => {
  let fileRepo: IProjectFileRepository;

  beforeEach(() => {
    fileRepo = {
      readFile: vi.fn(),
      readAllFiles: vi.fn().mockResolvedValue({}),
      writeFile: vi.fn(),
      deleteFile: vi.fn(),
      renameFile: vi.fn(),
      logChange: vi.fn().mockResolvedValue(1),
      touch: vi.fn(),
    };
  });

  describe("RenameFileUseCase", () => {
    it("validates target path, renames file, logs change and touches paths", async () => {
      vi.spyOn(fileRepo, "readFile")
        .mockResolvedValueOnce("content of source")
        .mockResolvedValueOnce(undefined);

      const useCase = new RenameFileUseCase(fileRepo);
      await useCase.execute("p1", "pages/old.tsx", "pages/new.tsx", "owner");

      expect(fileRepo.renameFile).toHaveBeenCalledWith("p1", "pages/old.tsx", "pages/new.tsx");
      expect(fileRepo.logChange).toHaveBeenCalledWith("p1", {
        kind: "rename",
        paths: ["pages/old.tsx", "pages/new.tsx"],
        author: "owner",
        before: { "pages/old.tsx": "content of source", "pages/new.tsx": null },
      });
      expect(fileRepo.touch).toHaveBeenCalledWith("p1", ["pages/old.tsx", "pages/new.tsx"]);
    });

    it("rejects invalid target path before checking source existence", async () => {
      const useCase = new RenameFileUseCase(fileRepo);
      await expect(useCase.execute("p1", "pages/old.tsx", "invalid/target.txt", "owner")).rejects.toThrow("Ruta no válida");
      expect(fileRepo.readFile).not.toHaveBeenCalled();
    });

    it("throws error if source file does not exist", async () => {
      vi.spyOn(fileRepo, "readFile").mockResolvedValue(undefined);
      const useCase = new RenameFileUseCase(fileRepo);
      await expect(useCase.execute("p1", "pages/notfound.tsx", "pages/new.tsx", "owner")).rejects.toThrow("No existe pages/notfound.tsx");
      expect(fileRepo.renameFile).not.toHaveBeenCalled();
    });
  });

  describe("CreateProjectUseCase", () => {
    it("creates an aggregate through atomic persistence, then records a checkpoint", async () => {
      const snapshot = new Project({ id: "proj123", ownerId: "owner1", orgId: "org1", name: "My App", description: "An app description" });
      const store = { create: vi.fn(), getProject: vi.fn().mockResolvedValue(snapshot), logChange: fileRepo.logChange };
      const useCase = new CreateProjectUseCase(store, {
        projectId: vi.fn(), templates: vi.fn(), warmup: vi.fn().mockResolvedValue(undefined),
      });
      const result = await useCase.execute({
        id: "proj123",
        ownerId: "owner1",
        orgId: "org1",
        name: "My App",
        description: "An app description",
        files: { "pages/_index.tsx": "export default () => <h1>Hello</h1>;" },
      });

      expect(result).toBeInstanceOf(Project);
      expect(result.id).toBe("proj123");
      expect(result.name).toBe("My App");
      expect(store.create).toHaveBeenCalledWith(expect.any(Project), {
        "pages/_index.tsx": "export default () => <h1>Hello</h1>;",
      }, "org1");
      expect(fileRepo.logChange).toHaveBeenCalledWith("proj123", expect.objectContaining({
        kind: "checkpoint",
        label: "Proyecto creado",
        author: "system",
      }));
    });
  });
});
