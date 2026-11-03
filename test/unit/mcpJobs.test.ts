import { describe, expect, it } from "vitest";
import { jobStatus, runOrDefer, type CallResult } from "../../server/bootstrap/mcp/jobs.js";

const ok = (text: string): CallResult => ({ content: [{ type: "text", text }], isError: false });
const later = (ms: number, r: CallResult) => () => new Promise<CallResult>((res) => setTimeout(() => res(r), ms));
const jobIdOf = (r: CallResult) => /jobId=(\S+)/.exec((r.content[0] as { text: string }).text)?.[1];

describe("MCP jobs", () => {
  it("answers inline when the tool is quick", async () => {
    const r = await runOrDefer("a1", "check_build", later(5, ok("Compila")), 200);
    expect(r).toEqual(ok("Compila"));
  });

  it("returns a jobId for slow tools and the result on a later poll", async () => {
    const r = await runOrDefer("a1", "browser_test", later(80, ok("hecho")), 10);
    const id = jobIdOf(r);
    expect(id).toBeTruthy();
    expect((await jobStatus("a1", id!)).content[0]).toMatchObject({ text: expect.stringContaining("RUNNING") });
    expect(await jobStatus("a1", id!, 2)).toEqual(ok("hecho"));
  });

  it("turns a thrown error into an error result", async () => {
    const r = await runOrDefer("a1", "publish_app", async () => {
      throw new Error("no compila");
    }, 50);
    expect(r.isError).toBe(true);
    expect((r.content[0] as { text: string }).text).toContain("no compila");
  });

  it("hides another account's jobs", async () => {
    const id = jobIdOf(await runOrDefer("a1", "browser_test", later(50, ok("x")), 1))!;
    expect((await jobStatus("a2", id)).isError).toBe(true);
  });
});
