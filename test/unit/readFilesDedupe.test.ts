import { describe, expect, it, vi } from "vitest";
import type { ToolContext } from "../../server/modules/builder/index.js";

const files: Record<string, string> = { "pages/a.tsx": "one\ntwo\nthree" };

vi.mock("../../server/modules/builder/infrastructure/CoreModulesAdapter.js", async (orig) => ({
  ...(await orig<object>()),
  builderCoreModules: () => ({ projects: { readFile: async (_p: string, path: string) => files[path] } }),
}));

const { toolByName } = await import("../../server/modules/builder/index.js");

const read = (ctx: ToolContext, ...paths: string[]) => toolByName.get("read_files")!.run({ paths }, ctx) as Promise<string>;
const ctxOf = (reads?: Map<string, string>) => ({ account: { id: "a" }, projectId: "p", author: "builder", reads }) as unknown as ToolContext;

describe("read_files within one run", () => {
  it("does not resend a file that has not changed, but does once it changes", async () => {
    const ctx = ctxOf(new Map());
    expect(await read(ctx, "pages/a.tsx")).toContain("three");
    const again = await read(ctx, "pages/a.tsx");
    expect(again).toContain("sin cambios");
    expect(again).not.toContain("three");
    files["pages/a.tsx"] = "one\ntwo\nfour";
    expect(await read(ctx, "pages/a.tsx")).toContain("four");
  });

  it("treats each range as its own read, and resends after the registry is cleared (history compacted)", async () => {
    const ctx = ctxOf(new Map());
    files["pages/a.tsx"] = "one\ntwo\nthree";
    expect(await read(ctx, "pages/a.tsx:1-2")).toContain("two");
    expect(await read(ctx, "pages/a.tsx:2-3")).toContain("three");
    expect(await read(ctx, "pages/a.tsx:2-3")).toContain("sin cambios");
    ctx.reads!.clear();
    expect(await read(ctx, "pages/a.tsx:2-3")).toContain("three");
  });

  it("without a registry (MCP clients) always returns the content", async () => {
    const ctx = ctxOf();
    await read(ctx, "pages/a.tsx");
    expect(await read(ctx, "pages/a.tsx")).toContain("three");
  });
});
