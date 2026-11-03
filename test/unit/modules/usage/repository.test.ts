import { expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ q: vi.fn(async (..._args: any[]): Promise<any[]> => []), one: vi.fn(async (..._args: any[]): Promise<any> => undefined) }));
vi.mock("../../../../server/shared/database/index.js", () => mocks);
import { usageRepository } from "../../../../server/modules/usage/infrastructure/usage.js";
it("real usage adapter increments daily actions atomically and isolates credit sources by account", async () => {
  await usageRepository.countAction("a");
  expect(mocks.q).toHaveBeenCalledWith(expect.stringContaining("count = builder_actions.count + 1"), ["a"]);
  expect(await usageRepository.actionsToday("a")).toBe(0);
  await usageRepository.spent("a");
  expect(mocks.one).toHaveBeenCalledWith(expect.stringContaining("filter (where source = 'builder')"), ["a"]);
  expect(mocks.one).toHaveBeenCalledWith(expect.stringContaining("filter (where source = 'app')"), ["a"]);
});
