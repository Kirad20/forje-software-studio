import type { AppEnv } from "../domain/contracts.js";
import type { JobPorts } from "../ports/jobs.js";

interface ClaimedJob {
  id: string;
  project_id: string;
  env: AppEnv;
  job: string;
  payload: unknown;
  trigger: string;
  attempts: number;
  lease_token: string;
}

export function createJobQueue(
  { q, newId, log, queueOptions = {} }: JobPorts,
  run: (projectId: string, env: AppEnv, name: string, payload: unknown, trigger: string) => Promise<void>,
) {
  const bounded = (value: number | undefined, fallback: number, min: number, max: number) => {
    const number = value ?? fallback;
    if (!Number.isInteger(number) || number < min || number > max) throw new Error(`Invalid jobs queue setting: ${number} (${min}..${max})`);
    return number;
  };
  const maxConcurrency = bounded(queueOptions.maxConcurrency, 4, 1, 64);
  const pollMs = bounded(queueOptions.pollMs, 1000, 10, 60_000);
  const leaseMs = bounded(queueOptions.leaseMs, 60_000, 1000, 600_000);
  const maxAttempts = bounded(queueOptions.maxAttempts, 3, 1, 10);
  const maxQueuedPerProject = bounded(queueOptions.maxQueuedPerProject, 1000, 20, 10_000);
  const active = new Set<Promise<void>>();
  let timer: ReturnType<typeof setInterval> | undefined;
  let pumping: Promise<void> | undefined;
  let generation = 0;
  let enabled = false;

  const report = (projectId: string, env: AppEnv, error: unknown) =>
    log(projectId, { env, source: "job", level: "error", message: `Cola de tareas: ${String(error)}` });

  async function enqueue(projectId: string, env: AppEnv, name: string, payload: unknown, trigger: string, service = "monolith") {
    const id = newId();
    const rows = await q("jobEnqueue", [id, projectId, env, name, JSON.stringify(payload ?? null), trigger, maxAttempts, maxQueuedPerProject, service]);
    if (!rows.length) throw new Error(`Cola de tareas llena (máximo ${maxQueuedPerProject} pendientes por proyecto)`);
    return id;
  }

  async function processJob(job: ClaimedJob) {
    let renewing: Promise<void> | undefined;
    const renew = () => {
      if (renewing) return;
      renewing = (async () => {
        const rows = await q("jobRenewLease", [job.id, job.lease_token, leaseMs]);
        if (!rows.length) throw new Error(`Lease perdida: ${job.id}`);
      })().catch((error) => report(job.project_id, job.env, error)).finally(() => { renewing = undefined; });
    };
    const heartbeat = setInterval(renew, Math.floor(leaseMs / 3));
    heartbeat.unref();
    let failed = false;
    let failure: unknown;
    try {
      await run(job.project_id, job.env, job.job, job.payload, job.trigger);
    } catch (error) {
      failed = true;
      failure = error;
    } finally {
      clearInterval(heartbeat);
      await renewing;
    }
    const rows = failed
      ? await q("jobFailQueue", [job.id, job.lease_token, String(failure).slice(0, 4000), Math.min(60_000, 1000 * 2 ** (job.attempts - 1))])
      : await q("jobCompleteQueue", [job.id, job.lease_token]);
    if (!rows.length) throw new Error(`No se pudo finalizar la tarea: lease perdida ${job.id}`);
    if (failed) report(job.project_id, job.env, failure);
  }

  async function pump(version: number) {
    const recovered = await q<{ project_id: string; env: AppEnv; id: string }>("jobRecoverQueue");
    for (const job of recovered) report(job.project_id, job.env, `Tarea ${job.id} dead: lease agotada`);
    await q("jobPruneQueue");
    if (!enabled || version !== generation) return;
    const slots = maxConcurrency - active.size;
    if (!slots) return;
    const jobs = await q<ClaimedJob>("jobClaimQueue", [slots, newId(), leaseMs, queueOptions.services?.length ? queueOptions.services : null, queueOptions.projectId ?? null]);
    if (!enabled || version !== generation) return;
    for (const job of jobs) {
      const work = processJob(job).catch((error) => report(job.project_id, job.env, error));
      active.add(work);
      void work.then(() => active.delete(work));
    }
  }
  function poll() {
    if (!enabled) return Promise.resolve();
    if (pumping) return pumping;
    pumping = pump(generation).finally(() => { pumping = undefined; });
    return pumping;
  }
  async function start() {
    if (enabled) return;
    enabled = true;
    const version = generation;
    try {
      await poll();
      if (!enabled || version !== generation) return;
      timer = setInterval(() => { void poll().catch((error) => console.error("[forja] jobs queue:", error)); }, pollMs);
      timer.unref();
    } catch (error) {
      await stop();
      throw error;
    }
  }
  async function stop() {
    enabled = false;
    generation++;
    if (timer) clearInterval(timer);
    timer = undefined;
    await Promise.allSettled(pumping ? [pumping] : []);
    await Promise.all([...active]);
  }
  return { enqueue, start, stop, poll, maxAttempts, maxQueuedPerProject, mode: queueOptions.mode ?? "embedded", isStarted: () => enabled };
}
