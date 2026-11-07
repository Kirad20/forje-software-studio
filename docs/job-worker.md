# Durable jobs worker

Generated apps can call `await ctx.jobs.enqueue("invoice", payload)`. The returned
string is a durable queue ID, not an execution result. `ctx.jobs.run` starts work
immediately in the background and resolves before completion; errors are logged.
Use `enqueue` for durable delivery with retries. Administrative `runJob` behavior
is unchanged. The jobs administration response includes `queue` with status,
service, attempts and last error.

The platform PostgreSQL stores the queue. Consumers claim with `FOR UPDATE SKIP
LOCKED`, renew leases while executing, and recover expired leases after a crash.
Delivery is **at least once**: jobs must make side effects idempotent (for example,
use an invoice/order ID as a database uniqueness key). Failed attempts retry with
exponential delay (1, 2, 4… seconds, capped at 60 seconds); exhausted retries become
`dead`. Shutdown stops claims and drains active executions before closing resources.
Terminal entries are retained for seven days. Outstanding jobs are capped per
project; full queues reject enqueue rather than dropping work. Due timers transfer
atomically to the same queue, and scheduled jobs enqueue from the main server only.

## Split deployment

`docker-compose.yml` starts `job-worker` separately from the studio/API, builder and
app-runtime. The main server uses `FORJA_JOB_WORKER_MODE=external` and never consumes
the queue. Without external mode, the main server runs an embedded consumer.
Workers always start a **queue-only** runner, never project cron schedulers.

Project database access follows the job's environment: preview jobs use the
studio database copy, while published jobs use production. Publishing applies
pending schema migrations; it does not promote preview job data into production.

Start manually with `npm run start:worker` (or `npm run dev:worker`). Set:

| Variable | Default / purpose |
| --- | --- |
| `DATABASE_URL` | Required, the same platform PostgreSQL as the main server |
| `APP_DATA_SERVICE_URL` | Required, app-runtime internal URL; workers never open project PGlite databases |
| `APP_DATA_SERVICE_TOKEN` | Required, same internal token as app-runtime |
| `SECRETS_KEY` | Same encryption key as the main server |
| `DATA_DIR` | Shared compiled project source/assets volume |
| `PORT` | Health HTTP port (`4400` in Compose); `/healthz` |
| `FORJA_JOB_WORKER_MODE` | Main server: `embedded` by default, `external` for split deployment |
| `FORJA_JOB_WORKER_SERVICES` | Optional comma-separated manifest service names; unset consumes all |
| `FORJA_JOB_WORKER_PROJECT_ID` | Optional generated project ID; unset consumes all projects |
| `FORJA_JOB_CONCURRENCY` | `4`, bounded concurrent executions per process (1–64) |
| `FORJA_JOB_POLL_MS` | `1000`, polling interval (10–60000 ms) |
| `FORJA_JOB_LEASE_MS` | `60000`, renewable lease duration (1000–600000 ms) |
| `FORJA_JOB_MAX_ATTEMPTS` | `3`, persisted on enqueue (1–10) |
| `FORJA_JOB_QUEUE_LIMIT` | `1000`, outstanding jobs per project (20–10000); set consistently on producers |

The service resolved from `forja.services.json` is persisted when enqueueing.
Filters apply **before** claiming/locking and limiting rows, so an invoices worker
does not consume orders work. Jobs without a manifest belong to `monolith`.

To scale one project's invoice module, configure `FORJA_JOB_WORKER_SERVICES=invoices`
and `FORJA_JOB_WORKER_PROJECT_ID=<project-id>`, then run
`docker compose up -d --scale job-worker=3`. Each replica has its own bounded
consumer and sandbox pools. Configure separate worker services with different
filters if other modules also have queued jobs. Do not scale the main cron
producer without singleton coordination: workers avoid duplicate cron producers,
but multiple main servers can still enqueue duplicate schedules.
