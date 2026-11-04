import { describe, expect, it, vi } from "vitest";
import { EVAL_CASES } from "../../../../server/modules/evaluations/cases.js";
import type { CaseResult } from "../../../../server/modules/evaluations/score.js";
import { AdmissionState, planRun, runBudget, startEvaluation, type AdmissionPorts } from "../../../../server/modules/evaluations/application/admission.js";
import { executeRun, recoverRuns, type RunPorts } from "../../../../server/modules/evaluations/application/run.js";

describe("evaluation admission", () => {
  it("validates cases and deduplicates explicit ids before counting repeats", () => {
    const id = EVAL_CASES[0].id;
    expect(planRun({ cases: [id, id], repeats: 3 })).toMatchObject({ jobs: 3, repeats: 3 });
    expect(() => planRun({ cases: [id, "missing"] })).toThrow("Hay casos que no existen");
    expect(planRun({ sizes: ["medium"], repeats: 99 }).cases.every((c) => c.size === "medium")).toBe(true);
    expect(planRun({ repeats: NaN }).repeats).toBe(1);
    expect(runBudget(50, { maxRunUsd: 10, maxDailyUsd: 20 }, 17)).toBe(3);
    expect(() => runBudget(1, { maxRunUsd: 10, maxDailyUsd: 20 }, 20)).toThrow("tope diario");
    expect(() => runBudget(0.001, { maxRunUsd: 10, maxDailyUsd: 20 }, 0)).toThrow("mayor que 0");
  });

  it("reserves the shared account synchronously, including pending admission and cleanup", () => {
    const state = new AdmissionState();
    const run = state.acquire("eval", "r1");
    expect(state.activeRunId()).toBe("r1");
    expect(() => state.acquire("eval", "r2")).toThrow();
    expect(() => state.acquire("playground", "p1")).toThrow();
    state.release({ ...run });
    expect(state.activeRunId()).toBe("r1");
    const stop = vi.fn();
    run.inflight.add("project");
    expect(state.cancel("other", stop)).toBe(false);
    expect(state.cancel("r1", stop)).toBe(true);
    expect(stop).toHaveBeenCalledWith("project");
    expect(run.abort.signal.aborted).toBe(true);
    state.release(run);
    const playground = state.acquire("playground", "p1");
    expect(state.playgroundBusy()).toBe(true);
    state.release(playground);
    expect(state.playgroundBusy()).toBe(false);
  });

  it("holds the lease across asynchronous model validation and releases rejected admission", async () => {
    const state = new AdmissionState();
    let allow: (models: { id: string; vision: boolean; tools: boolean }[]) => void = () => {};
    const ports: AdmissionPorts<{ id: string; vision: boolean; tools: boolean }> = {
      newId: () => "r",
      allowedModels: () => new Promise((resolve) => { allow = resolve; }),
      defaultJudge: () => undefined,
      spent: async () => 0,
      save: vi.fn(async () => {}),
      launch: vi.fn(),
    };
    const request = { cases: [EVAL_CASES[0].id], models: ["nope"], judge: false };
    const limits = { enabled: true, maxRunUsd: 5, maxDailyUsd: 10 };
    const first = startEvaluation("admin", request, limits, state, ports);
    await expect(startEvaluation("admin", request, limits, state, ports)).rejects.toThrow();
    expect(() => state.acquire("playground", "p")).toThrow();
    allow([]);
    await expect(first).rejects.toThrow("Modelos no permitidos");
    expect(ports.save).not.toHaveBeenCalled();
    expect(state.activeRunId()).toBeNull();
  });

  it("persists the planned budget and judge before launching, and drains shutdown admission", async () => {
    const state = new AdmissionState();
    const events: string[] = [];
    const model = { id: "vision", vision: true, tools: true };
    const ports: AdmissionPorts<typeof model> = {
      newId: () => "r",
      allowedModels: async () => [model],
      defaultJudge: (models) => models[0],
      spent: async () => 8,
      save: async (_run, cfg, budget) => {
        expect(cfg).toMatchObject({ models: ["vision"], judgeModel: "vision", total: 2 });
        expect(budget).toBe(2);
        events.push("save");
      },
      launch: (run) => { events.push("launch"); state.release(run); },
    };
    await expect(startEvaluation("admin", { cases: [EVAL_CASES[0].id], repeats: 2, models: ["vision"] }, { enabled: true, maxRunUsd: 5, maxDailyUsd: 10 }, state, ports))
      .resolves.toEqual({ runId: "r", jobs: 2, budgetUsd: 2 });
    expect(events).toEqual(["save", "launch"]);
    await state.stop(() => {});
    await expect(startEvaluation("admin", {}, { enabled: true, maxRunUsd: 5, maxDailyUsd: 10 }, state, ports)).rejects.toThrow("apagando");
  });

  it.each(["eval", "playground"] as const)("aborts and drains %s work through disposable cleanup", async (kind) => {
    const state = new AdmissionState();
    const run = state.acquire(kind, "r");
    const events: string[] = [];
    run.inflight.add("p");
    state.track(new Promise<void>((resolve) => {
      run.abort.signal.addEventListener("abort", () => {
        events.push("abort");
        setTimeout(() => {
          events.push("cleanup");
          state.release(run);
          resolve();
        }, 1);
      }, { once: true });
    }));
    await state.stop((id) => { events.push(`stop:${id}`); });
    expect(events).toEqual(["abort", "stop:p", "cleanup"]);
    expect(state.activeRunId()).toBeNull();
    expect(state.playgroundBusy()).toBe(false);
  });
  it("admits an explicit vision-only judge but rejects blind or disallowed judges", async () => {
    const model = { id: "qwen2.5vl", vision: true, tools: false };
    const blind = { id: "qwen2.5-coder:7b", vision: false, tools: true };
    const state = new AdmissionState();
    const ports: AdmissionPorts<typeof model> = {
      newId: () => "r",
      allowedModels: async () => [model, blind],
      defaultJudge: () => model,
      spent: async () => 0,
      save: vi.fn(async () => {}),
      launch: vi.fn((run) => { state.release(run); }),
    };
    const limits = { enabled: true, maxRunUsd: 5, maxDailyUsd: 10 };
    const request = { cases: [EVAL_CASES[0].id], judgeModel: model.id };
    await expect(startEvaluation("admin", request, limits, state, ports)).resolves.toMatchObject({ runId: "r" });
    expect(ports.launch).toHaveBeenCalledWith(expect.anything(), expect.anything(),
      { repeats: 1, models: null, judge: model }, 5);
    for (const judgeModel of [blind.id, "not-allowed"]) {
      await expect(startEvaluation("admin", { ...request, judgeModel }, limits, state, ports))
        .rejects.toThrow("debe estar permitido y tener Imágenes activado");
    }
    expect(ports.save).toHaveBeenCalledTimes(1);
    expect(state.activeRunId()).toBeNull();
  });
});

function fixture() {
  const state = new AdmissionState();
  const run = state.acquire("eval", "r");
  const events: string[] = [];
  let tick: (() => Promise<void>) | undefined;
  const ports: RunPorts = {
    prepare: async () => { events.push("prepare"); },
    measure: async () => 0,
    saveSpent: async () => {},
    runCase: async (_run, job, _over, ledger) => {
      const id = `${job.c.id}-${job.repeat}`;
      run.inflight.add(id);
      ledger.update(id, 0.1);
      ledger.settle(id, 0.1);
      return { caseId: job.c.id, repeat: job.repeat, usd: 0.1 } as CaseResult;
    },
    failedResult: (job) => ({ caseId: job.c.id, repeat: job.repeat, status: "failed" }) as CaseResult,
    saveResult: async () => {},
    trace: () => {},
    stop: vi.fn(),
    finish: async (_run, outcome) => { events.push(`finish:${outcome.status}`); },
    cleanup: async () => { events.push("cleanup"); },
    watch: (fn) => { tick = fn; return () => { events.push("unwatch"); }; },
  };
  return { state, run, ports, events, tick: () => tick!() };
}

describe("evaluation execution ports", () => {
  it("interleaves repeats, accounts settled cost once and cleans up before releasing admission", async () => {
    const f = fixture();
    const jobs: string[] = [];
    f.ports.saveResult = async (_run, job) => { jobs.push(`${job.c.id}:${job.repeat}`); };
    f.ports.finish = async (_run, outcome) => { expect(outcome.spent).toBeCloseTo(0.4); };
    f.ports.cleanup = async () => {
      expect(f.state.activeRunId()).toBe("r");
      f.events.push("cleanup");
    };
    await executeRun(f.run, EVAL_CASES.slice(0, 2), 2, 1, 10, f.ports, () => f.state.release(f.run));
    expect(jobs).toEqual([`${EVAL_CASES[0].id}:1`, `${EVAL_CASES[1].id}:1`, `${EVAL_CASES[0].id}:2`, `${EVAL_CASES[1].id}:2`]);
    expect(f.events).toEqual(["prepare", "unwatch", "cleanup"]);
    expect(f.state.activeRunId()).toBeNull();
  });

  it("enforces concurrency and waits for other workers after persistence fails", async () => {
    const f = fixture();
    let running = 0;
    let max = 0;
    f.ports.runCase = async (_run, job) => {
      running++;
      max = Math.max(max, running);
      await new Promise((resolve) => setTimeout(resolve, 5));
      running--;
      return { caseId: job.c.id } as CaseResult;
    };
    f.ports.saveResult = async () => { throw new Error("storage failed"); };
    f.ports.cleanup = async () => { expect(running).toBe(0); };
    await executeRun(f.run, EVAL_CASES.slice(0, 3), 2, 2, 10, f.ports, () => f.state.release(f.run));
    expect(max).toBe(2);
    expect(f.events).toContain("finish:failed");
    expect(f.run.abort.signal.aborted).toBe(true);
    expect(f.state.activeRunId()).toBeNull();
  });

  it("aborts active builds at the budget and does not admit more jobs", async () => {
    const f = fixture();
    let started = 0;
    f.ports.measure = async () => 1;
    f.ports.runCase = async (_run, job, over, ledger) => {
      started++;
      f.run.inflight.add("p");
      await f.tick();
      expect(over()).toBe(true);
      ledger.settle("p", 1);
      return { caseId: job.c.id, usd: 1 } as CaseResult;
    };
    f.ports.finish = async (_run, outcome) => {
      expect(outcome).toMatchObject({ status: "done", spent: 1 });
      expect(outcome.error).toContain("Presupuesto agotado");
    };
    await executeRun(f.run, EVAL_CASES, 2, 1, 1, f.ports, () => f.state.release(f.run));
    expect(started).toBe(1);
    expect(f.ports.stop).toHaveBeenCalledWith("p");
  });

  it("ignores a stale spend measurement after a case has settled", async () => {
    const f = fixture();
    let measure: (usd: number) => void = () => {};
    f.ports.measure = () => new Promise((resolve) => { measure = resolve; });
    f.ports.runCase = async (_run, job, over, ledger) => {
      f.run.inflight.add("p");
      const tick = f.tick();
      ledger.settle("p", 0.6);
      measure(0.6);
      await tick;
      expect(over()).toBe(false);
      return { caseId: job.c.id, usd: 0.6 } as CaseResult;
    };
    f.ports.finish = async (_run, outcome) => { expect(outcome.spent).toBe(0.6); };
    await executeRun(f.run, EVAL_CASES.slice(0, 1), 1, 1, 1, f.ports, () => f.state.release(f.run));
    expect(f.ports.stop).not.toHaveBeenCalled();
  });

  it("still releases admission when final persistence and cleanup fail", async () => {
    const f = fixture();
    f.ports.finish = async () => { throw new Error("offline"); };
    f.ports.cleanup = async () => { throw new Error("offline"); };
    await executeRun(f.run, [], 1, 1, 1, f.ports, () => f.state.release(f.run));
    expect(f.state.activeRunId()).toBeNull();
  });

  it("recovers persisted runs before sweeping all disposable projects", async () => {
    const calls: string[] = [];
    await recoverRuns({
      interrupt: async () => { calls.push("interrupt"); },
      sweep: async (age) => { calls.push(`sweep:${age}`); throw new Error("cleanup"); },
    });
    expect(calls).toEqual(["interrupt", "sweep:0"]);
    calls.length = 0;
    await expect(recoverRuns({
      interrupt: async () => { throw new Error("db"); },
      sweep: async () => { calls.push("sweep"); },
    })).rejects.toThrow("db");
    expect(calls).toEqual([]);
  });
});
