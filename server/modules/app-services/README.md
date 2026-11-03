# App services

Public named entries compose application use cases with infrastructure adapters.
Domain policies have no driver dependencies; application factories accept typed
ports and can be tested without PostgreSQL, PGlite, SMTP, Stripe or the runtime.

Bootstrap must explicitly configure these capabilities before accepting work:

- `context.configureAppServiceObserver({ log })`
- `secrets.configureSecretIntegrations({ integrationEnv })`
- `jobs.configureJobRuntime({ publishedFiles, readAllFiles, jobFiles,
  readJobSettings, compileServerModule, runInSandbox, appUrl, previewOrigin })`
- `jobs.initializeAppServices()` binds context job calls without starting timers.

Then await `jobs.startJobRunner()`. It is idempotent and schedules published jobs.
Shutdown awaits `jobs.stopJobRunner()` to stop cron/poll timers and drain work,
detaches `realtime.stopRealtime()` listeners, closes `email.stopEmailTransport()`,
and awaits `projectDb.closeAll()`. `attachSocket` also returns a disposer.
Public imports start no resources. Background context jobs return immediately;
failures are reported through the observer port rather than silently discarded.
Each configuration function returns an idempotent conditional disposer. Stop and
drain jobs, realtime and email before disposing the capabilities. A stale
disposer cannot remove a newer registration, even when it uses the same object.

Studio data operations use `projectDb.listProjectRows`, `createProjectRow`,
`deleteProjectRows`, `listAppUsers` and `projectServiceCounts`. These validate
tables against the schema, filter insert fields, mask password hashes, and
delegate SQL and identifier quoting to the infrastructure repository.
