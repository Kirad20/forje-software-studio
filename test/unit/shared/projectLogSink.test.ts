import { afterEach, expect, it, vi } from "vitest";

const q = vi.hoisted(() => vi.fn().mockResolvedValue([]));
vi.mock("../../../server/shared/database/index.js", () => ({ q }));

import { flushProjectLogs, flushProjectLogsForShutdown, recordProjectLog } from "../../../server/shared/projectLogSink.js";

afterEach(async () => {
  q.mockReset().mockResolvedValue([]);
  await flushProjectLogs();
});

it("batches metadata without persisting message fields", async () => {
  const entry = {
    projectId: "p1", env: "preview" as const, level: "error" as const,
    source: "client" as const, at: "2026-01-01T00:00:00.000Z", message: "private secret",
  };
  recordProjectLog(entry);
  recordProjectLog({ ...entry, projectId: "p2" });
  await Promise.all([flushProjectLogs(), flushProjectLogs()]);
  const inserts = q.mock.calls.filter(([sql]) => String(sql).includes("insert into operational_events"));
  expect(inserts).toHaveLength(1);
  const rows = JSON.parse(inserts[0]![1][0]);
  expect(rows).toHaveLength(2);
  expect(rows[0]).toMatchObject({ projectId: "p1", env: "preview", level: "error", source: "client" });
  expect(JSON.stringify(rows)).not.toContain("private secret");
});

it("retains a failed batch for retry with the same event id", async () => {
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  q.mockClear().mockRejectedValueOnce(new Error("database down"));
  recordProjectLog({ projectId: "p1", env: "preview", level: "warn", source: "job", at: "2026-01-01T00:00:00.000Z" });
  try {
    await expect(flushProjectLogs()).rejects.toThrow("database down");
    const first = JSON.parse(q.mock.calls[0]![1][0]);
    await flushProjectLogs();
    const second = JSON.parse(q.mock.calls[1]![1][0]);
    expect(second[0].eventId).toBe(first[0].eventId);
    expect(error).toHaveBeenCalled();
  } finally { error.mockRestore(); }
});

it("bounds shutdown when storage is unresponsive", async () => {
  let release!: () => void;
  q.mockClear().mockImplementationOnce(() => new Promise<unknown[]>((resolve) => { release = () => resolve([]); }));
  recordProjectLog({ projectId: "p1", env: "preview", level: "info", source: "job", at: "2026-01-01T00:00:00.000Z" });
  try {
    await expect(flushProjectLogsForShutdown(10)).rejects.toThrow("Timed out flushing project logs");
  } finally {
    release();
    await flushProjectLogs();
  }
});
