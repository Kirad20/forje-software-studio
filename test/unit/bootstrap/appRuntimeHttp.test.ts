import { expect, it, vi } from "vitest";
import { createAppRuntimeHttpApp } from "../../../server/bootstrap/appRuntimeHttp.js";
import type { AppTarget } from "../../../server/modules/app-runtime/index.js";
import type { Project } from "../../../server/modules/projects/index.js";

const project: Project = {
  id: "p1",
  ownerId: "owner",
  orgId: null,
  name: "App",
  runtime: "native",
  description: "",
  slug: null,
  visibility: "private",
  aiEnabled: false,
  emailDomain: null,
  emailDomainVerified: false,
  publishedVersionId: null,
  publishedAt: null,
  favorite: false,
  archived: false,
  folderId: null,
  lastOpenedAt: "",
  systemPrompt: "",
  designPrompt: "",
  seo: {},
  profile: null,
  shareEpoch: 1,
  createdAt: "",
  updatedAt: "",
};

function runtimePorts() {
  const serveApp = vi.fn(async (_request: Request, _target: AppTarget, _rest: string) => new Response("app response"));
  return {
    getProject: vi.fn(async () => project),
    getProjectBySlug: vi.fn(async () => project),
    parseAppHost: vi.fn((host?: string) =>
      host?.startsWith("pv-") ? { kind: "preview" as const, projectId: "p1" } : null,
    ),
    checkShareToken: vi.fn((_target: Project, token: string | null) => token === "valid"),
    cookie: vi.fn(() => "forja_share=valid"),
    internalToken: "runtime-token",
    emitProject: vi.fn(),
    reloadSettings: vi.fn(async () => {}),
    serveApp,
    getSandboxServices: vi.fn(() => [{ env: "preview" as const, service: "orders", replicas: [{ pid: 123, active: 1, ready: true }] }]),
    restartSandboxService: vi.fn(),
  };
}

it("authenticates runtime service snapshots and targeted restart, validates names and environments", async () => {
  const ports = runtimePorts();
  const app = createAppRuntimeHttpApp(ports);
  const root = "http://app-runtime:4200/internal/runtime/service-control";
  expect((await app.request(`${root}/snapshot`, { method: "POST", body: '{"projectId":"p1"}' })).status).toBe(401);
  expect((await app.request(`${root}/restart`, { method: "POST", body: '{"projectId":"p1","service":"orders"}' })).status).toBe(401);
  const headers = { authorization: `Bearer ${ports.internalToken}`, "content-type": "application/json" };
  const snapshot = await app.request(`${root}/snapshot`, { method: "POST", headers, body: '{"projectId":"p1"}' });
  expect(snapshot.status).toBe(200);
  expect(await snapshot.json()).toMatchObject({ available: true, scope: "app-runtime", services: [{ service: "orders" }] });
  const restart = await app.request(`${root}/restart`, { method: "POST", headers, body: '{"projectId":"p1","service":"orders","env":"preview"}' });
  expect(restart.status).toBe(200);
  expect(ports.restartSandboxService).toHaveBeenCalledWith("p1", "orders", "preview");
  for (const body of ['{"projectId":"p1","service":"../orders"}', '{"projectId":"p1","service":"orders","env":"other"}', '{']) {
    expect((await app.request(`${root}/restart`, { method: "POST", headers, body })).status).toBe(400);
  }
  expect(ports.restartSandboxService).toHaveBeenCalledTimes(1);
});

it("requires a valid share token for a private app", async () => {
  const ports = runtimePorts();
  const app = createAppRuntimeHttpApp(ports);
  const response = await app.request("http://pv-p1.localhost:4200/", {
    headers: { host: "pv-p1.localhost:4200" },
  });

  expect(response.status).toBe(403);
  expect(ports.serveApp).not.toHaveBeenCalled();
});

it("trades a valid link token for the app cookie and removes it from the URL", async () => {
  const ports = runtimePorts();
  const app = createAppRuntimeHttpApp(ports);
  const response = await app.request("http://pv-p1.localhost:4200/page?share=valid&tab=1", {
    headers: { host: "pv-p1.localhost:4200" },
  });

  expect(response.status).toBe(302);
  expect(response.headers.get("location")).toBe("/page?tab=1");
  expect(response.headers.get("set-cookie")).toBe("forja_share=valid");
  expect(ports.cookie).toHaveBeenCalledWith("forja_share", "valid", "/", 2_592_000, "preview");
  expect(ports.serveApp).not.toHaveBeenCalled();
});

it("serves authorized preview requests through the app runtime", async () => {
  const ports = runtimePorts();
  const app = createAppRuntimeHttpApp(ports);
  const response = await app.request("http://pv-p1.localhost:4200/_api/items", {
    headers: { host: "pv-p1.localhost:4200", cookie: "forja_share=valid" },
  });

  expect(response.status).toBe(200);
  expect(ports.serveApp).toHaveBeenCalledOnce();
  expect(ports.serveApp.mock.calls[0]?.[0]).toBeInstanceOf(Request);
  expect(ports.serveApp.mock.calls[0]?.[1]).toMatchObject({ project, env: "preview", base: "" });
  expect(ports.serveApp.mock.calls[0]?.[2]).toBe("/_api/items");
});

it("authenticates internal endpoint execution and returns the runtime response", async () => {
  const ports = runtimePorts();
  ports.serveApp.mockResolvedValue(new Response("created", { status: 201, headers: { "content-type": "text/plain" } }));
  const app = createAppRuntimeHttpApp(ports);
  const denied = await app.request("http://app-runtime:4200/internal/runtime/call-endpoint", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ projectId: "p1", method: "GET", route: "items" }),
  });
  expect(denied.status).toBe(401);

  const response = await app.request("http://app-runtime:4200/internal/runtime/call-endpoint", {
    method: "POST",
    headers: { authorization: "Bearer runtime-token", "content-type": "application/json" },
    body: JSON.stringify({ projectId: "p1", method: "GET", route: "items", query: { page: "2" }, cookie: "forja_session=token" }),
  });

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ status: 201, body: "created", contentType: "text/plain" });
  const [request, target, rest] = ports.serveApp.mock.calls[0]!;
  expect(request.url).toBe("http://app-runtime/_api/items?page=2");
  expect(request.headers.get("cookie")).toBe("forja_session=token");
  expect(target).toMatchObject({ project, env: "preview" });
  expect(rest).toBe("/_api/items");
});

it("authenticates and relays project file events to the runtime", async () => {
  const ports = runtimePorts();
  const app = createAppRuntimeHttpApp(ports);
  const denied = await app.request("http://app-runtime:4200/internal/runtime/project-event", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ projectId: "p1", event: { type: "files", paths: ["pages/home.tsx"] } }),
  });

  expect(denied.status).toBe(401);

  const response = await app.request("http://app-runtime:4200/internal/runtime/project-event", {
    method: "POST",
    headers: { authorization: "Bearer runtime-token", "content-type": "application/json" },
    body: JSON.stringify({ projectId: "p1", event: { type: "files", paths: ["pages/home.tsx"] } }),
  });

  expect(response.status).toBe(200);
  expect(ports.emitProject).toHaveBeenCalledWith("p1", { type: "files", paths: ["pages/home.tsx"] });
});

it("reloads runtime configuration only through the authenticated internal API", async () => {
  const ports = runtimePorts();
  const app = createAppRuntimeHttpApp(ports);
  const denied = await app.request("http://app-runtime:4200/internal/runtime/reload", { method: "POST" });
  expect(denied.status).toBe(401);

  const response = await app.request("http://app-runtime:4200/internal/runtime/reload", {
    method: "POST",
    headers: { authorization: "Bearer runtime-token" },
  });

  expect(response.status).toBe(200);
  expect(ports.reloadSettings).toHaveBeenCalledOnce();
});
