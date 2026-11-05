import type { AppEnv } from "./context.js";
import type { JobPorts, JobCron } from "../ports/jobs.js";
import { JOB_LIMITS as LIMITS } from "../domain/policies.js";
import { createJobQueue } from "./jobQueue.js";
export { JOB_LIMITS as LIMITS } from "../domain/policies.js";

export function createJobs(ports: JobPorts) {
  const { q, newId, log, bindJobs, runtime, cron: makeCron } = ports;
  const queue = createJobQueue(ports, runJob);
  const running = new Map<string, Promise<void>>();
  const inFlight = new Set<Promise<unknown>>();
  const crons = new Map<string, JobCron[]>();
  let pollTimer: ReturnType<typeof setInterval> | undefined;
  let starting: Promise<void> | undefined;
  let generation = 0;
  function track<T>(work: Promise<T>): Promise<T> {
    inFlight.add(work);
    void work.then(() => inFlight.delete(work), () => inFlight.delete(work));
    return work;
  }
  function report(projectId: string, env: AppEnv, error: unknown) {
    log(projectId, { env, level: "error", source: "job", message: `Tarea falló: ${String(error)}` });
  }
  function validatePayload(payload: unknown) {
    if (new TextEncoder().encode(JSON.stringify(payload ?? null)).length > LIMITS.maxPayloadBytes) throw new Error("La carga de la tarea supera 100 KB");
  }
  function runJob(projectId: string, env: AppEnv, name: string, payload: unknown, trigger: string): Promise<void> {
    return track(executeJob(projectId, env, name, payload, trigger));
  }
  async function enqueueJob(projectId: string, env: AppEnv, name: string, payload: unknown, trigger = "background"): Promise<string> {
    validatePayload(payload);
    const rt = runtime();
    const files = env === "published" ? (await rt.publishedFiles(projectId)) ?? {} : await rt.readAllFiles(projectId);
    const job = rt.jobFiles(files).find((job) => job.name === name);
    if (!job) throw new Error(`No existe la tarea jobs/${name}.ts`);
    const execution = rt.resolveExecution?.(files, job.file);
    return track(queue.enqueue(projectId, env, name, payload, trigger, execution?.service));
  }
  async function executeJob(projectId: string, env: AppEnv, name: string, payload: unknown, trigger: string) {
    validatePayload(payload);
    const rt = runtime();
    const files = env === "published" ? (await rt.publishedFiles(projectId)) ?? {} : await rt.readAllFiles(projectId);
    const job = rt.jobFiles(files).find((j) => j.name === name);
    if (!job) throw new Error(`No existe la tarea jobs/${name}.ts`);
    const [run] = await q<{ id: number }>(
      "jobCreateRun", [projectId, name, trigger]);
    try {
      const mod = await rt.compileServerModule(files, job.file);
      let base = rt.previewOrigin(projectId);
      if (env === "published") {
        const [project] = await q<{ slug: string }>("jobProjectSlug", [projectId]);
        base = project?.slug ? rt.appUrl(project.slug) : "";
      }
      const execution = rt.resolveExecution?.(files, job.file);
      await rt.runInSandbox(projectId, "job", { env_name: env, file: mod.file, base, payload, job: name, ...(execution ? { execution } : {}) }, "job");
      await q("jobCompleteRun", [run!.id]);
      log(projectId, { env, level: "info", source: "job", message: `Tarea ${name} (${trigger}) terminada` });
    } catch (error) {
      await q("jobFailRun", [run!.id, (error as Error).message]);
      report(projectId, env, error);
      throw error;
    }
  }
  async function addTimer(projectId: string, env: AppEnv, name: string, payload: unknown, runAt: Date) {
    const delay = runAt.getTime() - Date.now();
    if (!Number.isFinite(delay) || delay < LIMITS.minDelayMs || delay > LIMITS.maxDelayMs) throw new Error("Un temporizador debe ser de 1 minuto a 7 días");
    validatePayload(payload);
    const rt = runtime();
    const files = env === "published" ? (await rt.publishedFiles(projectId)) ?? {} : await rt.readAllFiles(projectId);
    const job = rt.jobFiles(files).find((job) => job.name === name);
    if (!job) throw new Error(`No existe la tarea jobs/${name}.ts`);
    const service = rt.resolveExecution?.(files, job.file)?.service ?? "monolith";
    const [count] = await q<{ n: number }>("jobPendingCount", [projectId]);
    if (count!.n >= LIMITS.timersPerProject) throw new Error("Máximo 25 temporizadores pendientes por proyecto");
    const id = newId();
    await q("jobCreateTimer",
      [id, projectId, env, name, JSON.stringify(payload ?? null), runAt.toISOString(), service]);
    return id;
  }
  function initializeAppServices() { bindJobs({ runNow: runJob, enqueue: enqueueJob, addTimer }); }
  async function fireDueTimers() {
    const version = generation;
    const due = await q<{ project_id: string; env: AppEnv; job: string }>(
      "jobPromoteTimers", [queue.maxAttempts, queue.maxQueuedPerProject]);
    if (version !== generation) return;
    for (const timer of due) log(timer.project_id, { env: timer.env, level: "info", source: "job", message: `Temporizador ${timer.job} encolado` });
  }
  async function scheduleProject(projectId: string) {
    const version = generation;
    crons.get(projectId)?.forEach((cron) => cron.stop());
    crons.delete(projectId);
    const rt = runtime();
    const files = await rt.publishedFiles(projectId);
    if (!files) return;
    const disabled = new Set((await q<{ job: string }>("jobDisabled", [projectId])).map((row) => row.job));
    if (version !== generation) return;
    const list: JobCron[] = [];
    for (const job of rt.jobFiles(files).slice(0, LIMITS.scheduledPerProject)) {
      const { schedule, timezone } = rt.readJobSettings(files[job.file]!);
      if (!schedule || disabled.has(job.name)) continue;
      let cron: JobCron;
      try {
        cron = makeCron(schedule, { timezone: timezone ?? "UTC", protect: true }, () => {
          if (version !== generation) return;
          const key = `${projectId}:${job.name}`;
          if (running.has(key)) return;
          const work = enqueueJob(projectId, "published", job.name, null, "schedule").then(() => {}).catch((error) => report(projectId, "published", error));
          running.set(key, work);
          void work.finally(() => running.delete(key));
        });
      } catch (error) {
        log(projectId, { env: "published", level: "error", source: "job", message: `jobs/${job.name}: horario no válido (${(error as Error).message})` });
        continue;
      }
      const [a, b] = cron.nextRuns(2);
      if (a && b && b.getTime() - a.getTime() < LIMITS.minIntervalMinutes * 60_000) {
        cron.stop();
        log(projectId, { env: "published", level: "error", source: "job", message: `jobs/${job.name}: el intervalo mínimo es de 5 minutos` });
      } else list.push(cron);
    }
    crons.set(projectId, list);
  }
  async function listJobs(projectId: string) {
    const rt = runtime();
    const files = await rt.readAllFiles(projectId);
    const settings = new Map((await q<{ job: string; enabled: boolean }>("jobSettings", [projectId])).map((row) => [row.job, row.enabled]));
    const active = new Map((crons.get(projectId) ?? []).map((cron) => [cron.getPattern(), cron]));
    const jobs = rt.jobFiles(files).map((job) => {
      const { schedule, timezone } = rt.readJobSettings(files[job.file]!);
      return { name: job.name, schedule, timezone, enabled: settings.get(job.name) ?? true, nextRun: schedule ? active.get(schedule)?.nextRun()?.toISOString() ?? null : null };
    });
    const runs = await q("jobRuns", [projectId]);
    const timers = await q("jobTimers", [projectId]);
    const queued = await q("jobQueue", [projectId]);
    return { jobs, runs, timers, queue: queued };
  }
  async function setJobEnabled(projectId: string, job: string, enabled: boolean) {
    await q("jobSetEnabled", [projectId, job, enabled]);
  }
  async function cancelTimer(projectId: string, id: string) {
    await q("jobCancelTimer", [projectId, id]);
  }
  async function startJobRunner(options: { queueOnly?: boolean } = {}) {
    if (starting) return starting;
    if (pollTimer || queue.isStarted()) return;
    runtime();
    initializeAppServices();
    const version = generation;
    starting = (async () => {
      if (options.queueOnly) {
        await queue.start();
        return;
      }
      const published = await q<{ id: string }>("jobPublishedProjects");
      for (const project of published) {
        if (version !== generation) return;
        if (queue.mode === "embedded") await queue.start();
        if (version !== generation) return;
        await scheduleProject(project.id);
      }
      if (version !== generation) return;
      pollTimer = setInterval(() => void track(fireDueTimers()).catch((error) => console.error("[forja] temporizadores:", error)), 15_000);
      pollTimer.unref();
    })();
    try { await starting; } catch (error) { await stopJobRunner(); throw error; }
    finally { starting = undefined; }
  }
  async function stopJobRunner() {
    generation++;
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = undefined;
    for (const list of crons.values()) for (const cron of list) cron.stop();
    crons.clear();
    await queue.stop();
    await Promise.allSettled([...inFlight, ...(starting ? [starting] : [])]);
    while (inFlight.size) await Promise.allSettled([...inFlight]);
  }
  return { runJob, enqueueJob, addTimer, scheduleProject, listJobs, setJobEnabled, cancelTimer, startJobRunner, stopJobRunner, initializeAppServices, isJobRunnerStarted: () => !!pollTimer || queue.isStarted() };
}
