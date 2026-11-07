import { describe, expect, it, vi } from "vitest";
import { createGithubSyncService, GithubError, type Link } from "../../../../server/modules/integrations/application/github.js";
import { ProjectPath } from "../../../../server/modules/projects/index.js";
import { assertSafeRepositoryPath, assertSafeRepositoryContent, repositoryPathExclusion } from "../../../../contracts/repository.js";
const deferred = <T>() => { let resolve!: (value: T) => void; const promise = new Promise<T>((r) => { resolve = r; }); return { resolve, promise }; };
function setup() {
  const link: Link = { project_id: "p", account_id: "a", owner: "owner", repo: "repo", branch: "main", last_sha: "head", last_tree: "tree", synced: {}, status: "ok", error: null, synced_at: null };
  const repository = { link: vi.fn(async () => structuredClone(link)), token: vi.fn(async () => ({ token: "token", login: "owner" })), saveSync: vi.fn(), failSync: vi.fn(), linkedProjects: vi.fn(async () => ["p"]), addPullCard: vi.fn() };
  const scheduled: { callback: () => void; cancel: ReturnType<typeof vi.fn> }[] = [];
  let listener: (event: { type: string }) => void = () => {};
  const unsubscribe = vi.fn();
  const project = { readAllFiles: vi.fn(async () => ({} as Record<string, string>)), writeFile: vi.fn(), deleteFile: vi.fn(), assertValidPath: vi.fn((path: string) => { if (!path.startsWith("pages/")) throw Error("invalid"); }), recheckBuild: vi.fn(async () => []), emitProject: vi.fn(), subscribe: vi.fn((_p: string, l: typeof listener) => { listener = l; return unsubscribe; }) };
  const gateway = { repositoryPolicy: { assertPath: assertSafeRepositoryPath, assertContent: assertSafeRepositoryContent, exclusion: repositoryPathExclusion }, request: vi.fn(async (_t: string, method: string, path: string, _body?: unknown): Promise<any> => {
    if (path.includes("/git/ref/")) return { object: { sha: "head" } };
    if (path.endsWith("/git/commits/head")) return { tree: { sha: "tree" } };
    if (method === "POST" && path.endsWith("/git/trees")) return { sha: "newtree" };
    if (method === "POST" && path.endsWith("/git/commits")) return { sha: "newhead" };
  }), blobSha: (c: string) => `sha:${c}`, decodeBlob: (_p: string, c: string) => c, encodeText: (c: string) => c, webUrl: () => "https://github.test", pollMs: () => 100, schedule: (_delay: number, callback: () => void) => { const cancel = vi.fn(); scheduled.push({ callback, cancel }); return cancel; }, warn: vi.fn() };
  return { link, repository, project, gateway, scheduled, unsubscribe, emit: () => listener({ type: "files" }), service: createGithubSyncService(repository, gateway, project) };
}
describe("GitHub synchronization usecases", () => {
  it("preserves executable mode when pushing changed repository scripts", async () => {
    const s = setup();
    s.link.synced = { "scripts/start.sh": "sha:old" };
    s.project.readAllFiles.mockResolvedValue({ "scripts/start.sh": "#!/bin/sh\nnode server.js" });
    const original = s.gateway.request.getMockImplementation()!;
    s.gateway.request.mockImplementation(async (token, method, path, body) => {
      if (path.includes("?recursive=1")) return { tree: [{ path: "scripts/start.sh", type: "blob", mode: "100755", sha: "sha:old" }] };
      return original(token, method, path, body);
    });
    const service = createGithubSyncService(s.repository, s.gateway, { ...s.project, projectRuntime: async () => "repository", assertValidPathForProject: async () => {} });
    await service.syncProject("p");
    expect(s.gateway.request).toHaveBeenCalledWith("token", "POST", "/repos/owner/repo/git/trees", { base_tree: "tree", tree: [{ path: "scripts/start.sh", mode: "100755", type: "blob", content: "#!/bin/sh\nnode server.js" }] });
  });
  it("syncs original repository paths and lockfiles, retaining excluded remote files and binary baseline", async () => {
    const s = setup();
    const local: Record<string, string> = { "src/index.ts": "old", "package-lock.json": "x".repeat(1024 * 1024 + 10), "assets/logo.png": "base64:aGVsbG8=" };
    s.link.last_sha = "previous";
    s.link.synced = Object.fromEntries(Object.entries(local).map(([path, content]) => [path, s.gateway.blobSha(content)]));
    s.project.readAllFiles.mockImplementation(async () => ({ ...local }));
    s.project.writeFile.mockImplementation(async (_p, path, content) => { local[path] = content; });
    const original = s.gateway.request.getMockImplementation()!;
    s.gateway.request.mockImplementation(async (token, method, path, body) => {
      if (path.endsWith("/git/commits/head")) return { tree: { sha: "tree" }, message: "Repository edit" };
      if (path.includes("?recursive=1")) return { tree: [
        { path: "src/index.ts", type: "blob", mode: "100644", sha: "sha:new" },
        { path: "package-lock.json", type: "blob", mode: "100644", sha: s.link.synced["package-lock.json"], size: local["package-lock.json"]!.length },
        { path: "assets/logo.png", type: "blob", mode: "100644", sha: s.link.synced["assets/logo.png"] },
        { path: ".env.example", type: "blob", sha: "environment" },
        { path: "graphify-out/graph.json", type: "blob", sha: "generated" },
      ] };
      if (path.endsWith("/git/blobs/sha:new")) return { content: "new", encoding: "utf8" };
      return original(token, method, path, body);
    });
    const project = { ...s.project, projectRuntime: vi.fn(async () => "repository" as const), assertValidPathForProject: vi.fn(async (_id: string, path: string) => ProjectPath.assertValid(path, "repository")) };
    const service = createGithubSyncService(s.repository, s.gateway, project);
    const result = await service.syncProject("p");
    expect(local["src/index.ts"]).toBe("new");
    expect(result.pushed).toBeNull();
    expect(project.recheckBuild).not.toHaveBeenCalled();
    expect(s.repository.addPullCard).toHaveBeenCalledWith("p", expect.objectContaining({ build: "pending" }));
    expect(s.gateway.request.mock.calls.some(([, method]) => method === "POST")).toBe(false);
  });
  it("rejects repository symlink updates rather than advancing an inaccurate baseline", async () => {
    const s = setup();
    s.link.last_sha = "old";
    const original = s.gateway.request.getMockImplementation()!;
    s.gateway.request.mockImplementation(async (token, method, path, body) => {
      if (path.includes("?recursive=1")) return { tree: [{ path: "src/link", type: "blob", mode: "120000", sha: "link" }] };
      return original(token, method, path, body);
    });
    const service = createGithubSyncService(s.repository, s.gateway, { ...s.project, projectRuntime: async () => "repository", assertValidPathForProject: async () => {} });
    await expect(service.syncProject("p")).rejects.toMatchObject({ status: 422 });
    expect(s.repository.saveSync).not.toHaveBeenCalled();
  });
  it("pulls only permitted remote files, remote conflicts win, and preserves locally changed remote deletions", async () => {
    const s = setup();
    s.link.synced = { "pages/conflict.tsx": "old", "pages/deleted.tsx": "sha:old", "pages/kept.tsx": "sha:old" };
    const local: Record<string, string> = { "pages/conflict.tsx": "local", "pages/deleted.tsx": "old", "pages/kept.tsx": "changed" };
    s.project.readAllFiles.mockImplementation(async () => ({ ...local }));
    s.project.writeFile.mockImplementation(async (_p, path, content) => { local[path] = content; s.emit(); });
    s.project.deleteFile.mockImplementation(async (_p, path) => { delete local[path]; s.emit(); });
    s.gateway.request.mockImplementation(async (_token, method, path) => {
      if (path.includes("/git/ref/")) return { object: { sha: "remotehead" } };
      if (path.endsWith("/git/commits/remotehead")) return { tree: { sha: "remotetree" }, message: "Remote change\nbody" };
      if (path.includes("?recursive=1")) return { tree: [{ path: "pages/conflict.tsx", type: "blob", sha: "sha:remote" }, { path: "README.md", type: "blob", sha: "readme" }, { path: "pages/huge.tsx", type: "blob", sha: "huge", size: 1024 * 1024 + 1 }] };
      if (path.endsWith("/git/blobs/sha:remote")) return { content: "remote", encoding: "utf8" };
      if (method === "POST" && path.endsWith("/git/trees")) return { sha: "newtree" };
      if (method === "POST" && path.endsWith("/git/commits")) return { sha: "newhead" };
    });
    s.service.watchLinked("p");
    const result = await s.service.syncProject("p");
    expect(result.pulled).toEqual([{ sha: "remotehead", message: "Remote change", files: ["pages/conflict.tsx", "pages/deleted.tsx"] }]);
    expect(local).toEqual({ "pages/conflict.tsx": "remote", "pages/kept.tsx": "changed" });
    expect(result.pushed?.files).toEqual(["pages/kept.tsx"]);
    expect(s.repository.addPullCard).toHaveBeenCalledWith("p", expect.objectContaining({ build: "ok" }));
    expect(s.scheduled).toHaveLength(0);
    await s.service.stopGithubSync();
  });
  it("pushes local edits and deletions in a non-forced commit preserving unrelated remote paths", async () => {
    const s = setup();
    s.link.synced = { "pages/deleted.tsx": "old" };
    s.project.readAllFiles.mockResolvedValue({ "pages/index.tsx": "new" });
    const result = await s.service.syncProject("p", { message: "build done" });
    expect(result.pushed).toEqual({ sha: "newhead", files: ["pages/index.tsx", "pages/deleted.tsx"] });
    expect(s.gateway.request).toHaveBeenCalledWith("token", "POST", "/repos/owner/repo/git/trees", { base_tree: "tree", tree: [{ path: "pages/index.tsx", mode: "100644", type: "blob", content: "new" }, { path: "pages/deleted.tsx", mode: "100644", type: "blob", sha: null }] });
    expect(s.gateway.request).toHaveBeenCalledWith("token", "PATCH", "/repos/owner/repo/git/refs/heads/main", { sha: "newhead", force: false });
    expect(s.repository.saveSync).toHaveBeenCalledWith("p", expect.objectContaining({ last_sha: "newhead", synced: { "pages/index.tsx": "sha:new" } }));
  });
  it("does not mistake an oversized remote blob for a deletion of an imported file", async () => {
    const s = setup();
    s.link.last_sha = "old";
    s.link.synced = { "pages/index.tsx": "sha:local" };
    s.project.readAllFiles.mockResolvedValue({ "pages/index.tsx": "local" });
    const original = s.gateway.request.getMockImplementation()!;
    s.gateway.request.mockImplementation(async (token, method, path, body) => {
      if (path.includes("?recursive=1")) return { tree: [{ path: "pages/index.tsx", type: "blob", sha: "huge", size: 1024 * 1024 + 1 }] };
      return original(token, method, path, body);
    });
    const result = await s.service.syncProject("p");
    expect(s.project.deleteFile).not.toHaveBeenCalled();
    expect(result.pushed).toBeNull();
    expect(s.repository.saveSync).toHaveBeenCalledWith("p", expect.objectContaining({ synced: { "pages/index.tsx": "sha:local" } }));
  });
  it("serializes concurrent syncs and records lost access", async () => {
    const s = setup(), token = deferred<{ token: string; login: string }>();
    s.repository.token.mockImplementationOnce(() => token.promise);
    const first = s.service.syncProject("p"), second = s.service.syncProject("p");
    await vi.waitFor(() => expect(s.repository.token).toHaveBeenCalledTimes(1));
    token.resolve({ token: "token", login: "owner" });
    await Promise.all([first, second]);
    s.repository.token.mockRejectedValueOnce(new GithubError("bad", 401));
    await expect(s.service.syncProject("p")).rejects.toMatchObject({ status: 401 });
    expect(s.repository.failSync).toHaveBeenCalledWith("p", "lost_access", expect.stringContaining("perdió"));
  });
  it("hold suppresses edits, release syncs once, and stop detaches listeners", async () => {
    const s = setup();
    s.service.watchLinked("p"); s.service.watchLinked("p");
    s.service.holdSync("p"); s.emit();
    expect(s.scheduled).toHaveLength(0);
    await s.service.releaseSync("p", "turn");
    s.emit();
    expect(s.scheduled).toHaveLength(1);
    await s.service.stopGithubSync();
    expect(s.unsubscribe).toHaveBeenCalledTimes(1);
    expect(s.scheduled[0]!.cancel).toHaveBeenCalledOnce();
    s.scheduled[0]!.callback();
    expect(s.repository.saveSync).toHaveBeenCalledTimes(1);
  });
  it("stop drains a pending delayed edit lookup and cannot schedule a push afterward", async () => {
    const s = setup(), lookup = deferred<Link>();
    s.repository.link.mockImplementationOnce(() => lookup.promise);
    s.service.watchLinked("p"); s.emit(); s.scheduled[0]!.callback();
    let stopped = false;
    const stop = s.service.stopGithubSync().then(() => { stopped = true; });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(stopped).toBe(false);
    lookup.resolve(s.link); await stop;
    expect(s.repository.token).not.toHaveBeenCalled();
  });
  it("start and stop are idempotent and polling can restart", async () => {
    const s = setup();
    s.service.startGithubSync(); s.service.startGithubSync();
    await vi.waitFor(() => expect(s.repository.saveSync).toHaveBeenCalledTimes(1));
    await s.service.stopGithubSync(); await s.service.stopGithubSync();
    expect(s.unsubscribe).toHaveBeenCalledTimes(1);
    s.service.startGithubSync();
    await vi.waitFor(() => expect(s.repository.saveSync).toHaveBeenCalledTimes(2));
    await s.service.stopGithubSync();
  });
});
