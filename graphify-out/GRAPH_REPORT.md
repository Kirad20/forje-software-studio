# Graph Report - amberjack  (2026-11-03)

## Corpus Check
- 595 files · ~245,306 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 6, .css 3, .example 1)

## Summary
- 4056 nodes · 10379 edges · 174 communities (139 shown, 35 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 577 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c5c95886`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ports/context.ts
- index.tsx
- infrastructure/runner.ts
- Chat.tsx
- config.ts
- IntegrationRepository
- appServer.ts
- http-client.ts
- q
- PostgresProviderRepository.ts
- with
- infrastructure/routing.ts
- crypto.ts
- evaluations/bindings.test.ts
- ExecutionMetrics
- BuilderTurnAdapter.ts
- memory/application/service.ts
- RunAgentUseCase.ts
- BuilderToolsAdapter.ts
- vitest
- projectIndex.ts
- bundler.ts
- model-management/providers.ts
- app-services/realtime.ts
- BuilderWorkflowPorts
- react
- project-observability/events.ts
- modules/collaboration/index.ts
- projects/postgres.test.ts
- model-management/router.test.ts
- agents.mjs
- ProjectView.tsx
- studioApi.ts
- ISettingsStore
- Plan.ts
- builderService.ts
- bootstrap/server.ts
- compilerOptions
- models.ts
- projects/application/usecases.ts
- app-services/projectDb.ts
- model-management/router.ts
- client.ts
- scripts
- Account
- roles.ts
- modules/projects/index.ts
- mcp/server.ts
- integrations/github.ts
- package.json
- ProjectsStore
- Project
- adminApi.ts
- project-observability/security.ts
- ProjectDb
- collaboration/postgresAdapters.test.ts
- server/index.ts
- AgentExecution.ts
- createIdentityModule
- CLAUDE.md
- client/index.ts
- deps.ts
- sandboxWorker.mjs
- postgres
- model-management/index.ts
- PostgresProjectsStore
- github.mjs
- app-runtime/index.ts
- Panel de administración del sistema — diseño
- ApplicationLifecycle
- Workspace.tsx
- GithubAccountRepository
- OrgRole
- app-services/payments.ts
- services
- createGithubSyncService
- agents.dbg.mjs
- appRuntimeServer.ts
- internal/router.ts
- appRuntimeHttp.ts
- collaboration/ports/repositories.ts
- TEST_DATABASE_URL
- Memory.tsx
- domain/score.ts
- Changes.tsx
- admission.ts
- urls.ts
- createJobs
- app-services/context.ts
- GithubAuthorization
- GithubRepository
- BootstrapService
- modules/identity/index.ts
- FileMap
- Review Focus
- policies.test.ts
- projectRows.ts
- OrchestrationPolicy.ts
- AccountLifecycleRepository
- App.tsx
- usage/usage.ts
- Inventario de funciones de Lovable → Forja
- modules/builder/index.ts
- ModelRouter.ts
- sandbox.ts
- PostgresPasswordResetRepository
- OrganizationSkillsService.ts
- settingReactions.ts
- builderServer.ts
- composition.ts
- ports.ts
- e2e.mjs
- createProjectRows
- devDependencies
- createAppDataService
- RouterAdministration.ts
- platform.ts
- skills.test.ts
- BuilderRunRegistry
- { api, auth, storage, ai }
- ISettingsStore
- PostgresCatalogRepository.ts
- ProjectDbClient
- PostgresPlatformSettingsStoreAdapter
- ProjectsApplication.ts
- postgres
- healthcheck
- AgentTaskView
- app-runtime
- IPasswordHasher
- build
- domain/securityScan.ts
- PlatformSettingsService
- cli.ts
- builder
- shared/security.ts
- App services
- runtimeClient.ts
- forja
- RealtimeTransport
- createHttp
- http.test.ts
- integrations/index.ts
- exports.test.tsx
- app-services/auth.ts
- architecture.test.ts
- accounts.ts
- CreateFinishGateUseCase.ts
- apiTypes.test.ts
- createCollaborationModule
- settings/index.ts
- forms.tsx
- createSecrets
- SqlAgentTaskRepository.ts
- GithubGateway
- one
- app-services/context.ts
- GithubProjectPorts
- PostgresProjectFileRepository
- collaboration/ports/repositories.ts
- { getSecurity, saveScan, startDeepScan, setIgnored }
- { BuildError, buildClient, buildExamples, checkProject, compileServerModule, endpointRoutes, pageRoutes, exampleFiles, jobFiles, readJobSettings, formatProblem }
- { BUILTIN_PACKAGES, MANIFEST, readDeps, writeDeps, isValidPackageName, packageName, isNodeBuiltin, depsDir, ensureDeps, resolvePackage, withManifestLock }
- { KIT_BUILTIN, KIT_CATALOG, kitSummary }
- { publishProject, unpublishProject }
- { quickScan, findSecret, formatFinding }
- { runBrowserTest, inspectPreview, allowedRequest, closeBrowser }
- { SandboxRunError, runInSandbox, stopSandbox, stopAllSandboxes }
- { serveApp, parseCookies, cookie }
- { SHARE_COOKIE, RESERVED_SLUG, shareToken, checkShareToken, previewOrigin, previewUrl, appUrl, parseAppHost }
- { typecheckProject, parseDiagnostics, verifyBuild }
- { syncProject, holdSync, releaseSync, watchLinked, startGithubSync, stopGithubSync, reschedulePoll }

## God Nodes (most connected - your core abstractions)
1. `vitest` - 127 edges
2. `q()` - 98 edges
3. `createStudioApi()` - 68 edges
4. `createIdentityModule()` - 42 edges
5. `ProjectsStore` - 40 edges
6. `one()` - 40 edges
7. `react` - 39 edges
8. `createProjectsModule()` - 39 edges
9. `ProjectView()` - 39 edges
10. `PostgresProjectsStore` - 35 edges

## Surprising Connections (you probably didn't know these)
- `6. IA dentro de las apps` --references--> `tools()`  [INFERRED]
  docs/inventario-lovable.md → server/modules/builder/infrastructure/BuilderTurnAdapter.ts
- `1. Chat y agente del constructor` --references--> `selectContext()`  [INFERRED]
  docs/inventario-lovable.md → server/modules/builder/infrastructure/projectIndex.ts
- `Task 2: Registro y almacén de ajustes` --references--> `SettingsError`  [INFERRED]
  docs/superpowers/plans/2026-11-01-panel-admin.md → server/modules/settings/domain/PlatformSetting.ts
- `Task 4: API de administración (ajustes, proveedores, modelos, sondas)` --references--> `rateLimit()`  [INFERRED]
  docs/superpowers/plans/2026-11-01-panel-admin.md → server/shared/security.ts
- `8. Errores y seguridad` --references--> `rateLimit()`  [INFERRED]
  docs/superpowers/specs/2026-11-01-panel-admin-design.md → server/shared/security.ts

## Import Cycles
- None detected.

## Communities (174 total, 35 thin omitted)

### Community 0 - "ports/context.ts"
Cohesion: 0.07
Nodes (18): AiUnavailableError, createAi(), appAiChat(), AiBlock, AppAiInput, AppAiResult, AppUser, CheckoutInput (+10 more)

### Community 1 - "index.tsx"
Cohesion: 0.16
Nodes (17): clsx@^2.1.1, sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card() (+9 more)

### Community 2 - "infrastructure/runner.ts"
Cohesion: 0.12
Nodes (35): removeProjectData, removeProjectData(), sessionCookie(), endSession, testSession, EvalError, RunRequest, designSignals (+27 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.05
Nodes (66): ChatStreamEvent, api, builderController, streamPost, AgentLanes(), Lane, LaneCard(), LaneStep (+58 more)

### Community 4 - "config.ts"
Cohesion: 0.11
Nodes (16): createDevelopmentSeed(), DEV_FIXTURE, Fixture, config, DEFAULT_MODELS_ALLOW, env, paths, resolvePublicUrl() (+8 more)

### Community 5 - "IntegrationRepository"
Cohesion: 0.11
Nodes (14): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository, encryptHeaders() (+6 more)

### Community 6 - "appServer.ts"
Cohesion: 0.10
Nodes (43): formatProblem(), pageRoutes(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle() (+35 more)

### Community 7 - "http-client.ts"
Cohesion: 0.10
Nodes (18): appServicesController, createEvaluationUseCases(), filesController, transport, createProjectUseCases(), subscribeToProjectEvents(), createController(), HttpOptions (+10 more)

### Community 8 - "q"
Cohesion: 0.07
Nodes (8): PostgresMemberRepository, PostgresOrganizationRepository, PostgresApiTokenRepository, PostgresLoginCodeRepository, PostgresSessionRepository, ApiTokenInfo, ApiTokenRepository, q()

### Community 9 - "PostgresProviderRepository.ts"
Cohesion: 0.15
Nodes (14): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), OPENROUTER_URL (+6 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "infrastructure/routing.ts"
Cohesion: 0.14
Nodes (20): anthropicChat(), Block, LlmMessage, LlmRequest, LlmResponse, LlmTool, ModelCallError, textOf() (+12 more)

### Community 12 - "crypto.ts"
Cohesion: 0.26
Nodes (13): createCoreModules(), burnPasswordCheck(), hashPassword(), LEGACY, newId(), newToken(), numericCode(), SCRYPT (+5 more)

### Community 13 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (16): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+8 more)

### Community 14 - "ExecutionMetrics"
Cohesion: 0.10
Nodes (11): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, ROLE_TOOLS (+3 more)

### Community 15 - "BuilderTurnAdapter.ts"
Cohesion: 0.08
Nodes (48): describeSchema, ScheduleTasksUseCase, rewardOf(), criteriaOf(), planOverview(), active, AgentResult, background() (+40 more)

### Community 16 - "memory/application/service.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 17 - "RunAgentUseCase.ts"
Cohesion: 0.13
Nodes (25): page(), GATE_FIXES, summarize(), addUsage(), AgentExecutionSpec, emptyUsage(), applySummary(), blockTokens() (+17 more)

### Community 18 - "BuilderToolsAdapter.ts"
Cohesion: 0.07
Nodes (17): B, I, N, out(), S, createProblemService(), changed(), clearProblems() (+9 more)

### Community 19 - "vitest"
Cohesion: 0.08
Nodes (28): Task 1: Postgres, migraciones y helper de tests, Task 3: Proveedores y modelos en BD + seeders, 9. Pruebas, pg, vitest, migrate(), ANTHROPIC_MODELS, PROVIDERS (+20 more)

### Community 20 - "projectIndex.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 21 - "bundler.ts"
Cohesion: 0.12
Nodes (26): createProjectCheck(), ProjectCompilerPort, packageName(), BuildProblem, FileMap, EndpointInfo, endpointRoutes(), exampleFiles() (+18 more)

### Community 22 - "model-management/providers.ts"
Cohesion: 0.13
Nodes (29): 6. API de administración, providerOf(), providers(), createCatalogSync(), lastSync(), startCatalogSync(), syncOpenRouter(), tierFor() (+21 more)

### Community 25 - "react"
Cohesion: 0.06
Nodes (49): react, api, AgentEvent, Agents(), ROLE_LABEL, RoleInfo, RunPanel(), RunView (+41 more)

### Community 26 - "project-observability/events.ts"
Cohesion: 0.08
Nodes (20): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, locate(), Problem, ProblemEffects (+12 more)

### Community 27 - "modules/collaboration/index.ts"
Cohesion: 0.13
Nodes (6): PersonalOrganizationUseCase, Organization, OrganizationProps, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 28 - "projects/postgres.test.ts"
Cohesion: 0.09
Nodes (14): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, ProjectPath, IProjectFileRepository, app, database, pool (+6 more)

### Community 29 - "model-management/router.test.ts"
Cohesion: 0.12
Nodes (20): analyzeHeuristic(), createModelRouter(), analyzeRequest(), callModel(), pick(), useFastPath(), posteriors, gamma() (+12 more)

### Community 30 - "agents.mjs"
Cohesion: 0.11
Nodes (24): app, DATA, MODELS, req(), ROOT, SEED, call(), log (+16 more)

### Community 31 - "ProjectView.tsx"
Cohesion: 0.10
Nodes (52): api, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel(), DocsPanel() (+44 more)

### Community 32 - "studioApi.ts"
Cohesion: 0.07
Nodes (48): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, listEmails, receiveEmail (+40 more)

### Community 33 - "ISettingsStore"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

### Community 34 - "Plan.ts"
Cohesion: 0.10
Nodes (23): CheckPlanUseCase, checkContract(), CONTRACT_FILE, contractRoutes(), covers(), MAX_CONTRACT, MAX_GOAL, MAX_TASKS (+15 more)

### Community 35 - "builderService.ts"
Cohesion: 0.07
Nodes (23): AgentEvent, AgentResult, calculateSpendUseCase, toolRegistry, accountSchema, BuilderServicePorts, BuilderToolResult, BuilderTurnInput (+15 more)

### Community 36 - "bootstrap/server.ts"
Cohesion: 0.12
Nodes (14): app, handleMcp, listening(), monolith, reactions, resolveApp(), runtimeAccessPorts, runtimeHttpPorts (+6 more)

### Community 37 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 38 - "models.ts"
Cohesion: 0.09
Nodes (17): createCatalogService(), allowedModels(), deleteModel(), saveModel(), updateProjectModels(), CompatEndpoint, creditsAtRate(), globToRegex() (+9 more)

### Community 39 - "projects/application/usecases.ts"
Cohesion: 0.10
Nodes (19): ProjectEvent, ProjectLogLine, projectsController, isProjectLogLine(), isProjectProblem(), isRecord(), parseProjectEvent(), Account (+11 more)

### Community 40 - "app-services/projectDb.ts"
Cohesion: 0.17
Nodes (17): cloneDatabase(), closeProject(), dumpDatabase(), execSql(), get(), isAwake(), Open, openDb() (+9 more)

### Community 41 - "model-management/router.ts"
Cohesion: 0.17
Nodes (16): ROLES, createTurnFeedback(), penalizeTurn(), feedbackModel(), TurnModelDecision, postgresTurnFeedback, TurnFeedbackPorts, TurnFeedbackRepository (+8 more)

### Community 42 - "client.ts"
Cohesion: 0.27
Nodes (9): createClient(), ChatMessage, createAi(), createApiWorkflow(), createAuth(), createRealtime(), createStorage(), StoredFile (+1 more)

### Community 43 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+9 more)

### Community 45 - "roles.ts"
Cohesion: 0.10
Nodes (18): BACKEND, CHECKLIST, CONTRACT, DATA, DESIGN, FAST_EXCLUDED_TOOLS, FIRST_BUILD, FRONTEND (+10 more)

### Community 46 - "modules/projects/index.ts"
Cohesion: 0.17
Nodes (11): BeforeImage, ChangeEntry, ProjectPatch, ProjectSnapshot, SeoSettings, TurnFileChange, PATCHABLE, ProjectOrganizations (+3 more)

### Community 47 - "mcp/server.ts"
Cohesion: 0.07
Nodes (38): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), readGuides() (+30 more)

### Community 48 - "integrations/github.ts"
Cohesion: 0.14
Nodes (17): accountStatus, connectAccount, createRepo, disconnectAccount, getLink, handleWebhook, linkRepo, oauthFinish (+9 more)

### Community 49 - "package.json"
Cohesion: 0.07
Nodes (41): dependencies, @anthropic-ai/sdk@^1.3.0, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, hono@^4.13.14, @hono/node-server@^2.1.5, lucide-react@^1.66.0 (+33 more)

### Community 50 - "ProjectsStore"
Cohesion: 0.06
Nodes (9): isDevFile(), ProjectsApplication, beforeImages(), restoredFiles(), turnFileChange(), TurnChanges, createProjectsModule(), ProjectsStore (+1 more)

### Community 51 - "Project"
Cohesion: 0.10
Nodes (7): CreateProjectInput, Project, ProjectProps, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 52 - "adminApi.ts"
Cohesion: 0.08
Nodes (41): AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups, createAdministrationApi() (+33 more)

### Community 53 - "project-observability/security.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 54 - "ProjectDb"
Cohesion: 0.16
Nodes (7): TransactionSession, SqlExecutionResult, TransactionAction, authRepository(), createAuthRepository(), ProjectDb, isInternalServiceRequest()

### Community 55 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.18
Nodes (9): PlatformCollaborationMailerService, ICollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository (+1 more)

### Community 56 - "server/index.ts"
Cohesion: 0.09
Nodes (14): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, CheckoutInput (+6 more)

### Community 57 - "AgentExecution.ts"
Cohesion: 0.14
Nodes (9): RunAgentUseCase, Block, ExecutionContext, ExecutionModel, ExecutionTool, Message, ToolDefinition, Usage (+1 more)

### Community 58 - "createIdentityModule"
Cohesion: 0.15
Nodes (4): IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 60 - "client/index.ts"
Cohesion: 0.20
Nodes (12): AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes, RouteSpec (+4 more)

### Community 61 - "deps.ts"
Cohesion: 0.08
Nodes (36): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KIT_CATALOG, KitEntry, kitSummary(), BUILTIN_PACKAGES, catalogVersion() (+28 more)

### Community 62 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 63 - "postgres"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 65 - "model-management/index.ts"
Cohesion: 0.14
Nodes (19): Catalog, createModelManagementQueries(), routerAudit(), taskClassOf(), bindModelAudit(), bindCatalogService(), bindCatalogSync(), ModelSpendView (+11 more)

### Community 67 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 68 - "app-runtime/index.ts"
Cohesion: 0.07
Nodes (34): playwright-core@1.64.1, playwright-core, RuntimeProjectsPort, bindRuntimeObservation(), configureRuntimeProjects(), publication, suggestSlug, AppTarget (+26 more)

### Community 69 - "Panel de administración del sistema — diseño"
Cohesion: 0.04
Nodes (45): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+37 more)

### Community 70 - "ApplicationLifecycle"
Cohesion: 0.18
Nodes (5): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown()

### Community 71 - "Workspace.tsx"
Cohesion: 0.08
Nodes (43): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, Dashboard() (+35 more)

### Community 72 - "GithubAccountRepository"
Cohesion: 0.20
Nodes (3): createGithubAccountService(), GithubAccountRepository, setup()

### Community 73 - "OrgRole"
Cohesion: 0.13
Nodes (8): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, OrgRole, ICollaborationAccountRepository, IOrganizationRepository

### Community 74 - "app-services/payments.ts"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 75 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 76 - "createGithubSyncService"
Cohesion: 0.30
Nodes (11): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+3 more)

### Community 77 - "agents.dbg.mjs"
Cohesion: 0.13
Nodes (7): app, DATA, MODELS, req(), ROOT, SEED, dir

### Community 78 - "appRuntimeServer.ts"
Cohesion: 0.15
Nodes (14): ws, app, lifecycle, monolith, runtimePorts, startHttp(), wss, stopAppRuntime() (+6 more)

### Community 79 - "internal/router.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 80 - "appRuntimeHttp.ts"
Cohesion: 0.12
Nodes (11): hono, AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts (+3 more)

### Community 81 - "collaboration/ports/repositories.ts"
Cohesion: 0.14
Nodes (8): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, Access, MemberAccess, PostgresCollaborationAccountRepository, CollaborationAccount, OrganizationRecord

### Community 83 - "Memory.tsx"
Cohesion: 0.19
Nodes (11): api, memoryController, Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection() (+3 more)

### Community 85 - "domain/score.ts"
Cohesion: 0.10
Nodes (32): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS, JudgeDimension (+24 more)

### Community 86 - "Changes.tsx"
Cohesion: 0.20
Nodes (15): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+7 more)

### Community 87 - "admission.ts"
Cohesion: 0.07
Nodes (22): ActiveRun, admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun() (+14 more)

### Community 88 - "urls.ts"
Cohesion: 0.17
Nodes (13): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+5 more)

### Community 89 - "createJobs"
Cohesion: 0.28
Nodes (13): createJobs(), addTimer(), executeJob(), fireDueTimers(), initializeAppServices(), listJobs(), report(), runJob() (+5 more)

### Community 90 - "app-services/context.ts"
Cohesion: 0.10
Nodes (11): bindJobs, JOB_LIMITS, jobPorts, log(), addTimer, isJobRunnerStarted, JobCron, JobPorts (+3 more)

### Community 93 - "BootstrapService"
Cohesion: 0.12
Nodes (9): BootstrapService, SetupError, COMMON_PASSWORDS, Password, NodeBootstrapCrypto, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy (+1 more)

### Community 94 - "modules/identity/index.ts"
Cohesion: 0.09
Nodes (13): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, AccountProps, Email, IdentityModuleDependencies, PlatformMailerService (+5 more)

### Community 95 - "FileMap"
Cohesion: 0.12
Nodes (4): CoreModulesDependencies, FileMap, ProjectsModuleDependencies, ProjectServices

### Community 96 - "Review Focus"
Cohesion: 0.22
Nodes (8): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 2: Registro y almacén de ajustes, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final

### Community 97 - "policies.test.ts"
Cohesion: 0.07
Nodes (19): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), createEmail(), sendEmail() (+11 more)

### Community 98 - "projectRows.ts"
Cohesion: 0.18
Nodes (4): createProjectRowsRepository(), projectRowsRepository, ProjectRowsPort, ProjectSchemaPort

### Community 99 - "OrchestrationPolicy.ts"
Cohesion: 0.09
Nodes (21): BuilderWorkflowUseCase, FastBuildUseCase, ReviewAndFixUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode (+13 more)

### Community 101 - "App.tsx"
Cohesion: 0.08
Nodes (37): App(), NAV, Redirect(), Shell(), UserMenu(), go(), listeners, usePath() (+29 more)

### Community 102 - "usage/usage.ts"
Cohesion: 0.16
Nodes (7): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, mocks

### Community 103 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 104 - "modules/builder/index.ts"
Cohesion: 0.12
Nodes (20): runAgent(), estTokens(), GATE_THRESHOLD, metricsReport, newRunId(), pending, quiet(), recordStep() (+12 more)

### Community 105 - "ModelRouter.ts"
Cohesion: 0.13
Nodes (24): AgentSpec, TurnState, KEYWORDS, LAMBDA, RoleProfile, Posterior, Effort, Usage (+16 more)

### Community 108 - "OrganizationSkillsService.ts"
Cohesion: 0.14
Nodes (10): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), PostgresOrganizationSkillsRepository, OrganizationSkillsRepository (+2 more)

### Community 109 - "settingReactions.ts"
Cohesion: 0.22
Nodes (3): createSettingReactions(), SettingReactionPorts, SettingsChangePort

### Community 110 - "builderServer.ts"
Cohesion: 0.16
Nodes (16): @hono/node-server, startAppRuntimeEventRelay(), app, lifecycle, monolith, stopRuntimeEventRelay(), lifecycle, seedLocal (+8 more)

### Community 111 - "composition.ts"
Cohesion: 0.18
Nodes (18): createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureAppServiceObserver(), configureSecretIntegrations(), initializeAppServices, bindEvaluationBuilder() (+10 more)

### Community 112 - "ports.ts"
Cohesion: 0.11
Nodes (15): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, createPublication(), assertPublishable(), Author (+7 more)

### Community 113 - "e2e.mjs"
Cohesion: 0.20
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 114 - "createProjectRows"
Cohesion: 0.33
Nodes (8): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError

### Community 115 - "devDependencies"
Cohesion: 0.12
Nodes (16): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+8 more)

### Community 117 - "RouterAdministration.ts"
Cohesion: 0.27
Nodes (9): createRouterAdministration(), routerStats(), meanOf(), RouterPosteriorRow, RouterStats, postgresRouterAdministrationRepository, RouterAdministrationRepository, resetRouter() (+1 more)

### Community 118 - "platform.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 119 - "skills.test.ts"
Cohesion: 0.19
Nodes (17): AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO, allSkills() (+9 more)

### Community 122 - "ISettingsStore"
Cohesion: 0.24
Nodes (6): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry, ISettingsStore

### Community 123 - "PostgresCatalogRepository.ts"
Cohesion: 0.29
Nodes (6): audit(), columns, postgresCatalogRepository, Row, postgresModelAudit(), ModelAudit

### Community 126 - "ProjectsApplication.ts"
Cohesion: 0.30
Nodes (5): CreateCheckpointUseCase, CreateProjectUseCase, Author, Checkpoint, CheckpointProps

### Community 127 - "postgres"
Cohesion: 0.25
Nodes (9): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+1 more)

### Community 128 - "healthcheck"
Cohesion: 0.53
Nodes (9): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+1 more)

### Community 129 - "AgentTaskView"
Cohesion: 0.26
Nodes (6): ListAgentTasksUseCase, tasks, AgentTaskQueries, AgentTaskView, availableModels(), listCatalog()

### Community 130 - "app-runtime"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 131 - "IPasswordHasher"
Cohesion: 0.13
Nodes (3): BcryptArgonPasswordHasher, IPasswordHasher, passwordNeedsRehash()

### Community 132 - "build"
Cohesion: 0.48
Nodes (7): build, BROWSER, args, context, dockerfile, build, build

### Community 133 - "domain/securityScan.ts"
Cohesion: 0.21
Nodes (15): FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer(), lineOf() (+7 more)

### Community 134 - "PlatformSettingsService"
Cohesion: 0.24
Nodes (5): PlatformSettingsService, SettingsError, SettingsDependencies, fixture(), fixture()

### Community 135 - "cli.ts"
Cohesion: 0.23
Nodes (11): [command, ...flags], main(), monolith, seedDev, seedLocal, createLocalSeed(), readSeedFile(), SeedFile (+3 more)

### Community 136 - "builder"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 137 - "shared/security.ts"
Cohesion: 0.36
Nodes (5): clientIp(), startRateLimitCleanup(), stopRateLimitCleanup(), STUDIO_HEADERS, windows

### Community 138 - "App services"
Cohesion: 0.38
Nodes (5): createRealtime(), attachSocket(), publish(), stopRealtime(), App services

### Community 139 - "runtimeClient.ts"
Cohesion: 0.50
Nodes (3): callRuntimeEndpoint(), responseSchema, RuntimeEndpointCall

### Community 140 - "forja"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 142 - "createHttp"
Cohesion: 0.25
Nodes (4): { apiUrl }, ApiError, createHttp(), HttpTransport

### Community 143 - "http.test.ts"
Cohesion: 0.08
Nodes (26): createMcpHandler(), bindBuilderCoreModules(), builderCoreModules, readFile(), IMAGE_TYPES, imageBlocks(), loadHistory(), UPLOADS (+18 more)

### Community 145 - "integrations/index.ts"
Cohesion: 0.24
Nodes (14): api, integrationsController, GithubCard, GithubCommitCard(), GithubSection(), Link, Mark(), CreateDialog() (+6 more)

### Community 157 - "app-services/auth.ts"
Cohesion: 0.13
Nodes (21): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+13 more)

### Community 178 - "architecture.test.ts"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 188 - "accounts.ts"
Cohesion: 0.24
Nodes (7): connectAccount(), GithubError, Link, SyncResult, gh(), tokenFor(), setup()

### Community 250 - "CreateFinishGateUseCase.ts"
Cohesion: 0.15
Nodes (10): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+2 more)

### Community 259 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 277 - "createCollaborationModule"
Cohesion: 0.11
Nodes (13): MemberQueries, OrganizationNamesQuery, OrganizationQueries, CollaborationModuleDependencies, createCollaborationModule(), IMemberQueries, InviteView, IOrganizationNameDirectory (+5 more)

### Community 279 - "settings/index.ts"
Cohesion: 0.20
Nodes (17): PlatformSettingType, SettingDef, SettingGroup, SettingView, MOVED_ENV, createPlatformSettings(), byKey, Def (+9 more)

### Community 286 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 288 - "createSecrets"
Cohesion: 0.15
Nodes (7): createSecrets(), projectSecretEnv(), secretEnv(), SECRET_NAME, secretPorts, SecretPorts, requestSecret

### Community 300 - "SqlAgentTaskRepository.ts"
Cohesion: 0.11
Nodes (14): RunTaskLaneUseCase, TaskLifecycleUseCase, AgentExecutionResult, requiresFinishGate(), SqlAgentTaskRepository, AgentTask, AgentTaskRepository, TaskCompletion (+6 more)

### Community 341 - "one"
Cohesion: 0.09
Nodes (11): PlatformRole, PostgresAccountLifecycleRepository, AccountRow, SessionAccountRow, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountSecurity (+3 more)

### Community 344 - "app-services/context.ts"
Cohesion: 0.05
Nodes (29): beginTransaction(), dispatch(), Run, RunInput, SandboxError, sandboxes, WORKER, AppUser (+21 more)

### Community 361 - "collaboration/ports/repositories.ts"
Cohesion: 0.11
Nodes (7): InviteMemberResult, InviteMemberUseCase, ProjectTarget, RemoveMemberUseCase, ProjectInvite, ProjectInviteProps, IMemberRepository

## Knowledge Gaps
- **17 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1174 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **35 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `config.ts`, `IntegrationRepository`, `http-client.ts`, `PostgresProviderRepository.ts`, `infrastructure/routing.ts`, `crypto.ts`, `evaluations/bindings.test.ts`, `ExecutionMetrics`, `BuilderTurnAdapter.ts`, `memory/application/service.ts`, `RunAgentUseCase.ts`, `projectIndex.ts`, `model-management/providers.ts`, `project-observability/events.ts`, `modules/collaboration/index.ts`, `projects/postgres.test.ts`, `model-management/router.test.ts`, `ISettingsStore`, `Plan.ts`, `builderService.ts`, `models.ts`, `model-management/router.ts`, `mcp/server.ts`, `package.json`, `ProjectsStore`, `Project`, `project-observability/security.ts`, `ProjectDb`, `collaboration/postgresAdapters.test.ts`, `AgentExecution.ts`, `createIdentityModule`, `deps.ts`, `model-management/index.ts`, `app-runtime/index.ts`, `ApplicationLifecycle`, `GithubAccountRepository`, `OrgRole`, `agents.dbg.mjs`, `appRuntimeHttp.ts`, `collaboration/ports/repositories.ts`, `deps.test.ts`, `domain/score.ts`, `Changes.tsx`, `admission.ts`, `app-services/context.ts`, `BootstrapService`, `modules/identity/index.ts`, `policies.test.ts`, `projectRows.ts`, `OrchestrationPolicy.ts`, `usage/usage.ts`, `modules/builder/index.ts`, `OrganizationSkillsService.ts`, `settingReactions.ts`, `builderServer.ts`, `composition.ts`, `ports.ts`, `devDependencies`, `RouterAdministration.ts`, `skills.test.ts`, `BuilderRunRegistry`, `ISettingsStore`, `ProjectsApplication.ts`, `AgentTaskView`, `PlatformSettingsService`, `shared/security.ts`, `runtimeClient.ts`, `createHttp`, `http.test.ts`, `exports.test.tsx`, `architecture.test.ts`, `accounts.ts`, `CreateFinishGateUseCase.ts`, `apiTypes.test.ts`, `createCollaborationModule`, `SqlAgentTaskRepository.ts`, `one`, `app-services/context.ts`, `collaboration/ports/repositories.ts`?**
  _High betweenness centrality (0.261) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `createIdentityModule()` (e.g. with `.complete()` and `.init()`) actually correct?**
  _`createIdentityModule()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ports/context.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0663265306122449 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `index.tsx`, `Chat.tsx`, `App.tsx`, `Workspace.tsx`, `internal/router.ts`, `package.json`, `integrations/index.ts`, `Memory.tsx`, `Changes.tsx`, `exports.test.tsx`, `client/index.ts`, `forms.tsx`, `ProjectView.tsx`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **Should `infrastructure/runner.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12403100775193798 - nodes in this community are weakly interconnected._
- **Why does `q()` connect `q` to `AgentTaskView`, `infrastructure/runner.ts`, `config.ts`, `IntegrationRepository`, `cli.ts`, `infrastructure/routing.ts`, `crypto.ts`, `BuilderTurnAdapter.ts`, `http.test.ts`, `memory/application/service.ts`, `vitest`, `createCollaborationModule`, `model-management/providers.ts`, `modules/collaboration/index.ts`, `app-services/projectDb.ts`, `model-management/router.ts`, `SqlAgentTaskRepository.ts`, `Account`, `integrations/github.ts`, `Project`, `adminApi.ts`, `project-observability/security.ts`, `model-management/index.ts`, `one`, `modules/identity/index.ts`, `usage/usage.ts`, `modules/builder/index.ts`, `PostgresPasswordResetRepository`, `OrganizationSkillsService.ts`, `RouterAdministration.ts`, `platform.ts`, `PostgresCatalogRepository.ts`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._