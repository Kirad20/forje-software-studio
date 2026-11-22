# Graph Report - forje-software-studio  (2026-11-22)

## Corpus Check
- 768 files · ~415,621 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: .css 6, (none) 5, .example 1)

## Summary
- 5357 nodes · 14280 edges · 207 communities (173 shown, 34 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 724 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0c04c2e7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- BuilderTurnAdapter.ts
- index.tsx
- FileMap
- Chat.tsx
- infrastructure/repositories.ts
- config.ts
- domain/score.ts
- projects/application/usecases.ts
- infrastructure/projectDb.ts
- builderServer.ts
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
- ref_node_fs
- server/index.ts
- appOAuth.ts
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
- model-management/catalog.ts
- app-runtime/index.ts
- projectLayout.ts
- springRuntime.ts
- admission.ts
- application/context.ts
- platform.ts
- roles.ts
- package.json
- createProjectsModule
- Tx
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
- e2e-oauth.mjs
- infrastructure/cache.ts
- Desplegar Forja en Coolify
- ExecutionMetrics
- client/index.ts
- projectRows.ts
- internal/router.ts
- AppEnv
- services
- modules/builder/index.ts
- createCollaborationModule
- collaboration/ports/repositories.ts
- PostgresOrganizationRepository.ts
- devDependencies
- accountLifecycle.ts
- TEST_DATABASE_URL
- ref_node_path
- Inventario de funciones de Lovable → Forja
- collaboration/postgresAdapters.test.ts
- infrastructure/routing.ts
- platformDb
- oauth.test.ts
- createGithubSyncService
- PostgresProjectFileRepository
- PostgresCatalogRepository.ts
- domain/contracts.ts
- GithubError
- modules/identity/index.ts
- Memory.tsx
- Plan.ts
- infrastructure/github.ts
- runtimeDataBridge.ts
- shared/oauth.ts
- FinishGateAdapter.ts
- App.tsx
- crypto.ts
- RunTaskLaneUseCase.ts
- createJobQueue
- server.mjs
- RunAgentUseCase.ts
- ApplicationLifecycle
- OrganizationSkillsService.ts
- accountLifecycle.ts
- domain/routing.ts
- app-services/realtime.ts
- ModelRouterPorts.ts
- github.mjs
- BuilderToolsAdapter.ts
- mcp/jobs.ts
- model-management/router.ts
- AccountLifecycleRepository
- domain/securityScan.ts
- app-services/analytics.ts
- app-services/payments.ts
- PostgresProjectFileRepository
- adminApi.ts
- Plan de runtime multi-stack: FastAPI, Go y Spring Boot
- Registro de implementación
- CreateProjectUseCase.ts
- SqlAgentTaskRepository.ts
- plan-escalado-microservicios.md
- app-services/storage.ts
- apiTypes.test.ts
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
- projectIndex.ts
- integrations/index.ts
- postgres
- healthcheck
- migrate.mjs
- args
- ApiError
- app-runtime
- builder
- forja
- Review Focus
- One project: orders API and durable invoice worker
- ServiceControlPanel.tsx
- projects/postgres.test.ts
- InviteMemberUseCase.ts
- job-worker
- judgeRouting.test.ts
- Backends en otros lenguajes (Java / Spring Boot)
- GithubAuthorization
- GithubProjectPorts
- Memoria de los servicios
- IdentityRandom
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
- PasswordResetRepository
- integrations/boundaries.test.ts
- GithubRepository
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

## Communities (207 total, 34 thin omitted)

### Community 0 - "BuilderTurnAdapter.ts"
Cohesion: 0.06
Nodes (62): writableRoots(), Implementation plan document (`static/__dev/plan.md`), describeSchema, ScheduleTasksUseCase, rewardOf(), checkPlanDoc(), criteriaOf(), planOverview() (+54 more)

### Community 1 - "index.tsx"
Cohesion: 0.16
Nodes (17): clsx@^2.1.1, sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card() (+9 more)

### Community 2 - "FileMap"
Cohesion: 0.08
Nodes (20): BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, createProjectCheck(), ProjectCompilerPort, createPublication(), assertPublishable() (+12 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.05
Nodes (74): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+66 more)

### Community 4 - "infrastructure/repositories.ts"
Cohesion: 0.15
Nodes (11): aiPorts, log(), authRepository(), createAuthRepository(), platformRepository, schemaRows(), statement(), statements (+3 more)

### Community 5 - "config.ts"
Cohesion: 0.12
Nodes (16): pg, DEV_FIXTURE, Fixture, storagePorts, DEFAULT_MODELS_ALLOW, env, paths, resolvePublicUrl() (+8 more)

### Community 6 - "domain/score.ts"
Cohesion: 0.09
Nodes (34): PageInspection, EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS (+26 more)

### Community 7 - "projects/application/usecases.ts"
Cohesion: 0.07
Nodes (32): api, billingController, Meter(), Plan(), Usage, api, evaluationsController, createEvaluationUseCases() (+24 more)

### Community 8 - "infrastructure/projectDb.ts"
Cohesion: 0.08
Nodes (57): app, monolith, runtimePorts, wss, applyProjectMigrations(), applyProjectMigrationsLocal(), assertRuntimeSql(), assertScope() (+49 more)

### Community 9 - "builderServer.ts"
Cohesion: 0.12
Nodes (21): startAppRuntimeEventRelay(), app, lifecycle, monolith, stopRuntimeEventRelay(), stopBuilder(), metricsIdle(), reloadLangfuse() (+13 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "infrastructure/playground.ts"
Cohesion: 0.14
Nodes (7): BootstrapService, SetupError, NodeBootstrapCrypto, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 12 - "http.test.ts"
Cohesion: 0.15
Nodes (14): builderCoreModules, CollaborationModule, ProjectKnowledgeModule, ProjectsModule, account, app, collaboration, identity (+6 more)

### Community 13 - "accountLifecycle.ts"
Cohesion: 0.09
Nodes (13): Account, AccountProps, PlatformRole, Email, COMMON_PASSWORDS, Password, AccountRow, PostgresAccountRepository (+5 more)

### Community 14 - "FusionOrchestrator.ts"
Cohesion: 0.24
Nodes (24): createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass(), contextMetrics() (+16 more)

### Community 15 - "oauthProviders.ts"
Cohesion: 0.15
Nodes (19): BUILTIN, BuiltinOAuthProvider, defaultSecretPrefix(), httpsUrl(), isBuiltinOAuthProvider(), isRecord(), LABELS, OAUTH_BASE_PATH (+11 more)

### Community 16 - "ProjectDb"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 17 - "sandbox.ts"
Cohesion: 0.06
Nodes (31): ServiceExecution, localMemoryReport(), MemoryReport, alive, beginTransaction(), dispatch(), getSandboxServices(), makeRoomForSandbox() (+23 more)

### Community 18 - "model-management/providers.ts"
Cohesion: 0.13
Nodes (30): 6. API de administración, providerOf(), providers(), speedFor(), tierFor(), createCatalogSync(), lastSync(), startCatalogSync() (+22 more)

### Community 19 - "app-runtime/index.ts"
Cohesion: 0.08
Nodes (22): RuntimeProjectsPort, KIT_BUILTIN, KitEntry, bindRuntimeObservation(), configureRuntimeProjects(), publication, suggestSlug, bindRuntimeObservation() (+14 more)

### Community 20 - "appServer.ts"
Cohesion: 0.06
Nodes (60): componentForUrl(), formatProblem(), resolveServiceExecution(), detectSpringProject(), isOAuthCallback(), analyticsBeacon(), appOrigin(), baasRoute() (+52 more)

### Community 21 - "infrastructure/runner.ts"
Cohesion: 0.12
Nodes (38): removeProjectData, removeProjectData(), sessionCookie(), endSession, testSession, EvalError, RunRequest, recoverRuns() (+30 more)

### Community 22 - "Project"
Cohesion: 0.10
Nodes (6): Project, ProjectProps, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 23 - "deps.ts"
Cohesion: 0.10
Nodes (30): createBuildVerification(), createDependencyResolution(), PackageRegistryPort, BUILTIN_PACKAGES, isValidPackageName(), MANIFEST, packageInfo, readDeps() (+22 more)

### Community 24 - "ref_node_fs"
Cohesion: 0.07
Nodes (26): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, vitest, createTestCoreModules(), drop(), freshDatabase(), TEST_DATABASE_URL, dataDir (+18 more)

### Community 25 - "server/index.ts"
Cohesion: 0.07
Nodes (58): lucide-react, radix-ui, react, administrationController, api, modelBlockers(), ModelReadiness, playgroundModel() (+50 more)

### Community 26 - "appOAuth.ts"
Cohesion: 0.21
Nodes (14): safeOAuthConfig(), backWithError(), engineFor(), errorMessage(), ERRORS, escapeHtml(), json(), oauthRoute() (+6 more)

### Community 27 - "modules/builder/index.ts"
Cohesion: 0.14
Nodes (7): PersonalOrganizationUseCase, Organization, OrganizationProps, CollaborationModuleDependencies, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 28 - "bootstrap/server.ts"
Cohesion: 0.04
Nodes (41): AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts, resolveApp() (+33 more)

### Community 29 - "app-runtime/infrastructure/browser.ts"
Cohesion: 0.09
Nodes (30): playwright-core, SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope (+22 more)

### Community 30 - "models.ts"
Cohesion: 0.08
Nodes (31): createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), ClassificationPorts (+23 more)

### Community 31 - "ProjectView.tsx"
Cohesion: 0.11
Nodes (51): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+43 more)

### Community 32 - "application/problems.ts"
Cohesion: 0.08
Nodes (23): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, createProblemService(), changed(), clearProblems() (+15 more)

### Community 33 - "infrastructure/routing.ts"
Cohesion: 0.07
Nodes (43): anthropicChat(), createModelRouter(), analyzeRequest(), Block, LlmMessage, LlmRequest, LlmResponse, LlmTool (+35 more)

### Community 34 - "OrgRole"
Cohesion: 0.13
Nodes (8): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, OrgRole, ICollaborationAccountRepository, IOrganizationRepository

### Community 35 - "projectIndex.ts"
Cohesion: 0.12
Nodes (19): clientReachable(), contextOfHelper(), ContextPlan, extractComponent(), ExtractOptions, formatMigrationPlan(), migrationId(), MigrationPlan (+11 more)

### Community 36 - "model-management/index.ts"
Cohesion: 0.12
Nodes (24): Catalog, createModelManagementQueries(), routerAudit(), updateProjectModels(), isMode(), routerStats(), bindModelAudit(), bindCatalogService() (+16 more)

### Community 37 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 38 - "PostgresProviderRepository.ts"
Cohesion: 0.14
Nodes (16): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), OPENROUTER_URL (+8 more)

### Community 39 - "projects/application/usecases.ts"
Cohesion: 0.10
Nodes (23): ProjectEvent, ProjectLogLine, projectsController, transport, CreateProjectOptions, createProjectUseCases(), isProjectLogLine(), isProjectProblem() (+15 more)

### Community 40 - "projectLayout.ts"
Cohesion: 0.08
Nodes (29): dataScopeOf(), createMonolith(), startBindings(), stopBindings(), bindJobs, configureJobRuntime(), jobPorts, configureAppServiceObserver() (+21 more)

### Community 41 - "model-management/catalog.ts"
Cohesion: 0.17
Nodes (17): Task 3: Proveedores y modelos en BD + seeders, 3. Proveedores y modelos, `llm/catalog.ts`, Pruebas de conexión, Tablas (`002_admin.sql`), tasks, allowedModels(), availableModels() (+9 more)

### Community 42 - "app-runtime/index.ts"
Cohesion: 0.14
Nodes (12): createSecurityService(), ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository, ports() (+4 more)

### Community 43 - "projectLayout.ts"
Cohesion: 0.06
Nodes (57): APP_COMPONENT, ComponentConventions, ComponentKind, componentOf(), ComponentPaths, COMPONENTS_MANIFEST, DEFAULT_CONVENTIONS, DEFAULT_PATHS (+49 more)

### Community 44 - "springRuntime.ts"
Cohesion: 0.06
Nodes (38): APP_DIR, buildCommand(), CACHE_DIR, clip(), isSpringSource(), jarDirectory(), jvmCommand(), JvmOptions (+30 more)

### Community 45 - "admission.ts"
Cohesion: 0.09
Nodes (16): admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun(), runBudget() (+8 more)

### Community 46 - "application/context.ts"
Cohesion: 0.10
Nodes (11): Run, AppUser, createProjectCache(), createContext(), serviceContext(), EndpointContext, enqueue(), JobContext (+3 more)

### Community 47 - "platform.ts"
Cohesion: 0.13
Nodes (5): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting

### Community 48 - "roles.ts"
Cohesion: 0.05
Nodes (43): PLAN_DOC, PLAN_SECTIONS, BUILDER_SYSTEM_PROMPT, AgentToolRole, allowedToolsForRole(), assertRoleToolAccess(), BACKEND, CHECKLIST (+35 more)

### Community 49 - "package.json"
Cohesion: 0.06
Nodes (41): dependencies, @anthropic-ai/sdk@^1.3.0, better-auth@^1.7.26, croner@^11.0.0, @electric-sql/pglite@^0.5.13, hono@^4.13.14, @hono/node-server@^2.1.5, lucide-react@^1.66.0 (+33 more)

### Community 50 - "createProjectsModule"
Cohesion: 0.07
Nodes (5): isDevFile(), ProjectsApplication, createProjectsModule(), ProjectsStore, fixture()

### Community 51 - "Tx"
Cohesion: 0.29
Nodes (4): Tx, ANTHROPIC_MODELS, PROVIDERS, seedDefaults()

### Community 52 - "adminServer.ts"
Cohesion: 0.08
Nodes (39): ADMIN_MCP_INSTRUCTIONS, AdminMcpModules, createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists() (+31 more)

### Community 53 - "BuilderWorkflowPorts"
Cohesion: 0.06
Nodes (13): BuilderWorkflowUseCase, FastBuildUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode, useFastPath() (+5 more)

### Community 54 - "studioApi.ts"
Cohesion: 0.06
Nodes (54): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, createAppUser, updateAppUserPassword (+46 more)

### Community 55 - "mcp/oauth.ts"
Cohesion: 0.11
Nodes (22): accountFromOAuthAccessToken(), authorizationHtml(), createMcpOAuthRouter(), digest(), escapeHtml(), issueTokens(), json(), noStore (+14 more)

### Community 56 - "server/index.ts"
Cohesion: 0.08
Nodes (15): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, Cache (+7 more)

### Community 57 - "q"
Cohesion: 0.05
Nodes (14): PostgresMemberRepository, PostgresOrganizationRepository, PostgresOrganizationSkillsRepository, PostgresAccountLifecycleRepository, PostgresLoginCodeRepository, McpOAuthAuthorizationCode, McpOAuthClient, McpOAuthRefreshGrant (+6 more)

### Community 58 - "modules/project-knowledge/index.ts"
Cohesion: 0.10
Nodes (19): createKnowledgeService(), KnowledgeEngine, KnowledgeFiles, prepareCorpus(), KnowledgeAnswer, KnowledgeEdge, KnowledgeGraph, KnowledgeNode (+11 more)

### Community 60 - "Workspace.tsx"
Cohesion: 0.07
Nodes (42): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, Dashboard() (+34 more)

### Community 61 - "bundler.ts"
Cohesion: 0.08
Nodes (46): dataRole(), IMPLICIT_COMPONENT, layoutOf(), ProjectComponent, readLayout(), safeLayout(), esbuild@^0.28.2, esbuild (+38 more)

### Community 62 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 63 - "services"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 65 - "mcp/server.ts"
Cohesion: 0.09
Nodes (32): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), PRODUCT_GUIDES (+24 more)

### Community 66 - "PostgresProjectsStore"
Cohesion: 0.06
Nodes (3): PostgresProjectsStore, ProjectOrganizations, QueryHandle

### Community 67 - "e2e-oauth.mjs"
Cohesion: 0.19
Nodes (8): call(), DATA, follow(), ROOT, server, studioProviders, cookieJar(), startFakeOAuth()

### Community 68 - "infrastructure/cache.ts"
Cohesion: 0.16
Nodes (5): CACHE_LIMITS, ProjectCache, createProjectCacheRepository(), PROJECT_CACHE_SCHEMA, CacheRepository

### Community 69 - "Desplegar Forja en Coolify"
Cohesion: 0.20
Nodes (10): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+2 more)

### Community 70 - "ExecutionMetrics"
Cohesion: 0.11
Nodes (10): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, StaticToolRegistryAdapter (+2 more)

### Community 71 - "client/index.ts"
Cohesion: 0.16
Nodes (14): AppUser, AuthProvider, SignInWithOptions, realtime, Contract, createApi(), RouteInput, RouteOutput (+6 more)

### Community 72 - "projectRows.ts"
Cohesion: 0.17
Nodes (14): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError (+6 more)

### Community 73 - "internal/router.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 74 - "AppEnv"
Cohesion: 0.09
Nodes (10): AppEnv, AppDataPorts, createAppDataService(), TransactionSession, ProjectMigration, ProjectDbClient, SqlExecutionResult, TransactionAction (+2 more)

### Community 75 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 76 - "modules/builder/index.ts"
Cohesion: 0.05
Nodes (40): GATE_FIXES, AgentResult, calculateSpendUseCase, toolRegistry, accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber (+32 more)

### Community 77 - "createCollaborationModule"
Cohesion: 0.15
Nodes (6): MemberQueries, OrganizationQueries, createCollaborationModule(), IMemberQueries, IOrganizationQueries, fixture()

### Community 78 - "collaboration/ports/repositories.ts"
Cohesion: 0.15
Nodes (7): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, RemoveMemberUseCase, Access, MemberAccess, IMemberRepository

### Community 79 - "PostgresOrganizationRepository.ts"
Cohesion: 0.19
Nodes (7): OrganizationNamesQuery, InviteView, IOrganizationNameDirectory, MemberView, Org, OrgMemberView, OrganizationRecord

### Community 80 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 81 - "accountLifecycle.ts"
Cohesion: 0.14
Nodes (5): PostgresApiTokenRepository, AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository

### Community 83 - "ref_node_path"
Cohesion: 0.06
Nodes (27): vite, studioPwa(), here, children, files, OUT, ROOT, root (+19 more)

### Community 84 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 85 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.20
Nodes (8): PostgresCollaborationAccountRepository, CollaborationAccount, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository, sendInvitation

### Community 86 - "infrastructure/routing.ts"
Cohesion: 0.19
Nodes (16): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+8 more)

### Community 87 - "platformDb"
Cohesion: 0.10
Nodes (27): lifecycle, [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed(), createLocalSeed() (+19 more)

### Community 88 - "oauth.test.ts"
Cohesion: 0.21
Nodes (12): BUILTIN_OAUTH_PROVIDERS, mayLinkByEmail(), oauthSecretNames(), parseOAuthConfig(), STUDIO_OAUTH_BASE, studioOAuth(), studioOAuthConfig(), assertOwnerRequestedOAuthSetup() (+4 more)

### Community 89 - "createGithubSyncService"
Cohesion: 0.23
Nodes (12): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+4 more)

### Community 90 - "PostgresProjectFileRepository"
Cohesion: 0.17
Nodes (3): PostgresProjectFileRepository, ProjectEventPort, LogChangeInput

### Community 91 - "PostgresCatalogRepository.ts"
Cohesion: 0.23
Nodes (11): audit(), persistCapabilityProfile(), validateCapabilityProfile(), validateReasoningEffort(), columns, postgresCatalogRepository, profileValues(), Row (+3 more)

### Community 92 - "domain/contracts.ts"
Cohesion: 0.05
Nodes (21): AiBlock, AiContextMetrics, AiFusionTrace, AiUsage, AppAiInput, AppAiResult, AppUser, CheckoutInput (+13 more)

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
Cohesion: 0.10
Nodes (28): ProjectLayout, CheckPlanUseCase, ReviewAndFixUseCase, Review, reviewFixTasks(), checkContract(), CONTRACT_FILE, covers() (+20 more)

### Community 97 - "infrastructure/github.ts"
Cohesion: 0.16
Nodes (13): AppCredentials, appJwt(), cache, credentials(), generations, githubAppStore, pending, tokenFor() (+5 more)

### Community 98 - "runtimeDataBridge.ts"
Cohesion: 0.16
Nodes (6): stopLanguageRuntimes(), DataBridgePorts, Env, readBody(), RuntimeDataBridge, TooLarge

### Community 99 - "shared/oauth.ts"
Cohesion: 0.15
Nodes (15): OAuthConfig, OAuthOptionValue, OAuthProviderSpec, asBool(), asString(), builtinOptions(), created, createEngine() (+7 more)

### Community 100 - "FinishGateAdapter.ts"
Cohesion: 0.15
Nodes (11): CreateFinishGateUseCase, BuildProblem, isSafeProjectPath(), newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey() (+3 more)

### Community 101 - "App.tsx"
Cohesion: 0.07
Nodes (36): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallContext, InstallEvent (+28 more)

### Community 102 - "crypto.ts"
Cohesion: 0.12
Nodes (18): createCoreModules(), depsKey(), BcryptArgonPasswordHasher, PlatformMailerService, PostgresSessionRepository, burnPasswordCheck(), hashPassword(), LEGACY (+10 more)

### Community 103 - "RunTaskLaneUseCase.ts"
Cohesion: 0.09
Nodes (17): RunTaskLaneUseCase, TaskLifecycleUseCase, AgentEvent, AgentExecutionResult, BuilderContextMetrics, ExecutionContext, ExecutionModel, ExecutionTool (+9 more)

### Community 104 - "createJobQueue"
Cohesion: 0.19
Nodes (8): ClaimedJob, createJobQueue(), poll(), processJob(), pump(), start(), stop(), JobPorts

### Community 105 - "server.mjs"
Cohesion: 0.11
Nodes (27): cache, cacheEntries, crons, db, enqueue(), env, handle(), here (+19 more)

### Community 106 - "RunAgentUseCase.ts"
Cohesion: 0.07
Nodes (35): page(), RunAgentUseCase, summarize(), addUsage(), AgentExecutionSpec, Block, BuilderFusionStep, BuilderFusionTrace (+27 more)

### Community 107 - "ApplicationLifecycle"
Cohesion: 0.17
Nodes (6): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown(), shutdown()

### Community 108 - "OrganizationSkillsService.ts"
Cohesion: 0.19
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 109 - "accountLifecycle.ts"
Cohesion: 0.33
Nodes (5): Barra lateral del panel, Inventario de interfaz de Floot → Forja, Panel de proyectos, Services (tres columnas: servicios · lista · detalle; los usados primero, el resto atenuado), Vista de proyecto

### Community 110 - "domain/routing.ts"
Cohesion: 0.09
Nodes (36): AgentSpec, TurnState, pick(), KEYWORDS, maxTokensFor(), RoleProfile, ROLES, Posterior (+28 more)

### Community 111 - "app-services/realtime.ts"
Cohesion: 0.24
Nodes (4): DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket, publish

### Community 112 - "ModelRouterPorts.ts"
Cohesion: 0.27
Nodes (8): createRouterAdministration(), FusionPattern, RouterPosteriorRow, RouterStats, postgresRouterAdministrationRepository, RouterAdministrationRepository, resetRouter(), routerStats()

### Community 113 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 114 - "BuilderToolsAdapter.ts"
Cohesion: 0.04
Nodes (47): isComponentMigrationPath(), { KIT_BUILTIN }, OAuthIdentity, confirmPasswordReset, createOAuthTicket, createTestUser, ensureOwnerAdmin, requestPasswordReset (+39 more)

### Community 115 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (10): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+2 more)

### Community 116 - "model-management/router.ts"
Cohesion: 0.11
Nodes (23): analyzeHeuristic(), useFastPath(), createTurnFeedback(), penalizeTurn(), posteriors, gamma(), gaussian(), prior() (+15 more)

### Community 118 - "domain/securityScan.ts"
Cohesion: 0.17
Nodes (18): fileSide, nativeClient(), nativeServer(), FileMap, Finding, findSecret(), formatFinding(), isClient() (+10 more)

### Community 119 - "app-services/analytics.ts"
Cohesion: 0.26
Nodes (9): buildGraphView(), GraphCard, GraphConnection, GraphEdge, GraphNode, GraphQuestion, ProjectGraph, ProjectKnowledge() (+1 more)

### Community 120 - "app-services/payments.ts"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 122 - "adminApi.ts"
Cohesion: 0.10
Nodes (33): hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups (+25 more)

### Community 123 - "Plan de runtime multi-stack: FastAPI, Go y Spring Boot"
Cohesion: 0.10
Nodes (21): Adaptadores por stack, Aislamiento sin contenedores: condicion de publicacion, Arquitectura propuesta, Cache, artefactos y publicacion, Compatibilidad con BaaS y SDK, Contrato de proyecto y runtime, Decision inicial de datos, Despliegue gradual y rollback (+13 more)

### Community 124 - "Registro de implementación"
Cohesion: 0.12
Nodes (19): Constructor, Diagnóstico, Ejecución, Estado, Fase 6 — Exportar para producción, Garantías de no regresión, Idea central, Manifiesto `forja.json` (versión 1) (+11 more)

### Community 125 - "CreateProjectUseCase.ts"
Cohesion: 0.27
Nodes (4): CreateCheckpointUseCase, Author, Checkpoint, CheckpointProps

### Community 126 - "SqlAgentTaskRepository.ts"
Cohesion: 0.19
Nodes (7): ListAgentTasksUseCase, SqlAgentTaskRepository, loadHistory(), AgentTaskQueries, AgentTaskView, TaskCompletion, mocks

### Community 127 - "plan-escalado-microservicios.md"
Cohesion: 0.25
Nodes (8): 4. Playground de agentes, Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, usage(), text()

### Community 128 - "app-services/storage.ts"
Cohesion: 0.24
Nodes (7): createStorage(), putObject(), MAX_PROJECT_STORAGE_BYTES, StorageLimitError, StoredObject, MAX_FILE_BYTES, safeStorageKey()

### Community 129 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 130 - "migrate.mjs"
Cohesion: 0.09
Nodes (29): app, DATA, app, DATA, MODELS, ROOT, SEED, MODELS (+21 more)

### Community 133 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (17): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+9 more)

### Community 134 - "ProjectsApplication.ts"
Cohesion: 0.14
Nodes (16): AppTarget, Extraction, CreateProjectInput, BeforeImage, beforeImages(), restoredFiles(), turnFileChange(), ChangeEntry (+8 more)

### Community 135 - "policies.test.ts"
Cohesion: 0.06
Nodes (23): @electric-sql/pglite, visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), createEmail() (+15 more)

### Community 136 - "e2e-oauth.mjs"
Cohesion: 0.24
Nodes (10): api, modelsController, ModelChecklist(), ModelRow, MODES, price(), ProjectModels(), PROVIDER (+2 more)

### Community 138 - "Audit.tsx"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 139 - "executeRun"
Cohesion: 0.21
Nodes (6): ActiveRun, executeRun(), Ledger, Outcome, RunPorts, CaseResult

### Community 140 - "modules/projects/index.ts"
Cohesion: 0.11
Nodes (16): CoreModulesDependencies, CreateProjectUseCase, ProjectProfile, SeoSettings, DEFAULT_STARTER_TEMPLATE, parseStarterTemplate(), standardStarterFiles(), starterFiles() (+8 more)

### Community 141 - "integrations/github.ts"
Cohesion: 0.16
Nodes (14): apps, handleWebhook(), imports, legacy, linkRepo(), ports(), sync, integrationRepository (+6 more)

### Community 142 - "SettingDefinition"
Cohesion: 0.22
Nodes (4): SettingDefinition, SettingDefinitionProps, SettingType, PlatformSettingsRegistryAdapter

### Community 144 - "projectIndex.ts"
Cohesion: 0.10
Nodes (27): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, contractRoutes(), componentStandards(), FileMap, importTarget(), isClientSource(), isHelperSource(), isListSelect() (+19 more)

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
Nodes (18): AUTH_MANIFEST, NATIVE_LAYOUT, Escritura y GitHub, DeleteFileUseCase, RenameFileUseCase, layoutForPath(), WriteFileUseCase, ProjectPath (+10 more)

### Community 159 - "InviteMemberUseCase.ts"
Cohesion: 0.13
Nodes (8): InviteMemberResult, InviteMemberUseCase, ProjectTarget, ProjectInvite, ProjectInviteProps, PlatformCollaborationMailerService, ICollaborationMailerService, SendInvitationParams

### Community 160 - "job-worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 161 - "judgeRouting.test.ts"
Cohesion: 0.33
Nodes (5): billing, { callModel }, input, model, scope

### Community 162 - "Backends en otros lenguajes (Java / Spring Boot)"
Cohesion: 0.33
Nodes (6): Backends en otros lenguajes (Java / Spring Boot), Configuración, Cómo funciona, Imagen y despliegue, Seguridad, Siguientes lenguajes

### Community 165 - "Memoria de los servicios"
Cohesion: 0.40
Nodes (5): Cómo consultarla, Dónde se va la memoria, Límites, Memoria de los servicios, ¿Reescribir algo en Go o Rust?

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
Cohesion: 0.08
Nodes (11): DATA, jar, ROOT, server, DATA, jar, req(), ROOT (+3 more)

### Community 178 - "architecture.test.ts"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 179 - "imports.ts"
Cohesion: 0.29
Nodes (9): COMPONENTS_MANIFEST, Link, SyncResult, createGithubImportService(), findCredential(), isPlaceholderCredential(), PreparedImport, blobSha() (+1 more)

### Community 184 - "createJobs"
Cohesion: 0.15
Nodes (20): createJobs(), addTimer(), enqueueJob(), executeJob(), fireDueTimers(), initializeAppServices(), report(), runJob() (+12 more)

### Community 191 - "domain/services.ts"
Cohesion: 0.09
Nodes (31): isPathPattern(), matchesPathPattern(), createServiceControl(), restart(), scale(), snapshot(), endpointRoutes(), jobFiles() (+23 more)

### Community 194 - "app-services/auth.ts"
Cohesion: 0.11
Nodes (28): Con el agente o por MCP, Cómo encaja, En el código de la app, En el Studio, En una app: `forja.auth.json`, Inicio de sesión con redes sociales y OAuth (Better Auth), Límites, Rutas (`/_baas/`) (+20 more)

### Community 200 - "scripts"
Cohesion: 0.08
Nodes (24): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+16 more)

### Community 202 - "createIdentityModule"
Cohesion: 0.11
Nodes (5): AdminApiTokenError, IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 210 - "usage/usage.ts"
Cohesion: 0.16
Nodes (7): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, mocks

### Community 212 - "IntegrationRepository"
Cohesion: 0.17
Nodes (6): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType

### Community 237 - "Panel de administración del sistema — diseño"
Cohesion: 0.12
Nodes (17): 10. Documentación, 1. Capa de datos, 2. Ajustes globales, 5. Enrutador, 7. Studio, 8. Errores y seguridad, Almacén, Conexión (+9 more)

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
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `ref_node_fs` to `FileMap`, `Chat.tsx`, `infrastructure/repositories.ts`, `config.ts`, `domain/score.ts`, `projects/application/usecases.ts`, `infrastructure/projectDb.ts`, `builderServer.ts`, `infrastructure/playground.ts`, `http.test.ts`, `accountLifecycle.ts`, `ProjectDb`, `sandbox.ts`, `model-management/providers.ts`, `app-runtime/index.ts`, `deps.ts`, `server/index.ts`, `bootstrap/server.ts`, `models.ts`, `application/problems.ts`, `infrastructure/routing.ts`, `OrgRole`, `projectIndex.ts`, `model-management/index.ts`, `PostgresProviderRepository.ts`, `projects/application/usecases.ts`, `projectLayout.ts`, `app-runtime/index.ts`, `projectLayout.ts`, `admission.ts`, `application/context.ts`, `roles.ts`, `package.json`, `createProjectsModule`, `adminServer.ts`, `BuilderWorkflowPorts`, `mcp/oauth.ts`, `modules/project-knowledge/index.ts`, `bundler.ts`, `mcp/server.ts`, `infrastructure/cache.ts`, `ExecutionMetrics`, `projectRows.ts`, `AppEnv`, `modules/builder/index.ts`, `createCollaborationModule`, `collaboration/ports/repositories.ts`, `devDependencies`, `ref_node_path`, `collaboration/postgresAdapters.test.ts`, `infrastructure/routing.ts`, `oauth.test.ts`, `createGithubSyncService`, `GithubError`, `modules/identity/index.ts`, `Plan.ts`, `infrastructure/github.ts`, `runtimeDataBridge.ts`, `FinishGateAdapter.ts`, `RunTaskLaneUseCase.ts`, `RunAgentUseCase.ts`, `ApplicationLifecycle`, `OrganizationSkillsService.ts`, `ModelRouterPorts.ts`, `BuilderToolsAdapter.ts`, `mcp/jobs.ts`, `model-management/router.ts`, `adminApi.ts`, `CreateProjectUseCase.ts`, `SqlAgentTaskRepository.ts`, `apiTypes.test.ts`, `BuilderRunRegistry`, `evaluations/bindings.test.ts`, `ProjectsApplication.ts`, `policies.test.ts`, `Audit.tsx`, `modules/projects/index.ts`, `integrations/github.ts`, `SettingDefinition`, `projectIndex.ts`, `ApiError`, `ServiceControlPanel.tsx`, `projects/postgres.test.ts`, `InviteMemberUseCase.ts`, `judgeRouting.test.ts`, `ref_node_child_process`, `architecture.test.ts`, `imports.ts`, `integrations/boundaries.test.ts`, `domain/services.ts`, `createIdentityModule`, `usage/usage.ts`, `IntegrationRepository`, `ISettingsStore`, `PlatformSettingsService`, `accounts.ts`?**
  _High betweenness centrality (0.261) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `BuilderTurnAdapter.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06185919343814081 - nodes in this community are weakly interconnected._
- **Why does `react` connect `server/index.ts` to `index.tsx`, `Chat.tsx`, `App.tsx`, `client/index.ts`, `projects/application/usecases.ts`, `internal/router.ts`, `forms.tsx`, `Audit.tsx`, `e2e-oauth.mjs`, `projects/application/usecases.ts`, `package.json`, `integrations/index.ts`, `infrastructure/routing.ts`, `app-services/analytics.ts`, `Workspace.tsx`, `ServiceControlPanel.tsx`, `Memory.tsx`, `ProjectView.tsx`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `FileMap` be split into smaller, more focused modules?**
  _Cohesion score 0.07764705882352942 - nodes in this community are weakly interconnected._