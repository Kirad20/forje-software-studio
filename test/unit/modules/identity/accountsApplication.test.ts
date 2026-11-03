import { beforeEach, describe, expect, it, vi } from "vitest";
import { IdentityAccountsService } from "../../../../server/modules/identity/application/IdentityAccountsService.js";

describe("identity account lifecycle application", () => {
  let deps: any;
  let service: IdentityAccountsService;
  beforeEach(() => {
    deps = {
      accounts: {
        existsByEmail: vi.fn().mockResolvedValue(false), hasAnyAccounts: vi.fn().mockResolvedValue(true),
        create: vi.fn().mockResolvedValue("account"), passwordHash: vi.fn().mockResolvedValue(null),
        setPassword: vi.fn(), findResetAccount: vi.fn().mockResolvedValue({ id: "account", email: "user@example.test", disabled: false }),
        getAccount: vi.fn(), delete: vi.fn(),
      },
      sessions: { createSession: vi.fn(), deleteSession: vi.fn(), deleteAllSessions: vi.fn(), findAccountBySessionToken: vi.fn(), deleteOtherSessions: vi.fn(), countActiveSessions: vi.fn() },
      resets: { save: vi.fn(), find: vi.fn().mockResolvedValue({ codeHash: "hash:correct", attempts: 0, expired: false }), incrementAttempts: vi.fn(), delete: vi.fn() },
      tokens: { create: vi.fn(), findAccount: vi.fn(), list: vi.fn(), delete: vi.fn() },
      hasher: { hash: vi.fn().mockResolvedValue("password-hash"), verify: vi.fn().mockResolvedValue(false) },
      random: { id: () => "account", token: () => "token", code: () => "12345678", hash: (value: string) => `hash:${value}` },
      mailer: { sendPasswordReset: vi.fn().mockResolvedValue(true) },
      collaboration: { hasInvite: vi.fn().mockResolvedValue(false), deletePersonalOrg: vi.fn() },
      projects: { ownedProjectIds: vi.fn().mockResolvedValue(["project"]) },
      policy: { signup: "invite", freeCredits: 123 },
    };
    service = new IdentityAccountsService(deps);
  });

  it("blocks first-run signup even when open or invited, but permits existing addresses", async () => {
    deps.accounts.hasAnyAccounts.mockResolvedValue(false);
    deps.policy.signup = "open";
    expect(await service.canSignUp("USER@EXAMPLE.TEST")).toBe(false);
    deps.accounts.existsByEmail.mockResolvedValue(true);
    expect(await service.canSignUp("USER@EXAMPLE.TEST")).toBe(true);
    expect(deps.accounts.existsByEmail).toHaveBeenLastCalledWith("user@example.test");
    expect(deps.collaboration.hasInvite).not.toHaveBeenCalled();
  });

  it("honors closed and invited signup after setup", async () => {
    deps.policy.signup = "closed";
    expect(await service.canSignUp("user@example.test")).toBe(false);
    deps.policy.signup = "invite";
    deps.collaboration.hasInvite.mockResolvedValue(true);
    expect(await service.canSignUp("user@example.test")).toBe(true);
  });

  it("passes the first-admin gate and personal organization label to atomic account creation", async () => {
    expect(await service.createAccount("USER@example.test", null, "Strong!Password", "admin")).toBe("account");
    expect(deps.accounts.create).toHaveBeenCalledWith({
      id: "account", email: "user@example.test", name: null, credits: 123, passwordHash: "password-hash", role: "admin", personalOrgName: "USER",
    });
  });

  it("verifies current password before strength checks and revokes sessions after setting password", async () => {
    deps.accounts.passwordHash.mockResolvedValue("old");
    await expect(service.changePassword("account", undefined, "short", "user@example.test")).rejects.toThrow("actual");
    expect(deps.accounts.setPassword).not.toHaveBeenCalled();
    deps.hasher.verify.mockResolvedValue(true);
    await service.changePassword("account", "old-pass", "Strong!Password", "user@example.test");
    expect(deps.accounts.setPassword).toHaveBeenCalledWith("account", "password-hash");
    expect(deps.sessions.deleteAllSessions).toHaveBeenCalledWith("account");
    expect(deps.accounts.setPassword.mock.invocationCallOrder[0]).toBeLessThan(deps.sessions.deleteAllSessions.mock.invocationCallOrder[0]);
  });

  it("silently ignores unknown and disabled reset accounts", async () => {
    for (const account of [null, { id: "account", disabled: true }]) {
      deps.accounts.findResetAccount.mockResolvedValue(account);
      await service.requestPasswordReset(" USER@example.test ");
    }
    expect(deps.resets.save).not.toHaveBeenCalled();
    expect(deps.mailer.sendPasswordReset).not.toHaveBeenCalled();
  });

  it("stores an eight-digit reset code for thirty minutes while preserving recipient input", async () => {
    await service.requestPasswordReset(" USER@example.test ");
    expect(deps.accounts.findResetAccount).toHaveBeenCalledWith("user@example.test");
    expect(deps.resets.save).toHaveBeenCalledWith("account", "hash:12345678", 30);
    expect(deps.mailer.sendPasswordReset).toHaveBeenCalledWith(" USER@example.test ", "12345678");
  });

  it("burns wrong-code attempts but never consumes a valid code for a weak password", async () => {
    expect(await service.resetPassword("user@example.test", "wrong", "Strong!Password")).toBe(false);
    expect(deps.resets.incrementAttempts).toHaveBeenCalledWith("account");
    await expect(service.resetPassword("user@example.test", " correct ", "short")).rejects.toThrow("10");
    expect(deps.resets.delete).not.toHaveBeenCalled();
    expect(deps.accounts.setPassword).not.toHaveBeenCalled();
  });

  it.each([{ attempts: 5, expired: false }, { attempts: 0, expired: true }])("rejects unusable reset codes %o", async (state) => {
    deps.resets.find.mockResolvedValue({ codeHash: "hash:correct", ...state });
    expect(await service.resetPassword("user@example.test", "correct", "Strong!Password")).toBe(false);
    expect(deps.resets.delete).not.toHaveBeenCalled();
  });

  it("consumes successful reset and revokes every session", async () => {
    expect(await service.resetPassword("user@example.test", "correct", "Strong!Password")).toBe(true);
    expect(deps.resets.delete).toHaveBeenCalledWith("account");
    expect(deps.sessions.deleteAllSessions).toHaveBeenCalledWith("account");
  });

  it("preserves API token prefix, digest, and optional org scope", async () => {
    expect(await service.createApiToken("account", "build", "org")).toBe("fj_token");
    expect(deps.tokens.create).toHaveBeenCalledWith("account", "account", "build", "hash:fj_token", "org");
    expect(await service.accountFromApiToken(undefined)).toBeNull();
    expect(deps.tokens.findAccount).not.toHaveBeenCalled();
  });

  it("projects sessions without credential material and retains the thirty-day lifetime", async () => {
    expect(await service.accountFromSession(undefined)).toBeNull();
    expect(deps.sessions.findAccountBySessionToken).not.toHaveBeenCalled();
    deps.sessions.findAccountBySessionToken.mockResolvedValue({
      id: "account", email: { value: "user@example.test" }, name: null, credits: 123,
      platformRole: "user", passwordHash: "never-expose", disabled: false,
    });
    expect(await service.accountFromSession("session")).toEqual({
      id: "account", email: "user@example.test", name: null, credits: 123, platformRole: "user",
    });
    await service.createSession("account");
    expect(deps.sessions.createSession).toHaveBeenCalledWith("account", 30);
  });

  it("captures project ids before cascade and removes the personal organization after the account", async () => {
    expect(await service.deleteAccount("account")).toEqual(["project"]);
    expect(deps.projects.ownedProjectIds.mock.invocationCallOrder[0]).toBeLessThan(deps.accounts.delete.mock.invocationCallOrder[0]);
    expect(deps.accounts.delete.mock.invocationCallOrder[0]).toBeLessThan(deps.collaboration.deletePersonalOrg.mock.invocationCallOrder[0]);
  });
});
