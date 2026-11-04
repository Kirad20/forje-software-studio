# Graph Report - anemone  (2026-11-04)

## Corpus Check
- 612 files · ~264,019 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: (none) 6, .css 3, .example 1)

## Summary
- 4154 nodes · 10658 edges · 181 communities (152 shown, 29 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 578 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3071fc65`
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
- infrastructure/judge.ts
- bootstrap/server.ts
- with
- ports/context.ts
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
- model-management/router.test.ts
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
- runtimeClient.ts
- OrchestrationPolicy.ts
- compilerOptions
- models.ts
- projects/application/usecases.ts
- collaboration/ports/repositories.ts
- model-management/router.ts
- client/index.ts
- scripts
- pg.mjs
- appRuntimeHttp.ts
- adminApi.ts
- mcp/server.ts
- internal/router.ts
- package.json
- ProjectsStore
- Project
- Inventario de funciones de Lovable → Forja
- skills.test.ts
- guides.ts
- projectIndex.ts
- server/index.ts
- RunAgentUseCase.ts
- createIdentityModule
- CLAUDE.md
- PostgresProjectFileRepository
- deps.ts
- sandboxWorker.mjs
- postgres
- infrastructure/probe.ts
- PostgresProjectsStore
- createJobs
- modules/builder/index.ts
- Memory.tsx
- client.ts
- Workspace.tsx
- IntegrationRepository
- IOrganizationRepository
- SqlAgentTaskRepository.ts
- services
- createGithubSyncService
- collaboration/postgresAdapters.test.ts
- app-runtime/index.ts
- one
- sandbox.ts
- TEST_DATABASE_URL
- ModelRouter.ts
- integrations/index.ts
- domain/score.ts
- Changes.tsx
- mcp/jobs.ts
- shared/security.ts
- RunAgentUseCase.ts
- createAnalytics
- GithubAuthorization
- builderService.ts
- BootstrapService
- app-services/context.ts
- app-runtime/index.ts
- ProjectsApplication.ts
- crypto.ts
- Review Focus
- app-services/payments.ts
- projectRows.ts
- react
- usage/usage.ts
- Account
- ProjectDbClient
- accounts.ts
- AgentExecutionResult
- urls.ts
- OrganizationSkillsService.ts
- AuthPorts
- model-management/providers.ts
- BuilderWorkflowPorts
- ports.ts
- e2e.mjs
- AccountLifecycleRepository
- devDependencies
- github.mjs
- RouterAdministration.ts
- platform.ts
- RealtimeTransport
- config.ts
- { api, auth, storage, ai }
- ISettingsStore
- SqlAgentTaskRepository.ts
- FileMap
- http.test.ts
- infrastructure/repositories.ts
- postgres
- healthcheck
- models/presentation/Models.tsx
- app-runtime
- model-management/providers.ts
- build
- JobCron
- PlatformSettingsService
- apiTypes.test.ts
- builder
- appRuntimeServer.ts
- executeRun
- BuilderToolsAdapter.ts
- forja
- FinishGateAdapter.ts
- QueryRepository
- GithubAccountRepository
- execution.test.ts
- ProjectDb
- createHttp
- CheckAccessUseCase.ts
- spring.ts
- createProblemService
- integrations/github.ts
- forms.tsx
- replaceVisibleText
- IPasswordHasher
- createAuth
- app-services/realtime.ts
- format.ts
- exports.test.tsx
- GithubProjectPorts
- createCollaborationModule
- accountLifecycle.ts
- GithubRepository
- cli.ts
- builderServer.ts
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
4. `react` - 45 edges
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
- `Cómo está hecho` --references--> `useApi()`  [INFERRED]
  README.md → sdk/client/internal/hooks.ts
- `9. Publicar, hosting y crecimiento` --references--> `useHead()`  [INFERRED]
  docs/inventario-lovable.md → sdk/client/internal/router.ts

## Import Cycles
- None detected.

## Communities (181 total, 29 thin omitted)

### Community 0 - "q"
Cohesion: 0.09
Nodes (10): OrgRole, PostgresMemberRepository, PostgresOrganizationRepository, PostgresOrganizationSkillsRepository, InviteView, MemberView, Org, OrgMemberView (+2 more)

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
Cohesion: 0.07
Nodes (34): assertProjectObject(), assertSafeAgentSql(), objectName(), redactSqlData(), assertOwnerRequestedForget(), assertOwnerSourcedMemory(), normalized(), assertOwnerRequestedAuthSetup() (+26 more)

### Community 5 - "ModelRouter.ts"
Cohesion: 0.11
Nodes (29): AgentSpec, TurnState, KEYWORDS, LAMBDA, maxTokensFor(), RoleProfile, Posterior, Block (+21 more)

### Community 6 - "appServer.ts"
Cohesion: 0.11
Nodes (33): RuntimeEvent, formatProblem(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle() (+25 more)

### Community 7 - "http-client.ts"
Cohesion: 0.07
Nodes (27): api, collaborationController, api, evaluationsController, createEvaluationUseCases(), Agg, EvalCfg, Evals() (+19 more)

### Community 8 - "infrastructure/judge.ts"
Cohesion: 0.10
Nodes (19): JUDGE_DIMENSIONS, JudgeDimension, Judgement, JUDGE_SYSTEM, judgeDesign(), JudgeInput, parseJudgement(), LlmMessage (+11 more)

### Community 9 - "bootstrap/server.ts"
Cohesion: 0.05
Nodes (32): lifecycle, withDefaultHeaders(), app, handleMcp, lifecycle, listening(), monolith, reactions (+24 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "ports/context.ts"
Cohesion: 0.09
Nodes (17): AiUnavailableError, createAi(), appAiChat(), AiBlock, AppAiInput, AppAiResult, AppUser, CheckoutInput (+9 more)

### Community 12 - "composition.ts"
Cohesion: 0.14
Nodes (22): createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureAppServiceObserver(), configureSecretIntegrations(), initializeAppServices, bindEvaluationBuilder() (+14 more)

### Community 13 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (16): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+8 more)

### Community 14 - "project-observability/security.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 15 - "BuilderTurnAdapter.ts"
Cohesion: 0.08
Nodes (56): describeSchema, rewardOf(), criteriaOf(), planOverview(), formatStandard(), active, AgentResult, background() (+48 more)

### Community 16 - "memory/application/service.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 17 - "ExecutionMetrics"
Cohesion: 0.10
Nodes (11): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, ROLE_TOOLS (+3 more)

### Community 18 - "modules/identity/index.ts"
Cohesion: 0.11
Nodes (9): RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, IdentityModuleDependencies, PlatformMailerService, PostgresLoginCodeRepository, IAccountRepository, ILoginCodeRepository (+1 more)

### Community 19 - "infrastructure/playground.ts"
Cohesion: 0.13
Nodes (30): removeProjectData, removeProjectData(), designSignals, ensureEvalAccount(), sweepEvalProjects(), evaluationBuilder(), evaluationResources(), admitPlayground() (+22 more)

### Community 20 - "model-management/index.ts"
Cohesion: 0.12
Nodes (21): Catalog, createModelManagementQueries(), audit(), bindModelAudit(), bindCatalogService(), bindCatalogSync(), createPlatformCatalogService(), ModelSpendView (+13 more)

### Community 21 - "bundler.ts"
Cohesion: 0.15
Nodes (26): createProjectCheck(), packageName(), EndpointInfo, endpointRoutes(), exampleFiles(), jobFiles(), JobInfo, PageInfo (+18 more)

### Community 22 - "executeRun"
Cohesion: 0.08
Nodes (18): admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun(), runBudget() (+10 more)

### Community 23 - "model-management/router.test.ts"
Cohesion: 0.16
Nodes (12): anthropicChat(), ModelCallError, anthropicChat(), getClient(), resetAnthropicClient(), SERVER_FALLBACK, a, b (+4 more)

### Community 24 - "ApplicationLifecycle"
Cohesion: 0.18
Nodes (5): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown()

### Community 25 - "administration/presentation/Models.tsx"
Cohesion: 0.08
Nodes (49): radix-ui, react, administrationController, api, Admin(), TABS, AgentEvent, Agents() (+41 more)

### Community 26 - "project-observability/problems.ts"
Cohesion: 0.08
Nodes (18): startAppRuntimeEventRelay(), createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, Problem, ProblemEffects (+10 more)

### Community 27 - "modules/collaboration/index.ts"
Cohesion: 0.13
Nodes (6): PersonalOrganizationUseCase, Organization, OrganizationProps, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 28 - "modules/projects/index.ts"
Cohesion: 0.08
Nodes (19): CreateCheckpointUseCase, DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, Author, Checkpoint, CheckpointProps, ProjectPath (+11 more)

### Community 29 - "Panel de administración del sistema — diseño"
Cohesion: 0.05
Nodes (35): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+27 more)

### Community 30 - "agents.mjs"
Cohesion: 0.08
Nodes (31): app, DATA, app, DATA, MODELS, req(), ROOT, SEED (+23 more)

### Community 31 - "ProjectView.tsx"
Cohesion: 0.10
Nodes (53): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+45 more)

### Community 32 - "studioApi.ts"
Cohesion: 0.07
Nodes (45): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, addTimer, cancelTimer (+37 more)

### Community 33 - "SettingDefinition"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

### Community 34 - "Plan.ts"
Cohesion: 0.11
Nodes (22): CheckPlanUseCase, checkContract(), CONTRACT_FILE, contractRoutes(), covers(), MAX_CONTRACT, MAX_GOAL, MAX_TASKS (+14 more)

### Community 35 - "runtimeClient.ts"
Cohesion: 0.50
Nodes (3): callRuntimeEndpoint(), responseSchema, RuntimeEndpointCall

### Community 36 - "OrchestrationPolicy.ts"
Cohesion: 0.14
Nodes (12): ReviewAndFixUseCase, TeamBuildUseCase, Review, reviewFixTasks(), Plan, PlanTask, SpecialistRole, FixResult (+4 more)

### Community 37 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 38 - "models.ts"
Cohesion: 0.11
Nodes (14): createCatalogService(), deleteModel(), saveModel(), updateProjectModels(), creditsAtRate(), globToRegex(), matchesModelPolicy(), ModelChanges (+6 more)

### Community 39 - "projects/application/usecases.ts"
Cohesion: 0.11
Nodes (20): ProjectEvent, ProjectLogLine, createProjectUseCases(), isProjectLogLine(), isProjectProblem(), isRecord(), parseProjectEvent(), subscribeToProjectEvents() (+12 more)

### Community 40 - "collaboration/ports/repositories.ts"
Cohesion: 0.11
Nodes (11): InviteMemberResult, InviteMemberUseCase, ProjectTarget, RemoveMemberUseCase, ProjectInvite, ProjectInviteProps, PostgresCollaborationAccountRepository, CollaborationAccount (+3 more)

### Community 41 - "model-management/router.ts"
Cohesion: 0.25
Nodes (8): createTurnFeedback(), penalizeTurn(), feedbackModel(), TurnModelDecision, postgresTurnFeedback, TurnFeedbackPorts, TurnFeedbackRepository, database

### Community 42 - "client/index.ts"
Cohesion: 0.20
Nodes (12): AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes, RouteSpec (+4 more)

### Community 43 - "scripts"
Cohesion: 0.11
Nodes (18): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+10 more)

### Community 44 - "pg.mjs"
Cohesion: 0.08
Nodes (25): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, vitest, migrate(), createTestCoreModules(), drop(), freshDatabase() (+17 more)

### Community 45 - "appRuntimeHttp.ts"
Cohesion: 0.12
Nodes (15): AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts, resolveApp() (+7 more)

### Community 46 - "adminApi.ts"
Cohesion: 0.16
Nodes (17): hono@^4.13.14, hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv (+9 more)

### Community 47 - "mcp/server.ts"
Cohesion: 0.14
Nodes (16): buildServer(), CONTEXT_TOOLS, createMcpHandler(), DESTRUCTIVE, expectedVersionProp, extraTools, Hints, hintsOf() (+8 more)

### Community 48 - "internal/router.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 49 - "package.json"
Cohesion: 0.07
Nodes (40): dependencies, @anthropic-ai/sdk@^1.3.0, clsx@^2.1.1, croner@^11.0.0, esbuild@^0.28.2, @hono/node-server@^2.1.5, lucide-react@^1.66.0, @modelcontextprotocol/sdk@^1.32.2 (+32 more)

### Community 50 - "ProjectsStore"
Cohesion: 0.08
Nodes (5): isDevFile(), ProjectsApplication, ProjectSnapshot, createProjectsModule(), ProjectsStore

### Community 51 - "Project"
Cohesion: 0.09
Nodes (9): CreateProjectInput, CreateProjectUseCase, Project, ProjectProps, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository (+1 more)

### Community 52 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 53 - "skills.test.ts"
Cohesion: 0.19
Nodes (17): AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO, allSkills() (+9 more)

### Community 54 - "guides.ts"
Cohesion: 0.20
Nodes (13): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), readGuides() (+5 more)

### Community 55 - "projectIndex.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 56 - "server/index.ts"
Cohesion: 0.09
Nodes (14): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, CheckoutInput (+6 more)

### Community 57 - "RunAgentUseCase.ts"
Cohesion: 0.13
Nodes (12): RunAgentUseCase, addUsage(), AgentExecutionSpec, Block, emptyUsage(), ExecutionContext, ExecutionModel, ExecutionTool (+4 more)

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
Nodes (3): PostgresProjectsStore, ProjectOrganizations, QueryHandle

### Community 67 - "createJobs"
Cohesion: 0.25
Nodes (14): createJobs(), addTimer(), executeJob(), fireDueTimers(), initializeAppServices(), listJobs(), report(), runJob() (+6 more)

### Community 68 - "modules/builder/index.ts"
Cohesion: 0.08
Nodes (29): GATE_FIXES, AgentResult, calculateSpendUseCase, toolRegistry, runAgent(), BuilderTool, toolByName, bindBuilderCoreModules() (+21 more)

### Community 69 - "Memory.tsx"
Cohesion: 0.21
Nodes (11): api, memoryController, Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection() (+3 more)

### Community 70 - "client.ts"
Cohesion: 0.27
Nodes (9): createClient(), ChatMessage, createAi(), createApiWorkflow(), createAuth(), createRealtime(), createStorage(), StoredFile (+1 more)

### Community 71 - "Workspace.tsx"
Cohesion: 0.09
Nodes (42): api, projectsController, transport, Dashboard(), DeleteDialog(), IDEAS, Sort, SORT_LABEL (+34 more)

### Community 72 - "IntegrationRepository"
Cohesion: 0.16
Nodes (7): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository

### Community 73 - "IOrganizationRepository"
Cohesion: 0.12
Nodes (6): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, IOrganizationRepository

### Community 74 - "SqlAgentTaskRepository.ts"
Cohesion: 0.44
Nodes (3): ListAgentTasksUseCase, AgentTaskQueries, AgentTaskView

### Community 75 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 76 - "createGithubSyncService"
Cohesion: 0.27
Nodes (12): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+4 more)

### Community 77 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.18
Nodes (8): PlatformCollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository, sendInvitation

### Community 78 - "app-runtime/index.ts"
Cohesion: 0.07
Nodes (33): RuntimeProjectsPort, FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer() (+25 more)

### Community 79 - "one"
Cohesion: 0.09
Nodes (13): Task 3: Proveedores y modelos en BD + seeders, 1. Capa de datos, Conexión, `.env` resultante, Infraestructura, Migraciones, Seeders, PostgresAccountLifecycleRepository (+5 more)

### Community 80 - "sandbox.ts"
Cohesion: 0.12
Nodes (15): RuntimeObservationPorts, log(), observation(), projectEvents, scan(), watchProblems(), beginTransaction(), dispatch() (+7 more)

### Community 83 - "ModelRouter.ts"
Cohesion: 0.15
Nodes (22): 3. Proveedores y modelos, Pruebas de conexión, Tablas (`002_admin.sql`), analyzeHeuristic(), createModelRouter(), analyzeRequest(), callModel(), pick() (+14 more)

### Community 84 - "integrations/index.ts"
Cohesion: 0.24
Nodes (14): api, integrationsController, GithubCard, GithubCommitCard(), GithubSection(), Link, Mark(), CreateDialog() (+6 more)

### Community 85 - "domain/score.ts"
Cohesion: 0.14
Nodes (25): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), judgeScore(), mean() (+17 more)

### Community 86 - "Changes.tsx"
Cohesion: 0.20
Nodes (15): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+7 more)

### Community 87 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 88 - "shared/security.ts"
Cohesion: 0.18
Nodes (11): clientIp(), createRateLimiter(), isHttps(), RateLimitError, RateLimitQuery, RateLimitStoreError, requestOrigin(), startRateLimitCleanup() (+3 more)

### Community 89 - "RunAgentUseCase.ts"
Cohesion: 0.25
Nodes (15): summarize(), applySummary(), blockTokens(), callLabel(), estimateTokens(), hasResults(), KEEP_RECENT_RESULTS, KEEP_RECENT_STEPS (+7 more)

### Community 90 - "createAnalytics"
Cohesion: 0.21
Nodes (9): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays(), analyticsPorts (+1 more)

### Community 92 - "builderService.ts"
Cohesion: 0.10
Nodes (13): accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService(), BuilderServiceClient (+5 more)

### Community 93 - "BootstrapService"
Cohesion: 0.19
Nodes (6): BootstrapService, SetupError, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 94 - "app-services/context.ts"
Cohesion: 0.09
Nodes (15): @electric-sql/pglite@^0.5.13, @electric-sql/pglite, createSecrets(), projectSecretEnv(), secretEnv(), createStorage(), putObject(), MAX_PROJECT_STORAGE_BYTES (+7 more)

### Community 95 - "app-runtime/index.ts"
Cohesion: 0.15
Nodes (18): playwright-core@1.64.1, playwright-core, allowedRequest(), BrowserStep, BrowserTestInput, BrowserTestResult, describe(), getBrowser() (+10 more)

### Community 96 - "ProjectsApplication.ts"
Cohesion: 0.17
Nodes (13): BeforeImage, beforeImages(), restoredFiles(), turnFileChange(), ChangeEntry, normalizeProjectProfile(), ProjectPatch, ProjectProfile (+5 more)

### Community 97 - "crypto.ts"
Cohesion: 0.13
Nodes (17): createCoreModules(), BcryptArgonPasswordHasher, NodeBootstrapCrypto, PostgresSessionRepository, burnPasswordCheck(), hashPassword(), LEGACY, newId() (+9 more)

### Community 98 - "Review Focus"
Cohesion: 0.18
Nodes (9): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 2: Registro y almacén de ajustes, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final (+1 more)

### Community 99 - "app-services/payments.ts"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 100 - "projectRows.ts"
Cohesion: 0.13
Nodes (12): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError (+4 more)

### Community 101 - "react"
Cohesion: 0.09
Nodes (29): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallEvent, Pwa() (+21 more)

### Community 102 - "usage/usage.ts"
Cohesion: 0.16
Nodes (7): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, mocks

### Community 103 - "Account"
Cohesion: 0.10
Nodes (13): Account, AccountProps, PlatformRole, Email, COMMON_PASSWORDS, Password, AccountRow, PostgresAccountRepository (+5 more)

### Community 105 - "accounts.ts"
Cohesion: 0.21
Nodes (10): secretPorts, GithubError, Link, SyncResult, gh(), tokenFor(), encryptHeaders(), decrypt() (+2 more)

### Community 106 - "AgentExecutionResult"
Cohesion: 0.14
Nodes (9): RunTaskLaneUseCase, AgentEvent, AgentExecutionResult, LaneTask, TaskLaneHooks, TaskLanePorts, fixture(), result (+1 more)

### Community 107 - "urls.ts"
Cohesion: 0.17
Nodes (13): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+5 more)

### Community 108 - "OrganizationSkillsService.ts"
Cohesion: 0.19
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 110 - "model-management/providers.ts"
Cohesion: 0.14
Nodes (16): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), OPENROUTER_URL (+8 more)

### Community 111 - "BuilderWorkflowPorts"
Cohesion: 0.08
Nodes (10): BuilderWorkflowUseCase, FastBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode, useFastPath(), BuilderWorkflowPorts (+2 more)

### Community 112 - "ports.ts"
Cohesion: 0.09
Nodes (20): createBuildVerification(), createDependencyResolution(), PackageRegistryPort, BuildPorts, PublicationPorts, ProjectCompilerPort, createPublication(), packageInfo (+12 more)

### Community 113 - "e2e.mjs"
Cohesion: 0.22
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 115 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 116 - "github.mjs"
Cohesion: 0.10
Nodes (12): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED (+4 more)

### Community 117 - "RouterAdministration.ts"
Cohesion: 0.25
Nodes (10): routerAudit(), createRouterAdministration(), routerStats(), meanOf(), RouterPosteriorRow, RouterStats, postgresRouterAdministrationRepository, RouterAdministrationRepository (+2 more)

### Community 118 - "platform.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 120 - "config.ts"
Cohesion: 0.10
Nodes (19): vite, createDevelopmentSeed(), DEV_FIXTURE, Fixture, storagePorts, config, DEFAULT_MODELS_ALLOW, env (+11 more)

### Community 122 - "ISettingsStore"
Cohesion: 0.24
Nodes (6): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry, ISettingsStore

### Community 123 - "SqlAgentTaskRepository.ts"
Cohesion: 0.16
Nodes (6): TaskLifecycleUseCase, requiresFinishGate(), SqlAgentTaskRepository, AgentTask, AgentTaskRepository, TaskCompletion

### Community 124 - "FileMap"
Cohesion: 0.13
Nodes (3): CoreModulesDependencies, FileMap, ProjectServices

### Community 125 - "http.test.ts"
Cohesion: 0.11
Nodes (18): builderCoreModules, CollaborationModule, IdentityModule, ProjectsModule, account, app, collaboration, identity (+10 more)

### Community 126 - "infrastructure/repositories.ts"
Cohesion: 0.10
Nodes (10): jobPorts, log(), createQueryRepository(), platformRepository, schemaRows(), statement(), statements, DatabasePorts (+2 more)

### Community 127 - "postgres"
Cohesion: 0.25
Nodes (9): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+1 more)

### Community 128 - "healthcheck"
Cohesion: 0.53
Nodes (9): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+1 more)

### Community 129 - "models/presentation/Models.tsx"
Cohesion: 0.24
Nodes (10): api, modelsController, ModelChecklist(), ModelRow, MODES, price(), ProjectModels(), PROVIDER (+2 more)

### Community 130 - "app-runtime"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 131 - "model-management/providers.ts"
Cohesion: 0.11
Nodes (28): `llm/catalog.ts`, tasks, allowedModels(), availableModels(), lastSync(), listCatalog(), platformAllows(), providers() (+20 more)

### Community 132 - "build"
Cohesion: 0.48
Nodes (7): build, BROWSER, args, context, dockerfile, build, build

### Community 134 - "PlatformSettingsService"
Cohesion: 0.17
Nodes (5): PlatformSettingsService, PostgresPlatformSettingsStoreAdapter, SettingsDependencies, fixture(), fixture()

### Community 135 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 136 - "builder"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 137 - "appRuntimeServer.ts"
Cohesion: 0.22
Nodes (16): cloneDatabase(), closeAll(), closeProject(), dumpDatabase(), execSql(), get(), isAwake(), metricsFor() (+8 more)

### Community 138 - "executeRun"
Cohesion: 0.30
Nodes (4): ActiveRun, executeRun(), RunPorts, CaseResult

### Community 139 - "BuilderToolsAdapter.ts"
Cohesion: 0.07
Nodes (9): B, I, N, out(), S, typed(), assertPublic(), fetchPublicText() (+1 more)

### Community 140 - "forja"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 141 - "FinishGateAdapter.ts"
Cohesion: 0.14
Nodes (11): CreateFinishGateUseCase, BuildProblem, isSafeProjectPath(), newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey() (+3 more)

### Community 143 - "QueryRepository"
Cohesion: 0.12
Nodes (7): createEmail(), sendEmail(), sendPlatformEmail(), verifiedSender(), EmailPorts, QueryRepository, StoragePorts

### Community 144 - "GithubAccountRepository"
Cohesion: 0.18
Nodes (4): createGithubAccountService(), connectAccount(), GithubAccountRepository, setup()

### Community 145 - "execution.test.ts"
Cohesion: 0.29
Nodes (4): ScheduleTasksUseCase, fixture(), model, usage

### Community 146 - "ProjectDb"
Cohesion: 0.12
Nodes (9): AppDataPorts, createAppDataService(), TransactionSession, SqlExecutionResult, TransactionAction, authRepository(), createAuthRepository(), ProjectDb (+1 more)

### Community 149 - "createHttp"
Cohesion: 0.25
Nodes (4): { apiUrl }, ApiError, createHttp(), HttpTransport

### Community 150 - "CheckAccessUseCase.ts"
Cohesion: 0.36
Nodes (3): ProjectIdentity, Access, MemberAccess

### Community 151 - "spring.ts"
Cohesion: 0.22
Nodes (5): clip(), normalize(), parseSpringOutput(), SpringBuildTool, SpringProject

### Community 152 - "createProblemService"
Cohesion: 0.40
Nodes (10): createProblemService(), changed(), clearProblems(), fromLog(), listProblems(), recheckBuild(), stopProblems(), upsert() (+2 more)

### Community 153 - "integrations/github.ts"
Cohesion: 0.12
Nodes (17): accountStatus, connectAccount, createRepo, disconnectAccount, getLink, handleWebhook, linkRepo, oauthFinish (+9 more)

### Community 154 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 155 - "replaceVisibleText"
Cohesion: 0.33
Nodes (5): page(), escapeRe(), FileMap, replaceVisibleText(), TextEditResult

### Community 156 - "IPasswordHasher"
Cohesion: 0.13
Nodes (4): LoginWithPasswordUseCase, IdentityAccountsDependencies, IPasswordHasher, ISessionRepository

### Community 157 - "createAuth"
Cohesion: 0.13
Nodes (21): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+13 more)

### Community 158 - "app-services/realtime.ts"
Cohesion: 0.16
Nodes (9): createRealtime(), attachSocket(), publish(), publishPresence(), stopRealtime(), DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket (+1 more)

### Community 159 - "format.ts"
Cohesion: 0.38
Nodes (6): api, billingController, Meter(), Plan(), Usage, bytes()

### Community 164 - "createCollaborationModule"
Cohesion: 0.12
Nodes (11): CheckAccessUseCase, ClaimInvitesUseCase, MemberQueries, OrganizationNamesQuery, OrganizationQueries, CollaborationModuleDependencies, createCollaborationModule(), IMemberQueries (+3 more)

### Community 165 - "accountLifecycle.ts"
Cohesion: 0.07
Nodes (6): PostgresApiTokenRepository, PostgresPasswordResetRepository, ApiTokenInfo, ApiTokenRepository, IdentityRandom, PasswordResetRepository

### Community 170 - "cli.ts"
Cohesion: 0.21
Nodes (11): [command, ...flags], main(), monolith, seedDev, seedLocal, createLocalSeed(), readSeedFile(), SeedFile (+3 more)

### Community 171 - "builderServer.ts"
Cohesion: 0.13
Nodes (14): app, lifecycle, monolith, stopRuntimeEventRelay(), BuilderRunRegistry, isBuilding(), runBuilderTurn(), stopBuilder() (+6 more)

### Community 178 - "architecture.test.ts"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 279 - "settings/index.ts"
Cohesion: 0.20
Nodes (17): PlatformSettingType, SettingDef, SettingGroup, SettingView, MOVED_ENV, createPlatformSettings(), byKey, Def (+9 more)

### Community 344 - "application/context.ts"
Cohesion: 0.08
Nodes (19): Run, RunInput, AppUser, createContext(), serviceContext(), EndpointContext, HttpError, JobContext (+11 more)

## Knowledge Gaps
- **17 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1210 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `pg.mjs` to `roles.ts`, `http-client.ts`, `infrastructure/judge.ts`, `bootstrap/server.ts`, `composition.ts`, `evaluations/bindings.test.ts`, `project-observability/security.ts`, `memory/application/service.ts`, `ExecutionMetrics`, `modules/identity/index.ts`, `model-management/index.ts`, `executeRun`, `model-management/router.test.ts`, `ApplicationLifecycle`, `project-observability/problems.ts`, `modules/collaboration/index.ts`, `modules/projects/index.ts`, `SettingDefinition`, `Plan.ts`, `runtimeClient.ts`, `models.ts`, `projects/application/usecases.ts`, `collaboration/ports/repositories.ts`, `model-management/router.ts`, `package.json`, `Project`, `skills.test.ts`, `guides.ts`, `projectIndex.ts`, `RunAgentUseCase.ts`, `createIdentityModule`, `modules/builder/index.ts`, `IntegrationRepository`, `IOrganizationRepository`, `SqlAgentTaskRepository.ts`, `collaboration/postgresAdapters.test.ts`, `app-runtime/index.ts`, `deps.test.ts`, `ModelRouter.ts`, `domain/score.ts`, `Changes.tsx`, `mcp/jobs.ts`, `shared/security.ts`, `RunAgentUseCase.ts`, `builderService.ts`, `BootstrapService`, `app-services/context.ts`, `crypto.ts`, `projectRows.ts`, `usage/usage.ts`, `Account`, `accounts.ts`, `AgentExecutionResult`, `OrganizationSkillsService.ts`, `model-management/providers.ts`, `BuilderWorkflowPorts`, `ports.ts`, `devDependencies`, `RouterAdministration.ts`, `config.ts`, `ISettingsStore`, `http.test.ts`, `model-management/providers.ts`, `PlatformSettingsService`, `apiTypes.test.ts`, `FinishGateAdapter.ts`, `GithubAccountRepository`, `execution.test.ts`, `ProjectDb`, `createHttp`, `integrations/github.ts`, `replaceVisibleText`, `IPasswordHasher`, `exports.test.tsx`, `createCollaborationModule`, `builderServer.ts`, `architecture.test.ts`, `application/context.ts`?**
  _High betweenness centrality (0.272) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `q` be split into smaller, more focused modules?**
  _Cohesion score 0.08658536585365853 - nodes in this community are weakly interconnected._
- **Why does `react` connect `administration/presentation/Models.tsx` to `format.ts`, `index.tsx`, `models/presentation/Models.tsx`, `Chat.tsx`, `exports.test.tsx`, `react`, `Memory.tsx`, `http-client.ts`, `Workspace.tsx`, `client/index.ts`, `internal/router.ts`, `package.json`, `integrations/index.ts`, `Changes.tsx`, `forms.tsx`, `ProjectView.tsx`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `createIdentityModule()` (e.g. with `.complete()` and `.init()`) actually correct?**
  _`createIdentityModule()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05403508771929825 - nodes in this community are weakly interconnected._