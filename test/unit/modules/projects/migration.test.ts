import { describe, expect, it, vi } from "vitest";
import { ProjectsApplication } from "../../../../server/modules/projects/application/ProjectsApplication.js";
import { CreateProjectUseCase } from "../../../../server/modules/projects/application/CreateProjectUseCase.js";

function fixture() {
  const source = { id: "source", name: "App", description: "desc", systemPrompt: "system", designPrompt: "design", seo: { robots: false }, folderId: "folder" };
  const store = {
    create: vi.fn().mockResolvedValue(undefined),
    getProject: vi.fn().mockImplementation(async (id) => ({ ...source, id })),
    updateProject: vi.fn(),
    readAllFiles: vi.fn().mockResolvedValue({ "pages/home.tsx": "code" }),
    logChange: vi.fn().mockResolvedValue(42),
    publishedFiles: vi.fn(),
    recordPublish: vi.fn(),
    touch: vi.fn(),
    restoreTarget: vi.fn().mockResolvedValue({ id: 5, label: "Saved" }),
    changesAfter: vi.fn().mockResolvedValue([{ before: { "pages/home.tsx": "middle" } }, { before: { "pages/home.tsx": "old", "pages/new.tsx": null } }]),
    restoreFiles: vi.fn(),
    createFolder: vi.fn(),
    turnSpan: vi.fn().mockResolvedValue({ start: "2026-01-01", last: 2 }),
    nextTurn: vi.fn().mockResolvedValue(undefined),
    builderChanges: vi.fn().mockResolvedValue([{ id: 8, before: { "pages/home.tsx": "before", "static/a.png": "base64:old" } }]),
    nextFileBefore: vi.fn().mockResolvedValue(undefined),
    previousChange: vi.fn().mockResolvedValue(5),
  };
  const ports = {
    projectId: vi.fn().mockReturnValue("0123456789abcdef"),
    id: vi.fn().mockReturnValue("uuid"),
    templates: vi.fn().mockReturnValue({ "pages/home.tsx": "starter" }),
    warmup: vi.fn().mockResolvedValue(undefined),
    clone: vi.fn().mockResolvedValue(undefined),
    emit: vi.fn(),
  };
  return { store, ports, app: new ProjectsApplication(store as never, ports), source };
}

describe("Projects hexagonal migration", () => {
  it("uses the existing creation use case with the transactional creation port", async () => {
    const { store, ports } = fixture();
    const useCase = new CreateProjectUseCase(store as never, ports as never);
    await useCase.execute({ ownerId: "owner", name: "App", files: {} } as never);
    expect(store.create).toHaveBeenCalledWith(expect.objectContaining({ id: "0123456789abcdef" }), {}, undefined);
    expect(store.getProject).toHaveBeenCalledWith("0123456789abcdef");
  });
  it("creates with injected IDs/templates, atomic store creation, checkpoint then warmup", async () => {
    const { app, store, ports } = fixture();
    await app.createProject("owner", "App");
    expect(store.create).toHaveBeenCalledWith(expect.objectContaining({
      id: "0123456789abcdef", ownerId: "owner", name: "App", description: "",
    }), { "pages/home.tsx": "starter" }, undefined);
    expect(store.logChange).toHaveBeenCalledWith("0123456789abcdef", expect.objectContaining({ kind: "checkpoint", label: "Proyecto creado", author: "system" }));
    expect(ports.warmup).toHaveBeenCalledWith("0123456789abcdef");
    expect(store.create.mock.invocationCallOrder[0]).toBeLessThan(store.logChange.mock.invocationCallOrder[0]!);
  });
  it("preserves explicit empty files and organization and skips side effects after failed creation", async () => {
    const { app, store, ports } = fixture();
    await app.createProject("owner", "App", "", {}, "org");
    expect(store.create).toHaveBeenCalledWith(expect.anything(), {}, "org");
    expect(ports.templates).not.toHaveBeenCalled();
    store.create.mockRejectedValueOnce(new Error("rollback"));
    store.logChange.mockClear(); ports.warmup.mockClear();
    await expect(app.createProject("owner", "App")).rejects.toThrow("rollback");
    expect(store.logChange).not.toHaveBeenCalled();
    expect(ports.warmup).not.toHaveBeenCalled();
  });
  it("duplicates code and selected settings then clones app data, without published state", async () => {
    const { app, store, ports, source } = fixture();
    await app.duplicateProject("new-owner", "source");
    expect(store.create).toHaveBeenCalledWith(expect.objectContaining({ ownerId: "new-owner", name: "App (copia)" }), { "pages/home.tsx": "code" }, undefined);
    expect(store.updateProject).toHaveBeenCalledWith("0123456789abcdef", { systemPrompt: source.systemPrompt, designPrompt: source.designPrompt, seo: source.seo, folderId: source.folderId });
    expect(ports.clone).toHaveBeenCalledWith("source", "0123456789abcdef");
  });
  it("restores newest-first before images, records undo and emits only after persistence", async () => {
    const { app, store, ports } = fixture();
    await app.restoreToChange("p", 5, "mcp", "actor");
    expect(store.restoreFiles).toHaveBeenCalledWith("p", new Map([["pages/home.tsx", "old"], ["pages/new.tsx", null]]));
    expect(store.logChange).toHaveBeenCalledWith("p", expect.objectContaining({ kind: "restore", actor: "actor", label: "Restaurado a Saved", before: { "pages/home.tsx": "code", "pages/new.tsx": null } }));
    expect(ports.emit).toHaveBeenCalledWith("p", { type: "files", paths: ["pages/home.tsx", "pages/new.tsx"] });
  });
  it("rejects unknown restore targets and no-ops if no files need restoring", async () => {
    const { app, store, ports } = fixture();
    store.restoreTarget.mockResolvedValueOnce(undefined);
    await expect(app.restoreToChange("p", 5)).rejects.toThrow("Punto de restauración no encontrado");
    store.changesAfter.mockResolvedValueOnce([]);
    await app.restoreToChange("p", 5);
    expect(store.restoreFiles).not.toHaveBeenCalled();
    expect(ports.emit).not.toHaveBeenCalled();
  });
  it("filters developer notes on publish, logs and emits, and ignores notes in unpublished comparison", async () => {
    const { app, store, ports } = fixture();
    await app.recordPublish("p", "slug", { "pages/home.tsx": "code", "static/__dev/note.txt": "private" });
    expect(store.recordPublish).toHaveBeenCalledWith("p", "slug", "uuid", { "pages/home.tsx": "code" });
    expect(store.logChange).toHaveBeenCalledWith("p", expect.objectContaining({ kind: "publish", paths: [], label: "App publicada" }));
    expect(ports.emit).toHaveBeenCalledWith("p", { type: "published", slug: "slug" });
    store.publishedFiles.mockResolvedValue({ "pages/home.tsx": "code", "static/__dev/note.txt": "old" });
    expect(await app.hasUnpublishedChanges("p")).toBe(false);
    store.publishedFiles.mockResolvedValue({ "pages/home.tsx": "different" });
    expect(await app.hasUnpublishedChanges("p")).toBe(true);
  });
  it("calculates turn diffs with omitted binary content, restore anchor and sorted paths", async () => {
    const { app } = fixture();
    expect(await app.turnChanges("p", "turn")).toEqual({
      files: [
        { path: "pages/home.tsx", kind: "edit", before: "before", after: "code" },
        { path: "static/a.png", kind: "delete", before: null, after: null, omitted: true },
      ], restoreTo: 5, firstChange: 8,
    });
  });
  it("normalizes folder names at the application boundary", async () => {
    const { app, store } = fixture();
    expect(await app.createFolder("owner", "   ")).toBe("uuid");
    expect(store.createFolder).toHaveBeenCalledWith("owner", "uuid", "Carpeta");
    await app.createFolder("owner", " x".repeat(100));
    expect(store.createFolder.mock.calls[1]![2]).toHaveLength(60);
  });
});
