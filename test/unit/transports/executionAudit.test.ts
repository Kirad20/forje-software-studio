import { Hono } from "hono";
import { describe, expect, it, vi } from "vitest";
import { createAdminApi } from "../../../server/bootstrap/http/adminApi.js";
import { createAdminMcpHandler } from "../../../server/bootstrap/mcp/adminServer.js";
import type { AdministrationEnv } from "../../../server/modules/administration/index.js";

const account = { id: "audit-admin", email: "audit@example.test", name: null, credits: 0, platformRole: "admin" as const };
const fakeReport = { timeline: [], evidence: { legacy: "not recorded" } };
const mcpRequest = (token: string, args: object = {}) => new Request("http://localhost/admin/mcp", {
  method: "POST",
  headers: { authorization: `Bearer ${token}`, "content-type": "application/json", accept: "application/json, text/event-stream" },
  body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "execution_audit", arguments: args } }),
});

describe("administrator-only execution audit transports", () => {
  it("denies unauthenticated, normal and disabled HTTP accounts before reading metrics", async () => {
    const query = vi.fn().mockResolvedValue(fakeReport);
    for (const actor of [undefined, { ...account, platformRole: "user" }, { ...account, disabled: true }]) {
      const app = new Hono<AdministrationEnv>();
      if (actor) app.use("*", async (c, next) => { c.set("account", actor as never); await next(); });
      app.route("/admin", createAdminApi({ identity: {} as never, models: {} as never, settings: {} as never,
        projects: {} as never, collaboration: {} as never }, query as never));
      expect((await app.request("/admin/audit")).status).toBe(actor ? 403 : 401);
    }
    expect(query).not.toHaveBeenCalled();
  });
  it("validates HTTP filters and prevents caching administrative execution data", async () => {
    const query = vi.fn().mockResolvedValue(fakeReport);
    const app = new Hono<AdministrationEnv>();
    app.use("*", async (c, next) => { c.set("account", account); await next(); });
    app.route("/admin", createAdminApi({ identity: {} as never, models: {} as never, settings: {} as never,
      projects: {} as never, collaboration: {} as never }, query as never));
    for (const suffix of ["?limit=101", "?offset=-1", "?sql=select", "?from=2026-01-01&to=2026-03-01"]) {
      expect((await app.request(`/admin/audit${suffix}`)).status).toBe(400);
    }
    expect(query).not.toHaveBeenCalled();
    const response = await app.request("/admin/audit?projectId=project&limit=2&offset=1");
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(query).toHaveBeenCalledWith(expect.objectContaining({ projectId: "project", limit: 2, offset: 1 }));
  });
  it("accepts only admin-purpose MCP tokens and validates bounded project diagnostics", async () => {
    const query = vi.fn().mockResolvedValue(fakeReport);
    const identity = { accountFromAdminApiToken: vi.fn(async (token: string) =>
      token === "admin" ? account : token === "disabled" ? { ...account, disabled: true }
        : token === "user" ? { ...account, platformRole: "user" } : null) };
    const projects = { getProject: vi.fn(async (id: string) => id === "project" ? { id } : null) };
    const handle = createAdminMcpHandler({ identity, projects, settings: {} as never, models: {} as never, auditQuery: query } as never);
    for (const token of ["project-purpose", "disabled", "expired", "revoked"]) {
      expect((await handle(mcpRequest(token))).status).toBe(401);
    }
    expect((await handle(mcpRequest("user"))).status).toBe(403);
    expect(query).not.toHaveBeenCalled();
    for (const args of [{ limit: 101 }, { from: "2026-01-01", to: "2026-03-01" }, { projectId: "missing" }, { sql: "select" }]) {
      const response = await handle(mcpRequest("admin", args));
      expect((await response.json()).result.isError).toBe(true);
    }
    expect(query).not.toHaveBeenCalled();
    const response = await handle(mcpRequest("admin", { projectId: "project", limit: 2 }));
    expect((await response.json()).result.isError).toBe(false);
    expect(query).toHaveBeenCalledWith(expect.objectContaining({ projectId: "project", limit: 2 }));
  });
});
