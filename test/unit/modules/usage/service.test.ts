import { expect, it, vi } from "vitest";
import { createUsageService } from "../../../../server/modules/usage/application/service.js";

it("combines account-scoped accounting and supplies empty defaults", async () => {
  const repository = { countAction: vi.fn(), actionsToday: vi.fn(async () => 3), credits: vi.fn(async () => null), spent: vi.fn(async () => null), storage: vi.fn(async () => null), history: vi.fn(async () => []) };
  const service = createUsageService(repository);
  expect(await service.usageSummary("a")).toEqual({ actionsToday: 3, actionsLimit: 1000, actionsHistory: [], credits: 0, creditsSpent: { builder: 0, app: 0 }, storageBytes: 0 });
  await service.countAction("a");
  expect(repository.countAction).toHaveBeenCalledWith("a");
  expect(repository.credits).toHaveBeenCalledWith("a");
});
