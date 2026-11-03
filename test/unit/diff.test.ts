import { describe, expect, it } from "vitest";
import { diffLines, hunks } from "../../studio/src/features/files/domain/diff.js";

const ops = (before: string, after: string) => diffLines(before, after).map((l) => `${l.op}${l.text}`);

describe("line diff", () => {
  it("marks a changed line as removed and added, with both line numbers", () => {
    expect(ops("a\nb\nc", "a\nB\nc")).toEqual([" a", "-b", "+B", " c"]);
    const tail = diffLines("a\nb\nc", "a\nx\ny\nc").at(-1)!;
    expect(tail).toMatchObject({ op: " ", text: "c", a: 3, b: 4 });
  });

  it("handles created and deleted files", () => {
    expect(ops("", "x\ny")).toEqual(["+x", "+y"]);
    expect(ops("x\ny", "")).toEqual(["-x", "-y"]);
    expect(ops("", "x\n")).toEqual(["+x"]);
  });

  it("aligns insertions in the middle instead of replacing everything", () => {
    expect(ops("1\n2\n3\n4", "1\n2\nnew\n3\n4")).toEqual([" 1", " 2", "+new", " 3", " 4"]);
  });

  it("collapses unchanged lines far from any change", () => {
    const before = Array.from({ length: 20 }, (_, i) => `l${i}`).join("\n");
    const after = before.replace("l10", "L10");
    const h = hunks(diffLines(before, after), 2);
    expect(h[0]).toEqual({ op: "gap", count: 8 });
    expect(h.filter((r) => r.op !== "gap").map((r) => ("text" in r ? r.text : ""))).toEqual(["l8", "l9", "l10", "L10", "l11", "l12"]);
    expect(h.at(-1)).toEqual({ op: "gap", count: 7 });
  });
});
