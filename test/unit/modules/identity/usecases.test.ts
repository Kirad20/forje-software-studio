import { describe, it, expect, vi, beforeEach } from "vitest";
import { RequestLoginCodeUseCase } from "../../../../server/modules/identity/application/RequestLoginCodeUseCase.js";
import { VerifyLoginCodeUseCase } from "../../../../server/modules/identity/application/VerifyLoginCodeUseCase.js";
import type { ILoginCodeRepository, IMailerService, IAccountRepository, ISessionRepository } from "../../../../server/modules/identity/ports/repositories.js";
import { Account } from "../../../../server/modules/identity/domain/Account.js";
import { Email } from "../../../../server/modules/identity/domain/Email.js";

describe("Identity Use Cases (TDD)", () => {
  let loginCodeRepo: ILoginCodeRepository;
  let mailer: IMailerService;
  let accountRepo: IAccountRepository;
  let sessionRepo: ISessionRepository;

  beforeEach(() => {
    loginCodeRepo = {
      saveCode: vi.fn(),
      findCode: vi.fn(),
      incrementAttempts: vi.fn(),
      deleteCode: vi.fn(),
    };
    mailer = {
      sendLoginCode: vi.fn().mockResolvedValue(true),
      sendPasswordReset: vi.fn().mockResolvedValue(true),
    };
    accountRepo = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      hasAnyAccounts: vi.fn(),
      save: vi.fn(),
      updateName: vi.fn(),
      delete: vi.fn(),
    };
    sessionRepo = {
      createSession: vi.fn().mockResolvedValue("session_token_xyz"),
      findAccountBySessionToken: vi.fn(),
      deleteSession: vi.fn(),
      deleteOtherSessions: vi.fn(),
      countActiveSessions: vi.fn(),
    };
  });

  describe("RequestLoginCodeUseCase", () => {
    it("generates a numeric code, saves it and sends it via mailer", async () => {
      const useCase = new RequestLoginCodeUseCase(loginCodeRepo, mailer);
      const result = await useCase.execute("dev@forja.test");

      expect(result).toBe(true);
      expect(loginCodeRepo.saveCode).toHaveBeenCalledWith("dev@forja.test", expect.stringMatching(/^\d{6}$/), 15);
      expect(mailer.sendLoginCode).toHaveBeenCalledWith("dev@forja.test", expect.stringMatching(/^\d{6}$/));
    });
  });

  describe("VerifyLoginCodeUseCase", () => {
    it("returns session token when code is correct for existing active account", async () => {
      const code = "123456";
      vi.spyOn(loginCodeRepo, "findCode").mockResolvedValue({
        codeHash: "HASH_OF_123456",
        attempts: 0,
        expired: false,
      });
      const account = new Account({
        id: "acc_1",
        email: new Email("user@forja.test"),
        name: "User",
        credits: 50,
        platformRole: "user",
        disabled: false,
      });
      vi.spyOn(accountRepo, "findByEmail").mockResolvedValue(account);

      const hashFn = (c: string) => `HASH_OF_${c}`;
      const useCase = new VerifyLoginCodeUseCase(loginCodeRepo, accountRepo, sessionRepo, hashFn);

      const session = await useCase.execute("user@forja.test", code);
      expect(session).toBe("session_token_xyz");
      expect(loginCodeRepo.deleteCode).toHaveBeenCalledWith("user@forja.test");
      expect(sessionRepo.createSession).toHaveBeenCalledWith("acc_1");
    });

    it("increments attempts and returns null on code mismatch", async () => {
      vi.spyOn(loginCodeRepo, "findCode").mockResolvedValue({
        codeHash: "HASH_OF_CORRECT",
        attempts: 1,
        expired: false,
      });

      const hashFn = (c: string) => `HASH_OF_${c}`;
      const useCase = new VerifyLoginCodeUseCase(loginCodeRepo, accountRepo, sessionRepo, hashFn);

      const session = await useCase.execute("user@forja.test", "WRONG_CODE");
      expect(session).toBeNull();
      expect(loginCodeRepo.incrementAttempts).toHaveBeenCalledWith("user@forja.test");
      expect(sessionRepo.createSession).not.toHaveBeenCalled();
    });

    it("returns null if code is expired or attempts >= 5", async () => {
      vi.spyOn(loginCodeRepo, "findCode").mockResolvedValue({
        codeHash: "HASH_OF_CORRECT",
        attempts: 5,
        expired: false,
      });

      const hashFn = (c: string) => `HASH_OF_${c}`;
      const useCase = new VerifyLoginCodeUseCase(loginCodeRepo, accountRepo, sessionRepo, hashFn);

      const session = await useCase.execute("user@forja.test", "CORRECT");
      expect(session).toBeNull();
      expect(loginCodeRepo.incrementAttempts).not.toHaveBeenCalled();
    });
  });
});
