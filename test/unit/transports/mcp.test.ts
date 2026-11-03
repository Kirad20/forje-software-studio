import { describe, expect, it, vi } from "vitest";
import type { CollaborationModule } from "../../../server/modules/collaboration/index.js";
import type { IdentityModule } from "../../../server/modules/identity/index.js";
import type { ProjectsModule } from "../../../server/modules/projects/index.js";
import { createMcpHandler } from "../../../server/bootstrap/mcp/server.js";

const account = { id: "account-1", email: "owner@example.com", platformRole: "user", tokenOrgId: null, name: "Owner", credits: 0 };
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
});
