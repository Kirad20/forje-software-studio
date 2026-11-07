import { Hono } from "hono";
import { describe, expect, it, vi } from "vitest";
import { registerRepositoryApi } from "../../server/bootstrap/http/repositoryApi.js";
import type { RepositoryRuntime } from "../../server/modules/repository-runtime/index.js";

function app(access = "owner", mode = "repository", authenticated = true) {
  const runtime = { get: vi.fn(async () => ({ available: true })), build: vi.fn(async () => ({ status: "ready" })), configure: vi.fn(), publish: vi.fn(), rollback: vi.fn(), stop: vi.fn(), logs: vi.fn() } as unknown as RepositoryRuntime;
  const hono = new Hono<{ Variables: { project: { id: string; runtime: string }; access: string } }>();
  hono.use("*", async (c, next) => {
    if (authenticated) {
      c.set("project", { id: "project", runtime: mode });
      c.set("access", access);
    }
    await next();
  });
  registerRepositoryApi(hono, runtime);
  return { hono, runtime };
}
describe("repository HTTP API authorization (TDD)", () => {
  it("requires resolved project authorization even if registered without middleware", async () => {
    const f = app("owner", "repository", false);
    expect((await f.hono.request("/projects/project/repository")).status).toBe(403);
    expect(f.runtime.get).not.toHaveBeenCalled();
  });
  it("allows editor builds but denies owner-only configuration", async () => {
    const f = app("editor");
    expect((await f.hono.request("/projects/project/repository/build", { method: "POST" })).status).toBe(200);
    expect((await f.hono.request("/projects/project/repository", { method: "PATCH", headers: { "content-type": "application/json" }, body: '{"port":3001}' })).status).toBe(403);
    expect(f.runtime.configure).not.toHaveBeenCalled();
  });
  it("rejects unknown and invalid config keys rather than forwarding untrusted commands", async () => {
    const f = app();
    const response = await f.hono.request("/projects/project/repository", { method: "PATCH", headers: { "content-type": "application/json" }, body: '{"command":"rm -rf /","port":-1}' });
    expect(response.status).toBe(400);
    expect(f.runtime.configure).not.toHaveBeenCalled();
  });
  it("rejects native-mode repository operations explicitly", async () => {
    const f = app("owner", "native");
    expect((await f.hono.request("/projects/project/repository/build", { method: "POST" })).status).toBe(409);
  });
  it("allows editors preview logs but protects production bootstrap and app-generated secrets", async () => {
    const f = app("editor");
    expect((await f.hono.request("/projects/project/repository/logs?env=preview")).status).toBe(200);
    expect((await f.hono.request("/projects/project/repository/logs?env=published")).status).toBe(403);
    expect(f.runtime.logs).toHaveBeenCalledTimes(1);
  });
});
