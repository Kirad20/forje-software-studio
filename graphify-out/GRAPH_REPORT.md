# Graph Report - porbeagle  (2026-11-10)

## Corpus Check
- 728 files · ~357,893 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 6, .css 6, .example 1)

## Summary
- 4896 nodes · 12960 edges · 193 communities (160 shown, 33 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 675 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `30a5d492`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ProjectView.tsx
- studioApi.ts
- OrgRole
- infrastructure/projectDb.ts
- bootstrap/server.ts
- Chat.tsx
- app-runtime/index.ts
- projects/application/usecases.ts
- builder/contracts.ts
- ProjectsStore
- App.tsx
- infrastructure/playground.ts
- OrchestrationPolicy.ts
- FusionOrchestrator.ts
- ref_node_fs
- FinishGatePolicy.ts
- ProjectDb
- domain/routing.ts
- FileMap
- ApplicationLifecycle
- application/problems.ts
- bootstrap/coreModules.ts
- FileMap
- accountLifecycle.ts
- model-management/index.ts
- server/index.ts
- composition.ts
- modules/builder/index.ts
- project-observability/events.ts
- fusion.test.ts
- createCollaborationModule
- projects/application/usecases.ts
- application/problems.ts
- AgentExecution.ts
- IPersonalOrganizationRepository
- modules/projects/index.ts
- deps.ts
- modules/project-knowledge/index.ts
- domain/services.ts
- model-management/catalog.ts
- RunTaskLaneUseCase.ts
- platformDb
- app-services/context.ts
- createIdentityModule
- app-runtime/infrastructure/browser.ts
- BuilderToolsAdapter.ts
- SqlAgentTaskRepository.ts
- domain/score.ts
- appRuntimeServer.ts
- github.mjs
- bootstrap/server.ts
- usage/usage.ts
- OrgRole
- executeRun
- projectIndex.ts
- skills.test.ts
- oauth.ts
- BuilderWorkflowPorts
- infrastructure/runner.ts
- CheckAccessUseCase.ts
- roles.ts
- collaboration/postgresAdapters.test.ts
- PostgresApiTokenRepository.ts
- OrganizationSkillsService.ts
- PostgresProviderRepository.ts
- OrganizationSkillsService.ts
- PostgresRouterAdministrationRepository.ts
- model-management/router.ts
- IPasswordHasher
- execution-audit/index.ts
- integrations/github.ts
- createJobs
- ports/jobs.ts
- application/context.ts
- GithubError
- Standards.ts
- policies.test.ts
- Panel de administración del sistema — diseño
- http.test.ts
- app-services/context.ts
- PostgresProjectsStore
- settings/index.ts
- platform.ts
- studio.mjs
- mcp/server.ts
- modules/integrations/application/github.ts
- PlatformSettingsService
- modules/projects/index.ts
- app-services/realtime.ts
- createAuth
- infrastructure/playground.ts
- Review Focus
- model-management/providers.ts
- starterTemplate.test.ts
- one
- createJobs
- ref_node_http
- springRuntime.ts
- q
- crypto.ts
- apiTypes.test.ts
- SettingDefinition
- platformDb
- client.ts
- FusionOrchestrator.ts
- infrastructure/judge.ts
- collaboration/ports/repositories.ts
- sandboxWorker.mjs
- createProjectRows
- accountLifecycle.ts
- IntegrationRepository
- sandboxWorker.mjs
- GithubRepository
- architecture.test.ts
- client/index.ts
- Workspace.tsx
- sandbox.ts
- guides.ts
- AppEnv
- Desplegar Forja en Coolify
- createGithubSyncService
- PostgresProjectFileRepository
- settingReactions.ts
- devDependencies
- GithubGateway
- PostgresPlatformSettingsStoreAdapter
- Cómo está hecho
- Backends en otros lenguajes (Java / Spring Boot)
- admission.ts
- mcp/jobs.ts
- projectMicroservices.test.ts
- infrastructure/apps.ts
- modules/projects/index.ts
- Audit.tsx
- Changes.tsx
- modules/builder/index.ts
- AppStore
- Evals.tsx
- GithubProjectPorts
- services
- internal/router.ts
- ServiceControlPanel.tsx
- app-services/payments.ts
- GithubAuthorization
- ProjectKnowledge.tsx
- services
- Inventario de funciones de Lovable → Forja
- PostgresProjectFileRepository
- postgres
- healthcheck
- IdentityRandom
- agents.mjs
- createJobQueue
- motion.tsx
- .execute
- app-runtime
- guides.ts
- github.mjs
- languages.ts
- app-services/analytics.ts
- ref_node_crypto
- One project: orders API and durable invoice worker
- job-worker
- e2e.mjs
- AgentExecutionSpec
- skillLibrary.ts
- deps.test.ts
- forja
- Panel de administración del sistema — diseño
- builderService.ts
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
- RealtimeTransport

## God Nodes (most connected - your core abstractions)
1. `vitest` - 164 edges
2. `q()` - 117 edges
3. `createStudioApi()` - 76 edges
4. `AppEnv` - 59 edges
5. `react` - 52 edges
6. `createIdentityModule()` - 46 edges
7. `config` - 44 edges
8. `one()` - 43 edges
9. `ProjectsStore` - 40 edges
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

## Communities (193 total, 33 thin omitted)

### Community 0 - "ProjectView.tsx"
Cohesion: 0.10
Nodes (54): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+46 more)

### Community 1 - "studioApi.ts"
Cohesion: 0.06
Nodes (43): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, publication, confirmPasswordReset, createAppUser, ensureOwnerAdmin (+35 more)

### Community 2 - "OrgRole"
Cohesion: 0.12
Nodes (11): OrgRole, CollaborationModuleDependencies, PostgresOrganizationRepository, IMemberQueries, InviteView, IOrganizationNameDirectory, IOrganizationQueries, MemberView (+3 more)

### Community 3 - "infrastructure/projectDb.ts"
Cohesion: 0.12
Nodes (36): applyProjectMigrationsLocal(), assertRuntimeSql(), checksum(), cloneDatabase(), closeAll(), closeEntry(), closeProject(), closing (+28 more)

### Community 4 - "bootstrap/server.ts"
Cohesion: 0.08
Nodes (56): lucide-react, radix-ui, react, api, modelBlockers(), ModelReadiness, playgroundModel(), usableModel() (+48 more)

### Community 5 - "Chat.tsx"
Cohesion: 0.05
Nodes (71): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+63 more)

### Community 6 - "app-runtime/index.ts"
Cohesion: 0.07
Nodes (27): RuntimeObservationPorts, RuntimeProjectsPort, KIT_BUILTIN, KitEntry, ProjectServices, bindRuntimeObservation(), configureRuntimeProjects(), suggestSlug (+19 more)

### Community 7 - "projects/application/usecases.ts"
Cohesion: 0.07
Nodes (41): createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), ClassificationPorts (+33 more)

### Community 8 - "builder/contracts.ts"
Cohesion: 0.17
Nodes (20): page(), summarize(), applySummary(), blockTokens(), callLabel(), estimateTokens(), hasResults(), KEEP_RECENT_RESULTS (+12 more)

### Community 9 - "ProjectsStore"
Cohesion: 0.07
Nodes (6): ProjectsApplication, ProjectSnapshot, TurnChanges, createProjectsModule(), ProjectsStore, fixture()

### Community 10 - "App.tsx"
Cohesion: 0.06
Nodes (45): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallContext, InstallEvent (+37 more)

### Community 11 - "infrastructure/playground.ts"
Cohesion: 0.07
Nodes (63): Implementation plan document (`static/__dev/plan.md`), describeSchema, ScheduleTasksUseCase, rewardOf(), checkPlanDoc(), criteriaOf(), planOverview(), formatStandard() (+55 more)

### Community 12 - "OrchestrationPolicy.ts"
Cohesion: 0.07
Nodes (31): CheckPlanUseCase, ReviewAndFixUseCase, TeamBuildUseCase, Review, reviewFixTasks(), checkContract(), CONTRACT_FILE, covers() (+23 more)

### Community 13 - "FusionOrchestrator.ts"
Cohesion: 0.08
Nodes (22): api, billingController, Meter(), Plan(), Usage, createEvaluationUseCases(), createIdentityUseCases(), api (+14 more)

### Community 14 - "ref_node_fs"
Cohesion: 0.09
Nodes (23): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, recordClassificationUsage(), wrap(), migrate(), MIGRATIONS_DIR, drop() (+15 more)

### Community 15 - "FinishGatePolicy.ts"
Cohesion: 0.16
Nodes (9): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+1 more)

### Community 16 - "ProjectDb"
Cohesion: 0.10
Nodes (11): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, ROLE_TOOLS (+3 more)

### Community 17 - "domain/routing.ts"
Cohesion: 0.07
Nodes (37): AgentSpec, TurnState, KEYWORDS, RoleProfile, Posterior, ExecutionContextMetrics, FUSION_BUDGETS, FusionBudget (+29 more)

### Community 18 - "FileMap"
Cohesion: 0.09
Nodes (43): formatProblem(), pageRoutes(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle() (+35 more)

### Community 19 - "ApplicationLifecycle"
Cohesion: 0.17
Nodes (6): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown(), shutdown()

### Community 20 - "application/problems.ts"
Cohesion: 0.07
Nodes (20): createLogService(), LogEntry, LogRepository, BuildProblem, locate(), Problem, ProblemKind, ProblemPorts (+12 more)

### Community 21 - "bootstrap/coreModules.ts"
Cohesion: 0.09
Nodes (10): createCoreModules(), NodeBootstrapCrypto, PlatformMailerService, PostgresLoginCodeRepository, PostgresSessionRepository, IMailerService, createProjectKnowledgeModule(), newToken() (+2 more)

### Community 22 - "FileMap"
Cohesion: 0.10
Nodes (19): createBuildVerification(), PackageRegistryPort, BuildPorts, PublicationPorts, RuntimeEvent, createPublication(), assertPublishable(), Author (+11 more)

### Community 23 - "accountLifecycle.ts"
Cohesion: 0.10
Nodes (10): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, Account, AccountProps, Email, IAccountRepository (+2 more)

### Community 24 - "model-management/index.ts"
Cohesion: 0.13
Nodes (22): Catalog, createModelManagementQueries(), routerAudit(), updateProjectModels(), isMode(), taskClassOf(), bindModelAudit(), bindCatalogService() (+14 more)

### Community 25 - "server/index.ts"
Cohesion: 0.20
Nodes (19): api, integrationsController, GithubAccount, GithubRepository, GithubSelection, GithubCard, GithubCommitCard(), GithubSection() (+11 more)

### Community 26 - "composition.ts"
Cohesion: 0.12
Nodes (27): createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureAppServiceObserver(), applyProjectMigrations(), initializeAppServices, bindEvaluationBuilder() (+19 more)

### Community 27 - "modules/builder/index.ts"
Cohesion: 0.08
Nodes (15): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, Cache (+7 more)

### Community 28 - "project-observability/events.ts"
Cohesion: 0.17
Nodes (7): startAppRuntimeEventRelay(), ProjectEvent, ProblemEffects, adapters, listeners, log, onProjectEvent()

### Community 29 - "fusion.test.ts"
Cohesion: 0.13
Nodes (17): createModelRouter(), validateToolInput(), author, features, gemini, gpt, reply(), req (+9 more)

### Community 30 - "createCollaborationModule"
Cohesion: 0.11
Nodes (6): ClaimInvitesUseCase, MemberQueries, OrganizationNamesQuery, OrganizationQueries, createCollaborationModule(), fixture()

### Community 31 - "projects/application/usecases.ts"
Cohesion: 0.07
Nodes (41): ProjectEvent, ProjectLogLine, projectsController, transport, CreateProjectOptions, createProjectUseCases(), isProjectLogLine(), isProjectProblem() (+33 more)

### Community 32 - "application/problems.ts"
Cohesion: 0.07
Nodes (39): dependencies, @anthropic-ai/sdk@^1.3.0, clsx@^2.1.1, croner@^11.0.0, esbuild@^0.28.2, hono@^4.13.14, @hono/node-server@^2.1.5, lucide-react@^1.66.0 (+31 more)

### Community 33 - "AgentExecution.ts"
Cohesion: 0.11
Nodes (19): GATE_FIXES, RunAgentUseCase, addUsage(), Block, BuilderContextMetrics, BuilderFusionStep, BuilderFusionTrace, ContextAuditEvent (+11 more)

### Community 34 - "IPersonalOrganizationRepository"
Cohesion: 0.15
Nodes (6): PersonalOrganizationUseCase, Organization, OrganizationProps, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 35 - "modules/projects/index.ts"
Cohesion: 0.09
Nodes (15): DeleteFileUseCase, isDevFile(), RenameFileUseCase, WriteFileUseCase, ProjectPath, IProjectFileRepository, app, database (+7 more)

### Community 36 - "deps.ts"
Cohesion: 0.07
Nodes (43): createDependencyResolution(), BUILTIN_PACKAGES, Deps, isValidPackageName(), MANIFEST, packageInfo, packageName(), readDeps() (+35 more)

### Community 37 - "modules/project-knowledge/index.ts"
Cohesion: 0.10
Nodes (18): createKnowledgeService(), KnowledgeEngine, KnowledgeFiles, prepareCorpus(), KnowledgeAnswer, KnowledgeEdge, KnowledgeGraph, KnowledgeNode (+10 more)

### Community 38 - "domain/services.ts"
Cohesion: 0.09
Nodes (29): createProjectCheck(), ProjectCompilerPort, createServiceControl(), restart(), scale(), snapshot(), endpointRoutes(), exampleFiles() (+21 more)

### Community 39 - "model-management/catalog.ts"
Cohesion: 0.10
Nodes (36): 6. API de administración, lastSync(), providerOf(), providers(), startCatalogSync(), sync(), syncOpenRouter(), speedFor() (+28 more)

### Community 40 - "RunTaskLaneUseCase.ts"
Cohesion: 0.10
Nodes (12): RunTaskLaneUseCase, TaskLifecycleUseCase, AgentEvent, requiresFinishGate(), AgentTask, AgentTaskRepository, LaneTask, TaskLaneHooks (+4 more)

### Community 41 - "platformDb"
Cohesion: 0.13
Nodes (17): [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed(), DEV_FIXTURE, Fixture (+9 more)

### Community 42 - "app-services/context.ts"
Cohesion: 0.06
Nodes (20): PlaygroundView, AgentEvent, AgentResult, Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole (+12 more)

### Community 43 - "createIdentityModule"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 44 - "app-runtime/infrastructure/browser.ts"
Cohesion: 0.09
Nodes (28): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+20 more)

### Community 45 - "BuilderToolsAdapter.ts"
Cohesion: 0.06
Nodes (30): assertProjectObject(), assertSafeAgentSql(), assertSafePreviewSql(), containsDataChange(), containsSchemaChange(), objectName(), redactSqlData(), isMigrationPath() (+22 more)

### Community 46 - "SqlAgentTaskRepository.ts"
Cohesion: 0.20
Nodes (9): ListAgentTasksUseCase, SqlAgentTaskRepository, listTasks(), tasks, AgentTaskQueries, AgentTaskView, TaskCompletion, availableModels() (+1 more)

### Community 47 - "domain/score.ts"
Cohesion: 0.11
Nodes (29): PageInspection, EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS (+21 more)

### Community 48 - "appRuntimeServer.ts"
Cohesion: 0.10
Nodes (15): AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts, resolveApp() (+7 more)

### Community 49 - "github.mjs"
Cohesion: 0.09
Nodes (20): playwright-core@1.64.1, playwright-core, root, server, types, worker, app, me (+12 more)

### Community 50 - "bootstrap/server.ts"
Cohesion: 0.07
Nodes (36): lifecycle, withDefaultHeaders(), lifecycle, monolith, server, platformMemoryReport(), remote(), app (+28 more)

### Community 51 - "usage/usage.ts"
Cohesion: 0.14
Nodes (9): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, countAction, usageSummary (+1 more)

### Community 52 - "OrgRole"
Cohesion: 0.12
Nodes (6): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, IOrganizationRepository

### Community 53 - "executeRun"
Cohesion: 0.30
Nodes (4): ActiveRun, executeRun(), RunPorts, CaseResult

### Community 54 - "projectIndex.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 55 - "skills.test.ts"
Cohesion: 0.12
Nodes (4): AdminApiTokenError, IdentityAccountsService, createIdentityModule(), fixture()

### Community 56 - "oauth.ts"
Cohesion: 0.09
Nodes (36): @hono/node-server, accountFromOAuthAccessToken(), authorizationHtml(), createMcpOAuthRouter(), digest(), escapeHtml(), issueTokens(), json() (+28 more)

### Community 57 - "BuilderWorkflowPorts"
Cohesion: 0.08
Nodes (10): BuilderWorkflowUseCase, FastBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode, useFastPath(), BuilderWorkflowPorts (+2 more)

### Community 58 - "infrastructure/runner.ts"
Cohesion: 0.15
Nodes (26): sessionCookie(), endSession, testSession, EvalError, RunRequest, recoverRuns(), EVAL_EMAIL, spentLast24h() (+18 more)

### Community 59 - "CheckAccessUseCase.ts"
Cohesion: 0.27
Nodes (4): CheckAccessUseCase, ProjectIdentity, Access, MemberAccess

### Community 60 - "roles.ts"
Cohesion: 0.07
Nodes (35): BUILDER_SYSTEM_PROMPT, AgentToolRole, allowedToolsForRole(), assertRoleToolAccess(), BACKEND, CHECKLIST, CONTRACT, DATA (+27 more)

### Community 61 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.18
Nodes (8): PlatformCollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository, sendInvitation

### Community 62 - "PostgresApiTokenRepository.ts"
Cohesion: 0.12
Nodes (6): PostgresApiTokenRepository, AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository, state

### Community 63 - "OrganizationSkillsService.ts"
Cohesion: 0.19
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 64 - "PostgresProviderRepository.ts"
Cohesion: 0.11
Nodes (20): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), audit(), missingProvider() (+12 more)

### Community 65 - "OrganizationSkillsService.ts"
Cohesion: 0.11
Nodes (5): Project, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 66 - "PostgresRouterAdministrationRepository.ts"
Cohesion: 0.24
Nodes (10): createRouterAdministration(), routerStats(), meanOf(), FusionPattern, RouterPosteriorRow, RouterStats, postgresRouterAdministrationRepository, RouterAdministrationRepository (+2 more)

### Community 67 - "model-management/router.ts"
Cohesion: 0.11
Nodes (23): analyzeHeuristic(), analyzeRequest(), pick(), maxTokensFor(), ROLES, useFastPath(), createTurnFeedback(), penalizeTurn() (+15 more)

### Community 68 - "IPasswordHasher"
Cohesion: 0.18
Nodes (5): IdentityModuleDependencies, BcryptArgonPasswordHasher, IdentityAccountsDependencies, IPasswordHasher, passwordNeedsRehash()

### Community 69 - "execution-audit/index.ts"
Cohesion: 0.08
Nodes (36): ADMIN_MCP_INSTRUCTIONS, createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists(), descriptions (+28 more)

### Community 70 - "integrations/github.ts"
Cohesion: 0.16
Nodes (15): createGithubImportService(), apps, imports, legacy, linkRepo(), ports(), sync, integrationRepository (+7 more)

### Community 71 - "createJobs"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 72 - "ports/jobs.ts"
Cohesion: 0.06
Nodes (13): AiBlock, AiFusionTrace, AiUsage, AiModel, AiPorts, AuthPorts, EmailPorts, JobPorts (+5 more)

### Community 73 - "application/context.ts"
Cohesion: 0.05
Nodes (26): Run, AppUser, CACHE_LIMITS, createProjectCache(), ProjectCache, createContext(), serviceContext(), EndpointContext (+18 more)

### Community 74 - "GithubError"
Cohesion: 0.15
Nodes (19): branchName(), createGithubAppService(), installation(), requireApp(), selectRepository(), GithubApp, Installation, pageNumber() (+11 more)

### Community 75 - "Standards.ts"
Cohesion: 0.27
Nodes (10): contractRoutes(), FileMap, isClientSource(), isHelperSource(), isListSelect(), isUiSource(), KIT_UTILITIES, lineOf() (+2 more)

### Community 76 - "policies.test.ts"
Cohesion: 0.08
Nodes (14): createSecrets(), projectSecretEnv(), secretEnv(), createStorage(), putObject(), MAX_PROJECT_STORAGE_BYTES, StorageLimitError, StoredObject (+6 more)

### Community 77 - "Panel de administración del sistema — diseño"
Cohesion: 0.16
Nodes (20): clsx, Button, ButtonProps, Badge(), Card(), EmptyState(), ErrorState(), Skeleton() (+12 more)

### Community 78 - "http.test.ts"
Cohesion: 0.07
Nodes (38): hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdminMcpModules, AdministrationEnv (+30 more)

### Community 79 - "app-services/context.ts"
Cohesion: 0.07
Nodes (24): aiUsage, appAiChat, AiUnavailableError, createAi(), appAiChat(), bindJobs, aiPorts, jobPorts (+16 more)

### Community 80 - "PostgresProjectsStore"
Cohesion: 0.06
Nodes (4): FileMap, PostgresProjectsStore, ProjectOrganizations, QueryHandle

### Community 81 - "settings/index.ts"
Cohesion: 0.15
Nodes (21): PlatformSettingType, SettingGroup, MOVED_ENV, createPlatformSettings(), byKey, Def, defs, getPath() (+13 more)

### Community 82 - "platform.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 83 - "studio.mjs"
Cohesion: 0.24
Nodes (14): ADMIN, assert(), cleanup(), freePort(), get(), main(), resources, ROOT (+6 more)

### Community 84 - "mcp/server.ts"
Cohesion: 0.13
Nodes (20): guideList(), readGuides(), buildServer(), CONTEXT_TOOLS, createMcpHandler(), DESTRUCTIVE, expectedVersionProp, extraTools (+12 more)

### Community 85 - "modules/integrations/application/github.ts"
Cohesion: 0.18
Nodes (6): createGithubAccountService(), connectAccount(), GithubAccountRepository, Link, SyncResult, setup()

### Community 86 - "PlatformSettingsService"
Cohesion: 0.20
Nodes (8): Task 2: Registro y almacén de ajustes, PlatformSettingsService, SettingDef, SettingsError, SettingView, SettingsDependencies, fixture(), fixture()

### Community 87 - "modules/projects/index.ts"
Cohesion: 0.15
Nodes (12): CoreModulesDependencies, CreateProjectInput, CreateProjectUseCase, parseStarterTemplate(), starterFiles(), StarterTemplate, ProjectsModuleDependencies, starterFiles() (+4 more)

### Community 88 - "app-services/realtime.ts"
Cohesion: 0.24
Nodes (4): DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket, publish

### Community 89 - "createAuth"
Cohesion: 0.22
Nodes (16): createAuth(), confirmPasswordReset(), createAppUser(), createSession(), ensureOwnerAdmin(), ensureProjectOwner(), requestPasswordReset(), setTemporaryPassword() (+8 more)

### Community 90 - "infrastructure/playground.ts"
Cohesion: 0.12
Nodes (29): removeProjectData, removeProjectData(), runBudget(), designSignals, ensureEvalAccount(), sweepEvalProjects(), evaluationBuilder(), evaluationResources() (+21 more)

### Community 91 - "Review Focus"
Cohesion: 0.13
Nodes (14): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 3: Proveedores y modelos en BD + seeders, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final (+6 more)

### Community 92 - "model-management/providers.ts"
Cohesion: 0.10
Nodes (21): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+13 more)

### Community 93 - "starterTemplate.test.ts"
Cohesion: 0.14
Nodes (8): BootstrapService, SetupError, COMMON_PASSWORDS, Password, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 94 - "one"
Cohesion: 0.07
Nodes (10): PlatformRole, PostgresAccountLifecycleRepository, AccountRow, SessionAccountRow, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountLifecycleRepository (+2 more)

### Community 95 - "createJobs"
Cohesion: 0.16
Nodes (19): createJobs(), addTimer(), enqueueJob(), executeJob(), fireDueTimers(), initializeAppServices(), report(), runJob() (+11 more)

### Community 96 - "ref_node_http"
Cohesion: 0.16
Nodes (6): stopLanguageRuntimes(), DataBridgePorts, Env, readBody(), RuntimeDataBridge, TooLarge

### Community 97 - "springRuntime.ts"
Cohesion: 0.07
Nodes (30): APP_DIR, buildCommand(), CACHE_DIR, clip(), detectSpringProject(), isSpringSource(), jarDirectory(), jvmCommand() (+22 more)

### Community 98 - "q"
Cohesion: 0.06
Nodes (10): PostgresMemberRepository, PostgresOrganizationSkillsRepository, PostgresAccountRepository, McpOAuthAuthorizationCode, McpOAuthClient, McpOAuthRefreshGrant, PostgresMcpOAuthRepository, PostgresPasswordResetRepository (+2 more)

### Community 99 - "crypto.ts"
Cohesion: 0.12
Nodes (20): @electric-sql/pglite@^0.5.13, @electric-sql/pglite, createEmail(), sendEmail(), sendPlatformEmail(), verifiedSender(), projectDb(), authRepository() (+12 more)

### Community 100 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 102 - "platformDb"
Cohesion: 0.21
Nodes (5): platformDb, Tx, ANTHROPIC_MODELS, PROVIDERS, seedDefaults()

### Community 103 - "client.ts"
Cohesion: 0.16
Nodes (12): createClient(), createAi(), createApiWorkflow(), createAuth(), { apiUrl }, createRealtime(), Handler, createStorage() (+4 more)

### Community 104 - "FusionOrchestrator.ts"
Cohesion: 0.11
Nodes (45): anthropicChat(), createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass() (+37 more)

### Community 105 - "infrastructure/judge.ts"
Cohesion: 0.22
Nodes (9): JUDGE_SYSTEM, judgeDesign(), JudgeInput, parseJudgement(), billing, { callModel }, input, model (+1 more)

### Community 106 - "collaboration/ports/repositories.ts"
Cohesion: 0.12
Nodes (11): InviteMemberResult, InviteMemberUseCase, ProjectTarget, RemoveMemberUseCase, ProjectInvite, ProjectInviteProps, PostgresCollaborationAccountRepository, CollaborationAccount (+3 more)

### Community 107 - "sandboxWorker.mjs"
Cohesion: 0.14
Nodes (9): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, SettingDefinitionProps, SettingType, SettingValue, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry (+1 more)

### Community 108 - "createProjectRows"
Cohesion: 0.33
Nodes (8): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError

### Community 109 - "accountLifecycle.ts"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 110 - "IntegrationRepository"
Cohesion: 0.21
Nodes (15): FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer(), lineOf() (+7 more)

### Community 111 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 113 - "architecture.test.ts"
Cohesion: 0.17
Nodes (6): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType

### Community 114 - "client/index.ts"
Cohesion: 0.17
Nodes (14): ChatMessage, AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes (+6 more)

### Community 115 - "Workspace.tsx"
Cohesion: 0.07
Nodes (39): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, memoryController (+31 more)

### Community 116 - "sandbox.ts"
Cohesion: 0.07
Nodes (25): ServiceExecution, checkProject, alive, beginTransaction(), dispatch(), getSandboxServices(), makeRoomForSandbox(), ProjectSandbox (+17 more)

### Community 117 - "guides.ts"
Cohesion: 0.24
Nodes (9): build(), Guide, guideById, GUIDES, OVERVIEW_PARTS, parse(), PRODUCT_GUIDES, SECTION_IDS (+1 more)

### Community 118 - "AppEnv"
Cohesion: 0.06
Nodes (15): ClaimedJob, AppEnv, AppDataPorts, createAppDataService(), TransactionSession, ProjectMigration, ProjectDbClient, SqlExecutionResult (+7 more)

### Community 119 - "Desplegar Forja en Coolify"
Cohesion: 0.11
Nodes (15): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+7 more)

### Community 120 - "createGithubSyncService"
Cohesion: 0.23
Nodes (12): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+4 more)

### Community 121 - "PostgresProjectFileRepository"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 122 - "settingReactions.ts"
Cohesion: 0.22
Nodes (3): createSettingReactions(), SettingReactionPorts, SettingsChangePort

### Community 123 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 126 - "Cómo está hecho"
Cohesion: 0.33
Nodes (6): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, ctx()

### Community 127 - "Backends en otros lenguajes (Java / Spring Boot)"
Cohesion: 0.33
Nodes (6): Backends en otros lenguajes (Java / Spring Boot), Configuración, Cómo funciona, Imagen y despliegue, Seguridad, Siguientes lenguajes

### Community 128 - "admission.ts"
Cohesion: 0.08
Nodes (17): admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun(), RunConfiguration (+9 more)

### Community 129 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 131 - "infrastructure/apps.ts"
Cohesion: 0.22
Nodes (8): AppCredentials, appJwt(), cache, credentials(), generations, githubAppStore, pending, mocks

### Community 132 - "modules/projects/index.ts"
Cohesion: 0.12
Nodes (18): CreateCheckpointUseCase, Author, BeforeImage, beforeImages(), restoredFiles(), turnFileChange(), Checkpoint, CheckpointProps (+10 more)

### Community 133 - "Audit.tsx"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 134 - "Changes.tsx"
Cohesion: 0.19
Nodes (16): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+8 more)

### Community 135 - "modules/builder/index.ts"
Cohesion: 0.06
Nodes (46): app, lifecycle, monolith, stopRuntimeEventRelay(), BuilderRunRegistry, AgentExecutionResult, AgentResult, calculateSpendUseCase (+38 more)

### Community 137 - "Evals.tsx"
Cohesion: 0.22
Nodes (11): api, evaluationsController, Agg, EvalCfg, Evals(), Metric(), money(), RunDetail (+3 more)

### Community 139 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 140 - "internal/router.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 141 - "ServiceControlPanel.tsx"
Cohesion: 0.15
Nodes (15): react-dom@^19.3.1, react-dom, serviceControlController, transport, Actions, failed(), Filter, KIND_LABEL (+7 more)

### Community 142 - "app-services/payments.ts"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

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

### Community 151 - "agents.mjs"
Cohesion: 0.12
Nodes (15): app, DATA, app, DATA, MODELS, ROOT, SEED, MODELS (+7 more)

### Community 152 - "createJobQueue"
Cohesion: 0.48
Nodes (6): createJobQueue(), poll(), processJob(), pump(), start(), stop()

### Community 153 - "motion.tsx"
Cohesion: 0.50
Nodes (3): motion@^14.9.0, motion, FadeIn()

### Community 154 - ".execute"
Cohesion: 0.39
Nodes (9): build, BROWSER, JAVA, args, context, dockerfile, build, build (+1 more)

### Community 155 - "app-runtime"
Cohesion: 0.22
Nodes (9): command, environment, expose, labels, restart, security_opt, stop_grace_period, volumes (+1 more)

### Community 156 - "guides.ts"
Cohesion: 0.25
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 157 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 158 - "languages.ts"
Cohesion: 0.12
Nodes (23): dataBridge, springRuntime, toolChecks, toolUnavailable(), unavailable(), BASE_ENV, bwrapUnavailable(), escape() (+15 more)

### Community 159 - "app-services/analytics.ts"
Cohesion: 0.18
Nodes (11): analyticsSummary, recordPageView, visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId() (+3 more)

### Community 160 - "ref_node_crypto"
Cohesion: 0.16
Nodes (10): vite, studioPwa(), here, createTestCoreModules(), dataDir, dir, SKILL, unbindBuilder (+2 more)

### Community 161 - "One project: orders API and durable invoice worker"
Cohesion: 0.25
Nodes (8): command, environment, expose, restart, security_opt, stop_grace_period, volumes, builder

### Community 162 - "job-worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 163 - "e2e.mjs"
Cohesion: 0.22
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 165 - "skillLibrary.ts"
Cohesion: 0.33
Nodes (6): AUTHORED_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO

### Community 166 - "deps.test.ts"
Cohesion: 0.10
Nodes (6): vitest, { KIT_BUILTIN }, root, sources(), files(), scopes

### Community 168 - "forja"
Cohesion: 0.25
Nodes (8): command, environment, expose, restart, security_opt, stop_grace_period, volumes, forja

### Community 169 - "Panel de administración del sistema — diseño"
Cohesion: 0.08
Nodes (24): 10. Documentación, 1. Capa de datos, 2. Ajustes globales, 4. Playground de agentes, 5. Enrutador, 7. Studio, 8. Errores y seguridad, Almacén (+16 more)

### Community 171 - "builderService.ts"
Cohesion: 0.10
Nodes (13): accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService(), BuilderServiceClient (+5 more)

### Community 174 - "GitHub integration"
Cohesion: 0.50
Nodes (3): GitHub integration, HTTP API, Native imports and synchronization

## Knowledge Gaps
- **20 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1430 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `deps.test.ts` to `bootstrap/server.ts`, `Chat.tsx`, `app-runtime/index.ts`, `projects/application/usecases.ts`, `builder/contracts.ts`, `ProjectsStore`, `OrchestrationPolicy.ts`, `FusionOrchestrator.ts`, `ref_node_fs`, `FinishGatePolicy.ts`, `ProjectDb`, `domain/routing.ts`, `ApplicationLifecycle`, `application/problems.ts`, `FileMap`, `accountLifecycle.ts`, `model-management/index.ts`, `composition.ts`, `project-observability/events.ts`, `fusion.test.ts`, `createCollaborationModule`, `projects/application/usecases.ts`, `application/problems.ts`, `AgentExecution.ts`, `modules/projects/index.ts`, `deps.ts`, `modules/project-knowledge/index.ts`, `domain/services.ts`, `model-management/catalog.ts`, `RunTaskLaneUseCase.ts`, `platformDb`, `app-services/context.ts`, `BuilderToolsAdapter.ts`, `SqlAgentTaskRepository.ts`, `domain/score.ts`, `github.mjs`, `bootstrap/server.ts`, `usage/usage.ts`, `OrgRole`, `projectIndex.ts`, `skills.test.ts`, `oauth.ts`, `BuilderWorkflowPorts`, `CheckAccessUseCase.ts`, `roles.ts`, `collaboration/postgresAdapters.test.ts`, `PostgresApiTokenRepository.ts`, `OrganizationSkillsService.ts`, `PostgresProviderRepository.ts`, `PostgresRouterAdministrationRepository.ts`, `model-management/router.ts`, `execution-audit/index.ts`, `integrations/github.ts`, `createJobs`, `application/context.ts`, `GithubError`, `Standards.ts`, `policies.test.ts`, `http.test.ts`, `app-services/context.ts`, `mcp/server.ts`, `modules/integrations/application/github.ts`, `PlatformSettingsService`, `modules/projects/index.ts`, `starterTemplate.test.ts`, `one`, `ref_node_http`, `crypto.ts`, `apiTypes.test.ts`, `client.ts`, `FusionOrchestrator.ts`, `infrastructure/judge.ts`, `collaboration/ports/repositories.ts`, `sandboxWorker.mjs`, `architecture.test.ts`, `sandbox.ts`, `AppEnv`, `createGithubSyncService`, `PostgresProjectFileRepository`, `settingReactions.ts`, `devDependencies`, `admission.ts`, `mcp/jobs.ts`, `projectMicroservices.test.ts`, `infrastructure/apps.ts`, `modules/projects/index.ts`, `Audit.tsx`, `Changes.tsx`, `modules/builder/index.ts`, `ServiceControlPanel.tsx`, `ref_node_crypto`, `Panel de administración del sistema — diseño`, `builderService.ts`?**
  _High betweenness centrality (0.311) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ProjectView.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10085933966530981 - nodes in this community are weakly interconnected._
- **Why does `react` connect `bootstrap/server.ts` to `application/problems.ts`, `ProjectView.tsx`, `Audit.tsx`, `Chat.tsx`, `Changes.tsx`, `Evals.tsx`, `App.tsx`, `internal/router.ts`, `Panel de administración del sistema — diseño`, `FusionOrchestrator.ts`, `ServiceControlPanel.tsx`, `ProjectKnowledge.tsx`, `client/index.ts`, `Workspace.tsx`, `motion.tsx`, `server/index.ts`, `projects/application/usecases.ts`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `studioApi.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06493506493506493 - nodes in this community are weakly interconnected._