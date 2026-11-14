import { expect, it, vi } from "vitest";
import { createLogService } from "../../../../server/modules/project-observability/application/events.js";

it("emits only project log metadata to persistent storage", () => {
  const record = vi.fn();
  const log = createLogService({ get: () => [], set: vi.fn() }, vi.fn(), () => "2026-01-01T00:00:00.000Z", record);
  log.log("p1", { env: "preview", level: "error", source: "client", message: "private secret" });
  expect(record).toHaveBeenCalledWith("p1", {
    at: "2026-01-01T00:00:00.000Z", env: "preview", level: "error", source: "client",
  });
});
