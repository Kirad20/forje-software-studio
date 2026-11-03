import { expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ q: vi.fn(async (..._args: any[]): Promise<any[]> => []), one: vi.fn(async (..._args: any[]): Promise<any> => undefined) }));
vi.mock("../../../../server/shared/database/index.js", () => mocks);
import { memoryRepository } from "../../../../server/modules/memory/infrastructure/memory.js";
it("real memory adapter scopes reads and edits to project or personal visibility", async () => {
  await memoryRepository.list("project", "account", "personal");
  expect(mocks.q).toHaveBeenCalledWith(expect.stringContaining("account_id = $1"), ["account", "personal"]);
  await memoryRepository.list("project", "account", "project");
  expect(mocks.q).toHaveBeenCalledWith(expect.stringContaining("project_id = $1"), ["project", "project"]);
  await memoryRepository.update("project", "account", "memory", { text: "new" });
  expect(mocks.one).toHaveBeenCalledWith(expect.stringContaining("(scope = 'personal' and account_id = $3)"), ["memory", "project", "account", null, "new"]);
});
