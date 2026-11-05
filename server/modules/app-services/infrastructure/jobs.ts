import { Cron } from "croner";
import { newId } from "../../../shared/crypto.js";
import { platformRepository } from "./repositories.js";
import { log } from "./observer.js";
import { bindJobs } from "../context.js";
import type { JobRuntimePorts, JobPorts } from "../ports/jobs.js";
let runtimePorts: JobRuntimePorts | undefined;
let registration: symbol | undefined;
export function configureJobRuntime(ports: JobRuntimePorts): () => void {
  const token = Symbol();
  runtimePorts = ports;
  registration = token;
  return () => {
    if (registration !== token) return;
    runtimePorts = undefined;
    registration = undefined;
  };
}
export const jobPorts: JobPorts = { q: platformRepository.q, newId, log, bindJobs,
    queueOptions: {
      mode: (() => {
        const mode = process.env.FORJA_JOB_WORKER_MODE ?? "embedded";
        if (mode !== "embedded" && mode !== "external") throw new Error("FORJA_JOB_WORKER_MODE must be embedded or external");
        return mode;
      })(),
      maxConcurrency: process.env.FORJA_JOB_CONCURRENCY ? Number(process.env.FORJA_JOB_CONCURRENCY) : undefined,
      pollMs: process.env.FORJA_JOB_POLL_MS ? Number(process.env.FORJA_JOB_POLL_MS) : undefined,
      leaseMs: process.env.FORJA_JOB_LEASE_MS ? Number(process.env.FORJA_JOB_LEASE_MS) : undefined,
      maxAttempts: process.env.FORJA_JOB_MAX_ATTEMPTS ? Number(process.env.FORJA_JOB_MAX_ATTEMPTS) : undefined,
      maxQueuedPerProject: process.env.FORJA_JOB_QUEUE_LIMIT ? Number(process.env.FORJA_JOB_QUEUE_LIMIT) : undefined,
      services: process.env.FORJA_JOB_WORKER_SERVICES
        ? process.env.FORJA_JOB_WORKER_SERVICES.split(",").map((name) => name.trim()).filter(Boolean) : undefined,
      projectId: process.env.FORJA_JOB_WORKER_PROJECT_ID || undefined,
    },
    runtime() {
      if (!runtimePorts) throw new Error("Job runtime capability is not configured");
      return runtimePorts;
    },
    cron: (schedule, options, callback) => new Cron(schedule, options, callback),
  };
