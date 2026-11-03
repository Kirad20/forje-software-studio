export interface LifecycleService {
  name: string;
  start(): Promise<void>;
  stop(): Promise<void>;
}

export class ApplicationLifecycle {
  private readonly acquired: LifecycleService[] = [];
  private startup?: Promise<void>;
  private shutdown?: Promise<void>;

  constructor(private readonly services: LifecycleService[]) {}

  start(): Promise<void> {
    if (this.shutdown) return Promise.reject(new Error("Cannot start after shutdown"));
    this.startup ??= this.acquire();
    return this.startup;
  }

  stop(): Promise<void> {
    this.shutdown ??= this.releaseAfterStartup();
    return this.shutdown;
  }

  private async acquire(): Promise<void> {
    try {
      for (const service of this.services) {
        await service.start();
        this.acquired.push(service);
      }
    } catch (startupError) {
      try {
        await this.release();
      } catch (cleanupError) {
        throw new AggregateError([startupError, cleanupError], "Startup and rollback failed");
      }
      throw startupError;
    }
  }

  private async releaseAfterStartup(): Promise<void> {
    if (this.startup) {
      await this.startup;
    }
    await this.release();
  }

  private async release(): Promise<void> {
    const errors: Error[] = [];
    for (const service of this.acquired.splice(0).reverse()) {
      try {
        await service.stop();
      } catch (cause) {
        errors.push(new Error(`Failed to stop ${service.name}`, { cause }));
      }
    }
    if (errors.length) throw new AggregateError(errors, errors.map((error) => error.message).join("; "));
  }
}
