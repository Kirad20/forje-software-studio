import { describe, expect, it, vi } from "vitest";
import { createAdminMcpHandler } from "../../../server/bootstrap/mcp/adminServer.js";

const admin = { id: "admin", email: "admin@example.test", platformRole: "admin" as const, tokenOrgId: null, name: "Admin", credits: 0 };
const model = {
  id: "gateway:claude", provider: "gateway", model: "claude", label: "Claude",
  inPrice: 1, outPrice: 2, cacheReadPrice: 0, context: 128000, tools: true, vision: true,
  tier: 4, speed: 3, source: "custom" as const, enabled: true, available: true, allowed: true,
};
function setup() {
  const identity = {
    accountFromAdminApiToken: vi.fn(async (token?: string) => token === "admin-token" ? admin : null),
    getAccount: vi.fn(async () => ({ ...admin, id: "owner" })),
  };
  const settings = {
    listSettings: vi.fn(async () => [
      { key: "models.allow", type: "list", default: ["*"], value: ["custom:*"], isDefault: false },
      { key: "email.smtp", type: "secret", default: "must-not-leak", value: "must-not-leak", isDefault: false, secret: { set: true, hint: "must-not-leak", broken: false } },
    ]),
    updateSettings: vi.fn(async () => ["models.allow"]), resetSetting: vi.fn(async () => {}),
    audit: vi.fn(async () => {}),
  };
  const projects = { getProject: vi.fn(async () => ({ id: "project", ownerId: "owner" })) };
  const models = {
    providers: {
      listProviders: vi.fn(async () => [{
        id: "gateway", label: "Gateway", kind: "openai", enabled: true, available: true,
        keyHint: "must-not-leak", headerNames: ["secret-header"], keySet: true,
      }]),
      saveProvider: vi.fn(async () => {}),
    },
    catalog: {
      listCatalog: vi.fn(async () => [model]),
      modelReadiness: vi.fn(async () => [{ ...model, blockers: ["No permitido en tu cuenta"] }]),
      allowedModels: vi.fn(async () => []),
      saveModel: vi.fn(async () => model.id),
      setAccountModels: vi.fn(async () => {}),
      setProjectModels: vi.fn(async () => {}),
    },
    management: { routerStats: vi.fn(async () => ({ classes: [], decisions: [] })) },
  };
  // Each fake implements only the public methods used by this transport.
  const handle = createAdminMcpHandler({ identity, settings, projects, models } as unknown as Parameters<typeof createAdminMcpHandler>[0]);
  return { handle, identity, settings, projects, models };
}
function request(method: string, params: Record<string, unknown> = {}, token = "admin-token") {
  return new Request("http://localhost/admin/mcp", {
    method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
}
async function call(handle: ReturnType<typeof createAdminMcpHandler>, name: string, args: Record<string, unknown> = {}) {
  const response = await handle(request("tools/call", { name, arguments: args }));
  expect(response.status).toBe(200);
  return (await response.json()).result;
}
describe("administrative MCP transport", () => {
  it("requires an administrative token and never accepts cookies or project tokens", async () => {
    const { handle } = setup();
    expect((await handle(new Request("http://localhost/admin/mcp", { method: "POST", headers: { cookie: "session=admin" } }))).status).toBe(401);
    expect((await handle(request("tools/list", {}, "project-token"))).status).toBe(401);
  });
  it("checks administrator status for every request, including tools/list", async () => {
    const { handle, identity } = setup();
    expect((await handle(request("tools/list"))).status).toBe(200);
    identity.accountFromAdminApiToken.mockResolvedValueOnce({ ...admin, platformRole: "user" } as never);
    expect((await handle(request("tools/list"))).status).toBe(403);
    identity.accountFromAdminApiToken.mockResolvedValueOnce(null);
    expect((await handle(request("tools/list"))).status).toBe(401);
  });
  it("exposes only bounded platform tools and marks configuration changes destructive", async () => {
    const { handle } = setup();
    const result = await (await handle(request("tools/list"))).json();
    const tools = result.result.tools;
    expect(tools).toContainEqual(expect.objectContaining({ name: "diagnose_model_access", annotations: expect.objectContaining({ readOnlyHint: true }) }));
    expect(tools).toContainEqual(expect.objectContaining({ name: "update_settings", annotations: expect.objectContaining({ destructiveHint: true, readOnlyHint: false }) }));
    expect(tools.some((t: { name: string }) => ["execute_sql", "write_file", "create_project", "request_secret"].includes(t.name))).toBe(false);
    expect((await call(handle, "execute_sql", { sql: "select 1" })).isError).toBe(true);
  });
  it("initializes as a separate administration server with no project construction tools", async () => {
    const { handle } = setup();
    const response = await handle(request("initialize", {
      protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "test", version: "1" },
    }));
    expect(response.status).toBe(200);
    const data = (await response.json()).result;
    expect(data.serverInfo.name).toBe("forja-admin");
    expect(data.instructions).toContain("No construye aplicaciones");
    expect(data.capabilities).toMatchObject({ tools: {} });
  });
  it("never exposes secret hints, keys or header names", async () => {
    const { handle } = setup();
    const list = await call(handle, "list_settings");
    expect(JSON.stringify(list)).not.toContain("must-not-leak");
    expect(JSON.parse(list.content[0].text).settings[1].secret).toEqual({ set: true, broken: false });
    const providers = await call(handle, "list_providers");
    expect(JSON.stringify(providers)).not.toContain("must-not-leak");
    expect(JSON.stringify(providers)).not.toContain("secret-header");
  });
  it("uses project owner scope to explain empty effective models instead of the current admin", async () => {
    const { handle, models } = setup();
    const result = await call(handle, "diagnose_model_access", { projectId: "project" });
    expect(result.isError).toBe(false);
    expect(models.catalog.modelReadiness).toHaveBeenCalledWith({ accountId: "owner", projectId: "project" });
    expect(JSON.parse(result.content[0].text)).toMatchObject({ scope: { accountId: "owner", projectId: "project" }, allowedModelIds: [], usesProjectOwner: true });
    expect((await call(handle, "diagnose_model_access", { projectId: "project", accountId: "admin" })).isError).toBe(true);
  });
  it("validates non-secret settings and audits through existing actor-aware operations", async () => {
    const { handle, settings } = setup();
    expect((await call(handle, "update_settings", { patch: { "models.allow": ["custom:*"] } })).isError).toBe(false);
    expect(settings.updateSettings).toHaveBeenCalledWith({ "models.allow": ["custom:*"] }, "admin");
    expect((await call(handle, "update_settings", { patch: { "email.smtp": "credential" } })).isError).toBe(true);
    expect((await call(handle, "reset_setting", { key: "email.smtp" })).isError).toBe(true);
    expect((await call(handle, "update_settings", { patch: { unknown: true } })).isError).toBe(true);
    expect(settings.updateSettings).toHaveBeenCalledTimes(1);
    expect(settings.resetSetting).not.toHaveBeenCalled();
  });
  it("cannot smuggle provider credentials or out-of-range model values in updates", async () => {
    const { handle, models } = setup();
    expect((await call(handle, "update_provider", { providerId: "gateway", patch: { apiKey: "secret", enabled: true } })).isError).toBe(true);
    expect(models.providers.saveProvider).not.toHaveBeenCalled();
    expect((await call(handle, "update_model", { modelId: model.id, patch: { context: -1 } })).isError).toBe(true);
    expect(models.catalog.saveModel).not.toHaveBeenCalled();
    expect((await call(handle, "update_model", { modelId: model.id, patch: { tools: false } })).isError).toBe(false);
    expect(models.catalog.saveModel).toHaveBeenCalledWith({ provider: "gateway", model: "claude", tools: false }, "admin");
    const profile = { reasoning: 4, coding: 4.5, debugging: 3, toolUse: 4, confidence: 0.8, source: "classification" };
    expect((await call(handle, "update_model", {
      modelId: model.id, patch: { capabilities: profile, reasoningEffort: true },
    })).isError).toBe(false);
    expect(models.catalog.saveModel).toHaveBeenLastCalledWith({
      provider: "gateway", model: "claude", capabilities: profile, reasoningEffort: true,
    }, "admin");
    expect((await call(handle, "update_model", {
      modelId: model.id, patch: { capabilities: { ...profile, coding: 5.1 } },
    })).isError).toBe(true);
  });
  it("changes account/project allowlists only for existing entities and model IDs and records actor", async () => {
    const { handle, settings, models } = setup();
    expect((await call(handle, "set_account_models", { accountId: "owner", enabled: null })).isError).toBe(false);
    expect(models.catalog.setAccountModels).toHaveBeenCalledWith("owner", null);
    expect(settings.audit).toHaveBeenCalledWith("mcp:account-models:owner", "admin", "set");
    expect((await call(handle, "set_project_models", { projectId: "project", enabled: [] })).isError).toBe(false);
    expect(models.catalog.setProjectModels).toHaveBeenCalledWith("project", []);
    expect(settings.audit).toHaveBeenCalledWith("mcp:project-models:project", "admin", "set");
    expect((await call(handle, "set_account_models", { accountId: "owner", enabled: ["unknown:model"] })).isError).toBe(true);
    expect(models.catalog.setAccountModels).toHaveBeenCalledTimes(1);
  });
});
