import { describe, expect, it, vi } from "vitest";
import { configureRepositoryRuntime, configureRuntimeProjects, publishProject, serveApp, unpublishProject } from "../../server/modules/app-runtime/index.js";
import type { RepositoryRuntime } from "../../server/modules/repository-runtime/index.js";

describe("repository mode dispatch preserves native boundary (TDD)", () => {
  it("serves repository HTTP without invoking the native bundler", async () => {
    const runtime = { serve: vi.fn(async () => new Response("child")) } as unknown as RepositoryRuntime;
    const release = configureRepositoryRuntime(runtime);
    try {
      const response = await serveApp(new Request("https://child.example/"), { project: { id: "repo", runtime: "repository" } as never, env: "preview", base: "" }, "/");
      expect(await response.text()).toBe("child");
      expect(runtime.serve).toHaveBeenCalledWith(expect.any(Request), "repo", "preview");
    } finally { release(); }
  });
  it("publishes only a healthy known repository image and stops published deployment on unpublish", async () => {
    const runtime = { publish: vi.fn(async () => ({})), stop: vi.fn(async () => ({})) } as unknown as RepositoryRuntime;
    const releaseRuntime = configureRepositoryRuntime(runtime);
    const unpublish = vi.fn(async () => {});
    const releaseProjects = configureRuntimeProjects({
      getProject: async () => ({ id: "repo", name: "Repository", runtime: "repository" }),
      isSlugTaken: async () => false, readAllFiles: async () => { throw new Error("Must not read mutable files"); },
      recordPublish: vi.fn(), unpublish, publishedFiles: async () => null, isDevFile: () => false,
    });
    try {
      expect(await publishProject("repo", "my-repo")).toEqual({ slug: "my-repo", url: expect.any(String) });
      expect(runtime.publish).toHaveBeenCalledWith("repo", { slug: "my-repo" }, "owner");
      await unpublishProject("repo");
      expect(runtime.stop).toHaveBeenCalledWith("repo", "published");
      expect(unpublish).toHaveBeenCalledWith("repo");
    } finally { releaseRuntime(); releaseProjects(); }
  });
});
