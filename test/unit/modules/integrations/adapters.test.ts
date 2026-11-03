import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ q: vi.fn(async (..._args: any[]): Promise<any[]> => []), one: vi.fn(async (..._args: any[]): Promise<any> => undefined), decrypt: vi.fn((v: string) => { if (v === "rotated") throw Error("key"); return `clear:${v}`; }) }));
vi.mock("../../../../server/shared/database/index.js", () => ({ q: mocks.q, one: mocks.one }));
vi.mock("../../../../server/shared/crypto.js", () => ({ encrypt: (v: string) => `encrypted:${v}`, decrypt: mocks.decrypt, newId: () => "id" }));
import { integrationRepository } from "../../../../server/modules/integrations/infrastructure/connections.js";
import { blobSha, githubRepository } from "../../../../server/modules/integrations/infrastructure/github.js";
beforeEach(() => { mocks.q.mockReset().mockResolvedValue([]); mocks.one.mockReset().mockResolvedValue(undefined); });
it("real integration adapter encrypts values, scopes mutations and skips rotated keys", async () => {
  await integrationRepository.updateValue("account", "integration", "secret");
  expect(mocks.q).toHaveBeenCalledWith(expect.stringContaining("account_id = $1 and id = $2"), ["account", "integration", "encrypted:secret"]);
  mocks.q.mockResolvedValueOnce([{ env_name: "GOOD", value_enc: "old" }, { env_name: "MISSING", value_enc: "rotated" }]);
  expect(await integrationRepository.env("project")).toEqual({ GOOD: "clear:old" });
});
it("real GitHub adapter hashes decoded binary bytes identically and persists full sync state", async () => {
  expect(blobSha("hello\n")).toBe("ce013625030ba8dba906f756967f9e9ca394464a");
  expect(blobSha("base64:aGVsbG8K")).toBe(blobSha("hello\n"));
  await githubRepository.saveSync("p", { project_id: "p", account_id: "a", owner: "o", repo: "r", branch: "b", last_sha: "head", last_tree: "tree", synced: { file: "sha" }, status: "ok", error: null, synced_at: null });
  expect(mocks.q).toHaveBeenCalledWith(expect.stringContaining("status = 'ok', error = null"), ["p", "head", "tree", '{"file":"sha"}']);
});
it("public production entries do not start persistence or background listeners on import", async () => {
  const [, github, , , events] = await Promise.all([
    import("../../../../server/modules/integrations/connections.js"),
    import("../../../../server/modules/integrations/github.js"),
    import("../../../../server/modules/usage/usage.js"),
    import("../../../../server/modules/memory/memory.js"),
    import("../../../../server/modules/project-observability/events.js"),
    import("../../../../server/modules/project-observability/problems.js"),
    import("../../../../server/modules/project-observability/security.js"),
  ]);
  expect(mocks.q).not.toHaveBeenCalled();
  expect(mocks.one).not.toHaveBeenCalled();
  expect(events.projectEvents.eventNames()).toEqual([]);
  await github.stopGithubSync();
});
