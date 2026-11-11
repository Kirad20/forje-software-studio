# Graph Report - porbeagle  (2026-11-10)

## Corpus Check
- 725 files · ~355,883 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 6, .css 6, .example 1)

## Summary
- 4872 nodes · 12886 edges · 213 communities (174 shown, 39 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 673 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ff11ea48`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ProjectView.tsx
- studioApi.ts
- BuilderTurnAdapter.ts
- infrastructure/projectDb.ts
- bootstrap/server.ts
- Chat.tsx
- domain/services.ts
- projects/application/usecases.ts
- ports/ai.ts
- ProjectsStore
- App.tsx
- infrastructure/playground.ts
- BuilderWorkflowPorts
- FusionOrchestrator.ts
- ref_node_fs
- createSecrets
- ProjectDb
- domain/routing.ts
- FileMap
- app-runtime/index.ts
- application/problems.ts
- bundler.ts
- FileMap
- modules/identity/index.ts
- model-management/index.ts
- server/index.ts
- composition.ts
- modules/builder/index.ts
- config.ts
- appRuntimeServer.ts
- AccountLifecycleRepository
- projects/application/usecases.ts
- application/problems.ts
- AppEnv
- IPersonalOrganizationRepository
- modules/projects/index.ts
- deps.ts
- modules/project-knowledge/index.ts
- infrastructure/routing.ts
- fusion.test.ts
- ISessionRepository
- roles.ts
- app-services/context.ts
- createIdentityModule
- app-runtime/infrastructure/browser.ts
- project-observability/security.ts
- infrastructure/routing.ts
- domain/score.ts
- AgentExecution.ts
- ref_node_path
- platformDb
- usage/usage.ts
- OrgRole
- infrastructure/repositories.ts
- projectIndex.ts
- skills.test.ts
- oauth.ts
- classification.test.ts
- infrastructure/runner.ts
- model-management/catalog.ts
- adminServer.ts
- collaboration/ports/repositories.ts
- accountLifecycle.ts
- OrganizationSkillsService.ts
- PostgresProviderRepository.ts
- OrganizationSkillsService.ts
- FusionOrchestrator.ts
- model-management/router.ts
- ProjectDb
- execution-audit/index.ts
- integrations/github.ts
- createJobs
- Author
- application/context.ts
- GithubError
- Plan.ts
- app-services/analytics.ts
- Panel de administración del sistema — diseño
- http.test.ts
- app-services/email.ts
- PostgresProjectsStore
- settings/index.ts
- platform.ts
- bootstrap/server.ts
- mcp/server.ts
- skillLibrary.ts
- PlatformSettingsService
- infrastructure/playground.ts
- app-services/realtime.ts
- createAuth
- adminApi.ts
- Review Focus
- model-management/providers.ts
- starterTemplate.test.ts
- accountLifecycle.ts
- createJobs
- executeRun
- springRuntime.ts
- OrgRole
- SqlAgentTaskRepository.ts
- bootstrap/coreModules.ts
- SettingDefinition
- createCollaborationModule
- client.ts
- model-management/providers.ts
- ref_node_http
- collaboration/ports/repositories.ts
- sandboxWorker.mjs
- projectRows.ts
- accountLifecycle.ts
- IntegrationRepository
- sandboxWorker.mjs
- Evals.tsx
- architecture.test.ts
- client/index.ts
- Workspace.tsx
- sandbox.ts
- builderServer.ts
- infrastructure/cache.ts
- Desplegar Forja en Coolify
- createGithubSyncService
- PostgresProjectFileRepository
- github.mjs
- devDependencies
- BuilderWorkflowPorts
- app-services/context.ts
- collaboration/postgresAdapters.test.ts
- infrastructure/probe.ts
- admission.ts
- mcp/jobs.ts
- BuilderRunRegistry
- Backends en otros lenguajes (Java / Spring Boot)
- modules/projects/index.ts
- Audit.tsx
- Changes.tsx
- http.test.ts
- ProjectServices
- jobWorkerServer.ts
- e2e.mjs
- services
- internal/router.ts
- ServiceControlPanel.tsx
- Cómo está hecho
- modules/integrations/application/github.ts
- ProjectKnowledge.tsx
- services
- Inventario de funciones de Lovable → Forja
- PostgresProjectFileRepository
- postgres
- healthcheck
- createJobQueue
- agents.mjs
- shared/security.ts
- guides.ts
- .execute
- app-runtime
- guides.ts
- AppStore
- languages.ts
- ApplicationLifecycle
- PostgresCatalogRepository.ts
- One project: orders API and durable invoice worker
- job-worker
- motion.tsx
- Account
- studio.mjs
- adminServer.ts
- AuthPorts
- forja
- Panel de administración del sistema — diseño
- one
- BuilderServiceClient
- PostgresPasswordResetRepository
- GithubGateway
- GitHub integration
- JobCron
- IdentityRandom
- motion.tsx
- ApiError
- CLAUDE.md
- Durable jobs worker
- CoreModulesDependencies
- service-worker.js
- { api, auth, storage, ai }
- { BuildError, buildClient, buildExamples, checkProject, compileServerModule, endpointRoutes, pageRoutes, exampleFiles, jobFiles, readJobSettings, formatProblem }
- { BUILTIN_PACKAGES, MANIFEST, readDeps, writeDeps, isValidPackageName, packageName, isNodeBuiltin, depsDir, ensureDeps, resolvePackage, withManifestLock }
- { publishProject, unpublishProject }
- { quickScan, findSecret, formatFinding }
- TEST_DATABASE_URL
- { prepare: prepareImport, attach: attachImport }
- { start: appStart, finish: appFinish, installStart: appInstallStart, installFinish: appInstallFinish, repositories: listRepositories, branches: listBranches }
- { syncProject, holdSync, releaseSync, watchLinked, startGithubSync, stopGithubSync, reschedulePoll }
- { getSecurity, saveScan, startDeepScan, setIgnored }
- TEST_DATABASE_URL
- createHttp
- transports/mcp.test.ts
- GithubProjectPorts
- GithubRepository
- RealtimeTransport
- vitest
- Inventario de interfaz de Floot → Forja
- localSeed.ts
- integrations/boundaries.test.ts
- unit/catalog.test.ts
- agentCompact.test.ts
- judgeRouting.test.ts
- IdentityRandom
- PostgresMcpOAuthRepository.ts
- 3. Proveedores y modelos
- identity/boundaries.test.ts

## God Nodes (most connected - your core abstractions)
1. `vitest` - 164 edges
2. `q()` - 117 edges
3. `createStudioApi()` - 76 edges
4. `AppEnv` - 59 edges
5. `react` - 52 edges
6. `createIdentityModule()` - 46 edges
7. `one()` - 43 edges
8. `ProjectsStore` - 40 edges
9. `config` - 40 edges
10. `createProjectsModule()` - 39 edges

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

## Communities (213 total, 39 thin omitted)

### Community 0 - "ProjectView.tsx"
Cohesion: 0.10
Nodes (54): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+46 more)

### Community 1 - "studioApi.ts"
Cohesion: 0.08
Nodes (38): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, suggestSlug, addTimer, cancelTimer, enqueueJob (+30 more)

### Community 2 - "BuilderTurnAdapter.ts"
Cohesion: 0.07
Nodes (25): requestSecret, assertProjectObject(), assertSafeAgentSql(), assertSafePreviewSql(), containsDataChange(), containsSchemaChange(), objectName(), redactSqlData() (+17 more)

### Community 3 - "infrastructure/projectDb.ts"
Cohesion: 0.17
Nodes (27): publication, applyProjectMigrations(), applyProjectMigrationsLocal(), assertRuntimeSql(), checksum(), cloneDatabase(), closeAll(), closeProject() (+19 more)

### Community 4 - "bootstrap/server.ts"
Cohesion: 0.08
Nodes (56): lucide-react, radix-ui, react, api, modelBlockers(), ModelReadiness, playgroundModel(), usableModel() (+48 more)

### Community 5 - "Chat.tsx"
Cohesion: 0.05
Nodes (71): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+63 more)

### Community 6 - "domain/services.ts"
Cohesion: 0.11
Nodes (26): createServiceControl(), restart(), scale(), snapshot(), endpointRoutes(), jobFiles(), ControlledService, RuntimeService (+18 more)

### Community 7 - "projects/application/usecases.ts"
Cohesion: 0.10
Nodes (25): createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), ClassificationPorts (+17 more)

### Community 8 - "ports/ai.ts"
Cohesion: 0.08
Nodes (19): AiBlock, AiContextMetrics, AiFusionTrace, AiUsage, AppAiInput, AppAiResult, AppUser, CheckoutInput (+11 more)

### Community 9 - "ProjectsStore"
Cohesion: 0.07
Nodes (6): isDevFile(), ProjectsApplication, ProjectSnapshot, createProjectsModule(), ProjectsStore, fixture()

### Community 10 - "App.tsx"
Cohesion: 0.06
Nodes (45): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallContext, InstallEvent (+37 more)

### Community 11 - "infrastructure/playground.ts"
Cohesion: 0.06
Nodes (60): Implementation plan document (`static/__dev/plan.md`), describeSchema, ScheduleTasksUseCase, rewardOf(), checkPlanDoc(), criteriaOf(), planOverview(), formatStandard() (+52 more)

### Community 12 - "BuilderWorkflowPorts"
Cohesion: 0.09
Nodes (21): BuilderWorkflowUseCase, FastBuildUseCase, ReviewAndFixUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode (+13 more)

### Community 13 - "FusionOrchestrator.ts"
Cohesion: 0.08
Nodes (22): api, billingController, Meter(), Plan(), Usage, createEvaluationUseCases(), createIdentityUseCases(), api (+14 more)

### Community 14 - "ref_node_fs"
Cohesion: 0.06
Nodes (34): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, vitest, DEV_FIXTURE, Fixture, ROOT_DIR, migrate() (+26 more)

### Community 15 - "createSecrets"
Cohesion: 0.16
Nodes (5): createSecrets(), projectSecretEnv(), secretEnv(), SECRET_NAME, SecretPorts

### Community 16 - "ProjectDb"
Cohesion: 0.10
Nodes (11): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, ROLE_TOOLS (+3 more)

### Community 17 - "domain/routing.ts"
Cohesion: 0.10
Nodes (30): AgentSpec, TurnState, KEYWORDS, RoleProfile, ExecutionContextMetrics, FusionBudget, FusionEffort, FusionStep (+22 more)

### Community 18 - "FileMap"
Cohesion: 0.12
Nodes (35): formatProblem(), pageRoutes(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle() (+27 more)

### Community 19 - "app-runtime/index.ts"
Cohesion: 0.11
Nodes (22): RuntimeObservationPorts, RuntimeProjectsPort, bindRuntimeObservation(), configureRuntimeProjects(), AppTarget, bindRuntimeObservation(), observation(), projectEvents (+14 more)

### Community 20 - "application/problems.ts"
Cohesion: 0.08
Nodes (22): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, createProblemService(), changed(), clearProblems() (+14 more)

### Community 21 - "bundler.ts"
Cohesion: 0.14
Nodes (22): Deps, packageName(), EndpointInfo, exampleFiles(), JobInfo, PageInfo, readJobSettings(), BuildError (+14 more)

### Community 22 - "FileMap"
Cohesion: 0.09
Nodes (19): createBuildVerification(), PackageRegistryPort, BuildPorts, PublicationPorts, RuntimeEvent, createProjectCheck(), ProjectCompilerPort, createPublication() (+11 more)

### Community 23 - "modules/identity/index.ts"
Cohesion: 0.12
Nodes (9): RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, IdentityModuleDependencies, PlatformMailerService, IdentityAccountsDependencies, IAccountRepository, ILoginCodeRepository (+1 more)

### Community 24 - "model-management/index.ts"
Cohesion: 0.11
Nodes (25): Catalog, createModelManagementQueries(), routerAudit(), updateProjectModels(), isMode(), createModelRouter(), taskClassOf(), bindModelAudit() (+17 more)

### Community 25 - "server/index.ts"
Cohesion: 0.20
Nodes (19): api, integrationsController, GithubAccount, GithubRepository, GithubSelection, GithubCard, GithubCommitCard(), GithubSection() (+11 more)

### Community 26 - "composition.ts"
Cohesion: 0.14
Nodes (24): createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureAppServiceObserver(), configureSecretIntegrations(), initializeAppServices, bindEvaluationBuilder() (+16 more)

### Community 27 - "modules/builder/index.ts"
Cohesion: 0.08
Nodes (15): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, Cache (+7 more)

### Community 28 - "config.ts"
Cohesion: 0.10
Nodes (22): storagePorts, appJwt(), cache, credentials(), generations, githubAppStore, pending, tokenFor() (+14 more)

### Community 29 - "appRuntimeServer.ts"
Cohesion: 0.09
Nodes (17): AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts, resolveApp() (+9 more)

### Community 31 - "projects/application/usecases.ts"
Cohesion: 0.07
Nodes (41): ProjectEvent, ProjectLogLine, projectsController, transport, CreateProjectOptions, createProjectUseCases(), isProjectLogLine(), isProjectProblem() (+33 more)

### Community 32 - "application/problems.ts"
Cohesion: 0.07
Nodes (39): dependencies, @anthropic-ai/sdk@^1.3.0, clsx@^2.1.1, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, hono@^4.13.14, lucide-react@^1.66.0 (+31 more)

### Community 33 - "AppEnv"
Cohesion: 0.16
Nodes (4): AppEnv, ProjectDbClient, JobsApi, ProjectRowsPort

### Community 34 - "IPersonalOrganizationRepository"
Cohesion: 0.14
Nodes (7): PersonalOrganizationUseCase, Organization, OrganizationProps, CollaborationModuleDependencies, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 35 - "modules/projects/index.ts"
Cohesion: 0.09
Nodes (14): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, ProjectPath, IProjectFileRepository, app, database, pool (+6 more)

### Community 36 - "deps.ts"
Cohesion: 0.10
Nodes (29): createDependencyResolution(), KIT_BUILTIN, KitEntry, BUILTIN_PACKAGES, isValidPackageName(), MANIFEST, packageInfo, readDeps() (+21 more)

### Community 37 - "modules/project-knowledge/index.ts"
Cohesion: 0.10
Nodes (18): createKnowledgeService(), KnowledgeEngine, KnowledgeFiles, prepareCorpus(), KnowledgeAnswer, KnowledgeEdge, KnowledgeGraph, KnowledgeNode (+10 more)

### Community 38 - "infrastructure/routing.ts"
Cohesion: 0.22
Nodes (11): createRouterAdministration(), routerStats(), meanOf(), FusionPattern, RouterPosteriorRow, RouterStats, listFusionTraces(), postgresRouterAdministrationRepository (+3 more)

### Community 39 - "fusion.test.ts"
Cohesion: 0.12
Nodes (16): validateToolInput(), author, features, gemini, gpt, reply(), req, review() (+8 more)

### Community 40 - "ISessionRepository"
Cohesion: 0.14
Nodes (3): LoginWithPasswordUseCase, IPasswordHasher, ISessionRepository

### Community 41 - "roles.ts"
Cohesion: 0.06
Nodes (37): PLAN_DOC, PLAN_SECTIONS, BUILDER_SYSTEM_PROMPT, AgentToolRole, allowedToolsForRole(), assertRoleToolAccess(), BACKEND, CHECKLIST (+29 more)

### Community 42 - "app-services/context.ts"
Cohesion: 0.06
Nodes (16): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+8 more)

### Community 43 - "createIdentityModule"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 44 - "app-runtime/infrastructure/browser.ts"
Cohesion: 0.09
Nodes (28): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+20 more)

### Community 45 - "project-observability/security.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 46 - "infrastructure/routing.ts"
Cohesion: 0.12
Nodes (23): anthropicChat(), FUSION_BUDGETS, Block, LlmMessage, LlmRequest, LlmResponse, LlmTool, textOf() (+15 more)

### Community 47 - "domain/score.ts"
Cohesion: 0.09
Nodes (35): PageInspection, EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS (+27 more)

### Community 48 - "AgentExecution.ts"
Cohesion: 0.07
Nodes (39): GATE_FIXES, RunAgentUseCase, summarize(), addUsage(), AgentExecutionSpec, Block, BuilderContextMetrics, BuilderFusionStep (+31 more)

### Community 49 - "ref_node_path"
Cohesion: 0.08
Nodes (23): playwright-core@1.64.1, playwright-core, vite, studioPwa(), here, root, server, types (+15 more)

### Community 50 - "platformDb"
Cohesion: 0.13
Nodes (12): 1. Capa de datos, Conexión, `.env` resultante, Infraestructura, Migraciones, Seeders, platformDb, Tx (+4 more)

### Community 51 - "usage/usage.ts"
Cohesion: 0.15
Nodes (8): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, countAction, mocks

### Community 52 - "OrgRole"
Cohesion: 0.12
Nodes (6): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, IOrganizationRepository

### Community 53 - "infrastructure/repositories.ts"
Cohesion: 0.11
Nodes (22): @electric-sql/pglite, createEmail(), sendEmail(), sendPlatformEmail(), verifiedSender(), projectDb(), authRepository(), createAuthRepository() (+14 more)

### Community 54 - "projectIndex.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 55 - "skills.test.ts"
Cohesion: 0.12
Nodes (5): AdminApiTokenError, IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 56 - "oauth.ts"
Cohesion: 0.11
Nodes (22): accountFromOAuthAccessToken(), authorizationHtml(), createMcpOAuthRouter(), digest(), escapeHtml(), issueTokens(), json(), noStore (+14 more)

### Community 57 - "classification.test.ts"
Cohesion: 0.43
Nodes (6): createModelClassification(), answer(), model, prediction(), scope, setup()

### Community 58 - "infrastructure/runner.ts"
Cohesion: 0.13
Nodes (34): removeProjectData, removeProjectData(), sessionCookie(), endSession, testSession, EvalError, RunRequest, recoverRuns() (+26 more)

### Community 59 - "model-management/catalog.ts"
Cohesion: 0.18
Nodes (18): Task 3: Proveedores y modelos en BD + seeders, `llm/catalog.ts`, tasks, allowedModels(), allowedModels(), availableModels(), catalog(), creditsForUsd() (+10 more)

### Community 60 - "adminServer.ts"
Cohesion: 0.26
Nodes (11): createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists(), admin, call() (+3 more)

### Community 61 - "collaboration/ports/repositories.ts"
Cohesion: 0.10
Nodes (13): InviteMemberResult, InviteMemberUseCase, ProjectTarget, RemoveMemberUseCase, ProjectInvite, ProjectInviteProps, PlatformCollaborationMailerService, PostgresCollaborationAccountRepository (+5 more)

### Community 62 - "accountLifecycle.ts"
Cohesion: 0.14
Nodes (5): PostgresApiTokenRepository, AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository

### Community 63 - "OrganizationSkillsService.ts"
Cohesion: 0.14
Nodes (10): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), PostgresOrganizationSkillsRepository, OrganizationSkillsRepository (+2 more)

### Community 64 - "PostgresProviderRepository.ts"
Cohesion: 0.15
Nodes (14): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), OPENROUTER_URL (+6 more)

### Community 65 - "OrganizationSkillsService.ts"
Cohesion: 0.11
Nodes (5): Project, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 66 - "FusionOrchestrator.ts"
Cohesion: 0.23
Nodes (25): createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass(), contextMetrics() (+17 more)

### Community 67 - "model-management/router.ts"
Cohesion: 0.10
Nodes (24): analyzeHeuristic(), analyzeRequest(), pick(), maxTokensFor(), ROLES, useFastPath(), createTurnFeedback(), penalizeTurn() (+16 more)

### Community 68 - "ProjectDb"
Cohesion: 0.11
Nodes (9): AppDataPorts, createAppDataService(), TransactionSession, ProjectMigration, SqlExecutionResult, TransactionAction, createProjectRowsRepository(), projectRowsRepository (+1 more)

### Community 69 - "execution-audit/index.ts"
Cohesion: 0.18
Nodes (16): auditWindow(), ExecutionAudit, identifier(), AuditContext, AuditFilter, AuditReport, AuditStage, AuditStep (+8 more)

### Community 70 - "integrations/github.ts"
Cohesion: 0.15
Nodes (17): RepoSelection, createGithubImportService(), PreparedImport, apps, imports, legacy, ports(), sync (+9 more)

### Community 71 - "createJobs"
Cohesion: 0.09
Nodes (14): createMemoryService(), listMemories(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind (+6 more)

### Community 72 - "Author"
Cohesion: 0.27
Nodes (4): CreateCheckpointUseCase, Author, Checkpoint, CheckpointProps

### Community 73 - "application/context.ts"
Cohesion: 0.09
Nodes (12): Run, AppUser, createProjectCache(), createContext(), serviceContext(), EndpointContext, enqueue(), HttpError (+4 more)

### Community 74 - "GithubError"
Cohesion: 0.19
Nodes (16): AppCredentials, branchName(), createGithubAppService(), installation(), requireApp(), selectRepository(), GithubApp, Installation (+8 more)

### Community 75 - "Plan.ts"
Cohesion: 0.09
Nodes (27): CheckPlanUseCase, checkContract(), CONTRACT_FILE, contractRoutes(), covers(), MAX_CONTRACT, MAX_GOAL, MAX_PLAN_DOC (+19 more)

### Community 76 - "app-services/analytics.ts"
Cohesion: 0.18
Nodes (10): analyticsSummary, visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays() (+2 more)

### Community 77 - "Panel de administración del sistema — diseño"
Cohesion: 0.16
Nodes (20): clsx, Button, ButtonProps, Badge(), Card(), EmptyState(), ErrorState(), Skeleton() (+12 more)

### Community 78 - "http.test.ts"
Cohesion: 0.08
Nodes (25): confirmPasswordReset, createAppUser, ensureOwnerAdmin, ensureProjectOwner, requestPasswordReset, setTemporaryPassword, signIn, signOut (+17 more)

### Community 79 - "app-services/email.ts"
Cohesion: 0.08
Nodes (17): aiUsage, AiUnavailableError, createAi(), appAiChat(), bindJobs, listEmails, receiveEmail, sendEmail (+9 more)

### Community 80 - "PostgresProjectsStore"
Cohesion: 0.06
Nodes (4): FileMap, PostgresProjectsStore, ProjectOrganizations, QueryHandle

### Community 81 - "settings/index.ts"
Cohesion: 0.20
Nodes (17): PlatformSettingType, SettingDef, SettingGroup, SettingView, MOVED_ENV, createPlatformSettings(), byKey, Def (+9 more)

### Community 82 - "platform.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 83 - "bootstrap/server.ts"
Cohesion: 0.08
Nodes (17): withDefaultHeaders(), app, handleAdminMcp, handleMcp, listening(), monolith, reactions, resolveApp() (+9 more)

### Community 84 - "mcp/server.ts"
Cohesion: 0.13
Nodes (17): buildServer(), CONTEXT_TOOLS, DESTRUCTIVE, expectedVersionProp, extraTools, Hints, hintsOf(), McpModules (+9 more)

### Community 85 - "skillLibrary.ts"
Cohesion: 0.33
Nodes (6): AUTHORED_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO

### Community 86 - "PlatformSettingsService"
Cohesion: 0.17
Nodes (5): PlatformSettingsService, PostgresPlatformSettingsStoreAdapter, SettingsDependencies, fixture(), fixture()

### Community 87 - "infrastructure/playground.ts"
Cohesion: 0.16
Nodes (18): admission, evaluationBuilder(), admitPlayground(), execute(), InternalRun, PLAYGROUND_ROLES, PlaygroundError, PlaygroundRole (+10 more)

### Community 88 - "app-services/realtime.ts"
Cohesion: 0.16
Nodes (9): createRealtime(), attachSocket(), publish(), publishPresence(), stopRealtime(), DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket (+1 more)

### Community 89 - "createAuth"
Cohesion: 0.20
Nodes (16): createAuth(), confirmPasswordReset(), createAppUser(), createSession(), ensureOwnerAdmin(), ensureProjectOwner(), requestPasswordReset(), setTemporaryPassword() (+8 more)

### Community 90 - "adminApi.ts"
Cohesion: 0.19
Nodes (15): hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups (+7 more)

### Community 91 - "Review Focus"
Cohesion: 0.18
Nodes (9): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 2: Registro y almacén de ajustes, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final (+1 more)

### Community 92 - "model-management/providers.ts"
Cohesion: 0.10
Nodes (21): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+13 more)

### Community 93 - "starterTemplate.test.ts"
Cohesion: 0.14
Nodes (6): BootstrapService, SetupError, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 94 - "accountLifecycle.ts"
Cohesion: 0.15
Nodes (11): AccountProps, PlatformRole, Email, COMMON_PASSWORDS, Password, AccountRow, SessionAccountRow, AccountAccessUpdate (+3 more)

### Community 95 - "createJobs"
Cohesion: 0.24
Nodes (14): createJobs(), addTimer(), enqueueJob(), executeJob(), fireDueTimers(), initializeAppServices(), report(), runJob() (+6 more)

### Community 96 - "executeRun"
Cohesion: 0.30
Nodes (4): ActiveRun, executeRun(), RunPorts, CaseResult

### Community 97 - "springRuntime.ts"
Cohesion: 0.07
Nodes (31): APP_DIR, buildCommand(), CACHE_DIR, clip(), detectSpringProject(), isSpringSource(), jarDirectory(), jvmCommand() (+23 more)

### Community 98 - "OrgRole"
Cohesion: 0.10
Nodes (10): OrgRole, PostgresMemberRepository, PostgresOrganizationRepository, IMemberQueries, InviteView, IOrganizationNameDirectory, MemberView, Org (+2 more)

### Community 99 - "SqlAgentTaskRepository.ts"
Cohesion: 0.08
Nodes (20): ListAgentTasksUseCase, RunTaskLaneUseCase, TaskLifecycleUseCase, AgentEvent, AgentExecutionResult, ExecutionModel, requiresFinishGate(), SqlAgentTaskRepository (+12 more)

### Community 100 - "bootstrap/coreModules.ts"
Cohesion: 0.11
Nodes (9): CoreModulesDependencies, createCoreModules(), depsKey(), NodeBootstrapCrypto, PostgresLoginCodeRepository, PostgresSessionRepository, createProjectKnowledgeModule(), numericCode() (+1 more)

### Community 101 - "SettingDefinition"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

### Community 102 - "createCollaborationModule"
Cohesion: 0.11
Nodes (7): ClaimInvitesUseCase, MemberQueries, OrganizationNamesQuery, OrganizationQueries, createCollaborationModule(), IOrganizationQueries, fixture()

### Community 103 - "client.ts"
Cohesion: 0.27
Nodes (9): createClient(), ChatMessage, createAi(), createApiWorkflow(), createAuth(), createRealtime(), createStorage(), StoredFile (+1 more)

### Community 104 - "model-management/providers.ts"
Cohesion: 0.23
Nodes (16): speedFor(), tierFor(), createCatalogSync(), lastSync(), startCatalogSync(), syncOpenRouter(), postgresProviderRepository, createPlatformProviderService() (+8 more)

### Community 105 - "ref_node_http"
Cohesion: 0.13
Nodes (9): stopLanguageRuntimes(), DataBridgePorts, Env, readBody(), RuntimeDataBridge, TooLarge, assertPublic(), fetchPublicText() (+1 more)

### Community 106 - "collaboration/ports/repositories.ts"
Cohesion: 0.27
Nodes (4): CheckAccessUseCase, ProjectIdentity, Access, MemberAccess

### Community 107 - "sandboxWorker.mjs"
Cohesion: 0.24
Nodes (6): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry, ISettingsStore

### Community 108 - "projectRows.ts"
Cohesion: 0.27
Nodes (9): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError (+1 more)

### Community 109 - "accountLifecycle.ts"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 110 - "IntegrationRepository"
Cohesion: 0.21
Nodes (15): FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer(), lineOf() (+7 more)

### Community 111 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 112 - "Evals.tsx"
Cohesion: 0.22
Nodes (11): api, evaluationsController, Agg, EvalCfg, Evals(), Metric(), money(), RunDetail (+3 more)

### Community 113 - "architecture.test.ts"
Cohesion: 0.17
Nodes (6): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType

### Community 114 - "client/index.ts"
Cohesion: 0.20
Nodes (12): AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes, RouteSpec (+4 more)

### Community 115 - "Workspace.tsx"
Cohesion: 0.07
Nodes (39): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, memoryController (+31 more)

### Community 116 - "sandbox.ts"
Cohesion: 0.08
Nodes (24): ServiceExecution, beginTransaction(), dispatch(), getSandboxServices(), ProjectSandbox, restartSandboxService(), RunInput, runInSandbox() (+16 more)

### Community 117 - "builderServer.ts"
Cohesion: 0.16
Nodes (16): @hono/node-server@^2.1.5, @hono/node-server, startAppRuntimeEventRelay(), app, lifecycle, monolith, stopRuntimeEventRelay(), lifecycle (+8 more)

### Community 118 - "infrastructure/cache.ts"
Cohesion: 0.15
Nodes (5): CACHE_LIMITS, ProjectCache, createProjectCacheRepository(), PROJECT_CACHE_SCHEMA, CacheRepository

### Community 119 - "Desplegar Forja en Coolify"
Cohesion: 0.20
Nodes (10): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+2 more)

### Community 120 - "createGithubSyncService"
Cohesion: 0.19
Nodes (14): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+6 more)

### Community 121 - "PostgresProjectFileRepository"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 122 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 123 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 125 - "app-services/context.ts"
Cohesion: 0.11
Nodes (18): CheckoutInput, createPayments(), paymentsFor(), createStorage(), putObject(), MAX_PROJECT_STORAGE_BYTES, StorageLimitError, StoredObject (+10 more)

### Community 126 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.29
Nodes (6): collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository, sendInvitation

### Community 127 - "infrastructure/probe.ts"
Cohesion: 0.22
Nodes (15): 6. API de administración, providerOf(), providers(), call(), ECHO_TOOL, errorOf(), listProviderModels(), ModelProbe (+7 more)

### Community 128 - "admission.ts"
Cohesion: 0.09
Nodes (16): AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun(), runBudget(), RunConfiguration (+8 more)

### Community 129 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 130 - "BuilderRunRegistry"
Cohesion: 0.24
Nodes (3): BuilderRunRegistry, isBuilding(), stopBuilding()

### Community 131 - "Backends en otros lenguajes (Java / Spring Boot)"
Cohesion: 0.33
Nodes (6): Backends en otros lenguajes (Java / Spring Boot), Configuración, Cómo funciona, Imagen y despliegue, Seguridad, Siguientes lenguajes

### Community 132 - "modules/projects/index.ts"
Cohesion: 0.15
Nodes (20): CreateProjectInput, BeforeImage, beforeImages(), restoredFiles(), turnFileChange(), ProjectProps, ChangeEntry, ProjectPatch (+12 more)

### Community 133 - "Audit.tsx"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 134 - "Changes.tsx"
Cohesion: 0.19
Nodes (16): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+8 more)

### Community 135 - "http.test.ts"
Cohesion: 0.05
Nodes (48): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+40 more)

### Community 136 - "ProjectServices"
Cohesion: 0.15
Nodes (6): CreateProjectUseCase, ProjectsModuleDependencies, ProjectServices, creation(), load(), endpoint()

### Community 137 - "jobWorkerServer.ts"
Cohesion: 0.17
Nodes (17): lifecycle, [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed(), lifecycle (+9 more)

### Community 138 - "e2e.mjs"
Cohesion: 0.11
Nodes (12): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs(), DATA, jar (+4 more)

### Community 139 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 140 - "internal/router.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 141 - "ServiceControlPanel.tsx"
Cohesion: 0.15
Nodes (15): react-dom@^19.3.1, react-dom, serviceControlController, transport, Actions, failed(), Filter, KIND_LABEL (+7 more)

### Community 142 - "Cómo está hecho"
Cohesion: 0.25
Nodes (8): 4. Playground de agentes, Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, ctx(), usage()

### Community 143 - "modules/integrations/application/github.ts"
Cohesion: 0.11
Nodes (7): createGithubAccountService(), connectAccount(), GithubAccountRepository, GithubAuthorization, Link, SyncResult, setup()

### Community 144 - "ProjectKnowledge.tsx"
Cohesion: 0.26
Nodes (9): buildGraphView(), GraphCard, GraphConnection, GraphEdge, GraphNode, GraphQuestion, ProjectGraph, ProjectKnowledge() (+1 more)

### Community 145 - "services"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 146 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 148 - "postgres"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 149 - "healthcheck"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 150 - "createJobQueue"
Cohesion: 0.12
Nodes (10): ClaimedJob, createJobQueue(), poll(), processJob(), pump(), start(), stop(), JOB_LIMITS (+2 more)

### Community 151 - "agents.mjs"
Cohesion: 0.10
Nodes (19): cookie(), app, DATA, app, DATA, MODELS, req(), ROOT (+11 more)

### Community 152 - "shared/security.ts"
Cohesion: 0.15
Nodes (14): resolvePublicUrl(), appHeaders(), clientIp(), createRateLimiter(), isHttps(), rateLimit, RateLimitError, RateLimitQuery (+6 more)

### Community 153 - "guides.ts"
Cohesion: 0.15
Nodes (16): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), PRODUCT_GUIDES (+8 more)

### Community 154 - ".execute"
Cohesion: 0.39
Nodes (9): build, BROWSER, JAVA, args, context, dockerfile, build, build (+1 more)

### Community 155 - "app-runtime"
Cohesion: 0.22
Nodes (9): command, environment, expose, labels, restart, security_opt, stop_grace_period, volumes (+1 more)

### Community 156 - "guides.ts"
Cohesion: 0.25
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 158 - "languages.ts"
Cohesion: 0.16
Nodes (17): SpringBuildTool, checkProject, dataBridge, springRuntime, toolChecks, toolUnavailable(), unavailable(), BASE_ENV (+9 more)

### Community 159 - "ApplicationLifecycle"
Cohesion: 0.17
Nodes (6): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown(), shutdown()

### Community 160 - "PostgresCatalogRepository.ts"
Cohesion: 0.23
Nodes (11): audit(), persistCapabilityProfile(), validateCapabilityProfile(), validateReasoningEffort(), columns, postgresCatalogRepository, profileValues(), Row (+3 more)

### Community 161 - "One project: orders API and durable invoice worker"
Cohesion: 0.25
Nodes (8): command, environment, expose, restart, security_opt, stop_grace_period, volumes, builder

### Community 162 - "job-worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 163 - "motion.tsx"
Cohesion: 0.50
Nodes (3): motion@^14.9.0, motion, FadeIn()

### Community 165 - "studio.mjs"
Cohesion: 0.24
Nodes (14): ADMIN, assert(), cleanup(), freePort(), get(), main(), resources, ROOT (+6 more)

### Community 166 - "adminServer.ts"
Cohesion: 0.18
Nodes (13): ADMIN_MCP_INSTRUCTIONS, AdminMcpModules, descriptions, fusionCapability, id, modelIds, modelPatch, schemas (+5 more)

### Community 168 - "forja"
Cohesion: 0.29
Nodes (7): environment, expose, restart, security_opt, stop_grace_period, volumes, forja

### Community 169 - "Panel de administración del sistema — diseño"
Cohesion: 0.18
Nodes (11): 10. Documentación, 2. Ajustes globales, 5. Enrutador, 7. Studio, 8. Errores y seguridad, Almacén, Decisiones tomadas con el usuario, Fuera de alcance (+3 more)

### Community 174 - "GitHub integration"
Cohesion: 0.50
Nodes (3): GitHub integration, HTTP API, Native imports and synchronization

### Community 196 - "createHttp"
Cohesion: 0.25
Nodes (4): { apiUrl }, ApiError, createHttp(), HttpTransport

### Community 197 - "transports/mcp.test.ts"
Cohesion: 0.25
Nodes (6): createMcpHandler(), account, collaboration, handleMcp, identity, projects

### Community 202 - "Inventario de interfaz de Floot → Forja"
Cohesion: 0.33
Nodes (5): Barra lateral del panel, Inventario de interfaz de Floot → Forja, Panel de proyectos, Services (tres columnas: servicios · lista · detalle; los usados primero, el resto atenuado), Vista de proyecto

### Community 203 - "localSeed.ts"
Cohesion: 0.53
Nodes (5): createLocalSeed(), readSeedFile(), SeedFile, saveModel(), saveProvider()

### Community 205 - "unit/catalog.test.ts"
Cohesion: 0.40
Nodes (4): recordClassificationUsage(), dir, monolith, seedLocal

### Community 206 - "agentCompact.test.ts"
Cohesion: 0.33
Nodes (4): calls, model, recordContextEvent, usage

### Community 207 - "judgeRouting.test.ts"
Cohesion: 0.33
Nodes (5): billing, { callModel }, input, model, scope

### Community 209 - "PostgresMcpOAuthRepository.ts"
Cohesion: 0.50
Nodes (3): McpOAuthAuthorizationCode, McpOAuthClient, McpOAuthRefreshGrant

### Community 211 - "3. Proveedores y modelos"
Cohesion: 0.67
Nodes (3): 3. Proveedores y modelos, Pruebas de conexión, Tablas (`002_admin.sql`)

## Knowledge Gaps
- **20 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1423 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **39 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `ref_node_fs` to `BuilderTurnAdapter.ts`, `bootstrap/server.ts`, `Chat.tsx`, `domain/services.ts`, `projects/application/usecases.ts`, `ProjectsStore`, `BuilderWorkflowPorts`, `FusionOrchestrator.ts`, `ProjectDb`, `app-runtime/index.ts`, `application/problems.ts`, `FileMap`, `modules/identity/index.ts`, `model-management/index.ts`, `composition.ts`, `config.ts`, `appRuntimeServer.ts`, `projects/application/usecases.ts`, `application/problems.ts`, `modules/projects/index.ts`, `deps.ts`, `modules/project-knowledge/index.ts`, `infrastructure/routing.ts`, `fusion.test.ts`, `ISessionRepository`, `roles.ts`, `app-services/context.ts`, `project-observability/security.ts`, `infrastructure/routing.ts`, `domain/score.ts`, `AgentExecution.ts`, `ref_node_path`, `usage/usage.ts`, `OrgRole`, `infrastructure/repositories.ts`, `projectIndex.ts`, `skills.test.ts`, `oauth.ts`, `classification.test.ts`, `adminServer.ts`, `collaboration/ports/repositories.ts`, `OrganizationSkillsService.ts`, `PostgresProviderRepository.ts`, `model-management/router.ts`, `ProjectDb`, `execution-audit/index.ts`, `integrations/github.ts`, `createJobs`, `Author`, `application/context.ts`, `GithubError`, `Plan.ts`, `http.test.ts`, `app-services/email.ts`, `bootstrap/server.ts`, `PlatformSettingsService`, `adminApi.ts`, `starterTemplate.test.ts`, `accountLifecycle.ts`, `SqlAgentTaskRepository.ts`, `bootstrap/coreModules.ts`, `SettingDefinition`, `createCollaborationModule`, `model-management/providers.ts`, `collaboration/ports/repositories.ts`, `sandboxWorker.mjs`, `architecture.test.ts`, `sandbox.ts`, `builderServer.ts`, `infrastructure/cache.ts`, `createGithubSyncService`, `PostgresProjectFileRepository`, `devDependencies`, `app-services/context.ts`, `collaboration/postgresAdapters.test.ts`, `infrastructure/probe.ts`, `admission.ts`, `mcp/jobs.ts`, `BuilderRunRegistry`, `Audit.tsx`, `Changes.tsx`, `http.test.ts`, `ProjectServices`, `e2e.mjs`, `ServiceControlPanel.tsx`, `modules/integrations/application/github.ts`, `shared/security.ts`, `guides.ts`, `ApplicationLifecycle`, `BuilderServiceClient`, `createHttp`, `transports/mcp.test.ts`, `vitest`, `integrations/boundaries.test.ts`, `unit/catalog.test.ts`, `agentCompact.test.ts`, `judgeRouting.test.ts`, `identity/boundaries.test.ts`?**
  _High betweenness centrality (0.318) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ProjectView.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10085933966530981 - nodes in this community are weakly interconnected._
- **Why does `react` connect `bootstrap/server.ts` to `application/problems.ts`, `ProjectView.tsx`, `motion.tsx`, `Audit.tsx`, `Chat.tsx`, `Changes.tsx`, `App.tsx`, `internal/router.ts`, `Panel de administración del sistema — diseño`, `FusionOrchestrator.ts`, `ServiceControlPanel.tsx`, `Evals.tsx`, `ProjectKnowledge.tsx`, `client/index.ts`, `Workspace.tsx`, `server/index.ts`, `projects/application/usecases.ts`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `studioApi.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07764705882352942 - nodes in this community are weakly interconnected._