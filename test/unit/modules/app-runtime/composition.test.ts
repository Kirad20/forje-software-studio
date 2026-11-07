import { describe, expect, it, vi } from "vitest";
import {
  bindRuntimeObservation, configureRuntimeProjects, publishProject, serveApp, stopAppRuntime,
  type AppTarget,
} from "../../../../server/modules/app-runtime/index.js";
import { getProject } from "../../../../server/modules/app-runtime/infrastructure/projects.js";
import { scan as boundScan } from "../../../../server/modules/app-runtime/infrastructure/observation.js";

function projectPorts() {
  return {
    getProject: async () => ({ id: "p", name: "My app", slug: null }),
    isSlugTaken: async () => false, readAllFiles: async () => ({}),
    recordPublish: async () => {}, unpublish: async () => {},
    publishedFiles: async () => ({}), isDevFile: () => false,
  };
}
function observerPorts() {
  return { scan: vi.fn(async () => []), log: () => {}, watchProblems: () => {}, projectEvents: { on: () => {}, off: () => {} } };
}

describe("production runtime composition", () => {
  it("releases bindings after failed startup without erasing a replacement binding", async () => {
    const ports = projectPorts();
    const observer = observerPorts();
    const releaseOldProjects = configureRuntimeProjects(ports);
    const releaseOldObserver = bindRuntimeObservation(observer);
    const releaseProjects = configureRuntimeProjects(ports);
    const releaseObserver = bindRuntimeObservation(observer);
    releaseOldProjects();
    releaseOldObserver();
    await expect(getProject("p")).resolves.toEqual({ id: "p", name: "My app", slug: null });
    await expect(boundScan("p", {})).resolves.toEqual([]);
    try {
      throw new Error("Startup failed");
    } catch {
      await stopAppRuntime();
      releaseObserver();
      releaseProjects();
    }
    expect(() => getProject("p")).toThrow("project ports have not been bound");
    expect(() => boundScan("p", {})).toThrow("observation ports have not been bound");
    releaseObserver();
    releaseProjects();
  });

  it("retains the full project read model and handles absent projects without a cast", async () => {
    const project = { id: "p", name: "My app", slug: "live", visibility: "private", publishedVersionId: "v1", shareEpoch: 8 };
    const release = configureRuntimeProjects({ ...projectPorts(), getProject: async () => project });
    expect(await getProject("p")).toBe(project);
    release();
    const releaseMissing = configureRuntimeProjects({ ...projectPorts(), getProject: async () => undefined });
    await expect(publishProject("missing")).rejects.toThrow("Proyecto no encontrado");
    releaseMissing();
  });

  it("uses the actual compile gate and leaves the live publication unchanged", async () => {
    let live = { "pages/_index.tsx": "live snapshot" };
    const recordPublish = vi.fn(async (_id: string, _slug: string, files: typeof live) => { live = files; });
    const scan = vi.fn(async () => []);
    const releaseProjects = configureRuntimeProjects({
      getProject: async () => ({ id: "p", name: "My app" }),
      isSlugTaken: async () => false,
      readAllFiles: async () => ({ "pages/_index.tsx": "export default () => <h1>broken" }),
      recordPublish, unpublish: async () => {},
      publishedFiles: async () => live, isDevFile: () => false,
    });
    const releaseObserver = bindRuntimeObservation({ scan, log: () => {}, watchProblems: () => {}, projectEvents: { on: () => {}, off: () => {} } });
    await expect(publishProject("p", "new-app")).rejects.toThrow("No se publicó: la app tiene errores");
    expect(live).toEqual({ "pages/_index.tsx": "live snapshot" });
    expect(recordPublish).not.toHaveBeenCalled();
    expect(scan).not.toHaveBeenCalled();
    await stopAppRuntime();
    releaseObserver();
    releaseProjects();
  });

  it("stops request-created SSE listeners and closes their streams idempotently", async () => {
    const on = vi.fn();
    const off = vi.fn();
    const releaseProjects = configureRuntimeProjects({
      getProject: async () => ({ id: "p", name: "My app" }), isSlugTaken: async () => false,
      readAllFiles: async () => ({}), recordPublish: async () => {}, unpublish: async () => {},
      publishedFiles: async () => ({}), isDevFile: () => false,
    });
    const releaseObserver = bindRuntimeObservation({ scan: async () => [], log: () => {}, watchProblems: () => {}, projectEvents: { on, off } });
    const target: AppTarget = {
      env: "preview", base: "",
      project: {
        id: "p", ownerId: "owner", orgId: null, name: "My app", runtime: "native", description: "", slug: null,
        visibility: "private", aiEnabled: false, emailDomain: null, emailDomainVerified: false,
        publishedVersionId: null, publishedAt: null, favorite: false, archived: false, folderId: null,
        lastOpenedAt: "", systemPrompt: "", designPrompt: "", seo: {}, profile: null, shareEpoch: 1, createdAt: "", updatedAt: "",
      },
    };
    const response = await serveApp(new Request("http://pv-p.localhost/_forja/live"), target, "/_forja/live");
    expect(response.status).toBe(200);
    expect(on).toHaveBeenCalledOnce();
    const reader = response.body!.getReader();
    await stopAppRuntime();
    await expect(reader.read()).resolves.toEqual({ done: true, value: undefined });
    expect(off).toHaveBeenCalledWith("p", on.mock.calls[0]![1]);
    await stopAppRuntime();
    expect(off).toHaveBeenCalledOnce();
    reader.releaseLock();
    releaseObserver();
    releaseProjects();
    expect(() => getProject("p")).toThrow("project ports have not been bound");
    expect(() => boundScan("p", {})).toThrow("observation ports have not been bound");
  });
});
