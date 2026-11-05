# Graph Report - anemone  (2026-11-05)

## Corpus Check
- 651 files · ~292,228 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 6, .css 5, .example 1)

## Summary
- 4382 nodes · 11359 edges · 186 communities (156 shown, 30 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 613 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `526653eb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- accountLifecycle.ts
- index.tsx
- infrastructure/runner.ts
- Chat.tsx
- ref_node_crypto
- ProviderService.ts
- appServer.ts
- http-client.ts
- integrations/github.ts
- config
- with
- ProjectDb
- BuilderToolsAdapter.ts
- evaluations/bindings.test.ts
- modules/builder/index.ts
- BuilderTurnAdapter.ts
- memory/application/service.ts
- ExecutionMetrics
- skills.test.ts
- Account
- RunAgentUseCase.ts
- log
- Account
- domain/messages.ts
- urls.ts
- administration/presentation/Models.tsx
- project-observability/problems.ts
- modules/collaboration/index.ts
- modules/projects/index.ts
- Plan.ts
- AppEnv
- ProjectView.tsx
- studioApi.ts
- domain/services.ts
- appRuntimeServer.ts
- JobRuntimePorts
- ProjectsApplication.ts
- compilerOptions
- models.ts
- projects/application/usecases.ts
- createCollaborationModule
- policies.test.ts
- client.ts
- scripts
- projectRows.ts
- model-management/providers.ts
- model-management/index.ts
- mcp/server.ts
- integrations/index.ts
- package.json
- ProjectsStore
- Project
- Desplegar Forja en Coolify
- vitest
- usage/usage.ts
- projectIndex.ts
- server/index.ts
- adminApi.ts
- createIdentityModule
- CLAUDE.md
- PostgresProjectsStore.ts
- deps.ts
- sandboxWorker.mjs
- postgres
- appRuntimeServer.ts
- PostgresProjectsStore
- client/index.ts
- internal/router.ts
- Panel de administración del sistema — diseño
- createJobs
- GithubGateway
- mcp/jobs.ts
- IOrganizationRepository
- model-management/catalog.ts
- services
- crypto.ts
- project-observability/security.ts
- createProjectRows
- modules/projects/index.ts
- config.ts
- typecheck.ts
- TEST_DATABASE_URL
- model-management/router.ts
- app-runtime/services.test.ts
- domain/score.ts
- Changes.tsx
- ISettingsStore
- ModelRouter.ts
- app-services/storage.ts
- Evals.tsx
- Inventario de funciones de Lovable → Forja
- domain/services.ts
- BootstrapService
- BuilderWorkflowPorts
- PostgresCatalogRepository.ts
- executeRun
- app-services/analytics.ts
- OrchestrationPolicy.ts
- app-services/payments.ts
- createProblemService
- IntegrationRepository
- ApplicationLifecycle
- ProjectDbClient
- toolOutputs.test.ts
- projectMicroservices.test.ts
- ProjectServices
- apiTypes.test.ts
- OrganizationSkillsService.ts
- domain/securityScan.ts
- Workspace.tsx
- Cómo está hecho
- ports.ts
- createGithubSyncService
- integrations/github.ts
- devDependencies
- github.mjs
- RouterAdministration.ts
- platform.ts
- RunTaskLaneUseCase.ts
- ports/storage.ts
- { api, auth, storage, ai }
- SettingDefinition
- App.tsx
- infrastructure/repositories.ts
- modules/builder/index.ts
- studio.mjs
- postgres
- healthcheck
- policies.ts
- app-runtime
- modules/collaboration/index.ts
- build
- IdentityRandom
- PlatformSettingsService
- guides.ts
- builder
- OrgRole
- application.test.ts
- RealtimeTransport
- forja
- FinishGateAdapter.ts
- .execute
- composition.ts
- application/context.ts
- AuthPorts
- app-services/realtime.ts
- agents.mjs
- ports/context.ts
- e2e.mjs
- collaboration/postgresAdapters.test.ts
- job-worker
- BuilderRunRegistry
- bootstrap/server.ts
- ApiError
- createAuth
- adminServer.ts
- { SandboxRunError, runInSandbox, stopSandbox, stopAllSandboxes, getSandboxServices, restartSandboxService }
- q
- spring.ts
- forms.tsx
- Review Focus
- GithubAuthorization
- GithubProjectPorts
- Durable jobs worker
- One project: orders API and durable invoice worker
- GithubRepository
- createAdminMcpHandler
- transports/mcp.test.ts
- ServiceControlPanel.tsx
- architecture.test.ts
- accountLifecycle.ts
- infrastructure/github.ts
- settings/index.ts
- { getSecurity, saveScan, startDeepScan, setIgnored }
- { BuildError, buildClient, buildExamples, checkProject, compileServerModule, endpointRoutes, pageRoutes, exampleFiles, jobFiles, readJobSettings, formatProblem }
- { BUILTIN_PACKAGES, MANIFEST, readDeps, writeDeps, isValidPackageName, packageName, isNodeBuiltin, depsDir, ensureDeps, resolvePackage, withManifestLock }
- { KIT_BUILTIN, KIT_CATALOG, kitSummary }
- { publishProject, unpublishProject }
- { quickScan, findSecret, formatFinding }
- { runBrowserTest, inspectPreview, allowedRequest, closeBrowser }
- { serveApp, parseCookies, cookie }
- { SHARE_COOKIE, RESERVED_SLUG, shareToken, checkShareToken, previewOrigin, previewUrl, appUrl, parseAppHost }
- { typecheckProject, parseDiagnostics, verifyBuild }
- { syncProject, holdSync, releaseSync, watchLinked, startGithubSync, stopGithubSync, reschedulePoll }

## God Nodes (most connected - your core abstractions)
1. `vitest` - 145 edges
2. `q()` - 104 edges
3. `createStudioApi()` - 73 edges
4. `react` - 47 edges
5. `createIdentityModule()` - 46 edges
6. `one()` - 41 edges
7. `ProjectsStore` - 40 edges
8. `createProjectsModule()` - 39 edges
9. `ProjectView()` - 36 edges
10. `PostgresProjectsStore` - 35 edges

## Surprising Connections (you probably didn't know these)
- `6. IA dentro de las apps` --references--> `tools()`  [INFERRED]
  docs/inventario-lovable.md → server/modules/builder/infrastructure/BuilderTurnAdapter.ts
- `1. Chat y agente del constructor` --references--> `selectContext()`  [INFERRED]
  docs/inventario-lovable.md → server/modules/builder/infrastructure/projectIndex.ts
- `Task 6: Studio — página de administración` --references--> `useLoad()`  [INFERRED]
  docs/superpowers/plans/2026-11-01-panel-admin.md → studio/src/features/files/presentation/Panels.tsx
- `Cómo está hecho` --references--> `useApi()`  [INFERRED]
  README.md → sdk/client/internal/hooks.ts
- `9. Publicar, hosting y crecimiento` --references--> `useHead()`  [INFERRED]
  docs/inventario-lovable.md → sdk/client/internal/router.ts

## Import Cycles
- None detected.

## Communities (186 total, 30 thin omitted)

### Community 0 - "accountLifecycle.ts"
Cohesion: 0.11
Nodes (8): PlatformRole, AccountRow, SessionAccountRow, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountLifecycleRepository, AccountSecurity

### Community 1 - "index.tsx"
Cohesion: 0.16
Nodes (17): clsx@^2.1.1, sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card() (+9 more)

### Community 2 - "infrastructure/runner.ts"
Cohesion: 0.13
Nodes (35): removeProjectData, removeProjectData(), sessionCookie(), endSession, testSession, EvalError, RunRequest, recoverRuns() (+27 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.05
Nodes (70): ChatStreamEvent, api, builderController, streamGet, streamPost, AgentLanes(), Lane, LaneCard() (+62 more)

### Community 4 - "ref_node_crypto"
Cohesion: 0.12
Nodes (18): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, migrate(), createTestCoreModules(), drop(), freshDatabase(), TEST_DATABASE_URL (+10 more)

### Community 5 - "ProviderService.ts"
Cohesion: 0.14
Nodes (16): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), OPENROUTER_URL (+8 more)

### Community 6 - "appServer.ts"
Cohesion: 0.08
Nodes (48): RuntimeEvent, resolveServiceExecution(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle() (+40 more)

### Community 7 - "http-client.ts"
Cohesion: 0.08
Nodes (23): appServicesController, api, billingController, Meter(), Plan(), Usage, createEvaluationUseCases(), filesController (+15 more)

### Community 8 - "integrations/github.ts"
Cohesion: 0.15
Nodes (14): Link, SyncResult, accountStatus, connectAccount, createRepo, disconnectAccount, getLink, handleWebhook (+6 more)

### Community 9 - "config"
Cohesion: 0.06
Nodes (44): Conexión, lifecycle, [command, ...flags], main(), monolith, seedDev, seedLocal, createLocalSeed() (+36 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "ProjectDb"
Cohesion: 0.17
Nodes (6): @electric-sql/pglite, AppDataPorts, createAppDataService(), SqlExecutionResult, TransactionAction, isInternalServiceRequest()

### Community 12 - "BuilderToolsAdapter.ts"
Cohesion: 0.07
Nodes (21): assertProjectObject(), assertSafeAgentSql(), objectName(), redactSqlData(), isSafeProjectPath(), assertOwnerRequestedForget(), assertOwnerSourcedMemory(), normalized() (+13 more)

### Community 13 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (20): PlaygroundView, AgentEvent, AgentResult, Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole (+12 more)

### Community 14 - "modules/builder/index.ts"
Cohesion: 0.07
Nodes (34): GATE_FIXES, AgentResult, calculateSpendUseCase, toolRegistry, runAgent(), toolByName, estTokens(), GATE_THRESHOLD (+26 more)

### Community 15 - "BuilderTurnAdapter.ts"
Cohesion: 0.08
Nodes (52): Implementation plan document (`static/__dev/plan.md`), describeSchema, ScheduleTasksUseCase, rewardOf(), checkPlanDoc(), criteriaOf(), planOverview(), active (+44 more)

### Community 16 - "memory/application/service.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 17 - "ExecutionMetrics"
Cohesion: 0.05
Nodes (32): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, AgentToolRole (+24 more)

### Community 18 - "skills.test.ts"
Cohesion: 0.19
Nodes (17): AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO, allSkills() (+9 more)

### Community 19 - "Account"
Cohesion: 0.10
Nodes (6): Account, AccountProps, Email, COMMON_PASSWORDS, Password, PostgresAccountRepository

### Community 20 - "RunAgentUseCase.ts"
Cohesion: 0.07
Nodes (36): page(), RunAgentUseCase, summarize(), addUsage(), AgentExecutionSpec, Block, emptyUsage(), ExecutionContext (+28 more)

### Community 21 - "log"
Cohesion: 0.20
Nodes (4): log(), ProjectSandbox, SandboxRunError, ServicePool

### Community 22 - "Account"
Cohesion: 0.09
Nodes (11): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, IdentityModuleDependencies, IdentityAccountsDependencies, IAccountRepository, ILoginCodeRepository (+3 more)

### Community 23 - "domain/messages.ts"
Cohesion: 0.11
Nodes (27): anthropicChat(), Block, LlmMessage, LlmRequest, LlmResponse, LlmTool, ModelCallError, textOf() (+19 more)

### Community 24 - "urls.ts"
Cohesion: 0.09
Nodes (29): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+21 more)

### Community 25 - "administration/presentation/Models.tsx"
Cohesion: 0.09
Nodes (48): radix-ui, react, administrationController, api, Admin(), TABS, AgentEvent, Agents() (+40 more)

### Community 26 - "project-observability/problems.ts"
Cohesion: 0.09
Nodes (16): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, locate(), Problem, ProblemEffects (+8 more)

### Community 27 - "modules/collaboration/index.ts"
Cohesion: 0.14
Nodes (6): PersonalOrganizationUseCase, Organization, OrganizationProps, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 28 - "modules/projects/index.ts"
Cohesion: 0.09
Nodes (14): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, ProjectPath, IProjectFileRepository, app, database, pool (+6 more)

### Community 29 - "Plan.ts"
Cohesion: 0.11
Nodes (21): CheckPlanUseCase, checkContract(), CONTRACT_FILE, contractRoutes(), covers(), MAX_CONTRACT, MAX_GOAL, MAX_PLAN_DOC (+13 more)

### Community 30 - "AppEnv"
Cohesion: 0.15
Nodes (10): ClaimedJob, createJobQueue(), poll(), processJob(), pump(), start(), stop(), AppEnv (+2 more)

### Community 31 - "ProjectView.tsx"
Cohesion: 0.09
Nodes (56): api, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel(), DocsPanel() (+48 more)

### Community 32 - "studioApi.ts"
Cohesion: 0.06
Nodes (51): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, listEmails, receiveEmail (+43 more)

### Community 33 - "domain/services.ts"
Cohesion: 0.16
Nodes (23): createProjectCheck(), createServiceControl(), restart(), scale(), snapshot(), EndpointInfo, endpointRoutes(), exampleFiles() (+15 more)

### Community 34 - "appRuntimeServer.ts"
Cohesion: 0.11
Nodes (15): AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts, resolveApp() (+7 more)

### Community 36 - "ProjectsApplication.ts"
Cohesion: 0.19
Nodes (11): CreateCheckpointUseCase, CreateProjectInput, CreateProjectUseCase, Author, beforeImages(), restoredFiles(), turnFileChange(), Checkpoint (+3 more)

### Community 37 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 38 - "models.ts"
Cohesion: 0.10
Nodes (24): createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), ClassificationPorts (+16 more)

### Community 39 - "projects/application/usecases.ts"
Cohesion: 0.07
Nodes (33): ProjectEvent, ProjectLogLine, projectsController, CreateProjectOptions, createProjectUseCases(), isProjectLogLine(), isProjectProblem(), isRecord() (+25 more)

### Community 40 - "createCollaborationModule"
Cohesion: 0.15
Nodes (6): MemberQueries, OrganizationQueries, createCollaborationModule(), IMemberQueries, IOrganizationQueries, fixture()

### Community 41 - "policies.test.ts"
Cohesion: 0.17
Nodes (6): createEmail(), sendEmail(), sendPlatformEmail(), JOB_LIMITS, verifiedSender(), JobCron

### Community 42 - "client.ts"
Cohesion: 0.18
Nodes (13): createClient(), ChatMessage, createAi(), createApiWorkflow(), createAuth(), { apiUrl }, createRealtime(), Handler (+5 more)

### Community 43 - "scripts"
Cohesion: 0.10
Nodes (20): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+12 more)

### Community 44 - "projectRows.ts"
Cohesion: 0.17
Nodes (4): createProjectRowsRepository(), projectRowsRepository, ProjectRowsPort, ProjectSchemaPort

### Community 45 - "model-management/providers.ts"
Cohesion: 0.13
Nodes (29): providerOf(), providers(), speedFor(), tierFor(), createCatalogSync(), lastSync(), startCatalogSync(), syncOpenRouter() (+21 more)

### Community 46 - "model-management/index.ts"
Cohesion: 0.14
Nodes (18): bindModelAudit(), bindCatalogService(), bindCatalogSync(), createPlatformCatalogService(), ModelSpendView, ProjectModelPatch, ProjectModelSettings, RouterDecisionView (+10 more)

### Community 47 - "mcp/server.ts"
Cohesion: 0.14
Nodes (17): guideList(), readGuides(), buildServer(), CONTEXT_TOOLS, createMcpHandler(), DESTRUCTIVE, expectedVersionProp, extraTools (+9 more)

### Community 48 - "integrations/index.ts"
Cohesion: 0.23
Nodes (14): api, integrationsController, GithubCard, GithubCommitCard(), GithubSection(), Link, Mark(), CreateDialog() (+6 more)

### Community 49 - "package.json"
Cohesion: 0.06
Nodes (29): dependencies, @anthropic-ai/sdk@^1.3.0, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, hono@^4.13.14, @hono/node-server@^2.1.5, lucide-react@^1.66.0 (+21 more)

### Community 50 - "ProjectsStore"
Cohesion: 0.07
Nodes (7): isDevFile(), ProjectsApplication, ProjectSnapshot, TurnChanges, createProjectsModule(), ProjectsStore, fixture()

### Community 51 - "Project"
Cohesion: 0.11
Nodes (5): Project, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 52 - "Desplegar Forja en Coolify"
Cohesion: 0.11
Nodes (15): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+7 more)

### Community 53 - "vitest"
Cohesion: 0.10
Nodes (5): vitest, root, sources(), files(), scopes

### Community 54 - "usage/usage.ts"
Cohesion: 0.15
Nodes (8): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, countAction, mocks

### Community 55 - "projectIndex.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 56 - "server/index.ts"
Cohesion: 0.08
Nodes (14): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, CheckoutInput (+6 more)

### Community 57 - "adminApi.ts"
Cohesion: 0.20
Nodes (15): hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups (+7 more)

### Community 58 - "createIdentityModule"
Cohesion: 0.12
Nodes (5): AdminApiTokenError, IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 60 - "PostgresProjectsStore.ts"
Cohesion: 0.16
Nodes (6): BeforeImage, ProjectProps, PostgresProjectFileRepository, PATCHABLE, ProjectEventPort, LogChangeInput

### Community 61 - "deps.ts"
Cohesion: 0.09
Nodes (39): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KIT_CATALOG, KitEntry, kitSummary(), BUILTIN_PACKAGES, catalogVersion() (+31 more)

### Community 62 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 63 - "postgres"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 65 - "appRuntimeServer.ts"
Cohesion: 0.29
Nodes (14): cloneDatabase(), closeAll(), closeProject(), dumpDatabase(), execSql(), get(), isAwake(), metricsFor() (+6 more)

### Community 66 - "PostgresProjectsStore"
Cohesion: 0.06
Nodes (4): FileMap, PostgresProjectsStore, ProjectOrganizations, QueryHandle

### Community 67 - "client/index.ts"
Cohesion: 0.20
Nodes (12): AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes, RouteSpec (+4 more)

### Community 68 - "internal/router.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 69 - "Panel de administración del sistema — diseño"
Cohesion: 0.13
Nodes (15): 10. Documentación, 1. Capa de datos, 5. Enrutador, 6. API de administración, 7. Studio, 8. Errores y seguridad, Decisiones tomadas con el usuario, `.env` resultante (+7 more)

### Community 70 - "createJobs"
Cohesion: 0.27
Nodes (13): createJobs(), addTimer(), enqueueJob(), executeJob(), fireDueTimers(), initializeAppServices(), report(), runJob() (+5 more)

### Community 71 - "GithubGateway"
Cohesion: 0.18
Nodes (4): 2. Ajustes globales, Almacén, Registro, GithubGateway

### Community 72 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 73 - "IOrganizationRepository"
Cohesion: 0.12
Nodes (6): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, IOrganizationRepository

### Community 74 - "model-management/catalog.ts"
Cohesion: 0.10
Nodes (33): Task 3: Proveedores y modelos en BD + seeders, 3. Proveedores y modelos, `llm/catalog.ts`, Pruebas de conexión, Tablas (`002_admin.sql`), tasks, evaluationBuilder(), admitPlayground() (+25 more)

### Community 75 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 76 - "crypto.ts"
Cohesion: 0.11
Nodes (18): createCoreModules(), BcryptArgonPasswordHasher, NodeBootstrapCrypto, PlatformMailerService, PostgresSessionRepository, burnPasswordCheck(), hashPassword(), LEGACY (+10 more)

### Community 77 - "project-observability/security.ts"
Cohesion: 0.14
Nodes (9): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+1 more)

### Community 78 - "createProjectRows"
Cohesion: 0.18
Nodes (14): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError (+6 more)

### Community 79 - "modules/projects/index.ts"
Cohesion: 0.17
Nodes (11): ChangeEntry, normalizeProjectProfile(), ProjectPatch, ProjectProfile, SeoSettings, TurnFileChange, starterFiles(), starterFiles() (+3 more)

### Community 80 - "config.ts"
Cohesion: 0.12
Nodes (16): vite, DEV_FIXTURE, Fixture, beginTransaction(), dispatch(), sandboxes, WORKER, DEFAULT_MODELS_ALLOW (+8 more)

### Community 81 - "typecheck.ts"
Cohesion: 0.19
Nodes (13): depsDir(), depsKey(), IGNORED, isSource(), MODULES, parseDiagnostics(), require, run() (+5 more)

### Community 83 - "model-management/router.ts"
Cohesion: 0.08
Nodes (33): createModelManagementQueries(), routerAudit(), updateProjectModels(), analyzeHeuristic(), createModelRouter(), analyzeRequest(), callModel(), pick() (+25 more)

### Community 84 - "app-runtime/services.test.ts"
Cohesion: 0.10
Nodes (16): RuntimeObservationPorts, bindRuntimeObservation(), checkProject, bindRuntimeObservation(), observation(), projectEvents, scan(), watchProblems() (+8 more)

### Community 85 - "domain/score.ts"
Cohesion: 0.10
Nodes (33): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS, JudgeDimension (+25 more)

### Community 86 - "Changes.tsx"
Cohesion: 0.21
Nodes (14): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+6 more)

### Community 87 - "ISettingsStore"
Cohesion: 0.24
Nodes (6): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry, ISettingsStore

### Community 88 - "ModelRouter.ts"
Cohesion: 0.11
Nodes (30): AgentSpec, TurnState, Catalog, KEYWORDS, LAMBDA, RoleProfile, Posterior, Effort (+22 more)

### Community 89 - "app-services/storage.ts"
Cohesion: 0.22
Nodes (8): createStorage(), putObject(), MAX_PROJECT_STORAGE_BYTES, StorageLimitError, StoredObject, MAX_FILE_BYTES, safeStorageKey(), storagePorts

### Community 90 - "Evals.tsx"
Cohesion: 0.22
Nodes (11): api, evaluationsController, Agg, EvalCfg, Evals(), Metric(), money(), RunDetail (+3 more)

### Community 91 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 92 - "domain/services.ts"
Cohesion: 0.07
Nodes (26): ControlledService, RuntimeService, ServiceControlSnapshot, ServiceQueueEntry, ServiceReplica, ServiceRuntimeSnapshot, ServiceExecution, SERVICES_MANIFEST (+18 more)

### Community 93 - "BootstrapService"
Cohesion: 0.19
Nodes (6): BootstrapService, SetupError, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 95 - "PostgresCatalogRepository.ts"
Cohesion: 0.29
Nodes (6): audit(), columns, postgresCatalogRepository, Row, postgresModelAudit(), ModelAudit

### Community 96 - "executeRun"
Cohesion: 0.21
Nodes (6): ActiveRun, executeRun(), Ledger, Outcome, RunPorts, CaseResult

### Community 97 - "app-services/analytics.ts"
Cohesion: 0.21
Nodes (9): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays(), analyticsPorts (+1 more)

### Community 98 - "OrchestrationPolicy.ts"
Cohesion: 0.08
Nodes (21): BuilderWorkflowUseCase, FastBuildUseCase, ReviewAndFixUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode (+13 more)

### Community 99 - "app-services/payments.ts"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 100 - "createProblemService"
Cohesion: 0.47
Nodes (9): createProblemService(), changed(), clearProblems(), fromLog(), listProblems(), recheckBuild(), stopProblems(), upsert() (+1 more)

### Community 101 - "IntegrationRepository"
Cohesion: 0.16
Nodes (7): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository

### Community 102 - "ApplicationLifecycle"
Cohesion: 0.17
Nodes (6): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown(), shutdown()

### Community 104 - "toolOutputs.test.ts"
Cohesion: 0.14
Nodes (8): dir, monolith, seedLocal, dir, runFixture(), BEFORE, conforms(), dir

### Community 105 - "projectMicroservices.test.ts"
Cohesion: 0.15
Nodes (6): playwright-core@1.64.1, playwright-core, assertPublic(), fetchPublicText(), isPrivate(), endpoint()

### Community 106 - "ProjectServices"
Cohesion: 0.22
Nodes (3): CoreModulesDependencies, ProjectsModuleDependencies, ProjectServices

### Community 107 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 108 - "OrganizationSkillsService.ts"
Cohesion: 0.18
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 109 - "domain/securityScan.ts"
Cohesion: 0.21
Nodes (15): FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer(), lineOf() (+7 more)

### Community 110 - "Workspace.tsx"
Cohesion: 0.07
Nodes (35): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, memoryController (+27 more)

### Community 111 - "Cómo está hecho"
Cohesion: 0.25
Nodes (8): 4. Playground de agentes, Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, ctx(), usage()

### Community 112 - "ports.ts"
Cohesion: 0.09
Nodes (18): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeProjectsPort, ProjectCompilerPort, createPublication(), assertPublishable(), Author (+10 more)

### Community 113 - "createGithubSyncService"
Cohesion: 0.23
Nodes (12): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+4 more)

### Community 114 - "integrations/github.ts"
Cohesion: 0.18
Nodes (4): createGithubAccountService(), connectAccount(), GithubAccountRepository, setup()

### Community 115 - "devDependencies"
Cohesion: 0.10
Nodes (24): typescript@^7.0.2, ws@^8.22.0, devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2 (+16 more)

### Community 116 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 117 - "RouterAdministration.ts"
Cohesion: 0.28
Nodes (8): createRouterAdministration(), routerStats(), RouterPosteriorRow, RouterStats, postgresRouterAdministrationRepository, RouterAdministrationRepository, resetRouter(), routerStats()

### Community 118 - "platform.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 119 - "RunTaskLaneUseCase.ts"
Cohesion: 0.08
Nodes (19): ListAgentTasksUseCase, RunTaskLaneUseCase, TaskLifecycleUseCase, AgentEvent, AgentExecutionResult, ExecutionModel, requiresFinishGate(), SqlAgentTaskRepository (+11 more)

### Community 122 - "SettingDefinition"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

### Community 123 - "App.tsx"
Cohesion: 0.08
Nodes (37): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallEvent, Pwa() (+29 more)

### Community 124 - "infrastructure/repositories.ts"
Cohesion: 0.17
Nodes (10): TransactionSession, projectDb(), authRepository(), createAuthRepository(), createQueryRepository(), schemaRows(), statement(), statements (+2 more)

### Community 125 - "modules/builder/index.ts"
Cohesion: 0.10
Nodes (13): accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService(), BuilderServiceClient (+5 more)

### Community 126 - "studio.mjs"
Cohesion: 0.24
Nodes (14): ADMIN, assert(), cleanup(), freePort(), get(), main(), resources, ROOT (+6 more)

### Community 127 - "postgres"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 128 - "healthcheck"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 129 - "policies.ts"
Cohesion: 0.13
Nodes (12): createSecrets(), projectSecretEnv(), secretEnv(), bindJobs, SECRET_NAME, jobPorts, configureAppServiceObserver(), log() (+4 more)

### Community 130 - "app-runtime"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 131 - "modules/collaboration/index.ts"
Cohesion: 0.10
Nodes (17): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, InviteMemberResult, InviteMemberUseCase, ProjectTarget, OrganizationNamesQuery, RemoveMemberUseCase (+9 more)

### Community 132 - "build"
Cohesion: 0.46
Nodes (8): build, BROWSER, args, context, dockerfile, build, build, build

### Community 134 - "PlatformSettingsService"
Cohesion: 0.17
Nodes (5): PlatformSettingsService, PostgresPlatformSettingsStoreAdapter, SettingsDependencies, fixture(), fixture()

### Community 135 - "guides.ts"
Cohesion: 0.18
Nodes (12): build(), Guide, guideById, GUIDES, OVERVIEW_PARTS, parse(), SECTION_IDS, slug() (+4 more)

### Community 136 - "builder"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 137 - "OrgRole"
Cohesion: 0.15
Nodes (7): OrgRole, PostgresOrganizationRepository, InviteView, MemberView, Org, OrgMemberView, OrganizationRecord

### Community 138 - "application.test.ts"
Cohesion: 0.09
Nodes (15): admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun(), runBudget() (+7 more)

### Community 140 - "forja"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 141 - "FinishGateAdapter.ts"
Cohesion: 0.10
Nodes (17): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+9 more)

### Community 144 - "composition.ts"
Cohesion: 0.11
Nodes (30): createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureSecretIntegrations(), initializeAppServices, bindEvaluationBuilder(), bindEvaluationResources() (+22 more)

### Community 145 - "application/context.ts"
Cohesion: 0.10
Nodes (11): Run, AppUser, createContext(), serviceContext(), EndpointContext, enqueue(), HttpError, JobContext (+3 more)

### Community 146 - "AuthPorts"
Cohesion: 0.14
Nodes (3): EmailInput, AuthPorts, AuthRepository

### Community 147 - "app-services/realtime.ts"
Cohesion: 0.24
Nodes (4): DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket, publish

### Community 148 - "agents.mjs"
Cohesion: 0.08
Nodes (20): app, DATA, app, DATA, MODELS, ROOT, SEED, MODELS (+12 more)

### Community 149 - "ports/context.ts"
Cohesion: 0.09
Nodes (18): AiUnavailableError, createAi(), appAiChat(), AiBlock, AppAiInput, AppAiResult, AppUser, CheckoutInput (+10 more)

### Community 151 - "e2e.mjs"
Cohesion: 0.22
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 152 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.18
Nodes (8): PlatformCollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository, sendInvitation

### Community 153 - "job-worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 155 - "bootstrap/server.ts"
Cohesion: 0.05
Nodes (40): @hono/node-server, startAppRuntimeEventRelay(), app, lifecycle, monolith, stopRuntimeEventRelay(), withDefaultHeaders(), app (+32 more)

### Community 157 - "createAuth"
Cohesion: 0.13
Nodes (21): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+13 more)

### Community 158 - "adminServer.ts"
Cohesion: 0.14
Nodes (15): @modelcontextprotocol/sdk@^1.32.2, zod@^4.6.7, @modelcontextprotocol/sdk, zod, ADMIN_MCP_INSTRUCTIONS, AdminMcpModules, descriptions, id (+7 more)

### Community 161 - "q"
Cohesion: 0.07
Nodes (9): createDevelopmentSeed(), PostgresMemberRepository, PostgresOrganizationSkillsRepository, PostgresAccountLifecycleRepository, PostgresLoginCodeRepository, PostgresPasswordResetRepository, PasswordResetRepository, one() (+1 more)

### Community 163 - "spring.ts"
Cohesion: 0.22
Nodes (5): clip(), normalize(), parseSpringOutput(), SpringBuildTool, SpringProject

### Community 165 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 166 - "Review Focus"
Cohesion: 0.18
Nodes (9): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 2: Registro y almacén de ajustes, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final (+1 more)

### Community 172 - "One project: orders API and durable invoice worker"
Cohesion: 0.25
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 174 - "createAdminMcpHandler"
Cohesion: 0.26
Nodes (11): createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists(), admin, call() (+3 more)

### Community 175 - "transports/mcp.test.ts"
Cohesion: 0.29
Nodes (5): account, collaboration, handleMcp, identity, projects

### Community 176 - "ServiceControlPanel.tsx"
Cohesion: 0.11
Nodes (22): createIdentityUseCases(), serviceControlController, transport, Actions, failed(), Filter, KIND_LABEL, observed() (+14 more)

### Community 178 - "architecture.test.ts"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 179 - "accountLifecycle.ts"
Cohesion: 0.12
Nodes (6): PostgresApiTokenRepository, AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository, state

### Community 181 - "infrastructure/github.ts"
Cohesion: 0.25
Nodes (9): GithubError, gh(), githubAccountRepository, githubAuthorization, tokenFor(), encryptHeaders(), decrypt(), encrypt() (+1 more)

### Community 279 - "settings/index.ts"
Cohesion: 0.20
Nodes (17): PlatformSettingType, SettingDef, SettingGroup, SettingView, MOVED_ENV, createPlatformSettings(), byKey, Def (+9 more)

## Knowledge Gaps
- **17 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1285 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `accountLifecycle.ts`, `ref_node_crypto`, `ProviderService.ts`, `http-client.ts`, `config`, `ProjectDb`, `BuilderToolsAdapter.ts`, `evaluations/bindings.test.ts`, `modules/builder/index.ts`, `memory/application/service.ts`, `ExecutionMetrics`, `skills.test.ts`, `Account`, `RunAgentUseCase.ts`, `Account`, `domain/messages.ts`, `project-observability/problems.ts`, `modules/projects/index.ts`, `Plan.ts`, `domain/services.ts`, `ProjectsApplication.ts`, `models.ts`, `projects/application/usecases.ts`, `createCollaborationModule`, `policies.test.ts`, `projectRows.ts`, `model-management/providers.ts`, `model-management/index.ts`, `package.json`, `ProjectsStore`, `usage/usage.ts`, `projectIndex.ts`, `server/index.ts`, `adminApi.ts`, `createIdentityModule`, `deps.ts`, `mcp/jobs.ts`, `IOrganizationRepository`, `crypto.ts`, `project-observability/security.ts`, `modules/projects/index.ts`, `config.ts`, `model-management/router.ts`, `app-runtime/services.test.ts`, `domain/score.ts`, `Changes.tsx`, `ISettingsStore`, `ModelRouter.ts`, `domain/services.ts`, `BootstrapService`, `OrchestrationPolicy.ts`, `IntegrationRepository`, `ApplicationLifecycle`, `toolOutputs.test.ts`, `projectMicroservices.test.ts`, `apiTypes.test.ts`, `OrganizationSkillsService.ts`, `ports.ts`, `createGithubSyncService`, `integrations/github.ts`, `devDependencies`, `RouterAdministration.ts`, `RunTaskLaneUseCase.ts`, `SettingDefinition`, `modules/builder/index.ts`, `policies.ts`, `modules/collaboration/index.ts`, `PlatformSettingsService`, `guides.ts`, `application.test.ts`, `FinishGateAdapter.ts`, `composition.ts`, `agents.mjs`, `collaboration/postgresAdapters.test.ts`, `BuilderRunRegistry`, `bootstrap/server.ts`, `ApiError`, `createAdminMcpHandler`, `transports/mcp.test.ts`, `architecture.test.ts`, `accountLifecycle.ts`?**
  _High betweenness centrality (0.283) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `accountLifecycle.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1103448275862069 - nodes in this community are weakly interconnected._
- **Why does `react` connect `administration/presentation/Models.tsx` to `index.tsx`, `client/index.ts`, `internal/router.ts`, `forms.tsx`, `Chat.tsx`, `http-client.ts`, `projects/application/usecases.ts`, `Workspace.tsx`, `integrations/index.ts`, `package.json`, `ServiceControlPanel.tsx`, `devDependencies`, `Changes.tsx`, `Evals.tsx`, `App.tsx`, `ProjectView.tsx`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `infrastructure/runner.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13048780487804879 - nodes in this community are weakly interconnected._