import { randomUUID } from "node:crypto";
import { q } from "./database/index.js";
import { cleanupOperationalEvents } from "./operationalLog.js";

export interface ProjectLogMetadata {
  projectId: string;
  env: "preview" | "published";
  level: "info" | "warn" | "error";
  source: "request" | "endpoint" | "job" | "email" | "ai" | "build" | "client";
  at: string;
}

type QueuedLog = ProjectLogMetadata & { eventId: string };
const queue: QueuedLog[] = [];
const maxQueued = 5000;
const batchSize = 100;
let timer: NodeJS.Timeout | undefined;
let draining: Promise<void> | undefined;
let overflowReported = false;
let inFlight = 0;

function schedule(delay: number) {
  if (timer) return;
  timer = setTimeout(() => {
    timer = undefined;
    void flushProjectLogs().catch(() => {});
  }, delay);
  timer.unref();
}

export function recordProjectLog(entry: ProjectLogMetadata): void {
  if (!/^[A-Za-z0-9_.-]{1,80}$/.test(entry.projectId) ||
      !["preview", "published"].includes(entry.env) ||
      !["info", "warn", "error"].includes(entry.level) ||
      !["request", "endpoint", "job", "email", "ai", "build", "client"].includes(entry.source) ||
      !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(entry.at) || !Number.isFinite(Date.parse(entry.at))) {
    console.error("[operational-log] invalid project event metadata; event not persisted");
    return;
  }
  if (queue.length + inFlight >= maxQueued) {
    if (!overflowReported) console.error("[operational-log] project event queue is full; events are being dropped");
    overflowReported = true;
    return;
  }
  queue.push({
    projectId: entry.projectId, env: entry.env, level: entry.level, source: entry.source,
    at: entry.at, eventId: randomUUID(),
  });
  schedule(100);
}

export function flushProjectLogs(): Promise<void> {
  if (timer) {
    clearTimeout(timer);
    timer = undefined;
  }
  if (draining) return draining;
  const run = async () => {
    while (queue.length) {
      const batch = queue.splice(0, batchSize);
      inFlight = batch.length;
      try {
        await q(
          `insert into operational_events (event_key, created_at, service, event, project_id, env, level, source)
           select x."eventId"::uuid, x.at::timestamptz, 'project', 'project_log', x."projectId", x.env, x.level, x.source
           from jsonb_to_recordset($1::jsonb) as x("eventId" text, "projectId" text, env text, level text, source text, at text)
           on conflict (event_key) do nothing`,
          [JSON.stringify(batch)],
        );
        overflowReported = false;
      } catch (error) {
        queue.unshift(...batch);
        console.error("[operational-log] failed to persist project events:", error instanceof Error ? error.name : "unknown error");
        schedule(5000);
        throw error;
      } finally {
        inFlight = 0;
      }
    }
    await cleanupOperationalEvents();
  };
  draining = run().finally(() => {
    draining = undefined;
    if (queue.length) schedule(100);
  });
  return draining;
}

export async function flushProjectLogsForShutdown(timeoutMs = 5000): Promise<void> {
  let deadline: NodeJS.Timeout | undefined;
  try {
    await Promise.race([
      flushProjectLogs(),
      new Promise<never>((_, reject) => {
        deadline = setTimeout(() => reject(new Error("Timed out flushing project logs")), timeoutMs);
      }),
    ]);
  } finally {
    if (deadline) clearTimeout(deadline);
  }
}
