import { expect, it, vi } from "vitest";

const q = vi.hoisted(() => vi.fn().mockResolvedValue([]));
vi.mock("../../../server/shared/database/index.js", () => ({ q }));

import { readOperationalEvents, recordOperationalEvent } from "../../../server/shared/operationalLog.js";

it("stores only bounded metadata, never error messages or arbitrary codes", async () => {
  const error = Object.assign(new Error("secret payload"), { code: "secret payload" });
  error.name = "secret-name";
  await recordOperationalEvent({ service: "project-db", event: "open_failed", projectId: "project-1", error });
  expect(q.mock.calls[0]![1]).toEqual(["project-db", "open_failed", "project-1", null, "OtherError", null]);
  expect(JSON.stringify(q.mock.calls)).not.toContain("secret");
  await readOperationalEvents({ projectId: "project-1", service: "project-db", limit: 5, offset: 2 });
  expect(q.mock.calls.at(-1)![1]).toEqual(["project-1", "project-db", null, null, null, null, null, 5, 2]);
});
