import { EventEmitter } from "node:events";
import { Hono } from "hono";
import { describe, expect, it, vi } from "vitest";
import type { CollaborationModule } from "../../../server/modules/collaboration/index.js";
import type { IdentityModule } from "../../../server/modules/identity/index.js";
import type { ProjectsModule } from "../../../server/modules/projects/index.js";
import type { SettingsModule } from "../../../server/modules/settings/index.js";
import type { ProjectKnowledgeModule } from "../../../server/modules/project-knowledge/index.js";
import { createStudioApi } from "../../../server/bootstrap/http/studioApi.js";
import type { BuilderServiceClient } from "../../../server/modules/builder/infrastructure/builderServiceClient.js";

const mocks = vi.hoisted(() => ({ watchProblems: vi.fn(), getSandboxServices: vi.fn(() => []), restartSandboxService: vi.fn() }));

vi.mock("../../../server/modules/app-runtime/index.js", async (importOriginal) => ({
  ...await importOriginal<typeof import("../../../server/modules/app-runtime/index.js")>(),
  getSandboxServices: mocks.getSandboxServices,
  restartSandboxService: mocks.restartSandboxService,
  readServiceRuntime: vi.fn(async () => ({ available: true, scope: "app-runtime", services: mocks.getSandboxServices() })),
  restartServiceRuntime: vi.fn(async (id: string, service: string, env?: "preview" | "published") => mocks.restartSandboxService(id, service, env)),
}));
vi.mock("../../../server/modules/app-services/jobs.js", async (importOriginal) => ({
  ...await importOriginal<typeof import("../../../server/modules/app-services/jobs.js")>(),
  listJobs: vi.fn(async () => ({ jobs: [], runs: [], timers: [], queue: [] })),
  runJob: vi.fn(async () => {}),
}));
vi.mock("../../../server/modules/app-services/auth.js", async (importOriginal) => ({
  ...await importOriginal<typeof import("../../../server/modules/app-services/auth.js")>(),
  ensureProjectOwner: vi.fn(async () => false),
  createAppUser: vi.fn(async (_id: string, input: { email: string; password: string; name?: string }) => ({
    id: "app-user", email: input.email, name: input.name ?? null, role: "user",
  })),
  updateAppUserPassword: vi.fn(async () => ({ id: "app-user", email: "app@example.test", name: null, role: "user" })),
}));

vi.mock("../../../server/modules/app-services/projectDb.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../server/modules/app-services/projectDb.js")>();
  return {
    ...actual, execSql: vi.fn(async () => [{ n: 1 }]),
    describeSchema: vi.fn(async () => ({})), isAwake: vi.fn(async () => true),
    listProjectRows: vi.fn(async () => ({ rows: [], total: 0 })),
    createProjectRow: vi.fn(async () => ({ id: 1 })), deleteProjectRows: vi.fn(async () => 1),
    listAppUsers: vi.fn(async () => []), projectDbMetrics: vi.fn(async () => ({ operations: 1 })),
    dumpDatabase: vi.fn(async () => new Blob(["database"])),
  };
});
vi.mock("../../../server/modules/app-services/email.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../server/modules/app-services/email.js")>();
  return { ...actual, listEmails: vi.fn(async () => [{ id: "email-1" }]) };
});
vi.mock("../../../server/modules/project-observability/events.js", async () => {
  const { EventEmitter } = await import("node:events");
  return { projectEvents: new EventEmitter(), emitProject: vi.fn(), readLogs: vi.fn() };
});
vi.mock("../../../server/modules/project-observability/problems.js", () => ({
  clearProblems: vi.fn(),
  listProblems: vi.fn(),
  recheckBuild: vi.fn(),
  watchProblems: mocks.watchProblems,
}));

const account = { id: "account-1", email: "owner@example.com", name: "Owner", platformRole: "user", credits: 0 };
const identity = {
  accountFromSession: vi.fn(async (token?: string) => (token === "valid" ? account : null)),
} as unknown as IdentityModule;
const projects = {
  createProject: vi.fn(async () => ({ id: "created-project", ownerId: "account-1", name: "Orders demo" })),
  getProject: vi.fn(async () => ({ id: "project-1", ownerId: "account-1", name: "App" })),
  readFile: vi.fn(async () => "existing content"),
  readAllFiles: vi.fn(async () => ({
    "jobs/invoices.ts": "",
    "forja.services.json": '{"version":1,"services":{"invoices":{"kind":"worker","jobs":["jobs/invoices.ts"],"replicas":1}}}',
  })),
  publishedFiles: vi.fn(async () => ({
    "jobs/live.ts": "",
    "forja.services.json": '{"version":1,"services":{"live":{"kind":"worker","jobs":["jobs/live.ts"],"replicas":3}}}',
  })),
  writeFile: vi.fn(async () => undefined),
} as unknown as ProjectsModule;
const collaboration = { accessOf: vi.fn(async () => "owner") } as unknown as CollaborationModule;
const settings = {} as SettingsModule;
const knowledge = { graph: vi.fn(), question: vi.fn(), source: vi.fn() } as unknown as ProjectKnowledgeModule;
const models = {} as ReturnType<typeof import("../../../server/modules/model-management/index.js").createPlatformModelManagement>;
const studioApi = createStudioApi({ identity, projects, knowledge, collaboration, settings, models });
const app = new Hono().route("/api", studioApi);
const eventModule = await import("../../../server/modules/project-observability/events.js");
const dbModule = await import("../../../server/modules/app-services/projectDb.js");
const emailModule = await import("../../../server/modules/app-services/email.js");
const jobsModule = await import("../../../server/modules/app-services/jobs.js");
const authModule = await import("../../../server/modules/app-services/auth.js");

describe("HTTP transport contract", () => {
  it.each(["preview", "published"] as const)("routes service reads and writes explicitly to %s", async (env) => {
    const root = "/api/projects/project-1";
    const headers = { cookie: "forja_session=valid", "content-type": "application/json" };
    const get = (resource: string) => app.request(`${root}/${resource}${resource.includes("?") ? "&" : "?"}env=${env}`, { headers });
    const post = (resource: string, body: unknown) => app.request(`${root}/${resource}?env=${env}`, {
      method: "POST", headers, body: JSON.stringify(body),
    });
    expect((await get("db/schema?internal=1")).status).toBe(200);
    expect(dbModule.describeSchema).toHaveBeenLastCalledWith("project-1", true, env);
    expect(dbModule.isAwake).toHaveBeenLastCalledWith("project-1", env);
    expect((await get("db/rows?table=items")).status).toBe(200);
    expect(dbModule.listProjectRows).toHaveBeenLastCalledWith("project-1", expect.objectContaining({ table: "items" }), env);
    expect((await post("db/rows", { table: "items", values: { id: 1 } })).status).toBe(200);
    expect(dbModule.createProjectRow).toHaveBeenLastCalledWith("project-1", "items", { id: 1 }, env);
    expect((await post("db/rows/delete", { table: "items", keys: [1] })).status).toBe(200);
    expect(dbModule.deleteProjectRows).toHaveBeenLastCalledWith("project-1", "items", [1], env);
    expect((await post("db/sql", { sql: "select 1" })).status).toBe(200);
    expect(dbModule.execSql).toHaveBeenLastCalledWith("project-1", "select 1", env);
    const dump = await get("db/export");
    expect(dump.status).toBe(200);
    expect(await dump.text()).toBe("database");
    expect(dbModule.dumpDatabase).toHaveBeenLastCalledWith("project-1", env);
    expect((await get("db/metrics")).status).toBe(200);
    expect(dbModule.projectDbMetrics).toHaveBeenLastCalledWith("project-1", env);
    expect((await get("users")).status).toBe(200);
    expect(authModule.ensureProjectOwner).toHaveBeenLastCalledWith("project-1", env);
    expect(dbModule.listAppUsers).toHaveBeenLastCalledWith("project-1", env);
    expect((await get("emails")).status).toBe(200);
    expect(emailModule.listEmails).toHaveBeenLastCalledWith("project-1", env);
    expect((await get("jobs")).status).toBe(200);
    expect(jobsModule.listJobs).toHaveBeenLastCalledWith("project-1", env);
    expect((await post("jobs/task/run", {})).status).toBe(200);
    expect(jobsModule.runJob).toHaveBeenLastCalledWith("project-1", env, "task", null, "manual");
    const services = await get("service-control");
    expect(services.status).toBe(200);
    expect(await services.json()).toMatchObject({
      services: [{ name: env === "published" ? "live" : "invoices", scalable: env === "preview" }, { name: "monolith" }],
    });
    const logs = await get("logs");
    expect(logs.status).toBe(200);
    expect(eventModule.readLogs).toHaveBeenLastCalledWith("project-1", { env, level: undefined, limit: 300 });
  });
  it.each(["preview", "published"] as const)("creates users without sessions and updates passwords only in %s", async (env) => {
    const root = `/api/projects/project-1/users?env=${env}`;
    const headers = { cookie: "forja_session=valid", "content-type": "application/json" };
    const input = { email: "app@example.test", password: "initial-password", name: "App user" };
    const created = await app.request(root, { method: "POST", headers, body: JSON.stringify({ ...input, role: "admin" }) });
    expect(created.status).toBe(201);
    expect(await created.json()).toEqual({ user: { id: "app-user", email: input.email, name: input.name, role: "user" } });
    expect(created.headers.get("set-cookie")).toBeNull();
    expect(authModule.createAppUser).toHaveBeenLastCalledWith("project-1", input, env);
    const updated = await app.request(`/api/projects/project-1/users/app-user/password?env=${env}`, {
      method: "PATCH", headers, body: JSON.stringify({ password: "replacement-password" }),
    });
    expect(updated.status).toBe(200);
    expect(authModule.updateAppUserPassword).toHaveBeenLastCalledWith("project-1", "app-user", "replacement-password", env);
  });
  it("rejects malformed credentials and unknown environments before administering users", async () => {
    vi.mocked(authModule.createAppUser).mockClear();
    vi.mocked(authModule.updateAppUserPassword).mockClear();
    const headers = { cookie: "forja_session=valid", "content-type": "application/json" };
    for (const body of [null, {}, { email: 1, password: "password" }, { email: "app@example.test", password: 1 }, { email: "app@example.test", password: "password", name: {} }]) {
      expect((await app.request("/api/projects/project-1/users", { method: "POST", headers, body: JSON.stringify(body) })).status).toBe(400);
    }
    expect((await app.request("/api/projects/project-1/users?env=wrong", { method: "POST", headers, body: '{"email":"app@example.test","password":"password"}' })).status).toBe(400);
    for (const body of [null, {}, { password: 1 }]) {
      expect((await app.request("/api/projects/project-1/users/app-user/password", { method: "PATCH", headers, body: JSON.stringify(body) })).status).toBe(400);
    }
    expect((await app.request("/api/projects/project-1/users/app-user/password?env=wrong", { method: "PATCH", headers, body: '{"password":"password"}' })).status).toBe(400);
    expect(authModule.createAppUser).not.toHaveBeenCalled();
    expect(authModule.updateAppUserPassword).not.toHaveBeenCalled();
  });
  it("restricts credential administration to the authenticated project owner", async () => {
    vi.mocked(authModule.createAppUser).mockClear();
    vi.mocked(authModule.updateAppUserPassword).mockClear();
    const headers = { cookie: "forja_session=valid", "content-type": "application/json" };
    for (const [resource, method] of [["users", "POST"], ["users/app-user/password", "PATCH"]]) {
      const request = { method, headers, body: '{"email":"app@example.test","password":"password"}' };
      expect((await app.request(`/api/projects/project-1/${resource}`, { ...request, headers: { "content-type": "application/json" } })).status).toBe(401);
      vi.mocked(collaboration.accessOf).mockResolvedValueOnce(null);
      expect((await app.request(`/api/projects/project-1/${resource}`, request)).status).toBe(404);
      vi.mocked(collaboration.accessOf).mockResolvedValueOnce("editor");
      expect((await app.request(`/api/projects/project-1/${resource}`, request)).status).toBe(403);
    }
    expect(authModule.createAppUser).not.toHaveBeenCalled();
    expect(authModule.updateAppUserPassword).not.toHaveBeenCalled();
  });
  it("preserves duplicate-user and missing-user errors from credential administration", async () => {
    const headers = { cookie: "forja_session=valid", "content-type": "application/json" };
    vi.mocked(authModule.createAppUser).mockRejectedValueOnce(new authModule.AuthError("Ya existe esa cuenta.", 409));
    const duplicate = await app.request("/api/projects/project-1/users", { method: "POST", headers, body: '{"email":"app@example.test","password":"password"}' });
    expect(duplicate.status).toBe(409);
    expect(await duplicate.json()).toEqual({ error: "Ya existe esa cuenta." });
    vi.mocked(authModule.updateAppUserPassword).mockRejectedValueOnce(new authModule.AuthError("No existe ese usuario.", 404));
    expect((await app.request("/api/projects/project-1/users/missing/password", { method: "PATCH", headers, body: '{"password":"password"}' })).status).toBe(404);
  });
  it("rejects unknown environments and prevents editing the production manifest", async () => {
    const headers = { cookie: "forja_session=valid", "content-type": "application/json" };
    expect((await app.request("/api/projects/project-1/users?env=production", { headers })).status).toBe(400);
    vi.mocked(projects.writeFile).mockClear();
    expect((await app.request("/api/projects/project-1/service-control/live?env=published", {
      method: "PATCH", headers, body: '{"replicas":2}',
    })).status).toBe(400);
    expect(projects.writeFile).not.toHaveBeenCalled();
  });
  it("authenticates project service reads and validates persistent scaling and targeted restarts", async () => {
    const url = "/api/projects/project-1/service-control";
    expect((await app.request(url)).status).toBe(401);
    const headers = { cookie: "forja_session=valid", "content-type": "application/json" };
    const response = await app.request(url, { headers });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ services: [{ name: "invoices" }, { name: "monolith" }] });
    vi.mocked(projects.writeFile).mockClear();
    const update = await app.request(`${url}/invoices`, { method: "PATCH", headers, body: '{"replicas":2}' });
    expect(update.status).toBe(200);
    expect(projects.writeFile).toHaveBeenCalledWith("project-1", "forja.services.json", expect.stringContaining('"replicas": 2'), "owner", "owner@example.com");
    const invalid = await app.request(`${url}/invoices`, { method: "PATCH", headers, body: '{"replicas":99}' });
    expect(invalid.status).toBe(400);
    expect(projects.writeFile).toHaveBeenCalledTimes(1);
    const restart = await app.request(`${url}/invoices/restart`, { method: "POST", headers, body: '{"env":"preview"}' });
    expect(restart.status).toBe(200);
    expect(mocks.restartSandboxService).toHaveBeenCalledWith("project-1", "invoices", "preview");
  });
  it("denies service control reads and writes without project membership", async () => {
    vi.mocked(collaboration.accessOf).mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    const headers = { cookie: "forja_session=valid", "content-type": "application/json" };
    expect((await app.request("/api/projects/project-1/service-control", { headers })).status).toBe(404);
    expect((await app.request("/api/projects/project-1/service-control/invoices", { method: "PATCH", headers, body: '{"replicas":2}' })).status).toBe(404);
  });
  it("forwards optional starter selection and rejects unknown values before creation", async () => {
    const createProject = vi.mocked(projects.createProject);
    createProject.mockClear();
    const headers = { cookie: "forja_session=valid", "content-type": "application/json" };
    for (const template of [undefined, "orders-invoices"]) {
      const response = await app.request("/api/projects", {
        method: "POST", headers, body: JSON.stringify({ prompt: "Orders demo", template }),
      });
      expect(response.status).toBe(200);
      expect(createProject).toHaveBeenLastCalledWith("account-1", "Orders demo", "Orders demo", undefined, undefined, template);
    }
    for (const template of ["typo", null, {}, 1]) {
      const response = await app.request("/api/projects", {
        method: "POST", headers, body: JSON.stringify({ prompt: "Orders demo", template }),
      });
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: expect.stringMatching(/template/i) });
    }
    expect(createProject).toHaveBeenCalledTimes(2);
  });
  it("requires a signed-in account for studio endpoints", async () => {
    const response = await app.request("/api/me");
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "No has iniciado sesión" });
  });

  it("rejects cross-origin writes and non-JSON request bodies before authentication", async () => {
    const crossOrigin = await app.request("/api/auth/logout", {
      method: "POST",
      headers: { origin: "https://attacker.example", host: "studio.example" },
    });
    expect(crossOrigin.status).toBe(403);

    const nonJson = await app.request("/api/auth/logout", {
      method: "POST",
      headers: { "content-type": "text/plain", "content-length": "3" },
      body: "bad",
    });
    expect(nonJson.status).toBe(415);
  });

  it("keeps admin endpoints restricted to platform administrators", async () => {
    const response = await app.request("/api/admin/settings", { headers: { cookie: "forja_session=valid" } });
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Solo administradores de la plataforma." });
  });

  it("mounts project file, database, and email routes under the API prefix", async () => {
    const headers = { cookie: "forja_session=valid" };
    const read = await app.request("/api/projects/project-1/file?path=pages/home.tsx", { headers });
    expect(read.status).toBe(200);
    expect(await read.json()).toEqual({ content: "existing content" });

    const write = await app.request("/api/projects/project-1/file", {
      method: "PUT",
      headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify({ path: "pages/home.tsx", content: "updated content" }),
    });

    expect(write.status).toBe(200);

    const sql = await app.request("/api/projects/project-1/db/sql", {
      method: "POST",
      headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify({ sql: "select 1" }),
    });
    expect(sql.status).toBe(200);
    expect(await sql.json()).toEqual({ results: [{ n: 1 }] });

    const emails = await app.request("/api/projects/project-1/emails", { headers });
    expect(emails.status).toBe(200);
    expect(await emails.json()).toEqual({ emails: [{ id: "email-1" }] });
  });

  it("delegates builder chat to the configured worker and preserves its SSE stream", async () => {
    const worker = {
      status: vi.fn(async () => ({ building: false })),
      turn: vi.fn(async () => new Response('data: {"type":"text","text":"worker"}\n\n', {
        headers: { "content-type": "text/event-stream" },
      })),
    };
    const api = new Hono().route("/api", createStudioApi(
      { identity, projects, knowledge, collaboration, settings, models },
      worker as unknown as BuilderServiceClient,
    ));

    const response = await api.request("/api/projects/project-1/chat", {
      method: "POST",
      headers: { cookie: "forja_session=valid", "content-type": "application/json" },
      body: JSON.stringify({ message: "Build this project" }),
    });

    expect(worker.status).toHaveBeenCalledWith("project-1");
    expect(worker.turn).toHaveBeenCalledWith(expect.objectContaining({
      projectId: "project-1",
      userText: "Build this project",
      mode: "build",
    }));
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    expect(await response.text()).toContain('"text":"worker"');
  });

  it("streams project events as SSE and closes the stream when the client disconnects", async () => {
    const response = await app.request("/api/projects/project-1/events", { headers: { cookie: "forja_session=valid" } });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");

    const reader = response.body!.getReader();
    const next = reader.read();
    const events = eventModule.projectEvents as EventEmitter;
    expect(events.listenerCount("project-1")).toBe(1);
    events.emit("project-1", { type: "change", path: "pages/home.tsx" });
    const chunk = await next;
    expect(new TextDecoder().decode(chunk.value)).toContain('data: {"type":"change","path":"pages/home.tsx"}');
    await reader.cancel();
    expect(events.listenerCount("project-1")).toBe(0);
  });
});
