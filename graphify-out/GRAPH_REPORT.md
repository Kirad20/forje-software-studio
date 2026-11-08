# Graph Report - connector-oauth-onboarding  (2026-11-08)

## Corpus Check
- 717 files · ~339,738 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 6, .css 6, .example 1)

## Summary
- 4757 nodes · 12518 edges · 185 communities (154 shown, 31 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 642 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6d24109f`
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
- builderService.ts
- FileMap
- appServer.ts
- app-runtime/index.ts
- http.test.ts
- infrastructure/probe.ts
- domain/contracts.ts
- Account
- server/index.ts
- model-management/index.ts
- modules/builder/index.ts
- ServicePanels.tsx
- deps.ts
- modules/identity/index.ts
- modules/builder/index.ts
- application/problems.ts
- modules/project-knowledge/index.ts
- BuilderToolsAdapter.ts
- with
- projectRows.ts
- builderService.ts
- domain/score.ts
- composition.ts
- policies.test.ts
- bootstrap/server.ts
- app-services/context.ts
- createIdentityModule
- model-management/router.ts
- modules/projects/index.ts
- domain/services.ts
- AgentExecution.ts
- model-management/index.ts
- infrastructure/routing.ts
- PostgresProjectsStore
- ProjectView.tsx
- domain/contracts.ts
- dependencies
- q
- skills.test.ts
- PostgresOrganizationRepository.ts
- ref_node_fs
- app-services/auth.ts
- execution-audit/index.ts
- evaluations/bindings.test.ts
- studio.mjs
- ApplicationLifecycle
- BootstrapService
- bundler.ts
- OrganizationSkillsService.ts
- runtime.test.ts
- IPersonalOrganizationRepository
- ProviderService.ts
- github.mjs
- createAdminMcpHandler
- createJobs
- FinishGatePolicy.ts
- toolOutputs.test.ts
- composition.ts
- settings/index.ts
- config.ts
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
- ProjectsApplication.ts
- scripts
- infrastructure/repositories.ts
- createProjectRows
- IPasswordHasher
- model-management/providers.ts
- starterTemplate.test.ts
- mcp/server.ts
- AppEnv
- BuilderWorkflowPorts
- createJobs
- createHttp
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
- createProblemService
- unit/catalog.test.ts
- architecture.test.ts
- forms.tsx
- ProjectPatch
- createSecrets
- AuthPorts
- policies.test.ts
- Panel de administración del sistema — diseño
- PostgresProjectFileRepository
- usage/usage.ts
- Audit.tsx
- domain/messages.ts
- sandbox.ts
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
- createGithubSyncService
- services
- Review Focus
- cli.ts
- oauth.ts
- e2e.mjs
- transports/mcp.test.ts
- guides.ts
- healthcheck
- settingReactions.ts
- BuilderRunRegistry
- .execute
- guides.ts
- ProjectPath
- Plan.tsx
- mcp-oauth.md
- app-runtime
- One project: orders API and durable invoice worker
- createCollaborationModule
- Evals.tsx
- builderServer.ts
- GithubAuthorization
- GithubProjectPorts
- cli.ts
- builder
- AppStore
- infrastructure/apps.ts
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
- ModelClassification.ts
- RealtimeTransport
- GitHub integration
- { prepare: prepareImport, attach: attachImport }
- { start: appStart, finish: appFinish, installStart: appInstallStart, installFinish: appInstallFinish, repositories: listRepositories, branches: listBranches }
- { connectAccount, oauthStart, oauthFinish, getLink, unlink }

## God Nodes (most connected - your core abstractions)
1. `vitest` - 163 edges
2. `q()` - 117 edges
3. `createStudioApi()` - 73 edges
4. `react` - 51 edges
5. `AppEnv` - 47 edges
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

## Communities (185 total, 31 thin omitted)

### Community 0 - "Chat.tsx"
Cohesion: 0.08
Nodes (54): lucide-react, radix-ui, react, api, modelBlockers(), ModelReadiness, playgroundModel(), usableModel() (+46 more)

### Community 1 - "q"
Cohesion: 0.05
Nodes (72): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+64 more)

### Community 2 - "BuilderTurnAdapter.ts"
Cohesion: 0.07
Nodes (16): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, AccountProps, Email, COMMON_PASSWORDS, Password (+8 more)

### Community 3 - "react"
Cohesion: 0.09
Nodes (30): createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), ClassifiedProviderModel (+22 more)

### Community 4 - "bootstrap/server.ts"
Cohesion: 0.05
Nodes (69): Implementation plan document (`static/__dev/plan.md`), describeSchema, CheckPlanUseCase, ReviewAndFixUseCase, ScheduleTasksUseCase, Review, reviewFixTasks(), rewardOf() (+61 more)

### Community 5 - "studioApi.ts"
Cohesion: 0.13
Nodes (36): AnalyticsPanel(), api, filesController, DiffLine, diffLines(), hunks(), baseName(), cache (+28 more)

### Community 6 - "AgentExecution.ts"
Cohesion: 0.06
Nodes (49): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, listEmails, receiveEmail (+41 more)

### Community 7 - "projects/application/usecases.ts"
Cohesion: 0.09
Nodes (31): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KitEntry, BUILTIN_PACKAGES, isValidPackageName(), MANIFEST, packageInfo (+23 more)

### Community 8 - "ProjectView.tsx"
Cohesion: 0.07
Nodes (7): isDevFile(), ProjectsApplication, FileMap, ProjectSnapshot, TurnChanges, createProjectsModule(), ProjectsStore

### Community 9 - "roles.ts"
Cohesion: 0.07
Nodes (37): PLAN_SECTIONS, BUILDER_SYSTEM_PROMPT, AgentToolRole, allowedToolsForRole(), assertRoleToolAccess(), BACKEND, CHECKLIST, CONTRACT (+29 more)

### Community 10 - "database/index.ts"
Cohesion: 0.25
Nodes (23): createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass(), contextMetrics() (+15 more)

### Community 11 - "infrastructure/playground.ts"
Cohesion: 0.09
Nodes (26): ProjectEvent, ProjectLogLine, projectsController, transport, createProjectUseCases(), isProjectLogLine(), isProjectProblem(), isRecord() (+18 more)

### Community 12 - "app-runtime/index.ts"
Cohesion: 0.09
Nodes (17): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, locate(), Problem, ProblemEffects (+9 more)

### Community 13 - "FusionOrchestrator.ts"
Cohesion: 0.11
Nodes (10): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, StaticToolRegistryAdapter (+2 more)

### Community 14 - "http-client.ts"
Cohesion: 0.11
Nodes (18): createCoreModules(), BcryptArgonPasswordHasher, NodeBootstrapCrypto, PostgresLoginCodeRepository, PostgresSessionRepository, burnPasswordCheck(), hashPassword(), LEGACY (+10 more)

### Community 15 - "roles.ts"
Cohesion: 0.18
Nodes (16): auditWindow(), ExecutionAudit, identifier(), AuditContext, AuditFilter, AuditReport, AuditStage, AuditStep (+8 more)

### Community 16 - "ProjectDb"
Cohesion: 0.09
Nodes (43): formatProblem(), pageRoutes(), resolveServiceExecution(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint() (+35 more)

### Community 17 - "builderService.ts"
Cohesion: 0.12
Nodes (11): accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService(), BuilderServiceClient (+3 more)

### Community 18 - "FileMap"
Cohesion: 0.07
Nodes (28): api, billingController, Meter(), Plan(), Usage, api, collaborationController, EMPTY (+20 more)

### Community 19 - "appServer.ts"
Cohesion: 0.08
Nodes (15): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, Cache (+7 more)

### Community 20 - "app-runtime/index.ts"
Cohesion: 0.07
Nodes (25): RuntimeObservationPorts, RuntimeProjectsPort, bindRuntimeObservation(), configureRuntimeProjects(), publication, suggestSlug, AppTarget, bindRuntimeObservation() (+17 more)

### Community 21 - "http.test.ts"
Cohesion: 0.09
Nodes (26): ADMIN_MCP_INSTRUCTIONS, AdminMcpModules, descriptions, fusionCapability, id, modelIds, modelPatch, schemas (+18 more)

### Community 22 - "infrastructure/probe.ts"
Cohesion: 0.22
Nodes (16): 6. API de administración, providerOf(), providers(), call(), ECHO_TOOL, errorOf(), listProviderModels(), ModelProbe (+8 more)

### Community 23 - "domain/contracts.ts"
Cohesion: 0.21
Nodes (11): api, memoryController, Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection() (+3 more)

### Community 25 - "server/index.ts"
Cohesion: 0.12
Nodes (16): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeEvent, createPublication(), assertPublishable(), Author, BuildProblem (+8 more)

### Community 26 - "model-management/index.ts"
Cohesion: 0.11
Nodes (25): Catalog, createModelManagementQueries(), routerAudit(), updateProjectModels(), isMode(), audit(), bindModelAudit(), bindCatalogService() (+17 more)

### Community 27 - "modules/builder/index.ts"
Cohesion: 0.06
Nodes (29): requestSecret, assertProjectObject(), assertSafeAgentSql(), assertSafePreviewSql(), containsDataChange(), containsSchemaChange(), objectName(), redactSqlData() (+21 more)

### Community 28 - "ServicePanels.tsx"
Cohesion: 0.07
Nodes (21): ActiveRun, admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun() (+13 more)

### Community 29 - "deps.ts"
Cohesion: 0.14
Nodes (16): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), OPENROUTER_URL (+8 more)

### Community 30 - "modules/identity/index.ts"
Cohesion: 0.09
Nodes (14): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, ProjectPath, IProjectFileRepository, app, database, pool (+6 more)

### Community 31 - "modules/builder/index.ts"
Cohesion: 0.08
Nodes (32): GATE_FIXES, AgentResult, calculateSpendUseCase, toolRegistry, AgentSpec, runAgent(), ToolContext, readFile() (+24 more)

### Community 32 - "application/problems.ts"
Cohesion: 0.07
Nodes (43): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallContext, InstallEvent (+35 more)

### Community 33 - "modules/project-knowledge/index.ts"
Cohesion: 0.25
Nodes (9): createRouterAdministration(), routerStats(), FusionPattern, RouterPosteriorRow, RouterStats, postgresRouterAdministrationRepository, RouterAdministrationRepository, resetRouter() (+1 more)

### Community 34 - "BuilderToolsAdapter.ts"
Cohesion: 0.07
Nodes (40): dependencies, @anthropic-ai/sdk@^1.3.0, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, hono@^4.13.14, @hono/node-server@^2.1.5, lucide-react@^1.66.0 (+32 more)

### Community 35 - "with"
Cohesion: 0.09
Nodes (29): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+21 more)

### Community 36 - "projectRows.ts"
Cohesion: 0.13
Nodes (12): @electric-sql/pglite, createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask() (+4 more)

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
Cohesion: 0.07
Nodes (34): lifecycle, withDefaultHeaders(), lifecycle, monolith, server, app, handleAdminMcp, handleMcp (+26 more)

### Community 42 - "app-services/context.ts"
Cohesion: 0.10
Nodes (33): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS, JudgeDimension (+25 more)

### Community 43 - "createIdentityModule"
Cohesion: 0.10
Nodes (26): KEYWORDS, RoleProfile, ROLES, Posterior, FUSION_BUDGETS, FusionBudget, FusionEffort, FusionPhase (+18 more)

### Community 44 - "model-management/router.ts"
Cohesion: 0.07
Nodes (10): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+2 more)

### Community 45 - "modules/projects/index.ts"
Cohesion: 0.09
Nodes (19): CoreModulesDependencies, CreateProjectInput, CreateProjectUseCase, ChangeEntry, normalizeProjectProfile(), ProjectProfile, SeoSettings, TurnFileChange (+11 more)

### Community 46 - "domain/services.ts"
Cohesion: 0.09
Nodes (17): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, problemKey(), RuntimeProblem, contractRoutes() (+9 more)

### Community 47 - "AgentExecution.ts"
Cohesion: 0.07
Nodes (40): page(), RunAgentUseCase, summarize(), addUsage(), AgentExecutionSpec, Block, BuilderContextMetrics, BuilderFusionStep (+32 more)

### Community 48 - "model-management/index.ts"
Cohesion: 0.09
Nodes (29): createProjectCheck(), ProjectCompilerPort, createServiceControl(), restart(), scale(), snapshot(), endpointRoutes(), exampleFiles() (+21 more)

### Community 49 - "infrastructure/routing.ts"
Cohesion: 0.07
Nodes (10): PostgresApiTokenRepository, McpOAuthAuthorizationCode, McpOAuthClient, McpOAuthRefreshGrant, AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository (+2 more)

### Community 50 - "PostgresProjectsStore"
Cohesion: 0.07
Nodes (15): CACHE_LIMITS, ProjectCache, AppEnv, AppDataPorts, createAppDataService(), TransactionSession, createProjectCacheRepository(), PROJECT_CACHE_SCHEMA (+7 more)

### Community 51 - "ProjectView.tsx"
Cohesion: 0.06
Nodes (71): api, appServicesController, AddRowDialog(), Analytics, Bars(), Col, DataPanel(), DocsPanel() (+63 more)

### Community 52 - "domain/contracts.ts"
Cohesion: 0.07
Nodes (20): ClaimedJob, AiBlock, AiContextMetrics, AiFusionTrace, AiUsage, AppAiInput, AppAiResult, AppUser (+12 more)

### Community 53 - "dependencies"
Cohesion: 0.13
Nodes (8): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, OrgRole, ICollaborationAccountRepository, IOrganizationRepository

### Community 54 - "q"
Cohesion: 0.07
Nodes (8): PostgresMemberRepository, PostgresOrganizationRepository, PostgresOrganizationSkillsRepository, PostgresPasswordResetRepository, countAction(), usageRepository, q(), mocks

### Community 55 - "skills.test.ts"
Cohesion: 0.07
Nodes (3): PostgresProjectsStore, ProjectOrganizations, QueryHandle

### Community 56 - "PostgresOrganizationRepository.ts"
Cohesion: 0.19
Nodes (7): OrganizationNamesQuery, InviteView, IOrganizationNameDirectory, MemberView, Org, OrgMemberView, OrganizationRecord

### Community 57 - "ref_node_fs"
Cohesion: 0.08
Nodes (19): ListAgentTasksUseCase, RunTaskLaneUseCase, TaskLifecycleUseCase, AgentEvent, AgentExecutionResult, requiresFinishGate(), TurnState, SqlAgentTaskRepository (+11 more)

### Community 58 - "app-services/auth.ts"
Cohesion: 0.13
Nodes (9): AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts, resolveApp() (+1 more)

### Community 59 - "execution-audit/index.ts"
Cohesion: 0.17
Nodes (23): sessionCookie(), endSession, testSession, EvalError, RunRequest, EVAL_EMAIL, spentLast24h(), defaultJudge() (+15 more)

### Community 60 - "evaluations/bindings.test.ts"
Cohesion: 0.14
Nodes (21): removeProjectData, removeProjectData(), designSignals, ensureEvalAccount(), sweepEvalProjects(), evaluationBuilder(), evaluationResources(), playgroundRoles() (+13 more)

### Community 61 - "studio.mjs"
Cohesion: 0.09
Nodes (29): app, DATA, app, DATA, MODELS, ROOT, SEED, MODELS (+21 more)

### Community 62 - "ApplicationLifecycle"
Cohesion: 0.17
Nodes (6): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown(), shutdown()

### Community 63 - "BootstrapService"
Cohesion: 0.12
Nodes (36): app, monolith, runtimePorts, startHttp(), wss, applyProjectMigrations(), applyProjectMigrationsLocal(), assertRuntimeSql() (+28 more)

### Community 64 - "bundler.ts"
Cohesion: 0.09
Nodes (28): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, vitest, ROOT_DIR, migrate(), MIGRATIONS_DIR, createTestCoreModules() (+20 more)

### Community 65 - "OrganizationSkillsService.ts"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 67 - "IPersonalOrganizationRepository"
Cohesion: 0.13
Nodes (21): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+13 more)

### Community 68 - "ProviderService.ts"
Cohesion: 0.11
Nodes (5): Project, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 69 - "github.mjs"
Cohesion: 0.08
Nodes (26): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, toolByName, getProject(), buildIndex(), cache, declaredDeps(), factsOf(), FileFacts (+18 more)

### Community 70 - "createAdminMcpHandler"
Cohesion: 0.26
Nodes (11): createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists(), admin, call() (+3 more)

### Community 71 - "createJobs"
Cohesion: 0.07
Nodes (15): Run, AppUser, createProjectCache(), createContext(), serviceContext(), EndpointContext, enqueue(), HttpError (+7 more)

### Community 72 - "FinishGatePolicy.ts"
Cohesion: 0.09
Nodes (14): createMemoryService(), listMemories(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind (+6 more)

### Community 73 - "toolOutputs.test.ts"
Cohesion: 0.20
Nodes (4): dir, BEFORE, conforms(), dir

### Community 74 - "composition.ts"
Cohesion: 0.18
Nodes (19): createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureSecretIntegrations(), initializeAppServices, bindEvaluationBuilder(), bindEvaluationResources() (+11 more)

### Community 75 - "settings/index.ts"
Cohesion: 0.14
Nodes (7): PersonalOrganizationUseCase, Organization, OrganizationProps, CollaborationModuleDependencies, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 76 - "config.ts"
Cohesion: 0.08
Nodes (37): Task 3: Proveedores y modelos en BD + seeders, 3. Proveedores y modelos, `llm/catalog.ts`, Pruebas de conexión, Tablas (`002_admin.sql`), tasks, runBudget(), admitPlayground() (+29 more)

### Community 77 - "Panel de administración del sistema — diseño"
Cohesion: 0.19
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 78 - "index.tsx"
Cohesion: 0.16
Nodes (17): hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups (+9 more)

### Community 79 - "createCollaborationModule"
Cohesion: 0.14
Nodes (20): Deps, packageName(), EndpointInfo, JobInfo, PageInfo, BuildError, bundleBrowser(), compileCache (+12 more)

### Community 80 - "OrgRole"
Cohesion: 0.15
Nodes (7): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, RemoveMemberUseCase, Access, MemberAccess, IMemberRepository

### Community 81 - "ref_node_url"
Cohesion: 0.07
Nodes (28): playwright-core@1.64.1, playwright-core, vite, AUTHORED_SKILLS, readVendored(), Skill, unix(), VENDORED (+20 more)

### Community 82 - "adminApi.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 83 - "memory/application/service.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 84 - "agents.mjs"
Cohesion: 0.26
Nodes (14): speedFor(), tierFor(), createCatalogSync(), lastSync(), startCatalogSync(), syncOpenRouter(), createPlatformProviderService(), deleteProvider() (+6 more)

### Community 85 - "mcp/server.ts"
Cohesion: 0.14
Nodes (15): buildServer(), CONTEXT_TOOLS, DESTRUCTIVE, expectedVersionProp, extraTools, Hints, hintsOf(), McpModules (+7 more)

### Community 86 - "InviteMemberUseCase.ts"
Cohesion: 0.13
Nodes (8): InviteMemberResult, InviteMemberUseCase, ProjectTarget, ProjectInvite, ProjectInviteProps, PlatformCollaborationMailerService, ICollaborationMailerService, SendInvitationParams

### Community 87 - "ProjectsApplication.ts"
Cohesion: 0.22
Nodes (7): CreateCheckpointUseCase, Author, beforeImages(), restoredFiles(), turnFileChange(), Checkpoint, CheckpointProps

### Community 88 - "scripts"
Cohesion: 0.16
Nodes (17): clsx@^2.1.1, sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card() (+9 more)

### Community 89 - "infrastructure/repositories.ts"
Cohesion: 0.07
Nodes (21): AiUnavailableError, createAi(), appAiChat(), bindJobs, aiPorts, emailPorts, resetTransport(), jobPorts (+13 more)

### Community 90 - "createProjectRows"
Cohesion: 0.20
Nodes (17): PlatformSettingType, SettingDef, SettingGroup, SettingView, MOVED_ENV, createPlatformSettings(), byKey, Def (+9 more)

### Community 91 - "IPasswordHasher"
Cohesion: 0.17
Nodes (5): PlatformSettingsService, PostgresPlatformSettingsStoreAdapter, SettingsDependencies, fixture(), fixture()

### Community 92 - "model-management/providers.ts"
Cohesion: 0.15
Nodes (14): react-dom@^19.3.1, react-dom, serviceControlController, transport, Actions, failed(), Filter, KIND_LABEL (+6 more)

### Community 93 - "starterTemplate.test.ts"
Cohesion: 0.19
Nodes (6): BootstrapService, SetupError, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 94 - "mcp/server.ts"
Cohesion: 0.18
Nodes (14): createGithubImportService(), apps, imports, legacy, ports(), sync, blobSha(), gh() (+6 more)

### Community 95 - "AppEnv"
Cohesion: 0.12
Nodes (19): createModelRouter(), pick(), maxTokensFor(), validateToolInput(), author, features, gemini, gpt (+11 more)

### Community 96 - "BuilderWorkflowPorts"
Cohesion: 0.10
Nodes (21): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+13 more)

### Community 97 - "createJobs"
Cohesion: 0.16
Nodes (20): createJobQueue(), poll(), processJob(), pump(), start(), stop(), createJobs(), addTimer() (+12 more)

### Community 98 - "createHttp"
Cohesion: 0.25
Nodes (4): { apiUrl }, ApiError, createHttp(), HttpTransport

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
Nodes (20): api, integrationsController, GithubAccount, GithubRepository, GithubSelection, GithubCard, GithubCommitCard(), GithubSection() (+12 more)

### Community 103 - "ISettingsStore"
Cohesion: 0.20
Nodes (12): AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes, RouteSpec (+4 more)

### Community 104 - "integrations/index.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 105 - "database/index.ts"
Cohesion: 0.09
Nodes (21): ExecutionContextMetrics, contextFields, contextMetrics(), listFusionTraces(), recordFusionStep(), recordFusionTrace(), recordClassificationUsage(), platformDb (+13 more)

### Community 106 - "BuilderWorkflowPorts"
Cohesion: 0.06
Nodes (16): BuilderWorkflowUseCase, FastBuildUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode, useFastPath() (+8 more)

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

### Community 111 - "createProblemService"
Cohesion: 0.47
Nodes (9): createProblemService(), changed(), clearProblems(), fromLog(), listProblems(), recheckBuild(), stopProblems(), upsert() (+1 more)

### Community 112 - "unit/catalog.test.ts"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 113 - "architecture.test.ts"
Cohesion: 0.27
Nodes (9): createClient(), ChatMessage, createAi(), createApiWorkflow(), createAuth(), createRealtime(), createStorage(), StoredFile (+1 more)

### Community 114 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 116 - "createSecrets"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 117 - "AuthPorts"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 118 - "policies.test.ts"
Cohesion: 0.06
Nodes (27): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), createEmail(), sendEmail() (+19 more)

### Community 120 - "Panel de administración del sistema — diseño"
Cohesion: 0.05
Nodes (40): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+32 more)

### Community 121 - "PostgresProjectFileRepository"
Cohesion: 0.10
Nodes (25): analyzeHeuristic(), analyzeRequest(), useFastPath(), createTurnFeedback(), penalizeTurn(), posteriors, gamma(), gaussian() (+17 more)

### Community 122 - "usage/usage.ts"
Cohesion: 0.20
Nodes (5): createUsageService(), DAILY_ACTIONS, UsageRepository, actionsToday, countAction

### Community 123 - "Audit.tsx"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 124 - "domain/messages.ts"
Cohesion: 0.11
Nodes (23): anthropicChat(), Block, LlmMessage, LlmRequest, LlmResponse, LlmTool, CompatEndpoint, anthropicChat() (+15 more)

### Community 125 - "sandbox.ts"
Cohesion: 0.08
Nodes (26): ServiceExecution, checkProject, beginTransaction(), dispatch(), getSandboxServices(), ProjectSandbox, restartSandboxService(), RunInput (+18 more)

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
Cohesion: 0.20
Nodes (15): branchName(), createGithubAppService(), installation(), requireApp(), selectRepository(), GithubApp, Installation, pageNumber() (+7 more)

### Community 130 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.15
Nodes (8): createGithubAccountService(), connectAccount(), GithubAccountRepository, RepoSelection, Link, SyncResult, PreparedImport, setup()

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
Cohesion: 0.16
Nodes (9): createRealtime(), attachSocket(), publish(), publishPresence(), stopRealtime(), DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket (+1 more)

### Community 138 - "createGithubSyncService"
Cohesion: 0.29
Nodes (8): buildGraphView(), GraphCard, GraphConnection, GraphEdge, GraphNode, GraphQuestion, ProjectGraph, ProjectKnowledge()

### Community 139 - "services"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 140 - "Review Focus"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 144 - "oauth.ts"
Cohesion: 0.08
Nodes (33): accountFromOAuthAccessToken(), authorizationHtml(), createMcpOAuthRouter(), digest(), escapeHtml(), issueTokens(), json(), noStore (+25 more)

### Community 145 - "e2e.mjs"
Cohesion: 0.11
Nodes (9): assertPublic(), fetchPublicText(), isPrivate(), DATA, jar, req(), ROOT, server (+1 more)

### Community 147 - "transports/mcp.test.ts"
Cohesion: 0.25
Nodes (6): createMcpHandler(), account, collaboration, handleMcp, identity, projects

### Community 148 - "guides.ts"
Cohesion: 0.22
Nodes (12): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), readGuides() (+4 more)

### Community 150 - "healthcheck"
Cohesion: 0.16
Nodes (6): BeforeImage, ProjectProps, PostgresProjectFileRepository, PATCHABLE, ProjectEventPort, LogChangeInput

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

### Community 162 - "createCollaborationModule"
Cohesion: 0.15
Nodes (6): MemberQueries, OrganizationQueries, createCollaborationModule(), IMemberQueries, IOrganizationQueries, fixture()

### Community 163 - "Evals.tsx"
Cohesion: 0.22
Nodes (11): api, evaluationsController, Agg, EvalCfg, Evals(), Metric(), money(), RunDetail (+3 more)

### Community 164 - "builderServer.ts"
Cohesion: 0.12
Nodes (14): startAppRuntimeEventRelay(), app, lifecycle, monolith, stopRuntimeEventRelay(), BuilderRunRegistry, isBuilding(), runBuilderTurn() (+6 more)

### Community 166 - "GithubProjectPorts"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 167 - "cli.ts"
Cohesion: 0.17
Nodes (13): [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed(), DEV_FIXTURE, Fixture (+5 more)

### Community 170 - "infrastructure/apps.ts"
Cohesion: 0.16
Nodes (13): AppCredentials, appJwt(), cache, credentials(), generations, githubAppStore, pending, tokenFor() (+5 more)

### Community 193 - "ModelClassification.ts"
Cohesion: 0.16
Nodes (16): ClassificationPorts, createModelClassification(), importProviderModels(), parseModelClassifications(), addUsage(), emptyUsage(), billing, { callModel } (+8 more)

### Community 196 - "GitHub integration"
Cohesion: 0.50
Nodes (3): GitHub integration, HTTP API, Native imports and synchronization

## Knowledge Gaps
- **20 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1402 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `bundler.ts` to `Chat.tsx`, `q`, `BuilderTurnAdapter.ts`, `react`, `studioApi.ts`, `roles.ts`, `infrastructure/playground.ts`, `app-runtime/index.ts`, `FusionOrchestrator.ts`, `http-client.ts`, `roles.ts`, `builderService.ts`, `FileMap`, `app-runtime/index.ts`, `http.test.ts`, `infrastructure/probe.ts`, `server/index.ts`, `model-management/index.ts`, `modules/builder/index.ts`, `ServicePanels.tsx`, `deps.ts`, `modules/identity/index.ts`, `modules/builder/index.ts`, `modules/project-knowledge/index.ts`, `BuilderToolsAdapter.ts`, `projectRows.ts`, `builderService.ts`, `composition.ts`, `policies.test.ts`, `bootstrap/server.ts`, `app-services/context.ts`, `modules/projects/index.ts`, `domain/services.ts`, `AgentExecution.ts`, `model-management/index.ts`, `PostgresProjectsStore`, `dependencies`, `q`, `ref_node_fs`, `evaluations/bindings.test.ts`, `ApplicationLifecycle`, `BootstrapService`, `runtime.test.ts`, `github.mjs`, `createAdminMcpHandler`, `createJobs`, `FinishGatePolicy.ts`, `toolOutputs.test.ts`, `composition.ts`, `Panel de administración del sistema — diseño`, `index.tsx`, `OrgRole`, `adminApi.ts`, `agents.mjs`, `InviteMemberUseCase.ts`, `ProjectsApplication.ts`, `infrastructure/repositories.ts`, `IPasswordHasher`, `model-management/providers.ts`, `starterTemplate.test.ts`, `mcp/server.ts`, `AppEnv`, `createHttp`, `Desplegar Forja en Coolify`, `SettingDefinition`, `database/index.ts`, `BuilderWorkflowPorts`, `sandboxWorker.mjs`, `createSecrets`, `AuthPorts`, `policies.test.ts`, `PostgresProjectFileRepository`, `usage/usage.ts`, `Audit.tsx`, `domain/messages.ts`, `sandbox.ts`, `models/presentation/Models.tsx`, `adminServer.ts`, `collaboration/postgresAdapters.test.ts`, `AccountLifecycleRepository`, `mcp/jobs.ts`, `oauth.ts`, `e2e.mjs`, `transports/mcp.test.ts`, `guides.ts`, `guides.ts`, `createCollaborationModule`, `builderServer.ts`, `infrastructure/apps.ts`, `ModelClassification.ts`?**
  _High betweenness centrality (0.251) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0800804828973843 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Chat.tsx` to `application/problems.ts`, `q`, `BuilderToolsAdapter.ts`, `Evals.tsx`, `studioApi.ts`, `internal/router.ts`, `ISettingsStore`, `integrations/index.ts`, `createGithubSyncService`, `infrastructure/playground.ts`, `forms.tsx`, `ProjectView.tsx`, `FileMap`, `domain/contracts.ts`, `scripts`, `Audit.tsx`, `model-management/providers.ts`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `q` be split into smaller, more focused modules?**
  _Cohesion score 0.046785225718194254 - nodes in this community are weakly interconnected._