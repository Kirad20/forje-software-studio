import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { freshDatabase } from "../helpers/pg.mjs";

// Config is read when it loads: point DATA_DIR and DATABASE_URL at throwaway ones first.
const dir = mkdtempSync(path.join(os.tmpdir(), "forja-metrics-"));
process.env.DATA_DIR = dir;
const pgdb = await freshDatabase();
process.env.DATABASE_URL = pgdb.url;
const { q, closePlatformDb } = await import("../../server/shared/database/index.js");
const m = await import("../../server/modules/builder/index.js");

const usage = (input: number) => ({ input, output: 10, cacheRead: 0, cacheWrite: 0 });
const settle = () => m.metricsIdle();
const read = (t: string) => ["read_files", "search_code"].includes(t);

beforeAll(async () => {
  await q(`insert into accounts (id, email) values ('a1', 'a@x.test')`);
  await q(`insert into projects (id, owner_id, name) values ('p1', 'a1', 'Demo'), ('p2', 'a1', 'Otro')`);
});
afterAll(async () => {
  rmSync(dir, { recursive: true, force: true });
  await closePlatformDb();
  await pgdb.drop();
});

describe("agent metrics", () => {
  it("estimates tokens at about four characters each", () => {
    expect(m.estTokens(0)).toBe(0);
    expect(m.estTokens(4000)).toBe(1000);
    expect(m.estTokens(4001)).toBe(1001);
  });

  it("charges a result once per later model call of its run, and only builder results", async () => {
    const run = m.newRunId();
    // Three model calls (steps 0, 1, 2). A 4000-char read at step 0 is re-sent twice; a write at step 1 once.
    for (const step of [0, 1, 2]) m.recordStep({ runId: run, projectId: "p1", turnId: "t1", role: "fast", step, usage: usage(1000) });
    m.recordToolCall({ runId: run, projectId: "p1", source: "builder", role: "fast", step: 0, tool: "read_files", inputChars: 40, resultChars: 4000, ok: true, ms: 5 });
    m.recordToolCall({ runId: run, projectId: "p1", source: "builder", role: "fast", step: 1, tool: "write_file", inputChars: 8000, resultChars: 40, ok: true, ms: 5 });
    m.recordToolCall({ runId: "", projectId: "p1", source: "mcp", step: 0, tool: "read_files", inputChars: 20, resultChars: 400, ok: false, ms: 1 });
    // Another project's rows stay out of p1's report.
    m.recordStep({ runId: m.newRunId(), projectId: "p2", role: "fast", step: 0, usage: usage(99_999) });
    await settle();

    const r = await m.metricsReport(["p1"], 30, read);
    expect(r.runs).toBe(1);
    expect(r.modelCalls).toBe(3);
    expect(r.inputTokens).toBe(3000);
    const builderRead = r.tools.find((t) => t.tool === "read_files" && t.source === "builder")!;
    expect(builderRead).toMatchObject({ readOnly: true, calls: 1, resultTokens: 1000, carriedTokens: 2000 });
    const write = r.tools.find((t) => t.tool === "write_file")!;
    expect(write).toMatchObject({ readOnly: false, inputTokens: 2000, carriedTokens: 10 });
    const mcp = r.tools.find((t) => t.source === "mcp")!;
    expect(mcp).toMatchObject({ errors: 1, resultTokens: 100, carriedTokens: 0 });
    // 2000 carried read tokens over 3000 input tokens.
    expect(r.readCarriedShare).toBeCloseTo(2000 / 3000);
    expect(r.gate.pass).toBe(true);
    expect(r.tools[0]!.tool).toBe("read_files");
  });

  it("reports an empty window without dividing by zero", async () => {
    const r = await m.metricsReport(["nope"], 7, read);
    expect(r).toMatchObject({ runs: 0, modelCalls: 0, inputTokens: 0, readCarriedShare: 0, tools: [] });
    expect(r.gate.pass).toBe(false);
  });
});
