import { Cron } from "croner";
import { config } from "../config.js";
import { newId } from "../lib/crypto.js";
import { q } from "../platform/db.js";
import { log } from "../platform/events.js";
import { publishedFiles, readAllFiles } from "../platform/projects.js";
import { jobFiles, loadServerModule } from "../runtime/bundler.js";
import { appUrl, previewOrigin } from "../runtime/urls.js";
import { bindJobs, serviceContext, type AppEnv, type JobContext } from "./context.js";

/**
 * Three kinds of work outside a request, as in the product:
 *  - background task: `ctx.jobs.run(name, payload)` — starts now;
 *  - timer: `ctx.jobs.runAt(name, payload, when)` — once, 1 min to 7 days out;
 *  - scheduled job: `export const schedule = "0 8 * * *"` in jobs/<name>.ts — only in the
 *    published app, with the code of the last publish.
 */
export const LIMITS = {
  scheduledPerProject: 10,
  minIntervalMinutes: 5,
  timersPerProject: 25,
  maxDelayMs: 7 * 24 * 3600_000,
  minDelayMs: 60_000,
  maxPayloadBytes: 100 * 1024,
};

const running = new Map<string, Promise<void>>();

async function filesFor(projectId: string, env: AppEnv) {
  return env === "published" ? ((await publishedFiles(projectId)) ?? {}) : readAllFiles(projectId);
}

/** Absolute origin of the app, so URLs a job builds (in emails, say) work outside the browser. */
async function baseFor(projectId: string, env: AppEnv) {
  if (env === "preview") return previewOrigin(projectId);
  const p = (await q<{ slug: string }>(`select slug from projects where id = $1`, [projectId]))[0];
  return p?.slug ? appUrl(p.slug) : "";
}

export async function runJob(projectId: string, env: AppEnv, name: string, payload: unknown, trigger: string) {
  if (JSON.stringify(payload ?? null).length > LIMITS.maxPayloadBytes) throw new Error("La carga de la tarea supera 100 KB");
  const files = await filesFor(projectId, env);
  const job = jobFiles(files).find((j) => j.name === name);
  if (!job) throw new Error(`No existe la tarea jobs/${name}.ts`);
  const [run] = await q<{ id: number }>(`insert into job_runs (project_id, job, trigger, status) values ($1, $2, $3, 'running') returning id`, [
    projectId,
    name,
    trigger,
  ]);
  try {
    const mod = await loadServerModule(files, job.file);
    const handler = mod.default as (ctx: JobContext) => Promise<unknown>;
    const ctx: JobContext = { ...(await serviceContext(projectId, env, await baseFor(projectId, env), "job")), payload, job: name };
    await withTimeout(handler(ctx), config.maxRunMs);
    await q(`update job_runs set status = 'ok', finished_at = now() where id = $1`, [run!.id]);
    log(projectId, { env, level: "info", source: "job", message: `Tarea ${name} (${trigger}) terminada` });
  } catch (e) {
    await q(`update job_runs set status = 'error', error = $2, finished_at = now() where id = $1`, [run!.id, (e as Error).message]);
    log(projectId, { env, level: "error", source: "job", message: `Tarea ${name} (${trigger}) falló: ${(e as Error).stack ?? e}` });
    throw e;
  }
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let t: NodeJS.Timeout;
  return Promise.race([p, new Promise<never>((_, rej) => (t = setTimeout(() => rej(new Error("Tiempo máximo de 15 minutos")), ms)))]).finally(
    () => clearTimeout(t),
  );
}

async function addTimer(projectId: string, env: AppEnv, name: string, payload: unknown, runAt: Date) {
  const delay = runAt.getTime() - Date.now();
  if (delay < LIMITS.minDelayMs || delay > LIMITS.maxDelayMs) throw new Error("Un temporizador debe ser de 1 minuto a 7 días");
  const [{ n }] = (await q<{ n: number }>(`select count(*)::int as n from job_timers where project_id = $1 and status = 'pending'`, [projectId])) as [
    { n: number },
  ];
  if (n >= LIMITS.timersPerProject) throw new Error("Máximo 25 temporizadores pendientes por proyecto");
  const id = newId();
  await q(`insert into job_timers (id, project_id, env, job, payload, run_at) values ($1, $2, $3, $4, $5, $6)`, [
    id,
    projectId,
    env,
    name,
    JSON.stringify(payload ?? null),
    runAt.toISOString(),
  ]);
  return id;
}

bindJobs({ runNow: runJob, addTimer });

// --- Timer poller -------------------------------------------------------------------

async function fireDueTimers() {
  const due = await q<{ id: string; project_id: string; env: AppEnv; job: string; payload: unknown }>(
    `update job_timers set status = 'fired' where id in (select id from job_timers where status = 'pending' and run_at <= now() limit 20)
     returning id, project_id, env, job, payload`,
  );
  for (const t of due) void runJob(t.project_id, t.env, t.job, t.payload, "timer").catch(() => {});
}

// --- Cron for published apps -----------------------------------------------------

const crons = new Map<string, Cron[]>();

export async function scheduleProject(projectId: string) {
  crons.get(projectId)?.forEach((c) => c.stop());
  crons.delete(projectId);
  const files = await publishedFiles(projectId);
  if (!files) return;
  const disabled = new Set(
    (await q<{ job: string }>(`select job from job_settings where project_id = $1 and not enabled`, [projectId])).map((r) => r.job),
  );
  const list: Cron[] = [];
  for (const job of jobFiles(files).slice(0, LIMITS.scheduledPerProject)) {
    let mod: Record<string, unknown>;
    try {
      mod = await loadServerModule(files, job.file);
    } catch {
      continue;
    }
    const schedule = mod.schedule as string | undefined;
    if (!schedule || disabled.has(job.name)) continue;
    const cron = new Cron(schedule, { timezone: (mod.timezone as string) ?? "UTC", protect: true }, () => {
      const key = `${projectId}:${job.name}`;
      // One run at a time: skip when the previous run is still going.
      if (running.has(key)) return;
      const p = runJob(projectId, "published", job.name, null, "schedule").catch(() => {});
      running.set(key, p);
      void p.finally(() => running.delete(key));
    });
    const [a, b] = cron.nextRuns(2);
    if (a && b && b.getTime() - a.getTime() < LIMITS.minIntervalMinutes * 60_000) {
      cron.stop();
      log(projectId, { env: "published", level: "error", source: "job", message: `jobs/${job.name}: el intervalo mínimo es de 5 minutos` });
      continue;
    }
    list.push(cron);
  }
  crons.set(projectId, list);
}

export async function listJobs(projectId: string) {
  const files = await readAllFiles(projectId);
  const settings = new Map(
    (await q<{ job: string; enabled: boolean }>(`select job, enabled from job_settings where project_id = $1`, [projectId])).map((r) => [r.job, r.enabled]),
  );
  const active = new Map((crons.get(projectId) ?? []).map((c) => [c.getPattern(), c]));
  const jobs = [];
  for (const j of jobFiles(files)) {
    let schedule: string | null = null;
    let timezone: string | null = null;
    try {
      const mod = await loadServerModule(files, j.file);
      schedule = (mod.schedule as string) ?? null;
      timezone = (mod.timezone as string) ?? null;
    } catch {
      /* reported by the build check */
    }
    jobs.push({
      name: j.name,
      schedule,
      timezone,
      enabled: settings.get(j.name) ?? true,
      nextRun: schedule ? (active.get(schedule)?.nextRun()?.toISOString() ?? null) : null,
    });
  }
  const runs = await q(
    `select id, job, trigger, status, error, started_at as "startedAt", finished_at as "finishedAt" from job_runs where project_id = $1 order by id desc limit 50`,
    [projectId],
  );
  const timers = await q(
    `select id, job, env, run_at as "runAt", status from job_timers where project_id = $1 and status = 'pending' order by run_at`,
    [projectId],
  );
  return { jobs, runs, timers };
}

export async function setJobEnabled(projectId: string, job: string, enabled: boolean) {
  await q(
    `insert into job_settings (project_id, job, enabled) values ($1, $2, $3) on conflict (project_id, job) do update set enabled = excluded.enabled`,
    [projectId, job, enabled],
  );
}

export async function cancelTimer(projectId: string, id: string) {
  await q(`update job_timers set status = 'cancelled' where project_id = $1 and id = $2 and status = 'pending'`, [projectId, id]);
}

export async function startJobRunner() {
  setInterval(() => void fireDueTimers().catch((e) => console.error("[forja] temporizadores:", e)), 15_000).unref();
  const published = await q<{ id: string }>(`select id from projects where published_version_id is not null`);
  for (const p of published) await scheduleProject(p.id).catch((e) => console.error("[forja] cron", p.id, e));
}
