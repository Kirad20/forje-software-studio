import { describe, expect, it } from "vitest";
import { newBuildProblems, newRuntimeProblems } from "../../server/modules/builder/index.js";
import type { ToolContext } from "../../server/modules/builder/index.js";
import type { Problem } from "../../server/modules/project-observability/problems.js";

const ctx = (owned?: string[]) => ({ account: { id: "a" }, projectId: "p", author: "builder", owned }) as unknown as ToolContext;

describe("finish gate filters", () => {
  const old = { file: "pages/old.tsx", line: 3, text: "Tipo: viejo" };
  const baseline = new Set([`${old.file}\0${old.text}`]);

  it("reports only problems that are new since the agent started, wherever their line moved", () => {
    const now = [{ ...old, line: 9 }, { file: "pages/new.tsx", line: 1, text: "Tipo: nuevo" }];
    expect(newBuildProblems(baseline, now, ctx())).toEqual([now[1]]);
  });

  it("tells a specialist only about the files it owns", () => {
    const now = [
      { file: "pages/a.tsx", text: "Tipo: a" },
      { file: "endpoints/b_GET.ts", text: "Tipo: b" },
    ];
    expect(newBuildProblems(new Set(), now, ctx(["pages/"]))).toEqual([now[0]]);
  });

  it("adds preview problems seen during the run, only for an agent that owns the whole app", () => {
    const at = (kind: Problem["kind"], lastAt: string) => ({ id: kind, kind, title: kind, detail: "", count: 1, firstAt: lastAt, lastAt }) as Problem;
    const list = [at("runtime", "2026-11-01T10:00:05Z"), at("network", "2026-11-01T09:00:00Z"), at("build", "2026-11-01T10:00:05Z")];
    const since = Date.parse("2026-11-01T10:00:00Z");
    expect(newRuntimeProblems(list, since, ctx()).map((p) => p.kind)).toEqual(["runtime"]);
    expect(newRuntimeProblems(list, since, ctx(["pages/"]))).toEqual([]);
  });
});
