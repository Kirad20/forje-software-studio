import { describe, expect, it, vi } from "vitest";
import { createPublication } from "../../../../server/modules/app-runtime/application/publication.js";
import type { PublicationPorts } from "../../../../server/modules/app-runtime/application/ports.js";

function fixture() {
  const live = { slug: "live-app", files: { "pages/_index.tsx": "old" } };
  const files = { "pages/_index.tsx": "new" };
  const ports: PublicationPorts = {
    getProject: vi.fn(async () => ({ id: "p", name: "Mi app", slug: "live-app" })),
    isSlugTaken: vi.fn(async () => false),
    readAllFiles: vi.fn(async () => files),
    checkProject: vi.fn(async () => []),
    scan: vi.fn(async () => []),
    applyMigrations: vi.fn(async () => ({ applied: [] })),
    recordPublish: vi.fn(async (_id, slug, snapshot) => { live.slug = slug; live.files = snapshot as typeof live.files; }),
    unpublish: vi.fn(async () => {}),
    scheduleProject: vi.fn(async () => {}),
    appUrl: (slug) => `https://${slug}.example.test`,
  };
  return { live, files, ports, runtime: createPublication(ports) };
}

describe("publication application", () => {
  it("leaves the actual live publication unchanged when compilation fails", async () => {
    const { ports, runtime, live } = fixture();
    vi.mocked(ports.checkProject).mockResolvedValue([{ file: "pages/_index.tsx", text: "syntax error" }]);
    await expect(runtime.publishProject("p", "replacement")).rejects.toThrow("No se publicó: la app tiene errores");
    expect(live).toEqual({ slug: "live-app", files: { "pages/_index.tsx": "old" } });
    expect(ports.recordPublish).not.toHaveBeenCalled();
    expect(ports.scheduleProject).not.toHaveBeenCalled();
    expect(ports.applyMigrations).not.toHaveBeenCalled();
    expect(ports.scan).not.toHaveBeenCalled();
  });

  it("leaves the live publication unchanged when an unignored critical finding blocks it", async () => {
    const { ports, runtime, live } = fixture();
    vi.mocked(ports.scan).mockResolvedValue([{ severity: "critical", title: "Secret", file: "pages/_index.tsx", fix: "Remove it" }]);
    await expect(runtime.publishProject("p", "replacement")).rejects.toThrow("seguridad críticos");
    expect(live.slug).toBe("live-app");
    expect(ports.recordPublish).not.toHaveBeenCalled();
    expect(ports.applyMigrations).not.toHaveBeenCalled();
  });

  it("snapshots exactly the verified files before refreshing jobs; ignored critical findings do not block", async () => {
    const { ports, runtime, live, files } = fixture();
    vi.mocked(ports.scan).mockResolvedValue([{ severity: "critical", ignored: true, title: "Ignored", fix: "" }]);
    await expect(runtime.publishProject("p", "Nueva app", "builder")).resolves.toEqual({ slug: "nueva-app", url: "https://nueva-app.example.test" });
    expect(live).toEqual({ slug: "nueva-app", files });
    expect(ports.recordPublish).toHaveBeenCalledWith("p", "nueva-app", files, "builder");
    expect(ports.applyMigrations).toHaveBeenCalledWith("p", files);
    expect(vi.mocked(ports.applyMigrations).mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(ports.recordPublish).mock.invocationCallOrder[0]!);
    expect(vi.mocked(ports.recordPublish).mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(ports.scheduleProject).mock.invocationCallOrder[0]!);
  });

  it("does not read or compile files for an unavailable slug", async () => {
    const { ports, runtime } = fixture();
    vi.mocked(ports.isSlugTaken).mockResolvedValue(true);
    await expect(runtime.publishProject("p", "taken-name")).rejects.toThrow("ya está en uso");
    expect(ports.readAllFiles).not.toHaveBeenCalled();
  });

  it("does not advance the published files or schedule jobs when a migration fails", async () => {
    const { ports, runtime, live } = fixture();
    vi.mocked(ports.applyMigrations).mockRejectedValueOnce(new Error("Migration failed"));
    await expect(runtime.publishProject("p", "replacement")).rejects.toThrow("Migration failed");
    expect(live.slug).toBe("live-app");
    expect(ports.recordPublish).not.toHaveBeenCalled();
    expect(ports.scheduleProject).not.toHaveBeenCalled();
  });

  it("serializes concurrent publishes for the same project", async () => {
    const { ports, runtime } = fixture();
    let releaseFirst!: () => void;
    const firstMigration = new Promise<void>((resolve) => { releaseFirst = resolve; });
    vi.mocked(ports.applyMigrations)
      .mockImplementationOnce(async () => { await firstMigration; return { applied: [] }; })
      .mockImplementation(async () => ({ applied: [] }));

    const first = runtime.publishProject("p");
    await vi.waitFor(() => expect(ports.applyMigrations).toHaveBeenCalledOnce());
    const second = runtime.publishProject("p");
    await Promise.resolve();
    expect(ports.applyMigrations).toHaveBeenCalledOnce();
    releaseFirst();
    await Promise.all([first, second]);
    expect(ports.applyMigrations).toHaveBeenCalledTimes(2);
  });

  it("withdraws the snapshot before rescheduling jobs", async () => {
    const { ports, runtime } = fixture();
    await runtime.unpublishProject("p");
    expect(vi.mocked(ports.unpublish).mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(ports.scheduleProject).mock.invocationCallOrder[0]!);
  });
});
