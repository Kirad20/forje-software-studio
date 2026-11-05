import pg from "pg";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { freshDatabase } from "../../../helpers/pg.mjs";
import { migrate } from "../../../../server/shared/database/migrate.js";
import { createQueryRepository } from "../../../../server/modules/app-services/infrastructure/repositories.js";
import { createJobQueue } from "../../../../server/modules/app-services/application/jobQueue.js";
import { createJobs } from "../../../../server/modules/app-services/application/jobs.js";

const database = await freshDatabase();
const pool = new pg.Pool({ connectionString: database.url });
const repository = createQueryRepository({
  q: async (sql, params) => (await pool.query(sql, params)).rows,
  one: async (sql, params) => (await pool.query(sql, params)).rows[0],
});
const ports = {
  ...repository, newId: randomUUID, log: vi.fn(), bindJobs: vi.fn(), cron: vi.fn(),
  runtime: () => ({
    publishedFiles: async () => ({}), readAllFiles: async () => ({}),
    jobFiles: () => [{ name: "task", file: "jobs/task.ts" }], readJobSettings: () => ({}),
    compileServerModule: async () => ({ file: "compiled" }), runInSandbox: vi.fn(),
    appUrl: () => "https://app", previewOrigin: () => "https://preview",
  }),
  queueOptions: { maxConcurrency: 2, maxAttempts: 2, maxQueuedPerProject: 20, pollMs: 60_000, leaseMs: 1000 },
};

beforeAll(async () => {
  await migrate(pool);
  await pool.query("insert into accounts (id, email) values ('a', 'queue@example.test')");
  await pool.query("insert into projects (id, owner_id, name) values ('p', 'a', 'Queue')");
});
beforeEach(async () => {
  await pool.query("truncate job_queue, job_queue_capacity, job_timers");
  ports.log.mockClear();
});
afterAll(async () => { await pool.end(); await database.drop(); });

describe("durable jobs on real PostgreSQL", () => {
  it("scopes atomic claims to one generated project's selected services before limiting", async () => {
    await pool.query("insert into projects (id, owner_id, name) values ('other', 'a', 'Other') on conflict do nothing");
    const enqueue = createJobQueue(ports, vi.fn());
    const api = createJobs({
      ...ports,
      runtime: () => ({ ...ports.runtime(), resolveExecution: () => ({ service: "invoices", replicas: 2, maxConcurrency: 1 }) }),
    });
    const invoice = await api.enqueueJob("p", "preview", "task", {}, "background");
    await enqueue.enqueue("other", "preview", "task", {}, "background", "invoices");
    await enqueue.enqueue("p", "preview", "task", {}, "background", "orders");
    const run = vi.fn();
    const invoices = createJobQueue({ ...ports, queueOptions: { ...ports.queueOptions, services: ["invoices"], projectId: "p", maxConcurrency: 1 } }, run);
    await invoices.start();
    await vi.waitFor(() => expect(run).toHaveBeenCalledTimes(1));
    await invoices.stop();
    expect((await pool.query("select service, status from job_queue where id=$1", [invoice])).rows[0])
      .toEqual({ service: "invoices", status: "completed" });
    expect((await pool.query("select count(*)::int as n from job_queue where status='queued'")).rows[0].n).toBe(2);
  });
  it("bounds concurrent durable acceptance and releases capacity only once", async () => {
    const queue = createJobQueue(ports, vi.fn());
    const results = await Promise.allSettled(Array.from({ length: 30 }, () => queue.enqueue("p", "preview", "task", {}, "background")));
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(20);
    expect((await pool.query("select pending from job_queue_capacity")).rows[0].pending).toBe(20);
    const [job] = await repository.q<any>("jobClaimQueue", [1, "owner", 1000, null, null]);
    expect(await repository.q("jobCompleteQueue", [job.id, "wrong"])).toEqual([]);
    expect(await repository.q("jobCompleteQueue", [job.id, "owner"])).toHaveLength(1);
    expect(await repository.q("jobCompleteQueue", [job.id, "owner"])).toEqual([]);
    await expect(queue.enqueue("p", "preview", "task", {}, "background")).resolves.toBeTypeOf("string");
  });

  it("skips locked rows, atomically divides claims, and fences recovered leases", async () => {
    const queue = createJobQueue(ports, vi.fn());
    const first = await queue.enqueue("p", "preview", "task", 1, "background");
    await queue.enqueue("p", "preview", "task", 2, "background");
    await queue.enqueue("p", "preview", "task", 3, "background");
    const locker = await pool.connect();
    try {
      await locker.query("begin");
      await locker.query("select id from job_queue where id=$1 for update", [first]);
      const [left, right] = await Promise.all([
        repository.q<any>("jobClaimQueue", [1, "left", 1000, null, null]),
        repository.q<any>("jobClaimQueue", [1, "right", 1000, null, null]),
      ]);
      expect(left).toHaveLength(1);
      expect(right).toHaveLength(1);
      expect(new Set([...left, ...right].map((job) => job.id)).size).toBe(2);
      expect([...left, ...right].some((job) => job.id === first)).toBe(false);
    } finally { await locker.query("rollback"); locker.release(); }
    const [job] = await repository.q<any>("jobClaimQueue", [1, "old", 1000, null, null]);
    await pool.query("update job_queue set lease_until=now()-interval '1 second' where id=$1", [job.id]);
    const [reclaimed] = await repository.q<any>("jobClaimQueue", [1, "new", 1000, null, null]);
    expect(reclaimed).toMatchObject({ id: job.id, attempts: 2, lease_token: "new" });
    expect(await repository.q("jobCompleteQueue", [job.id, "old"])).toEqual([]);
    await pool.query("update job_queue set lease_until=now()-interval '1 second' where id=$1", [job.id]);
    expect(await repository.q("jobRecoverQueue")).toEqual([expect.objectContaining({ id: job.id })]);
    expect((await pool.query("select status from job_queue where id=$1", [job.id])).rows[0].status).toBe("dead");
    expect(await repository.q("jobRecoverQueue")).toEqual([]);
  });

  it("retries explicitly, dead-letters exhausted failures, and drains bounded consumers", async () => {
    let release!: () => void;
    const hold = new Promise<void>((resolve) => { release = resolve; });
    const run = vi.fn(async () => { await hold; throw new Error("retry me"); });
    const queue = createJobQueue(ports, run);
    for (let index = 0; index < 3; index++) await queue.enqueue("p", "preview", "task", index, "background");
    await queue.start();
    await vi.waitFor(() => expect(run).toHaveBeenCalledTimes(2));
    await queue.poll();
    expect(run).toHaveBeenCalledTimes(2);
    let stopped = false;
    const drain = queue.stop().then(() => { stopped = true; });
    await Promise.resolve();
    expect(stopped).toBe(false);
    release();
    await drain;
    expect((await pool.query("select status from job_queue")).rows.every((job) => job.status === "queued")).toBe(true);
    await pool.query("update job_queue set available_at=now()-interval '1 second' where attempts=1");
    await queue.start();
    await vi.waitFor(async () => expect((await pool.query("select count(*)::int as n from job_queue where status='dead'")).rows[0].n).toBe(2));
    await queue.stop();
    expect(ports.log).toHaveBeenCalledWith("p", expect.objectContaining({ message: expect.stringContaining("retry me") }));
  });

  it("renews long-running leases so another worker cannot reclaim active work", async () => {
    let release!: () => void;
    const hold = new Promise<void>((resolve) => { release = resolve; });
    const queue = createJobQueue(ports, async () => hold);
    await queue.enqueue("p", "preview", "task", null, "background");
    await queue.start();
    try {
      await new Promise((resolve) => setTimeout(resolve, 1300));
      expect(await repository.q("jobClaimQueue", [1, "other", 1000, null, null])).toEqual([]);
    } finally { release(); await queue.stop(); }
  });

  it("atomically promotes timers and keeps external and queue-only roles separate", async () => {
    const api = createJobs({ ...ports, queueOptions: { ...ports.queueOptions, mode: "external" } });
    await pool.query("insert into job_timers (id, project_id, env, job, payload, run_at) values ('timer', 'p', 'preview', 'task', '{}', now())");
    await api.startJobRunner({ queueOnly: true });
    await api.stopJobRunner();
    expect((await pool.query("select status from job_timers")).rows[0].status).toBe("pending");
    expect(ports.cron).not.toHaveBeenCalled();
    await Promise.all([
      repository.q("jobPromoteTimers", [2, 20]),
      repository.q("jobPromoteTimers", [2, 20]),
    ]);
    expect((await pool.query("select status from job_timers")).rows[0].status).toBe("fired");
    expect((await pool.query("select id from job_queue")).rows).toEqual([{ id: "timer:timer" }]);
    await api.startJobRunner();
    await api.stopJobRunner();
    expect((await pool.query("select status from job_queue")).rows[0].status).toBe("queued");
  });
});
