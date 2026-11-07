import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdirSync, rmSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import pg from "pg";
import { expect, it } from "vitest";
import { freshDatabase } from "../helpers/pg.mjs";
import { migrate } from "../../server/shared/database/migrate.js";

it("boots an independent queue-only worker, executes durable jobs through remote project DB, and leaves timers alone", async () => {
  const database = await freshDatabase();
  const pool = new pg.Pool({ connectionString: database.url });
  const directory = path.resolve(`.worker-test-${randomUUID()}`);
  mkdirSync(directory);
  const requests: string[] = [];
  const data = createServer((req, res) => {
    requests.push(req.url ?? "");
    expect(req.headers.authorization).toBe("Bearer worker-test-token");
    res.setHeader("content-type", "application/json");
    if (req.url?.endsWith("/migrations/apply")) {
      let body = "";
      req.on("data", (chunk) => { body += String(chunk); });
      req.on("end", () => {
        expect(JSON.parse(body)).toEqual({
          env: "preview",
          migrations: [{ path: "migrations/001_answer.sql", sql: "create table answer (value integer);" }],
        });
        res.end('{"applied":["migrations/001_answer.sql"]}');
      });
    } else {
      res.end('[{"answer":42}]');
    }
  });
  await new Promise<void>((resolve) => data.listen(0, "127.0.0.1", resolve));
  const dataPort = (data.address() as { port: number }).port;
  await migrate(pool);
  await pool.query("insert into accounts (id, email) values ('a', 'worker@example.test')");
  await pool.query("insert into projects (id, owner_id, name) values ('p', 'a', 'Worker')");
  await pool.query("insert into project_files (project_id, path, content) values ('p', 'migrations/001_answer.sql', 'create table answer (value integer);')");
  await pool.query("insert into project_files (project_id, path, content) values ('p', 'jobs/task.ts', $1)", [
    "export default async function(ctx) { const rows = await ctx.db.query('select 42 as answer'); if(rows[0].answer !== 42) throw new Error('wrong DB'); ctx.log('remote worker completed'); }",
  ]);
  await pool.query("insert into job_queue_capacity values ('p', 1)");
  await pool.query("insert into job_queue (id, project_id, env, job, payload, trigger) values ('worker-job', 'p', 'preview', 'task', '{}', 'background')");
  await pool.query("insert into job_timers (id, project_id, env, job, payload, run_at) values ('timer', 'p', 'preview', 'task', '{}', now())");
  const child = spawn(process.execPath, ["--import", "tsx", "server/bootstrap/jobWorkerServer.ts"], {
    env: {
      ...process.env, PORT: "0", DATABASE_URL: database.url, DATA_DIR: directory,
      SECRETS_KEY: "ab".repeat(32), APP_DATA_SERVICE_URL: `http://127.0.0.1:${dataPort}`,
      APP_DATA_SERVICE_TOKEN: "worker-test-token", FORJA_JOB_WORKER_MODE: "external",
      FORJA_JOB_POLL_MS: "50", APP_RUNTIME_INTERNAL_URL: "",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (chunk) => { output += chunk.toString(); });
  child.stderr.on("data", (chunk) => { output += chunk.toString(); });
  try {
    const deadline = Date.now() + 20_000;
    let completed = false;
    while (Date.now() < deadline) {
      if (child.exitCode !== null) throw new Error(`Worker exited early: ${output}`);
      const [job] = (await pool.query("select status, error from job_queue where id='worker-job'")).rows;
      if (job.status === "completed") { completed = true; break; }
      if (job.status === "dead") throw new Error(`Worker job failed: ${job.error}\n${output}`);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    expect(completed, output).toBe(true);
    expect(requests.indexOf("/internal/data/p/migrations/apply")).toBeGreaterThanOrEqual(0);
    expect(requests.indexOf("/internal/data/p/migrations/apply")).toBeLessThan(requests.indexOf("/internal/data/p/query"));
    expect(requests).toContain("/internal/data/p/query");
    expect((await pool.query("select status from job_timers")).rows[0].status).toBe("pending");
    expect((await pool.query("select pending from job_queue_capacity")).rows[0].pending).toBe(0);
    const port = output.match(/jobs worker.*port (\d+)/)?.[1];
    expect(port, output).toBeDefined();
    expect((await fetch(`http://127.0.0.1:${port}/healthz`)).ok).toBe(true);
    expect(requests).not.toContain("/internal/data/close-all");
  } finally {
    if (child.exitCode === null) {
      const closed = new Promise<void>((resolve) => child.once("close", () => resolve()));
      child.kill();
      await closed;
    }
    await new Promise<void>((resolve, reject) => data.close((error) => error ? reject(error) : resolve()));
    await pool.end();
    await database.drop();
    rmSync(directory, { recursive: true, force: true });
  }
}, 30_000);
