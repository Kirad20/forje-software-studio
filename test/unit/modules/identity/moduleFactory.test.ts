import { describe, expect, it, vi } from "vitest";
import { createIdentityModule } from "../../../../server/modules/identity/index.js";

function fixture() {
  const policy = { signup: "open", freeCredits: 10 };
  const accounts = {
    existsByEmail: vi.fn().mockResolvedValue(false),
    hasAnyAccounts: vi.fn().mockResolvedValue(true),
    create: vi.fn().mockResolvedValue("account"),
    passwordHash: vi.fn().mockResolvedValue(null),
    setPassword: vi.fn(),
    findResetAccount: vi.fn().mockResolvedValue(null),
    getAccount: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn(),
  };
  const sessions = {
    createSession: vi.fn().mockResolvedValue("session"),
    findAccountBySessionToken: vi.fn().mockResolvedValue(null),
    deleteSession: vi.fn(),
    deleteOtherSessions: vi.fn().mockResolvedValue(0),
    countActiveSessions: vi.fn().mockResolvedValue(0),
    deleteAllSessions: vi.fn(),
  };
  const passwordHasher = {
    hash: vi.fn().mockResolvedValue("hash"),
    verify: vi.fn().mockResolvedValue(true),
    needsRehash: vi.fn().mockReturnValue(false),
    burnCheck: vi.fn(),
  };
  const mailer = { sendLoginCode: vi.fn().mockResolvedValue(true), sendPasswordReset: vi.fn().mockResolvedValue(true) };
  const module = createIdentityModule({
    accounts: {
      accounts,
      sessions,
      resets: { save: vi.fn(), find: vi.fn(), incrementAttempts: vi.fn(), delete: vi.fn() },
      tokens: { create: vi.fn(), findAccount: vi.fn(), list: vi.fn(), delete: vi.fn() },
      hasher: passwordHasher,
      random: { id: () => "id", token: () => "token", code: () => "123456", hash: (value: string) => `hash:${value}` },
      mailer,
      collaboration: { hasInvite: vi.fn().mockResolvedValue(false), deletePersonalOrg: vi.fn() },
      projects: { ownedProjectIds: vi.fn().mockResolvedValue([]) },
      policy,
    } as never,
    accountRepository: {} as never,
    loginCodes: { saveCode: vi.fn(), findCode: vi.fn(), incrementAttempts: vi.fn(), deleteCode: vi.fn() },
    bootstrapCrypto: { generate: () => "token", hash: (value) => value, matches: (a, b) => a === b },
    bootstrapPolicy: { bootstrapToken: "a-bootstrap-token-that-is-long-enough", publicUrl: "https://example.test" },
    claimInvites: vi.fn(),
    log: vi.fn(),
  });
  return { module, accounts, sessions, policy };
}

describe("Identity module factory", () => {
  it("owns bootstrap initialization and can stop and restart it", async () => {
    const { module, accounts } = fixture();
    await module.start();
    await module.start();
    expect(accounts.hasAnyAccounts).toHaveBeenCalledOnce();
    module.stop();
    module.stop();
    await module.start();
    expect(accounts.hasAnyAccounts).toHaveBeenCalledTimes(2);
  });

  it("exposes account actions on the returned module instance", async () => {
    const { module, accounts, policy } = fixture();
    expect(await module.canSignUp("a@example.test")).toBe(true);
    policy.signup = "closed";
    expect(await module.canSignUp("a@example.test")).toBe(false);
    policy.signup = "open";
    policy.freeCredits = 99;
    await module.createAccount("a@example.test", "A", null);
    expect(accounts.create).toHaveBeenCalledWith(expect.objectContaining({ credits: 99 }));
    expect(module.assertStrongPassword).toEqual(expect.any(Function));
  });
});
