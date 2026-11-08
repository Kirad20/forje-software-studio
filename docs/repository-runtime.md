# Repository runtime (Docker / Node)

Native projects keep their existing compiler, sandbox and app services. Imported
projects with `runtime: "repository"` retain their repository layout and use this
explicitly opted-in Docker runtime. No Compose file is executed.

## Operator setup

- Set `FORJA_REPOSITORY_RUNNER=docker` on the platform/runtime process and configure
  a **trusted, dedicated Linux Docker daemon**. Otherwise the snapshot reports
  `available: false` and build/publish/stop report HTTP 503.
- The runtime process needs the Docker CLI. For the platform image, build with
  `--build-arg REPOSITORY_RUNNER=1`. The default image does not install it.
- `DOCKER_HOST`, `DOCKER_TLS_VERIFY` and `DOCKER_CERT_PATH` are operator settings
  inherited by the CLI. Never give imported applications the daemon socket,
  daemon credentials, host directories, privileged mode or platform environment.
- The daemon's published loopback ports must be reachable from the runtime
  process. The default is `127.0.0.1`; `FORJA_REPOSITORY_RUNNER_HOST` can name a
  local forwarded/tunnel endpoint. A remote daemon requires operator-provided
  loopback-port forwarding; changing the host alone does not expose its ports.
  Do not expose the unauthenticated Docker API on the public network.
- Set a stable 64-hex-character platform `SECRETS_KEY`. Per-project **and**
  per-environment PostgreSQL passwords and child encryption keys are persisted
  using the existing AES-GCM platform cipher.
  Enabling the runner without that stable key fails with explicit HTTP 503;
  native development's existing ephemeral-key fallback is unchanged.
- Configure the normal wildcard app domain/`PUBLIC_URL` and reverse proxy.
  HTTP, streaming request/response bodies, SSE and WebSocket upgrades are proxied
  behind the same preview share-token/private-publication boundary as native apps.
  Reverse proxies must forward WebSocket upgrades. Upstream request timeout is
  30 seconds; WebSocket handshake timeout is 10 seconds.

## API and lifecycle

`GET /api/projects/:id/repository` returns `{ available, config, status, error,
preview, published, revisions, logs }`. Configuration keys are `rootDirectory`,
`dockerfile` (null selects generated Node image), `port`, `healthPath`,
`postgres` and `storagePath` (null or a named volume mounted below `/app/`).
`PATCH` is owner-only. `POST /repository/build` allows owners and editors.
Owner-only actions: `/publish` takes `{ slug, revisionId }`, `/rollback` takes
`{ revisionId }`, `/stop` takes `{ env: "preview" | "published" }`.
`GET /repository/logs?env=preview` provides bounded runtime logs to owners/editors;
published logs are owner-only because child bootstrap and app-generated tokens
cannot all be automatically recognized or redacted.

Each build uses a new immutable filesystem context and image digest. It never
executes package scripts in the platform process. Paths, context size, log size,
command duration and health checks are bounded. Applications must declare a
non-root image `USER` and run with CPU/memory/PID limits, no capabilities and
no-new-privileges. Code is not forced read-only: named storage is necessary for
Forja and other writable applications.

Publication promotes the selected **healthy built image**, never current edited
files. Preview and publication have separate networks, PostgreSQL databases,
storage volumes and keys. Failed build/health checks retain the previous healthy
deployment. Project locks also work across platform processes via PostgreSQL
advisory locks. Startup reconciles interrupted builds and unavailable containers.
Two database-backed global build slots bound concurrency across processes.
Each project retains at most 20 revisions, then additional builds return 409
instead of unbounded image growth. No broad Docker prune is ever issued.
Stopping retains environment data; deleting a project removes only its labelled
containers, named networks, named volumes, images and encrypted credentials.

**Rollback is code-only.** Startup migrations may already have changed the
environment database. Back up data and make migrations backward-compatible;
rollback does not undo SQL migrations, copy preview data or restore a database.
Changing database/storage settings likewise does not migrate or erase data.

## Running Forja itself

Import the Forja repository in repository mode. Inference selects its existing
`Dockerfile`, port `4100`, `/healthz`, PostgreSQL and `/app/data`. Build the preview,
open its separate preview origin using the platform-generated share link, then
complete the child instance's independent first-run setup. The container receives
its own `DATABASE_URL`, `SECRETS_KEY`, `DATA_DIR`, `PORT` and public origin.
Its backend applies its own migrations. Publishing runs exactly that image
against a separate empty published database; first-run setup is separate there.
Child repository runners are disabled; they do not receive the parent daemon.
Repositories start private, including their first publication. The parent owner
opens its published share link, reads that environment's owner-only runtime logs
for the child's existing one-time bootstrap token, and completes child setup
before explicitly making the parent publication public. No accounts or passwords
are copied or seeded into child instances.

## Real-daemon verification

From the repository root on Windows:

```powershell
node --import tsx test\repository-runtime-docker.mjs
node --import tsx test\repository-runtime-docker.mjs --generated
```

This callable smoke test builds a real non-root Node image, starts real isolated
PostgreSQL instances, checks health, proxies requests, publishes the same digest,
verifies independent writable volumes and stops preview without stopping
publication. It removes its specific resources in `finally`.

For a full Forja self-test, instantiate the exported `DockerRepositoryRunner`
with `{ enabled: true, contextRoot: absoluteScratchPath }`, and
`createRepositoryRuntime({ store, runner, readAllFiles, recordPublish,
isSlugTaken, appUrl, previewUrl })`. `readAllFiles` supplies the actual repository
snapshot, including Dockerfile, package-lock, server, SDK and Studio; the runner
excludes graphify output, dependencies, Git metadata, runtime data and `.env`
secrets (but keeps `.env.example`). Use the exported `PostgresRepositoryStore`
and its `environmentSecret` callback for durable encrypted secrets.
Call `build(id)`, `publish(id, { slug, revisionId })`, `serve(request,id,env)` and
`remove(id)`. Bootstrap calls `upgrade(req,socket,head,id,env)` **only after**
`resolveApp` authorizes the request, and `closeConnections()` before HTTP shutdown.

The full self-run test (`npm run test:repository`, or
`node --import tsx test\repository-docker.mjs`) uses `freshDatabase` with
`TEST_DATABASE_URL`, actual import preparation, tracked and intended untracked
source, a real Forja build and child instances. Missing Docker/PostgreSQL fails
the test rather than skipping it. It also requires an installed Chromium browser
(`npx playwright-core install chromium-headless-shell`, or `FORJA_CHROMIUM` can
select its executable). Its real browser page lives on the parent Studio origin and embeds
Forja, then Forja's native child preview: it verifies first-run setup, password
login, original assets/API requests, nested share cookies and WebSocket upgrades
without disabling browser origin, cookie or CSP security.
Scratch contexts live below an owned `data/node_modules/repository-runtime-tests`
directory so source import, test discovery and graph scanners ignore them; each
run deletes only its own directory.

For child Forja app origins, provision nested wildcard DNS/reverse-proxy routing
under the repository's own origin. Only repository parents accept these nested
hosts. The outer share token is kept in the HttpOnly
`forja_repository_share` cookie scoped to the repository domain, distinct from
the child's native `forja_share`. Parent `forja_session` and repository-grant
cookies are never forwarded upstream, including WebSocket handshakes.
Child `forja_session` cookies are translated to the host-only HttpOnly
`forja_repository_session_<scope>` alias and restored only on upstream requests.
The scope binds project, environment and public origin; stale aliases from a
different project are stripped even if a publication hostname is reused.
Preview aliases use `SameSite=None; Secure; Partitioned` so login works inside
the Studio iframe; publication retains the child's SameSite/Secure policy.
Child native share queries and cookies remain unchanged.
Repository tokens are additionally signed for preview or published environment,
so a live link cannot grant preview/database access and vice versa. Revocation
checks the current project share epoch on HTTP and WebSocket requests.
Preview response framing allows the configured parent Studio origins, its own
repository origin and same-origin ancestors, without removing other CSP
directives. This supports the two-ancestor nested preview. Published responses retain their own
frame/CSP policy.
Wildcard certificates for the platform alone do not cover multiple subdomain
levels: provision certificates/routing for each nested repository app domain.
