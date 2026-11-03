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
    runtime() {
      if (!runtimePorts) throw new Error("Job runtime capability is not configured");
      return runtimePorts;
    },
    cron: (schedule, options, callback) => new Cron(schedule, options, callback),
  };
