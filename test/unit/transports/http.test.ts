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
}));

vi.mock("../../../server/modules/app-services/projectDb.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../server/modules/app-services/projectDb.js")>();
  return { ...actual, execSql: vi.fn(async () => [{ n: 1 }]) };
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
  getProject: vi.fn(async () => ({ id: "project-1", ownerId: "account-1" })),
  readFile: vi.fn(async () => "existing content"),
  readAllFiles: vi.fn(async () => ({
    "jobs/invoices.ts": "",
    "forja.services.json": '{"version":1,"services":{"invoices":{"kind":"worker","jobs":["jobs/invoices.ts"],"replicas":1}}}',
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

describe("HTTP transport contract", () => {
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
