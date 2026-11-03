export class ScheduleTasksUseCase {
  async execute<Task extends { id: string; dependsOn: string[] }, Result>(
    tasks: Task[], limit: number, signal: { readonly aborted: boolean }, run: (task: Task) => Promise<Result>,
  ): Promise<Map<string, Result | Error>> {
    if (!Number.isInteger(limit) || limit < 1) throw new Error("Task parallelism limit must be a positive integer");
    if (new Set(tasks.map(t => t.id)).size !== tasks.length) throw new Error("Task ids must not be duplicate");
    const results = new Map<string, Result | Error>();
    const running = new Map<string, Promise<void>>();
    while (results.size < tasks.length) {
      if (signal.aborted) throw new Error("Detenido.");
      const ready = tasks.filter(t => !results.has(t.id) && !running.has(t.id) && t.dependsOn.every(d => results.has(d)));
      for (const task of ready.slice(0, Math.max(0, limit - running.size))) {
        running.set(task.id, Promise.resolve().then(() => run(task))
          .then(result => { results.set(task.id, result); })
          .catch(error => { results.set(task.id, error instanceof Error ? error : new Error(String(error))); })
          .finally(() => { running.delete(task.id); }));
      }
      if (!running.size) throw new Error("Task dependencies cannot be satisfied");
      await Promise.race(running.values());
    }
    return results;
  }
}
