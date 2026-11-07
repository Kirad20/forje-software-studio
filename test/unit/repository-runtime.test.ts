import { describe, expect, it, vi } from "vitest";
import { createRepositoryRuntime, inferRepositoryConfig, validateRepositoryConfig, type RepositoryState, type RepositoryRunner, type RepositoryStore } from "../../server/modules/repository-runtime/index.js";

function fixture() {
  let state: RepositoryState | undefined;
  let files = { "package.json": '{"scripts":{"start":"node index.js"}}', "index.js": "old" };
  const store: RepositoryStore = {
    load: async () => state ? structuredClone(state) : undefined,
    save: async (_id, next) => { state = structuredClone(next); },
    list: async () => state ? ["project"] : [],
    delete: async () => { state = undefined; },
    exclusive: async (_id, work) => work(),
  };
  const runner: RepositoryRunner = {
    available: vi.fn(async () => true),
    build: vi.fn(async (_id, revision) => `sha256:${revision}`),
    deploy: vi.fn(async (_id, env, revision) => ({ container: `${env}-${revision.id}`, origin: "http://127.0.0.1:12345" })),
    healthy: vi.fn(async () => true),
    stop: vi.fn(async () => {}),
    remove: vi.fn(async () => {}),
    logs: vi.fn(async () => "runtime log"),
  };
  const recordPublish = vi.fn(async (_id: string, _slug: string, _files: Record<string, string>) => {});
  let sequence = 0;
  const runtime = createRepositoryRuntime({
    store, runner, readAllFiles: async () => ({ ...files }), recordPublish,
    isSlugTaken: async () => false, appUrl: (slug) => `https://${slug}.apps.test`,
    previewUrl: (id) => `https://${id}.preview.test`,
    id: () => `revision${++sequence}`, now: () => "2026-11-07T00:00:00.000Z",
  });
  return { runtime, runner, store, recordPublish, edit: () => { files = { ...files, "index.js": "new" }; }, state: () => state! };
}

describe("repository runtime lifecycle (TDD)", () => {
  it("infers Forja's Dockerfile, port, health, PostgreSQL and writable storage", () => {
    expect(inferRepositoryConfig({
      Dockerfile: "ENV PORT=4100 DATA_DIR=/app/data\nUSER node\nEXPOSE 4100\nHEALTHCHECK CMD fetch('/healthz')",
      "package.json": '{"name":"forja","dependencies":{"pg":"1"}}',
    })).toEqual({ rootDirectory: ".", dockerfile: "Dockerfile", port: 4100, healthPath: "/healthz", postgres: true, storagePath: "/app/data" });
  });
  it.each(["../outside", "/absolute", "C:\\host", ".", "nested/../../host"])("rejects dangerous Dockerfile paths: %s", (dockerfile) => {
    expect(() => validateRepositoryConfig({ ...inferRepositoryConfig({}), dockerfile })).toThrow();
  });
  it("builds an immutable revision and publishes that image and files, not edited workspace", async () => {
    const f = fixture();
    const built = await f.runtime.build("project");
    f.edit();
    const published = await f.runtime.publish("project", { slug: "my-app", revisionId: built.preview!.id }, "owner");
    expect(published.published?.image).toBe(built.preview!.image);
    expect(f.recordPublish.mock.calls[0]?.[2]["index.js"]).toBe("old");
    expect(f.runner.deploy).toHaveBeenLastCalledWith("project", "published", expect.objectContaining({ image: built.preview!.image }), expect.anything(), "https://my-app.apps.test");
  });
  it("preserves a healthy preview on unhealthy rebuild and records explicit failure", async () => {
    const f = fixture();
    const first = await f.runtime.build("project");
    vi.mocked(f.runner.healthy).mockResolvedValueOnce(false);
    await expect(f.runtime.build("project")).rejects.toMatchObject({ status: 422 });
    const snapshot = await f.runtime.get("project");
    expect(snapshot.preview?.id).toBe(first.preview!.id);
    expect(snapshot.status).toBe("failed");
    expect(snapshot.revisions.at(-1)?.status).toBe("failed");
    expect(f.runner.stop).toHaveBeenCalledWith("project", "preview", expect.objectContaining({ container: "preview-revision2" }));
  });
  it("cleans a failed first deployment's database container while retaining diagnostic logs", async () => {
    const f = fixture();
    vi.mocked(f.runner.healthy).mockResolvedValue(false);
    await expect(f.runtime.build("project")).rejects.toMatchObject({ status: 422 });
    expect(f.runner.stop).toHaveBeenCalledWith("project", "preview");
    expect((await f.runtime.get("project")).error).toContain("runtime log");
  });
  it("preserves publication on failed healthcheck and rejects failed or unknown revisions", async () => {
    const f = fixture();
    const first = await f.runtime.build("project");
    await f.runtime.publish("project", { slug: "my-app", revisionId: first.preview!.id });
    vi.mocked(f.runner.healthy).mockResolvedValueOnce(false);
    await expect(f.runtime.publish("project", { slug: "my-app", revisionId: first.preview!.id })).rejects.toMatchObject({ status: 422 });
    expect((await f.runtime.get("project")).published?.id).toBe(first.preview!.id);
    await expect(f.runtime.rollback("project", "unknown")).rejects.toMatchObject({ status: 409 });
  });
  it("fails visibly when Docker runner is disabled without invoking a build", async () => {
    const f = fixture();
    vi.mocked(f.runner.available).mockResolvedValue(false);
    expect((await f.runtime.get("project")).available).toBe(false);
    await expect(f.runtime.build("project")).rejects.toMatchObject({ status: 503 });
    expect(f.runner.build).not.toHaveBeenCalled();
  });
  it("fails with a specific stable-key prerequisite instead of encrypting durable credentials ephemerally", async () => {
    const f = fixture();
    f.runner.unavailableReason = "Repository runner requires a stable SECRETS_KEY";
    vi.mocked(f.runner.available).mockResolvedValue(false);
    await expect(f.runtime.build("project")).rejects.toThrow("stable SECRETS_KEY");
    expect((await f.runtime.get("project")).error).toContain("stable SECRETS_KEY");
  });
  it("rejects racing operations while building the same project", async () => {
    const f = fixture();
    let release!: () => void;
    vi.mocked(f.runner.build).mockImplementationOnce(async () => {
      await new Promise<void>((resolve) => { release = resolve; });
      return "sha256:built";
    });
    const build = f.runtime.build("project");
    await vi.waitFor(() => expect(release).toBeTypeOf("function"));
    await expect(f.runtime.configure("project", { port: 3001 })).rejects.toMatchObject({ status: 409 });
    release();
    await build;
  });
  it("reconciles interrupted builds and dead containers without losing revision history", async () => {
    const f = fixture();
    await f.runtime.build("project");
    vi.mocked(f.runner.healthy).mockResolvedValue(false);
    await f.runtime.reconcile();
    const snapshot = await f.runtime.get("project");
    expect(snapshot.preview).toBeNull();
    expect(snapshot.revisions).toHaveLength(1);
    expect(snapshot.error).toContain("unavailable");
  });
  it("cleans orphaned candidates after a restart but retains active deployments", async () => {
    const f = fixture();
    f.runner.cleanup = vi.fn(async () => {});
    await f.runtime.build("project");
    await f.runtime.reconcile();
    expect(f.runner.cleanup).toHaveBeenCalledWith("project", ["preview-revision1"]);
  });
  it("bounds global concurrent builds and refuses excess revisions explicitly", async () => {
    const f = fixture();
    const releases: (() => void)[] = [];
    vi.mocked(f.runner.build).mockImplementation(async () => {
      await new Promise<void>((resolve) => releases.push(resolve));
      return "sha256:built";
    });
    const first = f.runtime.build("one"), second = f.runtime.build("two");
    await vi.waitFor(() => expect(releases).toHaveLength(2));
    await expect(f.runtime.build("three")).rejects.toMatchObject({ status: 409 });
    for (const release of releases) release();
    await Promise.all([first, second]);
    vi.mocked(f.runner.build).mockResolvedValue("sha256:built");
    while ((await f.runtime.get("one")).revisions.length < 20) await f.runtime.build("one");
    await expect(f.runtime.build("one")).rejects.toMatchObject({ status: 409 });
  });
  it("preserves the previous preview if saving a healthy candidate fails", async () => {
    const f = fixture();
    const previous = await f.runtime.build("project");
    const save = f.store.save;
    let count = 0;
    vi.spyOn(f.store, "save").mockImplementation(async (id, next) => {
      if (++count === 2) throw new Error("Database write failed");
      await save(id, next);
    });
    await expect(f.runtime.build("project")).rejects.toMatchObject({ status: 422 });
    expect((await f.runtime.get("project")).preview?.id).toBe(previous.preview!.id);
    expect(f.runner.stop).toHaveBeenCalledWith("project", "preview", expect.objectContaining({ container: "preview-revision2" }));
  });
  it("does not stop a newly committed publication if retiring the old container fails", async () => {
    const f = fixture();
    const first = await f.runtime.build("project");
    await f.runtime.publish("project", { slug: "my-app", revisionId: first.preview!.id });
    const second = await f.runtime.build("project");
    vi.mocked(f.runner.stop).mockRejectedValueOnce(new Error("Old container cleanup failed"));
    await expect(f.runtime.publish("project", { slug: "my-app", revisionId: second.preview!.id })).rejects.toThrow("cleanup failed");
    expect((await f.runtime.get("project")).published?.id).toBe(second.preview!.id);
    expect(f.runner.stop).not.toHaveBeenCalledWith("project", "published", expect.objectContaining({ container: "published-revision2" }));
  });
  it("does not persist published startup logs into the editor-visible snapshot error", async () => {
    const f = fixture();
    const built = await f.runtime.build("project");
    vi.mocked(f.runner.healthy).mockResolvedValueOnce(false);
    vi.mocked(f.runner.logs).mockResolvedValue("sensitive-published-bootstrap");
    await expect(f.runtime.publish("project", { slug: "my-app", revisionId: built.preview!.id })).rejects.toThrow("sensitive-published-bootstrap");
    expect((await f.runtime.get("project")).error).not.toContain("sensitive-published-bootstrap");
  });
});
