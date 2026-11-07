import { describe, expect, it, vi } from "vitest";
import type { CollaborationModule } from "../../../server/modules/collaboration/index.js";
import type { IdentityModule, PublicAccount } from "../../../server/modules/identity/index.js";
import type { ProjectsModule } from "../../../server/modules/projects/index.js";
import { createMcpHandler } from "../../../server/bootstrap/mcp/server.js";
import { BuilderServiceClient } from "../../../server/modules/builder/infrastructure/builderServiceClient.js";

vi.mock("../../../server/modules/memory/memory.js", async (importOriginal) => ({
  ...await importOriginal<typeof import("../../../server/modules/memory/memory.js")>(),
  memorySection: vi.fn(async () => "## Memoria\nPreferir navegación accesible."),
}));
vi.mock("../../../server/modules/usage/usage.js", async (importOriginal) => ({
  ...await importOriginal<typeof import("../../../server/modules/usage/usage.js")>(),
  countAction: vi.fn(async () => {}),
}));
vi.mock("../../../server/modules/builder/infrastructure/metrics.js", async (importOriginal) => ({
  ...await importOriginal<typeof import("../../../server/modules/builder/infrastructure/metrics.js")>(),
  recordToolCall: vi.fn(),
}));

const account: PublicAccount = { id: "account-1", email: "owner@example.com", platformRole: "user", tokenOrgId: null, name: "Owner", credits: 0 };
const identity = {
  accountFromApiToken: vi.fn(async (token?: string) => (token === "test-token" ? account : null)),
} as unknown as IdentityModule;
const projects = {} as ProjectsModule;
const collaboration = {} as CollaborationModule;
const handleMcp = createMcpHandler({ identity, projects, collaboration });

const request = (id: number, method: string, params: Record<string, unknown> = {}) =>
  new Request("http://localhost/mcp", {
    method: "POST",
    headers: {
      authorization: "Bearer test-token",
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });

describe("MCP HTTP transport", () => {
  it("requires a valid bearer token", async () => {
    const response = await handleMcp(new Request("http://localhost/mcp", { method: "POST" }));
    expect(response.status).toBe(401);
  });

  it("serves the tool registry through the stateless streamable HTTP protocol", async () => {
    const response = await handleMcp(request(1, "tools/list"));

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.jsonrpc).toBe("2.0");
    expect(result.result.tools).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "list_projects", annotations: expect.objectContaining({ readOnlyHint: true }) }),
        expect.objectContaining({ name: "get_job_status" }),
        expect.objectContaining({ name: "write_file", annotations: expect.objectContaining({ readOnlyHint: false }) }),
      ]),
    );
  });

  it("dispatches a tool call and returns its result using MCP content blocks", async () => {
    const response = await handleMcp(request(2, "tools/call", { name: "get_guides", arguments: { topic: "forja-overview" } }));

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.result.isError).toBe(false);
    expect(result.result.content[0].type).toBe("text");
    expect(result.result.content[0].text).toContain("# Project structure");
  });

  it("advertises the brain as the context entry point instead of the file map", async () => {
    const initialized = await handleMcp(request(3, "initialize", {
      protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "test", version: "1" },
    }));
    const { result: initialization } = await initialized.json();
    expect(initialization.instructions).toContain("PRIMERA llamada");
    expect(initialization.instructions.indexOf("PRIMERA llamada")).toBeLessThan(initialization.instructions.indexOf("Un proyecto SOLO"));
    expect(initialization.instructions).toContain("No preguntes al dueño por la estructura del proyecto");

    const response = await handleMcp(request(4, "tools/list"));
    const { result } = await response.json();
    for (const name of ["question", "project_map", "list_files"]) {
      const tool = result.tools.find((entry: { name: string }) => entry.name === name);
      expect(tool.description).toMatch(/PRIMERA herramienta|Consulta question primero/);
      expect(tool.description).not.toContain("Empieza por aquí");
    }
  });

  it("returns knowledge, owner context and version without requiring a file-map call", async () => {
    const project = { id: "project-1", name: "Mi app", description: "", profile: {}, systemPrompt: "Usar español." };
    const scopedProjects = {
      getProject: vi.fn(async () => project),
      projectVersion: vi.fn(async () => 7),
    } as unknown as ProjectsModule;
    const scopedCollaboration = { accessOf: vi.fn(async () => "owner") } as unknown as CollaborationModule;
    const client = new BuilderServiceClient("http://unused", "test");
    const tool = vi.spyOn(client, "tool").mockResolvedValue({
      output: JSON.stringify({ evidence: "NODE Login", sources: [{ path: "pages/login.tsx", startLine: 1 }] }),
    });
    const handler = createMcpHandler({ identity, projects: scopedProjects, collaboration: scopedCollaboration }, client);
    const response = await handler(request(5, "tools/call", {
      name: "question", arguments: { projectId: project.id, query: "Corregir el login en móviles" },
    }));
    const { result } = await response.json();
    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain("NODE Login");
    expect(result.content[0].text).toContain("Versión del proyecto: 7");
    expect(result.content[0].text).toContain("<project-context>");
    expect(result.content[0].text).toContain("Usar español.");
    expect(result.content[0].text).toContain("Preferir navegación accesible.");
    expect(tool).toHaveBeenCalledExactlyOnceWith("question",
      { projectId: project.id, query: "Corregir el login en móviles" },
      { account, projectId: project.id, author: "mcp" }, false);
  });

  it("keeps knowledge calls inside the token's project scope", async () => {
    const scopedProjects = { getProject: vi.fn(async () => ({ id: "other-project" })) } as unknown as ProjectsModule;
    const scopedCollaboration = { accessOf: vi.fn(async () => "owner") } as unknown as CollaborationModule;
    const client = new BuilderServiceClient("http://unused", "test");
    const tool = vi.spyOn(client, "tool");
    const handler = createMcpHandler({ identity, projects: scopedProjects, collaboration: scopedCollaboration }, client);
    const response = await handler(request(6, "tools/call", {
      name: "question", arguments: { projectId: "other-project", query: "Login" },
    }), { ...account, tokenProjectId: "allowed-project" });
    const { result } = await response.json();
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Proyecto no encontrado");
    expect(tool).not.toHaveBeenCalled();
  });

  it("starts a newly created project's context with question, not project_map", async () => {
    const scopedProjects = {
      createProject: vi.fn(async () => ({ id: "new-project", name: "Agenda" })),
      updateProject: vi.fn(async () => {}),
    } as unknown as ProjectsModule;
    const handler = createMcpHandler({ identity, projects: scopedProjects, collaboration });
    const response = await handler(request(7, "tools/call", {
      name: "create_project", arguments: { name: "Agenda", initial_prompt: "Una agenda" },
    }));
    const { result } = await response.json();
    expect(result.isError).toBe(false);
    const steps = result.content[0].text.split("Siguientes pasos:")[1];
    expect(steps).toContain("question");
    expect(steps).toContain("get_guides");
    expect(steps).toContain("project_map");
    expect(steps.indexOf("question")).toBeLessThan(steps.indexOf("get_guides"));
    expect(steps.indexOf("question")).toBeLessThan(steps.indexOf("project_map"));
    expect(steps).toContain("solo si necesitas localizar archivos");
  });
});
