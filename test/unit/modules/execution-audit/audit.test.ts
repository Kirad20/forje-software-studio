import { describe, expect, it, vi } from "vitest";
import { auditWindow, ExecutionAudit } from "../../../../server/modules/execution-audit/application/ExecutionAudit.js";
import type { ExecutionAuditRepository } from "../../../../server/modules/execution-audit/ports/ExecutionAuditRepository.js";

describe("metrics-only execution audit", () => {
  it("bounds date windows and pagination before accessing storage", async () => {
    const repository = { read: vi.fn(), record: vi.fn() } as unknown as ExecutionAuditRepository;
    const audit = new ExecutionAudit(repository);
    for (const filter of [
      { limit: 101 }, { offset: -1 }, { offset: 10001 }, { limit: Number.NaN }, { projectId: "" },
      { from: "invalid" }, { from: "2026-01-01", to: "2026-03-01" },
      { from: "2026-01-02", to: "2026-01-01" }, { sql: "select private" },
    ]) expect(() => audit.read(filter)).toThrow();
    expect(repository.read).not.toHaveBeenCalled();
    expect(auditWindow({}, Date.parse("2026-11-05T12:00:00Z"))).toEqual({
      from: "2026-10-29T12:00:00.000Z", to: "2026-11-05T12:00:00.000Z", limit: 50, offset: 0,
    });
  });
  it("persists only explicitly allowed numeric metadata, stripping runtime payloads", async () => {
    const record = vi.fn().mockResolvedValue(undefined);
    const audit = new ExecutionAudit({ record, read: vi.fn() });
    await audit.record({
      projectId: "project", taskId: "task", turnId: "turn", traceId: "trace", agentId: "agent",
      kind: "file_read", measured: true, bytes: 128, count: 2,
      prompt: "private", args: { token: "secret" }, result: "file contents",
    } as never);
    expect(record).toHaveBeenCalledWith({
      projectId: "project", taskId: "task", turnId: "turn", traceId: "trace", agentId: "agent",
      kind: "file_read", measured: true, bytes: 128, count: 2,
    });
    for (const event of [
      { projectId: "project", kind: "file_read", measured: true, bytes: -1 },
      { projectId: "project", kind: "file_read", measured: true, count: Infinity },
      { projectId: "project", kind: "compaction", measured: false, beforeTokens: 1.5 },
      { projectId: "project", kind: "raw_prompt", measured: true },
    ]) expect(() => audit.record(event as never)).toThrow();
    expect(record).toHaveBeenCalledTimes(1);
  });
});
