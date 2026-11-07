# Graph Report - anemone-microservices-pr  (2026-11-06)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 4621 nodes · 12066 edges · 190 communities (158 shown, 32 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 627 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fe23b59a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

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
- ProjectsStore
- database/index.ts
- infrastructure/playground.ts
- app-runtime/index.ts
- FusionOrchestrator.ts
- http-client.ts
- roles.ts
- ProjectDb
- admission.ts
- FileMap
- appServer.ts
- sandbox.ts
- models.ts
- builderServer.ts
- domain/contracts.ts
- modules/collaboration/index.ts
- server/index.ts
- App.tsx
- modules/builder/index.ts
- ServicePanels.tsx
- deps.ts
- modules/identity/index.ts
- infrastructure/runner.ts
- application/problems.ts
- modules/project-knowledge/index.ts
- BuilderToolsAdapter.ts
- with
- projects/postgres.test.ts
- builderService.ts
- domain/score.ts
- composition.ts
- policies.test.ts
- builder/contracts.ts
- app-services/context.ts
- createIdentityModule
- model-management/router.ts
- modules/projects/index.ts
- domain/services.ts
- domain/messages.ts
- model-management/index.ts
- infrastructure/routing.ts
- PostgresProjectsStore
- IOrganizationRepository
- application/context.ts
- dependencies
- SqlAgentTaskRepository.ts
- skills.test.ts
- Plan.ts
- ref_node_fs
- app-services/auth.ts
- execution-audit/index.ts
- Project
- projectIndex.ts
- appRuntimeServer.ts
- BootstrapService
- bundler.ts
- OrganizationSkillsService.ts
- package.json
- IPersonalOrganizationRepository
- ProviderService.ts
- github.mjs
- model-management/catalog.ts
- createJobs
- FinishGatePolicy.ts
- Account
- FusionPolicy.ts
- settings/index.ts
- platform.ts
- Panel de administración del sistema — diseño
- index.tsx
- createCollaborationModule
- OrgRole
- PlatformSettingsService
- adminApi.ts
- memory/application/service.ts
- agents.mjs
- client.ts
- urls.ts
- BuilderWorkflow.ts
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
- SettingDefinition
- Changes.tsx
- Desplegar Forja en Coolify
- infrastructure/probe.ts
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
- mcp/jobs.ts
- createSecrets
- AuthPorts
- integrations/github.ts
- studio.mjs
- http.test.ts
- PostgresProjectFileRepository
- usage/usage.ts
- Audit.tsx
- Evals.tsx
- Memory.tsx
- models/presentation/Models.tsx
- projectMicroservices.test.ts
- vitest
- adminServer.ts
- collaboration/postgresAdapters.test.ts
- AccountLifecycleRepository
- services
- GithubGateway
- createAdminMcpHandler
- deps.test.ts
- app-services/payments.ts
- GithubAccountRepository
- createGithubSyncService
- services
- Review Focus
- e2e.mjs
- cli.ts
- unit/mcp.test.ts
- spring.ts
- ProjectDbClient
- accounts.ts
- PostgresCatalogRepository.ts
- fusion.test.ts
- postgres
- healthcheck
- settingReactions.ts
- BuilderRunRegistry
- Plan
- .execute
- ref_node_path
- guides.ts
- ProjectPath
- Plan.tsx
- args
- app-runtime
- One project: orders API and durable invoice worker
- forms.tsx
- apiTypes.test.ts
- transports/mcp.test.ts
- GithubAuthorization
- GithubProjectPorts
- ProjectEvent
- builder
- job-worker
- ports/storage.ts
- FastBuildPorts
- GithubRepository
- forja
- Cómo está hecho
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
1. `vitest` - 157 edges
2. `q()` - 110 edges
3. `createStudioApi()` - 73 edges
4. `react` - 50 edges
5. `createIdentityModule()` - 46 edges
6. `one()` - 42 edges
7. `ProjectsStore` - 40 edges
8. `createProjectsModule()` - 39 edges
9. `ProjectView()` - 37 edges
10. `config` - 36 edges

## Surprising Connections (you probably didn't know these)
- `6. IA dentro de las apps` --references--> `tools()`  [INFERRED]
  docs/inventario-lovable.md → server/modules/builder/infrastructure/BuilderTurnAdapter.ts
- `Task 6: Studio — página de administración` --references--> `useLoad()`  [INFERRED]
  docs/superpowers/plans/2026-11-01-panel-admin.md → studio/src/features/files/presentation/Panels.tsx
- `1. Chat y agente del constructor` --references--> `selectContext()`  [INFERRED]
  docs/inventario-lovable.md → server/modules/builder/infrastructure/projectIndex.ts
- `Conexión` --references--> `Tx`  [INFERRED]
  docs/superpowers/specs/2026-11-01-panel-admin-design.md → server/shared/database/index.ts
- `Task 2: Registro y almacén de ajustes` --references--> `SettingsError`  [INFERRED]
  docs/superpowers/plans/2026-11-01-panel-admin.md → server/modules/settings/domain/PlatformSetting.ts

## Import Cycles
- None detected.

## Communities (190 total, 32 thin omitted)

### Community 0 - "Chat.tsx"
Cohesion: 0.06
Nodes (70): lucide-react, radix-ui, react, go(), listeners, administrationController, api, modelBlockers() (+62 more)

### Community 1 - "q"
Cohesion: 0.05
Nodes (74): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+66 more)

### Community 2 - "BuilderTurnAdapter.ts"
Cohesion: 0.07
Nodes (16): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, Account, AccountProps, Email, COMMON_PASSWORDS (+8 more)

### Community 3 - "react"
Cohesion: 0.07
Nodes (43): createCatalogService(), allowedModels(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel() (+35 more)

### Community 4 - "bootstrap/server.ts"
Cohesion: 0.08
Nodes (54): Implementation plan document (`static/__dev/plan.md`), describeSchema, ScheduleTasksUseCase, rewardOf(), checkPlanDoc(), criteriaOf(), planOverview(), active (+46 more)

### Community 5 - "studioApi.ts"
Cohesion: 0.10
Nodes (52): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+44 more)

### Community 6 - "AgentExecution.ts"
Cohesion: 0.06
Nodes (50): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, listEmails, receiveEmail (+42 more)

### Community 7 - "projects/application/usecases.ts"
Cohesion: 0.06
Nodes (50): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KitEntry, BUILTIN_PACKAGES, Deps, isValidPackageName(), MANIFEST (+42 more)

### Community 8 - "ProjectView.tsx"
Cohesion: 0.06
Nodes (9): isDevFile(), ProjectsApplication, beforeImages(), restoredFiles(), turnFileChange(), TurnChanges, createProjectsModule(), ProjectsStore (+1 more)

### Community 9 - "ProjectsStore"
Cohesion: 0.07
Nodes (42): app, monolith, AgentExecutionResult, AgentResult, calculateSpendUseCase, toolRegistry, AgentSpec, runAgent() (+34 more)

### Community 10 - "database/index.ts"
Cohesion: 0.10
Nodes (45): anthropicChat(), createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass() (+37 more)

### Community 11 - "infrastructure/playground.ts"
Cohesion: 0.07
Nodes (39): ProjectEvent, ProjectLogLine, projectsController, transport, CreateProjectOptions, createProjectUseCases(), isProjectLogLine(), isProjectProblem() (+31 more)

### Community 12 - "app-runtime/index.ts"
Cohesion: 0.06
Nodes (31): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, createProblemService(), changed(), clearProblems() (+23 more)

### Community 13 - "FusionOrchestrator.ts"
Cohesion: 0.05
Nodes (33): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, AgentToolRole (+25 more)

### Community 14 - "http-client.ts"
Cohesion: 0.07
Nodes (25): CoreModulesDependencies, createCoreModules(), depsKey(), BcryptArgonPasswordHasher, NodeBootstrapCrypto, PlatformMailerService, PostgresLoginCodeRepository, PostgresSessionRepository (+17 more)

### Community 15 - "roles.ts"
Cohesion: 0.08
Nodes (39): ADMIN_MCP_INSTRUCTIONS, AdminMcpModules, createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists() (+31 more)

### Community 16 - "ProjectDb"
Cohesion: 0.08
Nodes (46): formatProblem(), pageRoutes(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle() (+38 more)

### Community 17 - "admission.ts"
Cohesion: 0.06
Nodes (28): AgentEvent, accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService() (+20 more)

### Community 18 - "FileMap"
Cohesion: 0.07
Nodes (25): api, billingController, Meter(), Plan(), Usage, createEvaluationUseCases(), createIdentityUseCases(), api (+17 more)

### Community 19 - "appServer.ts"
Cohesion: 0.07
Nodes (16): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, Cache (+8 more)

### Community 20 - "sandbox.ts"
Cohesion: 0.07
Nodes (26): ControlledService, RuntimeService, ServiceControlSnapshot, ServiceQueueEntry, ServiceReplica, ServiceRuntimeSnapshot, bindRuntimeObservation(), configureRuntimeProjects() (+18 more)

### Community 21 - "models.ts"
Cohesion: 0.08
Nodes (21): AiUnavailableError, createAi(), appAiChat(), AiBlock, AiContextMetrics, AiFusionTrace, AiUsage, AppAiInput (+13 more)

### Community 22 - "builderServer.ts"
Cohesion: 0.07
Nodes (27): ServiceExecution, checkProject, beginTransaction(), dispatch(), getSandboxServices(), ProjectSandbox, restartSandboxService(), Run (+19 more)

### Community 23 - "domain/contracts.ts"
Cohesion: 0.07
Nodes (38): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, memoryController (+30 more)

### Community 24 - "modules/collaboration/index.ts"
Cohesion: 0.10
Nodes (18): BuilderWorkflowUseCase, FastBuildUseCase, ReviewAndFixUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode (+10 more)

### Community 25 - "server/index.ts"
Cohesion: 0.09
Nodes (17): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, RuntimeProjectsPort, createPublication(), assertPublishable() (+9 more)

### Community 26 - "App.tsx"
Cohesion: 0.09
Nodes (22): pg, DEV_FIXTURE, Fixture, config, DEFAULT_MODELS_ALLOW, env, resolvePublicUrl(), ROOT_DIR (+14 more)

### Community 27 - "modules/builder/index.ts"
Cohesion: 0.07
Nodes (20): assertProjectObject(), assertSafeAgentSql(), objectName(), redactSqlData(), isSafeProjectPath(), assertOwnerRequestedForget(), assertOwnerSourcedMemory(), normalized() (+12 more)

### Community 28 - "ServicePanels.tsx"
Cohesion: 0.09
Nodes (18): ActiveRun, admission, AdmissionPorts, JudgeModel, MAX_JOBS, MAX_REPEATS, RunConfiguration, executeRun() (+10 more)

### Community 29 - "deps.ts"
Cohesion: 0.10
Nodes (27): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), speedFor(), tierFor() (+19 more)

### Community 30 - "modules/identity/index.ts"
Cohesion: 0.09
Nodes (16): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, Author, CheckpointProps, IProjectFileRepository, LogChangeInput, app (+8 more)

### Community 31 - "infrastructure/runner.ts"
Cohesion: 0.10
Nodes (27): createMonolith(), startBindings(), stopBindings(), createSecrets(), projectSecretEnv(), secretEnv(), bindJobs, SECRET_NAME (+19 more)

### Community 32 - "application/problems.ts"
Cohesion: 0.10
Nodes (26): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallEvent, Pwa() (+18 more)

### Community 33 - "modules/project-knowledge/index.ts"
Cohesion: 0.11
Nodes (25): createRouterAdministration(), routerStats(), creditsForUsd(), ExecutionContextMetrics, FUSION_BUDGETS, FusionBudget, FusionEffort, FusionPattern (+17 more)

### Community 34 - "BuilderToolsAdapter.ts"
Cohesion: 0.07
Nodes (39): dependencies, @anthropic-ai/sdk@^1.3.0, clsx@^2.1.1, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, hono@^4.13.14, @hono/node-server@^2.1.5 (+31 more)

### Community 35 - "with"
Cohesion: 0.09
Nodes (30): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+22 more)

### Community 36 - "projects/postgres.test.ts"
Cohesion: 0.09
Nodes (13): MemberQueries, OrganizationNamesQuery, OrganizationQueries, CollaborationModuleDependencies, createCollaborationModule(), IMemberQueries, InviteView, IOrganizationNameDirectory (+5 more)

### Community 37 - "builderService.ts"
Cohesion: 0.08
Nodes (11): PlatformRole, PostgresAccountLifecycleRepository, AccountRow, SessionAccountRow, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountLifecycleRepository (+3 more)

### Community 38 - "domain/score.ts"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 39 - "composition.ts"
Cohesion: 0.10
Nodes (18): createKnowledgeService(), KnowledgeEngine, KnowledgeFiles, prepareCorpus(), KnowledgeAnswer, KnowledgeEdge, KnowledgeGraph, KnowledgeNode (+10 more)

### Community 40 - "policies.test.ts"
Cohesion: 0.11
Nodes (5): AdminApiTokenError, IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 41 - "builder/contracts.ts"
Cohesion: 0.07
Nodes (21): startAppRuntimeEventRelay(), withDefaultHeaders(), app, handleAdminMcp, handleMcp, listening(), monolith, reactions (+13 more)

### Community 42 - "app-services/context.ts"
Cohesion: 0.10
Nodes (32): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS, JudgeDimension (+24 more)

### Community 43 - "createIdentityModule"
Cohesion: 0.11
Nodes (25): Catalog, createModelManagementQueries(), routerAudit(), updateProjectModels(), isMode(), createModelRouter(), pick(), bindModelAudit() (+17 more)

### Community 44 - "model-management/router.ts"
Cohesion: 0.06
Nodes (16): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+8 more)

### Community 45 - "modules/projects/index.ts"
Cohesion: 0.10
Nodes (13): CreateCheckpointUseCase, CreateProjectInput, CreateProjectUseCase, Checkpoint, ProjectSnapshot, parseStarterTemplate(), starterFiles(), StarterTemplate (+5 more)

### Community 46 - "domain/services.ts"
Cohesion: 0.11
Nodes (17): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+9 more)

### Community 47 - "domain/messages.ts"
Cohesion: 0.14
Nodes (24): page(), GATE_FIXES, summarize(), addUsage(), AgentExecutionSpec, emptyUsage(), applySummary(), blockTokens() (+16 more)

### Community 48 - "model-management/index.ts"
Cohesion: 0.12
Nodes (26): createProjectCheck(), ProjectCompilerPort, createServiceControl(), restart(), scale(), snapshot(), EndpointInfo, endpointRoutes() (+18 more)

### Community 49 - "infrastructure/routing.ts"
Cohesion: 0.08
Nodes (7): PostgresApiTokenRepository, AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository, IdentityRandom, PasswordResetRepository

### Community 50 - "PostgresProjectsStore"
Cohesion: 0.12
Nodes (10): @electric-sql/pglite, AppDataPorts, createAppDataService(), TransactionSession, SqlExecutionResult, TransactionAction, createProjectRowsRepository(), createAuthRepository() (+2 more)

### Community 51 - "IOrganizationRepository"
Cohesion: 0.10
Nodes (14): createEmail(), sendEmail(), sendPlatformEmail(), createStorage(), putObject(), MAX_PROJECT_STORAGE_BYTES, StorageLimitError, StoredObject (+6 more)

### Community 52 - "application/context.ts"
Cohesion: 0.11
Nodes (15): RunAgentUseCase, Block, BuilderContextMetrics, BuilderFusionStep, BuilderFusionTrace, ContextAuditEvent, ExecutionContext, ExecutionTool (+7 more)

### Community 53 - "dependencies"
Cohesion: 0.14
Nodes (7): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, OrgRole, IOrganizationRepository

### Community 54 - "SqlAgentTaskRepository.ts"
Cohesion: 0.09
Nodes (6): PostgresMemberRepository, PostgresOrganizationRepository, PostgresOrganizationSkillsRepository, OrganizationRecord, PostgresPasswordResetRepository, q()

### Community 56 - "Plan.ts"
Cohesion: 0.11
Nodes (21): CheckPlanUseCase, reviewFixTasks(), checkContract(), CONTRACT_FILE, contractRoutes(), covers(), MAX_CONTRACT, MAX_GOAL (+13 more)

### Community 57 - "ref_node_fs"
Cohesion: 0.10
Nodes (11): RunTaskLaneUseCase, TaskLifecycleUseCase, ExecutionModel, requiresFinishGate(), AgentTaskRepository, LaneTask, TaskLaneHooks, TaskLanePorts (+3 more)

### Community 58 - "app-services/auth.ts"
Cohesion: 0.10
Nodes (15): AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts, resolveApp() (+7 more)

### Community 59 - "execution-audit/index.ts"
Cohesion: 0.16
Nodes (24): sessionCookie(), endSession, testSession, EvalError, RunRequest, EVAL_EMAIL, spentLast24h(), defaultJudge() (+16 more)

### Community 60 - "Project"
Cohesion: 0.14
Nodes (25): removeProjectData, removeProjectData(), runBudget(), designSignals, ensureEvalAccount(), sweepEvalProjects(), evaluationBuilder(), evaluationResources() (+17 more)

### Community 61 - "projectIndex.ts"
Cohesion: 0.09
Nodes (16): app, DATA, app, DATA, MODELS, ROOT, SEED, MODELS (+8 more)

### Community 62 - "appRuntimeServer.ts"
Cohesion: 0.13
Nodes (23): lifecycle, lifecycle, stopRuntimeEventRelay(), lifecycle, monolith, server, lifecycle, seedLocal (+15 more)

### Community 63 - "BootstrapService"
Cohesion: 0.15
Nodes (22): cloneDatabase(), closeAll(), closeProject(), dumpDatabase(), execSql(), get(), isAwake(), metricsFor() (+14 more)

### Community 64 - "bundler.ts"
Cohesion: 0.11
Nodes (16): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, createTestCoreModules(), drop(), freshDatabase(), TEST_DATABASE_URL, dataDir, pool (+8 more)

### Community 65 - "OrganizationSkillsService.ts"
Cohesion: 0.09
Nodes (15): vite, studioPwa(), here, blobId(), sha1(), startFakeGithub(), app, DATA (+7 more)

### Community 66 - "package.json"
Cohesion: 0.13
Nodes (18): BUILDER_SYSTEM_PROMPT, AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO (+10 more)

### Community 67 - "IPersonalOrganizationRepository"
Cohesion: 0.13
Nodes (21): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+13 more)

### Community 68 - "ProviderService.ts"
Cohesion: 0.10
Nodes (6): Project, ProjectProps, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 69 - "github.mjs"
Cohesion: 0.13
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 70 - "model-management/catalog.ts"
Cohesion: 0.11
Nodes (19): playwright-core@1.64.1, playwright-core, assertPublic(), fetchPublicText(), isPrivate(), ADMIN, assert(), cleanup() (+11 more)

### Community 71 - "createJobs"
Cohesion: 0.10
Nodes (10): AppUser, createProjectCache(), createContext(), serviceContext(), EndpointContext, enqueue(), HttpError, publish() (+2 more)

### Community 72 - "FinishGatePolicy.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 73 - "Account"
Cohesion: 0.13
Nodes (8): CACHE_LIMITS, ProjectCache, ClaimedJob, AppEnv, createProjectCacheRepository(), PROJECT_CACHE_SCHEMA, CacheRepository, JobsApi

### Community 74 - "FusionPolicy.ts"
Cohesion: 0.09
Nodes (5): EmailInput, AuthPorts, AuthRepository, QueryRepository, StoragePorts

### Community 75 - "settings/index.ts"
Cohesion: 0.15
Nodes (6): PersonalOrganizationUseCase, Organization, OrganizationProps, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 76 - "platform.ts"
Cohesion: 0.14
Nodes (22): 3. Proveedores y modelos, `llm/catalog.ts`, Pruebas de conexión, Tablas (`002_admin.sql`), tasks, availableModels(), catalog(), createPlatformCatalogService() (+14 more)

### Community 77 - "Panel de administración del sistema — diseño"
Cohesion: 0.19
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 78 - "index.tsx"
Cohesion: 0.16
Nodes (18): hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups (+10 more)

### Community 79 - "createCollaborationModule"
Cohesion: 0.16
Nodes (19): createJobs(), addTimer(), enqueueJob(), executeJob(), fireDueTimers(), initializeAppServices(), report(), runJob() (+11 more)

### Community 80 - "OrgRole"
Cohesion: 0.14
Nodes (7): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, RemoveMemberUseCase, Access, MemberAccess, IMemberRepository

### Community 81 - "PlatformSettingsService"
Cohesion: 0.12
Nodes (13): KEYWORDS, RoleProfile, ROLES, Effort, AnalysisContext, Candidate, DecisionLog, Domain (+5 more)

### Community 82 - "adminApi.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 83 - "memory/application/service.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 84 - "agents.mjs"
Cohesion: 0.18
Nodes (18): 6. API de administración, providerOf(), ollamaBaseUrl(), ollamaChat(), OllamaMessage, call(), ECHO_TOOL, errorOf() (+10 more)

### Community 85 - "client.ts"
Cohesion: 0.10
Nodes (15): buildServer(), CONTEXT_TOOLS, DESTRUCTIVE, expectedVersionProp, extraTools, Hints, hintsOf(), McpModules (+7 more)

### Community 86 - "urls.ts"
Cohesion: 0.13
Nodes (9): InviteMemberResult, InviteMemberUseCase, ProjectTarget, ProjectInvite, ProjectInviteProps, PostgresCollaborationAccountRepository, CollaborationAccount, ICollaborationAccountRepository (+1 more)

### Community 87 - "BuilderWorkflow.ts"
Cohesion: 0.19
Nodes (12): BeforeImage, ChangeEntry, normalizeProjectProfile(), ProjectPatch, ProjectProfile, SeoSettings, TurnFileChange, ordersInvoicesFiles() (+4 more)

### Community 88 - "scripts"
Cohesion: 0.19
Nodes (15): sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card(), EmptyState() (+7 more)

### Community 89 - "client/index.ts"
Cohesion: 0.11
Nodes (6): vitest, { KIT_BUILTIN }, root, sources(), files(), scopes

### Community 90 - "createProjectRows"
Cohesion: 0.20
Nodes (16): PlatformSettingType, SettingGroup, MOVED_ENV, createPlatformSettings(), byKey, Def, defs, getPath() (+8 more)

### Community 91 - "IPasswordHasher"
Cohesion: 0.20
Nodes (8): Task 2: Registro y almacén de ajustes, PlatformSettingsService, SettingDef, SettingsError, SettingView, SettingsDependencies, fixture(), fixture()

### Community 92 - "model-management/providers.ts"
Cohesion: 0.15
Nodes (14): react-dom@^19.3.1, react-dom, serviceControlController, transport, Actions, failed(), Filter, KIND_LABEL (+6 more)

### Community 93 - "starterTemplate.test.ts"
Cohesion: 0.19
Nodes (6): BootstrapService, SetupError, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 94 - "mcp/server.ts"
Cohesion: 0.14
Nodes (18): accountStatus, connectAccount, createRepo, disconnectAccount, getLink, handleWebhook, linkRepo, oauthFinish (+10 more)

### Community 95 - "AppEnv"
Cohesion: 0.12
Nodes (16): validateToolInput(), author, features, gemini, gpt, reply(), req, review() (+8 more)

### Community 96 - "BuilderWorkflowPorts"
Cohesion: 0.10
Nodes (20): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+12 more)

### Community 97 - "PostgresRouterAdministrationRepository.ts"
Cohesion: 0.15
Nodes (10): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError (+2 more)

### Community 98 - "SettingDefinition"
Cohesion: 0.15
Nodes (8): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, countAction, mocks

### Community 99 - "Changes.tsx"
Cohesion: 0.11
Nodes (15): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 3: Proveedores y modelos en BD + seeders, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final (+7 more)

### Community 100 - "Desplegar Forja en Coolify"
Cohesion: 0.16
Nodes (7): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository

### Community 101 - "infrastructure/probe.ts"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

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
Cohesion: 0.24
Nodes (6): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry, ISettingsStore

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

### Community 115 - "mcp/jobs.ts"
Cohesion: 0.18
Nodes (12): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), readGuides() (+4 more)

### Community 116 - "createSecrets"
Cohesion: 0.16
Nodes (11): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+3 more)

### Community 117 - "AuthPorts"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 118 - "integrations/github.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 119 - "studio.mjs"
Cohesion: 0.20
Nodes (9): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays(), analyticsPorts (+1 more)

### Community 120 - "http.test.ts"
Cohesion: 0.17
Nodes (11): analyzeHeuristic(), analyzeRequest(), useFastPath(), posteriors, gamma(), gaussian(), Posterior, prior() (+3 more)

### Community 121 - "PostgresProjectFileRepository"
Cohesion: 0.25
Nodes (8): createTurnFeedback(), penalizeTurn(), feedbackModel(), TurnModelDecision, postgresTurnFeedback, TurnFeedbackPorts, TurnFeedbackRepository, database

### Community 122 - "usage/usage.ts"
Cohesion: 0.21
Nodes (10): appHeaders(), clientIp(), createRateLimiter(), RateLimitError, RateLimitQuery, RateLimitStoreError, startRateLimitCleanup(), stopRateLimitCleanup() (+2 more)

### Community 123 - "Audit.tsx"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 124 - "Evals.tsx"
Cohesion: 0.25
Nodes (11): api, modelsController, AccountModels(), ModelChecklist(), ModelRow, MODES, price(), ProjectModels() (+3 more)

### Community 125 - "Memory.tsx"
Cohesion: 0.23
Nodes (11): [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed(), createLocalSeed(), readSeedFile() (+3 more)

### Community 126 - "models/presentation/Models.tsx"
Cohesion: 0.18
Nodes (8): PlatformCollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository, sendInvitation

### Community 127 - "projectMicroservices.test.ts"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 128 - "vitest"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 129 - "adminServer.ts"
Cohesion: 0.24
Nodes (7): connectAccount(), GithubError, Link, SyncResult, gh(), tokenFor(), setup()

### Community 130 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.20
Nodes (3): createGithubAccountService(), GithubAccountRepository, setup()

### Community 131 - "AccountLifecycleRepository"
Cohesion: 0.30
Nodes (11): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+3 more)

### Community 132 - "services"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 133 - "GithubGateway"
Cohesion: 0.22
Nodes (10): 10. Documentación, 2. Ajustes globales, 4. Playground de agentes, 5. Enrutador, 7. Studio, 8. Errores y seguridad, Almacén, Panel de administración del sistema — diseño (+2 more)

### Community 134 - "createAdminMcpHandler"
Cohesion: 0.22
Nodes (5): clip(), normalize(), parseSpringOutput(), SpringBuildTool, SpringProject

### Community 135 - "deps.test.ts"
Cohesion: 0.24
Nodes (4): DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket, publish

### Community 137 - "GithubAccountRepository"
Cohesion: 0.25
Nodes (4): AdmissionState, planRun(), startEvaluation(), fixture()

### Community 138 - "createGithubSyncService"
Cohesion: 0.29
Nodes (8): buildGraphView(), GraphCard, GraphConnection, GraphEdge, GraphNode, GraphQuestion, ProjectGraph, ProjectKnowledge()

### Community 139 - "services"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 140 - "Review Focus"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 141 - "e2e.mjs"
Cohesion: 0.20
Nodes (10): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+2 more)

### Community 145 - "ProjectDbClient"
Cohesion: 0.22
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 146 - "accounts.ts"
Cohesion: 0.25
Nodes (4): { apiUrl }, ApiError, createHttp(), HttpTransport

### Community 147 - "PostgresCatalogRepository.ts"
Cohesion: 0.22
Nodes (7): createMcpHandler(), CollaborationModule, account, collaboration, handleMcp, identity, projects

### Community 151 - "settingReactions.ts"
Cohesion: 0.46
Nodes (8): build, BROWSER, args, context, dockerfile, build, build, build

### Community 152 - "BuilderRunRegistry"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 153 - "Plan"
Cohesion: 0.25
Nodes (5): Barra lateral del panel, Inventario de interfaz de Floot → Forja, Panel de proyectos, Services (tres columnas: servicios · lista · detalle; los usados primero, el resto atenuado), Vista de proyecto

### Community 154 - ".execute"
Cohesion: 0.25
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 155 - "ref_node_path"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 156 - "guides.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 160 - "app-runtime"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 161 - "One project: orders API and durable invoice worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 162 - "forms.tsx"
Cohesion: 0.29
Nodes (7): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, ctx(), usage()

### Community 163 - "apiTypes.test.ts"
Cohesion: 0.48
Nodes (6): createJobQueue(), poll(), processJob(), pump(), start(), stop()

### Community 166 - "GithubProjectPorts"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 167 - "ProjectEvent"
Cohesion: 0.33
Nodes (6): 1. Capa de datos, Conexión, `.env` resultante, Infraestructura, Migraciones, Seeders

### Community 169 - "job-worker"
Cohesion: 0.67
Nodes (3): audit(), postgresModelAudit(), ModelAudit

### Community 170 - "ports/storage.ts"
Cohesion: 0.33
Nodes (4): calls, model, recordContextEvent, usage

### Community 171 - "FastBuildPorts"
Cohesion: 0.50
Nodes (3): motion@^14.9.0, motion, FadeIn()

### Community 174 - "Cómo está hecho"
Cohesion: 0.67
Nodes (3): Decisiones tomadas con el usuario, Fuera de alcance, Objetivo

## Knowledge Gaps
- **14 isolated node(s):** `{ api, auth, storage, ai }`, `{ BuildError, buildClient, buildExamples, checkProject, compileServerModule, endpointRoutes, pageRoutes, exampleFiles, jobFiles, readJobSettings, formatProblem }`, `{ BUILTIN_PACKAGES, MANIFEST, readDeps, writeDeps, isValidPackageName, packageName, isNodeBuiltin, depsDir, ensureDeps, resolvePackage, withManifestLock }`, `{ publishProject, unpublishProject }`, `{ quickScan, findSecret, formatFinding }` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1359 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `client/index.ts` to `Chat.tsx`, `q`, `BuilderTurnAdapter.ts`, `react`, `ProjectView.tsx`, `ProjectsStore`, `database/index.ts`, `infrastructure/playground.ts`, `app-runtime/index.ts`, `FusionOrchestrator.ts`, `http-client.ts`, `roles.ts`, `admission.ts`, `FileMap`, `appServer.ts`, `sandbox.ts`, `builderServer.ts`, `modules/collaboration/index.ts`, `server/index.ts`, `App.tsx`, `modules/builder/index.ts`, `ServicePanels.tsx`, `deps.ts`, `modules/identity/index.ts`, `infrastructure/runner.ts`, `modules/project-knowledge/index.ts`, `BuilderToolsAdapter.ts`, `projects/postgres.test.ts`, `composition.ts`, `policies.test.ts`, `builder/contracts.ts`, `app-services/context.ts`, `createIdentityModule`, `model-management/router.ts`, `modules/projects/index.ts`, `domain/services.ts`, `domain/messages.ts`, `model-management/index.ts`, `PostgresProjectsStore`, `IOrganizationRepository`, `application/context.ts`, `dependencies`, `Plan.ts`, `ref_node_fs`, `projectIndex.ts`, `bundler.ts`, `package.json`, `github.mjs`, `model-management/catalog.ts`, `FinishGatePolicy.ts`, `Account`, `Panel de administración del sistema — diseño`, `index.tsx`, `OrgRole`, `adminApi.ts`, `agents.mjs`, `urls.ts`, `IPasswordHasher`, `model-management/providers.ts`, `starterTemplate.test.ts`, `mcp/server.ts`, `AppEnv`, `SettingDefinition`, `Changes.tsx`, `Desplegar Forja en Coolify`, `infrastructure/probe.ts`, `compilerOptions`, `sandboxWorker.mjs`, `Inventario de funciones de Lovable → Forja`, `Tx`, `mcp/jobs.ts`, `createSecrets`, `AuthPorts`, `integrations/github.ts`, `http.test.ts`, `PostgresProjectFileRepository`, `usage/usage.ts`, `Audit.tsx`, `models/presentation/Models.tsx`, `adminServer.ts`, `collaboration/postgresAdapters.test.ts`, `accounts.ts`, `PostgresCatalogRepository.ts`, `postgres`, `guides.ts`, `transports/mcp.test.ts`, `ports/storage.ts`?**
  _High betweenness centrality (0.337) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `{ api, auth, storage, ai }`, `{ BuildError, buildClient, buildExamples, checkProject, compileServerModule, endpointRoutes, pageRoutes, exampleFiles, jobFiles, readJobSettings, formatProblem }`, `{ BUILTIN_PACKAGES, MANIFEST, readDeps, writeDeps, isValidPackageName, packageName, isNodeBuiltin, depsDir, ensureDeps, resolvePackage, withManifestLock }` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05852842809364549 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Chat.tsx` to `application/problems.ts`, `q`, `BuilderToolsAdapter.ts`, `studioApi.ts`, `internal/router.ts`, `ISettingsStore`, `integrations/index.ts`, `createGithubSyncService`, `FastBuildPorts`, `Audit.tsx`, `infrastructure/playground.ts`, `Inventario de funciones de Lovable → Forja`, `model-management/providers.ts`, `FileMap`, `domain/contracts.ts`, `scripts`, `ref_node_path`, `Evals.tsx`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `q` be split into smaller, more focused modules?**
  _Cohesion score 0.04597701149425287 - nodes in this community are weakly interconnected._