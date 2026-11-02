import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginWithPasswordUseCase } from "../../../../server/modules/identity/application/LoginWithPasswordUseCase.js";
import type { IAccountRepository, ISessionRepository, IPasswordHasher } from "../../../../server/modules/identity/ports/repositories.js";
import { Account } from "../../../../server/modules/identity/domain/Account.js";
import { Email } from "../../../../server/modules/identity/domain/Email.js";

describe("LoginWithPasswordUseCase (TDD)", () => {
  let accountRepo: IAccountRepository;
  let sessionRepo: ISessionRepository;
  let passwordHasher: IPasswordHasher;

  beforeEach(() => {
    accountRepo = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      hasAnyAccounts: vi.fn(),
      save: vi.fn(),
      updateName: vi.fn(),
      delete: vi.fn(),
    };
    sessionRepo = {
      createSession: vi.fn().mockResolvedValue("new_session_token"),
      findAccountBySessionToken: vi.fn(),
      deleteSession: vi.fn(),
      deleteOtherSessions: vi.fn(),
      countActiveSessions: vi.fn(),
    };
    passwordHasher = {
      hash: vi.fn().mockResolvedValue("new_hash"),
      verify: vi.fn().mockResolvedValue(true),
      needsRehash: vi.fn().mockReturnValue(false),
      burnCheck: vi.fn().mockResolvedValue(undefined),
    };
  });

  it("burns check time and returns null if account does not exist or has no password", async () => {
    vi.spyOn(accountRepo, "findByEmail").mockResolvedValue(null);
    const useCase = new LoginWithPasswordUseCase(accountRepo, sessionRepo, passwordHasher);

    const session = await useCase.execute("unknown@test.com", "any-password");
    expect(session).toBeNull();
    expect(passwordHasher.burnCheck).toHaveBeenCalledWith("any-password");
    expect(sessionRepo.createSession).not.toHaveBeenCalled();
  });

  it("returns session token when credentials are valid", async () => {
    const account = new Account({
      id: "acc_ok",
      email: new Email("user@test.com"),
      name: "User",
      credits: 10,
      platformRole: "user",
      disabled: false,
      passwordHash: "valid_hash",
    });
    vi.spyOn(accountRepo, "findByEmail").mockResolvedValue(account);
    const useCase = new LoginWithPasswordUseCase(accountRepo, sessionRepo, passwordHasher);

    const session = await useCase.execute("user@test.com", "correct_pwd");
    expect(session).toBe("new_session_token");
    expect(passwordHasher.verify).toHaveBeenCalledWith("correct_pwd", "valid_hash");
    expect(sessionRepo.createSession).toHaveBeenCalledWith("acc_ok");
  });

  it("returns null if account is disabled", async () => {
    const account = new Account({
      id: "acc_dis",
      email: new Email("user@test.com"),
      name: "User",
      credits: 10,
      platformRole: "user",
      disabled: true,
      passwordHash: "valid_hash",
    });
    vi.spyOn(accountRepo, "findByEmail").mockResolvedValue(account);
    const useCase = new LoginWithPasswordUseCase(accountRepo, sessionRepo, passwordHasher);

    const session = await useCase.execute("user@test.com", "correct_pwd");
    expect(session).toBeNull();
    expect(sessionRepo.createSession).not.toHaveBeenCalled();
  });
});
