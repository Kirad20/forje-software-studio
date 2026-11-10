# Graph Report - github-app-repository-list  (2026-11-09)

## Corpus Check
- 719 files · ~344,808 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 6, .css 6, .example 1)

## Summary
- 4770 nodes · 12622 edges · 193 communities (160 shown, 33 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 654 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `07bdeab3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Chat.tsx
- q
- BuilderTurnAdapter.ts
- react
- bootstrap/server.ts
- Changes.tsx
- AgentExecution.ts
- projects/application/usecases.ts
- ProjectView.tsx
- skills.test.ts
- FusionOrchestrator.ts
- infrastructure/playground.ts
- composition.ts
- FusionOrchestrator.ts
- crypto.ts
- adminApi.ts
- ProjectDb
- createProjectRows
- FileMap
- appServer.ts
- app-runtime/index.ts
- RunTaskLaneUseCase.ts
- model-management/catalog.ts
- models/presentation/Models.tsx
- Plan.ts
- server/index.ts
- model-management/index.ts
- modules/builder/index.ts
- builderServer.ts
- deps.ts
- modules/identity/index.ts
- modules/builder/index.ts
- application/problems.ts
- modules/project-knowledge/index.ts
- BuilderToolsAdapter.ts
- app-runtime/infrastructure/browser.ts
- fusion.test.ts
- adminApi.ts
- domain/score.ts
- composition.ts
- policies.test.ts
- bootstrap/server.ts
- app-services/context.ts
- createIdentityModule
- model-management/router.ts
- application/problems.ts
- domain/services.ts
- Account
- model-management/index.ts
- PostgresApiTokenRepository
- ProjectDb
- ProjectView.tsx
- application/security.ts
- dependencies
- q
- skills.test.ts
- OrgRole
- ExecutionMetrics
- app-services/auth.ts
- infrastructure/runner.ts
- infrastructure/playground.ts
- AppEnv
- studio.mjs
- infrastructure/projectDb.ts
- vitest
- OrganizationSkillsService.ts
- builder/contracts.ts
- IPersonalOrganizationRepository
- ProviderService.ts
- github.mjs
- infrastructure/cache.ts
- createJobs
- FinishGatePolicy.ts
- bundler.ts
- platformDb
- settings/index.ts
- app-runtime/services.test.ts
- Panel de administración del sistema — diseño
- PostgresCatalogRepository.ts
- one
- collaboration/ports/repositories.ts
- ref_node_url
- admission.ts
- memory/application/service.ts
- classification.test.ts
- mcp/server.ts
- ICollaborationAccountRepository
- ProjectsApplication.ts
- scripts
- app-services/jobs.ts
- createProjectRows
- IPasswordHasher
- model-management/providers.ts
- starterTemplate.test.ts
- modules/integrations/application/github.ts
- ProjectKnowledge.tsx
- BuilderWorkflowPorts
- createJobs
- guides.ts
- Review Focus
- Desplegar Forja en Coolify
- SettingDefinition
- internal/router.ts
- ISettingsStore
- integrations/index.ts
- AccountLifecycleRepository
- OrchestrationPolicy.ts
- sandboxWorker.mjs
- OrchestrationPolicy.ts
- accountLifecycle.ts
- IntegrationRepository
- devDependencies
- unit/catalog.test.ts
- architecture.test.ts
- app-services/analytics.ts
- application/jobs.ts
- createSecrets
- app-services/payments.ts
- policies.test.ts
- integrations/github.ts
- Panel de administración del sistema — diseño
- PostgresProjectFileRepository
- usage/usage.ts
- Audit.tsx
- domain/messages.ts
- log
- models/presentation/Models.tsx
- projectMicroservices.test.ts
- ProjectSnapshot
- adminServer.ts
- Evals.tsx
- AccountLifecycleRepository
- services
- mcp/jobs.ts
- createAdminMcpHandler
- deps.test.ts
- ProjectServices
- e2e.mjs
- ProjectPath
- services
- Review Focus
- forms.tsx
- ports/context.ts
- transports/mcp.test.ts
- oauth.ts
- BuilderRunRegistry
- BcryptArgonPasswordHasher.ts
- Cómo está hecho
- ApplicationLifecycle
- Desplegar Forja en Coolify
- healthcheck
- settingReactions.ts
- BuilderRunRegistry
- Memory.tsx
- .execute
- judgeRouting.test.ts
- guides.ts
- ApiError
- infrastructure/apps.ts
- mcp-oauth.md
- app-runtime
- One project: orders API and durable invoice worker
- createCollaborationModule
- AppStore
- GithubProjectPorts
- platformDb
- config.ts
- GithubRepository
- forja
- GithubGateway
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
- GithubAuthorization
- GithubProjectPorts
- GithubRepository
- RealtimeTransport
- GitHub integration
- { prepare: prepareImport, attach: attachImport }
- { start: appStart, finish: appFinish, installStart: appInstallStart, installFinish: appInstallFinish, repositories: listRepositories, branches: listBranches }
- { connectAccount, oauthStart, oauthFinish, getLink, unlink }

## God Nodes (most connected - your core abstractions)
1. `vitest` - 163 edges
2. `q()` - 117 edges
3. `createStudioApi()` - 76 edges
4. `AppEnv` - 59 edges
5. `react` - 51 edges
6. `createIdentityModule()` - 46 edges
7. `one()` - 43 edges
8. `ProjectsStore` - 40 edges
9. `createProjectsModule()` - 39 edges
10. `config` - 39 edges

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

## Communities (193 total, 33 thin omitted)

### Community 0 - "Chat.tsx"
Cohesion: 0.08
Nodes (56): lucide-react, radix-ui, react, administrationController, api, modelBlockers(), ModelReadiness, playgroundModel() (+48 more)

### Community 1 - "q"
Cohesion: 0.05
Nodes (69): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+61 more)

### Community 2 - "BuilderTurnAdapter.ts"
Cohesion: 0.08
Nodes (10): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, PlatformMailerService, IAccountRepository, ILoginCodeRepository, IMailerService (+2 more)

### Community 3 - "react"
Cohesion: 0.10
Nodes (25): createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), ClassificationPorts (+17 more)

### Community 4 - "bootstrap/server.ts"
Cohesion: 0.08
Nodes (52): Implementation plan document (`static/__dev/plan.md`), describeSchema, ScheduleTasksUseCase, rewardOf(), checkPlanDoc(), criteriaOf(), planOverview(), formatStandard() (+44 more)

### Community 5 - "Changes.tsx"
Cohesion: 0.19
Nodes (15): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+7 more)

### Community 6 - "AgentExecution.ts"
Cohesion: 0.05
Nodes (74): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, createAppUser, ensureProjectOwner (+66 more)

### Community 7 - "projects/application/usecases.ts"
Cohesion: 0.09
Nodes (33): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KitEntry, BUILTIN_PACKAGES, isValidPackageName(), MANIFEST, packageInfo (+25 more)

### Community 8 - "ProjectView.tsx"
Cohesion: 0.07
Nodes (5): isDevFile(), ProjectsApplication, createProjectsModule(), ProjectsStore, fixture()

### Community 9 - "skills.test.ts"
Cohesion: 0.17
Nodes (18): BUILDER_SYSTEM_PROMPT, AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO (+10 more)

### Community 10 - "FusionOrchestrator.ts"
Cohesion: 0.23
Nodes (25): createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass(), contextMetrics() (+17 more)

### Community 11 - "infrastructure/playground.ts"
Cohesion: 0.08
Nodes (36): ProjectEvent, ProjectLogLine, projectsController, transport, CreateProjectOptions, isProjectLogLine(), isProjectProblem(), isRecord() (+28 more)

### Community 12 - "composition.ts"
Cohesion: 0.13
Nodes (25): startAppRuntimeEventRelay(), createMonolith(), startBindings(), stopBindings(), configureAppServiceObserver(), configureSecretIntegrations(), initializeAppServices, bindEvaluationBuilder() (+17 more)

### Community 13 - "FusionOrchestrator.ts"
Cohesion: 0.05
Nodes (49): AgentResult, calculateSpendUseCase, toolRegistry, runAgent(), toolByName, bindBuilderCoreModules(), readFile(), estTokens() (+41 more)

### Community 14 - "crypto.ts"
Cohesion: 0.07
Nodes (31): @electric-sql/pglite, createCoreModules(), createEmail(), sendEmail(), sendPlatformEmail(), verifiedSender(), createProjectRowsRepository(), authRepository() (+23 more)

### Community 15 - "adminApi.ts"
Cohesion: 0.08
Nodes (39): ADMIN_MCP_INSTRUCTIONS, AdminMcpModules, createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists() (+31 more)

### Community 16 - "ProjectDb"
Cohesion: 0.09
Nodes (39): RuntimeEvent, resolveServiceExecution(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle() (+31 more)

### Community 17 - "createProjectRows"
Cohesion: 0.33
Nodes (8): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError

### Community 18 - "FileMap"
Cohesion: 0.06
Nodes (30): api, billingController, Meter(), Plan(), Usage, api, collaborationController, EMPTY (+22 more)

### Community 19 - "appServer.ts"
Cohesion: 0.08
Nodes (15): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, Cache (+7 more)

### Community 20 - "app-runtime/index.ts"
Cohesion: 0.08
Nodes (25): RuntimeObservationPorts, RuntimeProjectsPort, ServiceExecution, bindRuntimeObservation(), configureRuntimeProjects(), suggestSlug, loadFiles(), bindRuntimeObservation() (+17 more)

### Community 21 - "RunTaskLaneUseCase.ts"
Cohesion: 0.08
Nodes (17): ListAgentTasksUseCase, RunTaskLaneUseCase, TaskLifecycleUseCase, AgentExecutionResult, requiresFinishGate(), SqlAgentTaskRepository, AgentTaskQueries, AgentTaskView (+9 more)

### Community 22 - "model-management/catalog.ts"
Cohesion: 0.09
Nodes (39): Task 3: Proveedores y modelos en BD + seeders, 3. Proveedores y modelos, `llm/catalog.ts`, Pruebas de conexión, Tablas (`002_admin.sql`), createLocalSeed(), readSeedFile(), SeedFile (+31 more)

### Community 23 - "models/presentation/Models.tsx"
Cohesion: 0.25
Nodes (11): api, modelsController, AccountModels(), ModelChecklist(), ModelRow, MODES, price(), ProjectModels() (+3 more)

### Community 24 - "Plan.ts"
Cohesion: 0.09
Nodes (26): CheckPlanUseCase, checkContract(), CONTRACT_FILE, contractRoutes(), covers(), MAX_CONTRACT, MAX_GOAL, MAX_PLAN_DOC (+18 more)

### Community 25 - "server/index.ts"
Cohesion: 0.11
Nodes (16): createBuildVerification(), BuildPorts, PublicationPorts, createPublication(), assertPublishable(), Author, BuildProblem, FileMap (+8 more)

### Community 26 - "model-management/index.ts"
Cohesion: 0.11
Nodes (25): Catalog, createModelManagementQueries(), routerAudit(), updateProjectModels(), isMode(), createModelRouter(), taskClassOf(), bindModelAudit() (+17 more)

### Community 27 - "modules/builder/index.ts"
Cohesion: 0.05
Nodes (28): { KIT_BUILTIN }, assertProjectObject(), assertSafeAgentSql(), assertSafePreviewSql(), containsDataChange(), containsSchemaChange(), objectName(), redactSqlData() (+20 more)

### Community 28 - "builderServer.ts"
Cohesion: 0.13
Nodes (17): app, lifecycle, monolith, stopRuntimeEventRelay(), stopBuilder(), metricsIdle(), StepRecord, ToolCallRecord (+9 more)

### Community 29 - "deps.ts"
Cohesion: 0.15
Nodes (15): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), ProviderError (+7 more)

### Community 30 - "modules/identity/index.ts"
Cohesion: 0.13
Nodes (8): CreateCheckpointUseCase, DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, Author, Checkpoint, CheckpointProps, IProjectFileRepository

### Community 31 - "modules/builder/index.ts"
Cohesion: 0.10
Nodes (13): accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService(), BuilderServiceClient (+5 more)

### Community 32 - "application/problems.ts"
Cohesion: 0.07
Nodes (36): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallContext, InstallEvent (+28 more)

### Community 33 - "modules/project-knowledge/index.ts"
Cohesion: 0.22
Nodes (11): createRouterAdministration(), routerStats(), meanOf(), FusionPattern, RouterPosteriorRow, RouterStats, listFusionTraces(), postgresRouterAdministrationRepository (+3 more)

### Community 34 - "BuilderToolsAdapter.ts"
Cohesion: 0.07
Nodes (38): dependencies, @anthropic-ai/sdk@^1.3.0, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, hono@^4.13.14, @hono/node-server@^2.1.5, lucide-react@^1.66.0 (+30 more)

### Community 35 - "app-runtime/infrastructure/browser.ts"
Cohesion: 0.09
Nodes (27): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+19 more)

### Community 36 - "fusion.test.ts"
Cohesion: 0.12
Nodes (16): validateToolInput(), author, features, gemini, gpt, reply(), req, review() (+8 more)

### Community 37 - "adminApi.ts"
Cohesion: 0.11
Nodes (31): 6. API de administración, hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv (+23 more)

### Community 38 - "domain/score.ts"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 39 - "composition.ts"
Cohesion: 0.10
Nodes (19): createKnowledgeService(), KnowledgeEngine, KnowledgeFiles, prepareCorpus(), KnowledgeAnswer, KnowledgeEdge, KnowledgeGraph, KnowledgeNode (+11 more)

### Community 40 - "policies.test.ts"
Cohesion: 0.12
Nodes (4): IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 41 - "bootstrap/server.ts"
Cohesion: 0.07
Nodes (22): withDefaultHeaders(), app, handleAdminMcp, handleMcp, lifecycle, listening(), monolith, reactions (+14 more)

### Community 42 - "app-services/context.ts"
Cohesion: 0.10
Nodes (32): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS, JudgeDimension (+24 more)

### Community 43 - "createIdentityModule"
Cohesion: 0.10
Nodes (30): AgentSpec, TurnState, KEYWORDS, RoleProfile, ExecutionContextMetrics, FusionBudget, FusionEffort, FusionStep (+22 more)

### Community 44 - "model-management/router.ts"
Cohesion: 0.06
Nodes (16): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+8 more)

### Community 45 - "application/problems.ts"
Cohesion: 0.10
Nodes (13): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, locate(), Problem, ProblemEffects (+5 more)

### Community 46 - "domain/services.ts"
Cohesion: 0.16
Nodes (9): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+1 more)

### Community 47 - "Account"
Cohesion: 0.13
Nodes (10): Account, AccountProps, PlatformRole, Email, AccountRow, PostgresAccountRepository, SessionAccountRow, AccountAccessUpdate (+2 more)

### Community 48 - "model-management/index.ts"
Cohesion: 0.09
Nodes (28): createProjectCheck(), ProjectCompilerPort, createServiceControl(), restart(), scale(), snapshot(), endpointRoutes(), jobFiles() (+20 more)

### Community 49 - "PostgresApiTokenRepository"
Cohesion: 0.07
Nodes (10): PostgresApiTokenRepository, McpOAuthAuthorizationCode, McpOAuthClient, McpOAuthRefreshGrant, AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository (+2 more)

### Community 50 - "ProjectDb"
Cohesion: 0.15
Nodes (8): AppDataPorts, createAppDataService(), TransactionSession, ProjectMigration, SqlExecutionResult, TransactionAction, ProjectDb, isInternalServiceRequest()

### Community 51 - "ProjectView.tsx"
Cohesion: 0.07
Nodes (77): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+69 more)

### Community 52 - "application/security.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 53 - "dependencies"
Cohesion: 0.13
Nodes (5): CreateOrgUseCase, ManageOrgMemberUseCase, OrgPolicy, ICollaborationAccountRepository, IOrganizationRepository

### Community 54 - "q"
Cohesion: 0.06
Nodes (9): createDevelopmentSeed(), PostgresMemberRepository, PostgresOrganizationRepository, PostgresOrganizationSkillsRepository, OrganizationRecord, PostgresLoginCodeRepository, PostgresPasswordResetRepository, recordClassificationUsage() (+1 more)

### Community 55 - "skills.test.ts"
Cohesion: 0.06
Nodes (4): FileMap, PostgresProjectsStore, ProjectOrganizations, QueryHandle

### Community 56 - "OrgRole"
Cohesion: 0.17
Nodes (9): CreateOrgResult, OrganizationQueries, ORG_ROLES, OrgRole, InviteView, IOrganizationQueries, MemberView, Org (+1 more)

### Community 57 - "ExecutionMetrics"
Cohesion: 0.10
Nodes (10): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, StaticToolRegistryAdapter (+2 more)

### Community 58 - "app-services/auth.ts"
Cohesion: 0.11
Nodes (14): ws, AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts (+6 more)

### Community 59 - "infrastructure/runner.ts"
Cohesion: 0.12
Nodes (38): removeProjectData, removeProjectData(), sessionCookie(), endSession, testSession, EvalError, RunRequest, designSignals (+30 more)

### Community 60 - "infrastructure/playground.ts"
Cohesion: 0.16
Nodes (15): admitPlayground(), execute(), InternalRun, PLAYGROUND_ROLES, PlaygroundError, PlaygroundRole, playgroundRoles(), PlaygroundView (+7 more)

### Community 61 - "AppEnv"
Cohesion: 0.15
Nodes (5): AppEnv, ProjectDbClient, JobsApi, ProjectRowsPort, ProjectSchemaPort

### Community 62 - "studio.mjs"
Cohesion: 0.09
Nodes (29): app, DATA, app, DATA, MODELS, ROOT, SEED, MODELS (+21 more)

### Community 63 - "infrastructure/projectDb.ts"
Cohesion: 0.18
Nodes (25): publication, applyProjectMigrations(), applyProjectMigrationsLocal(), assertRuntimeSql(), checksum(), cloneDatabase(), closeProject(), databasePath() (+17 more)

### Community 64 - "vitest"
Cohesion: 0.06
Nodes (39): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, vitest, migrate(), MIGRATIONS_DIR, createTestCoreModules(), drop() (+31 more)

### Community 65 - "OrganizationSkillsService.ts"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 66 - "builder/contracts.ts"
Cohesion: 0.07
Nodes (41): page(), GATE_FIXES, RunAgentUseCase, summarize(), addUsage(), AgentEvent, AgentExecutionSpec, Block (+33 more)

### Community 67 - "IPersonalOrganizationRepository"
Cohesion: 0.12
Nodes (25): createAuth(), confirmPasswordReset(), createAppUser(), createSession(), ensureOwnerAdmin(), ensureProjectOwner(), requestPasswordReset(), setTemporaryPassword() (+17 more)

### Community 68 - "ProviderService.ts"
Cohesion: 0.11
Nodes (5): Project, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 69 - "github.mjs"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 70 - "infrastructure/cache.ts"
Cohesion: 0.15
Nodes (5): CACHE_LIMITS, ProjectCache, createProjectCacheRepository(), PROJECT_CACHE_SCHEMA, CacheRepository

### Community 71 - "createJobs"
Cohesion: 0.08
Nodes (16): Run, AppUser, createProjectCache(), createContext(), serviceContext(), EndpointContext, enqueue(), HttpError (+8 more)

### Community 72 - "FinishGatePolicy.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 73 - "bundler.ts"
Cohesion: 0.15
Nodes (22): Deps, EndpointInfo, exampleFiles(), JobInfo, PageInfo, pageRoutes(), buildClient(), BuildError (+14 more)

### Community 74 - "platformDb"
Cohesion: 0.10
Nodes (15): platformDb, Tx, wrap(), ANTHROPIC_MODELS, PROVIDERS, seedDefaults(), app, database (+7 more)

### Community 75 - "settings/index.ts"
Cohesion: 0.14
Nodes (7): PersonalOrganizationUseCase, Organization, OrganizationProps, CollaborationModuleDependencies, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 76 - "app-runtime/services.test.ts"
Cohesion: 0.18
Nodes (13): checkProject, getSandboxServices(), restartSandboxService(), stopAllSandboxes(), call(), readServiceRuntime(), restartServiceRuntime(), runtimeSnapshot (+5 more)

### Community 77 - "Panel de administración del sistema — diseño"
Cohesion: 0.19
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 78 - "PostgresCatalogRepository.ts"
Cohesion: 0.23
Nodes (11): audit(), persistCapabilityProfile(), validateCapabilityProfile(), validateReasoningEffort(), columns, postgresCatalogRepository, profileValues(), Row (+3 more)

### Community 79 - "one"
Cohesion: 0.18
Nodes (3): PostgresAccountLifecycleRepository, AccountSecurity, one()

### Community 80 - "collaboration/ports/repositories.ts"
Cohesion: 0.15
Nodes (7): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, RemoveMemberUseCase, Access, MemberAccess, IMemberRepository

### Community 81 - "ref_node_url"
Cohesion: 0.10
Nodes (19): playwright-core@1.64.1, playwright-core, root, server, types, worker, app, me (+11 more)

### Community 82 - "admission.ts"
Cohesion: 0.07
Nodes (23): ActiveRun, admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun() (+15 more)

### Community 83 - "memory/application/service.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 84 - "classification.test.ts"
Cohesion: 0.43
Nodes (6): createModelClassification(), answer(), model, prediction(), scope, setup()

### Community 85 - "mcp/server.ts"
Cohesion: 0.14
Nodes (19): guideList(), readGuides(), buildServer(), CONTEXT_TOOLS, DESTRUCTIVE, expectedVersionProp, extraTools, Hints (+11 more)

### Community 86 - "ICollaborationAccountRepository"
Cohesion: 0.13
Nodes (8): InviteMemberResult, InviteMemberUseCase, ProjectTarget, ProjectInvite, ProjectInviteProps, PlatformCollaborationMailerService, ICollaborationMailerService, SendInvitationParams

### Community 87 - "ProjectsApplication.ts"
Cohesion: 0.12
Nodes (23): CreateProjectInput, CreateProjectUseCase, BeforeImage, beforeImages(), restoredFiles(), turnFileChange(), ProjectProps, ChangeEntry (+15 more)

### Community 88 - "scripts"
Cohesion: 0.16
Nodes (17): clsx@^2.1.1, sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card() (+9 more)

### Community 89 - "app-services/jobs.ts"
Cohesion: 0.07
Nodes (16): createSecrets(), projectSecretEnv(), secretEnv(), bindJobs, SECRET_NAME, aiPorts, configureJobRuntime(), jobPorts (+8 more)

### Community 90 - "createProjectRows"
Cohesion: 0.20
Nodes (17): PlatformSettingType, SettingDef, SettingGroup, SettingView, MOVED_ENV, createPlatformSettings(), byKey, Def (+9 more)

### Community 91 - "IPasswordHasher"
Cohesion: 0.17
Nodes (5): PlatformSettingsService, PostgresPlatformSettingsStoreAdapter, SettingsDependencies, fixture(), fixture()

### Community 92 - "model-management/providers.ts"
Cohesion: 0.14
Nodes (15): react-dom@^19.3.1, react-dom, serviceControlController, transport, Actions, failed(), Filter, KIND_LABEL (+7 more)

### Community 93 - "starterTemplate.test.ts"
Cohesion: 0.12
Nodes (11): BootstrapService, SetupError, AdminApiTokenError, COMMON_PASSWORDS, Password, IdentityModuleDependencies, IdentityAccountsDependencies, BootstrapAccounts (+3 more)

### Community 94 - "modules/integrations/application/github.ts"
Cohesion: 0.15
Nodes (8): createGithubAccountService(), connectAccount(), GithubAccountRepository, RepoSelection, Link, SyncResult, PreparedImport, setup()

### Community 95 - "ProjectKnowledge.tsx"
Cohesion: 0.29
Nodes (8): buildGraphView(), GraphCard, GraphConnection, GraphEdge, GraphNode, GraphQuestion, ProjectGraph, ProjectKnowledge()

### Community 96 - "BuilderWorkflowPorts"
Cohesion: 0.10
Nodes (21): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+13 more)

### Community 97 - "createJobs"
Cohesion: 0.16
Nodes (19): createJobs(), addTimer(), enqueueJob(), executeJob(), fireDueTimers(), initializeAppServices(), report(), runJob() (+11 more)

### Community 98 - "guides.ts"
Cohesion: 0.28
Nodes (8): build(), Guide, guideById, GUIDES, OVERVIEW_PARTS, parse(), SECTION_IDS, slug()

### Community 99 - "Review Focus"
Cohesion: 0.18
Nodes (9): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 2: Registro y almacén de ajustes, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final (+1 more)

### Community 100 - "Desplegar Forja en Coolify"
Cohesion: 0.16
Nodes (7): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository

### Community 101 - "SettingDefinition"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

### Community 102 - "internal/router.ts"
Cohesion: 0.19
Nodes (21): api, integrationsController, GithubAccount, GithubRepository, GithubSelection, GithubCard, GithubCommitCard(), GithubSection() (+13 more)

### Community 103 - "ISettingsStore"
Cohesion: 0.17
Nodes (14): ChatMessage, AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes (+6 more)

### Community 104 - "integrations/index.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 106 - "OrchestrationPolicy.ts"
Cohesion: 0.06
Nodes (22): BuilderWorkflowUseCase, FastBuildUseCase, ReviewAndFixUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode (+14 more)

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

### Community 111 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 112 - "unit/catalog.test.ts"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 113 - "architecture.test.ts"
Cohesion: 0.20
Nodes (11): createClient(), createAi(), createApiWorkflow(), createAuth(), { apiUrl }, createRealtime(), Handler, createStorage() (+3 more)

### Community 114 - "app-services/analytics.ts"
Cohesion: 0.21
Nodes (9): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays(), analyticsPorts (+1 more)

### Community 115 - "application/jobs.ts"
Cohesion: 0.12
Nodes (10): ClaimedJob, createJobQueue(), poll(), processJob(), pump(), start(), stop(), JOB_LIMITS (+2 more)

### Community 116 - "createSecrets"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 117 - "app-services/payments.ts"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 118 - "policies.test.ts"
Cohesion: 0.15
Nodes (12): AiUnavailableError, createAi(), appAiChat(), createStorage(), putObject(), MAX_PROJECT_STORAGE_BYTES, StorageLimitError, StoredObject (+4 more)

### Community 119 - "integrations/github.ts"
Cohesion: 0.18
Nodes (14): createGithubImportService(), apps, imports, legacy, ports(), sync, blobSha(), gh() (+6 more)

### Community 120 - "Panel de administración del sistema — diseño"
Cohesion: 0.08
Nodes (24): 10. Documentación, 1. Capa de datos, 2. Ajustes globales, 4. Playground de agentes, 5. Enrutador, 7. Studio, 8. Errores y seguridad, Almacén (+16 more)

### Community 121 - "PostgresProjectFileRepository"
Cohesion: 0.10
Nodes (24): analyzeHeuristic(), analyzeRequest(), pick(), maxTokensFor(), ROLES, useFastPath(), createTurnFeedback(), penalizeTurn() (+16 more)

### Community 122 - "usage/usage.ts"
Cohesion: 0.15
Nodes (8): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, countAction, mocks

### Community 123 - "Audit.tsx"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 124 - "domain/messages.ts"
Cohesion: 0.13
Nodes (23): anthropicChat(), FUSION_BUDGETS, Block, LlmMessage, LlmRequest, LlmResponse, LlmTool, textOf() (+15 more)

### Community 125 - "log"
Cohesion: 0.20
Nodes (4): log(), ProjectSandbox, SandboxRunError, ServicePool

### Community 126 - "models/presentation/Models.tsx"
Cohesion: 0.20
Nodes (8): PostgresCollaborationAccountRepository, CollaborationAccount, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository, sendInvitation

### Community 127 - "projectMicroservices.test.ts"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 128 - "ProjectSnapshot"
Cohesion: 0.24
Nodes (4): ResolvedApp, AppTarget, ProjectSnapshot, project

### Community 129 - "adminServer.ts"
Cohesion: 0.20
Nodes (15): branchName(), createGithubAppService(), installation(), requireApp(), selectRepository(), GithubApp, Installation, pageNumber() (+7 more)

### Community 130 - "Evals.tsx"
Cohesion: 0.22
Nodes (11): api, evaluationsController, Agg, EvalCfg, Evals(), Metric(), money(), RunDetail (+3 more)

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
Cohesion: 0.27
Nodes (3): DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket

### Community 136 - "ProjectServices"
Cohesion: 0.20
Nodes (4): CoreModulesDependencies, ProjectsModuleDependencies, ProjectServices, endpoint()

### Community 137 - "e2e.mjs"
Cohesion: 0.11
Nodes (9): assertPublic(), fetchPublicText(), isPrivate(), DATA, jar, req(), ROOT, server (+1 more)

### Community 139 - "services"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 140 - "Review Focus"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 141 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 142 - "ports/context.ts"
Cohesion: 0.05
Nodes (21): AiBlock, AiContextMetrics, AiFusionTrace, AiUsage, AppAiInput, AppAiResult, AppUser, CheckoutInput (+13 more)

### Community 143 - "transports/mcp.test.ts"
Cohesion: 0.25
Nodes (6): createMcpHandler(), account, collaboration, handleMcp, identity, projects

### Community 144 - "oauth.ts"
Cohesion: 0.07
Nodes (36): @hono/node-server, accountFromOAuthAccessToken(), authorizationHtml(), createMcpOAuthRouter(), digest(), escapeHtml(), issueTokens(), json() (+28 more)

### Community 147 - "Cómo está hecho"
Cohesion: 0.33
Nodes (6): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, ctx()

### Community 148 - "ApplicationLifecycle"
Cohesion: 0.17
Nodes (6): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown(), shutdown()

### Community 149 - "Desplegar Forja en Coolify"
Cohesion: 0.11
Nodes (15): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+7 more)

### Community 151 - "settingReactions.ts"
Cohesion: 0.46
Nodes (8): build, BROWSER, args, context, dockerfile, build, build, build

### Community 152 - "BuilderRunRegistry"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 153 - "Memory.tsx"
Cohesion: 0.21
Nodes (11): api, memoryController, Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection() (+3 more)

### Community 154 - ".execute"
Cohesion: 0.25
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 155 - "judgeRouting.test.ts"
Cohesion: 0.33
Nodes (5): billing, { callModel }, input, model, scope

### Community 156 - "guides.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 158 - "infrastructure/apps.ts"
Cohesion: 0.16
Nodes (13): AppCredentials, appJwt(), cache, credentials(), generations, githubAppStore, pending, tokenFor() (+5 more)

### Community 160 - "app-runtime"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 161 - "One project: orders API and durable invoice worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 162 - "createCollaborationModule"
Cohesion: 0.17
Nodes (6): MemberQueries, OrganizationNamesQuery, createCollaborationModule(), IMemberQueries, IOrganizationNameDirectory, fixture()

### Community 166 - "GithubProjectPorts"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 167 - "platformDb"
Cohesion: 0.14
Nodes (20): lifecycle, [command, ...flags], main(), monolith, seedDev, seedLocal, lifecycle, monolith (+12 more)

### Community 169 - "config.ts"
Cohesion: 0.12
Nodes (15): vite, DEV_FIXTURE, Fixture, beginTransaction(), dispatch(), sandboxes, WORKER, appPublicUrl() (+7 more)

### Community 196 - "GitHub integration"
Cohesion: 0.50
Nodes (3): GitHub integration, HTTP API, Native imports and synchronization

## Knowledge Gaps
- **20 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1398 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `Chat.tsx`, `q`, `BuilderTurnAdapter.ts`, `react`, `Changes.tsx`, `AgentExecution.ts`, `projects/application/usecases.ts`, `ProjectView.tsx`, `skills.test.ts`, `infrastructure/playground.ts`, `composition.ts`, `FusionOrchestrator.ts`, `crypto.ts`, `adminApi.ts`, `FileMap`, `app-runtime/index.ts`, `RunTaskLaneUseCase.ts`, `model-management/catalog.ts`, `Plan.ts`, `server/index.ts`, `model-management/index.ts`, `modules/builder/index.ts`, `builderServer.ts`, `deps.ts`, `modules/identity/index.ts`, `modules/builder/index.ts`, `modules/project-knowledge/index.ts`, `BuilderToolsAdapter.ts`, `fusion.test.ts`, `adminApi.ts`, `composition.ts`, `policies.test.ts`, `bootstrap/server.ts`, `app-services/context.ts`, `model-management/router.ts`, `application/problems.ts`, `domain/services.ts`, `Account`, `model-management/index.ts`, `ProjectDb`, `application/security.ts`, `dependencies`, `ExecutionMetrics`, `builder/contracts.ts`, `github.mjs`, `infrastructure/cache.ts`, `createJobs`, `FinishGatePolicy.ts`, `platformDb`, `app-runtime/services.test.ts`, `Panel de administración del sistema — diseño`, `collaboration/ports/repositories.ts`, `admission.ts`, `classification.test.ts`, `mcp/server.ts`, `ICollaborationAccountRepository`, `ProjectsApplication.ts`, `app-services/jobs.ts`, `IPasswordHasher`, `model-management/providers.ts`, `starterTemplate.test.ts`, `modules/integrations/application/github.ts`, `Desplegar Forja en Coolify`, `SettingDefinition`, `OrchestrationPolicy.ts`, `sandboxWorker.mjs`, `devDependencies`, `createSecrets`, `policies.test.ts`, `integrations/github.ts`, `Panel de administración del sistema — diseño`, `PostgresProjectFileRepository`, `usage/usage.ts`, `Audit.tsx`, `domain/messages.ts`, `models/presentation/Models.tsx`, `ProjectSnapshot`, `adminServer.ts`, `AccountLifecycleRepository`, `mcp/jobs.ts`, `e2e.mjs`, `ProjectPath`, `transports/mcp.test.ts`, `oauth.ts`, `BuilderRunRegistry`, `ApplicationLifecycle`, `judgeRouting.test.ts`, `guides.ts`, `ApiError`, `infrastructure/apps.ts`, `createCollaborationModule`, `config.ts`?**
  _High betweenness centrality (0.274) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07589781562384303 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Chat.tsx` to `application/problems.ts`, `q`, `BuilderToolsAdapter.ts`, `Evals.tsx`, `Changes.tsx`, `internal/router.ts`, `ISettingsStore`, `integrations/index.ts`, `infrastructure/playground.ts`, `forms.tsx`, `FileMap`, `ProjectView.tsx`, `models/presentation/Models.tsx`, `scripts`, `Memory.tsx`, `Audit.tsx`, `model-management/providers.ts`, `ProjectKnowledge.tsx`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `q` be split into smaller, more focused modules?**
  _Cohesion score 0.04938271604938271 - nodes in this community are weakly interconnected._