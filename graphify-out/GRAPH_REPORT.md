# Graph Report - anemone  (2026-11-04)

## Corpus Check
- 611 files · ~262,954 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: (none) 6, .css 3, .example 1)

## Summary
- 4151 nodes · 10635 edges · 189 communities (158 shown, 31 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 578 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7af262f4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- q
- index.tsx
- infrastructure/runner.ts
- Chat.tsx
- roles.ts
- ModelRouter.ts
- appServer.ts
- http-client.ts
- crypto.ts
- bootstrap/server.ts
- with
- domain/contracts.ts
- composition.ts
- evaluations/bindings.test.ts
- project-observability/security.ts
- BuilderTurnAdapter.ts
- memory/application/service.ts
- ExecutionMetrics
- modules/identity/index.ts
- infrastructure/playground.ts
- model-management/index.ts
- bundler.ts
- executeRun
- appRuntimeServer.ts
- ApplicationLifecycle
- administration/presentation/Models.tsx
- project-observability/problems.ts
- modules/collaboration/index.ts
- modules/projects/index.ts
- Panel de administración del sistema — diseño
- agents.mjs
- ProjectView.tsx
- studioApi.ts
- SettingDefinition
- Plan.ts
- createProjectRows
- OrchestrationPolicy.ts
- compilerOptions
- models.ts
- projects/application/usecases.ts
- collaboration/ports/repositories.ts
- model-management/router.ts
- client/index.ts
- scripts
- pg.mjs
- config.ts
- Plan
- mcp/server.ts
- internal/router.ts
- package.json
- ProjectsStore
- Project
- Inventario de funciones de Lovable → Forja
- skills.test.ts
- createAppDataService
- projectIndex.ts
- server/index.ts
- AgentExecution.ts
- createIdentityModule
- CLAUDE.md
- PostgresProjectFileRepository
- deps.ts
- sandboxWorker.mjs
- postgres
- infrastructure/probe.ts
- PostgresProjectsStore
- createJobs
- domain/securityScan.ts
- adminApi.ts
- client.ts
- Workspace.tsx
- integrations/github.ts
- IOrganizationRepository
- SqlAgentTaskRepository.ts
- services
- createGithubSyncService
- guides.ts
- app-runtime/index.ts
- database/index.ts
- sandbox.ts
- ProjectDb
- TEST_DATABASE_URL
- ModelRouter.ts
- integrations/index.ts
- domain/score.ts
- Changes.tsx
- BuilderWorkflow.ts
- modules/builder/index.ts
- RunAgentUseCase.ts
- mcp/jobs.ts
- GithubAuthorization
- builderService.ts
- BootstrapService
- policies.test.ts
- app-runtime/index.ts
- ProjectsApplication.ts
- q
- Review Focus
- app-services/payments.ts
- AuthPorts
- react
- usage/usage.ts
- Account
- ProjectDbClient
- JobRuntimePorts
- AgentExecutionResult
- urls.ts
- OrganizationSkillsService.ts
- Author
- model-management/providers.ts
- BuilderWorkflowPorts
- ports.ts
- agents.dbg.mjs
- FastBuildPorts
- devDependencies
- github.mjs
- RouterAdministration.ts
- platform.ts
- RealtimeTransport
- database/index.ts
- { api, auth, storage, ai }
- ISettingsStore
- SqlAgentTaskRepository.ts
- FileMap
- http.test.ts
- app-services/analytics.ts
- postgres
- healthcheck
- Plan.tsx
- app-runtime
- model-management/providers.ts
- build
- createSecrets
- PlatformSettingsService
- apiTypes.test.ts
- builder
- appRuntimeServer.ts
- executeRun
- BuilderToolsAdapter.ts
- forja
- FinishGateAdapter.ts
- Security.tsx
- ports/context.ts
- GithubAccountRepository
- AgentExecutionPorts
- BuilderRunRegistry
- JobCron
- createProjectRows
- createHttp
- IMemberRepository
- spring.ts
- ContextPorts
- accounts.ts
- forms.tsx
- replaceVisibleText
- IPasswordHasher
- createAuth
- app-services/realtime.ts
- IdentityAccountsService.ts
- exports.test.tsx
- PostgresPlatformSettingsStoreAdapter
- GithubProjectPorts
- createCollaborationModule
- accountLifecycle.ts
- GithubRepository
- audit.ts
- createProblemService
- ProjectPath
- cli.ts
- safeFetch.ts
- createRealtime
- architecture.test.ts
- settings/index.ts
- GithubGateway
- application/context.ts
- { getSecurity, saveScan, startDeepScan, setIgnored }
- { BuildError, buildClient, buildExamples, checkProject, compileServerModule, endpointRoutes, pageRoutes, exampleFiles, jobFiles, readJobSettings, formatProblem }
- { BUILTIN_PACKAGES, MANIFEST, readDeps, writeDeps, isValidPackageName, packageName, isNodeBuiltin, depsDir, ensureDeps, resolvePackage, withManifestLock }
- { KIT_BUILTIN, KIT_CATALOG, kitSummary }
- { publishProject, unpublishProject }
- { quickScan, findSecret, formatFinding }
- { runBrowserTest, inspectPreview, allowedRequest, closeBrowser }
- { SandboxRunError, runInSandbox, stopSandbox, stopAllSandboxes }
- { serveApp, parseCookies, cookie }
- { SHARE_COOKIE, RESERVED_SLUG, shareToken, checkShareToken, previewOrigin, previewUrl, appUrl, parseAppHost }
- { typecheckProject, parseDiagnostics, verifyBuild }
- { syncProject, holdSync, releaseSync, watchLinked, startGithubSync, stopGithubSync, reschedulePoll }

## God Nodes (most connected - your core abstractions)
1. `vitest` - 129 edges
2. `q()` - 100 edges
3. `createStudioApi()` - 69 edges
4. `react` - 44 edges
5. `createIdentityModule()` - 42 edges
6. `ProjectsStore` - 40 edges
7. `one()` - 40 edges
8. `createProjectsModule()` - 39 edges
9. `PostgresProjectsStore` - 35 edges
10. `ProjectView()` - 35 edges

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

## Communities (189 total, 31 thin omitted)

### Community 0 - "q"
Cohesion: 0.07
Nodes (11): OrganizationNamesQuery, OrganizationQueries, PostgresMemberRepository, PostgresOrganizationRepository, InviteView, IOrganizationNameDirectory, IOrganizationQueries, MemberView (+3 more)

### Community 1 - "index.tsx"
Cohesion: 0.17
Nodes (16): sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card(), EmptyState() (+8 more)

### Community 2 - "infrastructure/runner.ts"
Cohesion: 0.15
Nodes (25): sessionCookie(), endSession, testSession, EvalError, RunRequest, recoverRuns(), EVAL_EMAIL, spentLast24h() (+17 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.05
Nodes (66): ChatStreamEvent, api, builderController, streamGet, streamPost, AgentLanes(), Lane, LaneCard() (+58 more)

### Community 4 - "roles.ts"
Cohesion: 0.08
Nodes (23): BUILDER_SYSTEM_PROMPT, AgentToolRole, allowedToolsForRole(), assertRoleToolAccess(), BACKEND, CHECKLIST, CONTRACT, DATA (+15 more)

### Community 5 - "ModelRouter.ts"
Cohesion: 0.07
Nodes (46): AgentSpec, TurnState, anthropicChat(), KEYWORDS, LAMBDA, RoleProfile, Posterior, Block (+38 more)

### Community 6 - "appServer.ts"
Cohesion: 0.10
Nodes (37): RuntimeEvent, formatProblem(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle() (+29 more)

### Community 7 - "http-client.ts"
Cohesion: 0.08
Nodes (23): api, evaluationsController, createEvaluationUseCases(), Agg, EvalCfg, Evals(), money(), RunDetail (+15 more)

### Community 8 - "crypto.ts"
Cohesion: 0.08
Nodes (26): createCoreModules(), authRepository(), createQueryRepository(), platformRepository, statement(), statements, DatabasePorts, BcryptArgonPasswordHasher (+18 more)

### Community 9 - "bootstrap/server.ts"
Cohesion: 0.06
Nodes (39): @hono/node-server@^2.1.5, @hono/node-server, startAppRuntimeEventRelay(), lifecycle, app, lifecycle, monolith, stopRuntimeEventRelay() (+31 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "domain/contracts.ts"
Cohesion: 0.17
Nodes (11): AiUnavailableError, createAi(), appAiChat(), AiBlock, AppAiInput, AppAiResult, AppUser, aiPorts (+3 more)

### Community 12 - "composition.ts"
Cohesion: 0.14
Nodes (23): createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureAppServiceObserver(), configureSecretIntegrations(), secretPorts, initializeAppServices (+15 more)

### Community 13 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (17): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+9 more)

### Community 14 - "project-observability/security.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 15 - "BuilderTurnAdapter.ts"
Cohesion: 0.09
Nodes (48): describeSchema, ScheduleTasksUseCase, rewardOf(), criteriaOf(), planOverview(), active, AgentResult, background() (+40 more)

### Community 16 - "memory/application/service.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 17 - "ExecutionMetrics"
Cohesion: 0.10
Nodes (11): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, ROLE_TOOLS (+3 more)

### Community 18 - "modules/identity/index.ts"
Cohesion: 0.11
Nodes (12): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, PlatformRole, PlatformMailerService, AccountRow, SessionAccountRow (+4 more)

### Community 19 - "infrastructure/playground.ts"
Cohesion: 0.13
Nodes (30): removeProjectData, removeProjectData(), designSignals, ensureEvalAccount(), sweepEvalProjects(), evaluationBuilder(), evaluationResources(), admitPlayground() (+22 more)

### Community 20 - "model-management/index.ts"
Cohesion: 0.15
Nodes (17): Catalog, bindModelAudit(), bindCatalogService(), bindCatalogSync(), createPlatformCatalogService(), ModelSpendView, ProjectModelPatch, ProjectModelSettings (+9 more)

### Community 21 - "bundler.ts"
Cohesion: 0.15
Nodes (26): createProjectCheck(), packageName(), EndpointInfo, endpointRoutes(), exampleFiles(), jobFiles(), JobInfo, PageInfo (+18 more)

### Community 22 - "executeRun"
Cohesion: 0.08
Nodes (17): admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun(), runBudget() (+9 more)

### Community 23 - "appRuntimeServer.ts"
Cohesion: 0.12
Nodes (15): hono, AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts (+7 more)

### Community 24 - "ApplicationLifecycle"
Cohesion: 0.18
Nodes (5): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown()

### Community 25 - "administration/presentation/Models.tsx"
Cohesion: 0.08
Nodes (45): administrationController, api, Admin(), TABS, AgentEvent, Agents(), ROLE_LABEL, RoleInfo (+37 more)

### Community 26 - "project-observability/problems.ts"
Cohesion: 0.09
Nodes (17): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, locate(), Problem, ProblemEffects (+9 more)

### Community 27 - "modules/collaboration/index.ts"
Cohesion: 0.15
Nodes (6): PersonalOrganizationUseCase, Organization, CollaborationModuleDependencies, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 28 - "modules/projects/index.ts"
Cohesion: 0.11
Nodes (15): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, Author, CheckpointProps, IProjectFileRepository, app, database (+7 more)

### Community 29 - "Panel de administración del sistema — diseño"
Cohesion: 0.05
Nodes (41): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+33 more)

### Community 30 - "agents.mjs"
Cohesion: 0.11
Nodes (25): app, DATA, MODELS, req(), ROOT, SEED, call(), log (+17 more)

### Community 31 - "ProjectView.tsx"
Cohesion: 0.11
Nodes (51): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+43 more)

### Community 32 - "studioApi.ts"
Cohesion: 0.06
Nodes (49): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, listEmails, receiveEmail (+41 more)

### Community 33 - "SettingDefinition"
Cohesion: 0.18
Nodes (3): SettingDefinition, SettingValue, PlatformSettingsRegistryAdapter

### Community 34 - "Plan.ts"
Cohesion: 0.14
Nodes (16): CheckPlanUseCase, checkContract(), CONTRACT_FILE, covers(), MAX_CONTRACT, MAX_GOAL, MAX_TASKS, order() (+8 more)

### Community 35 - "createProjectRows"
Cohesion: 0.20
Nodes (3): createProjectData(), ProjectRowsPort, ProjectSchemaPort

### Community 36 - "OrchestrationPolicy.ts"
Cohesion: 0.26
Nodes (9): ReviewAndFixUseCase, Review, reviewFixTasks(), PlanTask, SpecialistRole, FixResult, ReviewAndFixPorts, TeamReviewOutcome (+1 more)

### Community 37 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 38 - "models.ts"
Cohesion: 0.11
Nodes (14): createCatalogService(), deleteModel(), saveModel(), updateProjectModels(), creditsAtRate(), globToRegex(), matchesModelPolicy(), ModelChanges (+6 more)

### Community 39 - "projects/application/usecases.ts"
Cohesion: 0.07
Nodes (35): ProjectEvent, ProjectLogLine, projectsController, transport, createProjectUseCases(), isProjectLogLine(), isProjectProblem(), isRecord() (+27 more)

### Community 40 - "collaboration/ports/repositories.ts"
Cohesion: 0.09
Nodes (17): InviteMemberResult, InviteMemberUseCase, ProjectTarget, ProjectInvite, ProjectInviteProps, PlatformCollaborationMailerService, PostgresCollaborationAccountRepository, CollaborationAccount (+9 more)

### Community 41 - "model-management/router.ts"
Cohesion: 0.15
Nodes (17): ROLES, createTurnFeedback(), penalizeTurn(), posteriors, feedbackModel(), TurnModelDecision, postgresTurnFeedback, routingPorts (+9 more)

### Community 42 - "client/index.ts"
Cohesion: 0.20
Nodes (12): AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes, RouteSpec (+4 more)

### Community 43 - "scripts"
Cohesion: 0.11
Nodes (18): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+10 more)

### Community 44 - "pg.mjs"
Cohesion: 0.10
Nodes (15): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, drop(), freshDatabase(), TEST_DATABASE_URL, dir, monolith (+7 more)

### Community 45 - "config.ts"
Cohesion: 0.18
Nodes (12): appHeaders(), clientIp(), createRateLimiter(), isHttps(), RateLimitError, RateLimitQuery, RateLimitStoreError, requestOrigin() (+4 more)

### Community 46 - "Plan"
Cohesion: 0.26
Nodes (3): TeamBuildUseCase, Plan, TeamBuildPorts

### Community 47 - "mcp/server.ts"
Cohesion: 0.14
Nodes (16): buildServer(), CONTEXT_TOOLS, createMcpHandler(), DESTRUCTIVE, expectedVersionProp, extraTools, Hints, hintsOf() (+8 more)

### Community 48 - "internal/router.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 49 - "package.json"
Cohesion: 0.07
Nodes (40): dependencies, @anthropic-ai/sdk@^1.3.0, clsx@^2.1.1, croner@^11.0.0, esbuild@^0.28.2, hono@^4.13.14, lucide-react@^1.66.0, @modelcontextprotocol/sdk@^1.32.2 (+32 more)

### Community 50 - "ProjectsStore"
Cohesion: 0.07
Nodes (6): isDevFile(), ProjectsApplication, TurnChanges, createProjectsModule(), ProjectsStore, fixture()

### Community 51 - "Project"
Cohesion: 0.10
Nodes (7): CreateProjectInput, Project, ProjectProps, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 52 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 53 - "skills.test.ts"
Cohesion: 0.08
Nodes (18): page(), AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO (+10 more)

### Community 54 - "createAppDataService"
Cohesion: 0.21
Nodes (5): AppDataPorts, createAppDataService(), SqlExecutionResult, TransactionAction, isInternalServiceRequest()

### Community 55 - "projectIndex.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 56 - "server/index.ts"
Cohesion: 0.09
Nodes (14): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, CheckoutInput (+6 more)

### Community 57 - "AgentExecution.ts"
Cohesion: 0.17
Nodes (11): AgentEvent, Block, ExecutionModel, ExecutionTool, Message, ToolDefinition, Usage, IMAGE_TYPES (+3 more)

### Community 58 - "createIdentityModule"
Cohesion: 0.15
Nodes (4): IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 61 - "deps.ts"
Cohesion: 0.09
Nodes (32): KIT_BUILTIN, KIT_CATALOG, KitEntry, kitSummary(), BUILTIN_PACKAGES, catalogVersion(), Deps, isValidPackageName() (+24 more)

### Community 62 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 63 - "postgres"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 65 - "infrastructure/probe.ts"
Cohesion: 0.25
Nodes (15): 6. API de administración, providerOf(), call(), ECHO_TOOL, errorOf(), listProviderModels(), ModelProbe, perMillion() (+7 more)

### Community 66 - "PostgresProjectsStore"
Cohesion: 0.07
Nodes (3): FileMap, PostgresProjectsStore, ProjectOrganizations

### Community 67 - "createJobs"
Cohesion: 0.25
Nodes (14): createJobs(), addTimer(), executeJob(), fireDueTimers(), initializeAppServices(), listJobs(), report(), runJob() (+6 more)

### Community 68 - "domain/securityScan.ts"
Cohesion: 0.21
Nodes (15): FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer(), lineOf() (+7 more)

### Community 69 - "adminApi.ts"
Cohesion: 0.22
Nodes (13): AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups, createAdministrationApi() (+5 more)

### Community 70 - "client.ts"
Cohesion: 0.27
Nodes (9): createClient(), ChatMessage, createAi(), createApiWorkflow(), createAuth(), createRealtime(), createStorage(), StoredFile (+1 more)

### Community 71 - "Workspace.tsx"
Cohesion: 0.07
Nodes (35): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, memoryController (+27 more)

### Community 72 - "integrations/github.ts"
Cohesion: 0.07
Nodes (24): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, accountStatus, connectAccount (+16 more)

### Community 73 - "IOrganizationRepository"
Cohesion: 0.12
Nodes (8): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, OrganizationProps, ORG_ROLES, OrgPolicy, OrgRole, IOrganizationRepository

### Community 74 - "SqlAgentTaskRepository.ts"
Cohesion: 0.20
Nodes (5): ListAgentTasksUseCase, SqlAgentTaskRepository, AgentTaskQueries, AgentTaskView, mocks

### Community 75 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 76 - "createGithubSyncService"
Cohesion: 0.30
Nodes (11): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+3 more)

### Community 77 - "guides.ts"
Cohesion: 0.22
Nodes (12): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), readGuides() (+4 more)

### Community 78 - "app-runtime/index.ts"
Cohesion: 0.10
Nodes (20): RuntimeProjectsPort, bindRuntimeObservation(), configureRuntimeProjects(), publication, stopAppRuntime(), suggestSlug, loadFiles(), bindRuntimeObservation() (+12 more)

### Community 79 - "database/index.ts"
Cohesion: 0.08
Nodes (8): PostgresAccountLifecycleRepository, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountLifecycleRepository, AccountSecurity, one(), Tx

### Community 80 - "sandbox.ts"
Cohesion: 0.18
Nodes (9): beginTransaction(), dispatch(), ProjectSandbox, runInSandbox(), SandboxError, sandboxes, SandboxRunError, WORKER (+1 more)

### Community 81 - "ProjectDb"
Cohesion: 0.15
Nodes (7): @electric-sql/pglite@^0.5.13, @electric-sql/pglite, TransactionSession, createProjectRowsRepository(), projectRowsRepository, createAuthRepository(), ProjectDb

### Community 83 - "ModelRouter.ts"
Cohesion: 0.12
Nodes (23): createModelManagementQueries(), routerAudit(), analyzeHeuristic(), createModelRouter(), analyzeRequest(), callModel(), pick(), taskClassOf() (+15 more)

### Community 84 - "integrations/index.ts"
Cohesion: 0.23
Nodes (15): api, integrationsController, GithubCard, GithubCommitCard(), GithubSection(), Link, Mark(), CreateDialog() (+7 more)

### Community 85 - "domain/score.ts"
Cohesion: 0.10
Nodes (32): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS, JudgeDimension (+24 more)

### Community 86 - "Changes.tsx"
Cohesion: 0.20
Nodes (15): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+7 more)

### Community 87 - "BuilderWorkflow.ts"
Cohesion: 0.25
Nodes (8): BuilderWorkflowUseCase, FastBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode, useFastPath(), workflowFixture()

### Community 88 - "modules/builder/index.ts"
Cohesion: 0.10
Nodes (26): AgentResult, calculateSpendUseCase, toolRegistry, runAgent(), toolByName, bindBuilderCoreModules(), estTokens(), GATE_THRESHOLD (+18 more)

### Community 89 - "RunAgentUseCase.ts"
Cohesion: 0.17
Nodes (21): GATE_FIXES, summarize(), addUsage(), AgentExecutionSpec, emptyUsage(), ExecutionContext, applySummary(), blockTokens() (+13 more)

### Community 90 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 92 - "builderService.ts"
Cohesion: 0.10
Nodes (13): accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService(), BuilderServiceClient (+5 more)

### Community 93 - "BootstrapService"
Cohesion: 0.19
Nodes (6): BootstrapService, SetupError, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 94 - "policies.test.ts"
Cohesion: 0.13
Nodes (13): createEmail(), sendEmail(), sendPlatformEmail(), createStorage(), putObject(), MAX_PROJECT_STORAGE_BYTES, StorageLimitError, StoredObject (+5 more)

### Community 95 - "app-runtime/index.ts"
Cohesion: 0.15
Nodes (18): playwright-core@1.64.1, playwright-core, allowedRequest(), BrowserStep, BrowserTestInput, BrowserTestResult, describe(), getBrowser() (+10 more)

### Community 96 - "ProjectsApplication.ts"
Cohesion: 0.13
Nodes (18): ResolvedApp, AppTarget, BeforeImage, beforeImages(), restoredFiles(), turnFileChange(), ChangeEntry, normalizeProjectProfile() (+10 more)

### Community 97 - "q"
Cohesion: 0.14
Nodes (4): PostgresOrganizationSkillsRepository, PostgresLoginCodeRepository, PostgresPasswordResetRepository, q()

### Community 98 - "Review Focus"
Cohesion: 0.15
Nodes (11): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 3: Proveedores y modelos en BD + seeders, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final (+3 more)

### Community 99 - "app-services/payments.ts"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 100 - "AuthPorts"
Cohesion: 0.15
Nodes (3): EmailInput, AuthPorts, AuthRepository

### Community 101 - "react"
Cohesion: 0.08
Nodes (38): react, Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallEvent (+30 more)

### Community 102 - "usage/usage.ts"
Cohesion: 0.16
Nodes (7): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, mocks

### Community 103 - "Account"
Cohesion: 0.14
Nodes (4): Account, AccountProps, Email, PostgresAccountRepository

### Community 106 - "AgentExecutionResult"
Cohesion: 0.20
Nodes (6): RunTaskLaneUseCase, AgentExecutionResult, TaskLanePorts, fixture(), result, task

### Community 107 - "urls.ts"
Cohesion: 0.17
Nodes (13): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+5 more)

### Community 108 - "OrganizationSkillsService.ts"
Cohesion: 0.19
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 109 - "Author"
Cohesion: 0.24
Nodes (3): CreateCheckpointUseCase, CreateProjectUseCase, Checkpoint

### Community 110 - "model-management/providers.ts"
Cohesion: 0.14
Nodes (16): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), OPENROUTER_URL (+8 more)

### Community 112 - "ports.ts"
Cohesion: 0.09
Nodes (21): createBuildVerification(), createDependencyResolution(), PackageRegistryPort, BuildPorts, PublicationPorts, RuntimeObservationPorts, ProjectCompilerPort, createPublication() (+13 more)

### Community 113 - "agents.dbg.mjs"
Cohesion: 0.09
Nodes (15): vite, studioPwa(), here, app, DATA, MODELS, req(), ROOT (+7 more)

### Community 115 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 116 - "github.mjs"
Cohesion: 0.10
Nodes (12): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED (+4 more)

### Community 117 - "RouterAdministration.ts"
Cohesion: 0.31
Nodes (7): createRouterAdministration(), RouterPosteriorRow, RouterStats, postgresRouterAdministrationRepository, RouterAdministrationRepository, resetRouter(), routerStats()

### Community 118 - "platform.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 120 - "database/index.ts"
Cohesion: 0.09
Nodes (22): vitest, DEV_FIXTURE, Fixture, DEFAULT_MODELS_ALLOW, env, paths, resolvePublicUrl(), ROOT_DIR (+14 more)

### Community 122 - "ISettingsStore"
Cohesion: 0.19
Nodes (8): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, SettingDefinitionProps, SettingType, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry, ISettingsStore

### Community 123 - "SqlAgentTaskRepository.ts"
Cohesion: 0.22
Nodes (5): TaskLifecycleUseCase, requiresFinishGate(), AgentTask, AgentTaskRepository, TaskCompletion

### Community 124 - "FileMap"
Cohesion: 0.17
Nodes (3): CoreModulesDependencies, ProjectsModuleDependencies, ProjectServices

### Community 125 - "http.test.ts"
Cohesion: 0.11
Nodes (18): builderCoreModules, CollaborationModule, IdentityModule, ProjectsModule, account, app, collaboration, identity (+10 more)

### Community 126 - "app-services/analytics.ts"
Cohesion: 0.20
Nodes (9): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays(), analyticsPorts (+1 more)

### Community 127 - "postgres"
Cohesion: 0.25
Nodes (9): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+1 more)

### Community 128 - "healthcheck"
Cohesion: 0.53
Nodes (9): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+1 more)

### Community 129 - "Plan.tsx"
Cohesion: 0.38
Nodes (6): api, billingController, Meter(), Plan(), Usage, bytes()

### Community 130 - "app-runtime"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 131 - "model-management/providers.ts"
Cohesion: 0.09
Nodes (34): `llm/catalog.ts`, createLocalSeed(), readSeedFile(), SeedFile, tasks, allowedModels(), availableModels(), deleteModel() (+26 more)

### Community 132 - "build"
Cohesion: 0.48
Nodes (7): build, BROWSER, args, context, dockerfile, build, build

### Community 133 - "createSecrets"
Cohesion: 0.18
Nodes (4): createSecrets(), projectSecretEnv(), secretEnv(), SecretPorts

### Community 134 - "PlatformSettingsService"
Cohesion: 0.20
Nodes (8): Task 2: Registro y almacén de ajustes, PlatformSettingsService, SettingDef, SettingsError, SettingView, SettingsDependencies, fixture(), fixture()

### Community 135 - "apiTypes.test.ts"
Cohesion: 0.26
Nodes (9): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs(), BuilderTool, builderTools (+1 more)

### Community 136 - "builder"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 137 - "appRuntimeServer.ts"
Cohesion: 0.15
Nodes (22): cloneDatabase(), closeAll(), closeProject(), dumpDatabase(), execSql(), get(), isAwake(), metricsFor() (+14 more)

### Community 138 - "executeRun"
Cohesion: 0.30
Nodes (4): ActiveRun, executeRun(), RunPorts, CaseResult

### Community 139 - "BuilderToolsAdapter.ts"
Cohesion: 0.07
Nodes (19): assertProjectObject(), assertSafeAgentSql(), objectName(), redactSqlData(), isSafeProjectPath(), assertOwnerRequestedForget(), assertOwnerSourcedMemory(), normalized() (+11 more)

### Community 140 - "forja"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 141 - "FinishGateAdapter.ts"
Cohesion: 0.10
Nodes (18): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+10 more)

### Community 142 - "Security.tsx"
Cohesion: 0.19
Nodes (11): api, observabilityController, fixMessage(), KIND, Problem, ProblemsBar(), Finding, Scan (+3 more)

### Community 143 - "ports/context.ts"
Cohesion: 0.13
Nodes (6): EmailPorts, JobPorts, AppServiceEvent, ObserverPorts, QueryRepository, StoragePorts

### Community 144 - "GithubAccountRepository"
Cohesion: 0.18
Nodes (4): createGithubAccountService(), connectAccount(), GithubAccountRepository, setup()

### Community 145 - "AgentExecutionPorts"
Cohesion: 0.13
Nodes (5): RunAgentUseCase, AgentExecutionPorts, fixture(), model, usage

### Community 146 - "BuilderRunRegistry"
Cohesion: 0.24
Nodes (3): BuilderRunRegistry, isBuilding(), stopBuilding()

### Community 148 - "createProjectRows"
Cohesion: 0.46
Nodes (7): createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError

### Community 149 - "createHttp"
Cohesion: 0.25
Nodes (4): { apiUrl }, ApiError, createHttp(), HttpTransport

### Community 150 - "IMemberRepository"
Cohesion: 0.13
Nodes (7): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, RemoveMemberUseCase, Access, MemberAccess, IMemberRepository

### Community 151 - "spring.ts"
Cohesion: 0.22
Nodes (5): clip(), normalize(), parseSpringOutput(), SpringBuildTool, SpringProject

### Community 152 - "ContextPorts"
Cohesion: 0.17
Nodes (4): CheckoutInput, EmailResult, StoredObject, ContextPorts

### Community 153 - "accounts.ts"
Cohesion: 0.27
Nodes (6): GithubError, Link, SyncResult, gh(), tokenFor(), setup()

### Community 154 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 155 - "replaceVisibleText"
Cohesion: 0.40
Nodes (4): escapeRe(), FileMap, replaceVisibleText(), TextEditResult

### Community 157 - "createAuth"
Cohesion: 0.13
Nodes (21): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+13 more)

### Community 158 - "app-services/realtime.ts"
Cohesion: 0.21
Nodes (5): DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket, publish, realtimeStats

### Community 159 - "IdentityAccountsService.ts"
Cohesion: 0.22
Nodes (4): COMMON_PASSWORDS, Password, IdentityModuleDependencies, IdentityAccountsDependencies

### Community 164 - "createCollaborationModule"
Cohesion: 0.26
Nodes (4): MemberQueries, createCollaborationModule(), IMemberQueries, fixture()

### Community 165 - "accountLifecycle.ts"
Cohesion: 0.08
Nodes (5): PostgresApiTokenRepository, ApiTokenInfo, ApiTokenRepository, IdentityRandom, PasswordResetRepository

### Community 167 - "audit.ts"
Cohesion: 0.67
Nodes (3): audit(), postgresModelAudit(), ModelAudit

### Community 168 - "createProblemService"
Cohesion: 0.47
Nodes (9): createProblemService(), changed(), clearProblems(), fromLog(), listProblems(), recheckBuild(), stopProblems(), upsert() (+1 more)

### Community 170 - "cli.ts"
Cohesion: 0.32
Nodes (6): [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed()

### Community 171 - "safeFetch.ts"
Cohesion: 0.47
Nodes (3): assertPublic(), fetchPublicText(), isPrivate()

### Community 172 - "createRealtime"
Cohesion: 0.47
Nodes (5): createRealtime(), attachSocket(), publish(), publishPresence(), stopRealtime()

### Community 178 - "architecture.test.ts"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 279 - "settings/index.ts"
Cohesion: 0.17
Nodes (19): encryptHeaders(), PlatformSettingType, SettingGroup, MOVED_ENV, createPlatformSettings(), byKey, Def, defs (+11 more)

### Community 313 - "GithubGateway"
Cohesion: 0.18
Nodes (4): 2. Ajustes globales, Almacén, Registro, GithubGateway

### Community 344 - "application/context.ts"
Cohesion: 0.08
Nodes (19): Run, RunInput, AppUser, createContext(), serviceContext(), EndpointContext, HttpError, JobContext (+11 more)

## Knowledge Gaps
- **17 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1210 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `database/index.ts` to `model-management/providers.ts`, `ModelRouter.ts`, `PlatformSettingsService`, `apiTypes.test.ts`, `crypto.ts`, `bootstrap/server.ts`, `http-client.ts`, `BuilderToolsAdapter.ts`, `composition.ts`, `FinishGateAdapter.ts`, `evaluations/bindings.test.ts`, `project-observability/security.ts`, `GithubAccountRepository`, `ExecutionMetrics`, `AgentExecutionPorts`, `BuilderRunRegistry`, `modules/identity/index.ts`, `memory/application/service.ts`, `IMemberRepository`, `executeRun`, `ApplicationLifecycle`, `accounts.ts`, `model-management/index.ts`, `project-observability/problems.ts`, `modules/projects/index.ts`, `createHttp`, `replaceVisibleText`, `IdentityAccountsService.ts`, `exports.test.tsx`, `SettingDefinition`, `Plan.ts`, `createCollaborationModule`, `models.ts`, `projects/application/usecases.ts`, `collaboration/ports/repositories.ts`, `model-management/router.ts`, `ProjectPath`, `pg.mjs`, `config.ts`, `package.json`, `architecture.test.ts`, `ProjectsStore`, `skills.test.ts`, `projectIndex.ts`, `AgentExecution.ts`, `createIdentityModule`, `integrations/github.ts`, `IOrganizationRepository`, `SqlAgentTaskRepository.ts`, `guides.ts`, `app-runtime/index.ts`, `ProjectDb`, `ModelRouter.ts`, `domain/score.ts`, `Changes.tsx`, `BuilderWorkflow.ts`, `application/context.ts`, `RunAgentUseCase.ts`, `mcp/jobs.ts`, `builderService.ts`, `BootstrapService`, `policies.test.ts`, `ProjectsApplication.ts`, `usage/usage.ts`, `AgentExecutionResult`, `OrganizationSkillsService.ts`, `Author`, `model-management/providers.ts`, `ports.ts`, `devDependencies`, `RouterAdministration.ts`, `ISettingsStore`, `SqlAgentTaskRepository.ts`, `http.test.ts`?**
  _High betweenness centrality (0.266) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `q` be split into smaller, more focused modules?**
  _Cohesion score 0.06570048309178744 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `exports.test.tsx`, `index.tsx`, `Plan.tsx`, `Chat.tsx`, `Workspace.tsx`, `http-client.ts`, `projects/application/usecases.ts`, `client/index.ts`, `Security.tsx`, `internal/router.ts`, `package.json`, `integrations/index.ts`, `Changes.tsx`, `administration/presentation/Models.tsx`, `forms.tsx`, `ProjectView.tsx`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `createIdentityModule()` (e.g. with `.complete()` and `.init()`) actually correct?**
  _`createIdentityModule()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.054385964912280704 - nodes in this community are weakly interconnected._