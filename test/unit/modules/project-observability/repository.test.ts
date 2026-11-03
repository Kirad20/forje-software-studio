import { expect, it, vi } from "vitest";
const q = vi.hoisted(() => vi.fn(async (..._args: any[]): Promise<any[]> => []));
vi.mock("../../../../server/shared/database/index.js", () => ({ q }));
import { securityRepository } from "../../../../server/modules/project-observability/infrastructure/security.js";
it("deep scan admission is one conditional write that preserves existing findings", async () => {
  q.mockResolvedValueOnce([{ project_id: "p" }]).mockResolvedValueOnce([]);
  expect(await securityRepository.startDeep("p")).toBe(true);
  expect(await securityRepository.startDeep("p")).toBe(false);
  const sql = q.mock.calls[0]![0] as string;
  expect(sql).toContain("where security_scans.status <> 'running'");
  expect(sql.split("do update")[1]).not.toContain("findings =");
  expect(q.mock.calls[0]![1]).toEqual(["p"]);
});
