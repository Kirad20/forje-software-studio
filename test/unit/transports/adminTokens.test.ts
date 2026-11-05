import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminApi } from "../../../server/bootstrap/http/adminApi.js";
import { IdentityAccountsService, type IdentityAccountsDependencies, type IdentityModule } from "../../../server/modules/identity/index.js";
import type { AdministrationEnv } from "../../../server/modules/administration/index.js";

describe("admin API token HTTP routes", () => {
  let app: Hono<AdministrationEnv>;
  let actorRole: "admin" | "user";
  let access: { platformRole: "admin" | "user"; disabled: boolean };
  let tokens: { create: ReturnType<typeof vi.fn>; listAdmin: ReturnType<typeof vi.fn>; revokeAdmin: ReturnType<typeof vi.fn> };
  let audit: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    actorRole = "admin";
    access = { platformRole: "admin", disabled: false };
    tokens = {
      create: vi.fn().mockResolvedValue(undefined),
      listAdmin: vi.fn().mockResolvedValue([{ id: "token-id", name: "Diagnostics", purpose: "admin", expiresAt: new Date(Date.now() + 86_400_000), revokedAt: null }]),
      revokeAdmin: vi.fn().mockResolvedValue(true),
    };
    audit = vi.fn().mockResolvedValue(undefined);
    const service = new IdentityAccountsService({
      accounts: { getAccountAccess: async () => access },
      tokens, audit,
      random: { id: () => "token-id", token: () => "secret", hash: (value: string) => `hash:${value}` },
    } as unknown as IdentityAccountsDependencies);
    const identity = {
      createAdminApiToken: service.createAdminApiToken.bind(service),
      listAdminApiTokens: service.listAdminApiTokens.bind(service),
      revokeAdminApiToken: service.revokeAdminApiToken.bind(service),
    } as unknown as IdentityModule;
    app = new Hono<AdministrationEnv>();
    app.use("*", async (c, next) => {
      c.set("account", { id: "actor", email: "admin@example.test", name: null, credits: 0, platformRole: actorRole });
      await next();
    });
    app.route("/api/admin", createAdminApi({
      identity, settings: {} as never, models: {} as never, projects: {} as never, collaboration: {} as never,
    }));
  });
  const create = (app: Hono<AdministrationEnv>, body: unknown) => app.request("/api/admin/tokens", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });

  it("returns the new secret once, never caches it, and lists only metadata", async () => {
    const result = await create(app, { name: "Diagnostics" });
    expect(result.status).toBe(201);
    expect(result.headers.get("cache-control")).toBe("no-store");
    expect(await result.json()).toMatchObject({ id: "token-id", token: "fj_admin_secret" });
    expect(tokens.create).toHaveBeenCalledWith("token-id", "actor", "Diagnostics", "hash:fj_admin_secret", null, "admin", expect.any(Date));
    const listed = await app.request("/api/admin/tokens");
    expect(listed.status).toBe(200);
    expect(listed.headers.get("cache-control")).toBe("no-store");
    expect(await listed.text()).not.toContain("secret");
    expect(tokens.listAdmin).toHaveBeenCalledWith("actor");
    expect(JSON.stringify(audit.mock.calls)).not.toContain("secret");
  });

  it("rejects users and accounts demoted or disabled since authentication", async () => {
    for (const state of [
      { role: "user" as const, access: { platformRole: "user" as const, disabled: false } },
      { role: "admin" as const, access: { platformRole: "user" as const, disabled: false } },
      { role: "admin" as const, access: { platformRole: "admin" as const, disabled: true } },
    ]) {
      actorRole = state.role;
      access = state.access;
      expect((await create(app, { name: "Diagnostics" })).status).toBe(403);
      expect((await app.request("/api/admin/tokens")).status).toBe(403);
      expect((await app.request("/api/admin/tokens/token-id", { method: "DELETE" })).status).toBe(403);
    }
    expect(tokens.create).not.toHaveBeenCalled();
    expect(tokens.listAdmin).not.toHaveBeenCalled();
    expect(tokens.revokeAdmin).not.toHaveBeenCalled();
  });

  it.each([
    {}, { name: "" }, { name: "x".repeat(101) }, { name: 9 }, { name: "Diagnostics", expiresAt: null },
    { name: "Diagnostics", expiresAt: "not-a-date" }, { name: "Diagnostics", expiresAt: "2000-01-01" }, [],
  ])("rejects malformed or unsafe issuance input: %j", async (body) => {
    expect((await create(app, body)).status).toBe(400);
    expect(tokens.create).not.toHaveBeenCalled();
  });

  it("scopes revocation to the authenticated owner and does not audit a missing token", async () => {
    tokens.revokeAdmin.mockResolvedValue(false);
    expect((await app.request("/api/admin/tokens/other-token", { method: "DELETE" })).status).toBe(200);
    expect(tokens.revokeAdmin).toHaveBeenCalledWith("actor", "other-token");
    expect(audit).not.toHaveBeenCalled();
  });
});
