# Graph Report - pr-validation  (2026-11-07)

## Corpus Check
- 701 files · ~325,856 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: .css 6, (none) 5, .example 1)

## Summary
- 4649 nodes · 12235 edges · 183 communities (149 shown, 34 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 630 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Chat.tsx
- q
- BuilderTurnAdapter.ts
- react
- bootstrap/server.ts
- studioApi.ts
- AgentExecution.ts
- projects/application/usecases.ts
- ProjectView.tsx
- builderServer.ts
- database/index.ts
- infrastructure/playground.ts
- app-runtime/index.ts
- FusionOrchestrator.ts
- http-client.ts
- roles.ts
- ProjectDb
- builderService.ts
- FileMap
- appServer.ts
- app-runtime/index.ts
- models.ts
- sandbox.ts
- domain/contracts.ts
- modules/collaboration/index.ts
- server/index.ts
- config.ts
- modules/builder/index.ts
- ServicePanels.tsx
- deps.ts
- modules/identity/index.ts
- modules/builder/index.ts
- application/problems.ts
- PostgresRouterAdministrationRepository.ts
- BuilderToolsAdapter.ts
- with
- projects/postgres.test.ts
- AccountLifecycleRepository
- domain/score.ts
- composition.ts
- policies.test.ts
- builder/contracts.ts
- app-services/context.ts
- domain/routing.ts
- model-management/router.ts
- starterTemplate.test.ts
- domain/services.ts
- domain/messages.ts
- model-management/index.ts
- infrastructure/routing.ts
- PostgresProjectsStore
- app-services/context.ts
- application/context.ts
- dependencies
- q
- skills.test.ts
- Plan.ts
- ref_node_fs
- app-services/auth.ts
- execution-audit/index.ts
- roles.ts
- agents.mjs
- platformDb
- BootstrapService
- ref_node_fs
- OrganizationSkillsService.ts
- package.json
- IPersonalOrganizationRepository
- Project
- github.mjs
- model-management/catalog.ts
- createJobs
- FinishGatePolicy.ts
- Account
- sha256
- settings/index.ts
- model-management/catalog.ts
- Panel de administración del sistema — diseño
- index.tsx
- createCollaborationModule
- CheckAccessUseCase.ts
- ref_node_url
- adminApi.ts
- memory/application/service.ts
- model-management/providers.ts
- mcp/server.ts
- collaboration/ports/repositories.ts
- modules/projects/index.ts
- scripts
- client/index.ts
- createProjectRows
- IPasswordHasher
- model-management/providers.ts
- starterTemplate.test.ts
- mcp/server.ts
- AppEnv
- BuilderWorkflowPorts
- PostgresRouterAdministrationRepository.ts
- app-services/analytics.ts
- Review Focus
- Desplegar Forja en Coolify
- SettingDefinition
- internal/router.ts
- ISettingsStore
- integrations/index.ts
- compilerOptions
- domain/securityScan.ts
- sandboxWorker.mjs
- OrchestrationPolicy.ts
- accountLifecycle.ts
- IntegrationRepository
- Inventario de funciones de Lovable → Forja
- unit/catalog.test.ts
- architecture.test.ts
- Tx
- OrchestrationPolicy.ts
- createSecrets
- AuthPorts
- adminServer.ts
- unit/router.test.ts
- createJobQueue
- model-management/index.ts
- PostgresOrganizationRepository
- Audit.tsx
- domain/messages.ts
- infrastructure/routing.ts
- collaboration/postgresAdapters.test.ts
- projectMicroservices.test.ts
- vitest
- adminServer.ts
- collaboration/postgresAdapters.test.ts
- AccountLifecycleRepository
- services
- models/presentation/Models.tsx
- createAdminMcpHandler
- deps.test.ts
- cli.ts
- settingReactions.ts
- createGithubSyncService
- services
- Review Focus
- Panel de administración del sistema — diseño
- cli.ts
- composition.ts
- ProjectPath
- ProjectDbClient
- createHttp
- http.test.ts
- Account
- PostgresPlatformSettingsStoreAdapter
- healthcheck
- settingReactions.ts
- BuilderRunRegistry
- serverResponseHeaders.test.ts
- .execute
- projectMicroservices.test.ts
- guides.ts
- ProjectPath
- Plan.tsx
- app-runtime
- One project: orders API and durable invoice worker
- transports/mcp.test.ts
- GithubAuthorization
- GithubProjectPorts
- ref_node_path
- builder
- GithubRepository
- forja
- IdentityRandom
- motion.tsx
- RealtimeTransport
- ApiError
- CLAUDE.md
- Durable jobs worker
- CoreModulesDependencies
- service-worker.js
- { api, auth, storage, ai }
- { BuildError, buildClient, buildExamples, checkProject, compileServerModule, endpointRoutes, pageRoutes, exampleFiles, jobFiles, readJobSettings, formatProblem }
- { BUILTIN_PACKAGES, MANIFEST, readDeps, writeDeps, isValidPackageName, packageName, isNodeBuiltin, depsDir, ensureDeps, resolvePackage, withManifestLock }
- { publishProject, unpublishProject }
- TEST_DATABASE_URL

## God Nodes (most connected - your core abstractions)
1. `vitest` - 159 edges
2. `q()` - 110 edges
3. `createStudioApi()` - 73 edges
4. `react` - 50 edges
5. `AppEnv` - 47 edges
6. `createIdentityModule()` - 46 edges
7. `one()` - 42 edges
8. `ProjectsStore` - 40 edges
9. `createProjectsModule()` - 39 edges
10. `ProjectView()` - 37 edges

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

## Communities (183 total, 34 thin omitted)

### Community 0 - "Chat.tsx"
Cohesion: 0.06
Nodes (73): lucide-react, radix-ui, react, go(), listeners, administrationController, api, modelBlockers() (+65 more)

### Community 1 - "q"
Cohesion: 0.05
Nodes (70): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+62 more)

### Community 2 - "BuilderTurnAdapter.ts"
Cohesion: 0.08
Nodes (14): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, AccountProps, Email, IdentityModuleDependencies, PlatformMailerService (+6 more)

### Community 3 - "react"
Cohesion: 0.08
Nodes (33): createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), ClassificationPorts (+25 more)

### Community 4 - "bootstrap/server.ts"
Cohesion: 0.06
Nodes (59): Implementation plan document (`static/__dev/plan.md`), describeSchema, ScheduleTasksUseCase, rewardOf(), checkPlanDoc(), CONTRACT_FILE, criteriaOf(), MAX_CONTRACT (+51 more)

### Community 5 - "studioApi.ts"
Cohesion: 0.10
Nodes (52): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+44 more)

### Community 6 - "AgentExecution.ts"
Cohesion: 0.06
Nodes (59): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, listEmails, receiveEmail (+51 more)

### Community 7 - "projects/application/usecases.ts"
Cohesion: 0.10
Nodes (30): createDependencyResolution(), PackageRegistryPort, BUILTIN_PACKAGES, Deps, isValidPackageName(), MANIFEST, packageInfo, readDeps() (+22 more)

### Community 8 - "ProjectView.tsx"
Cohesion: 0.07
Nodes (6): isDevFile(), ProjectsApplication, ProjectSnapshot, createProjectsModule(), ProjectsStore, fixture()

### Community 9 - "builderServer.ts"
Cohesion: 0.20
Nodes (12): @hono/node-server@^2.1.5, @hono/node-server, startAppRuntimeEventRelay(), app, lifecycle, monolith, stopRuntimeEventRelay(), stopBuilder() (+4 more)

### Community 10 - "database/index.ts"
Cohesion: 0.21
Nodes (27): createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass(), importProviderModels() (+19 more)

### Community 11 - "infrastructure/playground.ts"
Cohesion: 0.06
Nodes (43): ProjectEvent, ProjectLogLine, projectsController, transport, CreateProjectOptions, createProjectUseCases(), isProjectLogLine(), isProjectProblem() (+35 more)

### Community 12 - "app-runtime/index.ts"
Cohesion: 0.06
Nodes (25): githubGateway, createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, locate(), Problem (+17 more)

### Community 13 - "FusionOrchestrator.ts"
Cohesion: 0.10
Nodes (11): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, ROLE_TOOLS (+3 more)

### Community 14 - "http-client.ts"
Cohesion: 0.11
Nodes (23): CoreModulesDependencies, createCoreModules(), secretPorts, BcryptArgonPasswordHasher, encryptHeaders(), Input, postgresProviderRepository, createProjectKnowledgeModule() (+15 more)

### Community 15 - "roles.ts"
Cohesion: 0.18
Nodes (16): auditWindow(), ExecutionAudit, identifier(), AuditContext, AuditFilter, AuditReport, AuditStage, AuditStep (+8 more)

### Community 16 - "ProjectDb"
Cohesion: 0.10
Nodes (41): RuntimeEvent, resolveServiceExecution(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle() (+33 more)

### Community 17 - "builderService.ts"
Cohesion: 0.10
Nodes (12): accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService(), BuilderServiceClient (+4 more)

### Community 18 - "FileMap"
Cohesion: 0.07
Nodes (25): api, billingController, Meter(), Plan(), Usage, createEvaluationUseCases(), createIdentityUseCases(), api (+17 more)

### Community 19 - "appServer.ts"
Cohesion: 0.08
Nodes (15): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, Cache (+7 more)

### Community 20 - "app-runtime/index.ts"
Cohesion: 0.07
Nodes (26): KIT_BUILTIN, KitEntry, ControlledService, RuntimeService, ServiceControlSnapshot, ServiceQueueEntry, ServiceReplica, ServiceRuntimeSnapshot (+18 more)

### Community 21 - "models.ts"
Cohesion: 0.06
Nodes (24): AiUnavailableError, createAi(), appAiChat(), AiBlock, AiContextMetrics, AiFusionTrace, AiUsage, AppAiInput (+16 more)

### Community 22 - "sandbox.ts"
Cohesion: 0.08
Nodes (27): ServiceExecution, checkProject, log(), beginTransaction(), dispatch(), getSandboxServices(), ProjectSandbox, restartSandboxService() (+19 more)

### Community 23 - "domain/contracts.ts"
Cohesion: 0.07
Nodes (35): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, memoryController (+27 more)

### Community 24 - "modules/collaboration/index.ts"
Cohesion: 0.12
Nodes (12): BuilderWorkflowUseCase, FastBuildUseCase, ReviewAndFixUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode (+4 more)

### Community 25 - "server/index.ts"
Cohesion: 0.09
Nodes (18): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeObservationPorts, RuntimeProjectsPort, createPublication(), assertPublishable(), Author (+10 more)

### Community 26 - "config.ts"
Cohesion: 0.12
Nodes (16): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, browserAvailable, CONFIG_DEFAULTS, DEFAULT_MODELS_ALLOW, env, resolvePublicUrl() (+8 more)

### Community 27 - "modules/builder/index.ts"
Cohesion: 0.07
Nodes (26): requestSecret, assertProjectObject(), assertSafeAgentSql(), assertSafePreviewSql(), containsDataChange(), containsSchemaChange(), objectName(), redactSqlData() (+18 more)

### Community 28 - "ServicePanels.tsx"
Cohesion: 0.07
Nodes (21): ActiveRun, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun(), runBudget() (+13 more)

### Community 29 - "deps.ts"
Cohesion: 0.16
Nodes (13): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), ProviderError (+5 more)

### Community 30 - "modules/identity/index.ts"
Cohesion: 0.10
Nodes (16): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, Author, CheckpointProps, ProjectProps, IProjectFileRepository, app (+8 more)

### Community 31 - "modules/builder/index.ts"
Cohesion: 0.08
Nodes (31): AgentResult, calculateSpendUseCase, toolRegistry, runAgent(), BuilderTool, toolByName, typed(), getProject() (+23 more)

### Community 32 - "application/problems.ts"
Cohesion: 0.10
Nodes (26): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallEvent, Pwa() (+18 more)

### Community 33 - "PostgresRouterAdministrationRepository.ts"
Cohesion: 0.23
Nodes (10): createRouterAdministration(), routerStats(), FusionPattern, FusionStep, RouterPosteriorRow, RouterStats, postgresRouterAdministrationRepository, RouterAdministrationRepository (+2 more)

### Community 34 - "BuilderToolsAdapter.ts"
Cohesion: 0.06
Nodes (40): dependencies, @anthropic-ai/sdk@^1.3.0, clsx@^2.1.1, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, hono@^4.13.14, lucide-react@^1.66.0 (+32 more)

### Community 35 - "with"
Cohesion: 0.09
Nodes (28): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+20 more)

### Community 36 - "projects/postgres.test.ts"
Cohesion: 0.09
Nodes (13): ClaimInvitesUseCase, MemberQueries, OrganizationNamesQuery, OrganizationQueries, createCollaborationModule(), IMemberQueries, InviteView, IOrganizationNameDirectory (+5 more)

### Community 38 - "domain/score.ts"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 39 - "composition.ts"
Cohesion: 0.10
Nodes (18): createKnowledgeService(), KnowledgeEngine, KnowledgeFiles, prepareCorpus(), KnowledgeAnswer, KnowledgeEdge, KnowledgeGraph, KnowledgeNode (+10 more)

### Community 40 - "policies.test.ts"
Cohesion: 0.09
Nodes (11): AdminApiTokenError, IdentityAccountsService, PlatformRole, createIdentityModule(), AccountRow, SessionAccountRow, AccountAccessUpdate, AccountAdminView (+3 more)

### Community 41 - "builder/contracts.ts"
Cohesion: 0.09
Nodes (24): app, handleAdminMcp, handleMcp, lifecycle, listening(), monolith, reactions, resolveApp() (+16 more)

### Community 42 - "app-services/context.ts"
Cohesion: 0.10
Nodes (33): PageInspection, EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS (+25 more)

### Community 43 - "domain/routing.ts"
Cohesion: 0.08
Nodes (34): AgentSpec, TurnState, Catalog, KEYWORDS, RoleProfile, Posterior, FusionBudget, FusionEffort (+26 more)

### Community 44 - "model-management/router.ts"
Cohesion: 0.06
Nodes (17): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+9 more)

### Community 45 - "starterTemplate.test.ts"
Cohesion: 0.16
Nodes (5): CreateCheckpointUseCase, CreateProjectUseCase, Checkpoint, creation(), load()

### Community 46 - "domain/services.ts"
Cohesion: 0.12
Nodes (17): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, problemKey(), RuntimeProblem, contractRoutes() (+9 more)

### Community 47 - "domain/messages.ts"
Cohesion: 0.14
Nodes (24): page(), GATE_FIXES, summarize(), addUsage(), AgentExecutionSpec, emptyUsage(), applySummary(), blockTokens() (+16 more)

### Community 48 - "model-management/index.ts"
Cohesion: 0.09
Nodes (41): createProjectCheck(), ProjectCompilerPort, createServiceControl(), restart(), scale(), snapshot(), packageName(), EndpointInfo (+33 more)

### Community 49 - "infrastructure/routing.ts"
Cohesion: 0.08
Nodes (6): PostgresApiTokenRepository, AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository, IdentityRandom

### Community 50 - "PostgresProjectsStore"
Cohesion: 0.09
Nodes (10): vitest, AppEnv, AppDataPorts, createAppDataService(), TransactionSession, ProjectMigration, ProjectDbClient, SqlExecutionResult (+2 more)

### Community 51 - "app-services/context.ts"
Cohesion: 0.05
Nodes (28): createEmail(), sendEmail(), sendPlatformEmail(), createSecrets(), projectSecretEnv(), secretEnv(), createStorage(), putObject() (+20 more)

### Community 52 - "application/context.ts"
Cohesion: 0.11
Nodes (15): RunAgentUseCase, Block, BuilderContextMetrics, BuilderFusionStep, BuilderFusionTrace, ContextAuditEvent, ExecutionContext, ExecutionTool (+7 more)

### Community 53 - "dependencies"
Cohesion: 0.12
Nodes (8): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, OrganizationProps, ORG_ROLES, OrgPolicy, OrgRole, IOrganizationRepository

### Community 54 - "q"
Cohesion: 0.05
Nodes (23): createDevelopmentSeed(), DEV_FIXTURE, Fixture, PostgresMemberRepository, PostgresAccountLifecycleRepository, PostgresLoginCodeRepository, AccountCreation, memoryRepository (+15 more)

### Community 55 - "skills.test.ts"
Cohesion: 0.06
Nodes (4): FileMap, PostgresProjectsStore, ProjectOrganizations, QueryHandle

### Community 56 - "Plan.ts"
Cohesion: 0.13
Nodes (12): CheckPlanUseCase, checkContract(), covers(), order(), overlap(), Plan, strings(), validatePlan() (+4 more)

### Community 57 - "ref_node_fs"
Cohesion: 0.11
Nodes (13): RunTaskLaneUseCase, TaskLifecycleUseCase, AgentEvent, AgentExecutionResult, ExecutionModel, requiresFinishGate(), AgentTaskRepository, LaneTask (+5 more)

### Community 58 - "app-services/auth.ts"
Cohesion: 0.10
Nodes (16): AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts, resolveApp() (+8 more)

### Community 59 - "execution-audit/index.ts"
Cohesion: 0.11
Nodes (39): removeProjectData, removeProjectData(), sessionCookie(), endSession, testSession, EvalError, RunRequest, recoverRuns() (+31 more)

### Community 60 - "roles.ts"
Cohesion: 0.09
Nodes (22): AgentToolRole, allowedToolsForRole(), assertRoleToolAccess(), BACKEND, CHECKLIST, CONTRACT, DATA, DESIGN (+14 more)

### Community 61 - "agents.mjs"
Cohesion: 0.10
Nodes (19): cookie(), app, DATA, app, DATA, MODELS, req(), ROOT (+11 more)

### Community 62 - "platformDb"
Cohesion: 0.22
Nodes (13): lifecycle, lifecycle, monolith, server, stopAppRuntime(), stopEmailTransport, isJobRunnerStarted, startJobRunner (+5 more)

### Community 63 - "BootstrapService"
Cohesion: 0.09
Nodes (38): @electric-sql/pglite, applyProjectMigrationsLocal(), assertRuntimeSql(), checksum(), closeAll(), closeProject(), databasePath(), dbKey() (+30 more)

### Community 64 - "ref_node_fs"
Cohesion: 0.10
Nodes (18): out(), createTestCoreModules(), freshDatabase(), TEST_DATABASE_URL, dataDir, dir, monolith, seedLocal (+10 more)

### Community 65 - "OrganizationSkillsService.ts"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 66 - "package.json"
Cohesion: 0.13
Nodes (18): BUILDER_SYSTEM_PROMPT, AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO (+10 more)

### Community 67 - "IPersonalOrganizationRepository"
Cohesion: 0.13
Nodes (21): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+13 more)

### Community 69 - "github.mjs"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 70 - "model-management/catalog.ts"
Cohesion: 0.24
Nodes (14): ADMIN, assert(), cleanup(), freePort(), get(), main(), resources, ROOT (+6 more)

### Community 71 - "createJobs"
Cohesion: 0.09
Nodes (12): Run, AppUser, createProjectCache(), createContext(), serviceContext(), EndpointContext, enqueue(), HttpError (+4 more)

### Community 72 - "FinishGatePolicy.ts"
Cohesion: 0.10
Nodes (11): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+3 more)

### Community 73 - "Account"
Cohesion: 0.15
Nodes (5): CACHE_LIMITS, ProjectCache, createProjectCacheRepository(), PROJECT_CACHE_SCHEMA, CacheRepository

### Community 74 - "sha256"
Cohesion: 0.11
Nodes (6): depsKey(), PostgresPasswordResetRepository, PostgresSessionRepository, PasswordResetRepository, sha256(), state

### Community 75 - "settings/index.ts"
Cohesion: 0.15
Nodes (6): PersonalOrganizationUseCase, Organization, CollaborationModuleDependencies, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 76 - "model-management/catalog.ts"
Cohesion: 0.09
Nodes (34): Task 3: Proveedores y modelos en BD + seeders, 3. Proveedores y modelos, `llm/catalog.ts`, Pruebas de conexión, Tablas (`002_admin.sql`), tasks, admission, evaluationBuilder() (+26 more)

### Community 77 - "Panel de administración del sistema — diseño"
Cohesion: 0.14
Nodes (10): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), PostgresOrganizationSkillsRepository, OrganizationSkillsRepository (+2 more)

### Community 78 - "index.tsx"
Cohesion: 0.16
Nodes (18): hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups (+10 more)

### Community 79 - "createCollaborationModule"
Cohesion: 0.16
Nodes (19): createJobs(), addTimer(), enqueueJob(), executeJob(), fireDueTimers(), initializeAppServices(), report(), runJob() (+11 more)

### Community 80 - "CheckAccessUseCase.ts"
Cohesion: 0.27
Nodes (4): CheckAccessUseCase, ProjectIdentity, Access, MemberAccess

### Community 81 - "ref_node_url"
Cohesion: 0.12
Nodes (13): playwright-core@1.64.1, playwright-core, root, server, types, worker, account, fixtures (+5 more)

### Community 82 - "adminApi.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 83 - "memory/application/service.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 84 - "model-management/providers.ts"
Cohesion: 0.12
Nodes (31): 6. API de administración, providerOf(), providers(), speedFor(), tierFor(), OPENROUTER_URL, createCatalogSync(), lastSync() (+23 more)

### Community 85 - "mcp/server.ts"
Cohesion: 0.05
Nodes (42): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), readGuides() (+34 more)

### Community 86 - "collaboration/ports/repositories.ts"
Cohesion: 0.10
Nodes (13): InviteMemberResult, InviteMemberUseCase, ProjectTarget, RemoveMemberUseCase, ProjectInvite, ProjectInviteProps, PlatformCollaborationMailerService, PostgresCollaborationAccountRepository (+5 more)

### Community 87 - "modules/projects/index.ts"
Cohesion: 0.13
Nodes (21): CreateProjectInput, BeforeImage, beforeImages(), restoredFiles(), turnFileChange(), Visibility, ChangeEntry, normalizeProjectProfile() (+13 more)

### Community 88 - "scripts"
Cohesion: 0.14
Nodes (22): clsx, sonner, Button, ButtonProps, Badge(), Card(), EmptyState(), ErrorState() (+14 more)

### Community 90 - "createProjectRows"
Cohesion: 0.23
Nodes (15): PlatformSettingType, SettingDef, SettingGroup, SettingView, MOVED_ENV, createPlatformSettings(), byKey, Def (+7 more)

### Community 91 - "IPasswordHasher"
Cohesion: 0.28
Nodes (4): PlatformSettingsService, SettingsDependencies, fixture(), fixture()

### Community 92 - "model-management/providers.ts"
Cohesion: 0.15
Nodes (14): react-dom@^19.3.1, react-dom, serviceControlController, transport, Actions, failed(), Filter, KIND_LABEL (+6 more)

### Community 93 - "starterTemplate.test.ts"
Cohesion: 0.12
Nodes (9): BootstrapService, SetupError, COMMON_PASSWORDS, Password, NodeBootstrapCrypto, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy (+1 more)

### Community 94 - "mcp/server.ts"
Cohesion: 0.13
Nodes (16): accountStatus, connectAccount, createRepo, disconnectAccount, getLink, handleWebhook, linkRepo, oauthFinish (+8 more)

### Community 95 - "AppEnv"
Cohesion: 0.12
Nodes (16): validateToolInput(), author, features, gemini, gpt, reply(), req, review() (+8 more)

### Community 96 - "BuilderWorkflowPorts"
Cohesion: 0.10
Nodes (20): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+12 more)

### Community 97 - "PostgresRouterAdministrationRepository.ts"
Cohesion: 0.15
Nodes (10): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError (+2 more)

### Community 98 - "app-services/analytics.ts"
Cohesion: 0.21
Nodes (9): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays(), analyticsPorts (+1 more)

### Community 99 - "Review Focus"
Cohesion: 0.18
Nodes (9): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 2: Registro y almacén de ajustes, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final (+1 more)

### Community 100 - "Desplegar Forja en Coolify"
Cohesion: 0.17
Nodes (6): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType

### Community 102 - "internal/router.ts"
Cohesion: 0.23
Nodes (15): api, integrationsController, GithubCard, GithubCommitCard(), GithubSection(), Link, Mark(), CreateDialog() (+7 more)

### Community 103 - "ISettingsStore"
Cohesion: 0.20
Nodes (12): AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes, RouteSpec (+4 more)

### Community 104 - "integrations/index.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 105 - "compilerOptions"
Cohesion: 0.22
Nodes (6): ListAgentTasksUseCase, SqlAgentTaskRepository, AgentTaskQueries, AgentTaskView, AgentTask, TaskCompletion

### Community 107 - "sandboxWorker.mjs"
Cohesion: 0.14
Nodes (9): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, SettingDefinitionProps, SettingType, SettingValue, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry (+1 more)

### Community 108 - "OrchestrationPolicy.ts"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 109 - "accountLifecycle.ts"
Cohesion: 0.21
Nodes (15): FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer(), lineOf() (+7 more)

### Community 110 - "IntegrationRepository"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 111 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.21
Nodes (14): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+6 more)

### Community 112 - "unit/catalog.test.ts"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 113 - "architecture.test.ts"
Cohesion: 0.27
Nodes (9): createClient(), ChatMessage, createAi(), createApiWorkflow(), createAuth(), createRealtime(), createStorage(), StoredFile (+1 more)

### Community 114 - "Tx"
Cohesion: 0.17
Nodes (6): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown(), shutdown()

### Community 115 - "OrchestrationPolicy.ts"
Cohesion: 0.30
Nodes (7): Review, reviewFixTasks(), PlanTask, SpecialistRole, FixResult, ReviewAndFixPorts, TeamReviewOutcome

### Community 116 - "createSecrets"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 117 - "AuthPorts"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 118 - "adminServer.ts"
Cohesion: 0.12
Nodes (20): ADMIN_MCP_INSTRUCTIONS, createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists(), descriptions (+12 more)

### Community 119 - "unit/router.test.ts"
Cohesion: 0.20
Nodes (12): createModelManagementQueries(), routerAudit(), updateProjectModels(), isMode(), taskClassOf(), useFastPath(), gamma(), gaussian() (+4 more)

### Community 120 - "createJobQueue"
Cohesion: 0.19
Nodes (8): ClaimedJob, createJobQueue(), poll(), processJob(), pump(), start(), stop(), JobPorts

### Community 121 - "model-management/index.ts"
Cohesion: 0.07
Nodes (39): createModelClassification(), analyzeHeuristic(), createModelRouter(), analyzeRequest(), pick(), maxTokensFor(), ROLES, createTurnFeedback() (+31 more)

### Community 123 - "Audit.tsx"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 124 - "domain/messages.ts"
Cohesion: 0.08
Nodes (29): anthropicChat(), Block, LlmMessage, LlmRequest, LlmResponse, LlmTool, textOf(), CompatEndpoint (+21 more)

### Community 125 - "infrastructure/routing.ts"
Cohesion: 0.20
Nodes (10): FUSION_BUDGETS, contextFields, contextMetrics(), listFusionTraces(), recordFusionStep(), recordFusionTrace(), billing, context (+2 more)

### Community 126 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.29
Nodes (6): collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository, sendInvitation

### Community 127 - "projectMicroservices.test.ts"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 128 - "vitest"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 129 - "adminServer.ts"
Cohesion: 0.25
Nodes (8): GithubError, Link, SyncResult, gh(), githubAccountRepository, githubAuthorization, tokenFor(), setup()

### Community 130 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.18
Nodes (4): createGithubAccountService(), connectAccount(), GithubAccountRepository, setup()

### Community 131 - "AccountLifecycleRepository"
Cohesion: 0.30
Nodes (11): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+3 more)

### Community 132 - "services"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 133 - "models/presentation/Models.tsx"
Cohesion: 0.25
Nodes (11): api, modelsController, AccountModels(), ModelChecklist(), ModelRow, MODES, price(), ProjectModels() (+3 more)

### Community 134 - "createAdminMcpHandler"
Cohesion: 0.22
Nodes (5): clip(), normalize(), parseSpringOutput(), SpringBuildTool, SpringProject

### Community 135 - "deps.test.ts"
Cohesion: 0.27
Nodes (3): DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket

### Community 136 - "cli.ts"
Cohesion: 0.23
Nodes (10): [command, ...flags], main(), monolith, seedDev, seedLocal, createLocalSeed(), readSeedFile(), SeedFile (+2 more)

### Community 137 - "settingReactions.ts"
Cohesion: 0.22
Nodes (3): createSettingReactions(), SettingReactionPorts, SettingsChangePort

### Community 138 - "createGithubSyncService"
Cohesion: 0.29
Nodes (8): buildGraphView(), GraphCard, GraphConnection, GraphEdge, GraphNode, GraphQuestion, ProjectGraph, ProjectKnowledge()

### Community 139 - "services"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 140 - "Review Focus"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 141 - "Panel de administración del sistema — diseño"
Cohesion: 0.05
Nodes (41): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+33 more)

### Community 143 - "composition.ts"
Cohesion: 0.10
Nodes (25): createMonolith(), startBindings(), stopBindings(), bindJobs, sendPlatformEmail, emailPorts, resetTransport(), configureJobRuntime() (+17 more)

### Community 145 - "ProjectDbClient"
Cohesion: 0.22
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 146 - "createHttp"
Cohesion: 0.25
Nodes (4): { apiUrl }, ApiError, createHttp(), HttpTransport

### Community 147 - "http.test.ts"
Cohesion: 0.10
Nodes (22): AdminMcpModules, builderCoreModules, CollaborationModule, IdentityModule, ProjectKnowledgeModule, ProjectsModule, SettingsModule, account (+14 more)

### Community 151 - "settingReactions.ts"
Cohesion: 0.46
Nodes (8): build, BROWSER, args, context, dockerfile, build, build, build

### Community 152 - "BuilderRunRegistry"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 154 - ".execute"
Cohesion: 0.25
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 155 - "projectMicroservices.test.ts"
Cohesion: 0.18
Nodes (4): assertPublic(), fetchPublicText(), isPrivate(), endpoint()

### Community 156 - "guides.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 160 - "app-runtime"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 161 - "One project: orders API and durable invoice worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 166 - "GithubProjectPorts"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 167 - "ref_node_path"
Cohesion: 0.21
Nodes (7): vite, studioPwa(), here, root, sources(), files(), scopes

## Knowledge Gaps
- **17 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1361 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `PostgresProjectsStore` to `Chat.tsx`, `q`, `BuilderTurnAdapter.ts`, `react`, `bootstrap/server.ts`, `projects/application/usecases.ts`, `ProjectView.tsx`, `builderServer.ts`, `infrastructure/playground.ts`, `app-runtime/index.ts`, `FusionOrchestrator.ts`, `http-client.ts`, `roles.ts`, `builderService.ts`, `FileMap`, `app-runtime/index.ts`, `sandbox.ts`, `modules/collaboration/index.ts`, `server/index.ts`, `config.ts`, `modules/builder/index.ts`, `ServicePanels.tsx`, `deps.ts`, `modules/identity/index.ts`, `modules/builder/index.ts`, `PostgresRouterAdministrationRepository.ts`, `BuilderToolsAdapter.ts`, `projects/postgres.test.ts`, `composition.ts`, `policies.test.ts`, `builder/contracts.ts`, `app-services/context.ts`, `domain/routing.ts`, `model-management/router.ts`, `starterTemplate.test.ts`, `domain/services.ts`, `domain/messages.ts`, `model-management/index.ts`, `app-services/context.ts`, `application/context.ts`, `dependencies`, `q`, `Plan.ts`, `ref_node_fs`, `app-services/auth.ts`, `BootstrapService`, `ref_node_fs`, `package.json`, `github.mjs`, `createJobs`, `FinishGatePolicy.ts`, `Account`, `sha256`, `Panel de administración del sistema — diseño`, `index.tsx`, `CheckAccessUseCase.ts`, `ref_node_url`, `adminApi.ts`, `model-management/providers.ts`, `mcp/server.ts`, `collaboration/ports/repositories.ts`, `client/index.ts`, `IPasswordHasher`, `model-management/providers.ts`, `starterTemplate.test.ts`, `mcp/server.ts`, `AppEnv`, `Desplegar Forja en Coolify`, `compilerOptions`, `sandboxWorker.mjs`, `Inventario de funciones de Lovable → Forja`, `Tx`, `createSecrets`, `AuthPorts`, `adminServer.ts`, `unit/router.test.ts`, `model-management/index.ts`, `Audit.tsx`, `domain/messages.ts`, `infrastructure/routing.ts`, `collaboration/postgresAdapters.test.ts`, `adminServer.ts`, `collaboration/postgresAdapters.test.ts`, `settingReactions.ts`, `composition.ts`, `ProjectPath`, `createHttp`, `http.test.ts`, `serverResponseHeaders.test.ts`, `projectMicroservices.test.ts`, `guides.ts`, `transports/mcp.test.ts`, `ref_node_path`?**
  _High betweenness centrality (0.299) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05701754385964912 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Chat.tsx` to `application/problems.ts`, `q`, `BuilderToolsAdapter.ts`, `studioApi.ts`, `internal/router.ts`, `ISettingsStore`, `integrations/index.ts`, `models/presentation/Models.tsx`, `createGithubSyncService`, `infrastructure/playground.ts`, `Inventario de funciones de Lovable → Forja`, `FileMap`, `domain/contracts.ts`, `scripts`, `Audit.tsx`, `model-management/providers.ts`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `q` be split into smaller, more focused modules?**
  _Cohesion score 0.04938271604938271 - nodes in this community are weakly interconnected._