import { describe, it, expect, vi, beforeEach } from "vitest";
import { WriteFileUseCase } from "../../../../server/modules/projects/application/WriteFileUseCase.js";
import { DeleteFileUseCase } from "../../../../server/modules/projects/application/DeleteFileUseCase.js";
import { RenameFileUseCase } from "../../../../server/modules/projects/application/RenameFileUseCase.js";
import { contentEtag } from "../../../../contracts/fileEtag.js";
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
      writeFileIf: vi.fn().mockResolvedValue(true),
      deleteFileIf: vi.fn().mockResolvedValue(true),
      renameFileIf: vi.fn().mockResolvedValue(true),
      logChange: vi.fn().mockResolvedValue(1),
      touch: vi.fn(),
    };
  });

  describe("per-file concurrency (expected sha)", () => {
    const old = "export const a = 1;";
    const seen = contentEtag(old);

    it("writes through compare-and-set when the caller still sees the current content", async () => {
      vi.spyOn(fileRepo, "readFile").mockResolvedValue(old);
      await new WriteFileUseCase(fileRepo).execute("p1", "helpers/a.ts", "export const a = 2;", "mcp", undefined, seen);
      expect(fileRepo.writeFileIf).toHaveBeenCalledWith("p1", "helpers/a.ts", "export const a = 2;", seen);
      expect(fileRepo.writeFile).not.toHaveBeenCalled();
      expect(fileRepo.logChange).toHaveBeenCalledWith("p1", expect.objectContaining({ kind: "edit", before: { "helpers/a.ts": old } }));
    });

    it("refuses a stale sha without writing or logging, and reports the current one", async () => {
      vi.spyOn(fileRepo, "readFile").mockResolvedValue("someone else changed it");
      await expect(new WriteFileUseCase(fileRepo).execute("p1", "helpers/a.ts", "x", "mcp", undefined, seen)).rejects.toMatchObject({ code: "FILE_CONFLICT" });
      expect(fileRepo.writeFileIf).not.toHaveBeenCalled();
      expect(fileRepo.logChange).not.toHaveBeenCalled();
    });

    it("refuses when the file changes between the check and the atomic write", async () => {
      vi.spyOn(fileRepo, "readFile").mockResolvedValue(old);
      vi.spyOn(fileRepo, "writeFileIf").mockResolvedValue(false);
      await expect(new WriteFileUseCase(fileRepo).execute("p1", "helpers/a.ts", "x", "mcp", undefined, seen)).rejects.toThrow("FILE_CONFLICT");
      expect(fileRepo.logChange).not.toHaveBeenCalled();
    });

    it("creates only if absent when expected is null", async () => {
      vi.spyOn(fileRepo, "readFile").mockResolvedValue(undefined);
      await new WriteFileUseCase(fileRepo).execute("p1", "helpers/new.ts", "export {}", "mcp", undefined, null);
      expect(fileRepo.writeFileIf).toHaveBeenCalledWith("p1", "helpers/new.ts", "export {}", null);
      vi.spyOn(fileRepo, "readFile").mockResolvedValue("already there");
      await expect(new WriteFileUseCase(fileRepo).execute("p1", "helpers/new.ts", "export {}", "mcp", undefined, null)).rejects.toThrow("FILE_CONFLICT");
    });

    it("deletes and renames only against the sha the caller saw", async () => {
      vi.spyOn(fileRepo, "readFile").mockResolvedValue(old);
      await new DeleteFileUseCase(fileRepo).execute("p1", "helpers/a.ts", "mcp", seen);
      expect(fileRepo.deleteFileIf).toHaveBeenCalledWith("p1", "helpers/a.ts", seen);
      await expect(new DeleteFileUseCase(fileRepo).execute("p1", "helpers/a.ts", "mcp", "0".repeat(64))).rejects.toThrow("FILE_CONFLICT");

      vi.spyOn(fileRepo, "readFile").mockImplementation(async (_p, path) => (path === "helpers/a.ts" ? old : undefined));
      await new RenameFileUseCase(fileRepo).execute("p1", "helpers/a.ts", "helpers/b.ts", "mcp", seen);
      expect(fileRepo.renameFileIf).toHaveBeenCalledWith("p1", "helpers/a.ts", "helpers/b.ts", seen);
      await expect(new RenameFileUseCase(fileRepo).execute("p1", "helpers/a.ts", "helpers/b.ts", "mcp", "0".repeat(64))).rejects.toThrow("FILE_CONFLICT");
    });

    it("keeps last-writer-wins when no sha is given", async () => {
      vi.spyOn(fileRepo, "readFile").mockResolvedValue(old);
      await new WriteFileUseCase(fileRepo).execute("p1", "helpers/a.ts", "export const a = 3;", "owner");
      expect(fileRepo.writeFile).toHaveBeenCalled();
      expect(fileRepo.writeFileIf).not.toHaveBeenCalled();
    });
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

    it("writes free folders inside forja.json component roots and refuses an invalid manifest", async () => {
      const manifest = JSON.stringify({ version: 1, components: { admin: { kind: "web", root: "apps/admin" } } });
      vi.spyOn(fileRepo, "readFile").mockImplementation(async (_p, path) => (path === "forja.json" ? manifest : undefined));
      const useCase = new WriteFileUseCase(fileRepo);
      await useCase.execute("p1", "apps/admin/features/users/UsersTable.tsx", "export {}", "builder");
      expect(fileRepo.writeFile).toHaveBeenCalledWith("p1", "apps/admin/features/users/UsersTable.tsx", "export {}");
      await expect(useCase.execute("p1", "apps/site/x.tsx", "x", "builder")).rejects.toThrow("Ruta no válida");
      await expect(useCase.execute("p1", "forja.json", "{\"version\":1}", "builder")).rejects.toThrow("forja.json");
      const next = JSON.stringify({ version: 1, components: { admin: { kind: "web", root: "apps/admin", mount: "/panel" } } });
      await useCase.execute("p1", "forja.json", next, "builder");
      expect(fileRepo.writeFile).toHaveBeenCalledWith("p1", "forja.json", next);
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
