# Graph Report - porbeagle  (2026-11-10)

## Corpus Check
- 729 files · ~359,412 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 6, .css 6, .example 1)

## Summary
- 4902 nodes · 12967 edges · 193 communities (164 shown, 29 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 675 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6180f8dd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ProjectView.tsx
- studioApi.ts
- Workspace.tsx
- infrastructure/projectDb.ts
- bootstrap/server.ts
- Chat.tsx
- ObserverPorts
- projects/application/usecases.ts
- builder/contracts.ts
- ProjectsStore
- FusionOrchestrator.ts
- infrastructure/playground.ts
- OrchestrationPolicy.ts
- FusionOrchestrator.ts
- ref_node_fs
- FinishGatePolicy.ts
- ProjectDb
- domain/routing.ts
- FileMap
- ApplicationLifecycle
- app-services/storage.ts
- bootstrap/coreModules.ts
- FileMap
- accountLifecycle.ts
- model-management/index.ts
- server/index.ts
- composition.ts
- modules/builder/index.ts
- app-services/context.ts
- fusion.test.ts
- infrastructure/probe.ts
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
- ProjectSandbox
- app-services/context.ts
- platformDb
- app-runtime/infrastructure/browser.ts
- ProjectDb
- SqlAgentTaskRepository.ts
- domain/score.ts
- appRuntimeServer.ts
- config.ts
- bootstrap/server.ts
- usage/usage.ts
- OrgRole
- executeRun
- projectIndex.ts
- skills.test.ts
- oauth.ts
- BuilderWorkflowPorts
- modules/projects/index.ts
- CheckAccessUseCase.ts
- roles.ts
- collaboration/postgresAdapters.test.ts
- PostgresApiTokenRepository.ts
- OrganizationSkillsService.ts
- PostgresProviderRepository.ts
- adminApi.ts
- application/serviceControl.ts
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
- ports/context.ts
- http.test.ts
- app-services/context.ts
- PostgresProjectsStore
- springRuntime.ts
- platform.ts
- studio.mjs
- mcp/server.ts
- modules/integrations/application/github.ts
- PlatformSettingsService
- modules/projects/index.ts
- app-services/realtime.ts
- .execute
- infrastructure/playground.ts
- Review Focus
- model-management/providers.ts
- SqlAgentTaskRepository.ts
- one
- createJobs
- ref_node_http
- integrations/github.ts
- adminServer.ts
- fusion.test.ts
- domain/contracts.ts
- Changes.tsx
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
- model-management/catalog.ts
- BuilderWorkflowPorts
- guides.ts
- AppEnv
- languages.ts
- createGithubSyncService
- PostgresProjectFileRepository
- settingReactions.ts
- devDependencies
- GithubGateway
- PostgresPlatformSettingsStoreAdapter
- ProjectsApplication.ts
- Backends en otros lenguajes (Java / Spring Boot)
- admission.ts
- builderServer.ts
- app-services/analytics.ts
- createSecrets
- ProjectKnowledge.tsx
- Audit.tsx
- Panel de administración del sistema — diseño
- localSeed.ts
- settingReactions.ts
- Evals.tsx
- GithubProjectPorts
- services
- internal/router.ts
- AgentTaskView
- app-services/payments.ts
- forms.tsx
- App services
- services
- Inventario de funciones de Lovable → Forja
- Desplegar Forja en Coolify
- postgres
- healthcheck
- IdentityRandom
- replaceVisibleText
- createJobQueue
- motion.tsx
- .execute
- app-runtime
- guides.ts
- infrastructure/usage.ts
- languages.ts
- app-services/analytics.ts
- ref_node_crypto
- One project: orders API and durable invoice worker
- judgeRouting.test.ts
- IdentityRandom
- ProjectPatch
- skillLibrary.ts
- application/jobs.ts
- PostgresApiTokenRepository
- GithubRepository
- builderService.ts
- IdentityRandom
- CLAUDE.md
- Durable jobs worker
- service-worker.js
- { BUILTIN_PACKAGES, MANIFEST, readDeps, writeDeps, isValidPackageName, packageName, isNodeBuiltin, depsDir, ensureDeps, resolvePackage, withManifestLock }
- { quickScan, findSecret, formatFinding }
- TEST_DATABASE_URL
- { prepare: prepareImport, attach: attachImport }
- { start: appStart, finish: appFinish, installStart: appInstallStart, installFinish: appInstallFinish, repositories: listRepositories, branches: listBranches }
- { syncProject, holdSync, releaseSync, watchLinked, startGithubSync, stopGithubSync, reschedulePoll }
- { getSecurity, saveScan, startDeepScan, setIgnored }
- vite-env.d.ts
- TEST_DATABASE_URL
- { SHARE_COOKIE, RESERVED_SLUG, shareToken, checkShareToken, previewOrigin, previewUrl, appUrl, parseAppHost }
- { typecheckProject, parseDiagnostics, verifyBuild }
- { connectAccount, oauthStart, oauthFinish, getLink, unlink }
- { prepare: prepareImport, attach: attachImport }
- RealtimeTransport
- { syncProject, holdSync, releaseSync, watchLinked, startGithubSync, stopGithubSync, reschedulePoll }
- { getSecurity, saveScan, startDeepScan, setIgnored }
- TEST_DATABASE_URL

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

## Communities (193 total, 29 thin omitted)

### Community 0 - "ProjectView.tsx"
Cohesion: 0.05
Nodes (72): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+64 more)

### Community 1 - "studioApi.ts"
Cohesion: 0.05
Nodes (42): api, evaluationsController, createEvaluationUseCases(), Agg, EvalCfg, Evals(), Metric(), money() (+34 more)

### Community 2 - "Workspace.tsx"
Cohesion: 0.08
Nodes (34): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, modelsController (+26 more)

### Community 3 - "infrastructure/projectDb.ts"
Cohesion: 0.08
Nodes (40): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, createAppUser, updateAppUserPassword (+32 more)

### Community 4 - "bootstrap/server.ts"
Cohesion: 0.09
Nodes (21): BuilderWorkflowUseCase, FastBuildUseCase, ReviewAndFixUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode (+13 more)

### Community 5 - "Chat.tsx"
Cohesion: 0.08
Nodes (56): radix-ui@^1.8.1, radix-ui, react, api, modelBlockers(), ModelReadiness, playgroundModel(), usableModel() (+48 more)

### Community 6 - "ObserverPorts"
Cohesion: 0.08
Nodes (7): AuthPorts, EmailPorts, AppServiceEvent, ObserverPorts, AuthRepository, QueryRepository, StoragePorts

### Community 7 - "projects/application/usecases.ts"
Cohesion: 0.08
Nodes (11): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, IdentityModuleDependencies, PlatformMailerService, IAccountRepository, ILoginCodeRepository (+3 more)

### Community 8 - "builder/contracts.ts"
Cohesion: 0.09
Nodes (59): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+51 more)

### Community 9 - "ProjectsStore"
Cohesion: 0.10
Nodes (44): describeSchema, ScheduleTasksUseCase, rewardOf(), criteriaOf(), planOverview(), active, AgentResult, background() (+36 more)

### Community 10 - "FusionOrchestrator.ts"
Cohesion: 0.22
Nodes (26): createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass(), contextMetrics() (+18 more)

### Community 11 - "infrastructure/playground.ts"
Cohesion: 0.07
Nodes (41): BUILDER_SYSTEM_PROMPT, AgentToolRole, allowedToolsForRole(), assertRoleToolAccess(), BACKEND, CHECKLIST, CONTRACT, DATA (+33 more)

### Community 12 - "OrchestrationPolicy.ts"
Cohesion: 0.07
Nodes (7): isDevFile(), ProjectsApplication, FileMap, ProjectSnapshot, TurnChanges, createProjectsModule(), ProjectsStore

### Community 13 - "FusionOrchestrator.ts"
Cohesion: 0.07
Nodes (21): ActiveRun, admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun() (+13 more)

### Community 14 - "ref_node_fs"
Cohesion: 0.18
Nodes (16): auditWindow(), ExecutionAudit, identifier(), AuditContext, AuditFilter, AuditReport, AuditStage, AuditStep (+8 more)

### Community 15 - "FinishGatePolicy.ts"
Cohesion: 0.06
Nodes (60): formatProblem(), pageRoutes(), resolveServiceExecution(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint() (+52 more)

### Community 16 - "ProjectDb"
Cohesion: 0.05
Nodes (29): { KIT_BUILTIN }, requestSecret, assertProjectObject(), assertSafeAgentSql(), assertSafePreviewSql(), containsDataChange(), containsSchemaChange(), objectName() (+21 more)

### Community 17 - "domain/routing.ts"
Cohesion: 0.08
Nodes (34): createCatalogService(), allowedModels(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel() (+26 more)

### Community 18 - "FileMap"
Cohesion: 0.11
Nodes (23): @hono/node-server, accountFromOAuthAccessToken(), authorizationHtml(), createMcpOAuthRouter(), digest(), escapeHtml(), issueTokens(), json() (+15 more)

### Community 19 - "ApplicationLifecycle"
Cohesion: 0.06
Nodes (28): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, SharePorts, createPublication(), createShareAccess() (+20 more)

### Community 20 - "app-services/storage.ts"
Cohesion: 0.19
Nodes (9): createStorage(), putObject(), MAX_PROJECT_STORAGE_BYTES, StorageLimitError, StoredObject, MAX_FILE_BYTES, safeStorageKey(), SECRET_NAME (+1 more)

### Community 21 - "bootstrap/coreModules.ts"
Cohesion: 0.11
Nodes (8): ClaimedJob, AppEnv, ProjectDbClient, createProjectRowsRepository(), projectRowsRepository, JobsApi, ProjectRowsPort, ProjectSchemaPort

### Community 22 - "FileMap"
Cohesion: 0.08
Nodes (15): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, Cache (+7 more)

### Community 23 - "accountLifecycle.ts"
Cohesion: 0.05
Nodes (42): RuntimeProjectsPort, ServiceExecution, bindRuntimeObservation(), configureRuntimeProjects(), publication, suggestSlug, AppTarget, loadFiles() (+34 more)

### Community 24 - "model-management/index.ts"
Cohesion: 0.07
Nodes (12): PlatformRole, PostgresAccountLifecycleRepository, AccountRow, SessionAccountRow, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountLifecycleRepository (+4 more)

### Community 25 - "server/index.ts"
Cohesion: 0.09
Nodes (14): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, ProjectPath, IProjectFileRepository, app, database, pool (+6 more)

### Community 26 - "composition.ts"
Cohesion: 0.09
Nodes (28): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallContext, InstallEvent (+20 more)

### Community 27 - "modules/builder/index.ts"
Cohesion: 0.09
Nodes (32): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), audit(), speedFor() (+24 more)

### Community 28 - "app-services/context.ts"
Cohesion: 0.11
Nodes (13): bindJobs, sendEmail, jobPorts, log(), configureSecretIntegrations(), secretPorts, JobRuntimePorts, deleteSecret (+5 more)

### Community 29 - "fusion.test.ts"
Cohesion: 0.08
Nodes (36): AgentResult, calculateSpendUseCase, toolRegistry, runAgent(), toolByName, getProject(), readFile(), estTokens() (+28 more)

### Community 30 - "infrastructure/probe.ts"
Cohesion: 0.23
Nodes (15): providerOf(), providers(), call(), ECHO_TOOL, errorOf(), listProviderModels(), ModelProbe, perMillion() (+7 more)

### Community 31 - "projects/application/usecases.ts"
Cohesion: 0.10
Nodes (28): AgentSpec, TurnState, KEYWORDS, RoleProfile, ROLES, Posterior, ExecutionContextMetrics, FusionBudget (+20 more)

### Community 32 - "application/problems.ts"
Cohesion: 0.08
Nodes (37): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KitEntry, BUILTIN_PACKAGES, Deps, isValidPackageName(), MANIFEST (+29 more)

### Community 33 - "AgentExecution.ts"
Cohesion: 0.10
Nodes (33): createProjectCheck(), ProjectCompilerPort, createServiceControl(), restart(), scale(), snapshot(), BuildProblem, FileMap (+25 more)

### Community 34 - "IPersonalOrganizationRepository"
Cohesion: 0.05
Nodes (13): PostgresMemberRepository, PostgresOrganizationRepository, PostgresOrganizationSkillsRepository, PostgresLoginCodeRepository, McpOAuthAuthorizationCode, McpOAuthClient, McpOAuthRefreshGrant, PostgresPasswordResetRepository (+5 more)

### Community 35 - "modules/projects/index.ts"
Cohesion: 0.06
Nodes (19): PlaygroundView, AgentEvent, AgentResult, Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole (+11 more)

### Community 36 - "deps.ts"
Cohesion: 0.07
Nodes (38): ProjectEvent, ProjectLogLine, projectsController, CreateProjectOptions, createProjectUseCases(), isProjectLogLine(), isProjectProblem(), isRecord() (+30 more)

### Community 37 - "modules/project-knowledge/index.ts"
Cohesion: 0.12
Nodes (24): Catalog, createModelManagementQueries(), routerAudit(), updateProjectModels(), isMode(), bindModelAudit(), bindCatalogService(), bindCatalogSync() (+16 more)

### Community 38 - "domain/services.ts"
Cohesion: 0.06
Nodes (36): Task 1: Postgres, migraciones y helper de tests, Task 3: Proveedores y modelos en BD + seeders, 9. Pruebas, pg, vitest, recordClassificationUsage(), migrate(), ANTHROPIC_MODELS (+28 more)

### Community 39 - "model-management/catalog.ts"
Cohesion: 0.06
Nodes (41): dependencies, @anthropic-ai/sdk@^1.3.0, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, hono@^4.13.14, @hono/node-server@^2.1.5, lucide-react@^1.66.0 (+33 more)

### Community 40 - "RunTaskLaneUseCase.ts"
Cohesion: 0.10
Nodes (19): createKnowledgeService(), KnowledgeEngine, KnowledgeFiles, prepareCorpus(), KnowledgeAnswer, KnowledgeEdge, KnowledgeGraph, KnowledgeNode (+11 more)

### Community 41 - "ProjectSandbox"
Cohesion: 0.16
Nodes (4): makeRoomForSandbox(), ProjectSandbox, SandboxRunError, ServicePool

### Community 42 - "app-services/context.ts"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 43 - "platformDb"
Cohesion: 0.11
Nodes (22): lifecycle, [command, ...flags], main(), monolith, seedDev, seedLocal, lifecycle, monolith (+14 more)

### Community 44 - "app-runtime/infrastructure/browser.ts"
Cohesion: 0.12
Nodes (20): createCoreModules(), PostgresCollaborationAccountRepository, CollaborationAccount, BcryptArgonPasswordHasher, NodeBootstrapCrypto, burnPasswordCheck(), hashPassword(), LEGACY (+12 more)

### Community 45 - "ProjectDb"
Cohesion: 0.13
Nodes (7): AppDataPorts, createAppDataService(), TransactionSession, ProjectMigration, SqlExecutionResult, TransactionAction, ProjectDb

### Community 46 - "SqlAgentTaskRepository.ts"
Cohesion: 0.09
Nodes (14): AgentEvent, accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService() (+6 more)

### Community 47 - "domain/score.ts"
Cohesion: 0.10
Nodes (27): anthropicChat(), FUSION_BUDGETS, Block, LlmMessage, LlmRequest, LlmResponse, LlmTool, CompatEndpoint (+19 more)

### Community 48 - "appRuntimeServer.ts"
Cohesion: 0.08
Nodes (26): withDefaultHeaders(), app, handleAdminMcp, handleMcp, lifecycle, listening(), monolith, reactions (+18 more)

### Community 49 - "config.ts"
Cohesion: 0.08
Nodes (25): platformMemoryReport(), remote(), localMemoryReport(), alive, beginTransaction(), dispatch(), sandboxes, sandboxStats() (+17 more)

### Community 50 - "bootstrap/server.ts"
Cohesion: 0.12
Nodes (5): AdminApiTokenError, IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 51 - "usage/usage.ts"
Cohesion: 0.10
Nodes (27): analyzeHeuristic(), createModelRouter(), analyzeRequest(), pick(), useFastPath(), createTurnFeedback(), penalizeTurn(), posteriors (+19 more)

### Community 52 - "OrgRole"
Cohesion: 0.07
Nodes (3): PostgresProjectsStore, ProjectOrganizations, QueryHandle

### Community 53 - "executeRun"
Cohesion: 0.10
Nodes (21): Implementation plan document (`static/__dev/plan.md`), CheckPlanUseCase, checkContract(), checkPlanDoc(), CONTRACT_FILE, covers(), MAX_CONTRACT, MAX_GOAL (+13 more)

### Community 54 - "projectIndex.ts"
Cohesion: 0.17
Nodes (14): @electric-sql/pglite, createEmail(), sendEmail(), sendPlatformEmail(), verifiedSender(), projectDb(), authRepository(), createAuthRepository() (+6 more)

### Community 55 - "skills.test.ts"
Cohesion: 0.17
Nodes (21): GATE_FIXES, summarize(), addUsage(), AgentExecutionSpec, emptyUsage(), ExecutionContext, applySummary(), blockTokens() (+13 more)

### Community 56 - "oauth.ts"
Cohesion: 0.11
Nodes (35): applyProjectMigrationsLocal(), assertRuntimeSql(), checksum(), cloneDatabase(), closeEntry(), closeProject(), closing, databasePath() (+27 more)

### Community 57 - "BuilderWorkflowPorts"
Cohesion: 0.13
Nodes (7): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, OrgRole, IOrganizationRepository

### Community 58 - "modules/projects/index.ts"
Cohesion: 0.09
Nodes (19): CoreModulesDependencies, CreateProjectInput, CreateProjectUseCase, ChangeEntry, normalizeProjectProfile(), ProjectProfile, SeoSettings, TurnFileChange (+11 more)

### Community 59 - "CheckAccessUseCase.ts"
Cohesion: 0.12
Nodes (25): createAuth(), confirmPasswordReset(), createAppUser(), createSession(), ensureOwnerAdmin(), ensureProjectOwner(), requestPasswordReset(), setTemporaryPassword() (+17 more)

### Community 60 - "roles.ts"
Cohesion: 0.23
Nodes (10): createRouterAdministration(), routerStats(), FusionPattern, RouterPosteriorRow, RouterStats, listFusionTraces(), postgresRouterAdministrationRepository, RouterAdministrationRepository (+2 more)

### Community 61 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.11
Nodes (15): AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts, resolveApp() (+7 more)

### Community 62 - "PostgresApiTokenRepository.ts"
Cohesion: 0.08
Nodes (22): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, createProblemService(), changed(), clearProblems() (+14 more)

### Community 63 - "OrganizationSkillsService.ts"
Cohesion: 0.12
Nodes (27): createMonolith(), startBindings(), stopBindings(), sendPlatformEmail, configureJobRuntime(), configureAppServiceObserver(), applyProjectMigrations(), initializeAppServices (+19 more)

### Community 64 - "PostgresProviderRepository.ts"
Cohesion: 0.13
Nodes (32): sessionCookie(), endSession, testSession, EvalError, RunRequest, designSignals, EVAL_EMAIL, spentLast24h() (+24 more)

### Community 65 - "adminApi.ts"
Cohesion: 0.10
Nodes (33): hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups (+25 more)

### Community 66 - "application/serviceControl.ts"
Cohesion: 0.15
Nodes (13): ControlledService, RuntimeService, ServiceControlSnapshot, ServiceQueueEntry, ServiceReplica, ServiceRuntimeSnapshot, getSandboxServices(), restartSandboxService() (+5 more)

### Community 67 - "model-management/router.ts"
Cohesion: 0.10
Nodes (32): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS, JudgeDimension (+24 more)

### Community 68 - "IPasswordHasher"
Cohesion: 0.11
Nodes (10): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, StaticToolRegistryAdapter (+2 more)

### Community 69 - "execution-audit/index.ts"
Cohesion: 0.09
Nodes (29): app, DATA, app, DATA, MODELS, ROOT, SEED, MODELS (+21 more)

### Community 70 - "integrations/github.ts"
Cohesion: 0.16
Nodes (17): clsx@^2.1.1, sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card() (+9 more)

### Community 71 - "createJobs"
Cohesion: 0.12
Nodes (7): PersonalOrganizationUseCase, Organization, OrganizationProps, CollaborationModuleDependencies, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 72 - "ports/jobs.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 73 - "application/context.ts"
Cohesion: 0.08
Nodes (23): playwright-core@1.64.1, playwright-core, vite, studioPwa(), here, root, server, types (+15 more)

### Community 74 - "GithubError"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 75 - "Standards.ts"
Cohesion: 0.09
Nodes (12): Run, AppUser, createProjectCache(), createContext(), serviceContext(), EndpointContext, enqueue(), HttpError (+4 more)

### Community 76 - "policies.test.ts"
Cohesion: 0.12
Nodes (15): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, InviteMemberResult, InviteMemberUseCase, ProjectTarget, RemoveMemberUseCase, Access (+7 more)

### Community 77 - "ports/context.ts"
Cohesion: 0.11
Nodes (7): AppAiResult, CheckoutInput, EmailInput, EmailResult, StoredObject, CacheRepository, ContextPorts

### Community 78 - "http.test.ts"
Cohesion: 0.11
Nodes (5): Project, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 79 - "app-services/context.ts"
Cohesion: 0.19
Nodes (20): api, integrationsController, GithubAccount, GithubRepository, GithubSelection, GithubCard, GithubCommitCard(), GithubSection() (+12 more)

### Community 80 - "PostgresProjectsStore"
Cohesion: 0.09
Nodes (25): createDevelopmentSeed(), DEV_FIXTURE, Fixture, AdminMcpModules, createMcpHandler(), builderCoreModules, CollaborationModule, IdentityModule (+17 more)

### Community 81 - "springRuntime.ts"
Cohesion: 0.07
Nodes (32): APP_DIR, buildCommand(), CACHE_DIR, clip(), detectSpringProject(), isSpringSource(), jarDirectory(), jvmCommand() (+24 more)

### Community 82 - "platform.ts"
Cohesion: 0.15
Nodes (10): Block, BuilderContextMetrics, BuilderFusionStep, BuilderFusionTrace, ContextAuditEvent, ExecutionTool, Message, ToolDefinition (+2 more)

### Community 83 - "studio.mjs"
Cohesion: 0.19
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 84 - "mcp/server.ts"
Cohesion: 0.27
Nodes (13): createJobs(), addTimer(), enqueueJob(), executeJob(), fireDueTimers(), initializeAppServices(), report(), runJob() (+5 more)

### Community 85 - "modules/integrations/application/github.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 86 - "PlatformSettingsService"
Cohesion: 0.20
Nodes (17): PlatformSettingType, SettingDef, SettingGroup, SettingView, MOVED_ENV, createPlatformSettings(), byKey, Def (+9 more)

### Community 87 - "modules/projects/index.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 88 - "app-services/realtime.ts"
Cohesion: 0.09
Nodes (24): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+16 more)

### Community 90 - "infrastructure/playground.ts"
Cohesion: 0.13
Nodes (5): MemberQueries, OrganizationQueries, createCollaborationModule(), IMemberQueries, fixture()

### Community 91 - "Review Focus"
Cohesion: 0.17
Nodes (5): PlatformSettingsService, PostgresPlatformSettingsStoreAdapter, SettingsDependencies, fixture(), fixture()

### Community 92 - "model-management/providers.ts"
Cohesion: 0.18
Nodes (13): serviceControlController, transport, Actions, failed(), Filter, KIND_LABEL, observed(), ServiceCard() (+5 more)

### Community 93 - "SqlAgentTaskRepository.ts"
Cohesion: 0.16
Nodes (6): TaskLifecycleUseCase, requiresFinishGate(), SqlAgentTaskRepository, AgentTask, AgentTaskRepository, TaskCompletion

### Community 94 - "one"
Cohesion: 0.10
Nodes (21): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+13 more)

### Community 95 - "createJobs"
Cohesion: 0.15
Nodes (9): RunTaskLaneUseCase, AgentExecutionResult, ExecutionModel, LaneTask, TaskLaneHooks, TaskLanePorts, fixture(), result (+1 more)

### Community 96 - "ref_node_http"
Cohesion: 0.19
Nodes (6): BootstrapService, SetupError, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 97 - "integrations/github.ts"
Cohesion: 0.04
Nodes (52): createGithubAccountService(), connectAccount(), GithubAccountRepository, GithubAuthorization, AppCredentials, AppStore, branchName(), createGithubAppService() (+44 more)

### Community 98 - "adminServer.ts"
Cohesion: 0.12
Nodes (20): ADMIN_MCP_INSTRUCTIONS, createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists(), descriptions (+12 more)

### Community 99 - "fusion.test.ts"
Cohesion: 0.12
Nodes (16): validateToolInput(), author, features, gemini, gpt, reply(), req, review() (+8 more)

### Community 100 - "domain/contracts.ts"
Cohesion: 0.19
Nodes (12): AiUnavailableError, createAi(), appAiChat(), AiBlock, AiContextMetrics, AiFusionTrace, AiUsage, AppAiInput (+4 more)

### Community 101 - "Changes.tsx"
Cohesion: 0.18
Nodes (15): filesController, DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats() (+7 more)

### Community 102 - "platformDb"
Cohesion: 0.22
Nodes (4): createUsageService(), DAILY_ACTIONS, UsageRepository, actionsToday

### Community 103 - "client.ts"
Cohesion: 0.10
Nodes (29): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), PRODUCT_GUIDES (+21 more)

### Community 104 - "FusionOrchestrator.ts"
Cohesion: 0.22
Nodes (4): CACHE_LIMITS, ProjectCache, createProjectCacheRepository(), PROJECT_CACHE_SCHEMA

### Community 105 - "infrastructure/judge.ts"
Cohesion: 0.16
Nodes (7): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository

### Community 106 - "collaboration/ports/repositories.ts"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

### Community 107 - "sandboxWorker.mjs"
Cohesion: 0.20
Nodes (12): AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes, RouteSpec (+4 more)

### Community 108 - "createProjectRows"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 109 - "accountLifecycle.ts"
Cohesion: 0.24
Nodes (6): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry, ISettingsStore

### Community 110 - "IntegrationRepository"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 111 - "sandboxWorker.mjs"
Cohesion: 0.21
Nodes (15): FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer(), lineOf() (+7 more)

### Community 112 - "GithubRepository"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 113 - "architecture.test.ts"
Cohesion: 0.12
Nodes (14): OrganizationNamesQuery, InviteView, IOrganizationNameDirectory, IOrganizationQueries, MemberView, Org, OrgMemberView, OrganizationRecord (+6 more)

### Community 114 - "client/index.ts"
Cohesion: 0.10
Nodes (6): Account, AccountProps, Email, COMMON_PASSWORDS, Password, PostgresAccountRepository

### Community 115 - "model-management/catalog.ts"
Cohesion: 0.22
Nodes (15): `llm/catalog.ts`, tasks, availableModels(), catalog(), creditsForUsd(), deleteModel(), lastSync(), listCatalog() (+7 more)

### Community 117 - "guides.ts"
Cohesion: 0.19
Nodes (14): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+6 more)

### Community 118 - "AppEnv"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 119 - "languages.ts"
Cohesion: 0.08
Nodes (24): dataBridge, springRuntime, stopLanguageRuntimes(), toolChecks, toolUnavailable(), unavailable(), BASE_ENV, bwrapUnavailable() (+16 more)

### Community 120 - "createGithubSyncService"
Cohesion: 0.27
Nodes (9): createClient(), ChatMessage, createAi(), createApiWorkflow(), createAuth(), createRealtime(), createStorage(), StoredFile (+1 more)

### Community 121 - "PostgresProjectFileRepository"
Cohesion: 0.17
Nodes (6): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown(), shutdown()

### Community 122 - "settingReactions.ts"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 123 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 124 - "GithubGateway"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 125 - "PostgresPlatformSettingsStoreAdapter"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 126 - "ProjectsApplication.ts"
Cohesion: 0.22
Nodes (7): CreateCheckpointUseCase, Author, beforeImages(), restoredFiles(), turnFileChange(), Checkpoint, CheckpointProps

### Community 127 - "Backends en otros lenguajes (Java / Spring Boot)"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 128 - "admission.ts"
Cohesion: 0.21
Nodes (11): api, memoryController, Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection() (+3 more)

### Community 129 - "builderServer.ts"
Cohesion: 0.24
Nodes (10): startAppRuntimeEventRelay(), app, lifecycle, monolith, stopRuntimeEventRelay(), stopBuilder(), metricsIdle(), reloadLangfuse() (+2 more)

### Community 130 - "app-services/analytics.ts"
Cohesion: 0.20
Nodes (9): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays(), analyticsPorts (+1 more)

### Community 131 - "createSecrets"
Cohesion: 0.18
Nodes (4): createSecrets(), projectSecretEnv(), secretEnv(), SecretPorts

### Community 132 - "ProjectKnowledge.tsx"
Cohesion: 0.29
Nodes (8): buildGraphView(), GraphCard, GraphConnection, GraphEdge, GraphNode, GraphQuestion, ProjectGraph, ProjectKnowledge()

### Community 133 - "Audit.tsx"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 134 - "Panel de administración del sistema — diseño"
Cohesion: 0.09
Nodes (24): 10. Documentación, 1. Capa de datos, 2. Ajustes globales, 3. Proveedores y modelos, 4. Playground de agentes, 5. Enrutador, 6. API de administración, 7. Studio (+16 more)

### Community 135 - "localSeed.ts"
Cohesion: 0.43
Nodes (6): createLocalSeed(), readSeedFile(), SeedFile, saveModel(), saveProvider(), SettingsModule

### Community 136 - "settingReactions.ts"
Cohesion: 0.22
Nodes (3): createSettingReactions(), SettingReactionPorts, SettingsChangePort

### Community 137 - "Evals.tsx"
Cohesion: 0.26
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 138 - "GithubProjectPorts"
Cohesion: 0.16
Nodes (6): BeforeImage, ProjectProps, PostgresProjectFileRepository, PATCHABLE, ProjectEventPort, LogChangeInput

### Community 139 - "services"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 140 - "internal/router.ts"
Cohesion: 0.18
Nodes (9): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 2: Registro y almacén de ajustes, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final (+1 more)

### Community 141 - "AgentTaskView"
Cohesion: 0.44
Nodes (3): ListAgentTasksUseCase, AgentTaskQueries, AgentTaskView

### Community 142 - "app-services/payments.ts"
Cohesion: 0.24
Nodes (4): DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket, publish

### Community 143 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 144 - "App services"
Cohesion: 0.36
Nodes (6): createRealtime(), attachSocket(), publish(), publishPresence(), stopRealtime(), App services

### Community 145 - "services"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 146 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 147 - "Desplegar Forja en Coolify"
Cohesion: 0.06
Nodes (32): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+24 more)

### Community 149 - "healthcheck"
Cohesion: 0.33
Nodes (8): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError

### Community 150 - "IdentityRandom"
Cohesion: 0.33
Nodes (4): RunAgentUseCase, fixture(), model, usage

### Community 151 - "replaceVisibleText"
Cohesion: 0.33
Nodes (5): page(), escapeRe(), FileMap, replaceVisibleText(), TextEditResult

### Community 152 - "createJobQueue"
Cohesion: 0.22
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 153 - "motion.tsx"
Cohesion: 0.39
Nodes (9): build, BROWSER, JAVA, args, context, dockerfile, build, build (+1 more)

### Community 154 - ".execute"
Cohesion: 0.22
Nodes (9): command, environment, expose, labels, restart, security_opt, stop_grace_period, volumes (+1 more)

### Community 155 - "app-runtime"
Cohesion: 0.25
Nodes (4): { apiUrl }, ApiError, createHttp(), HttpTransport

### Community 157 - "infrastructure/usage.ts"
Cohesion: 0.40
Nodes (3): countAction(), usageRepository, mocks

### Community 158 - "languages.ts"
Cohesion: 0.25
Nodes (8): command, environment, expose, restart, security_opt, stop_grace_period, volumes, builder

### Community 159 - "app-services/analytics.ts"
Cohesion: 0.25
Nodes (8): command, environment, expose, restart, security_opt, stop_grace_period, volumes, forja

### Community 160 - "ref_node_crypto"
Cohesion: 0.25
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 161 - "One project: orders API and durable invoice worker"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 162 - "judgeRouting.test.ts"
Cohesion: 0.33
Nodes (5): billing, { callModel }, input, model, scope

### Community 165 - "skillLibrary.ts"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 168 - "application/jobs.ts"
Cohesion: 0.15
Nodes (9): createJobQueue(), poll(), processJob(), pump(), start(), stop(), JOB_LIMITS, JobCron (+1 more)

### Community 169 - "PostgresApiTokenRepository"
Cohesion: 0.14
Nodes (5): PostgresApiTokenRepository, AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository

### Community 171 - "builderService.ts"
Cohesion: 0.43
Nodes (6): createModelClassification(), answer(), model, prediction(), scope, setup()

### Community 180 - "CLAUDE.md"
Cohesion: 0.50
Nodes (3): GitHub integration, HTTP API, Native imports and synchronization

## Knowledge Gaps
- **20 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1434 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `domain/services.ts` to `ProjectView.tsx`, `studioApi.ts`, `bootstrap/server.ts`, `Chat.tsx`, `projects/application/usecases.ts`, `infrastructure/playground.ts`, `FusionOrchestrator.ts`, `ref_node_fs`, `FinishGatePolicy.ts`, `ProjectDb`, `domain/routing.ts`, `FileMap`, `ApplicationLifecycle`, `bootstrap/coreModules.ts`, `accountLifecycle.ts`, `model-management/index.ts`, `server/index.ts`, `modules/builder/index.ts`, `app-services/context.ts`, `fusion.test.ts`, `infrastructure/probe.ts`, `AgentExecution.ts`, `modules/projects/index.ts`, `deps.ts`, `modules/project-knowledge/index.ts`, `model-management/catalog.ts`, `RunTaskLaneUseCase.ts`, `app-runtime/infrastructure/browser.ts`, `ProjectDb`, `SqlAgentTaskRepository.ts`, `domain/score.ts`, `appRuntimeServer.ts`, `config.ts`, `bootstrap/server.ts`, `usage/usage.ts`, `executeRun`, `projectIndex.ts`, `skills.test.ts`, `BuilderWorkflowPorts`, `modules/projects/index.ts`, `roles.ts`, `PostgresApiTokenRepository.ts`, `OrganizationSkillsService.ts`, `adminApi.ts`, `application/serviceControl.ts`, `model-management/router.ts`, `IPasswordHasher`, `createJobs`, `ports/jobs.ts`, `application/context.ts`, `GithubError`, `Standards.ts`, `policies.test.ts`, `PostgresProjectsStore`, `platform.ts`, `studio.mjs`, `modules/integrations/application/github.ts`, `app-services/realtime.ts`, `infrastructure/playground.ts`, `Review Focus`, `model-management/providers.ts`, `SqlAgentTaskRepository.ts`, `createJobs`, `ref_node_http`, `integrations/github.ts`, `adminServer.ts`, `fusion.test.ts`, `Changes.tsx`, `platformDb`, `client.ts`, `FusionOrchestrator.ts`, `infrastructure/judge.ts`, `collaboration/ports/repositories.ts`, `accountLifecycle.ts`, `architecture.test.ts`, `client/index.ts`, `guides.ts`, `languages.ts`, `PostgresProjectFileRepository`, `settingReactions.ts`, `devDependencies`, `GithubGateway`, `ProjectsApplication.ts`, `Backends en otros lenguajes (Java / Spring Boot)`, `builderServer.ts`, `settingReactions.ts`, `Evals.tsx`, `AgentTaskView`, `IdentityRandom`, `replaceVisibleText`, `app-runtime`, `guides.ts`, `infrastructure/usage.ts`, `One project: orders API and durable invoice worker`, `judgeRouting.test.ts`, `builderService.ts`?**
  _High betweenness centrality (0.314) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ProjectView.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.047058823529411764 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Chat.tsx` to `ProjectView.tsx`, `studioApi.ts`, `Workspace.tsx`, `admission.ts`, `ProjectKnowledge.tsx`, `Changes.tsx`, `integrations/github.ts`, `model-management/catalog.ts`, `builder/contracts.ts`, `deps.ts`, `sandboxWorker.mjs`, `createProjectRows`, `forms.tsx`, `app-services/context.ts`, `composition.ts`, `model-management/providers.ts`, `Backends en otros lenguajes (Java / Spring Boot)`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `studioApi.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.050957481337228175 - nodes in this community are weakly interconnected._