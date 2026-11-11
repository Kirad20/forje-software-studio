import { describe, it, expect, vi, beforeEach } from "vitest";
import { WriteFileUseCase } from "../../../../server/modules/projects/application/WriteFileUseCase.js";
import { DeleteFileUseCase } from "../../../../server/modules/projects/application/DeleteFileUseCase.js";
import type { IProjectFileRepository } from "../../../../server/modules/projects/ports/repositories.js";

describe("Projects File Use Cases (TDD)", () => {
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

  describe("WriteFileUseCase", () => {
    it("validates path, writes file and logs change when content changes", async () => {
      vi.spyOn(fileRepo, "readFile").mockResolvedValue(undefined);
      const useCase = new WriteFileUseCase(fileRepo);

      await useCase.execute("p1", "pages/home.tsx", "export default () => <div>Home</div>;", "owner");

      expect(fileRepo.writeFile).toHaveBeenCalledWith("p1", "pages/home.tsx", "export default () => <div>Home</div>;");
      expect(fileRepo.logChange).toHaveBeenCalledWith("p1", {
        kind: "create",
        paths: ["pages/home.tsx"],
        author: "owner",
        actor: undefined,
        before: { "pages/home.tsx": null },
      });
      expect(fileRepo.touch).toHaveBeenCalledWith("p1", ["pages/home.tsx"]);
    });

    it("rejects invalid path before touching repository", async () => {
      const useCase = new WriteFileUseCase(fileRepo);

      await expect(useCase.execute("p1", "invalid/path.txt", "content", "owner")).rejects.toThrow("Ruta no válida");
      expect(fileRepo.writeFile).not.toHaveBeenCalled();
    });

    it("persists Spring backend files written through MCP with their change history", async () => {
      const useCase = new WriteFileUseCase(fileRepo);
      const files = {
        "pom.xml": "<project><artifactId>spring-boot-starter-parent</artifactId></project>",
        "src/main/java/app/orders/domain/Order.java": "package app.orders.domain; public record Order(long id) {}",
        "src/main/resources/application.properties": "spring.application.name=orders",
      };

      for (const [path, content] of Object.entries(files)) {
        await useCase.execute("p1", path, content, "mcp");
        expect(fileRepo.writeFile).toHaveBeenCalledWith("p1", path, content);
        expect(fileRepo.logChange).toHaveBeenCalledWith("p1", {
          kind: "create", paths: [path], author: "mcp", actor: undefined, before: { [path]: null },
        });
        expect(fileRepo.touch).toHaveBeenCalledWith("p1", [path]);
      }
    });

    it("does nothing when content is identical to before", async () => {
      vi.spyOn(fileRepo, "readFile").mockResolvedValue("same content");
      const useCase = new WriteFileUseCase(fileRepo);

      await useCase.execute("p1", "pages/home.tsx", "same content", "owner");
      expect(fileRepo.writeFile).not.toHaveBeenCalled();
      expect(fileRepo.logChange).not.toHaveBeenCalled();
    });
  });

  describe("DeleteFileUseCase", () => {
    it("deletes file and logs change if file exists", async () => {
      vi.spyOn(fileRepo, "readFile").mockResolvedValue("old code");
      const useCase = new DeleteFileUseCase(fileRepo);

      await useCase.execute("p1", "pages/home.tsx", "owner");

      expect(fileRepo.deleteFile).toHaveBeenCalledWith("p1", "pages/home.tsx");
      expect(fileRepo.logChange).toHaveBeenCalledWith("p1", {
        kind: "delete",
        paths: ["pages/home.tsx"],
        author: "owner",
        before: { "pages/home.tsx": "old code" },
      });
      expect(fileRepo.touch).toHaveBeenCalledWith("p1", ["pages/home.tsx"]);
    });

    it("does nothing if file does not exist", async () => {
      vi.spyOn(fileRepo, "readFile").mockResolvedValue(undefined);
      const useCase = new DeleteFileUseCase(fileRepo);

      await useCase.execute("p1", "pages/home.tsx", "owner");
      expect(fileRepo.deleteFile).not.toHaveBeenCalled();
    });
  });
});
