# Graph Report - forje-software-studio  (2026-11-01)

## Corpus Check
- 172 files · ~165,508 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .css 2, .example 1)

## Summary
- 1864 nodes · 4984 edges · 101 communities (88 shown, 13 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 103 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `57f12695`
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
- roles.ts
- llm/router.ts
- platform/security.ts
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
- Panel de administración del sistema — diseño
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
- platformDb
- agents.dbg.mjs
- ai.ts
- package.json
- probe.ts
- scripts
- catalog.ts
- baas/jobs.ts
- accounts.ts
- admin/api.ts
- evals.test.ts
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
- playground.ts
- metrics.ts
- forja
- realtime.ts
- Inventario de interfaz de Floot → Forja
- orgs.ts
- typecheck.ts
- serverTypes.test.ts
- config.ts
- base
- AgentLanes.tsx
- publish.ts
- projectDb.ts
- forja
- AppEnv
- src/api.ts
- useRoute
- securityReview.ts
- Memory.tsx
- Evals.tsx
- TEST_DATABASE_URL
- apiTypes.test.ts
- safeFetch.ts
- Review Focus
- store.ts
- Agents.tsx
- FileMap
- Db
- callModel
- ApiError
- send
- croner
- Skills.tsx
- PreviewHandle
- esbuild
- hono
- nodemailer
- @types/pg@^8.23.1
- @types/react@^19.3.0

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
- `Arranque` --references--> `main()`  [INFERRED]
  README.md → server/db/cli.ts
- `Task 4: API de administración (ajustes, proveedores, modelos, sondas)` --references--> `rateLimit()`  [INFERRED]
  docs/superpowers/plans/2026-11-01-panel-admin.md → server/lib/security.ts

## Import Cycles
- None detected.

## Communities (101 total, 13 thin omitted)

### Community 0 - "browser.ts"
Cohesion: 0.11
Nodes (29): playwright-core@1.64.1, playwright-core, projectView(), baseFor(), resolveApp(), getProjectBySlug(), allowedRequest(), BrowserStep (+21 more)

### Community 1 - "001_init.sql"
Cohesion: 0.06
Nodes (58): account_integrations, account_models, account_sessions, accounts, agent_steps, agent_steps_project, agent_steps_run, agent_tasks (+50 more)

### Community 2 - "orchestrator.ts"
Cohesion: 0.15
Nodes (28): describeSchema(), save(), active, commitMessage(), FAST_TOOLS, finishTask(), GATED_ROLES, insertTask() (+20 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.09
Nodes (31): Block, Chat(), fileName(), inline(), Item, Markdown(), markId(), MentionMenu() (+23 more)

### Community 4 - "Dashboard.tsx"
Cohesion: 0.11
Nodes (25): ApiError, Folder, Project, streamPost(), Back, External, Globe, Send (+17 more)

### Community 5 - "github.ts"
Cohesion: 0.11
Nodes (30): emitProject(), blobSha(), branchHead(), connectAccount(), createRepo(), disconnectAccount(), doSync(), gh() (+22 more)

### Community 6 - "ProjectView.tsx"
Cohesion: 0.09
Nodes (33): api(), SelectedElement, GithubCard, GithubCommitCard(), GithubSection(), Link, Mark(), ModelChecklist() (+25 more)

### Community 7 - "appServer.ts"
Cohesion: 0.09
Nodes (38): AiUnavailableError, appAiChat(), appHeaders(), rateLimit(), RateLimitError, studioOrigins(), uploadHeaders(), windows (+30 more)

### Community 8 - "context.ts"
Cohesion: 0.11
Nodes (7): HttpError, publish(), serviceContext, EmailInput, CheckoutInput, paymentsFor(), listObjects()

### Community 9 - "App.tsx"
Cohesion: 0.15
Nodes (23): App(), Me, NAV, Redirect(), Shell(), UserMenu(), Logo(), AccountModels() (+15 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "ProjectView.tsx"
Cohesion: 0.13
Nodes (43): timeAgo(), TurnDetails(), Refresh, AiPanel(), CodePanel(), EmailPanel(), Header(), JobsPanel() (+35 more)

### Community 12 - "roles.ts"
Cohesion: 0.10
Nodes (18): BACKEND, CHECKLIST, DATA, DESIGN, FAST_EXCLUDED_TOOLS, FIRST_BUILD, FRONTEND, JOBS (+10 more)

### Community 13 - "llm/router.ts"
Cohesion: 0.10
Nodes (30): penalizeTurn(), gamma(), gaussian(), Posterior, posteriors(), prior(), recordOutcome(), sampleBeta() (+22 more)

### Community 14 - "platform/security.ts"
Cohesion: 0.15
Nodes (19): getSecurity(), ignoredIds(), Row, runQuickScan(), ScanView, SecurityView, setIgnored(), FileMap (+11 more)

### Community 15 - "ref_node_path"
Cohesion: 0.13
Nodes (17): Task 1: Postgres, migraciones y helper de tests, pg, vitest, out(), migrate(), MIGRATIONS_DIR, handleMcp(), drop() (+9 more)

### Community 16 - "score.ts"
Cohesion: 0.19
Nodes (18): EvalSize, aggregate, CaseResult, clamp01(), counted(), hygieneScore(), judgeScore(), mean() (+10 more)

### Community 17 - "api"
Cohesion: 0.11
Nodes (27): react, Switch(), PublishPanel(), AddModel(), CatalogModel, enc(), matches(), Models() (+19 more)

### Community 18 - "e2e.mjs"
Cohesion: 0.08
Nodes (25): browse(), creation, DATA, evil, files, fresh, got, jar (+17 more)

### Community 19 - "problems.ts"
Cohesion: 0.16
Nodes (23): createFinishGate(), key(), mine(), newBuildProblems(), newRuntimeProblems(), LogEntry, changed(), clearProblems() (+15 more)

### Community 20 - "client/index.ts"
Cohesion: 0.10
Nodes (21): ai, api, AppUser, auth, baas(), channels, ChatMessage, ensureSocket() (+13 more)

### Community 21 - "studioApi.ts"
Cohesion: 0.08
Nodes (20): Env, memoryOf(), pid(), primaryKeyOf(), SESSION_COOKIE, startSession(), getTransport(), listEmails() (+12 more)

### Community 22 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 23 - "builder/index.ts"
Cohesion: 0.12
Nodes (22): buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf(), ProjectIndex (+14 more)

### Community 24 - "tools.ts"
Cohesion: 0.08
Nodes (22): B, I, N, S, ToolOutput, typed(), readLogs(), BUILTIN_PACKAGES (+14 more)

### Community 25 - "runner.ts"
Cohesion: 0.14
Nodes (26): sessionCookie(), isBuilding(), stopBuilding(), evalsApi, Active, activeRunId(), cancelRun(), checkOf() (+18 more)

### Community 26 - "Panel de administración del sistema — diseño"
Cohesion: 0.11
Nodes (19): 10. Documentación, 1. Capa de datos, 2. Ajustes globales, 4. Playground de agentes, 5. Enrutador, 7. Studio, 8. Errores y seguridad, Decisiones tomadas con el usuario (+11 more)

### Community 27 - "bundler.ts"
Cohesion: 0.16
Nodes (22): BuildError, buildExamples(), bundleBrowser(), checkProject(), compileCache, CompiledModule, compileServerModule(), EndpointInfo (+14 more)

### Community 28 - "Changes.tsx"
Cohesion: 0.19
Nodes (15): baseName(), cache, ChangeCard(), diffStats(), FileChange, FileDiff(), KIND, TimelineEntry (+7 more)

### Community 29 - "q"
Cohesion: 0.11
Nodes (24): Global Constraints, Panel de administración + Postgres — plan de implementación, deleteSecret(), listSecrets(), projectSecretEnv(), requestSecret(), SECRET_NAME, secretEnv() (+16 more)

### Community 30 - "guides.ts"
Cohesion: 0.19
Nodes (14): BUILDER_SYSTEM_PROMPT, builderTools, build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS (+6 more)

### Community 31 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 32 - "projects.ts"
Cohesion: 0.10
Nodes (33): imageBlocks(), deleteAccount(), projectPath(), createPersonalOrg(), ensurePersonalOrg(), personalOrgId(), assertValidPath(), ChangeEntry (+25 more)

### Community 33 - "memory.ts"
Cohesion: 0.14
Nodes (19): addMemory(), assertKind(), cleanText(), deleteMemory(), KIND_LABEL, LIMIT, listMemories(), MAX_MEMORY_CHARS (+11 more)

### Community 34 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2, vitest@^5.0.5 (+6 more)

### Community 35 - "Integrations.tsx"
Cohesion: 0.25
Nodes (10): AddRowDialog(), Modal(), TextDialog(), CreateDialog(), Integration, Integrations(), TYPE_HINT, TYPE_ICON (+2 more)

### Community 36 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 37 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+8 more)

### Community 38 - "platformDb"
Cohesion: 0.20
Nodes (8): Conexión, ANTHROPIC_MODELS, PROVIDERS, seedDefaults(), closePlatformDb(), platformDb, Tx, wrap()

### Community 39 - "agents.dbg.mjs"
Cohesion: 0.10
Nodes (18): here, app, DATA, app, DATA, MODELS, req(), ROOT (+10 more)

### Community 40 - "ai.ts"
Cohesion: 0.20
Nodes (14): aiUsage(), AppAiInput, anthropicChat(), getClient(), SERVER_FALLBACK, compatChat(), OpenAiMessage, Part (+6 more)

### Community 41 - "package.json"
Cohesion: 0.17
Nodes (11): @types/node@^26.6.6, typescript@^7.0.2, ws@^8.22.0, engines, node, name, private, type (+3 more)

### Community 42 - "probe.ts"
Cohesion: 0.18
Nodes (16): 3. Proveedores y modelos, 6. API de administración, Pruebas de conexión, Tablas (`002_admin.sql`), call(), ECHO_TOOL, errorOf(), ModelProbe (+8 more)

### Community 43 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+7 more)

### Community 44 - "catalog.ts"
Cohesion: 0.19
Nodes (21): Task 3: Proveedores y modelos en BD + seeders, 9. Pruebas, `llm/catalog.ts`, availableModels(), CatalogRow, globToRegex(), lastSync(), listCatalog() (+13 more)

### Community 45 - "baas/jobs.ts"
Cohesion: 0.18
Nodes (19): bindJobs(), addTimer(), cancelTimer(), crons, filesFor(), fireDueTimers(), LIMITS, listJobs() (+11 more)

### Community 46 - "accounts.ts"
Cohesion: 0.09
Nodes (53): AuthError, confirmPasswordReset(), createSession(), endSession(), ensureOwnerAdmin(), normalizeEmail(), requestPasswordReset(), setTemporaryPassword() (+45 more)

### Community 47 - "admin/api.ts"
Cohesion: 0.12
Nodes (25): zod, adminApi, resetRouter(), routerStats, readSeedFile(), SeedFile, seedLocal(), meanOf() (+17 more)

### Community 48 - "evals.test.ts"
Cohesion: 0.19
Nodes (12): caseById(), EVAL_CASES, EVAL_SET_VERSION, EvalCase, defaultJudge(), startRun(), PreviewCheck, PageInspection (+4 more)

### Community 49 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, @anthropic-ai/sdk@^1.3.0, @electric-sql/pglite@^0.5.13, @hono/node-server@^2.1.5, @modelcontextprotocol/sdk@^1.32.2, pg@^8.23.1, react@^19.3.1, react-dom@^19.3.1 (+8 more)

### Community 50 - "server.ts"
Cohesion: 0.15
Nodes (18): buildServer(), CONTEXT_TOOLS, DESTRUCTIVE, expectedVersionProp, extraTools, Hints, hintsOf(), projectContext() (+10 more)

### Community 51 - "judge.ts"
Cohesion: 0.29
Nodes (7): JUDGE_SYSTEM, judgeDesign(), JudgeInput, parseJudgement(), JUDGE_DIMENSIONS, JudgeDimension, Judgement

### Community 52 - "agent.ts"
Cohesion: 0.11
Nodes (29): PlaygroundView, AgentEvent, AgentResult, AgentSpec, GATE_FIXES, IMAGE_TYPES, loadHistory(), runAgent() (+21 more)

### Community 53 - "Forja"
Cohesion: 0.25
Nodes (8): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, apiUrl(), useApi(), ctx()

### Community 54 - "Desplegar Forja en Coolify"
Cohesion: 0.20
Nodes (11): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+3 more)

### Community 55 - "server/index.ts"
Cohesion: 0.15
Nodes (14): ipOf(), studioApi, closeAll(), app, server, shutdown(), STUDIO_DIST, wss (+6 more)

### Community 56 - "sdk/server/index.ts"
Cohesion: 0.11
Nodes (4): AiMessage, AppUser, CheckoutInput, StoredFile

### Community 57 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 58 - "serviceContext"
Cohesion: 0.36
Nodes (8): deleteObject(), filePath(), getObject(), MAX_FILE_BYTES, putObject(), safeKey(), storageUsage(), StoredObject

### Community 61 - "playground.ts"
Cohesion: 0.13
Nodes (25): cancelPlayground(), execute(), listPlaygroundRuns(), PLAYGROUND_ROLES, playgroundBusy(), PlaygroundError, PlaygroundRole, playgroundRoles() (+17 more)

### Community 62 - "metrics.ts"
Cohesion: 0.12
Nodes (17): resetTransport(), estTokens(), GATE_THRESHOLD, metricsReport, pending, StepRecord, ToolCallRecord, ToolStat (+9 more)

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
Cohesion: 0.18
Nodes (20): seedDev(), one(), q(), addOrgMember(), assertCanManage(), createOrg(), listOrgMembers(), listOrgs() (+12 more)

### Community 68 - "typecheck.ts"
Cohesion: 0.22
Nodes (11): BuildProblem, IGNORED, isSource(), MODULES, parseDiagnostics(), require, run(), SDK (+3 more)

### Community 69 - "serverTypes.test.ts"
Cohesion: 0.20
Nodes (4): Ctx, JobCtx, ServiceCtx, JobContext

### Community 70 - "config.ts"
Cohesion: 0.09
Nodes (21): analyticsSummary(), browserOf(), deviceOf(), recordPageView(), visitorId(), browserAvailable, config, DEFAULT_MODELS_ALLOW (+13 more)

### Community 71 - "base"
Cohesion: 0.40
Nodes (6): base(), currentPath(), Link(), navigate(), notify(), runtime()

### Community 72 - "AgentLanes.tsx"
Cohesion: 0.24
Nodes (13): AgentLanes(), Lane, LaneCard(), LaneStep, money(), ROLE, Savings(), STEP_LABEL (+5 more)

### Community 73 - "publish.ts"
Cohesion: 0.33
Nodes (9): Author, isSlugTaken(), recordPublish(), unpublish(), publishProject(), suggestSlug(), unpublishProject(), formatFinding() (+1 more)

### Community 74 - "projectDb.ts"
Cohesion: 0.26
Nodes (11): cloneDatabase(), closeProject(), dumpDatabase(), execSql(), get(), isAwake(), Open, openDb() (+3 more)

### Community 75 - "forja"
Cohesion: 0.29
Nodes (6): environment, ports, ports, services, forja, postgres

### Community 76 - "AppEnv"
Cohesion: 0.29
Nodes (6): AppUser, AppEnv, EndpointContext, AppTarget, Run, RunInput

### Community 77 - "src/api.ts"
Cohesion: 0.60
Nodes (4): bytes(), Meter(), Plan(), Usage

### Community 78 - "useRoute"
Cohesion: 0.67
Nodes (4): ForjaApp(), matchRoute(), subscribe(), useRoute()

### Community 79 - "securityReview.ts"
Cohesion: 0.24
Nodes (11): ROLE_PROMPTS, ROLE_TOOLS, Reported, running, runSecurityReview(), SEVERITIES, startSecurityReview(), toolByName (+3 more)

### Community 80 - "Memory.tsx"
Cohesion: 0.24
Nodes (9): Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection(), MemoryView, Scope (+1 more)

### Community 81 - "Evals.tsx"
Cohesion: 0.28
Nodes (8): Agg, download(), EvalCfg, Evals(), money(), RunDetail, RunSummary, STATUS

### Community 83 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 84 - "safeFetch.ts"
Cohesion: 0.47
Nodes (3): assertPublic(), fetchPublicText(), isPrivate()

### Community 85 - "Review Focus"
Cohesion: 0.40
Nodes (5): Review Focus, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final

### Community 86 - "store.ts"
Cohesion: 0.14
Nodes (26): Task 2: Registro y almacén de ajustes, Almacén, CONFIG_DEFAULTS, byKey, Def, defs, getPath(), GROUPS (+18 more)

### Community 87 - "Agents.tsx"
Cohesion: 0.32
Nodes (7): AgentEvent, Agents(), ROLE_LABEL, RoleInfo, RunPanel(), RunView, ToolLine()

### Community 88 - "FileMap"
Cohesion: 0.47
Nodes (4): escapeRe(), replaceVisibleText(), TextEditResult, page()

### Community 90 - "callModel"
Cohesion: 0.48
Nodes (7): cleanText(), extractMemories(), updateSummary(), analyzeRequest(), callModel(), logDecision(), textOf()

### Community 92 - "send"
Cohesion: 0.29
Nodes (7): send(), summarize(), teamOf(), toItems(), turnTitle(), userItem(), withElement()

### Community 94 - "Skills.tsx"
Cohesion: 0.33
Nodes (6): filterSkills(), norm(), Skill, SkillMode, SKILLS, SlashMenu()

## Knowledge Gaps
- **1 isolated node(s):** `TEST_DATABASE_URL`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 601 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `api` to `Chat.tsx`, `Dashboard.tsx`, `Integrations.tsx`, `ProjectView.tsx`, `AgentLanes.tsx`, `package.json`, `App.tsx`, `ProjectView.tsx`, `src/api.ts`, `Memory.tsx`, `dependencies`, `Evals.tsx`, `client/index.ts`, `Agents.tsx`, `Changes.tsx`?**
  _High betweenness centrality (0.263) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `api()` (e.g. with `Task 6: Studio — página de administración` and `7. Studio`) actually correct?**
  _`api()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `TEST_DATABASE_URL` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `browser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10984848484848485 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `ref_node_path` to `browser.ts`, `llm/router.ts`, `platform/security.ts`, `problems.ts`, `builder/index.ts`, `tools.ts`, `Changes.tsx`, `guides.ts`, `devDependencies`, `package.json`, `evals.test.ts`, `server/index.ts`, `mcp/jobs.ts`, `metrics.ts`, `typecheck.ts`, `serverTypes.test.ts`, `config.ts`, `apiTypes.test.ts`, `FileMap`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **Should `001_init.sql` be split into smaller, more focused modules?**
  _Cohesion score 0.06497175141242938 - nodes in this community are weakly interconnected._
- **Why does `hono` connect `hono` to `package.json`, `admin/api.ts`, `studioApi.ts`, `server/index.ts`, `runner.ts`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._