import { EventEmitter } from "node:events";
import { Hono } from "hono";
import { describe, expect, it, vi } from "vitest";
import type { CollaborationModule } from "../../../server/modules/collaboration/index.js";
import type { IdentityModule } from "../../../server/modules/identity/index.js";
import type { ProjectsModule } from "../../../server/modules/projects/index.js";
import type { SettingsModule } from "../../../server/modules/settings/index.js";
import { createStudioApi } from "../../../server/bootstrap/http/studioApi.js";

const mocks = vi.hoisted(() => ({ watchProblems: vi.fn() }));

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
  getProject: vi.fn(async () => ({ id: "project-1", ownerId: "account-1" })),
  readFile: vi.fn(async () => "existing content"),
  writeFile: vi.fn(async () => undefined),
} as unknown as ProjectsModule;
const collaboration = { accessOf: vi.fn(async () => "owner") } as unknown as CollaborationModule;
const settings = {} as SettingsModule;
const models = {} as ReturnType<typeof import("../../../server/modules/model-management/index.js").createPlatformModelManagement>;
const studioApi = createStudioApi({ identity, projects, collaboration, settings, models });
const app = new Hono().route("/api", studioApi);
const eventModule = await import("../../../server/modules/project-observability/events.js");

describe("HTTP transport contract", () => {
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
