# One project: orders API and durable invoice worker

The default starter is unchanged: without a selector, every endpoint/job runs in
the monolith. Opt in to the runnable example in Studio's **Plantilla inicial →
Ejemplo: API de pedidos + worker de facturas** selector. No prompt is required for
the example, and Studio does not automatically replace it on the first builder turn.

The same selection is available through the authenticated Studio API:

```http
POST /api/projects
Content-Type: application/json

{"name":"Orders demo","template":"orders-invoices"}
```

`template` accepts `monolith` or `orders-invoices`; an unknown value is rejected
with HTTP 400 before creating a project. Omitting it preserves existing behavior.
The Studio client supports
`projectsController.createProject("Orders demo", { template: "orders-invoices" })`.
Server callers can pass the optional sixth argument to
`projects.createProject(ownerId, name, description, files, orgId, template)`.
Explicit `files` still win over template files, but invalid selectors are always rejected.
The public projects module also exports `starterFiles(name, template?)`.

## What the example does

1. The page creates a UUID and sends `POST /_api/orders/create`.
2. The orders service inserts a fixed-price, non-personal demo order and calls
   `ctx.jobs.enqueue("invoice", { orderId })`. The API returns the durable queue ID
   after acceptance; it does **not** wait for the invoice.
3. The invoice worker locks the order in a database transaction, inserts an
   invoice with a unique `order_id` (`ON CONFLICT DO NOTHING`), and updates the
   order's status in that same transaction. Duplicate deliveries do not duplicate
   invoices; a failed transaction rolls back both changes.
4. The page polls `GET /_api/orders/status?orderId=<UUID>` and shows the persisted
   invoice. If acceptance fails, retry uses the same UUID and does not reset
   existing status. Reloading the page loses its local selection, not the stored
   order: the status API remains usable with its UUID.

This demo has no payment, email, authentication or personal data. Its endpoints
are intentionally public. Before using it for real orders, add authentication,
owner checks, quotas, and private status access. The fixed price is computed on
the server, never trusted from a browser. Demo tables initialize additively on the
first API request; do not use that bootstrap on an existing incompatible schema.

## Topology contract

The generated project contains:

```json
{
  "version": 1,
  "services": {
    "orders": {
      "kind": "service",
      "endpoints": ["endpoints/orders/create_POST.ts", "endpoints/orders/status_GET.ts"],
      "jobs": [],
      "replicas": 2,
      "maxConcurrency": 8
    },
    "invoices": {
      "kind": "worker",
      "endpoints": [],
      "jobs": ["jobs/invoice.ts"],
      "replicas": 2,
      "maxConcurrency": 1
    }
  }
}
```

Save this as the exact root filename `forja.services.json`, not a file in `static/`.
Assignments name existing executable files exactly, not routes, folders or globs.
Each file can belong to one service only; workers cannot expose endpoints.
Service names start with a lowercase letter, contain lowercase letters, digits or
hyphens, have at most 40 characters, and cannot be `monolith`. Unknown fields are
rejected. A manifest holds 1–64 services. Replicas are integers from 1–8 per service, at most 64 total;
`maxConcurrency` is 1–32 per replica. Omitted values default to one replica and
concurrency 8 for services / 1 for workers. Unassigned endpoints/jobs remain in
the monolith, so extract one module at a time. A malformed manifest fails build
validation rather than silently reverting topology.

All public HTTP paths stay `/_api/<route>`. Ordinary relative and `~/` helper
imports continue working. Isolation is separate process replica pools keyed by
**project + environment + service**. It is not database-per-service isolation:
all services use the **same project database**, owned by app-runtime, including
the existing shared preview/published data. Process-local memory is not a durable
coordination mechanism.

## Run and scale

Normal local development keeps the embedded job consumer:

```powershell
npm run dev
```

For a separate worker, use the existing PostgreSQL platform database and configure
the app-service process with `FORJA_JOB_WORKER_MODE=external`. Then start the worker
with that same platform database URL and app-runtime's internal data API:

```powershell
$env:DATABASE_URL = "postgres://forja:password@localhost:5432/forja"
$env:APP_DATA_SERVICE_URL = "http://localhost:4200"
$env:APP_DATA_SERVICE_TOKEN = "<same internal token as app-runtime>"
$env:PORT = "4400"
npm run start:worker
```

The worker's `/healthz` verifies readiness. `FORJA_JOB_WORKER_SERVICES=invoices`
can restrict a worker to invoice jobs; `FORJA_JOB_WORKER_PROJECT_ID=<project-id>`
can restrict it to one project. Keep an unfiltered consumer for other jobs.

In the existing Docker stack:

```powershell
docker compose up --build -d
docker compose up -d --scale job-worker=3
docker compose logs --tail 100 job-worker
```

Worker containers consume the PostgreSQL queue independently using `SKIP LOCKED`,
leases, bounded retries and at-least-once delivery. These containers are different
from the local per-service process replicas configured in the manifest.
Keep one app-runtime owner for project PGlite databases; do **not** scale
app-runtime containers against a shared PGlite directory. Check the deployment
environment's internal token, database connection and network configuration
before starting consumers.

## Studio service control center

Open **Servicios → Centro de control** in a project to see declared services and
the compatibility `monolith`, assigned endpoints/jobs, and desired preview
replicas/concurrency. Saving scale edits only those manifest fields, preserving
other settings, and validates the entire manifest (including its total replica
budget). Publish to apply a preview manifest change to the published app.
Processes start lazily on the next execution, not when saving configuration.

The panel refreshes actual app-runtime process counts, PIDs, readiness and active
executions separately from desired configuration. When Studio uses
`APP_RUNTIME_INTERNAL_URL`, metrics/restart are forwarded to that runtime with
`APP_DATA_SERVICE_TOKEN`; unreachable runtime metrics are explicitly unavailable.
These observations do **not** establish queue-worker health: remote worker
process metrics are unavailable. Queue status counts and task failures come from
the latest 100 project queue records, including both environments, not the full
backlog.

Restart requires confirmation and selects a service and environment. It cancels
that app-runtime pool's in-flight executions, preserving other service pools;
the next execution lazily creates replacement processes. It does not restart
remote worker containers and does not persistently pause a service. Projects
without a manifest keep monolith compatibility with unlimited concurrency and
no unsupported scale controls.

The authenticated project API uses existing owner/editor project membership:

- `GET /api/projects/:id/service-control` returns services, desired configuration,
  observed runtime groups, recent queue entries/counts, and availability details.
- `PATCH /api/projects/:id/service-control/:service` accepts only integer
  `replicas` (1–8) and/or `maxConcurrency` (1–32).
- `POST /api/projects/:id/service-control/:service/restart` accepts
  `{"env":"preview"}` or `{"env":"published"}`. Omitting `env` restarts both
  environments through the API; Studio always selects one explicitly.

## Migration and limitations

- No manifest means the original monolith. Add a valid manifest to opt in; remove
  it to return entrypoints to the monolith without changing routes or data.
  Drain in-flight/queued work before changing worker routing, especially when
  using service-filtered consumers.
- Inspect the existing database first. Apply additive migrations using
  `describe_database` / `execute_sql`; preserve rows and existing constraints.
  Do not overwrite unrelated project tables with the demo schema.
- `ctx.jobs.run` still waits for completion. `ctx.jobs.runAt` keeps its existing
  scheduling semantics. Use `enqueue` specifically for durable asynchronous
  acceptance.
- Order insertion and queue acceptance are **not** one atomic transaction. A
  rejected enqueue can leave a pending order. The demo supports safe client
  retries; production systems need an outbox/reconciler and handling for
  exhausted retries. A queue ID is not proof of successful execution.
- Database idempotency does not make external email/payments exactly once. Use
  provider idempotency keys and recovery logic for external effects.
- Service replicas do not create separate projects, databases, network APIs or
  deployment artifacts. Docker worker scaling does not horizontally scale the
  PGlite-owning app-runtime.

## Focused validation

```powershell
npx vitest run test\unit\modules\projects\starterTemplate.test.ts test\unit\modules\projects\domain.test.ts test\unit\modules\builder\topologyGuidance.test.ts test\unit\index.test.ts test\unit\studio\project-usecases.test.ts test\unit\transports\http.test.ts test\unit\architecture.test.ts
npm run typecheck
```

The starter tests execute generated API/job code against PGlite, verify
acceptance-before-execution and duplicate-safe persisted status, and compile and
typecheck the generated application with app-runtime's public `verifyBuild`.
Runtime pool scaling and PostgreSQL multi-consumer behavior have separate focused
runtime/queue integration tests.
