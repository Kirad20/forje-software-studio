import { describe, expect, it, vi } from "vitest";
import { BuilderWorkflowUseCase } from "../../../../server/modules/builder/application/BuilderWorkflowUseCase.js";
import { ReviewAndFixUseCase } from "../../../../server/modules/builder/application/ReviewAndFixUseCase.js";
import { FastBuildUseCase } from "../../../../server/modules/builder/application/FastBuildUseCase.js";
import { TeamBuildUseCase } from "../../../../server/modules/builder/application/TeamBuildUseCase.js";
import { useFastPath } from "../../../../server/modules/builder/domain/BuilderWorkflow.js";

function workflowFixture(mode: "chat" | "plan" | "build" = "build", fast = false, approved: object | null = null) {
  const calls: string[] = [];
  const signal = { aborted: false };
  const ports = {
    signal,
    credits: async () => 1,
    prepare: async () => { calls.push("prepare"); },
    analyze: async () => { calls.push("analyze"); return { complexity: 4, intent: "feature", domains: ["ui", "data"], targeted: fast }; },
    pendingPlan: vi.fn(async () => approved),
    route: (path: boolean) => { calls.push(`route:${path}`); },
    chat: async () => { calls.push("chat"); },
    team: vi.fn(async (_options: { given?: object; planOnly?: boolean }) => { calls.push("team"); return true; }),
    consumePlan: async () => { calls.push("consume"); },
    fast: async () => { calls.push("fast"); },
    fallback: () => { calls.push("fallback"); },
    done: async () => { calls.push("done"); },
    error: vi.fn(async (_error: Error, cancelled: boolean) => { calls.push(`error:${cancelled}`); }),
    cleanup: async () => { calls.push("cleanup"); },
    wrote: () => false,
    checkpoint: vi.fn(async () => {}),
    releaseSync: vi.fn(),
    updateSummary: vi.fn(),
  };
  return { calls, signal, ports, useCase: new BuilderWorkflowUseCase(ports), options: { mode, implementPlan: true } };
}

describe("top-level builder workflow", () => {
  it.each([
    ["question", 5, ["ui", "data"], false, true],
    ["style", 5, ["ui", "data"], false, true],
    ["feature", 5, ["ui", "data"], true, true],
    ["feature", 2, ["ui", "data"], false, true],
    ["feature", 3, ["ui"], false, true],
    ["new_app", 3, ["ui"], false, false],
    ["feature", 4, ["ui"], false, false],
  ])("uses pure routing policy for %s requests", (intent, complexity, domains, targeted, fast) => {
    expect(useFastPath({ intent: intent as string, complexity: complexity as number, domains: domains as string[], targeted: targeted as boolean })).toBe(fast);
  });
  it.each([
    ["chat", false, ["prepare", "analyze", "route:true", "chat", "done", "cleanup"]],
    ["plan", false, ["prepare", "analyze", "route:false", "team", "done", "cleanup"]],
    ["build", true, ["prepare", "analyze", "route:true", "fast", "done", "cleanup"]],
    ["build", false, ["prepare", "analyze", "route:false", "team", "done", "cleanup"]],
  ] as const)("routes %s mode with fast=%s", async (mode, fast, expected) => {
    const f = workflowFixture(mode, fast);
    await f.useCase.execute(f.options);
    expect(f.calls).toEqual(expected);
    if (mode === "plan") expect(f.ports.team).toHaveBeenCalledWith({ planOnly: true });
  });
  it("consumes an approved plan before executing it, without fast routing or replanning", async () => {
    const approved = { tasks: [] };
    const f = workflowFixture("build", true, approved);
    await f.useCase.execute(f.options);
    expect(f.calls).toEqual(["prepare", "analyze", "route:false", "consume", "team", "done", "cleanup"]);
    expect(f.ports.team).toHaveBeenCalledWith({ given: approved });
  });
  it("falls back to a fast agent only when build planning fails", async () => {
    const f = workflowFixture();
    f.ports.team.mockResolvedValueOnce(false);
    await f.useCase.execute(f.options);
    expect(f.calls.slice(-4)).toEqual(["fallback", "fast", "done", "cleanup"]);
    const plan = workflowFixture("plan");
    plan.ports.team.mockResolvedValueOnce(false);
    await plan.useCase.execute(plan.options);
    expect(plan.ports.error).toHaveBeenCalledWith(expect.objectContaining({ message: "No pude preparar un plan. Prueba a describir la petición con más detalle." }), false);
    expect(plan.calls).not.toContain("fast");
  });
  it("rejects unpaid work before persistence, and cleans up on failures or cancellation", async () => {
    const f = workflowFixture();
    f.ports.credits = async () => 0;
    await f.useCase.execute(f.options);
    expect(f.calls).toEqual(["error:false", "cleanup"]);
    const cancelled = workflowFixture();
    cancelled.ports.prepare = async () => { cancelled.signal.aborted = true; };
    await cancelled.useCase.execute(cancelled.options);
    expect(cancelled.calls).toEqual(["error:true", "cleanup"]);
    expect(cancelled.ports.team).not.toHaveBeenCalled();
  });
  it("checkpoints changed files, while synthetic runs never trigger GitHub or conversation summaries", async () => {
    const f = workflowFixture();
    f.ports.wrote = () => true;
    await f.useCase.execute({ ...f.options, synthetic: true });
    expect(f.ports.checkpoint).toHaveBeenCalledOnce();
    expect(f.ports.releaseSync).not.toHaveBeenCalled();
    expect(f.ports.updateSummary).not.toHaveBeenCalled();
    const normal = workflowFixture();
    await normal.useCase.execute(normal.options);
    expect(normal.ports.checkpoint).not.toHaveBeenCalled();
    expect(normal.ports.releaseSync).toHaveBeenCalledOnce();
    expect(normal.ports.updateSummary).toHaveBeenCalledOnce();
  });
});

describe("review/fix orchestration policy", () => {
  const task = { id: "ui", role: "ui" as const, goal: "build", files: ["pages/a.tsx"], dependsOn: [], doneWhen: [] };
  const bad = { ok: false, summary: "broken", issues: [{ role: "ui" as const, files: ["pages/a.tsx"], problem: "bug", fix: "fix it" }] };
  function fixture() {
    const fixes: string[] = [];
    const signal = { aborted: false };
    const ports = {
      signal,
      review: vi.fn(async (_round: number, _fixes: any[]) => bad as typeof bad | null),
      emitReview: vi.fn(),
      fix: vi.fn(async (tasks: any[]) => {
        fixes.push(...tasks.map(t => t.id));
        return new Map(tasks.map(t => [t.id, "fixed"]));
      }),
    };
    return { ports, signal, fixes, useCase: new ReviewAndFixUseCase(ports) };
  }
  it("allows at most three reviews and two fix rounds", async () => {
    const f = fixture();
    const outcome = await f.useCase.execute([task]);
    expect(f.ports.review).toHaveBeenCalledTimes(3);
    expect(f.fixes).toEqual(["ui-fix1", "ui-fix2"]);
    expect(outcome.review).toEqual(bad);
    expect(outcome.fixes).toHaveLength(2);
  });
  it.each([null, { ok: true, summary: "ok", issues: [] }, { ok: false, summary: "unknown", issues: [] }])("stops reviewing without actionable defects: %j", async review => {
    const f = fixture();
    f.ports.review.mockResolvedValueOnce(review as any);
    await f.useCase.execute([task]);
    expect(f.ports.review).toHaveBeenCalledTimes(1);
    expect(f.ports.fix).not.toHaveBeenCalled();
  });
  it("assigns fixes exclusively to valid role paths and stops before more work on cancellation", async () => {
    const f = fixture();
    f.ports.review.mockImplementationOnce(async () => {
      f.signal.aborted = true;
      return bad;
    });
    await expect(f.useCase.execute([task])).rejects.toThrow("Detenido.");
    expect(f.ports.fix).not.toHaveBeenCalled();
    const owned = fixture();
    owned.ports.review.mockResolvedValueOnce({ ...bad, issues: [
      { role: "ui", files: ["endpoints/a_GET.ts", "helpers/shared.ts"], problem: "ui", fix: "" },
      { role: "backend", files: ["helpers/shared.ts"], problem: "api", fix: "" },
    ] } as any).mockResolvedValueOnce({ ok: true, summary: "ok", issues: [] });
    const outcome = await owned.useCase.execute([task]);
    expect(outcome.fixes.map(fix => fix.task.files)).toEqual([["helpers/shared.ts"], ["pages/a.tsx"]]);
  });
});

describe("fast build repair policy", () => {
  it("rechecks and repairs at most twice, preserving reply and learning from the initial build", async () => {
    const broken = [{ title: "broken" }];
    const ports = {
      signal: { aborted: false },
      run: async () => ({ text: "built" }),
      wrote: () => true,
      check: vi.fn(async () => broken),
      learn: vi.fn(async (_result: { text: string }, _broken: typeof broken) => {}),
      fix: vi.fn(async (round: number, _reply: string, _problems: typeof broken) => ({ text: `fix${round}` })),
      reply: vi.fn(async (_text: string, _initial: string) => {}),
    };
    await new FastBuildUseCase(ports).execute();
    expect(ports.fix).toHaveBeenCalledTimes(2);
    expect(ports.learn).toHaveBeenCalledWith({ text: "built" }, broken);
    expect(ports.reply).toHaveBeenCalledWith("built\n\nfix1\n\nfix2\n\n⚠ Todavía no compila: broken", "built");
  });

  describe("team build pipeline", () => {
    const plan = { summary: "build", contract: "", tasks: [], later: [] };
    function fixture() {
      const calls: string[] = [];
      const signal = { aborted: false };
      const ports = {
        signal,
        plan: vi.fn(async (_readOnly: boolean) => { calls.push("plan"); return plan; }),
        announce: (_plan: typeof plan, _approved: boolean) => { calls.push("announce"); },
        storePlan: async (_plan: typeof plan) => { calls.push("store"); },
        writeContract: async (_plan: typeof plan) => { calls.push("contract"); },
        specialists: async (_plan: typeof plan) => { calls.push("specialists"); return new Map<string, string | Error>(); },
        review: async (_plan: typeof plan, _results: Map<string, string | Error>) => { calls.push("review"); return { review: null, fixes: [] }; },
        learn: async () => { calls.push("learn"); },
        reply: async () => { calls.push("reply"); },
      };
      return { calls, signal, ports, useCase: new TeamBuildUseCase(ports) };
    }
    it("plans, executes specialists, reviews, learns and replies in order", async () => {
      const f = fixture();
      expect(await f.useCase.execute({})).toBe(true);
      expect(f.calls).toEqual(["plan", "announce", "contract", "specialists", "review", "learn", "reply"]);
    });
    it("stores a read-only plan without running specialists, and approved plans skip planning", async () => {
      const f = fixture();
      await f.useCase.execute({ planOnly: true });
      expect(f.calls).toEqual(["plan", "announce", "store"]);
      expect(f.ports.plan).toHaveBeenCalledWith(true);
      const approved = fixture();
      await approved.useCase.execute({ given: plan });
      expect(approved.calls).toEqual(["announce", "contract", "specialists", "review", "learn", "reply"]);
    });
    it("returns failed planning and honours cancellation before execution", async () => {
      const f = fixture();
      f.ports.plan.mockResolvedValueOnce(null as any);
      expect(await f.useCase.execute({})).toBe(false);
      expect(f.ports.plan).toHaveBeenCalledOnce();
      expect(f.calls).toEqual([]);
      const cancelled = fixture();
      cancelled.ports.announce = () => { cancelled.signal.aborted = true; };
      await expect(cancelled.useCase.execute({})).rejects.toThrow("Detenido.");
      expect(cancelled.calls).toEqual(["plan"]);
    });
  });
});
