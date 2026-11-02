import { describe, it, expect } from "vitest";
import { ProjectPath } from "../../../../server/modules/projects/domain/ProjectPath.js";
import { Project } from "../../../../server/modules/projects/domain/Project.js";

describe("Projects Domain (DDD & TDD)", () => {
  describe("ProjectPath Value Object", () => {
    it("accepts valid project paths", () => {
      expect(new ProjectPath("pages/index.tsx").value).toBe("pages/index.tsx");
      expect(new ProjectPath("components/Button.tsx").value).toBe("components/Button.tsx");
      expect(new ProjectPath("endpoints/users_GET.ts").value).toBe("endpoints/users_GET.ts");
      expect(new ProjectPath("helpers/math.ts").value).toBe("helpers/math.ts");
      expect(new ProjectPath("jobs/cleanup.ts").value).toBe("jobs/cleanup.ts");
      expect(new ProjectPath("static/logo.png").value).toBe("static/logo.png");
      expect(new ProjectPath("base.css").value).toBe("base.css");
      expect(new ProjectPath("package.json").value).toBe("package.json");
    });

    it("rejects invalid project paths, directory traversal, or double slashes", () => {
      expect(() => new ProjectPath("../secret.txt")).toThrow("Ruta no válida");
      expect(() => new ProjectPath("pages//index.tsx")).toThrow("Ruta no válida");
      expect(() => new ProjectPath("random/file.txt")).toThrow("Ruta no válida");
    });

    it("identifies dev working notes", () => {
      const devPath = new ProjectPath("static/__dev/notes.txt");
      const normalPath = new ProjectPath("pages/index.tsx");

      expect(devPath.isDevFile()).toBe(true);
      expect(normalPath.isDevFile()).toBe(false);
    });
  });

  describe("Project Entity", () => {
    it("instantiates project aggregate with domain rules", () => {
      const project = new Project({
        id: "proj_123",
        ownerId: "acc_1",
        orgId: "org_1",
        name: "Mi App",
        description: "Una app genial",
        visibility: "private",
        files: {
          "pages/index.tsx": "export default () => <h1>Hola</h1>;",
        },
      });

      expect(project.id).toBe("proj_123");
      expect(project.name).toBe("Mi App");
      expect(project.isPrivate()).toBe(true);
      expect(project.isPublished()).toBe(false);
    });

    it("publishes project and tracks published version", () => {
      const project = new Project({
        id: "proj_123",
        ownerId: "acc_1",
        orgId: "org_1",
        name: "Mi App",
        description: "",
        visibility: "public",
        files: {},
      });

      project.publish("slug-app", "ver_1");
      expect(project.slug).toBe("slug-app");
      expect(project.publishedVersionId).toBe("ver_1");
      expect(project.isPublished()).toBe(true);

      project.unpublish();
      expect(project.isPublished()).toBe(false);
      expect(project.slug).toBeNull();
    });
  });
});
