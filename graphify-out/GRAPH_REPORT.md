# Graph Report - anemone  (2026-11-05)

## Corpus Check
- 683 files · ~312,890 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 6, .css 5, .example 1)

## Summary
- 4535 nodes · 11899 edges · 190 communities (161 shown, 29 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 626 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d02a94c5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- model-management/catalog.ts
- index.tsx
- ProjectsApplication.ts
- Chat.tsx
- builderService.ts
- ProviderService.ts
- appServer.ts
- http-client.ts
- AgentExecution.ts
- one
- with
- roles.ts
- BuilderToolsAdapter.ts
- evaluations/bindings.test.ts
- modules/builder/index.ts
- BuilderTurnAdapter.ts
- memory/application/service.ts
- ExecutionMetrics
- projectRows.ts
- infrastructure/runner.ts
- adminApi.ts
- app-services/projectDb.ts
- modules/identity/index.ts
- FusionOrchestrator.ts
- app-runtime/infrastructure/browser.ts
- react
- BuilderToolsAdapter.ts
- modules/collaboration/index.ts
- modules/projects/index.ts
- toolOutputs.test.ts
- config.ts
- ProjectView.tsx
- studioApi.ts
- bundler.ts
- bootstrap/server.ts
- projectIndex.ts
- createJobs
- compilerOptions
- models.ts
- skills.test.ts
- PostgresOrganizationRepository.ts
- SqlAgentTaskRepository.ts
- client/index.ts
- scripts
- collaboration/postgresAdapters.test.ts
- composition.ts
- model-management/index.ts
- mcp/server.ts
- app-runtime/services.test.ts
- package.json
- ProjectsStore
- Project
- adminServer.ts
- policies.test.ts
- usage/usage.ts
- ApplicationLifecycle
- server/index.ts
- integrations/github.ts
- createIdentityModule
- CLAUDE.md
- PostgresProjectFileRepository
- deps.ts
- sandboxWorker.mjs
- postgres
- builderServer.ts
- PostgresProjectsStore
- RunTaskLaneUseCase.ts
- Workspace.tsx
- domain/messages.ts
- ProjectSandbox
- GithubGateway
- IOrganizationRepository
- Account
- services
- projects/application/usecases.ts
- infrastructure/playground.ts
- application/security.ts
- e2e.mjs
- builder/contracts.ts
- integrations/index.ts
- TEST_DATABASE_URL
- model-management/router.ts
- fusion.test.ts
- domain/score.ts
- AuthPorts
- app-services/analytics.ts
- FusionOrchestrator.ts
- application/serviceControl.ts
- createCollaborationModule
- cli.ts
- infrastructure/projects.ts
- BootstrapService
- modules/projects/index.ts
- github.mjs
- agents.mjs
- Memory.tsx
- BuilderWorkflow.ts
- Plan.ts
- internal/router.ts
- IntegrationRepository
- infrastructure/repositories.ts
- studio.mjs
- ExecutionAudit.ts
- policies.test.ts
- app-services/storage.ts
- apiTypes.test.ts
- OrganizationSkillsService.ts
- PostgresApiTokenRepository
- Review Focus
- identity/postgresAdapters.test.ts
- ports.ts
- createGithubSyncService
- devDependencies
- domain/securityScan.ts
- ProjectDbClient
- RouterAdministration.ts
- platform.ts
- Inventario de funciones de Lovable → Forja
- AdmissionState
- { api, auth, storage, ai }
- settings/index.ts
- App.tsx
- client.ts
- PostgresCatalogRepository.ts
- ref_node_path
- postgres
- healthcheck
- AppEnv
- app-runtime
- collaboration/ports/repositories.ts
- build
- Changes.tsx
- PlatformSettingsService
- http.test.ts
- builder
- GithubAccountRepository
- admission.ts
- mcp/jobs.ts
- forja
- FinishGateAdapter.ts
- InviteMemberUseCase.ts
- createAdminMcpHandler
- policies.test.ts
- application/context.ts
- 1. Capa de datos
- forms.tsx
- vitest
- AccountLifecycleRepository
- createHttp
- app-services/realtime.ts
- createJobQueue
- job-worker
- crypto.ts
- starterTemplate.test.ts
- execution.test.ts
- createAuth
- RealtimeTransport
- app-services/context.ts
- { SandboxRunError, runInSandbox, stopSandbox, stopAllSandboxes, getSandboxServices, restartSandboxService }
- GithubAuthorization
- spring.ts
- GithubProjectPorts
- judgeRouting.test.ts
- IdentityRandom
- BuilderRunRegistry
- motion.tsx
- AppEnv
- Durable jobs worker
- One project: orders API and durable invoice worker
- CoreModulesDependencies
- ServiceControlPanel.tsx
- Panel de administración del sistema — diseño
- architecture.test.ts
- q
- Audit.tsx
- settings/index.ts
- { getSecurity, saveScan, startDeepScan, setIgnored }
- { BuildError, buildClient, buildExamples, checkProject, compileServerModule, endpointRoutes, pageRoutes, exampleFiles, jobFiles, readJobSettings, formatProblem }
- { BUILTIN_PACKAGES, MANIFEST, readDeps, writeDeps, isValidPackageName, packageName, isNodeBuiltin, depsDir, ensureDeps, resolvePackage, withManifestLock }
- { KIT_BUILTIN, KIT_CATALOG, kitSummary }
- { publishProject, unpublishProject }
- { quickScan, findSecret, formatFinding }
- { runBrowserTest, inspectPreview, allowedRequest, closeBrowser }
- { serveApp, parseCookies, cookie }
- { SHARE_COOKIE, RESERVED_SLUG, shareToken, checkShareToken, previewOrigin, previewUrl, appUrl, parseAppHost }
- { typecheckProject, parseDiagnostics, verifyBuild }
- { syncProject, holdSync, releaseSync, watchLinked, startGithubSync, stopGithubSync, reschedulePoll }

## God Nodes (most connected - your core abstractions)
1. `vitest` - 155 edges
2. `q()` - 110 edges
3. `createStudioApi()` - 73 edges
4. `react` - 48 edges
5. `createIdentityModule()` - 46 edges
6. `one()` - 42 edges
7. `ProjectsStore` - 40 edges
8. `createProjectsModule()` - 39 edges
9. `ProjectView()` - 36 edges
10. `PostgresProjectsStore` - 35 edges

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

## Communities (190 total, 29 thin omitted)

### Community 0 - "model-management/catalog.ts"
Cohesion: 0.10
Nodes (38): 6. API de administración, deleteModel(), lastSync(), listCatalog(), providerOf(), providers(), startCatalogSync(), sync() (+30 more)

### Community 1 - "index.tsx"
Cohesion: 0.19
Nodes (15): sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card(), EmptyState() (+7 more)

### Community 2 - "ProjectsApplication.ts"
Cohesion: 0.27
Nodes (4): CreateCheckpointUseCase, Author, Checkpoint, CheckpointProps

### Community 3 - "Chat.tsx"
Cohesion: 0.05
Nodes (70): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+62 more)

### Community 4 - "builderService.ts"
Cohesion: 0.10
Nodes (13): accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService(), BuilderServiceClient (+5 more)

### Community 5 - "ProviderService.ts"
Cohesion: 0.14
Nodes (16): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), ProviderError (+8 more)

### Community 6 - "appServer.ts"
Cohesion: 0.10
Nodes (38): RuntimeEvent, resolveServiceExecution(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle() (+30 more)

### Community 7 - "http-client.ts"
Cohesion: 0.08
Nodes (23): api, billingController, Meter(), Plan(), Usage, createEvaluationUseCases(), createIdentityUseCases(), api (+15 more)

### Community 8 - "AgentExecution.ts"
Cohesion: 0.12
Nodes (16): GATE_FIXES, addUsage(), AgentExecutionSpec, Block, BuilderContextMetrics, BuilderFusionStep, BuilderFusionTrace, ContextAuditEvent (+8 more)

### Community 9 - "one"
Cohesion: 0.12
Nodes (9): PlatformRole, PostgresAccountLifecycleRepository, AccountRow, SessionAccountRow, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountSecurity (+1 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "roles.ts"
Cohesion: 0.09
Nodes (22): AgentToolRole, allowedToolsForRole(), assertRoleToolAccess(), BACKEND, CHECKLIST, CONTRACT, DATA, DESIGN (+14 more)

### Community 12 - "BuilderToolsAdapter.ts"
Cohesion: 0.06
Nodes (24): requestSecret, assertProjectObject(), assertSafeAgentSql(), objectName(), redactSqlData(), isSafeProjectPath(), assertOwnerRequestedForget(), assertOwnerSourcedMemory() (+16 more)

### Community 13 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (17): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+9 more)

### Community 14 - "modules/builder/index.ts"
Cohesion: 0.08
Nodes (35): AgentResult, calculateSpendUseCase, toolRegistry, runAgent(), toolByName, getProject(), readFile(), estTokens() (+27 more)

### Community 15 - "BuilderTurnAdapter.ts"
Cohesion: 0.08
Nodes (58): describeSchema, ScheduleTasksUseCase, rewardOf(), formatStandard(), active, AgentResult, background(), BUILDER_FILES (+50 more)

### Community 16 - "memory/application/service.ts"
Cohesion: 0.09
Nodes (14): createMemoryService(), listMemories(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind (+6 more)

### Community 17 - "ExecutionMetrics"
Cohesion: 0.11
Nodes (10): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, StaticToolRegistryAdapter (+2 more)

### Community 18 - "projectRows.ts"
Cohesion: 0.15
Nodes (10): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError (+2 more)

### Community 19 - "infrastructure/runner.ts"
Cohesion: 0.15
Nodes (31): removeProjectData, removeProjectData(), sessionCookie(), endSession, testSession, EvalError, designSignals, ensureEvalAccount() (+23 more)

### Community 20 - "adminApi.ts"
Cohesion: 0.16
Nodes (18): hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups (+10 more)

### Community 21 - "app-services/projectDb.ts"
Cohesion: 0.15
Nodes (24): app, monolith, runtimePorts, wss, cloneDatabase(), closeAll(), closeProject(), dumpDatabase() (+16 more)

### Community 22 - "modules/identity/index.ts"
Cohesion: 0.08
Nodes (12): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, IdentityModuleDependencies, PlatformMailerService, IdentityAccountsDependencies, IAccountRepository (+4 more)

### Community 23 - "FusionOrchestrator.ts"
Cohesion: 0.22
Nodes (26): createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass(), importProviderModels() (+18 more)

### Community 24 - "app-runtime/infrastructure/browser.ts"
Cohesion: 0.09
Nodes (29): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+21 more)

### Community 25 - "react"
Cohesion: 0.07
Nodes (62): lucide-react@^1.66.0, radix-ui@^1.8.1, lucide-react, radix-ui, react, administrationController, api, modelBlockers() (+54 more)

### Community 26 - "BuilderToolsAdapter.ts"
Cohesion: 0.10
Nodes (13): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, locate(), Problem, ProblemEffects (+5 more)

### Community 27 - "modules/collaboration/index.ts"
Cohesion: 0.14
Nodes (7): PersonalOrganizationUseCase, Organization, OrganizationProps, CollaborationModuleDependencies, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 28 - "modules/projects/index.ts"
Cohesion: 0.09
Nodes (15): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, ProjectPath, ProjectsModuleDependencies, IProjectFileRepository, app, database (+7 more)

### Community 29 - "toolOutputs.test.ts"
Cohesion: 0.14
Nodes (8): dir, monolith, seedLocal, dir, runFixture(), BEFORE, conforms(), dir

### Community 30 - "config.ts"
Cohesion: 0.13
Nodes (12): createDevelopmentSeed(), DEV_FIXTURE, Fixture, storagePorts, config, DEFAULT_MODELS_ALLOW, env, paths (+4 more)

### Community 31 - "ProjectView.tsx"
Cohesion: 0.10
Nodes (52): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+44 more)

### Community 32 - "studioApi.ts"
Cohesion: 0.07
Nodes (42): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, addTimer, cancelTimer (+34 more)

### Community 33 - "bundler.ts"
Cohesion: 0.08
Nodes (50): createProjectCheck(), createServiceControl(), restart(), scale(), snapshot(), packageName(), EndpointInfo, endpointRoutes() (+42 more)

### Community 34 - "bootstrap/server.ts"
Cohesion: 0.04
Nodes (45): @hono/node-server@^2.1.5, @hono/node-server, AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest() (+37 more)

### Community 35 - "projectIndex.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 36 - "createJobs"
Cohesion: 0.16
Nodes (19): createJobs(), addTimer(), enqueueJob(), executeJob(), fireDueTimers(), initializeAppServices(), report(), runJob() (+11 more)

### Community 37 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 38 - "models.ts"
Cohesion: 0.08
Nodes (33): createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), ClassificationPorts (+25 more)

### Community 39 - "skills.test.ts"
Cohesion: 0.13
Nodes (18): BUILDER_SYSTEM_PROMPT, AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO (+10 more)

### Community 40 - "PostgresOrganizationRepository.ts"
Cohesion: 0.12
Nodes (9): OrganizationNamesQuery, OrganizationQueries, InviteView, IOrganizationNameDirectory, IOrganizationQueries, MemberView, Org, OrgMemberView (+1 more)

### Community 41 - "SqlAgentTaskRepository.ts"
Cohesion: 0.20
Nodes (7): ListAgentTasksUseCase, SqlAgentTaskRepository, tasks, AgentTaskQueries, AgentTaskView, TaskCompletion, availableModels()

### Community 42 - "client/index.ts"
Cohesion: 0.20
Nodes (12): AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes, RouteSpec (+4 more)

### Community 43 - "scripts"
Cohesion: 0.10
Nodes (20): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+12 more)

### Community 44 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.14
Nodes (10): PlatformCollaborationMailerService, PostgresCollaborationAccountRepository, CollaborationAccount, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository (+2 more)

### Community 45 - "composition.ts"
Cohesion: 0.14
Nodes (23): createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureSecretIntegrations(), initializeAppServices, bindEvaluationBuilder(), bindEvaluationResources() (+15 more)

### Community 46 - "model-management/index.ts"
Cohesion: 0.11
Nodes (26): Catalog, createModelManagementQueries(), routerAudit(), updateProjectModels(), isMode(), createModelRouter(), pick(), routerStats() (+18 more)

### Community 47 - "mcp/server.ts"
Cohesion: 0.10
Nodes (29): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), readGuides() (+21 more)

### Community 48 - "app-runtime/services.test.ts"
Cohesion: 0.24
Nodes (10): beginTransaction(), dispatch(), getSandboxServices(), restartSandboxService(), sandboxes, WORKER, call(), readServiceRuntime() (+2 more)

### Community 49 - "package.json"
Cohesion: 0.07
Nodes (38): dependencies, @anthropic-ai/sdk@^1.3.0, clsx@^2.1.1, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, hono@^4.13.14, @modelcontextprotocol/sdk@^1.32.2 (+30 more)

### Community 50 - "ProjectsStore"
Cohesion: 0.06
Nodes (7): ResolvedApp, isDevFile(), ProjectsApplication, ProjectSnapshot, createProjectsModule(), ProjectsStore, fixture()

### Community 51 - "Project"
Cohesion: 0.11
Nodes (5): Project, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 52 - "adminServer.ts"
Cohesion: 0.11
Nodes (20): ADMIN_MCP_INSTRUCTIONS, AdminMcpModules, descriptions, fusionCapability, id, modelIds, modelPatch, schemas (+12 more)

### Community 53 - "policies.test.ts"
Cohesion: 0.17
Nodes (13): AiUnavailableError, createAi(), appAiChat(), AiBlock, AiContextMetrics, AiFusionTrace, AiUsage, AppAiInput (+5 more)

### Community 54 - "usage/usage.ts"
Cohesion: 0.15
Nodes (8): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, countAction, mocks

### Community 55 - "ApplicationLifecycle"
Cohesion: 0.17
Nodes (6): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown(), shutdown()

### Community 56 - "server/index.ts"
Cohesion: 0.09
Nodes (14): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, CheckoutInput (+6 more)

### Community 57 - "integrations/github.ts"
Cohesion: 0.09
Nodes (24): GithubError, GithubRepository, Link, SyncResult, accountStatus, connectAccount, createRepo, disconnectAccount (+16 more)

### Community 58 - "createIdentityModule"
Cohesion: 0.11
Nodes (5): AdminApiTokenError, IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 61 - "deps.ts"
Cohesion: 0.08
Nodes (36): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KIT_CATALOG, KitEntry, kitSummary(), BUILTIN_PACKAGES, catalogVersion() (+28 more)

### Community 62 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 63 - "postgres"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 65 - "builderServer.ts"
Cohesion: 0.10
Nodes (28): Conexión, startAppRuntimeEventRelay(), lifecycle, app, lifecycle, monolith, stopRuntimeEventRelay(), lifecycle (+20 more)

### Community 66 - "PostgresProjectsStore"
Cohesion: 0.06
Nodes (4): FileMap, PostgresProjectsStore, ProjectOrganizations, QueryHandle

### Community 67 - "RunTaskLaneUseCase.ts"
Cohesion: 0.11
Nodes (13): RunTaskLaneUseCase, TaskLifecycleUseCase, AgentEvent, AgentExecutionResult, requiresFinishGate(), AgentTask, AgentTaskRepository, LaneTask (+5 more)

### Community 68 - "Workspace.tsx"
Cohesion: 0.08
Nodes (37): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, modelsController (+29 more)

### Community 69 - "domain/messages.ts"
Cohesion: 0.14
Nodes (19): anthropicChat(), Block, LlmMessage, LlmRequest, LlmResponse, LlmTool, CompatEndpoint, anthropicChat() (+11 more)

### Community 70 - "ProjectSandbox"
Cohesion: 0.22
Nodes (4): log(), ProjectSandbox, SandboxRunError, ServicePool

### Community 73 - "IOrganizationRepository"
Cohesion: 0.13
Nodes (8): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, OrgRole, ICollaborationAccountRepository, IOrganizationRepository

### Community 74 - "Account"
Cohesion: 0.10
Nodes (6): Account, AccountProps, Email, COMMON_PASSWORDS, Password, PostgresAccountRepository

### Community 75 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 76 - "projects/application/usecases.ts"
Cohesion: 0.07
Nodes (39): ProjectEvent, ProjectLogLine, projectsController, transport, CreateProjectOptions, createProjectUseCases(), isProjectLogLine(), isProjectProblem() (+31 more)

### Community 77 - "infrastructure/playground.ts"
Cohesion: 0.15
Nodes (20): runBudget(), evaluationBuilder(), admitPlayground(), execute(), InternalRun, PLAYGROUND_ROLES, PlaygroundRole, playgroundRoles() (+12 more)

### Community 78 - "application/security.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 79 - "e2e.mjs"
Cohesion: 0.22
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 80 - "builder/contracts.ts"
Cohesion: 0.17
Nodes (20): page(), summarize(), applySummary(), blockTokens(), callLabel(), estimateTokens(), hasResults(), KEEP_RECENT_RESULTS (+12 more)

### Community 81 - "integrations/index.ts"
Cohesion: 0.23
Nodes (15): api, integrationsController, GithubCard, GithubCommitCard(), GithubSection(), Link, Mark(), CreateDialog() (+7 more)

### Community 83 - "model-management/router.ts"
Cohesion: 0.09
Nodes (28): analyzeHeuristic(), analyzeRequest(), ROLES, useFastPath(), createTurnFeedback(), penalizeTurn(), posteriors, gamma() (+20 more)

### Community 84 - "fusion.test.ts"
Cohesion: 0.12
Nodes (16): validateToolInput(), author, features, gemini, gpt, reply(), req, review() (+8 more)

### Community 85 - "domain/score.ts"
Cohesion: 0.10
Nodes (33): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS, JudgeDimension (+25 more)

### Community 86 - "AuthPorts"
Cohesion: 0.15
Nodes (3): EmailInput, AuthPorts, AuthRepository

### Community 87 - "app-services/analytics.ts"
Cohesion: 0.21
Nodes (9): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays(), analyticsPorts (+1 more)

### Community 88 - "FusionOrchestrator.ts"
Cohesion: 0.11
Nodes (21): AgentSpec, TurnState, KEYWORDS, RoleProfile, Posterior, FusionBudget, FusionTrace, Effort (+13 more)

### Community 89 - "application/serviceControl.ts"
Cohesion: 0.22
Nodes (7): ControlledService, RuntimeService, ServiceControlSnapshot, ServiceQueueEntry, ServiceReplica, ServiceRuntimeSnapshot, ServiceControlPorts

### Community 90 - "createCollaborationModule"
Cohesion: 0.26
Nodes (4): MemberQueries, createCollaborationModule(), IMemberQueries, fixture()

### Community 91 - "cli.ts"
Cohesion: 0.23
Nodes (10): [command, ...flags], main(), monolith, seedDev, seedLocal, createLocalSeed(), readSeedFile(), SeedFile (+2 more)

### Community 92 - "infrastructure/projects.ts"
Cohesion: 0.07
Nodes (29): RuntimeObservationPorts, RuntimeProjectsPort, ServiceExecution, bindRuntimeObservation(), configureRuntimeProjects(), publication, suggestSlug, AppTarget (+21 more)

### Community 93 - "BootstrapService"
Cohesion: 0.18
Nodes (6): BootstrapService, SetupError, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 94 - "modules/projects/index.ts"
Cohesion: 0.13
Nodes (23): CreateProjectInput, BeforeImage, beforeImages(), restoredFiles(), turnFileChange(), ProjectProps, ChangeEntry, normalizeProjectProfile() (+15 more)

### Community 95 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 96 - "agents.mjs"
Cohesion: 0.12
Nodes (15): app, DATA, app, DATA, MODELS, ROOT, SEED, MODELS (+7 more)

### Community 97 - "Memory.tsx"
Cohesion: 0.21
Nodes (11): api, memoryController, Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection() (+3 more)

### Community 98 - "BuilderWorkflow.ts"
Cohesion: 0.07
Nodes (13): BuilderWorkflowUseCase, FastBuildUseCase, ReviewAndFixUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode (+5 more)

### Community 99 - "Plan.ts"
Cohesion: 0.07
Nodes (33): Implementation plan document (`static/__dev/plan.md`), CheckPlanUseCase, Review, reviewFixTasks(), checkContract(), checkPlanDoc(), CONTRACT_FILE, covers() (+25 more)

### Community 100 - "internal/router.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 101 - "IntegrationRepository"
Cohesion: 0.16
Nodes (7): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository

### Community 102 - "infrastructure/repositories.ts"
Cohesion: 0.11
Nodes (11): @electric-sql/pglite, AppDataPorts, createAppDataService(), TransactionSession, SqlExecutionResult, TransactionAction, createProjectRowsRepository(), projectRowsRepository (+3 more)

### Community 103 - "studio.mjs"
Cohesion: 0.24
Nodes (14): ADMIN, assert(), cleanup(), freePort(), get(), main(), resources, ROOT (+6 more)

### Community 104 - "ExecutionAudit.ts"
Cohesion: 0.18
Nodes (15): ExecutionAudit, identifier(), AuditContext, AuditFilter, AuditReport, AuditStage, AuditStep, AuditWindow (+7 more)

### Community 105 - "policies.test.ts"
Cohesion: 0.09
Nodes (11): createEmail(), sendEmail(), sendPlatformEmail(), createSecrets(), projectSecretEnv(), secretEnv(), JOB_LIMITS, SECRET_NAME (+3 more)

### Community 106 - "app-services/storage.ts"
Cohesion: 0.24
Nodes (7): createStorage(), putObject(), MAX_PROJECT_STORAGE_BYTES, StorageLimitError, StoredObject, MAX_FILE_BYTES, safeStorageKey()

### Community 107 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 108 - "OrganizationSkillsService.ts"
Cohesion: 0.19
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 109 - "PostgresApiTokenRepository"
Cohesion: 0.14
Nodes (5): PostgresApiTokenRepository, AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository

### Community 110 - "Review Focus"
Cohesion: 0.18
Nodes (10): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 3: Proveedores y modelos en BD + seeders, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final (+2 more)

### Community 111 - "identity/postgresAdapters.test.ts"
Cohesion: 0.16
Nodes (3): PostgresPasswordResetRepository, PasswordResetRepository, state

### Community 112 - "ports.ts"
Cohesion: 0.11
Nodes (16): createBuildVerification(), BuildPorts, PublicationPorts, ProjectCompilerPort, createPublication(), assertPublishable(), Author, BuildProblem (+8 more)

### Community 113 - "createGithubSyncService"
Cohesion: 0.23
Nodes (12): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+4 more)

### Community 114 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 115 - "domain/securityScan.ts"
Cohesion: 0.21
Nodes (15): FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer(), lineOf() (+7 more)

### Community 117 - "RouterAdministration.ts"
Cohesion: 0.22
Nodes (11): createRouterAdministration(), FusionEffort, FusionPattern, FusionPhase, FusionStep, RouterPosteriorRow, RouterStats, postgresRouterAdministrationRepository (+3 more)

### Community 118 - "platform.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 119 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 120 - "AdmissionState"
Cohesion: 0.25
Nodes (4): AdmissionState, planRun(), startEvaluation(), fixture()

### Community 122 - "settings/index.ts"
Cohesion: 0.12
Nodes (12): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, createSettingsModule(), MOVED_ENV (+4 more)

### Community 123 - "App.tsx"
Cohesion: 0.06
Nodes (41): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallEvent, Pwa() (+33 more)

### Community 124 - "client.ts"
Cohesion: 0.27
Nodes (9): createClient(), ChatMessage, createAi(), createApiWorkflow(), createAuth(), createRealtime(), createStorage(), StoredFile (+1 more)

### Community 125 - "PostgresCatalogRepository.ts"
Cohesion: 0.23
Nodes (11): audit(), persistCapabilityProfile(), validateCapabilityProfile(), validateReasoningEffort(), columns, postgresCatalogRepository, profileValues(), Row (+3 more)

### Community 126 - "ref_node_path"
Cohesion: 0.09
Nodes (13): playwright-core, vite, studioPwa(), here, root, server, types, worker (+5 more)

### Community 127 - "postgres"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 128 - "healthcheck"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 129 - "AppEnv"
Cohesion: 0.09
Nodes (9): CheckoutInput, EmailResult, StoredObject, ContextPorts, EmailPorts, AppServiceEvent, ObserverPorts, QueryRepository (+1 more)

### Community 130 - "app-runtime"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 131 - "collaboration/ports/repositories.ts"
Cohesion: 0.15
Nodes (7): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, RemoveMemberUseCase, Access, MemberAccess, IMemberRepository

### Community 132 - "build"
Cohesion: 0.46
Nodes (8): build, BROWSER, args, context, dockerfile, build, build, build

### Community 133 - "Changes.tsx"
Cohesion: 0.20
Nodes (13): DiffLine, diffLines(), hunks(), baseName(), cache, diffStats(), FileChange, FileDiff() (+5 more)

### Community 134 - "PlatformSettingsService"
Cohesion: 0.17
Nodes (5): PlatformSettingsService, PostgresPlatformSettingsStoreAdapter, SettingsDependencies, fixture(), fixture()

### Community 135 - "http.test.ts"
Cohesion: 0.20
Nodes (9): account, app, collaboration, identity, mocks, models, projects, settings (+1 more)

### Community 136 - "builder"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 137 - "GithubAccountRepository"
Cohesion: 0.18
Nodes (4): createGithubAccountService(), connectAccount(), GithubAccountRepository, setup()

### Community 138 - "admission.ts"
Cohesion: 0.08
Nodes (19): ActiveRun, admission, AdmissionPorts, JudgeModel, MAX_JOBS, MAX_REPEATS, RunConfiguration, RunRequest (+11 more)

### Community 139 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 140 - "forja"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 141 - "FinishGateAdapter.ts"
Cohesion: 0.11
Nodes (15): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+7 more)

### Community 142 - "InviteMemberUseCase.ts"
Cohesion: 0.17
Nodes (6): InviteMemberResult, InviteMemberUseCase, ProjectTarget, ProjectInvite, ProjectInviteProps, ICollaborationMailerService

### Community 143 - "createAdminMcpHandler"
Cohesion: 0.24
Nodes (12): createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists(), auditWindow(), admin (+4 more)

### Community 144 - "policies.test.ts"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 145 - "application/context.ts"
Cohesion: 0.09
Nodes (11): Run, AppUser, createContext(), serviceContext(), EndpointContext, enqueue(), HttpError, JobContext (+3 more)

### Community 146 - "1. Capa de datos"
Cohesion: 0.40
Nodes (5): 1. Capa de datos, `.env` resultante, Infraestructura, Migraciones, Seeders

### Community 147 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 148 - "vitest"
Cohesion: 0.10
Nodes (24): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, vitest, migrate(), createTestCoreModules(), drop(), freshDatabase() (+16 more)

### Community 150 - "createHttp"
Cohesion: 0.25
Nodes (4): { apiUrl }, ApiError, createHttp(), HttpTransport

### Community 151 - "app-services/realtime.ts"
Cohesion: 0.21
Nodes (5): DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket, publish, realtimeStats

### Community 152 - "createJobQueue"
Cohesion: 0.48
Nodes (6): createJobQueue(), poll(), processJob(), pump(), start(), stop()

### Community 153 - "job-worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 154 - "crypto.ts"
Cohesion: 0.13
Nodes (17): createCoreModules(), BcryptArgonPasswordHasher, NodeBootstrapCrypto, PostgresSessionRepository, burnPasswordCheck(), hashPassword(), LEGACY, newId() (+9 more)

### Community 155 - "starterTemplate.test.ts"
Cohesion: 0.33
Nodes (3): CreateProjectUseCase, creation(), load()

### Community 156 - "execution.test.ts"
Cohesion: 0.33
Nodes (4): RunAgentUseCase, fixture(), model, usage

### Community 157 - "createAuth"
Cohesion: 0.13
Nodes (21): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+13 more)

### Community 159 - "app-services/context.ts"
Cohesion: 0.10
Nodes (15): bindJobs, listEmails, receiveEmail, sendEmail, sendPlatformEmail, emailPorts, resetTransport(), jobPorts (+7 more)

### Community 163 - "spring.ts"
Cohesion: 0.22
Nodes (5): clip(), normalize(), parseSpringOutput(), SpringBuildTool, SpringProject

### Community 166 - "judgeRouting.test.ts"
Cohesion: 0.33
Nodes (5): billing, { callModel }, input, model, scope

### Community 169 - "motion.tsx"
Cohesion: 0.50
Nodes (3): motion@^14.9.0, motion, FadeIn()

### Community 170 - "AppEnv"
Cohesion: 0.21
Nodes (4): ClaimedJob, AppEnv, JobsApi, JobPorts

### Community 172 - "One project: orders API and durable invoice worker"
Cohesion: 0.25
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 176 - "ServiceControlPanel.tsx"
Cohesion: 0.18
Nodes (13): serviceControlController, transport, Actions, failed(), Filter, KIND_LABEL, observed(), ServiceCard() (+5 more)

### Community 177 - "Panel de administración del sistema — diseño"
Cohesion: 0.04
Nodes (43): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+35 more)

### Community 178 - "architecture.test.ts"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 179 - "q"
Cohesion: 0.09
Nodes (8): PostgresMemberRepository, PostgresOrganizationRepository, PostgresOrganizationSkillsRepository, PostgresLoginCodeRepository, modelHealth(), recordModelHealth(), recordClassificationUsage(), q()

### Community 180 - "Audit.tsx"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 279 - "settings/index.ts"
Cohesion: 0.14
Nodes (21): Task 2: Registro y almacén de ajustes, PlatformSettingType, SettingDef, SettingGroup, SettingsError, SettingView, createPlatformSettings(), byKey (+13 more)

## Knowledge Gaps
- **17 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1324 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `model-management/catalog.ts`, `ProjectsApplication.ts`, `Chat.tsx`, `builderService.ts`, `ProviderService.ts`, `http-client.ts`, `AgentExecution.ts`, `one`, `BuilderToolsAdapter.ts`, `evaluations/bindings.test.ts`, `modules/builder/index.ts`, `memory/application/service.ts`, `ExecutionMetrics`, `adminApi.ts`, `modules/identity/index.ts`, `react`, `BuilderToolsAdapter.ts`, `modules/projects/index.ts`, `toolOutputs.test.ts`, `config.ts`, `bundler.ts`, `bootstrap/server.ts`, `projectIndex.ts`, `models.ts`, `skills.test.ts`, `SqlAgentTaskRepository.ts`, `collaboration/postgresAdapters.test.ts`, `composition.ts`, `model-management/index.ts`, `mcp/server.ts`, `app-runtime/services.test.ts`, `package.json`, `ProjectsStore`, `adminServer.ts`, `policies.test.ts`, `usage/usage.ts`, `ApplicationLifecycle`, `integrations/github.ts`, `createIdentityModule`, `builderServer.ts`, `RunTaskLaneUseCase.ts`, `domain/messages.ts`, `deps.test.ts`, `IOrganizationRepository`, `Account`, `projects/application/usecases.ts`, `application/security.ts`, `builder/contracts.ts`, `model-management/router.ts`, `fusion.test.ts`, `domain/score.ts`, `createCollaborationModule`, `infrastructure/projects.ts`, `BootstrapService`, `BuilderWorkflow.ts`, `Plan.ts`, `IntegrationRepository`, `infrastructure/repositories.ts`, `ExecutionAudit.ts`, `policies.test.ts`, `apiTypes.test.ts`, `OrganizationSkillsService.ts`, `identity/postgresAdapters.test.ts`, `ports.ts`, `createGithubSyncService`, `devDependencies`, `RouterAdministration.ts`, `settings/index.ts`, `ref_node_path`, `collaboration/ports/repositories.ts`, `Changes.tsx`, `PlatformSettingsService`, `http.test.ts`, `GithubAccountRepository`, `admission.ts`, `mcp/jobs.ts`, `FinishGateAdapter.ts`, `InviteMemberUseCase.ts`, `createAdminMcpHandler`, `application/context.ts`, `createHttp`, `starterTemplate.test.ts`, `execution.test.ts`, `app-services/context.ts`, `judgeRouting.test.ts`, `BuilderRunRegistry`, `ServiceControlPanel.tsx`, `Panel de administración del sistema — diseño`, `architecture.test.ts`, `Audit.tsx`?**
  _High betweenness centrality (0.294) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `model-management/catalog.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09898242368177614 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `index.tsx`, `Memory.tsx`, `Chat.tsx`, `internal/router.ts`, `Workspace.tsx`, `Changes.tsx`, `http-client.ts`, `motion.tsx`, `client/index.ts`, `projects/application/usecases.ts`, `ServiceControlPanel.tsx`, `package.json`, `integrations/index.ts`, `forms.tsx`, `Audit.tsx`, `App.tsx`, `ProjectView.tsx`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.04968383017163505 - nodes in this community are weakly interconnected._