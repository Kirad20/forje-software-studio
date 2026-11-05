import type { QueryRepository } from "./repositories.js";
import type { ObserverPorts } from "./observer.js";
import type { JobsApi } from "./context.js";
export interface JobRuntimePorts {
  resolveExecution?(files: Record<string, string>, file: string): { service: string; replicas: number; maxConcurrency: number } | undefined;
  publishedFiles(projectId: string): Promise<Record<string, string> | null | undefined>;
  readAllFiles(projectId: string): Promise<Record<string, string>>;
  jobFiles(files: Record<string, string>): { name: string; file: string }[];
  readJobSettings(code: string): { schedule?: string | null; timezone?: string | null };
  compileServerModule(files: Record<string, string>, file: string): Promise<{ file: string }>;
  runInSandbox(projectId: string, kind: "job", input: { env_name: "preview" | "published"; file: string; base: string; payload: unknown; job: string; execution?: { service: string; replicas: number; maxConcurrency: number } }, source: "job"): Promise<unknown>;
  appUrl(slug: string): string;
  previewOrigin(projectId: string): string;
}
export interface JobCron {
  stop(): unknown;
  nextRuns(count: number): Date[];
  nextRun(): Date | null;
  getPattern(): string | undefined;
}
export interface JobPorts extends Pick<QueryRepository, "q">, ObserverPorts {
  queueOptions?: { mode?: "embedded" | "external"; maxConcurrency?: number; pollMs?: number; leaseMs?: number; maxAttempts?: number; maxQueuedPerProject?: number; services?: string[]; projectId?: string };
  newId(): string;
  bindJobs(api: JobsApi): void;
  runtime(): JobRuntimePorts;
  cron(schedule: string, options: { timezone: string; protect: boolean }, callback: () => void): JobCron;
}
