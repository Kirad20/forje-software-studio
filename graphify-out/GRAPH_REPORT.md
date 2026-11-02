# Graph Report - forje-software-studio  (2026-11-02)

## Corpus Check
- 244 files · ~178,341 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .css 2, .example 1)

## Summary
- 2266 nodes · 5905 edges · 114 communities (96 shown, 18 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 159 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `218a3db0`
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
- bandit.ts
- platform/security.ts
- ref_node_path
- auth.ts
- api
- e2e.mjs
- problems.ts
- client/index.ts
- collaboration/index.ts
- Inventario de funciones de Lovable → Forja
- builder/index.ts
- tools.ts
- playground.ts
- Panel de administración del sistema — diseño
- bundler.ts
- projects/index.ts
- integrations.ts
- server.ts
- github.mjs
- projects.ts
- memory.ts
- devDependencies
- identity/index.ts
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
- providers.ts
- studioApi.ts
- dependencies
- crypto.ts
- judge.ts
- llm/router.ts
- Forja
- Desplegar Forja en Coolify
- server/index.ts
- sdk/server/index.ts
- urls.ts
- reactions.ts
- CLAUDE.md
- sandbox.ts
- rename.ts
- metrics.ts
- forja
- realtime.ts
- Inventario de interfaz de Floot → Forja
- ExecutionMetrics
- typecheck.ts
- components/Models.tsx
- config.ts
- base
- IAccountRepository
- OrgRole
- projectDb.ts
- forja
- analytics.ts
- soclo-cal.py
- useRoute
- securityReview.ts
- Memory.tsx
- score.ts
- TEST_DATABASE_URL
- apiTypes.test.ts
- safeFetch.ts
- Review Focus
- store.ts
- runner.ts
- FileMap
- settings/index.ts
- InviteMemberUseCase.ts
- ApiError
- admin/api.ts
- croner
- identity/usecases.test.ts
- storage.ts
- @types/node@^26.6.6
- IMemberRepository
- lib/security.ts
- collaboration/ports/repositories.ts
- PostgresOrganizationRepository
- ai.ts
- listSettings
- registry.ts
- PostgresProjectFileRepository.ts
- SettingValue
- SettingDefinition
- callModel
- Organization
- ISecretCipher
- @anthropic-ai/sdk
- hono
- @types/pg@^8.23.1
- @types/react@^19.3.0

## God Nodes (most connected - your core abstractions)
1. `q()` - 149 edges
2. `api()` - 72 edges
3. `vitest` - 43 edges
4. `one()` - 43 edges
5. `ProjectView()` - 37 edges
6. `runBuilderTurn()` - 32 edges
7. `sha256()` - 32 edges
8. `readAllFiles()` - 31 edges
9. `react` - 30 edges
10. `timeAgo()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `1. Chat y agente del constructor` --references--> `selectContext()`  [INFERRED]
  docs/inventario-lovable.md → server/builder/index.ts
- `6. IA dentro de las apps` --references--> `tools()`  [INFERRED]
  docs/inventario-lovable.md → server/builder/orchestrator.ts
- `Hoja de ruta propuesta` --references--> `updateSummary()`  [INFERRED]
  docs/inventario-lovable.md → server/builder/orchestrator.ts
- `Arranque` --references--> `main()`  [INFERRED]
  README.md → server/db/cli.ts
- `4. Playground de agentes` --references--> `runAgent()`  [INFERRED]
  docs/superpowers/specs/2026-11-01-panel-admin-design.md → server/builder/agent.ts

## Import Cycles
- None detected.

## Communities (114 total, 18 thin omitted)

### Community 0 - "browser.ts"
Cohesion: 0.16
Nodes (17): playwright-core@1.64.1, playwright-core, allowedRequest(), BrowserStep, BrowserTestInput, BrowserTestResult, describe(), getBrowser() (+9 more)

### Community 1 - "001_init.sql"
Cohesion: 0.06
Nodes (58): account_integrations, account_models, account_sessions, accounts, agent_steps, agent_steps_project, agent_steps_run, agent_tasks (+50 more)

### Community 2 - "orchestrator.ts"
Cohesion: 0.10
Nodes (43): describeSchema(), save(), UPLOADS, active, cleanText(), commitMessage(), extractMemories(), FAST_TOOLS (+35 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.05
Nodes (66): ApiError, streamPost(), AgentLanes(), Lane, LaneCard(), LaneStep, money(), ROLE (+58 more)

### Community 4 - "Dashboard.tsx"
Cohesion: 0.15
Nodes (18): Folder, Project, Back, External, Globe, Send, Dashboard(), IDEAS (+10 more)

### Community 5 - "github.ts"
Cohesion: 0.11
Nodes (30): emitProject(), blobSha(), branchHead(), connectAccount(), createRepo(), disconnectAccount(), doSync(), gh() (+22 more)

### Community 6 - "ProjectView.tsx"
Cohesion: 0.06
Nodes (46): baseName(), cache, ChangeCard(), diffStats(), FileChange, FileDiff(), KIND, TurnChanges (+38 more)

### Community 7 - "appServer.ts"
Cohesion: 0.17
Nodes (23): log(), Project, analyticsBeacon(), AppTarget, badge(), callEndpoint(), clientBundle(), clientCache (+15 more)

### Community 8 - "context.ts"
Cohesion: 0.09
Nodes (8): AppUser, EndpointContext, HttpError, JobContext, publish(), serviceContext, CheckoutInput, paymentsFor()

### Community 9 - "App.tsx"
Cohesion: 0.11
Nodes (36): api(), bytes(), App(), Me, NAV, Redirect(), Shell(), UserMenu() (+28 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "ProjectView.tsx"
Cohesion: 0.16
Nodes (35): Refresh, AiPanel(), CodePanel(), EmailPanel(), Header(), JobsPanel(), Loading(), LogsPanel() (+27 more)

### Community 12 - "roles.ts"
Cohesion: 0.10
Nodes (18): BACKEND, CHECKLIST, DATA, DESIGN, FAST_EXCLUDED_TOOLS, FIRST_BUILD, FRONTEND, JOBS (+10 more)

### Community 13 - "bandit.ts"
Cohesion: 0.17
Nodes (16): resetRouter(), routerStats, penalizeTurn(), gamma(), gaussian(), meanOf(), Posterior, posteriors() (+8 more)

### Community 14 - "platform/security.ts"
Cohesion: 0.15
Nodes (19): getSecurity(), ignoredIds(), Row, runQuickScan(), ScanView, SecurityView, setIgnored(), FileMap (+11 more)

### Community 15 - "ref_node_path"
Cohesion: 0.11
Nodes (20): pg, vitest, out(), migrate(), MIGRATIONS_DIR, handleMcp(), app, DATA (+12 more)

### Community 16 - "auth.ts"
Cohesion: 0.15
Nodes (22): AuthError, confirmPasswordReset(), createSession(), endSession(), ensureOwnerAdmin(), normalizeEmail(), requestPasswordReset(), setTemporaryPassword() (+14 more)

### Community 17 - "api"
Cohesion: 0.07
Nodes (45): react, timeAgo(), Switch(), CheckpointPanel(), PublishPanel(), AgentEvent, Agents(), ROLE_LABEL (+37 more)

### Community 18 - "e2e.mjs"
Cohesion: 0.08
Nodes (25): browse(), creation, DATA, evil, files, fresh, got, jar (+17 more)

### Community 19 - "problems.ts"
Cohesion: 0.18
Nodes (21): createFinishGate(), key(), mine(), newBuildProblems(), newRuntimeProblems(), changed(), clearProblems(), fingerprint() (+13 more)

### Community 20 - "client/index.ts"
Cohesion: 0.10
Nodes (21): ai, api, AppUser, auth, baas(), channels, ChatMessage, ensureSocket() (+13 more)

### Community 21 - "collaboration/index.ts"
Cohesion: 0.15
Nodes (13): checkAccessUseCase, collaborationAccountRepository, collaborationMailerService, inviteMemberUseCase, memberRepository, removeMemberUseCase, PostgresCollaborationAccountRepository, CollaborationAccount (+5 more)

### Community 22 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 23 - "builder/index.ts"
Cohesion: 0.18
Nodes (18): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+10 more)

### Community 24 - "tools.ts"
Cohesion: 0.12
Nodes (7): B, I, N, S, ToolOutput, typed(), withManifestLock()

### Community 25 - "playground.ts"
Cohesion: 0.13
Nodes (28): execute(), listPlaygroundRuns(), PLAYGROUND_ROLES, playgroundBusy(), PlaygroundError, PlaygroundRole, playgroundRoles(), playgroundRun() (+20 more)

### Community 26 - "Panel de administración del sistema — diseño"
Cohesion: 0.11
Nodes (17): 10. Documentación, 1. Capa de datos, 3. Proveedores y modelos, 4. Playground de agentes, 5. Enrutador, 7. Studio, Decisiones tomadas con el usuario, `.env` resultante (+9 more)

### Community 27 - "bundler.ts"
Cohesion: 0.09
Nodes (37): page(), buildClient(), BuildError, buildExamples(), bundleBrowser(), checkProject(), compileCache, CompiledModule (+29 more)

### Community 28 - "projects/index.ts"
Cohesion: 0.06
Nodes (24): CreateCheckpointUseCase, CreateProjectInput, CreateProjectUseCase, DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, Checkpoint, CheckpointProps (+16 more)

### Community 29 - "integrations.ts"
Cohesion: 0.13
Nodes (21): deleteSecret(), listSecrets(), projectSecretEnv(), requestSecret(), SECRET_NAME, secretEnv(), setSecret(), decrypt() (+13 more)

### Community 30 - "server.ts"
Cohesion: 0.06
Nodes (43): BUILDER_SYSTEM_PROMPT, builderTools, build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS (+35 more)

### Community 31 - "github.mjs"
Cohesion: 0.12
Nodes (9): here, blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT (+1 more)

### Community 32 - "projects.ts"
Cohesion: 0.08
Nodes (27): PostgresMemberRepository, PostgresLoginCodeRepository, q(), ChangeEntry, createFolder(), deleteFolder(), diffable(), duplicateProject() (+19 more)

### Community 33 - "memory.ts"
Cohesion: 0.15
Nodes (17): addMemory(), assertKind(), cleanText(), deleteMemory(), KIND_LABEL, LIMIT, MAX_MEMORY_CHARS, Memory (+9 more)

### Community 34 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2, vitest@^5.0.5 (+6 more)

### Community 35 - "identity/index.ts"
Cohesion: 0.11
Nodes (13): LoginWithPasswordUseCase, Account, AccountProps, PlatformRole, Email, COMMON_PASSWORDS, accountRepository, loginCodeRepository (+5 more)

### Community 36 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 37 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+8 more)

### Community 38 - "platformDb"
Cohesion: 0.29
Nodes (6): Conexión, ANTHROPIC_MODELS, PROVIDERS, seedDefaults(), closePlatformDb(), Tx

### Community 39 - "agents.dbg.mjs"
Cohesion: 0.18
Nodes (10): app, DATA, MODELS, ROOT, SEED, call(), log, reply() (+2 more)

### Community 40 - "ai.ts"
Cohesion: 0.24
Nodes (11): anthropicChat(), getClient(), SERVER_FALLBACK, compatChat(), OpenAiMessage, Part, toOpenAi(), providerSecret() (+3 more)

### Community 41 - "package.json"
Cohesion: 0.17
Nodes (11): @modelcontextprotocol/sdk@^1.32.2, nodemailer@^10.3.1, ws@^8.22.0, engines, node, name, private, type (+3 more)

### Community 42 - "probe.ts"
Cohesion: 0.21
Nodes (15): 6. API de administración, call(), ECHO_TOOL, errorOf(), listProviderModels(), ModelProbe, perMillion(), PROBE_SYSTEM (+7 more)

### Community 43 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+7 more)

### Community 44 - "catalog.ts"
Cohesion: 0.22
Nodes (18): 9. Pruebas, `llm/catalog.ts`, availableModels(), CatalogRow, globToRegex(), lastSync(), listCatalog(), platformAllows() (+10 more)

### Community 45 - "baas/jobs.ts"
Cohesion: 0.13
Nodes (26): bindJobs(), addTimer(), cancelTimer(), crons, filesFor(), fireDueTimers(), LIMITS, listJobs() (+18 more)

### Community 46 - "accounts.ts"
Cohesion: 0.06
Nodes (39): DEV_FIXTURE, Fixture, seedDev(), ORG_ROLES, createOrgUseCase, manageOrgMemberUseCase, organizationRepository, Password (+31 more)

### Community 47 - "providers.ts"
Cohesion: 0.17
Nodes (16): Task 3: Proveedores y modelos en BD + seeders, [command, ...flags], readSeedFile(), SeedFile, seedLocal(), cache, deleteProvider(), encryptHeaders() (+8 more)

### Community 48 - "studioApi.ts"
Cohesion: 0.07
Nodes (20): adminApi, Env, memoryOf(), pid(), primaryKeyOf(), SESSION_COOKIE, startSession(), EmailInput (+12 more)

### Community 49 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, @hono/node-server@^2.1.5, pg@^8.23.1, react@^19.3.1, react-dom@^19.3.1, @types/react-dom@^19.3.0 (+9 more)

### Community 50 - "crypto.ts"
Cohesion: 0.24
Nodes (10): burnPasswordCheck(), hashPassword(), LEGACY, passwordNeedsRehash(), SCRYPT, scryptKey(), verifyPassword(), waiting (+2 more)

### Community 51 - "judge.ts"
Cohesion: 0.25
Nodes (8): defaultJudge(), JUDGE_SYSTEM, judgeDesign(), JudgeInput, parseJudgement(), JUDGE_DIMENSIONS, JudgeDimension, Judgement

### Community 52 - "llm/router.ts"
Cohesion: 0.09
Nodes (33): PlaygroundView, AgentEvent, AgentResult, AgentSpec, GATE_FIXES, IMAGE_TYPES, imageBlocks(), loadHistory() (+25 more)

### Community 53 - "Forja"
Cohesion: 0.25
Nodes (8): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, apiUrl(), useApi(), ctx()

### Community 54 - "Desplegar Forja en Coolify"
Cohesion: 0.20
Nodes (11): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+3 more)

### Community 55 - "server/index.ts"
Cohesion: 0.17
Nodes (15): studioApi, closeAll(), app, resolveApp(), server, shutdown(), STUDIO_DIST, wss (+7 more)

### Community 56 - "sdk/server/index.ts"
Cohesion: 0.07
Nodes (8): AiMessage, AppUser, CheckoutInput, Ctx, Db, JobCtx, ServiceCtx, StoredFile

### Community 57 - "urls.ts"
Cohesion: 0.29
Nodes (12): projectView(), baseFor(), appOrigin(), appUrl(), checkShareToken(), previewOrigin(), previewUrl(), SHARE_COOKIE (+4 more)

### Community 58 - "reactions.ts"
Cohesion: 0.18
Nodes (12): resetTransport(), ToolCallRecord, createLangfuse(), Event, fromConfig(), langfuse, LangfuseOptions, reloadLangfuse() (+4 more)

### Community 60 - "sandbox.ts"
Cohesion: 0.17
Nodes (11): AppEnv, beginTransaction(), dispatch(), ProjectSandbox, Run, RunInput, runInSandbox(), SandboxError (+3 more)

### Community 61 - "rename.ts"
Cohesion: 0.31
Nodes (4): resolveImport(), rewriteImports(), specFor(), files

### Community 62 - "metrics.ts"
Cohesion: 0.18
Nodes (13): runAgent(), summarize(), estTokens(), GATE_THRESHOLD, metricsReport, newRunId(), pending, quiet() (+5 more)

### Community 63 - "forja"
Cohesion: 0.07
Nodes (32): BROWSER, args, context, dockerfile, postgres, build, depends_on, environment (+24 more)

### Community 65 - "realtime.ts"
Cohesion: 0.60
Nodes (5): attachSocket(), publish(), realtimeStats(), room(), rooms

### Community 66 - "Inventario de interfaz de Floot → Forja"
Cohesion: 0.25
Nodes (5): Barra lateral del panel, Inventario de interfaz de Floot → Forja, Panel de proyectos, Services (tres columnas: servicios · lista · detalle; los usados primero, el resto atenuado), Vista de proyecto

### Community 67 - "ExecutionMetrics"
Cohesion: 0.11
Nodes (12): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, calculateSpendUseCase (+4 more)

### Community 68 - "typecheck.ts"
Cohesion: 0.25
Nodes (12): readDeps(), IGNORED, isSource(), MODULES, parseDiagnostics(), require, run(), SDK (+4 more)

### Community 69 - "components/Models.tsx"
Cohesion: 0.28
Nodes (8): ModelChecklist(), ModelRow, MODES, price(), ProjectModels(), PROVIDER, ROLE_LABEL, RouterInfo

### Community 70 - "config.ts"
Cohesion: 0.17
Nodes (11): config, DEFAULT_MODELS_ALLOW, env, ROOT_DIR, activeRunId(), EvalError, getRun(), listRuns() (+3 more)

### Community 71 - "base"
Cohesion: 0.40
Nodes (6): base(), currentPath(), Link(), navigate(), notify(), runtime()

### Community 72 - "IAccountRepository"
Cohesion: 0.10
Nodes (6): UpdateAccountNameUseCase, VerifyLoginCodeUseCase, IAccountRepository, ILoginCodeRepository, IPasswordHasher, ISessionRepository

### Community 73 - "OrgRole"
Cohesion: 0.15
Nodes (7): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, OrganizationProps, OrgPolicy, OrgRole, IOrganizationRepository

### Community 74 - "projectDb.ts"
Cohesion: 0.26
Nodes (11): cloneDatabase(), closeProject(), dumpDatabase(), execSql(), get(), isAwake(), Open, openDb() (+3 more)

### Community 75 - "forja"
Cohesion: 0.29
Nodes (6): environment, ports, ports, services, forja, postgres

### Community 76 - "analytics.ts"
Cohesion: 0.53
Nodes (5): analyticsSummary(), browserOf(), deviceOf(), recordPageView(), visitorId()

### Community 78 - "useRoute"
Cohesion: 0.67
Nodes (4): ForjaApp(), matchRoute(), subscribe(), useRoute()

### Community 79 - "securityReview.ts"
Cohesion: 0.24
Nodes (10): ROLE_PROMPTS, ROLE_TOOLS, Reported, running, SEVERITIES, startSecurityReview(), toolByName, saveScan() (+2 more)

### Community 80 - "Memory.tsx"
Cohesion: 0.24
Nodes (9): Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection(), MemoryView, Scope (+1 more)

### Community 81 - "score.ts"
Cohesion: 0.15
Nodes (25): EvalSize, exportRun(), aggregate, CaseResult, clamp01(), counted(), hygieneScore(), judgeScore() (+17 more)

### Community 83 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 84 - "safeFetch.ts"
Cohesion: 0.47
Nodes (3): assertPublic(), fetchPublicText(), isPrivate()

### Community 85 - "Review Focus"
Cohesion: 0.20
Nodes (8): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 1: Postgres, migraciones y helper de tests, Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final, drop()

### Community 86 - "store.ts"
Cohesion: 0.19
Nodes (16): Task 2: Registro y almacén de ajustes, browserAvailable, platformDb, wrap(), schemaOf(), setPath(), settingDef, broken (+8 more)

### Community 87 - "runner.ts"
Cohesion: 0.15
Nodes (21): sessionCookie(), isBuilding(), stopBuilding(), caseById(), EVAL_CASES, EVAL_SET_VERSION, EvalCase, Active (+13 more)

### Community 88 - "FileMap"
Cohesion: 0.47
Nodes (4): escapeRe(), replaceVisibleText(), TextEditResult, FileMap

### Community 89 - "settings/index.ts"
Cohesion: 0.18
Nodes (10): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, SettingDefinitionProps, SettingType, getPlatformSettingsUseCase, settingsRegistry, settingsStore, updatePlatformSettingsUseCase (+2 more)

### Community 90 - "InviteMemberUseCase.ts"
Cohesion: 0.17
Nodes (9): InviteMemberResult, InviteMemberUseCase, ProjectTarget, ProjectInvite, ProjectInviteProps, PlatformCollaborationMailerService, ICollaborationAccountRepository, ICollaborationMailerService (+1 more)

### Community 92 - "admin/api.ts"
Cohesion: 0.17
Nodes (11): Task 4: API de administración (ajustes, proveedores, modelos, sondas), 8. Errores y seguridad, cancelPlayground(), rateLimit(), RateLimitError, deleteModel(), ModelError, ModelInput (+3 more)

### Community 94 - "identity/usecases.test.ts"
Cohesion: 0.20
Nodes (5): getTransport(), sendPlatformEmail(), RequestLoginCodeUseCase, PlatformMailerService, IMailerService

### Community 95 - "storage.ts"
Cohesion: 0.19
Nodes (14): deleteObject(), filePath(), getObject(), listObjects(), MAX_FILE_BYTES, putObject(), safeKey(), storageUsage() (+6 more)

### Community 98 - "lib/security.ts"
Cohesion: 0.21
Nodes (9): ipOf(), resolvePublicUrl(), appHeaders(), clientIp(), requestOrigin(), STUDIO_HEADERS, studioOrigins(), uploadHeaders() (+1 more)

### Community 99 - "collaboration/ports/repositories.ts"
Cohesion: 0.27
Nodes (4): CheckAccessUseCase, ProjectIdentity, Access, MemberAccess

### Community 101 - "ai.ts"
Cohesion: 0.38
Nodes (8): AiUnavailableError, aiUsage(), appAiChat(), AppAiInput, Block, LlmMessage, LlmTool, textOf()

### Community 102 - "listSettings"
Cohesion: 0.22
Nodes (6): 2. Ajustes globales, Almacén, Registro, PostgresPlatformSettingsStoreAdapter, hintOf(), listSettings()

### Community 103 - "registry.ts"
Cohesion: 0.22
Nodes (9): CONFIG_DEFAULTS, byKey, Def, defs, getPath(), GROUPS, SettingGroup, SETTINGS (+1 more)

### Community 107 - "callModel"
Cohesion: 0.33
Nodes (7): Pruebas de conexión, costUsd(), analyzeHeuristic(), analyzeRequest(), callModel(), charge(), logDecision()

## Knowledge Gaps
- **1 isolated node(s):** `TEST_DATABASE_URL`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 694 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `api` to `Chat.tsx`, `Dashboard.tsx`, `components/Models.tsx`, `ProjectView.tsx`, `package.json`, `App.tsx`, `ProjectView.tsx`, `Memory.tsx`, `dependencies`, `client/index.ts`?**
  _High betweenness centrality (0.198) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `api()` (e.g. with `Task 6: Studio — página de administración` and `7. Studio`) actually correct?**
  _`api()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `TEST_DATABASE_URL` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `001_init.sql` be split into smaller, more focused modules?**
  _Cohesion score 0.06497175141242938 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `ref_node_path` to `browser.ts`, `ProjectView.tsx`, `context.ts`, `bandit.ts`, `platform/security.ts`, `problems.ts`, `builder/index.ts`, `bundler.ts`, `projects/index.ts`, `server.ts`, `devDependencies`, `identity/index.ts`, `package.json`, `reactions.ts`, `rename.ts`, `ExecutionMetrics`, `typecheck.ts`, `IAccountRepository`, `OrgRole`, `score.ts`, `apiTypes.test.ts`, `FileMap`, `settings/index.ts`, `InviteMemberUseCase.ts`, `identity/usecases.test.ts`, `IMemberRepository`, `lib/security.ts`, `collaboration/ports/repositories.ts`, `SettingValue`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._
- **Should `orchestrator.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Why does `q()` connect `projects.ts` to `orchestrator.ts`, `github.ts`, `bandit.ts`, `platform/security.ts`, `ref_node_path`, `auth.ts`, `collaboration/index.ts`, `playground.ts`, `projects/index.ts`, `integrations.ts`, `server.ts`, `memory.ts`, `identity/index.ts`, `probe.ts`, `catalog.ts`, `baas/jobs.ts`, `accounts.ts`, `providers.ts`, `studioApi.ts`, `llm/router.ts`, `server/index.ts`, `metrics.ts`, `analytics.ts`, `securityReview.ts`, `store.ts`, `runner.ts`, `admin/api.ts`, `storage.ts`, `IMemberRepository`, `PostgresOrganizationRepository`, `ai.ts`, `PostgresProjectFileRepository.ts`, `callModel`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._