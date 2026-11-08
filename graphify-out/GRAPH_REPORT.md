# Graph Report - anemone-mcp-oauth  (2026-11-08)

## Corpus Check
- 716 files · ~339,206 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 6, .css 6, .example 1)

## Summary
- 4746 nodes · 12487 edges · 196 communities (159 shown, 37 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 633 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c53cf403`
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
- roles.ts
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
- domain/contracts.ts
- log
- domain/contracts.ts
- Account
- server/index.ts
- model-management/index.ts
- modules/builder/index.ts
- ServicePanels.tsx
- deps.ts
- modules/identity/index.ts
- tracing.ts
- application/problems.ts
- modules/project-knowledge/index.ts
- BuilderToolsAdapter.ts
- with
- createProjectRows
- builderService.ts
- domain/score.ts
- composition.ts
- policies.test.ts
- bootstrap/server.ts
- app-services/context.ts
- createIdentityModule
- model-management/router.ts
- CreateProjectUseCase.ts
- domain/services.ts
- AgentExecution.ts
- model-management/index.ts
- infrastructure/routing.ts
- PostgresProjectsStore
- ProjectView.tsx
- QueryRepository
- dependencies
- q
- skills.test.ts
- Plan.ts
- ref_node_fs
- app-services/auth.ts
- execution-audit/index.ts
- infrastructure/playground.ts
- agents.mjs
- PostgresCatalogRepository.ts
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
- composition.ts
- settings/index.ts
- platform.ts
- Panel de administración del sistema — diseño
- index.tsx
- createCollaborationModule
- OrgRole
- ref_node_url
- adminApi.ts
- memory/application/service.ts
- agents.mjs
- mcp/server.ts
- InviteMemberUseCase.ts
- modules/projects/index.ts
- scripts
- sandbox.ts
- createProjectRows
- IPasswordHasher
- model-management/providers.ts
- starterTemplate.test.ts
- mcp/server.ts
- AppEnv
- BuilderWorkflowPorts
- createJobs
- SettingDefinition
- Review Focus
- Desplegar Forja en Coolify
- SettingDefinition
- internal/router.ts
- ISettingsStore
- integrations/index.ts
- database/index.ts
- BuilderWorkflowPorts
- sandboxWorker.mjs
- OrchestrationPolicy.ts
- accountLifecycle.ts
- IntegrationRepository
- models/presentation/Models.tsx
- unit/catalog.test.ts
- architecture.test.ts
- ProjectServices
- JobRuntimePorts
- createSecrets
- AuthPorts
- policies.test.ts
- ProjectPath
- Panel de administración del sistema — diseño
- PostgresProjectFileRepository
- usage/usage.ts
- Audit.tsx
- infrastructure/routing.ts
- app-runtime/services.test.ts
- models/presentation/Models.tsx
- projectMicroservices.test.ts
- vitest
- adminServer.ts
- collaboration/postgresAdapters.test.ts
- AccountLifecycleRepository
- services
- mcp/jobs.ts
- createAdminMcpHandler
- deps.test.ts
- PostgresMemberRepository
- settingReactions.ts
- createGithubSyncService
- services
- Review Focus
- Desplegar Forja en Coolify
- cli.ts
- application/jobs.ts
- oauth.ts
- e2e.mjs
- IdentityAccountsService.ts
- transports/mcp.test.ts
- guides.ts
- motion.tsx
- healthcheck
- settingReactions.ts
- BuilderRunRegistry
- react-dom
- .execute
- tracing.test.ts
- guides.ts
- ProjectPath
- Plan.tsx
- mcp-oauth.md
- app-runtime
- One project: orders API and durable invoice worker
- modules/collaboration/index.ts
- Evals.tsx
- transports/mcp.test.ts
- GithubAuthorization
- GithubProjectPorts
- config.ts
- builder
- AppStore
- infrastructure/apps.ts
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
- judgeRouting.test.ts
- RealtimeTransport
- GitHub integration
- IPasswordHasher
- { prepare: prepareImport, attach: attachImport }
- { start: appStart, finish: appFinish, installStart: appInstallStart, installFinish: appInstallFinish, repositories: listRepositories, branches: listBranches }
- { connectAccount, oauthStart, oauthFinish, getLink, unlink }

## God Nodes (most connected - your core abstractions)
1. `vitest` - 163 edges
2. `q()` - 114 edges
3. `createStudioApi()` - 73 edges
4. `react` - 51 edges
5. `AppEnv` - 47 edges
6. `createIdentityModule()` - 46 edges
7. `one()` - 43 edges
8. `ProjectsStore` - 40 edges
9. `createProjectsModule()` - 39 edges
10. `config` - 39 edges

## Surprising Connections (you probably didn't know these)
- `1. Chat y agente del constructor` --references--> `selectContext()`  [INFERRED]
  docs/inventario-lovable.md → server/modules/builder/infrastructure/projectIndex.ts
- `Task 6: Studio — página de administración` --references--> `useLoad()`  [INFERRED]
  docs/superpowers/plans/2026-11-01-panel-admin.md → studio/src/features/files/presentation/Panels.tsx
- `Cómo está hecho` --references--> `useApi()`  [INFERRED]
  README.md → sdk/client/internal/hooks.ts
- `9. Publicar, hosting y crecimiento` --references--> `useHead()`  [INFERRED]
  docs/inventario-lovable.md → sdk/client/internal/router.ts
- `Avance` --references--> `useHead()`  [INFERRED]
  docs/inventario-lovable.md → sdk/client/internal/router.ts

## Import Cycles
- None detected.

## Communities (196 total, 37 thin omitted)

### Community 0 - "Chat.tsx"
Cohesion: 0.07
Nodes (53): lucide-react, radix-ui, administrationController, api, modelBlockers(), ModelReadiness, playgroundModel(), usableModel() (+45 more)

### Community 1 - "q"
Cohesion: 0.05
Nodes (71): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+63 more)

### Community 2 - "BuilderTurnAdapter.ts"
Cohesion: 0.11
Nodes (11): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, IdentityModuleDependencies, PlatformMailerService, IdentityAccountsDependencies, IAccountRepository (+3 more)

### Community 3 - "react"
Cohesion: 0.08
Nodes (32): createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), ClassificationPorts (+24 more)

### Community 4 - "bootstrap/server.ts"
Cohesion: 0.07
Nodes (58): Implementation plan document (`static/__dev/plan.md`), 6. IA dentro de las apps, Pruebas de conexión, AdminMcpModules, describeSchema, ScheduleTasksUseCase, rewardOf(), checkPlanDoc() (+50 more)

### Community 5 - "studioApi.ts"
Cohesion: 0.09
Nodes (52): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+44 more)

### Community 6 - "AgentExecution.ts"
Cohesion: 0.06
Nodes (55): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, listEmails, receiveEmail (+47 more)

### Community 7 - "projects/application/usecases.ts"
Cohesion: 0.09
Nodes (32): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KitEntry, BUILTIN_PACKAGES, isValidPackageName(), MANIFEST, packageInfo (+24 more)

### Community 8 - "ProjectView.tsx"
Cohesion: 0.07
Nodes (5): isDevFile(), ProjectsApplication, createProjectsModule(), ProjectsStore, fixture()

### Community 9 - "roles.ts"
Cohesion: 0.09
Nodes (22): AgentToolRole, allowedToolsForRole(), assertRoleToolAccess(), BACKEND, CHECKLIST, CONTRACT, DATA, DESIGN (+14 more)

### Community 10 - "database/index.ts"
Cohesion: 0.23
Nodes (25): createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass(), contextMetrics() (+17 more)

### Community 11 - "infrastructure/playground.ts"
Cohesion: 0.10
Nodes (23): ProjectEvent, ProjectLogLine, projectsController, transport, CreateProjectOptions, createProjectUseCases(), isProjectLogLine(), isProjectProblem() (+15 more)

### Community 12 - "app-runtime/index.ts"
Cohesion: 0.06
Nodes (27): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, locate(), Problem, ProblemEffects (+19 more)

### Community 13 - "FusionOrchestrator.ts"
Cohesion: 0.10
Nodes (11): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, ROLE_TOOLS (+3 more)

### Community 14 - "http-client.ts"
Cohesion: 0.12
Nodes (18): createCoreModules(), BcryptArgonPasswordHasher, NodeBootstrapCrypto, PostgresSessionRepository, config, burnPasswordCheck(), hashPassword(), LEGACY (+10 more)

### Community 15 - "roles.ts"
Cohesion: 0.08
Nodes (36): ADMIN_MCP_INSTRUCTIONS, createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists(), descriptions (+28 more)

### Community 16 - "ProjectDb"
Cohesion: 0.09
Nodes (39): RuntimeEvent, resolveServiceExecution(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle() (+31 more)

### Community 17 - "admission.ts"
Cohesion: 0.06
Nodes (35): GATE_FIXES, AgentResult, calculateSpendUseCase, toolRegistry, runAgent(), accountSchema, ActiveBuilderStream, BuilderServicePorts (+27 more)

### Community 18 - "FileMap"
Cohesion: 0.07
Nodes (28): api, billingController, Meter(), Plan(), Usage, api, collaborationController, EMPTY (+20 more)

### Community 19 - "appServer.ts"
Cohesion: 0.08
Nodes (15): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, Cache (+7 more)

### Community 20 - "app-runtime/index.ts"
Cohesion: 0.08
Nodes (26): RuntimeProjectsPort, ServiceExecution, bindRuntimeObservation(), configureRuntimeProjects(), publication, suggestSlug, loadFiles(), CompiledModule (+18 more)

### Community 21 - "domain/contracts.ts"
Cohesion: 0.17
Nodes (13): AiUnavailableError, createAi(), appAiChat(), AiBlock, AiContextMetrics, AiFusionTrace, AiUsage, AppAiInput (+5 more)

### Community 22 - "log"
Cohesion: 0.20
Nodes (4): log(), ProjectSandbox, SandboxRunError, ServicePool

### Community 23 - "domain/contracts.ts"
Cohesion: 0.21
Nodes (11): api, memoryController, Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection() (+3 more)

### Community 24 - "Account"
Cohesion: 0.11
Nodes (4): Account, AccountProps, Email, PostgresAccountRepository

### Community 25 - "server/index.ts"
Cohesion: 0.11
Nodes (17): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeObservationPorts, createPublication(), assertPublishable(), Author, BuildProblem (+9 more)

### Community 26 - "model-management/index.ts"
Cohesion: 0.15
Nodes (19): Catalog, createModelManagementQueries(), updateProjectModels(), isMode(), bindModelAudit(), bindCatalogService(), bindCatalogSync(), createPlatformCatalogService() (+11 more)

### Community 27 - "modules/builder/index.ts"
Cohesion: 0.05
Nodes (25): { KIT_BUILTIN }, assertProjectObject(), assertSafeAgentSql(), assertSafePreviewSql(), containsDataChange(), containsSchemaChange(), objectName(), redactSqlData() (+17 more)

### Community 28 - "ServicePanels.tsx"
Cohesion: 0.07
Nodes (22): ActiveRun, admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun() (+14 more)

### Community 29 - "deps.ts"
Cohesion: 0.15
Nodes (14): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), OPENROUTER_URL (+6 more)

### Community 30 - "modules/identity/index.ts"
Cohesion: 0.11
Nodes (15): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, Author, CheckpointProps, IProjectFileRepository, app, database (+7 more)

### Community 31 - "tracing.ts"
Cohesion: 0.29
Nodes (6): StepRecord, ToolCallRecord, createLangfuse(), Event, fromConfig(), LangfuseOptions

### Community 32 - "application/problems.ts"
Cohesion: 0.08
Nodes (36): react, Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallContext (+28 more)

### Community 33 - "modules/project-knowledge/index.ts"
Cohesion: 0.20
Nodes (12): routerAudit(), createRouterAdministration(), routerStats(), meanOf(), FusionPattern, RouterPosteriorRow, RouterStats, listFusionTraces() (+4 more)

### Community 34 - "BuilderToolsAdapter.ts"
Cohesion: 0.07
Nodes (39): dependencies, @anthropic-ai/sdk@^1.3.0, clsx@^2.1.1, croner@^11.0.0, esbuild@^0.28.2, hono@^4.13.14, @hono/node-server@^2.1.5, lucide-react@^1.66.0 (+31 more)

### Community 35 - "with"
Cohesion: 0.09
Nodes (29): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+21 more)

### Community 36 - "createProjectRows"
Cohesion: 0.15
Nodes (10): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError (+2 more)

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
Cohesion: 0.12
Nodes (5): AdminApiTokenError, IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 41 - "bootstrap/server.ts"
Cohesion: 0.05
Nodes (49): ApplicationLifecycle, LifecycleService, startAppRuntimeEventRelay(), lifecycle, shutdown(), app, lifecycle, monolith (+41 more)

### Community 42 - "app-services/context.ts"
Cohesion: 0.10
Nodes (32): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS, JudgeDimension (+24 more)

### Community 43 - "createIdentityModule"
Cohesion: 0.10
Nodes (31): AgentSpec, TurnState, KEYWORDS, RoleProfile, ROLES, Posterior, ExecutionContextMetrics, FusionBudget (+23 more)

### Community 44 - "model-management/router.ts"
Cohesion: 0.06
Nodes (19): bindEvaluationBuilder(), bindEvaluationResources(), Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role (+11 more)

### Community 45 - "CreateProjectUseCase.ts"
Cohesion: 0.16
Nodes (10): CreateCheckpointUseCase, CreateProjectInput, CreateProjectUseCase, Checkpoint, parseStarterTemplate(), starterFiles(), StarterTemplate, starterFiles() (+2 more)

### Community 46 - "domain/services.ts"
Cohesion: 0.11
Nodes (15): BuildProblem, isSafeProjectPath(), newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+7 more)

### Community 47 - "AgentExecution.ts"
Cohesion: 0.07
Nodes (39): page(), RunAgentUseCase, summarize(), addUsage(), AgentExecutionSpec, Block, BuilderContextMetrics, BuilderFusionStep (+31 more)

### Community 48 - "model-management/index.ts"
Cohesion: 0.09
Nodes (29): createProjectCheck(), ProjectCompilerPort, createServiceControl(), restart(), scale(), snapshot(), endpointRoutes(), exampleFiles() (+21 more)

### Community 49 - "infrastructure/routing.ts"
Cohesion: 0.09
Nodes (6): PostgresApiTokenRepository, AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository, IdentityRandom

### Community 50 - "PostgresProjectsStore"
Cohesion: 0.09
Nodes (13): @electric-sql/pglite@^0.5.13, @electric-sql/pglite, AppEnv, AppDataPorts, createAppDataService(), TransactionSession, ProjectMigration, ProjectDbClient (+5 more)

### Community 51 - "ProjectView.tsx"
Cohesion: 0.07
Nodes (55): api, Dashboard(), DeleteDialog(), IDEAS, Sort, SORT_LABEL, Status, STATUS_LABEL (+47 more)

### Community 52 - "QueryRepository"
Cohesion: 0.15
Nodes (5): EmailPorts, AppServiceEvent, ObserverPorts, QueryRepository, StoragePorts

### Community 53 - "dependencies"
Cohesion: 0.13
Nodes (5): CreateOrgUseCase, ManageOrgMemberUseCase, OrgPolicy, ICollaborationAccountRepository, IOrganizationRepository

### Community 54 - "q"
Cohesion: 0.08
Nodes (8): PostgresOrganizationRepository, PostgresOrganizationSkillsRepository, OrganizationRecord, PostgresLoginCodeRepository, PostgresPasswordResetRepository, PasswordResetRepository, recordClassificationUsage(), q()

### Community 56 - "Plan.ts"
Cohesion: 0.08
Nodes (30): CheckPlanUseCase, Review, reviewFixTasks(), checkContract(), CONTRACT_FILE, contractRoutes(), covers(), MAX_CONTRACT (+22 more)

### Community 57 - "ref_node_fs"
Cohesion: 0.07
Nodes (21): CreateFinishGateUseCase, ListAgentTasksUseCase, RunTaskLaneUseCase, TaskLifecycleUseCase, AgentEvent, AgentExecutionResult, requiresFinishGate(), SqlAgentTaskRepository (+13 more)

### Community 58 - "app-services/auth.ts"
Cohesion: 0.12
Nodes (11): zod, AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts (+3 more)

### Community 59 - "execution-audit/index.ts"
Cohesion: 0.13
Nodes (34): removeProjectData, removeProjectData(), sessionCookie(), endSession, testSession, EvalError, RunRequest, recoverRuns() (+26 more)

### Community 60 - "infrastructure/playground.ts"
Cohesion: 0.17
Nodes (16): evaluationBuilder(), admitPlayground(), execute(), InternalRun, PLAYGROUND_ROLES, PlaygroundError, PlaygroundRole, playgroundRoles() (+8 more)

### Community 61 - "agents.mjs"
Cohesion: 0.12
Nodes (15): app, DATA, app, DATA, MODELS, ROOT, SEED, MODELS (+7 more)

### Community 62 - "PostgresCatalogRepository.ts"
Cohesion: 0.23
Nodes (11): audit(), persistCapabilityProfile(), validateCapabilityProfile(), validateReasoningEffort(), columns, postgresCatalogRepository, profileValues(), Row (+3 more)

### Community 63 - "BootstrapService"
Cohesion: 0.12
Nodes (33): app, monolith, runtimePorts, startHttp(), wss, applyProjectMigrations(), applyProjectMigrationsLocal(), assertRuntimeSql() (+25 more)

### Community 64 - "bundler.ts"
Cohesion: 0.09
Nodes (25): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, vitest, migrate(), createTestCoreModules(), drop(), freshDatabase() (+17 more)

### Community 65 - "OrganizationSkillsService.ts"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 66 - "package.json"
Cohesion: 0.17
Nodes (18): BUILDER_SYSTEM_PROMPT, AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO (+10 more)

### Community 67 - "IPersonalOrganizationRepository"
Cohesion: 0.13
Nodes (21): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+13 more)

### Community 68 - "ProviderService.ts"
Cohesion: 0.10
Nodes (6): Project, ProjectProps, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

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
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 73 - "Account"
Cohesion: 0.09
Nodes (9): CACHE_LIMITS, ProjectCache, CheckoutInput, EmailResult, StoredObject, createProjectCacheRepository(), PROJECT_CACHE_SCHEMA, CacheRepository (+1 more)

### Community 74 - "composition.ts"
Cohesion: 0.11
Nodes (30): createMonolith(), startBindings(), stopBindings(), bindJobs, configureJobRuntime(), jobPorts, configureAppServiceObserver(), log() (+22 more)

### Community 75 - "settings/index.ts"
Cohesion: 0.13
Nodes (6): PersonalOrganizationUseCase, Organization, OrganizationProps, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 76 - "platform.ts"
Cohesion: 0.15
Nodes (21): Task 3: Proveedores y modelos en BD + seeders, 3. Proveedores y modelos, `llm/catalog.ts`, Tablas (`002_admin.sql`), tasks, allowedModels(), allowedModels(), availableModels() (+13 more)

### Community 77 - "Panel de administración del sistema — diseño"
Cohesion: 0.16
Nodes (12): CreateOrgResult, OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), ORG_ROLES (+4 more)

### Community 78 - "index.tsx"
Cohesion: 0.12
Nodes (29): 6. API de administración, hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv (+21 more)

### Community 79 - "createCollaborationModule"
Cohesion: 0.14
Nodes (22): Deps, packageName(), EndpointInfo, JobInfo, PageInfo, pageRoutes(), buildClient(), BuildError (+14 more)

### Community 80 - "OrgRole"
Cohesion: 0.15
Nodes (7): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, RemoveMemberUseCase, Access, MemberAccess, IMemberRepository

### Community 81 - "ref_node_url"
Cohesion: 0.09
Nodes (20): playwright-core@1.64.1, playwright-core, root, server, types, worker, app, me (+12 more)

### Community 82 - "adminApi.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 83 - "memory/application/service.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 84 - "agents.mjs"
Cohesion: 0.11
Nodes (28): [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed(), createLocalSeed(), readSeedFile() (+20 more)

### Community 85 - "mcp/server.ts"
Cohesion: 0.13
Nodes (21): guideList(), readGuides(), SECTION_IDS, buildServer(), CONTEXT_TOOLS, DESTRUCTIVE, expectedVersionProp, extraTools (+13 more)

### Community 86 - "InviteMemberUseCase.ts"
Cohesion: 0.13
Nodes (8): InviteMemberResult, InviteMemberUseCase, ProjectTarget, ProjectInvite, ProjectInviteProps, PlatformCollaborationMailerService, ICollaborationMailerService, SendInvitationParams

### Community 87 - "modules/projects/index.ts"
Cohesion: 0.15
Nodes (19): AppTarget, BeforeImage, beforeImages(), restoredFiles(), turnFileChange(), ChangeEntry, normalizeProjectProfile(), ProjectPatch (+11 more)

### Community 88 - "scripts"
Cohesion: 0.16
Nodes (20): clsx, Button, ButtonProps, Badge(), Card(), EmptyState(), ErrorState(), Skeleton() (+12 more)

### Community 89 - "sandbox.ts"
Cohesion: 0.15
Nodes (13): beginTransaction(), dispatch(), sandboxes, WORKER, projectDb(), authRepository(), createAuthRepository(), createQueryRepository() (+5 more)

### Community 90 - "createProjectRows"
Cohesion: 0.20
Nodes (17): PlatformSettingType, SettingDef, SettingGroup, SettingView, MOVED_ENV, createPlatformSettings(), byKey, Def (+9 more)

### Community 91 - "IPasswordHasher"
Cohesion: 0.17
Nodes (5): PlatformSettingsService, PostgresPlatformSettingsStoreAdapter, SettingsDependencies, fixture(), fixture()

### Community 92 - "model-management/providers.ts"
Cohesion: 0.18
Nodes (12): serviceControlController, transport, Actions, failed(), Filter, KIND_LABEL, observed(), ServiceCard() (+4 more)

### Community 93 - "starterTemplate.test.ts"
Cohesion: 0.19
Nodes (6): BootstrapService, SetupError, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 94 - "mcp/server.ts"
Cohesion: 0.17
Nodes (15): RepoSelection, createGithubImportService(), PreparedImport, apps, imports, legacy, ports(), sync (+7 more)

### Community 95 - "AppEnv"
Cohesion: 0.12
Nodes (16): validateToolInput(), author, features, gemini, gpt, reply(), req, review() (+8 more)

### Community 96 - "BuilderWorkflowPorts"
Cohesion: 0.10
Nodes (21): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+13 more)

### Community 97 - "createJobs"
Cohesion: 0.16
Nodes (19): createJobs(), addTimer(), enqueueJob(), executeJob(), fireDueTimers(), initializeAppServices(), report(), runJob() (+11 more)

### Community 98 - "SettingDefinition"
Cohesion: 0.20
Nodes (9): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays(), analyticsPorts (+1 more)

### Community 99 - "Review Focus"
Cohesion: 0.18
Nodes (9): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 2: Registro y almacén de ajustes, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final (+1 more)

### Community 100 - "Desplegar Forja en Coolify"
Cohesion: 0.14
Nodes (8): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository, mocks

### Community 101 - "SettingDefinition"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

### Community 102 - "internal/router.ts"
Cohesion: 0.19
Nodes (21): api, integrationsController, GithubAccount, GithubRepository, GithubSelection, GithubCard, GithubCommitCard(), GithubSection() (+13 more)

### Community 103 - "ISettingsStore"
Cohesion: 0.16
Nodes (15): ChatMessage, AppUser, realtime, { apiUrl }, Contract, createApi(), RouteInput, RouteOutput (+7 more)

### Community 104 - "integrations/index.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 105 - "database/index.ts"
Cohesion: 0.12
Nodes (11): Tx, ANTHROPIC_MODELS, PROVIDERS, seedDefaults(), dir, monolith, seedLocal, dir (+3 more)

### Community 106 - "BuilderWorkflowPorts"
Cohesion: 0.07
Nodes (13): BuilderWorkflowUseCase, FastBuildUseCase, ReviewAndFixUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode (+5 more)

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

### Community 111 - "models/presentation/Models.tsx"
Cohesion: 0.25
Nodes (11): api, modelsController, AccountModels(), ModelChecklist(), ModelRow, MODES, price(), ProjectModels() (+3 more)

### Community 112 - "unit/catalog.test.ts"
Cohesion: 0.14
Nodes (14): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 7. Conectores e integraciones, 8. Seguridad (+6 more)

### Community 113 - "architecture.test.ts"
Cohesion: 0.19
Nodes (10): createClient(), createAi(), createApiWorkflow(), createAuth(), createRealtime(), createStorage(), ApiError, createHttp() (+2 more)

### Community 114 - "ProjectServices"
Cohesion: 0.20
Nodes (4): CoreModulesDependencies, ProjectsModuleDependencies, ProjectServices, endpoint()

### Community 116 - "createSecrets"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 117 - "AuthPorts"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 118 - "policies.test.ts"
Cohesion: 0.08
Nodes (18): createEmail(), sendEmail(), sendPlatformEmail(), createSecrets(), projectSecretEnv(), secretEnv(), createStorage(), putObject() (+10 more)

### Community 120 - "Panel de administración del sistema — diseño"
Cohesion: 0.08
Nodes (24): 10. Documentación, 1. Capa de datos, 2. Ajustes globales, 4. Playground de agentes, 5. Enrutador, 7. Studio, 8. Errores y seguridad, Almacén (+16 more)

### Community 121 - "PostgresProjectFileRepository"
Cohesion: 0.10
Nodes (28): analyzeHeuristic(), createModelRouter(), analyzeRequest(), pick(), useFastPath(), createTurnFeedback(), penalizeTurn(), posteriors (+20 more)

### Community 122 - "usage/usage.ts"
Cohesion: 0.15
Nodes (8): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, countAction, mocks

### Community 123 - "Audit.tsx"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 124 - "infrastructure/routing.ts"
Cohesion: 0.12
Nodes (24): anthropicChat(), FUSION_BUDGETS, Block, LlmMessage, LlmRequest, LlmResponse, LlmTool, textOf() (+16 more)

### Community 125 - "app-runtime/services.test.ts"
Cohesion: 0.16
Nodes (15): getSandboxServices(), restartSandboxService(), runInSandbox(), stopAllSandboxes(), call(), readServiceRuntime(), restartServiceRuntime(), runtimeSnapshot (+7 more)

### Community 126 - "models/presentation/Models.tsx"
Cohesion: 0.20
Nodes (8): PostgresCollaborationAccountRepository, CollaborationAccount, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository, sendInvitation

### Community 127 - "projectMicroservices.test.ts"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 128 - "vitest"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 129 - "adminServer.ts"
Cohesion: 0.19
Nodes (16): AppCredentials, branchName(), createGithubAppService(), installation(), requireApp(), selectRepository(), GithubApp, Installation (+8 more)

### Community 130 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.18
Nodes (6): createGithubAccountService(), connectAccount(), GithubAccountRepository, Link, SyncResult, setup()

### Community 131 - "AccountLifecycleRepository"
Cohesion: 0.19
Nodes (14): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+6 more)

### Community 132 - "services"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 133 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 134 - "createAdminMcpHandler"
Cohesion: 0.22
Nodes (5): clip(), normalize(), parseSpringOutput(), SpringBuildTool, SpringProject

### Community 135 - "deps.test.ts"
Cohesion: 0.21
Nodes (5): DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket, publish, realtimeStats

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

### Community 141 - "Desplegar Forja en Coolify"
Cohesion: 0.11
Nodes (15): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+7 more)

### Community 143 - "application/jobs.ts"
Cohesion: 0.11
Nodes (10): ClaimedJob, createJobQueue(), poll(), processJob(), pump(), start(), stop(), JobsApi (+2 more)

### Community 144 - "oauth.ts"
Cohesion: 0.09
Nodes (35): accountFromOAuthAccessToken(), AuthorizationCode, authorizationHtml(), Client, createMcpOAuthRouter(), digest(), escapeHtml(), findClient() (+27 more)

### Community 145 - "e2e.mjs"
Cohesion: 0.11
Nodes (9): assertPublic(), fetchPublicText(), isPrivate(), DATA, jar, req(), ROOT, server (+1 more)

### Community 147 - "transports/mcp.test.ts"
Cohesion: 0.25
Nodes (6): createMcpHandler(), account, collaboration, handleMcp, identity, projects

### Community 148 - "guides.ts"
Cohesion: 0.32
Nodes (7): build(), Guide, guideById, GUIDES, OVERVIEW_PARTS, parse(), slug()

### Community 149 - "motion.tsx"
Cohesion: 0.50
Nodes (3): motion@^14.9.0, motion, FadeIn()

### Community 151 - "settingReactions.ts"
Cohesion: 0.46
Nodes (8): build, BROWSER, args, context, dockerfile, build, build, build

### Community 152 - "BuilderRunRegistry"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 154 - ".execute"
Cohesion: 0.25
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 156 - "guides.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 160 - "app-runtime"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 161 - "One project: orders API and durable invoice worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 162 - "modules/collaboration/index.ts"
Cohesion: 0.11
Nodes (13): MemberQueries, OrganizationNamesQuery, OrganizationQueries, CollaborationModuleDependencies, createCollaborationModule(), IMemberQueries, InviteView, IOrganizationNameDirectory (+5 more)

### Community 163 - "Evals.tsx"
Cohesion: 0.22
Nodes (11): api, evaluationsController, Agg, EvalCfg, Evals(), Metric(), money(), RunDetail (+3 more)

### Community 166 - "GithubProjectPorts"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 167 - "config.ts"
Cohesion: 0.11
Nodes (16): vite, DEV_FIXTURE, Fixture, DEFAULT_MODELS_ALLOW, env, paths, resolvePublicUrl(), ROOT_DIR (+8 more)

### Community 168 - "builder"
Cohesion: 0.15
Nodes (3): EmailInput, AuthPorts, AuthRepository

### Community 170 - "infrastructure/apps.ts"
Cohesion: 0.14
Nodes (14): appJwt(), cache, credentials(), generations, pending, gh(), tokenFor(), encryptHeaders() (+6 more)

### Community 174 - "Cómo está hecho"
Cohesion: 0.33
Nodes (6): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, ctx()

### Community 193 - "judgeRouting.test.ts"
Cohesion: 0.33
Nodes (5): billing, { callModel }, input, model, scope

### Community 196 - "GitHub integration"
Cohesion: 0.50
Nodes (3): GitHub integration, HTTP API, Native imports and synchronization

## Knowledge Gaps
- **20 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1401 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `bundler.ts` to `Chat.tsx`, `q`, `BuilderTurnAdapter.ts`, `react`, `studioApi.ts`, `projects/application/usecases.ts`, `ProjectView.tsx`, `infrastructure/playground.ts`, `app-runtime/index.ts`, `FusionOrchestrator.ts`, `http-client.ts`, `roles.ts`, `admission.ts`, `FileMap`, `app-runtime/index.ts`, `server/index.ts`, `model-management/index.ts`, `modules/builder/index.ts`, `ServicePanels.tsx`, `deps.ts`, `modules/identity/index.ts`, `modules/project-knowledge/index.ts`, `BuilderToolsAdapter.ts`, `composition.ts`, `policies.test.ts`, `bootstrap/server.ts`, `app-services/context.ts`, `model-management/router.ts`, `CreateProjectUseCase.ts`, `domain/services.ts`, `AgentExecution.ts`, `model-management/index.ts`, `PostgresProjectsStore`, `dependencies`, `Plan.ts`, `ref_node_fs`, `package.json`, `github.mjs`, `createJobs`, `FinishGatePolicy.ts`, `Account`, `composition.ts`, `settings/index.ts`, `Panel de administración del sistema — diseño`, `index.tsx`, `OrgRole`, `ref_node_url`, `adminApi.ts`, `agents.mjs`, `mcp/server.ts`, `InviteMemberUseCase.ts`, `modules/projects/index.ts`, `IPasswordHasher`, `model-management/providers.ts`, `starterTemplate.test.ts`, `mcp/server.ts`, `AppEnv`, `Desplegar Forja en Coolify`, `SettingDefinition`, `database/index.ts`, `BuilderWorkflowPorts`, `sandboxWorker.mjs`, `architecture.test.ts`, `createSecrets`, `AuthPorts`, `policies.test.ts`, `ProjectPath`, `Panel de administración del sistema — diseño`, `PostgresProjectFileRepository`, `usage/usage.ts`, `Audit.tsx`, `infrastructure/routing.ts`, `app-runtime/services.test.ts`, `models/presentation/Models.tsx`, `adminServer.ts`, `collaboration/postgresAdapters.test.ts`, `AccountLifecycleRepository`, `mcp/jobs.ts`, `settingReactions.ts`, `oauth.ts`, `e2e.mjs`, `IdentityAccountsService.ts`, `transports/mcp.test.ts`, `react-dom`, `tracing.test.ts`, `guides.ts`, `modules/collaboration/index.ts`, `transports/mcp.test.ts`, `config.ts`, `infrastructure/apps.ts`, `judgeRouting.test.ts`?**
  _High betweenness centrality (0.256) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07459505541346974 - nodes in this community are weakly interconnected._
- **Why does `react` connect `application/problems.ts` to `Chat.tsx`, `q`, `studioApi.ts`, `createGithubSyncService`, `infrastructure/playground.ts`, `FileMap`, `motion.tsx`, `domain/contracts.ts`, `react-dom`, `BuilderToolsAdapter.ts`, `Evals.tsx`, `ProjectView.tsx`, `scripts`, `model-management/providers.ts`, `internal/router.ts`, `ISettingsStore`, `integrations/index.ts`, `models/presentation/Models.tsx`, `Audit.tsx`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `q` be split into smaller, more focused modules?**
  _Cohesion score 0.047058823529411764 - nodes in this community are weakly interconnected._