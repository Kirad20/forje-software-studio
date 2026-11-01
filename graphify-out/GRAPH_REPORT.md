# Graph Report - forje-software-studio  (2026-11-01)

## Corpus Check
- 171 files · ~164,767 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .css 2, .example 1)

## Summary
- 1861 nodes · 4976 edges · 96 communities (84 shown, 12 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 103 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7dff6883`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- browser.ts
- 001_init.sql
- orchestrator.ts
- Chat.tsx
- Dashboard.tsx
- github.ts
- ProjectView.tsx
- appServer.ts
- context.ts
- App.tsx
- with
- ProjectView.tsx
- timeAgo
- llm/router.ts
- securityReview.ts
- ref_node_path
- score.ts
- api
- e2e.mjs
- problems.ts
- client/index.ts
- studioApi.ts
- Inventario de funciones de Lovable → Forja
- builder/index.ts
- tools.ts
- runner.ts
- 1. Capa de datos
- bundler.ts
- Changes.tsx
- q
- guides.ts
- github.mjs
- projects.ts
- memory.ts
- devDependencies
- Integrations.tsx
- sandboxWorker.mjs
- compilerOptions
- db.ts
- agents.dbg.mjs
- ai.ts
- package.json
- crypto.ts
- scripts
- catalog.ts
- baas/jobs.ts
- accounts.ts
- admin/api.ts
- dependencies
- server.ts
- judge.ts
- agent.ts
- Forja
- Desplegar Forja en Coolify
- server/index.ts
- sdk/server/index.ts
- mcp/jobs.ts
- serviceContext
- CLAUDE.md
- ProjectSandbox
- admin/api.ts
- metrics.ts
- forja
- realtime.ts
- Inventario de interfaz de Floot → Forja
- orgs.ts
- typecheck.ts
- serverTypes.test.ts
- config.ts
- base
- publish.ts
- reactions.ts
- forja
- AppEnv
- src/api.ts
- useRoute
- toolOutputs.test.ts
- events.ts
- Providers.tsx
- TEST_DATABASE_URL
- apiTypes.test.ts
- safeFetch.ts
- Review Focus
- store.ts
- analytics.ts
- FileMap
- Db
- usage.ts
- ApiError
- @hono/node-server
- croner
- @modelcontextprotocol/sdk
- @types/node@^26.6.6
- playwright-core
- zod

## God Nodes (most connected - your core abstractions)
1. `q()` - 134 edges
2. `api()` - 72 edges
3. `ProjectView()` - 37 edges
4. `one()` - 35 edges
5. `runBuilderTurn()` - 32 edges
6. `readAllFiles()` - 31 edges
7. `react` - 30 edges
8. `sha256()` - 29 edges
9. `timeAgo()` - 29 edges
10. `projects` - 28 edges

## Surprising Connections (you probably didn't know these)
- `1. Chat y agente del constructor` --references--> `selectContext()`  [INFERRED]
  docs/inventario-lovable.md → server/builder/index.ts
- `6. IA dentro de las apps` --references--> `tools()`  [INFERRED]
  docs/inventario-lovable.md → server/builder/orchestrator.ts
- `Hoja de ruta propuesta` --references--> `updateSummary()`  [INFERRED]
  docs/inventario-lovable.md → server/builder/orchestrator.ts
- `2. Crear el recurso` --references--> `main()`  [INFERRED]
  docs/despliegue-coolify.md → server/db/cli.ts
- `Operación` --references--> `main()`  [INFERRED]
  docs/despliegue-coolify.md → server/db/cli.ts

## Import Cycles
- None detected.

## Communities (96 total, 12 thin omitted)

### Community 0 - "browser.ts"
Cohesion: 0.13
Nodes (24): projectView(), baseFor(), appOrigin(), allowedRequest(), BrowserStep, BrowserTestInput, BrowserTestResult, describe() (+16 more)

### Community 1 - "001_init.sql"
Cohesion: 0.06
Nodes (58): account_integrations, account_models, account_sessions, accounts, agent_steps, agent_steps_project, agent_steps_run, agent_tasks (+50 more)

### Community 2 - "orchestrator.ts"
Cohesion: 0.11
Nodes (42): execute(), describeSchema(), imageBlocks(), runAgent(), save(), projectMap(), active, commitMessage() (+34 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.05
Nodes (61): ApiError, streamPost(), AgentLanes(), Lane, LaneCard(), LaneStep, money(), ROLE (+53 more)

### Community 4 - "Dashboard.tsx"
Cohesion: 0.13
Nodes (24): Back, External, Globe, Send, Avatar(), colorFor(), COLORS, Menu() (+16 more)

### Community 5 - "github.ts"
Cohesion: 0.13
Nodes (25): emitProject(), blobSha(), branchHead(), connectAccount(), createRepo(), doSync(), gh(), GithubError (+17 more)

### Community 6 - "ProjectView.tsx"
Cohesion: 0.07
Nodes (33): SelectedElement, GithubCommitCard(), GithubSection(), Link, Mark(), Kind, kindOf(), KINDS (+25 more)

### Community 7 - "appServer.ts"
Cohesion: 0.13
Nodes (33): AiUnavailableError, appAiChat(), rateLimit(), RateLimitError, uploadHeaders(), log(), analyticsBeacon(), baasRoute() (+25 more)

### Community 8 - "context.ts"
Cohesion: 0.10
Nodes (8): bindJobs(), HttpError, publish(), serviceContext, EmailInput, CheckoutInput, paymentsFor(), listObjects()

### Community 9 - "App.tsx"
Cohesion: 0.13
Nodes (24): react, App(), NAV, Redirect(), Shell(), UserMenu(), Logo(), Admin() (+16 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "ProjectView.tsx"
Cohesion: 0.12
Nodes (48): Task 6: Studio — página de administración, 7. Studio, api(), Me, TurnDetail, Refresh, AiPanel(), CodePanel() (+40 more)

### Community 12 - "timeAgo"
Cohesion: 0.17
Nodes (17): timeAgo(), AccountModels(), ModelChecklist(), ModelRow, MODES, price(), ProjectModels(), PROVIDER (+9 more)

### Community 13 - "llm/router.ts"
Cohesion: 0.09
Nodes (33): Pruebas de conexión, resetRouter(), routerStats, penalizeTurn(), gamma(), gaussian(), meanOf(), Posterior (+25 more)

### Community 14 - "securityReview.ts"
Cohesion: 0.06
Nodes (47): BACKEND, CHECKLIST, DATA, DESIGN, FAST_EXCLUDED_TOOLS, FIRST_BUILD, FRONTEND, JOBS (+39 more)

### Community 15 - "ref_node_path"
Cohesion: 0.15
Nodes (13): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, vitest, migrate(), MIGRATIONS_DIR, drop(), freshDatabase() (+5 more)

### Community 16 - "score.ts"
Cohesion: 0.09
Nodes (38): 10. Documentación, 4. Playground de agentes, 5. Enrutador, Decisiones tomadas con el usuario, Fuera de alcance, Objetivo, Panel de administración del sistema — diseño, EVAL_CASES (+30 more)

### Community 17 - "api"
Cohesion: 0.11
Nodes (23): AgentEvent, Agents(), ROLE_LABEL, RoleInfo, RunPanel(), RunView, ToolLine(), AddModel() (+15 more)

### Community 18 - "e2e.mjs"
Cohesion: 0.08
Nodes (25): browse(), creation, DATA, evil, files, fresh, got, jar (+17 more)

### Community 19 - "problems.ts"
Cohesion: 0.18
Nodes (21): createFinishGate(), key(), mine(), newBuildProblems(), newRuntimeProblems(), changed(), clearProblems(), fingerprint() (+13 more)

### Community 20 - "client/index.ts"
Cohesion: 0.10
Nodes (21): ai, api, AppUser, auth, baas(), channels, ChatMessage, ensureSocket() (+13 more)

### Community 21 - "studioApi.ts"
Cohesion: 0.09
Nodes (17): Env, memoryOf(), pid(), SESSION_COOKIE, startSession(), getTransport(), listEmails(), receiveEmail() (+9 more)

### Community 22 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 23 - "builder/index.ts"
Cohesion: 0.13
Nodes (18): buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf(), ProjectIndex (+10 more)

### Community 24 - "tools.ts"
Cohesion: 0.08
Nodes (19): B, I, N, S, ToolOutput, typed(), BUILTIN_PACKAGES, depsDir() (+11 more)

### Community 25 - "runner.ts"
Cohesion: 0.07
Nodes (55): PLAYGROUND_ROLES, playgroundBusy(), PlaygroundError, PlaygroundRole, playgroundRoles(), PlaygroundView, prune(), runs (+47 more)

### Community 26 - "1. Capa de datos"
Cohesion: 0.33
Nodes (6): 1. Capa de datos, `.env` resultante, Infraestructura, Migraciones, Seeders, check()

### Community 27 - "bundler.ts"
Cohesion: 0.13
Nodes (26): page(), BuildError, buildExamples(), bundleBrowser(), checkProject(), compileCache, CompiledModule, compileServerModule() (+18 more)

### Community 28 - "Changes.tsx"
Cohesion: 0.21
Nodes (15): baseName(), cache, ChangeCard(), diffStats(), FileChange, FileDiff(), KIND, TurnChanges (+7 more)

### Community 29 - "q"
Cohesion: 0.10
Nodes (31): Global Constraints, Panel de administración + Postgres — plan de implementación, deleteSecret(), listSecrets(), projectSecretEnv(), requestSecret(), SECRET_NAME, secretEnv() (+23 more)

### Community 30 - "guides.ts"
Cohesion: 0.19
Nodes (14): BUILDER_SYSTEM_PROMPT, builderTools, build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS (+6 more)

### Community 31 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 32 - "projects.ts"
Cohesion: 0.09
Nodes (37): deleteAccount(), projectPath(), ensurePersonalOrg(), personalOrgId(), assertValidPath(), ChangeEntry, createCheckpoint(), createFolder() (+29 more)

### Community 33 - "memory.ts"
Cohesion: 0.15
Nodes (17): addMemory(), assertKind(), cleanText(), deleteMemory(), KIND_LABEL, LIMIT, MAX_MEMORY_CHARS, Memory (+9 more)

### Community 34 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2, vitest@^5.0.5 (+7 more)

### Community 35 - "Integrations.tsx"
Cohesion: 0.32
Nodes (7): CreateDialog(), Integration, Integrations(), TYPE_HINT, TYPE_ICON, Types, ValueDialog()

### Community 36 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 37 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+8 more)

### Community 38 - "db.ts"
Cohesion: 0.14
Nodes (20): Conexión, [command, ...flags], main(), ANTHROPIC_MODELS, PROVIDERS, seedDefaults(), DEV_FIXTURE, Fixture (+12 more)

### Community 39 - "agents.dbg.mjs"
Cohesion: 0.11
Nodes (17): app, DATA, app, DATA, MODELS, req(), ROOT, SEED (+9 more)

### Community 40 - "ai.ts"
Cohesion: 0.12
Nodes (28): 6. API de administración, call(), ECHO_TOOL, errorOf(), ModelProbe, PROBE_SYSTEM, probeModel(), probeProvider() (+20 more)

### Community 41 - "package.json"
Cohesion: 0.14
Nodes (13): esbuild@^0.28.2, hono@^4.13.14, react-dom@^19.3.1, ws@^8.22.0, engines, node, name, private (+5 more)

### Community 42 - "crypto.ts"
Cohesion: 0.21
Nodes (17): primaryKeyOf(), AuthError, confirmPasswordReset(), createSession(), ensureOwnerAdmin(), normalizeEmail(), requestPasswordReset(), setTemporaryPassword() (+9 more)

### Community 43 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+7 more)

### Community 44 - "catalog.ts"
Cohesion: 0.18
Nodes (21): Task 3: Proveedores y modelos en BD + seeders, 3. Proveedores y modelos, 8. Errores y seguridad, `llm/catalog.ts`, Tablas (`002_admin.sql`), availableModels(), CatalogRow, globToRegex() (+13 more)

### Community 45 - "baas/jobs.ts"
Cohesion: 0.21
Nodes (16): addTimer(), cancelTimer(), crons, filesFor(), fireDueTimers(), LIMITS, listJobs(), runJob() (+8 more)

### Community 46 - "accounts.ts"
Cohesion: 0.13
Nodes (35): sendPlatformEmail(), burnPasswordCheck(), hashPassword(), LEGACY, numericCode(), passwordNeedsRehash(), SCRYPT, scryptKey() (+27 more)

### Community 47 - "admin/api.ts"
Cohesion: 0.24
Nodes (13): cache, deleteProvider(), listeners, listProviders(), missing(), OPENROUTER_URL, ProviderError, ProviderRecord (+5 more)

### Community 49 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, @anthropic-ai/sdk@^1.3.0, @electric-sql/pglite@^0.5.13, nodemailer@^10.3.1, pg@^8.23.1, react@^19.3.1, @types/pg@^8.23.1, @types/react@^19.3.0 (+9 more)

### Community 50 - "server.ts"
Cohesion: 0.15
Nodes (16): buildServer(), CONTEXT_TOOLS, DESTRUCTIVE, expectedVersionProp, extraTools, Hints, hintsOf(), projectContext() (+8 more)

### Community 51 - "judge.ts"
Cohesion: 0.21
Nodes (14): cleanText(), extractMemories(), updateSummary(), JUDGE_SYSTEM, judgeDesign(), JudgeInput, parseJudgement(), JUDGE_DIMENSIONS (+6 more)

### Community 52 - "agent.ts"
Cohesion: 0.20
Nodes (13): AgentSpec, GATE_FIXES, IMAGE_TYPES, loadHistory(), summarize(), UPLOADS, BuilderTool, ToolContext (+5 more)

### Community 53 - "Forja"
Cohesion: 0.25
Nodes (8): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, apiUrl(), useApi(), ctx()

### Community 54 - "Desplegar Forja en Coolify"
Cohesion: 0.20
Nodes (10): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+2 more)

### Community 55 - "server/index.ts"
Cohesion: 0.13
Nodes (19): ipOf(), studioApi, closeAll(), app, resolveApp(), server, shutdown(), STUDIO_DIST (+11 more)

### Community 56 - "sdk/server/index.ts"
Cohesion: 0.11
Nodes (4): AiMessage, AppUser, CheckoutInput, StoredFile

### Community 57 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 58 - "serviceContext"
Cohesion: 0.36
Nodes (8): deleteObject(), filePath(), getObject(), MAX_FILE_BYTES, putObject(), safeKey(), storageUsage(), StoredObject

### Community 61 - "admin/api.ts"
Cohesion: 0.16
Nodes (10): adminApi, cancelPlayground(), listPlaygroundRuns(), playgroundRun(), view(), deleteModel(), ModelError, ModelInput (+2 more)

### Community 62 - "metrics.ts"
Cohesion: 0.12
Nodes (18): estTokens(), GATE_THRESHOLD, metricsReport, newRunId(), pending, quiet(), recordStep(), recordToolCall() (+10 more)

### Community 63 - "forja"
Cohesion: 0.07
Nodes (32): BROWSER, args, context, dockerfile, postgres, build, depends_on, environment (+24 more)

### Community 65 - "realtime.ts"
Cohesion: 0.60
Nodes (5): attachSocket(), publish(), realtimeStats(), room(), rooms

### Community 66 - "Inventario de interfaz de Floot → Forja"
Cohesion: 0.25
Nodes (5): Barra lateral del panel, Inventario de interfaz de Floot → Forja, Panel de proyectos, Services (tres columnas: servicios · lista · detalle; los usados primero, el resto atenuado), Vista de proyecto

### Community 67 - "orgs.ts"
Cohesion: 0.23
Nodes (12): assertCanManage(), listOrgMembers(), listOrgs(), Org, ORG_ROLES, OrgRole, orgRoleOf(), ownerCount() (+4 more)

### Community 68 - "typecheck.ts"
Cohesion: 0.27
Nodes (11): IGNORED, isSource(), MODULES, parseDiagnostics(), require, run(), SDK, tsconfig() (+3 more)

### Community 69 - "serverTypes.test.ts"
Cohesion: 0.20
Nodes (4): Ctx, JobCtx, ServiceCtx, JobContext

### Community 70 - "config.ts"
Cohesion: 0.13
Nodes (18): cloneDatabase(), closeProject(), dumpDatabase(), execSql(), get(), isAwake(), Open, openDb() (+10 more)

### Community 71 - "base"
Cohesion: 0.40
Nodes (6): base(), currentPath(), Link(), navigate(), notify(), runtime()

### Community 73 - "publish.ts"
Cohesion: 0.33
Nodes (9): Author, isSlugTaken(), unpublish(), formatProblem(), publishProject(), suggestSlug(), unpublishProject(), formatFinding() (+1 more)

### Community 74 - "reactions.ts"
Cohesion: 0.33
Nodes (8): 2. Ajustes globales, Almacén, Registro, resetTransport(), reloadLangfuse(), reschedulePoll(), wireSettingReactions(), onSettingsChanged()

### Community 75 - "forja"
Cohesion: 0.29
Nodes (6): environment, ports, ports, services, forja, postgres

### Community 76 - "AppEnv"
Cohesion: 0.29
Nodes (6): AppUser, AppEnv, EndpointContext, AppTarget, Run, RunInput

### Community 77 - "src/api.ts"
Cohesion: 0.36
Nodes (6): bytes(), Folder, Project, Meter(), Plan(), Usage

### Community 78 - "useRoute"
Cohesion: 0.67
Nodes (4): ForjaApp(), matchRoute(), subscribe(), useRoute()

### Community 79 - "toolOutputs.test.ts"
Cohesion: 0.29
Nodes (5): out(), handleMcp(), BEFORE, conforms(), dir

### Community 80 - "events.ts"
Cohesion: 0.29
Nodes (5): LogEntry, logs, ProjectEvent, projectEvents, readLogs()

### Community 81 - "Providers.tsx"
Cohesion: 0.38
Nodes (6): AddProvider(), KIND_HINT, Probe, ProviderCard(), Providers(), ProviderView

### Community 83 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 84 - "safeFetch.ts"
Cohesion: 0.47
Nodes (3): assertPublic(), fetchPublicText(), isPrivate()

### Community 85 - "Review Focus"
Cohesion: 0.50
Nodes (4): Review Focus, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 7: `.env`, documentación y verificación final

### Community 86 - "store.ts"
Cohesion: 0.13
Nodes (26): Task 2: Registro y almacén de ajustes, browserAvailable, CONFIG_DEFAULTS, byKey, Def, defs, getPath(), GROUPS (+18 more)

### Community 87 - "analytics.ts"
Cohesion: 0.53
Nodes (5): analyticsSummary(), browserOf(), deviceOf(), recordPageView(), visitorId()

### Community 88 - "FileMap"
Cohesion: 0.47
Nodes (4): escapeRe(), replaceVisibleText(), TextEditResult, FileMap

### Community 90 - "usage.ts"
Cohesion: 0.50
Nodes (4): actionsToday(), countAction(), DAILY_ACTIONS, usageSummary()

## Knowledge Gaps
- **1 isolated node(s):** `TEST_DATABASE_URL`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 601 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.tsx` to `Chat.tsx`, `Dashboard.tsx`, `Integrations.tsx`, `ProjectView.tsx`, `package.json`, `ProjectView.tsx`, `timeAgo`, `src/api.ts`, `dependencies`, `api`, `Providers.tsx`, `client/index.ts`, `Changes.tsx`?**
  _High betweenness centrality (0.255) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `api()` (e.g. with `Task 6: Studio — página de administración` and `7. Studio`) actually correct?**
  _`api()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `TEST_DATABASE_URL` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `browser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1349206349206349 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `ref_node_path` to `browser.ts`, `llm/router.ts`, `securityReview.ts`, `score.ts`, `problems.ts`, `builder/index.ts`, `bundler.ts`, `Changes.tsx`, `guides.ts`, `devDependencies`, `package.json`, `server/index.ts`, `mcp/jobs.ts`, `metrics.ts`, `typecheck.ts`, `serverTypes.test.ts`, `toolOutputs.test.ts`, `apiTypes.test.ts`, `FileMap`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **Should `001_init.sql` be split into smaller, more focused modules?**
  _Cohesion score 0.06497175141242938 - nodes in this community are weakly interconnected._
- **Why does `hono` connect `package.json` to `runner.ts`, `studioApi.ts`, `admin/api.ts`, `server/index.ts`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._