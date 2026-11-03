export class BuilderRunRegistry {
  private readonly runs = new Map<string, { cancel(): void; task: Promise<void> }>();
  private stopping?: Promise<void>;
  private closed = false;

  isRunning(projectId: string): boolean {
    return this.runs.has(projectId);
  }

  cancel(projectId: string): void {
    this.runs.get(projectId)?.cancel();
  }

  run(projectId: string, cancel: () => void, execute: () => Promise<void>): Promise<void> {
    if (this.closed) return Promise.reject(new Error("El constructor está detenido."));
    if (this.isRunning(projectId)) return Promise.reject(new Error("El constructor ya está trabajando en este proyecto."));
    const task = Promise.resolve().then(execute);
    this.runs.set(projectId, { cancel, task });
    void task.then(() => this.runs.delete(projectId), () => this.runs.delete(projectId));
    return task;
  }

  stop(): Promise<void> {
    if (this.stopping) return this.stopping;
    this.closed = true;
    const tasks = [...this.runs.values()];
    for (const run of tasks) run.cancel();
    this.stopping = Promise.allSettled(tasks.map((run) => run.task)).then((results) => {
      const errors = results.flatMap((result) => result.status === "rejected" ? [result.reason] : []);
      if (errors.length) throw new AggregateError(errors, "Builder shutdown failed");
    });
    return this.stopping;
  }
}
