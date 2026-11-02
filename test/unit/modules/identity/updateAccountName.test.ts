import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateAccountNameUseCase } from "../../../../server/modules/identity/application/UpdateAccountNameUseCase.js";
import type { IAccountRepository } from "../../../../server/modules/identity/ports/repositories.js";

describe("UpdateAccountNameUseCase (TDD)", () => {
  let accountRepo: IAccountRepository;

  beforeEach(() => {
    accountRepo = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      hasAnyAccounts: vi.fn(),
      save: vi.fn(),
      updateName: vi.fn(),
      delete: vi.fn(),
    };
  });

  it("trims and truncates the name up to 80 chars, normalizing empty string to null/empty", async () => {
    const useCase = new UpdateAccountNameUseCase(accountRepo);
    await useCase.execute("acc1", "   Alice Smith   ");
    expect(accountRepo.updateName).toHaveBeenCalledWith("acc1", "Alice Smith");
  });

  it("handles empty name", async () => {
    const useCase = new UpdateAccountNameUseCase(accountRepo);
    await useCase.execute("acc1", "    ");
    expect(accountRepo.updateName).toHaveBeenCalledWith("acc1", "");
  });
});
