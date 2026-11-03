import { describe, expect, it, vi } from "vitest";
import { TaskLifecycleUseCase } from "../../../../server/modules/builder/application/TaskLifecycleUseCase.js";
import { CreateFinishGateUseCase } from "../../../../server/modules/builder/application/CreateFinishGateUseCase.js";

describe("persisting agent task lifecycle through a repository", () => {
  it("preserves task keys, ownership, costs and cache token accounting", async () => {
    const repository = { insert: vi.fn(async (_task: any) => {}), start: vi.fn(async (_id: string, _model: string) => {}), finish: vi.fn(async (_id: string, _completion: any) => {}) };
    const lifecycle = new TaskLifecycleUseCase(repository);
    const task = { id: "ui", role: "ui", goal: "build", files: ["pages/a.tsx"], dependsOn: ["data"] };
    await lifecycle.insert({ projectId: "p", turnId: "t" }, task);
    await lifecycle.start("t", "ui", "model");
    await lifecycle.finish("t", "ui", { text: "done", steps: [{ tool: "write_file", summary: "a", ok: true }], usage: { input: 1, output: 2, cacheRead: 3, cacheWrite: 4 }, usd: 0.1 });
    expect(repository.insert).toHaveBeenCalledWith({ ...task, id: "t:ui", projectId: "p", turnId: "t" });
    expect(repository.start).toHaveBeenCalledWith("t:ui", "model");
    expect(repository.finish).toHaveBeenCalledWith("t:ui", { status: "done", summary: "done", steps: [{ tool: "write_file", summary: "a", ok: true }], inputTokens: 5, outputTokens: 2, cacheReadTokens: 3, usd: 0.1 });
  });
  it("records execution failure rather than presenting it as success and propagates database failures", async () => {
    const repository = { insert: vi.fn(async (_task: any) => {}), start: vi.fn(async (_id: string, _model: string) => {}), finish: vi.fn(async (_id: string, _completion: any) => {}) };
    const lifecycle = new TaskLifecycleUseCase(repository);
    await lifecycle.finish("t", "x", new Error("failed"));
    expect(repository.finish.mock.calls[0]).toEqual(["t:x", { status: "failed", summary: "failed", steps: [], inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, usd: 0 }]);
    repository.insert.mockRejectedValueOnce(new Error("db down"));
    await expect(lifecycle.insert({ projectId: "p", turnId: "t" }, { id: "x", role: "ui", goal: "g", files: [], dependsOn: [] })).rejects.toThrow("db down");
  });
});

describe("automatic finish gate through verification ports", () => {
  it("compares only new owned problems without treating moved lines as new errors", async () => {
    const old = { file: "pages/a.tsx", text: "old", line: 1 };
    const fresh = { file: "pages/a.tsx", text: "new" };
    const verify = vi.fn().mockResolvedValueOnce([old]).mockResolvedValueOnce([{ ...old, line: 20 }, fresh, { file: "endpoints/b_GET.ts", text: "other" }]);
    const ports = { now: () => 10, watch: vi.fn(), verify, runtimeProblems: () => [], formatBuild: (p: { text: string }) => p.text, formatRuntime: () => "" };
    const gate = await new CreateFinishGateUseCase(ports).execute("p", { owned: ["pages/"] });
    expect(await gate.check()).toBe("## Compilación y tipos\nnew");
    expect(ports.watch).toHaveBeenCalledWith("p");
  });
  it("propagates unavailable verification and returns null for a clean project", async () => {
    const ports = { now: () => 10, watch: vi.fn(), verify: vi.fn(async () => []), runtimeProblems: () => [], formatBuild: () => "", formatRuntime: () => "" };
    const gate = await new CreateFinishGateUseCase(ports).execute("p", {});
    expect(await gate.check()).toBe(null);
    ports.verify.mockRejectedValueOnce(new Error("verifier failed"));
    await expect(gate.check()).rejects.toThrow("verifier failed");
  });
});
