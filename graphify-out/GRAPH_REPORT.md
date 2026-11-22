# Graph Report - forje-software-studio  (2026-11-22)

## Corpus Check
- 768 files · ~415,763 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: .css 6, (none) 5, .example 1)

## Summary
- 5359 nodes · 14285 edges · 208 communities (175 shown, 33 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 724 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `619bdb30`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- BuilderTurnAdapter.ts
- index.tsx
- FileMap
- Chat.tsx
- app-services/jobs.ts
- config.ts
- domain/score.ts
- projects/application/usecases.ts
- infrastructure/projectDb.ts
- projectLogSink.ts
- with
- infrastructure/playground.ts
- http.test.ts
- accountLifecycle.ts
- FusionOrchestrator.ts
- oauthProviders.ts
- ProjectDb
- sandbox.ts
- model-management/providers.ts
- app-runtime/index.ts
- appServer.ts
- infrastructure/runner.ts
- Project
- deps.ts
- vitest
- server/index.ts
- components.test.ts
- modules/builder/index.ts
- bootstrap/server.ts
- app-runtime/infrastructure/browser.ts
- models.ts
- ProjectView.tsx
- application/problems.ts
- infrastructure/routing.ts
- OrgRole
- projectIndex.ts
- model-management/index.ts
- compilerOptions
- PostgresProviderRepository.ts
- projects/application/usecases.ts
- projectLayout.ts
- fusion.test.ts
- app-runtime/index.ts
- projectLayout.ts
- springRuntime.ts
- admission.ts
- application/context.ts
- platform.ts
- roles.ts
- package.json
- createProjectsModule
- AppEnv
- adminServer.ts
- BuilderWorkflowPorts
- studioApi.ts
- mcp/oauth.ts
- server/index.ts
- q
- modules/project-knowledge/index.ts
- CLAUDE.md
- Workspace.tsx
- bundler.ts
- sandboxWorker.mjs
- services
- mcp/server.ts
- PostgresProjectsStore
- adminServer.ts
- adminApi.ts
- Desplegar Forja en Coolify
- ExecutionMetrics
- client/index.ts
- projectRows.ts
- internal/router.ts
- ProjectDb
- services
- modules/builder/index.ts
- createCollaborationModule
- ProjectServices
- PostgresOrganizationRepository
- devDependencies
- accountLifecycle.ts
- TEST_DATABASE_URL
- ref_node_path
- Inventario de funciones de Lovable → Forja
- collaboration/postgresAdapters.test.ts
- infrastructure/routing.ts
- builderServer.ts
- typecheck.ts
- createGithubSyncService
- PostgresProjectFileRepository
- BcryptArgonPasswordHasher.ts
- domain/contracts.ts
- GithubError
- modules/identity/index.ts
- Memory.tsx
- Plan.ts
- infrastructure/github.ts
- runtimeDataBridge.ts
- En una app: `forja.auth.json`
- FinishGateAdapter.ts
- App.tsx
- bootstrap/coreModules.ts
- RunTaskLaneUseCase.ts
- createJobQueue
- server.mjs
- RunAgentUseCase.ts
- settingReactions.ts
- OrganizationSkillsService.ts
- accountLifecycle.ts
- domain/routing.ts
- app-services/realtime.ts
- ModelRouterPorts.ts
- github.mjs
- BuilderToolsAdapter.ts
- mcp/jobs.ts
- model-management/router.ts
- one
- domain/securityScan.ts
- app-services/analytics.ts
- app-services/payments.ts
- PostgresProjectFileRepository
- infrastructure/playground.ts
- Plan de runtime multi-stack: FastAPI, Go y Spring Boot
- Registro de implementación
- CreateProjectUseCase.ts
- e2e.mjs
- plan-escalado-microservicios.md
- app-services/storage.ts
- parseLayout
- migrate.mjs
- BuilderRunRegistry
- AppStore
- evaluations/bindings.test.ts
- ProjectsApplication.ts
- policies.test.ts
- e2e-oauth.mjs
- RealtimeTransport
- Audit.tsx
- executeRun
- modules/projects/index.ts
- integrations/github.ts
- SettingDefinition
- GithubGateway
- Standards.ts
- integrations/index.ts
- postgres
- healthcheck
- migrate.mjs
- args
- ApiError
- app-runtime
- Memoria de los servicios
- builder
- forja
- Review Focus
- One project: orders API and durable invoice worker
- ServiceControlPanel.tsx
- projects/postgres.test.ts
- collaboration/ports/repositories.ts
- job-worker
- infrastructure/judge.ts
- Backends en otros lenguajes (Java / Spring Boot)
- GithubAuthorization
- GithubProjectPorts
- guides.ts
- 1. Capa de datos
- GitHub integration
- Durable jobs worker
- Fases
- forms.tsx
- mcp-oauth.md
- { SandboxRunError, runInSandbox, stopSandbox, stopAllSandboxes, getSandboxServices, restartSandboxService }
- { connectAccount, oauthStart, oauthFinish, getLink, unlink }
- { prepare: prepareImport, attach: attachImport }
- { start: appStart, finish: appFinish, installStart: appInstallStart, installFinish: appInstallFinish, repositories: listRepositories, branches: listBranches }
- ref_node_child_process
- architecture.test.ts
- imports.ts
- PostgresPasswordResetRepository
- agentCompact.test.ts
- GithubRepository
- builderTools
- createJobs
- domain/services.ts
- app-services/auth.ts
- scripts
- createIdentityModule
- usage/usage.ts
- IntegrationRepository
- Panel de administración del sistema — diseño
- client.ts
- ISettingsStore
- Plan de escalado a microservicios
- PlatformSettingsService
- { getSecurity, saveScan, startDeepScan, setIgnored }
- { BuildError, buildClient, buildExamples, checkProject, compileServerModule, endpointRoutes, pageRoutes, exampleFiles, jobFiles, readJobSettings, formatProblem }
- { BUILTIN_PACKAGES, MANIFEST, readDeps, writeDeps, isValidPackageName, packageName, isNodeBuiltin, depsDir, ensureDeps, resolvePackage, withManifestLock }
- { publishProject, unpublishProject }
- { quickScan, findSecret, formatFinding }
- { runBrowserTest, inspectPreview, allowedRequest, closeBrowser }
- { serveApp, parseCookies, cookie }
- { SHARE_COOKIE, RESERVED_SLUG, shareToken, checkShareToken, previewOrigin, previewUrl, appUrl, parseAppHost }
- { typecheckProject, parseDiagnostics, verifyBuild }
- { syncProject, holdSync, releaseSync, watchLinked, startGithubSync, stopGithubSync, reschedulePoll }
- settings/index.ts
- accounts.ts

## God Nodes (most connected - your core abstractions)
1. `vitest` - 176 edges
2. `q()` - 125 edges
3. `createStudioApi()` - 79 edges
4. `AppEnv` - 61 edges
5. `react` - 52 edges
6. `createIdentityModule()` - 48 edges
7. `config` - 46 edges
8. `one()` - 44 edges
9. `createProjectsModule()` - 41 edges
10. `ProjectsStore` - 40 edges

## Surprising Connections (you probably didn't know these)
- `Constructor` --references--> `roleCanWrite()`  [INFERRED]
  docs/plan-arquitecturas-reales.md → server/modules/builder/domain/Plan.ts
- `6. IA dentro de las apps` --references--> `tools()`  [INFERRED]
  docs/inventario-lovable.md → server/modules/builder/infrastructure/BuilderTurnAdapter.ts
- `1. Chat y agente del constructor` --references--> `selectContext()`  [INFERRED]
  docs/inventario-lovable.md → server/modules/builder/infrastructure/projectIndex.ts
- `Diagnóstico` --references--> `ProjectPath`  [INFERRED]
  docs/plan-arquitecturas-reales.md → server/modules/projects/domain/ProjectPath.ts
- `Fase 0 — Layout como fuente de verdad (sin cambio de comportamiento)` --references--> `ProjectPath`  [INFERRED]
  docs/plan-arquitecturas-reales.md → server/modules/projects/domain/ProjectPath.ts

## Import Cycles
- None detected.

## Communities (208 total, 33 thin omitted)

### Community 0 - "BuilderTurnAdapter.ts"
Cohesion: 0.07
Nodes (58): writableRoots(), Implementation plan document (`static/__dev/plan.md`), describeSchema, rewardOf(), checkPlanDoc(), criteriaOf(), planOverview(), BuilderTool (+50 more)

### Community 1 - "index.tsx"
Cohesion: 0.16
Nodes (17): clsx@^2.1.1, sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card() (+9 more)

### Community 2 - "FileMap"
Cohesion: 0.08
Nodes (22): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, createProjectCheck(), ProjectCompilerPort, createPublication() (+14 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.05
Nodes (74): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+66 more)

### Community 4 - "app-services/jobs.ts"
Cohesion: 0.07
Nodes (19): bindJobs, JOB_LIMITS, sendPlatformEmail, aiPorts, emailPorts, resetTransport(), jobPorts, log() (+11 more)

### Community 5 - "config.ts"
Cohesion: 0.08
Nodes (26): vite, DEFAULT_MODELS_ALLOW, env, paths, resolvePublicUrl(), ROOT_DIR, LEGACY, SCRYPT (+18 more)

### Community 6 - "domain/score.ts"
Cohesion: 0.13
Nodes (26): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), judgeScore(), mean() (+18 more)

### Community 7 - "projects/application/usecases.ts"
Cohesion: 0.07
Nodes (32): api, billingController, Meter(), Plan(), Usage, api, evaluationsController, createEvaluationUseCases() (+24 more)

### Community 8 - "infrastructure/projectDb.ts"
Cohesion: 0.07
Nodes (66): @electric-sql/pglite, applyProjectMigrations(), applyProjectMigrationsLocal(), assertRuntimeSql(), assertScope(), assertScopedSql(), checksum(), cloneDatabase() (+58 more)

### Community 9 - "projectLogSink.ts"
Cohesion: 0.33
Nodes (8): flushProjectLogs(), flushProjectLogsForShutdown(), ProjectLogMetadata, queue, QueuedLog, recordProjectLog(), schedule(), q

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "infrastructure/playground.ts"
Cohesion: 0.19
Nodes (6): BootstrapService, SetupError, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 12 - "http.test.ts"
Cohesion: 0.11
Nodes (21): AdminMcpModules, builderCoreModules, CollaborationModule, IdentityModule, ProjectKnowledgeModule, ProjectsModule, account, app (+13 more)

### Community 13 - "accountLifecycle.ts"
Cohesion: 0.10
Nodes (10): Account, AccountProps, PlatformRole, Email, COMMON_PASSWORDS, Password, AccountRow, PostgresAccountRepository (+2 more)

### Community 14 - "FusionOrchestrator.ts"
Cohesion: 0.22
Nodes (26): createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass(), contextMetrics() (+18 more)

### Community 15 - "oauthProviders.ts"
Cohesion: 0.06
Nodes (60): BUILTIN, BUILTIN_OAUTH_PROVIDERS, BuiltinOAuthProvider, defaultSecretPrefix(), httpsUrl(), isBuiltinOAuthProvider(), isRecord(), LABELS (+52 more)

### Community 16 - "ProjectDb"
Cohesion: 0.10
Nodes (11): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+3 more)

### Community 17 - "sandbox.ts"
Cohesion: 0.05
Nodes (44): platformMemoryReport(), remote(), ServiceExecution, dataBridge, springRuntime, toolChecks, toolUnavailable(), unavailable() (+36 more)

### Community 18 - "model-management/providers.ts"
Cohesion: 0.06
Nodes (54): Task 3: Proveedores y modelos en BD + seeders, 6. API de administración, `llm/catalog.ts`, createLocalSeed(), readSeedFile(), SeedFile, tasks, allowedModels() (+46 more)

### Community 19 - "app-runtime/index.ts"
Cohesion: 0.06
Nodes (35): RuntimeProjectsPort, ControlledService, RuntimeService, ServiceControlSnapshot, ServiceQueueEntry, ServiceReplica, ServiceRuntimeSnapshot, SERVICES_MANIFEST (+27 more)

### Community 20 - "appServer.ts"
Cohesion: 0.09
Nodes (39): componentForUrl(), detectSpringProject(), isOAuthCallback(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint() (+31 more)

### Community 21 - "infrastructure/runner.ts"
Cohesion: 0.13
Nodes (33): removeProjectData(), sessionCookie(), endSession, testSession, EvalError, RunRequest, recoverRuns(), designSignals (+25 more)

### Community 23 - "deps.ts"
Cohesion: 0.13
Nodes (19): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KitEntry, BUILTIN_PACKAGES, Deps, isValidPackageName(), MANIFEST (+11 more)

### Community 24 - "vitest"
Cohesion: 0.07
Nodes (23): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, vitest, migrate(), children, files, OUT (+15 more)

### Community 25 - "server/index.ts"
Cohesion: 0.07
Nodes (58): lucide-react, radix-ui, react, administrationController, api, modelBlockers(), ModelReadiness, playgroundModel() (+50 more)

### Community 26 - "components.test.ts"
Cohesion: 0.11
Nodes (5): resolveServiceExecution(), { KIT_BUILTIN }, roleCanWrite(), manifest, manifest

### Community 27 - "modules/builder/index.ts"
Cohesion: 0.11
Nodes (11): CheckAccessUseCase, ProjectIdentity, ProjectTarget, PersonalOrganizationUseCase, Access, MemberAccess, Organization, OrganizationProps (+3 more)

### Community 28 - "bootstrap/server.ts"
Cohesion: 0.05
Nodes (42): @hono/node-server@^2.1.5, @hono/node-server, AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest() (+34 more)

### Community 29 - "app-runtime/infrastructure/browser.ts"
Cohesion: 0.08
Nodes (30): playwright-core, SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope (+22 more)

### Community 30 - "models.ts"
Cohesion: 0.08
Nodes (31): createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), ClassificationPorts (+23 more)

### Community 31 - "ProjectView.tsx"
Cohesion: 0.11
Nodes (51): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+43 more)

### Community 32 - "application/problems.ts"
Cohesion: 0.08
Nodes (22): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, createProblemService(), changed(), clearProblems() (+14 more)

### Community 33 - "infrastructure/routing.ts"
Cohesion: 0.12
Nodes (25): anthropicChat(), FUSION_BUDGETS, Block, LlmMessage, LlmRequest, LlmResponse, LlmTool, textOf() (+17 more)

### Community 34 - "OrgRole"
Cohesion: 0.13
Nodes (7): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, OrgRole, IOrganizationRepository

### Community 35 - "projectIndex.ts"
Cohesion: 0.08
Nodes (32): isPathPattern(), matchesPathPattern(), 2026-11-02 - Reusing ProjectIndex in Graph Traversal, clientReachable(), contextOfHelper(), ContextPlan, extractComponent(), Extraction (+24 more)

### Community 36 - "model-management/index.ts"
Cohesion: 0.13
Nodes (20): Catalog, createModelManagementQueries(), routerAudit(), updateProjectModels(), isMode(), bindCatalogService(), bindCatalogSync(), createPlatformCatalogService() (+12 more)

### Community 37 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 38 - "PostgresProviderRepository.ts"
Cohesion: 0.15
Nodes (14): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), OPENROUTER_URL (+6 more)

### Community 39 - "projects/application/usecases.ts"
Cohesion: 0.10
Nodes (23): ProjectEvent, ProjectLogLine, projectsController, transport, CreateProjectOptions, createProjectUseCases(), isProjectLogLine(), isProjectProblem() (+15 more)

### Community 40 - "projectLayout.ts"
Cohesion: 0.12
Nodes (26): dataScopeOf(), startAppRuntimeEventRelay(), createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureAppServiceObserver(), initializeAppServices (+18 more)

### Community 41 - "fusion.test.ts"
Cohesion: 0.10
Nodes (22): analyzeHeuristic(), createModelRouter(), analyzeRequest(), pick(), maxTokensFor(), validateToolInput(), createPlatformModelRouter(), author (+14 more)

### Community 42 - "app-runtime/index.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 43 - "projectLayout.ts"
Cohesion: 0.07
Nodes (47): APP_COMPONENT, ComponentConventions, ComponentKind, componentOf(), ComponentPaths, DEFAULT_CONVENTIONS, DEFAULT_PATHS, EndpointConvention (+39 more)

### Community 44 - "springRuntime.ts"
Cohesion: 0.06
Nodes (37): APP_DIR, buildCommand(), CACHE_DIR, clip(), isSpringSource(), jarDirectory(), jvmCommand(), JvmOptions (+29 more)

### Community 45 - "admission.ts"
Cohesion: 0.08
Nodes (18): admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun(), runBudget() (+10 more)

### Community 46 - "application/context.ts"
Cohesion: 0.07
Nodes (15): Run, AppUser, CACHE_LIMITS, createProjectCache(), ProjectCache, createContext(), serviceContext(), EndpointContext (+7 more)

### Community 47 - "platform.ts"
Cohesion: 0.13
Nodes (5): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting

### Community 48 - "roles.ts"
Cohesion: 0.06
Nodes (41): PLAN_DOC, PLAN_SECTIONS, BUILDER_SYSTEM_PROMPT, AgentToolRole, BACKEND, CHECKLIST, CONTRACT, DATA (+33 more)

### Community 49 - "package.json"
Cohesion: 0.07
Nodes (39): dependencies, @anthropic-ai/sdk@^1.3.0, better-auth@^1.7.26, croner@^11.0.0, @electric-sql/pglite@^0.5.13, hono@^4.13.14, lucide-react@^1.66.0, @modelcontextprotocol/sdk@^1.32.2 (+31 more)

### Community 50 - "createProjectsModule"
Cohesion: 0.06
Nodes (7): isDevFile(), ProjectsApplication, FileMap, TurnChanges, createProjectsModule(), ProjectsStore, fixture()

### Community 51 - "AppEnv"
Cohesion: 0.14
Nodes (5): ClaimedJob, AppEnv, ProjectDbClient, JobsApi, ProjectRowsPort

### Community 52 - "adminServer.ts"
Cohesion: 0.19
Nodes (15): auditWindow(), ExecutionAudit, identifier(), AuditContext, AuditFilter, AuditReport, AuditStage, AuditStep (+7 more)

### Community 53 - "BuilderWorkflowPorts"
Cohesion: 0.06
Nodes (22): BuilderWorkflowUseCase, FastBuildUseCase, ReviewAndFixUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode (+14 more)

### Community 54 - "studioApi.ts"
Cohesion: 0.07
Nodes (49): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, createAppUser, updateAppUserPassword (+41 more)

### Community 55 - "mcp/oauth.ts"
Cohesion: 0.11
Nodes (25): accountFromOAuthAccessToken(), authorizationHtml(), createMcpOAuthRouter(), digest(), escapeHtml(), issueTokens(), json(), noStore (+17 more)

### Community 56 - "server/index.ts"
Cohesion: 0.07
Nodes (16): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, Cache (+8 more)

### Community 57 - "q"
Cohesion: 0.05
Nodes (29): createDevelopmentSeed(), DEV_FIXTURE, Fixture, PostgresMemberRepository, PostgresOrganizationSkillsRepository, memoryRepository, audit(), bindModelAudit() (+21 more)

### Community 58 - "modules/project-knowledge/index.ts"
Cohesion: 0.10
Nodes (18): createKnowledgeService(), KnowledgeEngine, KnowledgeFiles, prepareCorpus(), KnowledgeAnswer, KnowledgeEdge, KnowledgeGraph, KnowledgeNode (+10 more)

### Community 60 - "Workspace.tsx"
Cohesion: 0.07
Nodes (42): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, Dashboard() (+34 more)

### Community 61 - "bundler.ts"
Cohesion: 0.09
Nodes (48): dataRole(), IMPLICIT_COMPONENT, layoutOf(), readLayout(), safeLayout(), esbuild@^0.28.2, esbuild, packageName() (+40 more)

### Community 62 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 63 - "services"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 65 - "mcp/server.ts"
Cohesion: 0.13
Nodes (21): guideList(), readGuides(), SECTION_IDS, buildServer(), CONTEXT_TOOLS, createMcpHandler(), DESTRUCTIVE, expectedVersionProp (+13 more)

### Community 67 - "adminServer.ts"
Cohesion: 0.11
Nodes (21): ADMIN_MCP_INSTRUCTIONS, createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists(), descriptions (+13 more)

### Community 68 - "adminApi.ts"
Cohesion: 0.19
Nodes (15): hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups (+7 more)

### Community 69 - "Desplegar Forja en Coolify"
Cohesion: 0.20
Nodes (10): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+2 more)

### Community 70 - "ExecutionMetrics"
Cohesion: 0.10
Nodes (11): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, ROLE_TOOLS (+3 more)

### Community 71 - "client/index.ts"
Cohesion: 0.16
Nodes (14): AppUser, AuthProvider, SignInWithOptions, realtime, Contract, createApi(), RouteInput, RouteOutput (+6 more)

### Community 72 - "projectRows.ts"
Cohesion: 0.27
Nodes (9): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError (+1 more)

### Community 73 - "internal/router.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 74 - "ProjectDb"
Cohesion: 0.12
Nodes (9): AppDataPorts, createAppDataService(), TransactionSession, ProjectMigration, SqlExecutionResult, TransactionAction, createAuthRepository(), ProjectDb (+1 more)

### Community 75 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 76 - "modules/builder/index.ts"
Cohesion: 0.05
Nodes (39): GATE_FIXES, AgentExecutionSpec, AgentResult, calculateSpendUseCase, toolRegistry, AgentSpec, runAgent(), accountSchema (+31 more)

### Community 77 - "createCollaborationModule"
Cohesion: 0.16
Nodes (6): ClaimInvitesUseCase, OrganizationNamesQuery, OrganizationQueries, createCollaborationModule(), IOrganizationQueries, fixture()

### Community 78 - "ProjectServices"
Cohesion: 0.15
Nodes (6): CreateProjectUseCase, ProjectsModuleDependencies, ProjectServices, creation(), load(), endpoint()

### Community 79 - "PostgresOrganizationRepository"
Cohesion: 0.09
Nodes (9): MemberQueries, PostgresOrganizationRepository, IMemberQueries, InviteView, IOrganizationNameDirectory, MemberView, Org, OrgMemberView (+1 more)

### Community 80 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 81 - "accountLifecycle.ts"
Cohesion: 0.08
Nodes (9): PostgresApiTokenRepository, McpOAuthAuthorizationCode, McpOAuthClient, McpOAuthRefreshGrant, AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository (+1 more)

### Community 83 - "ref_node_path"
Cohesion: 0.07
Nodes (26): call(), DATA, follow(), ROOT, server, studioProviders, cookieJar(), startFakeOAuth() (+18 more)

### Community 84 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 85 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.18
Nodes (8): PlatformCollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository, sendInvitation

### Community 86 - "infrastructure/routing.ts"
Cohesion: 0.19
Nodes (16): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+8 more)

### Community 87 - "builderServer.ts"
Cohesion: 0.07
Nodes (32): ApplicationLifecycle, LifecycleService, lifecycle, shutdown(), app, lifecycle, monolith, shutdown() (+24 more)

### Community 88 - "typecheck.ts"
Cohesion: 0.23
Nodes (12): depsDir(), IGNORED, isSource(), MODULES, parseDiagnostics(), require, run(), SDK (+4 more)

### Community 89 - "createGithubSyncService"
Cohesion: 0.23
Nodes (12): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+4 more)

### Community 91 - "BcryptArgonPasswordHasher.ts"
Cohesion: 0.29
Nodes (7): BcryptArgonPasswordHasher, burnPasswordCheck(), hashPassword(), passwordNeedsRehash(), scryptKey(), verifyPassword(), withSlot()

### Community 92 - "domain/contracts.ts"
Cohesion: 0.05
Nodes (20): AiBlock, AiContextMetrics, AiFusionTrace, AiUsage, AppAiInput, AppAiResult, AppUser, CheckoutInput (+12 more)

### Community 93 - "GithubError"
Cohesion: 0.19
Nodes (16): branchName(), createGithubAppService(), installation(), requireApp(), selectRepository(), GithubApp, Installation, pageNumber() (+8 more)

### Community 94 - "modules/identity/index.ts"
Cohesion: 0.08
Nodes (16): LoginWithOAuthUseCase, OAuthLogin, OAuthLoginResult, LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, IdentityModuleDependencies (+8 more)

### Community 95 - "Memory.tsx"
Cohesion: 0.21
Nodes (11): api, memoryController, Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection() (+3 more)

### Community 96 - "Plan.ts"
Cohesion: 0.13
Nodes (17): CheckPlanUseCase, checkContract(), CONTRACT_FILE, covers(), MAX_CONTRACT, MAX_GOAL, MAX_PLAN_DOC, MAX_TASKS (+9 more)

### Community 97 - "infrastructure/github.ts"
Cohesion: 0.16
Nodes (13): AppCredentials, appJwt(), cache, credentials(), generations, githubAppStore, pending, tokenFor() (+5 more)

### Community 98 - "runtimeDataBridge.ts"
Cohesion: 0.10
Nodes (20): stopLanguageRuntimes(), DataBridgePorts, Env, readBody(), RuntimeDataBridge, TooLarge, ADMIN, assert() (+12 more)

### Community 99 - "En una app: `forja.auth.json`"
Cohesion: 0.20
Nodes (9): Con el agente o por MCP, Cómo encaja, En el código de la app, En el Studio, En una app: `forja.auth.json`, Inicio de sesión con redes sociales y OAuth (Better Auth), Límites, Rutas (`/_baas/`) (+1 more)

### Community 100 - "FinishGateAdapter.ts"
Cohesion: 0.14
Nodes (11): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+3 more)

### Community 101 - "App.tsx"
Cohesion: 0.07
Nodes (36): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallContext, InstallEvent (+28 more)

### Community 102 - "bootstrap/coreModules.ts"
Cohesion: 0.10
Nodes (11): CoreModulesDependencies, createCoreModules(), depsKey(), NodeBootstrapCrypto, PlatformMailerService, PostgresOAuthIdentityRepository, PostgresSessionRepository, createProjectKnowledgeModule() (+3 more)

### Community 103 - "RunTaskLaneUseCase.ts"
Cohesion: 0.07
Nodes (21): ListAgentTasksUseCase, RunTaskLaneUseCase, TaskLifecycleUseCase, AgentEvent, AgentExecutionResult, ExecutionModel, requiresFinishGate(), SqlAgentTaskRepository (+13 more)

### Community 104 - "createJobQueue"
Cohesion: 0.48
Nodes (6): createJobQueue(), poll(), processJob(), pump(), start(), stop()

### Community 105 - "server.mjs"
Cohesion: 0.11
Nodes (27): cache, cacheEntries, crons, db, enqueue(), env, handle(), here (+19 more)

### Community 106 - "RunAgentUseCase.ts"
Cohesion: 0.06
Nodes (42): page(), RunAgentUseCase, summarize(), ScheduleTasksUseCase, addUsage(), Block, BuilderContextMetrics, BuilderFusionStep (+34 more)

### Community 107 - "settingReactions.ts"
Cohesion: 0.22
Nodes (3): createSettingReactions(), SettingReactionPorts, SettingsChangePort

### Community 108 - "OrganizationSkillsService.ts"
Cohesion: 0.19
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 109 - "accountLifecycle.ts"
Cohesion: 0.33
Nodes (5): Barra lateral del panel, Inventario de interfaz de Floot → Forja, Panel de proyectos, Services (tres columnas: servicios · lista · detalle; los usados primero, el resto atenuado), Vista de proyecto

### Community 110 - "domain/routing.ts"
Cohesion: 0.12
Nodes (25): TurnState, KEYWORDS, RoleProfile, ExecutionContextMetrics, FusionBudget, FusionEffort, FusionStep, FusionTrace (+17 more)

### Community 111 - "app-services/realtime.ts"
Cohesion: 0.24
Nodes (4): DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket, publish

### Community 112 - "ModelRouterPorts.ts"
Cohesion: 0.23
Nodes (10): createRouterAdministration(), routerStats(), FusionPattern, RouterPosteriorRow, RouterStats, listFusionTraces(), postgresRouterAdministrationRepository, RouterAdministrationRepository (+2 more)

### Community 113 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 114 - "BuilderToolsAdapter.ts"
Cohesion: 0.06
Nodes (33): isComponentMigrationPath(), isLayoutMigrationPath(), assertDropTargets(), assertProjectObject(), assertSafeAgentSql(), assertSafePreviewSql(), containsDataChange(), containsDestructiveSchemaChange() (+25 more)

### Community 115 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (10): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+2 more)

### Community 116 - "model-management/router.ts"
Cohesion: 0.11
Nodes (20): ROLES, useFastPath(), createTurnFeedback(), penalizeTurn(), posteriors, gamma(), gaussian(), Posterior (+12 more)

### Community 117 - "one"
Cohesion: 0.07
Nodes (7): PostgresAccountLifecycleRepository, AccountAccessUpdate, AccountCreation, AccountLifecycleRepository, AccountSecurity, one(), Tx

### Community 118 - "domain/securityScan.ts"
Cohesion: 0.17
Nodes (18): fileSide, nativeClient(), nativeServer(), FileMap, Finding, findSecret(), formatFinding(), isClient() (+10 more)

### Community 119 - "app-services/analytics.ts"
Cohesion: 0.26
Nodes (9): buildGraphView(), GraphCard, GraphConnection, GraphEdge, GraphNode, GraphQuestion, ProjectGraph, ProjectKnowledge() (+1 more)

### Community 120 - "app-services/payments.ts"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 122 - "infrastructure/playground.ts"
Cohesion: 0.14
Nodes (23): removeProjectData, evaluationBuilder(), admitPlayground(), execute(), InternalRun, PLAYGROUND_ROLES, PlaygroundError, PlaygroundRole (+15 more)

### Community 123 - "Plan de runtime multi-stack: FastAPI, Go y Spring Boot"
Cohesion: 0.10
Nodes (21): Adaptadores por stack, Aislamiento sin contenedores: condicion de publicacion, Arquitectura propuesta, Cache, artefactos y publicacion, Compatibilidad con BaaS y SDK, Contrato de proyecto y runtime, Decision inicial de datos, Despliegue gradual y rollback (+13 more)

### Community 124 - "Registro de implementación"
Cohesion: 0.12
Nodes (19): Constructor, Diagnóstico, Ejecución, Estado, Fase 6 — Exportar para producción, Garantías de no regresión, Idea central, Manifiesto `forja.json` (versión 1) (+11 more)

### Community 125 - "CreateProjectUseCase.ts"
Cohesion: 0.27
Nodes (4): CreateCheckpointUseCase, Author, Checkpoint, CheckpointProps

### Community 126 - "e2e.mjs"
Cohesion: 0.22
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 127 - "plan-escalado-microservicios.md"
Cohesion: 0.33
Nodes (6): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, usage()

### Community 128 - "app-services/storage.ts"
Cohesion: 0.10
Nodes (13): createSecrets(), projectSecretEnv(), secretEnv(), createStorage(), putObject(), MAX_PROJECT_STORAGE_BYTES, StorageLimitError, StoredObject (+5 more)

### Community 129 - "parseLayout"
Cohesion: 0.44
Nodes (8): fail(), integer(), LayoutError, object(), onlyKeys(), parseConventions(), parseLayout(), parsePaths()

### Community 130 - "migrate.mjs"
Cohesion: 0.10
Nodes (20): cookie(), app, DATA, app, DATA, MODELS, req(), ROOT (+12 more)

### Community 133 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (19): bindEvaluationBuilder(), bindEvaluationResources(), Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role (+11 more)

### Community 134 - "ProjectsApplication.ts"
Cohesion: 0.14
Nodes (17): CreateProjectInput, BeforeImage, beforeImages(), restoredFiles(), turnFileChange(), ProjectProps, Visibility, ChangeEntry (+9 more)

### Community 135 - "policies.test.ts"
Cohesion: 0.11
Nodes (15): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), createEmail(), sendEmail() (+7 more)

### Community 136 - "e2e-oauth.mjs"
Cohesion: 0.24
Nodes (10): api, modelsController, ModelChecklist(), ModelRow, MODES, price(), ProjectModels(), PROVIDER (+2 more)

### Community 138 - "Audit.tsx"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 139 - "executeRun"
Cohesion: 0.30
Nodes (4): ActiveRun, executeRun(), RunPorts, CaseResult

### Community 140 - "modules/projects/index.ts"
Cohesion: 0.15
Nodes (12): DEFAULT_STARTER_TEMPLATE, parseStarterTemplate(), STANDARD_SCAFFOLD_FILES, standardStarterFiles(), starterFiles(), starterFiles(), componentsStarterFiles(), ordersInvoicesFiles() (+4 more)

### Community 141 - "integrations/github.ts"
Cohesion: 0.16
Nodes (14): apps, handleWebhook(), imports, legacy, linkRepo(), ports(), sync, integrationRepository (+6 more)

### Community 142 - "SettingDefinition"
Cohesion: 0.22
Nodes (4): SettingDefinition, SettingDefinitionProps, SettingType, PlatformSettingsRegistryAdapter

### Community 144 - "Standards.ts"
Cohesion: 0.24
Nodes (13): contractRoutes(), componentStandards(), FileMap, formatStandard(), importTarget(), isClientSource(), isHelperSource(), isListSelect() (+5 more)

### Community 145 - "integrations/index.ts"
Cohesion: 0.19
Nodes (21): api, integrationsController, GithubAccount, GithubRepository, GithubSelection, GithubCard, GithubCommitCard(), GithubSection() (+13 more)

### Community 146 - "postgres"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 147 - "healthcheck"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 148 - "migrate.mjs"
Cohesion: 0.27
Nodes (12): checksum(), client, ensureRole(), here, ident(), ledgerName(), ledgerSchema(), literal() (+4 more)

### Community 149 - "args"
Cohesion: 0.39
Nodes (9): build, BROWSER, JAVA, args, context, dockerfile, build, build (+1 more)

### Community 151 - "app-runtime"
Cohesion: 0.22
Nodes (9): command, environment, expose, labels, restart, security_opt, stop_grace_period, volumes (+1 more)

### Community 152 - "Memoria de los servicios"
Cohesion: 0.22
Nodes (5): Cómo consultarla, Dónde se va la memoria, Límites, Memoria de los servicios, ¿Reescribir algo en Go o Rust?

### Community 153 - "builder"
Cohesion: 0.25
Nodes (8): command, environment, expose, restart, security_opt, stop_grace_period, volumes, builder

### Community 154 - "forja"
Cohesion: 0.25
Nodes (8): command, environment, expose, restart, security_opt, stop_grace_period, volumes, forja

### Community 155 - "Review Focus"
Cohesion: 0.18
Nodes (9): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 2: Registro y almacén de ajustes, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final (+1 more)

### Community 156 - "One project: orders API and durable invoice worker"
Cohesion: 0.29
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 157 - "ServiceControlPanel.tsx"
Cohesion: 0.10
Nodes (21): react-dom@^19.3.1, react-dom, buildTree(), FileEntry, FileTree(), Folder, FolderContents(), serviceControlController (+13 more)

### Community 158 - "projects/postgres.test.ts"
Cohesion: 0.08
Nodes (20): AUTH_MANIFEST, NATIVE_LAYOUT, ProjectLayout, Escritura y GitHub, DeleteFileUseCase, RenameFileUseCase, layoutForPath(), WriteFileUseCase (+12 more)

### Community 159 - "collaboration/ports/repositories.ts"
Cohesion: 0.10
Nodes (12): InviteMemberResult, InviteMemberUseCase, RemoveMemberUseCase, ProjectInvite, ProjectInviteProps, CollaborationModuleDependencies, PostgresCollaborationAccountRepository, CollaborationAccount (+4 more)

### Community 160 - "job-worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 161 - "infrastructure/judge.ts"
Cohesion: 0.15
Nodes (12): JUDGE_DIMENSIONS, JudgeDimension, Judgement, JUDGE_SYSTEM, judgeDesign(), JudgeInput, parseJudgement(), billing (+4 more)

### Community 162 - "Backends en otros lenguajes (Java / Spring Boot)"
Cohesion: 0.33
Nodes (6): Backends en otros lenguajes (Java / Spring Boot), Configuración, Cómo funciona, Imagen y despliegue, Seguridad, Siguientes lenguajes

### Community 165 - "guides.ts"
Cohesion: 0.28
Nodes (8): build(), Guide, guideById, GUIDES, OVERVIEW_PARTS, parse(), PRODUCT_GUIDES, slug()

### Community 166 - "1. Capa de datos"
Cohesion: 0.33
Nodes (6): 1. Capa de datos, Conexión, `.env` resultante, Infraestructura, Migraciones, Seeders

### Community 167 - "GitHub integration"
Cohesion: 0.50
Nodes (3): GitHub integration, HTTP API, Native imports and synchronization

### Community 169 - "Fases"
Cohesion: 0.20
Nodes (10): Fase 0 — Layout como fuente de verdad (sin cambio de comportamiento), Fase 1 — Manifiesto y estructura libre, Fase 2 — Ejecución de componentes, Fase 3 — Constructor y estándares por componente, Fase 4 — Base de datos por servicio, Fase 4 — Datos por servicio, Fase 5 — Otros stacks por componente, Fase 6 — Salida fuera de Forja (+2 more)

### Community 170 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 177 - "ref_node_child_process"
Cohesion: 0.13
Nodes (10): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs(), DATA, jar (+2 more)

### Community 178 - "architecture.test.ts"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 179 - "imports.ts"
Cohesion: 0.29
Nodes (9): COMPONENTS_MANIFEST, Link, SyncResult, createGithubImportService(), findCredential(), isPlaceholderCredential(), PreparedImport, blobSha() (+1 more)

### Community 181 - "agentCompact.test.ts"
Cohesion: 0.33
Nodes (4): calls, model, recordContextEvent, usage

### Community 183 - "builderTools"
Cohesion: 0.50
Nodes (3): builderTools, ctx, mocks

### Community 184 - "createJobs"
Cohesion: 0.16
Nodes (19): createJobs(), addTimer(), enqueueJob(), executeJob(), fireDueTimers(), initializeAppServices(), report(), runJob() (+11 more)

### Community 191 - "domain/services.ts"
Cohesion: 0.17
Nodes (20): COMPONENTS_MANIFEST, createServiceControl(), restart(), scale(), snapshot(), endpointRoutes(), componentServiceNames(), componentServices() (+12 more)

### Community 194 - "app-services/auth.ts"
Cohesion: 0.10
Nodes (33): createAuth(), confirmPasswordReset(), createAppUser(), createSession(), createTestUser(), ensureOwnerAdmin(), ensureProjectOwner(), requestPasswordReset() (+25 more)

### Community 200 - "scripts"
Cohesion: 0.08
Nodes (24): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+16 more)

### Community 202 - "createIdentityModule"
Cohesion: 0.12
Nodes (5): AdminApiTokenError, IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 210 - "usage/usage.ts"
Cohesion: 0.15
Nodes (8): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, countAction, mocks

### Community 212 - "IntegrationRepository"
Cohesion: 0.17
Nodes (6): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType

### Community 237 - "Panel de administración del sistema — diseño"
Cohesion: 0.13
Nodes (16): 10. Documentación, 2. Ajustes globales, 3. Proveedores y modelos, 4. Playground de agentes, 5. Enrutador, 7. Studio, 8. Errores y seguridad, Almacén (+8 more)

### Community 248 - "client.ts"
Cohesion: 0.20
Nodes (12): createClient(), ChatMessage, createAi(), createApiWorkflow(), createAuth(), { apiUrl }, createRealtime(), createStorage() (+4 more)

### Community 319 - "ISettingsStore"
Cohesion: 0.17
Nodes (9): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, SettingValue, createSettingsModule(), MOVED_ENV, SettingsModuleDependencies, warnMovedEnv(), ISettingsRegistry (+1 more)

### Community 346 - "Plan de escalado a microservicios"
Cohesion: 0.11
Nodes (18): Arquitectura objetivo inicial, Cache y estado distribuido, Decisiones propuestas, Estado actual verificado, Eventos, colas y transacciones, Fase 0. Medir y fijar contratos, Fase 1. Infraestructura distribuida dentro del monolito, Fase 2. Extraer runner y workloads pesados (+10 more)

### Community 359 - "PlatformSettingsService"
Cohesion: 0.14
Nodes (6): PlatformSettingsService, PostgresPlatformSettingsStoreAdapter, SettingsDependencies, ISecretCipher, fixture(), fixture()

### Community 416 - "settings/index.ts"
Cohesion: 0.19
Nodes (16): PlatformSettingType, SettingDef, SettingGroup, SettingView, createPlatformSettings(), byKey, Def, defs (+8 more)

### Community 469 - "accounts.ts"
Cohesion: 0.18
Nodes (4): createGithubAccountService(), connectAccount(), GithubAccountRepository, setup()

## Knowledge Gaps
- **20 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1602 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `FileMap`, `Chat.tsx`, `app-services/jobs.ts`, `config.ts`, `domain/score.ts`, `projects/application/usecases.ts`, `infrastructure/projectDb.ts`, `projectLogSink.ts`, `infrastructure/playground.ts`, `http.test.ts`, `accountLifecycle.ts`, `oauthProviders.ts`, `ProjectDb`, `sandbox.ts`, `model-management/providers.ts`, `app-runtime/index.ts`, `deps.ts`, `server/index.ts`, `components.test.ts`, `modules/builder/index.ts`, `bootstrap/server.ts`, `models.ts`, `application/problems.ts`, `infrastructure/routing.ts`, `OrgRole`, `projectIndex.ts`, `model-management/index.ts`, `PostgresProviderRepository.ts`, `projects/application/usecases.ts`, `projectLayout.ts`, `fusion.test.ts`, `app-runtime/index.ts`, `projectLayout.ts`, `springRuntime.ts`, `admission.ts`, `application/context.ts`, `roles.ts`, `package.json`, `createProjectsModule`, `adminServer.ts`, `BuilderWorkflowPorts`, `mcp/oauth.ts`, `server/index.ts`, `q`, `modules/project-knowledge/index.ts`, `bundler.ts`, `mcp/server.ts`, `adminServer.ts`, `adminApi.ts`, `ExecutionMetrics`, `ProjectDb`, `modules/builder/index.ts`, `createCollaborationModule`, `ProjectServices`, `devDependencies`, `ref_node_path`, `collaboration/postgresAdapters.test.ts`, `infrastructure/routing.ts`, `builderServer.ts`, `createGithubSyncService`, `GithubError`, `modules/identity/index.ts`, `Plan.ts`, `infrastructure/github.ts`, `FinishGateAdapter.ts`, `RunTaskLaneUseCase.ts`, `RunAgentUseCase.ts`, `settingReactions.ts`, `OrganizationSkillsService.ts`, `ModelRouterPorts.ts`, `BuilderToolsAdapter.ts`, `mcp/jobs.ts`, `model-management/router.ts`, `CreateProjectUseCase.ts`, `BuilderRunRegistry`, `evaluations/bindings.test.ts`, `policies.test.ts`, `Audit.tsx`, `modules/projects/index.ts`, `integrations/github.ts`, `SettingDefinition`, `Standards.ts`, `ApiError`, `ServiceControlPanel.tsx`, `projects/postgres.test.ts`, `collaboration/ports/repositories.ts`, `infrastructure/judge.ts`, `ref_node_child_process`, `architecture.test.ts`, `imports.ts`, `agentCompact.test.ts`, `builderTools`, `domain/services.ts`, `createIdentityModule`, `usage/usage.ts`, `IntegrationRepository`, `ISettingsStore`, `PlatformSettingsService`, `accounts.ts`?**
  _High betweenness centrality (0.261) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `BuilderTurnAdapter.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07010402532790593 - nodes in this community are weakly interconnected._
- **Why does `react` connect `server/index.ts` to `index.tsx`, `Chat.tsx`, `App.tsx`, `client/index.ts`, `projects/application/usecases.ts`, `internal/router.ts`, `forms.tsx`, `Audit.tsx`, `e2e-oauth.mjs`, `projects/application/usecases.ts`, `package.json`, `integrations/index.ts`, `infrastructure/routing.ts`, `app-services/analytics.ts`, `Workspace.tsx`, `ServiceControlPanel.tsx`, `Memory.tsx`, `ProjectView.tsx`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `FileMap` be split into smaller, more focused modules?**
  _Cohesion score 0.07811447811447811 - nodes in this community are weakly interconnected._