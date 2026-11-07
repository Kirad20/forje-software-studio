# Graph Report - pr-integration  (2026-11-06)

## Corpus Check
- 700 files · ~323,808 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: .css 6, (none) 5, .example 1)

## Summary
- 4642 nodes · 12217 edges · 186 communities (152 shown, 34 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 630 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `067ce230`
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
- builderServer.ts
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
- app-runtime/index.ts
- models.ts
- app-runtime/services.test.ts
- domain/contracts.ts
- modules/collaboration/index.ts
- server/index.ts
- config.ts
- modules/builder/index.ts
- ServicePanels.tsx
- deps.ts
- modules/identity/index.ts
- composition.ts
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
- ProjectsApplication.ts
- domain/services.ts
- domain/messages.ts
- model-management/index.ts
- infrastructure/routing.ts
- PostgresProjectsStore
- policies.test.ts
- application/context.ts
- dependencies
- SqlAgentTaskRepository.ts
- skills.test.ts
- Plan.ts
- ref_node_fs
- app-services/auth.ts
- execution-audit/index.ts
- roles.ts
- agents.mjs
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
- AuthPorts
- settings/index.ts
- platform.ts
- Panel de administración del sistema — diseño
- index.tsx
- createCollaborationModule
- OrgRole
- ModelRouterPorts
- adminApi.ts
- memory/application/service.ts
- agents.mjs
- mcp/server.ts
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
- infrastructure/repositories.ts
- createSecrets
- AuthPorts
- adminServer.ts
- Dashboard.tsx
- domain/routing.ts
- PostgresProjectFileRepository
- database/index.ts
- Audit.tsx
- infrastructure/openaiCompat.ts
- ProjectSandbox
- models/presentation/Models.tsx
- projectMicroservices.test.ts
- vitest
- adminServer.ts
- collaboration/postgresAdapters.test.ts
- AccountLifecycleRepository
- services
- Panel de administración del sistema — diseño
- createAdminMcpHandler
- deps.test.ts
- ProjectServices
- Memory.tsx
- createGithubSyncService
- services
- Review Focus
- Desplegar Forja en Coolify
- cli.ts
- app-services/context.ts
- createCollaborationModule
- ProjectDbClient
- ApiError
- http.test.ts
- Account
- Evals.tsx
- healthcheck
- settingReactions.ts
- BuilderRunRegistry
- ProjectSnapshot
- .execute
- safeFetch.ts
- guides.ts
- ProjectPath
- Plan.tsx
- JobCron
- app-runtime
- One project: orders API and durable invoice worker
- IdentityRandom
- transports/mcp.test.ts
- GithubAuthorization
- GithubProjectPorts
- identity/boundaries.test.ts
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
- `Cómo está hecho` --references--> `ctx()`  [INFERRED]
  README.md → test/unit/gate.test.ts
- `Cómo está hecho` --references--> `useApi()`  [INFERRED]
  README.md → sdk/client/internal/hooks.ts

## Import Cycles
- None detected.

## Communities (186 total, 34 thin omitted)

### Community 0 - "Chat.tsx"
Cohesion: 0.07
Nodes (57): lucide-react, radix-ui, react, administrationController, api, modelBlockers(), ModelReadiness, playgroundModel() (+49 more)

### Community 1 - "q"
Cohesion: 0.05
Nodes (73): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+65 more)

### Community 2 - "BuilderTurnAdapter.ts"
Cohesion: 0.09
Nodes (11): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, IdentityModuleDependencies, IdentityAccountsDependencies, IAccountRepository, ILoginCodeRepository (+3 more)

### Community 3 - "react"
Cohesion: 0.09
Nodes (31): createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), ClassifiedProviderModel (+23 more)

### Community 4 - "bootstrap/server.ts"
Cohesion: 0.07
Nodes (55): Implementation plan document (`static/__dev/plan.md`), describeSchema, ScheduleTasksUseCase, rewardOf(), checkPlanDoc(), criteriaOf(), planOverview(), runAgent() (+47 more)

### Community 5 - "studioApi.ts"
Cohesion: 0.11
Nodes (47): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+39 more)

### Community 6 - "AgentExecution.ts"
Cohesion: 0.06
Nodes (63): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, listEmails, receiveEmail (+55 more)

### Community 7 - "projects/application/usecases.ts"
Cohesion: 0.08
Nodes (36): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KitEntry, BUILTIN_PACKAGES, Deps, isValidPackageName(), MANIFEST (+28 more)

### Community 8 - "ProjectView.tsx"
Cohesion: 0.07
Nodes (6): isDevFile(), ProjectsApplication, BeforeImage, createProjectsModule(), ProjectsStore, fixture()

### Community 9 - "builderServer.ts"
Cohesion: 0.19
Nodes (14): startAppRuntimeEventRelay(), app, lifecycle, monolith, stopRuntimeEventRelay(), lifecycle, seedLocal, stopRuntimeEventRelay() (+6 more)

### Community 10 - "database/index.ts"
Cohesion: 0.17
Nodes (29): anthropicChat(), createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass() (+21 more)

### Community 11 - "infrastructure/playground.ts"
Cohesion: 0.08
Nodes (26): ProjectEvent, ProjectLogLine, projectsController, transport, CreateProjectOptions, createProjectUseCases(), isProjectLogLine(), isProjectProblem() (+18 more)

### Community 12 - "app-runtime/index.ts"
Cohesion: 0.09
Nodes (16): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, locate(), Problem, ProblemEffects (+8 more)

### Community 13 - "FusionOrchestrator.ts"
Cohesion: 0.10
Nodes (11): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, ROLE_TOOLS (+3 more)

### Community 14 - "http-client.ts"
Cohesion: 0.11
Nodes (17): createCoreModules(), BcryptArgonPasswordHasher, NodeBootstrapCrypto, PlatformMailerService, PostgresSessionRepository, burnPasswordCheck(), hashPassword(), LEGACY (+9 more)

### Community 15 - "roles.ts"
Cohesion: 0.18
Nodes (16): auditWindow(), ExecutionAudit, identifier(), AuditContext, AuditFilter, AuditReport, AuditStage, AuditStep (+8 more)

### Community 16 - "ProjectDb"
Cohesion: 0.08
Nodes (52): formatProblem(), pageRoutes(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle() (+44 more)

### Community 17 - "admission.ts"
Cohesion: 0.05
Nodes (36): GATE_FIXES, AgentResult, calculateSpendUseCase, toolRegistry, accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber (+28 more)

### Community 18 - "FileMap"
Cohesion: 0.08
Nodes (22): api, billingController, Meter(), Plan(), Usage, createEvaluationUseCases(), createIdentityUseCases(), api (+14 more)

### Community 19 - "appServer.ts"
Cohesion: 0.08
Nodes (15): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, Cache (+7 more)

### Community 20 - "app-runtime/index.ts"
Cohesion: 0.06
Nodes (41): playwright-core@1.64.1, playwright-core, RuntimeProjectsPort, ProjectService, ProjectServices, ServiceExecution, bindRuntimeObservation(), configureRuntimeProjects() (+33 more)

### Community 21 - "models.ts"
Cohesion: 0.07
Nodes (20): AiBlock, AiContextMetrics, AiFusionTrace, AiUsage, AppAiInput, AppAiResult, AppUser, CheckoutInput (+12 more)

### Community 22 - "app-runtime/services.test.ts"
Cohesion: 0.09
Nodes (20): ControlledService, RuntimeService, ServiceControlSnapshot, ServiceQueueEntry, ServiceReplica, ServiceRuntimeSnapshot, checkProject, getSandboxServices() (+12 more)

### Community 23 - "domain/contracts.ts"
Cohesion: 0.08
Nodes (37): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, modelsController (+29 more)

### Community 24 - "modules/collaboration/index.ts"
Cohesion: 0.10
Nodes (19): BuilderWorkflowUseCase, FastBuildUseCase, ReviewAndFixUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode (+11 more)

### Community 25 - "server/index.ts"
Cohesion: 0.11
Nodes (17): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, createPublication(), assertPublishable(), Author (+9 more)

### Community 26 - "config.ts"
Cohesion: 0.11
Nodes (17): vite, DEV_FIXTURE, Fixture, beginTransaction(), dispatch(), sandboxes, WORKER, DEFAULT_MODELS_ALLOW (+9 more)

### Community 27 - "modules/builder/index.ts"
Cohesion: 0.07
Nodes (24): assertProjectObject(), assertSafeAgentSql(), assertSafePreviewSql(), containsDataChange(), containsSchemaChange(), objectName(), redactSqlData(), isMigrationPath() (+16 more)

### Community 28 - "ServicePanels.tsx"
Cohesion: 0.07
Nodes (21): ActiveRun, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun(), runBudget() (+13 more)

### Community 29 - "deps.ts"
Cohesion: 0.09
Nodes (31): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), speedFor(), tierFor() (+23 more)

### Community 30 - "modules/identity/index.ts"
Cohesion: 0.09
Nodes (14): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, ProjectPath, IProjectFileRepository, app, database, pool (+6 more)

### Community 31 - "composition.ts"
Cohesion: 0.17
Nodes (20): createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureAppServiceObserver(), initializeAppServices, bindEvaluationBuilder(), bindEvaluationResources() (+12 more)

### Community 32 - "application/problems.ts"
Cohesion: 0.10
Nodes (29): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallEvent, Pwa() (+21 more)

### Community 33 - "modules/project-knowledge/index.ts"
Cohesion: 0.09
Nodes (33): useFastPath(), createRouterAdministration(), routerStats(), posteriors, gamma(), gaussian(), meanOf(), Posterior (+25 more)

### Community 34 - "BuilderToolsAdapter.ts"
Cohesion: 0.06
Nodes (42): dependencies, @anthropic-ai/sdk@^1.3.0, clsx@^2.1.1, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, @hono/node-server@^2.1.5, lucide-react@^1.66.0 (+34 more)

### Community 35 - "with"
Cohesion: 0.17
Nodes (13): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+5 more)

### Community 36 - "projects/postgres.test.ts"
Cohesion: 0.12
Nodes (9): OrganizationNamesQuery, OrganizationQueries, InviteView, IOrganizationNameDirectory, IOrganizationQueries, MemberView, Org, OrgMemberView (+1 more)

### Community 37 - "builderService.ts"
Cohesion: 0.08
Nodes (10): PlatformRole, PostgresAccountLifecycleRepository, AccountRow, SessionAccountRow, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountLifecycleRepository (+2 more)

### Community 38 - "domain/score.ts"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 39 - "composition.ts"
Cohesion: 0.10
Nodes (19): createKnowledgeService(), KnowledgeEngine, KnowledgeFiles, prepareCorpus(), KnowledgeAnswer, KnowledgeEdge, KnowledgeGraph, KnowledgeNode (+11 more)

### Community 40 - "policies.test.ts"
Cohesion: 0.10
Nodes (7): AdminApiTokenError, IdentityAccountsService, COMMON_PASSWORDS, Password, createIdentityModule(), PublicAccount, fixture()

### Community 41 - "builder/contracts.ts"
Cohesion: 0.06
Nodes (27): withDefaultHeaders(), app, handleAdminMcp, handleMcp, listening(), monolith, reactions, resolveApp() (+19 more)

### Community 42 - "app-services/context.ts"
Cohesion: 0.10
Nodes (32): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS, JudgeDimension (+24 more)

### Community 43 - "createIdentityModule"
Cohesion: 0.11
Nodes (25): Catalog, createModelManagementQueries(), routerAudit(), updateProjectModels(), isMode(), taskClassOf(), audit(), bindModelAudit() (+17 more)

### Community 44 - "model-management/router.ts"
Cohesion: 0.06
Nodes (17): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+9 more)

### Community 45 - "ProjectsApplication.ts"
Cohesion: 0.18
Nodes (11): CreateCheckpointUseCase, CreateProjectInput, Author, beforeImages(), restoredFiles(), turnFileChange(), Checkpoint, CheckpointProps (+3 more)

### Community 46 - "domain/services.ts"
Cohesion: 0.10
Nodes (20): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+12 more)

### Community 47 - "domain/messages.ts"
Cohesion: 0.17
Nodes (20): page(), summarize(), applySummary(), blockTokens(), callLabel(), estimateTokens(), hasResults(), KEEP_RECENT_RESULTS (+12 more)

### Community 48 - "model-management/index.ts"
Cohesion: 0.11
Nodes (31): createProjectCheck(), ProjectCompilerPort, createServiceControl(), restart(), scale(), snapshot(), EndpointInfo, endpointRoutes() (+23 more)

### Community 49 - "infrastructure/routing.ts"
Cohesion: 0.14
Nodes (5): PostgresApiTokenRepository, AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository

### Community 50 - "PostgresProjectsStore"
Cohesion: 0.11
Nodes (11): @electric-sql/pglite, ClaimedJob, AppEnv, AppDataPorts, createAppDataService(), TransactionSession, ProjectMigration, ProjectDbClient (+3 more)

### Community 51 - "policies.test.ts"
Cohesion: 0.06
Nodes (27): recordPageView, visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), createEmail() (+19 more)

### Community 52 - "application/context.ts"
Cohesion: 0.10
Nodes (19): RunAgentUseCase, addUsage(), AgentExecutionSpec, Block, BuilderContextMetrics, BuilderFusionStep, BuilderFusionTrace, ContextAuditEvent (+11 more)

### Community 53 - "dependencies"
Cohesion: 0.13
Nodes (8): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, OrgRole, ICollaborationAccountRepository, IOrganizationRepository

### Community 54 - "SqlAgentTaskRepository.ts"
Cohesion: 0.06
Nodes (9): PostgresMemberRepository, PostgresOrganizationRepository, PostgresOrganizationSkillsRepository, PostgresLoginCodeRepository, PostgresPasswordResetRepository, PasswordResetRepository, modelHealth(), recordModelHealth() (+1 more)

### Community 56 - "Plan.ts"
Cohesion: 0.10
Nodes (19): CheckPlanUseCase, checkContract(), CONTRACT_FILE, covers(), MAX_CONTRACT, MAX_GOAL, MAX_PLAN_DOC, MAX_TASKS (+11 more)

### Community 57 - "ref_node_fs"
Cohesion: 0.11
Nodes (13): RunTaskLaneUseCase, TaskLifecycleUseCase, AgentEvent, AgentExecutionResult, requiresFinishGate(), AgentTask, AgentTaskRepository, LaneTask (+5 more)

### Community 58 - "app-services/auth.ts"
Cohesion: 0.09
Nodes (17): @hono/node-server, ws, AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest() (+9 more)

### Community 59 - "execution-audit/index.ts"
Cohesion: 0.11
Nodes (39): removeProjectData, removeProjectData(), sessionCookie(), endSession, testSession, EvalError, RunRequest, recoverRuns() (+31 more)

### Community 60 - "roles.ts"
Cohesion: 0.07
Nodes (25): PLAN_DOC, PLAN_SECTIONS, AgentToolRole, allowedToolsForRole(), assertRoleToolAccess(), BACKEND, CHECKLIST, CONTRACT (+17 more)

### Community 61 - "agents.mjs"
Cohesion: 0.25
Nodes (5): app, DATA, MODELS, ROOT, SEED

### Community 62 - "appRuntimeServer.ts"
Cohesion: 0.09
Nodes (27): Conexión, lifecycle, [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed() (+19 more)

### Community 63 - "BootstrapService"
Cohesion: 0.15
Nodes (30): applyProjectMigrations(), applyProjectMigrationsLocal(), assertRuntimeSql(), checksum(), cloneDatabase(), closeAll(), closeProject(), databasePath() (+22 more)

### Community 64 - "bundler.ts"
Cohesion: 0.09
Nodes (25): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, vitest, migrate(), createTestCoreModules(), drop(), freshDatabase() (+17 more)

### Community 65 - "OrganizationSkillsService.ts"
Cohesion: 0.10
Nodes (12): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED (+4 more)

### Community 66 - "package.json"
Cohesion: 0.13
Nodes (18): BUILDER_SYSTEM_PROMPT, AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO (+10 more)

### Community 67 - "IPersonalOrganizationRepository"
Cohesion: 0.13
Nodes (21): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+13 more)

### Community 68 - "ProviderService.ts"
Cohesion: 0.11
Nodes (7): Project, ProjectProps, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository, LogChangeInput

### Community 69 - "github.mjs"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 70 - "model-management/catalog.ts"
Cohesion: 0.12
Nodes (24): app, DATA, MODELS, ROOT, SEED, call(), log, reply() (+16 more)

### Community 71 - "createJobs"
Cohesion: 0.09
Nodes (12): Run, AppUser, createProjectCache(), createContext(), serviceContext(), EndpointContext, enqueue(), HttpError (+4 more)

### Community 72 - "FinishGatePolicy.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 73 - "Account"
Cohesion: 0.16
Nodes (5): CACHE_LIMITS, ProjectCache, createProjectCacheRepository(), PROJECT_CACHE_SCHEMA, CacheRepository

### Community 75 - "settings/index.ts"
Cohesion: 0.14
Nodes (7): PersonalOrganizationUseCase, Organization, OrganizationProps, CollaborationModuleDependencies, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 76 - "platform.ts"
Cohesion: 0.13
Nodes (23): Task 3: Proveedores y modelos en BD + seeders, 3. Proveedores y modelos, `llm/catalog.ts`, Pruebas de conexión, Tablas (`002_admin.sql`), createLocalSeed(), readSeedFile(), SeedFile (+15 more)

### Community 77 - "Panel de administración del sistema — diseño"
Cohesion: 0.18
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 78 - "index.tsx"
Cohesion: 0.09
Nodes (36): hono@^4.13.14, hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv (+28 more)

### Community 79 - "createCollaborationModule"
Cohesion: 0.12
Nodes (25): createJobQueue(), poll(), processJob(), pump(), start(), stop(), createJobs(), addTimer() (+17 more)

### Community 80 - "OrgRole"
Cohesion: 0.15
Nodes (7): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, RemoveMemberUseCase, Access, MemberAccess, IMemberRepository

### Community 81 - "ModelRouterPorts"
Cohesion: 0.16
Nodes (7): AgentSpec, ModelScope, Billing, DecisionLog, Pick, Role, ModelRouterPorts

### Community 82 - "adminApi.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 83 - "memory/application/service.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 84 - "agents.mjs"
Cohesion: 0.23
Nodes (15): providerOf(), providers(), call(), ECHO_TOOL, errorOf(), listProviderModels(), ModelProbe, perMillion() (+7 more)

### Community 85 - "mcp/server.ts"
Cohesion: 0.07
Nodes (40): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), readGuides() (+32 more)

### Community 86 - "urls.ts"
Cohesion: 0.17
Nodes (6): InviteMemberResult, InviteMemberUseCase, ProjectTarget, ProjectInvite, ProjectInviteProps, ICollaborationMailerService

### Community 87 - "BuilderWorkflow.ts"
Cohesion: 0.16
Nodes (12): ChangeEntry, normalizeProjectProfile(), ProjectPatch, ProjectProfile, SeoSettings, TurnFileChange, starterFiles(), starterFiles() (+4 more)

### Community 88 - "scripts"
Cohesion: 0.14
Nodes (21): clsx, Button, ButtonProps, Badge(), Card(), EmptyState(), ErrorState(), Skeleton() (+13 more)

### Community 90 - "createProjectRows"
Cohesion: 0.16
Nodes (19): PlatformSettingType, SettingDef, SettingGroup, SettingView, createPlatformSettings(), byKey, Def, defs (+11 more)

### Community 91 - "IPasswordHasher"
Cohesion: 0.17
Nodes (5): PlatformSettingsService, PostgresPlatformSettingsStoreAdapter, SettingsDependencies, fixture(), fixture()

### Community 92 - "model-management/providers.ts"
Cohesion: 0.18
Nodes (13): serviceControlController, transport, Actions, failed(), Filter, KIND_LABEL, observed(), ServiceCard() (+5 more)

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
Cohesion: 0.16
Nodes (7): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, mocks

### Community 99 - "Review Focus"
Cohesion: 0.18
Nodes (9): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 2: Registro y almacén de ajustes, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final (+1 more)

### Community 100 - "Desplegar Forja en Coolify"
Cohesion: 0.16
Nodes (7): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository

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
Cohesion: 0.23
Nodes (5): ListAgentTasksUseCase, SqlAgentTaskRepository, AgentTaskQueries, AgentTaskView, TaskCompletion

### Community 107 - "sandboxWorker.mjs"
Cohesion: 0.15
Nodes (10): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, SettingDefinitionProps, SettingType, SettingValue, createSettingsModule(), MOVED_ENV, SettingsModuleDependencies (+2 more)

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
Cohesion: 0.19
Nodes (16): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+8 more)

### Community 112 - "unit/catalog.test.ts"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 113 - "architecture.test.ts"
Cohesion: 0.18
Nodes (13): createClient(), ChatMessage, createAi(), createApiWorkflow(), createAuth(), { apiUrl }, createRealtime(), Handler (+5 more)

### Community 114 - "Tx"
Cohesion: 0.17
Nodes (6): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown(), shutdown()

### Community 115 - "infrastructure/repositories.ts"
Cohesion: 0.11
Nodes (11): authRepository(), createAuthRepository(), createQueryRepository(), platformRepository, schemaRows(), statement(), statements, storagePorts (+3 more)

### Community 116 - "createSecrets"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 117 - "AuthPorts"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 118 - "adminServer.ts"
Cohesion: 0.12
Nodes (20): ADMIN_MCP_INSTRUCTIONS, createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists(), descriptions (+12 more)

### Community 119 - "Dashboard.tsx"
Cohesion: 0.17
Nodes (19): Dashboard(), IDEAS, Sort, SORT_LABEL, Status, STATUS_LABEL, statusOf(), StatusPill() (+11 more)

### Community 120 - "domain/routing.ts"
Cohesion: 0.11
Nodes (31): ClassificationPorts, createModelClassification(), importProviderModels(), analyzeHeuristic(), createModelRouter(), analyzeRequest(), pick(), KEYWORDS (+23 more)

### Community 121 - "PostgresProjectFileRepository"
Cohesion: 0.17
Nodes (15): ROLES, createTurnFeedback(), penalizeTurn(), feedbackModel(), TurnModelDecision, postgresTurnFeedback, TurnFeedbackPorts, TurnFeedbackRepository (+7 more)

### Community 122 - "database/index.ts"
Cohesion: 0.13
Nodes (9): recordClassificationUsage(), dir, monolith, seedLocal, dir, runFixture(), BEFORE, conforms() (+1 more)

### Community 123 - "Audit.tsx"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 124 - "infrastructure/openaiCompat.ts"
Cohesion: 0.15
Nodes (14): TurnState, Block, LlmMessage, CompatEndpoint, Features, ollamaBaseUrl(), ollamaChat(), OllamaMessage (+6 more)

### Community 125 - "ProjectSandbox"
Cohesion: 0.20
Nodes (3): ProjectSandbox, SandboxRunError, ServicePool

### Community 126 - "models/presentation/Models.tsx"
Cohesion: 0.14
Nodes (10): PlatformCollaborationMailerService, PostgresCollaborationAccountRepository, CollaborationAccount, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository (+2 more)

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

### Community 133 - "Panel de administración del sistema — diseño"
Cohesion: 0.08
Nodes (24): 10. Documentación, 1. Capa de datos, 2. Ajustes globales, 4. Playground de agentes, 5. Enrutador, 6. API de administración, 7. Studio, 8. Errores y seguridad (+16 more)

### Community 134 - "createAdminMcpHandler"
Cohesion: 0.22
Nodes (5): clip(), normalize(), parseSpringOutput(), SpringBuildTool, SpringProject

### Community 135 - "deps.test.ts"
Cohesion: 0.27
Nodes (3): DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket

### Community 136 - "ProjectServices"
Cohesion: 0.15
Nodes (6): CoreModulesDependencies, CreateProjectUseCase, ProjectsModuleDependencies, ProjectServices, creation(), load()

### Community 137 - "Memory.tsx"
Cohesion: 0.21
Nodes (11): api, memoryController, Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection() (+3 more)

### Community 138 - "createGithubSyncService"
Cohesion: 0.29
Nodes (8): buildGraphView(), GraphCard, GraphConnection, GraphEdge, GraphNode, GraphQuestion, ProjectGraph, ProjectKnowledge()

### Community 139 - "services"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 140 - "Review Focus"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 141 - "Desplegar Forja en Coolify"
Cohesion: 0.09
Nodes (20): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+12 more)

### Community 143 - "app-services/context.ts"
Cohesion: 0.11
Nodes (13): AiUnavailableError, createAi(), appAiChat(), bindJobs, aiPorts, jobPorts, log(), configureSecretIntegrations() (+5 more)

### Community 144 - "createCollaborationModule"
Cohesion: 0.26
Nodes (4): MemberQueries, createCollaborationModule(), IMemberQueries, fixture()

### Community 145 - "ProjectDbClient"
Cohesion: 0.12
Nodes (7): DATA, jar, req(), ROOT, server, signInAs(), endpoint()

### Community 147 - "http.test.ts"
Cohesion: 0.10
Nodes (22): AdminMcpModules, createMcpHandler(), builderCoreModules, CollaborationModule, IdentityModule, ProjectKnowledgeModule, ProjectsModule, account (+14 more)

### Community 148 - "Account"
Cohesion: 0.12
Nodes (4): Account, AccountProps, Email, PostgresAccountRepository

### Community 149 - "Evals.tsx"
Cohesion: 0.22
Nodes (11): api, evaluationsController, Agg, EvalCfg, Evals(), Metric(), money(), RunDetail (+3 more)

### Community 151 - "settingReactions.ts"
Cohesion: 0.46
Nodes (8): build, BROWSER, args, context, dockerfile, build, build, build

### Community 152 - "BuilderRunRegistry"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 153 - "ProjectSnapshot"
Cohesion: 0.27
Nodes (3): AppTarget, ProjectSnapshot, project

### Community 154 - ".execute"
Cohesion: 0.25
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 155 - "safeFetch.ts"
Cohesion: 0.47
Nodes (3): assertPublic(), fetchPublicText(), isPrivate()

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

## Knowledge Gaps
- **17 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1356 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `bundler.ts` to `Chat.tsx`, `q`, `BuilderTurnAdapter.ts`, `react`, `bootstrap/server.ts`, `projects/application/usecases.ts`, `ProjectView.tsx`, `builderServer.ts`, `database/index.ts`, `infrastructure/playground.ts`, `app-runtime/index.ts`, `FusionOrchestrator.ts`, `roles.ts`, `admission.ts`, `FileMap`, `app-runtime/index.ts`, `app-runtime/services.test.ts`, `modules/collaboration/index.ts`, `server/index.ts`, `config.ts`, `modules/builder/index.ts`, `ServicePanels.tsx`, `deps.ts`, `modules/identity/index.ts`, `composition.ts`, `modules/project-knowledge/index.ts`, `BuilderToolsAdapter.ts`, `composition.ts`, `policies.test.ts`, `builder/contracts.ts`, `app-services/context.ts`, `createIdentityModule`, `model-management/router.ts`, `ProjectsApplication.ts`, `domain/services.ts`, `domain/messages.ts`, `model-management/index.ts`, `PostgresProjectsStore`, `policies.test.ts`, `application/context.ts`, `dependencies`, `Plan.ts`, `ref_node_fs`, `roles.ts`, `BootstrapService`, `package.json`, `github.mjs`, `createJobs`, `FinishGatePolicy.ts`, `Account`, `Panel de administración del sistema — diseño`, `index.tsx`, `OrgRole`, `adminApi.ts`, `agents.mjs`, `mcp/server.ts`, `urls.ts`, `BuilderWorkflow.ts`, `client/index.ts`, `IPasswordHasher`, `model-management/providers.ts`, `starterTemplate.test.ts`, `mcp/server.ts`, `AppEnv`, `SettingDefinition`, `Desplegar Forja en Coolify`, `compilerOptions`, `sandboxWorker.mjs`, `Inventario de funciones de Lovable → Forja`, `Tx`, `createSecrets`, `AuthPorts`, `adminServer.ts`, `domain/routing.ts`, `PostgresProjectFileRepository`, `database/index.ts`, `Audit.tsx`, `infrastructure/openaiCompat.ts`, `models/presentation/Models.tsx`, `adminServer.ts`, `collaboration/postgresAdapters.test.ts`, `Panel de administración del sistema — diseño`, `ProjectServices`, `app-services/context.ts`, `createCollaborationModule`, `ProjectDbClient`, `ApiError`, `http.test.ts`, `ProjectSnapshot`, `guides.ts`, `securityScan.test.ts`, `transports/mcp.test.ts`, `identity/boundaries.test.ts`?**
  _High betweenness centrality (0.300) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0745945945945946 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Chat.tsx` to `application/problems.ts`, `q`, `BuilderToolsAdapter.ts`, `studioApi.ts`, `internal/router.ts`, `ISettingsStore`, `integrations/index.ts`, `Memory.tsx`, `createGithubSyncService`, `infrastructure/playground.ts`, `Inventario de funciones de Lovable → Forja`, `FileMap`, `Dashboard.tsx`, `Evals.tsx`, `domain/contracts.ts`, `scripts`, `Audit.tsx`, `model-management/providers.ts`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `q` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._