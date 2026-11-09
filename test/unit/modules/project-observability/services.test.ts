import { describe, expect, it, vi } from "vitest";
import { createLogService } from "../../../../server/modules/project-observability/application/events.js";
import { createProblemService } from "../../../../server/modules/project-observability/application/problems.js";
import { createSecurityService, type Finding } from "../../../../server/modules/project-observability/application/security.js";
import { createEventAdapters } from "../../../../server/modules/project-observability/infrastructure/events.js";
import { createProblemAdapters } from "../../../../server/modules/project-observability/infrastructure/problems.js";
describe("project observation", () => {
  it("real event and memory adapters retain the last 500 scoped logs and fan out full timestamps", () => {
    const { projectEvents, logRepository } = createEventAdapters(), listener = vi.fn();
    projectEvents.on("p", listener);
    const service = createLogService(logRepository, (p, e) => projectEvents.emit(p, e), () => "now");
    for (let i = 0; i < 501; i++) service.log("p", { env: "preview", level: i % 2 ? "info" : "error", source: "client", message: `${i}` });
    expect(service.readLogs("p", { limit: 1000 })).toHaveLength(500);
    expect(service.readLogs("other")).toEqual([]);
    expect(service.readLogs("p", { level: "error", limit: 1 })[0]).toMatchObject({ at: "now", message: "500" });
    expect(listener).toHaveBeenCalledTimes(501);
  });
  it("deduplicates preview errors, replaces build findings, clears runtime on edits and detaches", async () => {
    const adapters = createProblemAdapters(), { projectEvents } = createEventAdapters();
    const checkProject = vi.fn(async () => [{ file: "pages/a.tsx", text: "broken", line: 3 }]);
    const service = createProblemService(adapters.repository, { readAllFiles: async () => ({}), checkProject, formatProblem: (p) => p.text }, {
      ...adapters, emit: (p, e) => projectEvents.emit(p, e),
      subscribe: (p, l) => { projectEvents.on(p, l); return () => { projectEvents.off(p, l); }; },
    });
    service.watchProblems("p"); service.watchProblems("p");
    const entry = { at: "", env: "preview", level: "error", source: "client", message: "Error pages/a.tsx:3:8" } as const;
    projectEvents.emit("p", { type: "log", entry });
    projectEvents.emit("p", { type: "log", entry: { ...entry, message: "Error pages/a.tsx:7:9" } });
    expect(service.listProblems("p")).toMatchObject([{ kind: "runtime", count: 2, file: "pages/a.tsx" }]);
    projectEvents.emit("p", { type: "log", entry: { ...entry, env: "published" } });
    expect(service.listProblems("p")[0]!.count).toBe(2);
    await service.recheckBuild("p");
    checkProject.mockResolvedValue([]);
    expect(await service.recheckBuild("p")).toEqual([]);
    projectEvents.emit("p", { type: "files", paths: [] });
    expect(service.listProblems("p")).toEqual([]);
    await service.stopProblems(); await service.stopProblems();
    expect(projectEvents.listenerCount("p")).toBe(0);
  });
  it("filters by environment before limiting so preview traffic does not hide production logs", () => {
    const { logRepository } = createEventAdapters();
    const service = createLogService(logRepository, vi.fn(), () => "now");
    service.log("p", { env: "published", level: "error", source: "email", message: "Production reset" });
    for (let i = 0; i < 10; i++) service.log("p", { env: "preview", level: "info", source: "request", message: "Preview" });
    expect(service.readLogs("p", { env: "published", limit: 1 })).toEqual([
      expect.objectContaining({ env: "published", message: "Production reset" }),
    ]);
  });
  it("deep scan admission preserves atomic repository ownership and ignores findings across both scan types", async () => {
    const finding: Finding = { id: "f", rule: "r", severity: "high", title: "bad", detail: "detail", fix: "fix", source: "quick" };
    const repository = { scans: vi.fn(async () => [{ kind: "quick" as const, status: "done" as const, findings: [finding], summary: "", scanned_at: "2026-01-01" }]), ignored: vi.fn(async () => ["f"]), save: vi.fn(), startDeep: vi.fn(async () => false), setIgnored: vi.fn() };
    const readAllFiles = vi.fn(async () => ({ "pages/a.tsx": "code" })), quickScan = vi.fn(() => [finding]);
    const service = createSecurityService(repository, { readAllFiles, quickScan });
    expect(await service.startDeepScan("p")).toBe(false);
    expect(repository.save).not.toHaveBeenCalled();
    expect((await service.getSecurity("p")).quick?.findings[0]!.ignored).toBe(true);
    expect(await service.runQuickScan("p", { file: "snapshot" })).toEqual([{ ...finding, ignored: true }]);
    expect(readAllFiles).not.toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledWith("p", "quick", "done", [finding], "");
  });
});
