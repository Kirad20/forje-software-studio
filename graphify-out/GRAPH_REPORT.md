# Graph Report - porbeagle  (2026-11-10)

## Corpus Check
- 719 files · ~349,464 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 6, .css 6, .example 1)

## Summary
- 4777 nodes · 12635 edges · 184 communities (154 shown, 30 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 654 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0e32b05b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ProjectView.tsx
- studioApi.ts
- BuilderTurnAdapter.ts
- infrastructure/projectDb.ts
- bootstrap/server.ts
- Chat.tsx
- bundler.ts
- projects/application/usecases.ts
- ProjectView.tsx
- ProjectsStore
- App.tsx
- infrastructure/playground.ts
- BuilderWorkflowPorts
- FusionOrchestrator.ts
- vitest
- policies.test.ts
- ProjectDb
- domain/routing.ts
- FileMap
- app-runtime/index.ts
- composition.ts
- application/context.ts
- FileMap
- modules/identity/index.ts
- model-management/index.ts
- server/index.ts
- log
- modules/builder/index.ts
- FinishGateAdapter.ts
- freshDatabase
- one
- projects/application/usecases.ts
- application/problems.ts
- app-services/context.ts
- IPersonalOrganizationRepository
- modules/projects/index.ts
- deps.ts
- modules/project-knowledge/index.ts
- PostgresRouterAdministrationRepository.ts
- bootstrap/server.ts
- crypto.ts
- q
- app-services/context.ts
- createIdentityModule
- app-runtime/infrastructure/browser.ts
- admission.ts
- infrastructure/routing.ts
- domain/score.ts
- modules/builder/index.ts
- ref_node_path
- Account
- builderService.ts
- OrgRole
- dependencies
- projectIndex.ts
- skills.test.ts
- oauth.ts
- app-runtime/services.test.ts
- app-services/auth.ts
- model-management/catalog.ts
- modules/projects/index.ts
- InviteMemberUseCase.ts
- ref_node_path
- OrganizationSkillsService.ts
- model-management/providers.ts
- OrganizationSkillsService.ts
- FusionOrchestrator.ts
- model-management/router.ts
- AgentExecution.ts
- github.mjs
- integrations/github.ts
- createJobs
- ProjectsApplication.ts
- RunAgentUseCase.ts
- GithubError
- Plan.ts
- AppEnv
- Panel de administración del sistema — diseño
- PostgresOrganizationRepository.ts
- roles.ts
- PostgresProjectsStore
- settings/index.ts
- platform.ts
- memory/application/service.ts
- mcp/server.ts
- fusion.test.ts
- PlatformSettingsService
- adminApi.ts
- cli.ts
- createAuth
- Panel de administración del sistema — diseño
- RunTaskLaneUseCase.ts
- model-management/providers.ts
- starterTemplate.test.ts
- usage/usage.ts
- createJobs
- collaboration/postgresAdapters.test.ts
- github.mjs
- app-services/secrets.ts
- accountLifecycle.ts
- client/index.ts
- SettingDefinition
- infrastructure/probe.ts
- client.ts
- project-observability/security.ts
- studio.mjs
- collaboration/ports/repositories.ts
- sandboxWorker.mjs
- platformDb
- accountLifecycle.ts
- IntegrationRepository
- sandboxWorker.mjs
- unit/catalog.test.ts
- architecture.test.ts
- internal/router.ts
- Workspace.tsx
- infrastructure/routing.ts
- guides.ts
- mcp/jobs.ts
- ApplicationLifecycle
- createGithubSyncService
- PostgresProjectFileRepository
- devDependencies
- SqlAgentTaskRepository.ts
- jobWorkerServer.ts
- Evals.tsx
- infrastructure/apps.ts
- GithubProjectPorts
- Inventario de funciones de Lovable → Forja
- ProjectServices
- modules/collaboration/index.ts
- modules/integrations/application/github.ts
- PostgresProjectFileRepository
- Audit.tsx
- Changes.tsx
- settingReactions.ts
- forms.tsx
- AppStore
- e2e.mjs
- services
- ProjectEvent
- transports/mcp.test.ts
- replaceVisibleText
- GithubGateway
- ProjectKnowledge.tsx
- services
- Review Focus
- spring.ts
- postgres
- healthcheck
- ServiceControlPanel.tsx
- execution.test.ts
- .execute
- app-runtime
- guides.ts
- apiTypes.test.ts
- One project: orders API and durable invoice worker
- job-worker
- GithubAuthorization
- forja
- RealtimeTransport
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

## God Nodes (most connected - your core abstractions)
1. `vitest` - 163 edges
2. `q()` - 117 edges
3. `createStudioApi()` - 76 edges
4. `AppEnv` - 59 edges
5. `react` - 52 edges
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

## Communities (184 total, 30 thin omitted)

### Community 0 - "ProjectView.tsx"
Cohesion: 0.10
Nodes (54): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+46 more)

### Community 1 - "studioApi.ts"
Cohesion: 0.05
Nodes (60): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, createAppUser, ensureProjectOwner (+52 more)

### Community 2 - "BuilderTurnAdapter.ts"
Cohesion: 0.05
Nodes (28): { KIT_BUILTIN }, assertProjectObject(), assertSafeAgentSql(), assertSafePreviewSql(), containsDataChange(), containsSchemaChange(), objectName(), redactSqlData() (+20 more)

### Community 3 - "infrastructure/projectDb.ts"
Cohesion: 0.08
Nodes (42): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError (+34 more)

### Community 4 - "bootstrap/server.ts"
Cohesion: 0.08
Nodes (56): lucide-react, radix-ui, react, api, modelBlockers(), ModelReadiness, playgroundModel(), usableModel() (+48 more)

### Community 5 - "Chat.tsx"
Cohesion: 0.05
Nodes (71): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+63 more)

### Community 6 - "bundler.ts"
Cohesion: 0.10
Nodes (33): createProjectCheck(), ProjectCompilerPort, createServiceControl(), restart(), scale(), snapshot(), Deps, EndpointInfo (+25 more)

### Community 7 - "projects/application/usecases.ts"
Cohesion: 0.09
Nodes (31): createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), ClassificationPorts (+23 more)

### Community 8 - "ProjectView.tsx"
Cohesion: 0.06
Nodes (21): AiBlock, AiContextMetrics, AiFusionTrace, AiUsage, AppAiInput, AppAiResult, AppUser, CheckoutInput (+13 more)

### Community 9 - "ProjectsStore"
Cohesion: 0.07
Nodes (7): isDevFile(), ProjectsApplication, FileMap, ProjectSnapshot, TurnChanges, createProjectsModule(), ProjectsStore

### Community 10 - "App.tsx"
Cohesion: 0.06
Nodes (45): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallContext, InstallEvent (+37 more)

### Community 11 - "infrastructure/playground.ts"
Cohesion: 0.08
Nodes (53): describeSchema, ScheduleTasksUseCase, rewardOf(), criteriaOf(), planOverview(), formatStandard(), active, AgentResult (+45 more)

### Community 12 - "BuilderWorkflowPorts"
Cohesion: 0.06
Nodes (15): BuilderWorkflowUseCase, FastBuildUseCase, ReviewAndFixUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode (+7 more)

### Community 13 - "FusionOrchestrator.ts"
Cohesion: 0.08
Nodes (22): api, billingController, Meter(), Plan(), Usage, createEvaluationUseCases(), createIdentityUseCases(), api (+14 more)

### Community 14 - "vitest"
Cohesion: 0.09
Nodes (27): pg, vitest, DEFAULT_MODELS_ALLOW, env, resolvePublicUrl(), ROOT_DIR, migrate(), MIGRATIONS_DIR (+19 more)

### Community 15 - "policies.test.ts"
Cohesion: 0.06
Nodes (29): @electric-sql/pglite, visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), createEmail() (+21 more)

### Community 16 - "ProjectDb"
Cohesion: 0.10
Nodes (11): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, ROLE_TOOLS (+3 more)

### Community 17 - "domain/routing.ts"
Cohesion: 0.08
Nodes (31): AgentExecutionSpec, AgentSpec, KEYWORDS, RoleProfile, ROLES, Posterior, FusionBudget, FusionEffort (+23 more)

### Community 18 - "FileMap"
Cohesion: 0.10
Nodes (41): pageRoutes(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle(), clientCache (+33 more)

### Community 19 - "app-runtime/index.ts"
Cohesion: 0.06
Nodes (36): RuntimeProjectsPort, ControlledService, RuntimeService, ServiceControlSnapshot, ServiceQueueEntry, ServiceReplica, ServiceRuntimeSnapshot, ServiceExecution (+28 more)

### Community 20 - "composition.ts"
Cohesion: 0.06
Nodes (49): startAppRuntimeEventRelay(), createMonolith(), startBindings(), stopBindings(), publication, configureJobRuntime(), configureAppServiceObserver(), applyProjectMigrations() (+41 more)

### Community 21 - "application/context.ts"
Cohesion: 0.09
Nodes (12): Run, AppUser, createProjectCache(), createContext(), serviceContext(), EndpointContext, enqueue(), HttpError (+4 more)

### Community 22 - "FileMap"
Cohesion: 0.09
Nodes (18): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, createPublication(), assertPublishable(), Author (+10 more)

### Community 23 - "modules/identity/index.ts"
Cohesion: 0.08
Nodes (14): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, AccountProps, Email, IdentityModuleDependencies, PlatformMailerService (+6 more)

### Community 24 - "model-management/index.ts"
Cohesion: 0.13
Nodes (22): Catalog, createModelManagementQueries(), routerAudit(), updateProjectModels(), isMode(), routerStats(), bindModelAudit(), bindCatalogService() (+14 more)

### Community 25 - "server/index.ts"
Cohesion: 0.20
Nodes (19): api, integrationsController, GithubAccount, GithubRepository, GithubSelection, GithubCard, GithubCommitCard(), GithubSection() (+11 more)

### Community 26 - "log"
Cohesion: 0.20
Nodes (3): ProjectSandbox, SandboxRunError, ServicePool

### Community 27 - "modules/builder/index.ts"
Cohesion: 0.08
Nodes (15): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, Cache (+7 more)

### Community 28 - "FinishGateAdapter.ts"
Cohesion: 0.10
Nodes (19): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+11 more)

### Community 29 - "freshDatabase"
Cohesion: 0.10
Nodes (11): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, drop(), freshDatabase(), dir, monolith, seedLocal, dir (+3 more)

### Community 30 - "one"
Cohesion: 0.08
Nodes (9): PlatformRole, PostgresAccountLifecycleRepository, AccountRow, SessionAccountRow, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountLifecycleRepository (+1 more)

### Community 31 - "projects/application/usecases.ts"
Cohesion: 0.07
Nodes (41): ProjectEvent, ProjectLogLine, projectsController, transport, CreateProjectOptions, createProjectUseCases(), isProjectLogLine(), isProjectProblem() (+33 more)

### Community 32 - "application/problems.ts"
Cohesion: 0.07
Nodes (40): dependencies, @anthropic-ai/sdk@^1.3.0, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, hono@^4.13.14, @hono/node-server@^2.1.5, lucide-react@^1.66.0 (+32 more)

### Community 33 - "app-services/context.ts"
Cohesion: 0.08
Nodes (18): AiUnavailableError, createAi(), appAiChat(), bindJobs, sendPlatformEmail, aiPorts, emailPorts, resetTransport() (+10 more)

### Community 34 - "IPersonalOrganizationRepository"
Cohesion: 0.14
Nodes (7): PersonalOrganizationUseCase, Organization, OrganizationProps, CollaborationModuleDependencies, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 35 - "modules/projects/index.ts"
Cohesion: 0.09
Nodes (14): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, ProjectPath, IProjectFileRepository, app, database, pool (+6 more)

### Community 36 - "deps.ts"
Cohesion: 0.08
Nodes (35): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KitEntry, BUILTIN_PACKAGES, isValidPackageName(), MANIFEST, packageInfo (+27 more)

### Community 37 - "modules/project-knowledge/index.ts"
Cohesion: 0.10
Nodes (19): createKnowledgeService(), KnowledgeEngine, KnowledgeFiles, prepareCorpus(), KnowledgeAnswer, KnowledgeEdge, KnowledgeGraph, KnowledgeNode (+11 more)

### Community 38 - "PostgresRouterAdministrationRepository.ts"
Cohesion: 0.27
Nodes (8): createRouterAdministration(), FusionPattern, RouterPosteriorRow, RouterStats, postgresRouterAdministrationRepository, RouterAdministrationRepository, resetRouter(), routerStats()

### Community 39 - "bootstrap/server.ts"
Cohesion: 0.08
Nodes (23): withDefaultHeaders(), app, handleAdminMcp, handleMcp, lifecycle, listening(), monolith, reactions (+15 more)

### Community 40 - "crypto.ts"
Cohesion: 0.12
Nodes (19): createCoreModules(), BcryptArgonPasswordHasher, NodeBootstrapCrypto, PostgresSessionRepository, config, burnPasswordCheck(), hashPassword(), LEGACY (+11 more)

### Community 41 - "q"
Cohesion: 0.08
Nodes (7): PostgresMemberRepository, PostgresOrganizationRepository, PostgresOrganizationSkillsRepository, PostgresLoginCodeRepository, PostgresPasswordResetRepository, recordClassificationUsage(), q()

### Community 42 - "app-services/context.ts"
Cohesion: 0.06
Nodes (16): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+8 more)

### Community 43 - "createIdentityModule"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 44 - "app-runtime/infrastructure/browser.ts"
Cohesion: 0.09
Nodes (29): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+21 more)

### Community 45 - "admission.ts"
Cohesion: 0.07
Nodes (23): ActiveRun, admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun() (+15 more)

### Community 46 - "infrastructure/routing.ts"
Cohesion: 0.08
Nodes (32): TurnState, anthropicChat(), Block, LlmMessage, LlmRequest, LlmResponse, LlmTool, CompatEndpoint (+24 more)

### Community 47 - "domain/score.ts"
Cohesion: 0.09
Nodes (33): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS, JudgeDimension (+25 more)

### Community 48 - "modules/builder/index.ts"
Cohesion: 0.06
Nodes (45): app, lifecycle, monolith, stopRuntimeEventRelay(), BuilderRunRegistry, AgentResult, calculateSpendUseCase, toolRegistry (+37 more)

### Community 49 - "ref_node_path"
Cohesion: 0.09
Nodes (20): playwright-core@1.64.1, playwright-core, root, server, types, worker, app, me (+12 more)

### Community 51 - "builderService.ts"
Cohesion: 0.10
Nodes (13): accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService(), BuilderServiceClient (+5 more)

### Community 52 - "OrgRole"
Cohesion: 0.13
Nodes (8): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, OrgRole, ICollaborationAccountRepository, IOrganizationRepository

### Community 53 - "dependencies"
Cohesion: 0.11
Nodes (17): app, DATA, app, DATA, MODELS, req(), ROOT, SEED (+9 more)

### Community 54 - "projectIndex.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 55 - "skills.test.ts"
Cohesion: 0.09
Nodes (8): AdminApiTokenError, IdentityAccountsService, COMMON_PASSWORDS, Password, createIdentityModule(), AccountSecurity, PublicAccount, fixture()

### Community 56 - "oauth.ts"
Cohesion: 0.09
Nodes (29): accountFromOAuthAccessToken(), authorizationHtml(), createMcpOAuthRouter(), digest(), escapeHtml(), issueTokens(), json(), noStore (+21 more)

### Community 57 - "app-runtime/services.test.ts"
Cohesion: 0.17
Nodes (15): BuildError, bundleBrowser(), compileServerModule(), projectPackages(), serverHash(), toProblems(), runInSandbox(), stopAllSandboxes() (+7 more)

### Community 58 - "app-services/auth.ts"
Cohesion: 0.12
Nodes (37): removeProjectData, removeProjectData(), sessionCookie(), endSession, testSession, EvalError, RunRequest, designSignals (+29 more)

### Community 59 - "model-management/catalog.ts"
Cohesion: 0.15
Nodes (20): Task 3: Proveedores y modelos en BD + seeders, 3. Proveedores y modelos, `llm/catalog.ts`, Pruebas de conexión, Tablas (`002_admin.sql`), tasks, allowedModels(), availableModels() (+12 more)

### Community 60 - "modules/projects/index.ts"
Cohesion: 0.13
Nodes (16): BeforeImage, beforeImages(), restoredFiles(), turnFileChange(), ProjectProps, ChangeEntry, normalizeProjectProfile(), ProjectPatch (+8 more)

### Community 61 - "InviteMemberUseCase.ts"
Cohesion: 0.13
Nodes (8): InviteMemberResult, InviteMemberUseCase, ProjectTarget, ProjectInvite, ProjectInviteProps, PlatformCollaborationMailerService, ICollaborationMailerService, SendInvitationParams

### Community 62 - "ref_node_path"
Cohesion: 0.21
Nodes (7): vite, studioPwa(), here, root, sources(), files(), scopes

### Community 63 - "OrganizationSkillsService.ts"
Cohesion: 0.19
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 64 - "model-management/providers.ts"
Cohesion: 0.08
Nodes (37): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), audit(), providers() (+29 more)

### Community 65 - "OrganizationSkillsService.ts"
Cohesion: 0.11
Nodes (5): Project, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 66 - "FusionOrchestrator.ts"
Cohesion: 0.23
Nodes (25): createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass(), contextMetrics() (+17 more)

### Community 67 - "model-management/router.ts"
Cohesion: 0.15
Nodes (19): analyzeHeuristic(), createModelRouter(), analyzeRequest(), pick(), createTurnFeedback(), penalizeTurn(), feedbackModel(), TurnModelDecision (+11 more)

### Community 68 - "AgentExecution.ts"
Cohesion: 0.14
Nodes (11): Block, BuilderContextMetrics, BuilderFusionStep, BuilderFusionTrace, ContextAuditEvent, ExecutionModel, ExecutionTool, Message (+3 more)

### Community 69 - "github.mjs"
Cohesion: 0.08
Nodes (39): ADMIN_MCP_INSTRUCTIONS, AdminMcpModules, createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists() (+31 more)

### Community 70 - "integrations/github.ts"
Cohesion: 0.11
Nodes (15): RepoSelection, GithubRepository, createGithubImportService(), apps, imports, legacy, ports(), sync (+7 more)

### Community 71 - "createJobs"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 72 - "ProjectsApplication.ts"
Cohesion: 0.17
Nodes (13): CreateCheckpointUseCase, CreateProjectInput, CreateProjectUseCase, Author, Checkpoint, CheckpointProps, parseStarterTemplate(), starterFiles() (+5 more)

### Community 73 - "RunAgentUseCase.ts"
Cohesion: 0.21
Nodes (19): GATE_FIXES, summarize(), addUsage(), emptyUsage(), ExecutionContext, applySummary(), blockTokens(), callLabel() (+11 more)

### Community 74 - "GithubError"
Cohesion: 0.20
Nodes (15): branchName(), createGithubAppService(), installation(), requireApp(), selectRepository(), GithubApp, Installation, pageNumber() (+7 more)

### Community 75 - "Plan.ts"
Cohesion: 0.08
Nodes (29): Implementation plan document (`static/__dev/plan.md`), CheckPlanUseCase, Review, reviewFixTasks(), checkContract(), checkPlanDoc(), CONTRACT_FILE, covers() (+21 more)

### Community 76 - "AppEnv"
Cohesion: 0.05
Nodes (21): CACHE_LIMITS, ProjectCache, ClaimedJob, AppEnv, AppDataPorts, createAppDataService(), TransactionSession, createProjectCacheRepository() (+13 more)

### Community 77 - "Panel de administración del sistema — diseño"
Cohesion: 0.16
Nodes (17): clsx@^2.1.1, sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card() (+9 more)

### Community 78 - "PostgresOrganizationRepository.ts"
Cohesion: 0.19
Nodes (7): OrganizationNamesQuery, InviteView, IOrganizationNameDirectory, MemberView, Org, OrgMemberView, OrganizationRecord

### Community 79 - "roles.ts"
Cohesion: 0.07
Nodes (40): BUILDER_SYSTEM_PROMPT, AgentToolRole, allowedToolsForRole(), assertRoleToolAccess(), BACKEND, CHECKLIST, CONTRACT, DATA (+32 more)

### Community 81 - "settings/index.ts"
Cohesion: 0.20
Nodes (17): PlatformSettingType, SettingDef, SettingGroup, SettingView, MOVED_ENV, createPlatformSettings(), byKey, Def (+9 more)

### Community 82 - "platform.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 83 - "memory/application/service.ts"
Cohesion: 0.10
Nodes (16): AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts, resolveApp() (+8 more)

### Community 84 - "mcp/server.ts"
Cohesion: 0.14
Nodes (15): buildServer(), CONTEXT_TOOLS, DESTRUCTIVE, expectedVersionProp, extraTools, Hints, hintsOf(), McpModules (+7 more)

### Community 85 - "fusion.test.ts"
Cohesion: 0.12
Nodes (16): validateToolInput(), author, features, gemini, gpt, reply(), req, review() (+8 more)

### Community 86 - "PlatformSettingsService"
Cohesion: 0.17
Nodes (5): PlatformSettingsService, PostgresPlatformSettingsStoreAdapter, SettingsDependencies, fixture(), fixture()

### Community 87 - "adminApi.ts"
Cohesion: 0.10
Nodes (31): hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups (+23 more)

### Community 88 - "cli.ts"
Cohesion: 0.17
Nodes (13): [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed(), DEV_FIXTURE, Fixture (+5 more)

### Community 89 - "createAuth"
Cohesion: 0.12
Nodes (25): createAuth(), confirmPasswordReset(), createAppUser(), createSession(), ensureOwnerAdmin(), ensureProjectOwner(), requestPasswordReset(), setTemporaryPassword() (+17 more)

### Community 90 - "Panel de administración del sistema — diseño"
Cohesion: 0.05
Nodes (38): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+30 more)

### Community 91 - "RunTaskLaneUseCase.ts"
Cohesion: 0.11
Nodes (13): RunTaskLaneUseCase, TaskLifecycleUseCase, AgentEvent, AgentExecutionResult, requiresFinishGate(), AgentTask, AgentTaskRepository, LaneTask (+5 more)

### Community 92 - "model-management/providers.ts"
Cohesion: 0.10
Nodes (21): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+13 more)

### Community 93 - "starterTemplate.test.ts"
Cohesion: 0.19
Nodes (6): BootstrapService, SetupError, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 94 - "usage/usage.ts"
Cohesion: 0.15
Nodes (8): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, countAction, mocks

### Community 95 - "createJobs"
Cohesion: 0.12
Nodes (25): createJobQueue(), poll(), processJob(), pump(), start(), stop(), createJobs(), addTimer() (+17 more)

### Community 96 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.20
Nodes (8): PostgresCollaborationAccountRepository, CollaborationAccount, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository, sendInvitation

### Community 97 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 98 - "app-services/secrets.ts"
Cohesion: 0.14
Nodes (8): createSecrets(), projectSecretEnv(), secretEnv(), SECRET_NAME, secretPorts, SecretPorts, requestSecret, secretEnv

### Community 99 - "accountLifecycle.ts"
Cohesion: 0.07
Nodes (10): PostgresApiTokenRepository, McpOAuthAuthorizationCode, McpOAuthClient, McpOAuthRefreshGrant, AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository (+2 more)

### Community 100 - "client/index.ts"
Cohesion: 0.20
Nodes (12): AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes, RouteSpec (+4 more)

### Community 101 - "SettingDefinition"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

### Community 102 - "infrastructure/probe.ts"
Cohesion: 0.24
Nodes (15): 6. API de administración, providerOf(), call(), ECHO_TOOL, errorOf(), listProviderModels(), ModelProbe, perMillion() (+7 more)

### Community 103 - "client.ts"
Cohesion: 0.27
Nodes (9): createClient(), ChatMessage, createAi(), createApiWorkflow(), createAuth(), createRealtime(), createStorage(), StoredFile (+1 more)

### Community 104 - "project-observability/security.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 105 - "studio.mjs"
Cohesion: 0.16
Nodes (17): assertPublic(), fetchPublicText(), isPrivate(), ADMIN, assert(), cleanup(), freePort(), get() (+9 more)

### Community 106 - "collaboration/ports/repositories.ts"
Cohesion: 0.15
Nodes (7): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, RemoveMemberUseCase, Access, MemberAccess, IMemberRepository

### Community 107 - "sandboxWorker.mjs"
Cohesion: 0.24
Nodes (6): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry, ISettingsStore

### Community 108 - "platformDb"
Cohesion: 0.14
Nodes (12): 1. Capa de datos, Conexión, `.env` resultante, Infraestructura, Migraciones, Seeders, platformDb, Tx (+4 more)

### Community 109 - "accountLifecycle.ts"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 110 - "IntegrationRepository"
Cohesion: 0.21
Nodes (15): FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer(), lineOf() (+7 more)

### Community 111 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 112 - "unit/catalog.test.ts"
Cohesion: 0.24
Nodes (4): DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket, publish

### Community 113 - "architecture.test.ts"
Cohesion: 0.16
Nodes (7): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository

### Community 114 - "internal/router.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 115 - "Workspace.tsx"
Cohesion: 0.07
Nodes (39): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, memoryController (+31 more)

### Community 116 - "infrastructure/routing.ts"
Cohesion: 0.20
Nodes (11): useFastPath(), posteriors, gamma(), gaussian(), prior(), sampleBeta(), FUSION_BUDGETS, modelHealth() (+3 more)

### Community 117 - "guides.ts"
Cohesion: 0.20
Nodes (13): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), PRODUCT_GUIDES (+5 more)

### Community 118 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 119 - "ApplicationLifecycle"
Cohesion: 0.17
Nodes (6): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown(), shutdown()

### Community 120 - "createGithubSyncService"
Cohesion: 0.19
Nodes (14): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+6 more)

### Community 121 - "PostgresProjectFileRepository"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 122 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 123 - "SqlAgentTaskRepository.ts"
Cohesion: 0.23
Nodes (5): ListAgentTasksUseCase, SqlAgentTaskRepository, AgentTaskQueries, AgentTaskView, TaskCompletion

### Community 124 - "jobWorkerServer.ts"
Cohesion: 0.29
Nodes (12): lifecycle, lifecycle, monolith, server, stopAppRuntime(), stopEmailTransport, isJobRunnerStarted, startJobRunner (+4 more)

### Community 125 - "Evals.tsx"
Cohesion: 0.22
Nodes (11): api, evaluationsController, Agg, EvalCfg, Evals(), Metric(), money(), RunDetail (+3 more)

### Community 126 - "infrastructure/apps.ts"
Cohesion: 0.19
Nodes (10): AppCredentials, appJwt(), cache, credentials(), generations, githubAppStore, pending, tokenFor() (+2 more)

### Community 128 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 129 - "ProjectServices"
Cohesion: 0.17
Nodes (4): CoreModulesDependencies, ProjectsModuleDependencies, ProjectServices, endpoint()

### Community 130 - "modules/collaboration/index.ts"
Cohesion: 0.15
Nodes (6): MemberQueries, OrganizationQueries, createCollaborationModule(), IMemberQueries, IOrganizationQueries, fixture()

### Community 131 - "modules/integrations/application/github.ts"
Cohesion: 0.16
Nodes (7): createGithubAccountService(), connectAccount(), GithubAccountRepository, Link, SyncResult, PreparedImport, setup()

### Community 133 - "Audit.tsx"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 134 - "Changes.tsx"
Cohesion: 0.19
Nodes (16): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+8 more)

### Community 135 - "settingReactions.ts"
Cohesion: 0.22
Nodes (3): createSettingReactions(), SettingReactionPorts, SettingsChangePort

### Community 136 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 138 - "e2e.mjs"
Cohesion: 0.22
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 139 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 141 - "transports/mcp.test.ts"
Cohesion: 0.25
Nodes (6): createMcpHandler(), account, collaboration, handleMcp, identity, projects

### Community 142 - "replaceVisibleText"
Cohesion: 0.33
Nodes (5): page(), escapeRe(), FileMap, replaceVisibleText(), TextEditResult

### Community 144 - "ProjectKnowledge.tsx"
Cohesion: 0.26
Nodes (9): buildGraphView(), GraphCard, GraphConnection, GraphEdge, GraphNode, GraphQuestion, ProjectGraph, ProjectKnowledge() (+1 more)

### Community 145 - "services"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 146 - "Review Focus"
Cohesion: 0.18
Nodes (9): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 2: Registro y almacén de ajustes, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final (+1 more)

### Community 147 - "spring.ts"
Cohesion: 0.22
Nodes (5): clip(), normalize(), parseSpringOutput(), SpringBuildTool, SpringProject

### Community 148 - "postgres"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 149 - "healthcheck"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 150 - "ServiceControlPanel.tsx"
Cohesion: 0.15
Nodes (15): react-dom@^19.3.1, react-dom, serviceControlController, transport, Actions, failed(), Filter, KIND_LABEL (+7 more)

### Community 151 - "execution.test.ts"
Cohesion: 0.33
Nodes (4): RunAgentUseCase, fixture(), model, usage

### Community 154 - ".execute"
Cohesion: 0.46
Nodes (8): build, BROWSER, args, context, dockerfile, build, build, build

### Community 155 - "app-runtime"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 156 - "guides.ts"
Cohesion: 0.25
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 158 - "apiTypes.test.ts"
Cohesion: 0.22
Nodes (10): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs(), beginTransaction(), dispatch() (+2 more)

### Community 161 - "One project: orders API and durable invoice worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 162 - "job-worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 168 - "forja"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 174 - "GitHub integration"
Cohesion: 0.50
Nodes (3): GitHub integration, HTTP API, Native imports and synchronization

### Community 196 - "createHttp"
Cohesion: 0.25
Nodes (4): { apiUrl }, ApiError, createHttp(), HttpTransport

## Knowledge Gaps
- **20 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1400 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `studioApi.ts`, `BuilderTurnAdapter.ts`, `bootstrap/server.ts`, `Chat.tsx`, `bundler.ts`, `projects/application/usecases.ts`, `BuilderWorkflowPorts`, `FusionOrchestrator.ts`, `policies.test.ts`, `ProjectDb`, `app-runtime/index.ts`, `composition.ts`, `application/context.ts`, `FileMap`, `modules/identity/index.ts`, `model-management/index.ts`, `FinishGateAdapter.ts`, `freshDatabase`, `projects/application/usecases.ts`, `application/problems.ts`, `app-services/context.ts`, `modules/projects/index.ts`, `deps.ts`, `modules/project-knowledge/index.ts`, `PostgresRouterAdministrationRepository.ts`, `bootstrap/server.ts`, `crypto.ts`, `app-services/context.ts`, `admission.ts`, `infrastructure/routing.ts`, `domain/score.ts`, `modules/builder/index.ts`, `ref_node_path`, `builderService.ts`, `OrgRole`, `projectIndex.ts`, `skills.test.ts`, `oauth.ts`, `app-runtime/services.test.ts`, `modules/projects/index.ts`, `InviteMemberUseCase.ts`, `ref_node_path`, `OrganizationSkillsService.ts`, `model-management/providers.ts`, `model-management/router.ts`, `AgentExecution.ts`, `github.mjs`, `integrations/github.ts`, `createJobs`, `ProjectsApplication.ts`, `RunAgentUseCase.ts`, `GithubError`, `Plan.ts`, `AppEnv`, `roles.ts`, `fusion.test.ts`, `PlatformSettingsService`, `adminApi.ts`, `Panel de administración del sistema — diseño`, `RunTaskLaneUseCase.ts`, `starterTemplate.test.ts`, `usage/usage.ts`, `collaboration/postgresAdapters.test.ts`, `SettingDefinition`, `infrastructure/probe.ts`, `project-observability/security.ts`, `collaboration/ports/repositories.ts`, `sandboxWorker.mjs`, `architecture.test.ts`, `infrastructure/routing.ts`, `guides.ts`, `mcp/jobs.ts`, `ApplicationLifecycle`, `createGithubSyncService`, `PostgresProjectFileRepository`, `devDependencies`, `SqlAgentTaskRepository.ts`, `infrastructure/apps.ts`, `modules/collaboration/index.ts`, `modules/integrations/application/github.ts`, `Audit.tsx`, `Changes.tsx`, `settingReactions.ts`, `transports/mcp.test.ts`, `replaceVisibleText`, `ServiceControlPanel.tsx`, `execution.test.ts`, `apiTypes.test.ts`, `createHttp`?**
  _High betweenness centrality (0.289) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ProjectView.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10085933966530981 - nodes in this community are weakly interconnected._
- **Why does `react` connect `bootstrap/server.ts` to `application/problems.ts`, `ProjectView.tsx`, `client/index.ts`, `Audit.tsx`, `Chat.tsx`, `Changes.tsx`, `forms.tsx`, `App.tsx`, `Panel de administración del sistema — diseño`, `FusionOrchestrator.ts`, `ProjectKnowledge.tsx`, `internal/router.ts`, `Workspace.tsx`, `ServiceControlPanel.tsx`, `server/index.ts`, `Evals.tsx`, `projects/application/usecases.ts`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `studioApi.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.050721954831543875 - nodes in this community are weakly interconnected._