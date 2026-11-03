import { describe, expect, it, vi } from "vitest";
import { BootstrapService, SetupError } from "../../../../server/modules/identity/application/BootstrapService.js";

function setup(token = "configured-bootstrap-token") {
  const accounts = { hasAccounts: vi.fn().mockResolvedValue(false), createAccount: vi.fn().mockResolvedValue("admin"), createSession: vi.fn().mockResolvedValue("session") };
  const crypto = { generate: vi.fn().mockReturnValue("random-bootstrap-token"), hash: (value: string) => `hash:${value}`, matches: (a: string, b: string) => a === b };
  const log = vi.fn();
  return { accounts, crypto, log, service: new BootstrapService(accounts, crypto, { bootstrapToken: token, publicUrl: "http://studio" }, log) };
}

describe("identity bootstrap policy", () => {
  it("disables setup on an initialized installation", async () => {
    const { service, accounts, crypto } = setup();
    accounts.hasAccounts.mockResolvedValue(true);
    await service.init();
    expect(await service.needsSetup()).toBe(false);
    expect(crypto.generate).not.toHaveBeenCalled();
  });

  it("rejects short configured tokens and generates one only when unconfigured", async () => {
    await expect(setup("short").service.init()).rejects.toThrow("16");
    const { service, crypto, log } = setup("");
    await service.init();
    expect(crypto.generate).toHaveBeenCalledOnce();
    expect(log).toHaveBeenCalledWith("[forja]   random-bootstrap-token");
  });

  it("validates the token before email or password, preserves error type, and is single-use", async () => {
    const { service, accounts } = setup();
    await service.init();
    await expect(service.complete({ token: "wrong", email: "invalid", password: "" })).rejects.toBeInstanceOf(SetupError);
    expect(await service.complete({ token: " configured-bootstrap-token ", email: " ADMIN@example.test ", password: "Strong!Password", name: "  Admin  " })).toBe("session");
    expect(accounts.createAccount).toHaveBeenCalledWith("admin@example.test", "Admin", "Strong!Password", "admin");
    expect(await service.needsSetup()).toBe(false);
    await expect(service.complete({ token: "configured-bootstrap-token", email: "admin@example.test", password: "Strong!Password" })).rejects.toBeInstanceOf(SetupError);
  });

  it("retains the setup token on creation failure but consumes it before session creation", async () => {
    const { service, accounts } = setup();
    await service.init();
    accounts.createAccount.mockRejectedValueOnce(new Error("race lost"));
    const input = { token: "configured-bootstrap-token", email: "admin@example.test", password: "Strong!Password" };
    await expect(service.complete(input)).rejects.toThrow("race lost");
    expect(await service.needsSetup()).toBe(true);
    accounts.createSession.mockRejectedValueOnce(new Error("session failed"));
    await expect(service.complete(input)).rejects.toThrow("session failed");
    expect(await service.needsSetup()).toBe(false);
  });
});
