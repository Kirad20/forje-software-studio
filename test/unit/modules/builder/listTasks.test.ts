import { expect, it, vi } from "vitest";
import { ListAgentTasksUseCase } from "../../../../server/modules/builder/application/ListAgentTasksUseCase.js";
import type { AgentTaskView } from "../../../../server/modules/builder/ports/AgentTaskQueries.js";

it("lists recent lanes and resolves known models while preserving unknown/null identifiers", async () => {
  const task = (id: string, modelId: string | null): AgentTaskView => ({
    id, modelId, model: modelId, turnId: "turn", role: "ui", goal: "Build",
    status: "pending", summary: null, steps: [], files: [], dependsOn: [], doneWhen: [],
    inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, usd: 0, startedAt: null, finishedAt: null,
  });
  const tasks = [task("one", "known"), task("two", "custom"), task("three", null)];
  const list = vi.fn(async () => tasks);
  const useCase = new ListAgentTasksUseCase({ list }, async () => [{ id: "known", label: "Known model" }]);
  const result = await useCase.execute("project");
  expect(list).toHaveBeenCalledWith("project");
  expect(result.map((task) => task.model)).toEqual(["Known model", "custom", null]);
  expect(tasks[0]!.model).toBe("known");
});
